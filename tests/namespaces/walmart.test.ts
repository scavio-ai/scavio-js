import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

describe("WalmartNamespace", () => {
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

  it("search sends POST to /api/v1/walmart/search", async () => {
    await client.walmart.search({ query: "tv" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/walmart/search",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ query: "tv" }),
      }),
    );
  });

  it("product sends product_id to /api/v1/walmart/product", async () => {
    await client.walmart.product({ product_id: "123456" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ product_id: "123456" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/walmart/product",
      expect.anything(),
    );
  });
});
