import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, BOLCOM_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "airpods" }, "/api/v1/bolcom/search"],
  [
    "search",
    {
      query: "aspirateur",
      country: "be",
      language: "fr",
      page: 2,
      sort: "price_asc",
      condition: ["refurbished", "second_hand"],
      delivery: "tomorrow",
      brand_facet_id: "4294862300",
      facets: ["58334"],
      price_min: 10,
      price_max: 99.5,
    },
    "/api/v1/bolcom/search",
  ],
  ["product", { product_id: "9300000239314960" }, "/api/v1/bolcom/product"],
  ["product", { ean: "4242005483976", country: "be", language: "fr" }, "/api/v1/bolcom/product"],
  ["offers", { product_id: "9300000240171936", country: "be" }, "/api/v1/bolcom/offers"],
  ["seller", { seller_id: "1770745" }, "/api/v1/bolcom/seller"],
  ["sellerProducts", { seller_id: "1767374", page: 2, sort: "rating" }, "/api/v1/bolcom/seller-products"],
  ["category", { category_id: "8440", deals_only: true, select_deals: true }, "/api/v1/bolcom/category"],
  ["brand", { brand_id: "5070005", sort: "price_desc" }, "/api/v1/bolcom/brand"],
  ["deals", { country: "be" }, "/api/v1/bolcom/deals"],
  ["campaign", { campaign_id: "555136", page: 2 }, "/api/v1/bolcom/campaign"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("bolcom namespace", () => {
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

  it.each(ENDPOINTS)("bolcom.%s posts its body to %s", async (method, args, path) => {
    await (client.bolcom as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("product_id stays a string on the wire", async () => {
    await client.bolcom.product({ product_id: "9300000239314960" });
    const raw = (vi.mocked(fetch).mock.calls[0]![1] as RequestInit).body as string;
    expect(raw).toContain('"product_id":"9300000239314960"');
  });

  it("deals() works with no options", async () => {
    await client.bolcom.deals();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/bolcom/deals");
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.bolcom)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brand", "campaign", "category", "deals", "offers", "product", "search", "seller", "sellerProducts",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(BOLCOM_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "bolcom.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.bolcom as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(BOLCOM_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(BOLCOM_TIMEOUT);
    },
  );
});
