import type { Scavio } from "../client.js";

// Atacadao (atacadao.com.br, the Brazilian cash-and-carry wholesale chain of Grupo Carrefour
// Brasil) search, category, product, stores near, stores, store, flyers, facets, suggestions and
// categories endpoints; Brazil only, prices in BRL at the store you choose with quantity tiers, 1
// credit each. Generated from the backend routes: every option and its doc mirrors the API's own
// request schema. The server enforces the value rules and the one-of rules (send one of an id or a
// link). Every call raises the request timeout to ATACADAO_TIMEOUT and never lowers a longer client
// timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every atacadao call. */
export const ATACADAO_TIMEOUT = 240_000;

export interface AtacadaoSearchOptions {
  /** Search keywords, in Portuguese. */
  query: string;
  /**
   * A category path of 1 to 3 levels (categories[].path, e.g. mercearia, mercearia/graos,
   * mercearia/graos/arroz-branco) or its atacadao.com.br link.
   */
  category?: string;
  /**
   * The store to price at: its store id (atacadaobr340) or store number (340), from stores_near or
   * stores (stores[].store_id). Default: the site's default store (atacadaobr60, Vila Maria, Sao
   * Paulo).
   */
  store_id?: string | number;
  /**
   * The site's sorts: relevance, price_asc, price_desc, best_sellers, name_asc, name_desc, newest,
   * discount (best_sellers = most ordered, newest = release date). Default relevance.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "best_sellers" | "name_asc" | "name_desc" | "newest" | "discount";
  /** Brand value(s) from facets (key brand), e.g. camil. */
  brand?: string | string[];
  /** A collection id (items[].collections[].id), e.g. 382 Black November, 334 Black Week. */
  collection?: string;
  /** Minimum price in BRL (the site's price filter). */
  min_price?: number;
  /** Maximum price in BRL. */
  max_price?: number;
  /** Any other facet by the site's own key: {"<facets[].key>": value or [values]}. Up to 5 keys. */
  filters?: Record<string, unknown>;
  /** Results page, 1-50 (default 1). */
  page?: number;
  /** Items per page, 1-100 (default 20). */
  page_size?: number;
  [key: string]: unknown;
}

export interface AtacadaoCategoryOptions {
  /**
   * A category path of 1 to 3 levels (categories[].path, e.g. mercearia, mercearia/graos,
   * mercearia/graos/arroz-branco) or its atacadao.com.br link.
   */
  category?: string;
  /** A category id (categories[].category_id) instead of category. */
  category_id?: number;
  /**
   * The store to price at: its store id (atacadaobr340) or store number (340), from stores_near or
   * stores (stores[].store_id). Default: the site's default store (atacadaobr60, Vila Maria, Sao
   * Paulo).
   */
  store_id?: string | number;
  /**
   * The site's sorts: relevance, price_asc, price_desc, best_sellers, name_asc, name_desc, newest,
   * discount (best_sellers = most ordered, newest = release date). Default relevance.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "best_sellers" | "name_asc" | "name_desc" | "newest" | "discount";
  /** Brand value(s) from facets (key brand), e.g. camil. */
  brand?: string | string[];
  /** A collection id (items[].collections[].id), e.g. 382 Black November, 334 Black Week. */
  collection?: string;
  /** Minimum price in BRL (the site's price filter). */
  min_price?: number;
  /** Maximum price in BRL. */
  max_price?: number;
  /** Any other facet by the site's own key: {"<facets[].key>": value or [values]}. Up to 5 keys. */
  filters?: Record<string, unknown>;
  /** Results page, 1-50 (default 1). */
  page?: number;
  /** Items per page, 1-100 (default 20). */
  page_size?: number;
  [key: string]: unknown;
}

export interface AtacadaoProductOptions {
  /** The sku id (items[].sku). */
  sku?: string;
  /** The EAN / GTIN barcode (EAN-13). */
  ean?: string;
  /** The product id (items[].product_id). */
  product_id?: string;
  /** The product slug (arroz-branco-namorado-tipo-1-5619-14443). */
  slug?: string;
  /** A product link (https://www.atacadao.com.br/<slug>/p). */
  url?: string;
  /**
   * The store to price at: its store id (atacadaobr340) or store number (340), from stores_near or
   * stores (stores[].store_id). Default: the site's default store (atacadaobr60, Vila Maria, Sao
   * Paulo).
   */
  store_id?: string | number;
  [key: string]: unknown;
}

export interface AtacadaoStoresNearOptions {
  /** A Brazilian CEP (8 digits). */
  cep?: string;
  /** Latitude of a point in Brazil (with longitude, instead of cep). */
  latitude?: number;
  /** Longitude of a point in Brazil. */
  longitude?: number;
  [key: string]: unknown;
}

export interface AtacadaoStoresOptions {
  /**
   * Brazilian state code (UF): AC, AL, AM, AP, BA, CE, DF, ES, GO, MA, MG, MS, MT, PA, PB, PE, PI,
   * PR, RJ, RN, RO, RR, RS, SC, SE, SP, TO.
   */
  state: string;
  /** A city of that state (accents and case ignored). */
  city?: string;
  /** Page (default 1). */
  page?: number;
  /** Stores per page, 1-50 (default 24). */
  page_size?: number;
  [key: string]: unknown;
}

export interface AtacadaoStoreOptions {
  /**
   * A store number (340), store id (atacadaobr340) or store slug (tatuape), from stores or
   * stores_near.
   */
  store_id: string | number;
  [key: string]: unknown;
}

