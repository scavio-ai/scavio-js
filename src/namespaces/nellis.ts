import type { Scavio } from "../client.js";

// Nellis Auction (nellisauction.com, the liquidation auction marketplace with
// pickup warehouses in Las Vegas, Phoenix, Houston, Philadelphia, Denver and
// Dallas): 4 endpoints, 1 credit each. credits_used in the response is what
// was charged.
//
// Shopping locations: location is las-vegas (default), phoenix, houston,
// philadelphia (pickup in Delran, NJ), denver or dallas (run by Lots Of
// Auctions), 13 pickup warehouses in all. Every answer carries location
// {id, slug, name}.
//
// Search lists OPEN auctions only (Nellis's own search shows no closed items):
// a closed or sold item is read by id with item(), and a sold item's
// final_price is the winning bid before Nellis's buyer's premium and tax.
// current_bid is the current high bid in USD (0 before the first bid), as of
// the fetch: bids move live and a late bid extends the close (extended).
// retail_price is Nellis's own "Estimated Retail Price", as Nellis labels it
// (Nellis does not state its source): not an MSRP. The buyer's premium is, in
// Nellis's words, "typically 15% but may vary based on the auction event"
// (buyer_premium_percent per item). bid_history gives time, amount and Winning
// or Outbid, with no bidder names or ids. Pickup only, no shipping. Not
// available: closed or sold items in search, search suggestions, UPC or model
// numbers, buy-now, reserve prices, live bid updates, bidding, watchlists,
// checkout.
//
// The server enforces the cross-field rules: item() takes id or url;
// pickup_location must be a warehouse of the shopping location asked;
// page_size x page stays within Nellis's 30,000 positions. Every call raises
// the request timeout to NELLIS_TIMEOUT. Failed upstream calls and refused
// inputs are not charged; a not-found (an unknown id, or a category with no
// open items) is charged.

/** Minimum request timeout (ms) for every nellis call: calls can queue behind the server's upstream limit. */
export const NELLIS_TIMEOUT = 240_000;

/** A Nellis shopping location (default las-vegas). */
export type NellisLocation = "las-vegas" | "phoenix" | "houston" | "philadelphia" | "denver" | "dallas";

/** featured (default, Nellis's own order), current bid, ending soon / last, Nellis's Estimated Retail Price, or bids. */
export type NellisSort =
  | "featured" | "price_low" | "price_high" | "ending_soon" | "ending_last" | "retail_low"
  | "retail_high" | "bids_low" | "bids_high";

/** Items per page: 48, 120 (default) or 240. */
export type NellisPageSize = 48 | 120 | 240;

/** Nellis's condition grade in stars. */
export type NellisConditionRating = 1 | 2 | 3 | 4 | 5;

/** One name or a list of up to 10, as Nellis lists them. */
export type NellisNames = string | string[];

export interface NellisSearchOptions {
  /** Keywords (e.g. "robot vacuum"). Omitted: every open auction in the location. */
  q?: string;
  /** Defaults to "las-vegas". */
  location?: NellisLocation;
  /** Page (default 1). Nellis pages through 30,000 positions at most (page_size x page). */
  page?: number;
  /** Defaults to 120. */
  page_size?: NellisPageSize;
  /** Defaults to "featured". */
  sort?: NellisSort;
  /** Top-level category: categories[].name from categories(), e.g. "Electronics". */
  category?: NellisNames;
  /** Second-level category: subcategories[].name from categories(), e.g. "TVs". */
  subcategory?: NellisNames;
  /** Brand as Nellis lists it: facets.brands[].name. */
  brand?: NellisNames;
  /** Pickup warehouse within the shopping location: facets.pickup_locations[].name or locations[].name, e.g. "North Las Vegas". */
  pickup_location?: NellisNames;
  /** Nellis's condition grade in stars, 1-5 (one or a list). */
  condition_rating?: NellisConditionRating | NellisConditionRating[];
  /** Lowest Nellis Estimated Retail Price, USD. */
  retail_min?: number;
  /** Highest Nellis Estimated Retail Price, USD. */
  retail_max?: number;
  /** Auction event type: facets.auction_event_types[].name, e.g. "Retail Returns". */
  auction_event_type?: NellisNames;
  /** Auction event: facets.auction_event_names[].name or categories()'s auction_events[].name. */
  auction_event_name?: NellisNames;
  /** Color as Nellis lists it: facets.colors[].name. */
  color?: NellisNames;
  /** Size as Nellis lists it: facets.sizes[].name. */
  size?: NellisNames;
  [key: string]: unknown;
}

export interface NellisItemOptions {
  /** A Nellis Auction item id (items[].id, e.g. "141281552"). Send id or url. */
  id?: string | number;
  /** A Nellis Auction item link (https://www.nellisauction.com/p/<title>/<id>) instead of id. */
  url?: string;
  [key: string]: unknown;
}

export interface NellisLocationsOptions {
  /** Only the warehouses of this shopping location. Without it: all 13. */
  location?: NellisLocation;
  [key: string]: unknown;
}

export interface NellisCategoriesOptions {
  /** Defaults to "las-vegas". */
  location?: NellisLocation;
  /** One top-level category (categories[].name, e.g. "Electronics"): its subcategories, brands and auction events. */
  category?: string;
  [key: string]: unknown;
}

export class NellisNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/nellis/${path}`, options, undefined, NELLIS_TIMEOUT);
  }

  /** Open auctions of one shopping location: current bid, bid count, Estimated Retail Price, close time, condition, pickup warehouse, facets. */
  async search(options: NellisSearchOptions = {}): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One item by id or link, open, closed or sold: final price of a sold item (before premium and tax), bid history without bidder names. */
  async item(options: NellisItemOptions): Promise<Record<string, unknown>> {
    return this.post("item", options);
  }

  /** The 13 pickup warehouses (or one shopping location's) with address, coordinates, operator and opening hours. */
  async locations(options: NellisLocationsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("locations", options);
  }

  /** Live counts of open items per category, subcategory, brand, auction event and pickup warehouse. */
  async categories(options: NellisCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }
}
