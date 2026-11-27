import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ABERCROMBIE_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/abercrombie/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "baggy jeans"}, B + "search"],
  ["search", {"query": "baggy jeans", "brand": "anf", "storefront": "us", "country": "DE", "facets": ["colorFamily:Black"]}, B + "search"],
  ["product", {"product_id": "59359439"}, B + "product"],
  ["product", {"product_id": "59359439", "brand": "anf", "storefront": "us", "country": "DE", "collection_id": "607722"}, B + "product"],
  ["storeStock", {"skus": ["662258406"], "zip": "10001"}, B + "store-stock"],
  ["storeStock", {"skus": ["662258406"], "zip": "10001", "brand": "anf", "country": "US", "radius": 50}, B + "store-stock"],
  ["stores", {"zip": "10001"}, B + "stores"],
  ["stores", {"zip": "10001", "brand": "anf", "country": "US", "radius": 50}, B + "stores"],
  ["store", {"store_number": "11958"}, B + "store"],
  ["store", {"store_number": "11958", "brand": "anf", "country": "US"}, B + "store"],
  ["category", {"category_id": "12236"}, B + "category"],
  ["category", {"category_id": "12236", "brand": "anf", "storefront": "us", "country": "DE", "facets": ["colorFamily:Black"]}, B + "category"],
  ["categories", {}, B + "categories"],
  ["categories", {"brand": "anf", "storefront": "us", "country": "DE"}, B + "categories"],
  ["promotions", {}, B + "promotions"],
  ["promotions", {"brand": "anf", "storefront": "us", "country": "DE"}, B + "promotions"],
  ["reviews", {"product_id": "59359439"}, B + "reviews"],
  ["reviews", {"product_id": "59359439", "brand": "anf", "storefront": "us", "country": "DE"}, B + "reviews"],
  ["suggestions", {"query": "hoo"}, B + "suggestions"],
  ["suggestions", {"query": "hoo", "brand": "anf", "storefront": "us", "country": "DE"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("abercrombie namespace", () => {
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

  it.each(ENDPOINTS)("abercrombie.%s posts its body to %s", async (method, args, path) => {
    await (client.abercrombie as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "promotions"])("%s() works with no options", async (method) => {
    await (client.abercrombie as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 10 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.abercrombie)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "product", "promotions", "reviews", "search", "store", "storeStock", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(ABERCROMBIE_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "abercrombie.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = ABERCROMBIE_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.abercrombie as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
