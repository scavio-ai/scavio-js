import type { Scavio } from "../client.js";

// H&M: 9 endpoints; product() 2 credits, every other endpoint 1. hm.com in 47
// countries (country, default "us") with their languages (language, default
// the market's first): us (USD), ca (CAD; en or fr), mx (MXN; es), gb (GBP),
// ie (EUR; en), de and at (EUR; de), ch (CHF; de, fr or it), fr (EUR), be
// (EUR; nl or fr), nl, it, es, pt (EUR), se (SEK; sv), fi (EUR; fi or sv), dk
// (DKK; da), no (NOK), pl (PLN), cz (CZK; cs), sk (EUR), hu (HUF), ro (RON), bg
// (EUR), gr (EUR; el), rs (RSD; sr), tr (TRY), ua (UAH; uk), il (ILS; he), hk
// and mo (HKD; zh or en), tw (TWD; zh or en), jp (JPY; ja), kr (KRW; ko), in
// (INR), my (MYR), ph (PHP), sg (SGD) (en), vn (VND; vi), au (AUD); and hr, cy,
// ee, lv, lt, lu, si on H&M's shared English EUR store (the answer says store
// "eu"). product() is not served on mo, tw or the shared EU store countries;
// stores() is not served on mo (H&M lists no stores there). Countries where H&M
// runs a separate site (ae, eg, id, th, br, cn) or has no online store, ru, and
// uk (use gb) answer 400 before anything is charged. Every answer carries
// country, language, currency, locale and store.
//
// Article codes are global: the same 10-digit code (7-digit product code +
// 3-digit colour) in every market, so one code compares a price across markets
// with one call per country. Prices are numbers in the market's currency: price
// (what a non-member pays now), regular_price, sale_price, member_price (H&M's
// member price as shown to signed-in members), discount_percent, prior_price
// (the earlier price H&M shows next to an EU markdown). Stock is online stock
// per size, not store stock. No price history: poll to track changes.
//
// The server enforces the cross-field rules: language must be one the market
// serves; product() and production() take article_code or url; stock() takes
// article_code or product_code; lat and lng go together; facet filter values
// must come from the same market's facets. Every call raises the request
// timeout to HM_TIMEOUT (product() can take up to about a minute). Failed
// upstream calls are not charged; a not-found is charged.

/** Minimum request timeout (ms) for every hm call. */
export const HM_TIMEOUT = 120_000;

/** The 40 countries with an H&M online store of their own. */
type HmOwnStoreCountry =
  | "us" | "ca" | "mx" | "gb" | "ie" | "de" | "at" | "ch" | "fr" | "be" | "nl" | "it" | "es" | "pt"
  | "se" | "fi" | "dk" | "no" | "pl" | "cz" | "sk" | "hu" | "ro" | "bg" | "gr" | "rs" | "tr" | "ua"
  | "il" | "hk" | "mo" | "tw" | "jp" | "kr" | "in" | "my" | "ph" | "sg" | "vn" | "au";

/** Countries served by H&M's shared English EUR store (the answer says store "eu"). */
export type HmSharedEuCountry = "hr" | "cy" | "ee" | "lv" | "lt" | "lu" | "si";

/** All 47 markets: search, stock, category, deals, newArrivals, suggestions and production. */
export type HmCountry = HmOwnStoreCountry | HmSharedEuCountry;

/** product() markets: every market except mo, tw and the shared EU store (38). */
export type HmProductCountry = Exclude<HmOwnStoreCountry, "mo" | "tw">;

/** stores() markets: every market except mo (46). */
export type HmStoresCountry = Exclude<HmCountry, "mo">;

/** Each market serves its own languages (see the header comment); another answers 400. */
export type HmLanguage =
  | "en" | "fr" | "es" | "de" | "it" | "nl" | "pt" | "sv" | "fi" | "da" | "no" | "pl" | "cs"
  | "sk" | "hu" | "ro" | "bg" | "el" | "sr" | "tr" | "uk" | "he" | "zh" | "ja" | "ko" | "vi";

/** relevance (default), newest, price_asc or price_desc. */
export type HmSort = "relevance" | "newest" | "price_asc" | "price_desc";

/** women, men, kids, baby or home. */
export type HmDepartment = "women" | "men" | "kids" | "baby" | "home";

type Values = string | string[];

export interface HmMarketOptions<C extends string = HmCountry> {
  /** H&M market. Defaults to "us". */
  country?: C;
  /** Language of the market. Defaults to the market's first. */
  language?: HmLanguage;
}

export interface HmGridOptions {
  /** Results page, 1-based (up to 200). */
  page?: number;
  /** Items per page, 1 to 72 (default 36). */
  page_size?: number;
  /** Sort order. Defaults to "relevance". */
  sort?: HmSort;
  /** Values of the color facet of an earlier answer in the same market (e.g. "black_000000" on us); several are ORed. */
  color?: Values;
  /** Values of the size facet (e.g. "womenswear;NO_FORMAT[Numeric];8"). */
  size?: Values;
  /** Values of the material facet, in the market's language (e.g. "Cotton"). */
  material?: Values;
  /** Values of the fit facet (e.g. "Slim fit"). */
  fit?: Values;
  /** Values of the product_type facet (e.g. "Jeans"). */
  product_type?: Values;
}

export interface HmSearchOptions extends HmMarketOptions, HmGridOptions {
  /** Search keywords in any language, e.g. "jeans", or an article code. */
  query: string;
  /** Only one department. */
  department?: HmDepartment;
  /** A store code from stores() (stores[].store_code, e.g. "US0760"): only that store's assortment. */
  store?: string;
  /** Only marked-down items. */
  on_sale?: boolean;
  [key: string]: unknown;
}

