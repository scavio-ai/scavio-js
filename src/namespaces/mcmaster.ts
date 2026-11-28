import type { Scavio } from "../client.js";

// McMaster-Carr (mcmaster.com, the US industrial-supply catalog) product, search and categories
// endpoints; United States, prices in USD with the pack price and the per-piece price labelled, 1
// credit each. Generated from the backend routes: every option and its doc mirrors the API's own
// request schema. The server enforces the value rules and the one-of rules (send one of an id or a
// link). Every call raises the request timeout to MCMASTER_TIMEOUT (search to
// MCMASTER_SEARCH_TIMEOUT) and never lowers a longer client timeout. Failed upstream calls and
// refused inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every mcmaster call. */
export const MCMASTER_TIMEOUT = 180_000;
/** Minimum request timeout (ms) for mcmaster.search(). */
export const MCMASTER_SEARCH_TIMEOUT = 300_000;

export interface McmasterProductOptions {
  /** A McMaster-Carr part number (items[].part_number of a search, e.g. 91251A540). */
  part_number?: string;
  /** A mcmaster.com part link (https://www.mcmaster.com/<part number>/), instead of part_number. */
  url?: string;
  [key: string]: unknown;
}

export interface McmasterSearchOptions {
  /**
   * Keywords, as typed into the McMaster-Carr search box (a part number answers with that part).
   */
  query?: string;
  /**
   * A category slug instead of query: categories[].slug, or a result's product_families[].slug,
   * related_categories[].slug, facets[].values[].slug or breadcrumbs[].slug (e.g.
   * hose-clamps/worm-drive-clamps~~), or a mcmaster.com/products/ link.
   */
  category?: string;
  /** Part-number rows per answer, 1 to 100 (default 50). */
  per_page?: number;
  /**
   * Rows to skip on the page (default 0): the next answer starts at offset + count while has_more
   * is true.
   */
  offset?: number;
  [key: string]: unknown;
}

export interface McmasterCategoriesOptions {
  [key: string]: unknown;
}

export class McmasterNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = MCMASTER_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/mcmaster/${path}`, options, undefined, timeout);
  }

  /**
   * One part of McMaster-Carr (mcmaster.com, the US industrial-supply catalog). Scavio fetches the
   * public McMaster-Carr page on request. United States, prices in USD as the site shows them to a
   * visitor who is not signed in. By part number or part link. Costs 1 credit.
   */
  async product(options: McmasterProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * A keyword page or a category page of McMaster-Carr (mcmaster.com, the US industrial-supply
   * catalog). Scavio fetches the public McMaster-Carr page on request. United States, prices in USD
   * as the site shows them to a visitor who is not signed in. By query or category slug. Costs 1
   * credit.
   */
  async search(options: McmasterSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options, MCMASTER_SEARCH_TIMEOUT);
  }

  /**
   * The top level of the catalogue of McMaster-Carr (mcmaster.com, the US industrial-supply
   * catalog). Scavio fetches the public McMaster-Carr page on request. As the home page lists it.
   * Costs 1 credit.
   */
  async categories(options: McmasterCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }
}
