import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, INSTACART_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/instacart/";
const ENDPOINTS: Row[] = [
  ["retailers", { zip: "10001" }, B + "retailers"],
  ["retailers", { zip: "M5V 2T6", country: "ca", language: "fr" }, B + "retailers"],
  ["search", { query: "yogurt", retailer: "jewel-osco", zip: "60540", limit: 10 }, B + "search"],
  ["search", { query: "milk", retailer: "costco", zip: 10001, service_type: "instore", sort: "price_asc", on_sale: true, brand_id: "18514", page: 2 }, B + "search"],
  ["search", { query: "lait", retailer: "metro", zip: "H2X1Y4", country: "ca", language: "fr", limit: 10 }, B + "search"],
  ["crossSearch", { query: "milk", zip: "10001", max_retailers: 3 }, B + "cross-search"],
  ["crossSearch", { query: "eggs", zip: "10001", max_retailers: 10, items_per_retailer: 20 }, B + "cross-search"],
  ["product", { product_id: "16408559", retailer: "wegmans", zip: "10001" }, B + "product"],
  ["product", { product_id: 16408559, retailer: "jewel-osco", zip: "60540", service_type: "pickup" }, B + "product"],
  ["priceCompare", { product_id: "16408559", zip: "10001" }, B + "price-compare"],
  ["categories", { retailer: "wegmans", zip: "10001" }, B + "categories"],
  ["category", { category: "produce", retailer: "wegmans", zip: "10001", limit: 10 }, B + "category"],
  ["deals", { retailer: "jewel-osco", zip: "60540", limit: 10 }, B + "deals"],
  ["stores", { retailer: "jewel-osco", zip: "60540", limit: 5 }, B + "stores"],
  ["suggestions", { query: "eg", zip: "60540", retailer: "jewel-osco" }, B + "suggestions"],
  ["suggestions", { query: "eg", zip: "60540" }, B + "suggestions"],
  ["reviews", { product_id: "16408559" }, B + "reviews"],
  ["reviews", { product_id: "16408559", page: 2 }, B + "reviews"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("instacart namespace", () => {
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

  it.each(ENDPOINTS)("instacart.%s posts its body to %s", async (method, args, path) => {
    await (client.instacart as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.instacart)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "categories", "category", "crossSearch", "deals", "priceCompare", "product", "retailers", "reviews",
      "search", "stores", "suggestions",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(INSTACART_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "instacart.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.instacart as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(INSTACART_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(INSTACART_TIMEOUT);
    },
  );
});
