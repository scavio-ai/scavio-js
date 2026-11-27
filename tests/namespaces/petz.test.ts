import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, PETZ_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/petz/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "ração golden"}, B + "search"],
  ["search", {"query": "ração golden", "sort": "price_asc", "page": 2}, B + "search"],
  ["category", {"category": "cachorro/racao", "sort": "newest"}, B + "category"],
  ["brand", {"brand": "royal-canin"}, B + "brand"],
  ["deals", {"collection": "PF-racoes", "sort": "price_desc"}, B + "deals"],
  ["product", {"product_id": "191628"}, B + "product"],
  ["product", {"product_id": 191628}, B + "product"],
  ["product", {"url": "https://www.petz.com.br/produto/racao-golden-special-para-caes-adultos-sabor-frango-e-carne-71343"}, B + "product"],
  ["stores", {"state": "SP", "city": "São Paulo"}, B + "stores"],
  ["store", {"slug": "petz-aclimacao"}, B + "store"],
  ["store", {"url": "https://www.petz.com.br/loja/petz-aclimacao"}, B + "store"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("petz namespace", () => {
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

  it.each(ENDPOINTS)("petz.%s posts its body to %s", async (method, args, path) => {
    await (client.petz as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals", "stores"])("%s() works with no options", async (method) => {
    await (client.petz as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 7 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.petz)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brand", "category", "deals", "product", "search", "store", "stores"]);
  });

  it("timeout: 300 s", () => {
    expect(PETZ_TIMEOUT).toBe(300_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "petz.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = PETZ_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.petz as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
