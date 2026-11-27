import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, CARREFOURBR_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/carrefourbr/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "arroz", "cep": "01310-100"}, B + "search"],
  ["search", {"query": "geladeira", "site": "www", "filters": {"brand": "consul"}, "sort": "price_asc"}, B + "search"],
  ["category", {"path": "/categoria/mercearia/alimentos-basicos/arroz"}, B + "category"],
  ["collection", {"collection_id": 29861}, B + "collection"],
  ["product", {"item_id": "1972"}, B + "product"],
  ["delivery", {"item_id": "1972", "cep": "01310-100"}, B + "delivery"],
  ["stores", {"state": "SP"}, B + "stores"],
  ["suggestions", {"query": "arroz"}, B + "suggestions"],
  ["coupons", {}, B + "coupons"],
  ["categories", {"site": "www"}, B + "categories"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("carrefourbr namespace", () => {
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

  it.each(ENDPOINTS)("carrefourbr.%s posts its body to %s", async (method, args, path) => {
    await (client.carrefourbr as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["stores", "suggestions", "coupons", "categories"])("%s() works with no options", async (method) => {
    await (client.carrefourbr as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.carrefourbr)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "collection", "coupons", "delivery", "product", "search", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(CARREFOURBR_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "carrefourbr.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = CARREFOURBR_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.carrefourbr as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
