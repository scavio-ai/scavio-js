import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

describe("GoogleNamespace", () => {
  let client: Scavio;

  beforeEach(() => {
    client = new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 10 });
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("search sends POST to /api/v1/google", async () => {
    await client.google.search({ query: "web scraping" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/google",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ query: "web scraping" }),
      }),
    );
  });

  it("search passes all optional params", async () => {
    await client.google.search({
      query: "test",
      country_code: "us",
      language: "en",
      page: 2,
      search_type: "news",
      device: "mobile",
      nfpr: true,
      light_request: true,
    });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({
      query: "test",
      country_code: "us",
      language: "en",
      page: 2,
      search_type: "news",
      device: "mobile",
      nfpr: true,
      light_request: true,
    });
  });
});
