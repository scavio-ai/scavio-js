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

  it("search sends country and page", async () => {
    await client.amazon.search({ query: "laptop", country: "de", page: 2 });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ query: "laptop", country: "de", page: 2 });
  });

  // `domain` and `start_page` are deprecated in favour of `country` and `page`,
  // but published SDK versions send them and the API still translates them.
  it("search still forwards the deprecated domain and start_page aliases", async () => {
    await client.amazon.search({
      query: "laptop",
      domain: "co.uk",
      start_page: 3,
    });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ query: "laptop", domain: "co.uk", start_page: 3 });
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
      country: "gb",
    });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({
      query: "B09V3KXJPB",
      country: "gb",
    });
  });

  it("offers sends asin as query field to /api/v1/amazon/offers", async () => {
    await client.amazon.offers({ asin: "B09V3KXJPB", country: "us" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ query: "B09V3KXJPB", country: "us" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/amazon/offers",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("options sends a GET to /api/v1/amazon/options with no body", async () => {
    // `languages` and `currencies` are always empty now: neither is a request
    // param any more, they stay in the payload only so old parsers keep working.
    const payload = {
      domains: [{ value: "com", label: "United States" }],
      languages: [],
      currencies: [],
      countries: [{ value: "us", label: "United States" }],
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    } as Response);

    const result = await client.amazon.options();

    expect(result).toEqual(payload);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/amazon/options",
      expect.objectContaining({ method: "GET" }),
    );
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect((call[1] as RequestInit).body).toBeUndefined();
  });
});
