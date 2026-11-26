import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, CARMAX_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/carmax/";
const ENDPOINTS: Row[] = [
  ["search", {"zip": "75201"}, B + "search"],
  ["search", {"zip": "75201", "make": "Ford", "model": "F-150", "body_type": "suvs", "filters": ["all-wheel-drive", "black"], "year_min": 2021, "year_max": 2023, "price_max": 30000, "mileage_max": 60000, "sort": "price_asc", "radius": "100"}, B + "search"],
  ["listing", {"stock_number": "28466923"}, B + "listing"],
  ["photos", {"stock_number": "28466923"}, B + "photos"],
  ["stores", {"zip": "75201"}, B + "stores"],
  ["store", {"store_id": "7115"}, B + "store"],
  ["storeInventory", {"store_id": "7115", "zip": "75201"}, B + "store-inventory"],
  ["storeInventory", {"store_id": "7115", "zip": "75201", "make": "Ford", "model": "F-150", "body_type": "suvs", "filters": ["all-wheel-drive", "black"], "year_min": 2021, "year_max": 2023, "price_max": 30000, "mileage_max": 60000, "sort": "price_asc"}, B + "store-inventory"],
  ["reviews", {"make": "Toyota", "model": "RAV4", "year": 2022}, B + "reviews"],
  ["reviewSummary", {"make": "Toyota", "model": "RAV4", "year": 2022}, B + "review-summary"],
  ["suggestions", {"query": "rav"}, B + "suggestions"],
  ["makes", {}, B + "makes"],
  ["models", {"make": "toyota"}, B + "models"],
  ["carValue", {"make": "Ford", "model": "F-150", "year": 2019}, B + "car-value"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("carmax namespace", () => {
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

  it.each(ENDPOINTS)("carmax.%s posts its body to %s", async (method, args, path) => {
    await (client.carmax as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["makes"])("%s() works with no options", async (method) => {
    await (client.carmax as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 12 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.carmax)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["carValue", "listing", "makes", "models", "photos", "reviewSummary", "reviews", "search", "store", "storeInventory", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(CARMAX_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "carmax.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = CARMAX_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.carmax as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
