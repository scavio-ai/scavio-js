import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, MOVOTO_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/movoto/";
const ENDPOINTS: Row[] = [
  ["search", {"city": "Austin"}, B + "search"],
  ["search", {"city": "Austin", "state": "TX", "status": "for_sale", "property_types": ["single_family"], "beds_min": 3, "price_max": 750000}, B + "search"],
  ["property", {"url": "https://www.movoto.com/austin-tx/6001-sierra-arbor-ct-austin-tx-78759/pid_lgzxbh54nh/"}, B + "property"],
  ["marketTrends", {"city": "Austin"}, B + "market-trends"],
  ["marketTrends", {"city": "Austin", "state": "TX"}, B + "market-trends"],
  ["suggestions", {"query": "Austin"}, B + "suggestions"],
  ["school", {"url": "https://www.movoto.com/schools/austin-tx/davis-elementary-school-480894022775/"}, B + "school"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("movoto namespace", () => {
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

  it.each(ENDPOINTS)("movoto.%s posts its body to %s", async (method, args, path) => {
    await (client.movoto as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 5 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.movoto)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["marketTrends", "property", "school", "search", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(MOVOTO_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "movoto.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = MOVOTO_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.movoto as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
