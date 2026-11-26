import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, STREETEASY_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/streeteasy/";
const ENDPOINTS: Row[] = [
  ["search", {"area": "Brooklyn"}, B + "search"],
  ["search", {"area": "Brooklyn", "mode": "rent", "price_max": 4000, "amenities": ["dishwasher", "washer_dryer"]}, B + "search"],
  ["listing", {"url": "https://streeteasy.com/building/the-pilot/3e"}, B + "listing"],
  ["building", {"slug": "eastlight-condominium"}, B + "building"],
  ["buildings", {"area": "Williamsburg"}, B + "buildings"],
  ["market", {}, B + "market"],
  ["market", {"type": "rentals", "metric": "median_asking_rent", "area": "Williamsburg", "start_month": "2024-01"}, B + "market"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("streeteasy namespace", () => {
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

  it.each(ENDPOINTS)("streeteasy.%s posts its body to %s", async (method, args, path) => {
    await (client.streeteasy as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["market"])("%s() works with no options", async (method) => {
    await (client.streeteasy as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 5 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.streeteasy)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["building", "buildings", "listing", "market", "search"]);
  });

  it("timeout: 240 s", () => {
    expect(STREETEASY_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "streeteasy.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = STREETEASY_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.streeteasy as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
