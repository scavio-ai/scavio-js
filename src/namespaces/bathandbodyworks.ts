import type { Scavio } from "../client.js";

// Bath & Body Works (bathandbodyworks.com, the US body care and home fragrance retailer, and
// bathandbodyworks.ca) search, category, categories, product, promotions, offers,
// storeAvailability, store, stores and reviewsSummary endpoints; country us or ca, prices in USD or
// CAD, 1 credit each. Generated from the backend routes: every option and its doc mirrors the API's
// own request schema; an input the API only accepts to refuse (a 400 that says 'not offered') is
// left out. The server enforces the value rules and the one-of rules (send one of an id or a link).
// Every call raises the request timeout to BATHANDBODYWORKS_TIMEOUT and never lowers a longer
// client timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every bathandbodyworks call. */
export const BATHANDBODYWORKS_TIMEOUT = 240_000;

export interface BathandbodyworksSearchOptions {
  /** A keyword: a product, a fragrance or a collection. */
  query: string;
  /**
   * us (default): bathandbodyworks.com in USD; ca: bathandbodyworks.ca in English, CAD. Spanish and
   * French pages are not offered (the site serves the same English data there).
   */
  country?: string;
  /**
   * relevance (default), price_low, price_high, top_rated or new_arrivals: the site's own sorts.
   */
  sort?: "relevance" | "price_low" | "price_high" | "top_rated" | "new_arrivals";
  /**
   * Products of these fragrances, as the site names them (facets fragrance_name, e.g. Champagne
   * Toast). One value or a list.
   */
  fragrance_name?: string | string[];
  /**
   * Products of these fragrance families: Warm & Woodsy, Treats & Sweets, Fruity & Bright, Fresh &
   * Clean, Botanicals & Blooms (facets fragrance_family). One value or a list.
   */
  fragrance_family?: string | string[];
  /**
   * Products of these product types, as the site names them (facets product_type, e.g. 3-Wick
   * Candle, Body Lotion). One value or a list.
   */
  product_type?: string | string[];
  [key: string]: unknown;
}

export interface BathandbodyworksCategoryOptions {
  /**
   * A category path from categories (categories[].path), e.g. /c/all-candles/3-wick-candles,
   * /g/top-offers, /t/black-friday, or its link.
   */
  path: string;
  /**
   * us (default): bathandbodyworks.com in USD; ca: bathandbodyworks.ca in English, CAD. Spanish and
   * French pages are not offered (the site serves the same English data there).
   */
  country?: string;
  /**
   * relevance (default), price_low, price_high, top_rated or new_arrivals: the site's own sorts.
   */
  sort?: "relevance" | "price_low" | "price_high" | "top_rated" | "new_arrivals";
  /**
   * Products of these fragrances, as the site names them (facets fragrance_name, e.g. Champagne
   * Toast). One value or a list.
   */
  fragrance_name?: string | string[];
  /**
   * Products of these fragrance families: Warm & Woodsy, Treats & Sweets, Fruity & Bright, Fresh &
   * Clean, Botanicals & Blooms (facets fragrance_family). One value or a list.
   */
  fragrance_family?: string | string[];
  /**
   * Products of these product types, as the site names them (facets product_type, e.g. 3-Wick
   * Candle, Body Lotion). One value or a list.
   */
  product_type?: string | string[];
  [key: string]: unknown;
}

export interface BathandbodyworksCategoriesOptions {
  /**
   * us (default): bathandbodyworks.com in USD; ca: bathandbodyworks.ca in English, CAD. Spanish and
   * French pages are not offered (the site serves the same English data there).
   */
  country?: string;
  [key: string]: unknown;
}

export interface BathandbodyworksProductOptions {
  /** A Bath & Body Works product id (9 digits: products[].id). Every size is its own id. */
  product_id?: string;
  /**
   * Or the product link, e.g.
   * https://www.bathandbodyworks.com/p/champagne-toast-3-wick-candle-028029548 (the link's site
   * sets country).
   */
  url?: string;
  /**
   * us (default): bathandbodyworks.com in USD; ca: bathandbodyworks.ca in English, CAD. Spanish and
   * French pages are not offered (the site serves the same English data there).
   */
  country?: string;
  [key: string]: unknown;
}

export interface BathandbodyworksPromotionsOptions {
  /** A Bath & Body Works product id (9 digits: products[].id). Every size is its own id. */
  product_id?: string;
  /**
   * Or the product link, e.g.
   * https://www.bathandbodyworks.com/p/champagne-toast-3-wick-candle-028029548 (the link's site
   * sets country).
   */
  url?: string;
  /**
   * us (default): bathandbodyworks.com in USD; ca: bathandbodyworks.ca in English, CAD. Spanish and
   * French pages are not offered (the site serves the same English data there).
   */
  country?: string;
  [key: string]: unknown;
}

