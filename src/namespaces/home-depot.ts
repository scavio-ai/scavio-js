import type { Scavio } from "../client.js";

// Home Depot is 2 credits flat on all three endpoints - it sits on the
// premium per-domain proxy table, so it is the priciest of the retail
// namespaces.
//
// Search page size is FIXED at 12 with no way to change it. Paging is the
// only way to read further, and there is no per-page option to type.
//
// `sort_by` is a CLOSED enum on purpose. Home Depot does not fall back on an
// unknown sort - it answers 200 with an empty page that still bills. "Newest"
// (arrivaldate) is deliberately absent: it works on category pages and is
// rejected on keyword search.
//
// Unknown item ids and out-of-range pages come back upstream as billed 200
// shells; the API restates them as 404.

export interface HomeDepotSearchOptions {
  /** Search keywords (1-500 characters). */
  query: string;
  /** Result page, 1-indexed. Page size is fixed at 12 products. */
  page?: number;
  /**
   * Result sort order (default "best_match"). Closed set - an unrecognised
   * value is not ignored, it produces an empty billed page.
   */
  sort_by?: "best_match" | "top_sellers" | "top_rated" | "price_low" | "price_high";
  /** Minimum price filter. */
  min_price?: number;
  /** Maximum price filter. */
  max_price?: number;
  [key: string]: unknown;
}

export interface HomeDepotProductOptions {
  /**
   * Home Depot item id, or a full homedepot.com/p/... URL. Tracking params on
   * a pasted URL are discarded.
   */
  item_id: string;
  [key: string]: unknown;
}

export interface HomeDepotReviewsOptions {
  /** Home Depot item id. */
  item_id: string;
  /**
   * Result page, 1-indexed. 30 reviews per page. `total_pages` is the last
   * page that exists - asking past it returns 404.
   */
  page?: number;
  [key: string]: unknown;
}

export class HomeDepotNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Home Depot: price and promotions, brand and model, ratings,
   * badges, and per-store pickup/delivery.
   *
   * Page size is FIXED at 12 products and cannot be raised - page through
   * with `page` to read further.
   *
   * Costs 2 credits.
   */
  async search(
    options: HomeDepotSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/homedepot/search", options);
  }

  /**
   * Full item detail: pricing and promotions, images and videos, the spec
   * table, dimensions, bullets, documents and return policy.
   *
   * Carries only a 10-review PREVIEW - reviews() is the paginated surface.
   * An unknown item id comes back as 404.
   *
   * Costs 2 credits. Single response, no pagination.
   */
  async product(
    options: HomeDepotProductOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/homedepot/product", options);
  }

  /**
   * One page of full review bodies with the rating distribution,
   * per-attribute ratings, photos and seller responses.
   *
   * 30 reviews per page. `total_pages` is the last page that exists; a page
   * beyond it is a 404, not an empty result.
   *
   * Costs 2 credits.
   */
  async reviews(
    options: HomeDepotReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/homedepot/reviews", options);
  }
}
