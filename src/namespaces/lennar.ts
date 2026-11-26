import type { Scavio } from "../client.js";

// Lennar (lennar.com, the US homebuilder) search, community, plan, home, masterPlanned, markets,
// market, suggestions, resolve, promotions and payment endpoints; US only, prices in USD, 1 credit
// each. Generated from the backend routes: every option and its doc mirrors the API's own request
// schema; an input the API only accepts to refuse (a 400 that says 'not offered') is left out. The
// server enforces the value rules and the one-of rules (send one of an id or a link). Every call
// raises the request timeout to LENNAR_TIMEOUT and never lowers a longer client timeout. Failed
// upstream calls and refused inputs are not charged; a not-found is charged (credits_used is what
// was charged).

/** Minimum request timeout (ms) for every lennar call. */
export const LENNAR_TIMEOUT = 240_000;

export interface LennarSearchOptions {
  /**
   * homes (default: homesites and floor plans) or communities (communities and master-planned
   * communities).
   */
  mode?: "homes" | "communities";
  /** A Lennar market code (markets[].code from markets, e.g. DAL, PHO, ORL, HOU). */
  market?: string;
  /** Or a two-letter state code. */
  state?: string;
  /** Or a city name (market cities[].name), alone or with market or state. */
  city?: string;
  /** Or Lennar's text search (it matches community and plan names; use suggestions for places). */
  text?: string;
  /** Or a point: latitude with longitude (+ radius in miles). */
  latitude?: number;
  /** With latitude: the point's longitude. */
  longitude?: number;
  /** With latitude + longitude: miles. */
  radius?: number;
  /** Or a map box (a suggestion's search.bounds). */
  bounds?: { north: number; east: number; south: number; west: number };
  /** Fewest bedrooms, 1-6. */
  beds_min?: number;
  /** Fewest bathrooms, 1-6. */
  baths_min?: number;
  /** USD. */
  price_min?: number;
  /** USD. */
  price_max?: number;
  /** Smallest home, square feet. */
  sqft_min?: number;
  /** Largest home, square feet. */
  sqft_max?: number;
  /** Any of: single_family, multi_family, next_gen, single_story. */
  home_types?: Array<"single_family" | "multi_family" | "next_gen" | "single_story">;
  /** active_adult (55+) or lifestyle. */
  community_types?: Array<"active_adult" | "lifestyle">;
  /**
   * Homesite availability: quick_move_in (move-in ready), under_construction, coming_soon,
   * future_release.
   */
  availability?: Array<"quick_move_in" | "under_construction" | "coming_soon" | "future_release">;
  /** active, coming_soon or sold_out. */
  community_status?: Array<"active" | "coming_soon" | "sold_out">;
  /**
   * Feature codes as the market endpoint gives them (features[].code, e.g. SSTORY, 3GAR,
   * SWIMMING_POOL).
   */
  features?: string[];
  /** A school district as the market endpoint gives it (school_districts[].code). */
  school_district?: string;
  /** Any of: public, private, charter. */
  school_types?: Array<"public" | "private" | "charter">;
  /** Any of: elementary, middle, high. */
  school_levels?: Array<"elementary" | "middle" | "high">;
  /** Lennar's school rating filter: A, B, C or D. */
  school_rating?: "A" | "B" | "C" | "D";
  /**
   * featured (default), newest, distance (needs latitude + longitude), price_asc, price_desc,
   * sqft_asc, sqft_desc.
   */
  sort?: "featured" | "newest" | "distance" | "price_asc" | "price_desc" | "sqft_asc" | "sqft_desc";
  /** Page, from 1. */
  page?: number;
  /** Results per page, 1-200 (default 25). */
  page_size?: number;
  [key: string]: unknown;
}

export interface LennarCommunityOptions {
  /** A Lennar community number (community.comnum in search answers). */
  comnum: string;
  [key: string]: unknown;
}

export interface LennarPlanOptions {
  /** A Lennar community number (community.comnum in search answers). */
  comnum: string;
  /** A plan number (community plans[].plan_number). */
  plan_number: string;
  [key: string]: unknown;
}

export interface LennarHomeOptions {
  /** A Lennar homesite lot id (homes[].lot_id in search answers). */
  lot_id: string;
  [key: string]: unknown;
}

export interface LennarMasterPlannedOptions {
  /** A master-planned community id (communities[].mpc_id in community search answers). */
  mpc_id: number;
  [key: string]: unknown;
}

export interface LennarMarketsOptions {
  [key: string]: unknown;
}

export interface LennarMarketOptions {
  /** A Lennar market code (markets[].code). */
  market: string;
  [key: string]: unknown;
}

