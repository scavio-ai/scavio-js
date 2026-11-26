import type { Scavio } from "../client.js";

// AffordableHousing.com (affordablehousing.com, the US affordable and Section 8 rental site)
// search, listing, suggestions, waitingLists, housingAuthority and housingAuthorities endpoints; US
// only, rents in USD; search and suggestions 2 credits, the others 1. Generated from the backend
// routes: every option and its doc mirrors the API's own request schema; an input the API only
// accepts to refuse (a 400 that says 'not offered') is left out. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to AFFORDABLEHOUSING_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and
// refused inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every affordablehousing call. */
export const AFFORDABLEHOUSING_TIMEOUT = 240_000;

export interface AffordablehousingSearchOptions {
  /** A US state: 2-letter code (TX, CA, DC) or its name. */
  state: string;
  /** A city in the state (suggestions places[].search.city). */
  city?: string;
  /**
   * Or a county in the state, e.g. Harris (suggestions places[].search.county). Leave out city and
   * county to search the whole state.
   */
  county?: string;
  /**
   * A 5-digit ZIP code, sent with its city and state (AffordableHousing.com searches a ZIP code
   * within its city).
   */
  zip?: string;
  /** Bedrooms: 0 (studio) to 4, or 5 for 5+; one number or a list (2 and 3: [2, 3]). */
  beds?: number | number[];
  /** At least this many bathrooms (1 to 5). */
  baths_min?: number;
  /** apartment, condo, townhouse or house (single family house); one or a list. */
  property_type?: "apartment" | "condo" | "townhouse" | "house" | Array<"apartment" | "condo" | "townhouse" | "house">;
  /** Lowest monthly rent, USD. */
  price_min?: number;
  /** Highest monthly rent, USD. */
  price_max?: number;
  /**
   * default (the site's own order), price_asc, price_desc, newest (last updated), beds_asc,
   * beds_desc, sqft_asc, sqft_desc or affordability. Premium and spotlight listings come first in
   * every sort.
   */
  sort?: "default" | "price_asc" | "price_desc" | "newest" | "beds_asc" | "beds_desc" | "sqft_asc" | "sqft_desc" | "affordability";
  /** Page of 42, from 1; pages says how many. */
  page?: number;
  /** Only pet-friendly listings. */
  pet_friendly?: boolean;
  /**
   * Only listings whose owner has experience with the Section 8 / Housing Choice Voucher program.
   */
  section8?: boolean;
  /** Only listings with utilities included. */
  utilities_included?: boolean;
  /** Only age-restricted (senior) housing. */
  age_restricted?: boolean;
  /**
   * physical (ramps, grab bars, roll-in showers) and / or visual_hearing (visual alarms and
   * doorbells).
   */
  accessibility?: "physical" | "visual_hearing" | Array<"physical" | "visual_hearing">;
  [key: string]: unknown;
}

export interface AffordablehousingListingOptions {
  /** The listing link (search listings[].url). */
  url?: string;
  /** Or the listing id (search listings[].id), e.g. 766073. */
  id?: string | number;
  [key: string]: unknown;
}

export interface AffordablehousingSuggestionsOptions {
  /** A city, county or ZIP code (start of it). */
  text: string;
  /** Most places to return (default 25). */
  limit?: number;
  [key: string]: unknown;
}

export interface AffordablehousingWaitingListsOptions {
  /** A US state (code or name); leave out for every open list nationwide. */
  state?: string;
  [key: string]: unknown;
}

export interface AffordablehousingHousingAuthorityOptions {
  /**
   * The housing authority link (waiting-lists open[].agency_url, housing-authorities
   * agencies[].url).
   */
  url?: string;
  /** Or its id (agency_id, agencies[].id) with state. */
  id?: string | number;
  /** With id: the agency's state. */
  state?: string;
  [key: string]: unknown;
}

export interface AffordablehousingHousingAuthoritiesOptions {
  /** A US state: 2-letter code (TX, CA, DC) or its name. */
  state: string;
  [key: string]: unknown;
}

export class AffordablehousingNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = AFFORDABLEHOUSING_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/affordablehousing/${path}`, options, undefined, timeout);
  }

  /**
   * Search affordable and Section 8 rentals on AffordableHousing.com (affordablehousing.com, the US
   * affordable and Section 8 rental site run by Affordable Housing Network). Scavio fetches the
   * public AffordableHousing.com page on request. A state, city, county or ZIP code (with its
   * city), with beds, baths, property type, rent range, pet friendly, Section 8, utilities
   * included, age restricted and accessibility filters, sorted 9 ways, 42 a page. Costs 2 credits.
   */
  async search(options: AffordablehousingSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One listing in full by link or id. Costs 1 credit. */
  async listing(options: AffordablehousingListingOptions): Promise<Record<string, unknown>> {
    return this.post("listing", options);
  }

  /** AffordableHousing.com's place suggestions for a city, county or ZIP code. Costs 2 credits. */
  async suggestions(options: AffordablehousingSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Open Section 8 and public housing waiting lists, nationwide or for one state. Costs 1 credit.
   */
  async waitingLists(options: AffordablehousingWaitingListsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("waiting-lists", options);
  }

  /** One housing authority (public housing agency) by link or id and state. Costs 1 credit. */
  async housingAuthority(options: AffordablehousingHousingAuthorityOptions): Promise<Record<string, unknown>> {
    return this.post("housing-authority", options);
  }

  /** The housing authorities of a state as the site's state page lists them. Costs 1 credit. */
  async housingAuthorities(options: AffordablehousingHousingAuthoritiesOptions): Promise<Record<string, unknown>> {
    return this.post("housing-authorities", options);
  }
}