export interface BathandbodyworksOffersOptions {
  /**
   * us (default): bathandbodyworks.com in USD; ca: bathandbodyworks.ca in English, CAD. Spanish and
   * French pages are not offered (the site serves the same English data there).
   */
  country?: string;
  [key: string]: unknown;
}

export interface BathandbodyworksStoreAvailabilityOptions {
  /** A Bath & Body Works product id (9 digits: products[].id). Every size is its own id. */
  product_id?: string;
  /**
   * Or the product link, e.g.
   * https://www.bathandbodyworks.com/p/champagne-toast-3-wick-candle-028029548 (the link's site
   * sets country).
   */
  url?: string;
  /** A Bath & Body Works store id (BBW + 5 digits: stores[].store_id). */
  store_id: string;
  /**
   * us (default): bathandbodyworks.com in USD; ca: bathandbodyworks.ca in English, CAD. Spanish and
   * French pages are not offered (the site serves the same English data there).
   */
  country?: string;
  [key: string]: unknown;
}

export interface BathandbodyworksStoreOptions {
  /** A Bath & Body Works store id (BBW + 5 digits: stores[].store_id). */
  store_id: string;
  /**
   * us (default): bathandbodyworks.com in USD; ca: bathandbodyworks.ca in English, CAD. Spanish and
   * French pages are not offered (the site serves the same English data there).
   */
  country?: string;
  [key: string]: unknown;
}

export interface BathandbodyworksStoresOptions {
  /**
   * us (default): bathandbodyworks.com in USD; ca: bathandbodyworks.ca in English, CAD. Spanish and
   * French pages are not offered (the site serves the same English data there).
   */
  country?: string;
  [key: string]: unknown;
}

export interface BathandbodyworksReviewsSummaryOptions {
  /** A Bath & Body Works product id (9 digits: products[].id). Every size is its own id. */
  product_id?: string;
  /**
   * Or the product link, e.g.
   * https://www.bathandbodyworks.com/p/champagne-toast-3-wick-candle-028029548 (the link's site
   * sets country).
   */
  url?: string;
  /**
   * us (default): bathandbodyworks.com in USD; ca: bathandbodyworks.ca in English, CAD. Spanish and
   * French pages are not offered (the site serves the same English data there).
   */
  country?: string;
  [key: string]: unknown;
}

export class BathandbodyworksNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = BATHANDBODYWORKS_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/bathandbodyworks/${path}`, options, undefined, timeout);
  }

  /**
   * Keyword search on Bath & Body Works (bathandbodyworks.com, the US body care and home fragrance
   * retailer; country ca reads bathandbodyworks.ca in English, CAD). Scavio fetches the public Bath
   * & Body Works page on request. Sorted relevance, by price, top rated or new arrivals and
   * filtered by fragrance name, fragrance family and product type. Costs 1 credit.
   */
  async search(options: BathandbodyworksSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * The products of one category page (categories[].path: /c/..., /g/..., /t/..., including deal
   * pages such as /g/top-offers and /t/black-friday) with the same sorts and filters as search.
   * Costs 1 credit.
   */
  async category(options: BathandbodyworksCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /** The site's category tree (its navigation menu). Costs 1 credit. */
  async categories(options: BathandbodyworksCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /** One product in full by id or link. Costs 1 credit. */
  async product(options: BathandbodyworksProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The promotions attached to one product with their start and end times (ISO, UTC) and terms as
   * given. Costs 1 credit.
   */
  async promotions(options: BathandbodyworksPromotionsOptions): Promise<Record<string, unknown>> {
    return this.post("promotions", options);
  }

  /** The current offers: the home page's offer cards and the Top Offers tiles. Costs 1 credit. */
  async offers(options: BathandbodyworksOffersOptions = {}): Promise<Record<string, unknown>> {
    return this.post("offers", options);
  }

  /** Whether one store takes a pickup order for one product. Costs 1 credit. */
  async storeAvailability(options: BathandbodyworksStoreAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.post("store-availability", options);
  }

  /** One store's public page by store id. Costs 1 credit. */
  async store(options: BathandbodyworksStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * Every store id in the market's store directory (about 1,800 US, 114 Canada). Costs 1 credit.
   */
  async stores(options: BathandbodyworksStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /** One product's rating, review count and up to 4 newest reviews. Costs 1 credit. */
  async reviewsSummary(options: BathandbodyworksReviewsSummaryOptions): Promise<Record<string, unknown>> {
    return this.post("reviews-summary", options);
  }
}
