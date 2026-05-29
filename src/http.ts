import {
  BadRequestError,
  InsufficientCreditsError,
  InvalidAPIKeyError,
  RateLimitError,
  ScavioAPIError,
} from "./errors.js";
import type { RateLimiter } from "./rate-limiter.js";

export const BASE_URL = "https://api.scavio.dev";
export const DEFAULT_TIMEOUT = 30_000;

function buildHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Client-Source": "scavio-js",
  };
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

  if (statusCode === 400) throw new BadRequestError(msg);
  if (statusCode === 401) throw new InvalidAPIKeyError(msg);
  if (statusCode === 402) throw new InsufficientCreditsError(msg);
  if (statusCode === 429) throw new RateLimitError(msg);
  throw new ScavioAPIError(statusCode, msg);
}

export async function request(options: {
  method: "GET" | "POST";
  path: string;
  apiKey: string;
  baseUrl: string;
  timeout: number;
  rateLimiter: RateLimiter;
  body?: Record<string, unknown>;
}): Promise<Record<string, unknown>> {
  await options.rateLimiter.wait();

  const url = `${options.baseUrl}${options.path}`;
  const headers = buildHeaders(options.apiKey);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout);

  try {
    const fetchOptions: RequestInit = {
      method: options.method,
      headers,
      signal: controller.signal,
    };

    if (options.method === "POST" && options.body) {
      fetchOptions.body = JSON.stringify(stripUndefined(options.body));
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      let body: Record<string, unknown> = {};
      try {
        body = (await response.json()) as Record<string, unknown>;
      } catch {
        // ignore parse failures
      }
      handleError(response.status, body);
    }

    return (await response.json()) as Record<string, unknown>;
  } finally {
    clearTimeout(timeoutId);
  }
}
