import type { Scavio } from "../client.js";

// Spec's Wines, Spirits & Finer Foods (Texas): 3 endpoints, 5 credits each.
//
// search() returns the online price. product() returns every store's price
// and stock in store_prices (about 200 stores); store_id puts one store on top.

export type SpecsRegion =
  | "austin"
  | "corpus-christi"
  | "dallas"
  | "el-paso"
  | "fort-worth"
  | "houston"
  | "san-antonio";

export interface SpecsSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** Results page, 1-based (1-50). 24 results per page. */
  page?: number;
  [key: string]: unknown;
}

export interface SpecsProductOptions {
  /** Product slug from search(), e.g. "titos-texas-vodka-5". */
  slug?: string;
  /** Spec's product URL, https://specsonline.com/shop/<type>/<slug>/. */
  product_url?: string;
  /** Spec's store number from stores(), e.g. "169". Puts that store's price on top. */
  store_id?: string;
  [key: string]: unknown;
}

export interface SpecsStoresOptions {
  /** Store region. */
  region: SpecsRegion;
  [key: string]: unknown;
}

export class SpecsNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Spec's: online price (cents), case price and quantity, promo and
   * Keyclub flags, stock, size, SKU, UPC and slug.
   *
   * Costs 5 credits.
   */
  async search(options: SpecsSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/specs/search", options);
  }

  /**
   * One Spec's product with every store's price and stock in store_prices,
   * the online price, and ABV, origin, region, vintage and tasting notes.
   * Pass slug or product_url.
   *
   * Costs 5 credits.
   */
  async product(options: SpecsProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/specs/product", options);
  }

  /**
   * Spec's stores in a Texas region: store_id, name, status, address, phone,
   * coordinates and opening hours.
   *
   * Costs 5 credits.
   */
  async stores(options: SpecsStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/specs/stores", options);
  }
}
