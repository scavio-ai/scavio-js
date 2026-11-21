import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ARGOS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "air fryer" }, "/api/v1/argos/search"],
  [
    "search",
    {
      query: "air fryer",
      category: "29575",
      offers: ["clearance", "black_friday"],
      brand: ["ninja", "tower"],
      seller: "argos",
      new_in: true,
      colour: "blacks",
      price_min: 40,
      price_max: 150,
      rating_min: 4,
      filters: { capacity: "5l - 6.9l" },
      sort: "price_low",
      page: 2,
    },
    "/api/v1/argos/search",
  ],
  ["product", { product_id: "8377058" }, "/api/v1/argos/product"],
  ["product", { url: "https://www.argos.co.uk/product/8377058/" }, "/api/v1/argos/product"],
  ["storeStock", { product_ids: ["8377058", "7163184"], postcode: "SW1A 1AA" }, "/api/v1/argos/store-stock"],
  [
    "storeStock",
    { product_ids: "8377058,7163184", postcode: "SW1A 1AA", delivery_postcode: "M1 1AE", max_distance: 20, max_results: 5 },
    "/api/v1/argos/store-stock",
  ],
  ["stores", { postcode: "M1 1AE" }, "/api/v1/argos/stores"],
  ["stores", { store: "661-manchester-arndale-argos" }, "/api/v1/argos/stores"],
  ["reviews", { product_id: "7163184", sort: "most_helpful", rating: [1, 2], page: 2, limit: 100 }, "/api/v1/argos/reviews"],
  ["questions", { product_id: "8377058", sort: "oldest", limit: 50 }, "/api/v1/argos/questions"],
  ["categories", {}, "/api/v1/argos/categories"],
  ["category", { category_id: "29560", sort: "rating" }, "/api/v1/argos/category"],
  ["deals", { collection: "black_friday", query: "lego", page: 3 }, "/api/v1/argos/deals"],
  ["deals", { collection: "top_100", page: 2 }, "/api/v1/argos/deals"],
  ["suggestions", { query: "lego", limit: 5 }, "/api/v1/argos/suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("argos namespace", () => {
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

  it.each(ENDPOINTS)("argos.%s posts its body to %s", async (method, args, path) => {
    await (client.argos as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("categories() works with no options", async () => {
    await client.argos.categories();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/argos/categories");
    expect(body()).toEqual({});
  });

  it("has all 10 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.argos)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "categories", "category", "deals", "product", "questions", "reviews", "search", "storeStock", "stores", "suggestions",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(ARGOS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "argos.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.argos as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(ARGOS_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(ARGOS_TIMEOUT);
    },
  );
});
