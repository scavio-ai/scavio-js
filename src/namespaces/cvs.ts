import type { Scavio } from "../client.js";

// CVS: 3 endpoints, 1 credit each. Front-store products (no pharmacy).
//
// Prices are the same at every store; stock is one store's. There is no store
// locator: the store number is on every cvs.com store page ("Store ID: #7019")
// and in its URL (.../storeid=7019). search() defaults to store 7019 (150 East
// 42nd St, New York). product() can take 10-30+ seconds, so the call raises
// the request timeout to CVS_PRODUCT_TIMEOUT when the client's is shorter.

/** Minimum request timeout (ms) for cvs.product(). */
export const CVS_PRODUCT_TIMEOUT = 120_000;

export interface CvsSearchOptions {
  /** Search keywords (1-200 characters), or a CVS item number. */
  query: string;
  /** CVS store number for the stock fields, e.g. "7019" (the default, New York). Prices are the same at every store. */
  store_id?: string;
  /** Results page, 1-based (1-100). */
  page?: number;
  /** Results per page (1-48; default 20). */
  limit?: number;
  [key: string]: unknown;
}

export interface CvsProductOptions {
  /** cvs.com product URL (https://www.cvs.com/shop/<name>-prodid-<id>). Pass this or product_id. */
  url?: string;
  /** CVS product id or SKU id, e.g. "832677" (the number after prodid- in a URL, or a result's product_id or sku_id). */
  product_id?: string;
  [key: string]: unknown;
}

export interface CvsStockOptions {
  /** 1-20 CVS SKU ids: a search result's sku_id or a product's variants[].sku_id. */
  sku_ids: string[];
  /** CVS store number, e.g. "7019", from a cvs.com store page. */
  store_id: string;
  [key: string]: unknown;
}

export class CvsNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search CVS front-store products: product_id and sku_id, name, brand, URL,
   * regular and sale price, unit price, promotion text, rating, review count,
   * size, image, coupons (ExtraBucks rewards and manufacturer coupons) and
   * stock at one store (in store, pickup) plus online ship stock;
   * same_day_delivery is always null. Sponsored placements are excluded. Includes brand,
   * price-range and rating facets.
   *
   * Costs 1 credit.
   */
  async search(options: CvsSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/cvs/search", options);
  }

  /**
   * One CVS product by URL or id: regular and sale price, unit price,
   * promotion and its end date, rating, review count, UPC, size, description,
   * highlights, ingredients, directions, warnings, attributes, breadcrumbs,
   * images and every variant (SKU id, UPC, size, price, rating). An unknown
   * product is a 404. Can take 10-30+ seconds.
   *
   * Costs 1 credit.
   */
  async product(options: CvsProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/cvs/product", options, undefined, CVS_PRODUCT_TIMEOUT);
  }

  /**
   * Units available at one CVS store for up to 20 SKUs: in_store (on the
   * shelf), pickup and ship (online stock, chain-wide). same_day_delivery is
   * always null (CVS does not report it per store). An unknown SKU or store
   * number reads as 0.
   *
   * Costs 1 credit.
   */
  async stock(options: CvsStockOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/cvs/stock", options);
  }
}
