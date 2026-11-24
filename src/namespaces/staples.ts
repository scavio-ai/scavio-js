import type { Scavio } from "../client.js";

// Staples (staples.com, the US office supply retailer; Staples Canada at
// staples.ca): 12 endpoints, 1 credit each. credits_used in the response is
// what was charged.
//
// Markets: country us (default, www.staples.com, USD) or ca (www.staples.ca,
// Staples Canada, CAD) with language en (default) or fr (ca only), on search()
// and product() only. Every other method is US only. With ca, search() returns
// Staples Canada's top matches (about 5; no paging, sort or filters) and
// product() takes item_id, handle or a staples.ca link.
//
// Prices are national: the ZIP changes delivery availability and dates, the
// store changes pickup units, neither changes the price. Price and was price
// come as Staples shows them (was_price is Staples' Regular price, given only
// when above the price); discount_percent is computed by Scavio from the two.
// price_per_unit_text is Staples' own ("$5.00/Ream", "$0.10 Cost Per Page");
// product() adds page_yield, sheets_per_ream, promotions and offer_expires
// (Staples' own texts and expiry) and coupon_codes. storeStock() lists only
// the stores near a US ZIP that have the item for pickup, with units as Staples
// reports them and the threshold value Staples returns beside them, as given;
// an empty list means no nearby store has it or it is not offered for store
// pickup. staples.com publishes no UPC (model is the manufacturer part
// number); Staples Canada products carry a barcode. reviews() pages up to 100
// a page with verified and incentivized flags and no reviewer names. Not
// available: the weekly ad, search suggestions, print and tech service prices,
// ink recycling rewards, Rewards member prices, price match requests, Staples
// Business Advantage contract prices, price history (poll and store the
// answers), checkout.
//
// The server enforces the cross-field rules: language fr needs country ca;
// product() takes item_id, url or (ca) handle; deals() needs q or category;
// stores() needs zip or city. Every call raises the request timeout to
// STAPLES_TIMEOUT. Failed upstream calls and refused inputs are not charged; a
// not-found is charged.

/** Minimum request timeout (ms) for every staples call: calls can queue behind the server's upstream limit. */
export const STAPLES_TIMEOUT = 240_000;

/** us (default: www.staples.com, USD) or ca (www.staples.ca, Staples Canada, CAD: search and product only). */
export type StaplesCountry = "us" | "ca";

/** en (default) or fr (country ca only: www.staples.ca/fr). */
export type StaplesLanguage = "en" | "fr";

/** A Staples item number (items[].item_id, the number after product_ in a staples.com link, e.g. "122374"). */
export type StaplesItemId = string | number;

/** A Staples store number (stores[].store_number, e.g. "1633"). */
export type StaplesStore = string | number;

/** best_match (default), price_low, price_high, rating (top rated) or newest: Staples' sort menu. */
export type StaplesSort = "best_match" | "price_low" | "price_high" | "rating" | "newest";

/** on_promotion or clearance: Staples' deals filters. */
export type StaplesDealType = "on_promotion" | "clearance";

/** most_relevant (default, Staples' order), newest, oldest, highest_rating, lowest_rating or most_helpful. */
export type StaplesReviewSort = "most_relevant" | "newest" | "oldest" | "highest_rating" | "lowest_rating" | "most_helpful";

/** newest (default) or most_answered. */
export type StaplesQuestionSort = "newest" | "most_answered";

export interface StaplesMarket {
  /** Defaults to "us". */
  country?: StaplesCountry;
  /** Defaults to "en"; "fr" needs country ca. */
  language?: StaplesLanguage;
}

export interface StaplesListOptions {
  /** Page (1-250; 40 products a page). */
  page?: number;
  /** Defaults to "best_match". */
  sort?: StaplesSort;
  /** One or more brands (up to 5) as Staples names them (the Brand facet's values, e.g. "Hammermill"). */
  brand?: string | string[];
  /** Up to 10 facet values exactly as an earlier answer gives them in facets[].values[].filter; several are combined. */
  filters?: string[];
  /** Lowest price (USD). */
  min_price?: number;
  /** Highest price (USD). */
  max_price?: number;
}

export interface StaplesSearchOptions extends StaplesListOptions, StaplesMarket {
  /** Keywords ("copy paper", "hp 64xl"), a model number or a Staples item number (an item number answers with that product). */
  q: string;
  /** Only products in Staples' On Promotion or Clearance deals filter. */
  deal?: StaplesDealType;
  [key: string]: unknown;
}

export interface StaplesProductOptions extends StaplesMarket {
  /** A Staples item number (e.g. "122374"). Send item_id, url or (ca) handle. */
  item_id?: StaplesItemId;
  /** A staples.com product link (items[].url), or with country ca a staples.ca product link, instead of item_id. */
  url?: string;
  /** With country ca: a Staples Canada product handle (items[].handle of a ca search). */
  handle?: string;
  /** A US ZIP code (e.g. "10001"): delivery availability and dates for it (price does not change with it). */
  zip?: string | number;
  /** A Staples store number: that store's pickup units. */
  store?: StaplesStore;
  [key: string]: unknown;
}

