import type { Scavio } from "../client.js";

// Meijer (meijer.com, the Midwest grocery and general-merchandise chain: Michigan, Ohio, Indiana,
// Illinois, Kentucky, Wisconsin; US only, USD): 10 endpoints, 1 credit each. Generated from the
// backend routes: every option and its doc mirrors the API's own request schema. Prices, stock and
// aisles are those of the store_id you send (a Meijer store number from stores()) and differ by
// store; store_used names the store the page used, and without store_id Meijer picks a store by
// location. The server enforces the value rules and the one-of rule (product and reviews take
// meijer_id or upc, not both). Every call raises the request timeout to MEIJER_TIMEOUT and never
// lowers a longer client timeout. Failed upstream calls and refused inputs are not charged; a
// not-found is charged.

/** Minimum request timeout (ms) for every meijer call. */
export const MEIJER_TIMEOUT = 240_000;

/** A Meijer store number (stores[].store_id of stores()), e.g. 295 (Franklin IN) or "167". */
export type MeijerStoreId = string | number;

export interface MeijerSearchOptions {
  /** Keywords or a Meijer item id, e.g. "large eggs". */
  query: string;
  /**
   * A Meijer store number from stores(). Prices, stock and aisles are that store's. Without it
   * Meijer picks a store by location: store_used names it.
   */
  store_id?: MeijerStoreId;
  /** 1 (52 items, default) or 2 (the next 48; slower). */
  page?: number;
  [key: string]: unknown;
}

export interface MeijerProductOptions {
  /**
   * A Meijer item id (items[].meijer_id: the UPC without its check digit, leading zeros dropped),
   * e.g. "4125010200". Send meijer_id or upc.
   */
  meijer_id?: string | number;
  /** A 12-digit UPC-A or 13-digit EAN as printed under the barcode, e.g. "041250102007", instead of meijer_id. */
  upc?: string | number;
  /** A Meijer store number from stores(). Without it Meijer picks a store by location. */
  store_id?: MeijerStoreId;
  [key: string]: unknown;
}

export interface MeijerCategoryOptions {
  /**
   * A department path as Meijer writes it (categories[].path of categories(), e.g.
   * "fresh/produce/fruit" or "grocery/pantry") or a meijer.com department link.
   */
  category: string;
  /** A Meijer store number from stores(). Without it Meijer picks a store by location. */
  store_id?: MeijerStoreId;
  [key: string]: unknown;
}

export interface MeijerCategoriesOptions {
  /** A department path, e.g. "grocery/pantry": its subcategories. Leave out for the departments and collections. */
  category?: string;
  [key: string]: unknown;
}

export interface MeijerDealsOptions {
  /**
   * A collection path as Meijer writes it (default "grocery/grocery-sale"; categories() lists the
   * collections, e.g. "black-friday") or a meijer.com collection link.
   */
  collection?: string;
  /** A Meijer store number from stores(). Without it Meijer picks a store by location. */
  store_id?: MeijerStoreId;
  [key: string]: unknown;
}

export interface MeijerStoresOptions {
  /** A US ZIP code, e.g. "47274": the Meijer stores within 50 miles (up to 50). */
  zip: string | number;
  [key: string]: unknown;
}

export interface MeijerStoreOptions {
  /** A Meijer store number from stores(), e.g. 295. */
  store_id: MeijerStoreId;
  [key: string]: unknown;
}

export interface MeijerCouponsOptions {
  /** A Meijer store number from stores(), e.g. 295. */
  store_id: MeijerStoreId;
  /** Only coupons in this department: departments[].department_id or a department or subcategory name, e.g. "Baby". */
  department?: string;
  /**
   * true: every coupon of the store (slower, up to about 2 minutes). Default false: the first 48
   * with the total and department counts.
   */
  full_list?: boolean;
  [key: string]: unknown;
}

export interface MeijerReviewsOptions {
  /** A Meijer item id (items[].meijer_id), e.g. "4125010200". Send meijer_id or upc. */
  meijer_id?: string | number;
  /** A 12-digit UPC-A or 13-digit EAN, instead of meijer_id. */
  upc?: string | number;
  [key: string]: unknown;
}

export class MeijerNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/meijer/${path}`, options, undefined, MEIJER_TIMEOUT);
  }

  /**
   * Search Meijer (meijer.com) by keywords or a Meijer item id, priced at the store you choose,
   * with stock status, Meijer's filter counts and department counts. Page 1 lists 52 items, page 2
   * the next 48. Scavio fetches the public Meijer page on request. Costs 1 credit.
   */
  async search(options: MeijerSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Meijer item by Meijer id or UPC / EAN (both are returned), priced at the store you choose,
   * with stock, aisle, promotions, mPerks, SNAP and WIC flags, ingredients and variations (each size
   * with its own store price). Nutrition and allergens are not on the page (null). Costs 1 credit.
   */
  async product(options: MeijerProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One Meijer department's first 52 items by path, priced at the store you choose (total counts
   * them all), with subcategories and filter counts. Costs 1 credit.
   */
  async category(options: MeijerCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * Meijer's departments and collections as the site navigation lists them, with the paths
   * category() and deals() take; or one department's subcategories. Costs 1 credit.
   */
  async categories(options: MeijerCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One Meijer deals collection's first 52 items (default the grocery sale), priced at the store
   * you choose. Clearance shows per item as clearance_price. Costs 1 credit.
   */
  async deals(options: MeijerDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * The Meijer stores within 50 miles of a US ZIP code (up to 50), with the store_id every other
   * endpoint takes. Meijer Express gas stations are not listed. Costs 1 credit.
   */
  async stores(options: MeijerStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One Meijer store by store number: address, phone, features, the store, pharmacy, delivery,
   * pickup, deli, bakery and gas station hours, services and nearby stores. No fuel prices. Costs 1
   * credit.
   */
  async store(options: MeijerStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * The current weekly ad of the Meijer store you choose, page by page: region, ad dates, every ad
   * running and each block's item, label and price_text as written (2/$6, $3.99). Costs 1 credit.
   */
  async weeklyAd(options: MeijerStoreOptions): Promise<Record<string, unknown>> {
    return this.post("weekly-ad", options);
  }

  /**
   * The mPerks coupons of the Meijer store you choose as the coupons page lists them to a visitor
   * without an account (listed, never clipped): the first 48 with department counts, or the full
   * list. Costs 1 credit.
   */
  async coupons(options: MeijerCouponsOptions): Promise<Record<string, unknown>> {
    return this.post("coupons", options);
  }

  /**
   * The first page of written reviews of one Meijer item (8) with the rating summary. Reviewer
   * nicknames, locations and ids are not returned. Costs 1 credit.
   */
  async reviews(options: MeijerReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }
}
