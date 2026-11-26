import type { Scavio } from "../client.js";

// REI (rei.com, the US outdoor co-op) search, category, deals, product, reviews, storeStock,
// stores, store and suggestions endpoints; US only, prices in USD, 2 credits each. Generated from
// the backend routes: every option and its doc mirrors the API's own request schema; an input the
// API only accepts to refuse (a 400 that says 'not offered') is left out. The server enforces the
// value rules and the one-of rules (send one of an id or a link). Every call raises the request
// timeout to REI_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and
// refused inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every rei call. */
export const REI_TIMEOUT = 240_000;

export interface ReiSearchOptions {
  /** Search keywords. */
  query: string;
  /** Results page, 1-based. Defaults to 1; total_pages reports the last one. */
  page?: number;
  /** 30 (default) or 90 results per page, the two sizes REI offers. */
  page_size?: 30 | 90;
  /**
   * relevance (default, REI's Best Match), brand_a_z, brand_z_a, price_asc, price_desc, newest,
   * top_rated (rating, then review count), best_selling or percent_off.
   */
  sort?: "relevance" | "brand_a_z" | "brand_z_a" | "price_asc" | "price_desc" | "newest" | "top_rated" | "best_selling" | "percent_off";
  /**
   * Facet filters from a previous answer: {facets[].key: facets[].values[].value, or a list of
   * values (OR-ed)}, at most 10 keys. Values are passed exactly as REI writes them, e.g. {"brand":
   * "arcteryx"}, {"price": "$20.00 to $49.99"}, {"average-rating": "4 to 5"}, {"category":
   * "womens-clothing|womens-jackets"} (categories[].value). Keys combine.
   */
  facets?: Record<string, unknown>;
  /**
   * A store_number (stores, store-stock): limits results to items REI shows as available at that
   * store (its own store filter). store_filter reports the store and its count.
   */
  store?: string | number;
  [key: string]: unknown;
}

export interface ReiCategoryOptions {
  /**
   * A category slug (categories[].slug or breadcrumbs[].slug, the part after /c/ in an rei.com
   * link).
   */
  slug?: string;
  /** An rei.com category link (its query string is not read: send filters in facets). */
  url?: string;
  /** Results page, 1-based. Defaults to 1; total_pages reports the last one. */
  page?: number;
  /** 30 (default) or 90 results per page, the two sizes REI offers. */
  page_size?: 30 | 90;
  /**
   * relevance (default, REI's Best Match), brand_a_z, brand_z_a, price_asc, price_desc, newest,
   * top_rated (rating, then review count), best_selling or percent_off.
   */
  sort?: "relevance" | "brand_a_z" | "brand_z_a" | "price_asc" | "price_desc" | "newest" | "top_rated" | "best_selling" | "percent_off";
  /**
   * Facet filters from a previous answer: {facets[].key: facets[].values[].value, or a list of
   * values (OR-ed)}, at most 10 keys. Values are passed exactly as REI writes them, e.g. {"brand":
   * "arcteryx"}, {"price": "$20.00 to $49.99"}, {"average-rating": "4 to 5"}, {"category":
   * "womens-clothing|womens-jackets"} (categories[].value). Keys combine.
   */
  facets?: Record<string, unknown>;
  /**
   * A store_number (stores, store-stock): limits results to items REI shows as available at that
   * store (its own store filter). store_filter reports the store and its count.
   */
  store?: string | number;
  [key: string]: unknown;
}

export interface ReiDealsOptions {
  /** deals (default: everything on sale or clearance) or outlet (REI Outlet). */
  type?: "deals" | "outlet";
  /** Optional category slug: limits the deals to one category. */
  category?: string;
  /** Results page, 1-based. Defaults to 1; total_pages reports the last one. */
  page?: number;
  /** 30 (default) or 90 results per page, the two sizes REI offers. */
  page_size?: 30 | 90;
  /**
   * relevance (default, REI's Best Match), brand_a_z, brand_z_a, price_asc, price_desc, newest,
   * top_rated (rating, then review count), best_selling or percent_off.
   */
  sort?: "relevance" | "brand_a_z" | "brand_z_a" | "price_asc" | "price_desc" | "newest" | "top_rated" | "best_selling" | "percent_off";
  /**
   * Facet filters from a previous answer: {facets[].key: facets[].values[].value, or a list of
   * values (OR-ed)}, at most 10 keys. Values are passed exactly as REI writes them, e.g. {"brand":
   * "arcteryx"}, {"price": "$20.00 to $49.99"}, {"average-rating": "4 to 5"}, {"category":
   * "womens-clothing|womens-jackets"} (categories[].value). Keys combine.
   */
  facets?: Record<string, unknown>;
  /**
   * A store_number (stores, store-stock): limits results to items REI shows as available at that
   * store (its own store filter). store_filter reports the store and its count.
   */
  store?: string | number;
  [key: string]: unknown;
}

export interface ReiProductOptions {
  /** The REI product id (items[].product_id, e.g. 243702 or C09719). */
  product_id?: string;
  /** An rei.com product link. */
  url?: string;
  [key: string]: unknown;
}

