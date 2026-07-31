import type { Scavio } from "../client.js";

// The provider retired the `linkedin/web/*` namespace these were built on. Live
// endpoints now run on `web_v2`, which is URL-native: public params are
// unchanged (the permalink is built server-side) and `url` is accepted
// everywhere as a direct alternative. Params web_v2 has no equivalent for (the
// include_* flags, the member urn) are gone. Pagination is back as of the
// provider's 2026-07-31 release: list endpoints take an opaque `cursor` and
// return `next_cursor`, and personPosts gained a `type` feed selector.
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

export interface LinkedInPersonPostsRequest extends LinkedInPersonOptions {
  /** Which feed: the member's own posts (default), posts they commented on, or posts they reacted to. */
  type?: "posts" | "comments" | "reactions";
  /** Opaque cursor from a previous response's next_cursor. */
  cursor?: string;
}

/** A company reference: a universal name (slug), or a full company URL. */
export interface LinkedInCompanyOptions {
  /** Company universal name (slug), e.g. "microsoft". */
  company?: string;
  /** Full LinkedIn company URL, as an alternative to company. */
  url?: string;
  [key: string]: unknown;
}

export interface LinkedInCompanyPostsRequest extends LinkedInCompanyOptions {
  /** Opaque cursor from a previous response's next_cursor. */
  cursor?: string;
}

// The person/company option shapes were reworked when the urn and count params
// lost their upstream. These aliases keep the old type names importable so
// existing TypeScript code still compiles.
/** @deprecated Use {@link LinkedInPersonOptions}. */
export type LinkedInPersonRefOptions = LinkedInPersonOptions;
/** @deprecated Use {@link LinkedInPersonPostsRequest}. */
export type LinkedInPersonPostsOptions = LinkedInPersonPostsRequest;
/** @deprecated Use {@link LinkedInCompanyPostsRequest}. */
export type LinkedInCompanyPostsOptions = LinkedInCompanyPostsRequest;

export interface LinkedInSearchJobsOptions {
  /** Search keyword. */
  search: string;
  /** Geographic filter; omit to search everywhere. */
  location?: string;
  /** Opaque cursor from a previous response's next_cursor. */
  cursor?: string;
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
  /** 1-based page number. Page size varies, so page until a page comes back empty. */
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

  /**
   * A member's posts, or the posts they commented on or reacted to via `type`.
   * 50 per page; pass the previous response's `next_cursor` to advance.
   */
  async personPosts(
    options: LinkedInPersonPostsRequest,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/person/posts", options);
  }

  /** Company profile, including locations and featured employees. */
  async company(
    options: LinkedInCompanyOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/company", options);
  }

  /** Recent company posts, 50 per page; advance with `next_cursor`. */
  async companyPosts(
    options: LinkedInCompanyPostsRequest,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/company/posts", options);
  }

  /**
   * Job search, 25 per page; advance with `next_cursor`. Upstream rotates its
   * result set, so pages overlap slightly - dedupe by job id.
   */
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

  /** Comments with their replies. Page size varies - keep paging until empty. */
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
