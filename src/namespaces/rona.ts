import type { Scavio } from "../client.js";

// RONA (rona.ca, the Canadian home improvement retailer: RONA+ and RONA stores, about 425
// corporate and affiliated dealer stores per RONA inc.): 9 endpoints: search, product, prices,
// category, categories, stores, store, stock, deals. Canada only, prices in CAD, language en | fr
// on every endpoint. Credits: prices, categories, stores and store 1; search and deals 2 (3 with
// store_id; search 2 more when RONA redirects the term); product 3; stock 3; category 2 (3 with
// store_id), or 1 with family_id and store_id. credits_used in the response is what was charged.
//
// Without store_id, search, category and deals are priced at the store RONA's site picks for the
// visit (store.requested false); with store_id prices and units are that store's. RONA prices
// some goods per store (lumber and panels can differ between stores and provinces); prices()
// reads up to 60 articles at one store. units are exact store units; null means RONA showed no
// count, not zero. Article numbers are strings (leading zeros count). product() returns
// sale_ends_text as RONA shows it and sale_ends as an ISO date only when unambiguous; rating and
// review count only. stock(): RONA offers no nearby-store list for some articles (lumber), and
// the list can come back empty now and then (call once more). Not available: review text, search
// suggestions, postal-code store lookup, the printed flyer, cart or checkout, price history.
//
// The server enforces the value rules: page_size 24, 48 or 96 (1-100 on a family_id list);
// product() takes sku or url; category() takes category or family_id (family_id needs store_id
// and no sort / filters / facets); latitude and longitude go together; stock() takes store_id or
// latitude + longitude; a postal_code is a 400; deals() has no sort. Every call raises the
// request timeout to RONA_TIMEOUT. Failed upstream calls and refused inputs are not charged; a
// not-found (an unknown article, category or store) is charged.

/** Minimum request timeout (ms) for every rona call: answers can take up to about a minute. */
export const RONA_TIMEOUT = 240_000;

/** en (default) or fr: RONA's French names, links and labels; ids and CAD prices are the same. */
export type RonaLanguage = "en" | "fr";

/** relevance (default), price_low_to_high, price_high_to_low, highest_rated, newest, best_sellers. */
export type RonaSort = "relevance" | "price_low_to_high" | "price_high_to_low" | "highest_rated" | "newest" | "best_sellers";

/** Products per page (default 48). */
export type RonaPageSize = 24 | 48 | 96;

export interface RonaLanguageOption {
  language?: RonaLanguage;
}

export interface RonaListFilters extends RonaLanguageOption {
  /** Page, 1-based (default 1). */
  page?: number;
  /** Up to 10 facet values (facets[].values[].value from include_facets): brand, price band, rating, offer, in-store or online-only, category. */
  filters?: string[];
  /** Only products on sale. */
  on_sale?: boolean;
  /** Only clearance products. */
  clearance?: boolean;
  /** Also return facets [{facet, name, values [{value, name, count}]}] to filter on. */
  include_facets?: boolean;
  /** A RONA store number (5 digits, from stores(); e.g. "55130"). Prices and units are that store's. */
  store_id?: string | number;
}

export interface RonaSearchOptions extends RonaListFilters {
  /** Keywords (e.g. "2x4"). */
  query: string;
  page_size?: RonaPageSize;
  sort?: RonaSort;
  [key: string]: unknown;
}

export interface RonaProductOptions extends RonaLanguageOption {
  /** A RONA article number (Article #, items[].sku) as a string: leading zeros count (e.g. "00277649"). Send sku or url. */
  sku?: string;
  /** A rona.ca product link instead of sku. */
  url?: string;
  /** A RONA store number: the product priced and stocked at that store. */
  store_id?: string | number;
  [key: string]: unknown;
}

export interface RonaPricesOptions extends RonaLanguageOption {
  /** 1-60 RONA article numbers as strings (a list or comma-separated), e.g. ["0971073", "00277649"]. */
  skus: string[] | string;
  /** Required. A RONA store number (5 digits, from stores(), e.g. "55130"). */
  store_id: string | number;
  [key: string]: unknown;
}

