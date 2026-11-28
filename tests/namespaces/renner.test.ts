import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, RENNER_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/renner/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "camiseta"}, B + "search"],
  ["search", {"query": "camiseta", "sort": "price_asc", "filters": ["4zo6za"], "page": 2}, B + "search"],
  ["category", {"category": "4zo6za", "filters": "xv9uau"}, B + "category"],
  ["deals", {"list": "1l95pyv", "sort": "discount"}, B + "deals"],
  ["product", {"product_id": "931758127", "sku": "931758135"}, B + "product"],
  ["skuPrice", {"product_id": "931758127", "sku": "931758135"}, B + "sku-price"],
  ["stores", {"cep": "01310-100"}, B + "stores"],
  ["reviews", {"product_id": "846044605"}, B + "reviews"],
  ["reviews", {"url": "https://www.lojasrenner.com.br/p/x/-/A-846044605-br.lr", "sort": "most_helpful", "page": 2}, B + "reviews"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("renner namespace", () => {
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

  it.each(ENDPOINTS)("renner.%s posts its body to %s", async (method, args, path) => {
    await (client.renner as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals"])("%s() works with no options", async (method) => {
    await (client.renner as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 7 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.renner)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["category", "deals", "product", "reviews", "search", "skuPrice", "stores"]);
  });

  it("timeout: 300 s", () => {
    expect(RENNER_TIMEOUT).toBe(300_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "renner.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = RENNER_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.renner as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
