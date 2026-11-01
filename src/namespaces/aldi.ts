import type { Scavio } from "../client.js";

// ALDI: 3 endpoints, 1 credit each. ALDI US.
//
// Prices and stock are one store's AND one service_type's: instore (default,
// the shelf price), pickup or delivery (the online prices for ordering from
// that store, often higher than the shelf price). Pass store_id (from
// stores()) or zip to use the nearest store; the store used is echoed in
// data.store. ALDI has no product ratings.

export type AldiServiceType = "instore" | "pickup" | "delivery";

export type AldiSort = "best_match" | "price_low" | "price_high";

export interface AldiSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** ALDI store id from stores(), e.g. "151248". Pass this, or zip to use the nearest store. */
  store_id?: string;
  /** US ZIP code. Without store_id, the nearest ALDI store to this ZIP is used. */
  zip?: string;
  /** instore (default, shelf price), pickup or delivery (online prices, often higher). */
  service_type?: AldiServiceType;
  /** best_match (default), price_low or price_high. */
  sort?: AldiSort;
  /** Products per page (1-60; default 30). */
  limit?: number;
  /** Results page, 1-based (1-100). */
  page?: number;
  /** Also return the related items ALDI lists after the exact matches. Defaults to false. */
  include_related?: boolean;
  [key: string]: unknown;
}

export interface AldiProductOptions {
  /** ALDI product id (the `product_id` of a search result), e.g. "16902710", or an aldi.us product URL. */
  product_id: string;
  /** ALDI store id from stores(). Pass this, or zip to use the nearest store. */
  store_id?: string;
  /** US ZIP code. Without store_id, the nearest ALDI store to this ZIP is used. */
  zip?: string;
  /** instore (default, shelf price), pickup or delivery (online prices, often higher). */
  service_type?: AldiServiceType;
  [key: string]: unknown;
}

export interface AldiStoresOptions {
  /** US ZIP code to search around. */
  zip: string;
  /** Stores to return, nearest first (1-50; default 10). */
  limit?: number;
  [key: string]: unknown;
}

export class AldiNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search ALDI US at one store (store_id, or the nearest store to a zip):
   * product_id, name, brand, size, price and was_price for that store and
   * service_type, discount label, unit price, in_stock and stock_level,
   * category, in-store aisle location, ALDI exclusive-brand flag, dietary
   * labels, image and URL. Exact matches only unless include_related is set.
   *
   * Costs 1 credit.
   */
  async search(options: AldiSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/aldi/search", options);
  }

  /**
   * One ALDI US product by id or aldi.us URL at one store: price and
   * was_price for that store and service_type, unit price, stock, category,
   * brand, size, description, ingredients, allergen warnings, dietary labels
   * and images. An unknown product id is a 404.
   *
   * Costs 1 credit.
   */
  async product(options: AldiProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/aldi/product", options);
  }

  /**
   * ALDI US stores near a ZIP code, nearest first: store_id (for search and
   * product), name, street address, city, state, ZIP, coordinates and
   * distance in miles.
   *
   * Costs 1 credit.
   */
  async stores(options: AldiStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/aldi/stores", options);
  }
}
