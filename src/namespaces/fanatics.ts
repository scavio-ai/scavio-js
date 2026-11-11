import type { Scavio } from "../client.js";

// Fanatics: 5 endpoints, fanatics.com + 7 country storefronts (local
// currency) + 4 US league stores, 1 credit each. Merchandise and product data
// (jerseys, hats, fan gear, collectibles), not sportsbook odds.
//
// search(), product(), browse() and deals() take country (8 storefronts, us
// when omitted on the server), language (ca only: en / fr) and site (a US
// league store, with country us); reviews() is US only. product() and
// reviews() take product_id or url; browse() takes url or ids (not both; a
// league alone needs another id or a filter); price_band and deals under_25
// are not on jp. The server enforces these. Every call raises the request
// timeout to FANATICS_TIMEOUT when the client's is shorter, except reviews():
// it usually takes 20-90 s, up to about 4 minutes, so it uses
// FANATICS_REVIEWS_TIMEOUT.

/** Minimum request timeout (ms) for every fanatics call except reviews(). */
export const FANATICS_TIMEOUT = 120_000;

/** Minimum request timeout (ms) for fanatics.reviews(). */
export const FANATICS_REVIEWS_TIMEOUT = 300_000;

/**
 * Storefronts: us (fanatics.com, USD, default), gb (GBP), de, fr, es, it
 * (EUR), jp (JPY), ca (CAD). Titles come in the storefront's language, prices
 * in its currency.
 */
export type FanaticsCountry = "us" | "gb" | "de" | "fr" | "es" | "it" | "jp" | "ca";

/** US league stores (country us): fanatics (default), nflshop, mlbshop, nhlshop, mlsstore. Same product ids on every store; department and filter ids are per store (Jerseys: 8011 on fanatics, 14012 on nflshop), so take them from the facets of the store you query. */
export type FanaticsSite = "fanatics" | "nflshop" | "mlbshop" | "nhlshop" | "mlsstore";

/** Listing sorts; top_sellers is the default. Price sorts order by the current price (price, before any promo code), not the with-code price. */
export type FanaticsSort = "top_sellers" | "price_low_to_high" | "price_high_to_low" | "newest";

export type FanaticsGender = "men" | "women" | "kids" | "baby";

/** The site's price bands in the storefront's currency. Not on jp. */
export type FanaticsPriceBand = "under_25" | "25_50" | "50_100" | "100_150" | "over_150";

/** deals() lists: sale (default), clearance, under_25 (not on jp). */
export type FanaticsDealType = "sale" | "clearance" | "under_25";

/** reviews() sorts: highest_rated (default, the site's order), lowest_rated, most_recent, most_helpful. */
export type FanaticsReviewSort = "highest_rated" | "lowest_rated" | "most_recent" | "most_helpful";

/** A facet id: a number, or a digit string ("8008-8084" for a sub-department). */
export type FanaticsId = number | string;

/** Storefront, language and league store, shared by search(), product(), browse() and deals(). */
export interface FanaticsMarketOptions {
  /** The storefront (us when omitted). Titles come in its language, prices in its currency. */
  country?: FanaticsCountry;
  /** ca only: en (default) or fr. */
  language?: "en" | "fr";
  /** US only (country us): fanatics (default), nflshop, mlbshop, nhlshop or mlsstore. Each store writes its own titles. */
  site?: FanaticsSite;
}

/** Paging and sort shared by search(), browse() and deals(). */
export interface FanaticsGridOptions extends FanaticsMarketOptions {
  /** Results page, 1-based (up to 375). Defaults to 1. Fanatics lists at most 9000 products per listing. */
  page?: number;
  /** Items per page: 24, 48 or 72. Defaults to 72. */
  page_size?: 24 | 48 | 72;
  /** top_sellers (default), price_low_to_high, price_high_to_low or newest. */
  sort?: FanaticsSort;
}

