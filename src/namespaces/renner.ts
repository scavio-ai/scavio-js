import type { Scavio } from "../client.js";

// Lojas Renner (lojasrenner.com.br, the Brazilian fashion retailer) search, category, deals,
// product, sku price, stores and reviews endpoints; Brazil only, prices in BRL with the store card and other
// card plans, stock levels on listings, 1 credit each. Generated from the backend routes: every
// option and its doc mirrors the API's own request schema. The server enforces the value rules and
// the one-of rules (send one of an id or a link). Every call raises the request timeout to
// RENNER_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused inputs
// are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every renner call. */
export const RENNER_TIMEOUT = 300_000;

export interface RennerSearchOptions {
  /** Search keywords (Portuguese, as a shopper types them). */
  query: string;
  /**
   * relevance (default), newest, best_selling, discount, price_asc, price_desc, name_asc or
   * name_desc (the site's sorts).
   */
  sort?: "relevance" | "newest" | "best_selling" | "discount" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
  /**
   * Refinement id(s) from a listing (refinements[].values[].filter), up to 10: category, sold by,
   * brand, size, colour, gender or region.
   */
  filters?: string | string[];
  /** Results page, 1-200 (48 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface RennerCategoryOptions {
  /**
   * A category by its navigation id (4zo6za is Feminino; breadcrumbs[].url and refinements category
   * filters carry them) or a lojasrenner.com.br /c/ link or path ending in /-/N-<id>.
   */
  category: string;
  /**
   * relevance (default), newest, best_selling, discount, price_asc, price_desc, name_asc or
   * name_desc (the site's sorts).
   */
  sort?: "relevance" | "newest" | "best_selling" | "discount" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
  /**
   * Refinement id(s) from a listing (refinements[].values[].filter), up to 10: category, sold by,
   * brand, size, colour, gender or region.
   */
  filters?: string | string[];
  /** Results page, 1-200 (48 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface RennerDealsOptions {
  /**
   * A list by its navigation id or a lojasrenner.com.br /lista/ link; the default 1l95pyv is the
   * site's list of every discounted product.
   */
  list?: string;
  /**
   * relevance (default), newest, best_selling, discount, price_asc, price_desc, name_asc or
   * name_desc (the site's sorts).
   */
  sort?: "relevance" | "newest" | "best_selling" | "discount" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
  /**
   * Refinement id(s) from a listing (refinements[].values[].filter), up to 10: category, sold by,
   * brand, size, colour, gender or region.
   */
  filters?: string | string[];
  /** Results page, 1-200 (48 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface RennerProductOptions {
  /** The Lojas Renner product id (items[].product_id). */
  product_id?: string;
  /** A lojasrenner.com.br product link (items[].url), instead of product_id. */
  url?: string;
  /**
   * Optional sku to show (colors[].sku or colors[].sizes[].sku): picks the colour and size, as the
   * site's ?sku= does.
   */
  sku?: string;
  [key: string]: unknown;
}

export interface RennerSkuPriceOptions {
  /** The size sku (sizes[].sku or colors[].sizes[].sku of the product endpoint). */
  sku: string;
  /** The Lojas Renner product id (items[].product_id). */
  product_id?: string;
  /** A lojasrenner.com.br product link (items[].url), instead of product_id. */
  url?: string;
  [key: string]: unknown;
}

export interface RennerStoresOptions {
  /** A Brazilian CEP (8 digits). */
  cep: string;
  [key: string]: unknown;
}

export interface RennerReviewsOptions {
  /** The Lojas Renner product id (items[].product_id). */
  product_id?: string;
  /** A lojasrenner.com.br product link (items[].url), instead of product_id. */
  url?: string;
  /** Reviews page, 1-200 (default 1). */
  page?: number;
  /** Reviews per page, 1-100 (default 20). */
  per_page?: number;
  /** newest (default) or most_helpful (the most helpful votes at the top). */
  sort?: "newest" | "most_helpful";
  /** all (default), positive (ratings 3-5), negative (ratings 1-2) or with_photos. */
  filter?: "all" | "positive" | "negative" | "with_photos";
  /** Reviews with this star rating (1-5). Not combined with filter. */
  rating?: number;
  [key: string]: unknown;
}

