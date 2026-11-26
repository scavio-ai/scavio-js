import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, EXPEDIA_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/expedia/";
const ENDPOINTS: Row[] = [
  ["search", {"check_in": "2027-03-12", "check_out": "2027-03-15", "destination": "Las Vegas, NV"}, B + "search"],
  ["search", {"check_in": "2027-03-12", "check_out": "2027-03-15", "destination": "Las Vegas, NV", "adults": 2, "star": 5, "amenity": "POOL", "guest_rating_min": 9, "market": "us"}, B + "search"],
  ["property", {"id": "17117062"}, B + "property"],
  ["property", {"id": "17117062", "market": "us"}, B + "property"],
  ["priceCalendar", {"check_in": "2027-03-12", "check_out": "2027-03-15", "id": "17117062"}, B + "price-calendar"],
  ["priceCalendar", {"check_in": "2027-03-12", "check_out": "2027-03-15", "id": "17117062", "adults": 2, "market": "us"}, B + "price-calendar"],
  ["suggestions", {"query": "new yo"}, B + "suggestions"],
  ["suggestions", {"query": "new yo", "market": "us"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("expedia namespace", () => {
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

  it.each(ENDPOINTS)("expedia.%s posts its body to %s", async (method, args, path) => {
    await (client.expedia as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 4 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.expedia)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["priceCalendar", "property", "search", "suggestions"]);
  });

  it("timeout: 250 s", () => {
    expect(EXPEDIA_TIMEOUT).toBe(250_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "expedia.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = EXPEDIA_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.expedia as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
