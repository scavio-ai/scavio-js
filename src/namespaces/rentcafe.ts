import type { Scavio } from "../client.js";

// RentCafe (rentcafe.com, Yardi's US and Canada rental listing site) search, property,
// floorplanUnits, reviews, suggestions and rentTrends endpoints; markets us and ca (English or
// French), rents in USD or CAD, 1 credit each. Generated from the backend routes: every option and
// its doc mirrors the API's own request schema; an input the API only accepts to refuse (a 400 that
// says 'not offered') is left out. The server enforces the value rules and the one-of rules (send
// one of an id or a link). Every call raises the request timeout to RENTCAFE_TIMEOUT and never
// lowers a longer client timeout. Failed upstream calls and refused inputs are not charged; a
// not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every rentcafe call. */
export const RENTCAFE_TIMEOUT = 240_000;

export interface RentcafeSearchOptions {
  /**
   * A RentCafe location as its search links write it (austin-tx, 78704-tx,
   * downtown-toronto-toronto-on, a state such as tx), or a suggestions places[].seo_url
   * (us/tx/austin, ca/on/toronto/downtown-toronto).
   */
  location?: string;
  /** Or a city name (with state), e.g. Chicago. */
  city?: string;
  /** Or a US ZIP code (with state), e.g. 78704. */
  zip?: string;
  /** With city or zip: the 2-letter US state or Canadian province code (TX, ON, QC). */
  state?: string;
  /** us or ca. Read from the location's state or province when left out (a mismatch is refused). */
  market?: "us" | "ca";
  /**
   * en (default) or fr: RentCafe's French pages (fr-CA labels over the same listings). Prices stay
   * in the market's currency.
   */
  language?: "en" | "fr";
  /** apartments (default), houses, condos or townhomes. */
  property_type?: "apartments" | "houses" | "condos" | "townhomes";
  /** studio, 1, 2, 3 or 4 bedrooms (0 is studio). */
  beds?: "1" | "2" | "3" | "4" | "studio" | number;
  /** Only listings with a rent special. */
  rent_specials?: boolean;
  /** Only short-term leases. */
  short_term?: boolean;
  furnished?: boolean;
  utilities_included?: boolean;
  /**
   * One amenity filter as RentCafe links it: washer-dryer, pool, garage, fitness-center, balcony,
   * air-conditioning, dishwasher, fireplace, hardwood-floors, walk-in-closets,
   * wheelchair-accessible, controlled-access, playground, public-transportation, recent-build,
   * tennis-court, yard, cheap, luxury. RentCafe takes one of beds, rent_specials, short_term,
   * furnished, utilities_included or amenity per search.
   */
  amenity?: "washer-dryer" | "pool" | "garage" | "fitness-center" | "balcony" | "air-conditioning" | "dishwasher" | "fireplace" | "hardwood-floors" | "walk-in-closets" | "wheelchair-accessible" | "controlled-access" | "playground" | "public-transportation" | "recent-build" | "tennis-court" | "yard" | "cheap" | "luxury";
  /** Only pet-friendly listings (combines with any filter). */
  pet_friendly?: boolean;
  /** Lowest monthly rent, in the market's currency. */
  price_min?: number;
  /** Highest monthly rent, in the market's currency. */
  price_max?: number;
  /**
   * default (RentCafe's Best Match), rent (low to high; listings without a stated rent come first),
   * rent_desc, rating_desc or newest (listings with new units at the top, as RentCafe sorts them).
   */
  sort?: "default" | "rent" | "rent_desc" | "rating_desc" | "newest";
  /**
   * Page of 25, from 1. RentCafe pages through about 15-20 pages at most: pages says how many;
   * narrow with filters for more.
   */
  page?: number;
  [key: string]: unknown;
}

export interface RentcafePropertyOptions {
  /**
   * The listing link (search listings[].url), e.g.
   * https://www.rentcafe.com/apartments/tx/austin/bridge-at-indigo/default.aspx.
   */
  url?: string;
  /**
   * Or <st>/<city>/<name> as in the listing link (housing/... or single-family/... for those
   * links).
   */
  slug?: string;
  /**
   * en (default) or fr: RentCafe's French pages (fr-CA labels over the same listings). Prices stay
   * in the market's currency.
   */
  language?: "en" | "fr";
  [key: string]: unknown;
}

export interface RentcafeFloorplanUnitsOptions {
  /** A RentCafe property id (search listings[].id, suggestions properties[].id, property id). */
  property_id: string | number;
  /** A floor plan id (property floorplans[].id). */
  floorplan_id: string | number;
  /** A unit id (floorplans[].units[].id): selected_unit gives its base rent and availability. */
  unit_id?: string | number;
  /**
   * The listing link (search listings[].url), e.g.
   * https://www.rentcafe.com/apartments/tx/austin/bridge-at-indigo/default.aspx.
   */
  url?: string;
  /** us (default) or ca: the currency of the rents. Read from url when sent. */
  market?: "us" | "ca";
  [key: string]: unknown;
}

export interface RentcafeReviewsOptions {
  /** A RentCafe property id (search listings[].id, suggestions properties[].id, property id). */
  property_id: string | number;
  /** Page of 10 reviews, from 1; pages says how many. */
  page?: number;
  /**
   * The listing link (search listings[].url), e.g.
   * https://www.rentcafe.com/apartments/tx/austin/bridge-at-indigo/default.aspx.
   */
  url?: string;
  [key: string]: unknown;
}

export interface RentcafeSuggestionsOptions {
  /** A city, neighborhood, ZIP code or property name. */
  query: string;
  /** us (default) or ca. */
  market?: "us" | "ca";
  [key: string]: unknown;
}

export interface RentcafeRentTrendsOptions {
  /** A US city. */
  city: string;
  /** Its 2-letter state code. */
  state: string;
  [key: string]: unknown;
}

export class RentcafeNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = RENTCAFE_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/rentcafe/${path}`, options, undefined, timeout);
  }

  /**
   * Search rentals on RentCafe (rentcafe.com, Yardi's US and Canada rental listing site). Scavio
   * fetches the public RentCafe page on request. Apartments, houses, condos or townhomes in a city,
   * ZIP code, neighborhood or state (US and Canada), with one of beds, rent specials, short-term,
   * furnished, utilities included or an amenity, plus price range and pet-friendly, sorted 5 ways,
   * 25 a page; English or French. Costs 1 credit.
   */
  async search(options: RentcafeSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One RentCafe listing in full by link or slug. Costs 1 credit. */
  async property(options: RentcafePropertyOptions): Promise<Record<string, unknown>> {
    return this.post("property", options);
  }

  /**
   * Every unit of one floor plan of a RentCafe listing (the property page shows up to 2). Costs 1
   * credit.
   */
  async floorplanUnits(options: RentcafeFloorplanUnitsOptions): Promise<Record<string, unknown>> {
    return this.post("floorplan-units", options);
  }

  /** Resident reviews of one RentCafe listing, 10 a page in RentCafe's order. Costs 1 credit. */
  async reviews(options: RentcafeReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * RentCafe's location and property suggestions for a city, neighborhood, ZIP code or property
   * name. Costs 1 credit.
   */
  async suggestions(options: RentcafeSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /** RentCafe's rent trends for a US city, as it publishes them. Costs 1 credit. */
  async rentTrends(options: RentcafeRentTrendsOptions): Promise<Record<string, unknown>> {
    return this.post("rent-trends", options);
  }
}
