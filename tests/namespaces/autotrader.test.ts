import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, AUTOTRADER_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/autotrader/";
const ENDPOINTS: Row[] = [
  ["search", {"zip": "90012"}, B + "search"],
  ["search", {"zip": "90012", "make": "Honda", "model": "Civic", "trim_code": "CIVIC|LX"}, B + "search"],
  ["listing", {"listing_id": "795241382"}, B + "listing"],
  ["listing", {"listing_id": "795241382", "zip": "90012"}, B + "listing"],
  ["dealers", {"zip": "90012"}, B + "dealers"],
  ["dealers", {"zip": "90012", "make": "Honda"}, B + "dealers"],
  ["dealer", {"dealer_id": "87788"}, B + "dealer"],
  ["makes", {"make": "Honda"}, B + "makes"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("autotrader namespace", () => {
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

  it.each(ENDPOINTS)("autotrader.%s posts its body to %s", async (method, args, path) => {
    await (client.autotrader as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 5 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.autotrader)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["dealer", "dealers", "listing", "makes", "search"]);
  });

  it("timeout: 240 s", () => {
    expect(AUTOTRADER_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "autotrader.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = AUTOTRADER_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.autotrader as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
