import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, EDMUNDS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/edmunds/";
const ENDPOINTS: Row[] = [
  ["search", {"city": "New York", "state": "NY"}, B + "search"],
  ["search", {"city": "New York", "state": "NY", "make": "Toyota", "model": "RAV4", "trim": "XLE"}, B + "search"],
  ["listing", {"vin": "x-vin"}, B + "listing"],
  ["listing", {"vin": "x-vin", "make": "Toyota", "model": "RAV4", "year": 2022}, B + "listing"],
  ["reviews", {"make": "Toyota", "model": "RAV4", "year": 2022}, B + "reviews"],
  ["dealer", {"dealer_id": "JakeSweeneyMitsubishi_891713"}, B + "dealer"],
  ["model", {"make": "Toyota", "model": "RAV4"}, B + "model"],
  ["model", {"make": "Toyota", "model": "RAV4", "year": 2022}, B + "model"],
  ["price", {"make": "Toyota", "model": "RAV4", "year": 2022}, B + "price"],
  ["price", {"make": "Toyota", "model": "RAV4", "year": 2022, "trim": "XLE"}, B + "price"],
  ["appraisal", {"make": "Toyota", "model": "RAV4", "year": 2022}, B + "appraisal"],
  ["appraisal", {"make": "Toyota", "model": "RAV4", "year": 2022, "trim": "XLE"}, B + "appraisal"],
  ["makes", {"make": "Toyota"}, B + "makes"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("edmunds namespace", () => {
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

  it.each(ENDPOINTS)("edmunds.%s posts its body to %s", async (method, args, path) => {
    await (client.edmunds as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 8 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.edmunds)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["appraisal", "dealer", "listing", "makes", "model", "price", "reviews", "search"]);
  });

  it("timeout: 250 s", () => {
    expect(EDMUNDS_TIMEOUT).toBe(250_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "edmunds.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = EDMUNDS_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.edmunds as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
