import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ACTION_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/action/";
const ENDPOINTS: Row[] = [
  ["search", { query: "kerst" }, B + "search"],
  ["search", { query: "weihnachten", country: "de", sort: "price_asc", page: 2, price_range: "2-5", new_only: true }, B + "search"],
  ["product", { product_code: "3225277" }, B + "product"],
  ["product", { product_code: 3225277, country: "ch", language: "fr" }, B + "product"],
  ["product", { url: "https://www.action.com/nl-nl/p/3225277/dennenslinger-met-led/" }, B + "product"],
  ["products", { product_codes: ["3225277", "3011615", "3225488"], country: "pl" }, B + "products"],
  ["category", { category: "wonen/woonaccessoires", brand_filter: "Disney" }, B + "category"],
  ["categories", { country: "ro", depth: 2 }, B + "categories"],
  ["brand", { brand: "max-more", sort: "newest" }, B + "brand"],
  ["brands", { query: "max" }, B + "brands"],
  ["newArrivals", { country: "de" }, B + "new-arrivals"],
  ["weeklyDeals", { country: "be", language: "fr", page: 2 }, B + "weekly-deals"],
  ["collection", { collection: "black-friday" }, B + "collection"],
  ["suggestions", { query: "opberg" }, B + "suggestions"],
  ["stores", { query: "Amsterdam" }, B + "stores"],
  ["stores", { lat: 52.37, lng: 4.89, country: "nl" }, B + "stores"],
  ["store", { store: "/nl-nl/winkels/amsterdam-kinkerstraat/" }, B + "store"],
  ["store", { store_id: "1260" }, B + "store"],
  ["reviews", { product_code: "3224838", scope: "all", sort: "newest" }, B + "reviews"],
  ["reviews", { product_code: "3224838", country: "de", rating: [1, 2], query: "kapot", limit: 100, offset: 20 }, B + "reviews"],
  ["webshopSearch", { query: "stofzuiger" }, B + "webshop-search"],
  ["webshopSearch", { category: "alle-tijdelijke-deals", country: "be", language: "fr", page: 2 }, B + "webshop-search"],
  ["webshopProduct", { ean: "8718969571098" }, B + "webshop-product"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("action namespace", () => {
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

  it.each(ENDPOINTS)("action.%s posts its body to %s", async (method, args, path) => {
    await (client.action as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each([
    ["categories", "categories"],
    ["brands", "brands"],
    ["newArrivals", "new-arrivals"],
    ["weeklyDeals", "weekly-deals"],
  ])("%s() works with no options", async (method, path) => {
    await (client.action as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}${path}`);
    expect(body()).toEqual({});
  });

  it("has all 16 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.action)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brand", "brands", "categories", "category", "collection", "newArrivals", "product", "products", "reviews",
      "search", "store", "stores", "suggestions", "webshopProduct", "webshopSearch", "weeklyDeals",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(ACTION_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "action.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.action as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(ACTION_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(ACTION_TIMEOUT);
    },
  );
});
