import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, BSTOCK_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/bstock/";
const ENDPOINTS: Row[] = [
  ["search", {"q": "laptop"}, B + "search"],
  ["search", {"storefront": ["Target", "Walmart"], "condition": "Like New", "sort": "end_time", "limit": 50, "offset": 50}, B + "search"],
  ["lot", {"id": "6b05cd6821e9e20881d2a998"}, B + "lot"],
  ["lot", {"url": "https://bstock.com/buy/listings/details/6b05cd6821e9e20881d2a998"}, B + "lot"],
  ["storefronts", {}, B + "storefronts"],
  ["filters", {}, B + "filters"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("bstock namespace", () => {
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

  it.each(ENDPOINTS)("bstock.%s posts its body to %s", async (method, args, path) => {
    await (client.bstock as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 4 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.bstock)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["filters", "lot", "search", "storefronts"]);
  });

  it("timeout: 180 s", () => {
    expect(BSTOCK_TIMEOUT).toBe(180_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "bstock.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = BSTOCK_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.bstock as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
