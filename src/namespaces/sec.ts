import type { Scavio } from "../client.js";

// SEC EDGAR is 1 credit flat on all six endpoints - it sits on the SEC's own
// free JSON API.
//
// LOOKUP FIRST. Callers hold a ticker (AAPL); EDGAR is keyed by CIK
// (0000320193). Call lookup() to resolve one before anything else. Both the
// `cik` and `ticker` fields accept either spelling, which softens the problem
// without removing it.
//
// XBRL concept tags are CASE-SENSITIVE: "netincomeloss" is a 404 upstream,
// not a match. Call facts() to list what a filer actually reports, then
// concept() to pull that tag's history.
//
// `form` matching differs by endpoint on purpose: on filings() it matches the
// form AND its root form, so "10-K" also returns 10-K/A amendments; on
// concept() it is an EXACT match, so "10-K" EXCLUDES 10-K/A.
//
// EDGAR's "recent" filings block is not a fixed window - a decade for a quiet
// filer, about a year for a prolific one. filings({ include_history: true })
// reaches back further and is the one call that can buy up to 10 upstream
// fetches while still costing ONE credit.
//
// Full-text search coverage STARTS IN 2001, and `page` is capped at 100
// (100 documents per page) because the index refuses a result window past
// 10,000.

export interface SECLookupOptions {
  /** Ticker, company name, or a fragment (1-200 characters). */
  query: string;
  /**
   * How many matches to return, 1-100 (default 10). This SIZES the response,
   * it is not a page param - there is no pagination here.
   */
  limit?: number;
  /**
   * Restrict to one listing exchange. Matched case-insensitively. Filers
   * listed with NO exchange are excluded by ANY value.
   */
  exchange?: "NASDAQ" | "NYSE" | "OTC" | "CBOE";
  [key: string]: unknown;
}

export interface SECCompanyOptions {
  /**
   * CIK in any spelling: 320193, 0000320193 or CIK0000320193. A ticker is
   * accepted here too. Either `cik` or `ticker` is required.
   */
  cik?: string;
  /**
   * Ticker, dotted or dashed (BRK.B / BRK-B). WINS over `cik` when both are
   * given. Either `cik` or `ticker` is required.
   */
  ticker?: string;
  [key: string]: unknown;
}

export interface SECFilingsOptions {
  /**
   * CIK in any spelling; a ticker is accepted here too. Either `cik` or
   * `ticker` is required.
   */
  cik?: string;
  /**
   * Ticker, dotted or dashed. WINS over `cik` when both are given. Either
   * `cik` or `ticker` is required.
   */
  ticker?: string;
  /**
   * Form filter: "10-K", ["10-K", "10-Q"] or "10-K,8-K". Matched against the
   * form AND its root form, so "10-K" also returns 10-K/A amendments - ask
   * for "10-K/A" to get only amendments. Up to 25 forms.
   */
  form?: string | string[];
  /** Earliest filing date, YYYY-MM-DD. */
  date_from?: string;
  /** Latest filing date, YYYY-MM-DD. */
  date_to?: string;
  /** Result page, 1-indexed. */
  page?: number;
  /** Filings per page, 1-500 (default 50). */
  limit?: number;
  /**
   * Reach past EDGAR's "recent" block into up to 10 archived shards. Still
   * ONE credit. `history_truncated` in the response flags a filer that had
   * more shards than the cap.
   */
  include_history?: boolean;
  [key: string]: unknown;
}

export interface SECConceptOptions {
  /**
   * CIK in any spelling; a ticker is accepted here too. Either `cik` or
   * `ticker` is required.
   */
  cik?: string;
  /**
   * Ticker, dotted or dashed. WINS over `cik` when both are given. Either
   * `cik` or `ticker` is required.
   */
  ticker?: string;
  /**
   * XBRL tag, e.g. "NetIncomeLoss" (1-120 characters, letters then
   * alphanumerics). CASE-SENSITIVE - "netincomeloss" is a 404 upstream, not a
   * match. Use facts() to discover the tags a filer actually reports.
   */
  concept: string;
  /** Taxonomy: us-gaap, dei, ifrs-full, srt (default "us-gaap"). */
  taxonomy?: string;
  /** Unit filter, e.g. "USD" vs "USD/shares". */
  unit?: string;
  /**
   * Form filter. EXACT match here, so "10-K" EXCLUDES 10-K/A - the opposite
   * of filings().
   */
  form?: string;
  /**
   * How many values to return, 1-2000 (default 250). This SIZES the response,
   * it is not a page param.
   */
  limit?: number;
  [key: string]: unknown;
}

export interface SECFactsOptions {
  /**
   * CIK in any spelling; a ticker is accepted here too. Either `cik` or
   * `ticker` is required.
   */
  cik?: string;
  /**
   * Ticker, dotted or dashed. WINS over `cik` when both are given. Either
   * `cik` or `ticker` is required.
   */
  ticker?: string;
  /** Restrict to one taxonomy, e.g. "us-gaap" or "dei". */
  taxonomy?: string;
  /**
   * Case-insensitive substring matched against the tag name and its label
   * (1-200 characters).
   */
  query?: string;
  /**
   * How many concepts to return, 1-2000 (default 250). This SIZES the
   * response, it is not a page param.
   */
  limit?: number;
  [key: string]: unknown;
}

