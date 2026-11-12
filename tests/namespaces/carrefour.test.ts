import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, CARREFOUR_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "nutella" }, "/api/v1/carrefour/search"],
  [
    "search",
    {
      query: "lait",
      brand: "LACTEL",
      sort: "price_low_to_high",
      store: "840093",
      nutriscore: "A",
      organic: true,
      min_price: 1.5,
      page: 2,
    },
    "/api/v1/carrefour/search",
  ],
  ["search", { query: "chocolat", country: "be", language: "nl" }, "/api/v1/carrefour/search"],
  ["product", { ean: "3017620422003", store: 281 }, "/api/v1/carrefour/product"],
  ["product", { url: "https://carrefour.ro/x/p", country: "ro" }, "/api/v1/carrefour/product"],
  [
    "reviews",
    { ean: "8006530256179", sort: "lowest_rated", rating: 1, limit: 50, offset: 10 },
    "/api/v1/carrefour/reviews",
  ],
  ["category", { path: "/r/cremerie", sort: "unit_price_low_to_high", carrefour_brands: true }, "/api/v1/carrefour/category"],
  ["promotions", { type: "loyalty", category: "Boissons" }, "/api/v1/carrefour/promotions"],
  ["suggestions", { query: "nutel" }, "/api/v1/carrefour/suggestions"],
  ["stores", { postal_code: "69003", service: "station_service", limit: 20 }, "/api/v1/carrefour/stores"],
  ["stores", { lat: 45.75, lng: 4.85 }, "/api/v1/carrefour/stores"],
  ["storeAvailability", { ean: "3017620422003", postal_code: "69003" }, "/api/v1/carrefour/store-availability"],
  ["store", { slug: "venissieux" }, "/api/v1/carrefour/store"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("carrefour namespace", () => {
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

  it.each(ENDPOINTS)("carrefour.%s posts its body to %s", async (method, args, path) => {
    await (client.carrefour as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("carrefour.promotions options are optional", async () => {
    await client.carrefour.promotions();
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe("https://api.scavio.dev/api/v1/carrefour/promotions");
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.carrefour)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(
      [
        "search",
        "product",
        "reviews",
        "category",
        "promotions",
        "suggestions",
        "stores",
        "storeAvailability",
        "store",
      ].sort(),
    );
  });

  it("CARREFOUR_TIMEOUT is 120 s", () => {
    expect(CARREFOUR_TIMEOUT).toBe(120_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "carrefour.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.carrefour as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(CARREFOUR_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(CARREFOUR_TIMEOUT);
    },
  );
});
