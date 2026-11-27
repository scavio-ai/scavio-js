import type { Scavio } from "../client.js";

// Casas Bahia (casasbahia.com.br, with Extra and Ponto; chosen with site) search, category, product
// and categories endpoints; Brazil only, prices in BRL on product (every seller, Pix and
// installments; list items carry no prices), 2 credits each. Generated from the backend routes:
// every option and its doc mirrors the API's own request schema; an input the API only accepts to
// refuse (a 400 that says 'not offered') is left out. The server enforces the value rules and the
// one-of rules (send one of an id or a link). Every call raises the request timeout to
// CASASBAHIA_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused
// inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every casasbahia call. */
export const CASASBAHIA_TIMEOUT = 240_000;

export interface CasasbahiaSearchOptions {
  /** Search keywords, in Portuguese as shoppers type them. */
  query: string;
  /**
   * casasbahia (default, casasbahia.com.br), extra (extra.com.br) or pontofrio (pontofrio.com.br,
   * the Ponto store). One catalog; each storefront's own-store price and review counts can differ.
   */
  site?: "casasbahia" | "extra" | "pontofrio";
  /** Page, 1-500 (20 items a page; the storefront counts up to 10,000 results). Defaults to 1. */
  page?: number;
  /**
   * relevance (default), popularity, price_asc, price_desc or best_selling: the storefront's 5
   * sorts.
   */
  sort?: "relevance" | "popularity" | "price_asc" | "price_desc" | "best_selling";
  /**
   * Up to 10 filter values from a previous answer's facets[].values[].filter (brand marca-m19,
   * rating avaliacao-r5, discount band desconto-10to19, seller lojistas-l15, features such as
   * caracteristica-tipo-de-degelo-frost-free). Values combine.
   */
  filters?: string | string[];
  /**
   * Items sold and delivered by the storefront itself (Casas Bahia, Extra or Pontofrio), not by
   * marketplace sellers.
   */
  own_store?: boolean;
  /** Minimum price in whole reais (BRL). */
  min_price?: number;
  /** Maximum price in whole reais (BRL). */
  max_price?: number;
  [key: string]: unknown;
}

export interface CasasbahiaCategoryOptions {
  /**
   * A category path from /casasbahia/categories (categories[].path, e.g.
   * /c/tv-e-video/televisores/smart-tv?filtro=categoria-c1_c2_c1588), a deal collection
   * (/c?Filtro=D69331) or such a link on one of the three storefronts.
   */
  path: string;
  /**
   * casasbahia (default, casasbahia.com.br), extra (extra.com.br) or pontofrio (pontofrio.com.br,
   * the Ponto store). One catalog; each storefront's own-store price and review counts can differ.
   */
  site?: "casasbahia" | "extra" | "pontofrio";
  /** Page, 1-500 (20 items a page; the storefront counts up to 10,000 results). Defaults to 1. */
  page?: number;
  /**
   * relevance (default), popularity, price_asc, price_desc or best_selling: the storefront's 5
   * sorts.
   */
  sort?: "relevance" | "popularity" | "price_asc" | "price_desc" | "best_selling";
  /**
   * Up to 10 filter values from a previous answer's facets[].values[].filter (brand marca-m19,
   * rating avaliacao-r5, discount band desconto-10to19, seller lojistas-l15, features such as
   * caracteristica-tipo-de-degelo-frost-free). Values combine.
   */
  filters?: string | string[];
  /**
   * Items sold and delivered by the storefront itself (Casas Bahia, Extra or Pontofrio), not by
   * marketplace sellers.
   */
  own_store?: boolean;
  /** Minimum price in whole reais (BRL). */
  min_price?: number;
  /** Maximum price in whole reais (BRL). */
  max_price?: number;
  [key: string]: unknown;
}

export interface CasasbahiaProductOptions {
  /**
   * casasbahia (default, casasbahia.com.br), extra (extra.com.br) or pontofrio (pontofrio.com.br,
   * the Ponto store). One catalog; each storefront's own-store price and review counts can differ.
   */
  site?: "casasbahia" | "extra" | "pontofrio";
  /** The SKU id (items[].sku, or the number after /p/ in a product link). */
  sku?: string | number;
  /**
   * A product link on any of the three storefronts, instead of sku (the link's storefront is the
   * site).
   */
  url?: string;
  [key: string]: unknown;
}

export interface CasasbahiaCategoriesOptions {
  /**
   * casasbahia (default, casasbahia.com.br), extra (extra.com.br) or pontofrio (pontofrio.com.br,
   * the Ponto store). One catalog; each storefront's own-store price and review counts can differ.
   */
  site?: "casasbahia" | "extra" | "pontofrio";
  [key: string]: unknown;
}

export class CasasbahiaNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = CASASBAHIA_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/casasbahia/${path}`, options, undefined, timeout);
  }

  /**
   * Search Casas Bahia (casasbahia.com.br, the Brazilian retailer of Grupo Casas Bahia, with its
   * Extra and Ponto stores). Scavio fetches the storefront's public page on request; Casas Bahia
   * has no public API. Brazil, pt-BR, prices in BRL. site picks casasbahia, extra or pontofrio: one
   * catalog, but each storefront's own-store price and review counts can differ. Sort by the
   * storefront's 5 sorts; filter by any facet value (brand, price band, discount band, rating,
   * seller, features), own_store and a price range. Costs 2 credits.
   */
  async search(options: CasasbahiaSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Casas Bahia category, a deal collection (/c?Filtro=D<id>, such as the coupon and campaign
   * lists) or a seller's list (/c?filtro=L<seller id>), by path or link. Sort by the storefront's 5
   * sorts; filter by any facet value (brand, price band, discount band, rating, seller, features),
   * own_store and a price range. Costs 2 credits.
   */
  async category(options: CasasbahiaCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /** One product on Casas Bahia, Extra or Ponto by sku or link. Costs 2 credits. */
  async product(options: CasasbahiaProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** The storefront's category menu as its header lists it. Costs 2 credits. */
  async categories(options: CasasbahiaCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }
}
