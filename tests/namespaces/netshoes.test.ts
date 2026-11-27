import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, NETSHOES_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/netshoes/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "tenis corrida"}, B + "search"],
  ["search", {"query": "tenis corrida", "brand": ["nike"], "size": "40", "price_min": 100, "sort": "price_asc"}, B + "search"],
  ["list", {"slug": "tenis-black-friday", "page": 2}, B + "list"],
  ["product", {"product_id": "FBA-82XQ-006"}, B + "product"],
  ["offers", {"sku": "I0Y-0011-289-01"}, B + "offers"],
  ["inventory", {"sku": "FBA-82XQ-006-38", "seller_id": 0}, B + "inventory"],
  ["shipping", {"sku": "FBA-82XQ-006-38", "cep": "01310-100"}, B + "shipping"],
  ["reviews", {"product_id": "FBA-82XQ", "rating": [3], "with_photos": true}, B + "reviews"],
  ["questions", {"product_id": "I0Y-0011"}, B + "questions"],
  ["dailyDeal", {}, B + "daily-deal"],
  ["seller", {"seller_id": "21072"}, B + "seller"],
  ["popularSearches", {}, B + "popular-searches"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("netshoes namespace", () => {
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

  it.each(ENDPOINTS)("netshoes.%s posts its body to %s", async (method, args, path) => {
    await (client.netshoes as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["list", "dailyDeal", "popularSearches"])("%s() works with no options", async (method) => {
    await (client.netshoes as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.netshoes)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["dailyDeal", "inventory", "list", "offers", "popularSearches", "product", "questions", "reviews", "search", "seller", "shipping"]);
  });

  it("timeout: 240 s", () => {
    expect(NETSHOES_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "netshoes.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = NETSHOES_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.netshoes as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
