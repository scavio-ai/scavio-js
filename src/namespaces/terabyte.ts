import type { Scavio } from "../client.js";

// Terabyteshop (terabyteshop.com.br, Brazil's PC-parts store) search, product, reviews, category,
// brand, deals, coupons, trending searches and PC builder endpoints; Brazil only, prices in BRL
// with the Pix price, 1 credit each. Generated from the backend routes: every option and its doc
// mirrors the API's own request schema. The server enforces the value rules and the one-of rules
// (send one of an id or a link). Every call raises the request timeout to TERABYTE_TIMEOUT and
// never lowers a longer client timeout. Failed upstream calls and refused inputs are not charged; a
// not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every terabyte call. */
export const TERABYTE_TIMEOUT = 240_000;

export interface TerabyteSearchOptions {
  /** Search keywords, in Portuguese as shoppers type them. */
  query: string;
  /** Results page, 1-based. */
  page?: number;
  /** Products per page, 1-100. Defaults to 24. */
  page_size?: number;
  /**
   * relevance (the default, the site's order), price_asc, price_desc (by Pix price), best_sellers
   * (units sold), top_rated or most_reviewed. The site's search ignores sorting, so Scavio sorts
   * the returned page.
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "best_sellers" | "top_rated" | "most_reviewed";
  [key: string]: unknown;
}

export interface TerabyteProductOptions {
  /**
   * The Terabyteshop product id (items[].product_id; the number after /produto/ in a product link).
   * Send product_id or url.
   */
  product_id?: string | number;
  /** A product link on www.terabyteshop.com.br (items[].url), instead of product_id. */
  url?: string;
  [key: string]: unknown;
}

export interface TerabyteReviewsOptions {
  /**
   * The Terabyteshop product id (items[].product_id; the number after /produto/ in a product link).
   * Send product_id or url.
   */
  product_id?: string | number;
  /** A product link on www.terabyteshop.com.br (items[].url), instead of product_id. */
  url?: string;
  /** Page, 1-based, 5 reviews each (newest to oldest). */
  page?: number;
  [key: string]: unknown;
}

export interface TerabyteCategoryOptions {
  /**
   * A category path as the site writes it (the path of a category link on www.terabyteshop.com.br),
   * e.g. hardware/placas-de-video, hardware/processadores, monitores, perifericos/mouse.
   */
  category: string;
  /** relevance (the default, the site's own order), price_asc or price_desc. */
  sort?: "relevance" | "price_asc" | "price_desc";
  /** Results page, 1-based, 30 products each. total_pages reports the last one. */
  page?: number;
  /** A sub-category name exactly as facets.subcategories[].name lists it. */
  subcategory?: string;
  /**
   * Spec filters, at most 5 keys: {key: value or [values]}, keys and values exactly as
   * facets.attributes[].key and .values[].value list them (e.g. modelo, fabricante, vram_gb,
   * conexao). Several values match any of them.
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TerabyteBrandOptions {
  /**
   * A category path as the site writes it (the path of a category link on www.terabyteshop.com.br),
   * e.g. hardware/placas-de-video, hardware/processadores, monitores, perifericos/mouse.
   */
  category: string;
  /**
   * A brand name as facets.brands[].name lists it (case and accents ignored). Send brand or
   * brand_id.
   */
  brand?: string;
  /** A brand id (facets.brands[].brand_id), instead of brand. */
  brand_id?: string | number;
  /** relevance (the default, the site's own order), price_asc or price_desc. */
  sort?: "relevance" | "price_asc" | "price_desc";
  /** Results page, 1-based, 30 products each. total_pages reports the last one. */
  page?: number;
  /** A sub-category name exactly as facets.subcategories[].name lists it. */
  subcategory?: string;
  /**
   * Spec filters, at most 5 keys: {key: value or [values]}, keys and values exactly as
   * facets.attributes[].key and .values[].value list them (e.g. modelo, fabricante, vram_gb,
   * conexao). Several values match any of them.
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TerabyteDealsOptions {
  /**
   * black_friday (the default: the site's promotions page, Black Friday 2026), open_box (open-box
   * products) or free_shipping (free-shipping products).
   */
  deal?: "black_friday" | "open_box" | "free_shipping";
  /** One brand (facets.brands[].brand_id). */
  brand_id?: string | number;
  /** relevance (the default, the site's own order), price_asc or price_desc. */
  sort?: "relevance" | "price_asc" | "price_desc";
  /** Results page, 1-based, 30 products each. total_pages reports the last one. */
  page?: number;
  /** A sub-category name exactly as facets.subcategories[].name lists it. */
  subcategory?: string;
  [key: string]: unknown;
}

