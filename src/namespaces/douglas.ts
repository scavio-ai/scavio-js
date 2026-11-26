import type { Scavio } from "../client.js";

// Douglas (douglas.de, the Dusseldorf-based beauty retailer) search, category, brand, deals,
// product, stores, store, reviewSummary, suggestions and brands endpoints; 15 storefronts in 13
// countries; 1 credit each (2 on it). Generated from the backend routes: every option and its doc
// mirrors the API's own request schema; an input the API only accepts to refuse (a 400 that says
// 'not offered') is left out. The server enforces the value rules and the one-of rules (send one of
// an id or a link). Every call raises the request timeout to DOUGLAS_TIMEOUT and never lowers a
// longer client timeout. Failed upstream calls and refused inputs are not charged; a not-found is
// charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every douglas call. */
export const DOUGLAS_TIMEOUT = 250_000;

export interface DouglasSearchOptions {
  /**
   * Keywords, in the storefront's language (required). Some keywords lead to a category or brand
   * page: redirected_to names it.
   */
  query: string;
  /** Page, 1-based (48 products a page; default 1). */
  page?: number;
  /**
   * relevance (default), price_asc, price_desc, newest, top_rated, discount (where the storefront
   * offers it). sorts lists what the page offers; sort_applied says what it answered.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "top_rated" | "discount";
  /** Only these brands: brand codes (e.g. b0690 DIOR, from brands or a brand link). */
  brand_filter?: string | string[];
  /**
   * Only products with Douglas' own sale badge (SALE on de, the discount badge elsewhere). Not
   * every reduced price carries it: was_price shows every reduction. Not offered on ch-de / ch-fr
   * (no such badge there): a 400, not charged.
   */
  sale_only?: boolean;
  /**
   * Any facet: {facet, value} from facets[].facet and facets[].values[].value (e.g.
   * classificationClassName, genderName, flagName). At most 10 values in all.
   */
  filters?: Array<{ facet: string; value: string | string[] }> | Record<string, unknown>;
  /**
   * The Douglas storefront: de (Germany, default), at (Austria), ch-de / ch-fr (Switzerland, German
   * / French), nl (Netherlands), be-nl / be-fr (Belgium, Dutch / French), es (Spain), it (Italy, 2
   * credits), pl (Poland, PLN), cz (Czechia, CZK), sk (Slovakia), hu (Hungary, HUF), ro (Romania,
   * RON), lt (Lithuania). Prices and assortment differ per storefront. pt, hr, si, lv, ee, bg
   * (other shop platforms) and fr (Nocibe) are not offered: a 400, not charged.
   */
  market?: "de" | "at" | "ch-de" | "ch-fr" | "nl" | "be-nl" | "be-fr" | "es" | "it" | "pl" | "cz" | "sk" | "hu" | "ro" | "lt";
  [key: string]: unknown;
}

export interface DouglasCategoryOptions {
  /**
   * A category path ending in its code (parfum/01, make-up/lippen/lippenstift/030503), the code
   * alone (01) or a category link.
   */
  category: string;
  /** Page, 1-based (48 products a page; default 1). */
  page?: number;
  /**
   * relevance (default), price_asc, price_desc, newest, top_rated, discount (where the storefront
   * offers it). sorts lists what the page offers; sort_applied says what it answered.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "top_rated" | "discount";
  /** Only these brands: brand codes (e.g. b0690 DIOR, from brands or a brand link). */
  brand_filter?: string | string[];
  /**
   * Only products with Douglas' own sale badge (SALE on de, the discount badge elsewhere). Not
   * every reduced price carries it: was_price shows every reduction. Not offered on ch-de / ch-fr
   * (no such badge there): a 400, not charged.
   */
  sale_only?: boolean;
  /**
   * Any facet: {facet, value} from facets[].facet and facets[].values[].value (e.g.
   * classificationClassName, genderName, flagName). At most 10 values in all.
   */
  filters?: Array<{ facet: string; value: string | string[] }> | Record<string, unknown>;
  /**
   * The Douglas storefront: de (Germany, default), at (Austria), ch-de / ch-fr (Switzerland, German
   * / French), nl (Netherlands), be-nl / be-fr (Belgium, Dutch / French), es (Spain), it (Italy, 2
   * credits), pl (Poland, PLN), cz (Czechia, CZK), sk (Slovakia), hu (Hungary, HUF), ro (Romania,
   * RON), lt (Lithuania). Prices and assortment differ per storefront. pt, hr, si, lv, ee, bg
   * (other shop platforms) and fr (Nocibe) are not offered: a 400, not charged.
   */
  market?: "de" | "at" | "ch-de" | "ch-fr" | "nl" | "be-nl" | "be-fr" | "es" | "it" | "pl" | "cz" | "sk" | "hu" | "ro" | "lt";
  [key: string]: unknown;
}

