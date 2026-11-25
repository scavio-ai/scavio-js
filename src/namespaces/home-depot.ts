import type { Scavio } from "../client.js";

// Home Depot (US, homedepot.com) is 2 credits on search, product, reviews,
// stores and availability, and 4 on shipping (US only) - it is a
// premium-priced platform, so it is the priciest of the retail namespaces. Home Depot Canada (country "ca", homedepot.ca) is 1
// credit per call on every endpoint, including the five Canada-only ones.
//
// `country` is optional and never sent unless set, so a US call posts exactly
// what it did before Home Depot Canada existed.
//
// US search page size is FIXED at 12 with no way to change it. Paging is the
// only way to read further. Canada takes `page_size` 1-40.
//
// `sort_by` is a CLOSED enum on purpose. Home Depot does not fall back on an
// unknown sort - it answers 200 with an empty page that still bills. "Newest"
// (arrivaldate) is deliberately absent: it works on category pages and is
// rejected on keyword search. `top_sellers` is US only (400 for "ca").
//
// Unknown item ids and out-of-range pages come back upstream as billed 200
// shells; the API restates them as 404.

/** "us" (default, homedepot.com) or "ca" (Home Depot Canada, homedepot.ca, CAD). */
export type HomeDepotCountry = "us" | "ca";

/** Home Depot Canada only: "en" (default) or "fr". Same ids and CAD prices. */
export type HomeDepotCaLanguage = "en" | "fr";

/** Home Depot Canada Special Offers filter values. */
export type HomeDepotCaDeal = "special_buy" | "new_lower_price" | "savings";

/** A Home Depot Canada facet filter, from `facets` (include_facets). */
export interface HomeDepotCaFilter {
  /** Facet key, e.g. "manufacturerName". */
  facet?: string;
  /** facets[].values[].value, e.g. "9wh". */
  value: string;
}

/** Home Depot Canada listing inputs shared by search and category. */
export interface HomeDepotCaListingOptions {
  /**
   * Home Depot Canada store number whose price and units to read, e.g. "7080".
   * Without it the site prices at its default store 7274; `data.store` says which.
   */
  store_id?: string | number;
  /** Products per page, 1-40 (default 40). */
  page_size?: number;
  /** Up to 10 facet filters, values from an earlier response's `facets`. */
  filters?: Array<HomeDepotCaFilter | string>;
  /** Special Offers filter. With no query, every product with that offer. */
  deals?: HomeDepotCaDeal | HomeDepotCaDeal[];
  /** Also return `facets` to filter on. */
  include_facets?: boolean;
  language?: HomeDepotCaLanguage;
}

export interface HomeDepotSearchOptions extends HomeDepotCaListingOptions {
  /**
   * Search keywords (1-500 characters). Required for the US; for country "ca"
   * pass query, category_id or deals.
   */
  query?: string;
  /** Result page, 1-indexed. US page size is fixed at 12 products. */
  page?: number;
  /**
   * Result sort order (default "best_match"). Closed set - an unrecognised
   * value is not ignored, it produces an empty billed page. "top_sellers" is
   * US only.
   */
  sort_by?: "best_match" | "top_sellers" | "top_rated" | "price_low" | "price_high";
  /** Minimum price filter (USD; CAD for "ca"). */
  min_price?: number;
  /** Maximum price filter (USD; CAD for "ca"). */
  max_price?: number;
  country?: HomeDepotCountry;
  /** Home Depot Canada only: a category id from categories(), e.g. "l4-drill-drivers". */
  category_id?: string;
  [key: string]: unknown;
}

export interface HomeDepotProductOptions {
  /**
   * Home Depot item id, or a full homedepot.com/p/... URL. Tracking params on
   * a pasted URL are discarded. For "ca" a 10-digit Home Depot Canada id
   * (e.g. "1000112108") or a homedepot.ca/product/... link.
   */
  item_id: string;
  country?: HomeDepotCountry;
  /**
   * Home Depot Canada only: a store number. `price` is then that store's
   * price (`price_source` "store") and `online_price` the online price, with
   * `store_units`, `aisle` and `bay`.
   */
  store_id?: string | number;
  language?: HomeDepotCaLanguage;
  [key: string]: unknown;
}

