import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, SALLYBEAUTY_TIMEOUT, SALLYBEAUTY_REVIEWS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/sallybeauty/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "purple shampoo"}, B + "search"],
  ["search", {"query": "shampoo", "site": "cosmoprof-us", "sort": "newest", "page": 2, "filters": {"brandcustom": "Redken"}}, B + "search"],
  ["category", {"category": "hair-color", "sort": "price_asc"}, B + "category"],
  ["clearance", {"department": "nails", "price_max": 10}, B + "clearance"],
  ["product", {"product_id": "SBS-302313"}, B + "product"],
  ["stores", {"postal_code": "75201", "radius": 30}, B + "stores"],
  ["storeStock", {"product_id": "SBS-302313", "postal_code": "90012"}, B + "store-stock"],
  ["suggestions", {"query": "wahl"}, B + "suggestions"],
  ["brands", {"site": "sally-ca"}, B + "brands"],
  ["reviews", {"product_id": "SBS-345331"}, B + "reviews"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("sallybeauty namespace", () => {
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

  it.each(ENDPOINTS)("sallybeauty.%s posts its body to %s", async (method, args, path) => {
    await (client.sallybeauty as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.sallybeauty)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brands", "category", "clearance", "product", "reviews", "search", "storeStock", "stores", "suggestions"]);
  });

  it("timeout: 180 s, reviews 240 s", () => {
    expect(SALLYBEAUTY_TIMEOUT).toBe(180_000);
    expect(SALLYBEAUTY_REVIEWS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "sallybeauty.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = method === "reviews" ? SALLYBEAUTY_REVIEWS_TIMEOUT : SALLYBEAUTY_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.sallybeauty as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