export interface DouglasBrandOptions {
  /** A brand code (b0690, from brands), its path (dior/b0690) or a brand link. */
  brand: string;
  /** Page, 1-based (48 products a page; default 1). */
  page?: number;
  /**
   * relevance (default), price_asc, price_desc, newest, top_rated, discount (where the storefront
   * offers it). sorts lists what the page offers; sort_applied says what it answered.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "top_rated" | "discount";
  /** Only these brands: brand codes (e.g. b0690 DIOR, from brands or a brand link). */
  brand_filter?: string | string[];
  /**
   * Only products with Douglas' own sale badge (SALE on de, the discount badge elsewhere). Not
   * every reduced price carries it: was_price shows every reduction. Not offered on ch-de / ch-fr
   * (no such badge there): a 400, not charged.
   */
  sale_only?: boolean;
  /**
   * Any facet: {facet, value} from facets[].facet and facets[].values[].value (e.g.
   * classificationClassName, genderName, flagName). At most 10 values in all.
   */
  filters?: Array<{ facet: string; value: string | string[] }> | Record<string, unknown>;
  /**
   * The Douglas storefront: de (Germany, default), at (Austria), ch-de / ch-fr (Switzerland, German
   * / French), nl (Netherlands), be-nl / be-fr (Belgium, Dutch / French), es (Spain), it (Italy, 2
   * credits), pl (Poland, PLN), cz (Czechia, CZK), sk (Slovakia), hu (Hungary, HUF), ro (Romania,
   * RON), lt (Lithuania). Prices and assortment differ per storefront. pt, hr, si, lv, ee, bg
   * (other shop platforms) and fr (Nocibe) are not offered: a 400, not charged.
   */
  market?: "de" | "at" | "ch-de" | "ch-fr" | "nl" | "be-nl" | "be-fr" | "es" | "it" | "pl" | "cz" | "sk" | "hu" | "ro" | "lt";
  [key: string]: unknown;
}

export interface DouglasDealsOptions {
  /**
   * sale (default: the sale department) or beauty_friday (the Beauty / Black Friday list, while
   * Douglas runs it).
   */
  collection?: "sale" | "beauty_friday";
  /**
   * Or any category (path, code or link): its products with Douglas' sale badge (not on ch-de /
   * ch-fr). Not with collection.
   */
  category?: string;
  /**
   * Also read the storefront's offers page (default true; de, at, ch-de, ch-fr and pl link one).
   */
  include_promotions?: boolean;
  /** Page, 1-based (48 products a page; default 1). */
  page?: number;
  /**
   * relevance (default), price_asc, price_desc, newest, top_rated, discount (where the storefront
   * offers it). sorts lists what the page offers; sort_applied says what it answered.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "top_rated" | "discount";
  /** Only these brands: brand codes (e.g. b0690 DIOR, from brands or a brand link). */
  brand_filter?: string | string[];
  /**
   * Only products with Douglas' own sale badge (SALE on de, the discount badge elsewhere). Not
   * every reduced price carries it: was_price shows every reduction. Not offered on ch-de / ch-fr
   * (no such badge there): a 400, not charged.
   */
  sale_only?: boolean;
  /**
   * Any facet: {facet, value} from facets[].facet and facets[].values[].value (e.g.
   * classificationClassName, genderName, flagName). At most 10 values in all.
   */
  filters?: Array<{ facet: string; value: string | string[] }> | Record<string, unknown>;
  /**
   * The Douglas storefront: de (Germany, default), at (Austria), ch-de / ch-fr (Switzerland, German
   * / French), nl (Netherlands), be-nl / be-fr (Belgium, Dutch / French), es (Spain), it (Italy, 2
   * credits), pl (Poland, PLN), cz (Czechia, CZK), sk (Slovakia), hu (Hungary, HUF), ro (Romania,
   * RON), lt (Lithuania). Prices and assortment differ per storefront. pt, hr, si, lv, ee, bg
   * (other shop platforms) and fr (Nocibe) are not offered: a 400, not charged.
   */
  market?: "de" | "at" | "ch-de" | "ch-fr" | "nl" | "be-nl" | "be-fr" | "es" | "it" | "pl" | "cz" | "sk" | "hu" | "ro" | "lt";
  [key: string]: unknown;
}

