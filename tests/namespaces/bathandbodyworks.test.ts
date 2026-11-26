import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, BATHANDBODYWORKS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/bathandbodyworks/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "candle"}, B + "search"],
  ["search", {"query": "candle", "country": "us"}, B + "search"],
  ["category", {"path": "/c/all-candles/3-wick-candles"}, B + "category"],
  ["category", {"path": "/c/all-candles/3-wick-candles", "country": "us"}, B + "category"],
  ["categories", {}, B + "categories"],
  ["categories", {"country": "us"}, B + "categories"],
  ["product", {"product_id": "028029548"}, B + "product"],
  ["product", {"product_id": "028029548", "country": "us"}, B + "product"],
  ["promotions", {"product_id": "028029548"}, B + "promotions"],
  ["promotions", {"product_id": "028029548", "country": "us"}, B + "promotions"],
  ["offers", {}, B + "offers"],
  ["offers", {"country": "us"}, B + "offers"],
  ["storeAvailability", {"store_id": "BBW00010", "product_id": "028029548"}, B + "store-availability"],
  ["storeAvailability", {"store_id": "BBW00010", "product_id": "028029548", "country": "us"}, B + "store-availability"],
  ["store", {"store_id": "BBW00010"}, B + "store"],
  ["store", {"store_id": "BBW00010", "country": "us"}, B + "store"],
  ["stores", {}, B + "stores"],
  ["stores", {"country": "us"}, B + "stores"],
  ["reviewsSummary", {"product_id": "028029548"}, B + "reviews-summary"],
  ["reviewsSummary", {"product_id": "028029548", "country": "us"}, B + "reviews-summary"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("bathandbodyworks namespace", () => {
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

  it.each(ENDPOINTS)("bathandbodyworks.%s posts its body to %s", async (method, args, path) => {
    await (client.bathandbodyworks as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "offers", "stores"])("%s() works with no options", async (method) => {
    await (client.bathandbodyworks as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 10 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.bathandbodyworks)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "offers", "product", "promotions", "reviewsSummary", "search", "store", "storeAvailability", "stores"]);
  });

  it("timeout: 240 s", () => {
    expect(BATHANDBODYWORKS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "bathandbodyworks.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = BATHANDBODYWORKS_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.bathandbodyworks as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
