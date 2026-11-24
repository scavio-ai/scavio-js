import type { Scavio } from "../client.js";

// Tractor Supply (tractorsupply.com, the US rural lifestyle retailer): 12
// endpoints, 1 credit each, with these exceptions: product() 2 on the first
// call for a store not yet looked up; storePrices() 1 per 5 lookups (each
// store's price, a store's details when not yet known, the item: 25 new stores
// cost 11). credits_used in the response is what was charged. US only, so no
// method takes country.
//
// Tractor Supply prices by store, so search(), product(), category(), brand()
// and deals() need store (a Tractor Supply store number, e.g. "1933") or zip
// (the nearest store Tractor Supply lists for it is used); there is no default
// store. Every price answer carries priced_for {store_id, zone, city, state,
// from, zip}. Tractor Supply's terms note that prices may vary in different
// geographic markets, and the same item can be priced differently at
// different stores. Some items carry a manufacturer's minimum advertised price
// (mapp) and show one price everywhere. Item numbers are 7 digits
// (items[].item_number) and are the input of product(), storePrices(),
// storeStock(), fulfillment() and promotions(). storeStock() returns units as
// Tractor Supply reports them, with in-transit units and their pickup date.
// Not available: review or Q&A text (rating and count only), search
// suggestions, the weekly ad, a clearance list, price history (poll and store
// the answers), Neighbor's Club member prices, live chick availability,
// Petsense, checkout.
//
// The server enforces the cross-field rules: store or zip (not both) on the
// priced methods; product() takes item_number or url (not both);
// storePrices() and storeStock() take stores, store or zip (stores and zip not
// both), limit only with zip; lists take at most 6 filters in all (brand,
// on_sale, new, pickup, rating and filters). Every call raises the request
// timeout to TRACTORSUPPLY_TIMEOUT. Failed upstream calls and refused inputs
// are not charged; a not-found is charged.

/** Minimum request timeout (ms) for every tractorsupply call: storePrices() chains up to 51 lookups and calls can queue behind the server's upstream limit. */
export const TRACTORSUPPLY_TIMEOUT = 240_000;

/** A Tractor Supply store number (e.g. "1933" Glendive MT; stores() lists them). */
export type TractorsupplyStore = string | number;

/** A Tractor Supply item number (items[].item_number, 7 digits, e.g. "2340147"). */
export type TractorsupplyItemNumber = string | number;

/** popular (default, Most Popular), rating, name_asc, name_desc, price_asc, price_desc, recent or new_arrivals. */
export type TractorsupplySort =
  | "popular"
  | "rating"
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "recent"
  | "new_arrivals";

/** Products per page, as Tractor Supply lists them (default 24). */
export type TractorsupplyPageSize = 24 | 48 | 96 | 200;

/** Store or ZIP: one of them is required on the priced methods (not both). */
export interface TractorsupplyPricedFor {
  /** A Tractor Supply store number (e.g. "1933"): prices are that store's. */
  store?: TractorsupplyStore;
  /** A 5-digit US ZIP code (e.g. "59330"): prices are for the nearest store Tractor Supply lists for it. */
  zip?: string;
}

export interface TractorsupplyListOptions extends TractorsupplyPricedFor {
  /** Page 1-100. */
  page?: number;
  /** 24 (default), 48, 96 or 200. */
  page_size?: TractorsupplyPageSize;
  /** Defaults to "popular". */
  sort?: TractorsupplySort;
  /** Only products the store offers for pickup. */
  pickup?: boolean;
  /** Only products rated at least this many stars (1-4). */
  rating?: number;
  /** facets[].values[].filter values from an earlier answer, sent exactly as given (e.g. "2bb%3A%2250%20lb%22"). At most 6 in all with brand, on_sale, new, pickup and rating. */
  filters?: string[];
}

export interface TractorsupplySearchOptions extends TractorsupplyListOptions {
  /** Keywords ("layer pellets"), a Tractor Supply item number or a UPC. */
  query: string;
  /** Only this brand (the Brand facet's value, e.g. "Purina"). */
  brand?: string;
  /** Only products on sale. */
  on_sale?: boolean;
  /** Only new arrivals. */
  new?: boolean;
  [key: string]: unknown;
}

export interface TractorsupplyProductOptions extends TractorsupplyPricedFor {
  /** A Tractor Supply item number (e.g. "2340147"). Send item_number or url. */
  item_number?: TractorsupplyItemNumber;
  /** A tractorsupply.com product link (items[].url), instead of item_number. */
  url?: string;
  [key: string]: unknown;
}

export interface TractorsupplyMultiStoreOptions {
  /** A Tractor Supply item number (e.g. "2340147"). */
  item_number: TractorsupplyItemNumber;
  /** Up to 25 Tractor Supply store numbers, e.g. ["1933", "1923"]. Send stores, store or zip. */
  stores?: TractorsupplyStore[];
  /** One Tractor Supply store number (instead of stores). */
  store?: TractorsupplyStore;
  /** A 5-digit US ZIP code: the stores nearest it (instead of stores). */
  zip?: string;
  /** With zip: how many of the nearest stores (1-10, default 5). */
  limit?: number;
  [key: string]: unknown;
}

