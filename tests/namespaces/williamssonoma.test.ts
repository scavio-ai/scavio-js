import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, WILLIAMSSONOMA_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/williamssonoma/";
const ENDPOINTS: Row[] = [
  ["product", {"product": "gabrielle-upholstered-sofa", "brand": "pottery_barn"}, B + "product"],
  ["configurator", {"base_sku": "4889446", "brand": "pottery_barn"}, B + "configurator"],
  ["deliveryEstimate", {"zip": "94103", "product": "gabrielle-upholstered-sofa", "brand": "pottery_barn"}, B + "delivery-estimate"],
  ["stock", {"product": "wusthof-classic-chefs-knife", "brand": "pottery_barn"}, B + "stock"],
  ["storePickup", {"brand": "williams_sonoma", "skus": ["1468824", "2600435"], "stores": ["ST:0859", "ST:6016"]}, B + "store-pickup"],
  ["stores", {"zip": "60611"}, B + "stores"],
  ["stores", {"zip": "60611", "brands": ["williams_sonoma", "pottery_barn"]}, B + "stores"],
  ["floorSamples", {"product": "gabrielle-upholstered-sofa", "brand": "pottery_barn", "zip": "94103"}, B + "floor-samples"],
  ["categories", {"brand": "pottery_barn"}, B + "categories"],
  ["categories", {"brand": "pottery_barn", "category": "furniture"}, B + "categories"],
  ["category", {"brand": "pottery_barn", "path": "furniture/sofas"}, B + "category"],
  ["search", {"brand": "williams_sonoma", "query": "chef knife"}, B + "search"],
  ["popularSearches", {"brand": "williams_sonoma"}, B + "popular-searches"],
  ["reviews", {"product": "shun-classic-chefs-knife", "brand": "williams_sonoma"}, B + "reviews"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("williamssonoma namespace", () => {
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

  it.each(ENDPOINTS)("williamssonoma.%s posts its body to %s", async (method, args, path) => {
    await (client.williamssonoma as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 12 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.williamssonoma)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "configurator", "deliveryEstimate", "floorSamples", "popularSearches", "product", "reviews", "search", "stock", "storePickup", "stores"]);
  });

  it("timeout: 240 s", () => {
    expect(WILLIAMSSONOMA_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "williamssonoma.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = WILLIAMSSONOMA_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.williamssonoma as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
