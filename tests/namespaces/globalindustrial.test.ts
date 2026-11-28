import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, GLOBALINDUSTRIAL_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/globalindustrial/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "nitrile gloves"}, B + "search"],
  ["search", {"query": "drum truck", "brand": "Wesco", "market": "ca"}, B + "search"],
  ["category", {"path": "/c/carts-trucks/hand_trucks/drum_trucks_cradles", "brand": "Wesco", "group": 42311}, B + "category"],
  ["category", {"path": "/t/carts-trucks", "group": "42311", "market": "ca"}, B + "category"],
  ["brand", {"brand": "Wesco"}, B + "brand"],
  ["product", {"item": "652508"}, B + "product"],
  ["product", {"url": "https://www.globalindustrial.com/p/dispenser-truck-poly-drums", "market": "ca"}, B + "product"],
  ["clearance", {"category": "PRIME30", "brand": "Global Industrial"}, B + "clearance"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("globalindustrial namespace", () => {
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

  it.each(ENDPOINTS)("globalindustrial.%s posts its body to %s", async (method, args, path) => {
    await (client.globalindustrial as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["clearance"])("%s() works with no options", async (method) => {
    await (client.globalindustrial as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 5 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.globalindustrial)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brand", "category", "clearance", "product", "search"]);
  });

  it("timeout: 180 s", () => {
    expect(GLOBALINDUSTRIAL_TIMEOUT).toBe(180_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "globalindustrial.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = GLOBALINDUSTRIAL_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.globalindustrial as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
