import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, CASASBAHIA_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/casasbahia/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "geladeira frost free"}, B + "search"],
  ["search", {"query": "geladeira frost free", "site": "casasbahia", "filters": ["marca-m19", "avaliacao-r5"], "min_price": 1000, "max_price": 3000}, B + "search"],
  ["category", {"path": "/c/eletroportateis?filtro=categoria-c73"}, B + "category"],
  ["category", {"path": "/c/eletroportateis?filtro=categoria-c73", "site": "casasbahia", "filters": ["marca-m19", "avaliacao-r5"], "min_price": 1000, "max_price": 3000}, B + "category"],
  ["product", {"sku": "55066339"}, B + "product"],
  ["product", {"sku": "55066339", "site": "casasbahia"}, B + "product"],
  ["categories", {}, B + "categories"],
  ["categories", {"site": "casasbahia"}, B + "categories"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("casasbahia namespace", () => {
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

  it.each(ENDPOINTS)("casasbahia.%s posts its body to %s", async (method, args, path) => {
    await (client.casasbahia as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories"])("%s() works with no options", async (method) => {
    await (client.casasbahia as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 4 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.casasbahia)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "product", "search"]);
  });

  it("timeout: 240 s", () => {
    expect(CASASBAHIA_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "casasbahia.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = CASASBAHIA_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.casasbahia as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
