import type { Scavio } from "../client.js";

// Indeed is 2 credits flat on all four endpoints.
//
// `radius` and `max_age_days` are CLOSED sets. Indeed IGNORES any other value
// and answers the unfiltered set, so a request for a 7-mile radius is billed
// as a search covering fifty. The unions here are the whole accepted
// vocabulary: radius 0/5/10/15/25/35/50/100 (upstream default 50) and
// max_age_days 1/3/7/14.
//
// `min_salary` filters on INDEED'S OWN ESTIMATE for the role, not a posted
// figure, so postings that publish no salary at all still match.
//
// A location-only search - no `query` - is valid and returns every posting in
// a metro.
//
// Search is 10 postings per page; company reviews are 20 per page. An unknown
// job key or company slug is a real 404 that scrape.do BILLS.

export interface IndeedSearchOptions {
  /**
   * Search keywords, 1-500 characters. Optional: either `query` or `location`
   * must be present.
   */
  query?: string;
  /**
   * City+state, postal code, state, country or "Remote", 1-200 characters.
   * Usable with NO `query` at all - that returns every posting in the metro.
   */
  location?: string;
  /** Result page, 1-indexed. 10 postings per page. */
  page?: number;
  /**
   * Search radius in miles. A CLOSED set (upstream default 50) - Indeed
   * ignores anything else and bills a wider search than you asked for.
   */
  radius?: 0 | 5 | 10 | 15 | 25 | 35 | 50 | 100;
  /**
   * Maximum posting age in days. A CLOSED set - Indeed ignores anything else
   * and returns the unfiltered set.
   */
  max_age_days?: 1 | 3 | 7 | 14;
  /** Employment type filter. */
  job_type?: "full_time" | "part_time" | "contract" | "temporary" | "internship";
  /**
   * Minimum salary. Filters on INDEED'S OWN ESTIMATE for the role, not a
   * posted figure, so postings publishing no salary still match.
   */
  min_salary?: number;
  /** Remote postings only. */
  remote?: boolean;
  [key: string]: unknown;
}

export interface IndeedJobOptions {
  /**
   * 16-hex Indeed job key, or any indeed.com URL carrying jk= (/viewjob,
   * /rc/clk, /pagead/clk).
   */
  job_id: string;
  [key: string]: unknown;
}

export interface IndeedCompanyOptions {
  /**
   * indeed.com/cmp/<slug> slug or a full profile URL, 1-200 characters. Slugs
   * are untidy - e.g. "Tata-Consultancy-Services-(tcs)".
   */
  company: string;
  [key: string]: unknown;
}

export interface IndeedCompanyReviewsOptions {
  /**
   * indeed.com/cmp/<slug> slug or a full profile URL, 1-200 characters.
   */
  company: string;
  /** Result page, 1-indexed. 20 reviews per page. */
  page?: number;
  [key: string]: unknown;
}

export class IndeedNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Indeed job postings: title, employer, rating, location, salary
   * range, job type, benefits, posting age and apply route.
   *
   * Either `query` or `location` is required; a location-only search is valid
   * and returns every posting in the metro.
   *
   * Paged with `page`, 10 postings per page. `radius` and `max_age_days` are
   * closed sets - Indeed silently ignores an off-list value and bills the
   * unfiltered search. `min_salary` filters on Indeed's own ESTIMATE for the
   * role, not a posted figure.
   *
   * Costs 2 credits.
   */
  async search(
    options: IndeedSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/indeed/search", options);
  }

  /**
   * One Indeed posting in full: description text and HTML, structured salary,
   * employment types, benefits, geocoded address, employer rating, applicant
   * count and the original ATS link.
   *
   * Single response, no pagination. An unknown job key is a real 404 that
   * scrape.do BILLS - take `job_id` from a search row.
   *
   * Costs 2 credits.
   */
  async job(
    options: IndeedJobOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/indeed/job", options);
  }

  /**
   * Indeed employer profile: description, industry, HQ, size, revenue, CEO
   * approval, overall and per-category ratings, reported salaries, open roles
   * and locations.
   *
   * Single response, no pagination. An unknown company slug is a real 404
   * that scrape.do BILLS.
   *
   * Costs 2 credits.
   */
  async company(
    options: IndeedCompanyOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/indeed/company", options);
  }

  /**
   * Indeed employee reviews with per-category ratings, pros/cons, reviewer
   * job title and location, plus aggregated sentiment and topic / location /
   * job-title breakdowns.
   *
   * Paged with `page`, 20 reviews per page.
   *
   * Costs 2 credits.
   */
  async companyReviews(
    options: IndeedCompanyReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/indeed/company/reviews", options);
  }
}
