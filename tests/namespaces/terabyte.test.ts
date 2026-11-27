import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, TERABYTE_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/terabyte/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "rtx 5060"}, B + "search"],
  ["search", {"query": "rtx 5060", "sort": "price_asc", "page": 2, "page_size": 50}, B + "search"],
  ["product", {"product_id": "41251"}, B + "product"],
  ["reviews", {"product_id": 20782, "page": 2}, B + "reviews"],
  ["category", {"category": "hardware/placas-de-video", "filters": {"modelo": "RTX 5070"}}, B + "category"],
  ["brand", {"category": "perifericos/mouse", "brand": "Logitech"}, B + "brand"],
  ["deals", {"deal": "open_box", "sort": "price_desc"}, B + "deals"],
  ["coupons", {"code": "BLACKDT3"}, B + "coupons"],
  ["trendingSearches", {"limit": 10}, B + "trending-searches"],
  ["pcBuilder", {"platform_id": "18613", "group_id": "21065"}, B + "pc-builder"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("terabyte namespace", () => {
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

  it.each(ENDPOINTS)("terabyte.%s posts its body to %s", async (method, args, path) => {
    await (client.terabyte as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals", "coupons", "trendingSearches", "pcBuilder"])("%s() works with no options", async (method) => {
    await (client.terabyte as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.terabyte)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brand", "category", "coupons", "deals", "pcBuilder", "product", "reviews", "search", "trendingSearches"]);
  });

  it("timeout: 240 s", () => {
    expect(TERABYTE_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "terabyte.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = TERABYTE_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.terabyte as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
