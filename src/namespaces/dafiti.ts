import type { Scavio } from "../client.js";

// Dafiti (dafiti.com.br, the Brazilian fashion marketplace) search, category, brand, deals, product
// and sizes endpoints; Brazil only, prices in BRL, units per size, 1 credit each. Generated from
// the backend routes: every option and its doc mirrors the API's own request schema. The server
// enforces the value rules and the one-of rules (send one of an id or a link). Every call raises
// the request timeout to DAFITI_TIMEOUT and never lowers a longer client timeout. Failed upstream
// calls and refused inputs are not charged; a not-found is charged (credits_used is what was
// charged).

/** Minimum request timeout (ms) for every dafiti call. */
export const DAFITI_TIMEOUT = 240_000;

export interface DafitiSearchOptions {
  /** Search keywords (Portuguese, as a shopper types them). */
  query: string;
  /** popularity (default), newest, price_asc, price_desc or discount (the site's 5 sorts). */
  sort?: "popularity" | "newest" | "price_asc" | "price_desc" | "discount";
  /** Results page (48 results per page plus the sponsored slots). */
  page?: number;
  [key: string]: unknown;
}

export interface DafitiCategoryOptions {
  /**
   * A department or category path of 1 to 3 levels as the site writes it (calcados-femininos,
   * calcados-femininos/tenis; breadcrumbs[].url), or its dafiti.com.br link.
   */
  category: string;
  /** popularity (default), newest, price_asc, price_desc or discount (the site's 5 sorts). */
  sort?: "popularity" | "newest" | "price_asc" | "price_desc" | "discount";
  /** Results page (48 results per page plus the sponsored slots). */
  page?: number;
  [key: string]: unknown;
}

export interface DafitiBrandOptions {
  /**
   * A brand as the site writes it in its link (asics, nike, farm-rio), or its dafiti.com.br link.
   */
  brand: string;
  /** popularity (default), newest, price_asc, price_desc or discount (the site's 5 sorts). */
  sort?: "popularity" | "newest" | "price_asc" | "price_desc" | "discount";
  /** Results page (48 results per page plus the sponsored slots). */
  page?: number;
  [key: string]: unknown;
}

export interface DafitiDealsOptions {
  /** popularity (default), newest, price_asc, price_desc or discount (the site's 5 sorts). */
  sort?: "popularity" | "newest" | "price_asc" | "price_desc" | "discount";
  /** Results page (48 results per page plus the sponsored slots). */
  page?: number;
  [key: string]: unknown;
}

export interface DafitiProductOptions {
  /** The number at the end of a Dafiti product link (items[].product_id). */
  product_id?: string;
  /** The Dafiti sku (items[].sku), or one size of it (sizes[].sku), instead of product_id. */
  sku?: string;
  /** A dafiti.com.br product link, instead of product_id. */
  url?: string;
  [key: string]: unknown;
}

export interface DafitiSizesOptions {
  /** The Dafiti sku (items[].sku), or one size of it (sizes[].sku). */
  sku: string;
  [key: string]: unknown;
}

export class DafitiNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = DAFITI_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/dafiti/${path}`, options, undefined, timeout);
  }

  /**
   * Search Dafiti (dafiti.com.br, the Brazilian fashion marketplace). Scavio fetches the public
   * dafiti.com.br pages on request. Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to
   * a visitor who is not signed in. By keyword, 48 results per page plus the site's sponsored
   * slots, in the site's 5 sorts. The site matches loosely, so a search with no close match can
   * still list related products. Costs 1 credit.
   */
  async search(options: DafitiSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One department or category listing of Dafiti (dafiti.com.br, the Brazilian fashion
   * marketplace). Scavio fetches the public dafiti.com.br pages on request. Brazil: Portuguese
   * (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. By its path
   * (calcados-femininos, calcados-femininos/tenis) or link, sorted like search. 48 results per page
   * plus the site's sponsored slots, in the site's 5 sorts (popularity, newest, price_asc,
   * price_desc, discount). Costs 1 credit.
   */
  async category(options: DafitiCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One brand's listing of Dafiti (dafiti.com.br, the Brazilian fashion marketplace). Scavio
   * fetches the public dafiti.com.br pages on request. Brazil: Portuguese (pt-BR) text and prices
   * in BRL, as shown to a visitor who is not signed in. By the brand as the site writes it in its
   * link (asics, nike), sorted like search. 48 results per page plus the site's sponsored slots, in
   * the site's 5 sorts (popularity, newest, price_asc, price_desc, discount). Costs 1 credit.
   */
  async brand(options: DafitiBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * The outlet of Dafiti (dafiti.com.br, the Brazilian fashion marketplace). Scavio fetches the
   * public dafiti.com.br pages on request. Brazil: Portuguese (pt-BR) text and prices in BRL, as
   * shown to a visitor who is not signed in. The site's own selection of discounted products,
   * sorted like search (discount puts the deepest discounts at the top). The site publishes no
   * start or end dates for it. 48 results per page plus the site's sponsored slots, in the site's 5
   * sorts (popularity, newest, price_asc, price_desc, discount). Costs 1 credit.
   */
  async deals(options: DafitiDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * One product of Dafiti (dafiti.com.br, the Brazilian fashion marketplace). Scavio fetches the
   * public dafiti.com.br pages on request. Brazil: Portuguese (pt-BR) text and prices in BRL, as
   * shown to a visitor who is not signed in. By product_id, sku or link: price, list price, Pix and
   * card price, the seller by store name, and every size with units (exact from 0 to 10; above that
   * the site gives more than 10, not a count) and the delivery type (Dafiti's own stock,
   * fulfillment or drop shipping). Costs 1 credit.
   */
  async product(options: DafitiProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Every size of one product of Dafiti (dafiti.com.br, the Brazilian fashion marketplace). Scavio
   * fetches the public dafiti.com.br pages on request. Brazil: Portuguese (pt-BR) text and prices
   * in BRL, as shown to a visitor who is not signed in. By sku: every size with units (exact from 0
   * to 10; above that the site gives more than 10, not a count), delivery type and store name.
   * Faster than product, for a stock check. Costs 1 credit.
   */
  async sizes(options: DafitiSizesOptions): Promise<Record<string, unknown>> {
    return this.post("sizes", options);
  }
}
