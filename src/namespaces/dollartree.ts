import type { Scavio } from "../client.js";

// Dollar Tree (dollartree.com, the US and Canada discount variety store chain):
// 10 endpoints, 1 credit each except stores() (5). credits_used in the
// response is what was charged.
//
// Markets: every method is US only (www.dollartree.com, USD) except store(),
// which also takes country "ca" (Dollar Tree Canada store pages, English, no
// prices): Dollar Tree Canada has no shopping site.
//
// Prices are Dollar Tree's online unit prices from one national online price
// list (the same at every store and ZIP measured); Dollar Tree notes that
// prices and availability may vary between stores and online, and in-store
// shelf prices are not published online. Online orders are by the case:
// case_price is the price of case_pack units and minimum_quantity the order
// minimum, as Dollar Tree gives them (null when Dollar Tree gives 0, never
// computed); split_case {available, multiple}: available is computed by
// Scavio as minimum_quantity < case_pack, multiple is Dollar Tree's own.
// product() adds split_case_fee (Dollar Tree's raw field as given; its meaning
// is not published, so it is not a fee) and banner_code (DT or FD, not a
// store-brand flag). Stores sell single units. storeStock() needs a store
// number (a ZIP alone does not pick a store): it returns the units at that
// store (status can be null), up to about 63 nearby stores by store number
// (none at some rural stores), ship_to_home {available, dc_number, cases,
// case_size, max_order_units, eta, express_eta, back_order} where
// max_order_units is the most units orderable for delivery (the same at every
// store, not cases x case_size), and ship_to_store with its dc_number.
// search() matches item numbers, not UPCs. reviews() returns the newest
// English reviews (up to about 98 per call; no other sort, no star filter, no
// Q&A, no reviewer names), many syndicated from brand sites and flagged. Not
// available: search suggestions, the weekly ad, deal validity dates, Quick
// Order / bulk ordering, gift cards, Canada products and prices, price history
// (poll and store the answers), checkout.
//
// The server enforces the cross-field rules: product(), storeStock() and
// reviews() take item_id or url; stores() needs zip or city; store() needs url
// or slug; deals() takes category with type sale or clearance only. Every call
// raises the request timeout to DOLLARTREE_TIMEOUT, and storeStock(), stores()
// and reviews() (slow: usually 10-35 s, up to about 2.5 minutes) to
// DOLLARTREE_SLOW_TIMEOUT. Failed upstream calls and refused inputs are not
// charged; a not-found is charged.

/** Minimum request timeout (ms) for every dollartree call: calls can queue behind the server's upstream limit. */
export const DOLLARTREE_TIMEOUT = 240_000;
/** Minimum request timeout (ms) for storeStock(), stores() and reviews(), the slow pages (up to about 2.5 minutes). */
export const DOLLARTREE_SLOW_TIMEOUT = 300_000;

/** A Dollar Tree item number (items[].item_id, the number at the end of a dollartree.com product link; e.g. "221159" or "FD1402202"). UPCs are not item numbers. */
export type DollarTreeItemId = string | number;

/** A Dollar Tree category: categories[].dimension_id (e.g. "3804024826") or a dollartree.com category link. */
export type DollarTreeCategory = string | number;

/** relevance (default), price_low, price_high, newest or rating (highest average rating first): Dollar Tree's sort menu. */
export type DollarTreeSort = "relevance" | "price_low" | "price_high" | "newest" | "rating";

/** sale (default), clearance, new (New Arrivals) or more_choices (MORE CHOICES, Dollar Tree's multi-price department). */
export type DollarTreeDealType = "sale" | "clearance" | "new" | "more_choices";

/** us (default: Dollar Tree US store pages) or ca (Dollar Tree Canada store pages, English, no prices). store() only. */
export type DollarTreeStoreCountry = "us" | "ca";

export interface DollarTreeListOptions {
  /** Page (1-200). */
  page?: number;
  /** Items per page (1-250, default 48, the site's own page size). */
  page_size?: number;
  /** Defaults to "relevance". */
  sort?: DollarTreeSort;
  /** Up to 10 refinement ids exactly as an earlier answer gives them in facets[].values[].id; several are combined. */
  filters?: string[];
  /** Only items at this price point, as Dollar Tree's Price facet lists them (e.g. 1.25, 1.50, 5.00). */
  price_point?: number | string;
  /** Only items rated this many stars and up (1-5). */
  rating?: number;
  /** Only items Dollar Tree sells in stores only (not shipped). */
  in_store_only?: boolean;
  /** Lowest unit price (USD). */
  min_price?: number;
  /** Highest unit price (USD). */
  max_price?: number;
}

export interface DollarTreeItemOptions {
  /** A Dollar Tree item number (e.g. "221159"). Send item_id or url. */
  item_id?: DollarTreeItemId;
  /** A dollartree.com product link (items[].url) instead of item_id. */
  url?: string;
}