export interface RonaCategoryOptions extends RonaListFilters {
  /** A category path from categories() (e.g. "/en/tools/power-tools-158001/cordless-drills-and-drivers-158003") or a rona.ca category link. Send category or family_id. */
  category?: string;
  /** A category answer's family_id: with store_id and no sort, filters or facets, the category's products at that store for 1 credit. */
  family_id?: string | number;
  /** 24, 48 or 96 (default 48); with family_id 1-100. */
  page_size?: number;
  sort?: RonaSort;
  [key: string]: unknown;
}

export interface RonaCategoriesOptions extends RonaLanguageOption {
  /** Levels to return, 1-3 (default 3: departments, categories, sub-categories). */
  depth?: 1 | 2 | 3;
  [key: string]: unknown;
}

export interface RonaStoresOptions extends RonaLanguageOption {
  /** With longitude: stores nearest this point, with distance_km. */
  latitude?: number;
  /** With latitude. */
  longitude?: number;
  /** A province code ("qc", "on", "ab", "bc" ...) or name. */
  province?: string;
  /** Stores whose city contains this (accents and case ignored). */
  city?: string;
  /** rona (RONA stores) or rona_plus (RONA+ stores). */
  banner?: "rona" | "rona_plus";
  /** Stores to return, 1-403 (default 20 with latitude and longitude, else all). */
  limit?: number;
  [key: string]: unknown;
}

export interface RonaStoreOptions extends RonaLanguageOption {
  /** A RONA store number (5 digits, from stores(), e.g. "55130"). Send store_id or url. */
  store_id?: string | number;
  /** A rona.ca store link instead of store_id. */
  url?: string;
  [key: string]: unknown;
}

export interface RonaStockOptions extends RonaLanguageOption {
  /** A RONA article number (items[].sku) as a string (e.g. "00277649"). */
  sku: string;
  /** The stores near this store (5 digits, e.g. "62860"). Send store_id or latitude and longitude. */
  store_id?: string | number;
  /** Instead of store_id, with longitude: the stores near this point. */
  latitude?: number;
  /** With latitude. */
  longitude?: number;
  [key: string]: unknown;
}

export interface RonaDealsOptions extends RonaListFilters {
  /** weekly (default: RONA's weekly deals) or clearance. */
  type?: "weekly" | "clearance";
  page_size?: RonaPageSize;
  [key: string]: unknown;
}

export class RonaNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/rona/${path}`, options, undefined, RONA_TIMEOUT);
  }

  /** Search by keywords: price, regular price, on sale, rating, store units; 6 sorts, RONA's filters, 24-96 a page. 2 credits; 3 with store_id; 2 more on a redirect. */
  async search(options: RonaSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One product by article number or link: price, regular price, rebate, sale_ends_text, store units, aisle, nearby stores, specs. 3 credits. */
  async product(options: RonaProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** Up to 60 articles at one store: price, regular price, rebate, on sale, exact units, DC and parcel units, aisle, UPC. 1 credit. */
  async prices(options: RonaPricesOptions): Promise<Record<string, unknown>> {
    return this.post("prices", options);
  }

  /** One category by path (or family_id with store_id), with the search sorts, filters and paging. 2 credits (3 with store_id), or 1 with family_id. */
  async category(options: RonaCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /** The department tree; paths are category()'s category. 1 credit. */
  async categories(options: RonaCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /** RONA's 403 stores (RONA+ and RONA; corporate and dealer) by province, city, banner or nearest a point. No postal-code lookup. 1 credit. */
  async stores(options: RonaStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /** One store by number or link: address, phone, coordinates, hours, special hours, department hours. 1 credit. */
  async store(options: RonaStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /** Which stores near a store (or a point) have one article, with exact units, nearest first. 3 credits. */
  async stock(options: RonaStockOptions): Promise<Record<string, unknown>> {
    return this.post("stock", options);
  }

  /** RONA's weekly deals or clearance listing: sale and regular price, paged and filtered like search, no sort. 2 credits; 3 with store_id. */
  async deals(options: RonaDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }
}
