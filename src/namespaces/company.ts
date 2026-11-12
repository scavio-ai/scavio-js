import type { Scavio } from "../client.js";

// Company: 1 endpoint, POST /api/v1/company/enrich. 10 credits from a url, 20
// from a place_id (1 when the Maps listing has no readable website). A website
// that cannot be reached is a free 502; 400s are free. Calls take 10-45s
// (median about 23s; slow sites measured 101-125s), so enrich() raises the
// request timeout to COMPANY_ENRICH_TIMEOUT when the client's is shorter.

/** Minimum request timeout (ms) for company.enrich(). */
export const COMPANY_ENRICH_TIMEOUT = 180_000;

export interface CompanyEnrichOptions {
  /**
   * The company's own website (3-2048 characters); a bare domain works.
   * Social profile URLs (Facebook, Instagram, LinkedIn...) are a 400. Pass
   * this or place_id; when both are sent, url is the site that gets read.
   */
  url?: string;
  /**
   * A Google Maps place_id (10-300 characters), as returned by
   * google.mapsSearch() in `local_results[].place_id`. The listing is looked up
   * first (name, address, phone, website), then its website is read.
   */
  place_id?: string;
  [key: string]: unknown;
}

/** Social networks enrich() reports; only the ones found are present. */
export type CompanySocialNetwork =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "x"
  | "tiktok"
  | "youtube"
  | "pinterest";

export interface CompanyEnrichCompany {
  name: string | null;
  website: string | null;
  domain: string | null;
  /** Emails published on the site, company-domain addresses first. */
  emails: string[];
  /** Digits only. */
  phones: string[];
  socials: Partial<Record<CompanySocialNetwork, string>>;
  contact_page: string | null;
  /** From the Maps listing; null on url calls. */
  address: string | null;
  /** The place_id sent; null on url calls. */
  place_id: string | null;
}

export interface CompanyEnrichOwner {
  name: string;
  title: string;
  /** The page that names the owner. */
  source_url: string;
  /** Set only when an address on the site matches the owner's name. */
  email: string | null;
  email_status: "published" | "not_found";
}

/** The `data` object of an enrich() response. */
export interface CompanyEnrichData {
  company: CompanyEnrichCompany;
  /** null when no page names an owner. */
  owner: CompanyEnrichOwner | null;
  /** Home page, up to 3 contact/about/team pages, privacy and terms. */
  pages_read: string[];
}

export interface CompanyEnrichResponse {
  data: CompanyEnrichData;
  response_time: number;
  fetched_at: string;
  credits_used: number;
  credits_remaining: number;
  [key: string]: unknown;
}

export class CompanyNamespace {
  constructor(private client: Scavio) {}

  /**
   * Find a company's contact details and its owner from its website or a
   * Google Maps place_id: published emails, phone numbers, social profiles
   * and contact page, plus the owner's name and title with the page that
   * names them. Use after a Google Maps search: pass each result's place_id.
   *
   * Costs 10 credits from a url, 20 from a place_id (1 when the listing has no
   * readable website); unreachable sites (502) and 400s are free. Usually 10-45s, about 2 minutes on a slow site,
   * so the request timeout is raised to at least COMPANY_ENRICH_TIMEOUT (180s)
   * for this call only; a longer client timeout is kept.
   */
  async enrich(options: CompanyEnrichOptions): Promise<CompanyEnrichResponse> {
    return (await this.client._post(
      "/api/v1/company/enrich",
      options,
      undefined,
      COMPANY_ENRICH_TIMEOUT,
    )) as unknown as CompanyEnrichResponse;
  }
}
