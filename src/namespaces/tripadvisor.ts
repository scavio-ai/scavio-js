import type { Scavio } from "../client.js";

// Tripadvisor is 2 credits flat on all four endpoints.
//
// START WITH locations(). Every other endpoint is keyed by ids that exist
// only inside Tripadvisor's own URLs, so a caller holding a place NAME has no
// other entry point. A GEO row from locations() answers `geo_id` for search();
// a business row answers the `geo_id` + `location_id` pair that location() and
// reviews() take.
//
// Page 1 of a location's reviews already rides along inside location() - call
// reviews() only to page PAST it.
//
// Review page size differs by family: 15 per page for restaurants, 10 for
// hotels and attractions. Keep `category` matched to the location's own type
// on any page past the first. Consecutive pages can REPEAT one review at the
// boundary - de-duplicate on review_id when concatenating.
//
// Search renders 30 locations per page and a page beyond the last is a 404,
// not an empty result. An unknown location id is answered upstream with a 200
// city listing (billed) that the transport restates as a 404.

export interface TripadvisorLocationsOptions {
  /** Place or business NAME to resolve, 1-120 characters. */
  query: string;
  /**
   * How many matches to return, 1-20 (default 12). This only SIZES the
   * response - it is not a page param.
   */
  limit?: number;
  [key: string]: unknown;
}

export interface TripadvisorSearchOptions {
  /**
   * Tripadvisor geo id. Accepts 30196, g30196, or a URL carrying one. Either
   * `geo_id` or `url` is required.
   */
  geo_id?: string;
  /** Which listing family to read (default "restaurants"). */
  category?: "restaurants" | "hotels" | "attractions";
  /**
   * Result page, 1-indexed. 30 locations per page; a page beyond the last is
   * a 404, not an empty result.
   */
  page?: number;
  /**
   * Full tripadvisor.com listing URL, 1-500 characters. The host is checked by
   * the transport (subdomain-aware, covers country sites). Either `geo_id` or
   * `url` is required.
   */
  url?: string;
  [key: string]: unknown;
}

export interface TripadvisorLocationOptions {
  /**
   * Tripadvisor location id. Accepts 1899234, d1899234, or a full _Review
   * URL. Either `location_id` or `url` is required.
   */
  location_id?: string;
  /**
   * Tripadvisor geo id. Required by the transport when a bare d-id is sent -
   * the pair comes straight off a locations() business row.
   */
  geo_id?: string;
  /** Which listing family the location belongs to (default "restaurants"). */
  category?: "restaurants" | "hotels" | "attractions";
  /**
   * Full tripadvisor.com listing URL, 1-500 characters. Either `location_id`
   * or `url` is required.
   */
  url?: string;
  [key: string]: unknown;
}

export interface TripadvisorReviewsOptions {
  /**
   * Tripadvisor location id. Accepts 1899234, d1899234, or a full _Review
   * URL. Either `location_id` or `url` is required.
   */
  location_id?: string;
  /** Tripadvisor geo id for the location. */
  geo_id?: string;
  /**
   * Which listing family the location belongs to (default "restaurants").
   * Page size follows this, so it must match the location's own type on any
   * page past the first.
   */
  category?: "restaurants" | "hotels" | "attractions";
  /**
   * Full tripadvisor.com listing URL, 1-500 characters. Either `location_id`
   * or `url` is required.
   */
  url?: string;
  /**
   * Result page, 1-indexed. 15 per page for restaurants, 10 for hotels and
   * attractions. Past the last page is a 404.
   */
  page?: number;
  [key: string]: unknown;
}

export class TripadvisorNamespace {
  constructor(private client: Scavio) {}

  /**
   * START HERE. Resolve a place or business NAME to the Tripadvisor
   * geo_id / location_id pairs every other endpoint needs.
   *
   * A GEO row answers `geo_id` for search(); a business row answers the
   * `geo_id` + `location_id` pair location() and reviews() take. Those ids
   * exist only inside Tripadvisor's own URLs, so this is the only entry point
   * from a name.
   *
   * `limit` (1-20, default 12) sizes the response; there is no pagination.
   *
   * Costs 2 credits.
   */
  async locations(
    options: TripadvisorLocationsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tripadvisor/locations", options);
  }

  /**
   * Restaurants, hotels or attractions in a Tripadvisor geo, Tripadvisor-
   * ranked: rating, review count, price band, address, coordinates, phone,
   * hours and Travelers' Choice badge. Each row carries the location_id +
   * geo_id pair the detail endpoints take.
   *
   * `geo_id` or `url` is required - get `geo_id` from locations().
   *
   * Paged with `page`, 30 locations per page. A page beyond the last is a
   * 404, not an empty result.
   *
   * Costs 2 credits.
   */
  async search(
    options: TripadvisorSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tripadvisor/search", options);
  }

  /**
   * One Tripadvisor location in full: rating, review histogram and per-aspect
   * sub-ratings, city ranking, price band, cuisines, amenities, address,
   * coordinates, contact, photos, and the FIRST PAGE OF REVIEWS.
   *
   * `location_id` or `url` is required, and the transport additionally
   * requires a geo when a bare d-id is sent.
   *
   * Page 1 of the reviews is already here - call reviews() only to page PAST
   * it. An unknown location id is a 404 (upstream answers a billed city
   * listing that the transport restates).
   *
   * Costs 2 credits.
   */
  async location(
    options: TripadvisorLocationOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tripadvisor/location", options);
  }

  /**
   * A page of Tripadvisor reviews: rating, trip date and type, reviewer home
   * town and contribution count, and any management response.
   *
   * `location_id` or `url` is required. Page size follows `category` - 15 per
   * page for restaurants, 10 for hotels and attractions - so keep it matched
   * to the location's own type on any page past the first.
   *
   * Consecutive pages can REPEAT one review at the boundary; de-duplicate on
   * review_id when concatenating.
   *
   * Costs 2 credits.
   */
  async reviews(
    options: TripadvisorReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tripadvisor/reviews", options);
  }
}
