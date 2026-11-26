import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, TRULIA_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/trulia/";
const ENDPOINTS: Row[] = [
  ["neighborhood", {"location_id": "85381"}, B + "neighborhood"],
  ["search", {"location": "Austin, TX"}, B + "search"],
  ["search", {"location": "Austin, TX", "listing_status": "for_sale", "beds_min": 3, "price_max": 1000000, "property_types": ["single_family", "townhouse"], "keyword": "pool"}, B + "search"],
  ["property", {"zpid": "339349810"}, B + "property"],
  ["school", {"url": "x-url"}, B + "school"],
  ["school", {"url": "x-url", "state": "IL"}, B + "school"],
  ["suggestions", {"query": "Austin"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("trulia namespace", () => {
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

  it.each(ENDPOINTS)("trulia.%s posts its body to %s", async (method, args, path) => {
    await (client.trulia as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 5 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.trulia)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["neighborhood", "property", "school", "search", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(TRULIA_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "trulia.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = TRULIA_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.trulia as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