export interface DouglasProductOptions {
  /**
   * A Douglas product code: base (base_code, e.g. 5000005003) or variant (items[].code, e.g.
   * 289690).
   */
  code?: string;
  /** Or a Douglas product link (its storefront sets the market). */
  url?: string;
  /**
   * Also look up each variant's EAN (one more call per variant, 1 credit each, 2 on it; up to 10).
   */
  variants_ean?: boolean;
  /**
   * The Douglas storefront: de (Germany, default), at (Austria), ch-de / ch-fr (Switzerland, German
   * / French), nl (Netherlands), be-nl / be-fr (Belgium, Dutch / French), es (Spain), it (Italy, 2
   * credits), pl (Poland, PLN), cz (Czechia, CZK), sk (Slovakia), hu (Hungary, HUF), ro (Romania,
   * RON), lt (Lithuania). Prices and assortment differ per storefront. pt, hr, si, lv, ee, bg
   * (other shop platforms) and fr (Nocibe) are not offered: a 400, not charged.
   */
  market?: "de" | "at" | "ch-de" | "ch-fr" | "nl" | "be-nl" | "be-fr" | "es" | "it" | "pl" | "cz" | "sk" | "hu" | "ro" | "lt";
  [key: string]: unknown;
}

export interface DouglasStoresOptions {
  /** A city or postcode (required): Douglas' own store finder places it. */
  query: string;
  /** Page, 1-based (default 1). */
  page?: number;
  /** Stores a page, 1-50 (default 10). */
  page_size?: number;
  /**
   * The Douglas storefront: de (Germany, default), at (Austria), ch-de / ch-fr (Switzerland, German
   * / French), nl (Netherlands), be-nl / be-fr (Belgium, Dutch / French), es (Spain), it (Italy, 2
   * credits), pl (Poland, PLN), cz (Czechia, CZK), sk (Slovakia), hu (Hungary, HUF), ro (Romania,
   * RON), lt (Lithuania). Prices and assortment differ per storefront. pt, hr, si, lv, ee, bg
   * (other shop platforms) and fr (Nocibe) are not offered: a 400, not charged.
   */
  market?: "de" | "at" | "ch-de" | "ch-fr" | "nl" | "be-nl" | "be-fr" | "es" | "it" | "pl" | "cz" | "sk" | "hu" | "ro" | "lt";
  [key: string]: unknown;
}

export interface DouglasStoreOptions {
  /** A Douglas store id (stores[].store_id; send it as a string, leading zeros count). */
  store_id: string;
  /**
   * The Douglas storefront: de (Germany, default), at (Austria), ch-de / ch-fr (Switzerland, German
   * / French), nl (Netherlands), be-nl / be-fr (Belgium, Dutch / French), es (Spain), it (Italy, 2
   * credits), pl (Poland, PLN), cz (Czechia, CZK), sk (Slovakia), hu (Hungary, HUF), ro (Romania,
   * RON), lt (Lithuania). Prices and assortment differ per storefront. pt, hr, si, lv, ee, bg
   * (other shop platforms) and fr (Nocibe) are not offered: a 400, not charged.
   */
  market?: "de" | "at" | "ch-de" | "ch-fr" | "nl" | "be-nl" | "be-fr" | "es" | "it" | "pl" | "cz" | "sk" | "hu" | "ro" | "lt";
  [key: string]: unknown;
}

