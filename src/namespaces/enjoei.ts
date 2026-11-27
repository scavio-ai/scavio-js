import type { Scavio } from "../client.js";

// Enjoei (enjoei.com.br, Brazil's second-hand fashion marketplace) search, category, categories,
// product, shop, shop listings, shop sold, shop reviews and suggestions endpoints; Brazil only,
// prices in BRL, sellers by @handle only, 1 credit each. Generated from the backend routes: every
// option and its doc mirrors the API's own request schema. The server enforces the value rules and
// the one-of rules (send one of an id or a link). Every call raises the request timeout to
// ENJOEI_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused inputs
// are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every enjoei call. */
export const ENJOEI_TIMEOUT = 240_000;

export interface EnjoeiSearchOptions {
  /** Search keywords (Portuguese). */
  query: string;
  /** relevance (default), price_asc, price_desc or discount (largest discount at the top). */
  sort?: "relevance" | "price_asc" | "price_desc" | "discount";
  /**
   * Brand slugs as Enjoei writes them (facets.brands[].slug, e.g. farm, zara, le-lis-blanc), one or
   * up to 10.
   */
  brand?: string | string[];
  /** Clothing sizes (facets.sizes.clothes[].slug: pp, p, m, g, gg, xgg, 36, 38...). */
  size_clothes?: string | string[];
  /** Waist sizes (facets.sizes.waist[].slug). */
  size_waist?: string | string[];
  /** Shoe sizes (facets.sizes.shoes[].slug). */
  size_shoes?: string | string[];
  /** Lowest price, BRL. */
  price_min?: number;
  /** Highest price, BRL. */
  price_max?: number;
  /** new (never used) or used. */
  condition?: "new" | "used";
  /** Listed in the last 24h, 7d, 14d or 30d. */
  listed_within?: "24h" | "7d" | "14d" | "30d";
  /** pro (Enjoei Pro stores) or celebrity (Enjoei's famosas, celebrity closets). */
  store_kind?: "pro" | "celebrity";
  /** Smallest discount, percent. */
  discount_min?: number;
  /** Largest discount, percent. */
  discount_max?: number;
  /**
   * next_cursor of the previous page (pages are cursor-paged: a page is reached from the one before
   * it).
   */
  cursor?: string;
  [key: string]: unknown;
}

export interface EnjoeiCategoryOptions {
  /**
   * Department slug (categories: departments[].params.department, e.g. feminino, masculino,
   * infantil, casa-e-decor).
   */
  department: string;
  /** Category slug in that department (params.category, e.g. feminino-roupas). */
  category?: string;
  /**
   * Subcategory slug in that category (params.subcategory, e.g. feminino-roupas-vestidos). Needs
   * category.
   */
  subcategory?: string;
  /** Optional keywords inside the category. */
  query?: string;
  /** relevance (default), price_asc, price_desc or discount (largest discount at the top). */
  sort?: "relevance" | "price_asc" | "price_desc" | "discount";
  /**
   * Brand slugs as Enjoei writes them (facets.brands[].slug, e.g. farm, zara, le-lis-blanc), one or
   * up to 10.
   */
  brand?: string | string[];
  /** Clothing sizes (facets.sizes.clothes[].slug: pp, p, m, g, gg, xgg, 36, 38...). */
  size_clothes?: string | string[];
  /** Waist sizes (facets.sizes.waist[].slug). */
  size_waist?: string | string[];
  /** Shoe sizes (facets.sizes.shoes[].slug). */
  size_shoes?: string | string[];
  /** Lowest price, BRL. */
  price_min?: number;
  /** Highest price, BRL. */
  price_max?: number;
  /** new (never used) or used. */
  condition?: "new" | "used";
  /** Listed in the last 24h, 7d, 14d or 30d. */
  listed_within?: "24h" | "7d" | "14d" | "30d";
  /** pro (Enjoei Pro stores) or celebrity (Enjoei's famosas, celebrity closets). */
  store_kind?: "pro" | "celebrity";
  /** Smallest discount, percent. */
  discount_min?: number;
  /** Largest discount, percent. */
  discount_max?: number;
  /**
   * next_cursor of the previous page (pages are cursor-paged: a page is reached from the one before
   * it).
   */
  cursor?: string;
  [key: string]: unknown;
}

export interface EnjoeiCategoriesOptions {
  [key: string]: unknown;
}

export interface EnjoeiProductOptions {
  /** Enjoei product id (items[].id). */
  product_id?: string;
  /** A product link (https://www.enjoei.com.br/p/<name>-<id>). */
  url?: string;
  [key: string]: unknown;
}

export interface EnjoeiShopOptions {
  /**
   * Shop handle (enjoei.com.br/@<handle>, items[].seller_handle), with or without the @, or the
   * shop link.
   */
  handle: string;
  [key: string]: unknown;
}

export interface EnjoeiShopListingsOptions {
  /**
   * Shop handle (enjoei.com.br/@<handle>, items[].seller_handle), with or without the @, or the
   * shop link.
   */
  handle: string;
  /**
   * next_cursor of the previous page (pages are cursor-paged: a page is reached from the one before
   * it).
   */
  cursor?: string;
  [key: string]: unknown;
}

