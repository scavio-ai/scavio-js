import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, LENNAR_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/lennar/";
const ENDPOINTS: Row[] = [
  ["search", {"market": "DAL"}, B + "search"],
  ["search", {"market": "DAL", "mode": "homes", "longitude": -96.797, "radius": 15, "beds_min": 3, "price_max": 400000, "availability": ["quick_move_in"], "features": ["SSTORY"]}, B + "search"],
  ["community", {"comnum": "22704"}, B + "community"],
  ["plan", {"comnum": "22704", "plan_number": "4504"}, B + "plan"],
  ["home", {"lot_id": "22704535134"}, B + "home"],
  ["masterPlanned", {"mpc_id": 1916}, B + "master-planned"],
  ["markets", {}, B + "markets"],
  ["market", {"market": "PHO"}, B + "market"],
  ["suggestions", {"query": "Katy"}, B + "suggestions"],
  ["resolve", {"path": "/new-homes/texas/houston/montgomery/kresston/melrose-ii"}, B + "resolve"],
  ["promotions", {"market": "DAL"}, B + "promotions"],
  ["payment", {"lot_id": "22704535134", "comnum": "22704", "down_payment": 40000, "interest_rate": 0.065}, B + "payment"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("lennar namespace", () => {
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

  it.each(ENDPOINTS)("lennar.%s posts its body to %s", async (method, args, path) => {
    await (client.lennar as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["markets"])("%s() works with no options", async (method) => {
    await (client.lennar as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.lennar)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["community", "home", "market", "markets", "masterPlanned", "payment", "plan", "promotions", "resolve", "search", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(LENNAR_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "lennar.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = LENNAR_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.lennar as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
