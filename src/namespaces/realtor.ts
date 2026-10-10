import type { Scavio } from "../client.js";

// Realtor.com: 6 endpoints, all POST /api/v1/realtor/<method>, 1 credit each.
//
// search() takes a location, a point (latitude + longitude + radius_miles) or
// an agent_id, and returns up to 200 listings per call. Realtor.com serves the
// first 10,000 results of a search (page x page_size <= 10,000); slice by price
// band, property type or area to go further. Sold prices are null in US
// sold-price non-disclosure states (Texas, Utah, Wyoming and others); sold
// dates are still returned. An unknown property, market or agent returns a 404
// and is billed.

export type RealtorListingStatus = "for_sale" | "pending" | "for_rent" | "sold";
export type RealtorPropertyType =
  | "single_family"
  | "condos"
  | "townhomes"
  | "multi_family"
  | "land"
  | "mobile"
  | "farm";
export type RealtorSort =
  | "relevance"
  | "newest"
  | "price_low"
  | "price_high"
  | "sold_newest"
  | "sqft_high"
  | "lot_size_high"
  | "year_built_new"
  | "recently_updated"
  | "recently_reduced";

export interface RealtorSearchOptions {
  /**
   * City ("Austin, TX"), county ("Travis County, TX"), ZIP code, state or
   * neighborhood. Alternative to latitude/longitude/radius_miles and agent_id.
   */
  location?: string;
  /** Center latitude for a radius search (with longitude and radius_miles). */
  latitude?: number;
  /** Center longitude for a radius search. */
  longitude?: number;
  /** Radius around latitude/longitude, 0.1 to 50 miles. */
  radius_miles?: number;
  /** Only this agent's listings (numeric agent_id from search rows or agents()). */
  agent_id?: string;
  /**
   * for_sale (default; includes pending and contingent listings, as on the
   * site), pending (only pending or contingent), for_rent, or sold.
   */
  listing_status?: RealtorListingStatus;
  /** for_sale only: leave out pending and contingent listings. */
  exclude_pending?: boolean;
  /** Minimum price in USD: list price, sold price on sold, monthly rent on for_rent. */
  min_price?: number;
  /** Maximum price in USD (same meaning as min_price). */
  max_price?: number;
  /** Minimum bedrooms. */
  beds_min?: number;
  /** Maximum bedrooms. */
  beds_max?: number;
  /** Minimum bathrooms. */
  baths_min?: number;
  /** Maximum bathrooms. */
  baths_max?: number;
  /** Minimum interior square feet. */
  sqft_min?: number;
  /** Maximum interior square feet. */
  sqft_max?: number;
  /** Minimum lot size in square feet (1 acre = 43,560). */
  lot_sqft_min?: number;
  /** Maximum lot size in square feet. */
  lot_sqft_max?: number;
  /** Built in or after this year (1700-2100). */
  year_built_min?: number;
  /** Built in or before this year (1700-2100). */
  year_built_max?: number;
  /** Minimum garage spaces. */
  garage_min?: number;
  /** Maximum monthly HOA fee in USD (listings without an HOA fee are kept). */
  max_hoa?: number;
  /** Only these property types (e.g. ["land"]). */
  property_types?: RealtorPropertyType[];
  /** Only listings listed in the last N days (1-3650). */
  listed_within_days?: number;
  /** sold only: only sales in the last N days (1-3650). */
  sold_within_days?: number;
  /** Only listings with a price cut in the last N days (1-3650). */
  price_reduced_within_days?: number;
  /** Only listings whose listing text matches these keywords, up to 10 (e.g. ["workshop"]). */
  keywords?: string[];
  /** Only new construction. */
  new_construction?: boolean;
  /** Only foreclosures. */
  foreclosure?: boolean;
  /** Only listings with an open house in the next 7 days. */
  has_open_house?: boolean;
  /**
   * Result order (default "relevance"). price_high uses sold price on sold;
   * sold_newest is sold only.
   */
  sort?: RealtorSort;
  /** Results page, 1-based. */
  page?: number;
  /** Listings per page (1-200, default 50). page x page_size may not exceed 10,000. */
  page_size?: number;
  [key: string]: unknown;
}

