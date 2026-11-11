import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, DICKS_TIMEOUT, DICKS_PRODUCT_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "running shoes" }, "/api/v1/dicks/search"],
  [
    "search",
    {
      query: "running shoes",
      brand: ["Nike", "HOKA"],
      sort: "savings",
      page: 2,
      page_size: 144,
      filters: { "5495": "Men's", rating: "4+" },
      min_price: 60,
      max_price: 80,
    },
    "/api/v1/dicks/search",
  ],
  ["product", { product_id: "23FHQMCLFTN9GTXBLMNS" }, "/api/v1/dicks/product"],
  [
    "product",
    {
      url: "https://www.dickssportinggoods.com/p/hoka-mens-clifton-9-gtx-running-shoes-23fhqmclftn9gtxblmns/23fhqmclftn9gtxblmns",
    },
    "/api/v1/dicks/product",
  ],
  ["products", { product_ids: ["23FHQMCLFTN9GTXBLMNS", "26UNDMFITN1HRI9WUAETC"] }, "/api/v1/dicks/products"],
  ["reviews", { product_id: "26UNDMFITN1HRI9WUAETC" }, "/api/v1/dicks/reviews"],
  ["category", { path: "/f/mens-running-shoes" }, "/api/v1/dicks/category"],
  ["category", { category_id: "202105", brand: "Nike", sort: "featured" }, "/api/v1/dicks/category"],
  ["category", { url: "https://www.dickssportinggoods.com/f/mens-running-shoes", page: 3 }, "/api/v1/dicks/category"],
  ["brand", { brand: "YETI", query: "tumbler" }, "/api/v1/dicks/brand"],
  ["deals", { type: "weekly_deals", sort: "savings", brand: "Nike" }, "/api/v1/dicks/deals"],
  ["storeAvailability", { skus: ["25535758", "26810079"], zip: "60601" }, "/api/v1/dicks/store-availability"],
  [
    "storeAvailability",
    { skus: ["25535758"], lat: 41.8859, lng: -87.6248, radius: 50, chain: "golf_galaxy", in_stock_only: true },
    "/api/v1/dicks/store-availability",
  ],
  ["suggestions", { query: "yeti tum" }, "/api/v1/dicks/suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("dicks namespace", () => {
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

  it.each(ENDPOINTS)("dicks.%s posts its body to %s", async (method, args, path) => {
    await (client.dicks as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("dicks.deals options are optional", async () => {
    await client.dicks.deals();
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe("https://api.scavio.dev/api/v1/dicks/deals");
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.dicks)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(
      [
        "search",
        "product",
        "products",
        "reviews",
        "category",
        "brand",
        "deals",
        "storeAvailability",
        "suggestions",
      ].sort(),
    );
  });

  it("DICKS_TIMEOUT is 120 s, DICKS_PRODUCT_TIMEOUT 240 s", () => {
    expect(DICKS_TIMEOUT).toBe(120_000);
    expect(DICKS_PRODUCT_TIMEOUT).toBe(240_000);
  });

  it.each([
    ["search", { query: "running shoes" }],
    ["products", { product_ids: ["23FHQMCLFTN9GTXBLMNS"] }],
    ["category", { path: "/f/mens-running-shoes" }],
    ["brand", { brand: "YETI" }],
    ["deals", undefined],
    ["storeAvailability", { skus: ["25535758"], zip: "60601" }],
    ["suggestions", { query: "yeti tum" }],
  ] as const)("dicks.%s raises the request timeout, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => (c.dicks as unknown as Ns)[method]!(args as Record<string, unknown> | undefined);

    await call(client);
    expect(delays()).toContain(DICKS_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(DICKS_TIMEOUT);
  });

  it.each([
    ["product", { product_id: "23FHQMCLFTN9GTXBLMNS" }],
    ["reviews", { product_id: "26UNDMFITN1HRI9WUAETC" }],
  ] as const)("dicks.%s raises the request timeout to 240 s, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => (c.dicks as unknown as Ns)[method]!(args);

    await call(client);
    expect(delays()).toContain(DICKS_PRODUCT_TIMEOUT);
    expect(delays()).not.toContain(DICKS_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(DICKS_PRODUCT_TIMEOUT);
  });
});
