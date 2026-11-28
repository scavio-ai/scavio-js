import type { Scavio } from "../client.js";

// Mouser Electronics (mouser.com, the electronic component distributor) search, product, categories
// and manufacturer endpoints; markets us (USD) and uk (mouser.co.uk, GBP; categories us only). 2
// credits each. Generated from the backend routes: every option and its doc mirrors the API's own
// request schema. The server enforces the value rules and the one-of rules (search takes query,
// category or both; product takes mouser_part_number or url; manufacturer takes manufacturer or
// url). Every call raises the request timeout to MOUSER_TIMEOUT and never lowers a longer client
// timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every mouser call. */
export const MOUSER_TIMEOUT = 300_000;

/**
 * us (the default and the only value served: the tree is read from mouser.com; its paths work
 * unchanged in a uk search).
 */
export type MouserCategoriesCountry = "us";

/** us (default: mouser.com, USD) or uk (mouser.co.uk, GBP; gb is accepted too). */
export type MouserCountry = "us" | "uk" | "gb";

export interface MouserSearchOptions {
  /**
   * Keywords, a manufacturer part number or a Mouser part number, e.g. LM7805. Send query, category
   * or both.
   */
  query?: string;
  /**
   * A Mouser category path (categories[].category of the categories endpoint, or of a keyword
   * search, e.g.
   * semiconductors/integrated-circuits-ics/power-management-ics/voltage-regulators-voltage-controllers/linear-voltage-regulators)
   * or a Mouser category link, to list or narrow a category.
   */
  category?: string;
  /** Results page, 1-based, 25 parts per page, up to page 200. */
  page?: number;
  /**
   * us (default: mouser.com, prices in USD) or uk (mouser.co.uk, prices in GBP; gb is accepted
   * too).
   */
  country?: MouserCountry;
  [key: string]: unknown;
}

export interface MouserProductOptions {
  /** The Mouser part number (items[].mouser_part_number), e.g. 595-NE555P. */
  mouser_part_number?: string;
  /**
   * The exact Mouser product link of a search row (items[].url, with its qs= part), instead of
   * mouser_part_number.
   */
  url?: string;
  /**
   * us (default: mouser.com, prices in USD) or uk (mouser.co.uk, prices in GBP; gb is accepted
   * too).
   */
  country?: MouserCountry;
  [key: string]: unknown;
}

export interface MouserCategoriesOptions {
  /**
   * us (the default and the only value served: the tree is read from mouser.com, and its category
   * paths work unchanged in a uk search).
   */
  country?: MouserCategoriesCountry;
  [key: string]: unknown;
}

export interface MouserManufacturerOptions {
  /** The manufacturer's Mouser slug (items[].manufacturer_slug), e.g. texas-instruments. */
  manufacturer?: string;
  /**
   * A Mouser manufacturer link (https://www.mouser.com/manufacturer/<slug>/), instead of
   * manufacturer.
   */
  url?: string;
  /**
   * us (default: mouser.com, prices in USD) or uk (mouser.co.uk, prices in GBP; gb is accepted
   * too).
   */
  country?: MouserCountry;
  [key: string]: unknown;
}

export class MouserNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/mouser/${path}`, options, undefined, MOUSER_TIMEOUT);
  }

  /**
   * Search Mouser Electronics (mouser.com, the electronic component distributor) by keyword or part
   * number, across the catalog or within a category, 25 parts a page in Mouser's own order: price
   * breaks per packaging, stock, on-order quantities and dates, factory lead time and lifecycle.
   * Scavio fetches the public Mouser page on request. Costs 2 credits.
   */
  async search(options: MouserSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One part of Mouser Electronics (mouser.com, the electronic component distributor) by Mouser
   * part number or the url of a search row (a number with a / needs the url): the full price table
   * per packaging, stock, on-order quantities and dates, factory lead time, specifications,
   * documents, trade codes and country of origin. Scavio fetches the public Mouser page on request.
   * Costs 2 credits.
   */
  async product(options: MouserProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The electronic components category tree of Mouser Electronics (mouser.com, the electronic
   * component distributor), with Mouser's part counts and the category paths search takes. Scavio
   * fetches the public Mouser page on request. Costs 2 credits.
   */
  async categories(options: MouserCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One manufacturer's profile on Mouser Electronics (mouser.com, the electronic component
   * distributor) by slug or link: logo, the ECIA authorized flag, sections and the product
   * categories Mouser links for it. Scavio fetches the public Mouser page on request. Costs 2
   * credits.
   */
  async manufacturer(options: MouserManufacturerOptions): Promise<Record<string, unknown>> {
    return this.post("manufacturer", options);
  }
}
