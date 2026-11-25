import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, DISCOUNTTIRE_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/discounttire/";
const ENDPOINTS: Row[] = [
  ["search", { size: "225/65R17", store: "1009" }, B + "search"],
  ["search", { width: 225, aspect_ratio: 65, diameter: 17, zip: "85251", sort: "price_low", brand: ["Michelin"], filters: ["brands:brand-MCH"], page: 2, page_size: 50, min_price: 100, max_price: 300, instant_savings: true, in_stock: true, category: "All-Season Tires", speed_rating: "H", load_range: "XL", three_peak: true, run_flat: false, rebates: true, mileage_warranty: "60,000-70,000" }, B + "search"],
  ["search", { size: "245/35R19", rear_size: "305/30R20", store: 1009 }, B + "search"],
  ["vehicle", { year: 2022, make: "Ford" }, B + "vehicle"],
  ["vehicle", { vehicle_id: "17361", trim_id: "52455", assembly_id: "0000E28B" }, B + "vehicle"],
  ["vehicleTires", { vehicle_id: "17361", trim_id: "52455", assembly_id: "0000E28B", store: "1009" }, B + "vehicle-tires"],
  ["vehicleTires", { vehicle_id: "16990", trim_id: "51166", assembly_id: "0000DI40", zip: "85251", position: "front", ranking: "treadwell", sort: "treadwell" }, B + "vehicle-tires"],
  ["product", { item_number: "108547", store: "1009" }, B + "product"],
  ["product", { item_number: 108547, zip: "85251", nearby_stores: ["1022", 1003] }, B + "product"],
  ["model", { model_id: "michelin-defender-2", type: "tires", store: "1009" }, B + "model"],
  ["storeStock", { item_number: "108547", zip: "85251" }, B + "store-stock"],
  ["storeStock", { item_numbers: ["102019", "102020"], zip: 85251, radius: 50, sort: "availability", page: 2, quantity: 2, store: "1009" }, B + "store-stock"],
  ["stores", { zip: "85251" }, B + "stores"],
  ["stores", { city: "Phoenix, AZ", radius: 25, page: 2 }, B + "stores"],
  ["stores", { latitude: 33.47, longitude: -111.92 }, B + "stores"],
  ["store", { store_code: "1009" }, B + "store"],
  ["reviews", { item_number: "108547", scope: "size", sort: "most_helpful", rating: 5, page: 3, page_size: 50 }, B + "reviews"],
  ["storeReviews", { store_code: 1009, sort: "lowest", rating: 1, page: 2 }, B + "store-reviews"],
  ["wheels", { diameter: 20, width: 9, bolt_pattern: "6-135", store: "1009" }, B + "wheels"],
  ["wheels", { vehicle_id: "17361", trim_id: "52455", assembly_id: "0000E28B", zip: "85251", color: "Black", special_offers: true }, B + "wheels"],
  ["browse", { category: "all-season-tires", store: "1009" }, B + "browse"],
  ["browse", { q: "michelin defender", zip: "85251", sort: "relevance" }, B + "browse"],
  ["categories", { type: "wheels" }, B + "categories"],
  ["suggestions", { q: "michelin" }, B + "suggestions"],
  ["appointments", { store_code: "1009", month: 12 }, B + "appointments"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("discounttire namespace", () => {
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

  it.each(ENDPOINTS)("discounttire.%s posts its body to %s", async (method, args, path) => {
    await (client.discounttire as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["vehicle", "categories"])("%s() works with no options", async (method) => {
    await (client.discounttire as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}${method}`);
    expect(body()).toEqual({});
  });

  it("has all 15 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.discounttire)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "appointments", "browse", "categories", "model", "product", "reviews", "search", "store",
      "storeReviews", "storeStock", "stores", "suggestions", "vehicle", "vehicleTires", "wheels",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(DISCOUNTTIRE_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "discounttire.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.discounttire as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(DISCOUNTTIRE_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(DISCOUNTTIRE_TIMEOUT);
    },
  );
});
