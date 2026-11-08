import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, NORDSTROM_RACK_TIMEOUT, NORDSTROM_RACK_REVIEWS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "dress" }, "/api/v1/nordstromrack/search"],
  ["search", { query: "dress", page: 2, sort: "percent_off" }, "/api/v1/nordstromrack/search"],
  ["product", { style_id: "8816500" }, "/api/v1/nordstromrack/product"],
  ["product", { url: "https://www.nordstromrack.com/s/maeve-midi-dress/7737947" }, "/api/v1/nordstromrack/product"],
  ["category", { category: "/clearance/women", sort: "percent_off" }, "/api/v1/nordstromrack/category"],
  ["category", { category: "/shop/flash/event-7", page: 2 }, "/api/v1/nordstromrack/category"],
  ["brand", { brand: "/brands/adidas" }, "/api/v1/nordstromrack/brand"],
  ["stores", { zip: "10001", distance_miles: 25 }, "/api/v1/nordstromrack/stores"],
  ["stores", { latitude: 34.05, longitude: -118.24 }, "/api/v1/nordstromrack/stores"],
  ["stores", { store_numbers: ["229", "242"] }, "/api/v1/nordstromrack/stores"],
  [
    "availability",
    { url: "https://www.nordstromrack.com/s/maeve-midi-dress/7737947", sku_id: "A5819201" },
    "/api/v1/nordstromrack/availability",
  ],
  ["suggestions", { query: "dre", limit: 5 }, "/api/v1/nordstromrack/suggestions"],
  ["reviews", { style_id: "7737947", stars: [1, 2], max_reviews: 18 }, "/api/v1/nordstromrack/reviews"],
  ["reviews", { style_id: "7737947", search: "comfortable" }, "/api/v1/nordstromrack/reviews"],
];

type Ns = Record<string, (opts: Record<string, unknown>) => Promise<unknown>>;

describe("nordstromRack namespace", () => {
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

  it.each(ENDPOINTS)("nordstromRack.%s posts its body to %s", async (method, args, path) => {
    await (client.nordstromRack as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("NORDSTROM_RACK_TIMEOUT is 120 s, NORDSTROM_RACK_REVIEWS_TIMEOUT 150 s", () => {
    expect(NORDSTROM_RACK_TIMEOUT).toBe(120_000);
    expect(NORDSTROM_RACK_REVIEWS_TIMEOUT).toBe(150_000);
  });

  it.each([
    ["search", { query: "dress" }],
    ["product", { style_id: "8816500" }],
    ["category", { category: "/clearance" }],
    ["brand", { brand: "/brands/adidas" }],
    ["stores", { zip: "10001" }],
    ["availability", { style_id: "7737947" }],
    ["suggestions", { query: "dre" }],
  ] as const)("nordstromRack.%s raises the request timeout, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => (c.nordstromRack as unknown as Ns)[method]!(args);

    await call(client);
    expect(delays()).toContain(NORDSTROM_RACK_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(NORDSTROM_RACK_TIMEOUT);
  });

  it("nordstromRack.reviews raises the request timeout to 150 s, never lowers it", async () => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);

    await client.nordstromRack.reviews({ style_id: "7737947" });
    expect(delays()).toContain(NORDSTROM_RACK_REVIEWS_TIMEOUT);
    expect(delays()).not.toContain(NORDSTROM_RACK_TIMEOUT);

    spy.mockClear();
    await new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }).nordstromRack.reviews({
      style_id: "7737947",
    });
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(NORDSTROM_RACK_REVIEWS_TIMEOUT);
  });
});
