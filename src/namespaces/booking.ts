import type { Scavio } from "../client.js";

// Booking.com is 1 credit flat on all three endpoints.
//
// `checkin` and `checkout` must be sent TOGETHER on every endpoint. Booking
// ignores a lone checkin and prices a default range of its own, so the
// response comes back with real prices for dates nobody asked for.
//
// hotel() and reviews() take dates for the same reason search does: Booking
// prices a STAY, not a property. Omit them and you get prices for a two-night
// window Booking chose; the response echoes whichever dates were used.
//
// `currency` defaults to USD in the transport. Without it Booking prices off
// the proxy exit and two identical requests disagree.
//
// A search with neither `destination` nor `dest_id` would land on Booking's
// HOMEPAGE - a billed request that returns nothing - so it is rejected at the
// edge instead. `dest_type` is likewise rejected without `dest_id`, because
// Booking silently ignores it on its own.
//
// Chain the `url` a search row returns into hotel() / reviews(). A bare page
// slug with the wrong `country_code` is a real 404 that scrape.do BILLS.

export interface BookingSearchOptions {
  /**
   * Free-text destination, 1-200 characters ("Paris", "Lisbon, Portugal").
   * Either `destination` or `dest_id` is required.
   */
  destination?: string;
  /**
   * Numeric Booking destination id. Either `destination` or `dest_id` is
   * required.
   */
  dest_id?: string;
  /**
   * What `dest_id` refers to. Rejected without `dest_id` - Booking silently
   * ignores it on its own.
   */
  dest_type?:
    | "city"
    | "region"
    | "country"
    | "district"
    | "landmark"
    | "airport"
    | "hotel";
  /** Result page, 1-indexed. 25 properties per page. */
  page?: number;
  /** Result sort order (default "popularity"). */
  sort_by?:
    | "popularity"
    | "price_low"
    | "price_high"
    | "stars_high"
    | "stars_low"
    | "stars_and_price"
    | "distance"
    | "review_score";
  /** Minimum price PER NIGHT, in `currency`. Must be <= `max_price`. */
  min_price?: number;
  /** Maximum price PER NIGHT, in `currency`. */
  max_price?: number;
  /** Star ratings to keep, 1-5 each, up to 5 values. OR'd together. */
  stars?: number[];
  /**
   * Minimum guest review score. A CLOSED set - Booking silently drops an
   * arbitrary threshold, so only "6", "7", "8" and "9" are accepted.
   */
  min_review_score?: "6" | "7" | "8" | "9";
  /**
   * Accommodation type by name, or a raw numeric Booking accommodation-type
   * id.
   */
  property_type?:
    | "apartments"
    | "hostels"
    | "hotels"
    | "motels"
    | "resorts"
    | "bed_and_breakfasts"
    | "villas"
    | "campgrounds"
    | "vacation_homes"
    | "lodges"
    | "homestays"
    | number;
  /** Free-cancellation rates only. */
  free_cancellation?: boolean;
  /** No-prepayment rates only. */
  no_prepayment?: boolean;
  /** Breakfast-included rates only. */
  breakfast_included?: boolean;
  /**
   * Check-in date, YYYY-MM-DD. Must be sent together with `checkout` and
   * before it.
   */
  checkin?: string;
  /** Check-out date, YYYY-MM-DD. Must be sent together with `checkin`. */
  checkout?: string;
  /** Adults in the party (default 2). */
  adults?: number;
  /** Child AGES, 0-17 each, up to 10 values. Ages, not a count. */
  children_ages?: number[];
  /** Rooms to price (default 1). */
  rooms?: number;
  /**
   * ISO 4217 currency, 3 letters (default "USD"). Leave it set - without a
   * currency Booking prices off the proxy exit.
   */
  currency?: string;
  [key: string]: unknown;
}

export interface BookingHotelOptions {
  /**
   * booking.com property URL or the bare page slug, 1-500 characters. Query
   * params are discarded. Chaining the `url` from a search row is cheapest -
   * a bare slug with the wrong `country_code` is a BILLED 404.
   */
  hotel: string;
  /** Two-letter country code (default "us"). Only consulted for a bare slug. */
  country_code?: string;
  /**
   * Check-in date, YYYY-MM-DD. Must be sent together with `checkout` and
   * before it. Omitting both prices a two-night window Booking chose.
   */
  checkin?: string;
  /** Check-out date, YYYY-MM-DD. Must be sent together with `checkin`. */
  checkout?: string;
  /** Adults in the party (default 2). */
  adults?: number;
  /** Child AGES, 0-17 each, up to 10 values. Ages, not a count. */
  children_ages?: number[];
  /** Rooms to price (default 1). */
  rooms?: number;
  /** ISO 4217 currency, 3 letters (default "USD"). */
  currency?: string;
  [key: string]: unknown;
}

export interface BookingReviewsOptions {
  /**
   * booking.com property URL or the bare page slug, 1-500 characters. Query
   * params are discarded.
   */
  hotel: string;
  /** Two-letter country code (default "us"). Only consulted for a bare slug. */
  country_code?: string;
  /**
   * Check-in date, YYYY-MM-DD. Must be sent together with `checkout` and
   * before it.
   */
  checkin?: string;
  /** Check-out date, YYYY-MM-DD. Must be sent together with `checkin`. */
  checkout?: string;
  /** Adults in the party (default 2). */
  adults?: number;
  /** Child AGES, 0-17 each, up to 10 values. Ages, not a count. */
  children_ages?: number[];
  /** Rooms to price (default 1). */
  rooms?: number;
  /** ISO 4217 currency, 3 letters (default "USD"). */
  currency?: string;
  [key: string]: unknown;
}

export class BookingNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Booking.com properties for a destination and stay: live nightly
   * price, review score, star rating, location, room type and deal badges.
   *
   * Either `destination` or `dest_id` is required - without one the request
   * would land on Booking's homepage, so it is rejected instead of billed.
   * `dest_type` requires `dest_id`.
   *
   * Paged with `page`, 25 properties per page. `checkin` and `checkout` must
   * be sent together or Booking prices a range of its own choosing.
   *
   * Each row carries a `url` - chain it into hotel() rather than rebuilding a
   * slug, which risks a BILLED 404 on the wrong `country_code`.
   *
   * Costs 1 credit.
   */
  async search(
    options: BookingSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/booking/search", options);
  }

  /**
   * One Booking.com property in full: rooms and rate plans, facilities, house
   * rules, check-in windows, policies, images, location and review scores -
   * priced for the stay you ask for.
   *
   * Takes dates because Booking prices a STAY. Omit them and the response
   * carries prices for a two-night window Booking picked; the response echoes
   * whichever dates were used.
   *
   * Single response, no pagination.
   *
   * Costs 1 credit.
   */
  async hotel(
    options: BookingHotelOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/booking/hotel", options);
  }

  /**
   * Booking.com guest reviews with the score breakdown by category and
   * Booking's own praise/complaint summary.
   *
   * NO PAGE PARAM - do not invent one. `total_count` is the property's whole
   * review history; `count` is what this response holds.
   *
   * Costs 1 credit.
   */
  async reviews(
    options: BookingReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/booking/reviews", options);
  }
}
