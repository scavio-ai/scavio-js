import type { Scavio } from "../client.js";

// Pichau (pichau.com.br, Brazil's PC-parts store) search, category, brand, deals, product, product
// live, reviews, installments, coupons, categories and suggestions endpoints; Brazil only, prices
// in BRL with the Pix price, 1 credit each. Generated from the backend routes: every option and its
// doc mirrors the API's own request schema. The server enforces the value rules and the one-of
// rules (send one of an id or a link). Every call raises the request timeout to PICHAU_TIMEOUT and
// never lowers a longer client timeout. Failed upstream calls and refused inputs are not charged; a
// not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every pichau call. */
export const PICHAU_TIMEOUT = 240_000;

export interface PichauSearchOptions {
  /** Search keywords, in Portuguese as shoppers type them. */
  query: string;
  /**
   * relevance (the default, the site's own order), price_asc, price_desc, name_asc or name_desc.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
  /** Results page, 1-based, 36 products each. total_pages reports the last one. */
  page?: number;
  /**
   * Filters, at most 5 keys: {key: value}, exactly as facets[].key and facets[].values[].value of
   * an answer list them (e.g. marcas (brand), price (a range such as 0_1000), rgpu, socket). One
   * value per key.
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PichauCategoryOptions {
  /**
   * A category path as the site writes it (categories[].path, or the path of a category link on
   * www.pichau.com.br), e.g. hardware/placa-de-video, monitores, perifericos/teclado,
   * cadeiras/gamer.
   */
  category: string;
  /**
   * relevance (the default, the site's own order), price_asc, price_desc, name_asc or name_desc.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
  /** Results page, 1-based, 36 products each. total_pages reports the last one. */
  page?: number;
  /**
   * Filters, at most 5 keys: {key: value}, exactly as facets[].key and facets[].values[].value of
   * an answer list them (e.g. marcas (brand), price (a range such as 0_1000), rgpu, socket). One
   * value per key.
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PichauBrandOptions {
  /**
   * A brand slug (items[].brand_slug, or the part after /marca/ in a brand link), e.g. corsair,
   * asus, redragon.
   */
  brand: string;
  /**
   * relevance (the default, the site's own order), price_asc, price_desc, name_asc or name_desc.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
  /** Results page, 1-based, 36 products each. total_pages reports the last one. */
  page?: number;
  /**
   * Filters, at most 5 keys: {key: value}, exactly as facets[].key and facets[].values[].value of
   * an answer list them (e.g. marcas (brand), price (a range such as 0_1000), rgpu, socket). One
   * value per key.
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PichauDealsOptions {
  /**
   * black_friday (the default: the site's Black Friday 2026 campaign page) or open_box (open-box
   * products).
   */
  deal?: "black_friday" | "open_box";
  /** Another campaign by slug (items[].offer.campaign_path without promocao/), instead of deal. */
  campaign?: string;
  /**
   * relevance (the default, the site's own order), price_asc, price_desc, name_asc or name_desc.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
  /** Results page, 1-based, 36 products each. total_pages reports the last one. */
  page?: number;
  /**
   * Filters, at most 5 keys: {key: value}, exactly as facets[].key and facets[].values[].value of
   * an answer list them (e.g. marcas (brand), price (a range such as 0_1000), rgpu, socket). One
   * value per key.
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PichauProductOptions {
  /**
   * The product's url_key (items[].url_key; the part after www.pichau.com.br/ in a product link).
   * Send url_key or url.
   */
  url_key?: string;
  /** A product link on www.pichau.com.br (items[].url), instead of url_key. */
  url?: string;
  [key: string]: unknown;
}

export interface PichauProductLiveOptions {
  /**
   * The product's url_key (items[].url_key; the part after www.pichau.com.br/ in a product link).
   * Send url_key or url.
   */
  url_key?: string;
  /** A product link on www.pichau.com.br (items[].url), instead of url_key. */
  url?: string;
  [key: string]: unknown;
}

export interface PichauReviewsOptions {
  /** The Pichau product id (items[].product_id, the product endpoint's product_id). */
  product_id: string | number;
  /** Page, 1-based, 10 reviews each (newest first). */
  page?: number;
  /** Only reviews with this many stars (1-5). */
  rating?: number;
  /** Only reviews with photos or videos. */
  with_media?: boolean;
  [key: string]: unknown;
}

export interface PichauInstallmentsOptions {
  /**
   * The product's url_key (items[].url_key; the part after www.pichau.com.br/ in a product link).
   * Send url_key or url.
   */
  url_key?: string;
  /** A product link on www.pichau.com.br (items[].url), instead of url_key. */
  url?: string;
  /** The Pichau product id (items[].product_id), with price: the fastest form. */
  product_id?: string | number;
  /** With product_id: the product's card price in BRL (items[].price). */
  price?: number;
  [key: string]: unknown;
}

