import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, UNIQLO_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "heattech" }, "/api/v1/uniqlo/search"],
  ["search", { query: "牛仔褲", country: "tw", sort: "best_selling", page_size: 48 }, "/api/v1/uniqlo/search"],
  ["product", { product_id: "E479000-000", country: "de", language: "de" }, "/api/v1/uniqlo/product"],
  ["product", { url: "https://www.uniqlo.com/us/en/products/E479000-000/00" }, "/api/v1/uniqlo/product"],
  ["stock", { product_id: "E479000-000" }, "/api/v1/uniqlo/stock"],
  ["storeStock", { lat: 40.758, lng: -73.9855, l2_id: "08665900" }, "/api/v1/uniqlo/store-stock"],
  [
    "storeStock",
    { lat: 35.6595, lng: 139.7005, product_id: "E479000-000", color: "COL04", size: "INS022", country: "jp" },
    "/api/v1/uniqlo/store-stock",
  ],
  ["stores", { lat: 37.5636, lng: 126.9826, country: "kr", limit: 5 }, "/api/v1/uniqlo/stores"],
  ["reviews", { product_id: "E479000-000", sort: "most_helpful", page_size: 25 }, "/api/v1/uniqlo/reviews"],
  ["suggestions", { query: "jea" }, "/api/v1/uniqlo/suggestions"],
  ["category", { category_path: ["22210", "23296", "23339"], flag: "sale" }, "/api/v1/uniqlo/category"],
  ["deals", { type: "limited_offer", gender: "women" }, "/api/v1/uniqlo/deals"],
  ["newArrivals", { country: "jp" }, "/api/v1/uniqlo/new-arrivals"],
  ["categories", { include_subcategories: true }, "/api/v1/uniqlo/categories"],
  ["prices", { product_id: "E479000-000", countries: ["jp", "us", "uk"] }, "/api/v1/uniqlo/prices"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("uniqlo namespace", () => {
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

  it.each(ENDPOINTS)("uniqlo.%s posts its body to %s", async (method, args, path) => {
    await (client.uniqlo as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["suggestions", "deals", "newArrivals", "categories"])("%s() works with no options", async (method) => {
    await (client.uniqlo as unknown as Ns)[method]!();
    expect(body()).toEqual({});
  });

  it("has all 12 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.uniqlo)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "categories", "category", "deals", "newArrivals", "prices", "product", "reviews", "search",
      "stock", "storeStock", "stores", "suggestions",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(UNIQLO_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "uniqlo.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.uniqlo as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(UNIQLO_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(UNIQLO_TIMEOUT);
    },
  );
});
