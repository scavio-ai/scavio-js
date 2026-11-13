import type { Scavio } from "../client.js";

// Kroger: 8 endpoints on kroger.com and the QFC (qfc.com) and Fred Meyer
// (fredmeyer.com) banners. Every endpoint takes banner (kroger when omitted).
// Other Kroger banners (Ralphs, King Soopers, Fry's, Harris Teeter, ...) are
// not supported yet. search() and product() cost 2 credits, prices() 3, the
// rest 1. Prices are integer cents (price 399 = $3.99).
//
// search(), product(), category() and deals() return the prices of a store the
// site chooses for the request (returned in store; it can change between
// calls). For one store's price, stock and aisle, take a location_id from
// stores() and pass it as store_id to prices(). search(), category() and
// deals() serve the first page only (up to 24 products), with no sort: page
// above 1 is an unbilled 400. The server enforces the cross-field rules:
// product() takes product_url or upc; stores() exactly one of zip, query or
// store_id; category() url or taxonomy_id; coupons() store_id or zip. A call
// can take up to about a minute, so every call raises the request timeout to
// KROGER_TIMEOUT when the client's is shorter. Failed upstream calls are not
// charged; an unknown UPC or store id is a charged 404.

/** Minimum request timeout (ms) for every kroger call. */
export const KROGER_TIMEOUT = 120_000;

/**
 * The store banner: kroger (kroger.com, default), qfc (QFC, qfc.com:
 * Washington and Oregon) or fred_meyer (Fred Meyer, fredmeyer.com: the
 * Pacific Northwest and Alaska). Prices differ by banner and by store. With a
 * store_id the banner is optional: QFC ids start with 705, Fred Meyer ids
 * with 701, anything else is kroger.
 */
export type KrogerBanner = "kroger" | "qfc" | "fred_meyer";

export interface KrogerSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** The store banner. Defaults to kroger. */
  banner?: KrogerBanner;
  /** Results page. Only page 1 is available (up to 24 products); page above 1 is an unbilled 400. */
  page?: number;
  [key: string]: unknown;
}

export interface KrogerProductOptions {
  /**
   * Full or relative product URL on kroger.com, qfc.com or fredmeyer.com
   * (products[].url of search()). An absolute URL sets the banner; a banner
   * that contradicts its host is a 400.
   */
  product_url?: string;
  /** The product's UPC (products[].upc of search(), or the digits at the end of /p/{slug}/{upc}). */
  upc?: string;
  /** Product slug (the readable part of the product URL). Optional with upc. */
  slug?: string;
  /** The store banner. Defaults to kroger. */
  banner?: KrogerBanner;
  [key: string]: unknown;
}

export interface KrogerPricesOptions {
  /** A store's 8-digit location_id: stores[].location_id of stores(), e.g. "70500847". */
  store_id: string;
  /** 1 to 25 13-digit UPCs as the site writes them (products[].upc of search() or category()). */
  upcs: string[];
  /** The store banner. Optional: inferred from the store_id prefix. */
  banner?: KrogerBanner;
  [key: string]: unknown;
}

export interface KrogerStoresOptions {
  /** A 5-digit US ZIP code. One of zip, query or store_id. */
  zip?: string;
  /** A city or address, as typed in the site's store finder, e.g. "Portland, OR". */
  query?: string;
  /** One store's 8-digit location_id. */
  store_id?: string;
  /** The store banner. Defaults to kroger. */
  banner?: KrogerBanner;
  /** Stores to return, 1-50. Defaults to 10. */
  limit?: number;
  /** Also return nearby stores of other Kroger banners. Defaults to false. */
  include_other_banners?: boolean;
  [key: string]: unknown;
}

export interface KrogerCategoryOptions {
  /** A category listing URL (/pl/<name>/<id>) on kroger.com, qfc.com or fredmeyer.com; its host sets the banner. */
  url?: string;
  /** The digits at the end of a /pl/ URL, e.g. "08190" (alternative to url). Shared across banners. */
  taxonomy_id?: string;
  /** The name part of a /pl/ URL, e.g. "Import-Beer". Optional with taxonomy_id; without it category.name is null. */
  slug?: string;
  /** The store banner. Defaults to kroger. */
  banner?: KrogerBanner;
  /** Results page. Only page 1 is available; page above 1 is an unbilled 400. */
  page?: number;
  [key: string]: unknown;
}

export interface KrogerDealsOptions {
  /** The store banner. Defaults to kroger. */
  banner?: KrogerBanner;
  /** Results page. Only page 1 is available; page above 1 is an unbilled 400. */
  page?: number;
  [key: string]: unknown;
}

