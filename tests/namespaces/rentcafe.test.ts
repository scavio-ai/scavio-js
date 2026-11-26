import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, RENTCAFE_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/rentcafe/";
const ENDPOINTS: Row[] = [
  ["search", {"location": "austin-tx"}, B + "search"],
  ["search", {"location": "austin-tx", "price_max": 2000}, B + "search"],
  ["property", {"url": "x-url"}, B + "property"],
  ["floorplanUnits", {"property_id": "1651075", "floorplan_id": "4746456"}, B + "floorplan-units"],
  ["reviews", {"property_id": "1651075"}, B + "reviews"],
  ["suggestions", {"query": "Austin"}, B + "suggestions"],
  ["rentTrends", {"city": "Austin", "state": "TX"}, B + "rent-trends"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("rentcafe namespace", () => {
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

  it.each(ENDPOINTS)("rentcafe.%s posts its body to %s", async (method, args, path) => {
    await (client.rentcafe as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 6 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.rentcafe)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["floorplanUnits", "property", "rentTrends", "reviews", "search", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(RENTCAFE_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "rentcafe.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = RENTCAFE_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.rentcafe as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
