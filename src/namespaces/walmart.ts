import type { Scavio } from "../client.js";

export interface WalmartSearchOptions {
  query: string;
  domain?: string;
  device?: string;
  sort_by?: string;
  start_page?: number;
  min_price?: number;
  max_price?: number;
  fulfillment_speed?: string;
  fulfillment_type?: string;
  delivery_zip?: string;
  store_id?: string;
}

export interface WalmartProductOptions {
  product_id: string;
  domain?: string;
  device?: string;
  delivery_zip?: string;
  store_id?: string;
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