export interface HomeDepotReviewsOptions {
  /** Home Depot item id (for "ca", a Home Depot Canada id or link). */
  item_id: string;
  /**
   * Result page, 1-indexed. 30 reviews per page. `total_pages` is the last
   * page that exists - asking past it returns 404. US only (a 400 for "ca").
   */
  page?: number;
  country?: HomeDepotCountry;
  /** Home Depot Canada only: "en" or "fr" (a different review set). */
  language?: HomeDepotCaLanguage;
  [key: string]: unknown;
}

export interface HomeDepotStoresOptions {
  /**
   * A ZIP code, city or address to find stores near, e.g. "98101". Required
   * for the US; for "ca" a postal code or city (e.g. "M5V 2T6"), or pass
   * latitude + longitude instead.
   */
  query?: string;
  /** Stores to return, nearest first. US 1-20 (default 20); "ca" 1-50 (default 10). */
  limit?: number;
  country?: HomeDepotCountry;
  /** Home Depot Canada only: with longitude, instead of query. */
  latitude?: number;
  /** Home Depot Canada only: with latitude, instead of query. */
  longitude?: number;
  /** Home Depot Canada only: page, 1-based. */
  page?: number;
  language?: HomeDepotCaLanguage;
  [key: string]: unknown;
}

export interface HomeDepotAvailabilityOptions {
  /** Home Depot item id or URL (for "ca", a Home Depot Canada id or link). */
  item_id: string;
  /**
   * Store number from stores(), for pickup stock and the store's price.
   * Required for "ca".
   */
  store_id?: string;
  /** US only: 5-digit ZIP to quote delivery to. Pass store_id, zip, or both. */
  zip?: string;
  country?: HomeDepotCountry;
  language?: HomeDepotCaLanguage;
  [key: string]: unknown;
}

export interface HomeDepotShippingOptions {
  /** Home Depot item id, or a full homedepot.com/p/... URL. */
  item_id: string;
  /** 5-digit US ZIP code. */
  zip: string;
  /** Units to quote delivery for, 1-999. Default 1. */
  quantity?: number;
  /** Optional store number from stores(). */
  store_id?: string;
  [key: string]: unknown;
}

export interface HomeDepotCategoryOptions extends HomeDepotCaListingOptions {
  /** A category or collection id from categories(), e.g. "l4-drill-drivers" or "661103". */
  category_id: string;
  /** Optional keywords inside the category. */
  query?: string;
  /** Page, 1-based (1-500). */
  page?: number;
  sort_by?: "best_match" | "price_low" | "price_high" | "top_rated";
  /** Lowest price, CAD. */
  min_price?: number;
  /** Highest price, CAD. */
  max_price?: number;
  [key: string]: unknown;
}

export interface HomeDepotCategoriesOptions {
  /** Levels of the tree to return, 1-4 (default 4: all). */
  depth?: number;
  language?: HomeDepotCaLanguage;
  [key: string]: unknown;
}

export interface HomeDepotStockOptions {
  /** A Home Depot Canada item id (10 digits) or a homedepot.ca/product/... link. */
  item_id: string;
  /** A Canadian postal code or a city, e.g. "H3B 1A1" or "Montreal". */
  location: string;
  /** Stores per page, 1-50 (default 20). */
  limit?: number;
  /** Page, 1-based. */
  page?: number;
  language?: HomeDepotCaLanguage;
  [key: string]: unknown;
}

export interface HomeDepotStoreOptions {
  /** A Home Depot Canada store number (4 digits), e.g. "7076". */
  store_id: string | number;
  language?: HomeDepotCaLanguage;
  [key: string]: unknown;
}

export interface HomeDepotSuggestionsOptions {
  /** What has been typed so far, e.g. "christ". */
  query: string;
  /** Optional Home Depot Canada store number. */
  store_id?: string | number;
  language?: HomeDepotCaLanguage;
  [key: string]: unknown;
}

