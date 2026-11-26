import type { Scavio } from "../client.js";

// BJ's Wholesale Club (bjs.com, the US warehouse club) product, search, category, categories,
// reviews, coupons and clubs endpoints; US only, prices in USD, 1 credit each. Generated from the
// backend routes: every option and its doc mirrors the API's own request schema; an input the API
// only accepts to refuse (a 400 that says 'not offered') is left out. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to BJS_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused inputs
// are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every bjs call. */
export const BJS_TIMEOUT = 240_000;

export interface BjsProductOptions {
  /**
   * A BJ's product id: the 19-digit number at the end of a bjs.com/product/ link (search
   * results[].product_id).
   */
  product_id?: string;
  /**
   * Or the product link, e.g.
   * https://www.bjs.com/product/scotch-brite-420-sheet-lint-rollers-4-pk/3000000000005430255/.
   */
  url?: string;
  [key: string]: unknown;
}

export interface BjsSearchOptions {
  /** Search keywords. */
  query: string;
  [key: string]: unknown;
}

export interface BjsCategoryOptions {
  /**
   * A BJ's category id from categories (tvs-and-electronics>tvs), or its bjs.com/category/ path or
   * link.
   */
  category: string;
  [key: string]: unknown;
}

export interface BjsCategoriesOptions {
  /** Optional: one category id; the answer is its subtree. */
  category?: string;
  [key: string]: unknown;
}

export interface BjsReviewsOptions {
  /**
   * A BJ's product id: the 19-digit number at the end of a bjs.com/product/ link (search
   * results[].product_id).
   */
  product_id?: string;
  /**
   * Or the product link, e.g.
   * https://www.bjs.com/product/scotch-brite-420-sheet-lint-rollers-4-pk/3000000000005430255/.
   */
  url?: string;
  /** Reviews page, 1-based, 10 a page (1 to 500). */
  page?: number;
  [key: string]: unknown;
}

export interface BjsCouponsOptions {
  [key: string]: unknown;
}

export interface BjsClubsOptions {
  /** Optional: a US state code; the answer is that state's clubs. */
  state?: "AL" | "AK" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "DC" | "FL" | "GA" | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME" | "MD" | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH" | "NJ" | "NM" | "NY" | "NC" | "ND" | "OH" | "OK" | "OR" | "PA" | "RI" | "SC" | "SD" | "TN" | "TX" | "UT" | "VT" | "VA" | "WA" | "WV" | "WI" | "WY";
  [key: string]: unknown;
}

export class BjsNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = BJS_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/bjs/${path}`, options, undefined, timeout);
  }

  /** One BJ's product by product id or link. Costs 1 credit. */
  async product(options: BjsProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * BJ's keyword search: query, departments [{category_id, name, count, url}], related_searches,
   * total, count, page_size (40), has_more, priced_for {club_id, name, city, state} (the club BJ's
   * assigned to the visit, or null), results [product_id (the input of product and reviews),
   * item_number, name, url, image_url, currency, price (online), was_price, sale {price, starts_at,
   * ends_at}, club_price, club_was_price, club_sale, member_only_price, club_only,
   * available_online, available_in_club, out_of_stock, in_stock_online, in_stock_club,
   * fulfillment_online and fulfillment_club {same_day_delivery, pickup_in_club, ebt}, ebt_eligible,
   * weighted_item, rating, review_count, coupon, free_shipping, badges {promotional_badge,
   * promotional_event, spec_badge, plp_badge}, max_quantity, bought_last_month, first_available,
   * categories], facets [{name, label, options [{value, label, count}]}], note. Costs 1 credit.
   */
  async search(options: BjsSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * The products of one BJ's category (ids from categories), as BJ's lists them. Costs 1 credit.
   */
  async category(options: BjsCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /** BJ's full category tree (about 980 categories), or one category's subtree. Costs 1 credit. */
  async categories(options: BjsCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * Customer reviews of one BJ's product, 10 a page in BJ's order (newest to oldest). Costs 1
   * credit.
   */
  async reviews(options: BjsReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * BJ's guest coupon book (the manufacturer and BJ's coupons a visitor sees on the coupon page,
   * about 570). Costs 1 credit.
   */
  async coupons(options: BjsCouponsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("coupons", options);
  }

  /**
   * BJ's club directory (about 280 clubs in 22 states, announced openings included), all or one
   * state. Costs 1 credit.
   */
  async clubs(options: BjsClubsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("clubs", options);
  }
}
