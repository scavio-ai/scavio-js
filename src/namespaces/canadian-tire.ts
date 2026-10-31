import type { Scavio } from "../client.js";

// Canadian Tire: 6 endpoints, 1 credit each.
//
// Prices (CAD) and stock are one store's, so store_id (from stores()) is
// required on every method except stores(). Prices differ by store and
// province (Quebec prices differ). No review text: rating and review_count
// only.

export type CanadianTireSort =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "rating"
  | "bestseller";

export type CanadianTireDealType = "sale" | "instant_rebate" | "special_buy" | "loyalty";

export interface CanadianTireSearchOptions {
  /** Search keywords (up to 200 characters). Pass this or category_id. */
  query?: string;
  /** Category id (DC followed by 7 digits, e.g. "DC0002209") or a canadiantire.ca category URL. Pass this or query. */
  category_id?: string;
  /** Canadian Tire store number from stores(), e.g. "600". */
  store_id: string;
  /** Results page, 1-based (1-100). 24 results per page. */
  page?: number;
  /** relevance (default), price_asc, price_desc, newest, rating or bestseller. */
  sort?: CanadianTireSort;
  /** Only items in stock at store_id. */
  in_stock_only?: boolean;
  [key: string]: unknown;
}

export interface CanadianTireProductOptions {
  /** Product code, the `code` field of a search result, e.g. "0547273P". */
  product_code: string;
  /** Canadian Tire store number from stores(), e.g. "600". */
  store_id: string;
  [key: string]: unknown;
}

export interface CanadianTireStoresOptions {
  /** Canadian postal code or its first 3 characters, e.g. "M5V 2T6". Pass this or latitude and longitude. */
  postal_code?: string;
  /** Latitude (-90 to 90); pass with longitude. */
  latitude?: number;
  /** Longitude (-180 to 180); pass with latitude. */
  longitude?: number;
  /** Search radius in km (1-200; default 25). */
  radius_km?: number;
  /** Stores to return, nearest first (1-50; default 10). */
  limit?: number;
  /** 7-digit SKU, e.g. "0438858". Adds each store's stock quantity and aisle for it. */
  sku?: string;
  [key: string]: unknown;
}

export interface CanadianTireAvailabilityOptions {
  /** Canadian Tire store number from stores(), e.g. "600". */
  store_id: string;
  /** 1-50 SKUs (7 digits, the `sku` field of a search result or product variant). */
  skus: string[];
  [key: string]: unknown;
}

export interface CanadianTireClearanceOptions {
  /** Canadian Tire store number from stores(), e.g. "600". */
  store_id: string;
  /** Results page, 1-based (1-100). 100 results per page. */
  page?: number;
  /** Only clearance items in stock at store_id. Defaults to true. */
  in_stock_only?: boolean;
  [key: string]: unknown;
}

export interface CanadianTireDealsOptions {
  /** Canadian Tire store number from stores(), e.g. "600". */
  store_id: string;
  /** sale (this week's sale prices), instant_rebate, special_buy or loyalty (Triangle Rewards offers). */
  type: CanadianTireDealType;
  /** Results page, 1-based (1-100). 100 results per page. */
  page?: number;
  [key: string]: unknown;
}

export class CanadianTireNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Canadian Tire by keyword or category at one store: the store's
   * price and regular price (CAD), price range for multi-variant items,
   * savings, badges (clearance, sale, rebate), rating, review count, brand,
   * part number, SKU, and stock at the store and online.
   *
   * Costs 1 credit.
   */
  async search(options: CanadianTireSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/canadiantire/search", options);
  }

  /**
   * One product by code at one store: breadcrumb, images, rating, review
   * count, descriptions, features, specifications, price and regular price,
   * warranty, manuals, variants with their SKUs, and the store's price, stock,
   * and pickup and ship-to-home dates.
   *
   * Costs 1 credit.
   */
  async product(options: CanadianTireProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/canadiantire/product", options);
  }

  /**
   * Canadian Tire stores near a postal code or coordinates, nearest first:
   * store_id, name, address, phone, coordinates, distance, weekly hours and
   * services. Pass sku to get each store's stock quantity and aisle for it.
   *
   * Costs 1 credit.
   */
  async stores(options: CanadianTireStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/canadiantire/stores", options);
  }

  /**
   * Up to 50 SKUs at one store in one call: the store's price and regular
   * price, clearance and sale flags, price valid-until date, stock quantity,
   * aisle, online stock, and pickup and delivery dates. Unknown SKUs are
   * listed in not_found.
   *
   * Costs 1 credit.
   */
  async availability(options: CanadianTireAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/canadiantire/availability", options);
  }

  /**
   * Every clearance item at one store, 100 per page, with clearance price,
   * regular price, stock at the store and the same fields as search().
   * In-stock items only by default.
   *
   * Costs 1 credit.
   */
  async clearance(options: CanadianTireClearanceOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/canadiantire/clearance", options);
  }

  /**
   * Items on a deal at one store, 100 per page: sale prices, instant rebates,
   * special buys or Triangle Rewards loyalty offers, with the same fields as
   * search().
   *
   * Costs 1 credit.
   */
  async deals(options: CanadianTireDealsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/canadiantire/deals", options);
  }
}
