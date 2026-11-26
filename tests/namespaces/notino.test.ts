import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, NOTINO_TIMEOUT, NOTINO_REVIEWS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/notino/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "vitamin c serum"}, B + "search"],
  ["search", {"query": "vitamin c serum", "market": "de", "filters": [100004]}, B + "search"],
  ["product", {"url": "https://www.notino.de/dior/sauvage-eau-de-parfum-fuer-herren/"}, B + "product"],
  ["product", {"url": "https://www.notino.de/dior/sauvage-eau-de-parfum-fuer-herren/", "market": "de"}, B + "product"],
  ["reviews", {"url": "https://www.notino.de/dior/sauvage-eau-de-parfum-fuer-herren/"}, B + "reviews"],
  ["reviews", {"url": "https://www.notino.de/dior/sauvage-eau-de-parfum-fuer-herren/", "market": "de"}, B + "reviews"],
  ["category", {"category": "/hautseren/"}, B + "category"],
  ["category", {"category": "/hautseren/", "market": "de", "filters": [100004]}, B + "category"],
  ["brand", {"brand": "cerave"}, B + "brand"],
  ["brand", {"brand": "cerave", "market": "de", "filters": [100004]}, B + "brand"],
  ["promo", {}, B + "promo"],
  ["promo", {"promo": "black-friday", "market": "de", "filters": [100004]}, B + "promo"],
  ["brands", {}, B + "brands"],
  ["brands", {"market": "de", "query": "dior"}, B + "brands"],
  ["suggestions", {"query": "dior sa"}, B + "suggestions"],
  ["suggestions", {"query": "dior sa", "market": "de"}, B + "suggestions"],
  ["stores", {}, B + "stores"],
  ["stores", {"market": "cz", "city": "Praha"}, B + "stores"],
  ["store", {"store": "florentinum-praha"}, B + "store"],
  ["store", {"store": "florentinum-praha", "market": "cz"}, B + "store"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("notino namespace", () => {
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

  it.each(ENDPOINTS)("notino.%s posts its body to %s", async (method, args, path) => {
    await (client.notino as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["promo", "brands", "stores"])("%s() works with no options", async (method) => {
    await (client.notino as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 10 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.notino)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brand", "brands", "category", "product", "promo", "reviews", "search", "store", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(NOTINO_TIMEOUT).toBe(240_000);
    expect(NOTINO_REVIEWS_TIMEOUT).toBe(250_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "notino.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const floor = ({"reviews": 250000} as Record<string, number>)[method] ?? NOTINO_TIMEOUT;
      const want = floor;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.notino as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
