import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, MACYS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "jeans" }, "/api/v1/macys/search"],
  [
    "search",
    {
      query: "jeans",
      brand: ["Levi's", "Calvin Klein"],
      special_offer: "clearance",
      min_price: 50,
      max_price: 100,
      sort: "price_low_to_high",
      filters: { GENDER: "Women" },
      include_sponsored: true,
    },
    "/api/v1/macys/search",
  ],
  ["product", { product_id: 25822310 }, "/api/v1/macys/product"],
  [
    "product",
    { url: "https://www.macys.com/shop/product/calvin-klein-mens-straight-fit-stretch-denim-jeans?ID=25822310" },
    "/api/v1/macys/product",
  ],
  ["product", { product_ids: [25822310, 719388, 19206874] }, "/api/v1/macys/product"],
  [
    "reviews",
    { product_id: "25822310", sort: "lowest_rated", rating: 1, limit: 100, query: "soft" },
    "/api/v1/macys/reviews",
  ],
  ["category", { category_id: 3763, page: 2, pickup_store_id: 4592 }, "/api/v1/macys/category"],
  ["brand", { brand_id: 337747, special_offer: ["clearance", "last_act"] }, "/api/v1/macys/brand"],
  ["deals", { type: "black_friday", sort: "best_sellers" }, "/api/v1/macys/deals"],
  ["stores", { zip: "10001", radius: 25 }, "/api/v1/macys/stores"],
  ["stores", { city: "Atlanta", state: "GA" }, "/api/v1/macys/stores"],
  ["storeAvailability", { product_id: 25822310, store_id: 4592 }, "/api/v1/macys/store-availability"],
  ["storeAvailability", { product_id: 25822310, lat: 37.7879, lng: -122.4075 }, "/api/v1/macys/store-availability"],
  ["suggestions", { query: "jea" }, "/api/v1/macys/suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("macys namespace", () => {
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

  it.each(ENDPOINTS)("macys.%s posts its body to %s", async (method, args, path) => {
    await (client.macys as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("macys.deals options are optional", async () => {
    await client.macys.deals();
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe("https://api.scavio.dev/api/v1/macys/deals");
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.macys)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(
      [
        "search",
        "product",
        "reviews",
        "category",
        "brand",
        "deals",
        "stores",
        "storeAvailability",
        "suggestions",
      ].sort(),
    );
  });

  it("MACYS_TIMEOUT is 120 s", () => {
    expect(MACYS_TIMEOUT).toBe(120_000);
  });

  it.each([
    ["search", { query: "jeans" }],
    ["product", { product_id: 25822310 }],
    ["reviews", { product_id: 25822310 }],
    ["category", { category_id: 3763 }],
    ["brand", { brand_id: 337747 }],
    ["deals", undefined],
    ["stores", { zip: "10001" }],
    ["storeAvailability", { product_id: 25822310, store_id: 4592 }],
    ["suggestions", { query: "jea" }],
  ] as const)("macys.%s raises the request timeout, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => (c.macys as unknown as Ns)[method]!(args as Record<string, unknown> | undefined);

    await call(client);
    expect(delays()).toContain(MACYS_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(MACYS_TIMEOUT);
  });
});
