import type { Scavio } from "../client.js";

// Lowe's: 4 endpoints. search, product and stores cost 2 credits each;
// reviews costs 1.
//
// Prices and stock are one store's: search() and product() require store_id
// AND that store's own 5-digit zip, both from stores(). The store used is
// echoed in data.store_id / data.store. Deals are search({ on_sale: true });
// there is no clearance endpoint.

export type LowesReviewSort = "newest" | "oldest" | "most_helpful";

export interface LowesSearchOptions {
  /** Search keywords (1-200 characters). Pass this or category_id. */
  query?: string;
  /** Category id, the number at the end of a lowes.com/pl/ URL. Pass this or query. */
  category_id?: string;
  /** Lowe's store number (up to 4 digits) from stores(), e.g. "0595". */
  store_id: string;
  /** The store's own 5-digit ZIP code from stores(), e.g. "28117". */
  zip: string;
  /** Results page, 1-based (1-31). 24 results per page. */
  page?: number;
  /** Only items on sale at this store (with a was-price). A page can then hold fewer than 24. */
  on_sale?: boolean;
  [key: string]: unknown;
}

export interface LowesProductOptions {
  /** Lowe's item id (the number at the end of a lowes.com/pd/ URL) or the full product URL. */
  item_id: string;
  /** Lowe's store number (up to 4 digits) from stores(), e.g. "0595". */
  store_id: string;
  /** The store's own 5-digit ZIP code from stores(), e.g. "28117". */
  zip: string;
  [key: string]: unknown;
}

export interface LowesStoresOptions {
  /** 5-digit US ZIP code to find stores near. */
  zip: string;
  /** Stores to return, nearest first (1-10; default 10). */
  limit?: number;
  [key: string]: unknown;
}

export interface LowesReviewsOptions {
  /** Lowe's item id (the number at the end of a lowes.com/pd/ URL) or the full product URL. */
  item_id: string;
  /** Reviews page, 1-based (1-1000). 10 reviews per page. */
  page?: number;
  /** newest (default), oldest or most_helpful. */
  sort?: LowesReviewSort;
  [key: string]: unknown;
}

export class LowesNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Lowe's by keyword or category at one store: the store's price,
   * was-price and savings with the sale end date, brand, model number, rating,
   * review count, and stock for pickup, truck delivery, parcel shipping and
   * same-day delivery. Pass query or category_id; on_sale returns that
   * store's deals.
   *
   * Costs 2 credits.
   */
  async search(options: LowesSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/lowes/search", options);
  }

  /**
   * One Lowe's item at one store: price, was-price and savings, on-hand stock
   * with lead time per fulfillment method, stock at nearby stores, aisle and
   * bay, grouped specifications, UPC, dimensions, weight, rating, images, and
   * the store's hours.
   *
   * Costs 2 credits.
   */
  async product(options: LowesProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/lowes/product", options);
  }

  /**
   * Lowe's stores near a ZIP code, nearest first: store_id, name, address,
   * phone, coordinates, distance, time zone, opening hours and features.
   *
   * Costs 2 credits.
   */
  async stores(options: LowesStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/lowes/stores", options);
  }

  /**
   * One page of an item's customer reviews (10 per page): rating, title, text,
   * date, reviewer, recommended, helpful votes, verified and incentivized
   * flags, photos and brand replies, plus the average rating and count per star.
   *
   * Costs 1 credit.
   */
  async reviews(options: LowesReviewsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/lowes/reviews", options);
  }
}
