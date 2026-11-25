import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, OFFERUP_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/offerup/";
const ENDPOINTS: Row[] = [
  ["search", { q: "iphone 15", zip: "98101" }, B + "search"],
  ["search", { q: "toyota tacoma", zip: 75201, radius: 80, page: 2, sort: "lowest_mileage", category_id: "5.1", min_price: 5000, max_price: 60000, condition: ["used"], seller_type: "dealer", make: "Toyota", year_min: 2018, year_max: 2026, max_mileage: 100_000 }, B + "search"],
  ["listing", { listing_id: "7a392126-fb9d-34c2-a6d8-1b94698428df" }, B + "listing"],
  ["listing", { url: "https://offerup.com/item/detail/7a392126-fb9d-34c2-a6d8-1b94698428df" }, B + "listing"],
  ["category", { category: "furniture", zip: "90012" }, B + "category"],
  ["category", { category: "cars-and-trucks", zip: "75201", sort: "newest_year", condition: "used,refurbished", radius: 100 }, B + "category"],
  ["categories", {}, B + "categories"],
  ["seller", { seller_id: "8668343" }, B + "seller"],
  ["seller", { seller_id: 8668343 }, B + "seller"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("offerup namespace", () => {
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

  it.each(ENDPOINTS)("offerup.%s posts its body to %s", async (method, args, path) => {
    await (client.offerup as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("categories() works with no options", async () => {
    await client.offerup.categories();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}categories`);
    expect(body()).toEqual({});
  });

  it("has all 5 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.offerup)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "listing", "search", "seller"]);
  });

  it("timeout: 240 s", () => {
    expect(OFFERUP_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "offerup.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.offerup as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(OFFERUP_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(OFFERUP_TIMEOUT);
    },
  );
});