export interface TractorsupplyFulfillmentOptions {
  /** A Tractor Supply item number (e.g. "2340147"). */
  item_number: TractorsupplyItemNumber;
  /** A Tractor Supply store number (e.g. "1933"). */
  store: TractorsupplyStore;
  /** The delivery ZIP code (5 digits, e.g. "59330"). */
  zip: string;
  /** Quantity (default 1). */
  quantity?: number;
  [key: string]: unknown;
}

export interface TractorsupplyStoresOptions {
  /** A 5-digit US ZIP code (e.g. "59301"). */
  zip: string;
  /** How many stores (1-10, default 10). */
  limit?: number;
  [key: string]: unknown;
}

export interface TractorsupplyStoreOptions {
  /** A Tractor Supply store number (e.g. "1933"). */
  store: TractorsupplyStore;
  [key: string]: unknown;
}

export interface TractorsupplyCategoryOptions extends TractorsupplyListOptions {
  /** A category link or path ("/tsc/catalog/poultry-feed"), its slug ("poultry-feed") or a listing category id (breadcrumbs[].category_id). */
  category: string | number;
  /** Only this brand (the Brand facet's value). */
  brand?: string;
  /** Only products on sale. */
  on_sale?: boolean;
  /** Only new arrivals. */
  new?: boolean;
  [key: string]: unknown;
}

export interface TractorsupplyCategoriesOptions {
  /** A category tree id (categories[].tree_id, e.g. "1004851"): its categories, two levels. Without it: the departments. */
  parent_id?: string | number;
  [key: string]: unknown;
}

export interface TractorsupplyBrandOptions extends TractorsupplyListOptions {
  /** A brand as Tractor Supply names it (items[].brand, e.g. "Purina", "Producer's Pride", "4health"). */
  brand: string;
  /** Only this brand's products matching these keywords. */
  query?: string;
  /** Only products on sale. */
  on_sale?: boolean;
  /** Only new arrivals. */
  new?: boolean;
  [key: string]: unknown;
}

export interface TractorsupplyDealsOptions extends TractorsupplyListOptions {
  /** "sale" (default): products on sale; "new": new arrivals. */
  type?: "sale" | "new";
  /** Only deals matching these keywords. */
  query?: string;
  /** Only this brand (the Brand facet's value). */
  brand?: string;
  [key: string]: unknown;
}

export interface TractorsupplyPromotionsOptions {
  /** A Tractor Supply item number (e.g. "3609112"). */
  item_number: TractorsupplyItemNumber;
  [key: string]: unknown;
}

export class TractorsupplyNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/tractorsupply/${path}`, options, undefined, TRACTORSUPPLY_TIMEOUT);
  }

  /** Search by keywords, an item number or a UPC, priced for one store (store or zip, named in priced_for). 1 credit. */
  async search(options: TractorsupplySearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One product or size in full, priced for one store (store or zip): priced_for with the store's zone, price, was price, mapp, specifications, variants. 1 credit (2 on the first call for a store not yet looked up). */
  async product(options: TractorsupplyProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** One item's price at up to 25 stores, or at the stores nearest a ZIP, with each store's zone and price_range. 1 credit per 5 lookups (25 new stores 11). */
  async storePrices(options: TractorsupplyMultiStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store-prices", options);
  }

  /** Units per store as Tractor Supply reports them, with in-transit units and their pickup date, at up to 25 stores or near a ZIP. 1 credit. */
  async storeStock(options: TractorsupplyMultiStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /** Pickup units and delivery options (standard, same day, ship to store) with dates, for one item at one store and a ZIP. 1 credit. */
  async fulfillment(options: TractorsupplyFulfillmentOptions): Promise<Record<string, unknown>> {
    return this.post("fulfillment", options);
  }

  /** The stores nearest a US ZIP: address, phone, hours, price zone, services, dated store events. 1 credit. */
  async stores(options: TractorsupplyStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /** One store by store number: address, phone, zone, hours, services, events. 1 credit. */
  async store(options: TractorsupplyStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /** One category's products by link, path, slug or id, priced for one store. 1 credit. */
  async category(options: TractorsupplyCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /** Tractor Supply's departments, or one department's or category's categories (two levels). 1 credit. */
  async categories(options: TractorsupplyCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /** One brand's products, priced for one store, optionally matching keywords. 1 credit. */
  async brand(options: TractorsupplyBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /** Products on sale (type "sale", default) or new arrivals (type "new"), priced for one store. 1 credit. */
  async deals(options: TractorsupplyDealsOptions): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /** The promotions Tractor Supply lists for one item, with start and end dates. 1 credit. */
  async promotions(options: TractorsupplyPromotionsOptions): Promise<Record<string, unknown>> {
    return this.post("promotions", options);
  }
}