export interface PichauCouponsOptions {
  [key: string]: unknown;
}

export interface PichauCategoriesOptions {
  /**
   * Every node of the menu, including campaign and partner pages the site keeps out of its menu.
   * Defaults to false.
   */
  all?: boolean;
  [key: string]: unknown;
}

export interface PichauSuggestionsOptions {
  /** What a shopper has typed into the search box (2+ characters). */
  query: string;
  [key: string]: unknown;
}

export class PichauNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = PICHAU_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/pichau/${path}`, options, undefined, timeout);
  }

  /**
   * Search Pichau (pichau.com.br, Brazil's PC-parts store). Scavio fetches the public Pichau page
   * on request. Brazil: Portuguese text, prices in BRL as shown to a visitor who is not signed in.
   * By keyword. 36 per page, in the site's order, by price or by name, filtered by the listing's
   * own facets. Costs 1 credit.
   */
  async search(options: PichauSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category of Pichau (pichau.com.br, Brazil's PC-parts store). Scavio fetches the public
   * Pichau page on request. Brazil: Portuguese text, prices in BRL as shown to a visitor who is not
   * signed in. By category path. 36 per page, in the site's order, by price or by name, filtered by
   * the listing's own facets. Costs 1 credit.
   */
  async category(options: PichauCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One brand's products on Pichau (pichau.com.br, Brazil's PC-parts store). Scavio fetches the
   * public Pichau page on request. Brazil: Portuguese text, prices in BRL as shown to a visitor who
   * is not signed in. By brand slug. 36 per page, in the site's order, by price or by name,
   * filtered by the listing's own facets. Costs 1 credit.
   */
  async brand(options: PichauBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * The deal listings of Pichau (pichau.com.br, Brazil's PC-parts store). Scavio fetches the public
   * Pichau page on request. Brazil: Portuguese text, prices in BRL as shown to a visitor who is not
   * signed in. black_friday (the Black Friday 2026 campaign page), open_box (open-box products) or
   * another campaign by slug. 36 per page, in the site's order, by price or by name, filtered by
   * the listing's own facets. Costs 1 credit.
   */
  async deals(options: PichauDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * One product of Pichau (pichau.com.br, Brazil's PC-parts store). Scavio fetches the public
   * Pichau page on request. Brazil: Portuguese text, prices in BRL as shown to a visitor who is not
   * signed in. By url_key or link. Costs 1 credit.
   */
  async product(options: PichauProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One product page of Pichau (pichau.com.br, Brazil's PC-parts store). Scavio fetches the public
   * Pichau page on request as a visitor sees it. Brazil: Portuguese text, prices in
   * BRL as shown to a visitor who is not signed in. By url_key or link: the live offer (units left,
   * units sold), the benchmark FPS the site shows on PCs and a prebuilt PC's or kit's component
   * list. Slower than product (usually 30-160 s). Costs 1 credit.
   */
  async productLive(options: PichauProductLiveOptions): Promise<Record<string, unknown>> {
    return this.post("product-live", options);
  }

  /**
   * Customer reviews of one product of Pichau (pichau.com.br, Brazil's PC-parts store). Scavio
   * fetches the public Pichau page on request. By product_id, newest first, 10 per page, filtered
   * by stars or media. Costs 1 credit.
   */
  async reviews(options: PichauReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * Every card plan of one product of Pichau (pichau.com.br, Brazil's PC-parts store). Scavio
   * fetches the public Pichau page on request. Brazil: Portuguese text, prices in BRL as shown to a
   * visitor who is not signed in. By product_id and price (fast) or by url_key / link (the product
   * page is read first for its id and price). Costs 1 credit.
   */
  async installments(options: PichauInstallmentsOptions): Promise<Record<string, unknown>> {
    return this.post("installments", options);
  }

  /**
   * The coupons of Pichau (pichau.com.br, Brazil's PC-parts store). Scavio fetches the public
   * Pichau page on request. As the coupons page lists them. Costs 1 credit.
   */
  async coupons(options: PichauCouponsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("coupons", options);
  }

  /**
   * The category menu of Pichau (pichau.com.br, Brazil's PC-parts store). Scavio fetches the public
   * Pichau page on request. Costs 1 credit.
   */
  async categories(options: PichauCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * What the search box of Pichau (pichau.com.br, Brazil's PC-parts store) suggests for what a
   * shopper typed. Scavio fetches the public Pichau page on request. Terms with their product
   * counts, categories and up to 10 products, as the box lists them. Usually 30-160 s. Costs 1
   * credit.
   */
  async suggestions(options: PichauSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
