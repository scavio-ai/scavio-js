import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ASOS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "jeans" }, "/api/v1/asos/search"],
  [
    "search",
    {
      query: "kleid",
      country: "de",
      page: 2,
      page_size: 200,
      sort: "price_asc",
      gender: "women",
      brand: ["53", "401"],
      color: "black",
      range: "petite",
      price_min: 10,
      price_max: 49.5,
      facets: { discount_band: ["5", "6"] },
      on_sale: true,
    },
    "/api/v1/asos/search",
  ],
  ["product", { product_id: "210309625" }, "/api/v1/asos/product"],
  ["product", { group_id: "210070576", country: "nl" }, "/api/v1/asos/product"],
  ["product", { product_id: "211390171", country: "jp", currency: "USD" }, "/api/v1/asos/product"],
  [
    "stock",
    { product_ids: ["205338218", "206956133", "209793673"], country: "il", currency: "USD" },
    "/api/v1/asos/stock",
  ],
  ["stock", { product_ids: "205338218,206956133" }, "/api/v1/asos/stock"],
  ["reviews", { product_id: "210309625", sort: "newest", page_size: 50, rating: 5 }, "/api/v1/asos/reviews"],
  ["suggestions", { query: "dre", country: "us" }, "/api/v1/asos/suggestions"],
  ["category", { category_id: "8799", country: "fr", sort: "price_asc" }, "/api/v1/asos/category"],
  ["categories", { gender: "men" }, "/api/v1/asos/categories"],
  ["brands", { country: "es" }, "/api/v1/asos/brands"],
  ["deals", { country: "us", gender: "men" }, "/api/v1/asos/deals"],
  ["newArrivals", { country: "au" }, "/api/v1/asos/new-arrivals"],
  ["markets", { country: "ae", currency: "GBP" }, "/api/v1/asos/markets"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("asos namespace", () => {
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

  it.each(ENDPOINTS)("asos.%s posts its body to %s", async (method, args, path) => {
    await (client.asos as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each([
    ["categories", "categories"],
    ["brands", "brands"],
    ["deals", "deals"],
    ["newArrivals", "new-arrivals"],
    ["markets", "markets"],
  ])("%s() works with no options", async (method, path) => {
    await (client.asos as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev/api/v1/asos/${path}`);
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.asos)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brands", "categories", "category", "deals", "markets", "newArrivals", "product", "reviews", "search",
      "stock", "suggestions",
    ]);
  });

  it("timeout: 120 s", () => {
    expect(ASOS_TIMEOUT).toBe(120_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "asos.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.asos as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(ASOS_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(ASOS_TIMEOUT);
    },
  );
});
