import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, TRENDYOL_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "telefon" }, "/api/v1/trendyol/search"],
  [
    "search",
    {
      query: "kulaklik",
      country: "tr",
      language: "en",
      page: 2,
      sort: "price_asc",
      brand_id: [794],
      price_max: 5000,
      min_rating: 4.5,
      lowest_price_days: 30,
      seller_type: "official",
      filters: { attr: ["348|1"] },
      include_facets: true,
    },
    "/api/v1/trendyol/search",
  ],
  ["product", { content_id: 975557855, include_description: true }, "/api/v1/trendyol/product"],
  ["product", { url: "https://www.trendyol.com/x/y-p-975557855", country: "de" }, "/api/v1/trendyol/product"],
  ["category", { category_id: "103498", sort: "price_desc" }, "/api/v1/trendyol/category"],
  ["brand", { brand_id: 794, country: "ro" }, "/api/v1/trendyol/brand"],
  [
    "reviews",
    { content_id: "975557855", page: 2, page_size: 50, sort: "newest", rating: 5, with_media: true },
    "/api/v1/trendyol/reviews",
  ],
  ["questions", { content_id: "975557855", country: "ae", language: "ar" }, "/api/v1/trendyol/questions"],
  ["seller", { seller_id: 4473, include_products: true, query: "kilif" }, "/api/v1/trendyol/seller"],
  ["deals", { type: "super_discounts", sort: "price_asc" }, "/api/v1/trendyol/deals"],
  ["coupons", { content_id: "780343279", seller_id: "1188867" }, "/api/v1/trendyol/coupons"],
  ["rankings", { category_id: 56, ranking: "most_favourited", page: 2 }, "/api/v1/trendyol/rankings"],
  ["suggestions", { query: "iph", country: "sa" }, "/api/v1/trendyol/suggestions"],
  ["delivery", { content_id: "975557855", city_id: 133, district_id: 54 }, "/api/v1/trendyol/delivery"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("trendyol namespace", () => {
  let client: Scavio;

  beforeEach(() => {
    client = new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50 });
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const body = () =>
    JSON.parse((vi.mocked(fetch).mock.calls[0]![1] as RequestInit).body as string);

  it.each(ENDPOINTS)("trendyol.%s posts its body to %s", async (method, args, path) => {
    await (client.trendyol as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("deals() works with no options", async () => {
    await client.trendyol.deals();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/trendyol/deals");
    expect(body()).toEqual({});
  });

  it("has all 12 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.trendyol)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brand", "category", "coupons", "deals", "delivery", "product", "questions", "rankings", "reviews",
      "search", "seller", "suggestions",
    ]);
  });

  it("timeout: 120 s", () => {
    expect(TRENDYOL_TIMEOUT).toBe(120_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "trendyol.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.trendyol as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(TRENDYOL_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(TRENDYOL_TIMEOUT);
    },
  );
});
