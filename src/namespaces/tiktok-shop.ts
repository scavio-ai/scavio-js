import type { Scavio } from "../client.js";

/** Marketplace regions served by suggestions, product, reviews, and shop products. */
export type TikTokShopRegion =
  | "US"
  | "GB"
  | "SG"
  | "MY"
  | "PH"
  | "TH"
  | "VN"
  | "ID";

/** Marketplace regions served by category listings. */
export type TikTokShopListingRegion = "US" | "GB";

/** Review ordering: 'relevant' is text-complete and image-heavy, 'recent' is fresher but text-sparse. */
export type TikTokShopReviewSort = "relevant" | "recent";

export interface TikTokShopSearchOptions {
  /** Search query (1-200 characters). US catalog only. */
  search: string;
  /** Opaque cursor from a prior response's next_cursor. */
  cursor?: string;
  [key: string]: unknown;
}

export interface TikTokShopSuggestionsOptions {
  /** Partial query to expand (1-100 characters). */
  search: string;
  /** Marketplace region (default 'US'). */
  region?: TikTokShopRegion;
  [key: string]: unknown;
}

export interface TikTokShopProductOptions {
  /** TikTok Shop product id (6-25 digits). */
  product_id: string;
  /** Marketplace region (default 'US'). */
  region?: TikTokShopRegion;
  [key: string]: unknown;
}

export interface TikTokShopProductReviewsOptions {
  /** TikTok Shop product id (6-25 digits). */
  product_id: string;
  /** 1-based page number (1-500, default 1). */
  page?: number;
  /** Reviews per page (1-200, default 20). */
  page_size?: number;
  /** 'relevant' (default) is text-complete and image-heavy; 'recent' is fresher but far more text-sparse. */
  sort?: TikTokShopReviewSort;
  /** Only reviews with this star rating (1-5). */
  rating?: number;
  /** Only reviews with a photo or video (default false). */
  has_media?: boolean;
  /** Only verified purchases (default false). */
  verified_only?: boolean;
  /** Marketplace region (default 'US'). */
  region?: TikTokShopRegion;
  [key: string]: unknown;
}

export interface TikTokShopCategoryProductsOptions {
  /** Category id from tiktokShop.categories(); level 1 or 2 both work. */
  category_id: string;
  /** Opaque cursor from a prior response's next_cursor. */
  cursor?: string;
  /** Marketplace region, 'US' or 'GB' only (default 'US'). */
  region?: TikTokShopListingRegion;
  [key: string]: unknown;
}

export interface TikTokShopShopProductsOptions {
  /** TikTok Shop seller id (also called seller_id elsewhere on TikTok). */
  shop_id: string;
  /** Opaque cursor from a prior response's next_cursor. */
  cursor?: string;
  /** Marketplace region (default 'US'). */
  region?: TikTokShopRegion;
  [key: string]: unknown;
}

export interface TikTokShopResolveOptions {
  /** A TikTok Shop product or store URL, affiliate share link, or vt.tiktok.com short link. */
  url: string;
  [key: string]: unknown;
}

export class TikTokShopNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search TikTok Shop products by keyword (US catalog), up to 30 per page with
   * exact prices, ratings, and shop details. Paginate with next_cursor and dedupe
   * by product_id across pages.
   *
   * This is one of the three endpoints that return exact prices; tiktokShop.product()
   * does not return a price. A product_id returned here is not guaranteed to resolve
   * on tiktokShop.product() - only about 44% do.
   */
  async search(
    options: TikTokShopSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok-shop/search", options);
  }

  /**
   * Keyword autocomplete and expansion for a partial query, across 8 marketplace
   * regions. Suggestions are not guaranteed prefix matches: a misspelling returns
   * typo corrections, and results can include brand and shop names.
   */
  async searchSuggestions(
    options: TikTokShopSuggestionsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok-shop/search/suggestions", options);
  }

  /**
   * Full product detail: description, images, variants with stock, shipping, shop
   * profile, category path, and top reviews.
   *
   * Two limits worth knowing before you build on this:
   *
   * 1. It resolves only about 44% of the product ids returned by tiktokShop.search().
   *    Upstream has no detail data for the rest, so an HTTP 404 is a normal outcome,
   *    not an error. Skip the item rather than retrying - retries do not help and no
   *    other region carries it. Search to product is not a reliable pipeline.
   *
   *    This method throws `NotFoundError` on that 404 (there is no `data` field in
   *    the response body to test), so a loop over search ids must catch it or it
   *    dies on the first miss:
   *
   *    ```ts
   *    import { NotFoundError } from "scavio";
   *
   *    for (const productId of productIds) {
   *      try {
   *        const detail = await client.tiktokShop.product({ product_id: productId });
   *      } catch (e) {
   *        if (e instanceof NotFoundError) continue; // no detail upstream; skip
   *        throw e;
   *      }
   *    }
   *    ```
   *
   *    tiktokShop.productReviews() often works for ids product() cannot resolve: of
   *    8 such ids tested, 8 returned HTTP 200 and 7 carried at least one review, so
   *    it is a useful fallback source of product detail.
   * 2. It does NOT return a price. Upstream masks the price on the product page.
   *    Exact prices come from tiktokShop.search(), tiktokShop.shopProducts(), and
   *    tiktokShop.categoryProducts().
   */
  async product(
    options: TikTokShopProductOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok-shop/product", options);
  }

  /**
   * Paginated product reviews with text, images, star histogram, and
   * verified-purchase flags, up to 200 per call. total_reviews drifts between calls
   * and must not be used to compute a page count; page with has_more instead.
   */
  async productReviews(
    options: TikTokShopProductReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok-shop/product/reviews", options);
  }

  /**
   * The global TikTok Shop category tree: 28 top-level categories, 240 nodes, two
   * levels deep. Category ids are identical in every region and names are always
   * English.
   */
  async categories(): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok-shop/categories", {});
  }

  /**
   * Products listed under a category id from tiktokShop.categories(), with exact
   * prices. Page size is inconsistent upstream (15 to 20 per page), so always
   * paginate with next_cursor rather than assuming a fixed page size. Category
   * listings are shallow: after a few pages the source stops returning new products
   * and has_more turns false, which is the end of the listing rather than an error.
   */
  async categoryProducts(
    options: TikTokShopCategoryProductsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok-shop/category/products", options);
  }

  /**
   * A shop's product catalog, 30 per page, with exact prices. Shop follower count,
   * location, and shop-level rating are not available here; call
   * tiktokShop.product() for the full shop profile.
   */
  async shopProducts(
    options: TikTokShopShopProductsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok-shop/shop/products", options);
  }

  /**
   * Resolve any TikTok Shop URL or share link to a product_id or shop_id, ready to
   * pass to the other methods. Accepts canonical product and store pages,
   * tiktok.com/view links, affiliate share links, and vt.tiktok.com short links.
   */
  async resolve(
    options: TikTokShopResolveOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok-shop/resolve", options);
  }
}
