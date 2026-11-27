import type { Scavio } from "../client.js";

// Petz (petz.com.br, the Brazilian pet store of Grupo Petz Cobasi) search, category, brand, deals,
// product, stores and store endpoints; Brazil only, prices in BRL with the Assinatura Petz
// subscription price and the Clubz member price, 1 credit each. Generated from the backend routes:
// every option and its doc mirrors the API's own request schema. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to PETZ_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused
// inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every petz call. */
export const PETZ_TIMEOUT = 300_000;

export interface PetzSearchOptions {
  /** Search keywords, in Portuguese as shoppers type them. */
  query: string;
  /** relevance (the default), price_asc, price_desc or newest. */
  sort?: "relevance" | "price_asc" | "price_desc" | "newest";
  /** Results page, 1-based, 20 products per page, up to page 50. */
  page?: number;
  [key: string]: unknown;
}

export interface PetzCategoryOptions {
  /**
   * A category path: a pet and a department, e.g. cachorro, cachorro/racao or
   * gato/areia-e-banheiros (a product's categories[].path).
   */
  category: string;
  /** relevance (the default), price_asc, price_desc or newest. */
  sort?: "relevance" | "price_asc" | "price_desc" | "newest";
  /** Results page, 1-based, 20 products per page, up to page 50. */
  page?: number;
  [key: string]: unknown;
}

export interface PetzBrandOptions {
  /** A brand slug as Petz writes it (a product's brand.slug), e.g. royal-canin or premierpet. */
  brand: string;
  /** relevance (the default), price_asc, price_desc or newest. */
  sort?: "relevance" | "price_asc" | "price_desc" | "newest";
  /** Results page, 1-based, 20 products per page, up to page 50. */
  page?: number;
  [key: string]: unknown;
}

export interface PetzDealsOptions {
  /**
   * A Petz collection (a themed deals list) by its slug. Leave out for the main deals page
   * (Promoções).
   */
  collection?: string;
  /** relevance (the default), price_asc, price_desc or newest. */
  sort?: "relevance" | "price_asc" | "price_desc" | "newest";
  /** Results page, 1-based, 20 products per page, up to page 50. */
  page?: number;
  [key: string]: unknown;
}

export interface PetzProductOptions {
  /**
   * The Petz product id (items[].product_id or variations[].product_id). Send product_id or url.
   */
  product_id?: string | number;
  /**
   * A Petz product link (www.petz.com.br/produto/..., ending in -<product id>), instead of
   * product_id.
   */
  url?: string;
  [key: string]: unknown;
}

export interface PetzStoresOptions {
  /** A Brazilian state code (UF), e.g. SP or RJ. */
  state?: string;
  /** A city name; accents and case are ignored. */
  city?: string;
  [key: string]: unknown;
}

export interface PetzStoreOptions {
  /** The store slug (stores[].slug). */
  slug?: string;
  /** A Petz store link (www.petz.com.br/loja/<slug>), instead of slug. */
  url?: string;
  [key: string]: unknown;
}

export class PetzNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = PETZ_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/petz/${path}`, options, undefined, timeout);
  }

  /**
   * Search Petz (petz.com.br, the Brazilian pet store of Grupo Petz Cobasi). Scavio fetches the
   * public Petz page on request. Brazil (pt-BR): Portuguese text, prices in BRL as shown to a
   * visitor who is not signed in. By keyword, sorted by relevance, price or newest. 20 products per
   * page, pages 1 to 50; a search counts at most 1,000 products (total_capped). Costs 1 credit.
   */
  async search(options: PetzSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category of Petz (petz.com.br, the Brazilian pet store of Grupo Petz Cobasi). Scavio
   * fetches the public Petz page on request. Brazil (pt-BR): Portuguese text, prices in BRL as
   * shown to a visitor who is not signed in. By category path (a pet, or a pet and a department),
   * sorted by relevance, price or newest, with the category name; when Petz redirects a category
   * link to another listing, category.path is the listing answered and redirected_from the path
   * asked. 20 products per page, pages 1 to 50; a search counts at most 1,000 products
   * (total_capped). Costs 1 credit.
   */
  async category(options: PetzCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The products of one brand at Petz (petz.com.br, the Brazilian pet store of Grupo Petz Cobasi).
   * Scavio fetches the public Petz page on request. Brazil (pt-BR): Portuguese text, prices in BRL
   * as shown to a visitor who is not signed in. By brand slug, sorted by relevance, price or
   * newest. 20 products per page, pages 1 to 50; a search counts at most 1,000 products
   * (total_capped). Costs 1 credit.
   */
  async brand(options: PetzBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * The deals page (Promoções) of Petz (petz.com.br, the Brazilian pet store of Grupo Petz Cobasi)
   * or one of its collections (themed deals lists). Scavio fetches the public Petz page on request.
   * Brazil (pt-BR): Portuguese text, prices in BRL as shown to a visitor who is not signed in.
   * Products with the deal price next to the regular price (list_price) and discount_percent,
   * sorted by relevance, price or newest. 20 products per page, pages 1 to 50; a search counts at
   * most 1,000 products (total_capped). Costs 1 credit.
   */
  async deals(options: PetzDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * One product of Petz (petz.com.br, the Brazilian pet store of Grupo Petz Cobasi). Scavio fetches
   * the public Petz page on request. Brazil (pt-BR): Portuguese text, prices in BRL as shown to a
   * visitor who is not signed in. By product_id or link: price, list price, the Assinatura Petz
   * subscription price, stock_units (capped at 100), specs, the rating summary, the 3 latest
   * reviews (no reviewer names) and every size or variant with its own prices and stock. No
   * per-store stock or prices, Pix prices, installments or shipping. Costs 1 credit.
   */
  async product(options: PetzProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The store directory of Petz (petz.com.br, the Brazilian pet store of Grupo Petz Cobasi). Scavio
   * fetches the public Petz page on request. All Petz stores (about 270) with address, phone, hours
   * and whether online orders can be picked up there, narrowed by state and city. Costs 1 credit.
   */
  async stores(options: PetzStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One store of Petz (petz.com.br, the Brazilian pet store of Grupo Petz Cobasi). Scavio fetches
   * the public Petz page on request. By slug or link: address, phone, hours, the Google place id
   * and Petz's own service and pet codes. An unknown store is a charged 404. Costs 1 credit.
   */
  async store(options: PetzStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }
}
