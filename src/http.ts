import {
  BadRequestError,
  InsufficientCreditsError,
  InvalidAPIKeyError,
  NotFoundError,
  RateLimitError,
  ScavioAPIError,
  ScavioConnectionError,
  ScavioTimeoutError,
} from "./errors.js";
import type { RateLimiter } from "./rate-limiter.js";
import {
  backoff,
  makeRetryConfig,
  parseRetryAfter,
  shouldRetryException,
  shouldRetryStatus,
  type RetryConfig,
} from "./retry.js";

export const BASE_URL = "https://api.scavio.dev";
export const DEFAULT_TIMEOUT = 30_000;
export const DEFAULT_MAX_RETRIES = 2;

// Injected from package.json at build time (tsup and vitest `define`), so the
// version string can never drift from the published package.
declare const __SCAVIO_JS_VERSION__: string;

export const SDK_VERSION: string =
  typeof __SCAVIO_JS_VERSION__ === "string" ? __SCAVIO_JS_VERSION__ : "0.0.0";

export const USER_AGENT = `scavio-js/${SDK_VERSION}`;

// Browsers refuse (or silently drop) a script-set User-Agent, so it is only
// sent from server runtimes. X-Client-Source identifies the SDK everywhere.
export function isServerRuntime(): boolean {
  const g = globalThis as {
    process?: { versions?: { node?: string } };
    window?: unknown;
    document?: unknown;
  };
  if (typeof g.window !== "undefined" && typeof g.document !== "undefined") {
    return false;
  }
  return typeof g.process?.versions?.node === "string";
}

export function buildHeaders(apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Client-Source": "scavio-js",
  };
  if (isServerRuntime()) {
    headers["User-Agent"] = USER_AGENT;
  }
  return headers;
}

function stripUndefined(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

function handleError(statusCode: number, body: Record<string, unknown>): never {
  let error = body.error ?? "Unknown error";
  if (typeof error === "object" && error !== null && "message" in error) {
    error = (error as { message: string }).message;
  }
  const msg = String(error);
  const responseBody = Object.keys(body).length > 0 ? body : undefined;

  // 422 is Threads' and Kuaishou's validation status - those routes have no
  // 400 - so it maps to BadRequestError too and a caller catching one class
  // handles validation failures on every platform.
  if (statusCode === 400 || statusCode === 422) {
    throw new BadRequestError(msg, responseBody, statusCode);
  }
  if (statusCode === 401) throw new InvalidAPIKeyError(msg, responseBody);
  if (statusCode === 402) throw new InsufficientCreditsError(msg, responseBody);
  if (statusCode === 404) throw new NotFoundError(msg, responseBody);
  if (statusCode === 429) throw new RateLimitError(msg, responseBody);
  throw new ScavioAPIError(statusCode, msg, responseBody);
}

function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function isAbortError(err: unknown): boolean {
  return (
    err instanceof Error &&
    (err.name === "AbortError" || err.name === "TimeoutError")
  );
}

function getHeader(response: Response, name: string): string | null {
  const headers = response.headers;
  if (headers && typeof headers.get === "function") {
    return headers.get(name);
  }
  return null;
}

export async function request(options: {
  method: "GET" | "POST";
  path: string;
  apiKey: string;
  baseUrl: string;
  timeout: number;
  rateLimiter: RateLimiter;
  body?: Record<string, unknown>;
  maxRetries?: number;
}): Promise<Record<string, unknown>> {
  const url = `${options.baseUrl}${options.path}`;
  const headers = buildHeaders(options.apiKey);
  const retry: RetryConfig = makeRetryConfig(
    options.maxRetries ?? DEFAULT_MAX_RETRIES,
  );

  let attempt = 0;

  for (;;) {
    await options.rateLimiter.wait();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    let response: Response;
    try {
      const fetchOptions: RequestInit = {
        method: options.method,
        headers,
        signal: controller.signal,
      };

      if (options.method === "POST" && options.body) {
        fetchOptions.body = JSON.stringify(stripUndefined(options.body));
      }

      response = await fetch(url, fetchOptions);
    } catch (err) {
      clearTimeout(timeoutId);
      const timedOut = isAbortError(err);
      if (shouldRetryException(retry, attempt)) {
        await sleep(backoff(retry, attempt));
        attempt += 1;
        continue;
      }
      const msg = err instanceof Error ? err.message : String(err);
      if (timedOut) {
        throw new ScavioTimeoutError(msg);
      }
      throw new ScavioConnectionError(msg);
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.ok) {
      return (await response.json()) as Record<string, unknown>;
    }

    if (shouldRetryStatus(retry, response.status, attempt)) {
      const retryAfter = parseRetryAfter(getHeader(response, "Retry-After"));
      await sleep(backoff(retry, attempt, retryAfter));
      attempt += 1;
      continue;
    }

    let body: Record<string, unknown> = {};
    try {
      body = (await response.json()) as Record<string, unknown>;
    } catch {
      // ignore parse failures
    }
    handleError(response.status, body);
  }
}
