import type { Scavio } from "../client.js";

// RS Components (rs-online.com, RS Group's electronic and industrial component distributor) search,
// product, category and brand endpoints; markets uk (GBP), de (EUR, German text) and au (AUD),
// stock per market; RS Americas (us.rs-online.com) is not covered. 2 credits each. Generated from
// the backend routes: every option and its doc mirrors the API's own request schema. The server
// enforces the value rules and the one-of rule (product takes stock_number or url). Every call
// raises the request timeout to RSCOMPONENTS_TIMEOUT and never lowers a longer client timeout.
// Failed upstream calls and refused inputs are not charged; a not-found is charged (credits_used is
// what was charged).

/** Minimum request timeout (ms) for every rscomponents call. */
export const RSCOMPONENTS_TIMEOUT = 240_000;

/**
 * The RS market: uk (uk.rs-online.com, GBP; default), de (de.rs-online.com, EUR, German text) or au
 * (au.rs-online.com, AUD). A link sent as url / path / brand picks its own market.
 */
export type RscomponentsCountry = "uk" | "de" | "au" | "gb";

export interface RscomponentsSearchOptions {
  /** Keywords, a manufacturer part number (MPN) or an RS stock number, e.g. BC547. */
  query: string;
  /** Results page, 1-500 (20 per page; total_pages says how many the site has). */
  page?: number;
  /**
   * The RS market: uk (uk.rs-online.com, GBP; default), de (de.rs-online.com, EUR, German text) or
   * au (au.rs-online.com, AUD). A link sent as url / path / brand picks its own market.
   */
  country?: RscomponentsCountry;
  [key: string]: unknown;
}

export interface RscomponentsProductOptions {
  /**
   * The RS stock number (items[].stock_number), with or without the dash: 221-5535, 2215535,
   * 197-7393P.
   */
  stock_number?: string;
  /**
   * An RS product link (uk, de or au), e.g. https://uk.rs-online.com/web/p/timer-circuits/2215535,
   * instead of stock_number.
   */
  url?: string;
  /**
   * The RS market: uk (uk.rs-online.com, GBP; default), de (de.rs-online.com, EUR, German text) or
   * au (au.rs-online.com, AUD). A link sent as url / path / brand picks its own market.
   */
  country?: RscomponentsCountry;
  [key: string]: unknown;
}

export interface RscomponentsCategoryOptions {
  /**
   * A category path as the market writes it (child_categories[].path, categories[].path), e.g.
   * semiconductors/power-management-ics/voltage-regulators, or its /web/c/ link.
   */
  path: string;
  /** Results page, 1-500 (20 per page; total_pages says how many the site has). */
  page?: number;
  /**
   * The RS market: uk (uk.rs-online.com, GBP; default), de (de.rs-online.com, EUR, German text) or
   * au (au.rs-online.com, AUD). A link sent as url / path / brand picks its own market.
   */
  country?: RscomponentsCountry;
  [key: string]: unknown;
}

export interface RscomponentsBrandOptions {
  /**
   * A brand slug (product brand_slug, the end of a /web/b/ link), e.g. texas-instruments, or its
   * /web/b/ link.
   */
  brand: string;
  /** Results page, 1-500 (20 per page; total_pages says how many the site has). */
  page?: number;
  /**
   * The RS market: uk (uk.rs-online.com, GBP; default), de (de.rs-online.com, EUR, German text) or
   * au (au.rs-online.com, AUD). A link sent as url / path / brand picks its own market.
   */
  country?: RscomponentsCountry;
  [key: string]: unknown;
}

export class RscomponentsNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/rscomponents/${path}`, options, undefined, RSCOMPONENTS_TIMEOUT);
  }

  /**
   * Search RS Components (rs-online.com, RS Group's electronic and industrial component
   * distributor) by keyword, MPN or stock number, 20 a page: unit and pack price, pack size, stock
   * status, lifecycle, key specs and the site's filters with counts. Scavio fetches the public
   * rs-online.com page on request. Costs 2 credits.
   */
  async search(options: RscomponentsSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product of RS Components (rs-online.com, RS Group's electronic and industrial component
   * distributor) by stock number or link: price breaks, the VAT-inclusive unit price, pack size,
   * the market's own stock with its ship-date schedule, RoHS, country of origin, datasheets and
   * specs. Scavio fetches the public rs-online.com page on request. Costs 2 credits.
   */
  async product(options: RscomponentsProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One category of RS Components (rs-online.com, RS Group's electronic and industrial component
   * distributor) by path or link: breadcrumbs, child categories, the site's curated filtered
   * listings and its products, 20 a page. Scavio fetches the public rs-online.com page on request.
   * Costs 2 credits.
   */
  async category(options: RscomponentsCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One brand's products on RS Components (rs-online.com, RS Group's electronic and industrial
   * component distributor) by slug or link, 20 a page. Scavio fetches the public rs-online.com page
   * on request. Costs 2 credits.
   */
  async brand(options: RscomponentsBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }
}
