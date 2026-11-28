import type { Scavio } from "../client.js";

// Liquidation.com (liquidation.com, the US online liquidation auction site of Liquidity Services)
// search, lot, manifest and closed endpoints; USD and CAD, no bidder names, 1 credit each.
// Generated from the backend routes: every option and its doc mirrors the API's own request schema.
// The server enforces the value rules and the one-of rules (send one of an id or a link). Every
// call raises the request timeout to LIQUIDATION_TIMEOUT and never lowers a longer client timeout.
// Failed upstream calls and refused inputs are not charged; a not-found is charged (credits_used is
// what was charged).

/** Minimum request timeout (ms) for every liquidation call. */
export const LIQUIDATION_TIMEOUT = 180_000;

export interface LiquidationSearchOptions {
  /** Keywords (title and description). */
  q?: string;
  /**
   * A top category: id or name (Appliances 1700, Clothing & Accessories 1001, Computers &
   * Networking 1002, Consumer Electronics 1004, Furniture 1600, General Merchandise 1005, Health &
   * Beauty 1800, Holiday & Seasonal 1045, Home Improvement 1900, Housewares 1006, Jewelry & Watches
   * 1011, Mystery Box 1017, Tools & Machinery 1003). Up to 8. One value or a list (any of them).
   */
  category?: string | string[];
  /** Lot size: package, pallet, truckload, large_item. One value or a list (any of them). */
  lot_size?: string | string[];
  /**
   * Condition: new, used, refurbished, returns, shelf_pulls, salvage, damaged, scratch_and_dent.
   * One value or a list (any of them).
   */
  condition?: string | string[];
  /**
   * US region of the warehouse: northeast, midwest, west, south. One value or a list (any of them).
   */
  region?: string | string[];
  /**
   * Auction type: standard, fixed_price, sealed_bid, mixed_format. One value or a list (any of
   * them).
   */
  auction_type?: string | string[];
  /**
   * A seller handle as Liquidation.com shows it (results[].seller, lot seller.handle or
   * facets.seller[].value), e.g. Amazon FBA, Newegg_Business, Titan Electronics.
   */
  seller?: string;
  /**
   * close_time (soonest closing at the top by default), current_bid (highest at the top), items
   * (items per lot, most at the top), title (A-Z) or relevance (needs q; the site's order with q).
   * Omitted: the site's default order.
   */
  sort?: "close_time" | "current_bid" | "items" | "relevance" | "title";
  /**
   * With sort (not relevance): asc or desc (default asc for close_time and title, desc for
   * current_bid and items).
   */
  order?: "asc" | "desc";
  /** Results page, 1-500 (default 1). */
  page?: number;
  /** Lots per page, 1-100 (default 27, the site's default). */
  per_page?: number;
  [key: string]: unknown;
}

export interface LiquidationLotOptions {
  /** results[].id: a Liquidation.com auction id (digits). */
  id?: string;
  /** A liquidation.com auction link (/auction/view?id=<id>) instead of id. */
  url?: string;
  [key: string]: unknown;
}

export interface LiquidationManifestOptions {
  /** results[].id: a Liquidation.com auction id (digits). */
  id?: string;
  /** A liquidation.com auction link (/auction/view?id=<id>) instead of id. */
  url?: string;
  [key: string]: unknown;
}

export interface LiquidationClosedOptions {
  /**
   * Required. A seller handle as Liquidation.com shows it (results[].seller, lot seller.handle or
   * facets.seller[].value), e.g. Amazon FBA, Newegg_Business, Titan Electronics.
   */
  seller: string;
  /**
   * Narrows the seller's closed lots. A top category: id or name (Appliances 1700, Clothing &
   * Accessories 1001, Computers & Networking 1002, Consumer Electronics 1004, Furniture 1600,
   * General Merchandise 1005, Health & Beauty 1800, Holiday & Seasonal 1045, Home Improvement 1900,
   * Housewares 1006, Jewelry & Watches 1011, Mystery Box 1017, Tools & Machinery 1003). Up to 8.
   * One value or a list (any of them).
   */
  category?: string | string[];
  /** Results page, 1-500 (default 1). */
  page?: number;
  /** Lots per page, 1-100 (default 27, the site's default). */
  per_page?: number;
  [key: string]: unknown;
}

export class LiquidationNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = LIQUIDATION_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/liquidation/${path}`, options, undefined, timeout);
  }

  /**
   * Search the open auctions of Liquidation.com (the US online auction marketplace of Liquidity
   * Services where retailers, brands and marketplace sellers sell customer returns, overstock and
   * shelf pulls by the package, pallet or truckload). Scavio fetches the public Liquidation.com
   * pages on request, as a visitor who is not signed in sees them. By keyword, category, lot size,
   * condition, US region, auction type and seller (at least one), sorted by close_time,
   * current_bid, items, title (asc / desc) or relevance, 27 per page by default (up to 100), paged
   * with page. Costs 1 credit.
   */
  async search(options: LiquidationSearchOptions = {}): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One open auction of Liquidation.com (the US online auction marketplace of Liquidity Services
   * where retailers, brands and marketplace sellers sell customer returns, overstock and shelf
   * pulls by the package, pallet or truckload). Scavio fetches the public Liquidation.com pages on
   * request, as a visitor who is not signed in sees them. By auction id or link. Costs 1 credit.
   */
  async lot(options: LiquidationLotOptions): Promise<Record<string, unknown>> {
    return this.post("lot", options);
  }

  /**
   * The item manifest of one auction of Liquidation.com (the US online auction marketplace of
   * Liquidity Services where retailers, brands and marketplace sellers sell customer returns,
   * overstock and shelf pulls by the package, pallet or truckload). Scavio fetches the public
   * Liquidation.com pages on request, as a visitor who is not signed in sees them. By auction id or
   * link. Costs 1 credit.
   */
  async manifest(options: LiquidationManifestOptions): Promise<Record<string, unknown>> {
    return this.post("manifest", options);
  }

  /**
   * Closed auctions of one seller on Liquidation.com (the US online auction marketplace of
   * Liquidity Services where retailers, brands and marketplace sellers sell customer returns,
   * overstock and shelf pulls by the package, pallet or truckload). Scavio fetches the public
   * Liquidation.com pages on request, as a visitor who is not signed in sees them. By seller
   * (required), optionally narrowed by category, 27 per page by default (up to 100). Costs 1
   * credit.
   */
  async closed(options: LiquidationClosedOptions): Promise<Record<string, unknown>> {
    return this.post("closed", options);
  }
}
