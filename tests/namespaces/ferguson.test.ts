import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, FERGUSON_TIMEOUT, FERGUSON_PRODUCT_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/ferguson/";
const ENDPOINTS: Row[] = [
  ["search", {"q": "pex tubing"}, B + "search"],
  ["search", {"q": "1/2 ball valve", "page": 2, "sort": "best_selling"}, B + "search"],
  ["category", {"category": "water-heaters/tankless-water-heaters"}, B + "category"],
  ["product", {"item": "4606091"}, B + "product"],
  ["product", {"url": "https://www.ferguson.com/product/fnw-figure-x432-ball-valve/4606091.html"}, B + "product"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("ferguson namespace", () => {
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

  it.each(ENDPOINTS)("ferguson.%s posts its body to %s", async (method, args, path) => {
    await (client.ferguson as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 3 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.ferguson)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["category", "product", "search"]);
  });

  it("timeout: 240 s, product 180 s", () => {
    expect(FERGUSON_TIMEOUT).toBe(240_000);
    expect(FERGUSON_PRODUCT_TIMEOUT).toBe(180_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "ferguson.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = method === "product" ? FERGUSON_PRODUCT_TIMEOUT : FERGUSON_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.ferguson as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
