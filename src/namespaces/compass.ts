import type { Scavio } from "../client.js";

// Compass (compass.com, the US real estate brokerage) search, listing and suggestions endpoints;
// homes for sale, for rent and sold across the US, prices in USD, 2 credits each. Generated from
// the backend routes: every option and its doc mirrors the API's own request schema; an input the
// API only accepts to refuse (a 400 that says 'not offered') is left out. The server enforces the
// value rules and the one-of rules (send one of an id or a link). Every call raises the request
// timeout to COMPASS_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and
// refused inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every compass call. */
export const COMPASS_TIMEOUT = 240_000;

export interface CompassSearchOptions {
  /** for_sale (default), for_rent, or sold (homes sold in the last 90 days). */
  mode?: "for_sale" | "for_rent" | "sold";
  /**
   * A Compass area slug from suggestions (areas[].slug): a city (austin-tx, manhattan-ny), a city
   * and ZIP (los-angeles-ca-90012), a neighborhood (brooklyn-heights-brooklyn-ny), a county or a
   * school (school/<slug>, school-district/<slug>). A place written as "Austin, TX" reads as its
   * slug. An unknown area is a charged 404.
   */
  area: string;
  /** Highest price, USD (on for_rent the monthly rent). */
  price_max?: number;
  /** Fewest bedrooms. */
  beds_min?: number;
  /** Fewest bathrooms. */
  baths_min?: number;
  /** Smallest size in square feet. */
  sqft_min?: number;
  /** One of homes, condos, townhomes, co_ops, multi_family, land (homes = single family). */
  property_type?: "homes" | "condos" | "townhomes" | "co_ops" | "multi_family" | "land";
  /** Mode for_sale: only homes with an open house this weekend. */
  open_house?: boolean;
  /** Mode for_sale: only Coming Soon listings. */
  coming_soon?: boolean;
  /** default (Compass's own order), price_asc or price_desc. */
  sort?: "default" | "price_asc" | "price_desc";
  /**
   * Page, from 1 (41 listings a page). Compass pages through the first 369 results of a search (9
   * pages); a page past the end answers with no listings and a note.
   */
  page?: number;
  [key: string]: unknown;
}

export interface CompassListingOptions {
  /**
   * A Compass listing link (listings[].url or property_url: /homedetails/<address>/<id>_lid/ or
   * /<code>_pid/; suggestions' /listing/<id>/view links work too).
   */
  url?: string;
  /** Or a Compass listing id (listings[].id), as a string. */
  id?: string | number;
  [key: string]: unknown;
}

export interface CompassSuggestionsOptions {
  /** A city, neighborhood, ZIP code, school or address. */
  q: string;
  [key: string]: unknown;
}

export class CompassNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = COMPASS_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/compass/${path}`, options, undefined, timeout);
  }

  /**
   * Search homes for sale, rentals or homes sold in the last 90 days in a US area on Compass
   * (compass.com, the US real estate brokerage). Filters: highest price, fewest bedrooms, bathrooms
   * and square feet, property type, open house this weekend, coming soon; sorts: default,
   * price_asc, price_desc; 41 a page, up to 9 pages. Compass does not apply a minimum price or a
   * maximum bedroom count next to other filters, nor year built or lot size: those are refused with
   * a 400. Costs 2 credits.
   */
  async search(options: CompassSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Compass (compass.com, the US real estate brokerage) listing in full (for sale, coming soon,
   * sold or for rent) by link or id. Costs 2 credits.
   */
  async listing(options: CompassListingOptions): Promise<Record<string, unknown>> {
    return this.post("listing", options);
  }

  /**
   * The Compass (compass.com, the US real estate brokerage) search box suggestions for a place, ZIP
   * code, school or address. Costs 2 credits.
   */
  async suggestions(options: CompassSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
