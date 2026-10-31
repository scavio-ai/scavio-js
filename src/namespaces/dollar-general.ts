import type { Scavio } from "../client.js";

// Dollar General: 5 endpoints, 1 credit each.
//
// Prices (dollars) and unit counts are one store's, so store_id (from
// stores()) is required on search, product and deals. stores({ upc }) returns
// that product's unit count at up to 25 nearby stores in one call. No review
// text: rating and review_count only.

export type DollarGeneralSort = "recommended" | "price_low" | "price_high" | "rating";

export type DollarGeneralDealType = "on_sale" | "clearance";

export interface DollarGeneralSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** Dollar General store number from stores(), e.g. "12629". */
  store_id: string;
  /** Results page, 1-based (1-100). 24 results per page. */
  page?: number;
  /** recommended (default), price_low, price_high or rating. */
  sort?: DollarGeneralSort;
  /** Only products with units on hand at the store. Defaults to false. */
  in_stock_only?: boolean;
  [key: string]: unknown;
}

export interface DollarGeneralProductOptions {
  /** Product UPC, the `upc` field of a search result, e.g. "030772156629". */
  upc: string;
  /** Dollar General store number from stores(), e.g. "12629". */
  store_id: string;
  [key: string]: unknown;
}

export interface DollarGeneralStoresOptions {
  /** US ZIP code, e.g. "75203". Pass this or latitude and longitude. */
  zip?: string;
  /** Latitude (-90 to 90); pass with longitude. */
  latitude?: number;
  /** Longitude (-180 to 180); pass with latitude. */
  longitude?: number;
  /** Search radius in miles (1-100; default 25). */
  radius?: number;
  /** Product UPC. Every store then carries quantity, in_stock and inventory_status for it. */
  upc?: string;
  [key: string]: unknown;
}

export interface DollarGeneralDealsOptions {
  /** Dollar General store number from stores(), e.g. "12629". */
  store_id: string;
  /** on_sale (everything on sale) or clearance (the clearance event). */
  type: DollarGeneralDealType;
  /** Results page, 1-based (1-100). 24 results per page. */
  page?: number;
  /** recommended (default), price_low, price_high or rating. */
  sort?: DollarGeneralSort;
  [key: string]: unknown;
}

export interface DollarGeneralCouponsOptions {
  /** Results page, 1-based (1-50). 30 coupons per page. */
  page?: number;
  [key: string]: unknown;
}

export class DollarGeneralNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Dollar General at one store: that store's price and original price,
   * available_quantity (units on hand at that store), inventory_status,
   * rating, review count, categories, digital coupons and promotions, UPC and
   * product URL.
   *
   * Costs 1 credit.
   */
  async search(options: DollarGeneralSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/dollargeneral/search", options);
  }

  /**
   * One product by UPC at one store: price, original price,
   * available_quantity, stock_status, nearby_stores_with_stock, rating, review
   * count, SKU, brand, description, highlights, images, categories, digital
   * coupons and promotions. An unknown UPC or store number is a 404.
   *
   * Costs 1 credit.
   */
  async product(options: DollarGeneralProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/dollargeneral/product", options);
  }

  /**
   * Dollar General stores near a US ZIP code or coordinates, nearest first (up
   * to 25): store_id, address, phone, coordinates, distance in miles, opening
   * hours and services. Pass upc and each store also carries its unit count of
   * that product.
   *
   * Costs 1 credit.
   */
  async stores(options: DollarGeneralStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/dollargeneral/stores", options);
  }

  /**
   * Products on sale or on clearance, priced and stocked at one store, 24 per
   * page. available_quantity > 0 means in stock at that store; the listing
   * covers the whole chain. Clearance items carry the current price only (no
   * was-price).
   *
   * Costs 1 credit.
   */
  async deals(options: DollarGeneralDealsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/dollargeneral/deals", options);
  }

  /**
   * Dollar General's current digital coupons, 30 per page: offer id and code,
   * summary, description, brand, company, value, offer type, category, minimum
   * quantity, start and expiration dates, and whether it is a manufacturer
   * coupon.
   *
   * Costs 1 credit.
   */
  async coupons(options: DollarGeneralCouponsOptions = {}): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/dollargeneral/coupons", options);
  }
}
