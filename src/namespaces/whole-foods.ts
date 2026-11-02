import type { Scavio } from "../client.js";

// Whole Foods Market: 7 endpoints, 1 credit each.
//
// Prices are one store's: store_id is the 5-digit store id from stores()
// (default 10145, Lamar, Austin TX). Each product carries that store's
// regular_price, sale_price and prime_price (the Prime member price). There
// are no ratings, reviews, UPCs or per-store unit stock. product() with a
// store_id returns the in-store (shelf) and online (delivery/pickup) prices as
// separate blocks; they often differ.

export type WholeFoodsSearchSort = "relevance" | "price_asc" | "price_desc";

export type WholeFoodsBrowseSort =
  | "featured"
  | "popular"
  | "price_asc"
  | "price_desc"
  | "brand_az"
  | "brand_za";

export type WholeFoodsDiet = "vegan" | "gluten-free" | "organic" | "dairy-free" | "vegetarian";

export interface WholeFoodsSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** 5-digit Whole Foods store id from stores(), e.g. "10145" (the default, Austin TX). Prices are that store's. */
  store_id?: string;
  /** relevance (default), price_asc or price_desc. */
  sort?: WholeFoodsSearchSort;
  /** Only products on sale at the store. Defaults to false. */
  on_sale?: boolean;
  /** Only products with this dietary attribute: vegan, gluten-free, organic, dairy-free or vegetarian. */
  diet?: WholeFoodsDiet;
  /** Restrict to one category slug, e.g. "milk-cream". Slugs are in the category facet of any search. */
  category?: string;
  /** Products per page (1-60; default 60). */
  limit?: number;
  /** Products to skip, for paging (60 = page 2 at the default limit). Defaults to 0. */
  offset?: number;
  [key: string]: unknown;
}

export interface WholeFoodsCategoryOptions {
  /** Category slug, e.g. "cheese", "dairy-eggs", "produce". "all-products" lists the whole store. */
  category: string;
  /** 5-digit Whole Foods store id from stores(). Defaults to "10145" (Austin TX). */
  store_id?: string;
  /** featured (default), popular, price_asc, price_desc, brand_az or brand_za. */
  sort?: WholeFoodsBrowseSort;
  /** Only products on sale at the store. Defaults to false. */
  on_sale?: boolean;
  /** Only products with this dietary attribute. */
  diet?: WholeFoodsDiet;
  /** Products per page (1-60; default 60). */
  limit?: number;
  /** Products to skip, for paging. Defaults to 0. */
  offset?: number;
  [key: string]: unknown;
}

export interface WholeFoodsDealsOptions {
  /** Category slug to narrow to. Defaults to "all-products" (every sale item at the store). */
  category?: string;
  /** 5-digit Whole Foods store id from stores(). Defaults to "10145" (Austin TX). */
  store_id?: string;
  /** featured (default), popular, price_asc, price_desc, brand_az or brand_za. */
  sort?: WholeFoodsBrowseSort;
  /** Only products with this dietary attribute. */
  diet?: WholeFoodsDiet;
  /** Products per page (1-60; default 60). */
  limit?: number;
  /** Products to skip, for paging. Defaults to 0. */
  offset?: number;
  [key: string]: unknown;
}

export interface WholeFoodsProductOptions {
  /** Product ASIN, the `asin` of a search result, e.g. "B0BCBNG8LS". Pass this, url or slug. */
  asin?: string;
  /** A wholefoodsmarket.com product URL. */
  url?: string;
  /** A product slug, the `slug` of a search result. */
  slug?: string;
  /** 5-digit Whole Foods store id. Adds that store's in-store (shelf) prices and its online (delivery/pickup) price. */
  store_id?: string;
  [key: string]: unknown;
}

export interface WholeFoodsStoresOptions {
  /** US ZIP code to search around. */
  zip: string;
  [key: string]: unknown;
}

export interface WholeFoodsStoreOptions {
  /** 5-digit Whole Foods store id from stores(), e.g. "10160". */
  store_id: string;
  [key: string]: unknown;
}

export interface WholeFoodsSalesFlyerOptions {
  /** 5-digit Whole Foods store id from stores(), e.g. "10160". */
  store_id: string;
  [key: string]: unknown;
}

export class WholeFoodsNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Whole Foods Market products at one store, up to 60 per page: ASIN,
   * slug, name, brand, image, that store's regular_price, sale_price and
   * prime_price with sale start and end dates (a multi-buy is a total:
   * sale_price 10 with sale_quantity 2 is 2 for $10; price_unit lb is per
   * pound), on_sale and is_local flags. Also total_results and facets
   * (categories, diets). Sorts by relevance or price only.
   *
   * Costs 1 credit.
   */
  async search(options: WholeFoodsSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/wholefoods/search", options);
  }

  /**
   * Browse one Whole Foods Market category at one store, with sort, on_sale
   * and diet filters. Same product fields as search, plus the category
   * breadcrumb, total_results and facets. An unknown category slug is a 404.
   *
   * Costs 1 credit.
   */
  async category(options: WholeFoodsCategoryOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/wholefoods/category", options);
  }

  /**
   * Every product on sale at one Whole Foods Market store, store-wide or in
   * one category, with regular, sale and Prime prices and sale dates.
   *
   * Costs 1 credit.
   */
  async deals(options: WholeFoodsDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/wholefoods/deals", options);
  }

  /**
   * One Whole Foods Market product by ASIN, URL or slug: name, brand,
   * description, ingredients, nutrition facts, diets, SNAP EBT eligibility
   * and images. With store_id, two separate price blocks: in_store (the
   * store's shelf regular, sale and Prime price; null when it does not list
   * the item) and online (delivery/pickup price, list price, savings, Prime
   * price, unit price, availability; null with no online offer). An unknown
   * ASIN is a 404.
   *
   * Costs 1 credit.
   */
  async product(options: WholeFoodsProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/wholefoods/product", options);
  }

  /**
   * Whole Foods Market stores near a US ZIP code, nearest first (within 15
   * miles, widening to 50): store_id, name, address, phone, coordinates,
   * distance in miles, time zone and seven days of in-store and pickup hours.
   * No store in range is an empty list.
   *
   * Costs 1 credit.
   */
  async stores(options: WholeFoodsStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/wholefoods/stores", options);
  }

  /**
   * One Whole Foods Market store by id: name, status, phone, Prime
   * eligibility, opening date, address, coordinates, time zone, store page and
   * sales flyer URLs. An unknown store id is a 404.
   *
   * Costs 1 credit.
   */
  async store(options: WholeFoodsStoreOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/wholefoods/store", options);
  }

  /**
   * The current weekly sales flyer of one Whole Foods Market store: each
   * promotion's product name, brand, headline, description, terms, regular,
   * sale and Prime price as printed (text such as "$3.99/lb" or "44% off"),
   * start and end dates, image, rank and the ASINs it covers. An unknown
   * store id is a 404.
   *
   * Costs 1 credit.
   */
  async salesFlyer(options: WholeFoodsSalesFlyerOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/wholefoods/sales-flyer", options);
  }
}
