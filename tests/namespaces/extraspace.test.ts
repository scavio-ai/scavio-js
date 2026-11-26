import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, EXTRASPACE_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/extraspace/";
const ENDPOINTS: Row[] = [
  ["search", {"term": "90012"}, B + "search"],
  ["facility", {"store_id": "1934"}, B + "facility"],
  ["reviews", {"store_id": "1934"}, B + "reviews"],
  ["cityPrices", {"city": "Dallas", "state": "TX"}, B + "city-prices"],
  ["locations", {}, B + "locations"],
  ["locations", {"query": "San"}, B + "locations"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("extraspace namespace", () => {
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

  it.each(ENDPOINTS)("extraspace.%s posts its body to %s", async (method, args, path) => {
    await (client.extraspace as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["locations"])("%s() works with no options", async (method) => {
    await (client.extraspace as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 5 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.extraspace)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["cityPrices", "facility", "locations", "reviews", "search"]);
  });

  it("timeout: 240 s", () => {
    expect(EXTRASPACE_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "extraspace.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = EXTRASPACE_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.extraspace as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
