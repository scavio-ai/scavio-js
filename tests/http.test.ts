import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { request } from "../src/http.js";
import { RateLimiter } from "../src/rate-limiter.js";
import {
  BadRequestError,
  InvalidAPIKeyError,
  InsufficientCreditsError,
  RateLimitError,
  ScavioAPIError,
} from "../src/errors.js";

describe("request", () => {
  const rateLimiter = new RateLimiter(10);

  const baseOpts = {
    apiKey: "sk_test",
    baseUrl: "https://api.scavio.dev",
    timeout: 5000,
    rateLimiter,
  };

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends POST with correct headers and body", async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ data: "ok" }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await request({
      ...baseOpts,
      method: "POST",
      path: "/api/v1/google",
      body: { query: "test", country_code: "us" },
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/google",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer sk_test",
          "Content-Type": "application/json",
          "X-Client-Source": "scavio-js",
        },
        body: JSON.stringify({ query: "test", country_code: "us" }),
      }),
    );
  });

  it("sends GET without body", async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ credits: 100 }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    const result = await request({
      ...baseOpts,
      method: "GET",
      path: "/api/v1/usage",
    });

    expect(result).toEqual({ credits: 100 });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/usage",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("strips undefined values from body", async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({}),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await request({
      ...baseOpts,
      method: "POST",
      path: "/test",
      body: { query: "test", page: undefined, device: "desktop" },
    });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const init = call[1] as RequestInit;
    expect(JSON.parse(init.body as string)).toEqual({
      query: "test",
      device: "desktop",
    });
  });

  it("throws BadRequestError on 400", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: "Missing query" }),
    } as Response);

    await expect(
      request({ ...baseOpts, method: "POST", path: "/test", body: {} }),
    ).rejects.toThrow(BadRequestError);
  });

  it("throws InvalidAPIKeyError on 401", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Invalid key" }),
    } as Response);

    await expect(
      request({ ...baseOpts, method: "GET", path: "/test" }),
    ).rejects.toThrow(InvalidAPIKeyError);
  });

  it("throws InsufficientCreditsError on 402", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 402,
      json: () => Promise.resolve({ error: "No credits" }),
    } as Response);

    await expect(
      request({ ...baseOpts, method: "GET", path: "/test" }),
    ).rejects.toThrow(InsufficientCreditsError);
  });

  it("throws RateLimitError on 429", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: "Too many requests" }),
    } as Response);

    await expect(
      request({ ...baseOpts, method: "GET", path: "/test" }),
    ).rejects.toThrow(RateLimitError);
  });

  it("throws ScavioAPIError on other status codes", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Internal error" }),
    } as Response);

    await expect(
      request({ ...baseOpts, method: "GET", path: "/test" }),
    ).rejects.toThrow(ScavioAPIError);
  });

  it("parses nested error message format", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({ error: { message: "Detailed error info" } }),
    } as Response);

    await expect(
      request({ ...baseOpts, method: "GET", path: "/test" }),
    ).rejects.toThrow("Detailed error info");
  });

  it("handles non-JSON error response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("not json")),
    } as Response);

    await expect(
      request({ ...baseOpts, method: "GET", path: "/test" }),
    ).rejects.toThrow(ScavioAPIError);
  });
});
