import type { Scavio } from "../client.js";

// Sephora: 3 endpoints, 1 credit each. sephora.com (US).
//
// search() and category() return 60 products per page. product() takes a
// result's url (faster) or its product_id, and returns a summary of what
// reviews say with pro and con sentiment counts - no review text.

export type SephoraSort =
  | "relevance"
  | "best_selling"
  | "rating"
  | "price_low"
  | "price_high"
  | "newest";

export interface SephoraSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** Results page, 1-based (1-100). 60 products per page. */
  page?: number;
  /** relevance (default), best_selling, rating, price_low, price_high or newest. */
  sort?: SephoraSort;
  /** US ZIP code. Each product then carries same_day_eligible for same-day delivery to that ZIP. */
  zip?: string;
  [key: string]: unknown;
}

export interface SephoraCategoryOptions {
  /** Category name as in a sephora.com/shop/ URL (lipstick, face-serum, makeup-cosmetics), or the full URL. */
  category: string;
  /** Results page, 1-based (1-100). 60 products per page. */
  page?: number;
  [key: string]: unknown;
}

export interface SephoraProductOptions {
  /** sephora.com product URL (the `url` of a search or category result). Preferred: it answers faster. Pass this or product_id. */
  url?: string;
  /** Sephora product id, e.g. "P510799" (the `product_id` of a result). Used when url is not given. */
  product_id?: string;
  [key: string]: unknown;
}

export class SephoraNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search sephora.com products, 60 per page: product id, sku id, brand, name,
   * URL, image, price, list and sale price (with a price range when sizes are
   * priced differently), value price for sets, rating, review count, extra
   * colors, and bestseller, new, exclusive, online-only, limited-edition and
   * sponsored flags. Pass zip for same-day delivery eligibility. Also returns
   * category facets and related searches.
   *
   * Costs 1 credit.
   */
  async search(options: SephoraSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sephora/search", options);
  }

  /**
   * Products in a sephora.com category, 60 per page, in the same shape as
   * search(), plus the category's id, name and URL, total product count,
   * parent category, subcategories with product counts and breadcrumbs. An
   * unknown category is a 404.
   *
   * Costs 1 credit.
   */
  async category(options: SephoraCategoryOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sephora/category", options);
  }

  /**
   * One sephora.com product: rating, review count, loves count, price range,
   * description, suggested usage, breadcrumbs, a summary of what reviews say
   * with pro and con sentiment counts (no review text), and every shade or
   * size as a sku with price, list and sale price, in_stock, only_few_left,
   * ingredients, images, and pickup and same-day eligibility. An unknown
   * product is a 404.
   *
   * Costs 1 credit.
   */
  async product(options: SephoraProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sephora/product", options);
  }
}
