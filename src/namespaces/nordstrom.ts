import type { Scavio } from "../client.js";

// Nordstrom: 7 endpoints. nordstrom.com (US). availability() costs 10 credits
// (the product page plus the store lookup); every other call costs 5.
//
// search(), category() and brand() return 24 products per page in the same
// shape. product() takes a result's url or its style_id and lists every color
// and size as a sku with UPC, price, price type, in_stock and the quantity
// available to ship (a sku held only in a store reads in stock with quantity
// 0). Its reviews are the ones shown on the product page (up to about 13) plus
// the total review count and star histogram; there is no review paging.
// availability() adds per-sku pickup and the stores that can do in-store
// pickup; stores() finds Nordstrom stores near a ZIP or point.
// The upstream page can take ~15 seconds and is retried once, so every call
// raises the request timeout to NORDSTROM_TIMEOUT when the client's is shorter.

/** Minimum request timeout (ms) for every nordstrom call. */
export const NORDSTROM_TIMEOUT = 120_000;

export type NordstromSort =
  | "relevance"
  | "rating"
  | "price_high"
  | "price_low"
  | "newest"
  | "percent_off";

export interface NordstromSearchOptions {
  /** Search keywords. */
  query: string;
  /** Results page, 1-based. Defaults to 1. 24 products per page. */
  page?: number;
  /** relevance (default), rating, price_high, price_low, newest or percent_off. */
  sort?: NordstromSort;
  [key: string]: unknown;
}

export interface NordstromProductOptions {
  /** nordstrom.com product URL (the `url` of a search result). */
  url?: string;
  /** Nordstrom style id, the number at the end of a product URL (the `style_id` of a search result). Used when url is not given. */
  style_id?: string;
  [key: string]: unknown;
}

export interface NordstromCategoryOptions {
  /**
   * A nordstrom.com category: the /browse path or full URL of a category page,
   * e.g. /browse/women/clothing/dresses, sale/women, /browse/new or
   * https://www.nordstrom.com/browse/men/shoes. The /browse prefix is
   * optional. Query parameters in a URL (filters) are ignored. Each result's
   * category.subcategories lists child paths.
   */
  category: string;
  /** Results page, 1-based. Defaults to 1. 24 products per page. */
  page?: number;
  /** relevance (default), rating, price_high, price_low, newest or percent_off. */
  sort?: NordstromSort;
  [key: string]: unknown;
}

export interface NordstromBrandOptions {
  /**
   * A nordstrom.com brand: the /brands path or full URL of a brand page,
   * usually ending in the brand id, e.g. /brands/astr-the-label--53360 (a
   * product's brand_url works). A brand name without its id is a 404 except
   * where it is the brand page's own path (/brands/ugg-australia). Sub-pages
   * such as /brands/astr-the-label--53360/women work too.
   */
  brand: string;
  /** Results page, 1-based. Defaults to 1. 24 products per page. */
  page?: number;
  /** relevance (default), rating, price_high, price_low, newest or percent_off. */
  sort?: NordstromSort;
  [key: string]: unknown;
}

export interface NordstromStoresOptions {
  /** US ZIP code to search around. Pass exactly one of zip, latitude and longitude, or store_numbers. */
  zip?: string;
  /** Latitude to search around (with longitude). */
  latitude?: number;
  /** Longitude to search around (with latitude). */
  longitude?: number;
  /**
   * Look up stores by number instead of location: an array or a
   * comma-separated string, up to 100 (an availability result's
   * pickup_stores[].store_number).
   */
  store_numbers?: string[] | number[] | string;
  /** Search radius in miles around zip or latitude/longitude, 1-100 (the site's maximum). Defaults to 100. */
  distance_miles?: number;
  [key: string]: unknown;
}

export interface NordstromAvailabilityOptions {
  /** nordstrom.com product URL (the `url` of a search, category or brand result). */
  url?: string;
  /** Nordstrom style id, used when url is not given. */
  style_id?: string;
  /** Only this sku (a product's colors[].skus[].sku_id). An id that is not a sku of the product is a 404. */
  sku_id?: string;
  [key: string]: unknown;
}

export interface NordstromSuggestionsOptions {
  /** What the shopper has typed so far. */
  query: string;
  /** Suggestions to return, 1-20. Defaults to 8. The site may return fewer. */
  limit?: number;
  [key: string]: unknown;
}