/**
 * Filters from a previous response: { facets[].values[].filter:
 * facets[].values[].value }, one value per filter (up to 12), e.g.
 * { ga: "2" } (Women), { ks: "126" } (a kids size), { fa: "1" } (Autographed),
 * { t: "3433" } (a team).
 */
export type FanaticsFilters = Record<string, string | number>;

export interface FanaticsSearchOptions extends FanaticsGridOptions {
  /** Search keywords, e.g. "chiefs jersey". Misspellings are corrected by the site (corrected_query). */
  query: string;
  /** men, women, kids or baby. */
  gender?: FanaticsGender;
  /** Narrow to one league (an id from facets: NFL 25, MLB 19, NBA 23, NHL 26, College 5). */
  league_id?: FanaticsId;
  /** Narrow to one department (an id from the facets of the same storefront / store: on fanatics.com Jerseys 8011, Hats 8008, T-Shirts 8022; nflshop Jerseys 14012). */
  department_id?: FanaticsId;
  filters?: FanaticsFilters;
  [key: string]: unknown;
}

/** Pass product_id or url. */
export interface FanaticsProductOptions extends FanaticsMarketOptions {
  /** A Fanatics product id: a search result's id, e.g. "3892922". The same id works on every league store. */
  product_id?: string;
  /** A product URL on any covered storefront or league store (its storefront is used). Alternative to product_id. */
  url?: string;
  [key: string]: unknown;
}

/** Pass url or ids (not both). A league alone is a landing page: combine it with another id or a filter. */
export interface FanaticsBrowseOptions extends FanaticsGridOptions {
  /** A Fanatics listing URL: a team, player, league section, department, brand or collection page. */
  url?: string;
  /** League id (NFL 25, MLB 19, NBA 23, NHL 26, College 5). */
  league_id?: FanaticsId;
  /** Team id (from facets: Los Angeles Lakers 3372, Kansas City Chiefs 3433). */
  team_id?: FanaticsId;
  /** Player id, from the players facet when the page lists one (e.g. Lakers) or a product's player field: Patrick Mahomes 12072, Aaron Judge 31. */
  player_id?: FanaticsId;
  /** Department id from the same store's facets (fanatics.com: Hats 8008, Jerseys 8011; nflshop Jerseys 14012), or parent-child for a sub-department ("8008-8084"). */
  department_id?: FanaticsId;
  /** Brand id (from facets.brands: '47 479, Nike 76, New Era 127). */
  brand_id?: FanaticsId;
  /** Collection id (from facets.productGroups: City Edition 11552). */
  collection_id?: FanaticsId;
  /** Only sale items. */
  on_sale?: boolean;
  /** The site's bands in the storefront's currency, applied to its lowest price (the with-code price when a promo code applies). Not on jp. */
  price_band?: FanaticsPriceBand;
  /** men, women, kids or baby. */
  gender?: FanaticsGender;
  filters?: FanaticsFilters;
  [key: string]: unknown;
}

export interface FanaticsDealsOptions extends FanaticsGridOptions {
  /** sale (default), clearance or under_25 (not on jp). */
  type?: FanaticsDealType;
  /** Only one league. */
  league_id?: FanaticsId;
  /** Only one team. */
  team_id?: FanaticsId;
  /** Only one department (an id from the same store's facets). */
  department_id?: FanaticsId;
  /** Only one brand. */
  brand_id?: FanaticsId;
  [key: string]: unknown;
}

/** Pass product_id or url. */
export interface FanaticsReviewsOptions {
  /** A Fanatics product id, e.g. "3892922". */
  product_id?: string;
  /** A fanatics.com product URL. Alternative to product_id. */
  url?: string;
  /** us only. */
  country?: "us";
  /** highest_rated (default, the site's order), lowest_rated, most_recent or most_helpful. */
  sort?: FanaticsReviewSort;
  /** Only reviews with this many stars (1-5). */
  rating?: number;
  /** Reviews to return, 1-50. Defaults to 10. More than 10 takes a few seconds longer per 8. */
  limit?: number;
  [key: string]: unknown;
}

