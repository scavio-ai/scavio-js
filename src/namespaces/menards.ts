import type { Scavio } from "../client.js";

// Menards: 3 endpoints. search costs 2 credits (always at one store); stores
// costs 1; product costs 1, or 2 with a store_id.
//
// search() needs a store_id and returns 40 products a page with that store's
// stock. product() takes an item id (the number after p- in a menards.com URL,
// or a search result's item_id) or the URL. Prices carry the mail-in rebates (such as the
// 11% rebate) and the final price after rebates. store_id adds that store's
// stock quantity and aisle and can take 10-40 seconds, so product() raises
// the request timeout to MENARDS_PRODUCT_TIMEOUT when the client's is
// shorter.

/** Minimum request timeout (ms) for menards.product(). */
export const MENARDS_PRODUCT_TIMEOUT = 120_000;

/**
 * Minimum request timeout (ms) for menards.search(). It usually answers in a
 * few seconds, but slow spells reach 30+ seconds and the API waits up to 40.
 */
export const MENARDS_SEARCH_TIMEOUT = 60_000;

export interface MenardsSearchOptions {
  /** Search keywords, e.g. "sledge hammer". */
  query: string;
  /** Menards store number from stores(), e.g. "3181". Required: stock is that store's. An unknown store number is a 400. */
  store_id: string;
  /** Results page, 1-based, 40 products a page. Defaults to 1. */
  page?: number;
  /** Result order. Defaults to "relevance". Price sorts order by everyday_price, not the sale price. */
  sort?: "relevance" | "price_asc" | "price_desc" | "brand_asc" | "brand_desc";
  /** Only products in stock at the store today. */
  in_stock_today?: boolean;
  /** Lowest price in dollars. */
  min_price?: number;
  /** Highest price in dollars. */
  max_price?: number;
  [key: string]: unknown;
}

export interface MenardsProductOptions {
  /** Menards item id: the number after p- in a menards.com product URL, e.g. "60893666613". Not the SKU or model number. Pass this or url. */
  item_id?: string;
  /** A menards.com product URL. */
  url?: string;
  /** Menards store number from stores(), e.g. "3181". Adds that store's stock quantity, stock message and aisle; costs 2 credits instead of 1. Without it, prices are the default store's and stock fields are null. */
  store_id?: string;
  [key: string]: unknown;
}

export interface MenardsStoresOptions {
  /** US ZIP code to search around. Pass this, or city and state. */
  zip?: string;
  /** City to search around, with state. */
  city?: string;
  /** 2-letter US state code, with city, e.g. "WI". */
  state?: string;
  [key: string]: unknown;
}

export class MenardsNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search menards.com at one store, 40 products a page: item_id, sku, name,
   * url, image, price, everyday_price, sale_price, price_type (regular, sale,
   * clearance, minimum_advertised), mail-in rebates, final_price after
   * rebates, and that store's stock_quantity, stock_message, pickup and
   * delivery flags. Also total_results, total_pages and facets.
   *
   * Costs 2 credits.
   */
  async search(options: MenardsSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/menards/search", options, undefined, MENARDS_SEARCH_TIMEOUT);
  }

  /**
   * One Menards product by item id or URL: name, brand, model number, SKU,
   * description, bullets, specifications, images, videos and documents, with
   * the full price ladder: everyday price, sale price and end date, mail-in
   * rebates (text, amount, dates), final price after rebates and you_save.
   * Also pickup, delivery and ship-to-store flags. With store_id, that store's
   * stock quantity, stock message, aisle location and not_available_at_store.
   * An unknown item id or store number is a 404.
   *
   * Costs 1 credit, or 2 with store_id.
   */
  async product(options: MenardsProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/menards/product", options, undefined, MENARDS_PRODUCT_TIMEOUT);
  }

  /**
   * Menards stores near a US ZIP code or a city and state, nearest first:
   * store_id, name, address, coordinates, distance in miles and services
   * (garden center, grocery, rental center, propane and more).
   *
   * Costs 1 credit.
   */
  async stores(options: MenardsStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/menards/stores", options);
  }
}
