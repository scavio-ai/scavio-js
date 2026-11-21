import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, MEDIAEXPERT_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/mediaexpert/";
const ENDPOINTS: Row[] = [
  ["search", { query: "telewizor" }, B + "search"],
  ["search", { query: "iphone 17", category_id: "12900", sort: "price_asc", page: 2, limit: 50 }, B + "search"],
  ["product", { product_id: "8128227" }, B + "product"],
  ["product", { url: "https://www.mediaexpert.pl/telewizory-i-rtv/telewizory/x" }, B + "product"],
  ["storeStock", { product_id: "8128227", location: "Warszawa" }, B + "store-stock"],
  ["storeStock", { product_id: 8128227, location: "00-950", limit: 10 }, B + "store-stock"],
  ["stores", { city: "Krakow" }, B + "stores"],
  ["stores", { store: "warszawa/al-jerozolimskie-148" }, B + "stores"],
  ["reviews", { sku: "709727" }, B + "reviews"],
  [
    "reviews",
    { product_id: "8128227", sort: "newest", rating_min: 1, rating_max: 2, verified: true, page: 2, limit: 100 },
    B + "reviews",
  ],
  ["category", { category: "agd/pralki-i-suszarki/pralki", filters: ["bosch", "pojemnosc-kg_od-10-kg"], sort: "price_asc" }, B + "category"],
  ["categories", { category: "agd", depth: 2 }, B + "categories"],
  ["brands", { query: "sams", limit: 50 }, B + "brands"],
  ["brand", { brand: "samsung", category: "telewizory-i-rtv/telewizory", sort: "price_desc" }, B + "brand"],
  ["promotions", { black_weeks: true }, B + "promotions"],
  ["promotions", { list: "32975-logitech-black-weeks-czas-na-nowy-poziom-sprzetu", page: 2 }, B + "promotions"],
  ["outlet", { category: "outlet/outlet-agd/outlet-lodowki-wolnostojace", limit: 20 }, B + "outlet"],
  ["seller", { seller: "autobi", page: 2 }, B + "seller"],
  ["suggestions", { query: "pral", limit: 5 }, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("mediaexpert namespace", () => {
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

  it.each(ENDPOINTS)("mediaexpert.%s posts its body to %s", async (method, args, path) => {
    await (client.mediaexpert as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["stores", "categories", "brands", "promotions", "outlet"])("%s() works with no options", async (method) => {
    await (client.mediaexpert as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}${method}`);
    expect(body()).toEqual({});
  });

  it("has all 13 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.mediaexpert)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brand", "brands", "categories", "category", "outlet", "product", "promotions", "reviews", "search", "seller",
      "storeStock", "stores", "suggestions",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(MEDIAEXPERT_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "mediaexpert.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.mediaexpert as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(MEDIAEXPERT_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(MEDIAEXPERT_TIMEOUT);
    },
  );
});
