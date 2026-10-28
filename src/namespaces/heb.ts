import type { Scavio } from "../client.js";

// HEB: 3 endpoints, 2 credits each. Texas-based grocery chain.
//
// search() returns price in cents, sale status, unit price, size, UPC, stock,
// EBT/SNAP eligibility, aisle location and product URL.
//
// product() needs product_url (from search()) or slug + product_id (HEB URLs
// carry both: /product-detail/{slug}/{product_id}). With store_id, product_id
// alone is enough.
//
// STORE TARGETING (search and product): pass `store_id`, the `store_number`
// from stores() (e.g. "441" or 441), to get that store's prices, stock, aisle
// location and search assortment. The store used is echoed in `data.store`
// ({ store_id, name }). Without it, results are for HEB's default store. US
// only; an unknown store number returns 400. Credits are unchanged.
//
// stores() takes a US zip or city name.

export interface HebSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** Results page, 1-based (1-100). */
  page?: number;
  /** Results per page (1-60; server default 60). */
  page_size?: number;
  /**
   * HEB store number from stores() (field store_number), e.g. "441". Prices,
   * stock, aisle location and assortment come from that store, echoed in
   * data.store. US only. Omit for HEB's default store.
   */
  store_id?: string | number;
  [key: string]: unknown;
}

export interface HebProductOptions {
  /**
   * Full or relative product URL from heb.com (e.g.
   * "/product-detail/central-market-organics-whole-milk-1-gal/931316").
   * Preferred over slug + product_id.
   */
  product_url?: string;
  /**
   * HEB product id (numeric id at the end of a product URL). Requires slug,
   * unless store_id is set.
   */
  product_id?: string;
  /** Product slug (readable part of the URL). Required with product_id, unless store_id is set. */
  slug?: string;
  /**
   * HEB store number from stores() (field store_number), e.g. "441". Price,
   * stock and aisle location come from that store, echoed in data.store. US
   * only. Omit for HEB's default store.
   */
  store_id?: string | number;
  [key: string]: unknown;
}

export interface HebStoresOptions {
  /** 5-digit US ZIP code (e.g. "78701"). */
  zip?: string;
  /** City name (e.g. "Austin"). Pass zip or city. */
  city?: string;
  [key: string]: unknown;
}

export class HebNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search HEB grocery products by keyword: price (cents), sale status, unit
   * price, size, UPC, stock, EBT/SNAP eligibility, aisle location and product
   * URL. Pass store_id for one store's prices, stock and assortment.
   *
   * Costs 2 credits.
   */
  async search(options: HebSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/heb/search", options);
  }

  /**
   * Full HEB product detail: nutrition facts, ingredients, description, images,
   * similar products, coupons, EBT/SNAP eligibility and breadcrumbs. Pass
   * product_url (from search()) or slug + product_id, or product_id alone
   * with store_id.
   *
   * Costs 2 credits.
   */
  async product(options: HebProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/heb/product", options);
  }

  /**
   * HEB stores near a US ZIP code or city: store number, address, phone, hours,
   * pharmacy availability, fulfillment channels, distance and store URL.
   *
   * Costs 2 credits.
   */
  async stores(options: HebStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/heb/stores", options);
  }
}
