import type { Scavio } from "../client.js";

export interface AmazonSearchOptions {
  /** Product search query (1-500 characters). */
  query: string;
  /** Amazon domain suffix (default 'com', e.g. 'co.uk'). */
  domain?: string;
  /** Country code for localization. */
  country?: string;
  /** Language code. */
  language?: string;
  /** Currency code (ISO 4217, e.g. 'USD'). */
  currency?: string;
  /** Device to emulate. */
  device?: "desktop" | "mobile" | "tablet";
  /** Result sort order. */
  sort_by?:
    | "most_recent"
    | "price_low_to_high"
    | "price_high_to_low"
    | "featured"
    | "average_review"
    | "bestsellers";
  /** Starting page (1-indexed). */
  start_page?: number;
  /** Number of pages to fetch. */
  pages?: number;
  /** Amazon category id. */
  category_id?: string;
  /** Filter to a specific merchant. */
  merchant_id?: string;
  /** ZIP/postal code for localized pricing. */
  zip_code?: string;
  /** Auto-select the default variant. */
  autoselect_variant?: boolean;
  [key: string]: unknown;
}

export interface AmazonProductOptions {
  /** Amazon ASIN (e.g. 'B09XS7JWHH'). Sent to the API as 'query'. */
  asin: string;
  /** Amazon domain suffix (default 'com'). */
  domain?: string;
  /** Country code for localization. */
  country?: string;
  /** Language code. */
  language?: string;
  /** Currency code (ISO 4217, e.g. 'USD'). */
  currency?: string;
  /** Device to emulate. */
  device?: "desktop" | "mobile" | "tablet";
  /** ZIP/postal code for localized pricing. */
  zip_code?: string;
  /** Auto-select the default variant. */
  autoselect_variant?: boolean;
  [key: string]: unknown;
}

export class AmazonNamespace {
  constructor(private client: Scavio) {}

  async search(
    options: AmazonSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/amazon/search", options);
  }

  async product(
    options: AmazonProductOptions,
  ): Promise<Record<string, unknown>> {
    const { asin, ...rest } = options;
    return this.client._post("/api/v1/amazon/product", {
      query: asin,
      ...rest,
    });
  }

  /** Supported Amazon domains, languages, currencies, and countries. */
  async options(): Promise<Record<string, unknown>> {
    return this.client._get("/api/v1/amazon/options");
  }
}
