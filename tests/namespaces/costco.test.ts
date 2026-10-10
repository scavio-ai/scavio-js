import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown> | undefined, path: string];

// Method names match the dashboard Playground's SDK snippets (costco.<endpoint>).
const ENDPOINTS: Row[] = [
  ["search", { query: "olive oil" }, "/api/v1/costco/search"],
  ["category", { category: "televisions" }, "/api/v1/costco/category"],
  ["categories", { category_id: "30001" }, "/api/v1/costco/categories"],
  ["product", { item_id: "100334960" }, "/api/v1/costco/product"],
  ["prices", { item_id: "1492456", warehouse_ids: ["1062", "1107"] }, "/api/v1/costco/prices"],
  ["availability", { item_number: "1492456", warehouse_ids: ["1062"] }, "/api/v1/costco/availability"],
  ["reviews", { product_id: "100334960" }, "/api/v1/costco/reviews"],
  ["warehouses", { zip: "10025" }, "/api/v1/costco/warehouses"],
  ["gas", { zip: "90001" }, "/api/v1/costco/gas"],
  ["coupons", {}, "/api/v1/costco/coupons"],
  ["deals", { type: "treasure_hunt" }, "/api/v1/costco/deals"],
  ["clearance", { warehouse_id: "1062", query: "snacks" }, "/api/v1/costco/clearance"],
  ["autocomplete", { query: "kirk" }, "/api/v1/costco/autocomplete"],
];

describe("CostcoNamespace", () => {
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

  it("exposes all 13 endpoints", () => {
    expect(ENDPOINTS).toHaveLength(13);
  });

  it.each(ENDPOINTS)("%s posts its body to %s", async (method, args, path) => {
    const ns = client.costco as unknown as Record<
      string,
      (opts?: Record<string, unknown>) => Promise<unknown>
    >;
    await ns[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(JSON.parse((call[1] as RequestInit).body as string)).toEqual(args);
  });

  it("search carries warehouse pricing and listing filters in snake_case", async () => {
    await client.costco.search({
      query: "olive oil",
      warehouse_id: "1062",
      sort_by: "price_low",
      brands: ["Kirkland Signature"],
      min_price: 9.99,
      in_warehouse: true,
      page_size: 5,
    });
    const body = JSON.parse((vi.mocked(fetch).mock.calls[0]![1] as RequestInit).body as string);
    expect(body).toEqual({
      query: "olive oil",
      warehouse_id: "1062",
      sort_by: "price_low",
      brands: ["Kirkland Signature"],
      min_price: 9.99,
      in_warehouse: true,
      page_size: 5,
    });
  });

  it("product accepts a list of ids", async () => {
    await client.costco.product({ item_ids: ["100334960", "1492456"] });
    const body = JSON.parse((vi.mocked(fetch).mock.calls[0]![1] as RequestInit).body as string);
    expect(body).toEqual({ item_ids: ["100334960", "1492456"] });
  });

  it("coupons and categories can be called with no arguments", async () => {
    await client.costco.coupons();
    await client.costco.categories();
    const calls = vi.mocked(fetch).mock.calls;
    expect(calls[0]![0]).toBe("https://api.scavio.dev/api/v1/costco/coupons");
    expect(JSON.parse((calls[0]![1] as RequestInit).body as string)).toEqual({});
    expect(calls[1]![0]).toBe("https://api.scavio.dev/api/v1/costco/categories");
    expect(JSON.parse((calls[1]![1] as RequestInit).body as string)).toEqual({});
  });

  it("clearance sends price_codes as an array", async () => {
    await client.costco.clearance({
      warehouse_id: "1062",
      category: "snacks",
      pages: 5,
      price_codes: ["clearance", "special_buy"],
      country: "us",
    });
    const body = JSON.parse((vi.mocked(fetch).mock.calls[0]![1] as RequestInit).body as string);
    expect(body).toEqual({
      warehouse_id: "1062",
      category: "snacks",
      pages: 5,
      price_codes: ["clearance", "special_buy"],
      country: "us",
    });
  });

  it("gas accepts warehouse_ids instead of a location", async () => {
    await client.costco.gas({ warehouse_ids: ["1062", "1107"], country: "ca" });
    const body = JSON.parse((vi.mocked(fetch).mock.calls[0]![1] as RequestInit).body as string);
    expect(body).toEqual({ warehouse_ids: ["1062", "1107"], country: "ca" });
  });
});
