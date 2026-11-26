import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, DOUGLAS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/douglas/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "mascara"}, B + "search"],
  ["search", {"query": "mascara", "brand_filter": "b0690", "filters": [{"facet": "classificationClassName", "value": "Eau de Parfum"}], "market": "de"}, B + "search"],
  ["category", {"category": "parfum/01"}, B + "category"],
  ["category", {"category": "parfum/01", "brand_filter": "b0690", "filters": [{"facet": "classificationClassName", "value": "Eau de Parfum"}], "market": "de"}, B + "category"],
  ["brand", {"brand": "dior/b0690"}, B + "brand"],
  ["brand", {"brand": "dior/b0690", "brand_filter": "b0690", "filters": [{"facet": "classificationClassName", "value": "Eau de Parfum"}], "market": "de"}, B + "brand"],
  ["deals", {}, B + "deals"],
  ["deals", {"brand_filter": "b0690", "filters": [{"facet": "classificationClassName", "value": "Eau de Parfum"}], "market": "de"}, B + "deals"],
  ["product", {"code": "5000005003"}, B + "product"],
  ["product", {"code": "5000005003", "market": "de"}, B + "product"],
  ["stores", {"query": "Berlin"}, B + "stores"],
  ["stores", {"query": "Berlin", "market": "de"}, B + "stores"],
  ["store", {"store_id": "00020475"}, B + "store"],
  ["store", {"store_id": "00020475", "market": "de"}, B + "store"],
  ["reviewSummary", {"code": "5000005003"}, B + "review-summary"],
  ["reviewSummary", {"code": "5000005003", "market": "de"}, B + "review-summary"],
  ["suggestions", {"query": "dior"}, B + "suggestions"],
  ["suggestions", {"query": "dior", "market": "de"}, B + "suggestions"],
  ["brands", {}, B + "brands"],
  ["brands", {"query": "dior", "market": "de"}, B + "brands"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("douglas namespace", () => {
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

  it.each(ENDPOINTS)("douglas.%s posts its body to %s", async (method, args, path) => {
    await (client.douglas as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals", "brands"])("%s() works with no options", async (method) => {
    await (client.douglas as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 10 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.douglas)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brand", "brands", "category", "deals", "product", "reviewSummary", "search", "store", "stores", "suggestions"]);
  });

  it("timeout: 250 s", () => {
    expect(DOUGLAS_TIMEOUT).toBe(250_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "douglas.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = DOUGLAS_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.douglas as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
