import type { Scavio } from "../client.js";

// Target is 1 credit flat on all four endpoints.
//
// LATENCY, not price, is what to plan for: Target's own API refuses proxy
// pools and is reached through a headless browser. Typical wall time is
// ~4s for product, ~9s for search, ~37s for category and ~40s for reviews,
// and a retried 502 has been seen at 105s. Raise the client `timeout` before
// calling category() or reviews().
//
// reviews() returns 8 review BODIES maximum whatever the product's
// review_count says. `limit` only trims that set - there is no page or offset.
//
// `seller_id` / `seller_name` are null on first-party stock, which is most of
// Target. Null there means "sold by Target", not missing data; only Target
// Plus marketplace rows name a vendor.
//
// Unlike Walmart, `store_id` is a real request param here - prices and
// availability are the caller's choice.

export interface TargetSearchOptions {
  /** Search keywords (1-500 characters). */
  keyword: string;
  /** Result page, 1-indexed. */
  page?: number;
  /** Results per page, 1-28 (default 24). Target rejects anything above 28. */
  count?: number;
  /** Result sort order (default "relevance"). */
  sort?:
    | "relevance"
    | "featured"
    | "price_low"
    | "price_high"
    | "rating_high"
    | "best_seller"
    | "newest";
  /** Numeric Target store id used for pricing and availability (default "3991"). */
  store_id?: string;
  [key: string]: unknown;
}

export interface TargetCategoryOptions {
  /** Category id: the segment after `N-` in a target.com /c/ URL. */
  category_id: string;
  /** Result page, 1-indexed. */
  page?: number;
  /** Results per page, 1-28 (default 24). Target rejects anything above 28. */
  count?: number;
  /** Result sort order (default "relevance"). */
  sort?:
    | "relevance"
    | "featured"
    | "price_low"
    | "price_high"
    | "rating_high"
    | "best_seller"
    | "newest";
  /** Numeric Target store id used for pricing and availability (default "3991"). */
  store_id?: string;
  [key: string]: unknown;
}

export interface TargetProductOptions {
  /**
   * Target TCIN. A child tcin is answered by its variation parent, with the
   * child itself present in `variants`.
   */
  tcin: string;
  /** Numeric Target store id used for pricing and availability (default "3991"). */
  store_id?: string;
  [key: string]: unknown;
}

export interface TargetReviewsOptions {
  /** Target TCIN. */
  tcin: string;
  /**
   * TRIMS the returned bodies only. Target publishes 8 reviews anonymously
   * and offers no paging, so this cannot reach a 9th review.
   */
  limit?: number;
  /** Numeric Target store id used for pricing and availability (default "3991"). */
  store_id?: string;
  [key: string]: unknown;
}

export class TargetNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Target.com: prices, ratings, badges and promotions.
   *
   * Paged with `page` + `count` (1-28, default 24). `seller_id` and
   * `seller_name` are null on first-party rows, which means "sold by Target".
   *
   * Costs 1 credit. Typically ~9s - it runs through a headless browser.
   */
  async search(
    options: TargetSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/target/search", options);
  }

  /**
   * Products in a Target category: the same shape as search() plus the
   * category breadcrumb.
   *
   * Paged with `page` + `count` (1-28, default 24).
   *
   * Costs 1 credit. The slowest endpoint here at ~37s - set a generous client
   * timeout before calling it.
   */
  async category(
    options: TargetCategoryOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/target/category", options);
  }

  /**
   * Target product details by TCIN: price, rating, images, specifications,
   * variants, return policy and fulfillment.
   *
   * `store_id` is a real request param here - the price and availability you
   * get back are the store you asked for.
   *
   * Costs 1 credit. Typically ~4s. Single response, no pagination.
   */
  async product(
    options: TargetProductOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/target/product", options);
  }

  /**
   * Target reviews with the rating breakdown, per-attribute averages and
   * guest photos.
   *
   * Returns 8 review BODIES MAXIMUM regardless of the product's review_count.
   * `limit` only trims that set; there is no page or offset param, so the
   * aggregate distribution is the full-population signal here, not the bodies.
   *
   * Costs 1 credit. Typically ~40s.
   */
  async reviews(
    options: TargetReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/target/reviews", options);
  }
}
