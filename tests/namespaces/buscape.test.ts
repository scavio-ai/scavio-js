import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, BUSCAPE_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/buscape/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "geladeira"}, B + "search"],
  ["search", {"query": "geladeira", "category_id": "8", "site": "buscape", "filters": {"Marca": "Samsung"}, "price_min": 2000, "price_max": 4000, "store": "Magazine Luiza"}, B + "search"],
  ["category", {"category_id": "8"}, B + "category"],
  ["category", {"category_id": "8", "site": "buscape", "filters": {"Marca": "Samsung"}, "price_min": 2000, "price_max": 4000, "store": "Magazine Luiza"}, B + "category"],
  ["categories", {}, B + "categories"],
  ["categories", {"site": "buscape", "branch": "eletrodomesticos"}, B + "categories"],
  ["product", {"product_id": "12755140"}, B + "product"],
  ["product", {"product_id": "12755140", "site": "buscape"}, B + "product"],
  ["offers", {"product_id": "12755140"}, B + "offers"],
  ["offers", {"product_id": "12755140", "site": "buscape", "variant_id": "48733"}, B + "offers"],
  ["priceHistory", {"product_id": "12755140"}, B + "price-history"],
  ["priceHistory", {"product_id": "12755140", "site": "buscape", "months": 6}, B + "price-history"],
  ["lowestPrice", {"product_id": "12755140"}, B + "lowest-price"],
  ["lowestPrice", {"product_id": "12755140", "site": "buscape"}, B + "lowest-price"],
  ["deals", {}, B + "deals"],
  ["deals", {"query": "tv", "category_id": "3", "site": "buscape", "filters": {"Marca": "Samsung"}, "price_min": 2000, "price_max": 4000, "store": "Magazine Luiza"}, B + "deals"],
  ["dealLanding", {"slug": "black-friday"}, B + "deal-landing"],
  ["dealLanding", {"slug": "black-friday", "site": "buscape"}, B + "deal-landing"],
  ["store", {"store_id": "21"}, B + "store"],
  ["store", {"store_id": "21", "site": "buscape"}, B + "store"],
  ["suggestions", {"query": "geladeira"}, B + "suggestions"],
  ["suggestions", {"query": "geladeira", "site": "buscape"}, B + "suggestions"],
  ["shipping", {"product_id": "12755140", "cep": "01310-100", "state": "SP", "city": "São Paulo"}, B + "shipping"],
  ["shipping", {"product_id": "12755140", "cep": "01310-100", "state": "SP", "city": "São Paulo", "site": "buscape", "variant_id": "48733"}, B + "shipping"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("buscape namespace", () => {
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

  it.each(ENDPOINTS)("buscape.%s posts its body to %s", async (method, args, path) => {
    await (client.buscape as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "deals"])("%s() works with no options", async (method) => {
    await (client.buscape as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 12 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.buscape)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "dealLanding", "deals", "lowestPrice", "offers", "priceHistory", "product", "search", "shipping", "store", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(BUSCAPE_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "buscape.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = BUSCAPE_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.buscape as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
