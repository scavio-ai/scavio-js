import type { Scavio } from "../client.js";

// Rightmove (UK): 7 endpoints, all POST /api/v1/rightmove/<endpoint>, 1 credit
// each. sold-property is soldProperty() here.
//
// search() and agents() take exactly one place selector; property(),
// soldProperty() and agent() take exactly one of an id or a URL. Rightmove
// serves 42 search pages, 40 sold pages and 50 agent pages per query. Search
// has NO keyword filter: a request carrying keywords is rejected with a 400
// (not billed); match on summary and key_features in the results instead. An
// unknown or removed listing, sold id or branch returns a 404 and is billed.

export type RightmoveListingStatus = "for_sale" | "for_rent";
export type RightmovePropertyType =
  | "detached"
  | "semi_detached"
  | "terraced"
  | "flat"
  | "bungalow"
  | "land"
  | "park_home";
export type RightmoveMustHave = "garden" | "parking" | "new_home";
export type RightmoveExclude = "auction" | "retirement" | "shared_ownership" | "new_home";
export type RightmoveTenure = "freehold" | "leasehold";
export type RightmoveRadius = 0 | 0.25 | 0.5 | 1 | 3 | 5 | 10 | 15 | 20 | 30 | 40;
export type RightmoveFurnishing = "furnished" | "part_furnished" | "unfurnished";
export type RightmoveLetType = "long_term" | "short_term";
export type RightmoveSort = "newest" | "oldest" | "price_low" | "price_high";
export type RightmoveSoldPropertyType = "flat" | "detached" | "semi_detached" | "terraced" | "other";
export type RightmoveSoldSort = "newest" | "price_low" | "price_high";

export interface RightmoveLocationsOptions {
  /** Town, area, outcode (SW11), postcode or station (1-100 characters). */
  query: string;
  [key: string]: unknown;
}

/** Pass exactly one of location_id, location or branch_id. */
export interface RightmoveSearchOptions {
  /** A location_id from locations() (REGION^, OUTCODE^, POSTCODE^ or STATION^, e.g. "REGION^219"). */
  location_id?: string;
  /**
   * A place name, resolved to its first location match (echoed in the
   * response). Alternative to location_id.
   */
  location?: string;
  /** Only this agent branch's listings (numeric branch_id from agents()). */
  branch_id?: string;
  /** for_sale (default) or for_rent. */
  listing_status?: RightmoveListingStatus;
  /** Minimum price in GBP (monthly rent on for_rent). */
  min_price?: number;
  /** Maximum price in GBP (monthly rent on for_rent). */
  max_price?: number;
  /** Minimum bedrooms (0-10). */
  beds_min?: number;
  /** Maximum bedrooms (0-10). */
  beds_max?: number;
  /** Minimum bathrooms (1-5). */
  baths_min?: number;
  /** Only these property types (e.g. ["detached", "semi_detached"]). */
  property_types?: RightmovePropertyType[];
  /** Only listings with all of these. */
  must_have?: RightmoveMustHave[];
  /** Leave these listing kinds out. */
  exclude?: RightmoveExclude[];
  /** for_sale only: freehold or leasehold. */
  tenure?: RightmoveTenure;
  /** Only listings added in the last 1, 3, 7 or 14 days. */
  added_within_days?: 1 | 3 | 7 | 14;
  /** Include listings under offer / sold STC (for_sale) or let agreed (for_rent). */
  include_under_offer?: boolean;
  /** Widen the area by this many miles (default 0). */
  radius_miles?: RightmoveRadius;
  /** for_rent only. */
  furnishing?: RightmoveFurnishing[];
  /** for_rent only: long_term or short_term. */
  let_type?: RightmoveLetType;
  /** Result order (default "newest"). */
  sort?: RightmoveSort;
  /** Results page, 1-42 (24 per page). */
  page?: number;
  [key: string]: unknown;
}

/** Pass exactly one of property_id or url. */
export interface RightmovePropertyOptions {
  /** Numeric listing id from search(). */
  property_id?: string;
  /** A rightmove.co.uk/properties/<id> URL. Alternative to property_id. */
  url?: string;
  [key: string]: unknown;
}