export interface EnjoeiShopSoldOptions {
  /**
   * Shop handle (enjoei.com.br/@<handle>, items[].seller_handle), with or without the @, or the
   * shop link.
   */
  handle: string;
  /** Page, 1 to 50, 40 sold listings each. */
  page?: number;
  [key: string]: unknown;
}

export interface EnjoeiShopReviewsOptions {
  /**
   * Shop handle (enjoei.com.br/@<handle>, items[].seller_handle), with or without the @, or the
   * shop link.
   */
  handle?: string;
  /** Seller id (shop.seller_id, product.seller.id) instead of handle. */
  shop_id?: string;
  /** all (default), positive or negative (Enjoei's own review filters). */
  filter?: "all" | "positive" | "negative";
  /** next_cursor of the previous page. */
  cursor?: string;
  [key: string]: unknown;
}

export interface EnjoeiSuggestionsOptions {
  /** What the shopper has typed so far. */
  query: string;
  [key: string]: unknown;
}

export class EnjoeiNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = ENJOEI_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/enjoei/${path}`, options, undefined, timeout);
  }

  /**
   * Search listings on Enjoei (enjoei.com.br, Brazil's second-hand fashion marketplace). Scavio
   * fetches the public Enjoei page on request; Enjoei has no public API. One market, Brazil: text
   * in Portuguese, prices in BRL as shown to a visitor who is not signed in. Costs 1 credit.
   */
  async search(options: EnjoeiSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One department, category or subcategory of Enjoei (enjoei.com.br, Brazil's second-hand fashion
   * marketplace). Scavio fetches the public Enjoei page on request; Enjoei has no public API. One
   * market, Brazil: text in Portuguese, prices in BRL as shown to a visitor who is not signed in.
   * By the slugs categories lists (departments[].params). Costs 1 credit.
   */
  async category(options: EnjoeiCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The category tree of Enjoei (enjoei.com.br, Brazil's second-hand fashion marketplace). Scavio
   * fetches the public Enjoei page on request; Enjoei has no public API. One market, Brazil: text
   * in Portuguese, prices in BRL as shown to a visitor who is not signed in. Costs 1 credit.
   */
  async categories(options: EnjoeiCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One listing of Enjoei (enjoei.com.br, Brazil's second-hand fashion marketplace). Scavio fetches
   * the public Enjoei page on request; Enjoei has no public API. One market, Brazil: text in
   * Portuguese, prices in BRL as shown to a visitor who is not signed in. By product id or link.
   * Costs 1 credit.
   */
  async product(options: EnjoeiProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * A seller's shop on Enjoei (enjoei.com.br, Brazil's second-hand fashion marketplace). Scavio
   * fetches the public Enjoei page on request; Enjoei has no public API. One market, Brazil: text
   * in Portuguese, prices in BRL as shown to a visitor who is not signed in. By handle. Costs 1
   * credit.
   */
  async shop(options: EnjoeiShopOptions): Promise<Record<string, unknown>> {
    return this.post("shop", options);
  }

  /**
   * A shop's listings on sale on Enjoei (enjoei.com.br, Brazil's second-hand fashion marketplace).
   * Scavio fetches the public Enjoei page on request; Enjoei has no public API. One market, Brazil:
   * text in Portuguese, prices in BRL as shown to a visitor who is not signed in. By handle. Costs
   * 1 credit.
   */
  async shopListings(options: EnjoeiShopListingsOptions): Promise<Record<string, unknown>> {
    return this.post("shop-listings", options);
  }

  /**
   * A shop's sold listings on Enjoei (enjoei.com.br, Brazil's second-hand fashion marketplace).
   * Scavio fetches the public Enjoei page on request; Enjoei has no public API. One market, Brazil:
   * text in Portuguese, prices in BRL as shown to a visitor who is not signed in. By handle and
   * page (1-50). Costs 1 credit.
   */
  async shopSold(options: EnjoeiShopSoldOptions): Promise<Record<string, unknown>> {
    return this.post("shop-sold", options);
  }

  /**
   * Buyer reviews of a shop on Enjoei (enjoei.com.br, Brazil's second-hand fashion marketplace).
   * Scavio fetches the public Enjoei page on request; Enjoei has no public API. One market, Brazil:
   * text in Portuguese, prices in BRL as shown to a visitor who is not signed in. By handle or
   * shop_id, filter all (default), positive or negative, 20 per page by cursor. Costs 1 credit.
   */
  async shopReviews(options: EnjoeiShopReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("shop-reviews", options);
  }

  /**
   * Search suggestions of Enjoei (enjoei.com.br, Brazil's second-hand fashion marketplace). Scavio
   * fetches the public Enjoei page on request; Enjoei has no public API. One market, Brazil: text
   * in Portuguese, prices in BRL as shown to a visitor who is not signed in. For what a shopper has
   * typed. Costs 1 credit.
   */
  async suggestions(options: EnjoeiSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
