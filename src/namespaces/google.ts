import type { Scavio } from "../client.js";

/**
 * Google endpoints (scrape.do engine, /api/v2/google). A faithful passthrough
 * that returns Google's full response. Every endpoint costs 1 credit. Any
 * additional scrape.do parameter can be added to the options object.
 * See https://scavio.dev/docs/search-api.
 */

export interface GoogleSearchOptions {
  /** Search query (1-500 characters). */
  query: string;
  /** Device to emulate. */
  device?: "desktop" | "mobile";
  /** Result offset: 0 = page 1, 10 = page 2, ... up to 990. */
  start?: number;
  /** Include the raw Google HTML in the response. */
  include_html?: boolean;
  /** UI language (ISO 639-1, e.g. 'en'). */
  hl?: string;
  /** Country of the search (ISO 3166-1 alpha-2, e.g. 'us'). */
  gl?: string;
  /** Regional Google domain (e.g. 'google.co.uk'). */
  google_domain?: string;
  /** Canonical location name; auto-encoded to a UULE string. */
  location?: string;
  /** Pre-encoded UULE location string (takes priority over location). */
  uule?: string;
  /** Language restrict (e.g. 'lang_en'). */
  lr?: string;
  /** Country restrict (e.g. 'countryUS'). */
  cr?: string;
  /** SafeSearch filter. */
  safe?: "active";
  /** Disable spelling correction / auto-fixes when true. */
  nfpr?: boolean;
  /** '0' disables the omitted/similar-results filter. */
  filter?: "0" | "1";
  /** Restrict results to a recent time window. */
  time_period?:
    | "last_hour"
    | "last_day"
    | "last_week"
    | "last_month"
    | "last_year";
  /** Resolve a deferred AI Overview (server default true). */
  resolve_ai_overview?: boolean;
  [key: string]: unknown;
}

export interface GoogleAiModeOptions {
  /** Question or prompt (1-500 characters). */
  query: string;
  /** Device to emulate. */
  device?: "desktop" | "mobile";
  /** Include the raw Google HTML in the response. */
  include_html?: boolean;
  /** UI language (ISO 639-1, e.g. 'en'). */
  hl?: string;
  /** Country of the search (ISO 3166-1 alpha-2, e.g. 'us'). */
  gl?: string;
  /** Regional Google domain (e.g. 'google.co.uk'). */
  google_domain?: string;
  /** Canonical location name; auto-encoded to a UULE string. */
  location?: string;
  /** Pre-encoded UULE location string (takes priority over location). */
  uule?: string;
  /** SafeSearch filter. */
  safe?: "active";
  [key: string]: unknown;
}

export interface GoogleMapsSearchOptions {
  /** Search query (1-500 characters). */
  query: string;
  /** Result offset; must be a multiple of 20 (0, 20, 40, ...). */
  start?: number;
  /** Map center as '@lat,lng,zoomz'; controls where results come from. */
  ll?: string;
  /** UI language (ISO 639-1, e.g. 'en'). */
  hl?: string;
  /** Country of the search (ISO 3166-1 alpha-2, e.g. 'us'). */
  gl?: string;
  /** Regional Google domain (e.g. 'google.co.uk'). */
  google_domain?: string;
  [key: string]: unknown;
}

export interface GoogleMapsPlaceOptions {
  /** Place ID (ChIJ...). */
  place_id?: string;
  /** Numeric CID. */
  data_cid?: string;
  [key: string]: unknown;
}

export interface GoogleMapsReviewsOptions {
  /** Data ID (0xHEX:0xHEX). */
  data_id?: string;
  /** Place ID (ChIJ...). */
  place_id?: string;
  /** Reviews per page (1-20). */
  num?: number;
  /** Pagination cursor from a prior response. */
  next_page_token?: string;
  /** Sort order. */
  sort_by?: "relevance" | "newest" | "highest_rating" | "lowest_rating";
  /** UI language (ISO 639-1, e.g. 'en'). */
  hl?: string;
  /** Country of the search (ISO 3166-1 alpha-2, e.g. 'us'). */
  gl?: string;
  /** Regional Google domain (e.g. 'google.co.uk'). */
  google_domain?: string;
  [key: string]: unknown;
}

