import { describe, it, expect } from "vitest";
import { RateLimiter } from "../src/rate-limiter.js";

describe("RateLimiter", () => {
  it("allows requests under the limit", async () => {
    const limiter = new RateLimiter(5);
    const start = Date.now();

    for (let i = 0; i < 5; i++) {
      await limiter.wait();
    }

    expect(Date.now() - start).toBeLessThan(100);
  });

  it("delays requests that exceed the limit", async () => {
    const limiter = new RateLimiter(1);
    await limiter.wait();

    const start = Date.now();
    await limiter.wait();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(800);
  });

  it("serializes concurrent calls", async () => {
    const limiter = new RateLimiter(2);
    const results: number[] = [];

    const promises = Array.from({ length: 4 }, (_, i) =>
      limiter.wait().then(() => results.push(i)),
    );

    await Promise.all(promises);
    expect(results).toHaveLength(4);
  });
});
