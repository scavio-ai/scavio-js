import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, BEST_BUY_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "tv" }, "/api/v1/bestbuy/search"],
  [
    "search",
    {
      query: "tv",
      page: 2,
      sort: "best_selling",
      filters: { brand: "Samsung", on_sale: true, min_price: 300, max_price: 500 },
      include_sponsored: true,
    },
    "/api/v1/bestbuy/search",
  ],
  ["product", { sku: "6607832" }, "/api/v1/bestbuy/product"],
  [
    "product",
    { url: "https://www.bestbuy.com/site/insignia-55-class-f50-series-led-4k-uhd-smart-fire-tv/6607832.p?skuId=6607832" },
    "/api/v1/bestbuy/product",
  ],
  ["reviews", { sku: "6607832", page: 2, sort: "newest", rating: 1 }, "/api/v1/bestbuy/reviews"],
  ["category", { category_id: "abcat0101001", sort: "price_low" }, "/api/v1/bestbuy/category"],
  ["category", { category_id: "pcmcat1674241939957", filters: { open_box: true } }, "/api/v1/bestbuy/category"],
  ["stores", { zip: "94103" }, "/api/v1/bestbuy/stores"],
  ["availability", { sku: "6607832", zip: "94103", max_stores: 3 }, "/api/v1/bestbuy/availability"],
  ["availability", { sku: "6607832", store_ids: ["187", "873"] }, "/api/v1/bestbuy/availability"],
  ["suggestions", { query: "ps5 con" }, "/api/v1/bestbuy/suggestions"],
  ["prices", { skus: ["6607832", "6673112", "6679316"] }, "/api/v1/bestbuy/prices"],
  ["prices", { skus: "6607832,6673112" }, "/api/v1/bestbuy/prices"],
  // Best Buy Canada: country "ca" and its fields pass through verbatim.
  [
    "search",
    { query: "4k tv", country: "ca", page_size: 48, sort: "price_low", province: "QC", language: "fr", filters: { sold_by: "best_buy", rating: 4 } },
    "/api/v1/bestbuy/search",
  ],
  ["product", { sku: "19791103", country: "ca", province: "BC" }, "/api/v1/bestbuy/product"],
  ["reviews", { sku: "19296507", country: "ca", page_size: 50, verified_only: true, with_photos: true }, "/api/v1/bestbuy/reviews"],
  ["category", { category_id: "21344", country: "ca", sort: "best_match" }, "/api/v1/bestbuy/category"],
  ["deals", { country: "ca", collection: "black_friday" }, "/api/v1/bestbuy/deals"],
  ["deals", { country: "ca", collection: "clearance", page: 2, page_size: 48, sort: "price_low" }, "/api/v1/bestbuy/deals"],
  ["stores", { country: "ca", postal_code: "M5V 3L9", radius_km: 10, limit: 5 }, "/api/v1/bestbuy/stores"],
  ["stores", { country: "ca", city: "Winnipeg" }, "/api/v1/bestbuy/stores"],
  ["availability", { skus: ["19791103", "19296507"], country: "ca", postal_code: "H3B 4W8", max_stores: 5 }, "/api/v1/bestbuy/availability"],
  ["availability", { sku: "19791103", country: "ca", store_ids: ["651", "705"] }, "/api/v1/bestbuy/availability"],
  ["suggestions", { query: "nintendo sw", country: "ca", language: "en" }, "/api/v1/bestbuy/suggestions"],
  ["prices", { skus: ["19791103", "19296507"], country: "ca", province: "ON" }, "/api/v1/bestbuy/prices"],
  ["questions", { sku: "19296507" }, "/api/v1/bestbuy/questions"],
  ["questions", { sku: "19296507", sort: "newest", page: 2, page_size: 20, language: "fr" }, "/api/v1/bestbuy/questions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("bestBuy namespace", () => {
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

  it.each(ENDPOINTS)("bestBuy.%s posts its body to %s", async (method, args, path) => {
    await (client.bestBuy as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("bestBuy.deals takes no options and posts an empty body", async () => {
    await client.bestBuy.deals();
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe("https://api.scavio.dev/api/v1/bestbuy/deals");
    expect(body()).toEqual({});
  });

  it("BEST_BUY_TIMEOUT is 120 s", () => {
    expect(BEST_BUY_TIMEOUT).toBe(120_000);
  });

  it.each([
    ["search", { query: "tv" }],
    ["product", { sku: "6607832" }],
    ["reviews", { sku: "6607832" }],
    ["category", { category_id: "abcat0101001" }],
    ["deals", undefined],
    ["stores", { zip: "94103" }],
    ["availability", { sku: "6607832", zip: "94103" }],
    ["suggestions", { query: "ps5 con" }],
    ["prices", { skus: ["6607832"] }],
    ["questions", { sku: "19296507" }],
  ] as const)("bestBuy.%s raises the request timeout, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => (c.bestBuy as unknown as Ns)[method]!(args as Record<string, unknown> | undefined);

    await call(client);
    expect(delays()).toContain(BEST_BUY_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(BEST_BUY_TIMEOUT);
  });
});
