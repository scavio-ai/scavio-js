import type { Scavio } from "../client.js";

// Carrefour Brasil (carrefour.com.br: Mercado grocery + the www marketplace; chosen with site)
// search, category, collection, product, delivery, stores, suggestions, coupons and categories
// endpoints; Brazil only, prices in BRL, regional grocery prices by CEP or store, 1 credit each.
// Generated from the backend routes: every option and its doc mirrors the API's own request schema.
// The server enforces the value rules and the one-of rules (send one of an id or a link). Every
// call raises the request timeout to CARREFOURBR_TIMEOUT and never lowers a longer client timeout.
// Failed upstream calls and refused inputs are not charged; a not-found is charged (credits_used is
// what was charged).

/** Minimum request timeout (ms) for every carrefourbr call. */
export const CARREFOURBR_TIMEOUT = 240_000;

export interface CarrefourbrSearchOptions {
  /** Search keywords in Portuguese, or an EAN barcode. */
  query: string;
  /**
   * mercado (default; mercado.carrefour.com.br, the grocery site) or www (www.carrefour.com.br:
   * non-food and the marketplace).
   */
  site?: "mercado" | "www";
  /**
   * On mercado: a CEP for that region's prices and assortment (8 digits, dash optional). www prices
   * are national; the CEP changes shipping there and nothing else (/carrefourbr/delivery).
   */
  cep?: string;
  /**
   * On mercado, instead of cep: a pickup store's store_id from /carrefourbr/stores, for that
   * store's prices and assortment.
   */
  store?: string;
  /** Page, 1-50 (15 items a page). Defaults to 1. */
  page?: number;
  /**
   * relevance (default), orders_desc (best selling), price_asc, price_desc, release_desc (newest),
   * discount_desc, name_asc or name_desc: the site's sorts.
   */
  sort?: "relevance" | "orders_desc" | "price_asc" | "price_desc" | "release_desc" | "discount_desc" | "name_asc" | "name_desc";
  /**
   * Facet filters from a previous answer's facets[].values[].filter ({"brand": "consul"},
   * {"category-2": ["geladeira"]}), or "key=value" strings. Up to 10 values; values of one key
   * combine as any of them.
   */
  filters?: Record<string, unknown> | string[];
  /** Minimum price in whole reais (BRL). */
  min_price?: number;
  /** Maximum price in whole reais (BRL). */
  max_price?: number;
  [key: string]: unknown;
}

export interface CarrefourbrCategoryOptions {
  /**
   * A category path from /carrefourbr/categories or a list's breadcrumbs (departments[].path), or
   * such a link.
   */
  path: string;
  /**
   * mercado (default; mercado.carrefour.com.br, the grocery site) or www (www.carrefour.com.br:
   * non-food and the marketplace).
   */
  site?: "mercado" | "www";
  /**
   * On mercado: a CEP for that region's prices and assortment (8 digits, dash optional). www prices
   * are national; the CEP changes shipping there and nothing else (/carrefourbr/delivery).
   */
  cep?: string;
  /**
   * On mercado, instead of cep: a pickup store's store_id from /carrefourbr/stores, for that
   * store's prices and assortment.
   */
  store?: string;
  /** Page, 1-50 (15 items a page). Defaults to 1. */
  page?: number;
  /**
   * relevance (default), orders_desc (best selling), price_asc, price_desc, release_desc (newest),
   * discount_desc, name_asc or name_desc: the site's sorts.
   */
  sort?: "relevance" | "orders_desc" | "price_asc" | "price_desc" | "release_desc" | "discount_desc" | "name_asc" | "name_desc";
  /**
   * Facet filters from a previous answer's facets[].values[].filter ({"brand": "consul"},
   * {"category-2": ["geladeira"]}), or "key=value" strings. Up to 10 values; values of one key
   * combine as any of them.
   */
  filters?: Record<string, unknown> | string[];
  /** Minimum price in whole reais (BRL). */
  min_price?: number;
  /** Maximum price in whole reais (BRL). */
  max_price?: number;
  [key: string]: unknown;
}

export interface CarrefourbrCollectionOptions {
  /**
   * A collection id (the number in a /colecao/<id> link, coupons[].collection_id, categories
   * collection_id) or such a link.
   */
  collection_id: string | number;
  /**
   * mercado (default; mercado.carrefour.com.br, the grocery site) or www (www.carrefour.com.br:
   * non-food and the marketplace).
   */
  site?: "mercado" | "www";
  /**
   * On mercado: a CEP for that region's prices and assortment (8 digits, dash optional). www prices
   * are national; the CEP changes shipping there and nothing else (/carrefourbr/delivery).
   */
  cep?: string;
  /**
   * On mercado, instead of cep: a pickup store's store_id from /carrefourbr/stores, for that
   * store's prices and assortment.
   */
  store?: string;
  /** Page, 1-50 (15 items a page). Defaults to 1. */
  page?: number;
  /**
   * relevance (default), orders_desc (best selling), price_asc, price_desc, release_desc (newest),
   * discount_desc, name_asc or name_desc: the site's sorts.
   */
  sort?: "relevance" | "orders_desc" | "price_asc" | "price_desc" | "release_desc" | "discount_desc" | "name_asc" | "name_desc";
  /**
   * Facet filters from a previous answer's facets[].values[].filter ({"brand": "consul"},
   * {"category-2": ["geladeira"]}), or "key=value" strings. Up to 10 values; values of one key
   * combine as any of them.
   */
  filters?: Record<string, unknown> | string[];
  /** Minimum price in whole reais (BRL). */
  min_price?: number;
  /** Maximum price in whole reais (BRL). */
  max_price?: number;
  [key: string]: unknown;
}

