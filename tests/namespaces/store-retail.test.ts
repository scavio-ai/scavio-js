import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

type Row = [ns: string, method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["lowes", "search", { query: "cordless drill", store_id: "0595", zip: "28117", on_sale: true }, "/api/v1/lowes/search"],
  ["lowes", "product", { item_id: "5016412045", store_id: "0595", zip: "28117" }, "/api/v1/lowes/product"],
  ["lowes", "stores", { zip: "28117", limit: 3 }, "/api/v1/lowes/stores"],
  ["lowes", "reviews", { item_id: "5016412045", sort: "most_helpful" }, "/api/v1/lowes/reviews"],
  ["samsClub", "search", { query: "paper towels", sort: "price_low" }, "/api/v1/samsclub/search"],
  ["samsClub", "product", { item_id: "15325822107", club_id: "6372" }, "/api/v1/samsclub/product"],
  ["samsClub", "clubs", { zip: "75201", limit: 5 }, "/api/v1/samsclub/clubs"],
  ["samsClub", "savings", { page: 2, sort: "top_selling" }, "/api/v1/samsclub/savings"],
  ["samsClub", "category", { category_id: "1150109" }, "/api/v1/samsclub/category"],
  ["samsClub", "reviews", { item_id: "15325822107", sort: "lowest" }, "/api/v1/samsclub/reviews"],
  ["canadianTire", "search", { query: "dewalt drill", store_id: "600", in_stock_only: true }, "/api/v1/canadiantire/search"],
  ["canadianTire", "product", { product_code: "0547273P", store_id: "600" }, "/api/v1/canadiantire/product"],
  ["canadianTire", "stores", { postal_code: "M5V 2T6", sku: "0438858" }, "/api/v1/canadiantire/stores"],
  ["canadianTire", "availability", { store_id: "600", skus: ["0438858", "0547273"] }, "/api/v1/canadiantire/availability"],
  ["canadianTire", "clearance", { store_id: "600", page: 2 }, "/api/v1/canadiantire/clearance"],
  ["canadianTire", "deals", { store_id: "600", type: "sale" }, "/api/v1/canadiantire/deals"],
  ["dollarGeneral", "search", { query: "paper towels", store_id: "12629", in_stock_only: true }, "/api/v1/dollargeneral/search"],
  ["dollarGeneral", "product", { upc: "030772156629", store_id: "12629" }, "/api/v1/dollargeneral/product"],
  ["dollarGeneral", "stores", { zip: "75203", upc: "030772156629" }, "/api/v1/dollargeneral/stores"],
  ["dollarGeneral", "deals", { store_id: "12629", type: "clearance" }, "/api/v1/dollargeneral/deals"],
  ["dollarGeneral", "coupons", { page: 2 }, "/api/v1/dollargeneral/coupons"],
];

describe("store-level retail namespaces", () => {
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

  it("samsClub.savings and dollarGeneral.coupons work with no options", async () => {
    await client.samsClub.savings();
    await client.dollarGeneral.coupons();
    const calls = vi.mocked(fetch).mock.calls;
    expect(calls[0]![0]).toBe("https://api.scavio.dev/api/v1/samsclub/savings");
    expect(calls[1]![0]).toBe("https://api.scavio.dev/api/v1/dollargeneral/coupons");
  });
});
