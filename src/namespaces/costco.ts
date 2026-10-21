import type { Scavio } from "../client.js";

// Costco: 13 endpoints, all POST /api/v1/costco/<method>.
//
// country is "us" (costco.com, default) or "ca" (costco.ca) everywhere except
// coupons (US only). search, product and warehouses also take the
// international sites (uk, au, mx, jp, kr, tw), which support keyword, sort and
// paging only - no warehouse prices and no gas.
//
// Warehouse numbers (e.g. "1062") come from warehouses(). Passing one as
// warehouse_id on search, category or deals adds that warehouse's in-store
// price, stock status and price code to every result.
//
// Most endpoints cost 1 credit; US search, category, deals and clearance cost 2.
// The multi-warehouse ones scale with the body:
// prices (2 credits at 10 warehouses), availability (1 per 5 warehouses),
// warehouses (2 with country "ca") and gas (2 by location on ca; by
// warehouse_ids, 1 per 5 on us and 2 per warehouse on ca).

/** costco.com ("us", default) or costco.ca ("ca"). */
export type CostcoNaCountry = "us" | "ca";

/**
 * Costco site. "us" (default) and "ca" support every filter; the other six
 * support keyword, sort and paging only.
 */
export type CostcoCountry = CostcoNaCountry | "uk" | "au" | "mx" | "jp" | "kr" | "tw";

export type CostcoSortBy = "best_match" | "price_low" | "price_high" | "top_rated" | "newest";

export type CostcoDealType =
  | "new"
  | "while_supplies_last"
  | "treasure_hunt"
  | "member_favorites"
  | "online_only"
  | "on_sale";

export type CostcoPriceCode = "clearance" | "manager_markdown" | "special_buy";

/** Filters shared by search, category and deals (us and ca). */
export interface CostcoListingFilters {
  /**
   * Costco warehouse number (e.g. "1062"). Adds that warehouse's in-store
   * price, stock status and price code to every result; omit for online
   * prices only.
   */
  warehouse_id?: string;
  /** Result order (default "best_match"). Costco broadens matching under any other sort. */
  sort_by?: CostcoSortBy;
  /** Brand names to keep, up to 20 (e.g. ["Kirkland Signature"]). */
  brands?: string[];
  /** Minimum online price, inclusive. */
  min_price?: number;
  /** Maximum online price, inclusive. */
  max_price?: number;
  /** Minimum average star rating (1-5). */
  min_rating?: number;
  /** Only items with an active discount. */
  on_sale?: boolean;
  /** Hide out-of-stock items. */
  in_stock?: boolean;
  /** Only items sold and in stock at warehouse_id (requires warehouse_id). */
  in_warehouse?: boolean;
  /** Results page, 1-based (1-500). */
  page?: number;
  /** Results per page (1-120, default 24). */
  page_size?: number;
}

export interface CostcoSearchOptions extends CostcoListingFilters {
  /** Keywords, or a Costco item number (1-200 characters). */
  query: string;
  country?: CostcoCountry;
  [key: string]: unknown;
}

export interface CostcoCategoryOptions extends CostcoListingFilters {
  /** Category slug from categories() (e.g. "televisions"), or a costco.com category URL. */
  category: string;
  country?: CostcoNaCountry;
  [key: string]: unknown;
}

export interface CostcoCategoriesOptions {
  /**
   * Numeric Costco category id (e.g. "30001"). Omit for the top-level
   * departments; pass one for its full subcategory tree.
   */
  category_id?: string;
  country?: CostcoNaCountry;
  [key: string]: unknown;
}

export interface CostcoProductOptions {
  /** Costco item number or product id, or a costco.com product URL. Pass this or item_ids. */
  item_id?: string;
  /** Up to 20 ids in one call (us and ca only). */
  item_ids?: string[];
  country?: CostcoCountry;
  [key: string]: unknown;
}

export interface CostcoPricesOptions {
  /** Costco item number or product id. Pass this or item_ids. */
  item_id?: string;
  /** Up to 20 ids in one call. */
  item_ids?: string[];
  /**
   * Warehouses to price (1-10, e.g. ["1062", "1107"]). The online price is
   * always included.
   */
  warehouse_ids: string[];
  country?: CostcoNaCountry;
  [key: string]: unknown;
}

export interface CostcoAvailabilityOptions {
  /** Costco item number or product id, or a costco.com product URL. */
  item_number: string;
  /** Warehouses to check (1-10). 1 credit per 5 warehouses. */
  warehouse_ids: string[];
  country?: CostcoNaCountry;
  [key: string]: unknown;
}

export interface CostcoReviewsOptions {
  /** Costco product id (the product_id field from search or product). */
  product_id: string;
  /** Review order (default "newest"). */
  sort_by?: "newest" | "oldest" | "highest_rating" | "lowest_rating" | "most_helpful";
  /** Only reviews with this star rating (1-5). */
  rating?: number;
  /** Results page, 1-based (1-500). */
  page?: number;
  /** Reviews per page (1-100, default 25). */
  limit?: number;
  [key: string]: unknown;
}

export interface CostcoWarehousesOptions {
  /** US zip code. Pass zip, or latitude and longitude. */
  zip?: string;
  latitude?: number;
  longitude?: number;
  country?: CostcoCountry;
  /** Nearest warehouses to return (1-50, default 10). */
  limit?: number;
  [key: string]: unknown;
}

