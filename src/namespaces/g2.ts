import type { Scavio } from "../client.js";

// G2, the B2B software review site. 5 credits flat on all three endpoints -
// the only 5-credit platform we serve, because g2.com bills 25 upstream
// credits per call with neither render nor super asked for.
//
// A BOT WALL OR HOLLOW SHELL ARRIVES AS A BILLED 502: the upstream fetch is a
// real HTTP 200 that was charged in full, so the call is billed for a page we
// could not parse. Retry policy is deliberately conservative for that reason -
// do not wrap these calls in an aggressive retry loop of your own.
//
// Every filter is a CLOSED ENUM on purpose. G2 silently accepts an unknown
// sort (answering 200 in some unstated ordering, so the sort never ran) and an
// unknown filter value MATCHES NOTHING - a bogus company size returns
// "Reviews (0)", which reads as "this product has no enterprise reviews".
//
// product() carries NO review text: G2 loads review bodies in a separate
// frame. Call reviews() for text, per-star counts and facet counts.

export interface G2SearchOptions {
  /** Search term (1-200 characters). Required unless `url` is given. */
  query?: string;
  /** Result page, 1-indexed. 20 per page unless `limit` says otherwise. */
  page?: number;
  /**
   * Results per page (1-100, default 20). Capped at 100 on our side so a
   * single request cannot ask for a multi-megabyte page on a 60s deadline;
   * G2 itself keeps paginating at any size.
   */
  limit?: number;
  /** Result sort order (default "relevance"). */
  sort?: "relevance" | "popular" | "alphabetical" | "rating";
  /** Products at or above this star rating. */
  rating?: 1 | 2 | 3 | 4 | 5;
  /**
   * Full g2.com/search URL, as an alternative to `query`. The host is checked
   * by the transport.
   */
  url?: string;
  [key: string]: unknown;
}

export interface G2ProductOptions {
  /**
   * A G2 slug ("notion") or the numeric G2 id ("82623") AS A STRING - both
   * resolve on the same upstream path. Required unless `url` is given.
   */
  product_id?: string;
  /** Full g2.com product URL, as an alternative to `product_id`. */
  url?: string;
  [key: string]: unknown;
}

export interface G2ReviewsOptions {
  /**
   * A G2 slug ("notion") or the numeric G2 id ("82623") as a string.
   * Required unless `url` is given.
   */
  product_id?: string;
  /** Full g2.com reviews URL, as an alternative to `product_id`. */
  url?: string;
  /** Result page, 1-indexed. Fixed at 10 reviews per page. */
  page?: number;
  /** Review sort order (default "relevance"). */
  sort?: "relevance" | "newest" | "most_helpful" | "rating_high" | "rating_low";
  /**
   * Star bucket. HALF-STAR-INCLUSIVE: 1 returns 0, 0.5 and 1-star reviews.
   */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Reviewer's company size: SB <=50, MM 51-1000, Ent >1000. */
  company_size?: "small_business" | "mid_market" | "enterprise";
  /** Reviewer's role. */
  role?:
    | "user"
    | "administrator"
    | "executive_sponsor"
    | "internal_consultant"
    | "consultant"
    | "agency"
    | "industry_analyst";
  /** Reviewer's region. */
  region?:
    | "north_america"
    | "europe"
    | "asia"
    | "latin_america"
    | "anz"
    | "middle_east"
    | "africa";
  /**
   * Full-text search within the reviews (1-200 characters). Narrows the list
   * AND every facet count.
   */
  query?: string;
  [key: string]: unknown;
}

export class G2Namespace {
  constructor(private client: Scavio) {}

  /**
   * Ranked B2B software products on G2: star rating, review count, vendor,
   * categories, seller description and logo. Every row carries `product_id`
   * and `slug` to feed product() and reviews().
   *
   * Paged with `page` and `limit` (1-100, default 20). `total_results` is
   * G2's Products-tab headline and is CAPPED AT 10000, so treat a 10000 as a
   * floor rather than a count; `total_by_type` breaks the same query across
   * products, sellers, categories and discussions.
   *
   * Pass `query` or `url`.
   *
   * Costs 5 credits.
   */
  async search(
    options: G2SearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/g2/search", options);
  }

  /**
   * A full G2 software profile: rating with per-star histogram, review count,
   * vendor, description and seller website, pricing editions with parsed
   * amounts, feature groups, categories and breadcrumbs, supported languages,
   * integrations, alternatives, head-to-head comparisons, media, community
   * discussions and G2's AI-derived pros and cons.
   *
   * CARRIES NO REVIEW TEXT. G2 loads review bodies in a separate frame, so
   * this endpoint returns none at all - call reviews() for text.
   *
   * Pass `product_id` (slug or numeric id as a string) or `url`.
   *
   * Costs 5 credits. Single response, no pagination.
   */
  async product(
    options: G2ProductOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/g2/product", options);
  }

  /**
   * A page of G2 reviews: rating, title, likes and dislikes, problems solved,
   * reviewer job title, industry and company size, validated and incentivized
   * flags - PLUS what the profile page has no form of: exact per-star counts,
   * pros and cons with per-theme counts, and company-size / role / industry /
   * region / category facets with counts.
   *
   * Fixed at 10 reviews per page; advance with `page`. This paginates well
   * past the 10 pages G2's own widget links to.
   *
   * `rating` buckets are HALF-STAR-INCLUSIVE (1 returns 0, 0.5 and 1-star).
   * Every filter is a closed enum because an unrecognised value matches
   * nothing upstream and comes back as an empty, plausible-looking result set.
   *
   * Pass `product_id` or `url`.
   *
   * Costs 5 credits.
   */
  async reviews(
    options: G2ReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/g2/reviews", options);
  }
}
