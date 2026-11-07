import type { Scavio } from "../client.js";

// Nordstrom: 2 endpoints, 5 credits each. nordstrom.com (US).
//
// search() returns 24 products per page. product() takes a result's url or
// its style_id and lists every color and size as a sku with UPC, price, price
// type and the quantity available to ship online (no store-level stock). Its
// reviews are the ones shown on the product page; there is no review paging.
// The upstream page can take ~15 seconds and is retried once, so both calls
// raise the request timeout to NORDSTROM_TIMEOUT when the client's is shorter.

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
   * promotion), in_stock and the quantity available to ship. Includes the
   * 12-13 reviews shown on the product page, with title, text, rating, size
   * rating, author, date, helpful votes and verified-purchase flag. Pass url
   * or style_id. An unknown style id is a 404.
   *
   * Costs 5 credits.
   */
  async product(options: NordstromProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/nordstrom/product", options, undefined, NORDSTROM_TIMEOUT);
  }
}
