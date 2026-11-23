import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, OREILLY_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/oreilly/";
const ENDPOINTS: Row[] = [
  ["search", { query: "brake pads" }, B + "search"],
  ["search", { query: "brake pads", vehicle: { base_vehicle_id: 129927 }, sort: "price_asc", page: 2, availability: "store_pickup", brand: "Wagner_OEX", filters: { "/attributes/prodAttr_32769": "104088" } }, B + "search"],
  ["crossReference", { part_number: "PH3614" }, B + "cross-reference"],
  ["crossReference", { part_number: "PH3614", part_type_id: "02269", manufacturer: "FRAM" }, B + "cross-reference"],
  ["product", { url: "https://www.oreillyauto.com/detail/c/brakebest-select-brake-pads/brakebest-select-ceramic-brake-pads/bsg0/sc1001" }, B + "product"],
  ["product", { line_code: "BB", part_number: "SC1001", vehicle: { base_vehicle_id: 129927 } }, B + "product"],
  ["vehicles", { level: "resolve", year: 2015, make_id: 23076, model_id: 31549 }, B + "vehicles"],
  ["vehicles", { level: "vin", vin: "1HGCM82633A004352" }, B + "vehicles"],
  ["compatibility", { line_code: "BB", part_number: "SC1001", make: "Ford" }, B + "compatibility"],
  ["category", { category: "/shop/b/brakes/brake-pads---shoes/brake-pads/a99314144bb6", vehicle: { base_vehicle_id: 129927 } }, B + "category"],
  ["categories", { root: "95397663b44a" }, B + "categories"],
  ["brand", { brand: "https://www.oreillyauto.com/shop/brands/a/3m/mmm", sort: "best_selling" }, B + "brand"],
  ["storeStock", { line_code: "SSB", part_number: "48PLT", zip: "60540" }, B + "store-stock"],
  ["storeStock", { line_code: "BB", part_number: "SC1001", latitude: 29.75, longitude: -95.36, quantity: 2 }, B + "store-stock"],
  ["stores", { zip: "77002" }, B + "stores"],
  ["stores", { state: "jal", city: "guadalajara", country: "mx" }, B + "stores"],
  ["store", { store_id: "4973" }, B + "store"],
  ["store", { store_number: "7601", state: "jal", city: "guadalajara", country: "mx" }, B + "store"],
  ["suggestions", { query: "brake" }, B + "suggestions"],
  ["rebates", {}, B + "rebates"],
  ["deals", {}, B + "deals"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("oreilly namespace", () => {
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

  it.each(ENDPOINTS)("oreilly.%s posts its body to %s", async (method, args, path) => {
    await (client.oreilly as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each([
    ["vehicles", "vehicles"],
    ["categories", "categories"],
    ["brand", "brand"],
    ["rebates", "rebates"],
    ["deals", "deals"],
  ])("%s() works with no options", async (method, path) => {
    await (client.oreilly as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}${path}`);
    expect(body()).toEqual({});
  });

  it("has all 14 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.oreilly)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brand", "categories", "category", "compatibility", "crossReference", "deals", "product", "rebates",
      "search", "store", "storeStock", "stores", "suggestions", "vehicles",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(OREILLY_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "oreilly.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.oreilly as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(OREILLY_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(OREILLY_TIMEOUT);
    },
  );
});
