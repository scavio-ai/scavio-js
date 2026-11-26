import type { Scavio } from "../client.js";

// Extra Space Storage (extraspace.com, the US self-storage REIT) search, facility, reviews,
// cityPrices and locations endpoints; US only, unit prices in USD, 1 credit each. Generated from
// the backend routes: every option and its doc mirrors the API's own request schema; an input the
// API only accepts to refuse (a 400 that says 'not offered') is left out. The server enforces the
// value rules and the one-of rules (send one of an id or a link). Every call raises the request
// timeout to EXTRASPACE_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and
// refused inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every extraspace call. */
export const EXTRASPACE_TIMEOUT = 240_000;

export interface ExtraspaceSearchOptions {
  /**
   * A ZIP code, "City, ST" (e.g. Denver, CO) or a place. An ambiguous place answers did_you_mean:
   * send one of them as term.
   */
  term?: string;
  /** Or a point: latitude with longitude (e.g. 32.7767, -96.797 for Dallas). */
  latitude?: number;
  /** With latitude: the point's longitude. */
  longitude?: number;
  /** Only facilities with climate-controlled units. */
  climate_controlled?: boolean;
  /** Only facilities with drive-up units. */
  drive_up_access?: boolean;
  /** Only facilities with indoor units. */
  indoor?: boolean;
  /** Only facilities with RV, boat or vehicle parking (covered or uncovered). */
  rv_parking?: boolean;
  /** Only facilities with enclosed vehicle storage. */
  enclosed_vehicle_storage?: boolean;
  /** Only facilities with 24-hour access. */
  all_hour_access?: boolean;
  /**
   * Only facilities with at least one of these sizes available: 5x5, 5x10, 5x15, 10x10, 10x15,
   * 10x20, 10x25, 10x30.
   */
  unit_sizes?: Array<"5x5" | "5x10" | "5x15" | "10x10" | "10x15" | "10x20" | "10x25" | "10x30">;
  /**
   * distance (default, nearest first, as Extra Space orders them) or price (lowest Starting at
   * price first; facilities without one last).
   */
  sort?: "distance" | "price";
  [key: string]: unknown;
}

export interface ExtraspaceFacilityOptions {
  /**
   * An Extra Space facility id (search facilities[].store_id; the last number of the facility
   * link). The store number in the facility name is a different number.
   */
  store_id?: string | number;
  /**
   * Or the facility link (search facilities[].url), e.g.
   * https://www.extraspace.com/storage/facilities/us/tennessee/knoxville/1934/.
   */
  url?: string;
  /**
   * Also list unit classes with nothing to rent now (default: only the classes available now, as
   * the facility page lists them).
   */
  include_unavailable?: boolean;
  [key: string]: unknown;
}

export interface ExtraspaceReviewsOptions {
  /**
   * An Extra Space facility id (search facilities[].store_id; the last number of the facility
   * link). The store number in the facility name is a different number.
   */
  store_id?: string | number;
  /**
   * Or the facility link (search facilities[].url), e.g.
   * https://www.extraspace.com/storage/facilities/us/tennessee/knoxville/1934/.
   */
  url?: string;
  /** recent (default), oldest, rating_desc or rating_asc (newest first within a rating). */
  sort?: "recent" | "oldest" | "rating_desc" | "rating_asc";
  /** Only reviews with these star ratings, e.g. [1, 2]. */
  stars?: number[];
  /** Page, from 1. */
  page?: number;
  /** Reviews per page, 1 to 100 (default 20). */
  page_size?: number;
  [key: string]: unknown;
}

export interface ExtraspaceCityPricesOptions {
  /** A US city Extra Space has a city page for (see locations). */
  city: string;
  /** Its state: a 2-letter code or the state's name. */
  state: string;
  [key: string]: unknown;
}

export interface ExtraspaceLocationsOptions {
  /** Only cities in this state (code or name). */
  state?: string;
  /** Only cities whose name starts with this ("San", or "San Antonio, TX"). */
  query?: string;
  [key: string]: unknown;
}

export class ExtraspaceNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = EXTRASPACE_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/extraspace/${path}`, options, undefined, timeout);
  }

  /**
   * Self-storage facilities near a ZIP code, "City, ST", place or point on Extra Space Storage
   * (extraspace.com, the US self-storage REIT). Scavio fetches the public Extra Space page on
   * request. US only, prices in USD. Up to 120 facilities, nearest first (Extra Space has no
   * further pages), filtered by climate control, drive-up, indoor, RV parking, enclosed vehicle
   * storage, 24-hour access and unit sizes, sorted by distance or Starting at price. Costs 1
   * credit.
   */
  async search(options: ExtraspaceSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One Extra Space facility in full by id or link. Costs 1 credit. */
  async facility(options: ExtraspaceFacilityOptions): Promise<Record<string, unknown>> {
    return this.post("facility", options);
  }

  /**
   * The Google reviews shown on an Extra Space facility page, sorted (recent, oldest, rating_desc,
   * rating_asc), filtered by stars and paged by Scavio over the facility's full set. Costs 1
   * credit.
   */
  async reviews(options: ExtraspaceReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /** Self-storage prices in a US city as Extra Space's city page gives them. Costs 1 credit. */
  async cityPrices(options: ExtraspaceCityPricesOptions): Promise<Record<string, unknown>> {
    return this.post("city-prices", options);
  }

  /**
   * The US cities Extra Space lists for its place search (about 1,700 in 44 states and DC),
   * optionally narrowed by state or by the start of a city name. Costs 1 credit.
   */
  async locations(options: ExtraspaceLocationsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("locations", options);
  }
}
