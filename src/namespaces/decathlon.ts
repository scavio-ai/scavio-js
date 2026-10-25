import type { Scavio } from "../client.js";

// Decathlon: 2 endpoints, 2 credits each. Supports 7 country domains:
// FR, ES, IT, IN, UK, PT and NET (international).
//
// search() returns product name, brand, price (cents), currency,
// availability, rating, review count and image.
//
// product() needs product_url (from search()) or product_id.

export type DecathlonCountry = "fr" | "es" | "it" | "in" | "uk" | "pt" | "net";

export interface DecathlonSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** Country domain. */
  country: DecathlonCountry;
  /** Results page, 1-based (1-50). */
  page?: number;
  [key: string]: unknown;
}

export interface DecathlonProductOptions {
  /**
   * Full or relative product URL from any Decathlon domain (e.g.
   * "/p/mens-running-shoes/123456/..."). Preferred.
   */
  product_url?: string;
  /** Decathlon numeric product ID (from the /p/{slug}/{id}/... URL pattern). */
  product_id?: string;
  /** Country domain. */
  country: DecathlonCountry;
  [key: string]: unknown;
}

export class DecathlonNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Decathlon products by keyword across 7 country domains (FR, ES, IT,
   * IN, UK, PT, NET). Returns product name, brand, price (cents), currency,
   * availability, rating, review count and image.
   *
   * Costs 2 credits.
   */
  async search(options: DecathlonSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/decathlon/search", options);
  }

  /**
   * Full Decathlon product detail by URL or product ID: description, images,
   * SKU, GTIN, color, price (cents), list price, availability, offers/variants,
   * rating, review count, category and breadcrumbs. Supports all 7 country
   * domains.
   *
   * Costs 2 credits.
   */
  async product(options: DecathlonProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/decathlon/product", options);
  }
}
