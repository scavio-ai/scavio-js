import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, KBB_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/kbb/";
const ENDPOINTS: Row[] = [
  ["carValue", {"make": "Toyota", "model": "rav4", "year": 2021, "trim": "le-sport-utility-4d"}, B + "car-value"],
  ["carValue", {"make": "Toyota", "model": "rav4", "year": 2021, "trim": "le-sport-utility-4d", "mileage": 40000, "zip": "10001"}, B + "car-value"],
  ["model", {"make": "Toyota", "model": "rav4", "year": 2021}, B + "model"],
  ["search", {"zip": "10001"}, B + "search"],
  ["search", {"zip": "10001", "make": "Toyota", "model": "RAV4", "model_code": "F150PICKUP"}, B + "search"],
  ["listing", {"listing_id": "796688649"}, B + "listing"],
  ["listing", {"listing_id": "796688649", "zip": "10001"}, B + "listing"],
  ["reviews", {"make": "Toyota", "model": "rav4", "year": 2021}, B + "reviews"],
  ["dealers", {"zip": "10001"}, B + "dealers"],
  ["dealers", {"zip": "10001", "make": "Toyota"}, B + "dealers"],
  ["dealer", {"dealer_id": "68613"}, B + "dealer"],
  ["makesModels", {}, B + "makes-models"],
  ["makesModels", {"make": "Toyota"}, B + "makes-models"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("kbb namespace", () => {
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

  it.each(ENDPOINTS)("kbb.%s posts its body to %s", async (method, args, path) => {
    await (client.kbb as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["makesModels"])("%s() works with no options", async (method) => {
    await (client.kbb as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 8 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.kbb)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["carValue", "dealer", "dealers", "listing", "makesModels", "model", "reviews", "search"]);
  });

  it("timeout: 250 s", () => {
    expect(KBB_TIMEOUT).toBe(250_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "kbb.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = KBB_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.kbb as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