export interface CostcoGasOptions {
  /** US zip code. Pass zip, latitude and longitude, or warehouse_ids. */
  zip?: string;
  latitude?: number;
  longitude?: number;
  /** Specific warehouses instead of a location (1-10). */
  warehouse_ids?: string[];
  country?: CostcoNaCountry;
  /** Nearest stations to return (1-50). */
  limit?: number;
  [key: string]: unknown;
}

/** coupons takes no parameters. */
export interface CostcoCouponsOptions {
  [key: string]: unknown;
}

export interface CostcoDealsOptions extends CostcoListingFilters {
  /** Deal feed. */
  type: CostcoDealType;
  country?: CostcoNaCountry;
  [key: string]: unknown;
}

export interface CostcoClearanceOptions {
  /** Costco warehouse number to scan, from warehouses() (e.g. "1062"). */
  warehouse_id: string;
  /** Keywords to scan. Pass query or category. */
  query?: string;
  /** Category slug to scan instead of a query. */
  category?: string;
  /** Result pages of 120 to scan (1-5, default 3). */
  pages?: number;
  /**
   * Markdown codes to keep. Default clearance (.97) and manager_markdown
   * (.00/.88); add special_buy for .49/.79/.89 endings, which are common on
   * regular grocery prices.
   */
  price_codes?: CostcoPriceCode[];
  country?: CostcoNaCountry;
  [key: string]: unknown;
}

export interface CostcoAutocompleteOptions {
  /** Partial search text (1-100 characters). */
  query: string;
  country?: CostcoNaCountry;
  [key: string]: unknown;
}

export class CostcoNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Costco by keyword or item number: online price and original price,
   * ratings, member-only and stock flags, promotions and facets. Pass
   * `warehouse_id` to add that warehouse's in-store price and stock to every
   * result.
   *
   * Costs 2 credits for the US, 1 elsewhere.
   */
  async search(options: CostcoSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/costco/search", options);
  }

  /**
   * Products in a Costco category, with the same sort, filters and
   * per-warehouse pricing as search().
   *
   * Costs 2 credits for the US, 1 for Canada.
   */
  async category(options: CostcoCategoryOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/costco/category", options);
  }

  /**
   * The Costco department list, or the full subcategory tree under one
   * department when `category_id` is set.
   *
   * Costs 1 credit.
   */
  async categories(options: CostcoCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/costco/categories", options);
  }

  /**
   * Full details for up to 20 items: description, features, specifications,
   * variants, member-only and purchase limits, delivery fee, and promotions
   * with start and end dates. Pass `item_id` or `item_ids`.
   *
   * Costs 1 credit.
   */
  async product(options: CostcoProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/costco/product", options);
  }

  /**
   * Online price versus in-warehouse price for up to 20 items across up to 10
   * warehouses, with each location's discount, final price, promotion dates
   * and price code.
   *
   * Costs 1 credit for up to 9 warehouses and 2 credits for 10.
   */
  async prices(options: CostcoPricesOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/costco/prices", options);
  }

  /**
   * In-warehouse stock status for one item at up to 10 warehouses, plus
   * pickup and same-day delivery availability. A status, never a quantity.
   *
   * Costs 1 credit per 5 warehouses.
   */
  async availability(options: CostcoAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/costco/availability", options);
  }

  /**
   * Customer reviews for a Costco product with the rating distribution and
   * recommend count; sort, star filter and up to 100 reviews per page.
   *
   * Costs 1 credit.
   */
  async reviews(options: CostcoReviewsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/costco/reviews", options);
  }

  /**
   * Costco warehouses near a US zip code or coordinates, nearest first:
   * warehouse_id, address, hours, departments, services, and gas station hours
   * and prices.
   *
   * Costs 1 credit, or 2 with country "ca".
   */
  async warehouses(options: CostcoWarehousesOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/costco/warehouses", options);
  }

  /**
   * Current regular, premium and diesel prices at Costco gas stations near a
   * location, or at specific warehouses.
   *
   * Costs 1 credit by location (2 with country "ca"); by `warehouse_ids`,
   * 1 credit per 5 warehouses on us and 2 credits per warehouse on ca.
   */
  async gas(options: CostcoGasOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/costco/gas", options);
  }

  /**
   * The current Costco member coupon book (US): every offer with its item
   * number, discount, final price, warehouse/online scope, limits and the
   * book's valid dates. Takes no parameters.
   *
   * Costs 1 credit.
   */
  async coupons(options: CostcoCouponsOptions = {}): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/costco/coupons", options);
  }

  /**
   * Costco deal feeds: new items, while supplies last, treasure hunt, member
   * favorites, online-only and everything on sale, with the same filters and
   * optional per-warehouse pricing as search().
   *
   * Costs 2 credits for the US, 1 for Canada.
   */
  async deals(options: CostcoDealsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/costco/deals", options);
  }

  /**
   * Markdown finder for one warehouse: scans a query or category and keeps
   * the items whose in-warehouse price ends in a markdown code - .97
   * clearance and .00/.88 manager markdown by default, .49/.79/.89 special
   * buys on request. The codes are the member-community decode; Costco does
   * not publish them. Only items Costco lists online are covered.
   *
   * Costs 2 credits for the US (any `pages` value), 1 for Canada.
   */
  async clearance(options: CostcoClearanceOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/costco/clearance", options);
  }

  /**
   * Costco search-box suggestions for a partial query.
   *
   * Costs 1 credit.
   */
  async autocomplete(options: CostcoAutocompleteOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/costco/autocomplete", options);
  }
}
