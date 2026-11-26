import type { Scavio } from "../client.js";

// Rent.com (rent.com) and Apartment Guide (apartmentguide.com, same inventory; site rent or
// apartmentguide) search, listing, building, rentTrends, suggestions and cities endpoints; US
// rentals, rents in USD, 1 credit each. Generated from the backend routes: every option and its doc
// mirrors the API's own request schema; an input the API only accepts to refuse (a 400 that says
// 'not offered') is left out. The server enforces the value rules and the one-of rules (send one of
// an id or a link). Every call raises the request timeout to RENTCOM_TIMEOUT and never lowers a
// longer client timeout. Failed upstream calls and refused inputs are not charged; a not-found is
// charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every rentcom call. */
export const RENTCOM_TIMEOUT = 240_000;

export interface RentcomSearchOptions {
  /**
   * rent (www.rent.com, default, 30 listings a page) or apartmentguide (www.apartmentguide.com, the
   * same rentals, 50 a page).
   */
  site?: "rent" | "apartmentguide";
  /** A city name (Austin, New York, St. Louis) or its slug (new-york; cities lists them). */
  city?: string;
  /** A US state: 2-letter code (TX) or name (Texas). */
  state?: string;
  /** With city and state (site rent): a neighborhood by name or slug (downtown-manhattan). */
  neighborhood?: string;
  /** Or a 5-digit US ZIP code (instead of city and state). */
  zip?: string;
  /** apartments (default), houses, condos, townhouses or rooms (rooms for rent). Site rent. */
  property_type?: "apartments" | "houses" | "condos" | "townhouses" | "rooms";
  /**
   * Bedrooms: studio or 0-4 (4 = 4 or more), or a list (site rent; apartmentguide takes one value
   * with city and state). Listings with at least one matching floor plan.
   */
  beds?: number | "studio" | Array<number | "studio">;
  /** Bathrooms, 1-4 (4 = 4 or more). Site rent. */
  baths?: number;
  /** Lowest monthly rent, USD. Site rent. */
  price_min?: number;
  /** Highest monthly rent, USD. Site rent. */
  price_max?: number;
  /**
   * Smallest square feet, one of 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200,
   * 1300, 1400, 1500, 1600. Site rent.
   */
  sqft_min?: number;
  /** pet_friendly, dogs, cats or no_pets. Site rent. */
  pets?: "pet_friendly" | "dogs" | "cats" | "no_pets";
  /** The site's cheap apartments filter. Site rent. */
  cheap?: boolean;
  /** The site's luxury filter. Site rent. */
  luxury?: boolean;
  /** Only listings with rent specials. Site rent. */
  deals?: boolean;
  /**
   * Up to 8 amenities: air-conditioning, assisted-living, att-fiber, available-now, cable-ready,
   * college, controlled-limited-access, corporate-billing-available, disability-access, dishwasher,
   * elevator, ev-charging, extra-storage, fitness-center, furnished, garage, gated-access,
   * hardwood-floor, best, high-speed-internet-access, income-restricted, independent-living,
   * laundry-facility, loft, military, new-construction, remodeled, no-credit-check,
   * onsite-personnel, oversized-closets, patio, pool, new, senior-living, short-term-available,
   * virtual-tours, utilities-included, view, washer-dryer-connections, washer-dryer-in-unit,
   * waterfront. Site rent.
   */
  amenities?: string[];
  /**
   * best_match (default), price_low, price_high, beds (fewest first), sqft (smallest first) or
   * latest (latest update). Site rent.
   */
  sort?: "best_match" | "price_low" | "price_high" | "beds" | "sqft" | "latest";
  /** Page, from 1; pages and has_more say how deep the results go. */
  page?: number;
  [key: string]: unknown;
}

export interface RentcomListingOptions {
  /**
   * rent (www.rent.com, default, 30 listings a page) or apartmentguide (www.apartmentguide.com, the
   * same rentals, 50 a page).
   */
  site?: "rent" | "apartmentguide";
  /**
   * A listing id (listings[].id from search: lc5898701, 206824305, lv3119690811). Apartment Guide's
   * 5898701 and Rent.com's lc5898701 are the same listing; either works on either site.
   */
  id?: string | number;
  /** Or the listing's link on rent.com or apartmentguide.com (its host sets the site). */
  url?: string;
  [key: string]: unknown;
}

export interface RentcomBuildingOptions {
  /**
   * rent (the default). This endpoint reads Rent.com's page; Apartment Guide lists the same
   * rentals.
   */
  site?: "rent";
  /** A building id (listings[].id where kind is building, e.g. b147857). */
  building_id?: string | number;
  /** Or the building's rent.com link (https://www.rent.com/building/<address>-b<id>). */
  url?: string;
  [key: string]: unknown;
}

export interface RentcomRentTrendsOptions {
  /**
   * rent (the default). This endpoint reads Rent.com's page; Apartment Guide lists the same
   * rentals.
   */
  site?: "rent";
  /** A city name (Austin, New York, St. Louis) or its slug (new-york; cities lists them). */
  city: string;
  /** A US state: 2-letter code (TX) or name (Texas). */
  state: string;
  [key: string]: unknown;
}

export interface RentcomSuggestionsOptions {
  /**
   * rent (www.rent.com, default, 30 listings a page) or apartmentguide (www.apartmentguide.com, the
   * same rentals, 50 a page).
   */
  site?: "rent" | "apartmentguide";
  /** The start of a city, ZIP, neighborhood, school or property name. */
  query: string;
  [key: string]: unknown;
}

export interface RentcomCitiesOptions {
  /**
   * rent (the default). This endpoint reads Rent.com's page; Apartment Guide lists the same
   * rentals.
   */
  site?: "rent";
  /** A US state: 2-letter code (TX) or name (Texas). */
  state: string;
  [key: string]: unknown;
}

export class RentcomNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = RENTCOM_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/rentcom/${path}`, options, undefined, timeout);
  }

  /**
   * Search rentals on Rent.com or Apartment Guide: Rent.com (rent.com) and Apartment Guide
   * (apartmentguide.com), US rental listing sites run by Redfin. Scavio fetches the public page on
   * request. By city and state, ZIP or neighborhood; property type (apartments, houses, condos,
   * townhouses, rooms), beds, baths, monthly rent range, minimum square feet, pets, cheap / luxury,
   * rent specials and amenities; sorted 6 ways; 30 a page on rent.com, 50 on Apartment Guide.
   * Apartment Guide takes city and state (with one beds value) or ZIP and page, as its links do;
   * send site rent for the other filters (the same rentals). Costs 1 credit.
   */
  async search(options: RentcomSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One rental in full by id or link. Costs 1 credit. */
  async listing(options: RentcomListingOptions): Promise<Record<string, unknown>> {
    return this.post("listing", options);
  }

  /**
   * One building on Rent.com (the separate unit listings at one address) by building id or link.
   * Costs 1 credit.
   */
  async building(options: RentcomBuildingOptions): Promise<Record<string, unknown>> {
    return this.post("building", options);
  }

  /** Rent.com's rent trends for one city. Costs 1 credit. */
  async rentTrends(options: RentcomRentTrendsOptions): Promise<Record<string, unknown>> {
    return this.post("rent-trends", options);
  }

  /**
   * The site's search-box suggestions for the start of a place or property name. Costs 1 credit.
   */
  async suggestions(options: RentcomSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * The cities Rent.com links from a state page, A to Z (a smaller town can be missing and still
   * have a search page). Costs 1 credit.
   */
  async cities(options: RentcomCitiesOptions): Promise<Record<string, unknown>> {
    return this.post("cities", options);
  }
}
