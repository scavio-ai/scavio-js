import type { Scavio } from "../client.js";

// Reclame Aqui (reclameaqui.com.br, Brazil's consumer complaint and company reputation site)
// companySearch, company, complaints, complaint, complaintSearch, rankings, segments and
// segmentRanking endpoints; Brazil, Portuguese text as published, consumer names removed, 1 credit
// each (complaints by shortname 2). Generated from the backend routes: every option and its doc
// mirrors the API's own request schema; an input the API only accepts to refuse (a 400 that says
// 'not offered') is left out. The server enforces the value rules and the one-of rules (send one of
// an id or a link). Every call raises the request timeout to RECLAMEAQUI_TIMEOUT and never lowers a
// longer client timeout. Failed upstream calls and refused inputs are not charged; a not-found is
// charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every reclameaqui call. */
export const RECLAMEAQUI_TIMEOUT = 240_000;

export interface ReclameaquiCompanySearchOptions {
  /** Company name or brand. */
  query: string;
  [key: string]: unknown;
}

export interface ReclameaquiCompanyOptions {
  /**
   * A company shortname (shortname of company_search; the part after /empresa/ in a
   * reclameaqui.com.br link).
   */
  shortname?: string;
  /** A reclameaqui.com.br/empresa/<shortname>/ link instead of shortname. */
  url?: string;
  [key: string]: unknown;
}

export interface ReclameaquiComplaintsOptions {
  /** The company id (id of company_search or company). 1 credit. */
  company_id?: string;
  /** The company shortname instead of company_id: looked up first, 2 credits. */
  shortname?: string;
  /**
   * latest (default, every complaint), unanswered, answered (answered, not yet evaluated),
   * evaluated, resolved or not_resolved (as the consumer evaluated it): the site's complaint tabs.
   */
  status?: "latest" | "unanswered" | "answered" | "evaluated" | "resolved" | "not_resolved";
  /**
   * Only complaints with this category: an id from filters.categories of an answer (e.g.
   * 0000000000000003).
   */
  category?: string;
  /**
   * Only complaints with this product: an id from filters.products of an answer (e.g.
   * 0000000000000003).
   */
  product?: string;
  /**
   * Only complaints with this problem: an id from filters.problems of an answer (e.g.
   * 0000000000000003).
   */
  problem?: string;
  /** Only complaints the consumer marked as Black Friday purchases. */
  black_friday?: boolean;
  /** Only complaints of this company that match these words. */
  query?: string;
  /**
   * Page, 1-based (default 1). Reclame Aqui serves up to offset 500 per filter combination: page 51
   * at 10 per page, page 101 at 5. A later page is refused before any call.
   */
  page?: number;
  /** Complaints per page: 5 or 10 (default 10), the two sizes Reclame Aqui serves. */
  page_size?: 5 | 10;
  [key: string]: unknown;
}

export interface ReclameaquiComplaintOptions {
  /** A complaint link (url of a complaints answer). */
  url?: string;
  /** The company shortname, with complaint_id, instead of url. */
  company?: string;
  /** The 16-character complaint id (id of a complaints answer), with company. */
  complaint_id?: string;
  [key: string]: unknown;
}

export interface ReclameaquiComplaintSearchOptions {
  /** Words to find in complaints across every company. */
  query: string;
  /**
   * Page, 1-based (default 1). Reclame Aqui serves up to offset 500 per filter combination: page 51
   * at 10 per page, page 101 at 5. A later page is refused before any call.
   */
  page?: number;
  /** Complaints per page: 5 or 10 (default 10), the two sizes Reclame Aqui serves. */
  page_size?: 5 | 10;
  [key: string]: unknown;
}

export interface ReclameaquiRankingsOptions {
  /**
   * One of the site's 11 ranking lists (best_resolution_rate, would_do_business_again, best_rating,
   * most_resolved_30_days, most_resolved_6_months, most_complained_yesterday,
   * most_complained_7_days, most_complained_30_days, most_complained_6_months, worst,
   * newly_registered). Leave out for all 11.
   */
  list?: "best_resolution_rate" | "would_do_business_again" | "best_rating" | "most_resolved_30_days" | "most_resolved_6_months" | "most_complained_yesterday" | "most_complained_7_days" | "most_complained_30_days" | "most_complained_6_months" | "worst" | "newly_registered";
  [key: string]: unknown;
}

