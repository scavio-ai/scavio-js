import type { Scavio } from "../client.js";

// Maisons du Monde: 9 endpoints, 1 credit each. Markets (country, default
// "fr") and languages (language, default the market's first): fr (French), be
// (French or Dutch), lu (French), nl (Dutch), de (German), es (Spanish), it
// (Italian), pt (Portuguese), all in EUR, and ch (French, German or Italian) in
// CHF. search(), product(), category(), deals() and reviews() serve all nine;
// stores(), store() and availability() serve fr, be, de, es, it, pt and ch (no
// store finder on nl or lu); seller() and the seller / sold_by filters serve
// the marketplace markets fr, de, es and it. Every answer carries country,
// language and currency.
//
// Prices are numbers in the market's currency, never converted: Switzerland is
// priced separately in CHF and the euro markets shared one price per product
// (measured on 2026-11-14 on 4 products). was_price is the crossed-out price
// shown next to a discount. Maisons du Monde shows no 30-day lowest price and
// no price history.
//
// The server enforces the cross-field rules: language must be one the market
// serves; product() takes id or url; category() takes category or
// category_url; store() takes store_id or url; seller() takes seller_id or url.
// Every call raises the request timeout to MAISONSDUMONDE_TIMEOUT. Failed
// upstream calls are not charged; a not-found is charged.

/** Minimum request timeout (ms) for every maisonsdumonde call. */
export const MAISONSDUMONDE_TIMEOUT = 120_000;

/** fr, be, lu, nl, de, es, it, pt (EUR) or ch (CHF). */
export type MaisonsDuMondeCountry = "fr" | "be" | "lu" | "nl" | "de" | "es" | "it" | "pt" | "ch";

/** Markets with a store finder: stores(), store(), availability(). */
export type MaisonsDuMondeStoreCountry = "fr" | "be" | "de" | "es" | "it" | "pt" | "ch";

/** Markets with marketplace sellers: seller() and the seller / sold_by filters. */
export type MaisonsDuMondeMarketplaceCountry = "fr" | "de" | "es" | "it";

/** be fr / nl, ch fr / de / it; every other market has one language. */
export type MaisonsDuMondeLanguage = "fr" | "nl" | "de" | "es" | "it" | "pt";

/** relevance (default), price_asc, price_desc or rating (customer rating). */
export type MaisonsDuMondeSort = "relevance" | "price_asc" | "price_desc" | "rating";

/** newest (default), rating_desc or rating_asc. */
export type MaisonsDuMondeReviewSort = "newest" | "rating_desc" | "rating_asc";

/** black_friday (default; every market while it runs) or second_chance (fr only). */
export type MaisonsDuMondeDealEvent = "black_friday" | "second_chance";

export interface MaisonsDuMondeMarketOptions<C extends string = MaisonsDuMondeCountry> {
  /** Market. Defaults to "fr". */
  country?: C;
  /** Language of the market's site. Defaults to the market's first (be fr, ch fr). */
  language?: MaisonsDuMondeLanguage;
}

export interface MaisonsDuMondeGridOptions extends MaisonsDuMondeMarketOptions {
  /** Results page, 1-based, 40 items per page (at most 250 pages). */
  page?: number;
  /** Sort order. Defaults to "relevance". The German site does not sort keyword results. */
  sort?: MaisonsDuMondeSort;
  /** Lowest price, in the market's currency. */
  price_min?: number;
  /** Highest price, in the market's currency. */
  price_max?: number;
  /** Only discounted items. */
  on_sale?: boolean;
  /** Only items at least this many percent off. */
  min_discount?: 20 | 30 | 40 | 50;
  /** Only items in stock online. */
  in_stock?: boolean;
  /** 5 = five stars only, 4 / 3 = that many stars and up. */
  min_rating?: 3 | 4 | 5;
  /** 1 to 5 color option ids (facet c). */
  color?: string | string[];
  /** 1 to 5 material option ids (facet f). */
  material?: string | string[];
  /** 1 to 5 style option ids (facet st). */
  style?: string | string[];
  /** 1 to 5 brand option ids (facet bra), e.g. "BRAND_MAISONS_DU_MONDE". */
  brand?: string | string[];
  /** One marketplace seller's items: seller.code, e.g. "BESTMOBILIER". fr, de, es and it only. */
  seller?: string;
  /** "mdm": only items sold by Maisons du Monde itself. fr, de, es and it only. */
  sold_by?: "mdm";
  /** Any other facet, keyed by facets[].id with option ids, e.g. {nbs: ["CAPACITY_2_places"]}; dimension ranges (dd, dh, dw) as "min-max" in cm. */
  filters?: Record<string, string | string[]>;
}

