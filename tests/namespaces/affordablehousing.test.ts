import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, AFFORDABLEHOUSING_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/affordablehousing/";
const ENDPOINTS: Row[] = [
  ["search", {"state": "TX"}, B + "search"],
  ["search", {"state": "TX", "city": "Houston", "price_max": 1500}, B + "search"],
  ["listing", {"url": "https://www.affordablehousing.com/houston-tx/the-reserve-at-westwood--766073/"}, B + "listing"],
  ["suggestions", {"text": "Houston"}, B + "suggestions"],
  ["waitingLists", {}, B + "waiting-lists"],
  ["waitingLists", {"state": "TX"}, B + "waiting-lists"],
  ["housingAuthority", {"url": "https://www.affordablehousing.com/housing-authority-ma/somerville-housing-authority-674/"}, B + "housing-authority"],
  ["housingAuthority", {"url": "https://www.affordablehousing.com/housing-authority-ma/somerville-housing-authority-674/", "state": "TX"}, B + "housing-authority"],
  ["housingAuthorities", {"state": "TX"}, B + "housing-authorities"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("affordablehousing namespace", () => {
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

  it.each(ENDPOINTS)("affordablehousing.%s posts its body to %s", async (method, args, path) => {
    await (client.affordablehousing as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["waitingLists"])("%s() works with no options", async (method) => {
    await (client.affordablehousing as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 6 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.affordablehousing)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["housingAuthorities", "housingAuthority", "listing", "search", "suggestions", "waitingLists"]);
  });

  it("timeout: 240 s", () => {
    expect(AFFORDABLEHOUSING_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "affordablehousing.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = AFFORDABLEHOUSING_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.affordablehousing as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
