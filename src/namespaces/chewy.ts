import type { Scavio } from "../client.js";

// Chewy: 2 endpoints, 10 credits each.
//
// Online only (no stores), US dollars. Each product carries the one-time
// price, the Autoship price and the first-Autoship price separately, plus MAP
// fields and ratings. Chewy sends some broad queries (e.g. "dog food")
// straight to a category: search() then fills `redirect` with that category
// and returns its results.

export type ChewySort =
  | "relevance"
  | "bestselling"
  | "newest"
  | "price_low"
  | "price_high"
  | "rating"
  | "most_reviewed";

export interface ChewySearchOptions {
  /** Search keywords (1-200 characters). Pass this or category_id, not both. */
  query?: string;
  /** Category to browse instead: the number at the end of a chewy.com /b/ URL ("332" is Dog Food in /b/food-332), or that URL. */
  category_id?: string;
  /** Results page, 1-based (1-100). 36 results per page. */
  page?: number;
  /** relevance (default), bestselling, newest, price_low, price_high, rating or most_reviewed. */
  sort?: ChewySort;
  [key: string]: unknown;
}

export interface ChewyProductOptions {
  /** Chewy product id: the number after /dp/ in a product URL, or a search result's `product_id`, e.g. "128666". Pass this or url. */
  product_id?: string;
  /** A chewy.com product URL. */
  url?: string;
  [key: string]: unknown;
}

export class ChewyNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Chewy by keyword, or browse a category, 36 per page: one-time
   * price, offer and strike-through price, Autoship price and discount,
   * first-Autoship price, discount and savings cap, MAP price, per-unit
   * price, rating, rating count, in-stock flag, deal/new/exclusive/
   * prescription flags, brand, image and URL. Sponsored listings are removed
   * (sponsored_removed counts them). `redirect` names the category when
   * Chewy sends the query to one.
   *
   * Costs 10 credits.
   */
  async search(options: ChewySearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/chewy/search", options);
  }

  /**
   * One Chewy product by id or URL: one-time price, offer price, list and
   * strike-through price with savings, MAP price and whether it is enforced,
   * Autoship price and discount, first-Autoship price, per-unit price,
   * in-stock flag, rating, rating count, review count and star distribution,
   * brand, GTIN, description, key benefits, specifications, breadcrumbs,
   * images, promotions and every variant (size, flavor) with its own price,
   * Autoship price and stock. An unknown product id is a 404.
   *
   * Costs 10 credits.
   */
  async product(options: ChewyProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/chewy/product", options);
  }
}
