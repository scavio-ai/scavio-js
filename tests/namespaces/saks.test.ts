import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, SAKS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "coat" }, "/api/v1/saks/search"],
  [
    "search",
    {
      query: "coat",
      brand: ["Prada", "Moncler"],
      size: "Medium",
      color: "Black",
      min_price: 500,
      max_price: 2000,
      on_sale: true,
      sort: "price_low_to_high",
      filters: { refGender: "Women's" },
      start: 24,
    },
    "/api/v1/saks/search",
  ],
  ["product", { product_id: "0400019127312" }, "/api/v1/saks/product"],
  ["product", { product_id: "0400019127312", color: "BLUE OPAL", size: "4" }, "/api/v1/saks/product"],
  [
    "product",
    { url: "https://www.saksfifthavenue.com/product/kay-unger-mariah-jacquard-textured-gown-0400019127312.html" },
    "/api/v1/saks/product",
  ],
  ["category", { path: "/c/women-s-apparel/dresses", start: 22 }, "/api/v1/saks/category"],
  ["category", { url: "https://www.saksfifthavenue.com/c/women-s-apparel/dresses", brand: "Lela Rose" }, "/api/v1/saks/category"],
  ["brand", { brand: "gucci", new_arrivals: true, page: 2 }, "/api/v1/saks/brand"],
  ["deals", { type: "womens_sale", brand: "Prada", sort: "sale_first" }, "/api/v1/saks/deals"],
  ["stores", { zip: "10022", radius: 50 }, "/api/v1/saks/stores"],
  ["stores", { lat: 40.758, lng: -73.9855, radius: 300 }, "/api/v1/saks/stores"],
  ["storeAvailability", { sku: "10781654", zip: "10022" }, "/api/v1/saks/store-availability"],
  ["storeAvailability", { sku: 10781654, lat: 40.758, lng: -73.9855, radius: 15 }, "/api/v1/saks/store-availability"],
  ["suggestions", { query: "gucci" }, "/api/v1/saks/suggestions"],
  ["designers", { letter: "G" }, "/api/v1/saks/designers"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("saks namespace", () => {
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

  it.each(ENDPOINTS)("saks.%s posts its body to %s", async (method, args, path) => {
    await (client.saks as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals", "designers"] as const)("saks.%s options are optional", async (method) => {
    await client.saks[method]();
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev/api/v1/saks/${method}`);
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.saks)).filter(
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
        "designers",
      ].sort(),
    );
  });

  it("SAKS_TIMEOUT is 120 s", () => {
    expect(SAKS_TIMEOUT).toBe(120_000);
  });

  it.each([
    ["search", { query: "coat" }],
    ["product", { product_id: "0400019127312" }],
    ["category", { path: "/c/women-s-apparel/dresses" }],
    ["brand", { brand: "gucci" }],
    ["deals", undefined],
    ["stores", { zip: "10022" }],
    ["storeAvailability", { sku: "10781654", zip: "10022" }],
    ["suggestions", { query: "gucci" }],
    ["designers", undefined],
  ] as const)("saks.%s raises the request timeout, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => (c.saks as unknown as Ns)[method]!(args as Record<string, unknown> | undefined);

    await call(client);
    expect(delays()).toContain(SAKS_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(SAKS_TIMEOUT);
  });
});
