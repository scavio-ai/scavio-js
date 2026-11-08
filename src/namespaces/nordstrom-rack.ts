import type { Scavio } from "../client.js";
import type { NordstromReviewSort, NordstromSort } from "./nordstrom.js";

// Nordstrom Rack: 8 endpoints. nordstromrack.com (US), a separate platform from
// nordstrom.com with the same request shapes, credit costs and timeouts:
// availability() and reviews() cost 10 credits, every other call 5.
//
// category() takes Rack's /shop and /clearance paths: departments, deals, new
// arrivals, Clear the Rack (/clearance) and flash events (/shop/flash lists the
// live events as subcategories, /shop/flash/event-N opens one). There is no
// /browse on Rack. brand() takes /brands/<slug> with no id. Every product row
// carries clearance_price_range, and during Clear the Rack a clearance item can
// carry an extra percent off on top (promotion_price_range and
// promotion_percent_off). stores() and availability() cover Rack stores only;
// reviews() returns Rack's own review pool, separate from nordstrom.com's.
// Every call raises the request timeout to NORDSTROM_RACK_TIMEOUT when the
// client's is shorter; reviews() takes 15-60 s, up to about 100 s at
// max_reviews 200, so it uses NORDSTROM_RACK_REVIEWS_TIMEOUT instead.

/** Minimum request timeout (ms) for every nordstromRack call except reviews(). */
export const NORDSTROM_RACK_TIMEOUT = 120_000;

/** Minimum request timeout (ms) for nordstromRack.reviews(). */
export const NORDSTROM_RACK_REVIEWS_TIMEOUT = 150_000;

export type NordstromRackSort = NordstromSort;
export type NordstromRackReviewSort = NordstromReviewSort;

export interface NordstromRackSearchOptions {
  /** Search keywords. */
  query: string;
  /** Results page, 1-based. Defaults to 1. 24 products per page. */
  page?: number;
  /** relevance (default), rating, price_high, price_low, newest or percent_off. */
  sort?: NordstromRackSort;
  [key: string]: unknown;
}

export interface NordstromRackProductOptions {
  /** nordstromrack.com product URL (the `url` of a search, category or brand result). */
  url?: string;
  /** Nordstrom Rack style id, the number at the end of a product URL (a result's `style_id`). Used when url is not given. */
  style_id?: string;
  [key: string]: unknown;
}

export interface NordstromRackCategoryOptions {
  /**
   * A nordstromrack.com category: the /shop or /clearance path or full URL of
   * a category page, e.g. /shop/women/clothing/dresses,
   * /shop/deals/black-friday, /shop/new-arrivals, /clearance,
   * /clearance/women/clothing, /shop/flash or a flash event such as
   * /shop/flash/event-7. A path without a prefix (women/clothing/dresses) is
   * read as /shop/... . Query parameters in a URL (filters) are ignored. Each
   * result's category.subcategories lists child paths.
   */
  category: string;
  /** Results page, 1-based. Defaults to 1. 24 products per page. */
  page?: number;
  /** relevance (default), rating, price_high, price_low, newest or percent_off. */
  sort?: NordstromRackSort;
  [key: string]: unknown;
}

export interface NordstromRackBrandOptions {
  /**
   * A nordstromrack.com brand: the /brands path or full URL of a brand page,
   * e.g. /brands/adidas, /brands/sam-edelman or
   * https://www.nordstromrack.com/brands/ugg (a product's brand_url works).
   * The /brands prefix is optional. Rack brand pages carry no brand id: the
   * nordstrom.com form /brands/<name>--<id> is a 404 here.
   */
  brand: string;
  /** Results page, 1-based. Defaults to 1. 24 products per page. */
  page?: number;
  /** relevance (default), rating, price_high, price_low, newest or percent_off. */
  sort?: NordstromRackSort;
  [key: string]: unknown;
}

export interface NordstromRackStoresOptions {
  /** US ZIP code to search around. Pass exactly one of zip, latitude and longitude, or store_numbers. */
  zip?: string;
  /** Latitude to search around (with longitude). */
  latitude?: number;
  /** Longitude to search around (with latitude). */
  longitude?: number;
  /**
   * Look up Rack stores by number instead of location: an array or a
   * comma-separated string, up to 100 (an availability result's
   * pickup_stores[].store_number). Numbers of Nordstrom full-line stores are
   * left out.
   */
  store_numbers?: string[] | number[] | string;
  /** Search radius in miles around zip or latitude/longitude, 1-100 (the site's maximum). Defaults to 100. */
  distance_miles?: number;
  [key: string]: unknown;
}

