import type { Scavio } from "../client.js";

// Kroger: 2 endpoints, 2 credits each. Operates Kroger, Ralphs, Fred Meyer,
// Harris Teeter, King Soopers, Fry's and other banners.
//
// search() returns price in cents, promo/n-for deals, unit price, UPC, stock,
// SNAP eligibility, dietary info, rating and category.
//
// product() needs product_url (from search()) or upc (optionally with slug).
// Kroger URLs carry both: /p/{slug}/{upc}.

export interface KrogerSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** Results page, 1-based (1-100). */
  page?: number;
  [key: string]: unknown;
}

export interface KrogerProductOptions {
  /**
   * Full or relative product URL from kroger.com (e.g.
   * "/p/kroger-2-reduced-fat-milk-gallon/0001111041700"). Preferred.
   */
  product_url?: string;
  /** Kroger product UPC (from search() or product URLs: /p/{slug}/{upc}). */
  upc?: string;
  /** Product slug for readable URL. Optional with upc. */
  slug?: string;
  [key: string]: unknown;
}

export class KrogerNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Kroger grocery products by keyword: price (cents), promo price,
   * n-for deals, unit price, size, UPC, stock, SNAP eligibility, dietary info,
   * rating and category. Kroger operates Kroger, Ralphs, Fred Meyer, Harris
   * Teeter, King Soopers, Fry's and other banners.
   *
   * Costs 2 credits.
   */
  async search(options: KrogerSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kroger/search", options);
  }

  /**
   * Full Kroger product detail by URL or UPC: nutrition facts (allergens,
   * ingredients, nutrients with daily values), description, images, rating
   * distribution, store aisle location, stock level, dietary flags (organic,
   * non-GMO, gluten-free), SNAP eligibility, dimensions and country of origin.
   *
   * Costs 2 credits.
   */
  async product(options: KrogerProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kroger/product", options);
  }
}
