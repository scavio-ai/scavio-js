import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ZARA_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "blazer" }, "/api/v1/zara/search"],
  ["search", { reference: "4591/381", country: "jp" }, "/api/v1/zara/search"],
  [
    "search",
    {
      query: "jeans",
      country: "es",
      language: "es",
      section: "woman",
      page: 2,
      page_size: 96,
      sort: "price_asc",
      price_min: 10,
      price_max: 50.5,
    },
    "/api/v1/zara/search",
  ],
  ["product", { product_id: "588478514", slug: "trf-low-rise-wide-leg-jeans-p08727223" }, "/api/v1/zara/product"],
  ["product", { reference: "4591/381", country: "hk", language: "zh-Hant" }, "/api/v1/zara/product"],
  ["materials", { product_id: "588478514", country: "fr" }, "/api/v1/zara/materials"],
  ["stock", { product_id: "588478514" }, "/api/v1/zara/stock"],
  ["stores", { lat: 40.7128, lng: -74.006 }, "/api/v1/zara/stores"],
  ["storeStock", { product_id: "553306790", store_ids: ["3904", "3862"] }, "/api/v1/zara/store-stock"],
  ["storeStock", { product_id: "553306790", lat: 35.6762, lng: 139.6503, country: "jp" }, "/api/v1/zara/store-stock"],
  ["categories", { section: "woman" }, "/api/v1/zara/categories"],
  ["category", { category_id: "2420896", on_sale: true }, "/api/v1/zara/category"],
  ["deals", { country: "fr", section: "man" }, "/api/v1/zara/deals"],
  ["newArrivals", { country: "gb", section: "woman" }, "/api/v1/zara/new-arrivals"],
  ["prices", { reference: "4591/381", countries: ["us", "gb", "cn"] }, "/api/v1/zara/prices"],
  ["suggestions", { query: "jea" }, "/api/v1/zara/suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("zara namespace", () => {
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

  it.each(ENDPOINTS)("zara.%s posts its body to %s", async (method, args, path) => {
    await (client.zara as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each([
    ["categories", "categories"],
    ["deals", "deals"],
    ["newArrivals", "new-arrivals"],
  ])("%s() works with no options", async (method, path) => {
    await (client.zara as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev/api/v1/zara/${path}`);
    expect(body()).toEqual({});
  });

  it("has all 12 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.zara)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "categories", "category", "deals", "materials", "newArrivals", "prices", "product", "search", "stock",
      "storeStock", "stores", "suggestions",
    ]);
  });

  it("timeout: 120 s", () => {
    expect(ZARA_TIMEOUT).toBe(120_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "zara.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.zara as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(ZARA_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(ZARA_TIMEOUT);
    },
  );
});