export class NordstromNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search nordstrom.com (US) products, 24 per page, sorted by relevance,
   * rating, price, newest or percent off. Each result has style id, URL,
   * name, brand, image, current price and price range in dollars, original
   * price range, percent off and on-sale flag, rating, review count, badges
   * such as new or new_markdown, a low-inventory flag, whether it is sold by a
   * marketplace seller (and the seller's name), and every color with its color
   * family and image. Also returns the total result count and page count. Use
   * a result's url or style_id with product().
   *
   * Costs 5 credits.
   */
  async search(options: NordstromSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstrom/search", options, undefined, NORDSTROM_TIMEOUT);
  }

  /**
   * One nordstrom.com (US) product by URL or style id: name, brand,
   * description, feature bullets, fit notes, final-sale flag, current,
   * original and clearance price ranges, percent off, rating, review count,
   * the star histogram, the size-fit distribution (too small to too big), the
   * AI review summary when the site shows one, the most mentioned praised and
   * criticized features with a quote each, breadcrumbs and images. Every color
   * lists its images and every size as a sku with sku id, size, size type,
   * UPC, price, original price, percent off, price type (regular, clearance,
   * promotion), in_stock and the quantity available to ship. in_stock is true
   * when the sku can be shipped or picked up in a store, so a sku held only in
   * a store reads in stock with quantity 0 (availability() lists its pickup
   * stores). Includes the reviews shown on the product page (up to about 13),
   * with the total review count; each review has title, text, rating, size
   * rating, author, date, helpful votes and verified-purchase flag. Pass url
   * or style_id. An unknown style id is a 404.
   *
   * Costs 5 credits.
   */
  async product(options: NordstromProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstrom/product", options, undefined, NORDSTROM_TIMEOUT);
  }

  /**
   * Browse a nordstrom.com (US) category page, 24 products per page, sorted
   * by relevance, rating, price, newest or percent off. Works on any /browse
   * category, including sale (sale/women), new arrivals (/browse/new) and
   * top-level departments (/browse/women). Returns the category's name, page
   * title, path, URL, breadcrumbs and subcategories (name and path, for
   * drilling down). Each product has the same fields as a search result. Also
   * returns the total result count, page count, and the filter sidebar: each
   * filter group with its options and product counts (groups with more than
   * 100 options list the 100 with the most products and give the full
   * option_count). An unknown category is a 404.
   *
   * Costs 5 credits.
   */
  async category(options: NordstromCategoryOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstrom/category", options, undefined, NORDSTROM_TIMEOUT);
  }

  /**
   * List a brand's products on nordstrom.com (US) from its brand page, 24 per
   * page, sorted by relevance, rating, price, newest or percent off. Returns
   * the brand's name, path, URL, breadcrumbs and sub-pages (Women, Men,
   * Kids...), products with the same fields as a search result, the total
   * result count, page count and the filter sidebar with option counts. An
   * unknown brand is a 404.
   *
   * Costs 5 credits.
   */
  async brand(options: NordstromBrandOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstrom/brand", options, undefined, NORDSTROM_TIMEOUT);
  }

  /**
   * Find Nordstrom stores (full-line stores and Nordstrom Local) near a US ZIP
   * code or latitude/longitude within up to 100 miles, nearest first, or look
   * stores up by store number. Each store has store number, name, type
   * (full_line or local), address, phone, weekly hours, holiday hours when
   * posted, open and close times for the next 8 days, time zone, distance in
   * miles, coordinates, whether it offers buy-online pickup and curbside
   * pickup, its amenities and its store page URL. A ZIP with no store in range
   * returns an empty list.
   *
   * Costs 5 credits.
   */
  async stores(options: NordstromStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstrom/stores", options, undefined, NORDSTROM_TIMEOUT);
  }

  /**
   * Online and store-pickup availability for every size and color of one
   * nordstrom.com (US) product, by URL or style id, optionally one sku. Each
   * sku has sku id, size, color, UPC, in_stock, whether it ships and the
   * quantity available to ship, the quantity available for pickup, and the
   * stores where it can be picked up (store number, name, address, city,
   * state, ZIP, phone). Quantities are chain-wide: per store Nordstrom only
   * says whether pickup is available, not how many. An unknown style id or sku
   * id is a 404.
   *
   * Costs 10 credits (the product page plus the store lookup).
   */
  async availability(options: NordstromAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstrom/availability", options, undefined, NORDSTROM_TIMEOUT);
  }

  /**
   * The search-box autocomplete of nordstrom.com: the queries Nordstrom
   * suggests for a partial search term, most likely first. Useful for keyword
   * research and for building queries for search().
   *
   * Costs 5 credits.
   */
  async suggestions(options: NordstromSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstrom/suggestions", options, undefined, NORDSTROM_TIMEOUT);
  }
}