export interface MaisonsDuMondeSearchOptions extends MaisonsDuMondeGridOptions {
  /** Search keywords, in the market's language, e.g. "table" (fr) or "couchtisch" (de). */
  query: string;
  [key: string]: unknown;
}

export interface MaisonsDuMondeProductOptions extends MaisonsDuMondeMarketOptions {
  /** A product reference: digits (e.g. "186339") or M + digits for marketplace items. One of id or url. */
  id?: string;
  /** A product page of any market (its market and language are used unless country / language are sent). */
  url?: string;
  [key: string]: unknown;
}

export interface MaisonsDuMondeCategoryOptions extends MaisonsDuMondeGridOptions {
  /** A category hash (the same on every market), e.g. "canapes-n4dc562d7bb509362a3a2102db4cbf90b6454f1f". One of category or category_url. */
  category?: string;
  /** A category page of any market (filters in it are kept). */
  category_url?: string;
  [key: string]: unknown;
}

export interface MaisonsDuMondeDealsOptions extends MaisonsDuMondeGridOptions {
  /** Sale event. Defaults to "black_friday". */
  event?: MaisonsDuMondeDealEvent;
  /** A category hash: its discounted items instead of an event. */
  category?: string;
  /** A category page of any market: its discounted items instead of an event. */
  category_url?: string;
  [key: string]: unknown;
}

export interface MaisonsDuMondeReviewsOptions extends MaisonsDuMondeMarketOptions {
  /** A Maisons du Monde product reference, e.g. "186339". */
  id: string;
  /** Sort order. Defaults to "newest". The site has no star filter. */
  sort?: MaisonsDuMondeReviewSort;
  /** next_cursor of the previous answer (keep the same sort). */
  cursor?: string;
  /** Reviews per page, 1 to 30 (default 10). */
  limit?: number;
  [key: string]: unknown;
}

export interface MaisonsDuMondeStoresOptions extends MaisonsDuMondeMarketOptions<MaisonsDuMondeStoreCountry> {
  /** A postcode of the market: 5 digits on fr / de / es / it (e.g. "75011"), 4 on be / ch, 1000-001 on pt. */
  postcode: string;
  /** Stores to return, nearest first (1 to 10, default 10). */
  limit?: number;
  [key: string]: unknown;
}

export interface MaisonsDuMondeStoreOptions extends MaisonsDuMondeMarketOptions<MaisonsDuMondeStoreCountry> {
  /** A store id (stores[].id), e.g. "41". One of store_id or url. */
  store_id?: string;
  /** A store page (stores[].url). */
  url?: string;
  [key: string]: unknown;
}

export interface MaisonsDuMondeAvailabilityOptions extends MaisonsDuMondeMarketOptions<MaisonsDuMondeStoreCountry> {
  /** A Maisons du Monde item reference (digits; marketplace items are not stocked in stores), e.g. "204172". */
  id: string;
  /** A store id from stores() (stores[].id), e.g. "125". */
  store_id: string;
  [key: string]: unknown;
}