export class RennerNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = RENNER_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/renner/${path}`, options, undefined, timeout);
  }

  /**
   * Search Lojas Renner (lojasrenner.com.br, the Brazilian fashion retailer). Scavio fetches the
   * public lojasrenner.com.br pages on request. Brazil: Portuguese (pt-BR) text and prices in BRL,
   * as shown to a visitor who is not signed in. By keyword. 48 per page, pages 1-200, in the site's
   * sorts (relevance, newest, best_selling, discount, price_asc, price_desc, name_asc, name_desc),
   * filtered by refinement ids. Costs 1 credit.
   */
  async search(options: RennerSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category listing of Lojas Renner (lojasrenner.com.br, the Brazilian fashion retailer).
   * Scavio fetches the public lojasrenner.com.br pages on request. Brazil: Portuguese (pt-BR) text
   * and prices in BRL, as shown to a visitor who is not signed in. By navigation id (4zo6za) or a
   * /c/ link, sorted and filtered like search. 48 per page, pages 1-200, in the site's sorts
   * (relevance, newest, best_selling, discount, price_asc, price_desc, name_asc, name_desc),
   * filtered by refinement ids. Costs 1 credit.
   */
  async category(options: RennerCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * A product list of Lojas Renner (lojasrenner.com.br, the Brazilian fashion retailer). Scavio
   * fetches the public lojasrenner.com.br pages on request. Brazil: Portuguese (pt-BR) text and
   * prices in BRL, as shown to a visitor who is not signed in. The list of every discounted product
   * (default) or another list by navigation id or /lista/ link, sorted and filtered like search.
   * The site publishes no start or end dates for its deals. 48 per page, pages 1-200, in the site's
   * sorts (relevance, newest, best_selling, discount, price_asc, price_desc, name_asc, name_desc),
   * filtered by refinement ids. Costs 1 credit.
   */
  async deals(options: RennerDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * One product of Lojas Renner (lojasrenner.com.br, the Brazilian fashion retailer). Scavio
   * fetches the public lojasrenner.com.br pages on request. Brazil: Portuguese (pt-BR) text and
   * prices in BRL, as shown to a visitor who is not signed in. By product_id or link, optionally a
   * sku to pick the colour and size: price, list price, the Cartão Renner plan next to other cards,
   * the aggregate rating (the reviews themselves come from reviews), and the sizes of the colour shown with the site's availability flags
   * (flags, not unit counts). Costs 1 credit.
   */
  async product(options: RennerProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Price and stock flags for one size of Lojas Renner (lojasrenner.com.br, the Brazilian fashion
   * retailer). Scavio fetches the public lojasrenner.com.br pages on request. Brazil: Portuguese
   * (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. By product_id (or
   * link) and sku. Costs 1 credit.
   */
  async skuPrice(options: RennerSkuPriceOptions): Promise<Record<string, unknown>> {
    return this.post("sku-price", options);
  }

  /**
   * The physical stores of Lojas Renner (lojasrenner.com.br, the Brazilian fashion retailer).
   * Scavio fetches the public lojasrenner.com.br pages on request. Brazil: Portuguese (pt-BR) text
   * and prices in BRL, as shown to a visitor who is not signed in. The store locator's list for a
   * CEP's city or region. Stores outside the CEP's state that the site returns are left out and
   * reported in a note. No coordinates or distances. Costs 1 credit.
   */
  async stores(options: RennerStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * The customer reviews of one product of Lojas Renner (lojasrenner.com.br, the Brazilian fashion
   * retailer). Scavio fetches the public lojasrenner.com.br pages on request. Brazil: Portuguese
   * (pt-BR) text. By product_id or link, with the store's average and count (no star histogram),
   * as the product page shows them, up to 100 per page, sorted newest or most_helpful, filtered
   * positive, negative or with_photos, or one star rating. Reviews can lag the page by up to 4
   * hours. Review text is the customer's own; reviewer names are never returned. No questions and
   * answers. Costs 1 credit.
   */
  async reviews(options: RennerReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }
}
