import type { Scavio } from "../client.js";

// Public Storage (publicstorage.com, the US self-storage operator, also in Canada) search, facility
// and reviews endpoints; market us or ca (English or French), unit prices in USD or CAD, 1 credit
// each. Generated from the backend routes: every option and its doc mirrors the API's own request
// schema; an input the API only accepts to refuse (a 400 that says 'not offered') is left out. The
// server enforces the value rules and the one-of rules (send one of an id or a link). Every call
// raises the request timeout to PUBLICSTORAGE_TIMEOUT and never lowers a longer client timeout.
// Failed upstream calls and refused inputs are not charged; a not-found is charged (credits_used is
// what was charged).

/** Minimum request timeout (ms) for every publicstorage call. */
export const PUBLICSTORAGE_TIMEOUT = 240_000;

export interface PublicstorageSearchOptions {
  /**
   * A ZIP or postal code, a city with its state or province (Austin, TX; Toronto, ON) or a street
   * address. Not latitude / longitude.
   */
  location?: string;
  /**
   * Or the search slug an earlier answer gave (location.slug, e.g. dallas-tx-75201): needed for
   * page 2 and later.
   */
  slug?: string;
  /** us (default) or ca (Public Storage Canada). */
  market?: "us" | "ca";
  /**
   * en (default) or fr: Public Storage Canada's French pages (market ca). The US site is English
   * only.
   */
  language?: "en" | "fr";
  /** recommended (Public Storage's default order), distance or price_low. */
  sort?: "recommended" | "distance" | "price_low";
  /** Page from 1 (with slug past page 1). Public Storage pages shallowly: pages says how many. */
  page?: number;
  /** Only facilities with climate-controlled units. */
  climate_controlled?: boolean;
  /** Only facilities with drive-up access. */
  drive_up?: boolean;
  /** Only facilities with 24/7 access. */
  access_24_7?: boolean;
  /** Only facilities offering business storage. */
  business_storage?: boolean;
  /** Only facilities with vehicle storage. */
  vehicle_storage?: boolean;
  /** Only facilities with RV storage. */
  rv_storage?: boolean;
  /** Only facilities with boat storage. */
  boat_storage?: boolean;
  /** Only facilities with this unit size: 5x5, 5x10, 5x15, 10x10, 10x15, 10x20, 10x25, 10x30. */
  unit_size?: "5x5" | "5x10" | "5x15" | "10x10" | "10x15" | "10x20" | "10x25" | "10x30";
  [key: string]: unknown;
}

export interface PublicstorageFacilityOptions {
  /** A Public Storage store id (search facilities[].store_id). */
  store_id?: string | number;
  /**
   * Or the facility link (facilities[].url), e.g.
   * https://www.publicstorage.com/self-storage-tx-dallas/2044.html.
   */
  url?: string;
  /** us (default) or ca. Read from url when sent. */
  market?: "us" | "ca";
  /**
   * en (default) or fr: Public Storage Canada's French pages (market ca). The US site is English
   * only.
   */
  language?: "en" | "fr";
  [key: string]: unknown;
}

export interface PublicstorageReviewsOptions {
  /** A Public Storage store id (search facilities[].store_id). */
  store_id: string | number;
  /** Only reviews with this many stars (1-5). */
  stars?: number;
  /** Optional: the facility's site number (facilities[].site_number). */
  site_number?: string;
  /** us only: Public Storage Canada's pages show no reviews. */
  market?: "us";
  [key: string]: unknown;
}

export class PublicstorageNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = PUBLICSTORAGE_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/publicstorage/${path}`, options, undefined, timeout);
  }

  /**
   * Self-storage facilities near a ZIP or postal code, a city or an address on Public Storage
   * (publicstorage.com, the largest US self-storage operator, now also in Canada). Scavio fetches
   * the public Public Storage page on request. US or Canada (English or French), sorted
   * recommended, by distance or by price, with filters (climate controlled, drive-up, 24/7 access,
   * business, vehicle, RV or boat storage, a unit size) applied to the facilities on the page.
   * Costs 1 credit.
   */
  async search(options: PublicstorageSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One Public Storage facility in full by store id or link. Costs 1 credit. */
  async facility(options: PublicstorageFacilityOptions): Promise<Record<string, unknown>> {
    return this.post("facility", options);
  }

  /**
   * Every customer review Public Storage shows for one US facility, newest first (its only order),
   * in one answer, optionally only one star rating. Costs 1 credit.
   */
  async reviews(options: PublicstorageReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }
}
