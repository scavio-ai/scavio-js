import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, HOTPADS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/hotpads/";
const ENDPOINTS: Row[] = [
  ["search", {"area": "brooklyn-new-york-ny"}, B + "search"],
  ["search", {"area": "brooklyn-new-york-ny", "price_max": 3000}, B + "search"],
  ["listing", {"url": "https://hotpads.com/11227-drummond-dr-dallas-tx-75228-skrzz0/pad"}, B + "listing"],
  ["priceHistory", {"listing_alias": "5759ydyqtn49h", "model_id": "738529"}, B + "price-history"],
  ["fees", {"listing_alias": "5759ydyqtn49h"}, B + "fees"],
  ["suggestions", {"text": "brooklyn"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("hotpads namespace", () => {
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

  it.each(ENDPOINTS)("hotpads.%s posts its body to %s", async (method, args, path) => {
    await (client.hotpads as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 5 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.hotpads)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["fees", "listing", "priceHistory", "search", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(HOTPADS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "hotpads.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = HOTPADS_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.hotpads as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
