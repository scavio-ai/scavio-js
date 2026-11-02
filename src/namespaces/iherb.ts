import type { Scavio } from "../client.js";

// iHerb: 4 endpoints, 2 credits each.
//
// Online only (no stores): data is always the US store's, in USD. reviews()
// is a summary - rating, star histogram and the top positive and top critical
// review - not a full review list. prices() checks up to 50 product ids in
// one call. search() and product() read full pages and can take 10-25
// seconds, so they raise the request timeout to IHERB_SLOW_TIMEOUT when the
// client's is shorter.

/** Minimum request timeout (ms) for iherb.search() and iherb.product(). */
export const IHERB_SLOW_TIMEOUT = 120_000;

export type IherbSort =
  | "relevance"
  | "best_selling"
  | "rating"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "percent_off"
  | "review_count";

export interface IherbSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** Results page, 1-based (1-500). 48 results per page. */
  page?: number;
  /** relevance, best_selling, rating, price_asc, price_desc, newest, percent_off (highest discount first) or review_count. Defaults to iHerb's featured order. */
  sort?: IherbSort;
  /** Only this brand, by iHerb brand code (e.g. "CGN" for California Gold Nutrition, "NOW" for NOW Foods): a result's brand_code or a brand_filters entry. */
  brand_code?: string;
  [key: string]: unknown;
}

export interface IherbProductOptions {
  /** iHerb product id, the number at the end of an iherb.com/pr/ URL (a search result's `product_id`), e.g. "62118". Pass this or url. */
  product_id?: string | number;
  /** An iherb.com product URL. Data is always the US store's, whatever the URL's country. */
  url?: string;
  [key: string]: unknown;
}

export interface IherbPricesOptions {
  /** 1-50 iHerb product ids. Duplicates are answered once. */
  product_ids: Array<string | number>;
  [key: string]: unknown;
}

export interface IherbReviewsOptions {
  /** iHerb product id, e.g. "62118". Pass this or url. */
  product_id?: string | number;
  /** An iherb.com product URL. */
  url?: string;
  [key: string]: unknown;
}

export class IherbNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search iHerb (US store, USD), 48 per page: product_id, part_number, name,
   * brand, brand_code, URL, image, price, list price, original price and
   * discount_percent when discounted, rating, review count, in_stock, badges
   * (Best seller, iHerb Brands, New), recent_sales (e.g. "30K+ sold in 30
   * days") and position. Also total_results and brand_filters for narrowing
   * with brand_code.
   *
   * Costs 2 credits.
   */
  async search(options: IherbSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/iherb/search", options, undefined, IHERB_SLOW_TIMEOUT);
  }

  /**
   * One iHerb product by id or URL (US store, USD): name, brand, part number,
   * UPC, price, list price, discount, price per serving or unit, stock status,
   * discontinued and coming-soon flags, quantity limit, expiration date,
   * package quantity, weight and dimensions, rating and review count,
   * breadcrumbs, best-seller rankings, badges, variants, supplement facts,
   * description, suggested use, ingredients, warnings and images. An unknown
   * product id is a 404.
   *
   * Costs 2 credits.
   */
  async product(options: IherbProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/iherb/product", options, undefined, IHERB_SLOW_TIMEOUT);
  }

  /**
   * Current price, list price, discount, in-stock flag, rating and review
   * count for up to 50 iHerb products in one call (US store, USD). One row
   * per requested id, in request order; unknown ids come back with
   * found: false and are listed in not_found.
   *
   * Costs 2 credits.
   */
  async prices(options: IherbPricesOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/iherb/prices", options);
  }

  /**
   * The review summary for one iHerb product: average rating, total review
   * count, star histogram, review counts per language, and the full text of
   * the top positive and top critical review (rating, title, author, country,
   * date, verified-purchase flag, helpful votes, images). Not a full review
   * list.
   *
   * Costs 2 credits.
   */
  async reviews(options: IherbReviewsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/iherb/reviews", options);
  }
}
