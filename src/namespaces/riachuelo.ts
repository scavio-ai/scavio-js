import type { Scavio } from "../client.js";

// Riachuelo (riachuelo.com.br, the Brazilian fashion retailer) search, category, deals and product
// endpoints; Brazil only, prices in BRL, sold-out flags and units per size on listings, 1 credit
// each. Generated from the backend routes: every option and its doc mirrors the API's own request
// schema. The server enforces the value rules and the one-of rules (send one of an id or a link).
// Every call raises the request timeout to RIACHUELO_TIMEOUT (search to RIACHUELO_SEARCH_TIMEOUT)
// and never lowers a longer client timeout. Failed upstream calls and refused inputs are not
// charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every riachuelo call. */
export const RIACHUELO_TIMEOUT = 180_000;
/** Minimum request timeout (ms) for riachuelo.search(). */
export const RIACHUELO_SEARCH_TIMEOUT = 300_000;

export interface RiachueloSearchOptions {
  /** Search keywords (Portuguese, as a shopper types them). */
  query: string;
  /**
   * relevance (default), newest, best_selling, discount, price_asc or price_desc (the site's
   * sorts).
   */
  sort?: "relevance" | "newest" | "best_selling" | "discount" | "price_asc" | "price_desc";
  /**
   * Filter id -> value or values, from a listing's filters[].id (filter_size, filter_color, gender,
   * catalog_class, brand, gg) and filters[].options[].value; up to 10 values. Several values of one
   * filter match any of them; several filters must all match.
   */
  filters?: Record<string, unknown>;
  /** Results page, 1-500 (24 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface RiachueloCategoryOptions {
  /**
   * A category by its path as the site writes it (feminino, masculino, infantil,
   * feminino/colecao-feminino/vestido; breadcrumbs[].path and items[].categories carry them) or a
   * riachuelo.com.br link to one.
   */
  category: string;
  /**
   * relevance (default), newest, best_selling, discount, price_asc or price_desc (the site's
   * sorts).
   */
  sort?: "relevance" | "newest" | "best_selling" | "discount" | "price_asc" | "price_desc";
  /**
   * Filter id -> value or values, from a listing's filters[].id (filter_size, filter_color, gender,
   * catalog_class, brand, gg) and filters[].options[].value; up to 10 values. Several values of one
   * filter match any of them; several filters must all match.
   */
  filters?: Record<string, unknown>;
  /** Results page, 1-500 (24 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface RiachueloDealsOptions {
  /**
   * The Black Friday campaign page of a department (feminino, the default, masculino or infantil).
   */
  department?: string;
  /**
   * Another campaign page by its path (campanha/...; items[].promo_tag.campaign carries them) or a
   * riachuelo.com.br link, instead of department.
   */
  campaign?: string;
  /**
   * relevance (default), newest, best_selling, discount, price_asc or price_desc (the site's
   * sorts).
   */
  sort?: "relevance" | "newest" | "best_selling" | "discount" | "price_asc" | "price_desc";
  /**
   * Filter id -> value or values, from a listing's filters[].id (filter_size, filter_color, gender,
   * catalog_class, brand, gg) and filters[].options[].value; up to 10 values. Several values of one
   * filter match any of them; several filters must all match.
   */
  filters?: Record<string, unknown>;
  /** Results page, 1-500 (24 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface RiachueloProductOptions {
  /** The product sku (items[].sku: digits, or KIT<digits> for a kit), instead of url. */
  sku?: string;
  /** A riachuelo.com.br product link or path (items[].url). */
  url?: string;
  [key: string]: unknown;
}

export class RiachueloNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = RIACHUELO_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/riachuelo/${path}`, options, undefined, timeout);
  }

  /**
   * Search Riachuelo (riachuelo.com.br, the Brazilian fashion retailer). Scavio fetches the public
   * riachuelo.com.br pages on request. Brazil: Portuguese (pt-BR) text and prices in BRL, as shown
   * to a visitor who is not signed in. By keyword, across the whole site. 24 per page, pages 1-500,
   * in the site's sorts (relevance, newest, best_selling, discount, price_asc, price_desc),
   * filtered by the listing's own filters (size, colour, gender, subcategory, brand, category
   * group). Costs 1 credit.
   */
  async search(options: RiachueloSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options, RIACHUELO_SEARCH_TIMEOUT);
  }

  /**
   * One category listing of Riachuelo (riachuelo.com.br, the Brazilian fashion retailer). Scavio
   * fetches the public riachuelo.com.br pages on request. Brazil: Portuguese (pt-BR) text and
   * prices in BRL, as shown to a visitor who is not signed in. By category path (feminino,
   * feminino/colecao-feminino/vestido) or link, sorted and filtered like search. 24 per page, pages
   * 1-500, in the site's sorts (relevance, newest, best_selling, discount, price_asc, price_desc),
   * filtered by the listing's own filters (size, colour, gender, subcategory, brand, category
   * group). Costs 1 credit.
   */
  async category(options: RiachueloCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * A campaign page of Riachuelo (riachuelo.com.br, the Brazilian fashion retailer). Scavio fetches
   * the public riachuelo.com.br pages on request. Brazil: Portuguese (pt-BR) text and prices in
   * BRL, as shown to a visitor who is not signed in. The Black Friday page of a department (default
   * feminino), or another campaign page by path (items[].promo_tag.campaign), sorted and filtered
   * like search. 24 per page, pages 1-500, in the site's sorts (relevance, newest, best_selling,
   * discount, price_asc, price_desc), filtered by the listing's own filters (size, colour, gender,
   * subcategory, brand, category group). Costs 1 credit.
   */
  async deals(options: RiachueloDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * One product of Riachuelo (riachuelo.com.br, the Brazilian fashion retailer). Scavio fetches the
   * public riachuelo.com.br pages on request. Brazil: Portuguese (pt-BR) text and prices in BRL, as
   * shown to a visitor who is not signed in. By link or sku: price, list price, the sold-out flag
   * and availability, composition and attributes, the rating summary and the reviews the product
   * page itself shows (without reviewer names). No stock per size (listing cards carry the per-size
   * flags and units), shipping quotes or store stock. Costs 1 credit.
   */
  async product(options: RiachueloProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }
}
