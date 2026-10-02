import type { Scavio } from "../client.js";

// Walmart: search, product, reviews, category, offers, seller, sellerProducts
// and stores.
//
// `device` is the only retired param. It is no longer typed here; sending it
// anyway does not fail the request - the response carries a `warnings[]` array
// explaining that it was ignored.
//
// STORE TARGETING (search and product): pass `delivery_zip` and `store_id`
// TOGETHER to get one store's assortment and availability. Works on walmart.com
// and walmart.ca (a Canadian postal code such as "M5V 2T6" with domain "ca").
// Get `store_id` from `stores()` for a ZIP or postal code, on the same domain.
// The store actually used is echoed in `data.location`. A store-targeted call
// costs 2 credits and takes 10-60 seconds; a store_id that does not exist
// returns 400. walmart.com.mx does not support store targeting.
//
// CREDITS ARE BODY-PRICED: search and category cost 1 credit on domain "com" or
// "ca" and 2 on "com.mx"; a store-targeted search or product costs 2. Product,
// reviews, offers, seller, sellerProducts and stores are otherwise 1.

export interface WalmartSearchOptions {
  /** Product search query (1-500 characters). */
  query: string;
  /**
   * Walmart storefront. Price-bearing: "com" and "ca" cost 1 credit,
   * "com.mx" costs 2. Defaults to "com".
   */
  domain?: "com" | "ca" | "com.mx";
  /** Result page, 1-indexed. */
  page?: number;
  /** @deprecated Alias for `page`. Use `page`. */
  start_page?: number;
  /** Result sort order (default "best_match"). */
  sort_by?:
    | "best_match"
    | "price_low"
    | "price_high"
    | "best_seller"
    | "rating_high"
    | "new";
  /** Minimum price filter. */
  min_price?: number;
  /** Maximum price filter. */
  max_price?: number;
  /**
   * Delivery speed filter. "2_days" is deliberately unsupported (it leaks
   * 3-4 day items) and there is no "anytime" - omit the param instead.
   */
  fulfillment_speed?: "today" | "tomorrow";
  /** Fulfillment type filter. */
  fulfillment_type?: "in_store";
  /**
   * Shopper's postal code for store targeting: a 5-digit US ZIP, or a Canadian
   * postal code ("M5V 2T6") with domain "ca". Must be sent together with
   * `store_id`. Store-targeted calls cost 2 credits.
   */
  delivery_zip?: string;
  /**
   * Walmart store to target, from `stores()` on the same domain. Must be sent
   * together with `delivery_zip`. Supported on domain "com" and "ca".
   */
  store_id?: string | number;
  [key: string]: unknown;
}

export interface WalmartProductOptions {
  /** Walmart item id (usItemId), e.g. "13544111159". */
  product_id: string;
  /**
   * Walmart storefront, "com" (default) or "ca". "ca" is only available
   * together with `delivery_zip` + `store_id`.
   */
  domain?: "com" | "ca";
  /**
   * Shopper's postal code for store targeting: a 5-digit US ZIP, or a Canadian
   * postal code with domain "ca". Must be sent together with `store_id`.
   */
  delivery_zip?: string;
  /**
   * Walmart store to target, from `stores()` on the same domain. Must be sent
   * together with `delivery_zip`.
   */
  store_id?: string | number;
  [key: string]: unknown;
}

export interface WalmartStoresOptions {
  /**
   * A 5-digit US ZIP, or a Canadian postal code ("M5V 2T6" or "M5V2T6") with
   * domain "ca".
   */
  zipcode: string;
  /** "com" (walmart.com, default) or "ca" (walmart.ca). */
  domain?: "com" | "ca";
  [key: string]: unknown;
}

/** One store returned by `stores()`. */
export interface WalmartStore {
  store_id: string | null;
  name: string | null;
  type: string | null;
  node_type: string | null;
  distance_miles: number | null;
  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    zipcode: string | null;
    country: string | null;
  };
  latitude: number | null;
  longitude: number | null;
  open_24_hours: boolean | null;
  hours: {
    day: string | null;
    start: string | null;
    end: string | null;
    closed: boolean | null;
  }[];
  pickup_types: string[];
}

/** The `data` object of a `stores()` response. */
export interface WalmartStoresData {
  /** The ZIP or postal code searched, normalized ("M5V 2T6"). */
  zipcode: string;
  domain: "com" | "ca";
  count: number;
  /** Nearest first. */
  stores: WalmartStore[];
}

export interface WalmartStoresResponse {
  data: WalmartStoresData;
  response_time: number;
  credits_used: number;
  credits_remaining: number;
  warnings?: string[];
  [key: string]: unknown;
}

export interface WalmartReviewsOptions {
  /** Walmart item id (usItemId). */
  product_id: string;
  /** Result page, 1-indexed. 10 reviews per page. */
  page?: number;
  /** Review sort order. */
  sort?:
    | "relevancy"
    | "submission-desc"
    | "submission-asc"
    | "rating-desc"
    | "rating-asc"
    | "helpful-desc";
  [key: string]: unknown;
}

