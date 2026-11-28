import type { Scavio } from "../client.js";

// Ferguson (ferguson.com, the US plumbing, HVAC and waterworks distributor) search, category and
// product endpoints; US only, prices in USD on the product endpoint (search and category results
// carry none). Search and category 2 credits (a keyword Ferguson sends to a category, asked for a
// later page or best_selling, can cost 4); product 4 (2 when the page names no price). Generated from
// the backend routes: every option and its doc mirrors the API's own request schema. The server
// enforces the value rules and the one-of rule (product takes item or url). Every call raises the
// request timeout to FERGUSON_TIMEOUT (product to FERGUSON_PRODUCT_TIMEOUT) and never lowers a longer
// client timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (2 credits; credits_used is what was charged).

/** Minimum request timeout (ms) for ferguson.search() and ferguson.category(). */
export const FERGUSON_TIMEOUT = 240_000;
/** Minimum request timeout (ms) for ferguson.product(). */
export const FERGUSON_PRODUCT_TIMEOUT = 180_000;

/** best_match (the default, Ferguson's own order) or best_selling. */
export type FergusonSort = "best_match" | "best_selling";

export interface FergusonSearchOptions {
  /**
   * Search keywords, as a buyer types them on ferguson.com (product type, brand, part or item
   * number), e.g. pex tubing.
   */
  q: string;
  /** Results page, 1-100 (24 products a page; default 1). total_pages reports the last one. */
  page?: number;
  /** best_match (the default, Ferguson's own order) or best_selling. */
  sort?: FergusonSort;
  [key: string]: unknown;
}

export interface FergusonCategoryOptions {
  /**
   * A Ferguson category path (categories[].path of a search answer, subcategories[].path of a
   * category answer, or the part after /category/ in a ferguson.com link, e.g.
   * water-heaters/tankless-water-heaters), or a ferguson.com /category/ link.
   */
  category: string;
  /** Results page, 1-100 (24 products a page; default 1). total_pages reports the last one. */
  page?: number;
  /** best_match (the default, Ferguson's own order) or best_selling. */
  sort?: FergusonSort;
  [key: string]: unknown;
}

export interface FergusonProductOptions {
  /**
   * A Ferguson item number (items[].item: the digits after Item # on ferguson.com, e.g. 4606091).
   * Send item or url.
   */
  item?: string | number;
  /** A ferguson.com /product/ link, instead of item. */
  url?: string;
  [key: string]: unknown;
}

export class FergusonNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = FERGUSON_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/ferguson/${path}`, options, undefined, timeout);
  }

  /**
   * Search Ferguson (ferguson.com, the US plumbing, HVAC and waterworks distributor). Scavio
   * fetches the public ferguson.com page on request. US only, as shown to a visitor who is not
   * signed in. By keyword, 24 products a page, best match or best selling. Results carry no prices:
   * use product() for an item's price. Costs 2 credits (4 when a keyword Ferguson sends to a
   * category is asked for a later page or best_selling and needs a second page read).
   */
  async search(options: FergusonSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category of Ferguson (ferguson.com, the US plumbing, HVAC and waterworks distributor) by
   * category path, paged and sorted like search, with breadcrumbs and subcategories. Scavio fetches
   * the public ferguson.com page on request. Results carry no prices. Costs 2 credits.
   */
  async category(options: FergusonCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One product of Ferguson (ferguson.com, the US plumbing, HVAC and waterworks distributor) by
   * item number or link: price, list price and price per unit in USD as shown to a visitor who is
   * not signed in, package quantities, variants, specs, certifications and documents. Items
   * Ferguson prices for signed-in customers only answer price null with a note. Scavio fetches the
   * public ferguson.com page on request. Costs 4 credits (2 when the page names no price).
   */
  async product(options: FergusonProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options, FERGUSON_PRODUCT_TIMEOUT);
  }
}
