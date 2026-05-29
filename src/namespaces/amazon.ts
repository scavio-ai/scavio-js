import type { Scavio } from "../client.js";

export interface AmazonSearchOptions {
  query: string;
  domain?: string;
  country?: string;
  language?: string;
  currency?: string;
  device?: string;
  sort_by?: string;
  start_page?: number;
  pages?: number;
  category_id?: string;
  merchant_id?: string;
  zip_code?: string;
  autoselect_variant?: boolean;
}

export interface AmazonProductOptions {
  asin: string;
  domain?: string;
  country?: string;
  language?: string;
  currency?: string;
  device?: string;
  zip_code?: string;
  autoselect_variant?: boolean;
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
}
