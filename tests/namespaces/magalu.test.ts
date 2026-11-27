import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, MAGALU_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/magalu/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "geladeira frost free"}, B + "search"],
  ["search", {"query": "geladeira frost free", "brand": "brastemp", "seller": "magalu", "min_price": 2000, "max_price": 3000, "attributes": {"voltagem": "220v"}}, B + "search"],
  ["category", {"path": "/geladeira-refrigerador/eletrodomesticos/s/ed/refr/"}, B + "category"],
  ["category", {"path": "/geladeira-refrigerador/eletrodomesticos/s/ed/refr/", "brand": "brastemp", "seller": "magalu", "min_price": 2000, "max_price": 3000, "attributes": {"voltagem": "220v"}}, B + "category"],
  ["deals", {}, B + "deals"],
  ["deals", {"selection": "blackfriday2026", "brand": "brastemp", "seller": "magalu", "min_price": 2000, "max_price": 3000, "attributes": {"voltagem": "220v"}}, B + "deals"],
  ["product", {"product_id": "238058800"}, B + "product"],
  ["reviews", {"product_id": "238058800"}, B + "reviews"],
  ["suggestions", {"query": "geladeira"}, B + "suggestions"],
  ["stores", {"state": "sp"}, B + "stores"],
  ["stores", {"state": "sp", "city": "Sao Paulo"}, B + "stores"],
  ["store", {"store_id": "1000"}, B + "store"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("magalu namespace", () => {
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

  it.each(ENDPOINTS)("magalu.%s posts its body to %s", async (method, args, path) => {
    await (client.magalu as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals"])("%s() works with no options", async (method) => {
    await (client.magalu as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 8 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.magalu)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["category", "deals", "product", "reviews", "search", "store", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(MAGALU_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "magalu.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = MAGALU_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.magalu as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