export interface AtacadaoFlyersOptions {
  /**
   * A store number (340), store id (atacadaobr340) or store slug (tatuape), from stores or
   * stores_near.
   */
  store_id: string | number;
  [key: string]: unknown;
}

export interface AtacadaoFacetsOptions {
  /** Search keywords (or give a category, brand or collection). */
  query?: string;
  /**
   * A category path of 1 to 3 levels (categories[].path, e.g. mercearia, mercearia/graos,
   * mercearia/graos/arroz-branco) or its atacadao.com.br link.
   */
  category?: string;
  /**
   * The store to price at: its store id (atacadaobr340) or store number (340), from stores_near or
   * stores (stores[].store_id). Default: the site's default store (atacadaobr60, Vila Maria, Sao
   * Paulo).
   */
  store_id?: string | number;
  /**
   * The site's sorts: relevance, price_asc, price_desc, best_sellers, name_asc, name_desc, newest,
   * discount (best_sellers = most ordered, newest = release date). Default relevance.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "best_sellers" | "name_asc" | "name_desc" | "newest" | "discount";
  /** Brand value(s) from facets (key brand), e.g. camil. */
  brand?: string | string[];
  /** A collection id (items[].collections[].id), e.g. 382 Black November, 334 Black Week. */
  collection?: string;
  /** Minimum price in BRL (the site's price filter). */
  min_price?: number;
  /** Maximum price in BRL. */
  max_price?: number;
  /** Any other facet by the site's own key: {"<facets[].key>": value or [values]}. Up to 5 keys. */
  filters?: Record<string, unknown>;
  /** Results page, 1-50 (default 1). */
  page?: number;
  /** Items per page, 1-100 (default 20). */
  page_size?: number;
  [key: string]: unknown;
}

export interface AtacadaoSuggestionsOptions {
  /** The start of a search. Without it, the top searches alone. */
  query?: string;
  [key: string]: unknown;
}

export interface AtacadaoCategoriesOptions {
  [key: string]: unknown;
}

export class AtacadaoNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = ATACADAO_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/atacadao/${path}`, options, undefined, timeout);
  }

  /**
   * Search Atacadao (atacadao.com.br, the cash-and-carry chain of Grupo Carrefour Brasil), Brazil
   * only, pt-BR text, BRL prices. Scavio fetches the public Atacadao page on request; Atacadao has
   * no public product API. Prices are the online prices of the store you choose (store_id). By
   * keyword at one store, sorted by the site's sorts and filtered by category (1-3 levels), brand,
   * price range, collection (e.g. Black November) and any other facet. Costs 1 credit.
   */
  async search(options: AtacadaoSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category listing of Atacadao (atacadao.com.br, the cash-and-carry chain of Grupo Carrefour
   * Brasil), Brazil only, pt-BR text, BRL prices. Scavio fetches the public Atacadao page on
   * request; Atacadao has no public product API. Prices are the online prices of the store you
   * choose (store_id). By category path or category_id, at one store, sorted and filtered like
   * search. Costs 1 credit.
   */
  async category(options: AtacadaoCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One product of Atacadao (atacadao.com.br, the cash-and-carry chain of Grupo Carrefour Brasil),
   * Brazil only, pt-BR text, BRL prices. Scavio fetches the public Atacadao page on request;
   * Atacadao has no public product API. Prices are the online prices of the store you choose
   * (store_id). By sku, EAN, product id, slug or link, priced at one store. Costs 1 credit.
   */
  async product(options: AtacadaoProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The Atacadao pickup stores near a CEP or a point (latitude / longitude), nearest first. Costs 1
   * credit.
   */
  async storesNear(options: AtacadaoStoresNearOptions): Promise<Record<string, unknown>> {
    return this.post("stores-near", options);
  }

  /** The Atacadao store directory for a state (and city). Costs 1 credit. */
  async stores(options: AtacadaoStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /** One Atacadao store in full. Costs 1 credit. */
  async store(options: AtacadaoStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /** The current flyers (folhetos) of one Atacadao store. Costs 1 credit. */
  async flyers(options: AtacadaoFlyersOptions): Promise<Record<string, unknown>> {
    return this.post("flyers", options);
  }

  /**
   * The filter values of Atacadao (atacadao.com.br, the cash-and-carry chain of Grupo Carrefour
   * Brasil), Brazil only, pt-BR text, BRL prices. Scavio fetches the public Atacadao page on
   * request; Atacadao has no public product API. Prices are the online prices of the store you
   * choose (store_id). For a query and / or category, brand or collection at one store. Costs 1
   * credit.
   */
  async facets(options: AtacadaoFacetsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("facets", options);
  }

  /**
   * The search box of Atacadao (atacadao.com.br, the cash-and-carry chain of Grupo Carrefour
   * Brasil), Brazil only, pt-BR text, BRL prices. Scavio fetches the public Atacadao page on
   * request; Atacadao has no public product API. Prices are the online prices of the store you
   * choose (store_id). For the start of a search. Costs 1 credit.
   */
  async suggestions(options: AtacadaoSuggestionsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * The department tree of Atacadao (atacadao.com.br, the cash-and-carry chain of Grupo Carrefour
   * Brasil), Brazil only, pt-BR text, BRL prices. Scavio fetches the public Atacadao page on
   * request; Atacadao has no public product API. Prices are the online prices of the store you
   * choose (store_id). Three levels, each node with its path and category_id (the inputs of
   * category). Costs 1 credit.
   */
  async categories(options: AtacadaoCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }
}
