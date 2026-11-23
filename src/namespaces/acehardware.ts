import type { Scavio } from "../client.js";

// Ace Hardware (acehardware.com, the US hardware cooperative): 11 endpoints,
// 1 credit each, with these exceptions: search() 2 (3 when Ace redirects the
// search to a category and the list options are applied to it); product() 2
// (with or without store); storeStock() 1 per 5 stores (1 store 1, 5 stores 1,
// 25 stores 5; nearby 6); stores() with details 1 lookup per store (25 stores
// 6). An occasional call costs 2 instead of 1; credits_used in the response is
// what was charged. US only, so no method takes country.
//
// Ace stores are independently owned and operated, and the same item can be
// priced differently at different stores (Ace's terms: pricing varies by
// location). product() with store (a 5-digit Ace store number, as a string to
// keep leading zeros, e.g. "03085") returns the price as Ace shows it for that
// store, with priced_for {store_id, price_list}; without a store, priced_for
// names the price list Ace used (CORP is Ace's online price). msrp is reported
// as Ace gives it and can be below a store's price. Listing prices (search,
// category, brand, deals) are the price Ace shows in its listing (price_list
// per item), not a store's price. storeStock() returns exact units on hand as
// Ace reports them; Ace answers 0 for a store number or product it does not
// know, exactly as for one out of stock. There is no store search by ZIP or
// city: store numbers are in every Ace store page link
// (acehardware.com/store-details/<number>), and stores() lists the 25 nearest
// to one store. Not available: review or Q&A text (rating and count only),
// search suggestions, ZIP or city store search, pickup or delivery dates,
// price history (poll and store the answers), Ace Rewards member prices, Ace
// Handyman, rentals, Ace-licensed stores outside the US, checkout.
//
// The server enforces the cross-field rules: product() takes product_code or
// url (not both); storeStock() store or stores (not both), nearby with one
// store only; lists take at most 6 filters in all (brand, offer and filters).
// Every call raises the request timeout to ACEHARDWARE_TIMEOUT. Failed
// upstream calls and refused inputs are not charged; a not-found is charged.

/** Minimum request timeout (ms) for every acehardware call: nearby stock and stores with details chain up to 27 lookups and calls can queue behind the server's upstream limit. */
export const ACEHARDWARE_TIMEOUT = 240_000;

/** An Ace store number: 5 digits, as a string to keep leading zeros (e.g. "18250", "03085"). */
export type AcehardwareStore = string | number;

/** relevance (default, Ace's order), price_asc, price_desc, name_asc, name_desc, newest or oldest. */
export type AcehardwareSort = "relevance" | "price_asc" | "price_desc" | "name_asc" | "name_desc" | "newest" | "oldest";

/** Ace's Special Offers: sale, ace_rewards (Ace Rewards member offers), buy_and_get, buy_more_save. */
export type AcehardwareOffer = "sale" | "ace_rewards" | "buy_and_get" | "buy_more_save";

/** Products per page, as Ace lists them (default 30). */
export type AcehardwarePageSize = 15 | 30 | 50 | 100 | 200;

export interface AcehardwareListOptions {
  /** Page 1-200 (the first item of the page stays within 10,000). */
  page?: number;
  /** 15, 30 (default), 50, 100 or 200. */
  page_size?: AcehardwarePageSize;
  /** Defaults to "relevance". */
  sort?: AcehardwareSort;
  /** Only products in one of Ace's Special Offers. */
  offer?: AcehardwareOffer;
  /** Only products on sale (same as offer "sale"). */
  on_sale?: boolean;
  /** facets[].values[].filter values from an earlier answer (e.g. "tenant~A00317:lithium-ion", "price:[100 TO 250]"). At most 6 in all with brand and offer. */
  filters?: string[];
}

export interface AcehardwareSearchOptions extends AcehardwareListOptions {
  /** Keywords ("brass hose nozzle"), an Ace item number or a UPC. */
  query: string;
  /** Only this brand (the Brand Name facet's value, e.g. "dewalt"). */
  brand?: string;
  [key: string]: unknown;
}

export interface AcehardwareProductOptions {
  /** An Ace item number (items[].product_code, e.g. "72779") or an acehardware.com product link. Send product_code or url. */
  product_code?: string | number;
  /** An acehardware.com product link (items[].url), instead of product_code. */
  url?: string;
  /** An Ace store number ("10665", "03085"): the price as Ace shows it for that store, named in priced_for. Without it, priced_for names the price list Ace used (CORP: Ace's online price). */
  store?: AcehardwareStore;
  [key: string]: unknown;
}

