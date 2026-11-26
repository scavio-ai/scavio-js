import type { Scavio } from "../client.js";

// Apartment List (apartmentlist.com, the US rental search site) suggestions, search, listing,
// rentReport, marketSummary and reviewSummaries endpoints; US only, rents in USD, 1 credit each.
// Generated from the backend routes: every option and its doc mirrors the API's own request schema;
// an input the API only accepts to refuse (a 400 that says 'not offered') is left out. The server
// enforces the value rules and the one-of rules (send one of an id or a link). Every call raises
// the request timeout to APARTMENTLIST_TIMEOUT and never lowers a longer client timeout. Failed
// upstream calls and refused inputs are not charged; a not-found is charged (credits_used is what
// was charged).

/** Minimum request timeout (ms) for every apartmentlist call. */
export const APARTMENTLIST_TIMEOUT = 240_000;

export interface ApartmentlistSuggestionsOptions {
  /** A city, neighborhood, ZIP code, county or state. */
  query: string;
  [key: string]: unknown;
}

export interface ApartmentlistSearchOptions {
  /**
   * A place slug from suggestions places[].slug: a city (/tx/austin), a neighborhood
   * (/tx/austin/neighborhoods/riverside) or a ZIP code (/tx/austin/zip-78704).
   */
  location?: string;
  /** Or a city name (with state), e.g. Chicago. */
  city?: string;
  /** With city: the 2-letter US state code (TX). Optional with zip. */
  state?: string;
  /** Or a 5-digit US ZIP code, e.g. 78704. */
  zip?: string;
  /** Bedrooms: 0 (studio), 1, 2 or 3 (3 or more), or a list of them, e.g. [1, 2]. */
  beds?: number | string | Array<number | string>;
  /** Bathrooms: 1, 2 or 3 (or more). */
  baths?: number;
  /** Lowest monthly rent, USD. */
  price_min?: number;
  /** Highest monthly rent, USD. */
  price_max?: number;
  /** Move-in date, YYYY-MM-DD. */
  move_in_date?: string;
  /**
   * Amenity filters (all must match): is_pet_friendly, is_dog_friendly, is_cat_friendly, has_pool,
   * has_gym, has_in_unit_laundry, has_on_site_laundry, has_laundry_connections, has_garage,
   * has_parking, has_hardwood_floors, has_dishwasher, has_air_conditioning, has_balcony,
   * is_accessible, has_bbq, has_bathtub, has_business_center, has_elevator, has_doorman,
   * has_walk_in_closet, has_stainless_steel, has_granite_counter, has_garbage_disposal,
   * has_furnished_option, has_fireplace, has_hot_tub, has_ceiling_fan.
   */
  amenities?: string | string[];
  /** Occupancy types: affordable, senior, student, military, co-living. */
  occupancy_types?: string | Array<"affordable" | "senior" | "student" | "military" | "co-living">;
  /**
   * best_match, freshness (newest), price_asc or price_desc. Without sort or filters, listings come
   * in Apartment List's map order.
   */
  sort?: "best_match" | "freshness" | "price_asc" | "price_desc";
  /** Page of 20, from 1; pages says how many. */
  page?: number;
  [key: string]: unknown;
}

export interface ApartmentlistListingOptions {
  /** The listing link (search listings[].url). */
  url?: string;
  /** Or the listing slug (search listings[].slug), e.g. /tx/austin/riata--4. */
  slug?: string;
  [key: string]: unknown;
}

export interface ApartmentlistRentReportOptions {
  /** A city slug (suggestions places[].slug of a city), e.g. /tx/austin. */
  city_slug?: string;
  /** Or a city name (with state), e.g. Chicago. */
  city?: string;
  /** With city: the 2-letter US state code (TX). Optional with zip. */
  state?: string;
  [key: string]: unknown;
}

