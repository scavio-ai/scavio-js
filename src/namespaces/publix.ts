import type { Scavio } from "../client.js";

// Publix: 11 endpoints on publix.com (US), 1 credit each. Every price endpoint
// is store-scoped: pass store_id, a Publix store number from stores(). Prices,
// promotions and aisles are that store's and differ by store.
//
// Publix shows prices online only for items on sale and for order-ahead (deli
// and bakery) items, so price is a number only when the site shows one and
// null otherwise; it is never estimated. Multi-buys carry bundle {quantity,
// price}. Products are keyed by Publix item code, not UPC. The server enforces
// the cross-field rules: category() takes category_url or category_id;
// stores() takes zip, city with state, or store_id. Every call raises the
// request timeout to PUBLIX_TIMEOUT when the client's is shorter. Failed
// upstream calls are not charged; an unknown item code or store id is a
// charged 404.

/** Minimum request timeout (ms) for every publix call. */
export const PUBLIX_TIMEOUT = 120_000;

/** A Publix store number (stores[].store_id of stores()), e.g. "1614" or 1825. */
export type PublixStoreId = string | number;

/**
 * relevance (default), featured, name_asc, name_desc, popularity,
 * savings_amount (biggest promo savings first) or most_viewed.
 */
export type PublixSort =
  | "relevance"
  | "featured"
  | "name_asc"
  | "name_desc"
  | "popularity"
  | "savings_amount"
  | "most_viewed";

/** subs (the Pub Sub menu, default) or all (the whole deli and bakery order-ahead catalog). */
export type PublixOrderAheadSection = "subs" | "all";

export interface PublixGridOptions {
  /** Results page, 1-based (48 products per page). A page past the last answers an empty list. */
  page?: number;
  /** Sort order. Defaults to relevance. */
  sort?: PublixSort;
  /** Only items on sale at the store (weekly ad, BOGO, multi-buy or extra savings). */
  on_sale?: boolean;
  /** Only Buy One Get One Free items at the store. */
  bogo?: boolean;
  /** Only this brand, as the site lists it (facets: Brand values), e.g. "Tyson". */
  brand?: string;
}

export interface PublixSearchOptions extends PublixGridOptions {
  /** Search keywords (1-100 characters), e.g. "chicken". */
  query: string;
  /** A Publix store number from stores(). Prices, promotions and aisles are this store's. */
  store_id: PublixStoreId;
  [key: string]: unknown;
}

export interface PublixProductOptions {
  /** A Publix item code (not a UPC): items[].item_code of search(), category() or orderAhead(), e.g. "90355". */
  item_code: string | number;
  /** A Publix store number from stores(). */
  store_id: PublixStoreId;
  [key: string]: unknown;
}

export interface PublixCategoryOptions extends PublixGridOptions {
  /** A publix.com category link (/c/<name>/<id>). One of category_url or category_id. */
  category_url?: string;
  /** A category id (categories[].id of categories()). Alternative to category_url. */
  category_id?: string;
  /** A Publix store number from stores(). */
  store_id: PublixStoreId;
  [key: string]: unknown;
}

export interface PublixCategoriesOptions {
  /** Optional. A Publix store number from stores(). */
  store_id?: PublixStoreId;
  /** Return only this department's or category's subtree (categories[].id). */
  parent_id?: string;
  [key: string]: unknown;
}

export interface PublixWeeklyAdOptions {
  /** A Publix store number from stores(). */
  store_id: PublixStoreId;
  /** Only items of this department (departments of the answer, e.g. "Meat", "Produce", "Deli", "Wine"). */
  department?: string;
  /** Only Buy 1 Get 1 Free and Buy 2 Get 1 Free items. */
  bogo_only?: boolean;
  /** Only items whose title, description or brand contains this text. */
  query?: string;
  [key: string]: unknown;
}

export interface PublixStoreOptions {
  /** A Publix store number from stores(). */
  store_id: PublixStoreId;
  [key: string]: unknown;
}

export interface PublixSavingsSearchOptions {
  /** A keyword to find in the store's weekly ad, Extra Savings and digital coupons, e.g. "coffee". */
  query: string;
  /** A Publix store number from stores(). */
  store_id: PublixStoreId;
  [key: string]: unknown;
}

export interface PublixOrderAheadOptions {
  /** A Publix store number from stores(). */
  store_id: PublixStoreId;
  /** subs (default) or all. */
  section?: PublixOrderAheadSection;
  /** Results page, 1-based (60 items per page). */
  page?: number;
  [key: string]: unknown;
}

export interface PublixStoresOptions {
  /** A 5-digit US ZIP code: the stores nearest to it, e.g. "33101". */
  zip?: string;
  /** A city name, with state, e.g. "Nashville". */
  city?: string;
  /** A 2-letter state code, with city, e.g. "TN". */
  state?: string;
  /** One store by its Publix store number. */
  store_id?: PublixStoreId;
  /** Stores to return, up to 30. Defaults to 10. */
  limit?: number;
  /** Search radius in miles, 1-100. Defaults to 50. */
  radius_miles?: number;
  [key: string]: unknown;
}

