import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, COMPASS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/compass/";
const ENDPOINTS: Row[] = [
  ["search", {"area": "austin-tx"}, B + "search"],
  ["search", {"area": "austin-tx", "mode": "for_sale", "price_max": 900000}, B + "search"],
  ["listing", {"url": "https://www.compass.com/homedetails/2141-Norlock-Ln-Dallas-TX-75201/19YYG3_pid/"}, B + "listing"],
  ["suggestions", {"q": "Austin, TX"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("compass namespace", () => {
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

  it.each(ENDPOINTS)("compass.%s posts its body to %s", async (method, args, path) => {
    await (client.compass as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 3 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.compass)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["listing", "search", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(COMPASS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "compass.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = COMPASS_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.compass as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
