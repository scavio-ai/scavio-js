import type { Scavio } from "../client.js";

// Drogasil and Droga Raia (drogasil.com.br, drogaraia.com.br, the pharmacy chains of RD Saude;
// chosen with site) search, category, categories, product, prices, storeAvailability, stores,
// storesSearch, reviews, deals and suggestions endpoints; Brazil only, prices in BRL, store pickup
// yes or no, 1 credit each. Generated from the backend routes: every option and its doc mirrors the
// API's own request schema; an input the API only accepts to refuse (a 400 that says 'not offered')
// is left out. The server enforces the value rules and the one-of rules (send one of an id or a
// link). Every call raises the request timeout to RDSAUDE_TIMEOUT and never lowers a longer client
// timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every rdsaude call. */
export const RDSAUDE_TIMEOUT = 240_000;

export interface RdsaudeSearchOptions {
  /** Keywords, a product code or an EAN, in Portuguese as shoppers type them. */
  query: string;
  /**
   * drogasil (the default, www.drogasil.com.br) or drogaraia (www.drogaraia.com.br). Prices,
   * category ids, stores and reviews differ per banner.
   */
  site?: "drogasil" | "drogaraia";
  /**
   * relevance (the default), price_asc or price_desc. The price sort uses the search index's price
   * (index_price), which can differ from the live price.
   */
  sort?: "relevance" | "price_asc" | "price_desc";
  /** Results page, from 1. reachable_pages reports the last page the site's search reaches. */
  page?: number;
  /** 24 (the default), 36 or 48, the site's own page sizes. */
  page_size?: 24 | 36 | 48;
  /** A brand as facets[name=filters.Marca].values lists it. */
  brand?: string;
  /** own (sold by Drogasil / Droga Raia) or partner (marketplace partner stores). */
  seller?: "own" | "partner";
  /**
   * A highlight as facets[name=filters.Destaques].values lists it: "Oferta do Dia", "% Especial",
   * "Black Friday", a coupon such as "Cupom NIVEABRAND", ...
   */
  highlight?: string;
  /** Products of this category (categories[].id or items[].categories[].id). */
  category_id?: string | number;
  /** Products offered for pickup at this store (stores[].store_id). */
  store_id?: string | number;
  /** Lowest index price in BRL. */
  min_price?: number;
  /** Highest index price in BRL. */
  max_price?: number;
  /**
   * Other filters, at most 8: {facet name: value} exactly as facets[].name and
   * facets[].values[].value of an answer list them.
   */
  facets?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface RdsaudeCategoryOptions {
  /** A category id (categories[].id). Send category_id or url. */
  category_id?: string | number;
  /** Or a category page link (its host sets site). */
  url?: string;
  /**
   * drogasil (the default, www.drogasil.com.br) or drogaraia (www.drogaraia.com.br). Prices,
   * category ids, stores and reviews differ per banner.
   */
  site?: "drogasil" | "drogaraia";
  /**
   * relevance (the default), price_asc or price_desc. The price sort uses the search index's price
   * (index_price), which can differ from the live price.
   */
  sort?: "relevance" | "price_asc" | "price_desc";
  /** Results page, from 1. reachable_pages reports the last page the site's search reaches. */
  page?: number;
  /** 24 (the default), 36 or 48, the site's own page sizes. */
  page_size?: 24 | 36 | 48;
  /** A brand as facets[name=filters.Marca].values lists it. */
  brand?: string;
  /** own (sold by Drogasil / Droga Raia) or partner (marketplace partner stores). */
  seller?: "own" | "partner";
  /**
   * A highlight as facets[name=filters.Destaques].values lists it: "Oferta do Dia", "% Especial",
   * "Black Friday", a coupon such as "Cupom NIVEABRAND", ...
   */
  highlight?: string;
  /** Products offered for pickup at this store (stores[].store_id). */
  store_id?: string | number;
  /** Lowest index price in BRL. */
  min_price?: number;
  /** Highest index price in BRL. */
  max_price?: number;
  /**
   * Other filters, at most 8: {facet name: value} exactly as facets[].name and
   * facets[].values[].value of an answer list them.
   */
  facets?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface RdsaudeCategoriesOptions {
  /**
   * drogasil (the default, www.drogasil.com.br) or drogaraia (www.drogaraia.com.br). Prices,
   * category ids, stores and reviews differ per banner.
   */
  site?: "drogasil" | "drogaraia";
  [key: string]: unknown;
}

export interface RdsaudeProductOptions {
  /** A product code (items[].sku). Send sku or url. */
  sku?: string | number;
  /** Or a product page link on either site (its host sets site). */
  url?: string;
  /**
   * drogasil (the default, www.drogasil.com.br) or drogaraia (www.drogaraia.com.br). Prices,
   * category ids, stores and reviews differ per banner.
   */
  site?: "drogasil" | "drogaraia";
  [key: string]: unknown;
}

export interface RdsaudePricesOptions {
  /** 1 to 48 product codes. */
  skus: Array<string | number>;
  /**
   * drogasil (the default, www.drogasil.com.br) or drogaraia (www.drogaraia.com.br). Prices,
   * category ids, stores and reviews differ per banner.
   */
  site?: "drogasil" | "drogaraia";
  [key: string]: unknown;
}

export interface RdsaudeStoreAvailabilityOptions {
  /** Product codes or EANs. */
  skus: Array<string | number>;
  /** Store ids (stores[].store_id). At most 5 product x store checks per call. */
  store_ids: Array<string | number>;
  /**
   * drogasil (the default, www.drogasil.com.br) or drogaraia (www.drogaraia.com.br). Prices,
   * category ids, stores and reviews differ per banner.
   */
  site?: "drogasil" | "drogaraia";
  [key: string]: unknown;
}

export interface RdsaudeStoresOptions {
  /** A Brazilian CEP (8 digits). */
  cep: string | number;
  /**
   * drogasil (the default, www.drogasil.com.br) or drogaraia (www.drogaraia.com.br). Prices,
   * category ids, stores and reviews differ per banner.
   */
  site?: "drogasil" | "drogaraia";
  [key: string]: unknown;
}

export interface RdsaudeStoresSearchOptions {
  /** A state: UF code (SP, RJ, RS, ...) or name. */
  state?: string;
  /** A city (needs state). */
  city?: string;
  /** A neighborhood (needs state and city). */
  neighborhood?: string;
  /** The locator's free-text search (fuzzy). */
  query?: string;
  /** Stores open 24 hours. */
  open_24h?: boolean;
  /** Stores with parking. */
  parking?: boolean;
  /** Stores in the Farmacia Popular program. */
  farmacia_popular?: boolean;
  /** Results page, from 1. */
  page?: number;
  /** Stores per page, 1-50 (default 20). */
  page_size?: number;
  /**
   * drogasil (the default, www.drogasil.com.br) or drogaraia (www.drogaraia.com.br). Prices,
   * category ids, stores and reviews differ per banner.
   */
  site?: "drogasil" | "drogaraia";
  [key: string]: unknown;
}

export interface RdsaudeReviewsOptions {
  /** A product code (items[].sku). */
  sku: string | number;
  /** Reviews with this many stars. */
  rating?: number;
  /** Reviews per page, 1-50 (default 20). */
  page_size?: number;
  /** next_cursor of the previous page. */
  cursor?: string;
  /**
   * drogasil (the default, www.drogasil.com.br) or drogaraia (www.drogaraia.com.br). Prices,
   * category ids, stores and reviews differ per banner.
   */
  site?: "drogasil" | "drogaraia";
  [key: string]: unknown;
}

export interface RdsaudeDealsOptions {
  /** oferta_do_dia (the default, Oferta do Dia), especial (% Especial), coupons or black_friday. */
  type?: "oferta_do_dia" | "especial" | "coupons" | "black_friday";
  /** With type coupons: a coupon code (coupons[].code). Without it, the running coupons. */
  coupon?: string;
  /** A brand as facets[name=filters.Marca].values lists it. */
  brand?: string;
  /** Products of this category (categories[].id or items[].categories[].id). */
  category_id?: string | number;
  /**
   * drogasil (the default, www.drogasil.com.br) or drogaraia (www.drogaraia.com.br). Prices,
   * category ids, stores and reviews differ per banner.
   */
  site?: "drogasil" | "drogaraia";
  /**
   * relevance (the default), price_asc or price_desc. The price sort uses the search index's price
   * (index_price), which can differ from the live price.
   */
  sort?: "relevance" | "price_asc" | "price_desc";
  /** Results page, from 1. reachable_pages reports the last page the site's search reaches. */
  page?: number;
  /** 24 (the default), 36 or 48, the site's own page sizes. */
  page_size?: 24 | 36 | 48;
  [key: string]: unknown;
}

export interface RdsaudeSuggestionsOptions {
  /** What has been typed so far. */
  query: string;
  /**
   * drogasil (the default, www.drogasil.com.br) or drogaraia (www.drogaraia.com.br). Prices,
   * category ids, stores and reviews differ per banner.
   */
  site?: "drogasil" | "drogaraia";
  [key: string]: unknown;
}

export class RdsaudeNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = RDSAUDE_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/rdsaude/${path}`, options, undefined, timeout);
  }

  /**
   * Search Drogasil and Droga Raia (drogasil.com.br, drogaraia.com.br, the pharmacy chains of RD
   * Saude). Scavio fetches the public Drogasil / Droga Raia page on request; neither has a public
   * API. site picks the banner. Brazil: Portuguese text, prices in BRL as the site's default online
   * price (a reference price, not a per-store price). By keyword, product code or EAN; sorted by
   * relevance or price; filtered by brand, own or partner store, highlight (Oferta do Dia, %
   * Especial, coupons, Black Friday), category, store pickup, a price range and any facet; 24, 36
   * or 48 per page. Costs 1 credit.
   */
  async search(options: RdsaudeSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category of Drogasil and Droga Raia (drogasil.com.br, drogaraia.com.br, the pharmacy chains
   * of RD Saude). Scavio fetches the public Drogasil / Droga Raia page on request; neither has a
   * public API. site picks the banner. by category id or category page link, sorted and filtered
   * like search. category_id, name, url (link input). Costs 1 credit.
   */
  async category(options: RdsaudeCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The menu tree of Drogasil and Droga Raia (drogasil.com.br, drogaraia.com.br, the pharmacy
   * chains of RD Saude). Scavio fetches the public Drogasil / Droga Raia page on request; neither
   * has a public API. site picks the banner. department_count, category_count, categories [{id,
   * name, url, level, children}], three levels. Ids go to category. Category ids differ per banner.
   * Usually 10-30 s. 1 credit. A not-found is charged; failed upstream calls and refused inputs are
   * not. Usually 2-15 s; set a client timeout of at least 120 s. Costs 1 credit.
   */
  async categories(options: RdsaudeCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One product of Drogasil and Droga Raia (drogasil.com.br, drogaraia.com.br, the pharmacy chains
   * of RD Saude). Scavio fetches the public Drogasil / Droga Raia page on request; neither has a
   * public API. site picks the banner. Brazil. Costs 1 credit.
   */
  async product(options: RdsaudeProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Current prices of up to 48 products of Drogasil and Droga Raia (drogasil.com.br,
   * drogaraia.com.br, the pharmacy chains of RD Saude). Scavio fetches the public Drogasil / Droga
   * Raia page on request; neither has a public API. site picks the banner. in one call. Costs 1
   * credit.
   */
  async prices(options: RdsaudePricesOptions): Promise<Record<string, unknown>> {
    return this.post("prices", options);
  }

  /**
   * Store pickup availability at Drogasil and Droga Raia (drogasil.com.br, drogaraia.com.br, the
   * pharmacy chains of RD Saude). Scavio fetches the public Drogasil / Droga Raia page on request;
   * neither has a public API. site picks the banner. for products (codes or EANs) at stores, up to
   * 5 product x store checks. Costs 1 credit.
   */
  async storeAvailability(options: RdsaudeStoreAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.post("store-availability", options);
  }

  /**
   * The nearest stores (up to 6) of Drogasil and Droga Raia (drogasil.com.br, drogaraia.com.br, the
   * pharmacy chains of RD Saude). Scavio fetches the public Drogasil / Droga Raia page on request;
   * neither has a public API. site picks the banner. to a Brazilian CEP. Costs 1 credit.
   */
  async stores(options: RdsaudeStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * The store locator of Drogasil and Droga Raia (drogasil.com.br, drogaraia.com.br, the pharmacy
   * chains of RD Saude). Scavio fetches the public Drogasil / Droga Raia page on request; neither
   * has a public API. site picks the banner. by state, city, neighborhood or free text, filtered by
   * open 24 hours, parking and Farmacia Popular, up to 50 per page. Costs 1 credit.
   */
  async storesSearch(options: RdsaudeStoresSearchOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores/search", options);
  }

  /**
   * Customer reviews of one product on Drogasil and Droga Raia (drogasil.com.br, drogaraia.com.br,
   * the pharmacy chains of RD Saude). Scavio fetches the public Drogasil / Droga Raia page on
   * request; neither has a public API. site picks the banner. up to 50 per page, by stars. Costs 1
   * credit.
   */
  async reviews(options: RdsaudeReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * The deals of Drogasil and Droga Raia (drogasil.com.br, drogaraia.com.br, the pharmacy chains of
   * RD Saude). Scavio fetches the public Drogasil / Droga Raia page on request; neither has a
   * public API. site picks the banner. Brazil: Portuguese text, prices in BRL as the site's default
   * online price (a reference price, not a per-store price). type oferta_do_dia (Oferta do Dia),
   * especial (% Especial), black_friday, or coupons (the running coupons [{code, label, count}], or
   * with coupon its products). Costs 1 credit.
   */
  async deals(options: RdsaudeDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * The search box suggestions of Drogasil and Droga Raia (drogasil.com.br, drogaraia.com.br, the
   * pharmacy chains of RD Saude). Scavio fetches the public Drogasil / Droga Raia page on request;
   * neither has a public API. site picks the banner. for what has been typed. Costs 1 credit.
   */
  async suggestions(options: RdsaudeSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
