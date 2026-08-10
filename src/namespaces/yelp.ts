import type { Scavio } from "../client.js";

// Yelp is 2 credits flat on all three endpoints - it sits on the premium
// per-domain proxy table.
//
// REVIEWS PAGE 1 IS REDUNDANT. business() already returns the first page of
// reviews at no extra cost, and reviews({ page: 1 }) re-fetches the exact same
// document for another 2 credits. Start at page 2.
//
// `location` is effectively REQUIRED on search: Yelp geolocates a
// location-less search off the proxy exit, so the same request can answer
// about a different metro run to run.
//
// Yelp fixes the page size at 10 for both search and reviews, and a page past
// the last review is a 404, not an empty result.
//
// `sort` is a CLOSED enum on both endpoints because Yelp ignores an
// unrecognised sortby and serves default ranking under a 200 - a billed
// premium scrape for a sort that never ran.
//
// popular_items on business() has a stub-shell state: rows arrive with every
// field null but `identifier`. Those rows are dropped and
// popular_items_omitted flags it.

export interface YelpSearchOptions {
  /**
   * What to search for (1-200 characters), e.g. "coffee". Required together
   * with `location` unless `url` is given.
   */
  term?: string;
  /**
   * Where to search (1-200 characters), e.g. "Austin, TX". Effectively
   * REQUIRED - without it Yelp geolocates off the proxy exit and the same
   * request answers about a different metro run to run.
   */
  location?: string;
  /** Result page, 1-indexed. Yelp fixes the page size at 10. */
  page?: number;
  /**
   * Result sort order (default "recommended"). Closed set - Yelp ignores an
   * unrecognised value and serves default ranking under a billed 200.
   */
  sort?: "recommended" | "rating" | "review_count";
  /** Price bands to include, 1 ($) to 4 ($$$$). 1-4 entries. */
  price?: Array<1 | 2 | 3 | 4>;
  /** Businesses open at request time only. */
  open_now?: boolean;
  /**
   * Raw Yelp filter aliases (RestaurantsDelivery, GoodForKids,
   * WheelchairAccessible), max 20. Deliberate PASSTHROUGH, not an enum -
   * Yelp's vocabulary runs ~117 values per vertical, and an alias it does not
   * know is ignored upstream so results come back unfiltered.
   */
  attributes?: string[];
  /**
   * A full yelp.com/search URL as an alternative to term + location
   * (1-1000 characters).
   */
  url?: string;
  [key: string]: unknown;
}

export interface YelpBusinessOptions {
  /**
   * Yelp alias (desnudo-coffee-austin-2), opaque encid, or a yelp.com/biz URL
   * (1-500 characters). Either this or `url` is required.
   */
  business_id?: string;
  /** A yelp.com/biz URL (1-1000 characters). Either this or `business_id` is required. */
  url?: string;
  [key: string]: unknown;
}

export interface YelpReviewsOptions {
  /**
   * Yelp alias, opaque encid, or a yelp.com/biz URL (1-500 characters).
   * Either this or `url` is required.
   */
  business_id?: string;
  /** A yelp.com/biz URL (1-1000 characters). Either this or `business_id` is required. */
  url?: string;
  /**
   * Result page, 1-indexed, 10 reviews per page. PAGE 1 IS REDUNDANT with
   * business() and costs another 2 credits - start at page 2. A page past the
   * last review is a 404, not an empty result.
   */
  page?: number;
  /**
   * Review sort order (default "relevance"). Closed set - an unrecognised
   * value is served as default ranking under a billed 200.
   */
  sort?: "relevance" | "newest" | "oldest" | "rating_high" | "rating_low" | "elites";
  /** Keep only reviews at this star rating. Changes filtered_review_count, not review_count. */
  rating?: 1 | 2 | 3 | 4 | 5;
  [key: string]: unknown;
}

export class YelpNamespace {
  constructor(private client: Scavio) {}

  /**
   * Businesses in Yelp's ranked order: rating, review count, price band,
   * categories, address, contact rails, hours, photos and a review snippet.
   * Each row carries both business_id and alias, either of which addresses
   * business(). `count` is the 10-row page, `total_results` is Yelp's headline
   * count.
   *
   * `term` + `location` or `url` is required, and `location` is effectively
   * mandatory - Yelp geolocates a location-less search off the proxy exit.
   * Paged with `page`; the page size is fixed at 10.
   *
   * Costs 2 credits.
   */
  async search(
    options: YelpSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/yelp/search", options);
  }

  /**
   * One business in full: rating and per-star histogram, review count, price
   * band, categories, address and coordinates, phone, website and menu links,
   * hours and holidays, amenities, photos and videos, popular items, health
   * inspections, Q&A, licences and claim status - PLUS the first page of
   * reviews at no extra cost.
   *
   * Because those reviews ride along, calling reviews({ page: 1 }) after this
   * buys the same document twice. Yelp's recommendation software hides some
   * reviews entirely; those are never returned and are counted in
   * not_recommended_review_count here. popular_items rows can arrive as stub
   * shells with every field null but `identifier` - those are dropped and
   * popular_items_omitted flags it.
   *
   * `business_id` or `url` is required. Costs 2 credits. Single response, no
   * pagination.
   */
  async business(
    options: YelpBusinessOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/yelp/business", options);
  }

  /**
   * A page of reviews: rating, full text, language, author profile and
   * expertise counts, attached photos, reaction counts and owner response.
   *
   * START AT PAGE 2 - page 1 re-fetches the document business() already
   * returned and costs another 2 credits. 10 reviews per page, and a page past
   * the last review is a 404, not an empty result. `rating` changes
   * filtered_review_count, not review_count.
   *
   * `business_id` or `url` is required. Costs 2 credits.
   */
  async reviews(
    options: YelpReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/yelp/reviews", options);
  }
}
