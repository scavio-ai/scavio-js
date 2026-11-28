import type { Scavio } from "../client.js";

// B-Stock (bstock.com, the liquidation marketplace where retailers sell returns and overstock)
// search, lot, storefronts and filters endpoints; open listings with auction state, current bid,
// retail value and the public manifest preview, 1 credit each. Generated from the backend routes:
// every option and its doc mirrors the API's own request schema. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to BSTOCK_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused
// inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every bstock call. */
export const BSTOCK_TIMEOUT = 180_000;

export interface BstockSearchOptions {
  /** Keywords. Omitted: every open listing (filters and sort still apply). */
  q?: string;
  /**
   * A retailer marketplace on B-Stock: storefronts[].id, storefronts[].value or storefronts[].name
   * from the storefronts endpoint (e.g. Target, Walmart, The Home Depot, Amazon Europe). One value
   * or a list of up to 10 (any of them).
   */
  storefront?: string | string[];
  /**
   * Top-level category: categories[].value from the filters endpoint (e.g. Electronics, Cell
   * Phones, Home & Garden). One value or a list of up to 10 (any of them).
   */
  category?: string | string[];
  /**
   * Second-level category: subcategories[].value from the filters endpoint (e.g. Laptops,
   * Accessories). One value or a list of up to 10 (any of them).
   */
  subcategory?: string | string[];
  /**
   * Lot condition: conditions[].value (New, Like New, Used Good, Used Fair, Mixed, Salvage ...).
   * One value or a list of up to 10 (any of them).
   */
  condition?: string | string[];
  /**
   * Inventory type: inventory_types[].value (Customer Returns, Overstock, Shelf Pulls, Mixed/Other
   * ...). One value or a list of up to 10 (any of them).
   */
  inventory_type?: string | string[];
  /**
   * How the lot is sold: AUCTION, BUY_NOW, MAKE_AN_OFFER. One value or a list of up to 10 (any of
   * them).
   */
  buying_format?: string | string[];
  /**
   * Where the lot ships from: regions[].value from the filters endpoint ("GA/US" a US state,
   * "ON/CA" a Canadian province, "/ES" a European country). One value or a list of up to 10 (any of
   * them).
   */
  region?: string | string[];
  /** Shipment size: LTL, PARCEL, Truckload. One value or a list of up to 10 (any of them). */
  shipment_type?: string | string[];
  /**
   * Manufacturer as B-Stock lists it: manufacturers[].value from the filters endpoint. One value or
   * a list of up to 10 (any of them).
   */
  manufacturer?: string | string[];
  /**
   * recommended (B-Stock's default order; the default without q), end_time (soonest closing at the
   * top) or relevance (needs q; the default with q).
   */
  sort?: "recommended" | "end_time" | "relevance";
  /** Listings per call, 1-200 (default 20). */
  limit?: number;
  /** Listings to skip, 0-10000 (default 0): offset + limit pages through total. */
  offset?: number;
  [key: string]: unknown;
}

export interface BstockLotOptions {
  /**
   * listings[].listing_id: a B-Stock listing id (24 hex characters), or the number of an Amazon
   * Europe lot (lot_source amazon_europe).
   */
  id?: string;
  /** A bstock.com listing link (listings[].url) instead of id. */
  url?: string;
  [key: string]: unknown;
}

export interface BstockStorefrontsOptions {
  [key: string]: unknown;
}

export interface BstockFiltersOptions {
  [key: string]: unknown;
}

export class BstockNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = BSTOCK_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/bstock/${path}`, options, undefined, timeout);
  }

  /**
   * Search the open liquidation lots of B-Stock (bstock.com, the liquidation marketplace where
   * retailers and brands such as Target, Walmart, Amazon, The Home Depot and Best Buy sell customer
   * returns and overstock by the pallet or truckload). Scavio fetches the public B-Stock pages on
   * request, as a visitor who is not signed in sees them. By keyword (or none. Costs 1 credit.
   */
  async search(options: BstockSearchOptions = {}): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One lot of B-Stock (bstock.com, the liquidation marketplace where retailers and brands such as
   * Target, Walmart, Amazon, The Home Depot and Best Buy sell customer returns and overstock by the
   * pallet or truckload). Scavio fetches the public B-Stock pages on request, as a visitor who is
   * not signed in sees them. By listing id or link. Costs 1 credit.
   */
  async lot(options: BstockLotOptions): Promise<Record<string, unknown>> {
    return this.post("lot", options);
  }

  /**
   * The retailer and brand marketplaces of B-Stock (bstock.com, the liquidation marketplace where
   * retailers and brands such as Target, Walmart, Amazon, The Home Depot and Best Buy sell customer
   * returns and overstock by the pallet or truckload). Scavio fetches the public B-Stock pages on
   * request, as a visitor who is not signed in sees them. The storefronts with open listings right
   * now. Costs 1 credit.
   */
  async storefronts(options: BstockStorefrontsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("storefronts", options);
  }

  /**
   * The search filters of B-Stock (bstock.com, the liquidation marketplace where retailers and
   * brands such as Target, Walmart, Amazon, The Home Depot and Best Buy sell customer returns and
   * overstock by the pallet or truckload). Scavio fetches the public B-Stock pages on request, as a
   * visitor who is not signed in sees them. with B-Stock's counts of open listings. Costs 1 credit.
   */
  async filters(options: BstockFiltersOptions = {}): Promise<Record<string, unknown>> {
    return this.post("filters", options);
  }
}
