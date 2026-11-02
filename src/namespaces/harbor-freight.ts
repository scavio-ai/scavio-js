import type { Scavio } from "../client.js";

// Harbor Freight: 7 endpoints, 1 credit each.
//
// Prices are national, in dollars: price (what the shelf charges now),
// regular_price, sale (sale price and end date), coupon (the public coupon
// price), member_deal (the Inside Track Club member price) and compare_at (the
// competitor price Harbor Freight quotes). Per-store data is availability():
// a stock status per store (in_stock, limited, out_of_stock or not_carried)
// plus the aisle, from a daily snapshot. There are no unit counts.

export type HarborFreightSort =
  | "best_match"
  | "price_low"
  | "price_high"
  | "member_price_low"
  | "member_price_high"
  | "top_rated"
  | "newest";

export interface HarborFreightSearchOptions {
  /** Search keywords (1-200 characters). Pass this, category_id, or both. */
  query?: string;
  /** Harbor Freight category id, e.g. "1827" (Drills, Drivers & Drill Presses): the `value` of the category facet in any search answer. */
  category_id?: string;
  /** Results page, 1-based (1-100). */
  page?: number;
  /** Results per page (1-48; default 36). */
  page_size?: number;
  /** best_match (default), price_low, price_high, member_price_low, member_price_high (Inside Track Club price), top_rated or newest. */
  sort?: HarborFreightSort;
  /** Only this brand, as listed in the brand facet (e.g. "BAUER", "HERCULES"). Case-insensitive. */
  brand?: string;
  /** Only clearance items. Defaults to false. */
  clearance?: boolean;
  [key: string]: unknown;
}

export interface HarborFreightClearanceOptions {
  /** Optional keywords to narrow the clearance list. */
  query?: string;
  /** Harbor Freight category id from a search's category facet. */
  category_id?: string;
  /** Results page, 1-based (1-100). */
  page?: number;
  /** Results per page (1-48; default 36). */
  page_size?: number;
  /** best_match (default), price_low, price_high, member_price_low, member_price_high, top_rated or newest. */
  sort?: HarborFreightSort;
  /** Only this brand, as listed in the brand facet. */
  brand?: string;
  [key: string]: unknown;
}

export interface HarborFreightProductOptions {
  /** Harbor Freight item number, the `sku` of a search result, e.g. "73216". Pass sku, id or url. */
  sku?: string;
  /** Numeric product id, the `id` of a search result, e.g. 48725. */
  id?: number;
  /** A harborfreight.com product URL. */
  url?: string;
  [key: string]: unknown;
}

export interface HarborFreightPricesOptions {
  /** 1-50 Harbor Freight item numbers, e.g. ["73216", "59716"]. */
  skus: string[];
  [key: string]: unknown;
}

export interface HarborFreightStoresOptions {
  /** US ZIP code or "City, ST" (e.g. "Los Angeles, CA"). Pass this, or latitude and longitude. */
  query?: string;
  /** Latitude (-90 to 90); pass with longitude. */
  latitude?: number;
  /** Longitude (-180 to 180); pass with latitude. */
  longitude?: number;
  /** Search radius in miles (1-100; default 50). */
  radius?: number;
  /** Most stores to return (1-50; default 10). */
  limit?: number;
  [key: string]: unknown;
}

export interface HarborFreightAvailabilityOptions {
  /** 1-20 Harbor Freight item numbers. */
  skus: string[];
  /** 1-20 store numbers from stores(). Or pass zip, or latitude and longitude, for the nearest stores. */
  store_ids?: string[];
  /** US ZIP code: stock at the stores nearest to it. */
  zip?: string;
  /** Latitude: stock at the stores nearest to it; pass with longitude. */
  latitude?: number;
  /** Longitude: stock at the stores nearest to it; pass with latitude. */
  longitude?: number;
  /** Nearest stores to return with zip or coordinates (1-100; default 10). */
  limit?: number;
  [key: string]: unknown;
}

export interface HarborFreightReviewsOptions {
  /** Harbor Freight item number, e.g. "73216". */
  sku: string;
  /** Reviews per call (1-50; default 10). */
  limit?: number;
  /** Reviews to skip, for paging. Defaults to 0. */
  offset?: number;
  [key: string]: unknown;
}

export class HarborFreightNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Harbor Freight by keyword and/or category, with brand and
   * clearance filters: item number, id, title, brand, URL, image, price,
   * regular price, on_sale and clearance flags, sale (price, end date,
   * savings), coupon, member_deal, compare_at, badges, rating, review count,
   * in-store-only / online-only flags and variants. Also total_results,
   * facets, and redirect when a keyword maps to a category page.
   *
   * Costs 1 credit.
   */
  async search(options: HarborFreightSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/harborfreight/search", options);
  }

  /**
   * Harbor Freight clearance items, optionally narrowed by keyword, category
   * or brand. Same fields as search; each item's clearance price and end date
   * are in `sale`.
   *
   * Costs 1 credit.
   */
  async clearance(options: HarborFreightClearanceOptions = {}): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/harborfreight/clearance", options);
  }

  /**
   * One product by item number, id or URL: title, brand, UPC, every price
   * field of search, rating, review count, description, highlights, the full
   * specification table, warranty, shipping notes, owner's manuals, images
   * and variants. An unknown item is a 404.
   *
   * Costs 1 credit.
   */
  async product(options: HarborFreightProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/harborfreight/product", options);
  }

  /**
   * Current prices for up to 50 item numbers in one call: price, regular
   * price, sale, coupon, member_deal and compare_at per item. Unknown item
   * numbers are listed in not_found.
   *
   * Costs 1 credit.
   */
  async prices(options: HarborFreightPricesOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/harborfreight/prices", options);
  }

  /**
   * Harbor Freight stores near a ZIP code, "City, ST" or coordinates, nearest
   * first: store_id, name, address, phone, coordinates, distance in miles,
   * status, opening date and hours.
   *
   * Costs 1 credit.
   */
  async stores(options: HarborFreightStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/harborfreight/stores", options);
  }

  /**
   * In-store stock for up to 20 items at chosen stores, or at the stores
   * nearest a ZIP code or coordinates. Each store lists every item with
   * stock_status (in_stock, limited, out_of_stock or not_carried), the aisle
   * and a nearby store that has it. inventory_updated_at is the time of the
   * daily stock snapshot. Stock is a status, not a unit count.
   *
   * Costs 1 credit.
   */
  async availability(options: HarborFreightAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/harborfreight/availability", options);
  }

  /**
   * Customer reviews for one item, newest first, with limit/offset paging:
   * title, text, star rating, author, review and purchase dates, incentivized
   * flag, helpful votes and the reviewer's answers. Also the average rating
   * and total review count. An unknown item is a 404.
   *
   * Costs 1 credit.
   */
  async reviews(options: HarborFreightReviewsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/harborfreight/reviews", options);
  }
}
