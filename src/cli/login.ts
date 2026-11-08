// Device-flow client for `scavio login` (RFC 8628 shape). Pure of process
// state: fetch, clock and sleep are injected so tests drive every branch.

import { hostname as osHostname } from "node:os";

export type Fetch = typeof fetch;

export type DeviceCode = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
};

export type WaitResult =
  | { kind: "approved"; apiKey: string; keyName: string }
  | { kind: "pending" }
  | { kind: "denied" }
  | { kind: "expired" }
  | { kind: "error"; message: string };

export function machineName(raw: string = osHostname()): string {
  // First DNS label only: "mac.local" and "mac.tail1234.ts.net" are both "mac".
  return raw.split(".")[0].slice(0, 64) || "unknown";
}

export async function startLogin(
  baseUrl: string,
  client: { hostname: string; os: string; userAgent: string },
  f: Fetch = fetch
): Promise<DeviceCode> {
  const res = await f(`${baseUrl}/api/v1/auth/device/code`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": client.userAgent },
    body: JSON.stringify({ hostname: client.hostname, os: client.os }),
  });
  const body = (await res.json().catch(() => ({}))) as Partial<DeviceCode> & { error_description?: string };
  if (!res.ok || typeof body.device_code !== "string") {
    throw new Error(body.error_description || `Could not start login (HTTP ${res.status}).`);
  }
  return body as DeviceCode;
}

type PollBody = { access_token?: string; key_name?: string; error?: string };

/**
 * Polls until approved, denied, expired, or `budgetMs` runs out (then
 * "pending", so an agent whose commands time out can simply run it again).
 * Network errors are retried with backoff inside the budget.
 */
export async function waitForApproval(opts: {
  baseUrl: string;
  deviceCode: string;
  intervalSec: number;
  expiresAt: number;
  budgetMs: number;
  userAgent: string;
  fetch?: Fetch;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}): Promise<WaitResult> {
  const f = opts.fetch ?? fetch;
  const now = opts.now ?? Date.now;
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const deadline = Math.min(now() + opts.budgetMs, opts.expiresAt);
  let interval = Math.max(1, opts.intervalSec) * 1000;
  let netFailures = 0;

  for (;;) {
    if (now() >= opts.expiresAt) return { kind: "expired" };
    let res: Response;
    let body: PollBody;
    try {
      res = await f(`${opts.baseUrl}/api/v1/auth/device/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": opts.userAgent },
        body: JSON.stringify({ device_code: opts.deviceCode }),
      });
      body = (await res.json().catch(() => ({}))) as PollBody;
      netFailures = 0;
    } catch {
      netFailures++;
      const backoff = Math.min(interval * 2 ** netFailures, 30_000);
      if (now() + backoff >= deadline) {
        return now() >= opts.expiresAt ? { kind: "expired" } : { kind: "pending" };
      }
      await sleep(backoff);
      continue;
    }

    if (res.ok && typeof body.access_token === "string") {
      return { kind: "approved", apiKey: body.access_token, keyName: body.key_name || "CLI" };
    }
    switch (body.error) {
      case "authorization_pending":
        break;
      case "slow_down":
        interval += 5000;
        break;
      case "access_denied":
        return { kind: "denied" };
      case "expired_token":
        return { kind: "expired" };
      case "invalid_grant":
        return { kind: "error", message: "This login was already used or is not valid. Run scavio login again." };
      default:
        return { kind: "error", message: `Login failed (HTTP ${res.status}${body.error ? `, ${body.error}` : ""}).` };
    }
    if (now() + interval >= deadline) {
      return now() + interval >= opts.expiresAt ? { kind: "expired" } : { kind: "pending" };
    }
    await sleep(interval);
  }
}

/** Confirms a key works without printing it. */
export async function checkKey(
  baseUrl: string,
  apiKey: string,
  userAgent: string,
  f: Fetch = fetch
): Promise<{ ok: true; plan?: string; credits?: number } | { ok: false; status: number }> {
  try {
    const res = await f(`${baseUrl}/api/v1/usage`, {
      headers: { Authorization: `Bearer ${apiKey}`, "User-Agent": userAgent },
    });
    if (!res.ok) return { ok: false, status: res.status };
    // credit_balance is the total; purchased_credits is a subset of it.
    const b = (await res.json().catch(() => ({}))) as { plan?: string; credit_balance?: number };
    return { ok: true, plan: b.plan, credits: typeof b.credit_balance === "number" ? b.credit_balance : undefined };
  } catch {
    return { ok: false, status: 0 };
  }
}
