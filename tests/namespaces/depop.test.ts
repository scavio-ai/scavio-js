import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, DEPOP_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "levis 501" }, "/api/v1/depop/search"],
  [
    "search",
    {
      query: "levis 501",
      country: "gb",
      sort: "price_asc",
      brand_ids: [31],
      conditions: ["used_excellent"],
      colors: ["blue"],
      price_min: 5,
      price_max: 40.5,
      on_sale: true,
      gender: "male",
      group: "bottoms",
      product_type: ["jeans"],
      kids: false,
    },
    "/api/v1/depop/search",
  ],
  ["product", { slug: "f0omem-levis-550-38x36-blue-jeans-662f" }, "/api/v1/depop/product"],
  ["product", { product_id: 1002884801, country: "nz" }, "/api/v1/depop/product"],
  ["product", { url: "https://www.depop.com/products/f0omem-levis-550-38x36-blue-jeans-662f/", country: "uk" }, "/api/v1/depop/product"],
  ["category", { category: "mens/bottoms/jeans", country: "de" }, "/api/v1/depop/category"],
  ["brand", { slug: "carhartt", sort: "price_desc" }, "/api/v1/depop/brand"],
  ["explore", { slug: "90s-menswear" }, "/api/v1/depop/explore"],
  ["suggestions", { query: "carh", country: "au" }, "/api/v1/depop/suggestions"],
  ["shop", { username: "flomem" }, "/api/v1/depop/shop"],
  ["shopProducts", { shop_id: 46847613, limit: 10 }, "/api/v1/depop/shop-products"],
  ["shopSold", { username: "flomem", cursor: "abc" }, "/api/v1/depop/shop-sold"],
  ["shopReviews", { username: "flomem", role: "buyer", page: 2 }, "/api/v1/depop/shop-reviews"],
  ["shopsSearch", { query: "y2k" }, "/api/v1/depop/shops-search"],
  ["categories", { language: "de", include_sizes: true }, "/api/v1/depop/categories"],
  ["brands", { letter: "c" }, "/api/v1/depop/brands"],
  ["brands", { slug: "carhartt" }, "/api/v1/depop/brands"],
  ["similar", { product_id: 1002884801 }, "/api/v1/depop/similar"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("depop namespace", () => {
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

  it.each(ENDPOINTS)("depop.%s posts its body to %s", async (method, args, path) => {
    await (client.depop as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("categories() works with no options", async () => {
    await client.depop.categories();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/depop/categories");
    expect(body()).toEqual({});
  });

  it("has all 14 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.depop)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brand", "brands", "categories", "category", "explore", "product", "search", "shop",
      "shopProducts", "shopReviews", "shopSold", "shopsSearch", "similar", "suggestions",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(DEPOP_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "depop.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.depop as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(DEPOP_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(DEPOP_TIMEOUT);
    },
  );
});
