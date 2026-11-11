import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, FOOTLOCKER_TIMEOUT, FOOTLOCKER_REVIEWS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "nike dunk" }, "/api/v1/footlocker/search"],
  [
    "search",
    {
      query: "nike dunk",
      country: "be",
      language: "fr",
      brand: ["Nike", "Jordan"],
      sort: "price_low_to_high",
      page: 2,
      gender: "Men's",
      color: ["Black", "White"],
      price_range: "100-150",
      on_sale: true,
      filters: { mensShoesSize: "10.0", sport: "Running" },
    },
    "/api/v1/footlocker/search",
  ],
  ["product", { product_id: "Q5495005" }, "/api/v1/footlocker/product"],
  [
    "product",
    { url: "https://www.footlocker.com/product/jordan-retro-1-high-og-mens/Q5495005.html" },
    "/api/v1/footlocker/product",
  ],
  ["product", { product_id: "316707025504", country: "de" }, "/api/v1/footlocker/product"],
  ["category", { path: "/category/mens/shoes.html" }, "/api/v1/footlocker/category"],
  ["category", { collection_id: "men-s-shoes", country: "gb", sort: "top_rated" }, "/api/v1/footlocker/category"],
  ["brand", { brand: "New Balance", query: "running shoes" }, "/api/v1/footlocker/brand"],
  ["brand", { url: "https://www.footlocker.com/category/brands/new-balance.html", country: "us" }, "/api/v1/footlocker/brand"],
  ["deals", { type: "exclusives", country: "ca", language: "fr" }, "/api/v1/footlocker/deals"],
  [
    "releases",
    { country: "gb", status: "upcoming", from: "2026-11-01", to: "2026-12-31", brand: "Nike" },
    "/api/v1/footlocker/releases",
  ],
  ["stores", { zip: "10001", radius: 25, limit: 5 }, "/api/v1/footlocker/stores"],
  ["stores", { city: "Atlanta", state: "GA" }, "/api/v1/footlocker/stores"],
  ["storeAvailability", { product_id: "W2288111", size: "10.0", zip: "10001" }, "/api/v1/footlocker/store-availability"],
  [
    "storeAvailability",
    { url: "https://www.footlocker.com/product/~/W2288111.html", lat: 40.7506, lng: -73.9972, limit: 20 },
    "/api/v1/footlocker/store-availability",
  ],
  ["reviews", { product_id: "Q5495005", sort: "lowest_rating", rating: 1, limit: 98 }, "/api/v1/footlocker/reviews"],
  ["questions", { product_id: "Q5495005", limit: 50 }, "/api/v1/footlocker/questions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("footlocker namespace", () => {
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

  it.each(ENDPOINTS)("footlocker.%s posts its body to %s", async (method, args, path) => {
    await (client.footlocker as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals", "releases"] as const)("footlocker.%s options are optional", async (method) => {
    await client.footlocker[method]();
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev/api/v1/footlocker/${method}`);
    expect(body()).toEqual({});
  });

  it("has all 10 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.footlocker)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(
      [
        "search",
        "product",
        "category",
        "brand",
        "deals",
        "releases",
        "stores",
        "storeAvailability",
        "reviews",
        "questions",
      ].sort(),
    );
  });

  it("FOOTLOCKER_TIMEOUT is 120 s, FOOTLOCKER_REVIEWS_TIMEOUT 240 s", () => {
    expect(FOOTLOCKER_TIMEOUT).toBe(120_000);
    expect(FOOTLOCKER_REVIEWS_TIMEOUT).toBe(240_000);
  });

  it.each([
    ["search", { query: "nike dunk" }],
    ["product", { product_id: "Q5495005" }],
    ["category", { path: "/category/mens/shoes.html" }],
    ["brand", { brand: "Nike" }],
    ["deals", undefined],
    ["releases", undefined],
    ["stores", { zip: "10001" }],
    ["storeAvailability", { product_id: "W2288111", zip: "10001" }],
  ] as const)("footlocker.%s raises the request timeout, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => (c.footlocker as unknown as Ns)[method]!(args as Record<string, unknown> | undefined);

    await call(client);
    expect(delays()).toContain(FOOTLOCKER_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(FOOTLOCKER_TIMEOUT);
  });

  it.each([
    ["reviews", { product_id: "Q5495005" }],
    ["questions", { product_id: "Q5495005" }],
  ] as const)("footlocker.%s raises the request timeout to 240 s, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => (c.footlocker as unknown as Ns)[method]!(args);

    await call(client);
    expect(delays()).toContain(FOOTLOCKER_REVIEWS_TIMEOUT);
    expect(delays()).not.toContain(FOOTLOCKER_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(FOOTLOCKER_REVIEWS_TIMEOUT);
  });
});
