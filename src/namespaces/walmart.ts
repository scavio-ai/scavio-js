import type { Scavio } from "../client.js";

export interface WalmartSearchOptions {
  /** Product search query (1-500 characters). */
  query: string;
  /** Walmart domain. */
  domain?: string;
  /** Device to emulate. */
  device?: "desktop" | "mobile" | "tablet";
  /** Result sort order. */
  sort_by?: "best_match" | "price_low" | "price_high" | "best_seller";
  /** Starting page (1-indexed). */
  start_page?: number;
  /** Minimum price filter (USD). */
  min_price?: number;
  /** Maximum price filter (USD). */
  max_price?: number;
  /** Delivery speed filter. */
  fulfillment_speed?: "today" | "tomorrow" | "2_days" | "anytime";
  /** Fulfillment type filter. */
  fulfillment_type?: "in_store";
  /** ZIP code for localized results. */
  delivery_zip?: string;
  /** Store id for in-store availability. */
  store_id?: string;
  [key: string]: unknown;
}

export interface WalmartProductOptions {
  /** Walmart product id. */
  product_id: string;
  /** Walmart domain. */
  domain?: string;
  /** Device to emulate. */
  device?: "desktop" | "mobile" | "tablet";
  /** ZIP code for localized pricing. */
  delivery_zip?: string;
  /** Store id for in-store availability. */
  store_id?: string;
  [key: string]: unknown;
}

export class WalmartNamespace {
  constructor(private client: Scavio) {}

  async search(
    options: WalmartSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/search", options);
  }

  async product(
    options: WalmartProductOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/product", options);
  }
}
