import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, CARVANA_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/carvana/";
const ENDPOINTS: Row[] = [
  ["search", {}, B + "search"],
  ["search", {"make": "Toyota", "model": "RAV4", "city": "new-york-ny", "year_min": 2021, "price_max": 30000, "mileage_max": 40000, "trims": ["XLE"], "drive_types": ["awd"], "colors": ["black"], "body_styles": ["suv"], "fuel_types": ["hybrid"], "tags": ["great_deal"]}, B + "search"],
  ["vehicle", {"vehicle_id": "4850967"}, B + "vehicle"],
  ["modelGuide", {"year": 2021, "make": "Toyota", "model": "RAV4"}, B + "model-guide"],
  ["trims", {"make": "Toyota", "model": "RAV4"}, B + "trims"],
  ["make", {"make": "Toyota"}, B + "make"],
  ["makes", {}, B + "makes"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("carvana namespace", () => {
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

  it.each(ENDPOINTS)("carvana.%s posts its body to %s", async (method, args, path) => {
    await (client.carvana as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["search", "makes"])("%s() works with no options", async (method) => {
    await (client.carvana as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 6 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.carvana)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["make", "makes", "modelGuide", "search", "trims", "vehicle"]);
  });

  it("timeout: 240 s", () => {
    expect(CARVANA_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "carvana.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = CARVANA_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.carvana as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
