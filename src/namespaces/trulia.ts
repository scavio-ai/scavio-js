import type { Scavio } from "../client.js";

// Trulia (trulia.com, Zillow Group's home and neighborhood site) neighborhood, search, property,
// school and suggestions endpoints; US only, prices in USD, language en or es; 1 credit each.
// Generated from the backend routes: every option and its doc mirrors the API's own request schema;
// an input the API only accepts to refuse (a 400 that says 'not offered') is left out. The server
// enforces the value rules and the one-of rules (send one of an id or a link). Every call raises
// the request timeout to TRULIA_TIMEOUT and never lowers a longer client timeout. Failed upstream
// calls and refused inputs are not charged; a not-found is charged (credits_used is what was
// charged).

/** Minimum request timeout (ms) for every trulia call. */
export const TRULIA_TIMEOUT = 240_000;

export interface TruliaNeighborhoodOptions {
  /**
   * A Trulia neighborhood location id: property neighborhood.location_id, or location_id of a
   * neighborhood in suggestions.
   */
  location_id?: string | number;
  /**
   * Or the neighborhood's trulia.com link
   * (https://www.trulia.com/n/<st>/<city>/<neighborhood>/<location id>/).
   */
  url?: string;
  /**
   * Add market: Trulia's market snapshot and monthly median sale price history, read from a home
   * for sale in the neighborhood (default true; same 1 credit). false answers faster.
   */
  include_market_snapshot?: boolean;
  /** en (default) or es: Trulia's US Spanish neighborhood page. */
  language?: "en" | "es";
  [key: string]: unknown;
}

export interface TruliaSearchOptions {
  /**
   * A ZIP code (78701), "City, ST" (Austin, TX) or "Neighborhood, City, ST" (Upper East Side, New
   * York, NY). suggestions returns search_location values.
   */
  location: string;
  /** for_sale (default), for_rent or sold (recently sold). */
  listing_status?: "for_sale" | "for_rent" | "sold";
  beds_min?: number;
  baths_min?: number;
  /** USD (monthly rent on for_rent). */
  price_min?: number;
  /** USD (monthly rent on for_rent). */
  price_max?: number;
  sqft_min?: number;
  sqft_max?: number;
  year_built_min?: number;
  year_built_max?: number;
  /** Highest monthly HOA fee, USD (for_sale and sold). */
  hoa_max?: number;
  /** Any of: single_family, townhouse, condo, coop, apartment, multi_family. */
  property_types?: Array<"single_family" | "townhouse" | "condo" | "coop" | "apartment" | "multi_family">;
  /** A listing keyword Trulia filters on (letters, digits, spaces), e.g. pool, hardwood floors. */
  keyword?: string;
  /** Rentals only: cats, small_dogs, large_dogs. */
  pets?: Array<"cats" | "small_dogs" | "large_dogs">;
  /**
   * default (Trulia's order: newest on for_sale, its own ranking on for_rent, latest sale on sold),
   * newest, price_low, price_high, sqft (largest), beds (most), baths (most).
   */
  sort?: "default" | "newest" | "price_low" | "price_high" | "sqft" | "beds" | "baths";
  /** Page, from 1 (40 homes a page, up to page 50); has_more says whether another exists. */
  page?: number;
  /** en (default) or es: Trulia's US Spanish pages exist for rental searches (for_rent) only. */
  language?: "en" | "es";
  [key: string]: unknown;
}

export interface TruliaPropertyOptions {
  /** A home's zpid (the id Trulia shares with Zillow; listings[].zpid). */
  zpid?: string | number;
  /** Or a rental building's id (listings[].building_id). */
  building_id?: string | number;
  /**
   * Or the trulia.com link (https://www.trulia.com/home/<address>-<zpid> or /building/<name>-<id>).
   */
  url?: string;
  /** en (default) or es: Spanish is available on building pages only. */
  language?: "en" | "es";
  [key: string]: unknown;
}

export interface TruliaSchoolOptions {
  /** A Trulia school link (neighborhood schools.items[].url). */
  url?: string;
  /** Or the number at the end of the school link (suggestions schools[].school_id), with state. */
  school_id?: string | number;
  /** The school's two-letter state code (with school_id). */
  state?: string;
  /** en only: Trulia's school pages are English. */
  language?: "en" | "es";
  [key: string]: unknown;
}

export interface TruliaSuggestionsOptions {
  /** The start of a city, neighborhood, ZIP code, address or school name. */
  query: string;
  /** for_sale (default) or for_rent: Trulia's suggestions for that kind of search. */
  listing_status?: "for_sale" | "for_rent";
  /** Add matching schools and districts (default true). */
  include_schools?: boolean;
  /** en only: Trulia's suggestions are English. */
  language?: "en" | "es";
  [key: string]: unknown;
}

export class TruliaNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = TRULIA_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/trulia/${path}`, options, undefined, timeout);
  }

  /**
   * One Trulia neighborhood page by location id or link: Trulia (trulia.com, Zillow Group's home
   * and neighborhood site; US only, USD). Scavio fetches the public Trulia page on request. Costs 1
   * credit.
   */
  async neighborhood(options: TruliaNeighborhoodOptions): Promise<Record<string, unknown>> {
    return this.post("neighborhood", options);
  }

  /**
   * Search Trulia homes for sale, for rent or recently sold in a ZIP code, city or neighborhood:
   * Trulia (trulia.com, Zillow Group's home and neighborhood site; US only, USD). Scavio fetches
   * the public Trulia page on request. Filters: beds_min, baths_min, price, sqft and year-built
   * ranges, hoa_max, property_types, keyword, pets (rentals); 7 sorts; 40 homes a page. Costs 1
   * credit.
   */
  async search(options: TruliaSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Trulia home (for sale, sold, for rent) by zpid or link, or one rental building by
   * building_id or link: Trulia (trulia.com, Zillow Group's home and neighborhood site; US only,
   * USD). Scavio fetches the public Trulia page on request. Costs 1 credit.
   */
  async property(options: TruliaPropertyOptions): Promise<Record<string, unknown>> {
    return this.post("property", options);
  }

  /**
   * One school on Trulia by link, or by school id and state: Trulia (trulia.com, Zillow Group's
   * home and neighborhood site; US only, USD). Scavio fetches the public Trulia page on request.
   * Costs 1 credit.
   */
  async school(options: TruliaSchoolOptions): Promise<Record<string, unknown>> {
    return this.post("school", options);
  }

  /**
   * Trulia's place suggestions for the start of a city, neighborhood, ZIP code, address or school
   * name: Trulia (trulia.com, Zillow Group's home and neighborhood site; US only, USD). Scavio
   * fetches the public Trulia page on request. Costs 1 credit.
   */
  async suggestions(options: TruliaSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
