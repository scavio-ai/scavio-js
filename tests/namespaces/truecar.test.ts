import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, TRUECAR_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/truecar/";
const ENDPOINTS: Row[] = [
  ["search", {"zip": "10001"}, B + "search"],
  ["search", {"zip": "10001", "make": "Toyota", "model": "RAV4", "trim": "XLE", "radius": 50, "year_min": 2020, "price_max": 30000, "mileage_max": 40000, "drivetrains": ["awd"], "colors": ["black"], "fuel_types": ["hybrid"]}, B + "search"],
  ["listing", {"vin": "x-vin"}, B + "listing"],
  ["model", {"make": "Toyota", "model": "RAV4"}, B + "model"],
  ["model", {"make": "Toyota", "model": "RAV4", "year": 2022}, B + "model"],
  ["reviews", {"make": "Toyota", "model": "RAV4"}, B + "reviews"],
  ["reviews", {"make": "Toyota", "model": "RAV4", "stars": [5], "search": "mileage"}, B + "reviews"],
  ["dealer", {"dealer_id": "414984"}, B + "dealer"],
  ["dealerInventory", {"dealer_id": "414984"}, B + "dealer-inventory"],
  ["suggestions", {"query": "rav4"}, B + "suggestions"],
  ["makes", {}, B + "makes"],
  ["models", {"make": "Toyota"}, B + "models"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("truecar namespace", () => {
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

  it.each(ENDPOINTS)("truecar.%s posts its body to %s", async (method, args, path) => {
    await (client.truecar as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["makes"])("%s() works with no options", async (method) => {
    await (client.truecar as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.truecar)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["dealer", "dealerInventory", "listing", "makes", "model", "models", "reviews", "search", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(TRUECAR_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "truecar.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = TRUECAR_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.truecar as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
