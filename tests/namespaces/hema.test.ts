import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, HEMA_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/hema/";
const ENDPOINTS: Row[] = [
  ["search", { query: "sokken" }, B + "search"],
  ["search", { query: "bougie", country: "be", language: "fr", sort: "price_asc", page: 2, filters: { maincolour: ["zwart", "wit"] }, price_min: 1.5, price_max: 10 }, B + "search"],
  ["product", { sku: "15300147" }, B + "product"],
  ["product", { sku: 15300147, country: "de" }, B + "product"],
  ["product", { url: "https://www.hema.nl/speelgoed-hobby/babyspeelgoed/knuffeldoekje-konijn-15300147.html" }, B + "product"],
  ["category", { category: "baby/babykleding", new_only: true }, B + "category"],
  ["categories", { depth: 1 }, B + "categories"],
  ["newArrivals", { country: "fr", sort: "newest" }, B + "new-arrivals"],
  ["sale", { country: "de" }, B + "sale"],
  ["offers", { country: "be", language: "fr" }, B + "offers"],
  ["campaign", { campaign: "sinterklaas", country: "be" }, B + "campaign"],
  ["suggestions", { query: "kerst" }, B + "suggestions"],
  ["storeStock", { skus: ["15300147", "10860090"], query: "Utrecht" }, B + "store-stock"],
  ["storeStock", { skus: ["15300147"], lat: 48.85, lng: 2.35, country: "fr", in_stock_only: true, limit: 5 }, B + "store-stock"],
  ["storeStock", { skus: ["15300147"], country: "lu" }, B + "store-stock"],
  ["stores", { query: "Utrecht" }, B + "stores"],
  ["stores", { country: "at" }, B + "stores"],
  ["store", { store_id: "0013" }, B + "store"],
  ["store", { store_id: "0013", sku: "15300147" }, B + "store"],
  ["reviews", { sku: "10860090" }, B + "reviews"],
  ["reviews", { sku: "10860090", country: "be", sort: "highest", page: 2 }, B + "reviews"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("hema namespace", () => {
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

  it.each(ENDPOINTS)("hema.%s posts its body to %s", async (method, args, path) => {
    await (client.hema as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each([
    ["categories", "categories"],
    ["newArrivals", "new-arrivals"],
    ["sale", "sale"],
    ["offers", "offers"],
    ["stores", "stores"],
  ])("%s() works with no options", async (method, path) => {
    await (client.hema as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}${path}`);
    expect(body()).toEqual({});
  });

  it("has all 13 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.hema)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "campaign", "categories", "category", "newArrivals", "offers", "product", "reviews", "sale", "search",
      "store", "storeStock", "stores", "suggestions",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(HEMA_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "hema.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.hema as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(HEMA_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(HEMA_TIMEOUT);
    },
  );
});
