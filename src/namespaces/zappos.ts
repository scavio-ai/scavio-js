import type { Scavio } from "../client.js";

// Zappos (zappos.com, the US shoe and clothing store) and 6pm (6pm.com, its outlet site, chosen
// with site) search, product, reviews, questions, lowestPrices, categories and suggestions
// endpoints; US only, prices in USD, 1 credit each. Generated from the backend routes: every option
// and its doc mirrors the API's own request schema; an input the API only accepts to refuse (a 400
// that says 'not offered') is left out. The server enforces the value rules and the one-of rules
// (send one of an id or a link). Every call raises the request timeout to ZAPPOS_TIMEOUT and never
// lowers a longer client timeout. Failed upstream calls and refused inputs are not charged; a
// not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every zappos call. */
export const ZAPPOS_TIMEOUT = 240_000;

export interface ZapposSearchOptions {
  /**
   * zappos (www.zappos.com, the default) or 6pm (www.6pm.com, the Zappos outlet site). Both are US
   * stores in USD with the same product, style and stock ids; prices and stock differ between them,
   * so every answer names its site.
   */
  site?: "zappos" | "6pm";
  /** Search keywords. Leave out to browse the whole catalog (narrowed by facets). */
  query?: string;
  /**
   * Facet filters, ONE value per facet (the site matches one value of a facet at a time): {facet:
   * value}, up to 12. Names: brand (as facets[].values[].name lists it), brand_id (a Zappos brand
   * id, e.g. 26), gender (Women, Men, Girls, Boys), department (e.g. Shoes), category (e.g. Boots),
   * subcategory (e.g. Running Shoes), color (e.g. Black), price (a price band as listed, e.g. "$100
   * and Under"; 6pm has its own bands), on_sale (true), size and width (with gender Men or Women,
   * e.g. {"gender": "Men", "size": "10", "width": "Wide"}), or any facet field an answer lists in
   * facets[].field (txAttrFacet_Materials, txAttrFacet_Features, hc_men_size, ...). Values are
   * matched as the site writes them; an unknown value is an empty answer.
   */
  facets?: Record<string, unknown>;
  /**
   * relevance (default; the site's own order), price_asc, price_desc, percent_off, rating, newest
   * (new arrivals) or best_sellers: the site's sort menu.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "percent_off" | "rating" | "newest" | "best_sellers";
  /**
   * all (default) or sale: items on sale, sorted by percent off unless sort is set (the site's sale
   * page is the same listing).
   */
  mode?: "all" | "sale";
  /**
   * Results page, 1-based (default 1). A page past the last one is an empty items list with the
   * real total.
   */
  page?: number;
  /** Items per page, 1 to 100 (default 50). */
  limit?: number;
  [key: string]: unknown;
}

export interface ZapposProductOptions {
  /**
   * zappos (www.zappos.com, the default) or 6pm (www.6pm.com, the Zappos outlet site). Both are US
   * stores in USD with the same product, style and stock ids; prices and stock differ between them,
   * so every answer names its site.
   */
  site?: "zappos" | "6pm";
  /**
   * A Zappos product id (items[].product_id; the number after /product/ in a Zappos link). The same
   * on 6pm.
   */
  product_id?: string;
  /** A style (one color) id instead of product_id (items[].style_id). */
  style_id?: string;
  /** A stock id (one size of one color, skus[].stock_id) instead of product_id. */
  stock_id?: string;
  /** An ASIN (skus[].asin) instead of product_id. */
  asin?: string;
  [key: string]: unknown;
}

export interface ZapposReviewsOptions {
  /**
   * zappos (the default). 6pm (6pm.com) has none of its own: site 6pm is a 400 that says so, not
   * charged.
   */
  site?: "zappos" | "6pm";
  /**
   * A Zappos product id (items[].product_id; the number after /product/ in a Zappos link). The same
   * on 6pm.
   */
  product_id: string;
  /** Reviews page, 1-based, 25 reviews per page (total_pages says how many). */
  page?: number;
  /** best (default; most helpful first) or latest. */
  sort?: "best" | "latest";
  [key: string]: unknown;
}

