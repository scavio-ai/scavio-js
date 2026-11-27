import type { Scavio } from "../client.js";

// KaBuM! (kabum.com.br, the Brazilian computer and electronics retailer) search, category,
// categories, product, shipping, reviews and offers endpoints; Brazil only, prices in BRL (card and
// Pix price), shipping by CEP, 1 credit each. Generated from the backend routes: every option and
// its doc mirrors the API's own request schema; an input the API only accepts to refuse (a 400 that
// says 'not offered') is left out. The server enforces the value rules and the one-of rules (send
// one of an id or a link). Every call raises the request timeout to KABUM_TIMEOUT and never lowers
// a longer client timeout. Failed upstream calls and refused inputs are not charged; a not-found is
// charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every kabum call. */
export const KABUM_TIMEOUT = 240_000;

export interface KabumSearchOptions {
  /** Search keywords, in Portuguese as shoppers type them. */
  query: string;
  /**
   * most_searched (the default, KaBuM!'s own order), price_asc, price_desc, most_reviewed or
   * newest.
   */
  sort?: "most_searched" | "price_asc" | "price_desc" | "most_reviewed" | "newest";
  /** Results page, 1-based. total_pages reports the last one. */
  page?: number;
  /** Products per page, 1-100. Defaults to 20. */
  page_size?: number;
  /**
   * Facet filters, at most 8 keys: {key: value or [values]}. Keys and values exactly as
   * facets[].key and facets[].values of an answer list them (e.g. manufacturer, Cor,
   * highlighted_stamp such as "BLACK FRIDAY"); boolean facets (has_offer, kabum_product,
   * has_open_box, has_flash) take true. Prime-member filters are not offered.
   */
  filters?: Record<string, unknown>;
  /** Lowest card price in BRL. */
  price_min?: number;
  /** Highest card price in BRL. */
  price_max?: number;
  [key: string]: unknown;
}

export interface KabumCategoryOptions {
  /**
   * A category path (categories[].path, or a category link's path on www.kabum.com.br), e.g. tv or
   * hardware/placa-de-video-vga.
   */
  category: string;
  /**
   * most_searched (the default, KaBuM!'s own order), price_asc, price_desc, most_reviewed or
   * newest.
   */
  sort?: "most_searched" | "price_asc" | "price_desc" | "most_reviewed" | "newest";
  /** Results page, 1-based. total_pages reports the last one. */
  page?: number;
  /** Products per page, 1-100. Defaults to 20. */
  page_size?: number;
  /**
   * Facet filters, at most 8 keys: {key: value or [values]}. Keys and values exactly as
   * facets[].key and facets[].values of an answer list them (e.g. manufacturer, Cor,
   * highlighted_stamp such as "BLACK FRIDAY"); boolean facets (has_offer, kabum_product,
   * has_open_box, has_flash) take true. Prime-member filters are not offered.
   */
  filters?: Record<string, unknown>;
  /** Lowest card price in BRL. */
  price_min?: number;
  /** Highest card price in BRL. */
  price_max?: number;
  [key: string]: unknown;
}

export interface KabumCategoriesOptions {
  /**
   * A department slug (departments[].slug): returns its category tree. Without it, the departments.
   */
  department?: string;
  [key: string]: unknown;
}

export interface KabumProductOptions {
  /**
   * The KaBuM! product code (items[].product_id; the number after /produto/ in a product link).
   * Send product_id or url.
   */
  product_id?: string | number;
  /** A product link on www.kabum.com.br, instead of product_id. */
  url?: string;
  [key: string]: unknown;
}

export interface KabumShippingOptions {
  /**
   * The KaBuM! product code (items[].product_id; the number after /produto/ in a product link).
   * Send product_id or url.
   */
  product_id?: string | number;
  /** A product link on www.kabum.com.br, instead of product_id. */
  url?: string;
  /** The Brazilian CEP to deliver to (8 digits). */
  cep: string | number;
  [key: string]: unknown;
}

