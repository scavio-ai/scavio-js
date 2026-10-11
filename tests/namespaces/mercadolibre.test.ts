import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

// Method names match the dashboard Playground's SDK snippets
// (mercadolibre.<endpoint>, best-sellers -> bestSellers).
const MERCADOLIBRE: Row[] = [
  ["search", { country: "mx", query: "iphone 15" }, "/api/v1/mercadolibre/search"],
  ["product", { product_id: "MLM1027172667" }, "/api/v1/mercadolibre/product"],
  ["reviews", { product_id: "MLM1027172667" }, "/api/v1/mercadolibre/reviews"],
  ["questions", { item_id: "MLM3571336480" }, "/api/v1/mercadolibre/questions"],
  ["bestSellers", { country: "mx", category_id: "MLM1055" }, "/api/v1/mercadolibre/best-sellers"],
];

function body(call = 0): unknown {
  return JSON.parse((vi.mocked(fetch).mock.calls[call]![1] as RequestInit).body as string);
}

type AnyNs = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("MercadoLibreNamespace", () => {
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

  it("exposes 5 Mercado Libre endpoints", () => {
    expect(MERCADOLIBRE).toHaveLength(5);
  });

  it.each(MERCADOLIBRE)("mercadolibre.%s posts its body to %s", async (method, args, path) => {
    await (client.mercadolibre as unknown as AnyNs)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("mercadolibre.search carries every filter, sort and page", async () => {
    await client.mercadolibre.search({
      country: "br",
      query: "iphone 15",
      condition: "used",
      min_price: 2000,
      max_price: 6000,
      min_discount: 15,
      free_shipping: true,
      full_fulfillment: true,
      official_stores_only: true,
      interest_free_installments: true,
      sort: "price_desc",
      page: 42,
    });
    expect(body()).toEqual({
      country: "br",
      query: "iphone 15",
      condition: "used",
      min_price: 2000,
      max_price: 6000,
      min_discount: 15,
      free_shipping: true,
      full_fulfillment: true,
      official_stores_only: true,
      interest_free_installments: true,
      sort: "price_desc",
      page: 42,
    });
  });

  it("mercadolibre.search lists a seller's catalogue by id or nickname", async () => {
    await client.mercadolibre.search({ country: "mx", seller_id: "527927603" });
    expect(body()).toEqual({ country: "mx", seller_id: "527927603" });
    await client.mercadolibre.search({ country: "mx", seller_nickname: "MERCADOLIBRE ELECTRONICA_MX" });
    expect(body(1)).toEqual({ country: "mx", seller_nickname: "MERCADOLIBRE ELECTRONICA_MX" });
  });

  it("mercadolibre.reviews carries the star filter and page; questions the offset", async () => {
    await client.mercadolibre.reviews({ item_id: "MLM-2746152281", rating: 1, page: 3 });
    expect(body()).toEqual({ item_id: "MLM-2746152281", rating: 1, page: 3 });
    const url = "https://www.mercadolibre.com.mx/apple-iphone-15/p/MLM1027172667";
    await client.mercadolibre.questions({ url, offset: 20 });
    expect(body(1)).toEqual({ url, offset: 20 });
  });
});
