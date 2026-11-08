import type { Scavio } from "../client.js";

// Best Buy: 9 endpoints, bestbuy.com (US only). Credits: search, product,
// reviews and prices 2 each (prices is per call, up to 15 SKUs); category 2 for
// an abcat id and 3 for a pcmcat page; deals 3; stores and suggestions 1;
// availability 2 flat for up to 8 stores.
//
// product(), reviews() and availability() take sku or url; category() takes
// category_id or url; availability() takes exactly one of zip or store_ids;
// filters.min_price and filters.max_price go together. The server enforces
// these. Availability is store pickup status, not a unit count: quantity is
// set only for "limited" (Best Buy's "only N left") and is null for in_stock.
// Every call raises the request timeout to BEST_BUY_TIMEOUT when the client's
// is shorter (availability typically takes 5-20 s).

/** Minimum request timeout (ms) for every bestBuy call. */
export const BEST_BUY_TIMEOUT = 120_000;

export type BestBuySearchSort =
  | "best_match"
  | "best_selling"
  | "best_discount"
  | "price_low"
  | "price_high"
  | "rating"
  | "newest";

/** Category listings have no best_match order (their default is best_selling). */
export type BestBuyCategorySort = Exclude<BestBuySearchSort, "best_match">;

export type BestBuyReviewSort =
  | "most_relevant"
  | "most_helpful"
  | "newest"
  | "oldest"
  | "highest_rated"
  | "lowest_rated";

/** Filters, the same as the site's filter sidebar. applied_filters in the response echoes what Best Buy applied. */
export interface BestBuyFilters {
  /** Only this brand, as spelled in the Brand filter (a `facets` value of brand_facet), e.g. "Samsung". */
  brand?: string;
  /** Only products on sale. */
  on_sale?: boolean;
  /** Only clearance products. */
  clearance?: boolean;
  /** Only products with an open-box offer. */
  open_box?: boolean;
  /** Lowest price in dollars (pass with max_price). */
  min_price?: number;
  /** Highest price in dollars (pass with min_price). */
  max_price?: number;
}

export interface BestBuySearchOptions {
  /** Search keywords. */
  query: string;
  /** Results page, 1-based, up to 100. Defaults to 1. 18 products per page. */
  page?: number;
  /** best_match (default), best_selling, best_discount, price_low, price_high, rating or newest. */
  sort?: BestBuySearchSort;
  filters?: BestBuyFilters;
  /** Include the sponsored tiles Best Buy mixes into the grid (sponsored: true, position null). Defaults to false. */
  include_sponsored?: boolean;
  [key: string]: unknown;
}

export interface BestBuyProductOptions {
  /** Best Buy SKU, the number after /sku/ in a product URL (a search result's `sku`). */
  sku?: string;
  /** bestbuy.com product URL that names a SKU (/product/<name>/<id>/sku/<sku> or /site/<name>/<sku>.p?skuId=<sku>). Used when sku is not given. */
  url?: string;
  [key: string]: unknown;
}

export interface BestBuyReviewsOptions {
  /** Best Buy SKU (a search result's `sku`). */
  sku?: string;
  /** bestbuy.com product URL that names a SKU. Used when sku is not given. */
  url?: string;
  /** Reviews page, 1-based, 20 reviews per page, up to 500. Defaults to 1. */
  page?: number;
  /** most_relevant (default), most_helpful, newest, oldest, highest_rated or lowest_rated. */
  sort?: BestBuyReviewSort;
  /** Only reviews with this many stars, 1-5. */
  rating?: 1 | 2 | 3 | 4 | 5;
  [key: string]: unknown;
}

export interface BestBuyCategoryOptions {
  /**
   * Best Buy category id: abcat... (catalogue categories, e.g. abcat0101001
   * All Flat-Screen TVs) or pcmcat... (merchandised pages, e.g.
   * pcmcat1674241939957 All Electronics on Sale). A search result's facets
   * list category ids under category_facet. Pass category_id or url.
   */
  category_id?: string;
  /** A bestbuy.com category page URL (.../<id>.c?id=<id>). Filters in the URL (qp=...) are kept; its sort is not, use sort. */
  url?: string;
  /** Results page, 1-based, up to 100. Defaults to 1. 18 products per page. */
  page?: number;
  /** best_selling (the default on most pages), best_discount, price_low, price_high, rating or newest. */
  sort?: BestBuyCategorySort;
  filters?: BestBuyFilters;
  /** Include the sponsored tiles Best Buy mixes into the grid. Defaults to false. */
  include_sponsored?: boolean;
  [key: string]: unknown;
}

export interface BestBuyStoresOptions {
  /** US ZIP code, e.g. "94103". */
  zip: string;
  [key: string]: unknown;
}

export interface BestBuyAvailabilityOptions {
  /** Best Buy SKU (a search result's `sku`). */
  sku?: string;
  /** bestbuy.com product URL that names a SKU. Used when sku is not given. */
  url?: string;
  /** Check the stores nearest this US ZIP code (max_stores of them). Pass exactly one of zip or store_ids. */
  zip?: string;
  /** With zip: how many of the nearest stores to check, 1-8. Defaults to 5. */
  max_stores?: number;
  /** Check these stores instead (store numbers, a stores() result's store_id), up to 8: an array or a comma-separated string. */
  store_ids?: string[] | string;
  [key: string]: unknown;
}

