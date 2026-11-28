import type { Scavio } from "../client.js";

// MSC Industrial Supply (mscdirect.com, the US metalworking and MRO distributor) search, category,
// product, clearance and locations endpoints; United States, prices in USD with the per-quantity
// price, unit price, minimum and order multiple, 1 credit each. Generated from the backend routes:
// every option and its doc mirrors the API's own request schema. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to the constant below and never lowers a longer client timeout. Failed upstream calls and refused
// inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for msc.clearance() and msc.locations(). */
export const MSC_TIMEOUT = 180_000;
/**
 * Minimum request timeout (ms) for msc.search(), msc.category() and msc.product() (slow MSC pages).
 */
export const MSC_SLOW_TIMEOUT = 300_000;

export interface MscSearchOptions {
  /**
   * Keywords, a manufacturer part number or an MSC# (a search for an MSC# returns that product).
   */
  query: string;
  /**
   * MSC's sort menu: bestmatch (default, Best Match), price (low to high), price_desc (high to
   * low), itemnumber, itemnumber_desc (by MSC#) or rating.
   */
  sort?: "bestmatch" | "price" | "price_desc" | "itemnumber" | "itemnumber_desc" | "rating";
  /** Results page, 1-based, 24 products per page, up to page 400. */
  page?: number;
  [key: string]: unknown;
}

export interface MscCategoryOptions {
  /**
   * An MSC category id (navid): categories[].navid of a search, or breadcrumbs[].navid of a
   * product.
   */
  navid?: number | string;
  /**
   * An mscdirect.com category link carrying navid= (e.g.
   * https://www.mscdirect.com/browse/tn?navid=2106186), instead of navid.
   */
  url?: string;
  /**
   * MSC's sort menu: bestmatch (default, Best Match), price (low to high), price_desc (high to
   * low), itemnumber, itemnumber_desc (by MSC#) or rating.
   */
  sort?: "bestmatch" | "price" | "price_desc" | "itemnumber" | "itemnumber_desc" | "rating";
  /** Results page, 1-based, 24 products per page, up to page 400. */
  page?: number;
  [key: string]: unknown;
}

export interface MscProductOptions {
  /** The MSC# (8 digits with its leading zeros: items[].msc_number). */
  msc_number?: string;
  /**
   * An mscdirect.com product link (https://www.mscdirect.com/product/details/<MSC#>), instead of
   * msc_number.
   */
  url?: string;
  [key: string]: unknown;
}

export interface MscClearanceOptions {
  /** clearance (default): MSC's Clearance Specials list; web_specials: its Web Specials list. */
  list?: "clearance" | "web_specials";
  [key: string]: unknown;
}

export interface MscLocationsOptions {
  /**
   * Narrows the list to one location type, as MSC names it: Customer Fulfillment Center, Regional
   * Inventory Center, Warehouse, Customer Care Center, Customer Support Center, Shared Services
   * Center, Procurement Office, Manufacturing Facility or Affiliated Company.
   */
  type?: string;
  /** Narrows the list to one US state (2-letter code). */
  state?: string;
  /**
   * Narrows the list to one country, as MSC lists it (United States, Canada, Mexico, United
   * Kingdom, Ireland, Asia).
   */
  location_country?: string;
  [key: string]: unknown;
}

export class MscNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = MSC_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/msc/${path}`, options, undefined, timeout);
  }

  /**
   * Search MSC Industrial Supply (mscdirect.com, the US metalworking and MRO distributor). Scavio
   * fetches the public MSC page on request. By keyword, manufacturer part number or MSC#, 24 per
   * page, up to page 400, in MSC's 6 sorts: the Web Price as MSC shows it, the quantity it is for
   * (each or per 100), the unit price, the minimum order quantity and the order multiple. Costs 1
   * credit.
   */
  async search(options: MscSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options, MSC_SLOW_TIMEOUT);
  }

  /**
   * One category of MSC Industrial Supply (mscdirect.com) by navid or category link, 24 per page,
   * up to page 400, in MSC's 6 sorts, with its breadcrumbs. Scavio fetches the public MSC page on
   * request. Costs 1 credit.
   */
  async category(options: MscCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options, MSC_SLOW_TIMEOUT);
  }

  /**
   * One product of MSC Industrial Supply (mscdirect.com) by MSC# or link: price per quantity, unit
   * price, minimum and multiple, availability, specifications, documents, compliance notices and
   * the alternates MSC lists. Scavio fetches the public MSC page on request. Review text, account
   * pricing and per-branch stock are not returned. Costs 1 credit.
   */
  async product(options: MscProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options, MSC_SLOW_TIMEOUT);
  }

  /**
   * The Clearance Specials list (default) or the Web Specials list of MSC Industrial Supply
   * (mscdirect.com), as MSC publishes them (about 60 items each) with the sale price. Scavio
   * fetches the public MSC page on request. Costs 1 credit.
   */
  async clearance(options: MscClearanceOptions = {}): Promise<Record<string, unknown>> {
    return this.post("clearance", options);
  }

  /**
   * The locations of MSC Industrial Supply (mscdirect.com): distribution, inventory, service and
   * office locations (not pickup stores) with their published business phone numbers, narrowed by
   * type, state and country. Scavio fetches the public MSC page on request. Costs 1 credit.
   */
  async locations(options: MscLocationsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("locations", options);
  }
}