export interface DollarTreeSearchOptions extends DollarTreeListOptions {
  /** Keywords ("paper plates") or a Dollar Tree item number (an item number answers with that item). UPCs are not matched. */
  q: string;
  /** Only items in this category: categories[].dimension_id or a Category facet value id. */
  category?: DollarTreeCategory;
  /** Only this brand, as Dollar Tree writes it (the Brand facet's labels, e.g. "Dixie"). */
  brand?: string;
  [key: string]: unknown;
}

export interface DollarTreeProductOptions extends DollarTreeItemOptions {
  [key: string]: unknown;
}

export interface DollarTreeCategoryOptions extends DollarTreeListOptions {
  /** A Dollar Tree category (categories[].dimension_id, e.g. "3804024826" Christmas Decor) or a dollartree.com category link. */
  category: DollarTreeCategory;
  /** Keywords inside the category. */
  q?: string;
  /** Only this brand, as Dollar Tree writes it. */
  brand?: string;
  [key: string]: unknown;
}

export interface DollarTreeCategoriesOptions {
  /** One category (dimension_id, id or link, e.g. "2264625405" Holidays): its sub-categories. Without it: the departments with every sub-category. */
  category?: DollarTreeCategory;
  [key: string]: unknown;
}

export interface DollarTreeBrandOptions extends DollarTreeListOptions {
  /** A brand as Dollar Tree writes it (search's Brand facet labels, e.g. "Dixie"). Matched case-insensitively. */
  brand: string;
  /** Only this brand's items in this category (categories[].dimension_id). */
  category?: DollarTreeCategory;
  [key: string]: unknown;
}

export interface DollarTreeDealsOptions extends DollarTreeListOptions {
  /** Defaults to "sale". */
  type?: DollarTreeDealType;
  /** Keywords inside the deal listing. */
  q?: string;
  /** With type sale or clearance only: only this category (categories[].dimension_id). */
  category?: DollarTreeCategory;
  /** Only this brand, as Dollar Tree writes it. */
  brand?: string;
  [key: string]: unknown;
}

export interface DollarTreeStoreStockOptions extends DollarTreeItemOptions {
  /** A Dollar Tree store number (stores[].store_number of stores(), e.g. "5126"). Required: a ZIP alone does not pick a store. */
  store: string | number;
  /** Optional: the store's ZIP, sent along with the store as Dollar Tree's own store picker does. */
  zip?: string | number;
  /** Optional: the store's two-letter state (e.g. "NY"), sent along with the store. */
  state?: string;
  [key: string]: unknown;
}

export interface DollarTreeStoresOptions {
  /** A US ZIP code (e.g. "60540"). Send zip or city. */
  zip?: string | number;
  /** A US city and state, e.g. "Naperville, IL", instead of zip. */
  city?: string;
  [key: string]: unknown;
}

export interface DollarTreeStoreOptions {
  /** A Dollar Tree store page (stores[].url, e.g. "https://locations.dollartree.com/ny/new-york/2182-3rd-avenue"; Canada: a locations.dollartreecanada.com page with country ca). Send url or slug. */
  url?: string;
  /** Instead of url: the store page slug (stores[].slug, e.g. "ny/new-york/2182-3rd-avenue"). */
  slug?: string;
  /** Defaults to "us"; "ca" for Dollar Tree Canada store pages. */
  country?: DollarTreeStoreCountry;
  [key: string]: unknown;
}

export interface DollarTreeReviewsOptions extends DollarTreeItemOptions {
  [key: string]: unknown;
}

export class DollarTreeNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, minTimeout = DOLLARTREE_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/dollartree/${path}`, options, undefined, minTimeout);
  }

  /** Search by keywords or an item number: 48 a page, unit price, case price, case pack, minimum quantity, facets. Not UPCs. 1 credit. */
  async search(options: DollarTreeSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One item in full: unit price, case price, case pack, minimum quantity, split case, banner code, UPCs as given, online stock, specifications. 1 credit. */
  async product(options: DollarTreeProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** One category listing by dimension_id or link, sorted, filtered and paged. 1 credit. */
  async category(options: DollarTreeCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /** Dollar Tree's departments with every sub-category, or one category's sub-categories. 1 credit. */
  async categories(options: DollarTreeCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /** One brand's items, with the other spellings Dollar Tree lists it under. 1 credit. */
  async brand(options: DollarTreeBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /** Sale, clearance, New Arrivals or More Choices items. 1 credit. */
  async deals(options: DollarTreeDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /** Units of one item at a store plus up to about 63 nearby stores, ship-to-home (max_order_units) and ship-to-store. Slow. 1 credit. */
  async storeStock(options: DollarTreeStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options, DOLLARTREE_SLOW_TIMEOUT);
  }

  /** The stores near a US ZIP or city (20 per answer): address, hours, holiday hours, services. Slow. 5 credits. */
  async stores(options: DollarTreeStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options, DOLLARTREE_SLOW_TIMEOUT);
  }

  /** One store page by link or slug (US, or Canada with country "ca"). 1 credit. */
  async store(options: DollarTreeStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /** One item's newest English reviews (up to about 98 per call), with syndication flags. Slow. 1 credit. */
  async reviews(options: DollarTreeReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options, DOLLARTREE_SLOW_TIMEOUT);
  }
}
