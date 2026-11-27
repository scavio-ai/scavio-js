import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, LEROYMERLIN_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/leroymerlin/";
const ENDPOINTS: Row[] = [
  ["search", {"country": "br", "query": "furadeira"}, B + "search"],
  ["search", {"country": "br", "query": "furadeira", "region": "grande_sao_paulo", "filters": {"attribute-06575": "BOSCH"}}, B + "search"],
  ["category", {"country": "br", "category": "furadeiras"}, B + "category"],
  ["category", {"country": "br", "category": "furadeiras", "region": "grande_sao_paulo", "filters": {"attribute-06575": "BOSCH"}}, B + "category"],
  ["product", {"country": "br", "id": "92450351"}, B + "product"],
  ["product", {"country": "br", "id": "92450351", "region": "grande_sao_paulo"}, B + "product"],
  ["storeStock", {"country": "br", "id": "92450351"}, B + "store-stock"],
  ["storeStock", {"country": "br", "id": "92450351", "region": "grande_sao_paulo", "store": "raposo_tav"}, B + "store-stock"],
  ["stores", {"country": "br"}, B + "stores"],
  ["stores", {"country": "br", "place": "Milano", "region": "grande_sao_paulo"}, B + "stores"],
  ["store", {"country": "br", "store": "raposo_tav"}, B + "store"],
  ["reviews", {"country": "br", "id": "92450351"}, B + "reviews"],
  ["shipping", {"cep": "01310-100", "id": "92450351"}, B + "shipping"],
  ["shipping", {"cep": "01310-100", "id": "92450351", "country": "br", "region": "grande_sao_paulo"}, B + "shipping"],
  ["cep", {"cep": "01310-100"}, B + "cep"],
  ["cep", {"cep": "01310-100", "country": "br"}, B + "cep"],
  ["regions", {}, B + "regions"],
  ["regions", {"country": "br"}, B + "regions"],
  ["categories", {}, B + "categories"],
  ["categories", {"country": "br"}, B + "categories"],
  ["suggestions", {"country": "it", "query": "trapano"}, B + "suggestions"],
  ["offers", {"country": "it"}, B + "offers"],
  ["offers", {"country": "it", "filters": {"attribute-06575": "BOSCH"}}, B + "offers"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("leroymerlin namespace", () => {
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

  it.each(ENDPOINTS)("leroymerlin.%s posts its body to %s", async (method, args, path) => {
    await (client.leroymerlin as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["regions", "categories"])("%s() works with no options", async (method) => {
    await (client.leroymerlin as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 13 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.leroymerlin)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "cep", "offers", "product", "regions", "reviews", "search", "shipping", "store", "storeStock", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(LEROYMERLIN_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "leroymerlin.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = LEROYMERLIN_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.leroymerlin as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
