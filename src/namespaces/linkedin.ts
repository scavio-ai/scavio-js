import type { Scavio } from "../client.js";

// The provider retired the `linkedin/web/*` namespace these were built on. Live
// endpoints now run on `web_v2`, which is URL-native: public params are
// unchanged (the permalink is built server-side) and `url` is accepted
// everywhere as a direct alternative. Params web_v2 has no equivalent for (the
// include_* flags, feed cursors, the member urn) are gone.
//
// Five endpoints have no upstream left and always return HTTP 410 unbilled:
// personContact, companyPeople, companyJobs, searchPeople, searchPosts. They are
// kept so existing code fails loudly rather than with a TypeError.

/** A member reference: a vanity handle, or a full profile URL. */
export interface LinkedInPersonOptions {
  /** Public identifier (vanity handle), e.g. "williamhgates". */
  username?: string;
  /** Full LinkedIn profile URL, as an alternative to username. */
  url?: string;
  [key: string]: unknown;
}

/** A company reference: a universal name (slug), or a full company URL. */
export interface LinkedInCompanyOptions {
  /** Company universal name (slug), e.g. "microsoft". */
  company?: string;
  /** Full LinkedIn company URL, as an alternative to company. */
  url?: string;
  [key: string]: unknown;
}

// The person/company option shapes collapsed into one apiece when the urn,
// cursor and count params lost their upstream. These aliases keep the old type
// names importable so existing TypeScript code still compiles.
/** @deprecated Use {@link LinkedInPersonOptions}. */
export type LinkedInPersonRefOptions = LinkedInPersonOptions;
/** @deprecated Use {@link LinkedInPersonOptions}. */
export type LinkedInPersonPostsOptions = LinkedInPersonOptions;
/** @deprecated Use {@link LinkedInCompanyOptions}. */
export type LinkedInCompanyPostsOptions = LinkedInCompanyOptions;

export interface LinkedInSearchJobsOptions {
  /** Search keyword. */
  search: string;
  /** Geographic filter; omit to search everywhere. */
  location?: string;
  [key: string]: unknown;
}

export interface LinkedInJobOptions {
  /** Job listing id. */
  job_id?: string;
  /** Full LinkedIn job URL, as an alternative to job_id. */
  url?: string;
  [key: string]: unknown;
}

export interface LinkedInPostOptions {
  /** Post id or activity urn. */
  post_id?: string;
  /** Full LinkedIn post URL, as an alternative to post_id. */
  url?: string;
  [key: string]: unknown;
}

export interface LinkedInPostCommentsOptions extends LinkedInPostOptions {
  /** 1-based page number, 10 comments per page. */
  page?: number;
}

/** @deprecated Retired upstream; always returns HTTP 410. */
export interface LinkedInPersonContactOptions {
  username?: string;
  [key: string]: unknown;
}

/** @deprecated Retired upstream; always returns HTTP 410. */
export interface LinkedInCompanyRefOptions {
  company_id?: string;
  company?: string;
  [key: string]: unknown;
}

/** @deprecated Retired upstream; always returns HTTP 410. */
export interface LinkedInSearchPeopleOptions {
  search?: string;
  title?: string;
  company?: string;
  school?: string;
  location?: string;
  [key: string]: unknown;
}

/** @deprecated Retired upstream; always returns HTTP 410. */
export interface LinkedInSearchPostsOptions {
  search?: string;
  [key: string]: unknown;
}

export class LinkedInNamespace {
  constructor(private client: Scavio) {}

  /** Full profile: about text, experience, education, honours and links. */
  async person(
    options: LinkedInPersonOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/person", options);
  }

  /** The about-only slice of the profile payload. */
  async personAbout(
    options: LinkedInPersonOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/person/about", options);
  }

  /** Recent posts, up to 50. Upstream exposes no further pages. */
  async personPosts(
    options: LinkedInPersonOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/person/posts", options);
  }

  /** Company profile, including locations and featured employees. */
  async company(
    options: LinkedInCompanyOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/company", options);
  }

  /** Recent company posts, up to 50. Upstream exposes no further pages. */
  async companyPosts(
    options: LinkedInCompanyOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/company/posts", options);
  }

  /** Job search. Upstream rotates its result set, so repeat calls differ. */
  async searchJobs(
    options: LinkedInSearchJobsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/search/jobs", options);
  }

  /** Full detail for one job listing, including the hiring company. */
  async job(
    options: LinkedInJobOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/job", options);
  }

  /** Full detail for one post, including its top visible comments. */
  async post(
    options: LinkedInPostOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/post", options);
  }

  /** Comments with their replies, 10 per page. */
  async postComments(
    options: LinkedInPostCommentsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/post/comments", options);
  }

  /**
   * @deprecated Retired by the upstream provider. Always returns HTTP 410 and is
   * never billed.
   */
  async personContact(
    options: LinkedInPersonContactOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/person/contact", options);
  }

  /**
   * @deprecated Retired by the upstream provider. Always returns HTTP 410 and is
   * never billed. `company()` returns `featured_employees`, a small sample of
   * staff profiles.
   */
  async companyPeople(
    options: LinkedInCompanyRefOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/company/people", options);
  }

  /**
   * @deprecated Retired by the upstream provider. Always returns HTTP 410 and is
   * never billed. Use `searchJobs()` with the company name as the search term.
   */
  async companyJobs(
    options: LinkedInCompanyRefOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/company/jobs", options);
  }

  /**
   * @deprecated Retired by the upstream provider. Always returns HTTP 410 and is
   * never billed.
   */
  async searchPeople(
    options: LinkedInSearchPeopleOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/search/people", options);
  }

  /**
   * @deprecated Retired by the upstream provider. Always returns HTTP 410 and is
   * never billed.
   */
  async searchPosts(
    options: LinkedInSearchPostsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/search/posts", options);
  }
}
