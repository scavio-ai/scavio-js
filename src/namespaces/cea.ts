import type { Scavio } from "../client.js";

// C&A Brasil (cea.com.br, the Brazilian arm of the C&A fashion chain) search, category, brand,
// deals, facets, suggestions, categories, product, shipping, stores and reviews endpoints; Brazil only,
// prices in BRL per size, delivery quote and pickup points by CEP, 1 credit each. Generated from
// the backend routes: every option and its doc mirrors the API's own request schema. The server
// enforces the value rules and the one-of rules (send one of an id or a link). Every call raises
// the request timeout to CEA_TIMEOUT and never lowers a longer client timeout. Failed upstream
// calls and refused inputs are not charged; a not-found is charged (credits_used is what was
// charged).

/** Minimum request timeout (ms) for every cea call. */
export const CEA_TIMEOUT = 240_000;

export interface CeaSearchOptions {
  /** Search keywords, in Portuguese. */
  query: string;
  /**
   * The site's sorts: relevance, price_asc, price_desc, best_sellers, newest, discount, name_asc,
   * name_desc (best_sellers = most ordered, newest = release date, discount = deepest discount
   * first). Default relevance.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "best_sellers" | "newest" | "discount" | "name_asc" | "name_desc";
  /** Results page, 1-50 (default 1; the site pages at most 50 pages deep). */
  page?: number;
  /** Products per page, 1-24 (default 24). */
  page_size?: number;
  [key: string]: unknown;
}

export interface CeaCategoryOptions {
  /**
   * A category path of 1 to 3 levels (categories[].path: department, category, subcategory, e.g.
   * moda-feminina, moda-feminina/roupas, moda-feminina/roupas/blusas) or its cea.com.br link.
   */
  category: string;
  /**
   * The site's sorts: relevance, price_asc, price_desc, best_sellers, newest, discount, name_asc,
   * name_desc (best_sellers = most ordered, newest = release date, discount = deepest discount
   * first). Default relevance.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "best_sellers" | "newest" | "discount" | "name_asc" | "name_desc";
  /** Results page, 1-50 (default 1; the site pages at most 50 pages deep). */
  page?: number;
  /** Products per page, 1-24 (default 24). */
  page_size?: number;
  [key: string]: unknown;
}

export interface CeaBrandOptions {
  /**
   * A brand as the site's Marcas filter writes it (facets: key marcas), e.g. palomino, clock-house,
   * yessica, angelo-litrico, or a partner brand.
   */
  brand: string;
  /**
   * The site's sorts: relevance, price_asc, price_desc, best_sellers, newest, discount, name_asc,
   * name_desc (best_sellers = most ordered, newest = release date, discount = deepest discount
   * first). Default relevance.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "best_sellers" | "newest" | "discount" | "name_asc" | "name_desc";
  /** Results page, 1-50 (default 1; the site pages at most 50 pages deep). */
  page?: number;
  /** Products per page, 1-24 (default 24). */
  page_size?: number;
  [key: string]: unknown;
}

export interface CeaDealsOptions {
  /** A promotion collection id (items[].collection_ids), e.g. 19727. */
  collection_id: string | number;
  /**
   * The site's sorts: relevance, price_asc, price_desc, best_sellers, newest, discount, name_asc,
   * name_desc (best_sellers = most ordered, newest = release date, discount = deepest discount
   * first). Default relevance.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "best_sellers" | "newest" | "discount" | "name_asc" | "name_desc";
  /** Results page, 1-50 (default 1; the site pages at most 50 pages deep). */
  page?: number;
  /** Products per page, 1-24 (default 24). */
  page_size?: number;
  [key: string]: unknown;
}

export interface CeaFacetsOptions {
  /** Search keywords (or give one of category, brand or collection_id). */
  query?: string;
  /**
   * A category path of 1 to 3 levels (categories[].path: department, category, subcategory, e.g.
   * moda-feminina, moda-feminina/roupas, moda-feminina/roupas/blusas) or its cea.com.br link.
   */
  category?: string;
  /**
   * A brand as the site's Marcas filter writes it (facets: key marcas), e.g. palomino, clock-house,
   * yessica, angelo-litrico, or a partner brand.
   */
  brand?: string;
  /** A promotion collection id (items[].collection_ids), e.g. 19727. */
  collection_id?: string | number;
  [key: string]: unknown;
}

export interface CeaSuggestionsOptions {
  /** The start of a search. Without it, the top searches alone. */
  query?: string;
  [key: string]: unknown;
}

export interface CeaCategoriesOptions {
  [key: string]: unknown;
}

export interface CeaProductOptions {
  /** The product id (items[].product_id). */
  product_id?: string | number;
  /** The id of one size (sizes[].sku): returns its product. */
  sku?: string | number;
  /** The product slug (the link's path before /p). */
  slug?: string;
  /** A product link (https://www.cea.com.br/<slug>/p). */
  url?: string;
  [key: string]: unknown;
}

export interface CeaShippingOptions {
  /** The id of one size (sizes[].sku from product or a listing). */
  sku: string | number;
  /** A Brazilian CEP (8 digits). */
  cep: string | number;
  [key: string]: unknown;
}

