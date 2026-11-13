import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, PUBLIX_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const CAT_ID = "6772da29-55bf-4051-83d5-104d73ae9a96";

const ENDPOINTS: Row[] = [
  [
    "search",
    { query: "chicken", store_id: "1614", sort: "savings_amount", on_sale: true, page: 2 },
    "/api/v1/publix/search",
  ],
  ["search", { query: "chicken", store_id: 1453, bogo: true, brand: "Tyson" }, "/api/v1/publix/search"],
  ["product", { item_code: "90355", store_id: 1825 }, "/api/v1/publix/product"],
  ["category", { store_id: "1825", category_id: CAT_ID, sort: "name_asc" }, "/api/v1/publix/category"],
  [
    "category",
    { store_id: 1614, category_url: `https://www.publix.com/c/chicken/${CAT_ID}` },
    "/api/v1/publix/category",
  ],
  ["categories", { store_id: "1453", parent_id: CAT_ID }, "/api/v1/publix/categories"],
  [
    "weeklyAd",
    { store_id: "1614", department: "Produce", bogo_only: true, query: "apple" },
    "/api/v1/publix/weekly-ad",
  ],
  ["extraSavings", { store_id: 1614 }, "/api/v1/publix/extra-savings"],
  ["coupons", { store_id: "1453" }, "/api/v1/publix/coupons"],
  ["savingsSearch", { query: "coffee", store_id: "1614" }, "/api/v1/publix/savings-search"],
  ["orderAhead", { store_id: "1825", section: "all", page: 2 }, "/api/v1/publix/order-ahead"],
  ["stores", { zip: "33101", limit: 5, radius_miles: 100 }, "/api/v1/publix/stores"],
  ["stores", { city: "Nashville", state: "TN" }, "/api/v1/publix/stores"],
  ["stores", { store_id: 1825 }, "/api/v1/publix/stores"],
  ["suggestions", { query: "chick", store_id: "1614" }, "/api/v1/publix/suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("publix namespace", () => {
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

  it.each(ENDPOINTS)("publix.%s posts its body to %s", async (method, args, path) => {
    await (client.publix as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("categories() works with no options", async () => {
    await client.publix.categories();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/publix/categories");
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.publix)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(
      [
        "search",
        "product",
        "category",
        "categories",
        "weeklyAd",
        "extraSavings",
        "coupons",
        "savingsSearch",
        "orderAhead",
        "stores",
        "suggestions",
      ].sort(),
    );
  });

  it("PUBLIX_TIMEOUT is 120 s", () => {
    expect(PUBLIX_TIMEOUT).toBe(120_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "publix.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.publix as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(PUBLIX_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(PUBLIX_TIMEOUT);
    },
  );
});
