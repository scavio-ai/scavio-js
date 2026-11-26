import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, YESSTYLE_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/yesstyle/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "snail mucin"}, B + "search"],
  ["search", {"query": "snail mucin", "department": "15478", "country": "us", "language": "de", "featured": ["in_stock", "flash_sales"]}, B + "search"],
  ["category", {"category": "15556"}, B + "category"],
  ["category", {"category": "15556", "country": "us", "language": "de", "featured": ["in_stock", "flash_sales"]}, B + "category"],
  ["brand", {"brand": "317041"}, B + "brand"],
  ["brand", {"brand": "317041", "department": "15478", "country": "us", "language": "de", "featured": ["in_stock", "flash_sales"]}, B + "brand"],
  ["brands", {}, B + "brands"],
  ["brands", {"query": "cosrx"}, B + "brands"],
  ["deals", {}, B + "deals"],
  ["deals", {"department": "15478", "country": "us", "language": "de", "featured": ["in_stock", "flash_sales"]}, B + "deals"],
  ["product", {"product_id": "1052684695"}, B + "product"],
  ["product", {"product_id": "1052684695", "country": "us", "language": "de"}, B + "product"],
  ["reviews", {"product_id": "1052684695"}, B + "reviews"],
  ["reviews", {"product_id": "1052684695", "country": "gb", "language": "de"}, B + "reviews"],
  ["suggestions", {"query": "cosrx"}, B + "suggestions"],
  ["suggestions", {"query": "cosrx", "country": "gb", "language": "de"}, B + "suggestions"],
  ["markets", {}, B + "markets"],
  ["markets", {"language": "de"}, B + "markets"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("yesstyle namespace", () => {
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

  it.each(ENDPOINTS)("yesstyle.%s posts its body to %s", async (method, args, path) => {
    await (client.yesstyle as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["brands", "deals", "markets"])("%s() works with no options", async (method) => {
    await (client.yesstyle as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.yesstyle)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brand", "brands", "category", "deals", "markets", "product", "reviews", "search", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(YESSTYLE_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "yesstyle.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = YESSTYLE_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.yesstyle as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
