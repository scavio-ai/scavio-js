import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, UHAUL_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/uhaul/";
const ENDPOINTS: Row[] = [
  ["truckQuote", {"pickup": "Dallas, TX", "date": "2026-12-10"}, B + "truck-quote"],
  ["truckQuote", {"pickup": "Dallas, TX", "date": "2026-12-10", "dropoff": "Austin, TX"}, B + "truck-quote"],
  ["locations", {"near": "75201"}, B + "locations"],
  ["location", {"location_id": "741028"}, B + "location"],
  ["storageSearch", {"near": "Dallas, TX 75201"}, B + "storage-search"],
  ["storageFacility", {"facility_id": "741065"}, B + "storage-facility"],
  ["reviews", {"location_id": "741028"}, B + "reviews"],
  ["suggestions", {"term": "dall"}, B + "suggestions"],
  ["supplies", {"category": "Boxes"}, B + "supplies"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("uhaul namespace", () => {
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

  it.each(ENDPOINTS)("uhaul.%s posts its body to %s", async (method, args, path) => {
    await (client.uhaul as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 8 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.uhaul)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["location", "locations", "reviews", "storageFacility", "storageSearch", "suggestions", "supplies", "truckQuote"]);
  });

  it("timeout: 240 s", () => {
    expect(UHAUL_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "uhaul.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = UHAUL_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.uhaul as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