export interface PublixSuggestionsOptions {
  /** What the user has typed so far, e.g. "chick". */
  query: string;
  /** Optional: with a store the answer also carries up to 4 products. */
  store_id?: PublixStoreId;
  [key: string]: unknown;
}

export class PublixNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/publix/${path}`, options, undefined, PUBLIX_TIMEOUT);
  }

  /**
   * Search Publix products at one store by keyword, 48 per page: query,
   * corrected_query, store (id, name), total, page, page_size, total_pages,
   * count, sort, applied_filters, facets and items with item_code,
   * base_product_id, title, brand, size, description, image, url,
   * category_path, aisle, on_sale, price (null unless Publix shows one),
   * price_unit, bundle, starting_price, regular_price, price_text,
   * regular_price_text, promo (type single, bogo or multi; message,
   * conditions, savings, valid_from, valid_through), has_coupon and
   * is_order_ahead. Keywords the site sends to an order-ahead page set
   * redirected_to.
   *
   * Costs 1 credit.
   */
  async search(options: PublixSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Publix product by item code at one store: the search item fields
   * (order-ahead items also short_description, lead_time, serves, calories)
   * plus nutrition facts (labels with serving size, servings per container
   * and every nutrient with amount, unit and percent daily value; null when
   * Publix has none) and store. Publix does not publish ingredients,
   * allergens, UPC or reviews online. An unknown item code is a charged 404.
   *
   * Costs 1 credit.
   */
  async product(options: PublixProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One Publix category's products at one store, by category_url or
   * category_id, with the search sorts and filters: category (id, name,
   * path) and the search fields.
   *
   * Costs 1 credit.
   */
  async category(options: PublixCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The Publix category tree: departments with their categories and
   * sub-categories, each with id (for category()), name, url, parent_id,
   * level and children; plus count. parent_id returns one subtree.
   *
   * Costs 1 credit.
   */
  async categories(options: PublixCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * The store's current Publix weekly ad (English), about 700 items: ad
   * (start_date, end_date), total, count, applied_filters, departments and
   * items with id, item_code, base_product_id, title, description, brand,
   * department, categories, savings_text (e.g. "Buy 1 Get 1 FREE", "$6.89
   * lb", "2 for $5.00"), deal_type (bogo, b2g1, multi, price, percent_off or
   * other), price (only for a plain price), price_unit, bundle, save_up_to,
   * additional_savings, min_quantity, fine_print, stacked_with_coupon,
   * promotion, valid_from, valid_to and image. Ads run Thursday to Wednesday
   * in Florida, Wednesday to Tuesday in Georgia and North Carolina.
   *
   * Costs 1 credit.
   */
  async weeklyAd(options: PublixWeeklyAdOptions): Promise<Record<string, unknown>> {
    return this.post("weekly-ad", options);
  }

  /**
   * The store's Publix Extra Savings (temporary price reductions): store,
   * count, period (start_date, end_date) and items with id, base_product_id,
   * title, size, brand, categories, savings_text, savings,
   * additional_savings, final_price (as the site lists it), min_quantity,
   * image and url.
   *
   * Costs 1 credit.
   */
  async extraSavings(options: PublixStoreOptions): Promise<Record<string, unknown>> {
    return this.post("extra-savings", options);
  }

  /**
   * The store's Publix digital coupons (about 100-130): store, count and
   * items with id, title, description, brand, savings_text, value,
   * min_quantity, limit_per_transaction, categories, valid_from, valid_to,
   * terms and image. Listed only: never clipped, no account.
   *
   * Costs 1 credit.
   */
  async coupons(options: PublixStoreOptions): Promise<Record<string, unknown>> {
    return this.post("coupons", options);
  }

  /**
   * One keyword across the store's weekly ad, Extra Savings and digital
   * coupons: query, store, count and items, each with saving_type
   * (weekly_ad, extra_savings or coupon) and that feed's fields.
   *
   * Costs 1 credit.
   */
  async savingsSearch(options: PublixSavingsSearchOptions): Promise<Record<string, unknown>> {
    return this.post("savings-search", options);
  }

  /**
   * The store's deli and bakery order-ahead menu with its prices: Pub Subs
   * (section subs, default) or every sub, platter, cake and meal (section
   * all, 60 per page). Items in the search item shape plus
   * short_description, lead_time, serves, calories and pay_online; also
   * section, store, total, page, page_size, total_pages and count.
   *
   * Costs 1 credit.
   */
  async orderAhead(options: PublixOrderAheadOptions): Promise<Record<string, unknown>> {
    return this.post("order-ahead", options);
  }

  /**
   * Publix stores near a ZIP, in a city (with state), or one by store_id:
   * store_id, name, short_name, type, address, phone, 7 days of hours,
   * time_zone, departments, services, pharmacy (phone, hours),
   * liquor_store, latitude, longitude, distance_miles, weekly_ad_break_day,
   * opening_date, closing_date and image. An unknown store_id is a charged
   * 404.
   *
   * Costs 1 credit.
   */
  async stores(options: PublixStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * Search box suggestions for a partial query: up to 10 suggestions (text,
   * type) and, with store_id, up to 4 products (item_code, base_product_id,
   * title, description, saving_text, image, url); plus query, store_id and
   * count.
   *
   * Costs 1 credit.
   */
  async suggestions(options: PublixSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
