import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, CEA_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/cea/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "vestido"}, B + "search"],
  ["search", {"query": "vestido", "sort": "price_asc", "page": 2, "page_size": 12}, B + "search"],
  ["category", {"category": "moda-feminina", "sort": "newest"}, B + "category"],
  ["brand", {"brand": "clock-house"}, B + "brand"],
  ["deals", {"collection_id": 19727, "sort": "discount"}, B + "deals"],
  ["facets", {"query": "jeans"}, B + "facets"],
  ["suggestions", {"query": "vest"}, B + "suggestions"],
  ["categories", {}, B + "categories"],
  ["product", {"product_id": "4536055"}, B + "product"],
  ["shipping", {"sku": "6493983", "cep": "01310100"}, B + "shipping"],
  ["stores", {"cep": "01310100"}, B + "stores"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("cea namespace", () => {
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

  it.each(ENDPOINTS)("cea.%s posts its body to %s", async (method, args, path) => {
    await (client.cea as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["suggestions", "categories"])("%s() works with no options", async (method) => {
    await (client.cea as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 10 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.cea)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brand", "categories", "category", "deals", "facets", "product", "search", "shipping", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(CEA_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "cea.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = CEA_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.cea as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
