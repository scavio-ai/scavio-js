import type { Scavio } from "../client.js";

// Companies House (UK) is 1 credit flat on all four endpoints - it sits on
// the official UK register.
//
// SEARCH FIRST. Everything else is keyed by `company_number`, so search() is
// how you get one. Search matches CURRENT AND FORMER names.
//
// `company_number` is deliberately loose: the register 404s on /company/445790
// and /company/sc090312 for companies that exist, so the number is zero-padded
// and upper-cased for you. Registry prefixes supported: SC (Scotland),
// NI (Northern Ireland), OC/SO/NC (LLPs), FC (overseas), BR (UK
// establishment), CE (charitable incorporated organisation).
//
// Paging differs by endpoint. search() is CAPPED AT PAGE 50: the register
// serves a 1000-result WINDOW per term whatever hit count it prints - it
// claims 10,000 for a broad term, then answers page 51 with HTTP 416.
// officers() and filingHistory() have NO upper page bound; past the last page
// the register answers an ordinary 200 with an empty list, indistinguishable
// from a company with no officers or no filings.

export interface CompaniesHouseSearchOptions {
  /** Company name or fragment (1-200 characters, non-blank). */
  query: string;
  /**
   * Result page, 1-indexed (default 1). 20 results per page, CAPPED AT 50 -
   * the register only serves the first 1000 matches for a term.
   */
  page?: number;
  [key: string]: unknown;
}

export interface CompaniesHouseCompanyOptions {
  /**
   * UK company number, 1-20 characters, e.g. "00445790" or "SC090312". Loose
   * on purpose - it is zero-padded and upper-cased for you, so "445790" and
   * "sc090312" both work. Prefixes: SC, NI, OC/SO/NC, FC, BR, CE.
   */
  company_number: string;
  [key: string]: unknown;
}

export interface CompaniesHouseOfficersOptions {
  /**
   * UK company number, zero-padded and upper-cased for you.
   */
  company_number: string;
  /**
   * Result page, 1-indexed (default 1). 35 officers per page, no upper bound
   * - past the last page the register answers 200 with an empty list.
   */
  page?: number;
  [key: string]: unknown;
}

export interface CompaniesHouseFilingHistoryOptions {
  /**
   * UK company number, zero-padded and upper-cased for you.
   */
  company_number: string;
  /**
   * Result page, 1-indexed (default 1). No upper bound - past the last page
   * the register answers 200 with an empty list.
   */
  page?: number;
  [key: string]: unknown;
}

export class CompaniesHouseNamespace {
  constructor(private client: Scavio) {}

  /**
   * START HERE. Searches the UK register by name and returns the
   * `company_number` every other endpoint is keyed by, plus name, status,
   * incorporation or dissolution date, registered office address and matched
   * former names.
   *
   * Matches CURRENT AND FORMER names. Paged with `page`, 20 results per page,
   * CAPPED AT PAGE 50 - the register serves a 1000-result window per term
   * whatever hit count it prints, and answers page 51 with HTTP 416.
   *
   * Costs 1 credit.
   */
  async search(
    options: CompaniesHouseSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/companieshouse/search", options);
  }

  /**
   * Full register entry: status, type, incorporation and dissolution dates,
   * registered office, SIC codes, previous names, accounts and
   * confirmation-statement due dates with overdue flags, and whether it has
   * charges, insolvency history, officers or UK establishments. FC companies
   * return home registry / legal form / governing law, BR returns the parent,
   * CE returns the charity number.
   *
   * `company_number` is zero-padded and upper-cased for you, so a number off
   * a letterhead or out of a spreadsheet that ate its leading zeros still
   * resolves.
   *
   * Costs 1 credit. Single response, no pagination.
   */
  async company(
    options: CompaniesHouseCompanyOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/companieshouse/company", options);
  }

  /**
   * Officers current and resigned: name, role, appointment and resignation
   * dates, correspondence address, nationality, country of residence,
   * month-and-year date of birth, and identity-verification status.
   *
   * Paged with `page`, 35 officers per page, NO upper bound - past the last
   * page the register answers an ordinary 200 with an empty list, identical
   * to a company with no officers.
   *
   * `officers_count` is EVERY appointment ever made and `resignations_count`
   * how many ended, so the active count is the difference. There is no
   * server-side active/resigned filter - filter on each officer's `status` in
   * the response.
   *
   * Costs 1 credit.
   */
  async officers(
    options: CompaniesHouseOfficersOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/companieshouse/officers", options);
  }

  /**
   * Filings, most recent first: date, filing type code (AA, CS01, SH03),
   * description, register annotations and child documents, and a link to the
   * filed PDF with its page count.
   *
   * A filing the register has not finished processing carries a
   * `processing_note` instead of a document.
   *
   * Paged with `page`, NO upper bound - past the last page it is an ordinary
   * 200 with an empty list.
   *
   * Costs 1 credit.
   */
  async filingHistory(
    options: CompaniesHouseFilingHistoryOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/companieshouse/filing-history", options);
  }
}