export class HomeDepotNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Home Depot: price and promotions, brand and model, ratings,
   * badges, and per-store pickup/delivery.
   *
   * US page size is FIXED at 12 products and cannot be raised - page through
   * with `page` to read further.
   *
   * With `country: "ca"`, Home Depot Canada (homedepot.ca, The Home Depot's
   * Canadian store: 182 stores in 10 provinces): CAD prices at a store
   * (`store_id`) with exact `store_units` and aisle / bay, 1-40 per page,
   * facet filters and Special Offers deals.
   *
   * Costs 2 credits in the US; 1 credit with country "ca".
   */
  async search(
    options: HomeDepotSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/homedepot/search", options);
  }

  /**
   * Full item detail: pricing and promotions, images and videos, the spec
   * table, dimensions, bullets, documents and return policy.
   *
   * US: carries only a 10-review PREVIEW - reviews() is the paginated
   * surface. An unknown item id comes back as 404.
   *
   * Home Depot Canada (`country: "ca"`) with `store_id`: `price` is that
   * store's price and `online_price` the online price, which can differ. When
   * Home Depot Canada has no store record for an item that exists, the online
   * price comes back with `store_price_returned: false`.
   *
   * Costs 2 credits in the US; 1 credit with country "ca".
   */
  async product(
    options: HomeDepotProductOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/homedepot/product", options);
  }

  /**
   * One page of full review bodies with the rating distribution,
   * per-attribute ratings, photos and seller responses.
   *
   * US: 30 reviews per page. `total_pages` is the last page that exists; a
   * page beyond it is a 404, not an empty result.
   *
   * Home Depot Canada (`country: "ca"`): the first 8 reviews per language and
   * the first page of questions; page > 1 is a 400. No reviewer names.
   *
   * Costs 2 credits in the US; 1 credit with country "ca".
   */
  async reviews(
    options: HomeDepotReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/homedepot/reviews", options);
  }

  /**
   * Find Home Depot stores near a ZIP code, city or address: store number,
   * address, coordinates, distance, phone numbers, opening hours and in-store
   * services. Use the store number with availability() and shipping().
   *
   * Home Depot Canada (`country: "ca"`): stores near a postal code or city, or
   * latitude + longitude, with 7 dated days of hours.
   *
   * Costs 2 credits in the US; 1 credit with country "ca".
   */
  async stores(
    options: HomeDepotStoresOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/homedepot/stores", options);
  }

  /**
   * One item's price, promotions and pickup stock at a store, and delivery
   * options, dates and charges to a ZIP. Store and ZIP are independent; pass
   * either or both.
   *
   * Home Depot Canada (`country: "ca"`): `store_id` required, `zip` is a 400
   * (no delivery quotes for Canada). Returns the store's price, exact
   * `store_units`, aisle and bay. When Home Depot Canada has no store record
   * for an item that exists, the answer is an unbilled 502.
   *
   * Costs 2 credits in the US; 1 credit with country "ca".
   */
  async availability(
    options: HomeDepotAvailabilityOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/homedepot/availability", options);
  }

  /**
   * US only: every delivery option Home Depot quotes for an item to a ZIP,
   * for a given quantity: charge, free-shipping status, delivery dates, the
   * delivery level on bulky items, and states it will not ship to. Not
   * available for Home Depot Canada (country "ca" is a 400, not charged).
   *
   * Costs 4 credits.
   */
  async shipping(
    options: HomeDepotShippingOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/homedepot/shipping", options);
  }

  /**
   * Home Depot Canada only: one category or collection page by `category_id`
   * from categories(), priced at a store, with the search inputs. CAD. An
   * unknown category or store is a charged 404.
   *
   * Costs 1 credit.
   */
  async category(
    options: HomeDepotCategoryOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/homedepot/category", options);
  }

  /**
   * Home Depot Canada only: the department tree (about 1,750 nodes) and the
   * current event and collection pages. `departments[].id` and `events[].id`
   * are `category_id` inputs.
   *
   * Costs 1 credit.
   */
  async categories(
    options: HomeDepotCategoriesOptions = {},
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/homedepot/categories", options);
  }

  /**
   * Home Depot Canada only: exact units of one item at every store near a
   * postal code or city, in one call. No prices (product() with `store_id`
   * gives a store's price). When Home Depot Canada has no store record for an
   * item that exists, the answer is an unbilled 502.
   *
   * Costs 1 credit.
   */
  async stock(
    options: HomeDepotStockOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/homedepot/stock", options);
  }

  /**
   * Home Depot Canada only: one store by number with address, phone,
   * coordinates, services, 7 dated days of hours and nearby stores. An
   * unknown store is a charged 404.
   *
   * Costs 1 credit.
   */
  async store(
    options: HomeDepotStoreOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/homedepot/store", options);
  }

  /**
   * Home Depot Canada only: search-box keyword suggestions for typed text,
   * plus the installation services the site suggests.
   *
   * Costs 1 credit.
   */
  async suggestions(
    options: HomeDepotSuggestionsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/homedepot/suggestions", options);
  }
}
