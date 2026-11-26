import type { Scavio } from "../client.js";

// Rakuten (rakuten.com, the cashback site formerly Ebates) stores, store, storeCoupons, rates,
// search, suggestions, category, deals and inStore endpoints; country us, gb or ca (English or
// French), 1 credit each. Generated from the backend routes: every option and its doc mirrors the
// API's own request schema; an input the API only accepts to refuse (a 400 that says 'not offered')
// is left out. The server enforces the value rules and the one-of rules (send one of an id or a
// link). Every call raises the request timeout to RAKUTEN_TIMEOUT and never lowers a longer client
// timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every rakuten call. */
export const RAKUTEN_TIMEOUT = 240_000;

export interface RakutenStoresOptions {
  /**
   * Market: us, gb, ca (default us). us = rakuten.com (USD), gb = rakuten.co.uk (GBP), ca =
   * rakuten.ca (CAD).
   */
  country?: "us" | "gb" | "ca";
  /** Rakuten Canada only: en (default) or fr (the /fr/ pages, French text, CAD). */
  language?: "en" | "fr";
  /**
   * us: a Rakuten category slug or id (stores answers its categories list: electronics or 651,
   * clothing or 2, travel-vacations or 54). ca: a Rakuten Canada department (baby-kids-toys,
   * books-music-movies-games, clothing-shoes-accessories, computers-electronics-office, ...). Not
   * on gb (its list has no category filter).
   */
  category?: string | number;
  /**
   * cashback (highest rate first), recommended (Rakuten's order), az or za. Default: the site's own
   * (us cashback, gb az, ca recommended = A to Z).
   */
  sort?: "cashback" | "recommended" | "az" | "za";
  /**
   * ca only: increased (raised rate), top, new, canadian, bnpl (buy now, pay later); several are
   * combined.
   */
  filter?: "increased" | "top" | "new" | "canadian" | "bnpl" | Array<"increased" | "top" | "new" | "canadian" | "bnpl">;
  /** Page, from 1 (36 stores a page). */
  page?: number;
  [key: string]: unknown;
}

export interface RakutenStoreOptions {
  /**
   * Market: us, gb, ca (default us). us = rakuten.com (USD), gb = rakuten.co.uk (GBP), ca =
   * rakuten.ca (CAD).
   */
  country?: "us" | "gb" | "ca";
  /** Rakuten Canada only: en (default) or fr (the /fr/ pages, French text, CAD). */
  language?: "en" | "fr";
  /**
   * The store's Rakuten slug (macys: the path after /shop/ on rakuten.com and rakuten.co.uk;
   * best-buy after / on rakuten.ca), its Rakuten page link, or its numeric store id (us, gb:
   * stores[].store_id).
   */
  store: string | number;
  [key: string]: unknown;
}

export interface RakutenStoreCouponsOptions {
  /**
   * Market: us, gb (default us). us = rakuten.com (USD), gb = rakuten.co.uk (GBP), ca = rakuten.ca
   * (CAD).
   */
  country?: "us" | "gb";
  /**
   * The store's Rakuten slug (macys: the path after /shop/ on rakuten.com and rakuten.co.uk;
   * best-buy after / on rakuten.ca), its Rakuten page link, or its numeric store id (us, gb:
   * stores[].store_id).
   */
  store: string | number;
  /** Page, from 1 (18 coupons a page). */
  page?: number;
  [key: string]: unknown;
}

export interface RakutenRatesOptions {
  /**
   * Market: us, gb (default us). us = rakuten.com (USD), gb = rakuten.co.uk (GBP), ca = rakuten.ca
   * (CAD).
   */
  country?: "us" | "gb";
  /**
   * 1 to 100 Rakuten store ids (stores[].store_id), as an array or comma-separated. Sent on as
   * strings.
   */
  store_ids: Array<string | number> | string;
  [key: string]: unknown;
}

export interface RakutenSearchOptions {
  /**
   * Market: us, gb, ca (default us). us = rakuten.com (USD), gb = rakuten.co.uk (GBP), ca =
   * rakuten.ca (CAD).
   */
  country?: "us" | "gb" | "ca";
  /** Rakuten Canada only: en (default) or fr (the /fr/ pages, French text, CAD). */
  language?: "en" | "fr";
  /** A store, brand or product. */
  query: string;
  /**
   * all (default: top store, stores, coupons, products), stores (every store matching the query,
   * paged on us) or coupons.
   */
  type?: "all" | "stores" | "coupons";
  /** us type stores only: page, from 1 (12 stores a page). */
  page?: number;
  [key: string]: unknown;
}

