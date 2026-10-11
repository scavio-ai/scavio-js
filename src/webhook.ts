/**
 * Verify a crawl or batch completion webhook from Scavio.
 *
 * Each delivery carries `Scavio-Signature: t=<unix>,v1=<hex>`, where v1 is
 * HMAC-SHA256 of `"<t>.<raw body>"` keyed with the job's `webhook_secret`
 * (returned once, when the job is created). Pass the RAW request body - the
 * exact bytes received, before any JSON parsing - or the signature will not
 * match.
 *
 * Uses Web Crypto, so it runs on Node 18+, Deno, Bun and edge runtimes; it is
 * async for that reason. Returns false (never throws) for a missing,
 * malformed, tampered or stale signature.
 *
 * @param secret The job's `webhook_secret` (`whsec_...`).
 * @param header The `Scavio-Signature` header value.
 * @param body The raw request body, as a string or bytes.
 * @param toleranceSec Maximum age of the signature in seconds (default 300).
 */
export async function verifyWebhook(
  secret: string,
  header: string | null | undefined,
  body: string | Uint8Array,
  toleranceSec = 300,
): Promise<boolean> {
  if (!secret || !header) return false;

  const parts: Record<string, string> = {};
  for (const piece of header.split(",")) {
    const i = piece.indexOf("=");
    if (i > 0) parts[piece.slice(0, i).trim()] = piece.slice(i + 1).trim();
  }
  const t = Number(parts.t);
  const v1 = parts.v1;
  if (!parts.t || !Number.isFinite(t) || !v1 || !/^[0-9a-f]+$/i.test(v1)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - t) > toleranceSec) return false;

  const subtle = await getSubtle();
  const enc = new TextEncoder();
  const key = await subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const bodyBytes = typeof body === "string" ? enc.encode(body) : body;
  const prefix = enc.encode(`${t}.`);
  const message = new Uint8Array(prefix.length + bodyBytes.length);
  message.set(prefix, 0);
  message.set(bodyBytes, prefix.length);
  const mac = new Uint8Array(await subtle.sign("HMAC", key, message));

  let expected = "";
  for (const b of mac) expected += b.toString(16).padStart(2, "0");
  return timingSafeEqualHex(expected, v1.toLowerCase());
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function getSubtle(): Promise<SubtleCrypto> {
  const g = globalThis as { crypto?: { subtle?: SubtleCrypto } };
  if (g.crypto?.subtle) return g.crypto.subtle;
  // Node 18 has Web Crypto but not on globalThis by default.
  const nodeCrypto = (await import("node:crypto")) as unknown as {
    webcrypto: { subtle: SubtleCrypto };
  };
  return nodeCrypto.webcrypto.subtle;
}
