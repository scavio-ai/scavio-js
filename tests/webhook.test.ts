import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { verifyWebhook } from "../src/index.js";

const secret = "whsec_test";
const body = JSON.stringify({ id: "crawl_1", status: "completed" });

function sign(t: number, payload = body, key = secret): string {
  return `t=${t},v1=${createHmac("sha256", key).update(`${t}.${payload}`).digest("hex")}`;
}

const now = () => Math.floor(Date.now() / 1000);

describe("verifyWebhook", () => {
  it("accepts a valid signature (string body)", async () => {
    expect(await verifyWebhook(secret, sign(now()), body)).toBe(true);
  });

  it("accepts a valid signature (bytes body)", async () => {
    expect(await verifyWebhook(secret, sign(now()), new TextEncoder().encode(body))).toBe(true);
  });

  it("tolerates spaces after commas", async () => {
    expect(await verifyWebhook(secret, sign(now()).replace(",", ", "), body)).toBe(true);
  });

  it("rejects a tampered body", async () => {
    expect(await verifyWebhook(secret, sign(now()), body.replace("completed", "failed"))).toBe(false);
  });

  it("rejects the wrong secret", async () => {
    expect(await verifyWebhook("whsec_other", sign(now()), body)).toBe(false);
  });

  it("rejects a stale timestamp", async () => {
    expect(await verifyWebhook(secret, sign(now() - 301), body)).toBe(false);
    expect(await verifyWebhook(secret, sign(now() - 1000), body, 2000)).toBe(true);
  });

  it("rejects malformed headers", async () => {
    for (const h of ["", "garbage", "t=abc,v1=00", `t=${now()}`, `v1=${"a".repeat(64)}`, `t=${now()},v1=zz`, null, undefined]) {
      expect(await verifyWebhook(secret, h as string | null | undefined, body)).toBe(false);
    }
  });
});
