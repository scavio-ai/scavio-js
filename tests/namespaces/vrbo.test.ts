import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, VRBO_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/vrbo/";
const ENDPOINTS: Row[] = [
  ["search", {"check_in": "2027-01-15", "check_out": "2027-01-18", "destination": "Destin, Florida"}, B + "search"],
  ["search", {"check_in": "2027-01-15", "check_out": "2027-01-18", "destination": "Destin, Florida", "adults": 2, "children": [5], "property_type": "house", "amenity": "pool", "bedrooms_min": 3, "market": "us"}, B + "search"],
  ["property", {"id": "1046285"}, B + "property"],
  ["property", {"id": "1046285", "market": "us"}, B + "property"],
  ["suggestions", {"query": "destin"}, B + "suggestions"],
  ["suggestions", {"query": "destin", "market": "us"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("vrbo namespace", () => {
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

  it.each(ENDPOINTS)("vrbo.%s posts its body to %s", async (method, args, path) => {
    await (client.vrbo as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 3 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.vrbo)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["property", "search", "suggestions"]);
  });

  it("timeout: 250 s", () => {
    expect(VRBO_TIMEOUT).toBe(250_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "vrbo.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = VRBO_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.vrbo as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
