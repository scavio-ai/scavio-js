import type { Scavio } from "../client.js";

// O Boticario and Eudora (boticario.com.br, eudora.com.br, the beauty brands of Grupo Boticario;
// chosen with brand) search, category, categories, product, prices, reviews, stores, pickup, deals,
// promotions and suggestions endpoints; Brazil only, prices in BRL (card and Pix price), 1 credit
// each, 2 when a page needs a second route, prices 1 per 5 SKUs. Generated from the backend routes:
// every option and its doc mirrors the API's own request schema. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to BOTICARIO_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused
// inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every boticario call. */
export const BOTICARIO_TIMEOUT = 240_000;

export interface BoticarioSearchOptions {
  /** Search keywords. */
  query: string;
  /**
   * boticario (O Boticario, www.boticario.com.br; default) or eudora (Eudora, www.eudora.com.br).
   */
  brand?: "boticario" | "eudora";
  /** relevance (default), price_asc, price_desc, discount, rating, best_sellers or newest. */
  sort?: "relevance" | "price_asc" | "price_desc" | "discount" | "rating" | "best_sellers" | "newest";
  /**
   * Product brand slug(s) as the site writes them (facets key marca, e.g. egeo, floratta, lily).
   */
  product_brand?: string | string[];
  /** Product line slug(s) (facets key linha). */
  line?: string | string[];
  /** Category slug(s) (facets key categoria). */
  category?: string | string[];
  /** 1-4: that many stars or more; 5: 5 stars. */
  min_rating?: number;
  /** Minimum price in BRL. */
  min_price?: number;
  /** Maximum price in BRL. */
  max_price?: number;
  /**
   * Any other facet the listing offers, by facets[].key: {"<key>": value or [values]} (values from
   * facets[].values[].value).
   */
  facets?: Record<string, unknown>;
  /** Results page, 1-100 (36 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface BoticarioCategoryOptions {
  /**
   * A listing path or link: a department (/perfumaria/), a category (/maquiagem/boca/batom/), a
   * product brand (/egeo/) or a categories[] path.
   */
  path: string;
  /**
   * boticario (O Boticario, www.boticario.com.br; default) or eudora (Eudora, www.eudora.com.br).
   */
  brand?: "boticario" | "eudora";
  /** relevance (default), price_asc, price_desc, discount, rating, best_sellers or newest. */
  sort?: "relevance" | "price_asc" | "price_desc" | "discount" | "rating" | "best_sellers" | "newest";
  /**
   * Product brand slug(s) as the site writes them (facets key marca, e.g. egeo, floratta, lily).
   */
  product_brand?: string | string[];
  /** Product line slug(s) (facets key linha). */
  line?: string | string[];
  /** Category slug(s) (facets key categoria). */
  category?: string | string[];
  /** 1-4: that many stars or more; 5: 5 stars. */
  min_rating?: number;
  /** Minimum price in BRL. */
  min_price?: number;
  /** Maximum price in BRL. */
  max_price?: number;
  /**
   * Any other facet the listing offers, by facets[].key: {"<key>": value or [values]} (values from
   * facets[].values[].value).
   */
  facets?: Record<string, unknown>;
  /** Results page, 1-100 (36 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface BoticarioCategoriesOptions {
  /**
   * boticario (O Boticario, www.boticario.com.br; default) or eudora (Eudora, www.eudora.com.br).
   */
  brand?: "boticario" | "eudora";
  [key: string]: unknown;
}

export interface BoticarioDealsOptions {
  /**
   * boticario (O Boticario, www.boticario.com.br; default) or eudora (Eudora, www.eudora.com.br).
   */
  brand?: "boticario" | "eudora";
  /**
   * beauty_week (default: the site's Black Friday event, /beauty-week/) or promotions (the
   * promotions hub, /promocao/).
   */
  type?: "beauty_week" | "promotions";
  /**
   * Optional sub-page as the site's links write it: a department (perfumaria, maquiagem, cabelos)
   * or a promotion (menor-preco-do-mes, leve-x-pague-y, desconto-progressivo, cashback).
   */
  section?: string;
  /** relevance (default), price_asc, price_desc, discount, rating, best_sellers or newest. */
  sort?: "relevance" | "price_asc" | "price_desc" | "discount" | "rating" | "best_sellers" | "newest";
  /**
   * Product brand slug(s) as the site writes them (facets key marca, e.g. egeo, floratta, lily).
   */
  product_brand?: string | string[];
  /** Product line slug(s) (facets key linha). */
  line?: string | string[];
  /** Category slug(s) (facets key categoria). */
  category?: string | string[];
  /** 1-4: that many stars or more; 5: 5 stars. */
  min_rating?: number;
  /** Minimum price in BRL. */
  min_price?: number;
  /** Maximum price in BRL. */
  max_price?: number;
  /**
   * Any other facet the listing offers, by facets[].key: {"<key>": value or [values]} (values from
   * facets[].values[].value).
   */
  facets?: Record<string, unknown>;
  /** Results page, 1-100 (36 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface BoticarioPromotionsOptions {
  /**
   * boticario (O Boticario, www.boticario.com.br; default) or eudora (Eudora, www.eudora.com.br).
   */
  brand?: "boticario" | "eudora";
  [key: string]: unknown;
}

