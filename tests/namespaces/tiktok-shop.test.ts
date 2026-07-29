import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

describe("TikTokShopNamespace", () => {
  let client: Scavio;

  beforeEach(() => {
    client = new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 10 });
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function bodyOf() {
    const call = vi.mocked(fetch).mock.calls[0]!;
    return JSON.parse((call[1] as RequestInit).body as string);
  }

  it("search posts search/cursor to /tiktok-shop/search", async () => {
    await client.tiktokShop.search({ search: "phone case", cursor: "CUR" });

    expect(bodyOf()).toEqual({ search: "phone case", cursor: "CUR" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/tiktok-shop/search",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("searchSuggestions posts search/region to /tiktok-shop/search/suggestions", async () => {
    await client.tiktokShop.searchSuggestions({
      search: "wireless",
      region: "GB",
    });

    expect(bodyOf()).toEqual({ search: "wireless", region: "GB" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/tiktok-shop/search/suggestions",
      expect.anything(),
    );
  });

  it("product posts product_id/region to /tiktok-shop/product", async () => {
    await client.tiktokShop.product({
      product_id: "1732293553906094315",
      region: "US",
    });

    expect(bodyOf()).toEqual({
      product_id: "1732293553906094315",
      region: "US",
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/tiktok-shop/product",
      expect.anything(),
    );
  });

  it("productReviews posts filters to /tiktok-shop/product/reviews", async () => {
    await client.tiktokShop.productReviews({
      product_id: "1732293553906094315",
      page: 2,
      page_size: 200,
      sort: "recent",
      rating: 5,
      has_media: true,
      verified_only: false,
    });

    expect(bodyOf()).toEqual({
      product_id: "1732293553906094315",
      page: 2,
      page_size: 200,
      sort: "recent",
      rating: 5,
      has_media: true,
      verified_only: false,
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/tiktok-shop/product/reviews",
      expect.anything(),
    );
  });

  it("categories posts an empty body to /tiktok-shop/categories", async () => {
    await client.tiktokShop.categories();

    expect(bodyOf()).toEqual({});
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/tiktok-shop/categories",
      expect.anything(),
    );
  });

  it("categoryProducts posts category_id/cursor/region to /tiktok-shop/category/products", async () => {
    await client.tiktokShop.categoryProducts({
      category_id: "601450",
      cursor: "CUR",
      region: "GB",
    });

    expect(bodyOf()).toEqual({
      category_id: "601450",
      cursor: "CUR",
      region: "GB",
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/tiktok-shop/category/products",
      expect.anything(),
    );
  });

  it("shopProducts posts shop_id/cursor/region to /tiktok-shop/shop/products", async () => {
    await client.tiktokShop.shopProducts({
      shop_id: "7495514739648989419",
      cursor: "CUR",
      region: "US",
    });

    expect(bodyOf()).toEqual({
      shop_id: "7495514739648989419",
      cursor: "CUR",
      region: "US",
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/tiktok-shop/shop/products",
      expect.anything(),
    );
  });

  it("resolve posts url to /tiktok-shop/resolve", async () => {
    await client.tiktokShop.resolve({ url: "https://vt.tiktok.com/ZT2AHoGsE/" });

    expect(bodyOf()).toEqual({ url: "https://vt.tiktok.com/ZT2AHoGsE/" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/tiktok-shop/resolve",
      expect.anything(),
    );
  });
});