export interface ZapposQuestionsOptions {
  /**
   * zappos (the default). 6pm (6pm.com) has none of its own: site 6pm is a 400 that says so, not
   * charged.
   */
  site?: "zappos" | "6pm";
  /**
   * A Zappos product id (items[].product_id; the number after /product/ in a Zappos link). The same
   * on 6pm.
   */
  product_id: string;
  [key: string]: unknown;
}

export interface ZapposLowestPricesOptions {
  /**
   * zappos (the default). 6pm (6pm.com) has none of its own: site 6pm is a 400 that says so, not
   * charged.
   */
  site?: "zappos" | "6pm";
  /**
   * A Zappos product id (items[].product_id; the number after /product/ in a Zappos link). The same
   * on 6pm.
   */
  product_id: string;
  [key: string]: unknown;
}

export interface ZapposCategoriesOptions {
  /**
   * zappos (www.zappos.com, the default) or 6pm (www.6pm.com, the Zappos outlet site). Both are US
   * stores in USD with the same product, style and stock ids; prices and stock differ between them,
   * so every answer names its site.
   */
  site?: "zappos" | "6pm";
  /** A department (categories[].name of the top level) to list its categories. */
  department?: string;
  /** A category to list its subcategories (with department, or alone). */
  category?: string;
  [key: string]: unknown;
}

export interface ZapposSuggestionsOptions {
  /**
   * zappos (www.zappos.com, the default) or 6pm (www.6pm.com, the Zappos outlet site). Both are US
   * stores in USD with the same product, style and stock ids; prices and stock differ between them,
   * so every answer names its site.
   */
  site?: "zappos" | "6pm";
  /** A partial search query. */
  query: string;
  [key: string]: unknown;
}

export class ZapposNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = ZAPPOS_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/zappos/${path}`, options, undefined, timeout);
  }

  /**
   * Search Zappos (zappos.com, the US shoe and clothing store, an Amazon company), or 6pm (6pm.com,
   * the Zappos outlet site) with site 6pm. Scavio fetches the public page on request; Zappos has no
   * public API. Keywords (or the whole catalog), ONE value per facet (brand, brand id, gender,
   * department, category, subcategory, size, width, color, price band, on sale, any attribute
   * facet), sorted by relevance, price, percent off, rating, newest or best sellers; mode sale
   * lists items on sale by percent off. Costs 1 credit.
   */
  async search(options: ZapposSearchOptions = {}): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product of Zappos (zappos.com, the US shoe and clothing store, an Amazon company), or 6pm
   * (6pm.com, the Zappos outlet site) with site 6pm. Scavio fetches the public page on request;
   * Zappos has no public API. By product_id, style_id, stock_id or asin. Costs 1 credit.
   */
  async product(options: ZapposProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Customer reviews of one Zappos product (zappos.com; 6pm has none of its own), 25 per page, most
   * helpful first or latest. Costs 1 credit.
   */
  async reviews(options: ZapposReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * The customer questions of one Zappos product (zappos.com; 6pm has none of its own), all in one
   * answer. Costs 1 credit.
   */
  async questions(options: ZapposQuestionsOptions): Promise<Record<string, unknown>> {
    return this.post("questions", options);
  }

  /**
   * The lowest price of each style (color) of one Zappos product as Zappos gives it for its product
   * page (zappos.com). Costs 1 credit.
   */
  async lowestPrices(options: ZapposLowestPricesOptions): Promise<Record<string, unknown>> {
    return this.post("lowest-prices", options);
  }

  /**
   * The department > category > subcategory tree of Zappos (zappos.com, the US shoe and clothing
   * store, an Amazon company), or 6pm (6pm.com, the Zappos outlet site) with site 6pm. Scavio
   * fetches the public page on request; Zappos has no public API. One level per call with item
   * counts: the departments, the categories of a department, or the subcategories of a category.
   * Costs 1 credit.
   */
  async categories(options: ZapposCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * The search-box suggestions of Zappos (zappos.com, the US shoe and clothing store, an Amazon
   * company), or 6pm (6pm.com, the Zappos outlet site) with site 6pm. Scavio fetches the public
   * page on request; Zappos has no public API. Up to 10 keyword completions for a partial query.
   * Costs 1 credit.
   */
  async suggestions(options: ZapposSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