export interface KabumReviewsOptions {
  /**
   * The KaBuM! product code (items[].product_id; the number after /produto/ in a product link).
   * Send product_id or url.
   */
  product_id?: string | number;
  /** A product link on www.kabum.com.br, instead of product_id. */
  url?: string;
  /** Only reviews with this many stars (1-5). */
  rating?: number;
  /** newest (the default) or oldest. */
  sort?: "newest" | "oldest";
  /** Page, 1-based. */
  page?: number;
  /** Reviews per page, 1-50. Defaults to 10. */
  page_size?: number;
  [key: string]: unknown;
}

export interface KabumOffersOptions {
  /**
   * A KaBuM! campaign: blackfriday (Black Friday 2026, the default) or ofertaskabum (KaBuM!'s
   * standing offers).
   */
  campaign?: string;
  /** Page, 1-based. */
  page?: number;
  /** Offers per page, 1-100. Defaults to 20. */
  page_size?: number;
  [key: string]: unknown;
}

export class KabumNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = KABUM_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/kabum/${path}`, options, undefined, timeout);
  }

  /**
   * Search KaBuM! (kabum.com.br, the Brazilian computer and electronics retailer, part of Magalu).
   * Scavio fetches the public KaBuM! page on request; KaBuM! has no public product API. Brazil
   * only: Portuguese text, prices in BRL as shown to a visitor who is not signed in (never a
   * Prime-member price). By keyword, up to 100 per page, sorted (most searched, price, most
   * reviewed, newest) and filtered by brand, any facet, offers, KaBuM!-sold or a price range. Costs
   * 1 credit.
   */
  async search(options: KabumSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category of KaBuM! (kabum.com.br, the Brazilian computer and electronics retailer, part of
   * Magalu). Scavio fetches the public KaBuM! page on request; KaBuM! has no public product API.
   * Brazil only: Portuguese text, prices in BRL as shown to a visitor who is not signed in (never a
   * Prime-member price). By category path, sorted and filtered like search, with its breadcrumb
   * [{id, name, path}]. Costs 1 credit.
   */
  async category(options: KabumCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The departments of KaBuM! (kabum.com.br, the Brazilian computer and electronics retailer, part
   * of Magalu). Scavio fetches the public KaBuM! page on request; KaBuM! has no public product API.
   * departments [{slug, path, url}] (about 30), or with department its category tree categories
   * [{slug, path, url, children}]. Paths go to the category endpoint. An unknown department is a
   * charged 404. 1 credit. A not-found is charged; failed upstream calls and refused inputs are
   * not. Usually 2-15 s; set a client timeout of at least 90 s. Costs 1 credit.
   */
  async categories(options: KabumCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One product of KaBuM! (kabum.com.br, the Brazilian computer and electronics retailer, part of
   * Magalu). Scavio fetches the public KaBuM! page on request; KaBuM! has no public product API.
   * Brazil only. Costs 1 credit.
   */
  async product(options: KabumProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The delivery options of one product of KaBuM! (kabum.com.br, the Brazilian computer and
   * electronics retailer, part of Magalu). Scavio fetches the public KaBuM! page on request; KaBuM!
   * has no public product API. to a Brazilian CEP, for one unit, as KaBuM! quotes them. Costs 1
   * credit.
   */
  async shipping(options: KabumShippingOptions): Promise<Record<string, unknown>> {
    return this.post("shipping", options);
  }

  /**
   * Customer reviews of one product of KaBuM! (kabum.com.br, the Brazilian computer and electronics
   * retailer, part of Magalu). Scavio fetches the public KaBuM! page on request; KaBuM! has no
   * public product API. Newest or oldest first, up to 50 per page, filtered by stars. Costs 1
   * credit.
   */
  async reviews(options: KabumReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * The offers of one campaign of KaBuM! (kabum.com.br, the Brazilian computer and electronics
   * retailer, part of Magalu). Scavio fetches the public KaBuM! page on request; KaBuM! has no
   * public product API. Brazil only. Costs 1 credit.
   */
  async offers(options: KabumOffersOptions = {}): Promise<Record<string, unknown>> {
    return this.post("offers", options);
  }
}
