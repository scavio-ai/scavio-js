import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, PETCO_SLOW_TIMEOUT, MENARDS_PRODUCT_TIMEOUT, IHERB_SLOW_TIMEOUT } from "../../src/index.js";

type Row = [ns: string, method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["wholeFoods", "search", { query: "milk", store_id: "10160", sort: "price_asc", on_sale: true, limit: 30 }, "/api/v1/wholefoods/search"],
  ["wholeFoods", "category", { category: "cheese", store_id: "10160", sort: "popular", diet: "organic" }, "/api/v1/wholefoods/category"],
  ["wholeFoods", "deals", { category: "all-products", store_id: "10160", offset: 60 }, "/api/v1/wholefoods/deals"],
  ["wholeFoods", "product", { asin: "B078WVT2BC", store_id: "10160" }, "/api/v1/wholefoods/product"],
  ["wholeFoods", "stores", { zip: "10019" }, "/api/v1/wholefoods/stores"],
  ["wholeFoods", "store", { store_id: "10160" }, "/api/v1/wholefoods/store"],
  ["wholeFoods", "salesFlyer", { store_id: "10160" }, "/api/v1/wholefoods/sales-flyer"],
  ["harborFreight", "search", { query: "cordless drill", brand: "BAUER", sort: "member_price_low", page_size: 48 }, "/api/v1/harborfreight/search"],
  ["harborFreight", "clearance", { query: "drill", page: 2 }, "/api/v1/harborfreight/clearance"],
  ["harborFreight", "product", { sku: "73216" }, "/api/v1/harborfreight/product"],
  ["harborFreight", "prices", { skus: ["73216", "59716", "64508"] }, "/api/v1/harborfreight/prices"],
  ["harborFreight", "stores", { query: "60601", radius: 25, limit: 5 }, "/api/v1/harborfreight/stores"],
  ["harborFreight", "availability", { skus: ["73216"], zip: "90012", limit: 5 }, "/api/v1/harborfreight/availability"],
  ["harborFreight", "reviews", { sku: "73216", limit: 5, offset: 5 }, "/api/v1/harborfreight/reviews"],
  ["petsmart", "search", { query: "dog food", store_id: "1658", sort: "best_sellers", limit: 10 }, "/api/v1/petsmart/search"],
  ["petsmart", "product", { web_style_id: "36648" }, "/api/v1/petsmart/product"],
  ["petsmart", "stores", { zip: "60601", sku: "5252900" }, "/api/v1/petsmart/stores"],
  ["petsmart", "storeStock", { store_id: "1658", skus: ["5154856", "5154855"] }, "/api/v1/petsmart/store-stock"],
  ["petsmart", "availability", { pairs: [{ store_id: "1658", sku: "5252900" }, { store_id: "2528", sku: "5252900" }] }, "/api/v1/petsmart/availability"],
  ["petsmart", "deals", { pet: "dog", limit: 20 }, "/api/v1/petsmart/deals"],
  ["petco", "search", { query: "dog food", sort: "price", sort_order: "desc" }, "/api/v1/petco/search"],
  ["petco", "category", { path: "dog/dog-food/dry-dog-food", page: 2 }, "/api/v1/petco/category"],
  ["petco", "product", { part_number: "3748364" }, "/api/v1/petco/product"],
  ["petco", "stores", { zip: "10001", limit: 5 }, "/api/v1/petco/stores"],
  ["petco", "storeInventory", { cat_entry_ids: ["6131012", "531503"], store_id: "13275" }, "/api/v1/petco/store-inventory"],
  ["iherb", "search", { query: "vitamin d", sort: "best_selling", brand_code: "CGN" }, "/api/v1/iherb/search"],
  ["iherb", "product", { product_id: "70316" }, "/api/v1/iherb/product"],
  ["iherb", "prices", { product_ids: ["62118", 70316, "77548"] }, "/api/v1/iherb/prices"],
  ["iherb", "reviews", { product_id: 70316 }, "/api/v1/iherb/reviews"],
  ["chewy", "search", { query: "kong classic dog toy", sort: "rating", page: 2 }, "/api/v1/chewy/search"],
  ["chewy", "product", { product_id: "38485" }, "/api/v1/chewy/product"],
  ["menards", "product", { item_id: "60893666613", store_id: "3181" }, "/api/v1/menards/product"],
  ["menards", "stores", { city: "Madison", state: "WI" }, "/api/v1/menards/stores"],
];

describe("US retail batch 2 namespaces", () => {
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

  it.each(ENDPOINTS)("%s.%s posts its body to %s", async (ns, method, args, path) => {
    const target = (client as unknown as Record<string, Record<string, (opts: Record<string, unknown>) => Promise<unknown>>>)[ns]!;
    await target[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each([
    ["wholeFoods", "deals", "/api/v1/wholefoods/deals"],
    ["harborFreight", "clearance", "/api/v1/harborfreight/clearance"],
    ["petsmart", "deals", "/api/v1/petsmart/deals"],
  ])("%s.%s works with no options", async (ns, method, path) => {
    const target = (client as unknown as Record<string, Record<string, () => Promise<unknown>>>)[ns]!;
    await target[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${path}`);
    expect(body()).toEqual({});
  });

  it.each([
    ["petco", "product", { part_number: "3748364" }, PETCO_SLOW_TIMEOUT],
    ["petco", "category", { path: "dog/dog-food/dry-dog-food" }, PETCO_SLOW_TIMEOUT],
    ["petco", "search", { query: "dog food" }, PETCO_SLOW_TIMEOUT],
    ["petco", "storeInventory", { cat_entry_ids: ["6131012"], store_id: "12168" }, PETCO_SLOW_TIMEOUT],
    ["iherb", "search", { query: "vitamin d" }, IHERB_SLOW_TIMEOUT],
    ["iherb", "product", { product_id: "62118" }, IHERB_SLOW_TIMEOUT],
    ["menards", "product", { item_id: "60893666613", store_id: "3181" }, MENARDS_PRODUCT_TIMEOUT],
  ] as const)("%s.%s raises the request timeout, never lowers it", async (ns, method, args, floor) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) =>
      (c as unknown as Record<string, Record<string, (opts: Record<string, unknown>) => Promise<unknown>>>)[ns]![method]!(args);

    await call(client);
    expect(delays()).toContain(floor);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(floor);
  });

  it("chewy.search, iherb.prices and menards.stores keep the default timeout", async () => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);

    await client.chewy.search({ query: "kong classic dog toy" });
    await client.iherb.prices({ product_ids: ["62118"] });
    await client.menards.stores({ zip: "55401" });
    expect(delays()).toContain(30_000);
    expect(delays()).not.toContain(PETCO_SLOW_TIMEOUT);
    expect(delays()).not.toContain(IHERB_SLOW_TIMEOUT);
    expect(delays()).not.toContain(MENARDS_PRODUCT_TIMEOUT);
  });
});
