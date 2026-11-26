import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, BRINGATRAILER_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/bringatrailer/";
const ENDPOINTS: Row[] = [
  ["results", {}, B + "results"],
  ["results", {"q": "e30 m3", "exclude": "parts", "year_min": 1987, "year_max": 1991, "max_bid": 100000, "category": "Motorcycles", "origin": "Japanese", "era": "1980", "make": "BMW", "model_id": 1833018, "location_id": 89009067}, B + "results"],
  ["priceHistory", {"model_id": 1833018}, B + "price-history"],
  ["priceHistory", {"model_id": 1833018, "year_min": 1987, "year_max": 1991}, B + "price-history"],
  ["listing", {"slug": "1988-bmw-m3-272-2"}, B + "listing"],
  ["live", {}, B + "live"],
  ["live", {"q": "land cruiser", "make": "Porsche", "country": "DE", "ending_within_hours": 24}, B + "live"],
  ["make", {"make": "bmw"}, B + "make"],
  ["model", {"model": "bmw/e30-m3"}, B + "model"],
  ["location", {"country": "germany"}, B + "location"],
  ["suggestions", {"q": "land cruiser"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("bringatrailer namespace", () => {
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

  it.each(ENDPOINTS)("bringatrailer.%s posts its body to %s", async (method, args, path) => {
    await (client.bringatrailer as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["results", "live"])("%s() works with no options", async (method) => {
    await (client.bringatrailer as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 8 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.bringatrailer)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["listing", "live", "location", "make", "model", "priceHistory", "results", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(BRINGATRAILER_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "bringatrailer.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = BRINGATRAILER_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.bringatrailer as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