export interface SECSearchOptions {
  /**
   * Full-text query (1-500 characters). A quoted phrase is an exact match;
   * bare words are a bag of terms. OPTIONAL - a cik, ticker, form or date
   * filter on its own is a valid search.
   */
  query?: string;
  /** One CIK or up to 25. Tickers are accepted here too. */
  cik?: string | string[];
  /** One ticker or up to 25. */
  ticker?: string | string[];
  /** One form or up to 25, e.g. "8-K" or ["10-K", "10-Q"]. */
  form?: string | string[];
  /** Earliest filing date, YYYY-MM-DD. Coverage starts in 2001. */
  date_from?: string;
  /** Latest filing date, YYYY-MM-DD. */
  date_to?: string;
  /**
   * EDGAR's own two-character location codes - "CA", "NY", and alphanumeric
   * codes for foreign jurisdictions. One or up to 25.
   */
  location?: string | string[];
  /** Result order (default "relevance"). */
  sort?: "relevance" | "newest" | "oldest";
  /**
   * Result page, 1-indexed, CAPPED AT 100. 100 documents per page - the index
   * refuses a result window past 10,000.
   */
  page?: number;
  [key: string]: unknown;
}

export class SECNamespace {
  constructor(private client: Scavio) {}

  /**
   * START HERE. Resolves a company name or ticker to the CIK every other SEC
   * EDGAR endpoint is keyed by: matching filers with symbol, listing
   * exchange, and ready-made submissions / company-facts / EDGAR URLs, tiered
   * by match quality (each row carries its tier as `match`).
   *
   * `limit` sizes the response; there is no pagination. `exchange` is a
   * closed set matched case-insensitively, and filers listed with no exchange
   * are excluded by ANY value.
   *
   * Costs 1 credit.
   */
  async lookup(
    options: SECLookupOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sec/lookup", options);
  }

  /**
   * Filer profile: legal and former names, SIC industry, filer category, EIN,
   * LEI, state of incorporation, fiscal year end, business and mailing
   * addresses, every ticker with its exchange, which forms it files and how
   * often, plus a preview of its 10 most recent filings.
   *
   * Either `cik` or `ticker` is required; `ticker` wins when both are given.
   *
   * Costs 1 credit. Single response, no pagination.
   */
  async company(
    options: SECCompanyOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sec/company", options);
  }

  /**
   * A page of one filer's filings: accession number, form and root form,
   * filing and period dates, 8-K item codes, and direct links to the primary
   * document, filing index and attachment directory.
   *
   * Either `cik` or `ticker` is required. Paged with `page` + `limit`.
   * `form` matches the form AND its root form, so "10-K" also returns 10-K/A.
   * EDGAR's "recent" block is not a fixed window - a decade for a quiet
   * filer, about a year for a prolific one; `include_history` reaches back
   * through up to 10 archived shards and sets `history_truncated` when the
   * filer had more.
   *
   * Costs 1 credit - including with `include_history`, which is the one call
   * that can buy more than one upstream fetch.
   */
  async filings(
    options: SECFilingsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sec/filings", options);
  }

  /**
   * Every value a filer reported for one XBRL concept, newest period first,
   * with the form and filing each number came from. Restatements are KEPT,
   * not collapsed; `latest` disambiguates a quarter from its year-to-date
   * twin using the SEC's comparability flag.
   *
   * Either `cik` or `ticker` is required. The `concept` tag is CASE-SENSITIVE
   * - "netincomeloss" is a 404 upstream, not a match; call facts() to find
   * the real tag. `form` is an EXACT match here, so "10-K" excludes 10-K/A.
   * `limit` sizes the response; there is no pagination.
   *
   * Costs 1 credit.
   */
  async concept(
    options: SECConceptOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sec/concept", options);
  }

  /**
   * The index of every XBRL concept a filer reports - tag, label,
   * description, units and most recent value - across us-gaap, dei and any
   * other taxonomy it uses. This is how you find what to ask concept() for.
   *
   * Either `cik` or `ticker` is required. `limit` sizes the response; there
   * is no pagination.
   *
   * Costs 1 credit.
   */
  async facts(
    options: SECFactsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sec/facts", options);
  }

  /**
   * EDGAR full-text search: each hit is the matching DOCUMENT with its URL,
   * form, filing date and filer identity, plus facets breaking the whole
   * result set down by company, form, industry and state.
   *
   * Coverage STARTS IN 2001 - nothing earlier is indexed. Accepts NO query at
   * all: a cik, ticker, form or date filter on its own is a valid search.
   * Paged with `page`, capped at 100 (100 documents per page) because the
   * index refuses a result window past 10,000.
   *
   * Costs 1 credit.
   */
  async search(
    options: SECSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sec/search", options);
  }
}
