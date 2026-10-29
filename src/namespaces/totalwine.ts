import type { Scavio } from "../client.js";

// Total Wine & More: 3 endpoints, 10 credits each. Prices and stock are per
// store, so store_id (store_id from stores()) is required on search() and
// product(). A response is only returned when Total Wine answered for that
// store.

export interface TotalWineSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** Total Wine store number from stores(), e.g. "503". */
  store_id: string;
  /** Results page, 1-based (1-50). 24 results per page. */
  page?: number;
  [key: string]: unknown;
}

export interface TotalWineProductOptions {
  /** Numeric product id from search() or the URL's /p/<id>, e.g. "96260175". */
  product_id?: string;
  /** Total Wine product URL ending in /p/<id>. */
  product_url?: string;
  /** Total Wine store number from stores(), e.g. "503". */
  store_id: string;
  [key: string]: unknown;
}

export interface TotalWineStoresOptions {
  /** ZIP code, city, or "city, state", e.g. "78801". */
  query: string;
  /** Radius in miles (1-200). Defaults to 50. */
  radius?: number;
  [key: string]: unknown;
}

export class TotalWineNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Total Wine at one store: that store's price (cents), units in
   * stock, purchase limit, aisle, size, rating and pickup/delivery/shipping
   * availability. When the store carries none of the matches, products is
   * empty and searched_all_stores is true.
   *
   * Costs 10 credits.
   */
  async search(options: TotalWineSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/totalwine/search", options);
  }

  /**
   * One Total Wine product at one store: price (cents), units in stock, aisle,
   * bay, shelf, last restock date, ABV, taste profile, characteristics and
   * breadcrumbs. Pass product_id or product_url.
   *
   * Costs 10 credits.
   */
  async product(options: TotalWineProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/totalwine/product", options);
  }

  /**
   * Total Wine stores near a ZIP code or city, nearest first: store_id,
   * address, phone, coordinates, distance in miles and delivery availability.
   *
   * Costs 10 credits.
   */
  async stores(options: TotalWineStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/totalwine/stores", options);
  }
}
