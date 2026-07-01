import type { Scavio } from "../client.js";

/**
 * Google endpoints (scrape.do engine, /api/v2/google). A faithful passthrough
 * that returns Google's full response. Every endpoint costs 1 credit. Any
 * additional scrape.do parameter can be added to the options object.
 * See https://scavio.dev/docs/search-api.
 */

export interface GoogleSearchOptions {
  query: string;
  [key: string]: unknown;
}
export interface GoogleAiModeOptions {
  query: string;
  [key: string]: unknown;
}
export interface GoogleMapsSearchOptions {
  query: string;
  [key: string]: unknown;
}
export interface GoogleMapsPlaceOptions {
  place_id?: string;
  data_cid?: string;
  [key: string]: unknown;
}
export interface GoogleMapsReviewsOptions {
  data_id?: string;
  place_id?: string;
  [key: string]: unknown;
}
export interface GoogleShoppingOptions {
  query: string;
  [key: string]: unknown;
}
export interface GoogleShoppingProductOptions {
  catalog_id?: string;
  query?: string;
  product_id?: string;
  [key: string]: unknown;
}
export interface GoogleShoppingStoresOptions {
  catalog_id: string;
  next_page_token: string;
  [key: string]: unknown;
}
export interface GoogleFlightsOptions {
  departure_id: string;
  arrival_id: string;
  outbound_date: string;
  [key: string]: unknown;
}
export interface GoogleHotelsOptions {
  query: string;
  check_in_date: string;
  check_out_date: string;
  [key: string]: unknown;
}
export interface GoogleHotelsDetailOptions {
  detail_token: string;
  check_in_date: string;
  check_out_date: string;
  [key: string]: unknown;
}
export interface GoogleNewsOptions {
  query?: string;
  [key: string]: unknown;
}
export interface GoogleTrendsOptions {
  query: string;
  [key: string]: unknown;
}
export interface GoogleTrendingOptions {
  geo: string;
  [key: string]: unknown;
}

export class GoogleNamespace {
  constructor(private client: Scavio) {}

  /** Google SERP search (includes the AI Overview when Google returns one). */
  async search(options: GoogleSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v2/google", options);
  }

  /** Google AI Mode answer. */
  async aiMode(options: GoogleAiModeOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v2/google/ai-mode", options);
  }

  /** Google Maps local results. */
  async mapsSearch(options: GoogleMapsSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v2/google/maps/search", options);
  }

  /** Google Maps place details. Provide place_id or data_cid. */
  async mapsPlace(options: GoogleMapsPlaceOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v2/google/maps/place", options);
  }

  /** Google Maps reviews. Provide data_id or place_id. */
  async mapsReviews(options: GoogleMapsReviewsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v2/google/maps/reviews", options);
  }

  /** Google Shopping search results. */
  async shopping(options: GoogleShoppingOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v2/google/shopping", options);
  }

  /** Google Shopping product. Pass catalog_id + query for full details and sellers. */
  async shoppingProduct(
    options: GoogleShoppingProductOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v2/google/shopping/product", options);
  }

  /** Google Shopping product sellers (continuation of shoppingProduct). */
  async shoppingStores(
    options: GoogleShoppingStoresOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v2/google/shopping/product/stores", options);
  }

  /** Google Flights. */
  async flights(options: GoogleFlightsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v2/google/flights", options);
  }

  /** Google Hotels search. */
  async hotels(options: GoogleHotelsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v2/google/hotels", options);
  }

  /** Google Hotels property details (from a hotels listing detail_token). */
  async hotelsDetail(
    options: GoogleHotelsDetailOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v2/google/hotels/detail", options);
  }

  /** Google News. Provide query or a topic/story/publication token. */
  async news(options: GoogleNewsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v2/google/news", options);
  }

  /** Google Trends data. */
  async trends(options: GoogleTrendsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v2/google/trends", options);
  }

  /** Google Trending Now for a country. */
  async trending(options: GoogleTrendingOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v2/google/trending", options);
  }
}
