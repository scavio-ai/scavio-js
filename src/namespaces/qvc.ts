import type { Scavio } from "../client.js";

// QVC (qvc.com, qvcuk.com, qvc.de, qvc.it, qvc.jp) and HSN (hsn.com), the video shopping networks,
// chosen with site: search, product, products, todaysSpecial, onAir, programGuide, recentlyAired,
// category, suggestions and reviews endpoints; QVC market us, uk, de, it or jp (local currency),
// HSN US only, 1 credit each. Generated from the backend routes: every option and its doc mirrors
// the API's own request schema; an input the API only accepts to refuse (a 400 that says 'not
// offered') is left out. The server enforces the value rules and the one-of rules (send one of an
// id or a link). Every call raises the request timeout to QVC_TIMEOUT and never lowers a longer
// client timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every qvc call. */
export const QVC_TIMEOUT = 240_000;

export interface QvcSearchOptions {
  /** qvc (default) or hsn. */
  site?: "qvc" | "hsn";
  /** QVC market: us, uk, de, it or jp. Defaults to us. HSN serves the US. */
  market?: "us" | "uk" | "de" | "it" | "jp";
  /** Search keywords, in the market's language. */
  query: string;
  /**
   * qvc: relevance, newest, top_sellers, rating, recently_on_air, price_desc, price_asc (relevance
   * is the default; QVC Japan has no recently_on_air). hsn: featured, best_selling, rating, newest,
   * price_desc, price_asc (featured is the default).
   */
  sort?: "relevance" | "newest" | "top_sellers" | "rating" | "recently_on_air" | "price_desc" | "price_asc" | "featured" | "best_selling";
  /**
   * qvc us, uk, de: facet tokens from a previous answer's facets[].values[].filter (a brand, price
   * band, rating, category...), up to 10.
   */
  filters?: string[] | string;
  /**
   * hsn: a department code from a previous answer's departments[].code (j Jewelry, fa Fashion, ho
   * Home...).
   */
  department?: string;
  /** Results page, 1-based. Defaults to 1; total_pages reports the last one. */
  page?: number;
  /** qvc: 1-96 per page, default 24. hsn: 60 (fixed). */
  page_size?: number;
  [key: string]: unknown;
}

export interface QvcProductOptions {
  /** qvc (default) or hsn. */
  site?: "qvc" | "hsn";
  /** QVC market: us, uk, de, it or jp. Defaults to us. HSN serves the US. */
  market?: "us" | "uk" | "de" | "it" | "jp";
  /**
   * The item number: items[].item_number (QVC US letter + digits, e.g. K341654; QVC UK, DE, IT and
   * JP digits, e.g. 833632; HSN product id, e.g. 23550176).
   */
  item_number?: string;
  /**
   * A product link (qvc.com /p/<name>/<item>, qvcuk.com, qvc.de, qvc.it, qvc.jp, or hsn.com
   * /products/<name>/<id>), instead of item_number.
   */
  url?: string;
  [key: string]: unknown;
}

export interface QvcProductsOptions {
  /** qvc (the default; HSN has none). */
  site?: "qvc";
  /** QVC market: us or it. Defaults to us. HSN serves the US. */
  market?: "us" | "uk" | "de" | "it" | "jp";
  /** Up to 20 item numbers (array or comma-separated). */
  item_numbers: string[] | string;
  [key: string]: unknown;
}

export interface QvcTodaysSpecialOptions {
  /** qvc (default) or hsn. */
  site?: "qvc" | "hsn";
  /** QVC market: us. Defaults to us. HSN serves the US. */
  market?: "us" | "uk" | "de" | "it" | "jp";
  [key: string]: unknown;
}

export interface QvcOnAirOptions {
  /** qvc (the default; HSN has none). */
  site?: "qvc";
  /** QVC market: us. Defaults to us. HSN serves the US. */
  market?: "us" | "uk" | "de" | "it" | "jp";
  [key: string]: unknown;
}

export interface QvcProgramGuideOptions {
  /** qvc (default) or hsn. */
  site?: "qvc" | "hsn";
  /** QVC market: us. Defaults to us. HSN serves the US. */
  market?: "us" | "uk" | "de" | "it" | "jp";
  /**
   * YYYY-MM-DD (US Eastern day). Defaults to today. qvc: 14 days back to 17 ahead, as QVC's guide
   * offers.
   */
  date?: string;
  /** qvc: eastern (default), central, mountain or pacific. */
  time_zone?: "eastern" | "central" | "mountain" | "pacific";
  /**
   * qvc: one channel by code or name (QVC, 2CH / QVC2, STA / QVC3, ONQ / QVC Home, ...). Defaults
   * to all.
   */
  channel?: string;
  /** hsn: hsn (1, default) or hsn2 (4). */
  network?: "hsn" | "hsn2" | 1 | 4;
  [key: string]: unknown;
}

export interface QvcRecentlyAiredOptions {
  /** hsn (QVC is not offered here). */
  site: "hsn";
  /** QVC market: us. Defaults to us. HSN serves the US. */
  market?: "us" | "uk" | "de" | "it" | "jp";
  /** YYYY-MM-DD (Eastern). Defaults to today. */
  date?: string;
  /**
   * Show hour 0-23 (Eastern), with date: a program guide row's items_aired.hour. Defaults to the
   * latest show.
   */
  hour?: number;
  /** hsn (1, default) or hsn2 (4). */
  network?: "hsn" | "hsn2" | 1 | 4;
  [key: string]: unknown;
}