export interface AcehardwareStoreStockOptions {
  /** An Ace item number (e.g. "72779") or an acehardware.com product link. */
  product_code: string | number;
  /** One Ace store number (e.g. "18250"). Send store or stores. */
  store?: AcehardwareStore;
  /** Up to 25 Ace store numbers (instead of store): 1 credit per 5 stores. */
  stores?: AcehardwareStore[];
  /** With one store: also the 25 stores Ace lists as nearest to it (6 credits). */
  nearby?: boolean;
  [key: string]: unknown;
}

export interface AcehardwareStoreOptions {
  /** An Ace store number (e.g. "18250"). */
  store: AcehardwareStore;
  [key: string]: unknown;
}

export interface AcehardwareStoresOptions {
  /** The Ace store whose nearest stores to list (e.g. "03085"). */
  store: AcehardwareStore;
  /** Each nearest store's name, address, phone, hours and distance (1 lookup per store: 25 stores 6 credits). */
  details?: boolean;
  /** How many of the nearest stores (1-25, default 25). */
  limit?: number;
  [key: string]: unknown;
}

export interface AcehardwareCategoryOptions extends AcehardwareListOptions {
  /** An Ace category link or path (/departments/..., /c/<id>) or a category id, e.g. "/departments/tools/power-tools/cordless-drills". */
  category: string | number;
  /** Only this brand (the Brand Name facet's value). */
  brand?: string;
  [key: string]: unknown;
}

export interface AcehardwareCategoriesOptions {
  /** A department or category (link, path or id): its subcategories. Without it: every department. */
  category?: string | number;
  [key: string]: unknown;
}

export interface AcehardwareBrandOptions extends AcehardwareListOptions {
  /** A brand slug ("weber") or its link (brands[].url). Without it: Ace's brand index (about 5,700 brands, 500 a page). */
  brand?: string;
  /** Brand index only: brands whose name contains this text. */
  query?: string;
  [key: string]: unknown;
}

export interface AcehardwareDealsOptions extends AcehardwareListOptions {
  /** Only this brand (the Brand Name facet's value). */
  brand?: string;
  [key: string]: unknown;
}

export interface AcehardwareWeeklyAdOptions {
  /** An Ace store number (e.g. "18250"). */
  store: AcehardwareStore;
  /** Page of the weekly ad (1-40; total_pages says how many). */
  page?: number;
  /** ad_group from an earlier answer (e.g. "261101_WCAS"), with page for page 2 and later. */
  ad_group?: string;
  [key: string]: unknown;
}

export interface AcehardwarePaintColorsOptions {
  /** Colour name or code contains this text, e.g. "pink". */
  query?: string;
  /** A colour family (families[].name, e.g. "Blue", "Gray / Black"). */
  family?: string;
  /** A paint brand: "Benjamin Moore", "Clark+Kensington" or "Magnolia Home". */
  brand?: string;
  /** A collection name (colors[].collections). */
  collection?: string;
  /** Page 1-1000. */
  page?: number;
  /** Colours per page (1-500, default 100). */
  page_size?: number;
  [key: string]: unknown;
}

export class AcehardwareNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/acehardware/${path}`, options, undefined, ACEHARDWARE_TIMEOUT);
  }

  /** Search by keywords, an Ace item number or a UPC (listing prices, not a store's price). 2 credits (3 on a category redirect). */
  async search(options: AcehardwareSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One product in full, priced for an Ace store with store (priced_for). 2 credits. */
  async product(options: AcehardwareProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** Exact units on hand at 1-25 stores, or at one store and its 25 nearest (nearby). 1 credit per 5 stores; nearby 6. */
  async storeStock(options: AcehardwareStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /** One store: address, hours, services, features, price zones, nearest and same-owner stores. 1 credit. */
  async store(options: AcehardwareStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /** The 25 stores Ace lists as nearest an Ace store; with details each one's address, phone, hours and distance. 1 credit (details: 25 stores 6). */
  async stores(options: AcehardwareStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /** One category's products by link, path or id. 1 credit. */
  async category(options: AcehardwareCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /** Ace's departments and their categories, or one department's. 1 credit. */
  async categories(options: AcehardwareCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /** One brand's products, or without brand Ace's brand index. 1 credit. */
  async brand(options: AcehardwareBrandOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /** Ace's sales and specials list plus its site-wide promotions with codes and dates. 1 credit. */
  async deals(options: AcehardwareDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /** One store's weekly ad, page by page, with valid_from / valid_to. 1 credit. */
  async weeklyAd(options: AcehardwareWeeklyAdOptions): Promise<Record<string, unknown>> {
    return this.post("weekly-ad", options);
  }

  /** Ace's paint colours (Benjamin Moore, Clark+Kensington, Magnolia Home) with hex and RGB. 1 credit. */
  async paintColors(options: AcehardwarePaintColorsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("paint-colors", options);
  }
}
