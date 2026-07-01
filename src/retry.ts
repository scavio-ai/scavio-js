/**
 * Retry policy: exponential backoff with full jitter and Retry-After support.
 * Mirrors the Python SDK's RetryConfig.
 */

/** Statuses that are safe to retry: rate limiting plus transient upstream errors. */
export const DEFAULT_RETRY_STATUSES: ReadonlySet<number> = new Set([
  429, 500, 502, 503, 504,
]);

export interface RetryConfig {
  /** Additional attempts after the first request. 0 disables retries. */
  maxRetries: number;
  /** Base backoff in seconds; attempt n waits up to baseDelay * 2**n before jitter. */
  baseDelay: number;
  /** Upper bound (seconds) on any single backoff wait. */
  maxDelay: number;
  /** HTTP status codes that trigger a retry. */
  retryStatuses: ReadonlySet<number>;
}

export function makeRetryConfig(maxRetries: number): RetryConfig {
  return {
    maxRetries,
    baseDelay: 0.5,
    maxDelay: 8.0,
    retryStatuses: DEFAULT_RETRY_STATUSES,
  };
}

export function shouldRetryStatus(
  config: RetryConfig,
  statusCode: number,
  attempt: number,
): boolean {
  return attempt < config.maxRetries && config.retryStatuses.has(statusCode);
}

export function shouldRetryException(
  config: RetryConfig,
  attempt: number,
): boolean {
  return attempt < config.maxRetries;
}

/**
 * Seconds to sleep before the next attempt. Honors a Retry-After value when
 * present; otherwise uses exponential backoff with full jitter.
 */
export function backoff(
  config: RetryConfig,
  attempt: number,
  retryAfter?: number,
): number {
  if (retryAfter !== undefined) {
    return Math.min(Math.max(retryAfter, 0), config.maxDelay);
  }
  const capped = Math.min(config.maxDelay, config.baseDelay * 2 ** attempt);
  return Math.random() * capped;
}

/** Parse a Retry-After header (delta-seconds or HTTP-date) to seconds. */
export function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const trimmed = header.trim();
  const asNumber = Number(trimmed);
  if (!Number.isNaN(asNumber) && trimmed !== "") {
    return asNumber;
  }
  const asDate = Date.parse(trimmed);
  if (!Number.isNaN(asDate)) {
    return Math.max((asDate - Date.now()) / 1000, 0);
  }
  return undefined;
}
