import type { Scavio } from "../client.js";

// HotPads (hotpads.com, Zillow Group's rental search site) search, listing, priceHistory, fees and
// suggestions endpoints; US rentals, rents in USD, 1 credit each. Generated from the backend
// routes: every option and its doc mirrors the API's own request schema; an input the API only
// accepts to refuse (a 400 that says 'not offered') is left out. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to HOTPADS_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused
// inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every hotpads call. */
export const HOTPADS_TIMEOUT = 240_000;

export interface HotpadsSearchOptions {
  /**
   * A HotPads area: a suggestions areas[].resource_id (brooklyn-new-york-ny, austin-tx, 90012), or
   * a place such as Austin, TX. US only.
   */
  area: string;
  /**
   * apartments (default), houses, condos, townhomes, rooms (rooms for rent), sublets or by_owner
   * (for rent by owner).
   */
  type?: "apartments" | "houses" | "condos" | "townhomes" | "rooms" | "sublets" | "by_owner";
  /** An exact bedroom count (0 is a studio). */
  beds?: number;
  /** Or at least this many bedrooms. */
  beds_min?: number;
  /** At least this many bathrooms: 1, 1.5, 2, 3 or 4. */
  baths_min?: number;
  /** Lowest monthly rent, USD. */
  price_min?: number;
  /** Highest monthly rent, USD. */
  price_max?: number;
  /** Smallest unit, square feet. */
  sqft_min?: number;
  /** Largest unit, square feet. */
  sqft_max?: number;
  /** dogs or cats: listings that allow them (HotPads takes one per search). */
  pets?: "dogs" | "cats";
  /** Only listings with an in-unit washer and dryer. */
  in_unit_laundry?: boolean;
  /** parking or furnished (the amenity filters HotPads applies; one per search). */
  amenity?: "parking" | "furnished";
  /** Keywords HotPads matches in listings, e.g. balcony. */
  keywords?: string;
  /** default (HotPads' own order), price_low, price_high or newest. */
  sort?: "default" | "price_low" | "price_high" | "newest";
  /** Page of 40 buildings, from 1; pages says how many. */
  page?: number;
  [key: string]: unknown;
}

export interface HotpadsListingOptions {
  /**
   * A HotPads listing link: search buildings[].listings[].url or buildings[].url (/pad, /building
   * or /<unit>/pad).
   */
  url?: string;
  /** Or a building id (search buildings[].id, suggestions listings[].id), e.g. skrzz0. */
  id?: string;
  [key: string]: unknown;
}

export interface HotpadsPriceHistoryOptions {
  /** A HotPads listing alias: listing alias, or search buildings[].listings[].alias. */
  listing_alias: string;
  /**
   * The listing's price_history.model_id. HotPads gives a price history only to listings whose
   * price_history is set.
   */
  model_id: string | number;
  [key: string]: unknown;
}

export interface HotpadsFeesOptions {
  /** A HotPads listing alias: listing alias, or search buildings[].listings[].alias. */
  listing_alias: string;
  [key: string]: unknown;
}

export interface HotpadsSuggestionsOptions {
  /** A city, neighborhood, borough, county, ZIP code, school or address (3+ characters). */
  text: string;
  /** Suggestions to return, 1-10 (default 6). */
  limit?: number;
  [key: string]: unknown;
}

export class HotpadsNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = HOTPADS_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/hotpads/${path}`, options, undefined, timeout);
  }

  /**
   * Search rentals on HotPads (hotpads.com, Zillow Group's rental search site). Scavio fetches the
   * public HotPads page on request. Apartments, houses, condos, townhomes, rooms, sublets or
   * for-rent-by-owner listings in a US city, neighborhood, borough or ZIP code, filtered by beds
   * (exact or minimum), baths, rent, square feet, dogs or cats, in-unit laundry, parking or
   * furnished and keywords, sorted 4 ways, 40 buildings a page. Costs 1 credit.
   */
  async search(options: HotpadsSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One HotPads listing in full by link or id (a single home, a unit, or a building with its floor
   * plans). Costs 1 credit.
   */
  async listing(options: HotpadsListingOptions): Promise<Record<string, unknown>> {
    return this.post("listing", options);
  }

  /** The rent history HotPads publishes for one listing. Costs 1 credit. */
  async priceHistory(options: HotpadsPriceHistoryOptions): Promise<Record<string, unknown>> {
    return this.post("price-history", options);
  }

  /** The costs and fees the property manager lists for one HotPads listing. Costs 1 credit. */
  async fees(options: HotpadsFeesOptions): Promise<Record<string, unknown>> {
    return this.post("fees", options);
  }

  /** HotPads' location suggestions for a text. Costs 1 credit. */
  async suggestions(options: HotpadsSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