export interface StaplesCategoryOptions extends StaplesListOptions {
  /** A Staples class id (CL..., e.g. "CL140691" Copy & Printer Paper) or a staples.com category link (/<name>/cat_CL<id>). */
  category: string;
  /** Only products in Staples' On Promotion or Clearance deals filter. */
  deal?: StaplesDealType;
  [key: string]: unknown;
}

export interface StaplesCategoriesOptions {
  /** A department id (SC, CG or DP, e.g. "SC1676" Paper): its sub-departments and classes. Without it: Staples' top-level departments. */
  category?: string;
  [key: string]: unknown;
}

export interface StaplesDealsOptions extends StaplesListOptions {
  /** Defaults to "on_promotion". */
  type?: StaplesDealType;
  /** Deals matching these keywords, e.g. "laptop" (q or category is required). */
  q?: string;
  /** Deals in this class (a CL id or a staples.com category link). */
  category?: string;
  [key: string]: unknown;
}

export interface StaplesCouponsOptions {
  /** Only coupons of this category, as Staples names it (categories of an earlier answer, e.g. "Printers"). */
  category?: string;
  [key: string]: unknown;
}

export interface StaplesStoreStockOptions {
  /** A Staples item number (e.g. "2724258"). */
  item_id: StaplesItemId;
  /** A US ZIP code (e.g. "60540"). stores() gives the ZIP codes of the stores near a city. */
  zip: string | number;
  /** Miles around the ZIP (1-100, default 100). */
  radius?: number;
  [key: string]: unknown;
}

export interface StaplesStoresOptions {
  /** A US ZIP code (e.g. "10001"). Send zip or city. */
  zip?: string | number;
  /** A US city and state, e.g. "Chicago, IL", instead of zip. */
  city?: string;
  /** Miles around the location (1-100, default 25). */
  radius?: number;
  [key: string]: unknown;
}

export interface StaplesStoreOptions {
  /** A Staples store number (e.g. "1574"). */
  store: StaplesStore;
  [key: string]: unknown;
}

export interface StaplesReviewsOptions {
  /** A Staples item number (e.g. "24430099"). */
  item_id: StaplesItemId;
  /** Page (1-based). */
  page?: number;
  /** Reviews per page (1-100, default 10). */
  limit?: number;
  /** Defaults to "most_relevant". */
  sort?: StaplesReviewSort;
  /** Only reviews with this many stars (1-5). */
  rating?: number;
  /** Only reviews with photos. */
  photos_only?: boolean;
  [key: string]: unknown;
}

export interface StaplesQuestionsOptions {
  /** A Staples item number (e.g. "990119"). */
  item_id: StaplesItemId;
  /** Page (1-based; 10 questions a page). */
  page?: number;
  /** Defaults to "newest". */
  sort?: StaplesQuestionSort;
  [key: string]: unknown;
}

export interface StaplesTrendingOptions {
  [key: string]: unknown;
}

export class StaplesNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/staples/${path}`, options, undefined, STAPLES_TIMEOUT);
  }

  /** Search by keywords, a model number or an item number: 40 a page, price, was price, Staples' own price per unit, facets. Canada: top matches. 1 credit. */
  async search(options: StaplesSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One product in full: price per unit, page yield, promotions with expiry, coupon codes, variants, delivery for a ZIP, pickup units at a store. 1 credit. */
  async product(options: StaplesProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** One class listing by CL id or link, sorted, filtered and paged. 1 credit. */
  async category(options: StaplesCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /** Staples' top-level departments, or one department's sub-departments and classes. 1 credit. */
  async categories(options: StaplesCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /** On Promotion or Clearance products for keywords or a class. 1 credit. */
  async deals(options: StaplesDealsOptions): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /** The coupons on Staples' coupons page: code, headline, details, end date. 1 credit. */
  async coupons(options: StaplesCouponsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("coupons", options);
  }

  /** Units of one item at the stores near a US ZIP that have it for pickup, as Staples reports them. 1 credit. */
  async storeStock(options: StaplesStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /** The stores near a US ZIP or city: address, phone, hours, services. 1 credit. */
  async stores(options: StaplesStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /** One store by store number. 1 credit. */
  async store(options: StaplesStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /** One item's reviews, up to 100 a page, sorted and filtered by stars or photos. 1 credit. */
  async reviews(options: StaplesReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /** One item's customer questions with their answers, 10 a page. 1 credit. */
  async questions(options: StaplesQuestionsOptions): Promise<Record<string, unknown>> {
    return this.post("questions", options);
  }

  /** The trending searches Staples shows in its search box. 1 credit. */
  async trending(options: StaplesTrendingOptions = {}): Promise<Record<string, unknown>> {
    return this.post("trending", options);
  }
}
