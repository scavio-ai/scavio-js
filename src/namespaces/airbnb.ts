import type { Scavio } from "../client.js";

// Airbnb is 1 credit flat on all three endpoints.
//
// PRICES ARE SEARCH-ONLY. listing() carries NO nightly rate under any
// parameters - with or without dates, and even under render. Read prices off
// search() rows.
//
// The RATING BREAKDOWN is the mirror image: the six category ratings, the
// five-bucket star distribution and Airbnb's AI-synthesised review tags live
// on listing(), which server-renders them - NOT on reviews().
//
// `check_in` and `check_out` must be sent together. A dateless search defaults
// to +30 days / 5 nights AND A/Bs both the window and the prices - one URL was
// seen splitting 3/3 across two windows with a first-row price of $680 / $802
// / $2,238. The response flags this as `dates_are_defaulted`, so pass dates
// whenever the price matters.
//
// `currency` defaults to USD in the transport; without it Airbnb prices off
// the proxy exit and two identical requests disagree.
//
// `room_type` and amenity NAMES are validated before the scrape, because an
// unrecognised value makes Airbnb return the UNFILTERED set under a 200.
//
// Search is 18 listings per page and `cursor` WINS over `page`, so sending
// both is rejected.

export interface AirbnbSearchOptions {
  /**
   * City, region, ZIP, or a pasted airbnb.com/s/ URL, 1-200 characters. A
   * location Airbnb cannot resolve is a 404, not an empty result.
   */
  location: string;
  /**
   * Check-in date, YYYY-MM-DD. Must be sent together with `check_out` and
   * before it. Omitted, the transport defaults to +30 days and the response
   * sets `dates_are_defaulted`.
   */
  check_in?: string;
  /**
   * Check-out date, YYYY-MM-DD. Must be sent together with `check_in`.
   * Omitted, it defaults to `check_in` + 5 nights.
   */
  check_out?: string;
  /** Adults in the party. */
  adults?: number;
  /** Children, ages 2-12. */
  children?: number;
  /** Infants. */
  infants?: number;
  /** Pets. */
  pets?: number;
  /**
   * Minimum price for the WHOLE STAY, not per night. Must be <= `max_price`.
   */
  min_price?: number;
  /** Maximum price for the WHOLE STAY, not per night. */
  max_price?: number;
  /** Room type. A closed set - an unrecognised value is rejected up front. */
  room_type?: "entire_home" | "private_room" | "shared_room" | "hotel_room";
  /** Minimum bedrooms. */
  min_bedrooms?: number;
  /** Minimum beds. */
  min_beds?: number;
  /** Minimum bathrooms. */
  min_bathrooms?: number;
  /** Superhost listings only. */
  superhost?: boolean;
  /** Instant Book listings only. */
  instant_book?: boolean;
  /** Guest Favourite listings only. */
  guest_favorite?: boolean;
  /** Free-cancellation listings only. */
  free_cancellation?: boolean;
  /**
   * Comma-separated amenity filter, 1-200 characters. Either the named
   * vocabulary - "wifi", "air_conditioning", "pool", "kitchen",
   * "free_parking", "washer", "self_check_in", "tv" - or raw numeric Airbnb
   * amenity ids. An unrecognised NAME is rejected before the scrape, because
   * Airbnb would otherwise answer the UNFILTERED set under a 200.
   */
  amenities?: string;
  /**
   * ISO 4217 currency (default "USD"). Leave it set - without a currency
   * Airbnb prices off the proxy exit.
   */
  currency?: string;
  /**
   * Result page, 1-indexed. 18 listings per page. Cannot be combined with
   * `cursor`.
   */
  page?: number;
  /**
   * `next_cursor` from a previous response, 1-500 characters. Wins over
   * `page`, so sending both is rejected.
   */
  cursor?: string;
  [key: string]: unknown;
}

export interface AirbnbListingOptions {
  /**
   * Airbnb listing id or a full /rooms/ URL, 1-500 characters. Query params
   * are discarded - they carry someone else's dates.
   */
  listing_id: string;
  /**
   * Check-in date, YYYY-MM-DD. Must be sent together with `check_out` and
   * before it. Dates do NOT produce a price here - the room page has none.
   */
  check_in?: string;
  /** Check-out date, YYYY-MM-DD. Must be sent together with `check_in`. */
  check_out?: string;
  /** Adults in the party. */
  adults?: number;
  /** Children, ages 2-12. */
  children?: number;
  /** Infants. */
  infants?: number;
  /** Pets. */
  pets?: number;
  /** ISO 4217 currency (default "USD"). */
  currency?: string;
  [key: string]: unknown;
}

export interface AirbnbReviewsOptions {
  /** Airbnb listing id or a full /rooms/ URL, 1-500 characters. */
  listing_id: string;
  /** ISO 4217 currency (default "USD"). */
  currency?: string;
  /**
   * Reviews per response, 1-50 (default 30). Send it explicitly - upstream
   * falls back to a fixed 7 rows when no limit is given.
   */
  limit?: number;
  /** Row offset into the review list (default 0). */
  offset?: number;
  [key: string]: unknown;
}

export class AirbnbNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Airbnb stays: stay-total and per-night price with the full
   * discount ledger, rating and review count, bedrooms/beds/baths,
   * coordinates, badges, images and `dates_are_defaulted`.
   *
   * This is the ONLY endpoint that carries a price - listing() has no nightly
   * rate field at all.
   *
   * Paged with `page` (18 listings per page) XOR `cursor`; `cursor` wins, so
   * sending both is rejected. `min_price` / `max_price` are WHOLE-STAY totals,
   * not per night.
   *
   * Pass `check_in` + `check_out` together whenever price matters: a dateless
   * search defaults to +30 days / 5 nights and A/Bs both the window and the
   * prices, which the response flags as `dates_are_defaulted`.
   *
   * Costs 1 credit.
   */
  async search(
    options: AirbnbSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/airbnb/search", options);
  }

  /**
   * One Airbnb listing in full: description, property and room type, capacity
   * and room counts, the complete grouped amenity list (including the
   * amenities the place does NOT have), host profile and stats, house rules
   * with parsed check-in/out times, cancellation policy, sleeping
   * arrangements, photo tour, every image, and the RATING BREAKDOWN - six
   * category ratings, the five-bucket star distribution and Airbnb's
   * AI-synthesised review tags.
   *
   * NO NIGHTLY PRICE. The room page carries no rate under any parameters,
   * with or without dates. Prices come from search() only.
   *
   * Single response, no pagination.
   *
   * Costs 1 credit.
   */
  async listing(
    options: AirbnbListingOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/airbnb/listing", options);
  }

  /**
   * Airbnb review BODIES with per-review rating, date, and reviewer name,
   * photo and location.
   *
   * Paged with `limit` (1-50, default 30) + `offset`. Send `limit`
   * explicitly - upstream returns a fixed 7 rows when none is given.
   *
   * `count` is the listing's TOTAL review count; `returned` is how many rows
   * this page holds. The rating breakdown is NOT here - it lives on
   * listing().
   *
   * Costs 1 credit.
   */
  async reviews(
    options: AirbnbReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/airbnb/reviews", options);
  }
}