export interface QvcCategoryOptions {
  /** qvc (default) or hsn. */
  site?: "qvc" | "hsn";
  /** QVC market: us. Defaults to us. HSN serves the US. */
  market?: "us" | "uk" | "de" | "it" | "jp";
  /**
   * A qvc.com category or collection link: /c/<name>/-/<group>/c.html or /collections/<name>.html.
   */
  url?: string;
  /** The same link's path, instead of url. */
  path?: string;
  /**
   * relevance, newest, top_sellers, rating, recently_on_air, price_desc, price_asc (relevance is
   * the default).
   */
  sort?: "relevance" | "newest" | "top_sellers" | "rating" | "recently_on_air" | "price_desc" | "price_asc";
  /** Results page, 1-based. Defaults to 1; total_pages reports the last one. */
  page?: number;
  [key: string]: unknown;
}

export interface QvcSuggestionsOptions {
  /** qvc (the default; HSN has none). */
  site?: "qvc";
  /** QVC market: us, uk or de. Defaults to us. HSN serves the US. */
  market?: "us" | "uk" | "de" | "it" | "jp";
  /** What the shopper has typed so far. */
  query: string;
  [key: string]: unknown;
}

export interface QvcReviewsOptions {
  /** qvc (default) or hsn. */
  site?: "qvc" | "hsn";
  /** QVC market: us. Defaults to us. HSN serves the US. */
  market?: "us" | "uk" | "de" | "it" | "jp";
  /**
   * The item number: items[].item_number (QVC US letter + digits, e.g. K341654; QVC UK, DE, IT and
   * JP digits, e.g. 833632; HSN product id, e.g. 23550176).
   */
  item_number?: string;
  /**
   * A product link (qvc.com /p/<name>/<item>, qvcuk.com, qvc.de, qvc.it, qvc.jp, or hsn.com
   * /products/<name>/<id>), instead of item_number.
   */
  url?: string;
  [key: string]: unknown;
}

export class QvcNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = QVC_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/qvc/${path}`, options, undefined, timeout);
  }

  /**
   * Search QVC (qvc.com) and HSN (hsn.com), the video shopping networks of QVC Group. Scavio
   * fetches the public QVC or HSN page on request; neither has a public API. site picks qvc
   * (default) or hsn; market picks the QVC storefront. Costs 1 credit.
   */
  async search(options: QvcSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product of QVC (qvc.com) and HSN (hsn.com), the video shopping networks of QVC Group.
   * Scavio fetches the public QVC or HSN page on request; neither has a public API. site picks qvc
   * (default) or hsn; market picks the QVC storefront. Costs 1 credit.
   */
  async product(options: QvcProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** Up to 20 products of QVC (qvc.com, us; or qvc.it, it) in one call. Costs 1 credit. */
  async products(options: QvcProductsOptions): Promise<Record<string, unknown>> {
    return this.post("products", options);
  }

  /**
   * Today's special of QVC (qvc.com) and HSN (hsn.com), the video shopping networks of QVC Group.
   * Scavio fetches the public QVC or HSN page on request; neither has a public API. site picks qvc
   * (default) or hsn; market picks the QVC storefront. Costs 1 credit.
   */
  async todaysSpecial(options: QvcTodaysSpecialOptions = {}): Promise<Record<string, unknown>> {
    return this.post("todays-special", options);
  }

  /** What is on air now on each QVC channel (QVC, QVC2, QVC3, QVC Home). Costs 1 credit. */
  async onAir(options: QvcOnAirOptions = {}): Promise<Record<string, unknown>> {
    return this.post("on-air", options);
  }

  /**
   * The TV program guide of QVC (qvc.com) and HSN (hsn.com), the video shopping networks of QVC
   * Group. Scavio fetches the public QVC or HSN page on request; neither has a public API. site
   * picks qvc (default) or hsn; market picks the QVC storefront. Costs 1 credit.
   */
  async programGuide(options: QvcProgramGuideOptions = {}): Promise<Record<string, unknown>> {
    return this.post("program-guide", options);
  }

  /** The items HSN presented in one show hour (HSN or HSN2, Eastern time). Costs 1 credit. */
  async recentlyAired(options: QvcRecentlyAiredOptions): Promise<Record<string, unknown>> {
    return this.post("recently-aired", options);
  }

  /** One category or collection grid of QVC (qvc.com, us). Costs 1 credit. */
  async category(options: QvcCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /** The QVC search-box suggestions for a partial query (us, uk, de). Costs 1 credit. */
  async suggestions(options: QvcSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * The first page of reviews of one product of QVC (qvc.com) and HSN (hsn.com), the video shopping
   * networks of QVC Group. Scavio fetches the public QVC or HSN page on request; neither has a
   * public API. site picks qvc (default) or hsn; market picks the QVC storefront: us (qvc.com,
   * USD), uk (qvcuk.com, GBP), de (qvc.de, EUR), it (qvc.it, EUR) or jp (qvc.jp, JPY; QVC Japan is
   * a joint venture). HSN is US only. Data comes in each storefront's language and currency. As the
   * product page shows it: qvc (us) the 8 newest, hsn the 12 highest rated. Costs 1 credit.
   */
  async reviews(options: QvcReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }
}
