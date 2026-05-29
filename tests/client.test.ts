import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, MissingAPIKeyError, ScavioError } from "../src/index.js";

describe("Scavio", () => {
  const originalEnv = process.env.SCAVIO_API_KEY;

  beforeEach(() => {
    delete process.env.SCAVIO_API_KEY;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.SCAVIO_API_KEY = originalEnv;
    } else {
      delete process.env.SCAVIO_API_KEY;
    }
  });

  it("throws MissingAPIKeyError when no key is provided", () => {
    expect(() => new Scavio()).toThrow(MissingAPIKeyError);
  });

  it("accepts apiKey in config", () => {
    const client = new Scavio({ apiKey: "sk_test" });
    expect(client).toBeInstanceOf(Scavio);
  });

  it("reads apiKey from SCAVIO_API_KEY env var", () => {
    process.env.SCAVIO_API_KEY = "sk_env_test";
    const client = new Scavio();
    expect(client).toBeInstanceOf(Scavio);
  });

  it("config apiKey takes precedence over env var", () => {
    process.env.SCAVIO_API_KEY = "sk_env";
    const client = new Scavio({ apiKey: "sk_config" });
    expect(client).toBeInstanceOf(Scavio);
  });

  it("throws on invalid maxRequestsPerSecond", () => {
    expect(
      () => new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 0 }),
    ).toThrow(ScavioError);
    expect(
      () => new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 11 }),
    ).toThrow(ScavioError);
  });

  it("exposes all 6 namespaces", () => {
    const client = new Scavio({ apiKey: "sk_test" });
    expect(client.google).toBeDefined();
    expect(client.amazon).toBeDefined();
    expect(client.walmart).toBeDefined();
    expect(client.youtube).toBeDefined();
    expect(client.reddit).toBeDefined();
    expect(client.tiktok).toBeDefined();
  });

  it("search() delegates to google.search()", async () => {
    const client = new Scavio({ apiKey: "sk_test" });
    const mockResult = { results: [] };
    const spy = vi
      .spyOn(client.google, "search")
      .mockResolvedValue(mockResult);

    const result = await client.search({ query: "test" });
    expect(result).toBe(mockResult);
    expect(spy).toHaveBeenCalledWith({ query: "test" });
  });
});
