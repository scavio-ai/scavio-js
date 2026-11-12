import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, OLX_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "iphone" }, "/api/v1/olx/search"],
  [
    "search",
    {
      query: "iphone",
      sort: "newest",
      min_price: 500,
      condition: "used",
      seller_type: "private",
      olx_delivery: true,
      city_id: 17871,
      distance_km: 30,
      page: 2,
      page_size: 50,
    },
    "/api/v1/olx/search",
  ],
  [
    "search",
    {
      category_id: "84",
      filters: { "filter_float_year:from": 2018, filter_enum_rooms: ["two", "three"] },
      include_promoted: false,
    },
    "/api/v1/olx/search",
  ],
  ["search", { query: "velosiped", country: "uz", language: "uz" }, "/api/v1/olx/search"],
  ["offer", { offer_id: "1107557408" }, "/api/v1/olx/offer"],
  ["offer", { offer_id: 402863292, country: "kz", language: "kk" }, "/api/v1/olx/offer"],
  ["seller", { user_id: "2547532895" }, "/api/v1/olx/seller"],
  ["sellerAds", { user_id: 2547532895, sort: "price_low_to_high", country: "ro" }, "/api/v1/olx/seller-ads"],
  ["filters", { category_id: 14, region_id: 2, query: "mieszkanie" }, "/api/v1/olx/filters"],
  ["categories", { parent_id: 5 }, "/api/v1/olx/categories"],
  ["locations", { query: "Warszawa" }, "/api/v1/olx/locations"],
  ["suggestions", { query: "rower", country: "bg" }, "/api/v1/olx/suggestions"],
  ["similar", { url: "https://www.olx.pl/d/oferta/x-ID1cXcha.html" }, "/api/v1/olx/similar"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("olx namespace", () => {
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

  it.each(ENDPOINTS)("olx.%s posts its body to %s", async (method, args, path) => {
    await (client.olx as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("categories() works with no options", async () => {
    await client.olx.categories();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/olx/categories");
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.olx)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(
      [
        "search",
        "offer",
        "seller",
        "sellerAds",
        "filters",
        "categories",
        "locations",
        "suggestions",
        "similar",
      ].sort(),
    );
  });

  it("OLX_TIMEOUT is 120 s", () => {
    expect(OLX_TIMEOUT).toBe(120_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "olx.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.olx as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(OLX_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(OLX_TIMEOUT);
    },
  );
});
