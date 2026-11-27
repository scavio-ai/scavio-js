import type { Scavio } from "../client.js";

// Belk (belk.com, the US Southern department store) search, category, deals, categories, product,
// variant, storeAvailability, stores, store and reviews endpoints; US only, prices in USD, exact
// store units, 2 credits per call (product and variant up to 4, storeAvailability 1 plus 2 per
// looked-up variant). Generated from the backend routes: every option and its doc mirrors the API's
// own request schema; an input the API only accepts to refuse (a 400 that says 'not offered') is
// left out. The server enforces the value rules and the one-of rules (send one of an id or a link).
// Every call raises the request timeout to BELK_TIMEOUT and never lowers a longer client timeout.
// Failed upstream calls and refused inputs are not charged; a not-found is charged (credits_used is
// what was charged).

/** Minimum request timeout (ms) for every belk call. */
export const BELK_TIMEOUT = 240_000;

export interface BelkSearchOptions {
  /** Search keywords. */
  query: string;
  /**
   * Items in Belk's Sales & Promotions: doorbusters, super_buys, sale, clearance, todays_offers,
   * belk_market (belk_market = Belk Market, the marketplace). A list matches any of them.
   */
  sales_promotion?: "doorbusters" | "super_buys" | "sale" | "clearance" | "todays_offers" | "belk_market" | Array<"doorbusters" | "super_buys" | "sale" | "clearance" | "todays_offers" | "belk_market">;
  /** Page, 1-200 (60 items a page). Defaults to 1. */
  page?: number;
  /**
   * relevance (default), newest, price_low_to_high, price_high_to_low, top_rated, discount (highest
   * percent off at the top) or doorbusters_first: Belk's 7 sorts.
   */
  sort?: "relevance" | "newest" | "price_low_to_high" | "price_high_to_low" | "top_rated" | "discount" | "doorbusters_first";
  /** Items of these brands, as the Brand facet spells them. A list matches any of them. */
  brand?: string | string[];
  /**
   * Items in these colour groups (the Color facet: Black, Blue, Red...). A list matches any of
   * them.
   */
  color?: string | string[];
  /**
   * Items in these sizes, as group/size from the size facets (facets[].values[].value where id is
   * hierarchical_sizes, e.g. "Women's Regular/10", "Plus/1X").
   */
  size?: string | string[];
  /** Items a Belk coupon applies to (the Coupon Eligible facet, e.g. BFISHERE). */
  coupon_code?: string | string[];
  /** Items at least this percent off: one of Belk's discount bands 20, 30, 40, 50, 60, 70, 80. */
  min_discount?: number;
  /** Minimum price in USD. */
  min_price?: number;
  /** Maximum price in USD. */
  max_price?: number;
  /**
   * Items available for free store pickup at this Belk store (stores[].store_id from /belk/stores).
   */
  pickup_store_id?: string | number;
  /**
   * Any other facet from a previous answer's facets: its id to one value or a list (e.g. {"Gender":
   * "Women", "Occasion": "Casual"}). Up to 8.
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface BelkCategoryOptions {
  /** A Belk category path (categories[].path from /belk/categories) or a belk.com category link. */
  category: string;
  /**
   * Items in Belk's Sales & Promotions: doorbusters, super_buys, sale, clearance, todays_offers,
   * belk_market (belk_market = Belk Market, the marketplace). A list matches any of them.
   */
  sales_promotion?: "doorbusters" | "super_buys" | "sale" | "clearance" | "todays_offers" | "belk_market" | Array<"doorbusters" | "super_buys" | "sale" | "clearance" | "todays_offers" | "belk_market">;
  /** Page, 1-200 (60 items a page). Defaults to 1. */
  page?: number;
  /**
   * relevance (default), newest, price_low_to_high, price_high_to_low, top_rated, discount (highest
   * percent off at the top) or doorbusters_first: Belk's 7 sorts.
   */
  sort?: "relevance" | "newest" | "price_low_to_high" | "price_high_to_low" | "top_rated" | "discount" | "doorbusters_first";
  /** Items of these brands, as the Brand facet spells them. A list matches any of them. */
  brand?: string | string[];
  /**
   * Items in these colour groups (the Color facet: Black, Blue, Red...). A list matches any of
   * them.
   */
  color?: string | string[];
  /**
   * Items in these sizes, as group/size from the size facets (facets[].values[].value where id is
   * hierarchical_sizes, e.g. "Women's Regular/10", "Plus/1X").
   */
  size?: string | string[];
  /** Items a Belk coupon applies to (the Coupon Eligible facet, e.g. BFISHERE). */
  coupon_code?: string | string[];
  /** Items at least this percent off: one of Belk's discount bands 20, 30, 40, 50, 60, 70, 80. */
  min_discount?: number;
  /** Minimum price in USD. */
  min_price?: number;
  /** Maximum price in USD. */
  max_price?: number;
  /**
   * Items available for free store pickup at this Belk store (stores[].store_id from /belk/stores).
   */
  pickup_store_id?: string | number;
  /**
   * Any other facet from a previous answer's facets: its id to one value or a list (e.g. {"Gender":
   * "Women", "Occasion": "Casual"}). Up to 8.
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface BelkDealsOptions {
  /**
   * doorbusters (default), super_buys, clearance, sale (Sale Items) or todays_offers (Today's
   * Offers).
   */
  type?: "doorbusters" | "super_buys" | "clearance" | "sale" | "todays_offers";
  /** Deals inside this Belk category (a path from /belk/categories). Without it: all of Belk. */
  category?: string;
  /** Page, 1-200 (60 items a page). Defaults to 1. */
  page?: number;
  /**
   * relevance (default), newest, price_low_to_high, price_high_to_low, top_rated, discount (highest
   * percent off at the top) or doorbusters_first: Belk's 7 sorts.
   */
  sort?: "relevance" | "newest" | "price_low_to_high" | "price_high_to_low" | "top_rated" | "discount" | "doorbusters_first";
  /** Items of these brands, as the Brand facet spells them. A list matches any of them. */
  brand?: string | string[];
  /**
   * Items in these colour groups (the Color facet: Black, Blue, Red...). A list matches any of
   * them.
   */
  color?: string | string[];
  /**
   * Items in these sizes, as group/size from the size facets (facets[].values[].value where id is
   * hierarchical_sizes, e.g. "Women's Regular/10", "Plus/1X").
   */
  size?: string | string[];
  /** Items a Belk coupon applies to (the Coupon Eligible facet, e.g. BFISHERE). */
  coupon_code?: string | string[];
  /** Items at least this percent off: one of Belk's discount bands 20, 30, 40, 50, 60, 70, 80. */
  min_discount?: number;
  /** Minimum price in USD. */
  min_price?: number;
  /** Maximum price in USD. */
  max_price?: number;
  /**
   * Items available for free store pickup at this Belk store (stores[].store_id from /belk/stores).
   */
  pickup_store_id?: string | number;
  /**
   * Any other facet from a previous answer's facets: its id to one value or a list (e.g. {"Gender":
   * "Women", "Occasion": "Casual"}). Up to 8.
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface BelkCategoriesOptions {
  [key: string]: unknown;
}

export interface BelkProductOptions {
  /** Belk product id (items[].id, or the part before .html in a product link). */
  product_id?: string | number;
  /** A belk.com product link (items[].url), instead of product_id. */
  url?: string;
  [key: string]: unknown;
}