export interface BoticarioProductOptions {
  /** The product slug (items[].slug). */
  slug?: string;
  /**
   * boticario (O Boticario, www.boticario.com.br; default) or eudora (Eudora, www.eudora.com.br).
   */
  brand?: "boticario" | "eudora";
  /** A boticario.com.br or eudora.com.br product link, instead of slug (names the brand too). */
  url?: string;
  /** A product SKU (items[].sku), instead of slug: resolved through the site's SKU lookup. */
  sku?: string;
  [key: string]: unknown;
}

export interface BoticarioPricesOptions {
  /** 1-10 SKUs (an array or comma-separated). */
  skus: string[] | string;
  /**
   * boticario (O Boticario, www.boticario.com.br; default) or eudora (Eudora, www.eudora.com.br).
   */
  brand?: "boticario" | "eudora";
  [key: string]: unknown;
}

export interface BoticarioReviewsOptions {
  /**
   * A SKU (that shade's reviews) or the product endpoint's product_group_id (every shade together:
   * the count the product page shows).
   */
  product_id: string;
  /**
   * boticario (O Boticario, www.boticario.com.br; default) or eudora (Eudora, www.eudora.com.br).
   */
  brand?: "boticario" | "eudora";
  /** Page, 1-based. */
  page?: number;
  /** Reviews per page, 1-50 (default 20). */
  page_size?: number;
  /** most_recent, most_useful or oldest (default: the site's order). */
  sort?: "most_recent" | "most_useful" | "oldest";
  /** Only reviews with this many stars. */
  stars?: number;
  [key: string]: unknown;
}

export interface BoticarioStoresOptions {
  /** A Brazilian CEP (8 digits). */
  cep: string | number;
  /**
   * boticario (O Boticario, www.boticario.com.br; default) or eudora (Eudora, www.eudora.com.br).
   */
  brand?: "boticario" | "eudora";
  /** Page, 1-based. */
  page?: number;
  /** Stores per page, 1-50 (default 20). */
  page_size?: number;
  /** Optional radius around the CEP in km. */
  radius_km?: number;
  [key: string]: unknown;
}

export interface BoticarioPickupOptions {
  /** A Brazilian CEP (8 digits). */
  cep: string | number;
  /**
   * boticario (O Boticario, www.boticario.com.br; default) or eudora (Eudora, www.eudora.com.br).
   */
  brand?: "boticario" | "eudora";
  /** The product slug (items[].slug). */
  slug?: string;
  /** A boticario.com.br or eudora.com.br product link, instead of slug (names the brand too). */
  url?: string;
  /** A product SKU (items[].sku), instead of slug: resolved through the site's SKU lookup. */
  sku?: string;
  [key: string]: unknown;
}

export interface BoticarioSuggestionsOptions {
  /** What a shopper types (a SKU works too). */
  query: string;
  /**
   * boticario (O Boticario, www.boticario.com.br; default) or eudora (Eudora, www.eudora.com.br).
   */
  brand?: "boticario" | "eudora";
  [key: string]: unknown;
}

