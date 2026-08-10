import type { Scavio } from "../client.js";

// Glassdoor is 1 credit flat on all four endpoints.
//
// START WITH companies(). company(), reviews() and salaries() all address an
// employer_id that exists only inside Glassdoor's /Overview/ URLs, and
// companies() is the only way to get one from a company name.
//
// THEN CHAIN ON `url`. company() returns reviews_url and salaries_url; passing
// those back as `url` halves the upstream work, because addressing reviews or
// salaries by employer_id costs two upstream fetches (the /Reviews/ and
// /Salary/ slugs are case-sensitive and have to be read off the profile
// first). The customer price is 1 credit either way.
//
// reviews() IS CAPPED AT THREE REVIEWS per response by Glassdoor's login wall.
// There is deliberately no `page` param - move the window with `category` and
// `employment_status`, and read filtered_review_count to see how many match.
//
// `category` and `employment_status` are CLOSED enums because Glassdoor
// ignores an unknown filter value and serves the unfiltered set under a 200.
//
// SLOW AND FLAKY: this domain needs a rendered fetch and the pool is degraded.
// Per-call success is ~87%. Typical wall time is ~3-47s for company, ~75s for
// reviews and ~41s for salaries, and a call that fails outright can take ~172s
// before its 502. Raise the client `timeout` before using this namespace.

export interface GlassdoorCompaniesOptions {
  /** Company name to resolve (1-120 characters). */
  query: string;
  [key: string]: unknown;
}

export interface GlassdoorCompanyOptions {
  /**
   * Glassdoor employer id. MUST BE A STRING - a JSON number is rejected.
   * Accepts 1699, E1699 or IE1699. Either this or `url` is required.
   */
  employer_id?: string;
  /**
   * Company name (1-200 characters). COSMETIC ONLY: the profile resolves on
   * employer_id alone, this is ignored entirely when `url` is set, and it does
   * NOT satisfy the employer_id-or-url requirement.
   */
  company?: string;
  /**
   * Any glassdoor.com employer URL (/Overview/, /Reviews/ or /Salary/).
   * Non-glassdoor.com hosts are rejected. Either this or `employer_id` is
   * required.
   */
  url?: string;
  [key: string]: unknown;
}

export interface GlassdoorReviewsOptions {
  /**
   * Glassdoor employer id as a STRING (1699, E1699 or IE1699). Either this or
   * `url` is required. Addressing by employer_id costs two upstream fetches -
   * pass reviews_url from company() as `url` instead.
   */
  employer_id?: string;
  /** Company name (1-200 characters). Cosmetic; does not satisfy the identifier requirement. */
  company?: string;
  /**
   * Pass back the reviews_url that company() returned to skip the resolve
   * fetch. Either this or `employer_id` is required.
   */
  url?: string;
  /**
   * Restrict to reviews about one axis. Closed set - Glassdoor ignores an
   * unknown value and returns the UNFILTERED set under a 200.
   */
  category?:
    | "career_development"
    | "compensation"
    | "culture"
    | "diversity_and_inclusion"
    | "management"
    | "work_life_balance";
  /**
   * Restrict to reviewers of one employment type. Closed set - an unknown
   * value is silently unfiltered. FREELANCE is absent because it was never
   * confirmed to change the result set.
   */
  employment_status?: "full_time" | "part_time" | "contract" | "intern";
  [key: string]: unknown;
}

export interface GlassdoorSalariesOptions {
  /**
   * Glassdoor employer id as a STRING (1699, E1699 or IE1699). Either this or
   * `url` is required. Addressing by employer_id costs two upstream fetches -
   * pass salaries_url from company() as `url` instead.
   */
  employer_id?: string;
  /** Company name (1-200 characters). Cosmetic; does not satisfy the identifier requirement. */
  company?: string;
  /**
   * Pass back the salaries_url that company() returned to skip the resolve
   * fetch. Either this or `employer_id` is required.
   */
  url?: string;
  /**
   * Result page, 1-indexed. 10 job titles per page; `page_count` on the
   * response is how many pages exist.
   */
  page?: number;
  [key: string]: unknown;
}

export class GlassdoorNamespace {
  constructor(private client: Scavio) {}

  /**
   * START HERE. Search Glassdoor for a company by NAME and resolve it to the
   * employer_id every other method needs, ranked by Glassdoor and
   * de-duplicated.
   *
   * company(), reviews() and salaries() all key off an employer_id that exists
   * only inside Glassdoor's /Overview/ URLs, so this lookup is the entry
   * point.
   *
   * Costs 1 credit. Single response, no pagination.
   */
  async companies(
    options: GlassdoorCompaniesOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/glassdoor/companies", options);
  }

  /**
   * Employer profile: description, mission, industry, sector, HQ, size band,
   * revenue band, stock symbol, year founded, overall and per-category
   * ratings, star distribution, CEO approval, awards, FAQ, the five
   * server-rendered reviews, AND reviews_url / salaries_url.
   *
   * THE CHAINING ENDPOINT: pass reviews_url / salaries_url back as `url` on
   * reviews() and salaries() to halve the upstream fetches. `employer_id` or
   * `url` is required - `company` is cosmetic and does not satisfy it.
   *
   * Costs 1 credit. Single response, no pagination. Typically ~3-47s.
   */
  async company(
    options: GlassdoorCompanyOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/glassdoor/company", options);
  }

  /**
   * Full reviews with per-axis scores, pros, cons, advice, job title,
   * location, employment status and employer response - plus complete rating
   * statistics, star distribution, aggregate pro/con highlight terms and
   * per-job-title review counts.
   *
   * HARD CAP OF THREE REVIEW BODIES per response: that is Glassdoor's login
   * wall, not a limit option. There is deliberately NO `page` param. Move the
   * window with `category` and `employment_status` and read
   * filtered_review_count to see how many match; the aggregate statistics are
   * the full-population signal here, not the bodies.
   *
   * `employer_id` or `url` is required. Costs 1 credit. Typically ~75s.
   */
  async reviews(
    options: GlassdoorReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/glassdoor/reviews", options);
  }

  /**
   * Salaries by job title: base-pay and total-pay percentiles P10-P90 with
   * medians called out, sample counts, currency, pay period and last-reported
   * date.
   *
   * These are Glassdoor's ESTIMATES for the title, not individual reported
   * salaries. Paged with `page` at 10 job titles per page; `page_count` on the
   * response is how many pages exist.
   *
   * `employer_id` or `url` is required. Costs 1 credit. Typically ~41s.
   */
  async salaries(
    options: GlassdoorSalariesOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/glassdoor/salaries", options);
  }
}
