import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ACEHARDWARE_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/acehardware/";
const ENDPOINTS: Row[] = [
  ["search", { query: "brass hose nozzle" }, B + "search"],
  ["search", { query: "cordless drill", page: 2, page_size: 50, sort: "price_asc", brand: "dewalt", offer: "sale", filters: ["tenant~A00317:lithium-ion"] }, B + "search"],
  ["product", { product_code: "72779" }, B + "product"],
  ["product", { product_code: "72779", store: "03085" }, B + "product"],
  ["product", { url: "https://www.acehardware.com/p/72779", store: "10665" }, B + "product"],
  ["storeStock", { product_code: "72779", stores: ["18250", "17309"] }, B + "store-stock"],
  ["storeStock", { product_code: "72779", store: "18250", nearby: true }, B + "store-stock"],
  ["store", { store: "18250" }, B + "store"],
  ["stores", { store: "03085", details: true, limit: 4 }, B + "stores"],
  ["category", { category: "/departments/tools/power-tools/cordless-drills", sort: "newest" }, B + "category"],
  ["categories", { category: "/departments/tools" }, B + "categories"],
  ["brand", { brand: "weber", on_sale: true }, B + "brand"],
  ["brand", { query: "web" }, B + "brand"],
  ["deals", { offer: "ace_rewards" }, B + "deals"],
  ["weeklyAd", { store: "18250" }, B + "weekly-ad"],
  ["weeklyAd", { store: "18250", page: 2, ad_group: "261101_WCAS" }, B + "weekly-ad"],
  ["paintColors", { query: "pink" }, B + "paint-colors"],
  ["paintColors", { brand: "Benjamin Moore", page: 2, page_size: 500 }, B + "paint-colors"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("acehardware namespace", () => {
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

  it.each(ENDPOINTS)("acehardware.%s posts its body to %s", async (method, args, path) => {
    await (client.acehardware as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("keeps a store number's leading zeros", async () => {
    await client.acehardware.product({ product_code: "72779", store: "03085" });
    expect(body().store).toBe("03085");
  });

  it.each([
    ["categories", "categories"],
    ["brand", "brand"],
    ["deals", "deals"],
    ["paintColors", "paint-colors"],
  ])("%s() works with no options", async (method, path) => {
    await (client.acehardware as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}${path}`);
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.acehardware)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brand", "categories", "category", "deals", "paintColors", "product", "search", "store",
      "storeStock", "stores", "weeklyAd",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(ACEHARDWARE_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "acehardware.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.acehardware as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(ACEHARDWARE_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(ACEHARDWARE_TIMEOUT);
    },
  );
});
