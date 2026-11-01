import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, CVS_PRODUCT_TIMEOUT } from "../../src/index.js";

type Row = [ns: string, method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["sephora", "search", { query: "lipstick", sort: "best_selling", zip: "10001" }, "/api/v1/sephora/search"],
  ["sephora", "category", { category: "lipstick", page: 2 }, "/api/v1/sephora/category"],
  ["sephora", "product", { product_id: "P510799" }, "/api/v1/sephora/product"],
  ["ulta", "search", { query: "lipstick", page: 2 }, "/api/v1/ulta/search"],
  ["ulta", "category", { category: "/shop/makeup/lips/lipstick" }, "/api/v1/ulta/category"],
  ["ulta", "product", { url: "https://www.ulta.com/p/serum-lipstick-pimprod2057119", sku: "2648428" }, "/api/v1/ulta/product"],
  ["ulta", "stores", { product_id: "pimprod2057119", sku_id: "2648428", zip: "10001" }, "/api/v1/ulta/stores"],
  ["aldi", "search", { query: "milk", store_id: "151248", service_type: "pickup", sort: "price_low", limit: 60 }, "/api/v1/aldi/search"],
  ["aldi", "product", { product_id: "16902710", zip: "33131", service_type: "delivery" }, "/api/v1/aldi/product"],
  ["aldi", "stores", { zip: "33131", limit: 5 }, "/api/v1/aldi/stores"],
  ["microCenter", "search", { query: "rtx 5070", store_id: "131", per_page: 48, sort: "price_low" }, "/api/v1/microcenter/search"],
  ["microCenter", "product", { product_id: "691231", store_id: "131" }, "/api/v1/microcenter/product"],
  ["microCenter", "stores", { state: "TX" }, "/api/v1/microcenter/stores"],
  ["walgreens", "search", { query: "shampoo", sort: "top_sellers", store_id: "15350" }, "/api/v1/walgreens/search"],
  ["walgreens", "product", { product_id: "300452904" }, "/api/v1/walgreens/product"],
  ["walgreens", "stores", { zip: "60614", radius: 10, limit: 25 }, "/api/v1/walgreens/stores"],
  ["walgreens", "stock", { product_id: "300452904", store_ids: ["15350", "9438"] }, "/api/v1/walgreens/stock"],
  ["cvs", "search", { query: "toothpaste", store_id: "7019", limit: 48 }, "/api/v1/cvs/search"],
  ["cvs", "product", { product_id: "832677" }, "/api/v1/cvs/product"],
  ["cvs", "stock", { sku_ids: ["832677", "789787"], store_id: "7019" }, "/api/v1/cvs/stock"],
];

describe("US retail namespaces", () => {
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

  it("microCenter.stores works with no options", async () => {
    await client.microCenter.stores();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/microcenter/stores");
    expect(body()).toEqual({});
  });

  it("cvs.product raises the request timeout, never lowers it, and cvs.search keeps the default", async () => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);

    await client.cvs.product({ product_id: "832677" });
    expect(delays()).toContain(CVS_PRODUCT_TIMEOUT);

    spy.mockClear();
    await new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }).cvs.product({ product_id: "832677" });
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(CVS_PRODUCT_TIMEOUT);

    spy.mockClear();
    await client.cvs.search({ query: "toothpaste" });
    expect(delays()).toContain(30_000);
    expect(delays()).not.toContain(CVS_PRODUCT_TIMEOUT);
  });
});
