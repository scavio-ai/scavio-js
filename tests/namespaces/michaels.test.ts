import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, MICHAELS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/michaels/";
const ENDPOINTS: Row[] = [
  ["search", { q: "yarn" }, B + "search"],
  ["search", { q: "laine", country: "ca", language: "fr", page: 2, page_size: 24, sort: "price_asc", brand: "Bernat", on_sale: true, min_price: 5, filters: { material: ["Acrylic"] } }, B + "search"],
  ["product", { sku: "10228177" }, B + "product"],
  ["product", { url: "https://canada.michaels.com/en/product/x-10816737", country: "ca" }, B + "product"],
  ["storeStock", { sku: "10228177", zip: "10001", radius: 10 }, B + "store-stock"],
  ["storeStock", { sku: "10519836", zip: "M5V 2T6", country: "ca" }, B + "store-stock"],
  ["storeInventory", { store: "1191", skus: ["10228177", "10816737"] }, B + "store-inventory"],
  ["stores", { zip: "60657" }, B + "stores"],
  ["stores", { city: "San Francisco, CA", radius: 30 }, B + "stores"],
  ["store", { store: "4936", country: "ca" }, B + "store"],
  ["category", { category: "/shop/art-supplies/artist-canvas", sort: "best_sellers" }, B + "category"],
  ["category", { category: "root//Categories//809187838", q: "acrylic", country: "ca" }, B + "category"],
  ["categories", { path: "/shop/art-supplies" }, B + "categories"],
  ["brand", { brand: "Cricut", q: "explore" }, B + "brand"],
  ["deals", { q: "christmas" }, B + "deals"],
  ["deals", { type: "clearance", category: "root//Categories//809187838", country: "ca" }, B + "deals"],
  ["suggestions", { q: "yarn" }, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("michaels namespace", () => {
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

  it.each(ENDPOINTS)("michaels.%s posts its body to %s", async (method, args, path) => {
    await (client.michaels as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("categories() works with no options", async () => {
    await client.michaels.categories();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}categories`);
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.michaels)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brand", "categories", "category", "deals", "product", "search", "store", "storeInventory",
      "storeStock", "stores", "suggestions",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(MICHAELS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "michaels.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.michaels as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(MICHAELS_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(MICHAELS_TIMEOUT);
    },
  );
});
