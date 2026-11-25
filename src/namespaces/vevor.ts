import type { Scavio } from "../client.js";

// VEVOR (vevor.com, the tools and equipment seller with storefronts in 13
// countries): 11 endpoints, 1 credit each, prices() 3. credits_used in the
// response is what was charged.
//
// Markets: country is a two-letter storefront code (default us, www.vevor.com)
// and language the storefront language (default its first): us (USD; en, es),
// ca (www.vevor.ca, CAD; en, fr), gb (www.vevor.co.uk, GBP), au
// (www.vevor.com.au, AUD), de, fr, es, it, nl (EUR, each in its own language),
// pl (PLN), mx (MXN, es), no (www.vevor.co.no, EUR) and eu (eur.vevor.com,
// VEVOR's storefront for the other European countries, EUR; en, sv, da, fi,
// no, pt, cs, el, sk, hu, ro). uk is gb. Each storefront language has its own
// search index: send search terms in that language.
//
// Prices are VEVOR's prices on that storefront for a visitor without an
// account, in its own currency (no conversion). The same SKU has its own price
// on each storefront; price and stock do not change by ZIP or state (shipping
// fee and delivery date do: shipping()). was_price is given only while a VEVOR
// deal is active (or VEVOR's page shows its own strikethrough price), otherwise
// null: never compute a discount from it. List totals are exact up to 100,
// then "100+" (total_is_lower_bound). Reviews are one pool shared across
// storefronts and variants (many languages), with no reviewer names. Not
// available: coupon codes (VEVOR shows them only after a claim), the pickup
// store, Pro or bulk prices, financing, the ships-from warehouse, VEVOR's
// listings on other marketplaces, price history, checkout.
//
// The server enforces the cross-field rules: language must be one the
// storefront offers; product() takes sku or url, and a url must be a link of
// the storefront named by country; shipping() needs state for country us and
// province for ca (other storefronts take zip only); pickup is us only;
// collections() type promotion takes url only, and category goes with
// best_sellers only; prices() takes sku only (it asks every storefront). Every
// call raises the request timeout to VEVOR_TIMEOUT. Failed upstream calls and
// refused inputs are not charged; a not-found is charged.

/** Minimum request timeout (ms) for every vevor call: calls can queue behind the server's upstream limit. */
export const VEVOR_TIMEOUT = 240_000;

/** A VEVOR storefront's two-letter code (eu is eur.vevor.com). */
export type VevorCountry =
  | "us" | "ca" | "gb" | "au" | "de" | "fr" | "es" | "it" | "nl" | "pl" | "mx" | "no" | "eu";

/** The storefront language (us: en, es; ca: en, fr; eu: en, sv, da, fi, no, pt, cs, el, sk, hu, ro; every other storefront its own language only). */
export type VevorLanguage =
  | "en" | "es" | "fr" | "de" | "it" | "nl" | "pl" | "no" | "sv" | "da" | "fi" | "pt" | "cs"
  | "el" | "sk" | "hu" | "ro";

/** popular (default, VEVOR's own order), price_low, price_high, hot or new: VEVOR's sort menu. */
export type VevorSort = "popular" | "price_low" | "price_high" | "hot" | "new";

/** highly_rated (4 stars and up) or best_rated (5 stars). */
export type VevorRating = "highly_rated" | "best_rated";

/** recommended (default, VEVOR's own order), newest or helpful. */
export type VevorReviewSort = "recommended" | "newest" | "helpful";

/** best_sellers (default), new (New Arrivals) or promotion (one promotion page: send url). */
export type VevorCollectionType = "best_sellers" | "new" | "promotion";

/** daily_deals (default), clearance or deals (VEVOR's Deals page). */
export type VevorDealType = "daily_deals" | "clearance" | "deals";

/** A VEVOR category: categories[].id (e.g. 40035, Ice Makers) or a VEVOR category link. */
export type VevorCategory = string | number;

export interface VevorMarket {
  /** Defaults to "us" (www.vevor.com). */
  country?: VevorCountry;
  /** Defaults to the storefront's first language. */
  language?: VevorLanguage;
}

export interface VevorListOptions extends VevorMarket {
  /** Page (1-50, 60 items a page). */
  page?: number;
  /** Defaults to "popular". */
  sort?: VevorSort;
}

export interface VevorFilters {
  /** Only items in stock. */
  in_stock?: boolean;
  /** Only items VEVOR lists as on sale. */
  on_sale?: boolean;
  /** Only items in VEVOR's Black Friday filter (offered while VEVOR runs it). */
  black_friday?: boolean;
  /** Only items VEVOR lists with bulk savings. */
  bulk_savings?: boolean;
  /** Only items VEVOR offers for pickup (country us only). */
  pickup?: boolean;
  /** Lowest price, in the storefront's currency. */
  min_price?: number;
  /** Highest price, in the storefront's currency. */
  max_price?: number;
  /** highly_rated (4 stars and up) or best_rated (5 stars). */
  rating?: VevorRating;
}

export interface VevorSearchOptions extends VevorListOptions, VevorFilters {
  /** Keywords in the storefront language (e.g. "welder" on us), or a VEVOR SKU. */
  q: string;
  /** Only items in this category (categories[].id, e.g. 40339, or a category link). */
  category?: VevorCategory;
  [key: string]: unknown;
}

