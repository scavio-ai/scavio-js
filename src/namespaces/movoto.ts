import type { Scavio } from "../client.js";

// Movoto (movoto.com, the US home search site owned by Lower) search, property, marketTrends,
// suggestions and school endpoints; US only, prices in USD, 1 credit each. Generated from the
// backend routes: every option and its doc mirrors the API's own request schema; an input the API
// only accepts to refuse (a 400 that says 'not offered') is left out. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to MOVOTO_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused
// inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every movoto call. */
export const MOVOTO_TIMEOUT = 240_000;

export interface MovotoSearchOptions {
  /** A US city, with state. */
  city?: string;
  /** Two-letter US state code. */
  state?: string;
  /** Or a five-digit ZIP code (state optional). */
  zip?: string;
  /** Or a county, with state (Travis or Travis County). */
  county?: string;
  /** Or a neighborhood, with city and state (suggestions returns neighborhood names). */
  neighborhood?: string;
  /**
   * Or the homes zoned for one school: a Movoto school id (school id, suggestions school_id), with
   * city and state.
   */
  school_id?: string | number;
  /** for_sale (default), sold or rentals. */
  status?: "for_sale" | "sold" | "rentals";
  /** status sold: sold in the last 1w, 1m, 3m, 6m, 1y or 2y (default every sale Movoto lists). */
  sold_within?: "1w" | "1m" | "3m" | "6m" | "1y" | "2y";
  /** status for_sale: leave out pending and contingent homes. */
  hide_pending?: boolean;
  /** Any of: single_family, condo, multi_family, land, mobile, other. */
  property_types?: Array<"single_family" | "condo" | "multi_family" | "land" | "mobile" | "other">;
  /** Fewest bedrooms, 0-20. */
  beds_min?: number;
  /** Most bedrooms, 0-20. */
  beds_max?: number;
  /** Fewest bathrooms, 0-20. */
  baths_min?: number;
  /** Most bathrooms, 0-20. */
  baths_max?: number;
  /** USD (monthly rent on rentals). */
  price_min?: number;
  /** USD (monthly rent on rentals). */
  price_max?: number;
  /** Smallest living area, square feet. */
  sqft_min?: number;
  /** Largest living area, square feet. */
  sqft_max?: number;
  /** Smallest lot, square feet. */
  lot_sqft_min?: number;
  /** Largest lot, square feet. */
  lot_sqft_max?: number;
  /** Built in or after this year. */
  year_built_min?: number;
  /** Built in or before this year. */
  year_built_max?: number;
  /** Monthly HOA fee, USD (for_sale and sold). */
  hoa_min?: number;
  /** Monthly HOA fee, USD (for_sale and sold). */
  hoa_max?: number;
  /** Fewest days on Movoto (for_sale and rentals). */
  days_on_market_min?: number;
  /** Days on Movoto (for_sale and rentals). */
  days_on_market_max?: number;
  /** Fewest garage spaces. */
  garage_min?: number;
  /** Only homes whose listing mentions a pool. */
  pool?: boolean;
  /** status for_sale: only homes with an open house scheduled. */
  open_houses?: boolean;
  /** status for_sale: price reduced in the last 30 days. */
  price_reduced?: boolean;
  /** status for_sale: listed in the last 7 days. */
  new_listings?: boolean;
  /** status for_sale: new construction. */
  new_construction?: boolean;
  /** status for_sale: foreclosures. */
  foreclosed?: boolean;
  /**
   * relevant (Movoto's default), newest (list date), updated, price_low, price_high, sqft_large,
   * sqft_small, price_per_sqft (lowest first).
   */
  sort?: "relevant" | "newest" | "updated" | "price_low" | "price_high" | "sqft_large" | "sqft_small" | "price_per_sqft";
  /**
   * Page, from 1 (50 homes a page). Movoto serves up to 99 pages per search; a page past the last
   * is empty (with a note).
   */
  page?: number;
  [key: string]: unknown;
}

export interface MovotoPropertyOptions {
  /** A Movoto property link (listings[].url). */
  url?: string;
  /**
   * Or its path (listings[].path), e.g.
   * austin-tx/6001-sierra-arbor-ct-austin-tx-78759/pid_lgzxbh54nh/.
   */
  path?: string;
  [key: string]: unknown;
}

export interface MovotoMarketTrendsOptions {
  /** A US city, with state. */
  city?: string;
  /** Two-letter US state code. */
  state?: string;
  /** Or a five-digit ZIP code (state optional). */
  zip?: string;
  /**
   * With zip: add daily, Movoto's daily statistics for the ZIP code (default true; same 1 credit).
   */
  include_daily?: boolean;
  [key: string]: unknown;
}

export interface MovotoSuggestionsOptions {
  /** The start of a city, ZIP code, neighborhood, county or school name. */
  query: string;
  /** Only these place types: city, zipcode, neighborhood, county, school. */
  types?: Array<"city" | "zipcode" | "neighborhood" | "county" | "school">;
  [key: string]: unknown;
}

export interface MovotoSchoolOptions {
  /** A Movoto school link (property schools[].url). */
  url?: string;
  /** Or its path: schools/<city-st>/<school>-<id>/. */
  path?: string;
  [key: string]: unknown;
}

export class MovotoNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = MOVOTO_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/movoto/${path}`, options, undefined, timeout);
  }

  /**
   * Search homes for sale, sold homes or rentals on Movoto (movoto.com, the US home search site
   * owned by Lower; US only, USD). Scavio fetches the public Movoto page on request. Places: city +
   * state, ZIP code, county + state, neighborhood + city + state, or the homes zoned for one school
   * (school_id + city + state). Filters: property types, bedroom, bathroom, price, size, lot, year
   * built, HOA and days-on-market ranges, garage spaces, pool, sold window, hide pending, open
   * houses, price reduced (30 days), new listings (7 days), new construction, foreclosures; 8
   * sorts; 50 homes a page, up to 99 pages. Costs 1 credit.
   */
  async search(options: MovotoSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One home on Movoto (movoto.com, the US home search site owned by Lower; US only, USD). Scavio
   * fetches the public Movoto page on request. (for sale, sold or for rent) by link or path from
   * search. Costs 1 credit.
   */
  async property(options: MovotoPropertyOptions): Promise<Record<string, unknown>> {
    return this.post("property", options);
  }

  /**
   * The housing market trends Movoto (movoto.com, the US home search site owned by Lower; US only,
   * USD) publishes for a city (city + state) or a ZIP code. Costs 1 credit.
   */
  async marketTrends(options: MovotoMarketTrendsOptions): Promise<Record<string, unknown>> {
    return this.post("market-trends", options);
  }

  /**
   * The places Movoto (movoto.com, the US home search site owned by Lower; US only, USD) suggests
   * for the start of a city, ZIP code, neighborhood, county or school name. Costs 1 credit.
   */
  async suggestions(options: MovotoSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * One school on Movoto (movoto.com, the US home search site owned by Lower; US only, USD). Scavio
   * fetches the public Movoto page on request. by link or path (property schools[].url). Costs 1
   * credit.
   */
  async school(options: MovotoSchoolOptions): Promise<Record<string, unknown>> {
    return this.post("school", options);
  }
}