export interface DouglasReviewSummaryOptions {
  /** A base product code (product base_code or items[].base_code). */
  code: string;
  /**
   * The Douglas storefront: de (Germany, default), at (Austria), ch-de / ch-fr (Switzerland, German
   * / French), nl (Netherlands), be-nl / be-fr (Belgium, Dutch / French), es (Spain), it (Italy, 2
   * credits), pl (Poland, PLN), cz (Czechia, CZK), sk (Slovakia), hu (Hungary, HUF), ro (Romania,
   * RON), lt (Lithuania). Prices and assortment differ per storefront. pt, hr, si, lv, ee, bg
   * (other shop platforms) and fr (Nocibe) are not offered: a 400, not charged.
   */
  market?: "de" | "at" | "ch-de" | "ch-fr" | "nl" | "be-nl" | "be-fr" | "es" | "it" | "pl" | "cz" | "sk" | "hu" | "ro" | "lt";
  [key: string]: unknown;
}

export interface DouglasSuggestionsOptions {
  /** What a shopper has typed (required). */
  query: string;
  /** Product suggestions, 1-10 (default 10). */
  max?: number;
  /**
   * The Douglas storefront: de (Germany, default), at (Austria), ch-de / ch-fr (Switzerland, German
   * / French), nl (Netherlands), be-nl / be-fr (Belgium, Dutch / French), es (Spain), it (Italy, 2
   * credits), pl (Poland, PLN), cz (Czechia, CZK), sk (Slovakia), hu (Hungary, HUF), ro (Romania,
   * RON), lt (Lithuania). Prices and assortment differ per storefront. pt, hr, si, lv, ee, bg
   * (other shop platforms) and fr (Nocibe) are not offered: a 400, not charged.
   */
  market?: "de" | "at" | "ch-de" | "ch-fr" | "nl" | "be-nl" | "be-fr" | "es" | "it" | "pl" | "cz" | "sk" | "hu" | "ro" | "lt";
  [key: string]: unknown;
}

export interface DouglasBrandsOptions {
  /** Only brands whose name contains this (accents and case ignored). */
  query?: string;
  /** Only brands under this letter (A-Z or #). */
  letter?: string;
  /**
   * The Douglas storefront: de (Germany, default), at (Austria), ch-de / ch-fr (Switzerland, German
   * / French), nl (Netherlands), be-nl / be-fr (Belgium, Dutch / French), es (Spain), it (Italy, 2
   * credits), pl (Poland, PLN), cz (Czechia, CZK), sk (Slovakia), hu (Hungary, HUF), ro (Romania,
   * RON), lt (Lithuania). Prices and assortment differ per storefront. pt, hr, si, lv, ee, bg
   * (other shop platforms) and fr (Nocibe) are not offered: a 400, not charged.
   */
  market?: "de" | "at" | "ch-de" | "ch-fr" | "nl" | "be-nl" | "be-fr" | "es" | "it" | "pl" | "cz" | "sk" | "hu" | "ro" | "lt";
  [key: string]: unknown;
}

