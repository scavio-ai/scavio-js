import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

describe("AmazonNamespace", () => {
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

  it("search sends POST to /api/v1/amazon/search", async () => {
    await client.amazon.search({ query: "laptop" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/amazon/search",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ query: "laptop" }),
      }),
    );
  });

  it("product sends asin as query field", async () => {
    await client.amazon.product({ asin: "B09V3KXJPB" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ query: "B09V3KXJPB" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/amazon/product",
      expect.anything(),
    );
  });

  it("product passes optional params alongside query", async () => {
    await client.amazon.product({
      asin: "B09V3KXJPB",
      domain: "amazon.co.uk",
      country: "gb",
    });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({
      query: "B09V3KXJPB",
      domain: "amazon.co.uk",
      country: "gb",
    });
  });
});