export interface BelkVariantOptions {
  /** Belk variant id (variants[].variant_id from /belk/product). */
  variant_id: string;
  /**
   * Also the price and stock flag of every colour at this variant's size (one more call: 4
   * credits).
   */
  include_color_prices?: boolean;
  [key: string]: unknown;
}

export interface BelkStoreAvailabilityOptions {
  /** Belk variant id (variants[].variant_id from /belk/product). */
  variant_id?: string;
  /**
   * The variant's orin from /belk/variant. With it: no lookup, 1 credit. A wrong orin answers 0 at
   * every store.
   */
  orin?: string;
  /** Up to 5 variants in one call, instead of variant_id. */
  items?: Array<{ variant_id: string; orin?: string }>;
  /** 1-10 Belk store ids (stores[].store_id from /belk/stores; array or comma-separated). */
  store_ids: Array<string | number> | string;
  [key: string]: unknown;
}

export interface BelkStoresOptions {
  /** A US ZIP code. */
  zip: string | number;
  [key: string]: unknown;
}

export interface BelkStoreOptions {
  /** Belk store id (stores[].store_id). */
  store_id: string | number;
  [key: string]: unknown;
}

export interface BelkReviewsOptions {
  /** Belk product id (items[].id, or the part before .html in a product link). */
  product_id?: string | number;
  /** A belk.com product link (items[].url), instead of product_id. */
  url?: string;
  [key: string]: unknown;
}

