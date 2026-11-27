import type { Scavio } from "../client.js";

// L.L.Bean (llbean.com, the US outdoor apparel and gear retailer) search, category, categories,
// product, storeStock, stores, reviews, review_summary, deliveryEstimate, suggestions and deals
// endpoints; market us, ca (CAD) or intl (12 countries, local currency) for the catalog, US for
// stores and reviews, 1 credit each. Generated from the backend routes: every option and its doc
// mirrors the API's own request schema; an input the API only accepts to refuse (a 400 that says
// 'not offered') is left out. The server enforces the value rules and the one-of rules (send one of
// an id or a link). Every call raises the request timeout to LLBEAN_TIMEOUT and never lowers a
// longer client timeout. Failed upstream calls and refused inputs are not charged; a not-found is
// charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every llbean call. */
export const LLBEAN_TIMEOUT = 240_000;

export interface LlbeanSearchOptions {
  /** Search keywords. */
  query: string;
  /**
   * us (www.llbean.com, USD; the default), ca (www.llbean.ca, CAD, English) or intl
   * (global.llbean.com, local currency; needs country).
   */
  market?: "us" | "ca" | "intl";
  /**
   * With market intl: gb, de, fr, nl, au, mx, ch, se, cn, br, in, sg. Each answers in that
   * country's currency.
   */
  country?: "gb" | "de" | "fr" | "nl" | "au" | "mx" | "ch" | "se" | "cn" | "br" | "in" | "sg";
  /** Results page, 1-based, 48 per page. total_pages reports the last one. */
  page?: number;
  /** relevance (default), price_asc, price_desc, best_selling, newest or top_rated. */
  sort?: "relevance" | "price_asc" | "price_desc" | "best_selling" | "newest" | "top_rated";
  /**
   * Facet filters, at most 8 keys: {key: value or [values]} (values of one key are OR-ed). Keys:
   * color, size, brand, gender, and on us sale, price, discount, width, department, category,
   * material, shoe_size, features, new; or any facets[].key of an answer, with values exactly as
   * facets[].values[].value (e.g. {"price": "0 TO 30"} on us, {"color": "Black"} on ca and intl).
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface LlbeanCategoryOptions {
  /**
   * A category id: categories[].category_id (us) or a storefront link's /llb/shop/<id> (474 is US
   * Footwear; 32 is Sale on every storefront).
   */
  category_id: string | number;
  /**
   * us (www.llbean.com, USD; the default), ca (www.llbean.ca, CAD, English) or intl
   * (global.llbean.com, local currency; needs country).
   */
  market?: "us" | "ca" | "intl";
  /**
   * With market intl: gb, de, fr, nl, au, mx, ch, se, cn, br, in, sg. Each answers in that
   * country's currency.
   */
  country?: "gb" | "de" | "fr" | "nl" | "au" | "mx" | "ch" | "se" | "cn" | "br" | "in" | "sg";
  /** Results page, 1-based, 48 per page. total_pages reports the last one. */
  page?: number;
  /** relevance (default), price_asc, price_desc, best_selling, newest or top_rated. */
  sort?: "relevance" | "price_asc" | "price_desc" | "best_selling" | "newest" | "top_rated";
  /**
   * Facet filters, at most 8 keys: {key: value or [values]} (values of one key are OR-ed). Keys:
   * color, size, brand, gender, and on us sale, price, discount, width, department, category,
   * material, shoe_size, features, new; or any facets[].key of an answer, with values exactly as
   * facets[].values[].value (e.g. {"price": "0 TO 30"} on us, {"color": "Black"} on ca and intl).
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface LlbeanCategoriesOptions {
  /** us (the default); this endpoint serves the US storefront. */
  market?: "us";
  /** Optional: return this one department or category with its children. */
  category_id?: string | number;
  [key: string]: unknown;
}

export interface LlbeanProductOptions {
  /** The product id (items[].product_id; the number after /llb/shop/ in a product link). */
  product_id: string | number;
  /**
   * us (www.llbean.com, USD; the default), ca (www.llbean.ca, CAD, English) or intl
   * (global.llbean.com, local currency; needs country).
   */
  market?: "us" | "ca" | "intl";
  /**
   * With market intl: gb, de, fr, nl, au, mx, ch, se, cn, br, in, sg. Each answers in that
   * country's currency.
   */
  country?: "gb" | "de" | "fr" | "nl" | "au" | "mx" | "ch" | "se" | "cn" | "br" | "in" | "sg";
  [key: string]: unknown;
}

