import type { Scavio } from "../client.js";

// Micro Center: 3 endpoints. search and product cost 2 credits each; stores
// costs 1.
//
// Stock and open-box units are one store's: store_id is the 3-digit store
// number from stores() (131 = Dallas). Without it the web store (029) is used,
// which lists shippable items only. Stock counts are capped at 25+
// (quantity_capped: true).

export type MicroCenterSort =
  | "best_match"
  | "rating"
  | "review_count"
  | "price_low"
  | "price_high"
  | "newest";

export interface MicroCenterSearchOptions {
  /** Search keywords (1-200 characters). Pass this, category, or both. */
  query?: string;
  /** Category id (518 = Graphics Cards), a "category:Graphics Cards|518" value, or a microcenter.com listing URL. */
  category?: string;
  /** 3-digit Micro Center store id from stores(), e.g. "131". Omit for the web store (029, shippable items only). */
  store_id?: string;
  /** Results page, 1-based (1-100). */
  page?: number;
  /** Results per page: 24, 48 or 96 (default). */
  per_page?: 24 | 48 | 96;
  /** best_match (default), rating, review_count, price_low, price_high or newest. */
  sort?: MicroCenterSort;
  /** Also list products the store has no stock of or does not carry. Defaults to false. */
  include_out_of_stock?: boolean;
  [key: string]: unknown;
}

export interface MicroCenterProductOptions {
  /** Micro Center product id (a search result's product_id, the number after /product/ in a URL), or the product URL. Not the SKU. */
  product_id: string;
  /** 3-digit Micro Center store id from stores(), e.g. "131". Omit for the web store (029). */
  store_id?: string;
  [key: string]: unknown;
}

export interface MicroCenterStoresOptions {
  /** 2-letter US state code to filter by, e.g. "TX". */
  state?: string;
  [key: string]: unknown;
}

export class MicroCenterNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Micro Center by keyword or category at one store, up to 96 per
   * page: product_id, SKU, name, brand, category, price and original price,
   * image, URL, highlights, and that store's stock (label as printed,
   * quantity, quantity_capped at 25+, in_stock, not_carried). Open-box count
   * and lowest price, rebate text and an in_store_only flag where shown.
   *
   * Costs 2 credits.
   */
  async search(options: MicroCenterSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/microcenter/search", options);
  }

  /**
   * One product by id or URL: SKU, MPN, UPC, description, price, original
   * price, ship and pickup flags, images, rating, up to 10 recent reviews,
   * breadcrumbs and the full spec table. selected_store carries the store's
   * stock and each open-box unit (condition, warranty, price); stores_in_stock
   * is a yes/no per Micro Center store, not a unit count. An unknown product
   * id is a 404.
   *
   * Costs 2 credits.
   */
  async product(options: MicroCenterProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/microcenter/product", options);
  }

  /**
   * Every Micro Center store with its 3-digit store_id, name, city, state and
   * store page URL; street address and ZIP where known. Optionally filtered by
   * state. The web store 029 is not listed but is accepted as a store_id.
   *
   * Costs 1 credit.
   */
  async stores(options: MicroCenterStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/microcenter/stores", options);
  }
}