export interface WalmartCategoryOptions {
  /**
   * Category id: either a leaf id ("1095191") or a full underscore path
   * ("3944_133251_1095191").
   */
  category_id: string;
  /**
   * Walmart storefront. Price-bearing: "com" and "ca" cost 1 credit,
   * "com.mx" costs 2. Defaults to "com".
   */
  domain?: "com" | "ca" | "com.mx";
  /** Result page, 1-indexed. */
  page?: number;
  /** Trims the returned list after fetching. Does NOT reduce the credit cost. */
  limit?: number;
  /** Result sort order (default "best_match"). */
  sort_by?:
    | "best_match"
    | "price_low"
    | "price_high"
    | "best_seller"
    | "rating_high"
    | "new";
  /** Minimum price filter. */
  min_price?: number;
  /** Maximum price filter. */
  max_price?: number;
  /**
   * Delivery speed filter. "2_days" is deliberately unsupported (it leaks
   * 3-4 day items) and there is no "anytime" - omit the param instead.
   */
  fulfillment_speed?: "today" | "tomorrow";
  [key: string]: unknown;
}

export interface WalmartOffersOptions {
  /** Walmart item id (usItemId). */
  product_id: string;
  [key: string]: unknown;
}

export interface WalmartSellerOptions {
  /**
   * NUMERIC catalog seller id, the `seller_catalog_id` field returned by
   * product/offers. The GUID form of seller_id returns 404.
   */
  seller_id: string;
  [key: string]: unknown;
}

export interface WalmartSellerProductsOptions {
  /**
   * NUMERIC catalog seller id (`seller_catalog_id`). The GUID form returns 404.
   */
  seller_id: string;
  [key: string]: unknown;
}

export class WalmartNamespace {
  constructor(private client: Scavio) {}

  /**
   * Structured Walmart search results: `products[]`, `products_count` and the
   * resolved `location`. Page through with `page` (1-indexed).
   *
   * Pass `delivery_zip` + `store_id` to get one store's results (walmart.com
   * and walmart.ca); `data.location` confirms the store.
   *
   * Costs 1 credit for `domain` "com" or "ca", 2 credits for "com.mx", and 2
   * credits when store-targeted.
   */
  async search(
    options: WalmartSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/search", options);
  }

  /**
   * Full product detail: price, rating, images, specifications, availability
   * and seller.
   *
   * Pass `delivery_zip` + `store_id` for one store's price and availability.
   * `domain: "ca"` is available only together with a store target.
   *
   * Costs 1 credit, or 2 when store-targeted. A store that does not carry the
   * item returns 404.
   */
  async product(
    options: WalmartProductOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/product", options);
  }

  /**
   * Customer reviews with ratings, text, author, date and the rating
   * breakdown. 10 reviews per page; advance with `page`.
   *
   * Costs 1 credit.
   */
  async reviews(
    options: WalmartReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/reviews", options);
  }

  /**
   * Products within a category, in the same product shape as `search()`.
   * Page through with `page`; `limit` only trims the response.
   *
   * Costs 1 credit for `domain` "com" or "ca", 2 credits for "com.mx".
   */
  async category(
    options: WalmartCategoryOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/category", options);
  }

  /**
   * Seller offer for a product: price, seller, condition and buy-box flag.
   * Returns the BUY-BOX SELLER ONLY, not the full offer list.
   *
   * Costs 1 credit.
   */
  async offers(
    options: WalmartOffersOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/offers", options);
  }

  /**
   * Marketplace seller storefront: name, rating, review count, Pro Seller
   * badge and business details.
   *
   * Costs 1 credit. `seller_id` must be the numeric catalog seller id.
   */
  async seller(
    options: WalmartSellerOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/seller", options);
  }

  /**
   * A seller's catalog. Roughly the first 40 items are server-rendered and
   * that is all this returns - there is no pagination. `total_count` reports
   * the seller's real catalog size, which is usually far larger.
   *
   * Costs 1 credit. `seller_id` must be the numeric catalog seller id.
   */
  async sellerProducts(
    options: WalmartSellerProductsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/walmart/seller-products", options);
  }

  /**
   * Walmart stores near a US ZIP (or a Canadian postal code with `domain: "ca"`),
   * nearest first, with `store_id`, address, distance, coordinates and hours.
   * Use a `store_id` with `delivery_zip` on `search()` or `product()`, on the
   * same domain, to target that store.
   *
   * Costs 1 credit.
   */
  async stores(options: WalmartStoresOptions): Promise<WalmartStoresResponse> {
    return (await this.client._post(
      "/api/v1/walmart/stores",
      options,
    )) as unknown as WalmartStoresResponse;
  }
}