export interface CarrefourbrProductOptions {
  /** The item id (items[].item_id, or the number at the end of a /produto/ link). */
  item_id?: string | number;
  /**
   * mercado (default; mercado.carrefour.com.br, the grocery site) or www (www.carrefour.com.br:
   * non-food and the marketplace).
   */
  site?: "mercado" | "www";
  /**
   * A product link on either site instead of item_id (/produto/<name>-<item id>, or an older
   * /<name>/p link).
   */
  url?: string;
  /**
   * On mercado: a CEP for that region's prices and assortment (8 digits, dash optional). www prices
   * are national; the CEP changes shipping there and nothing else (/carrefourbr/delivery).
   */
  cep?: string;
  /**
   * On mercado, instead of cep: a pickup store's store_id from /carrefourbr/stores, for that
   * store's prices and assortment.
   */
  store?: string;
  [key: string]: unknown;
}

export interface CarrefourbrDeliveryOptions {
  /** The item id. */
  item_id: string | number;
  /** The delivery CEP. */
  cep: string;
  /**
   * mercado (default; mercado.carrefour.com.br, the grocery site) or www (www.carrefour.com.br:
   * non-food and the marketplace).
   */
  site?: "mercado" | "www";
  /**
   * The seller (sellers[].seller_id from /carrefourbr/product). Defaults to 1, Carrefour itself;
   * marketplace items on www need their seller's id.
   */
  seller_id?: string;
  [key: string]: unknown;
}

export interface CarrefourbrStoresOptions {
  /** Stores in this state (UF). */
  state?: string;
  /** Stores in this city. */
  city?: string;
  [key: string]: unknown;
}

export interface CarrefourbrSuggestionsOptions {
  /**
   * mercado (default; mercado.carrefour.com.br, the grocery site) or www (www.carrefour.com.br:
   * non-food and the marketplace).
   */
  site?: "mercado" | "www";
  /** What a shopper has typed. Without it, the top searches alone. */
  query?: string;
  [key: string]: unknown;
}

export interface CarrefourbrCouponsOptions {
  /**
   * mercado (default; mercado.carrefour.com.br, the grocery site) or www (www.carrefour.com.br:
   * non-food and the marketplace).
   */
  site?: "mercado" | "www";
  [key: string]: unknown;
}

export interface CarrefourbrCategoriesOptions {
  /**
   * mercado (default; mercado.carrefour.com.br, the grocery site) or www (www.carrefour.com.br:
   * non-food and the marketplace).
   */
  site?: "mercado" | "www";
  [key: string]: unknown;
}

export class CarrefourbrNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = CARREFOURBR_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/carrefourbr/${path}`, options, undefined, timeout);
  }

  /**
   * Search Carrefour Brasil (carrefour.com.br and its grocery site mercado.carrefour.com.br).
   * Scavio fetches the site's public page on request; Carrefour Brasil has no public API. Brazil,
   * pt-BR, prices in BRL. site mercado (default, grocery) or www (non-food and the marketplace). By
   * keywords or an EAN. Sort by the site's sorts; filter by any facet value (department, category,
   * brand, seller and the product attributes the site lists) and a price range. On mercado, cep or
   * store (a store_id from /carrefourbr/stores) gives that region's prices and assortment (region,
   * price_scope regional); without them the site's default prices (price_scope national). www
   * prices are national. Costs 1 credit.
   */
  async search(options: CarrefourbrSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Carrefour Brasil category by path (/categoria/mercearia/alimentos-basicos/arroz) or link.
   * Sort by the site's sorts; filter by any facet value (department, category, brand, seller and
   * the product attributes the site lists) and a price range. On mercado, cep or store (a store_id
   * from /carrefourbr/stores) gives that region's prices and assortment (region, price_scope
   * regional); without them the site's default prices (price_scope national). www prices are
   * national. Costs 1 credit.
   */
  async category(options: CarrefourbrCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One Carrefour Brasil collection (a themed or deal list, /colecao/<id>, the lists the site's
   * banners, coupons and menu link to) by id or link, sorted and filtered like category. Costs 1
   * credit.
   */
  async collection(options: CarrefourbrCollectionOptions): Promise<Record<string, unknown>> {
    return this.post("collection", options);
  }

  /**
   * One Carrefour Brasil product by item id or link. On mercado, cep or store (a store_id from
   * /carrefourbr/stores) gives that region's prices and assortment (region, price_scope regional);
   * without them the site's default prices (price_scope national). www prices are national. Costs 1
   * credit.
   */
  async product(options: CarrefourbrProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Delivery and pickup options for one item from one seller to a CEP, on either site. Costs 1
   * credit.
   */
  async delivery(options: CarrefourbrDeliveryOptions): Promise<Record<string, unknown>> {
    return this.post("delivery", options);
  }

  /** The Carrefour pickup stores (Retire na Loja). Costs 1 credit. */
  async stores(options: CarrefourbrStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /** The site's search suggestions for what a shopper has typed. Costs 1 credit. */
  async suggestions(options: CarrefourbrSuggestionsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /** The site's coupon page. Costs 1 credit. */
  async coupons(options: CarrefourbrCouponsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("coupons", options);
  }

  /** The site's department menu as its header lists it, 3 levels. Costs 1 credit. */
  async categories(options: CarrefourbrCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }
}
