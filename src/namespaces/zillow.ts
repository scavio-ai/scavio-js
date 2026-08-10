import type { Scavio } from "../client.js";

// Zillow is 1 credit flat on all three endpoints.
//
// A bare ZIP works ALONE but cannot be combined with a filter or a sort:
// on that request shape Zillow resolves the region by geolocation and answers
// about another city entirely. Pass the city name when you are filtering.
//
// On listing_status "for_rent", min_price / max_price mean MONTHLY RENT -
// Zillow files rent under its payment filter, not its price filter.
//
// A region Zillow cannot resolve is a 404, not an empty result set.
//
// agentReviews() is named for what it addresses. The path is /zillow/reviews
// but the subject is an AGENT profile keyed by screen name, never a property.

export interface ZillowSearchOptions {
  /**
   * Region to search: a Zillow slug, a human form ("Austin, TX"), a ZIP, or a
   * pasted Zillow search URL. A bare ZIP works only on its own - combined
   * with any filter or sort, Zillow geolocates instead and answers about a
   * different city, so use the city name there.
   */
  location: string;
  /** Which market to read (default "for_sale"). */
  listing_status?: "for_sale" | "for_rent" | "sold";
  /** Result page, 1-indexed. */
  page?: number;
  /**
   * Result sort order. Sorts that rank against a signed-in profile
   * (saved / featured / personalised) are deliberately absent - these
   * requests are never signed in.
   */
  sort?:
    | "relevance"
    | "recommended"
    | "newest"
    | "price_low"
    | "price_high"
    | "payment_low"
    | "payment_high"
    | "beds"
    | "baths"
    | "sqft"
    | "lot_size"
    | "zestimate_low"
    | "zestimate_high"
    | "recent_change";
  /**
   * Minimum price. On listing_status "for_rent" this is MONTHLY RENT, not
   * sale price.
   */
  min_price?: number;
  /**
   * Maximum price. On listing_status "for_rent" this is MONTHLY RENT, not
   * sale price.
   */
  max_price?: number;
  /** Minimum bedrooms. */
  beds_min?: number;
  /** Maximum bedrooms. */
  beds_max?: number;
  /** Minimum bathrooms. Half-baths allowed (1.5). */
  baths_min?: number;
  /** Maximum bathrooms. Half-baths allowed (1.5). */
  baths_max?: number;
  /** Minimum living area in square feet. */
  sqft_min?: number;
  /** Maximum living area in square feet. */
  sqft_max?: number;
  /** Minimum lot size in square feet. */
  lot_size_min?: number;
  /** Maximum lot size in square feet. */
  lot_size_max?: number;
  /** Earliest year built. */
  year_built_min?: number;
  /** Latest year built. */
  year_built_max?: number;
  /** Maximum monthly HOA fee. */
  max_hoa?: number;
  /** Property type filter. */
  home_type?:
    | "houses"
    | "townhomes"
    | "multi_family"
    | "condos"
    | "apartments"
    | "manufactured"
    | "lots_land";
  /**
   * Listed within: days as "1" | "7" | "14" | "30" | "90", or months as
   * "6m" | "12m" | "24m" | "36m". Closed enum - an unrecognised value is not
   * an error, it silently returns the UNFILTERED set under a 200.
   */
  days_on_zillow?: "1" | "7" | "14" | "30" | "90" | "6m" | "12m" | "24m" | "36m";
  /** Keyword filter applied to the listing text (1-200 characters). */
  keywords?: string;
  /** Pool only. */
  has_pool?: boolean;
  /** Garage only. */
  has_garage?: boolean;
  /** Air conditioning only. */
  has_air_conditioning?: boolean;
  /** Waterfront only. */
  is_waterfront?: boolean;
  /** Basement only. */
  has_basement?: boolean;
  /** New construction only. */
  is_new_construction?: boolean;
  /** Listings with an open house scheduled. */
  has_open_house?: boolean;
  /** Price-reduced listings only. */
  price_reduced?: boolean;
  /** Listings with a 3D tour. */
  is_3d_tour?: boolean;
  [key: string]: unknown;
}

export interface ZillowPropertyOptions {
  /**
   * A zpid, a /homedetails/ URL, or a zillow.com/apartments/ building URL.
   * Rental buildings have no caller-visible zpid - search() returns
   * coordinates in that slot - so pass the /apartments/ URL for those.
   */
  zpid: string;
  [key: string]: unknown;
}

export interface ZillowAgentReviewsOptions {
  /**
   * The agent's zillow.com/profile/<name>/ screen name, or a full profile
   * URL. Screen names may contain spaces.
   */
  screen_name: string;
  [key: string]: unknown;
}

export class ZillowNamespace {
  constructor(private client: Scavio) {}

  /**
   * Listings in a region: price, beds, baths, living area, Zestimate,
   * coordinates, images and days on market.
   *
   * Paged with `page`. A bare ZIP works alone but not alongside a filter or a
   * sort - use the city name when filtering. On listing_status "for_rent",
   * min_price / max_price are MONTHLY RENT. A region Zillow cannot resolve is
   * a 404, not an empty list.
   *
   * Costs 1 credit.
   */
  async search(
    options: ZillowSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/zillow/search", options);
  }

  /**
   * Full listing detail: price and price history, Zestimate, tax history,
   * description, RESO facts, rooms, schools, open houses, photos and
   * attribution. Rental buildings return floor plans, amenities and unit
   * counts instead.
   *
   * Costs 1 credit. Single response, no pagination.
   */
  async property(
    options: ZillowPropertyOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/zillow/property", options);
  }

  /**
   * An AGENT's profile and reviews: rating, review count, bodies with
   * sub-ratings, specialties, languages, licenses, service areas and sales
   * counts.
   *
   * This addresses an agent by screen name, NOT a property. Zillow
   * server-renders the first five reviews only: `count` is what came back,
   * `total_review_count` is what the agent actually has, and there is no way
   * to page to the rest.
   *
   * Costs 1 credit.
   */
  async agentReviews(
    options: ZillowAgentReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/zillow/reviews", options);
  }
}