export interface MaisonsDuMondeSellerOptions extends MaisonsDuMondeMarketOptions<MaisonsDuMondeMarketplaceCountry> {
  /** A marketplace seller id (a product's seller.id), e.g. "2066". One of seller_id or url. */
  seller_id?: string;
  /** A seller page (seller.url). */
  url?: string;
  /** Catalog page, 1-based, 40 items per page. */
  page?: number;
  /** Catalog sort. Defaults to "relevance". */
  sort?: MaisonsDuMondeSort;
  [key: string]: unknown;
}

export class MaisonsDuMondeNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/maisonsdumonde/${path}`, options, undefined, MAISONSDUMONDE_TIMEOUT);
  }

  /**
   * Search Maisons du Monde by keyword, 40 per page: items with id, name,
   * collection, brand, url, image, price, was_price, discount_percent,
   * currency, eco_participation (fr), badges, rating, review_count, sold_by
   * (mdm or marketplace), offer_id, sponsored, condition, store_only and
   * purchase_status; also count, sponsored_count, total (exact), page,
   * total_pages, sort, sorts_offered, applied_filters, facets and
   * redirected_to (a keyword that names a category answers that category).
   * The German site does not sort keyword results (relevance order + note).
   *
   * Costs 1 credit.
   */
  async search(options: MaisonsDuMondeSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product by id or url: gtin13, price, was_price, discount_percent,
   * eco_participation (fr), badges, stock (status and online quantity),
   * sold_by, seller (marketplace items), variants, dimensions, weight,
   * materials, made_in, characteristics, composition, assembly, care,
   * documents, images, breadcrumbs, categories, description, rating,
   * review_count, review_summary, questions and markets (the same product's
   * URL on every other market). An unknown product, or one not sold in that
   * market, is a charged 404.
   *
   * Costs 1 credit.
   */
  async product(options: MaisonsDuMondeProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One category's products (40 per page) by category hash or category_url,
   * with the search sorts and filters: category (id, name, url, breadcrumbs)
   * and the grid fields. The hash is the same on every market.
   *
   * Costs 1 credit.
   */
  async category(options: MaisonsDuMondeCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * A sale event's products: black_friday (default) or second_chance (fr:
   * used and returned items), or a category's discounted items (category /
   * category_url): event (type, name, url, category_id) and the grid fields.
   * An event that is not running is a charged 404.
   *
   * Costs 1 credit.
   */
  async deals(options: MaisonsDuMondeDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * A product's reviews, pooled across every market and shown translated
   * into the request language: rating, review_count, rating_histogram,
   * criteria and reviews (rating, text, date, author, country,
   * source_market, syndicated, criteria, brand_reply, images), plus
   * next_cursor. A product with no reviews is a charged 404.
   *
   * Costs 1 credit.
   */
  async reviews(options: MaisonsDuMondeReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * Up to 10 stores nearest a postcode: id, name, address, postcode, city,
   * lat, lng, distance_km, url, open_now, hours and click_collect. fr, be,
   * de, es, it, pt and ch.
   *
   * Costs 1 credit.
   */
  async stores(options: MaisonsDuMondeStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One store by store_id or url: address, phone, lat, lng, hours, services,
   * click_collect and hours_today. fr, be, de, es, it, pt and ch.
   *
   * Costs 1 credit.
   */
  async store(options: MaisonsDuMondeStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * One item's stock at one store plus the delivery options: in_stock,
   * quantity, stock_text, display_model, click_collect, on_shelf and
   * delivery (home, store_pickup, in_store with from_price). Home delivery
   * is a from-price per product and market (no postcode-exact cost).
   * Maisons du Monde items only. fr, be, de, es, it, pt and ch.
   *
   * Costs 1 credit.
   */
  async availability(options: MaisonsDuMondeAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.post("availability", options);
  }

  /**
   * A marketplace seller by seller_id or url: seller (id, name, code,
   * rating, review_count, orders, member_since, order_approval, shipping,
   * returns, description) plus the seller's catalog as a grid. fr, de, es
   * and it.
   *
   * Costs 1 credit.
   */
  async seller(options: MaisonsDuMondeSellerOptions): Promise<Record<string, unknown>> {
    return this.post("seller", options);
  }
}
