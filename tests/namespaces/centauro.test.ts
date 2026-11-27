import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, CENTAURO_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/centauro/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "tenis corrida"}, B + "search"],
  ["search", {"query": "tenis corrida", "filters": ["marca:nike", "genero:masculino"], "sort": "discount", "page": 2}, B + "search"],
  ["category", {"path": "/nav/categorias/calcados/produto/tenis"}, B + "category"],
  ["category", {"path": "categorias:calcados", "brand": "asics", "seller": "centauro"}, B + "category"],
  ["deals", {}, B + "deals"],
  ["deals", {"deal": "outlet", "store": "curitibaprshoppingbariguiloja0050"}, B + "deals"],
  ["product", {"product_id": "9976EA51"}, B + "product"],
  ["product", {"model": "9976EA", "color": "51"}, B + "product"],
  ["freight", {"sku": "9976EA510375", "cep": "01310-100"}, B + "freight"],
  ["stores", {"cep": "01310-100"}, B + "stores"],
  ["suggestions", {"query": "tenis"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("centauro namespace", () => {
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

  it.each(ENDPOINTS)("centauro.%s posts its body to %s", async (method, args, path) => {
    await (client.centauro as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals"])("%s() works with no options", async (method) => {
    await (client.centauro as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 7 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.centauro)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["category", "deals", "freight", "product", "search", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(CENTAURO_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "centauro.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = CENTAURO_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.centauro as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
