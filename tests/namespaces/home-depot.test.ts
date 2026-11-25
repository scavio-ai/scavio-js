import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/homedepot/";
const ENDPOINTS: Row[] = [
  // US calls: no country, bodies exactly as before Home Depot Canada.
  ["search", { query: "cordless drill", page: 2, sort_by: "top_sellers" }, B + "search"],
  ["product", { item_id: "325479354" }, B + "product"],
  ["reviews", { item_id: "325479354", page: 3 }, B + "reviews"],
  // Home Depot Canada on the shared endpoints.
  [
    "search",
    {
      query: "cordless drill",
      country: "ca",
      store_id: "7080",
      page_size: 40,
      filters: [{ facet: "manufacturerName", value: "9wh" }],
      deals: ["special_buy", "savings"],
      include_facets: true,
      language: "fr",
    },
    B + "search",
  ],
  ["search", { country: "ca", deals: "new_lower_price" }, B + "search"],
  ["search", { country: "ca", category_id: "l4-drill-drivers", sort_by: "price_low" }, B + "search"],
  ["product", { item_id: "1000112108", country: "ca", store_id: 7128 }, B + "product"],
  ["reviews", { item_id: "1001769719", country: "ca", language: "fr" }, B + "reviews"],
  ["stores", { query: "98101", limit: 5 }, B + "stores"],
  ["stores", { country: "ca", latitude: 45.5, longitude: -73.6 }, B + "stores"],
  ["availability", { item_id: "325479354", store_id: "4702", zip: "98101" }, B + "availability"],
  ["availability", { item_id: "1001769719", store_id: "7076", country: "ca" }, B + "availability"],
  ["shipping", { item_id: "325479354", zip: "98101", quantity: 2 }, B + "shipping"],
  // Canada-only endpoints.
  ["category", { category_id: "661103", store_id: "7128", sort_by: "price_low" }, B + "category"],
  ["categories", { depth: 2 }, B + "categories"],
  ["stock", { item_id: "1001769719", location: "H3B 1A1", limit: 15 }, B + "stock"],
  ["store", { store_id: "7076" }, B + "store"],
  ["suggestions", { query: "christ", language: "en" }, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("homeDepot namespace", () => {
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

  it.each(ENDPOINTS)("homeDepot.%s posts its body to %s", async (method, args, path) => {
    await (client.homeDepot as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("US search sends no country", async () => {
    await client.homeDepot.search({ query: "cordless drill" });
    expect(body()).toEqual({ query: "cordless drill" });
  });

  it("categories() works with no options", async () => {
    await client.homeDepot.categories();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}categories`);
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.homeDepot)).filter(
      (m) => m !== "constructor",
    );
    expect(methods.sort()).toEqual([
      "availability",
      "categories",
      "category",
      "product",
      "reviews",
      "search",
      "shipping",
      "stock",
      "store",
      "stores",
      "suggestions",
    ]);
  });
});