/** Pass exactly one of property_id or url. */
export interface RealtorPropertyOptions {
  /** Numeric property id from search() or locations(). */
  property_id?: string;
  /** A realtor.com property or rental URL. Alternative to property_id. */
  url?: string;
  [key: string]: unknown;
}

export interface RealtorLocationsOptions {
  /** City, county, ZIP, neighborhood, school or street address (1-200 characters). */
  query: string;
  [key: string]: unknown;
}

export interface RealtorMarketOptions {
  /** A slug_id from locations() (e.g. "Austin_TX", "Travis-County_TX") or "City, ST". */
  location: string;
  [key: string]: unknown;
}

/** Pass exactly one of location, postal_code or name. */
export interface RealtorAgentsOptions {
  /** City as "City, ST" (e.g. "Austin, TX"). */
  location?: string;
  /** 5-digit ZIP code. */
  postal_code?: string;
  /** Agent name (2-100 characters). */
  name?: string;
  /** Results page, 1-based (1-1000). */
  page?: number;
  /** Agents per page (1-50, default 20). */
  page_size?: number;
  [key: string]: unknown;
}

export interface RealtorAgentOptions {
  /** Numeric agent id from search rows (agent.agent_id) or agents(). */
  agent_id: string;
  [key: string]: unknown;
}

export class RealtorNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Realtor.com for-sale, pending, for-rent and sold listings by
   * location, radius or agent, filtered by price, beds, baths, square feet,
   * lot size, year built, garage, HOA, property type, listing/sold/price-cut
   * recency, listing-text keywords, new construction, foreclosure and open
   * houses. Up to 200 listings per call with price, sold price and date, lot
   * size, address with coordinates, MLS id and listing agent. Realtor.com
   * serves the first 10,000 results of a search.
   *
   * Costs 1 credit.
   */
  async search(options: RealtorSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/realtor/search", options);
  }

  /**
   * One Realtor.com property: description and detail groups, price history,
   * tax history with assessed and market values, three home value estimates
   * with ranges plus their history and forecast, nearby schools with ratings,
   * flood/wildfire/noise risk, listing popularity, the listing agent and
   * office, mortgage estimate and photos. Valuations, schools and risk can be
   * null for land or new construction. Pass exactly one of property_id or url.
   *
   * Costs 1 credit.
   */
  async property(options: RealtorPropertyOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/realtor/property", options);
  }

  /**
   * Location suggestions for a partial name: cities, counties, ZIP codes,
   * neighborhoods, schools and addresses, each with its slug_id (for market())
   * and, for an address, the property_id (for property()).
   *
   * Costs 1 credit.
   */
  async locations(options: RealtorLocationsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/realtor/locations", options);
  }

  /**
   * Housing market statistics for a city, county or ZIP: median listing, sold
   * and rent price, price per square foot, days on market, lot size, listing
   * and rental counts, year-over-year and month-over-month changes, and a
   * breakdown by property type. Some medians are null at some geography
   * levels.
   *
   * Costs 1 credit.
   */
  async market(options: RealtorMarketOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/realtor/market", options);
  }

  /**
   * Find real estate agents by city, ZIP code or name: rating, review and
   * recommendation counts, active listing count and price range, homes sold in
   * the last year, broker and office, first year in business and services.
   * Pass exactly one of location, postal_code or name.
   *
   * Costs 1 credit.
   */
  async agents(options: RealtorAgentsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/realtor/agents", options);
  }

  /**
   * One agent's profile with all reviews: bio, phones, website, license number
   * and state, MLS memberships, languages, specializations, served areas,
   * designations, office address, social links, listing and sales stats, and
   * every review with responsiveness, market expertise, negotiation and
   * professionalism sub-ratings and the agent's reply.
   *
   * Costs 1 credit.
   */
  async agent(options: RealtorAgentOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/realtor/agent", options);
  }
}