export interface VevorProductOptions extends VevorMarket {
  /** A VEVOR SKU (items[].sku, e.g. "DHJMIGMMAMIGLL6WNV5"). Send sku or url. */
  sku?: string;
  /** A VEVOR product link (items[].url) instead of sku; it must be a link of the storefront named by country. */
  url?: string;
  [key: string]: unknown;
}

export interface VevorShippingOptions extends VevorMarket {
  /** A VEVOR SKU (items[].sku). */
  sku: string;
  /** Required for country us: the two-letter US state (e.g. "NY"). VEVOR's fee and delivery date depend on it. */
  state?: string;
  /** Required for country ca: the two-letter Canadian province (e.g. "ON"). */
  province?: string;
  /** Optional: the ZIP or postcode (US: 5 digits; Canada: e.g. "M5V 2T6"). */
  zip?: string;
  /** Optional: the city. */
  city?: string;
  [key: string]: unknown;
}

export interface VevorReviewsOptions extends VevorMarket {
  /** A VEVOR SKU (items[].sku). */
  sku: string;
  /** Page (default 1). */
  page?: number;
  /** Reviews per page (1-100, default 20). */
  page_size?: number;
  /** Defaults to "recommended". */
  sort?: VevorReviewSort;
  /** Only reviews with this many stars (1-5). */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Only reviews with photos or videos. */
  photos_only?: boolean;
  /** Only reviews of this exact SKU (VEVOR shares reviews across a product's variants). */
  this_variant_only?: boolean;
  [key: string]: unknown;
}

export interface VevorQuestionsOptions extends VevorMarket {
  /** A VEVOR SKU (items[].sku). */
  sku: string;
  /** Page (5 questions a page). */
  page?: number;
  [key: string]: unknown;
}

export interface VevorSuggestionsOptions extends VevorMarket {
  /** The text typed so far, in the storefront language (e.g. "ice"). */
  q: string;
  [key: string]: unknown;
}

export interface VevorCategoriesOptions extends VevorMarket {
  /** One category (categories[].id or a category link): its sub-categories. Without it: every department. */
  category?: VevorCategory;
  [key: string]: unknown;
}

export interface VevorCategoryOptions extends VevorListOptions, VevorFilters {
  /** A VEVOR category: categories[].id (e.g. 40035, Ice Makers) or a VEVOR category link. */
  category: VevorCategory;
  [key: string]: unknown;
}

export interface VevorCollectionsOptions extends VevorListOptions {
  /** Defaults to "best_sellers". */
  type?: VevorCollectionType;
  /** With type best_sellers only: only this category (categories[].id). */
  category?: VevorCategory;
  /** With type promotion: a VEVOR promotion page link (https://www.vevor.com/promotion/<name>-special-<id>.html). */
  url?: string;
  [key: string]: unknown;
}

export interface VevorDealsOptions extends VevorListOptions {
  /** Defaults to "daily_deals". */
  type?: VevorDealType;
  /** Only this category (categories[].id). */
  category?: VevorCategory;
  [key: string]: unknown;
}

export interface VevorPricesOptions {
  /** A VEVOR SKU (items[].sku). prices() asks every storefront: no country or language. */
  sku: string;
  [key: string]: unknown;
}

export class VevorNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/vevor/${path}`, options, undefined, VEVOR_TIMEOUT);
  }

  /** Search by keywords in the storefront language or a SKU (60 a page): price, was price during a deal, deal end, stock units; sorts and filters. 1 credit. */
  async search(options: VevorSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One product by SKU or link: price, deal window, stock units, variants with their own price and stock, specs, rating breakdown. 1 credit. */
  async product(options: VevorProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** Shipping fee, free shipping flag and delivery dates for one SKU to a US state (required on us), Canadian province (required on ca) or postcode. 1 credit. */
  async shipping(options: VevorShippingOptions): Promise<Record<string, unknown>> {
    return this.post("shipping", options);
  }

  /** Reviews of one product, up to 100 a page, sorted and filtered (stars, photos, this exact SKU); one pool shared across storefronts. 1 credit. */
  async reviews(options: VevorReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /** Customer questions on one product with their answers, 5 a page (VEVOR's own answers flagged). 1 credit. */
  async questions(options: VevorQuestionsOptions): Promise<Record<string, unknown>> {
    return this.post("questions", options);
  }

  /** VEVOR's search suggestions for typed text. 1 credit. */
  async suggestions(options: VevorSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /** VEVOR's category tree (departments, categories, sub-categories) or one branch, with ids. 1 credit. */
  async categories(options: VevorCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /** One category listing, sorted, filtered and paged like search (60 a page). 1 credit. */
  async category(options: VevorCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /** Best Sellers (optionally one category), New Arrivals or one promotion page. 1 credit. */
  async collections(options: VevorCollectionsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("collections", options);
  }

  /** Daily Deals, Clearance or the Deals page, optionally one category; deal end times as VEVOR gives them. 1 credit. */
  async deals(options: VevorDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /** The same SKU on all 13 storefronts: status, price, was price, deal end and stock units, each in its own currency. 3 credits. */
  async prices(options: VevorPricesOptions): Promise<Record<string, unknown>> {
    return this.post("prices", options);
  }
}