export interface RightmoveSoldOptions {
  /** A town, outcode (SW11) or full postcode (SW11 1AA) in England or Wales. */
  location: string;
  /** Only this property type. */
  property_type?: RightmoveSoldPropertyType;
  /** freehold or leasehold. */
  tenure?: RightmoveTenure;
  /** Only addresses sold in the last 1, 2, 3, 5, 10, 15, 20 or 30 years. */
  sold_within_years?: 1 | 2 | 3 | 5 | 10 | 15 | 20 | 30;
  /** Widen the area by this many miles (default 0). */
  radius_miles?: RightmoveRadius;
  /** Newest sale first (default), price_low or price_high. */
  sort?: RightmoveSoldSort;
  /** Results page, 1-40 (25 addresses per page). */
  page?: number;
  [key: string]: unknown;
}

/** Pass exactly one of sold_id or url. */
export interface RightmoveSoldPropertyOptions {
  /** sold_id from sold() (36-character id). */
  sold_id?: string;
  /** A rightmove.co.uk/house-prices/details/<id> URL. Alternative to sold_id. */
  url?: string;
  [key: string]: unknown;
}

/** Pass exactly one of location_id or location. */
export interface RightmoveAgentsOptions {
  /** A location_id from locations() (REGION^, OUTCODE^, POSTCODE^ or STATION^). */
  location_id?: string;
  /** A place name, resolved to its first location match. Alternative to location_id. */
  location?: string;
  /** Results page, 1-50 (20 branches per page). */
  page?: number;
  [key: string]: unknown;
}

/** Pass exactly one of url or branch_id. */
export interface RightmoveAgentOptions {
  /** A branch profile URL (profile_url from agents()). */
  url?: string;
  /** Numeric branch_id from agents() or a listing's agent. Alternative to url. */
  branch_id?: string;
  [key: string]: unknown;
}

export class RightmoveNamespace {
  constructor(private client: Scavio) {}

  /**
   * Look up UK places by name, outcode, postcode or station and get the
   * location_id that search() and agents() take.
   *
   * Costs 1 credit.
   */
  async locations(options: RightmoveLocationsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/rightmove/locations", options);
  }

  /**
   * Search UK property for sale or to rent on Rightmove by location_id, place
   * name or agent branch, filtered by price (GBP; monthly on for_rent), beds,
   * baths, property type, must-haves, exclusions, tenure, days since added,
   * under offer, radius, and furnishing and let type for rentals. 24 listings
   * per page, up to 42 pages (about 1,000 listings) per search. There is no
   * keyword filter; match on summary and key_features in the results.
   *
   * Costs 1 credit.
   */
  async search(options: RightmoveSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/rightmove/search", options);
  }

  /**
   * One Rightmove listing in full: price and qualifier, description, key
   * features, rooms, images, floorplans, brochures, EPC, tenure and lease
   * years remaining, council tax band, service charge and ground rent,
   * heating, parking, garden, accessibility and flood-risk details, broadband,
   * nearest stations, letting terms and the agent branch with phone. Live
   * listings carry no price history; use soldProperty() for an address's past
   * sales. A removed listing is a 404. Pass exactly one of property_id or url.
   *
   * Costs 1 credit.
   */
  async property(options: RightmovePropertyOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/rightmove/property", options);
  }

  /**
   * Sold house prices for a town, outcode or postcode in England or Wales:
   * every address with its sale history since 1995 (price, date, tenure, new
   * build) plus an area summary. 25 addresses per page, up to 40 pages per
   * search.
   *
   * Costs 1 credit.
   */
  async sold(options: RightmoveSoldOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/rightmove/sold", options);
  }

  /**
   * One sold address: every recorded sale with exact price, date, tenure,
   * new-build flag and percent change since the previous sale, the postcode,
   * and the last listing (beds, baths, key features, photos, floorplans,
   * advertised dates) when the address was listed on Rightmove. Pass exactly
   * one of sold_id or url.
   *
   * Costs 1 credit.
   */
  async soldProperty(options: RightmoveSoldPropertyOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/rightmove/sold-property", options);
  }

  /**
   * Estate and letting agent branches for a UK location: name, brand, phones,
   * address, sales and lettings flags, description, profile URL and logo. 20
   * branches per page, up to 50 pages. Pass exactly one of location_id or
   * location.
   *
   * Costs 1 credit.
   */
  async agents(options: RightmoveAgentsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/rightmove/agents", options);
  }

  /**
   * One agent branch: address, phones, coordinates, company,
   * sales/lettings/commercial/development flags, descriptions, logo, industry
   * affiliations, and the count plus a teaser of its listings for sale and to
   * rent. Use search({ branch_id }) for the full listings. Pass exactly one of
   * url or branch_id.
   *
   * Costs 1 credit.
   */
  async agent(options: RightmoveAgentOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/rightmove/agent", options);
  }
}
