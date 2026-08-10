import type { Scavio } from "../client.js";

// Redfin is 1 credit flat on all three endpoints. property() and market()
// read the property / region PAGE, whose inlined request cache replaces the
// ~40 upstream calls the page itself made - which is why they cost the same
// as search().
//
// CITY NAMES ARE NOT ACCEPTED on `location`. Redfin's own name lookup is the
// single path its edge blocks us from, so pass a redfin.com region URL
// (/city/, /neighborhood/, /county/, /zipcode/), a bare 5-digit ZIP, or
// `region_id` + `region_type` TOGETHER - the transport falls back to
// `location` unless it has both halves.
//
// `region_id` is NOT a ZIP code. They are different number spaces, and a ZIP
// passed as a region id resolves to another city rather than failing.
//
// Every numeric filter is truncated into Redfin's gis query, so FRACTIONAL
// bounds are rejected rather than silently floored (1.5 baths would have
// become 1).
//
// `days_on_market` comes back NULL on search() - Redfin's mainHouseInfo
// carries no `dom` key. Do not build on that field.
//
// Two filter pairs are mutually exclusive by construction:
// `max_days_on_market` + `min_days_on_market` (Redfin expresses both through
// one param), and `sold_within_days` outside `listing_status: "sold"`.

export interface RedfinSearchOptions {
  /**
   * A redfin.com region URL (/city/, /neighborhood/, /county/, /zipcode/) or
   * a bare 5-digit ZIP, up to 500 characters. CITY NAMES ARE NOT ACCEPTED.
   * Required unless `region_id` AND `region_type` are both given.
   */
  location?: string;
  /**
   * Redfin's internal region id. NOT a ZIP code - a ZIP here resolves to a
   * different city instead of failing. Must be paired with `region_type`.
   */
  region_id?: number;
  /**
   * What `region_id` refers to: 1 neighborhood, 2 ZIP, 5 county, 6 city.
   * Must be paired with `region_id`.
   */
  region_type?: 1 | 2 | 5 | 6;
  /** Which market to read (default "for_sale"). */
  listing_status?: "for_sale" | "sold" | "for_rent";
  /**
   * Sold-listing lookback in days (default 90). REJECTED unless
   * `listing_status` is "sold" - it only widens whatever listing_status
   * already chose.
   */
  sold_within_days?: number;
  /** Result page, 1-indexed. */
  page?: number;
  /** Listings per page, 1-350 (default 100). */
  limit?: number;
  /** Result sort order (default "recommended"). */
  sort?:
    | "recommended"
    | "price_low"
    | "price_high"
    | "newest"
    | "oldest"
    | "sqft_low"
    | "sqft_high"
    | "price_per_sqft_low"
    | "price_per_sqft_high";
  /**
   * Minimum price. On `listing_status: "for_rent"` this is MONTHLY RENT, not
   * sale price.
   */
  min_price?: number;
  /**
   * Maximum price. On `listing_status: "for_rent"` this is MONTHLY RENT, not
   * sale price.
   */
  max_price?: number;
  /** Minimum bedrooms. Whole numbers only. */
  beds_min?: number;
  /** Maximum bedrooms. Whole numbers only. */
  beds_max?: number;
  /**
   * Minimum bathrooms. WHOLE baths only - a fractional value such as 1.5 is
   * rejected, not rounded.
   */
  baths_min?: number;
  /** Minimum living area in square feet. Whole numbers only. */
  sqft_min?: number;
  /** Maximum living area in square feet. Whole numbers only. */
  sqft_max?: number;
  /** Minimum lot size in square feet. Whole numbers only. */
  lot_size_min?: number;
  /** Earliest year built. */
  year_built_min?: number;
  /** Latest year built. */
  year_built_max?: number;
  /** Maximum monthly HOA fee. */
  max_hoa?: number;
  /**
   * Property class. Redfin's uipt code 7 is deliberately absent - its meaning
   * could not be confirmed and a guess would silently search a different
   * class.
   */
  property_type?:
    | "house"
    | "condo"
    | "townhouse"
    | "multi_family"
    | "land"
    | "other"
    | "co_op";
  /** Listings with a pool only. */
  has_pool?: boolean;
  /**
   * Maximum days on market. Cannot be combined with `min_days_on_market` -
   * Redfin expresses both through ONE param, so the transport would send the
   * max and drop the min.
   */
  max_days_on_market?: number;
  /**
   * Minimum days on market. Cannot be combined with `max_days_on_market`.
   */
  min_days_on_market?: number;
  [key: string]: unknown;
}

export interface RedfinPropertyOptions {
  /**
   * A Redfin property id, or any redfin.com listing URL carrying one (up to
   * 500 characters).
   */
  property_id: string;
  [key: string]: unknown;
}

export interface RedfinMarketOptions {
  /**
   * A redfin.com region URL (/city/, /neighborhood/, /county/, /zipcode/) or
   * a bare 5-digit ZIP, up to 500 characters. CITY NAMES ARE NOT ACCEPTED.
   * Required unless `region_id` AND `region_type` are both given.
   */
  location?: string;
  /**
   * Redfin's internal region id. NOT a ZIP code. Must be paired with
   * `region_type`.
   */
  region_id?: number;
  /**
   * What `region_id` refers to: 1 neighborhood, 2 ZIP, 5 county, 6 city.
   * Must be paired with `region_id`.
   */
  region_type?: 1 | 2 | 5 | 6;
  [key: string]: unknown;
}

export class RedfinNamespace {
  constructor(private client: Scavio) {}

  /**
   * Redfin listings: price, price per sqft, beds, baths, living area, lot
   * size, year built, coordinates, listing remarks and full photo galleries.
   *
   * Pass `location` (a redfin.com region URL or a bare ZIP - city NAMES are
   * not accepted) or `region_id` AND `region_type` together. Paged with
   * `page` + `limit`, up to 350 listings per page.
   *
   * `days_on_market` comes back NULL on every row: Redfin's mainHouseInfo has
   * no `dom` key. Fractional numeric filters are rejected, not rounded.
   * `sold_within_days` requires `listing_status: "sold"`, and
   * `max_days_on_market` / `min_days_on_market` cannot be combined.
   *
   * Costs 1 credit.
   */
  async search(
    options: RedfinSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/redfin/search", options);
  }

  /**
   * One Redfin listing in full: price, Redfin Estimate and rental estimate,
   * complete MLS fact sheet, price and tax history, listing agents, open
   * houses, schools, climate risk, walkability and location scores, sun
   * exposure, monthly weather, permits, zoning, comparable sales and photos.
   *
   * Reads the property PAGE, whose inlined request cache replaces the ~40
   * upstream calls that page made - which is why it is the same price as
   * search().
   *
   * Costs 1 credit. Single response, no pagination.
   */
  async property(
    options: RedfinPropertyOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/redfin/property", options);
  }

  /**
   * Housing-market stats for a region: median list and sale price, price per
   * sqft, sale-to-list ratio, average offers and days on market, YoY
   * movement, Redfin's 0-100 compete score, live inventory by property type,
   * median price and active listings per bedroom count, plus Redfin agent
   * presence and aggregate rating.
   *
   * Pass `location` (city NAMES are not accepted) or `region_id` AND
   * `region_type` together.
   *
   * Costs 1 credit. Single response, no pagination.
   */
  async market(
    options: RedfinMarketOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/redfin/market", options);
  }
}