export interface GoogleShoppingOptions {
  /** Product search query (1-500 characters). */
  query: string;
  /** Device to emulate. */
  device?: "desktop" | "mobile";
  /** Result offset. */
  start?: number;
  /** Minimum price filter. */
  min_price?: number;
  /** Maximum price filter. */
  max_price?: number;
  /** 0 = relevance, 1 = price ascending, 2 = price descending. */
  sort_by?: number;
  /** Only items with free shipping. */
  free_shipping?: boolean;
  /** Only items on sale. */
  on_sale?: boolean;
  /** Opaque Google Shopping filter token. */
  shoprs?: string;
  /** UI language (ISO 639-1, e.g. 'en'). */
  hl?: string;
  /** Country of the search (ISO 3166-1 alpha-2, e.g. 'us'). */
  gl?: string;
  /** Regional Google domain (e.g. 'google.co.uk'). */
  google_domain?: string;
  /** Canonical location name; auto-encoded to a UULE string. */
  location?: string;
  /** Pre-encoded UULE location string (takes priority over location). */
  uule?: string;
  [key: string]: unknown;
}

export interface GoogleShoppingProductOptions {
  /** Durable product catalog id. */
  catalog_id?: string;
  /** Product query; required when catalog_id is set. */
  query?: string;
  /** Immersive product page token. */
  immersive_product_page_token?: string;
  /** Alias for immersive_product_page_token. */
  page_token?: string;
  /** Product id. */
  product_id?: string;
  /** Device to emulate. */
  device?: "desktop" | "mobile" | "tablet";
  /** Regional Google domain (e.g. 'google.co.uk'). */
  google_domain?: string;
  /** Seller sort order. */
  sort_by?: "base_price" | "total_price" | "promotion" | "seller_rating";
  /** Load all available stores. */
  load_all_stores?: boolean;
  /** Fetch additional stores. */
  more_stores?: boolean;
  /** UI language (ISO 639-1, e.g. 'en'). */
  hl?: string;
  /** Country of the search (ISO 3166-1 alpha-2, e.g. 'us'). */
  gl?: string;
  /** Canonical location name; auto-encoded to a UULE string. */
  location?: string;
  /** Pre-encoded UULE location string (takes priority over location). */
  uule?: string;
  [key: string]: unknown;
}

export interface GoogleShoppingStoresOptions {
  /** Durable product catalog id. */
  catalog_id: string;
  /** Pagination cursor from shopping_product. */
  next_page_token: string;
  [key: string]: unknown;
}

export interface GoogleFlightsOptions {
  /** Departure IATA code(s); comma-separated allowed. */
  departure_id: string;
  /** Arrival IATA code(s); comma-separated allowed. */
  arrival_id: string;
  /** Outbound date (YYYY-MM-DD). */
  outbound_date: string;
  /** 1 = round trip, 2 = one way, 3 = multi-city. */
  type?: number;
  /** Return date (YYYY-MM-DD); required when type=1. */
  return_date?: string;
  /** Number of adults (1-9). */
  adults?: number;
  /** Number of children (0-9). */
  children?: number;
  /** Infants in seat (0-4). */
  infants_in_seat?: number;
  /** Infants on lap (0-4). */
  infants_on_lap?: number;
  /** 1 = economy, 2 = premium, 3 = business, 4 = first. */
  travel_class?: number;
  /** 0 = any, 1 = nonstop, 2 = <=1 stop, 3 = <=2 stops. */
  stops?: number;
  /** 1 = top, 2 = price, 3 = departure, 4 = arrival, 5 = duration, 6 = emissions. */
  sort_by?: number;
  /** Comma-separated airline codes/alliances to include. */
  include_airlines?: string;
  /** Comma-separated airline codes/alliances to exclude. */
  exclude_airlines?: string;
  /** UI language (ISO 639-1, e.g. 'en'). */
  hl?: string;
  /** Country of the search (ISO 3166-1 alpha-2, e.g. 'us'). */
  gl?: string;
  /** Currency code (ISO 4217, e.g. 'USD'). */
  currency?: string;
  [key: string]: unknown;
}