export class FanaticsNamespace {
  constructor(private client: Scavio) {}

  private post(
    path: string,
    options: object = {},
    timeout: number = FANATICS_TIMEOUT,
  ): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/fanatics/${path}`, options, undefined, timeout);
  }

  /**
   * Search Fanatics merchandise by keyword on 8 storefronts and 4 US league
   * stores, narrowed by gender, league_id, department_id or any facet value
   * through filters, sorted by top sellers, price or newest. Items carry id,
   * title, brand, url, image, price, regular_price, sale_price,
   * clearance_price, with_code_price and code_percent_off (the price with the
   * site's current promo code, when it applies), price_label (coupon means
   * coupon-eligible; a null with_code_price means the code does not apply),
   * percent_off,
   * top_seller, customizable, ready_to_ship, ship_by, est_delivery, urgency
   * and is_sponsored. Also total (the US site counts at most 9000:
   * total_capped), page, page_size, total_pages, the sort, every facet
   * (values feed filters), corrected_query, country, language, currency,
   * site and data_as_of (when Fanatics built the page). Price filters are on
   * browse() and deals().
   *
   * Costs 1 credit.
   */
  async search(options: FanaticsSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Fanatics product by id or URL: title, brand, league, team, player,
   * gender, categories, breadcrumb, description, details, images, the price
   * block (price, regular_price, sale_price, clearance_price,
   * with_code_price, code_percent_off, percent_off, price_label), on_sale
   * (true for sale and clearance markdowns), the site's current promo code, in_stock, every size (item_id, available,
   * stock_level low / out, price, with_code_price, ship_by, estimated
   * delivery window), every colorway, personalization (name / number fields
   * with the team roster; the price already includes personalization), flags
   * (jersey_assurance, non_returnable, exclusive, authentic), the rating
   * (average, count, distribution, fit, value, quality), review_count and
   * data_as_of. Stock is a level, never a unit count. A not-found is a 404
   * (charged).
   *
   * Costs 1 credit.
   */
  async product(options: FanaticsProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Browse a Fanatics listing by URL or ids: a team, a player, a league
   * section, a department, a brand or a collection, with price_band,
   * on_sale, gender and any facet as filters. The facets list the listing's
   * teams, departments, brands, collections and sizes with their ids, plus
   * players when the page lists them (e.g. Lakers); browse names what the page shows. Same item fields, totals, facets
   * and data_as_of as search().
   *
   * Costs 1 credit.
   */
  async browse(options: FanaticsBrowseOptions): Promise<Record<string, unknown>> {
    return this.post("browse", options);
  }

  /**
   * Fanatics deal listings: sale (default: coupon-eligible items and
   * clearance markdowns), clearance (each sale page's clearance-priced
   * items; total counts the whole sale listing) or under_25 (not on jp),
   * optionally for one league, team, department or brand. Same item fields,
   * totals, facets and data_as_of as search(). No price history: to track
   * sale prices, poll and store your own.
   *
   * Costs 1 credit.
   */
  async deals(options: FanaticsDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * Customer reviews of one Fanatics (fanatics.com, US) product, 1-50 per
   * call (default 10), with 4 sorts and a star filter: stats (review_count,
   * rating_count, average, distribution, fit, quality, value), the site's
   * own AI-written summary (ai_summary), the features reviewers mention, and
   * per review id, product_id, product_title, rating, fit, quality, value,
   * recommended, title, text, author, dates, incentivized, votes, features
   * and photos. Fanatics pools reviews across a style (sibling products of
   * the same cut), so check each review's product_id. Usually takes 20-90 s,
   * up to about 4 minutes (request timeout raised to
   * FANATICS_REVIEWS_TIMEOUT); when busy it returns 503 with Retry-After.
   * Failed calls are not charged; an unknown product is a charged 404.
   *
   * Costs 1 credit.
   */
  async reviews(options: FanaticsReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options, FANATICS_REVIEWS_TIMEOUT);
  }
}
