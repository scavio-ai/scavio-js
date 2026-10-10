import type { Scavio } from "../client.js";

// Trustpilot: 6 endpoints, all POST /api/v1/trustpilot/<method>, 2 credits each.
//
// business() and reviews() take exactly one of domain or url. reviews() serves
// up to 10 pages of 20 (200 reviews) per filter combination; slice by stars,
// language, date_range, topics or search to reach more. An unknown business,
// review or category returns a 404 and is billed.

export type TrustpilotReviewsDateRange = "last30days" | "last3months" | "last6months" | "last12months";
export type TrustpilotReviewsSort = "recency" | "relevance";
export type TrustpilotCategorySort = "most_relevant" | "reviews_count" | "latest_review";
export type TrustpilotStars = 1 | 2 | 3 | 4 | 5;

export interface TrustpilotSearchOptions {
  /** Business name, keyword or category (1-200 characters). */
  query: string;
  /** 2-letter country code to search in (default "US"). */
  country?: string;
  /** Results page, 1-based (1-1000). */
  page?: number;
  /** Businesses per page (1-100, default 20). */
  page_size?: number;
  [key: string]: unknown;
}

/** A business address: pass exactly one of domain or url. */
export interface TrustpilotBusinessAddress {
  /** The business's website domain as listed on Trustpilot (e.g. "www.amazon.com"). */
  domain?: string;
  /** A trustpilot.com/review/<domain> page URL, from any Trustpilot country site. */
  url?: string;
}

export interface TrustpilotBusinessOptions extends TrustpilotBusinessAddress {
  /**
   * 2-letter language code (default "en"). The 20 included reviews are this
   * language's newest, and the AI summary and topics come back in it when
   * Trustpilot has them for that language (null / empty otherwise). The rating
   * distribution and review-language breakdown cover every language.
   */
  language?: string;
  [key: string]: unknown;
}

export interface TrustpilotReviewsOptions extends TrustpilotBusinessAddress {
  /** Reviews page, 1-10 (20 per page). */
  page?: number;
  /** Only reviews with these star ratings (e.g. [1, 2]). */
  stars?: TrustpilotStars[];
  /** Review language (2-letter code) or "all" (default "all"). */
  language?: string;
  /** Only reviews published in this window. */
  date_range?: TrustpilotReviewsDateRange;
  /** Review order (default "recency"). */
  sort?: TrustpilotReviewsSort;
  /** Only verified reviews. */
  verified_only?: boolean;
  /** Only reviews the business replied to. */
  with_replies?: boolean;
  /** Topic ids from business()'s topics, up to 10 (e.g. ["delivery_service"]). */
  topics?: string[];
  /** Only reviews containing this text (1-100 characters). */
  search?: string;
  [key: string]: unknown;
}

export interface TrustpilotCategoriesOptions {
  /** Find categories by name (1-100 characters). Omit for the full tree. */
  query?: string;
  /** 2-letter country code for the name lookup (default "US"). */
  country?: string;
  [key: string]: unknown;
}

export interface TrustpilotCategoryOptions {
  /** Category id from categories() (e.g. "vpn_service"). */
  category_id: string;
  /** 2-letter country code (default "US"). */
  country?: string;
  /** Result order (default "most_relevant"). */
  sort?: TrustpilotCategorySort;
  /**
   * Minimum star rating: 3, 4 or 4.5. Trustpilot rounds TrustScore to stars,
   * so 4 includes TrustScore 3.8 and up.
   */
  min_trust_score?: 3 | 4 | 4.5;
  /** Only businesses that have claimed their Trustpilot profile. */
  claimed_only?: boolean;
  /** Results page, 1-based (20 businesses per page). */
  page?: number;
  [key: string]: unknown;
}

export interface TrustpilotReviewOptions {
  /** 24-character review id, as returned in review_id by business() or reviews(). */
  review_id: string;
  [key: string]: unknown;
}

export class TrustpilotNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Trustpilot businesses by keyword in one country: TrustScore, star
   * rating, review count, categories, website, and the email, phone and
   * address the business published. Up to 100 businesses per page.
   *
   * Costs 2 credits.
   */
  async search(options: TrustpilotSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/trustpilot/search", options);
  }

  /**
   * A Trustpilot business profile: TrustScore, rating distribution, review
   * languages, categories, contact details, claimed and verification status,
   * reply rate and reply speed on negative reviews, consumer alerts, the AI
   * review summary and topics, similar businesses, and the 20 newest reviews
   * in the chosen language. Pass exactly one of domain or url.
   *
   * Costs 2 credits.
   */
  async business(options: TrustpilotBusinessOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/trustpilot/business", options);
  }

  /**
   * One page of 20 Trustpilot reviews for a business, filtered by stars,
   * language, date range, topics, text search, verified-only and
   * with-replies, sorted by recency or relevance. Returns total_filtered, so a
   * date range doubles as review velocity. Up to 10 pages (200 reviews) per
   * filter combination. Pass exactly one of domain or url.
   *
   * Costs 2 credits.
   */
  async reviews(options: TrustpilotReviewsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/trustpilot/reviews", options);
  }

  /**
   * The full Trustpilot category tree (top-level categories and their
   * subcategories), or categories matching a name. Every category_id works
   * with category().
   *
   * Costs 2 credits.
   */
  async categories(options: TrustpilotCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/trustpilot/categories", options);
  }

  /**
   * Businesses ranked in a Trustpilot category for one country, with
   * TrustScore, review count, location, website, email and phone. Sort by
   * relevance, review count or latest review, set a minimum star rating, or
   * keep claimed profiles only. 20 per page.
   *
   * Costs 2 credits.
   */
  async category(options: TrustpilotCategoryOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/trustpilot/category", options);
  }

  /**
   * One Trustpilot review by id: rating, title, full text, dates,
   * verification, the reviewer's public profile summary, the business reply,
   * and the business it is about.
   *
   * Costs 2 credits.
   */
  async review(options: TrustpilotReviewOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/trustpilot/review", options);
  }
}
