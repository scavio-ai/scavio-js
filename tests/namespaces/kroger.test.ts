import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, KROGER_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "coffee", banner: "qfc" }, "/api/v1/kroger/search"],
  ["search", { query: "organic milk", page: 1 }, "/api/v1/kroger/search"],
  ["product", { upc: "0001111050438", banner: "fred_meyer" }, "/api/v1/kroger/product"],
  [
    "product",
    { product_url: "/p/simple-truth-organic-lactose-free-2-reduced-fat-milk-half-gallon/0001111050438" },
    "/api/v1/kroger/product",
  ],
  [
    "prices",
    { store_id: "70500847", upcs: ["0001111050438", "0081006334306"], banner: "qfc" },
    "/api/v1/kroger/prices",
  ],
  [
    "stores",
    { zip: "97201", banner: "fred_meyer", limit: 5, include_other_banners: true },
    "/api/v1/kroger/stores",
  ],
  ["stores", { store_id: "70100011" }, "/api/v1/kroger/stores"],
  ["category", { taxonomy_id: "08190", slug: "Import-Beer", banner: "qfc" }, "/api/v1/kroger/category"],
  [
    "category",
    { url: "https://www.fredmeyer.com/pl/headphones-earbuds-headsets/2900300001" },
    "/api/v1/kroger/category",
  ],
  ["deals", { banner: "qfc" }, "/api/v1/kroger/deals"],
  ["coupons", { store_id: "70100011", page: 2, category: "Dairy", query: "milk" }, "/api/v1/kroger/coupons"],
  ["coupons", { zip: "98101", banner: "qfc" }, "/api/v1/kroger/coupons"],
  ["suggestions", { query: "almond mi", banner: "qfc", store_id: "70500847" }, "/api/v1/kroger/suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("kroger namespace", () => {
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

  it.each(ENDPOINTS)("kroger.%s posts its body to %s", async (method, args, path) => {
    await (client.kroger as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("deals() works with no options", async () => {
    await client.kroger.deals();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/kroger/deals");
    expect(body()).toEqual({});
  });

  it("has all 8 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.kroger)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(
      ["search", "product", "prices", "stores", "category", "deals", "coupons", "suggestions"].sort(),
    );
  });

  it("KROGER_TIMEOUT is 120 s", () => {
    expect(KROGER_TIMEOUT).toBe(120_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "kroger.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.kroger as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(KROGER_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(KROGER_TIMEOUT);
    },
  );
});
