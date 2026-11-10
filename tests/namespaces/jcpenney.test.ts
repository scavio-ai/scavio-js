import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, JCPENNEY_TIMEOUT, JCPENNEY_REVIEWS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "jeans" }, "/api/v1/jcpenney/search"],
  [
    "search",
    {
      query: "jeans",
      brand: ["levi's", "lee"],
      deal: "CLEARANCE",
      exact: true,
      size: "m",
      color: ["black", "blue"],
      price_range: "$20 - $24",
      sort: "price_low_to_high",
      filters: { gender: "women", rise: ["mid rise", "high rise"] },
      page: 2,
    },
    "/api/v1/jcpenney/search",
  ],
  ["product", { product_id: "ppr5008604049" }, "/api/v1/jcpenney/product"],
  ["product", { product_ids: ["ppr5008604049", "ppr5008212471"] }, "/api/v1/jcpenney/product"],
  [
    "product",
    { url: "https://www.jcpenney.com/p/st-johns-bay-womens-mid-rise-straight-leg-jean/ppr5008604049" },
    "/api/v1/jcpenney/product",
  ],
  ["category", { path: "/g/women/dresses?id=cat100210008" }, "/api/v1/jcpenney/category"],
  [
    "category",
    { url: "https://www.jcpenney.com/g/women/dresses?id=cat100210008", brand: "nike", deal: "SALE", sort: "best_sellers" },
    "/api/v1/jcpenney/category",
  ],
  ["brand", { brand: "Nike", deal: "SALE", page: 2 }, "/api/v1/jcpenney/brand"],
  ["brand", { url: "https://www.jcpenney.com/g/brands/nike?id=cat11100023787" }, "/api/v1/jcpenney/brand"],
  ["deals", { type: "bogo", department: "dept20000011", sort: "rating" }, "/api/v1/jcpenney/deals"],
  ["deals", { label: "BUY 1 GET 1 50% OFF", brand: "nike" }, "/api/v1/jcpenney/deals"],
  ["stores", { zip: "75024" }, "/api/v1/jcpenney/stores"],
  ["stores", { city: "Austin", state: "TX", radius: 50, page: 2, page_size: 20 }, "/api/v1/jcpenney/stores"],
  ["stores", { lat: 34.05, lng: -118.24, radius: 100 }, "/api/v1/jcpenney/stores"],
  ["storeAvailability", { sku: "84630160042", zip: "90012" }, "/api/v1/jcpenney/store-availability"],
  [
    "storeAvailability",
    { sku: 84630160042, lat: 34.05, lng: -118.24, radius: 50, in_stock_only: true },
    "/api/v1/jcpenney/store-availability",
  ],
  ["suggestions", { query: "jea" }, "/api/v1/jcpenney/suggestions"],
  ["coupons", {}, "/api/v1/jcpenney/coupons"],
  ["reviews", { product_id: "ppr5008604049" }, "/api/v1/jcpenney/reviews"],
  [
    "reviews",
    { url: "https://www.jcpenney.com/p/x/ppr5008604049", sort: "most_helpful", rating: 1, max_reviews: 68 },
    "/api/v1/jcpenney/reviews",
  ],
  ["questions", { product_id: "ppr5008212471" }, "/api/v1/jcpenney/questions"],
  ["questions", { url: "https://www.jcpenney.com/p/x/ppr5008212471", max_questions: 20 }, "/api/v1/jcpenney/questions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("jcpenney namespace", () => {
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

  it.each(ENDPOINTS)("jcpenney.%s posts its body to %s", async (method, args, path) => {
    await (client.jcpenney as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals", "coupons"] as const)("jcpenney.%s options are optional", async (method) => {
    await client.jcpenney[method]();
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev/api/v1/jcpenney/${method}`);
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.jcpenney)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(
      [
        "search",
        "product",
        "category",
        "brand",
        "deals",
        "stores",
        "storeAvailability",
        "suggestions",
        "coupons",
        "reviews",
        "questions",
      ].sort(),
    );
  });

  it("JCPENNEY_TIMEOUT is 120 s, JCPENNEY_REVIEWS_TIMEOUT 240 s", () => {
    expect(JCPENNEY_TIMEOUT).toBe(120_000);
    expect(JCPENNEY_REVIEWS_TIMEOUT).toBe(240_000);
  });

  it.each([
    ["search", { query: "jeans" }],
    ["product", { product_id: "ppr5008604049" }],
    ["category", { path: "/g/women/dresses?id=cat100210008" }],
    ["brand", { brand: "Nike" }],
    ["deals", undefined],
    ["stores", { zip: "75024" }],
    ["storeAvailability", { sku: "84630160042", zip: "90012" }],
    ["suggestions", { query: "jea" }],
    ["coupons", undefined],
  ] as const)("jcpenney.%s raises the request timeout, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => (c.jcpenney as unknown as Ns)[method]!(args as Record<string, unknown> | undefined);

    await call(client);
    expect(delays()).toContain(JCPENNEY_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(JCPENNEY_TIMEOUT);
  });

  it.each([
    ["reviews", { product_id: "ppr5008604049" }],
    ["questions", { product_id: "ppr5008212471" }],
  ] as const)("jcpenney.%s raises the request timeout to 240 s, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => (c.jcpenney as unknown as Ns)[method]!(args);

    await call(client);
    expect(delays()).toContain(JCPENNEY_REVIEWS_TIMEOUT);
    expect(delays()).not.toContain(JCPENNEY_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(JCPENNEY_REVIEWS_TIMEOUT);
  });
});