export interface LlbeanStoreStockOptions {
  /** us (the default); this endpoint serves the US storefront. */
  market?: "us";
  /**
   * An item id: product items[].item_id (one fit or size range of a product, e.g. Medium of the
   * Boat and Tote).
   */
  item_id: string | number;
  /**
   * Optional, the item's product: labels each SKU with its color, size and price (one more upstream
   * call, same 1 credit).
   */
  product_id?: string | number;
  /** Up to 20 stores (stores[].store_id). */
  store_ids?: Array<string | number>;
  /** true: every store, instead of store_ids. */
  all_stores?: boolean;
  [key: string]: unknown;
}

export interface LlbeanStoresOptions {
  /** us (the default); this endpoint serves the US storefront. */
  market?: "us";
  /** US ZIP: stores ordered by distance. */
  zip?: string | number;
  /** Latitude (with longitude). */
  latitude?: number;
  /** Longitude (with latitude). */
  longitude?: number;
  /** Miles around latitude + longitude, 1-500. Defaults to 100. */
  radius?: number;
  /** US city (with state). */
  city?: string;
  /** 2-letter state code (with city). */
  state?: string;
  /** Store ids. */
  store_ids?: Array<string | number>;
  /** true: every L.L.Bean store. */
  all_stores?: boolean;
  /** Stores to return, 1-75. Defaults to 10 near a place. */
  limit?: number;
  [key: string]: unknown;
}

export interface LlbeanReviewsOptions {
  /** us (the default); this endpoint serves the US storefront. */
  market?: "us";
  /** The product id. */
  product_id: string | number;
  /** newest (default), helpful, rating_desc or rating_asc. */
  sort?: "newest" | "helpful" | "rating_desc" | "rating_asc";
  /** Page, 1-based. */
  page?: number;
  /** Reviews per page, 1-100. Defaults to 20. */
  limit?: number;
  /**
   * Review filters: rating (star rating 1-5), height and weight (reviewer bands, values from
   * stats.context) and text (words in the review).
   */
  filters?: { rating?: number; height?: string; weight?: string; text?: string };
  [key: string]: unknown;
}

export interface LlbeanReviewSummaryOptions {
  /** us (the default); this endpoint serves the US storefront. */
  market?: "us";
  /** The product id. */
  product_id: string | number;
  [key: string]: unknown;
}

export interface LlbeanDeliveryEstimateOptions {
  /** us (the default); this endpoint serves the US storefront. */
  market?: "us";
  /** An item id (product items[].item_id). */
  item_id: string | number;
  /** US ZIP code. */
  zip: string | number;
  [key: string]: unknown;
}

export interface LlbeanSuggestionsOptions {
  /** What the shopper has typed so far. */
  query: string;
  /** us (default) or ca. */
  market?: "us" | "ca";
  [key: string]: unknown;
}

export interface LlbeanDealsOptions {
  /**
   * us (www.llbean.com, USD; the default), ca (www.llbean.ca, CAD, English) or intl
   * (global.llbean.com, local currency; needs country).
   */
  market?: "us" | "ca" | "intl";
  /**
   * With market intl: gb, de, fr, nl, au, mx, ch, se, cn, br, in, sg. Each answers in that
   * country's currency.
   */
  country?: "gb" | "de" | "fr" | "nl" | "au" | "mx" | "ch" | "se" | "cn" | "br" | "in" | "sg";
  /** Results page, 1-based, 48 per page. total_pages reports the last one. */
  page?: number;
  /** relevance (default), price_asc, price_desc, best_selling, newest or top_rated. */
  sort?: "relevance" | "price_asc" | "price_desc" | "best_selling" | "newest" | "top_rated";
  /**
   * Facet filters, at most 8 keys: {key: value or [values]} (values of one key are OR-ed). Keys:
   * color, size, brand, gender, and on us sale, price, discount, width, department, category,
   * material, shoe_size, features, new; or any facets[].key of an answer, with values exactly as
   * facets[].values[].value (e.g. {"price": "0 TO 30"} on us, {"color": "Black"} on ca and intl).
   */
  filters?: Record<string, unknown>;
  /** On us: the Sale page's % Off filter, one of 20, 30, 40, 50, 60, 70 (N% & Up). */
  min_discount?: number;
  [key: string]: unknown;
}

