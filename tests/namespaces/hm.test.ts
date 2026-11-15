import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, HM_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "jeans" }, "/api/v1/hm/search"],
  [
    "search",
    {
      query: "jeans",
      country: "de",
      language: "de",
      department: "women",
      page: 2,
      page_size: 72,
      sort: "price_asc",
      color: ["schwarz_000000", "blau_0000ff"],
      on_sale: true,
    },
    "/api/v1/hm/search",
  ],
  ["product", { article_code: "1310382004" }, "/api/v1/hm/product"],
  ["product", { article_code: "1347936009", country: "ca", language: "fr" }, "/api/v1/hm/product"],
  ["stock", { product_code: "1310382", country: "mo" }, "/api/v1/hm/stock"],
  ["stores", { city: "New York" }, "/api/v1/hm/stores"],
  ["stores", { country: "gb", lat: 51.5, lng: -0.12, radius_km: 5, page_size: 50 }, "/api/v1/hm/stores"],
  ["category", { category: "ladies_dresses", country: "gb" }, "/api/v1/hm/category"],
  ["deals", { country: "gb", department: "men" }, "/api/v1/hm/deals"],
  ["newArrivals", { country: "se", language: "sv" }, "/api/v1/hm/new-arrivals"],
  ["suggestions", { query: "hoodie" }, "/api/v1/hm/suggestions"],
  ["production", { article_code: "1310382004" }, "/api/v1/hm/production"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("hm namespace", () => {
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

  it.each(ENDPOINTS)("hm.%s posts its body to %s", async (method, args, path) => {
    await (client.hm as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each([
    ["stores", "stores"],
    ["deals", "deals"],
    ["newArrivals", "new-arrivals"],
  ])("%s() works with no options", async (method, path) => {
    await (client.hm as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev/api/v1/hm/${path}`);
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.hm)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "category", "deals", "newArrivals", "product", "production", "search", "stock", "stores", "suggestions",
    ]);
  });

  it("timeout: 120 s", () => {
    expect(HM_TIMEOUT).toBe(120_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "hm.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.hm as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(HM_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(HM_TIMEOUT);
    },
  );
});