export interface NordstromRackAvailabilityOptions {
  /** nordstromrack.com product URL (the `url` of a search, category or brand result). */
  url?: string;
  /** Nordstrom Rack style id, used when url is not given. */
  style_id?: string;
  /** Only this sku (a product's colors[].skus[].sku_id). An id that is not a sku of the product is a 404. */
  sku_id?: string;
  [key: string]: unknown;
}

export interface NordstromRackSuggestionsOptions {
  /** What the shopper has typed so far. */
  query: string;
  /** Suggestions to return, 1-20. Defaults to 8. The site may return fewer. */
  limit?: number;
  [key: string]: unknown;
}

export interface NordstromRackReviewsOptions {
  /** nordstromrack.com product URL (the `url` of a search, category or brand result). */
  url?: string;
  /** Nordstrom Rack style id, used when url is not given. */
  style_id?: string;
  /**
   * most_helpful (default), most_recent, highest_rated or lowest_rated. Cannot
   * be combined with search: Nordstrom Rack returns review search results in
   * its own order.
   */
  sort?: NordstromRackReviewSort;
  /** Only reviews with these star ratings, e.g. [1, 2] for the critical ones. */
  stars?: Array<1 | 2 | 3 | 4 | 5>;
  /** Only reviews from verified purchasers. */
  verified_only?: boolean;
  /** Only reviews that include customer photos. */
  with_photos?: boolean;
  /**
   * Only reviews mentioning this text (the review search box), 1-100
   * characters. Results come in the site's search order, so sort cannot be
   * set with it.
   */
  search?: string;
  /** Reviews to return, 1-200. Defaults to 60. Larger values take longer (about 50-100s for 200). */
  max_reviews?: number;
  [key: string]: unknown;
}