export interface GoogleHotelsOptions {
  /** Search query; use a '<City> hotels' form. */
  query: string;
  /** Check-in date (YYYY-MM-DD). */
  check_in_date: string;
  /** Check-out date (YYYY-MM-DD). */
  check_out_date: string;
  /** UI language (ISO 639-1, e.g. 'en'). */
  hl?: string;
  /** Country of the search (ISO 3166-1 alpha-2, e.g. 'us'). */
  gl?: string;
  /** Currency code (ISO 4217, e.g. 'USD'). */
  currency?: string;
  /** 3 = lowest price, 8 = highest rating, 13 = most reviewed. */
  sort_by?: number;
  /** Minimum nightly price. */
  min_price?: number;
  /** Maximum nightly price. */
  max_price?: number;
  /** 7 = 3.5+, 8 = 4.0+, 9 = 4.5+. */
  rating?: number;
  /** Comma-separated star ratings (2-5). */
  hotel_class?: string;
  /** Comma-separated amenity ids. */
  amenities?: string;
  /** Comma-separated property-type ids (e.g. '12' for vacation rentals). */
  property_types?: string;
  /** Only properties with free cancellation. */
  free_cancellation?: boolean;
  /** Only eco-certified properties. */
  eco_certified?: boolean;
  /** Only properties with special offers. */
  special_offers?: boolean;
  /** Pagination cursor from a prior response. */
  next_page_token?: string;
  /** Number of properties to return (1-20). */
  limit?: number;
  [key: string]: unknown;
}

export interface GoogleHotelsDetailOptions {
  /** Property detail token from a hotels listing. */
  detail_token: string;
  /** Check-in date (YYYY-MM-DD). */
  check_in_date: string;
  /** Check-out date (YYYY-MM-DD). */
  check_out_date: string;
  /** Currency code (ISO 4217, e.g. 'USD'). */
  currency?: string;
  /** Country of the search (ISO 3166-1 alpha-2, e.g. 'us'). */
  gl?: string;
  /** UI language (ISO 639-1, e.g. 'en'). */
  hl?: string;
  [key: string]: unknown;
}

export interface GoogleNewsOptions {
  /** Keyword search. */
  query?: string;
  /** Browse a news topic. */
  topic_token?: string;
  /** Browse a topic section. */
  section_token?: string;
  /** Fetch full coverage of a story. */
  story_token?: string;
  /** Browse a publication. */
  publication_token?: string;
  /** Knowledge Graph entity id. */
  kgmid?: string;
  /** UI language (ISO 639-1, e.g. 'en'). */
  hl?: string;
  /** Country of the search (ISO 3166-1 alpha-2, e.g. 'us'). */
  gl?: string;
  /** Regional Google domain (e.g. 'google.co.uk'). */
  google_domain?: string;
  /** Sort order: 0 = relevance, 1 = date (only with query or kgmid). */
  so?: number;
  [key: string]: unknown;
}

export interface GoogleTrendsOptions {
  /** Search term(s); comma-separated for comparisons. */
  query: string;
  /** Location code (e.g. 'US', 'GB', 'US-CA'). */
  geo?: string;
  /** UI language (ISO 639-1, e.g. 'en'). */
  hl?: string;
  /** Time range (e.g. 'today 12-m', 'now 7-d'). */
  date?: string;
  /** Timezone offset in minutes. */
  tz?: string;
  /** Which trends dataset to return. */
  data_type?:
    | "TIMESERIES"
    | "GEO_MAP"
    | "GEO_MAP_0"
    | "RELATED_QUERIES"
    | "RELATED_TOPICS";
  /** Category id. */
  cat?: string;
  /** Google property filter. */
  gprop?: "images" | "news" | "youtube" | "froogle";
  /** Resolution for GEO_MAP data. */
  region?: "COUNTRY" | "REGION" | "DMA" | "CITY";
  [key: string]: unknown;
}

export interface GoogleTrendingOptions {
  /** Country code (e.g. 'US'). */
  geo: string;
  /** UI language (ISO 639-1, e.g. 'en'). */
  hl?: string;
  /** Trending window: 4, 24, 48, or 168. */
  hours?: number;
  /** Category id (0-20). */
  cat?: number;
  /** Sort order. */
  sort?: "relevance" | "search_volume" | "recency" | "title";
  /** Filter by trend status. */
  status?: "all" | "active";
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
