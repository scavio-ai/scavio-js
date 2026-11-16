import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, MERCARI_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "nintendo switch" }, "/api/v1/mercari/search"],
  [
    "search",
    { query: "nintendo switch", status: "sold", sort: "recently_sold", page: 2 },
    "/api/v1/mercari/search",
  ],
  [
    "search",
    {
      query: "ポケモンカード",
      country: "jp",
      price_min: 1000,
      price_max: 5000.5,
      condition: ["new", "like_new"],
      shipping: "free",
      shops_only: true,
    },
    "/api/v1/mercari/search",
  ],
  ["search", { category_id: 797, brand_id: "4591", deals_only: true, size_id: 12 }, "/api/v1/mercari/search"],
  ["item", { item_id: "m38943035688" }, "/api/v1/mercari/item"],
  ["item", { url: "https://jp.mercari.com/item/m65962821601" }, "/api/v1/mercari/item"],
  ["category", { category_id: "797", status: "sold" }, "/api/v1/mercari/category"],
  ["categories", { parent_id: "7" }, "/api/v1/mercari/categories"],
  ["categories", { country: "jp" }, "/api/v1/mercari/categories"],
  ["brands", { query: "nike", page: 2 }, "/api/v1/mercari/brands"],
  ["brand", { brand_id: 4591, category_id: "797", sort: "price_asc" }, "/api/v1/mercari/brand"],
  ["deals", { query: "jordan" }, "/api/v1/mercari/deals"],
  ["trending", { country: "us" }, "/api/v1/mercari/trending"],
  ["seller", { seller_id: "477123966" }, "/api/v1/mercari/seller"],
  ["sellerReviews", { url: "https://jp.mercari.com/user/profile/477123966" }, "/api/v1/mercari/seller-reviews"],
  ["shop", { shop_id: "LThudSk3aoGvKcW6R3sA6m" }, "/api/v1/mercari/shop"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("mercari namespace", () => {
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

  it.each(ENDPOINTS)("mercari.%s posts its body to %s", async (method, args, path) => {
    await (client.mercari as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each([
    ["categories", "categories"],
    ["brands", "brands"],
    ["deals", "deals"],
    ["trending", "trending"],
  ])("%s() works with no options", async (method, path) => {
    await (client.mercari as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev/api/v1/mercari/${path}`);
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.mercari)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brand", "brands", "categories", "category", "deals", "item", "search", "seller", "sellerReviews",
      "shop", "trending",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(MERCARI_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "mercari.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.mercari as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(MERCARI_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(MERCARI_TIMEOUT);
    },
  );
});