export interface KrogerCouponsOptions {
  /** A store's 8-digit location_id from stores(). Alternative to zip. */
  store_id?: string;
  /** A 5-digit ZIP: the banner's nearest store is used. Alternative to store_id. */
  zip?: string;
  /** The store banner. Optional with store_id. */
  banner?: KrogerBanner;
  /** Page of coupons, 24 per page, 1-50. Defaults to 1. Follow has_more. */
  page?: number;
  /** Only coupons in one department: a name from the response's categories, e.g. "Dairy". */
  category?: string;
  /** Only coupons whose brand or text matches, e.g. "coffee". */
  query?: string;
  [key: string]: unknown;
}

export interface KrogerSuggestionsOptions {
  /** What a shopper has typed so far (2-100 characters), e.g. "almond mi". */
  query: string;
  /** The store banner. Defaults to kroger. */
  banner?: KrogerBanner;
  /**
   * A store's 8-digit location_id. Optional: without it the banner's store
   * nearest a representative ZIP is used (Kroger 45202, QFC 98101, Fred Meyer
   * 97201).
   */
  store_id?: string;
  [key: string]: unknown;
}

export class KrogerNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/kroger/${path}`, options, undefined, KROGER_TIMEOUT);
  }

  /**
   * Search Kroger, QFC or Fred Meyer products by keyword: banner, store (the
   * store the site chose to price the results), total, count and products
   * with upc, name, brand, url, image, price, list_price, promo_price with
   * promo_ends_at, price_display, unit_price_display, nfor / nfor_price, size,
   * in_stock (null without a stock record), stock_level, SNAP eligibility,
   * dietary info, category and rating (average, count, star distribution; no
   * review text). Prices are integer cents. First page only, no sort.
   *
   * Costs 2 credits.
   */
  async search(options: KrogerSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Kroger, QFC or Fred Meyer product by URL or UPC: the search fields plus
   * description, nutrition facts, ingredients, allergens, images, country of
   * origin, dimensions, weight, dietary flags, the aisle at the store
   * (store_location), breadcrumbs, banner and store (chosen by the site).
   * Prices are integer cents. An unknown UPC is a charged 404.
   *
   * Costs 2 credits.
   */
  async product(options: KrogerProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Price, promotion, stock and aisle for 1 to 25 UPCs at one store you
   * choose: per UPC price, promo_price, promo_ends_at, on_sale,
   * price_display, unit_price_display, in_stock, stock_level, quantity (the
   * site's available estimate, not a shelf count), aisle (description,
   * number, side, bay, shelf), fulfillment (pickup, delivery, in_store, ship)
   * and priced_at; unknown UPCs in not_found. Prices are integer cents. An
   * unknown store_id is a charged 404.
   *
   * Costs 3 credits.
   */
  async prices(options: KrogerPricesOptions): Promise<Record<string, unknown>> {
    return this.post("prices", options);
  }

  /**
   * Stores near a ZIP or a city / address (nearest first), or one store by
   * store_id: location_id (the store_id for prices(), coupons() and
   * suggestions()), banner, type (store or fuel_center), name, store_number,
   * address, coordinates, phone, timezone, hours, open_24_hours, departments,
   * has_pharmacy, has_fuel_center, pickup, delivery and distance_miles. No
   * fuel prices. An unknown store_id is a charged 404.
   *
   * Costs 1 credit.
   */
  async stores(options: KrogerStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * A category listing by /pl/ URL or taxonomy_id: category (id, name, url)
   * and the search fields. Prices are integer cents. First page only, no
   * sort.
   *
   * Costs 1 credit.
   */
  async category(options: KrogerCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * This week's weekly digital deals: deals_week (id, ends_at) and the search
   * fields. Store promotions carry promo_price and promo_ends_at;
   * digital-coupon deals show the shelf price (the coupon is in coupons(),
   * tag Weekly Digital Deals). The printed weekly ad circular is not
   * available. Prices are integer cents.
   *
   * Costs 1 credit.
   */
  async deals(options: KrogerDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * The digital coupons at one store (store_id, or the banner's store nearest
   * a zip), 24 per page: id, brand, title, description, details, savings
   * (type, amount in cents, percent), type, min_quantity, categories, tags,
   * valid_for, max_redemptions, starts_at, clip_by, expires_at and image;
   * plus total_at_store, has_more and the categories to filter on. Listing
   * only: coupons are not clipped and no account is used.
   *
   * Costs 1 credit.
   */
  async coupons(options: KrogerCouponsOptions): Promise<Record<string, unknown>> {
    return this.post("coupons", options);
  }

  /**
   * Search box suggestions for a partial query: suggestions (text, type),
   * count and the store they were asked for.
   *
   * Costs 1 credit.
   */
  async suggestions(options: KrogerSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
