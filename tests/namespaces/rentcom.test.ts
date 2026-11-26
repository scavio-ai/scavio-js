import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, RENTCOM_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/rentcom/";
const ENDPOINTS: Row[] = [
  ["search", {"city": "Austin"}, B + "search"],
  ["search", {"city": "Austin", "site": "rent", "state": "TX", "neighborhood": "Downtown Manhattan", "beds": 2, "price_max": 3000, "amenities": ["pool", "washer-dryer-in-unit"]}, B + "search"],
  ["listing", {"id": "lc5898701"}, B + "listing"],
  ["listing", {"id": "lc5898701", "site": "rent"}, B + "listing"],
  ["building", {"building_id": "b147857"}, B + "building"],
  ["rentTrends", {"city": "Austin", "state": "TX"}, B + "rent-trends"],
  ["suggestions", {"query": "Austin"}, B + "suggestions"],
  ["suggestions", {"query": "Austin", "site": "rent"}, B + "suggestions"],
  ["cities", {"state": "TX"}, B + "cities"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("rentcom namespace", () => {
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

  it.each(ENDPOINTS)("rentcom.%s posts its body to %s", async (method, args, path) => {
    await (client.rentcom as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 6 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.rentcom)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["building", "cities", "listing", "rentTrends", "search", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(RENTCOM_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "rentcom.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = RENTCOM_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.rentcom as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