export class NordstromRackNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search nordstromrack.com (US) products, 24 per page, sorted by relevance,
   * rating, price, newest or percent off. Each result has style id, URL,
   * name, brand, image, current price and price range in dollars, the
   * compare-at price range Rack strikes through (original_price_range),
   * percent off and on-sale flag, the clearance price range, any promotion on
   * top (promotion_price_range, and promotion_percent_off: the extra percent
   * off the clearance price during Clear the Rack, otherwise off Rack's
   * regular price), rating, review count (Rack's own reviews), badges such as
   * new_markdown or final_sale, a low-inventory flag, marketplace seller and
   * every color. Also returns the total result count and page count. Use a
   * result's url or style_id with product().
   *
   * Costs 5 credits.
   */
  async search(options: NordstromRackSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstromrack/search", options, undefined, NORDSTROM_RACK_TIMEOUT);
  }

  /**
   * One nordstromrack.com (US) product by URL or style id: name, brand, brand
   * page URL, description, feature bullets, fit notes, final-sale flag,
   * current, compare-at and clearance price ranges, percent off, any promotion
   * on top (promotion_price_range and promotion_percent_off, e.g. Clear the
   * Rack's extra 25% off clearance), rating, review count, the star
   * histogram, the size-fit distribution, the AI review summary when the site
   * shows one, praised and criticized features, breadcrumbs and images. Every
   * color lists every size as a sku with sku id, size, UPC, price, compare-at
   * price, percent off, price type (regular, clearance, promotion), in_stock
   * and the quantity available to ship. Includes the reviews shown on the
   * product page (up to about 13), with the total review count (reviews()
   * pages the full history). Ratings and reviews are Rack's own, separate
   * from nordstrom.com's. Pass url or style_id. An unknown style id is a 404.
   *
   * Costs 5 credits.
   */
  async product(options: NordstromRackProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstromrack/product", options, undefined, NORDSTROM_RACK_TIMEOUT);
  }

  /**
   * Browse a nordstromrack.com (US) category page, 24 products per page,
   * sorted by relevance, rating, price, newest or percent off. Works on every
   * /shop and /clearance listing: departments (/shop/women), deals
   * (/shop/deals/black-friday), new arrivals (/shop/new-arrivals), Clear the
   * Rack (/clearance, /clearance/women/clothing) and flash events: /shop/flash
   * lists the live events as subcategories (it has no products of its own),
   * and each event (/shop/flash/event-7) is a listing whose first page shows
   * the event's featured products first. Returns the category's name, page
   * title, path, URL, breadcrumbs and subcategories, products with the same
   * fields as a search result, the total result count, page count and the
   * filter sidebar with option counts. An unknown category is a 404.
   *
   * Costs 5 credits.
   */
  async category(options: NordstromRackCategoryOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstromrack/category", options, undefined, NORDSTROM_RACK_TIMEOUT);
  }

  /**
   * List a brand's products on nordstromrack.com (US) from its brand page
   * (/brands/adidas), 24 per page, sorted by relevance, rating, price, newest
   * or percent off. Returns the brand's name, path, URL and breadcrumbs,
   * products with the same fields as a search result, the total result count,
   * page count and the filter sidebar with option counts. An unknown brand is
   * a 404.
   *
   * Costs 5 credits.
   */
  async brand(options: NordstromRackBrandOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstromrack/brand", options, undefined, NORDSTROM_RACK_TIMEOUT);
  }

  /**
   * Find Nordstrom Rack stores near a US ZIP code or latitude/longitude
   * within up to 100 miles, nearest first, or look Rack stores up by store
   * number. Each store has store number, name, type (rack), address, phone,
   * weekly hours, holiday hours when posted, open and close times for the
   * next 8 days, time zone, distance in miles, coordinates, whether it offers
   * buy-online pickup and curbside pickup, its amenities and its store page
   * URL. A ZIP with no store in range returns an empty list.
   *
   * Costs 5 credits.
   */
  async stores(options: NordstromRackStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstromrack/stores", options, undefined, NORDSTROM_RACK_TIMEOUT);
  }

  /**
   * Online and Rack store-pickup availability for every size and color of
   * one nordstromrack.com (US) product, by URL or style id, optionally one
   * sku. Each sku has sku id, size, color, UPC, in_stock, whether it ships
   * and the quantity available to ship, the quantity available for pickup,
   * and the Rack stores where it can be picked up (store number, name,
   * address, city, state, ZIP, phone). Quantities are chain-wide: per store
   * the site only says whether pickup is available, not how many. An unknown
   * style id or sku id is a 404.
   *
   * Costs 10 credits (the product page plus the store lookup).
   */
  async availability(options: NordstromRackAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstromrack/availability", options, undefined, NORDSTROM_RACK_TIMEOUT);
  }

  /**
   * The search-box autocomplete of nordstromrack.com: the queries Nordstrom
   * Rack suggests for a partial search term, most likely first. Useful for
   * keyword research and for building queries for search().
   *
   * Costs 5 credits.
   */
  async suggestions(options: NordstromRackSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstromrack/suggestions", options, undefined, NORDSTROM_RACK_TIMEOUT);
  }

  /**
   * Customer reviews of one nordstromrack.com (US) product by URL or style
   * id, up to 200 per call (default 60), sorted most helpful (default), most
   * recent, highest rated or lowest rated, optionally filtered to star
   * ratings, verified purchases, reviews with photos, or a text search. Rack
   * has its own review pool, separate from nordstrom.com's. Returns the review
   * summary (average rating, total reviews, star histogram, size and width
   * rating, praised and criticized features, rating-only count), the AI
   * review summary when the site shows one, total_results, returned and
   * has_more. Each review has id, title, text, star rating, size rating,
   * author, date, helpful votes, verified-purchase flag, reviewer badges,
   * size and color purchased, reviewer body details when given, secondary
   * ratings, the site it was syndicated from and photos. Rating-only reviews
   * are included with title and text null. Takes 15-60s, up to about 100s at
   * max_reviews 200, so the request timeout is raised to
   * NORDSTROM_RACK_REVIEWS_TIMEOUT. A product with no reviews returns an
   * empty list; an unknown style id is a 404.
   *
   * Costs 10 credits.
   */
  async reviews(options: NordstromRackReviewsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstromrack/reviews", options, undefined, NORDSTROM_RACK_REVIEWS_TIMEOUT);
  }
}
