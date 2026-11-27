import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, RDSAUDE_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/rdsaude/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "protetor solar"}, B + "search"],
  ["search", {"query": "protetor solar", "site": "drogasil", "brand": "Neutrogena", "highlight": "Oferta do Dia"}, B + "search"],
  ["category", {"category_id": "515"}, B + "category"],
  ["category", {"category_id": "515", "site": "drogasil", "brand": "Neutrogena", "highlight": "Oferta do Dia"}, B + "category"],
  ["categories", {}, B + "categories"],
  ["categories", {"site": "drogasil"}, B + "categories"],
  ["product", {"sku": "331137"}, B + "product"],
  ["product", {"sku": "331137", "site": "drogasil"}, B + "product"],
  ["prices", {"skus": ["331137", "38155", "24216"]}, B + "prices"],
  ["prices", {"skus": ["331137", "38155", "24216"], "site": "drogasil"}, B + "prices"],
  ["storeAvailability", {"skus": ["331137"], "store_ids": ["1156", "200"]}, B + "store-availability"],
  ["storeAvailability", {"skus": ["331137"], "store_ids": ["1156", "200"], "site": "drogasil"}, B + "store-availability"],
  ["stores", {"cep": "01310-100"}, B + "stores"],
  ["stores", {"cep": "01310-100", "site": "drogasil"}, B + "stores"],
  ["storesSearch", {}, B + "stores/search"],
  ["storesSearch", {"state": "RS", "city": "Porto Alegre", "site": "drogasil"}, B + "stores/search"],
  ["reviews", {"sku": "38155"}, B + "reviews"],
  ["reviews", {"sku": "38155", "site": "drogasil"}, B + "reviews"],
  ["deals", {}, B + "deals"],
  ["deals", {"coupon": "NIVEABRAND", "brand": "Neutrogena", "site": "drogasil"}, B + "deals"],
  ["suggestions", {"query": "shamp"}, B + "suggestions"],
  ["suggestions", {"query": "shamp", "site": "drogasil"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("rdsaude namespace", () => {
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

  it.each(ENDPOINTS)("rdsaude.%s posts its body to %s", async (method, args, path) => {
    await (client.rdsaude as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "storesSearch", "deals"])("%s() works with no options", async (method) => {
    await (client.rdsaude as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.rdsaude)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "deals", "prices", "product", "reviews", "search", "storeAvailability", "stores", "storesSearch", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(RDSAUDE_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "rdsaude.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = RDSAUDE_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.rdsaude as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
