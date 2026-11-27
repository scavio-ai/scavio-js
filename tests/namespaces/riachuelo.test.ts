import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, RIACHUELO_TIMEOUT, RIACHUELO_SEARCH_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/riachuelo/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "vestido"}, B + "search"],
  ["search", {"query": "vestido", "sort": "price_asc", "filters": {"filter_size": ["p", "m"]}, "page": 2}, B + "search"],
  ["category", {"category": "feminino/colecao-feminino/vestido", "sort": "newest", "filters": {"brand": "pool-jeans"}}, B + "category"],
  ["deals", {"department": "masculino", "sort": "discount"}, B + "deals"],
  ["deals", {"campaign": "campanha/r/promo/oferta-especial", "page": 2}, B + "deals"],
  ["product", {"sku": "16519710"}, B + "product"],
  ["product", {"url": "https://www.riachuelo.com.br/vestido-midi-gode-feminino-lequinha-com-bolso-marrom-16195833_sku"}, B + "product"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("riachuelo namespace", () => {
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

  it.each(ENDPOINTS)("riachuelo.%s posts its body to %s", async (method, args, path) => {
    await (client.riachuelo as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals"])("%s() works with no options", async (method) => {
    await (client.riachuelo as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 4 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.riachuelo)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["category", "deals", "product", "search"]);
  });

  it("timeout: 180 s, search 300 s", () => {
    expect(RIACHUELO_TIMEOUT).toBe(180_000);
    expect(RIACHUELO_SEARCH_TIMEOUT).toBe(300_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "riachuelo.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = method === "search" ? RIACHUELO_SEARCH_TIMEOUT : RIACHUELO_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.riachuelo as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
