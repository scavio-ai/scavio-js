import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, PICHAU_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/pichau/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "rtx 5060"}, B + "search"],
  ["search", {"query": "rtx 5060", "sort": "price_asc", "page": 2, "filters": {"brand": "gainward"}}, B + "search"],
  ["category", {"category": "hardware/placa-de-video"}, B + "category"],
  ["brand", {"brand": "corsair", "sort": "price_desc"}, B + "brand"],
  ["deals", {"deal": "open_box"}, B + "deals"],
  ["product", {"url_key": "placa-de-video-inno3d-geforce-rtx-5060-twin-x2-8gb-gddr7-128-bit-n50602-08d7-195071n-nac"}, B + "product"],
  ["productLive", {"url_key": "pc-gamer-pichau-isis-vi-amd-ryzen-5-5500-geforce-rtx-5060-8gb-16gb-ddr4-ssd-m-2-480gb-57268"}, B + "product-live"],
  ["reviews", {"product_id": 31201, "page": 2, "rating": 5, "with_media": true}, B + "reviews"],
  ["installments", {"product_id": 61004, "price": 3717.64}, B + "installments"],
  ["coupons", {}, B + "coupons"],
  ["categories", {"all": true}, B + "categories"],
  ["suggestions", {"query": "rtx"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("pichau namespace", () => {
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

  it.each(ENDPOINTS)("pichau.%s posts its body to %s", async (method, args, path) => {
    await (client.pichau as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals", "coupons", "categories"])("%s() works with no options", async (method) => {
    await (client.pichau as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.pichau)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brand", "categories", "category", "coupons", "deals", "installments", "product", "productLive", "reviews", "search", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(PICHAU_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "pichau.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = PICHAU_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.pichau as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