export interface CeaStoresOptions {
  /** A Brazilian CEP (8 digits). */
  cep: string | number;
  [key: string]: unknown;
}

export interface CeaReviewsOptions {
  /**
   * The product id (items[].product_id or product_id of the product endpoint), not a size sku or
   * the reference.
   */
  product_id: string | number;
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

export class CeaNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = CEA_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/cea/${path}`, options, undefined, timeout);
  }

  /**
   * Search C&A Brasil (cea.com.br, the Brazilian arm of the C&A fashion chain), Brazil only, pt-BR
   * text, BRL prices. Scavio fetches the public C&A Brasil page on request. By keyword, sorted by
   * the site's sorts (price, best sellers, newest, discount, name). Costs 1 credit.
   */
  async search(options: CeaSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One department, category or subcategory listing of C&A Brasil (cea.com.br, the Brazilian arm of
   * the C&A fashion chain), Brazil only, pt-BR text, BRL prices. Scavio fetches the public C&A
   * Brasil page on request. By category path (categories[].path), sorted like search. Costs 1
   * credit.
   */
  async category(options: CeaCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One brand's products on C&A Brasil (cea.com.br, the Brazilian arm of the C&A fashion chain),
   * Brazil only, pt-BR text, BRL prices. Scavio fetches the public C&A Brasil page on request. By
   * the brand value of the site's Marcas filter (C&A's own labels such as Palomino, Clock House,
   * Yessica, Angelo Litrico, and partner brands), sorted like search. Costs 1 credit.
   */
  async brand(options: CeaBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * One promotion collection of C&A Brasil (cea.com.br, the Brazilian arm of the C&A fashion
   * chain), Brazil only, pt-BR text, BRL prices. Scavio fetches the public C&A Brasil page on
   * request. By collection id (items[].collection_ids, e.g. a Black Friday or free-shipping
   * collection), with list price, sale price and discount_percent; sort discount puts the deepest
   * discounts first. Costs 1 credit.
   */
  async deals(options: CeaDealsOptions): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * The filter values of C&A Brasil (cea.com.br, the Brazilian arm of the C&A fashion chain),
   * Brazil only, pt-BR text, BRL prices. Scavio fetches the public C&A Brasil page on request. For
   * a query, or one category, brand or collection. Costs 1 credit.
   */
  async facets(options: CeaFacetsOptions): Promise<Record<string, unknown>> {
    return this.post("facets", options);
  }

  /**
   * The search box of C&A Brasil (cea.com.br, the Brazilian arm of the C&A fashion chain), Brazil
   * only, pt-BR text, BRL prices. Scavio fetches the public C&A Brasil page on request. For the
   * start of a search. Costs 1 credit.
   */
  async suggestions(options: CeaSuggestionsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * The department tree of C&A Brasil (cea.com.br, the Brazilian arm of the C&A fashion chain),
   * Brazil only, pt-BR text, BRL prices. Scavio fetches the public C&A Brasil page on request.
   * Costs 1 credit.
   */
  async categories(options: CeaCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One product of C&A Brasil (cea.com.br, the Brazilian arm of the C&A fashion chain), Brazil
   * only, pt-BR text, BRL prices. Scavio fetches the public C&A Brasil page on request. By product
   * id, size sku, slug or link: every size with its price, list price, Pix price,
   * available_quantity (the site's capped figure) and seller, each payment method's longest plan
   * and the specifications. No EAN, reviews or store units. Costs 1 credit.
   */
  async product(options: CeaProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The delivery quote of C&A Brasil (cea.com.br, the Brazilian arm of the C&A fashion chain),
   * Brazil only, pt-BR text, BRL prices. Scavio fetches the public C&A Brasil page on request. For
   * one size (sku) and a CEP, as the product page gives it: the delivery options with price and
   * estimate, and the stores near the CEP that can hand this size over. Read-only: nothing is added
   * to a cart or ordered. Costs 1 credit.
   */
  async shipping(options: CeaShippingOptions): Promise<Record<string, unknown>> {
    return this.post("shipping", options);
  }

  /**
   * The pickup points near a CEP on C&A Brasil (cea.com.br, the Brazilian arm of the C&A fashion
   * chain), Brazil only, pt-BR text, BRL prices. Scavio fetches the public C&A Brasil page on
   * request. The pickup points near a CEP, nearest first, with address, coordinates and hours.
   * Includes third-party pickup lockers and counters (Clique Retire, type partner_point) next to
   * the C&A stores. Costs 1 credit.
   */
  async stores(options: CeaStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * The customer reviews of one product of C&A Brasil (cea.com.br, the Brazilian arm of the C&A
   * fashion chain). Scavio fetches the public C&A Brasil page on request. Brazil: Portuguese
   * (pt-BR) text. By product_id, with the star histogram, positive, negative and with-photo counts
   * and the size and colour bought where the review carries it,
   * as the product page shows them, up to 100 per page, sorted newest or most_helpful, filtered
   * positive, negative or with_photos, or one star rating. Reviews can lag the page by up to 4
   * hours. Review text is the customer's own; reviewer names are never returned. No questions and
   * answers. Costs 1 credit.
   */
  async reviews(options: CeaReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }
}