export class LlbeanNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = LLBEAN_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/llbean/${path}`, options, undefined, timeout);
  }

  /**
   * Search L.L.Bean (llbean.com, the US outdoor apparel and gear retailer). Scavio fetches the
   * public L.L.Bean page on request; L.L.Bean has no public API. By keyword on market us
   * (www.llbean.com, USD), ca (www.llbean.ca, CAD) or intl with a country (global.llbean.com, local
   * currency); prices as shown to a visitor who is not signed in, never a member or card price.
   * Sorted (relevance, price, best selling, newest, top rated), 48 per page, filtered by any facet.
   * A keyword the site sends to a category (e.g. boots) comes back with redirected_to and the sort,
   * page and filters applied. Costs 1 credit.
   */
  async search(options: LlbeanSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category of L.L.Bean (llbean.com, the US outdoor apparel and gear retailer). Scavio fetches
   * the public L.L.Bean page on request; L.L.Bean has no public API. By category id on market us
   * (www.llbean.com, USD), ca (www.llbean.ca, CAD) or intl with a country (global.llbean.com, local
   * currency); prices as shown to a visitor who is not signed in, never a member or card price.
   * Sorted and filtered like search. Costs 1 credit.
   */
  async category(options: LlbeanCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The department menu of L.L.Bean (llbean.com, the US outdoor apparel and gear retailer). Scavio
   * fetches the public L.L.Bean page on request; L.L.Bean has no public API. US storefront
   * (www.llbean.com, USD). categories [{category_id, name, slug, url, children}] (11 departments,
   * about 570 nodes), or one department with category_id. 1 credit. A not-found is charged; failed
   * upstream calls and refused inputs are not. Usually 2-15 s; set a client timeout of at least 90
   * s. Costs 1 credit.
   */
  async categories(options: LlbeanCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One product of L.L.Bean (llbean.com, the US outdoor apparel and gear retailer). Scavio fetches
   * the public L.L.Bean page on request; L.L.Bean has no public API. On us. Costs 1 credit.
   */
  async product(options: LlbeanProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Exact store units of one item of L.L.Bean (llbean.com, the US outdoor apparel and gear
   * retailer). Scavio fetches the public L.L.Bean page on request; L.L.Bean has no public API. US
   * storefront (www.llbean.com, USD). For up to 20 stores or every store. Costs 1 credit.
   */
  async storeStock(options: LlbeanStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /**
   * The stores of L.L.Bean (llbean.com, the US outdoor apparel and gear retailer). Scavio fetches
   * the public L.L.Bean page on request; L.L.Bean has no public API. US storefront (www.llbean.com,
   * USD). Near a ZIP, a point (radius) or a city + state, by store ids, or all. Costs 1 credit.
   */
  async stores(options: LlbeanStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * Written reviews of one product of L.L.Bean (llbean.com, the US outdoor apparel and gear
   * retailer). Scavio fetches the public L.L.Bean page on request; L.L.Bean has no public API. US
   * storefront (www.llbean.com, USD). In 4 sorts, up to 100 per page, filtered by stars, reviewer
   * height or weight band, or words. Costs 1 credit.
   */
  async reviews(options: LlbeanReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * L.L.Bean's own summary of the reviews of one product of L.L.Bean (llbean.com, the US outdoor
   * apparel and gear retailer). Scavio fetches the public L.L.Bean page on request; L.L.Bean has no
   * public API. US storefront (www.llbean.com, USD). summary, disclaimer and created_at as given. A
   * product without one is a charged 404. 1 credit. A not-found is charged; failed upstream calls
   * and refused inputs are not. Usually 2-15 s; set a client timeout of at least 90 s. Costs 1
   * credit.
   */
  async reviewSummary(options: LlbeanReviewSummaryOptions): Promise<Record<string, unknown>> {
    return this.post("review-summary", options);
  }

  /**
   * The standard delivery date of one item of L.L.Bean (llbean.com, the US outdoor apparel and gear
   * retailer). Scavio fetches the public L.L.Bean page on request; L.L.Bean has no public API. US
   * storefront (www.llbean.com, USD). To a US ZIP. Costs 1 credit.
   */
  async deliveryEstimate(options: LlbeanDeliveryEstimateOptions): Promise<Record<string, unknown>> {
    return this.post("delivery-estimate", options);
  }

  /**
   * The search-box suggestions of L.L.Bean (llbean.com, the US outdoor apparel and gear retailer).
   * Scavio fetches the public L.L.Bean page on request; L.L.Bean has no public API. On us. Costs 1
   * credit.
   */
  async suggestions(options: LlbeanSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * The Sale category of L.L.Bean (llbean.com, the US outdoor apparel and gear retailer). Scavio
   * fetches the public L.L.Bean page on request; L.L.Bean has no public API. On market us
   * (www.llbean.com, USD), ca (www.llbean.ca, CAD) or intl with a country (global.llbean.com, local
   * currency); prices as shown to a visitor who is not signed in, never a member or card price.
   * Sorted and filtered like search; on us also by % Off (min_discount 20-70). The site gives no
   * end dates for sale items. Costs 1 credit.
   */
  async deals(options: LlbeanDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }
}