export class BelkNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = BELK_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/belk/${path}`, options, undefined, timeout);
  }

  /**
   * Search Belk (belk.com, the US Southern department store). Scavio fetches Belk's public pages on
   * request; Belk has no public API. US only, USD. Sort by Belk's 7 sorts; filter by brand, colour,
   * size, sales promotion (doorbusters, super buys, sale, clearance, today's offers, Belk Market),
   * coupon code, discount band, price range, free-pickup store and any other facet. 60 items a
   * page. Costs 2 credits.
   */
  async search(options: BelkSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Belk category's products by path or link. Sort by Belk's 7 sorts; filter by brand, colour,
   * size, sales promotion (doorbusters, super buys, sale, clearance, today's offers, Belk Market),
   * coupon code, discount band, price range, free-pickup store and any other facet. Costs 2
   * credits.
   */
  async category(options: BelkCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * Belk's deal listings: Doorbusters, Super Buys, Clearance, Sale Items or Today's Offers, across
   * Belk or inside one category, with the same sorts and filters as search. Costs 2 credits.
   */
  async deals(options: BelkDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /** Belk's department menu (15 departments, about 700 nodes). Costs 2 credits. */
  async categories(options: BelkCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One Belk product by link (2 credits when it is Belk's canonical link; 4 when Belk redirects to
   * it, as an older or shortened link does) or by product_id (always found through Belk's redirect.
   * Costs 2 credits by Belk's canonical product link; 4 when Belk redirects to it (an older or
   * shortened link, or a product_id, which always redirects). credits_used in the response is the
   * exact charge.
   */
  async product(options: BelkProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One Belk variant (a colour + size of a product). Costs 2 credits; 4 with include_color_prices:
   * true (one more call). credits_used in the response is the exact charge.
   */
  async variant(options: BelkVariantOptions): Promise<Record<string, unknown>> {
    return this.post("variant", options);
  }

  /**
   * Exact store stock for 1-5 Belk variants at 1-10 stores, as Belk's store picker reports it.
   * Costs 1 credit when every orin is given, plus 2 per variant whose orin is looked up (one
   * variant: 3, two: 5, five: 11). credits_used in the response is the exact charge.
   */
  async storeAvailability(options: BelkStoreAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.post("store-availability", options);
  }

  /** Belk stores near a US ZIP code. Costs 2 credits. */
  async stores(options: BelkStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One Belk store by id: store_id, name, address, phone, latitude, longitude, this_week_hours
   * [{day, hours, differs_from_regular}], pickup_location (where in the store orders are picked up)
   * and events. An unknown store is a charged 404. 2 credits. A not-found is charged; failed
   * upstream calls and refused inputs are not. Usually 2-15 s; set a client timeout of at least 90
   * s. Costs 2 credits.
   */
  async store(options: BelkStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * The 8 newest reviews of one Belk product as Belk shows them (Belk serves no further pages, sort
   * or star filter). Costs 2 credits.
   */
  async reviews(options: BelkReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }
}
