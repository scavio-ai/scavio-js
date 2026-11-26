import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, RAKUTEN_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/rakuten/";
const ENDPOINTS: Row[] = [
  ["stores", {}, B + "stores"],
  ["stores", {"country": "us", "category": "electronics"}, B + "stores"],
  ["store", {"store": "macys"}, B + "store"],
  ["store", {"store": "macys", "country": "us"}, B + "store"],
  ["storeCoupons", {"store": "macys"}, B + "store-coupons"],
  ["storeCoupons", {"store": "macys", "country": "us"}, B + "store-coupons"],
  ["rates", {"store_ids": ["8333", "7206", "3930"]}, B + "rates"],
  ["rates", {"store_ids": ["8333", "7206", "3930"], "country": "us"}, B + "rates"],
  ["search", {"query": "nike"}, B + "search"],
  ["search", {"query": "nike", "country": "us"}, B + "search"],
  ["suggestions", {"query": "target"}, B + "suggestions"],
  ["suggestions", {"query": "target", "country": "us"}, B + "suggestions"],
  ["category", {"category": "electronics"}, B + "category"],
  ["category", {"category": "electronics", "country": "us"}, B + "category"],
  ["deals", {}, B + "deals"],
  ["deals", {"country": "us", "page": "black_friday"}, B + "deals"],
  ["inStore", {}, B + "in-store"],
  ["inStore", {"country": "us"}, B + "in-store"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("rakuten namespace", () => {
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

  it.each(ENDPOINTS)("rakuten.%s posts its body to %s", async (method, args, path) => {
    await (client.rakuten as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["stores", "deals", "inStore"])("%s() works with no options", async (method) => {
    await (client.rakuten as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.rakuten)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["category", "deals", "inStore", "rates", "search", "store", "storeCoupons", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(RAKUTEN_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "rakuten.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = RAKUTEN_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.rakuten as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
