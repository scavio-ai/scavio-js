import type { Scavio } from "../client.js";

export interface LinkedInPersonOptions {
  /** Public identifier (vanity handle). */
  username: string;
  /** Include the experiences section (default true server-side). */
  include_experiences?: boolean;
  /** Include the educations section (default true server-side). */
  include_educations?: boolean;
  /** Include the skills section (default true server-side). */
  include_skills?: boolean;
  /** Include the certifications section (default true server-side). */
  include_certifications?: boolean;
  /** Include follower and connection counts (default true server-side). */
  include_follower_and_connection?: boolean;
  [key: string]: unknown;
}

export interface LinkedInPersonRefOptions {
  /** Member urn. */
  urn?: string;
  /** Public identifier; resolved to a urn if urn is omitted. */
  username?: string;
  [key: string]: unknown;
}

export interface LinkedInPersonPostsOptions {
  /** Member urn. */
  urn?: string;
  /** Public identifier; resolved to a urn if urn is omitted. */
  username?: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface LinkedInPersonContactOptions {
  /** Public identifier (vanity handle). */
  username: string;
  [key: string]: unknown;
}

export interface LinkedInCompanyOptions {
  /** Company universal name (slug) or LinkedIn company URL. */
  company: string;
  [key: string]: unknown;
}

export interface LinkedInCompanyPostsOptions {
  /** Company universal name (slug) or LinkedIn company URL. */
  company: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  /** Results per page (1-100). */
  count?: number;
  [key: string]: unknown;
}

export interface LinkedInCompanyRefOptions {
  /** Numeric company id. */
  company_id?: string;
  /** Company slug/url; resolved to a company_id if company_id is omitted. */
  company?: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface LinkedInSearchPeopleOptions {
  /** Name to search for. */
  search?: string;
  /** Job title filter. */
  title?: string;
  /** Company filter. */
  company?: string;
  /** School filter. */
  school?: string;
  /** A geo name or id to filter by. */
  location?: string;
  /** Page cursor (page number). */
  cursor?: string;
  [key: string]: unknown;
}

export interface LinkedInSearchJobsOptions {
  /** Search query (1-500 characters). */
  search: string;
  /** Page cursor (page number). */
  cursor?: string;
  /** Date-posted filter. */
  date_posted?: string;
  /** Geo code to filter by. */
  geocode?: string;
  /** Experience level filter. */
  experience_level?: string;
  /** Remote filter. */
  remote?: string;
  /** Job type filter. */
  job_type?: string;
  [key: string]: unknown;
}

export interface LinkedInSearchPostsOptions {
  /** Search query (1-500 characters). */
  search: string;
  /** Page cursor (page number). */
  cursor?: string;
  /** Date-posted filter. */
  date_posted?: string;
  /** Sort order. */
  sort_by?: string;
  /** Content type filter. */
  content_type?: string;
  [key: string]: unknown;
}

export interface LinkedInJobOptions {
  /** Job listing id. */
  job_id: string;
  /** Include the required-skills section. */
  include_skills?: boolean;
  [key: string]: unknown;
}

export interface LinkedInPostOptions {
  /** Post id or activity urn. */
  post_id: string;
  [key: string]: unknown;
}

export interface LinkedInPostCommentsOptions {
  /** Post id or activity urn. */
  post_id: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  /** Comment sort order. */
  sort_order?: "relevance" | "recent";
  /** Post type. */
  post_type?: "activity" | "ugc";
  [key: string]: unknown;
}

export class LinkedInNamespace {
  constructor(private client: Scavio) {}

  async person(
    options: LinkedInPersonOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/person", options);
  }

  async personAbout(
    options: LinkedInPersonRefOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/person/about", options);
  }

  async personPosts(
    options: LinkedInPersonPostsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/person/posts", options);
  }

  async personContact(
    options: LinkedInPersonContactOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/person/contact", options);
  }

  async company(
    options: LinkedInCompanyOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/company", options);
  }

  async companyPosts(
    options: LinkedInCompanyPostsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/company/posts", options);
  }

  async companyPeople(
    options: LinkedInCompanyRefOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/company/people", options);
  }

  async companyJobs(
    options: LinkedInCompanyRefOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/company/jobs", options);
  }

  async searchPeople(
    options: LinkedInSearchPeopleOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/search/people", options);
  }

  async searchJobs(
    options: LinkedInSearchJobsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/search/jobs", options);
  }

  async searchPosts(
    options: LinkedInSearchPostsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/search/posts", options);
  }

  async job(
    options: LinkedInJobOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/job", options);
  }

  async post(
    options: LinkedInPostOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/post", options);
  }

  async postComments(
    options: LinkedInPostCommentsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/linkedin/post/comments", options);
  }
}