export interface ApartmentlistMarketSummaryOptions {
  /**
   * A place slug from suggestions places[].slug: a city (/tx/austin), a neighborhood
   * (/tx/austin/neighborhoods/riverside) or a ZIP code (/tx/austin/zip-78704).
   */
  location?: string;
  /** Or a city name (with state), e.g. Chicago. */
  city?: string;
  /** With city: the 2-letter US state code (TX). Optional with zip. */
  state?: string;
  /** Or a 5-digit US ZIP code, e.g. 78704. */
  zip?: string;
  /** Bedrooms: 0 (studio), 1, 2 or 3 (3 or more), or a list of them, e.g. [1, 2]. */
  beds?: number | string | Array<number | string>;
  /**
   * Amenity filters (all must match): is_pet_friendly, is_dog_friendly, is_cat_friendly, has_pool,
   * has_gym, has_in_unit_laundry, has_on_site_laundry, has_laundry_connections, has_garage,
   * has_parking, has_hardwood_floors, has_dishwasher, has_air_conditioning, has_balcony,
   * is_accessible, has_bbq, has_bathtub, has_business_center, has_elevator, has_doorman,
   * has_walk_in_closet, has_stainless_steel, has_granite_counter, has_garbage_disposal,
   * has_furnished_option, has_fireplace, has_hot_tub, has_ceiling_fan.
   */
  amenities?: string | string[];
  [key: string]: unknown;
}

export interface ApartmentlistReviewSummariesOptions {
  /** A city slug (suggestions places[].slug of a city), e.g. /tx/austin. */
  city_slug?: string;
  /** Or a city name (with state), e.g. Chicago. */
  city?: string;
  /** With city: the 2-letter US state code (TX). Optional with zip. */
  state?: string;
  [key: string]: unknown;
}

export class ApartmentlistNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = APARTMENTLIST_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/apartmentlist/${path}`, options, undefined, timeout);
  }

  /**
   * Places on Apartment List (apartmentlist.com, the US rental search site). Scavio fetches the
   * public Apartment List page on request. US only, rents in USD. Apartment List's location
   * suggestions for a city, neighborhood, ZIP code, county or state. Costs 1 credit.
   */
  async suggestions(options: ApartmentlistSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Rentals on Apartment List (apartmentlist.com, the US rental search site). Scavio fetches the
   * public Apartment List page on request. US only, rents in USD. Search a city, neighborhood or
   * ZIP code, 20 a page. Without filters or sort the answer is fast and lists every listing in
   * Apartment List's map order; with beds, baths, price_min, price_max, move_in_date, amenities,
   * occupancy_types or sort (city or ZIP code only) it reads Apartment List's filtered results,
   * which can take up to about 2 minutes (set a client timeout of at least 150 seconds). A ZIP code
   * search returns its city's listings inside the ZIP code's bounding box (said in notes). Costs 1
   * credit.
   */
  async search(options: ApartmentlistSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One Apartment List listing in full by link or slug. Costs 1 credit. */
  async listing(options: ApartmentlistListingOptions): Promise<Record<string, unknown>> {
    return this.post("listing", options);
  }

  /** Apartment List's monthly rent report for a US city, as it publishes it. Costs 1 credit. */
  async rentReport(options: ApartmentlistRentReportOptions): Promise<Record<string, unknown>> {
    return this.post("rent-report", options);
  }

  /**
   * Average rents by bed count and a listings summary for a city, neighborhood or ZIP code (a ZIP
   * code reads its city), optionally for some bed counts and amenities. Costs 1 credit.
   */
  async marketSummary(options: ApartmentlistMarketSummaryOptions): Promise<Record<string, unknown>> {
    return this.post("market-summary", options);
  }

  /** Resident-review summaries for every listing with reviews in a city. Costs 1 credit. */
  async reviewSummaries(options: ApartmentlistReviewSummariesOptions): Promise<Record<string, unknown>> {
    return this.post("review-summaries", options);
  }
}
