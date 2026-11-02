import type { Scavio } from "../client.js";

// Petco: 5 endpoints, 1 credit each.
//
// Prices are national, in dollars, with the Repeat Delivery (autoship) price
// alongside. Per-store stock is storeInventory(): it takes catalog entry ids
// (cat_entry_id from search, category or a product variant), NOT part
// numbers, and the store_id from stores() (not the store number). product()
// and category() can take 10-30 seconds and the other calls 10-15, so every
// call raises the request timeout to PETCO_SLOW_TIMEOUT when the client's is
// shorter.

/** Minimum request timeout (ms) for every petco call. */
export const PETCO_SLOW_TIMEOUT = 120_000;

export type PetcoSort = "relevance" | "price" | "rating" | "top_sold" | "newest" | "name";

export type PetcoSortOrder = "asc" | "desc";

export interface PetcoSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** Results page, 1-based (1-100). 48 products per page. */
  page?: number;
  /** relevance (default), price, rating, top_sold, newest or name. */
  sort?: PetcoSort;
  /** asc or desc. Defaults to asc for price and name, desc for everything else. */
  sort_order?: PetcoSortOrder;
  [key: string]: unknown;
}

export interface PetcoCategoryOptions {
  /** A petco.com category: its path ("dog/dog-food/dry-dog-food"), /category/<path>, or the full URL. A result's categories[].url works too. */
  path: string;
  /** Results page, 1-based (1-100). 48 products per page. */
  page?: number;
  /** relevance (default), price, rating, top_sold, newest or name. */
  sort?: PetcoSort;
  /** asc or desc. */
  sort_order?: PetcoSortOrder;
  [key: string]: unknown;
}

export interface PetcoProductOptions {
  /** Petco part number, a search result's `part_number`, e.g. "3748364". Pass this or url. */
  part_number?: string;
  /** Petco product page URL (a search result's `url`). Answers faster than part_number. */
  url?: string;
  [key: string]: unknown;
}

export interface PetcoStoresOptions {
  /** US ZIP code to search around. */
  zip: string;
  /** Number of stores, nearest first (1-10; default 5). */
  limit?: number;
  [key: string]: unknown;
}

export interface PetcoStoreInventoryOptions {
  /** 1-10 catalog entry ids: the `cat_entry_id` of a search result, variation or product variant. Not the part number. One unknown id makes the whole answer a 404. */
  cat_entry_ids: string[];
  /** Petco store id: the `store_id` from stores() (not the store number). Pass this or zip. */
  store_id?: string;
  /** US ZIP code: stock is read at the nearest store, returned as `store`. */
  zip?: string;
  [key: string]: unknown;
}

export class PetcoNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Petco products, 48 per page: price, list price and autoship
   * (Repeat Delivery) price, rating, review count, brand, part_number,
   * cat_entry_id (for storeInventory), fulfillment flags (pickup, same-day
   * delivery, autoship, in-store only), deal group ids and every size/flavor
   * variation with its own prices. Also total_results, facets and the
   * categories the matches fall into. Prices are national.
   *
   * Costs 1 credit.
   */
  async search(options: PetcoSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/petco/search", options, undefined, PETCO_SLOW_TIMEOUT);
  }

  /**
   * Products in a Petco category, e.g. dog/dog-food/dry-dog-food, in the same
   * shape as search. An unknown category is a 404. Can take 10-30 seconds.
   *
   * Costs 1 credit.
   */
  async category(options: PetcoCategoryOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/petco/category", options, undefined, PETCO_SLOW_TIMEOUT);
  }

  /**
   * One Petco product by part number or URL, with every variant (size,
   * flavor): cat_entry_id, part number, SKU, UPC, price, list price, autoship
   * price, first-autoship promo price, online quantity and status,
   * fulfillment flags, ingredients, guaranteed analysis, directions,
   * specifications, dimensions and images. Plus brand, rating, review count
   * and breadcrumbs. Prices are national. An unknown product is a 404. Can
   * take 10-30 seconds.
   *
   * Costs 1 credit.
   */
  async product(options: PetcoProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/petco/product", options, undefined, PETCO_SLOW_TIMEOUT);
  }

  /**
   * Petco stores nearest a US ZIP code (up to 10): store_id (for
   * storeInventory), store number, name, address, phone, coordinates,
   * distance in miles, in-store pickup and opening hours per weekday.
   *
   * Costs 1 credit.
   */
  async stores(options: PetcoStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/petco/stores", options, undefined, PETCO_SLOW_TIMEOUT);
  }

  /**
   * Units on hand at one Petco store for up to 10 products: qty_available,
   * alert_level (GREEN, YELLOW, RED) and in_stock per cat_entry_id. Pass a
   * store_id, or a zip to use the nearest store.
   *
   * Costs 1 credit.
   */
  async storeInventory(options: PetcoStoreInventoryOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/petco/store-inventory", options, undefined, PETCO_SLOW_TIMEOUT);
  }
}
