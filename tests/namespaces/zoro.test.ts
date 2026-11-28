import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ZORO_TIMEOUT, ZORO_SLOW_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/zoro/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "3m n95 respirator"}, B + "search"],
  ["search", {"query": "safety glasses", "page": 2}, B + "search"],
  ["category", {"category": "safety-glasses/c/6214"}, B + "category"],
  ["category", {"slug": "safety-glasses", "code": "6214", "page": 3}, B + "category"],
  ["brand", {"brand": "Mcr Safety", "page": 2}, B + "brand"],
  ["product", {"zoro_no": "G2426514"}, B + "product"],
  ["product", {"url": "https://www.zoro.com/mcr-safety-bearkat-bk1-safety-glasses-duramass-hard-coat-clear-lens-non-slip-temple-frameless-bk110/i/G2426514/"}, B + "product"],
  ["availability", {"zoro_no": "G2426514"}, B + "availability"],
  ["reviews", {"zoro_no": "G2426514"}, B + "reviews"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("zoro namespace", () => {
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

  it.each(ENDPOINTS)("zoro.%s posts its body to %s", async (method, args, path) => {
    await (client.zoro as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 6 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.zoro)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["availability", "brand", "category", "product", "reviews", "search"]);
  });

  it("timeout: 180 s, availability / reviews 240 s", () => {
    expect(ZORO_TIMEOUT).toBe(180_000);
    expect(ZORO_SLOW_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "zoro.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = method === "availability" || method === "reviews" ? ZORO_SLOW_TIMEOUT : ZORO_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.zoro as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