export interface ReclameaquiSegmentsOptions {
  [key: string]: unknown;
}

export interface ReclameaquiSegmentRankingOptions {
  /** Main segment shortname (main_segment of the segments endpoint). */
  main_segment?: string;
  /** Segment shortname (segment of the segments endpoint). */
  segment?: string;
  /** A reclameaqui.com.br/segmentos/<main>/<segment>/ link instead. */
  url?: string;
  /** Page of the best list, 10 per page (default 1). Page 1 also carries the 10 worst. */
  page?: number;
  [key: string]: unknown;
}

export class ReclameaquiNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = RECLAMEAQUI_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/reclameaqui/${path}`, options, undefined, timeout);
  }

  /**
   * Find companies on Reclame Aqui (reclameaqui.com.br, Brazil's company complaint and reputation
   * site). Scavio fetches the public page on request. Reclame Aqui's own API (RA API / Hugme) is
   * paid and covers only a company's own complaints. The site's own company search (about 7
   * matches, no paging). Costs 1 credit.
   */
  async companySearch(options: ReclameaquiCompanySearchOptions): Promise<Record<string, unknown>> {
    return this.post("company-search", options);
  }

  /**
   * One company's reputation on Reclame Aqui (reclameaqui.com.br, Brazil's company complaint and
   * reputation site). Scavio fetches the public page on request. Reclame Aqui's own API (RA API /
   * Hugme) is paid and covers only a company's own complaints. By shortname or url. Costs 1 credit.
   */
  async company(options: ReclameaquiCompanyOptions): Promise<Record<string, unknown>> {
    return this.post("company", options);
  }

  /**
   * One company's complaints on Reclame Aqui (reclameaqui.com.br, Brazil's company complaint and
   * reputation site), newest first (the site has no other order), with the site's tabs (status),
   * category / product / problem filters, Black Friday purchases and a keyword inside the company.
   * 5 or 10 per page, up to 51 pages of 10 per filter combination, with the exact total. Costs 1
   * credit by company_id; 2 by shortname (the company id is looked up first; 3 when the company
   * page is read too). credits_used in the response is the exact charge.
   */
  async complaints(options: ReclameaquiComplaintsOptions): Promise<Record<string, unknown>> {
    return this.post("complaints", options);
  }

  /**
   * One complaint on Reclame Aqui (reclameaqui.com.br, Brazil's company complaint and reputation
   * site) with its whole thread. By url, or company with complaint_id. Costs 1 credit.
   */
  async complaint(options: ReclameaquiComplaintOptions): Promise<Record<string, unknown>> {
    return this.post("complaint", options);
  }

  /**
   * Complaints across every company on Reclame Aqui (reclameaqui.com.br, Brazil's company complaint
   * and reputation site) that match some words, 5 or 10 per page, up to 51 pages of 10. Costs 1
   * credit.
   */
  async complaintSearch(options: ReclameaquiComplaintSearchOptions): Promise<Record<string, unknown>> {
    return this.post("complaint-search", options);
  }

  /**
   * The site-wide company rankings of Reclame Aqui (reclameaqui.com.br, Brazil's company complaint
   * and reputation site). Costs 1 credit.
   */
  async rankings(options: ReclameaquiRankingsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("rankings", options);
  }

  /**
   * Every ranked segment of Reclame Aqui (reclameaqui.com.br, Brazil's company complaint and
   * reputation site) (165 under 15 main segments, measured 2026-11-27), for segment_ranking. Costs
   * 1 credit.
   */
  async segments(options: ReclameaquiSegmentsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("segments", options);
  }

  /**
   * The best and worst companies of one segment on Reclame Aqui (reclameaqui.com.br, Brazil's
   * company complaint and reputation site), as the segment page ranks them. Page 1. Costs 1 credit.
   */
  async segmentRanking(options: ReclameaquiSegmentRankingOptions): Promise<Record<string, unknown>> {
    return this.post("segment-ranking", options);
  }
}
