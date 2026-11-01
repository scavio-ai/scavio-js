import type { Scavio } from "../client.js";

// Walgreens: 4 endpoints. search, product and stores cost 2 credits each;
// stock costs 4.
//
// Retail products only (no pharmacy). Prices are national - the same at every
// store (store_pricing: false). Per-store data is stock(): live unit counts
// at up to 20 stores per call, by store number from stores().

export type WalgreensSort =
  | "relevance"
  | "top_sellers"
  | "price_low_to_high"
  | "price_high_to_low"
  | "unit_price_low_to_high"
  | "brand_name_asc"
  | "brand_name_desc"
  | "most_reviewed"
  | "highest_rated"
  | "most_viewed"
  | "newest_arrival";

export interface WalgreensSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** Results page, 1-based (1-100). Up to 70 results per page. */
  page?: number;
  /** relevance (default), top_sellers, price_low_to_high, price_high_to_low, unit_price_low_to_high, brand_name_asc, brand_name_desc, most_reviewed, highest_rated, most_viewed or newest_arrival. */
  sort?: WalgreensSort;
  /** Walgreens store number from stores(), e.g. "15350". Each result's availability text then describes that store. */
  store_id?: string;
  [key: string]: unknown;
}

export interface WalgreensProductOptions {
  /** Walgreens product id, the `product_id` of a search result ("300452904" or "prod6345045"), or a walgreens.com product URL. */
  product_id: string;
  [key: string]: unknown;
}

export interface WalgreensStoresOptions {
  /** US ZIP code to search around. Pass this, or latitude and longitude. */
  zip?: string;
  /** Latitude (-90 to 90); pass with longitude. */
  latitude?: number;
  /** Longitude (-180 to 180); pass with latitude. */
  longitude?: number;
  /** Search radius in miles (1-100; default 25). */
  radius?: number;
  /** Results page, 1-based (1-100). */
  page?: number;
  /** Stores per page (1-25; default 10). */
  limit?: number;
  [key: string]: unknown;
}

export interface WalgreensStockOptions {
  /** Walgreens product id, the `product_id` of a search result, or a walgreens.com product URL. */
  product_id: string;
  /** 1-20 Walgreens store numbers from stores(), e.g. ["15350"]. */
  store_ids: string[];
  [key: string]: unknown;
}

export class WalgreensNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Walgreens retail products, up to 70 per page: product id, SKU, UPC,
   * name, brand, size, regular and sale price, unit price, promotion, coupon,
   * loyalty and rebate messages, rating, review count, image, URL,
   * ship/pickup/delivery availability, online stock status and clearance flag.
   * Prices are national. Pass store_id for that store's availability text.
   *
   * Costs 2 credits.
   */
  async search(options: WalgreensSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walgreens/search", options);
  }

  /**
   * One Walgreens retail product by id or URL: SKU, UPC, GTIN, brand, size,
   * regular and sale price, savings, unit price, rewards and rebate offers,
   * description, ingredients, warnings, rating, review count, category path,
   * images, ship and pickup availability and clearance flag. Prices are
   * national. An unknown id is a 404.
   *
   * Costs 2 credits.
   */
  async product(options: WalgreensProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walgreens/product", options);
  }

  /**
   * Walgreens and Duane Reade stores near a US ZIP or coordinates, nearest
   * first: store_number, name, brand, address, phone, coordinates, distance in
   * miles, opening and closing time, time zone and store page URL. Paged with
   * total_results, total_pages and has_more.
   *
   * Costs 2 credits.
   */
  async stores(options: WalgreensStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walgreens/stores", options);
  }

  /**
   * Live in-store stock of one product at up to 20 stores: per store the
   * status (In Stock, Out of Stock, or Not Available when the store does not
   * carry it), the unit count and in_stock. Store numbers Walgreens does not
   * recognise are listed in unknown_store_ids. An unknown product is a 404.
   *
   * Costs 4 credits.
   */
  async stock(options: WalgreensStockOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walgreens/stock", options);
  }
}