export class DouglasNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = DOUGLAS_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/douglas/${path}`, options, undefined, timeout);
  }

  /**
   * Search the products of Douglas (douglas.de, the Dusseldorf-based beauty retailer with about
   * 1,960 stores in Europe), on 15 storefronts in 13 countries (market). Scavio fetches the public
   * page on request; Douglas has no public API. Names and texts come in the storefront's language;
   * prices are numbers in its currency. Keywords with paging (48 a page), sorts (relevance, price,
   * newest, top rated) and the page's filters (brand, SALE flag, product type, gender ... from
   * facets). A keyword Douglas sends to a category or brand page is answered from that page
   * (redirected_to says which). Costs 1 credit; 2 on it (Italy). credits_used in the response is
   * the exact charge.
   */
  async search(options: DouglasSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category of Douglas (douglas.de, the Dusseldorf-based beauty retailer with about 1,960
   * stores in Europe), on 15 storefronts in 13 countries (market). Scavio fetches the public page
   * on request; Douglas has no public API. Names and texts come in the storefront's language;
   * prices are numbers in its currency. By path, code or link, with paging, sorts and filters.
   * Costs 1 credit; 2 on it (Italy). credits_used in the response is the exact charge.
   */
  async category(options: DouglasCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One brand's products on Douglas (douglas.de, the Dusseldorf-based beauty retailer with about
   * 1,960 stores in Europe), on 15 storefronts in 13 countries (market). Scavio fetches the public
   * page on request; Douglas has no public API. Names and texts come in the storefront's language;
   * prices are numbers in its currency. By brand code, path or link (brands lists them), with
   * paging, sorts and filters. Costs 1 credit; 2 on it (Italy). credits_used in the response is the
   * exact charge.
   */
  async brand(options: DouglasBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * The deal lists of Douglas (douglas.de, the Dusseldorf-based beauty retailer with about 1,960
   * stores in Europe), on 15 storefronts in 13 countries (market). Scavio fetches the public page
   * on request; Douglas has no public API. Names and texts come in the storefront's language;
   * prices are numbers in its currency. The sale department (collection sale; on de its SALE-badged
   * products), the Beauty / Black Friday list (collection beauty_friday, while Douglas runs it) or
   * any category's sale-badged products, with paging, sorts and filters; per item the price,
   * Douglas' struck-through price, discount, 30-day lowest price and RRP as shown. With
   * include_promotions (default) also the storefront's offers page: promotions [{kind, headline,
   * text, link_text, url, image, legal_text (validity dates and codes as Douglas words them),
   * labels, updated_at}] (de, at, ch-de, ch-fr, pl; elsewhere null). Costs 1 credit; 2 on it
   * (Italy). credits_used in the response is the exact charge.
   */
  async deals(options: DouglasDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * One product of Douglas (douglas.de, the Dusseldorf-based beauty retailer with about 1,960
   * stores in Europe), on 15 storefronts in 13 countries (market). Scavio fetches the public page
   * on request; Douglas has no public API. Names and texts come in the storefront's language;
   * prices are numbers in its currency. By base or variant code or link. Costs 1 credit; 2 on it
   * (Italy). variants_ean adds 1 credit per variant looked up (2 on it), up to 10. credits_used in
   * the response is the exact charge.
   */
  async product(options: DouglasProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The Douglas stores near a city or postcode on one storefront (Douglas (douglas.de, the
   * Dusseldorf-based beauty retailer with about 1,960 stores in Europe), on 15 storefronts in 13
   * countries (market). Scavio fetches the public page on request; Douglas has no public API. Names
   * and texts come in the storefront's language; prices are numbers in its currency.). Costs 1
   * credit.
   */
  async stores(options: DouglasStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One Douglas store by id (Douglas (douglas.de, the Dusseldorf-based beauty retailer with about
   * 1,960 stores in Europe), on 15 storefronts in 13 countries (market). Scavio fetches the public
   * page on request; Douglas has no public API. Names and texts come in the storefront's language;
   * prices are numbers in its currency.). Costs 1 credit.
   */
  async store(options: DouglasStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * Douglas' own AI-generated summary of a product's customer reviews (Douglas (douglas.de, the
   * Dusseldorf-based beauty retailer with about 1,960 stores in Europe), on 15 storefronts in 13
   * countries (market). Scavio fetches the public page on request; Douglas has no public API. Names
   * and texts come in the storefront's language; prices are numbers in its currency.). Costs 1
   * credit; 2 on it (Italy). credits_used in the response is the exact charge.
   */
  async reviewSummary(options: DouglasReviewSummaryOptions): Promise<Record<string, unknown>> {
    return this.post("review-summary", options);
  }

  /**
   * Douglas' search suggestions for what a shopper has typed (Douglas (douglas.de, the
   * Dusseldorf-based beauty retailer with about 1,960 stores in Europe), on 15 storefronts in 13
   * countries (market). Scavio fetches the public page on request; Douglas has no public API. Names
   * and texts come in the storefront's language; prices are numbers in its currency.). Costs 1
   * credit; 2 on it (Italy). credits_used in the response is the exact charge.
   */
  async suggestions(options: DouglasSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Every brand on one Douglas storefront (about 1,890 on de; Douglas (douglas.de, the
   * Dusseldorf-based beauty retailer with about 1,960 stores in Europe), on 15 storefronts in 13
   * countries (market). Scavio fetches the public page on request; Douglas has no public API. Names
   * and texts come in the storefront's language; prices are numbers in its currency.). Costs 1
   * credit; 2 on it (Italy). credits_used in the response is the exact charge.
   */
  async brands(options: DouglasBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }
}
