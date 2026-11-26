import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, CARGURUS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/cargurus/";
const ENDPOINTS: Row[] = [
  ["search", {"zip": "10001"}, B + "search"],
  ["search", {"zip": "10001", "market": "us", "distance": 50, "make": "Toyota", "model": "RAV4", "trim": "XLE", "sort": "best_deal", "deal_rating": ["great", "good"]}, B + "search"],
  ["dealer", {"dealer_id": "440818"}, B + "dealer"],
  ["dealer", {"dealer_id": "440818", "market": "us", "make": "Toyota", "model": "RAV4", "trim": "XLE", "sort": "best_deal", "deal_rating": ["great", "good"]}, B + "dealer"],
  ["dealers", {"zip": "10001"}, B + "dealers"],
  ["dealers", {"zip": "10001", "market": "us", "distance": 50, "make": "Toyota", "model": "RAV4"}, B + "dealers"],
  ["priceTrends", {}, B + "price-trends"],
  ["priceTrends", {"market": "us", "make": "Toyota", "model": "RAV4"}, B + "price-trends"],
  ["research", {"research_id": "c31935"}, B + "research"],
  ["research", {"research_id": "c31935", "make": "Toyota", "model": "RAV4", "market": "us"}, B + "research"],
  ["expertReviews", {}, B + "expert-reviews"],
  ["expertReviews", {"market": "us"}, B + "expert-reviews"],
  ["makes", {}, B + "makes"],
  ["makes", {"market": "us"}, B + "makes"],
  ["models", {"make": "Toyota"}, B + "models"],
  ["models", {"make": "Toyota", "market": "us", "zip": "10001", "distance": 50}, B + "models"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("cargurus namespace", () => {
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

  it.each(ENDPOINTS)("cargurus.%s posts its body to %s", async (method, args, path) => {
    await (client.cargurus as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["priceTrends", "expertReviews", "makes"])("%s() works with no options", async (method) => {
    await (client.cargurus as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 8 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.cargurus)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["dealer", "dealers", "expertReviews", "makes", "models", "priceTrends", "research", "search"]);
  });

  it("timeout: 240 s", () => {
    expect(CARGURUS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "cargurus.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = CARGURUS_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.cargurus as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