export interface BestBuySuggestionsOptions {
  /** What the shopper has typed so far, e.g. "ps5 con". */
  query: string;
  [key: string]: unknown;
}

export interface BestBuyPricesOptions {
  /** 1-15 Best Buy SKUs, an array or a comma-separated string. */
  skus: string[] | string;
  [key: string]: unknown;
}

export class BestBuyNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search bestbuy.com (US), 18 products per page, sorted by best match, best
   * selling, best discount, price, rating or newest, filtered by brand, on
   * sale, clearance, open box or a price range. Each product has SKU, BSIN,
   * name, brand, model number, URL, image, price, regular price, savings in
   * dollars and percent, on-sale flag, deal badge, condition, rating, review
   * count, seller type (best_buy or marketplace), product type, badges and
   * release date. Also returns total_results, total_pages, the applied sort
   * and filters, the category, the filter sidebar (facets with value counts;
   * category_facet values carry category ids), sort options, related searches
   * and any spelling correction. Sponsored tiles are left out unless
   * include_sponsored.
   *
   * Costs 2 credits.
   */
  async search(options: BestBuySearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/search", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * One bestbuy.com (US) product by SKU or URL: name, brand, model, UPC, URL,
   * status, condition, product type, category path, price, regular price,
   * savings, on-sale flag, deal badge, financing offer, every open-box offer
   * by condition (fair, good, excellent) with its price, savings against new
   * (savings_vs_new) and against the regular price (savings_vs_regular),
   * other sellers' and conditions' SKUs of the same product, rating, review
   * count, the AI review summary and what customers love, description,
   * features, what's included, the full specification table by group,
   * dimensions, images, manuals and badges. An unknown SKU is a 404.
   *
   * Costs 2 credits.
   */
  async product(options: BestBuyProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/product", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * Customer reviews of one bestbuy.com (US) product by SKU or URL, 20 per
   * page, sorted most relevant (default), most helpful, newest, oldest,
   * highest or lowest rated, optionally only one star rating. Returns the
   * review summary (average rating, review count, recommended percent, star
   * histogram, the most mentioned pros and cons with mention counts),
   * total_results for the filter, total_pages and has_more. Each review has
   * id, title, text, rating, author, date, recommended flag, verified-purchase
   * and incentivized flags, days of ownership, helpful and not-helpful votes,
   * badges, photos, the site it was syndicated from and the brand's response.
   * An unknown SKU is a 404.
   *
   * Costs 2 credits.
   */
  async reviews(options: BestBuyReviewsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/reviews", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * Browse a bestbuy.com (US) category or deals page by category id or URL,
   * 18 products per page, sorted by best selling, best discount, price,
   * rating or newest, with the same filters as search(). Works on catalogue
   * categories (abcat0101001) and merchandised pages such as All Electronics
   * on Sale (pcmcat1674241939957). Products and listing fields are the same
   * as search(). An unknown category, or a page without a product grid, is a
   * 404.
   *
   * Costs 2 credits for an abcat id and 3 for a pcmcat page (the page is read first).
   */
  async category(options: BestBuyCategoryOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/category", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * Today's Best Buy Deal of the Day and the more-deals row under it, with
   * live prices: SKU, name, URL, image, rating, review count, price, regular
   * price, savings in dollars and percent, on-sale flag and deal badge, plus
   * the countdown end as the page shows it. Up to 15 products.
   *
   * Costs 3 credits.
   */
  async deals(): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/deals", {}, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * Best Buy stores near a US ZIP code, nearest first (up to 15): store id,
   * name, address, city, state, ZIP, phone, open status, store type, distance
   * in miles, and dated opening hours for the next 35 days (holiday hours and
   * closed days included). Use a store_id with availability().
   *
   * Costs 1 credit.
   */
  async stores(options: BestBuyStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/stores", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * Store pickup availability of one bestbuy.com SKU at up to 8 stores: the
   * stores nearest a ZIP code or the store ids you pass. Each store has a
   * status: in_stock, limited (with the real quantity when Best Buy shows
   * "only N left"), ship_to_store (can be shipped there for pickup by
   * pickup_date), out_of_stock, not_available_for_pickup, or unknown (with a
   * reason; never reported as out of stock). Also the pickup date, the
   * minimum hours until pickup, and the nearby store Best Buy suggests when
   * this one cannot fill it. quantity is null for in_stock: Best Buy does not
   * publish unit counts for well-stocked items. Takes 5-20s. An unknown SKU
   * is a 404.
   *
   * Costs 2 credits flat.
   */
  async availability(options: BestBuyAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/availability", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * The bestbuy.com search-box autocomplete for a partial query (e.g. "ps5
   * con"): suggested search terms, each with the categories (id and name) and
   * SKUs Best Buy shows for it, plus any spelling correction.
   *
   * Costs 1 credit.
   */
  async suggestions(options: BestBuySuggestionsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/suggestions", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * Current bestbuy.com prices for up to 15 SKUs in one call: price, regular
   * price, savings in dollars and percent, on-sale flag, deal badge and deal
   * end time per SKU. A SKU Best Buy does not know comes back found: false;
   * all unknown is a 404.
   *
   * Costs 2 credits per call, whatever the number of SKUs.
   */
  async prices(options: BestBuyPricesOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/prices", options, undefined, BEST_BUY_TIMEOUT);
  }
}
