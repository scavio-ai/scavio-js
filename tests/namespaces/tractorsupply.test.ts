import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, TRACTORSUPPLY_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/tractorsupply/";
const ENDPOINTS: Row[] = [
  ["search", { query: "layer pellets", store: "1933" }, B + "search"],
  ["search", { query: "dog food", zip: "59330", page: 2, page_size: 48, sort: "price_asc", brand: "Purina", on_sale: true, pickup: true, rating: 4, filters: ["2bb%3A%2250%20lb%22"] }, B + "search"],
  ["product", { item_number: "2340147", store: "1933" }, B + "product"],
  ["product", { url: "https://www.tractorsupply.com/tsc/product/x-2340147", zip: "59330" }, B + "product"],
  ["storePrices", { item_number: "2340147", stores: ["1933", "1923"] }, B + "store-prices"],
  ["storePrices", { item_number: "2340147", zip: "59301", limit: 10 }, B + "store-prices"],
  ["storeStock", { item_number: "2340147", store: "1933" }, B + "store-stock"],
  ["storeStock", { item_number: "2340147", zip: "59301" }, B + "store-stock"],
  ["fulfillment", { item_number: "2340147", store: "1933", zip: "59330", quantity: 2 }, B + "fulfillment"],
  ["stores", { zip: "59301", limit: 3 }, B + "stores"],
  ["store", { store: "1933" }, B + "store"],
  ["category", { category: "/tsc/catalog/poultry-feed", store: "1933", sort: "new_arrivals" }, B + "category"],
  ["categories", { parent_id: "1004851" }, B + "categories"],
  ["brand", { brand: "Producer's Pride", store: "1933", query: "feed" }, B + "brand"],
  ["deals", { store: "1933" }, B + "deals"],
  ["deals", { type: "new", zip: "59330", query: "boots" }, B + "deals"],
  ["promotions", { item_number: "3609112" }, B + "promotions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("tractorsupply namespace", () => {
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

  it.each(ENDPOINTS)("tractorsupply.%s posts its body to %s", async (method, args, path) => {
    await (client.tractorsupply as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("categories() works with no options", async () => {
    await client.tractorsupply.categories();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}categories`);
    expect(body()).toEqual({});
  });

  it("has all 12 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.tractorsupply)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brand", "categories", "category", "deals", "fulfillment", "product", "promotions", "search",
      "store", "storePrices", "storeStock", "stores",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(TRACTORSUPPLY_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "tractorsupply.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.tractorsupply as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(TRACTORSUPPLY_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(TRACTORSUPPLY_TIMEOUT);
    },
  );
});
