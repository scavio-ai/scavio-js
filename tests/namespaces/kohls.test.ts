import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, KOHLS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "jeans" }, "/api/v1/kohls/search"],
  [
    "search",
    {
      query: "jeans",
      brand: "Levi's",
      size: "M",
      color: "Black",
      on_sale: true,
      clearance: true,
      sort: "percent_off",
      filters: ["Gender:Womens", "Price:$25 to $50"],
      page: 2,
    },
    "/api/v1/kohls/search",
  ],
  ["product", { product_id: "6251213" }, "/api/v1/kohls/product"],
  ["product", { product_id: 6251213, store_id: 725 }, "/api/v1/kohls/product"],
  [
    "product",
    { url: "https://www.kohls.com/product/prd-6251213/hamilton-beach-17-liter-black-electric-kettle.jsp" },
    "/api/v1/kohls/product",
  ],
  [
    "category",
    { path: "/catalog/small-appliances-kitchen-dining.jsp?CN=Category:Small%20Appliances+Department:Kitchen%20%26%20Dining" },
    "/api/v1/kohls/category",
  ],
  [
    "category",
    { url: "https://www.kohls.com/catalog/womens-clothing.jsp?CN=Gender:Womens+Department:Clothing", brand: "Nike", sort: "best_sellers" },
    "/api/v1/kohls/category",
  ],
  ["brand", { brand: "Hamilton Beach", on_sale: true, page: 2 }, "/api/v1/kohls/brand"],
  ["deals", { type: "kohls_cash", brand: "Nike", sort: "highest_rated" }, "/api/v1/kohls/deals"],
  ["stores", { zip: "60601" }, "/api/v1/kohls/stores"],
  ["stores", { city: "Austin", state: "TX", radius: 50 }, "/api/v1/kohls/stores"],
  ["stores", { lat: 34.0522, lng: -118.2437, radius: 100 }, "/api/v1/kohls/stores"],
  ["storeAvailability", { sku: "73519108", zip: "10001" }, "/api/v1/kohls/store-availability"],
  ["storeAvailability", { sku: 73519108, zip: 10001, dept: "063" }, "/api/v1/kohls/store-availability"],
  ["suggestions", { query: "coff" }, "/api/v1/kohls/suggestions"],
  ["suggestions", { query: "coff", type: "products" }, "/api/v1/kohls/suggestions"],
  ["coupons", {}, "/api/v1/kohls/coupons"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("kohls namespace", () => {
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

  it.each(ENDPOINTS)("kohls.%s posts its body to %s", async (method, args, path) => {
    await (client.kohls as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals", "coupons"] as const)("kohls.%s options are optional", async (method) => {
    await client.kohls[method]();
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev/api/v1/kohls/${method}`);
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.kohls)).filter(
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
      ].sort(),
    );
  });

  it("KOHLS_TIMEOUT is 120 s", () => {
    expect(KOHLS_TIMEOUT).toBe(120_000);
  });

  it.each([
    ["search", { query: "jeans" }],
    ["product", { product_id: "6251213" }],
    ["category", { path: "/catalog/womens-clothing.jsp?CN=Gender:Womens+Department:Clothing" }],
    ["brand", { brand: "Hamilton Beach" }],
    ["deals", undefined],
    ["stores", { zip: "60601" }],
    ["storeAvailability", { sku: "73519108", zip: "10001" }],
    ["suggestions", { query: "coff" }],
    ["coupons", undefined],
  ] as const)("kohls.%s raises the request timeout, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => (c.kohls as unknown as Ns)[method]!(args as Record<string, unknown> | undefined);

    await call(client);
    expect(delays()).toContain(KOHLS_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(KOHLS_TIMEOUT);
  });
});
