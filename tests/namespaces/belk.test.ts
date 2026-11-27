import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, BELK_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/belk/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "sweater"}, B + "search"],
  ["search", {"query": "sweater", "sales_promotion": "doorbusters", "brand": ["Calvin Klein", "Michael Kors"], "color": "Red", "size": "Women's Regular/10", "coupon_code": "BFISHERE", "min_discount": 50, "min_price": 25, "max_price": 100, "pickup_store_id": "452", "filters": {"Gender": "Women"}}, B + "search"],
  ["category", {"category": "women/womens-clothing/sweaters"}, B + "category"],
  ["category", {"category": "women/womens-clothing/sweaters", "sales_promotion": "doorbusters", "brand": ["Calvin Klein", "Michael Kors"], "color": "Red", "size": "Women's Regular/10", "coupon_code": "BFISHERE", "min_discount": 50, "min_price": 25, "max_price": 100, "pickup_store_id": "452", "filters": {"Gender": "Women"}}, B + "category"],
  ["deals", {}, B + "deals"],
  ["deals", {"type": "doorbusters", "category": "women", "brand": ["Calvin Klein", "Michael Kors"], "color": "Red", "size": "Women's Regular/10", "coupon_code": "BFISHERE", "min_discount": 50, "min_price": 25, "max_price": 100, "pickup_store_id": "452", "filters": {"Gender": "Women"}}, B + "deals"],
  ["categories", {}, B + "categories"],
  ["product", {"product_id": "18000269151219"}, B + "product"],
  ["variant", {"variant_id": "0480046046048"}, B + "variant"],
  ["storeAvailability", {"store_ids": ["452", "329", "270"], "variant_id": "0480046046048"}, B + "store-availability"],
  ["storeAvailability", {"store_ids": ["452", "329", "270"], "variant_id": "0480046046048", "orin": "472209216"}, B + "store-availability"],
  ["stores", {"zip": "28202"}, B + "stores"],
  ["store", {"store_id": "452"}, B + "store"],
  ["reviews", {"product_id": "18000269151219"}, B + "reviews"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("belk namespace", () => {
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

  it.each(ENDPOINTS)("belk.%s posts its body to %s", async (method, args, path) => {
    await (client.belk as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals", "categories"])("%s() works with no options", async (method) => {
    await (client.belk as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 10 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.belk)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "deals", "product", "reviews", "search", "store", "storeAvailability", "stores", "variant"]);
  });

  it("timeout: 240 s", () => {
    expect(BELK_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "belk.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = BELK_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.belk as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
