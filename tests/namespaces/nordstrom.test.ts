import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, NORDSTROM_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "dress" }, "/api/v1/nordstrom/search"],
  ["search", { query: "dress", page: 2, sort: "percent_off" }, "/api/v1/nordstrom/search"],
  ["product", { style_id: "8098974" }, "/api/v1/nordstrom/product"],
  [
    "product",
    { url: "https://www.nordstrom.com/s/betsy-and-adam-strapless-mixed-media-gown/8098974" },
    "/api/v1/nordstrom/product",
  ],
  ["category", { category: "/browse/women/clothing/dresses" }, "/api/v1/nordstrom/category"],
  ["category", { category: "sale/women", page: 2, sort: "price_low" }, "/api/v1/nordstrom/category"],
  ["brand", { brand: "/brands/astr-the-label--53360" }, "/api/v1/nordstrom/brand"],
  ["brand", { brand: "/brands/astr-the-label--53360/women", page: 3, sort: "newest" }, "/api/v1/nordstrom/brand"],
  ["stores", { zip: "10001" }, "/api/v1/nordstrom/stores"],
  ["stores", { zip: "10001", distance_miles: 25 }, "/api/v1/nordstrom/stores"],
  ["stores", { latitude: 41.8781, longitude: -87.6298 }, "/api/v1/nordstrom/stores"],
  ["stores", { store_numbers: ["210", "220"] }, "/api/v1/nordstrom/stores"],
  ["stores", { store_numbers: "210,220" }, "/api/v1/nordstrom/stores"],
  ["availability", { style_id: "7737947" }, "/api/v1/nordstrom/availability"],
  [
    "availability",
    { url: "https://www.nordstrom.com/s/maeve-midi-dress/7737947", sku_id: "A7578713" },
    "/api/v1/nordstrom/availability",
  ],
  ["suggestions", { query: "nike air" }, "/api/v1/nordstrom/suggestions"],
  ["suggestions", { query: "dre", limit: 20 }, "/api/v1/nordstrom/suggestions"],
];

describe("nordstrom namespace", () => {
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

  it.each(ENDPOINTS)("nordstrom.%s posts its body to %s", async (method, args, path) => {
    const target = client.nordstrom as unknown as Record<string, (opts: Record<string, unknown>) => Promise<unknown>>;
    await target[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("NORDSTROM_TIMEOUT is 120 s", () => {
    expect(NORDSTROM_TIMEOUT).toBe(120_000);
  });

  it.each([
    ["search", { query: "dress" }],
    ["product", { style_id: "8098974" }],
    ["category", { category: "/browse/women/clothing/dresses" }],
    ["brand", { brand: "/brands/astr-the-label--53360" }],
    ["stores", { zip: "10001" }],
    ["availability", { style_id: "7737947" }],
    ["suggestions", { query: "nike air" }],
  ] as const)("nordstrom.%s raises the request timeout, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) =>
      (c.nordstrom as unknown as Record<string, (opts: Record<string, unknown>) => Promise<unknown>>)[method]!(args);

    await call(client);
    expect(delays()).toContain(NORDSTROM_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(NORDSTROM_TIMEOUT);
  });
});
