import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, IKEA_TIMEOUT, IKEA_PRODUCT_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  [
    "search",
    { query: "kallax", country: "de", language: "en", sort: "price_asc", page: 2, color: "10156" },
    "/api/v1/ikea/search",
  ],
  ["search", { query: "billy", country: "es_islands", island: "tenerife" }, "/api/v1/ikea/search"],
  [
    "search",
    { query: "sofa", store_id: "399", availability: "in_store", filters: { "f-materials": ["47350"] } },
    "/api/v1/ikea/search",
  ],
  ["product", { item_no: "80275887", country: "fr" }, "/api/v1/ikea/product"],
  ["product", { url: "https://www.ikea.com/de/de/p/kallax-regal-weiss-80275887/" }, "/api/v1/ikea/product"],
  ["reviews", { item_no: 80275887, country: "de" }, "/api/v1/ikea/reviews"],
  ["category", { category_id: "10382", new_only: true }, "/api/v1/ikea/category"],
  ["categories", { country: "ca", language: "fr", parent_id: "fu003" }, "/api/v1/ikea/categories"],
  ["deals", { type: "new_lower_price", country: "gb", page_size: 48 }, "/api/v1/ikea/deals"],
  ["suggestions", { query: "sof" }, "/api/v1/ikea/suggestions"],
  ["stores", { country: "se", lat: 59.33, lng: 18.06, limit: 5 }, "/api/v1/ikea/stores"],
  ["stock", { item_nos: ["20522046", "20631663"], store_id: "399", zip: "91502" }, "/api/v1/ikea/stock"],
  ["items", { item_nos: "80275887,00263850", country: "de" }, "/api/v1/ikea/items"],
  ["compare", { item_no: "80275887", countries: ["de", "fr", "se"] }, "/api/v1/ikea/compare"],
  ["asIs", { store_id: 257, page: 2, page_size: 48 }, "/api/v1/ikea/as-is"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

const SLOW = new Set(["product", "reviews"]);

describe("ikea namespace", () => {
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

  it.each(ENDPOINTS)("ikea.%s posts its body to %s", async (method, args, path) => {
    await (client.ikea as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("categories() and stores() work with no options", async () => {
    await client.ikea.categories();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/ikea/categories");
    expect(body()).toEqual({});
    vi.mocked(fetch).mockClear();
    await client.ikea.stores();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/ikea/stores");
    expect(body()).toEqual({});
  });

  it("has all 12 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.ikea)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(
      [
        "search",
        "product",
        "reviews",
        "category",
        "categories",
        "deals",
        "suggestions",
        "stores",
        "stock",
        "items",
        "compare",
        "asIs",
      ].sort(),
    );
  });

  it("timeouts: 120 s, product and reviews 180 s", () => {
    expect(IKEA_TIMEOUT).toBe(120_000);
    expect(IKEA_PRODUCT_TIMEOUT).toBe(180_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "ikea.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const floor = SLOW.has(method) ? IKEA_PRODUCT_TIMEOUT : IKEA_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.ikea as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(floor);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(floor);
    },
  );
});
