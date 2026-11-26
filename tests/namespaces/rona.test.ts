import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, RONA_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/rona/";
const ENDPOINTS: Row[] = [
  ["search", { query: "2x4" }, B + "search"],
  ["search", { query: "perceuse", page: 2, page_size: 24, sort: "price_low_to_high", filters: ["1000337236"], on_sale: true, include_facets: true, store_id: "41460", language: "fr" }, B + "search"],
  ["product", { sku: "00277649", store_id: "55130" }, B + "product"],
  ["product", { url: "https://www.rona.ca/en/product/x-00277649" }, B + "product"],
  ["prices", { skus: ["0971073", "0938002", "00277649"], store_id: "55130" }, B + "prices"],
  ["prices", { skus: "0971073,00277649", store_id: 41460, language: "fr" }, B + "prices"],
  ["category", { category: "/en/tools/power-tools-158001/cordless-drills-and-drivers-158003", store_id: "55130", clearance: true }, B + "category"],
  ["category", { family_id: "318485", store_id: "55130", page_size: 100 }, B + "category"],
  ["categories", { depth: 2 }, B + "categories"],
  ["stores", { latitude: 43.6426, longitude: -79.3871, limit: 10 }, B + "stores"],
  ["stores", { province: "qc", banner: "rona_plus" }, B + "stores"],
  ["store", { store_id: "55130" }, B + "store"],
  ["stock", { sku: "00277649", store_id: "62860" }, B + "stock"],
  ["stock", { sku: "00277649", latitude: 51.0774, longitude: -113.99011 }, B + "stock"],
  ["deals", { type: "clearance", store_id: "55130", page: 3 }, B + "deals"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("rona namespace", () => {
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

  it.each(ENDPOINTS)("rona.%s posts its body to %s", async (method, args, path) => {
    await (client.rona as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "stores", "deals"])("%s() works with no options", async (method) => {
    await (client.rona as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}${method}`);
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.rona)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "categories", "category", "deals", "prices", "product", "search", "stock", "store", "stores",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(RONA_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "rona.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.rona as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(RONA_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(RONA_TIMEOUT);
    },
  );
});