export interface ReiReviewsOptions {
  /** The REI product id. */
  product_id?: string;
  /** An rei.com product link, instead of product_id. */
  url?: string;
  /** relevance (default), most_helpful, newest, highest_rating or lowest_rating. */
  sort?: "relevance" | "most_helpful" | "newest" | "highest_rating" | "lowest_rating";
  /** Page of 10 reviews, 1-based. */
  page?: number;
  /**
   * Star filter: 1-5 or a list (e.g. [1, 2] for the critical reviews). total then counts the
   * matching reviews.
   */
  rating?: number | number[];
  [key: string]: unknown;
}

export interface ReiStoreStockOptions {
  /** A SKU id: product skus[].sku_id or items[].sizes[].skus[].sku_id. */
  sku: string;
  /** US ZIP code. Pass one of zip, city + state, or latitude + longitude. */
  zip?: string | number;
  /** US city (with state). */
  city?: string;
  /** 2-letter state code (with city). */
  state?: string;
  /** Latitude (with longitude). */
  latitude?: number;
  /** Longitude (with latitude). */
  longitude?: number;
  [key: string]: unknown;
}

export interface ReiStoresOptions {
  /** US ZIP code to search around. */
  zip?: string | number;
  /** Latitude (with longitude), instead of zip. */
  latitude?: number;
  /** Longitude (with latitude). */
  longitude?: number;
  /** Stores to return, 1-10. Defaults to 10. */
  limit?: number;
  /** Radius in miles, 1-250. Defaults to 100. */
  radius?: number;
  [key: string]: unknown;
}

export interface ReiStoreOptions {
  /** The store number (stores[].store_number, e.g. 18 for Denver Flagship). */
  store_number: string | number;
  [key: string]: unknown;
}

export interface ReiSuggestionsOptions {
  /** What the shopper has typed so far. */
  query: string;
  /** Suggestions to return, 1-50. Defaults to 10. */
  limit?: number;
  [key: string]: unknown;
}

export class ReiNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = REI_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/rei/${path}`, options, undefined, timeout);
  }

  /**
   * Search REI (rei.com, the US outdoor co-op). Scavio fetches the public rei.com page on request;
   * REI has no public API. US storefront, prices in US dollars, as shown to a visitor who is not
   * signed in. By keyword, in the site's 9 sorts, 30 or 90 per page, filtered by any facet (brand,
   * price, rating, deals, features, color, size...) and by one store. Costs 2 credits.
   */
  async search(options: ReiSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category of REI (rei.com, the US outdoor co-op). Scavio fetches the public rei.com page on
   * request; REI has no public API. US storefront, prices in US dollars, as shown to a visitor who
   * is not signed in. By slug or link (tents, mens-rain-jackets, camping-and-hiking...), sorted and
   * filtered like search. Costs 2 credits.
   */
  async category(options: ReiCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The deal listings of REI (rei.com, the US outdoor co-op). Scavio fetches the public rei.com
   * page on request; REI has no public API. US storefront, prices in US dollars, as shown to a
   * visitor who is not signed in. deals (everything on sale or clearance) or outlet (REI Outlet),
   * optionally in one category, sorted and filtered like search. Costs 2 credits.
   */
  async deals(options: ReiDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * One product of REI (rei.com, the US outdoor co-op). Scavio fetches the public rei.com page on
   * request; REI has no public API. US storefront, prices in US dollars, as shown to a visitor who
   * is not signed in. By id or link. Costs 2 credits.
   */
  async product(options: ReiProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Reviews of one product of REI (rei.com, the US outdoor co-op). Scavio fetches the public
   * rei.com page on request; REI has no public API. US storefront, prices in US dollars, as shown
   * to a visitor who is not signed in. 10 per page in the site's 5 sorts, optionally filtered by
   * star rating. Costs 2 credits.
   */
  async reviews(options: ReiReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * Store pickup status of one SKU of REI (rei.com, the US outdoor co-op). Scavio fetches the
   * public rei.com page on request; REI has no public API. US storefront, prices in US dollars, as
   * shown to a visitor who is not signed in. At the 4-10 REI stores nearest a ZIP, a city + state
   * or a point. Costs 2 credits.
   */
  async storeStock(options: ReiStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /**
   * The stores of REI (rei.com, the US outdoor co-op). Scavio fetches the public rei.com page on
   * request; REI has no public API. US storefront, prices in US dollars, as shown to a visitor who
   * is not signed in. Near a US ZIP code or a point, ordered by distance, up to 10 within 100 miles
   * by default. Costs 2 credits.
   */
  async stores(options: ReiStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One store of REI (rei.com, the US outdoor co-op). Scavio fetches the public rei.com page on
   * request; REI has no public API. US storefront, prices in US dollars, as shown to a visitor who
   * is not signed in. By store number. Costs 2 credits.
   */
  async store(options: ReiStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * The search-term suggestions of REI (rei.com, the US outdoor co-op). Scavio fetches the public
   * rei.com page on request; REI has no public API. US storefront, prices in US dollars, as shown
   * to a visitor who is not signed in. For a partial query. Costs 2 credits.
   */
  async suggestions(options: ReiSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