export interface TerabyteCouponsOptions {
  /** One coupon code (coupons[].code): the coupon and the products it covers. */
  code?: string;
  /**
   * A coupon category slug (coupon_categories[].slug, e.g. placa-mae, memoria-ram): its coupons.
   * Without code or category, every active coupon.
   */
  category?: string;
  [key: string]: unknown;
}

export interface TerabyteTrendingSearchesOptions {
  /** How many terms, 1-48 (the default, all the site lists). */
  limit?: number;
  [key: string]: unknown;
}

export interface TerabytePcBuilderOptions {
  /**
   * A builder platform (platforms[].platform_id): its component groups. Without it, the platforms.
   */
  platform_id?: string | number;
  /** A component group of that platform (groups[].group_id): its options. */
  group_id?: string | number;
  [key: string]: unknown;
}

export class TerabyteNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = TERABYTE_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/terabyte/${path}`, options, undefined, timeout);
  }

  /**
   * Search Terabyteshop (terabyteshop.com.br, Brazil's PC-parts store). Scavio fetches the public
   * Terabyteshop page on request. Brazil: Portuguese text, prices in BRL as shown to a visitor who
   * is not signed in. By keyword, up to 100 per page. Costs 1 credit.
   */
  async search(options: TerabyteSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product of Terabyteshop (terabyteshop.com.br, Brazil's PC-parts store). Scavio fetches the
   * public Terabyteshop page on request. Brazil: Portuguese text, prices in BRL as shown to a
   * visitor who is not signed in. By product_id or link. Costs 1 credit.
   */
  async product(options: TerabyteProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Customer reviews of one product of Terabyteshop (terabyteshop.com.br, Brazil's PC-parts store).
   * Scavio fetches the public Terabyteshop page on request. Newest to oldest, 5 per page. Costs 1
   * credit.
   */
  async reviews(options: TerabyteReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * One category of Terabyteshop (terabyteshop.com.br, Brazil's PC-parts store). Scavio fetches the
   * public Terabyteshop page on request. Brazil: Portuguese text, prices in BRL as shown to a
   * visitor who is not signed in. By category path. 30 per page, in the site's order or by price,
   * filtered by sub-category and spec attributes. Costs 1 credit.
   */
  async category(options: TerabyteCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One brand's products in one category of Terabyteshop (terabyteshop.com.br, Brazil's PC-parts
   * store). Scavio fetches the public Terabyteshop page on request. Brazil: Portuguese text, prices
   * in BRL as shown to a visitor who is not signed in. By category path and brand name or brand_id
   * (facets.brands of a category answer). Costs 1 credit.
   */
  async brand(options: TerabyteBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * The deal listings of Terabyteshop (terabyteshop.com.br, Brazil's PC-parts store). Scavio
   * fetches the public Terabyteshop page on request. Brazil: Portuguese text, prices in BRL as
   * shown to a visitor who is not signed in. black_friday (the promotions page, Black Friday 2026),
   * open_box or free_shipping, sorted, by sub-category or brand. 30 per page, in the site's order
   * or by price, filtered by sub-category and spec attributes. Costs 1 credit.
   */
  async deals(options: TerabyteDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * The active coupons of Terabyteshop (terabyteshop.com.br, Brazil's PC-parts store). Scavio
   * fetches the public Terabyteshop page on request. All of them, one category's, or one code with
   * the products it covers. Costs 1 credit.
   */
  async coupons(options: TerabyteCouponsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("coupons", options);
  }

  /**
   * The top search terms of Terabyteshop (terabyteshop.com.br, Brazil's PC-parts store). Scavio
   * fetches the public Terabyteshop page on request. The top search terms (up to 48) as the site
   * ranks them, each with its top product. Costs 1 credit.
   */
  async trendingSearches(options: TerabyteTrendingSearchesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("trending-searches", options);
  }

  /**
   * The Full Custom PC builder of Terabyteshop (terabyteshop.com.br, Brazil's PC-parts store).
   * Scavio fetches the public Terabyteshop page on request. Brazil: Portuguese text, prices in BRL
   * as shown to a visitor who is not signed in. Without inputs, the builder platforms; with
   * platform_id, its component groups; with platform_id and group_id, that group's options with
   * availability per distribution center. Builder prices are the builder's own and can differ from
   * the product page. Costs 1 credit.
   */
  async pcBuilder(options: TerabytePcBuilderOptions = {}): Promise<Record<string, unknown>> {
    return this.post("pc-builder", options);
  }
}
