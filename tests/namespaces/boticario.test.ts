import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, BOTICARIO_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/boticario/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "perfume"}, B + "search"],
  ["search", {"query": "perfume", "brand": "eudora", "product_brand": ["egeo", "lily"], "sort": "discount"}, B + "search"],
  ["category", {"path": "/perfumaria/"}, B + "category"],
  ["category", {"path": "/perfumaria/", "facets": {"familia-olfativa": "amadeirado"}, "min_rating": 4}, B + "category"],
  ["categories", {}, B + "categories"],
  ["categories", {"brand": "eudora"}, B + "categories"],
  ["deals", {}, B + "deals"],
  ["deals", {"type": "promotions", "section": "cashback", "brand": "boticario"}, B + "deals"],
  ["promotions", {}, B + "promotions"],
  ["promotions", {"brand": "eudora"}, B + "promotions"],
  ["product", {"slug": "base-liquida-cor-330-make-b-mate-salicylic-30g"}, B + "product"],
  ["product", {"sku": "B01863", "brand": "boticario"}, B + "product"],
  ["prices", {"skus": ["B01863", "B48734", "B2022081233"]}, B + "prices"],
  ["prices", {"skus": "B01863,B48734", "brand": "boticario"}, B + "prices"],
  ["reviews", {"product_id": "B2022081233"}, B + "reviews"],
  ["reviews", {"product_id": "B2022081233", "sort": "most_useful", "stars": 5, "page_size": 50}, B + "reviews"],
  ["stores", {"cep": "01310-100"}, B + "stores"],
  ["stores", {"cep": 1310100, "radius_km": 10, "page_size": 50}, B + "stores"],
  ["pickup", {"cep": "01310-100", "sku": "B2022081233"}, B + "pickup"],
  ["pickup", {"cep": "01310-100", "slug": "base-liquida-cor-330-make-b-mate-salicylic-30g", "brand": "boticario"}, B + "pickup"],
  ["suggestions", {"query": "perfume"}, B + "suggestions"],
  ["suggestions", {"query": "perfume", "brand": "eudora"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("boticario namespace", () => {
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

  it.each(ENDPOINTS)("boticario.%s posts its body to %s", async (method, args, path) => {
    await (client.boticario as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "deals", "promotions"])("%s() works with no options", async (method) => {
    await (client.boticario as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.boticario)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "deals", "pickup", "prices", "product", "promotions", "reviews", "search", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(BOTICARIO_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "boticario.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = BOTICARIO_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.boticario as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
