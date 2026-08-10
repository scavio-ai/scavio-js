import type { Scavio } from "../client.js";

// Capterra, the B2B software review site. 2 credits flat on all three
// endpoints (a premium per-domain upstream table).
//
// SEARCH DOES NOT PAGINATE. Capterra fixes the result set at 20 and ?page=2
// returns identical rows, so there is deliberately NO page param on search().
//
// `slug` behaves differently on the two product-keyed endpoints: it is
// COSMETIC on product() (/p/186596/Zzzjunk/ returns Notion's profile
// byte-for-byte) but LOAD-BEARING on reviews(), where it is case-sensitive
// upstream and a wrong one silently serves PAGE ONE under a billed 200. Pass
// back the `slug` or `reviews_url` you got from search() or product().
//
// `product_id` must be a STRING everywhere - a JSON number is rejected.

export interface CapterraSearchOptions {
  /**
   * Search term (1-200 characters). Required unless `url` is given: a
   * term-less search serves a fixed popular-products list that has nothing to
   * do with the caller.
   */
  query?: string;
  /**
   * Full capterra.com search URL, as an alternative to `query`. The host is
   * checked by the transport, which also covers capterra.co.uk and
   * capterra.com.br.
   */
  url?: string;
  [key: string]: unknown;
}

export interface CapterraProductOptions {
  /**
   * The number in /p/186596/Notion/, AS A STRING - a JSON number is rejected.
   * Required unless `url` is given.
   */
  product_id?: string;
  /** Product slug. COSMETIC on this endpoint - any value returns the same profile. */
  slug?: string;
  /** Full capterra.com product URL, as an alternative to `product_id`. */
  url?: string;
  [key: string]: unknown;
}

export interface CapterraReviewsOptions {
  /**
   * The number in /p/186596/Notion/, as a string. Required unless `url` is
   * given.
   */
  product_id?: string;
  /**
   * Product slug. LOAD-BEARING here, unlike on product(): it is case-sensitive
   * upstream and a wrong one silently serves PAGE ONE under a billed 200.
   * Pass back the slug from search() or product().
   */
  slug?: string;
  /**
   * Full capterra.com reviews URL. Passing back `reviews_url` from product()
   * is the reliable way to page.
   */
  url?: string;
  /**
   * Result page, 1-100. 25 reviews per page. There is no page past 100
   * whatever the review count says.
   */
  page?: number;
  [key: string]: unknown;
}

export class CapterraNamespace {
  constructor(private client: Scavio) {}

  /**
   * 20 ranked Capterra software products: name, vendor description, rating,
   * review count, logo and the paid-placement flag. Every row carries
   * `product_id` and `slug` to feed product() and reviews().
   *
   * NO PAGINATION. Capterra fixes the result set at 20 and page 2 returns the
   * identical rows, so there is deliberately no page param - narrow the query
   * instead.
   *
   * Pass `query` or `url`.
   *
   * Costs 2 credits.
   */
  async search(
    options: CapterraSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/capterra/search", options);
  }

  /**
   * A full Capterra profile: rating with per-star histogram and the four
   * scored criteria, likelihood to recommend, review sentiment and topics, the
   * complete pricing table with every plan and its features, every rated
   * feature, every integration, AI-derived pros and cons with the quoted
   * review, FAQs, screenshots, badges and awards, competitor comparisons and
   * alternatives, and the buyer profile by company size / industry / job
   * function - PLUS the 25 most recent reviews, which ride along at no extra
   * cost.
   *
   * `vendor` IS ALWAYS NULL here: Capterra does not publish it as structured
   * data on the product page. The reviews name the vendor per review.
   *
   * Pass `product_id` (a string) or `url`. `slug` is cosmetic on this
   * endpoint.
   *
   * Costs 2 credits. Single response, no pagination.
   */
  async product(
    options: CapterraProductOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/capterra/product", options);
  }

  /**
   * A page of Capterra reviews: overall score plus five per-criterion scores,
   * title, pros, cons, advice, usage duration, incentivized flag, alternatives
   * considered and what the reviewer switched from, reviewer job title /
   * industry / company size, and the vendor response - plus a richer
   * competitor list than the profile carries, each alternative with its own
   * rating histogram and starting price.
   *
   * 25 reviews per page, CAPPED AT PAGE 100. Past it Capterra answers 200 with
   * PAGE ONE and the page quietly dropped from the canonical, so nothing
   * signals the cap but repeated rows. Page 1 is already inside product(), so
   * use this to page past it.
   *
   * Pass `product_id` or `url`. `slug` is load-bearing here and case-sensitive
   * upstream - a wrong one silently serves page one.
   *
   * Costs 2 credits.
   */
  async reviews(
    options: CapterraReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/capterra/reviews", options);
  }
}
