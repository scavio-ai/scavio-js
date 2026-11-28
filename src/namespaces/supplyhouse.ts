import type { Scavio } from "../client.js";

// SupplyHouse.com (supplyhouse.com, the US online plumbing, HVAC and electrical supply store) search,
// category, brand, product, reviews, questions and categories endpoints; United States, prices in USD
// with the unit price and the box price labelled, 1 credit each. Generated from the backend routes:
// every option and its doc mirrors the API's own request schema. The server enforces the value rules
// and the one-of rule (send product_id or url). Every call raises the request timeout to
// SUPPLYHOUSE_TIMEOUT (categories to SUPPLYHOUSE_CATEGORIES_TIMEOUT) and never lowers a longer client
// timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every supplyhouse call except categories(). */
export const SUPPLYHOUSE_TIMEOUT = 250_000;
/** Minimum request timeout (ms) for supplyhouse.categories(). */
export const SUPPLYHOUSE_CATEGORIES_TIMEOUT = 180_000;

export interface SupplyhouseSearchOptions {
  /** Keywords, a part number or a SupplyHouse SKU, e.g. hot surface igniter. */
  query: string;
  /**
   * Results page, 1-100 (48 products per page, as SupplyHouse lists them; default 1). total_pages
   * reports the last one.
   */
  page?: number;
  [key: string]: unknown;
}

export interface SupplyhouseCategoryOptions {
  /**
   * A supplyhouse.com category link or path (e.g. PEX-Fittings-525000, categories[].path,
   * subcategories[].path, groups[].path or a breadcrumb path).
   */
  category: string;
  /**
   * Results page, 1-100 (48 products per page, as SupplyHouse lists them; default 1). total_pages
   * reports the last one.
   */
  page?: number;
  [key: string]: unknown;
}

export interface SupplyhouseBrandOptions {
  /**
   * A brand as its supplyhouse.com path names it (items[].brand_path, e.g. Taco, PVI, Bluefin) or a
   * brand link (https://www.supplyhouse.com/Taco).
   */
  brand: string;
  /**
   * Results page, 1-100 (48 products per page, as SupplyHouse lists them; default 1). total_pages
   * reports the last one.
   */
  page?: number;
  [key: string]: unknown;
}

export interface SupplyhouseProductOptions {
  /**
   * The SupplyHouse SKU (items[].product_id; the part number on a product page, e.g. PXLE038 or
   * 007-F5). Send product_id or url.
   */
  product_id?: string;
  /** A supplyhouse.com product link or path (items[].url), instead of product_id. */
  url?: string;
  [key: string]: unknown;
}

export interface SupplyhouseReviewsOptions extends SupplyhouseProductOptions {
  /** Page, 1-200 (10 per page, newest first; default 1). total_pages reports the last one. */
  page?: number;
}

export interface SupplyhouseQuestionsOptions extends SupplyhouseProductOptions {
  /** Page, 1-200 (10 per page, newest first; default 1). total_pages reports the last one. */
  page?: number;
}

export interface SupplyhouseCategoriesOptions {
  [key: string]: unknown;
}

export class SupplyhouseNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = SUPPLYHOUSE_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/supplyhouse/${path}`, options, undefined, timeout);
  }

  /**
   * Search SupplyHouse.com (supplyhouse.com, the US online plumbing, HVAC and electrical supply
   * store) by keyword, part number or SKU, 48 per page in SupplyHouse's order, with the unit price
   * and box price labelled, quantity-break prices and Total Available. Scavio fetches the public
   * supplyhouse.com page on request. A keyword the site sends to a category or product is followed
   * (redirected_to). Costs 1 credit.
   */
  async search(options: SupplyhouseSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category page of SupplyHouse.com (supplyhouse.com, the US online plumbing, HVAC and
   * electrical supply store) by link or path: its subcategories, sub-type groups or products, 48 per
   * page (page_type says which). Scavio fetches the public supplyhouse.com page on request. Costs 1
   * credit.
   */
  async category(options: SupplyhouseCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One brand's products on SupplyHouse.com (supplyhouse.com, the US online plumbing, HVAC and
   * electrical supply store), 48 per page in SupplyHouse's order. Scavio fetches the public
   * supplyhouse.com page on request. Costs 1 credit.
   */
  async brand(options: SupplyhouseBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * One product of SupplyHouse.com (supplyhouse.com, the US online plumbing, HVAC and electrical
   * supply store) by SKU or link: unit and box price, quantity-break prices, Total Available, lead
   * times per warehouse, specs, documents, alternatives and accessories. Prices the page does not
   * show answer null with price_hidden. Scavio fetches the public supplyhouse.com page on request.
   * Costs 1 credit.
   */
  async product(options: SupplyhouseProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Customer reviews of one product of SupplyHouse.com (supplyhouse.com, the US online plumbing,
   * HVAC and electrical supply store), 10 per page, newest first, with the rating histogram. No
   * reviewer names or locations. Costs 1 credit.
   */
  async reviews(options: SupplyhouseReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * Customer questions and answers of one product of SupplyHouse.com (supplyhouse.com, the US
   * online plumbing, HVAC and electrical supply store), 10 per page, newest first; is_expert marks
   * SupplyHouse staff answers. No asker or answerer names or locations. Costs 1 credit.
   */
  async questions(options: SupplyhouseQuestionsOptions): Promise<Record<string, unknown>> {
    return this.post("questions", options);
  }

  /**
   * The top-level departments of SupplyHouse.com (supplyhouse.com, the US online plumbing, HVAC and
   * electrical supply store) as its menu lists them, with the path category() takes. Costs 1
   * credit.
   */
  async categories(options: SupplyhouseCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options, SUPPLYHOUSE_CATEGORIES_TIMEOUT);
  }
}
