import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, PCEXPRESS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/pcexpress/";
const ENDPOINTS: Row[] = [
  ["search", { query: "eggs" }, B + "search"],
  ["search", { query: "oeufs", banner: "maxi", language: "fr", page: 2, sort: "price_low_to_high", brand: ["N", "P"], deals: "pc_points", prepared_in_canada: true, filters: [{ facet: "dietaryCallouts", value: "organic" }], include_facets: true }, B + "search"],
  ["category", { category: "28224" }, B + "category"],
  ["category", { category: 28224, banner: "nofrills", deals: ["price_reduction", "multi_buy"] }, B + "category"],
  ["collection", { collection: "deals-centre", banner: "nofrills" }, B + "collection"],
  ["product", { code: "20812144001_EA" }, B + "product"],
  ["product", { url: "https://example.com/p/20812144001_EA", banner: "maxi" }, B + "product"],
  ["stores", { city: "Winnipeg" }, B + "stores"],
  ["stores", { latitude: 49.2827, longitude: -123.1207, limit: 5, shoppable_only: true }, B + "stores"],
  ["store", { store_id: "1517" }, B + "store"],
  ["store", { store_id: "0559", banner: "zehrs" }, B + "store"],
  ["suggestions", { query: "egg" }, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("pcexpress namespace", () => {
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

  it.each(ENDPOINTS)("pcexpress.%s posts its body to %s", async (method, args, path) => {
    await (client.pcexpress as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("stores() works with no options", async () => {
    await client.pcexpress.stores();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}stores`);
    expect(body()).toEqual({});
  });

  it("has all 7 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.pcexpress)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "category", "collection", "product", "search", "store", "stores", "suggestions",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(PCEXPRESS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "pcexpress.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.pcexpress as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(PCEXPRESS_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(PCEXPRESS_TIMEOUT);
    },
  );
});
