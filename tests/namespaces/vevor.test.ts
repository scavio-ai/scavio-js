import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, VEVOR_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/vevor/";
const ENDPOINTS: Row[] = [
  ["search", { q: "welder" }, B + "search"],
  ["search", { q: "schweissgeraet", country: "de", language: "de", category: 40339, page: 2, sort: "price_low", in_stock: true, on_sale: true, black_friday: false, bulk_savings: true, min_price: 50, max_price: 300.5, rating: "highly_rated" }, B + "search"],
  ["search", { q: "welder", pickup: true }, B + "search"],
  ["product", { sku: "DHJMIGMMAMIGLL6WNV5" }, B + "product"],
  ["product", { url: "https://www.vevor.ca/x-c_1/y-p_010752182768", country: "ca", language: "fr" }, B + "product"],
  ["shipping", { sku: "DHJMIGMMAMIGLL6WNV5", state: "AK", zip: "99501" }, B + "shipping"],
  ["shipping", { sku: "DHJMIGMMAMIGLL6WNV5", province: "ON", zip: "M5V 2T6", city: "Toronto", country: "ca" }, B + "shipping"],
  ["reviews", { sku: "CKKMJ3300LBSAPPKZV1", page: 2, page_size: 100, sort: "newest", rating: 5, photos_only: true, this_variant_only: true }, B + "reviews"],
  ["questions", { sku: "DHJMIGMMAMIGLL6WNV5", page: 3, country: "gb" }, B + "questions"],
  ["suggestions", { q: "ice" }, B + "suggestions"],
  ["categories", { category: "40339", country: "eu", language: "sv" }, B + "categories"],
  ["category", { category: "40035" }, B + "category"],
  ["category", { category: 40035, page: 2, sort: "new", in_stock: true }, B + "category"],
  ["collections", { type: "promotion", url: "https://www.vevor.com/promotion/commercial-kitchen-equipment-special-10018.html" }, B + "collections"],
  ["collections", { type: "best_sellers", category: "40035", page: 2, sort: "hot" }, B + "collections"],
  ["deals", { type: "clearance", category: 40035, page: 3, sort: "price_high", country: "pl" }, B + "deals"],
  ["prices", { sku: "GYQXJBMQJQYPKEO1LV0" }, B + "prices"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("vevor namespace", () => {
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

  it.each(ENDPOINTS)("vevor.%s posts its body to %s", async (method, args, path) => {
    await (client.vevor as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "collections", "deals"])("%s() works with no options", async (method) => {
    await (client.vevor as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}${method}`);
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.vevor)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "categories", "category", "collections", "deals", "prices", "product", "questions",
      "reviews", "search", "shipping", "suggestions",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(VEVOR_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "vevor.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.vevor as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(VEVOR_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(VEVOR_TIMEOUT);
    },
  );
});
