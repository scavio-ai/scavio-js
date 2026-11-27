import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ATACADAO_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/atacadao/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "arroz"}, B + "search"],
  ["search", {"query": "arroz", "store_id": "atacadaobr340", "brand": ["Camil"], "page_size": 50}, B + "search"],
  ["category", {"category": "mercearia/graos", "store_id": "atacadaobr340"}, B + "category"],
  ["product", {"ean": "7896079431158"}, B + "product"],
  ["product", {"sku": "14443", "store_id": 340}, B + "product"],
  ["storesNear", {"cep": "01310-100"}, B + "stores-near"],
  ["storesNear", {"latitude": -23.56, "longitude": -46.65}, B + "stores-near"],
  ["stores", {"state": "SP", "city": "Sao Paulo"}, B + "stores"],
  ["store", {"store_id": "atacadaobr340"}, B + "store"],
  ["flyers", {"store_id": 340}, B + "flyers"],
  ["facets", {"query": "arroz"}, B + "facets"],
  ["suggestions", {"query": "arroz"}, B + "suggestions"],
  ["categories", {}, B + "categories"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("atacadao namespace", () => {
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

  it.each(ENDPOINTS)("atacadao.%s posts its body to %s", async (method, args, path) => {
    await (client.atacadao as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["facets", "suggestions", "categories"])("%s() works with no options", async (method) => {
    await (client.atacadao as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 10 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.atacadao)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "facets", "flyers", "product", "search", "store", "stores", "storesNear", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(ATACADAO_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "atacadao.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = ATACADAO_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.atacadao as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