export interface HmArticleRef {
  /** An H&M article code: 10 digits, e.g. "1310382004". The same code in every market. One of article_code or url. */
  article_code?: string;
  /** An hm.com product link (https://www2.hm.com/<locale>/productpage.<article code>.html). */
  url?: string;
}

export interface HmProductOptions extends HmMarketOptions<HmProductCountry>, HmArticleRef {
  [key: string]: unknown;
}

export interface HmStockOptions extends HmMarketOptions {
  /** An H&M article code: 10 digits. One of article_code or product_code. */
  article_code?: string;
  /** An H&M product code: 7 digits (the first 7 of an article code), e.g. "1310382". */
  product_code?: string;
  [key: string]: unknown;
}

export interface HmStoresOptions {
  /** H&M market. Defaults to "us". */
  country?: HmStoresCountry;
  /** Only stores whose city or address contains this (case and accents ignored), e.g. "New York". */
  city?: string;
  /** Only stores whose postal code starts with this. */
  postal_code?: string;
  /** Latitude: stores within radius_km, nearest first (with lng). */
  lat?: number;
  /** Longitude (with lat). */
  lng?: number;
  /** Radius around lat / lng in km (default 25). */
  radius_km?: number;
  /** Results page, 1-based. */
  page?: number;
  /** Stores per page, 1 to 100 (default 20). */
  page_size?: number;
  [key: string]: unknown;
}

export interface HmCategoryOptions extends HmMarketOptions, HmGridOptions {
  /** An H&M category id, the same in every market, e.g. "ladies_dresses", "men_jeans", "kids_all". */
  category: string;
  /** Only marked-down items. */
  on_sale?: boolean;
  [key: string]: unknown;
}

export interface HmDealsOptions extends HmMarketOptions, HmGridOptions {
  /** Department. Defaults to "women". */
  department?: HmDepartment;
  [key: string]: unknown;
}

export interface HmNewArrivalsOptions extends HmDealsOptions {
  /** Only marked-down items. */
  on_sale?: boolean;
}

export interface HmSuggestionsOptions extends HmMarketOptions {
  /** What the shopper has typed so far, e.g. "hoodie". */
  query: string;
  [key: string]: unknown;
}

export interface HmProductionOptions extends HmArticleRef {
  /** H&M market. Defaults to "us"; the disclosure is the same in every market. */
  country?: HmCountry;
  [key: string]: unknown;
}

export class HmNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/hm/${path}`, options, undefined, HM_TIMEOUT);
  }

  /**
   * Search one market's catalog by keyword (an article or product code finds
   * that item): items (article_code, product_code, title, brand, url, price,
   * regular_price, sale_price, member_price, discount_percent, prior_price,
   * currency, promo_text, multipack, color, colors, sizes with online
   * in_stock, in_stock, coming_soon, new_arrival, markers, category, image),
   * count, total, page, page_size, total_pages, sort, sorts_offered, filters,
   * facets, on_sale_count, price_range, departments and did_you_mean.
   *
   * Costs 1 credit.
   */
  async search(options: HmSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One article by article code or link: description, composition,
   * materials, care, attributes, the prices with price_disclosure, colors
   * (every colourway with its own prices), sizes (online in_stock, few_left),
   * sold_in_stores, images, rating (average, count) and the latest reviews
   * H&M shows (up to 10, with fit feedback; no reviewer names). No full
   * review list, per-size store stock or price history. Can take up to about
   * a minute. An article unknown to that market is a charged 404.
   *
   * Costs 2 credits.
   */
  async product(options: HmProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Online stock per size for every colour of a product, by article or
   * product code: colors (article_code, name, sizes with size_code, label,
   * in_stock, few_left), sizes_total and sizes_in_stock. Online stock, not
   * store stock; few_left is null on mo, tw and the shared EU store.
   *
   * Costs 1 credit.
   */
  async stock(options: HmStockOptions): Promise<Record<string, unknown>> {
    return this.post("stock", options);
  }

  /**
   * A country's stores: store_code, name, status, store_class, address, city,
   * state, postal_code, lat, lng, phone, opening_hours, opening_hour_exceptions,
   * departments and campaigns; filtered by city, postal_code or a lat / lng
   * radius (nearest first, with distance_km). Pass a store_code to search()
   * as store.
   *
   * Costs 1 credit.
   */
  async stores(options: HmStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One category grid by H&M's category id (the same ids in every market;
   * items[].category of any answer gives more), with the search grid fields.
   * A category returns everything H&M files under that id, which can be more
   * than the site's curated page. An unknown or empty category is a charged
   * 404.
   *
   * Costs 1 credit.
   */
  async category(options: HmCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * A department's sale grid (default women): every marked-down item with
   * sale_price, regular_price and discount_percent. H&M runs sales in
   * seasons: a market with no sale running answers an empty grid (charged as
   * a normal call).
   *
   * Costs 1 credit.
   */
  async deals(options: HmDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * A department's new-arrivals grid (default women), with the search grid
   * fields, sorts and filters.
   *
   * Costs 1 credit.
   */
  async newArrivals(options: HmNewArrivalsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("new-arrivals", options);
  }

  /**
   * Search suggestions for what a shopper has typed, in the market's
   * language: suggestions (text, type query or content, url for content
   * pages) and count.
   *
   * Costs 1 credit.
   */
  async suggestions(options: HmSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Where an article is made, as H&M publishes it: production_countries and
   * countries (country, suppliers with supplier_id, name and factories with
   * factory_id, name, city and workers range). No street addresses or
   * contacts. An article without a disclosure is a charged 404.
   *
   * Costs 1 credit.
   */
  async production(options: HmProductionOptions): Promise<Record<string, unknown>> {
    return this.post("production", options);
  }
}
