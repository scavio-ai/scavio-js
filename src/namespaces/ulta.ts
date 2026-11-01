import type { Scavio } from "../client.js";

// Ulta Beauty: 4 endpoints, 1 credit each.
//
// search() and category() return 64 products per page plus sponsored
// placements, which can repeat products from other pages: dedupe by
// product_id when merging pages. stores() reports in stock / out of stock for
// one shade or size at the 10 stores nearest a ZIP - Ulta publishes no unit
// counts.

export interface UltaSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** Results page, 1-based (1-100). 64 products per page, plus sponsored placements. */
  page?: number;
  [key: string]: unknown;
}

export interface UltaCategoryOptions {
  /** An ulta.com category that lists products: the full URL or its path, e.g. "/shop/makeup/lips/lipstick". Landing pages with no product grid are a 404. */
  category: string;
  /** Results page, 1-based (1-100). 64 products per page, plus sponsored placements. */
  page?: number;
  [key: string]: unknown;
}

export interface UltaProductOptions {
  /** Ulta product page URL, /p/<name>-<productId> (the `url` of a search or category result). The name part is required. */
  url: string;
  /** Shade or size to select by sku id (a `variants[].sku_id`). Defaults to the URL's ?sku=, else the product's default. */
  sku?: string;
  [key: string]: unknown;
}

export interface UltaStoresOptions {
  /** Ulta product id, the `product_id` of a search or product result, e.g. "pimprod2057119". */
  product_id: string;
  /** Sku id of the shade or size, a `sku_id` or `variants[].sku_id`, e.g. "2648428". */
  sku_id: string;
  /** US ZIP code to search around. */
  zip: string;
  [key: string]: unknown;
}

export class UltaNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Ulta Beauty by keyword, 64 products per page plus sponsored
   * placements: product_id, sku_id, brand, name, URL, image, list and sale
   * price (low end and range when shades are priced differently), discount,
   * promo text, rating, review count, badge, variant label, limited-stock and
   * sponsored flags.
   *
   * Costs 1 credit.
   */
  async search(options: UltaSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/ulta/search", options);
  }

  /**
   * Products in an Ulta Beauty category, 64 per page plus sponsored
   * placements, with the category title and total_results and the same
   * product fields as search().
   *
   * Costs 1 credit.
   */
  async category(options: UltaCategoryOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/ulta/category", options);
  }

  /**
   * One Ulta Beauty product for the selected shade or size: list and sale
   * price, discount, availability, GTIN, rating, review count, badges,
   * description, usage, ingredients, breadcrumbs, images, every shade or size
   * variant, ship / pickup / same-day eligibility and the five most recent
   * customer reviews. An unknown product is a 404.
   *
   * Costs 1 credit.
   */
  async product(options: UltaProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/ulta/product", options);
  }

  /**
   * In-store pickup availability of one shade or size at the 10 Ulta Beauty
   * stores nearest a US ZIP: store id, name, address, distance in miles, open
   * now and hours label, curbside label, in_stock and the availability label.
   * In stock / out of stock per store, not unit counts.
   *
   * Costs 1 credit.
   */
  async stores(options: UltaStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/ulta/stores", options);
  }
}
