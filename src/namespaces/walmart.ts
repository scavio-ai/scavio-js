import type { Scavio } from "../client.js";

// Walmart runs on a generic scraper over Walmart's own server-rendered payload.
// search and product changed shape in this release, and reviews, category,
// offers, seller and sellerProducts are new.
//
// Three params were retired: `device`, `delivery_zip` and `store_id`. They are
// no longer typed here. Sending them anyway does not fail the request - the
// response carries a `warnings[]` array explaining that they were ignored.
// `domain` was NOT retired: it is live, it is the price-bearing param, and it
// is accepted on search and category only (walmart.ca product pages cannot be
// fetched at all, so product-keyed endpoints are .com only).
//
// CREDITS ARE BODY-PRICED on search and category: domain "com" and "ca" cost 1
// credit, domain "com.mx" costs 2. The other five endpoints are always 1.

export interface WalmartSearchOptions {
  /** Product search query (1-500 characters). */
  query: string;
  /**
   * Walmart storefront. Price-bearing: "com" and "ca" cost 1 credit,
   * "com.mx" costs 2. Defaults to "com".
   */
  domain?: "com" | "ca" | "com.mx";
  /** Result page, 1-indexed. */
  page?: number;
  /** @deprecated Alias for `page`. Use `page`. */
  start_page?: number;
  /** Result sort order (default "best_match"). */
  sort_by?:
    | "best_match"
    | "price_low"
    | "price_high"
    | "best_seller"
    | "rating_high"
    | "new";
  /** Minimum price filter. */
  min_price?: number;
  /** Maximum price filter. */
  max_price?: number;
  /**
   * Delivery speed filter. "2_days" is deliberately unsupported (it leaks
   * 3-4 day items) and there is no "anytime" - omit the param instead.
   */
  fulfillment_speed?: "today" | "tomorrow";
  /** Fulfillment type filter. */
  fulfillment_type?: "in_store";
  [key: string]: unknown;
}

export interface WalmartProductOptions {
  /** Walmart item id (usItemId), e.g. "13544111159". */
  product_id: string;
  [key: string]: unknown;
}

export interface WalmartReviewsOptions {
  /** Walmart item id (usItemId). */
  product_id: string;
  /** Result page, 1-indexed. 10 reviews per page. */
  page?: number;
  /** Review sort order. */
  sort?:
    | "relevancy"
    | "submission-desc"
    | "submission-asc"
    | "rating-desc"
    | "rating-asc"
    | "helpful-desc";
  [key: string]: unknown;
}

export interface WalmartCategoryOptions {
  /**
   * Category id: either a leaf id ("1095191") or a full underscore path
   * ("3944_133251_1095191").
   */
  category_id: string;
  /**
   * Walmart storefront. Price-bearing: "com" and "ca" cost 1 credit,
   * "com.mx" costs 2. Defaults to "com".
   */
  domain?: "com" | "ca" | "com.mx";
  /** Result page, 1-indexed. */
  page?: number;
  /** Trims the returned list after fetching. Does NOT reduce the credit cost. */
  limit?: number;
  /** Result sort order (default "best_match"). */
  sort_by?:
    | "best_match"
    | "price_low"
    | "price_high"
    | "best_seller"
    | "rating_high"
    | "new";
  /** Minimum price filter. */
  min_price?: number;
  /** Maximum price filter. */
  max_price?: number;
  /**
   * Delivery speed filter. "2_days" is deliberately unsupported (it leaks
   * 3-4 day items) and there is no "anytime" - omit the param instead.
   */
  fulfillment_speed?: "today" | "tomorrow";
  [key: string]: unknown;
}

export interface WalmartOffersOptions {
  /** Walmart item id (usItemId). */
  product_id: string;
  [key: string]: unknown;
}

export interface WalmartSellerOptions {
  /**
   * NUMERIC catalog seller id, the `seller_catalog_id` field returned by
   * product/offers. The GUID form of seller_id returns 404.
   */
  seller_id: string;
  [key: string]: unknown;
}

export interface WalmartSellerProductsOptions {
  /**
   * NUMERIC catalog seller id (`seller_catalog_id`). The GUID form returns 404.
   */
  seller_id: string;
  [key: string]: unknown;
}

export class WalmartNamespace {
  constructor(private client: Scavio) {}

  /**
   * Structured Walmart search results: `products[]`, `products_count` and the
   * resolved `location`. Page through with `page` (1-indexed).
   *
   * Costs 1 credit for `domain` "com" or "ca", 2 credits for "com.mx".
   */
  async search(
    options: WalmartSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/search", options);
  }

  /**
   * Full product detail: price, rating, images, specifications, availability
   * and seller.
   *
   * Costs 1 credit. Walmart.ca product pages are not fetchable, so this is
   * walmart.com only.
   */
  async product(
    options: WalmartProductOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/product", options);
  }

  /**
   * Customer reviews with ratings, text, author, date and the rating
   * breakdown. 10 reviews per page; advance with `page`.
   *
   * Costs 1 credit.
   */
  async reviews(
    options: WalmartReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/reviews", options);
  }

  /**
   * Products within a category, in the same product shape as `search()`.
   * Page through with `page`; `limit` only trims the response.
   *
   * Costs 1 credit for `domain` "com" or "ca", 2 credits for "com.mx".
   */
  async category(
    options: WalmartCategoryOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/category", options);
  }

  /**
   * Seller offer for a product: price, seller, condition and buy-box flag.
   * Returns the BUY-BOX SELLER ONLY, not the full offer list.
   *
   * Costs 1 credit.
   */
  async offers(
    options: WalmartOffersOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/offers", options);
  }

  /**
   * Marketplace seller storefront: name, rating, review count, Pro Seller
   * badge and business details.
   *
   * Costs 1 credit. `seller_id` must be the numeric catalog seller id.
   */
  async seller(
    options: WalmartSellerOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/seller", options);
  }

  /**
   * A seller's catalog. Roughly the first 40 items are server-rendered and
   * that is all this returns - there is no pagination. `total_count` reports
   * the seller's real catalog size, which is usually far larger.
   *
   * Costs 1 credit. `seller_id` must be the numeric catalog seller id.
   */
  async sellerProducts(
    options: WalmartSellerProductsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/seller-products", options);
  }
}