export interface LennarSuggestionsOptions {
  /** The start of a city, ZIP code, region, community or plan name. */
  query: string;
  /** Favor one market (a market code). */
  market?: string;
  /** Suggestions, 1-20 (default 10). */
  limit?: number;
  [key: string]: unknown;
}

export interface LennarResolveOptions {
  /** A lennar.com community, plan, home or master-planned community link. */
  url?: string;
  /** Or its path (/new-homes/...). */
  path?: string;
  [key: string]: unknown;
}

export interface LennarPromotionsOptions {
  /** A Lennar market code (markets[].code). */
  market: string;
  [key: string]: unknown;
}

export interface LennarPaymentOptions {
  /** A Lennar homesite lot id (homes[].lot_id in search answers). */
  lot_id: string;
  /** A Lennar community number (community.comnum in search answers). */
  comnum: string;
  /** USD. */
  down_payment: number;
  /** A decimal: 0.065 for 6.5% (values above 1 are refused). */
  interest_rate: number;
  [key: string]: unknown;
}

export class LennarNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = LENNAR_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/lennar/${path}`, options, undefined, timeout);
  }

  /**
   * Search new homes or communities on Lennar (lennar.com, the US homebuilder; US only, USD).
   * Scavio fetches the public Lennar page data on request. Places: a market code, a state, a city,
   * Lennar's text search, latitude + longitude (+ radius in miles) or a map box (bounds). Filters:
   * fewest beds and baths, price and square-foot ranges, home types, community types (active adult,
   * lifestyle), homesite availability (quick move-in, under construction, coming soon, future
   * release), community status, feature codes, school district, school type, school level and
   * school rating; 7 sorts; 1-200 results a page. Costs 1 credit.
   */
  async search(options: LennarSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One community on Lennar (lennar.com, the US homebuilder; US only, USD). Scavio fetches the
   * public Lennar page data on request. by community number. Costs 1 credit.
   */
  async community(options: LennarCommunityOptions): Promise<Record<string, unknown>> {
    return this.post("community", options);
  }

  /**
   * One floor plan on Lennar (lennar.com, the US homebuilder; US only, USD). Scavio fetches the
   * public Lennar page data on request. by community number + plan number. Costs 1 credit.
   */
  async plan(options: LennarPlanOptions): Promise<Record<string, unknown>> {
    return this.post("plan", options);
  }

  /**
   * One homesite (a quick move-in or to-be-built home) on Lennar (lennar.com, the US homebuilder;
   * US only, USD). Scavio fetches the public Lennar page data on request. by lot id. Costs 1
   * credit.
   */
  async home(options: LennarHomeOptions): Promise<Record<string, unknown>> {
    return this.post("home", options);
  }

  /**
   * One master-planned community on Lennar (lennar.com, the US homebuilder; US only, USD). Scavio
   * fetches the public Lennar page data on request. by id. Costs 1 credit.
   */
  async masterPlanned(options: LennarMasterPlannedOptions): Promise<Record<string, unknown>> {
    return this.post("master-planned", options);
  }

  /**
   * Every state and metro market Lennar (lennar.com, the US homebuilder; US only, USD) builds in.
   * Costs 1 credit.
   */
  async markets(options: LennarMarketsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("markets", options);
  }

  /**
   * One metro market on Lennar (lennar.com, the US homebuilder; US only, USD). Scavio fetches the
   * public Lennar page data on request. by market code. Costs 1 credit.
   */
  async market(options: LennarMarketOptions): Promise<Record<string, unknown>> {
    return this.post("market", options);
  }

  /**
   * The places, communities and plans Lennar (lennar.com, the US homebuilder; US only, USD)
   * suggests for a few letters. Costs 1 credit.
   */
  async suggestions(options: LennarSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * What a lennar.com link is on Lennar (lennar.com, the US homebuilder; US only, USD). Scavio
   * fetches the public Lennar page data on request.. Costs 1 credit.
   */
  async resolve(options: LennarResolveOptions): Promise<Record<string, unknown>> {
    return this.post("resolve", options);
  }

  /**
   * The market-wide promotion Lennar (lennar.com, the US homebuilder; US only, USD) shows for a
   * market. Costs 1 credit.
   */
  async promotions(options: LennarPromotionsOptions): Promise<Record<string, unknown>> {
    return this.post("promotions", options);
  }

  /**
   * The monthly payment estimate Lennar's calculator gives for a homesite on Lennar (lennar.com,
   * the US homebuilder; US only, USD). Scavio fetches the public Lennar page data on request. with
   * a down payment and an interest rate (a decimal. Costs 1 credit.
   */
  async payment(options: LennarPaymentOptions): Promise<Record<string, unknown>> {
    return this.post("payment", options);
  }
}
