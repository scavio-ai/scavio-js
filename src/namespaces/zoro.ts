import type { Scavio } from "../client.js";

// Zoro (zoro.com, the US online industrial and business supply store, part of Grainger) search,
// category, brand, product, availability and reviews endpoints; United States, prices in USD with
// the unit price and the order-multiple price, 1 credit each. Generated from the backend routes:
// every option and its doc mirrors the API's own request schema. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to the constant below and never lowers a longer client timeout. Failed upstream calls and refused
// inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for zoro.search(), category(), brand() and product(). */
export const ZORO_TIMEOUT = 180_000;
/** Minimum request timeout (ms) for zoro.availability() and zoro.reviews() (slower pages). */
export const ZORO_SLOW_TIMEOUT = 240_000;

export interface ZoroSearchOptions {
  /** Keywords, a part number or a Zoro number. */
  query: string;
  /**
   * Results page, 1-100 (36 products per page, as Zoro lists them). total_pages reports the last
   * one.
   */
  page?: number;
  [key: string]: unknown;
}

export interface ZoroCategoryOptions {
  /**
   * A zoro.com category link or path (https://www.zoro.com/safety-glasses/c/6214/ or
   * safety-glasses/c/6214), e.g. redirected_to.url of a search. Or send slug + code.
   */
  category?: string;
  /** The category's slug (with code). */
  slug?: string;
  /** The category's code (categories[].code of an item, e.g. 6214 or z1), with slug. */
  code?: string;
  /**
   * Results page, 1-100 (36 products per page, as Zoro lists them). total_pages reports the last
   * one.
   */
  page?: number;
  [key: string]: unknown;
}

export interface ZoroBrandOptions {
  /**
   * A brand as Zoro names it (items[].brand, e.g. 3M, Mcr Safety, Zoro Select) or a zoro.com brand
   * link (https://www.zoro.com/b/3M/).
   */
  brand: string;
  /**
   * Results page, 1-100 (36 products per page, as Zoro lists them). total_pages reports the last
   * one.
   */
  page?: number;
  [key: string]: unknown;
}

export interface ZoroProductOptions {
  /**
   * The Zoro number (items[].zoro_no; the Zoro # on a product page, G followed by digits). Send
   * zoro_no or url.
   */
  zoro_no?: string;
  /** A zoro.com product link, instead of zoro_no. */
  url?: string;
  [key: string]: unknown;
}

export interface ZoroAvailabilityOptions {
  /**
   * The Zoro number (items[].zoro_no; the Zoro # on a product page, G followed by digits). Send
   * zoro_no or url.
   */
  zoro_no?: string;
  /** A zoro.com product link, instead of zoro_no. */
  url?: string;
  [key: string]: unknown;
}

export interface ZoroReviewsOptions {
  /**
   * The Zoro number (items[].zoro_no; the Zoro # on a product page, G followed by digits). Send
   * zoro_no or url.
   */
  zoro_no?: string;
  /** A zoro.com product link, instead of zoro_no. */
  url?: string;
  [key: string]: unknown;
}

export class ZoroNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = ZORO_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/zoro/${path}`, options, undefined, timeout);
  }

  /**
   * Search Zoro (zoro.com, the US online industrial and business supply store, part of Grainger).
   * Scavio fetches the public zoro.com page on request. By keyword, part number or Zoro number, 36
   * per page, up to page 100, in Zoro's order: the unit price, the pieces per selling unit and the
   * order-multiple price (labelled as given by the page or computed). Costs 1 credit.
   */
  async search(options: ZoroSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category of Zoro (zoro.com) by link, path or slug + code, 36 per page, up to page 100, in
   * Zoro's order. Scavio fetches the public zoro.com page on request. Costs 1 credit.
   */
  async category(options: ZoroCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One brand's products on Zoro (zoro.com) by brand name or link, 36 per page, up to page 100, in
   * Zoro's order. Scavio fetches the public zoro.com page on request. Costs 1 credit.
   */
  async brand(options: ZoroBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * One product of Zoro (zoro.com) by Zoro number or link: unit and order-multiple prices,
   * availability, specifications, documents, variants and shipping restrictions. Scavio fetches the
   * public zoro.com page on request. Costs 1 credit.
   */
  async product(options: ZoroProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The availability of one Zoro (zoro.com) product as its product page shows it: status, delivery
   * estimate, back-order and order flags and the price; Zoro shows no unit counts. Scavio fetches
   * the public zoro.com page on request. Slower than the other endpoints. Costs 1 credit.
   */
  async availability(options: ZoroAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.post("availability", options, ZORO_SLOW_TIMEOUT);
  }

  /**
   * Customer reviews of one Zoro (zoro.com) product: the rating summary and the first 5 reviews the
   * product page shows, newest first, without reviewer names. Scavio fetches the public zoro.com
   * page on request. Slower than the other endpoints. Costs 1 credit.
   */
  async reviews(options: ZoroReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options, ZORO_SLOW_TIMEOUT);
  }
}
