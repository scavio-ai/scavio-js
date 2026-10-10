import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

// Method names match the dashboard Playground's SDK snippets
// (realtor.<endpoint>, rightmove.<endpoint>, sold-property -> soldProperty).
const REALTOR: Row[] = [
  ["search", { location: "Maricopa County, AZ" }, "/api/v1/realtor/search"],
  ["property", { property_id: "9564057635" }, "/api/v1/realtor/property"],
  ["locations", { query: "Austin" }, "/api/v1/realtor/locations"],
  ["market", { location: "Austin_TX" }, "/api/v1/realtor/market"],
  ["agents", { location: "Austin, TX" }, "/api/v1/realtor/agents"],
  ["agent", { agent_id: "1918615" }, "/api/v1/realtor/agent"],
];

const RIGHTMOVE: Row[] = [
  ["locations", { query: "Bristol" }, "/api/v1/rightmove/locations"],
  ["search", { location_id: "REGION^219" }, "/api/v1/rightmove/search"],
  ["property", { property_id: "93577917" }, "/api/v1/rightmove/property"],
  ["sold", { location: "Bristol" }, "/api/v1/rightmove/sold"],
  ["soldProperty", { sold_id: "921d33f4-d206-4991-be4d-75cbe71981ce" }, "/api/v1/rightmove/sold-property"],
  ["agents", { location: "Bristol" }, "/api/v1/rightmove/agents"],
  ["agent", { branch_id: "201404" }, "/api/v1/rightmove/agent"],
];

function body(call = 0): unknown {
  return JSON.parse((vi.mocked(fetch).mock.calls[call]![1] as RequestInit).body as string);
}

type AnyNs = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("RealtorNamespace and RightmoveNamespace", () => {
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

  it("exposes 6 Realtor.com and 7 Rightmove endpoints", () => {
    expect(REALTOR).toHaveLength(6);
    expect(RIGHTMOVE).toHaveLength(7);
  });

  it.each(REALTOR)("realtor.%s posts its body to %s", async (method, args, path) => {
    await (client.realtor as unknown as AnyNs)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(RIGHTMOVE)("rightmove.%s posts its body to %s", async (method, args, path) => {
    await (client.rightmove as unknown as AnyNs)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("realtor.search carries sold-comp filters, keywords and page_size", async () => {
    await client.realtor.search({
      location: "Maricopa County, AZ",
      listing_status: "sold",
      property_types: ["land"],
      sold_within_days: 365,
      lot_sqft_min: 43560,
      max_price: 150000,
      keywords: ["workshop"],
      sort: "sold_newest",
      page_size: 200,
    });
    expect(body()).toEqual({
      location: "Maricopa County, AZ",
      listing_status: "sold",
      property_types: ["land"],
      sold_within_days: 365,
      lot_sqft_min: 43560,
      max_price: 150000,
      keywords: ["workshop"],
      sort: "sold_newest",
      page_size: 200,
    });
  });

  it("realtor.search accepts a radius point instead of a location", async () => {
    await client.realtor.search({ latitude: 30.27, longitude: -97.74, radius_miles: 2.5 });
    expect(body()).toEqual({ latitude: 30.27, longitude: -97.74, radius_miles: 2.5 });
  });

  it("realtor.property accepts a URL instead of an id", async () => {
    const url = "https://www.realtor.com/realestateandhomes-detail/7202-Eagle-Rose-Rd_Austin_TX_78744_M95640-57635";
    await client.realtor.property({ url });
    expect(body()).toEqual({ url });
  });

  it("rightmove.search carries rental filters", async () => {
    await client.rightmove.search({
      location: "Bristol",
      listing_status: "for_rent",
      max_price: 1800,
      beds_min: 2,
      property_types: ["flat"],
      furnishing: ["furnished"],
      let_type: "long_term",
      added_within_days: 7,
      radius_miles: 0.5,
      page: 2,
    });
    expect(body()).toEqual({
      location: "Bristol",
      listing_status: "for_rent",
      max_price: 1800,
      beds_min: 2,
      property_types: ["flat"],
      furnishing: ["furnished"],
      let_type: "long_term",
      added_within_days: 7,
      radius_miles: 0.5,
      page: 2,
    });
  });

  it("rightmove.sold carries type, years and sort", async () => {
    await client.rightmove.sold({ location: "SW11", property_type: "flat", sold_within_years: 5, sort: "price_high" });
    expect(body()).toEqual({ location: "SW11", property_type: "flat", sold_within_years: 5, sort: "price_high" });
  });
});
