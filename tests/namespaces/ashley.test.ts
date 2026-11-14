import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ASHLEY_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "sofa", sort: "price_asc", page: 2 }, "/api/v1/ashley/search"],
  ["search", { query: "koltuk", country: "tr" }, "/api/v1/ashley/search"],
  ["product", { sku: "5950418" }, "/api/v1/ashley/product"],
  ["product", { handle: "aviemore-sofa", country: "ca" }, "/api/v1/ashley/product"],
  ["product", { url: "https://store.ashleyfurniture.com.mx/products/cashton-sofa" }, "/api/v1/ashley/product"],
  [
    "category",
    { path: "furniture/living-room/sofas", filters: { facetUpholsteryDesign: "Chaise" } },
    "/api/v1/ashley/category",
  ],
  [
    "category",
    {
      category_url: "https://www.ashleyfurniture.com/c/furniture/living-room/sofas/",
      price_min: 200,
      price_max: 899.99,
    },
    "/api/v1/ashley/category",
  ],
  ["deals", { event: "clearance", sort: "price_desc" }, "/api/v1/ashley/deals"],
  ["stores", { lat: 40.7506, lng: -73.9972, radius: 25 }, "/api/v1/ashley/stores"],
  ["store", { store_id: "us/wisconsin/greenfield/4771-s-27th-st/luxe" }, "/api/v1/ashley/store"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("ashley namespace", () => {
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

  it.each(ENDPOINTS)("ashley.%s posts its body to %s", async (method, args, path) => {
    await (client.ashley as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("deals() works with no options", async () => {
    await client.ashley.deals();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/ashley/deals");
    expect(body()).toEqual({});
  });

  it("has all 6 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.ashley)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["category", "deals", "product", "search", "store", "stores"]);
  });

  it("timeout: 120 s", () => {
    expect(ASHLEY_TIMEOUT).toBe(120_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "ashley.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.ashley as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(ASHLEY_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(ASHLEY_TIMEOUT);
    },
  );
});