export class BoticarioNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = BOTICARIO_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/boticario/${path}`, options, undefined, timeout);
  }

  /**
   * Search O Boticario and Eudora (boticario.com.br, eudora.com.br, the beauty brands of Grupo
   * Boticario). Scavio fetches the public page on request; neither brand has a public API. brand
   * picks the storefront (boticario or eudora). Brazil only, prices in Brazilian reais (BRL), data
   * in Portuguese, as shown to a visitor who is not signed in. By keyword. 36 per page in 7 sorts,
   * filtered by product brand, line, category, rating, price and any other facet the listing
   * offers. 1 credit, 2 when the page needs a second route; credits_used in the response is the
   * exact charge.
   */
  async search(options: BoticarioSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One listing of O Boticario and Eudora (boticario.com.br, eudora.com.br, the beauty brands of
   * Grupo Boticario). Scavio fetches the public page on request; neither brand has a public API.
   * brand picks the storefront (boticario or eudora). Brazil only, prices in Brazilian reais (BRL),
   * data in Portuguese, as shown to a visitor who is not signed in. A department, category or
   * product-brand page by path or link, sorted and filtered like search. 36 per page in 7 sorts,
   * filtered by product brand, line, category, rating, price and any other facet the listing
   * offers. 1 credit, 2 when the page needs a second route; credits_used in the response is the
   * exact charge.
   */
  async category(options: BoticarioCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The category menu of O Boticario and Eudora (boticario.com.br, eudora.com.br, the beauty brands
   * of Grupo Boticario). Scavio fetches the public page on request; neither brand has a public API.
   * brand picks the storefront (boticario or eudora). Brazil only, prices in Brazilian reais (BRL),
   * data in Portuguese, as shown to a visitor who is not signed in. The department menu with its
   * groups and links (every path works in category). 1 credit, 2 when the page needs a second
   * route; credits_used in the response is the exact charge.
   */
  async categories(options: BoticarioCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * The deal listings of O Boticario and Eudora (boticario.com.br, eudora.com.br, the beauty brands
   * of Grupo Boticario). Scavio fetches the public page on request; neither brand has a public API.
   * brand picks the storefront (boticario or eudora). Brazil only, prices in Brazilian reais (BRL),
   * data in Portuguese, as shown to a visitor who is not signed in. type beauty_week (the site's
   * Black Friday event, Beauty Week) or promotions (the promotions hub), optionally one section
   * (/beauty-week/perfumaria/, /promocao/menor-preco-do-mes/), sorted and filtered like search;
   * each item carries its own countdown end (deal_ends_at) and its deal badges. 36 per page in 7
   * sorts, filtered by product brand, line, category, rating, price and any other facet the listing
   * offers. 1 credit, 2 when the page needs a second route; credits_used in the response is the
   * exact charge.
   */
  async deals(options: BoticarioDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * The promotions conditions page of O Boticario and Eudora (boticario.com.br, eudora.com.br, the
   * beauty brands of Grupo Boticario). Scavio fetches the public page on request; neither brand has
   * a public API. brand picks the storefront (boticario or eudora). Brazil only, prices in
   * Brazilian reais (BRL), data in Portuguese, as shown to a visitor who is not signed in. Each
   * campaign's validity dates and coupon codes, as written on the page. 1 credit, 2 when the page
   * needs a second route; credits_used in the response is the exact charge.
   */
  async promotions(options: BoticarioPromotionsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("promotions", options);
  }

  /**
   * One product of O Boticario and Eudora (boticario.com.br, eudora.com.br, the beauty brands of
   * Grupo Boticario). Scavio fetches the public page on request; neither brand has a public API.
   * brand picks the storefront (boticario or eudora). Brazil only, prices in Brazilian reais (BRL),
   * data in Portuguese, as shown to a visitor who is not signed in. By slug, link or SKU. 1 credit,
   * 2 when the page needs a second route; credits_used in the response is the exact charge.
   */
  async product(options: BoticarioProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Current prices of up to 10 SKUs on O Boticario and Eudora (boticario.com.br, eudora.com.br, the
   * beauty brands of Grupo Boticario). Scavio fetches the public page on request; neither brand has
   * a public API. brand picks the storefront (boticario or eudora). Brazil only, prices in
   * Brazilian reais (BRL), data in Portuguese, as shown to a visitor who is not signed in. One SKU
   * lookup per SKU. 1 credit per 5 SKUs (2 for 6-10 SKUs); credits_used in the response is the
   * exact charge.
   */
  async prices(options: BoticarioPricesOptions): Promise<Record<string, unknown>> {
    return this.post("prices", options);
  }

  /**
   * Reviews of one product of O Boticario and Eudora (boticario.com.br, eudora.com.br, the beauty
   * brands of Grupo Boticario). Scavio fetches the public page on request; neither brand has a
   * public API. brand picks the storefront (boticario or eudora). Brazil only, prices in Brazilian
   * reais (BRL), data in Portuguese, as shown to a visitor who is not signed in. By SKU or by
   * product_group_id (every shade together), up to 50 per page, sorted and filtered by stars; no
   * reviewer names. Costs 1 credit.
   */
  async reviews(options: BoticarioReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * The stores of O Boticario and Eudora (boticario.com.br, eudora.com.br, the beauty brands of
   * Grupo Boticario). Scavio fetches the public page on request; neither brand has a public API.
   * brand picks the storefront (boticario or eudora). Brazil only, prices in Brazilian reais (BRL),
   * data in Portuguese, as shown to a visitor who is not signed in. Those that offer pickup of
   * online orders near a CEP, nearest first. Costs 1 credit.
   */
  async stores(options: BoticarioStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * Delivery and pickup for one product of O Boticario and Eudora (boticario.com.br, eudora.com.br,
   * the beauty brands of Grupo Boticario). Scavio fetches the public page on request; neither brand
   * has a public API. brand picks the storefront (boticario or eudora). Brazil only, prices in
   * Brazilian reais (BRL), data in Portuguese, as shown to a visitor who is not signed in. Delivery
   * options and whether store pickup is offered at a CEP. Costs 1 credit.
   */
  async pickup(options: BoticarioPickupOptions): Promise<Record<string, unknown>> {
    return this.post("pickup", options);
  }

  /**
   * The search suggestions of O Boticario and Eudora (boticario.com.br, eudora.com.br, the beauty
   * brands of Grupo Boticario). Scavio fetches the public page on request; neither brand has a
   * public API. brand picks the storefront (boticario or eudora). Brazil only, prices in Brazilian
   * reais (BRL), data in Portuguese, as shown to a visitor who is not signed in. For what a shopper
   * types: search terms and up to 5 products. Costs 1 credit.
   */
  async suggestions(options: BoticarioSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