export interface RakutenSuggestionsOptions {
  /**
   * Market: us (default us). us = rakuten.com (USD), gb = rakuten.co.uk (GBP), ca = rakuten.ca
   * (CAD).
   */
  country?: "us";
  /** What a member types in rakuten.com's search box. */
  query: string;
  [key: string]: unknown;
}

export interface RakutenCategoryOptions {
  /**
   * Market: us (default us). us = rakuten.com (USD), gb = rakuten.co.uk (GBP), ca = rakuten.ca
   * (CAD).
   */
  country?: "us";
  /**
   * A rakuten.com category slug (stores' categories[].slug: electronics, clothing,
   * travel-vacations, home-garden; subcategories such as electronics/computers-tablets).
   */
  category: string;
  /** recommended (default), cashback, az or za. */
  sort?: "cashback" | "recommended" | "az" | "za";
  /** Page, from 1 (36 stores a page). */
  page?: number;
  [key: string]: unknown;
}

export interface RakutenDealsOptions {
  /**
   * Market: us (default us). us = rakuten.com (USD), gb = rakuten.co.uk (GBP), ca = rakuten.ca
   * (CAD).
   */
  country?: "us";
  /** black_friday (default), cyber_monday or coupons (Rakuten's deals and coupons hub). */
  page?: "black_friday" | "cyber_monday" | "coupons";
  /** With page black_friday: a store slug (macys) for that store's own Black Friday page. */
  store?: string;
  [key: string]: unknown;
}

export interface RakutenInStoreOptions {
  /**
   * Market: us (default us). us = rakuten.com (USD), gb = rakuten.co.uk (GBP), ca = rakuten.ca
   * (CAD).
   */
  country?: "us";
  /** Page, from 1 (21 offers a page). */
  page?: number;
  [key: string]: unknown;
}

export class RakutenNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = RAKUTEN_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/rakuten/${path}`, options, undefined, timeout);
  }

  /**
   * The store directory of Rakuten (rakuten.com, the cashback site, formerly Ebates): every store
   * with its current cash back rate. us and gb page Rakuten's all-stores list (36 a page; us
   * filters by category); ca reads Rakuten Canada's whole list (or one department) and filters by
   * flag. Costs 1 credit.
   */
  async stores(options: RakutenStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One store on Rakuten (rakuten.com, the cashback site, formerly Ebates) by slug or id. Costs 1
   * credit.
   */
  async store(options: RakutenStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * Every coupon and deal one store has on Rakuten (rakuten.com, the cashback site, formerly
   * Ebates) (us, gb), 18 a page. Costs 1 credit.
   */
  async storeCoupons(options: RakutenStoreCouponsOptions): Promise<Record<string, unknown>> {
    return this.post("store-coupons", options);
  }

  /**
   * Current cash back rates for up to 100 stores in one call on Rakuten (rakuten.com, the cashback
   * site, formerly Ebates) (us, gb). Costs 1 credit.
   */
  async rates(options: RakutenRatesOptions): Promise<Record<string, unknown>> {
    return this.post("rates", options);
  }

  /**
   * Search Rakuten (rakuten.com, the cashback site, formerly Ebates) for a store, brand or product.
   * type all (us, gb). Costs 1 credit.
   */
  async search(options: RakutenSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** The rakuten.com search box suggestions (us). Costs 1 credit. */
  async suggestions(options: RakutenSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * One rakuten.com category (us): every store with Cash Back in it, 36 a page, sorted recommended,
   * cashback, az or za. Costs 1 credit.
   */
  async category(options: RakutenCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * Rakuten's event pages on rakuten.com (us): black_friday, cyber_monday or the coupons hub, or
   * one store's own Black Friday page. Costs 1 credit.
   */
  async deals(options: RakutenDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /** Rakuten's card-linked in-store offers (us), 21 a page. Costs 1 credit. */
  async inStore(options: RakutenInStoreOptions = {}): Promise<Record<string, unknown>> {
    return this.post("in-store", options);
  }
}
