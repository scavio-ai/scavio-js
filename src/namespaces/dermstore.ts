import type { Scavio } from "../client.js";

// Dermstore (dermstore.com, the US skincare and beauty retailer, shipping to
// the US and Canada): 7 endpoints, 1 credit each. credits_used in the
// response is what was charged.
//
// Markets: country is us (default, prices in USD, shipping to the US) or ca
// (Dermstore's own Canadian dollar prices, shipping to Canada; not converted).
// Every answer carries market {country, currency, shipping_destination}.
//
// rrp is Dermstore's RRP as given; discount_percent is computed by Scavio
// from price and rrp, only when the RRP is above the price. offer is
// Dermstore's own promotion text (code, gift, end date inside the text), as
// given; code rates differ by brand. A keyword Dermstore maps to one of its
// pages (sunscreen, retinol, eltamd) returns that page's products, reported in
// resolved_from. Variants (shades, sizes, strengths) carry their own price and
// stock. offers() gives the end time Dermstore states (ends); Dermstore gives
// no start date. Not available: a full review feed or review paging
// (product() returns the 10 latest reviews only, no reviewer names), Q&A,
// member (VIP) prices, cart or checkout prices, price history, offer start
// dates.
//
// The server enforces the cross-field rules: list() takes path or url,
// product() takes sku or url; page x page_size stays within 10,000
// positions. Every call raises the request timeout to DERMSTORE_TIMEOUT.
// Failed upstream calls and refused inputs are not charged; a not-found (an
// unknown SKU or list path) is charged.

/** Minimum request timeout (ms) for every dermstore call: calls can queue behind the server's upstream limit. */
export const DERMSTORE_TIMEOUT = 240_000;

/** The market: us (USD, default) or ca (Dermstore's own CAD prices). */
export type DermstoreCountry = "us" | "ca";

/** relevance (default), popularity, price_low, price_high, name, newest or discount (highest percent off first). */
export type DermstoreSort = "relevance" | "popularity" | "price_low" | "price_high" | "name" | "newest" | "discount";

/** One value or a list of up to 10, as Dermstore lists them. */
export type DermstoreValues = string | string[];

export interface DermstoreListFilters {
  /** Page (default 1). At most 10,000 positions (page x page_size). */
  page?: number;
  /** Products per page (1-200, default 60). */
  page_size?: number;
  /** Defaults to "relevance". */
  sort?: DermstoreSort;
  /** Brand as Dermstore names it (exact, e.g. "EltaMD"): facets[filter=brand].options[].value. */
  brand?: DermstoreValues;
  /** Skin type, e.g. "Dry Skin". */
  skin_type?: DermstoreValues;
  /** Skin concern, e.g. "Aging". */
  concern?: DermstoreValues;
  /** SPF band, e.g. "SPF 30+". */
  spf?: DermstoreValues;
  /** Key ingredient, e.g. "Retinol". */
  key_ingredient?: DermstoreValues;
  /** Preference, e.g. "Clean". */
  preference?: DermstoreValues;
  /** Gender as Dermstore lists it. */
  gender?: DermstoreValues;
  /** Lowest price, in the market's currency. */
  min_price?: number;
  /** Highest price, in the market's currency. */
  max_price?: number;
  /** Lowest average star rating (1-5). */
  min_rating?: number;
  /** Lowest percent off Dermstore's RRP (0-100). */
  min_discount?: number;
  /** Highest percent off Dermstore's RRP (0-100). */
  max_discount?: number;
  /** Also return Dermstore's filter counts for the results (facets). Still 1 credit. */
  include_facets?: boolean;
  /** Defaults to "us". */
  country?: DermstoreCountry;
}

export interface DermstoreSearchOptions extends DermstoreListFilters {
  /** Keywords or a Dermstore SKU (e.g. "uv clear spf 46"). */
  q: string;
  [key: string]: unknown;
}

export interface DermstoreListOptions extends DermstoreListFilters {
  /** A Dermstore list page path, e.g. "/brands/eltamd", "/sale", "/shop/black-friday/30-off". Send path or url. */
  path?: string;
  /** A Dermstore list page link (https://www.dermstore.com/c/<page>/) instead of path. */
  url?: string;
  [key: string]: unknown;
}

export interface DermstoreProductOptions {
  /** A Dermstore SKU (items[].sku or variants[].sku, e.g. "11289609"). Send sku or url. */
  sku?: string | number;
  /** A Dermstore product link (https://www.dermstore.com/p/<name>/<sku>/) instead of sku. */
  url?: string;
  /** Defaults to "us". */
  country?: DermstoreCountry;
  [key: string]: unknown;
}

export interface DermstoreSuggestionsOptions {
  /** The text typed so far (e.g. "eltamd"). */
  q: string;
  /** Defaults to "us". */
  country?: DermstoreCountry;
  [key: string]: unknown;
}

export interface DermstoreMarketOptions {
  /** Defaults to "us". */
  country?: DermstoreCountry;
  [key: string]: unknown;
}

export interface DermstoreBrandsOptions extends DermstoreMarketOptions {
  /** Only brands under this letter (A-Z, or 0-9). */
  letter?: string;
}

export class DermstoreNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/dermstore/${path}`, options, undefined, DERMSTORE_TIMEOUT);
  }

  /** Search by keywords or SKU: price, RRP, discount_percent, offer text, rating; 7 sorts, filters, facets; resolved_from for a mapped keyword. */
  async search(options: DermstoreSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** Any Dermstore list page by path or link: a category, brand, /sale, an offer page, gift sets or an ingredient page. */
  async list(options: DermstoreListOptions): Promise<Record<string, unknown>> {
    return this.post("list", options);
  }

  /** One product by SKU or link: variants with their own price and stock, UPC, offer banner, auto-replenish, the 10 latest reviews. */
  async product(options: DermstoreProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** Search-box suggestions: terms, corrections and up to 5 products. */
  async suggestions(options: DermstoreSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /** Dermstore's current offers: code, gift, spend threshold, end time and the list page of the products. */
  async offers(options: DermstoreMarketOptions = {}): Promise<Record<string, unknown>> {
    return this.post("offers", options);
  }

  /** The A-Z brand directory (about 235 brands), optionally one letter. */
  async brands(options: DermstoreBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /** The category tree as Dermstore's site navigation shows it. */
  async categories(options: DermstoreMarketOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }
}
