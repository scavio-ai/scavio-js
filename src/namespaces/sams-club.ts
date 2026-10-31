import type { Scavio } from "../client.js";

// Sam's Club: 6 endpoints, 1 credit each.
//
// search(), savings() and category() answer for a club picked by location,
// echoed in data.club. product({ club_id }) prices and stocks one specific
// club (club_id from clubs()). available_quantity is capped at 8 by the site:
// 8 means 8 or more. Clearance is category "1150109".

export type SamsClubSort = "relevance" | "price_low" | "price_high" | "top_selling";

export type SamsClubReviewSort = "newest" | "oldest" | "highest" | "lowest" | "most_helpful";

export interface SamsClubSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** Results page, 1-based (1-100). Up to 45 results per page. */
  page?: number;
  /** relevance, price_low, price_high or top_selling. Defaults to the site's own order. */
  sort?: SamsClubSort;
  [key: string]: unknown;
}

export interface SamsClubProductOptions {
  /** Sam's Club item id: the number at the end of a samsclub.com/ip/ URL, or item_id from search(). */
  item_id: string;
  /** Club number from clubs(), e.g. "6372". Prices and stocks that club. */
  club_id?: string;
  [key: string]: unknown;
}

export interface SamsClubClubsOptions {
  /** 5-digit US ZIP code, e.g. "75201". */
  zip: string;
  /** Clubs to return, nearest first, within 100 miles (1-20; default 10). */
  limit?: number;
  [key: string]: unknown;
}

export interface SamsClubSavingsOptions {
  /** Results page, 1-based (1-100). Up to 45 items per page. */
  page?: number;
  /** relevance, price_low, price_high or top_selling. */
  sort?: SamsClubSort;
  [key: string]: unknown;
}

export interface SamsClubCategoryOptions {
  /** Category id, the number at the end of a samsclub.com /browse/ or /cp/ URL. Clearance is "1150109". */
  category_id: string;
  /** Results page, 1-based (1-100). */
  page?: number;
  /** relevance, price_low, price_high or top_selling. */
  sort?: SamsClubSort;
  [key: string]: unknown;
}

export interface SamsClubReviewsOptions {
  /** Sam's Club item id from search() or a samsclub.com/ip/ URL. */
  item_id: string;
  /** Reviews page, 1-based (1-100). 10 reviews per page. */
  page?: number;
  /** newest, oldest, highest, lowest or most_helpful. */
  sort?: SamsClubReviewSort;
  [key: string]: unknown;
}

export class SamsClubNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Sam's Club: item_id, price, was_price, savings_amount, unit price,
   * Instant Savings (amount, end date, purchase limit), rating, review count,
   * stock, pickup/delivery/shipping availability and aisle. The club is picked
   * by location and returned in data.club.
   *
   * Costs 1 credit.
   */
  async search(options: SamsClubSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/samsclub/search", options);
  }

  /**
   * One Sam's Club item: online price and the club shelf price (club_price)
   * with was price, savings and unit price, Instant Savings, rating histogram,
   * UPC, model, specifications, and per-method fulfillment with stock and
   * aisle. Pass club_id to price and stock a specific club.
   *
   * Costs 1 credit.
   */
  async product(options: SamsClubProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/samsclub/product", options);
  }

  /**
   * Sam's Club clubs near a US ZIP, nearest first: club_id, name, address,
   * coordinates, distance in miles, phone, opening hours, services and whether
   * the club is temporarily closed.
   *
   * Costs 1 credit.
   */
  async clubs(options: SamsClubClubsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/samsclub/clubs", options);
  }

  /**
   * Every item on Sam's Club Instant Savings, paged: price, was price and
   * savings amount, plus each offer's amount, end date, purchase limit and
   * channels.
   *
   * Costs 1 credit.
   */
  async savings(options: SamsClubSavingsOptions = {}): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/samsclub/savings", options);
  }

  /**
   * Products in a Sam's Club category, paged, with the same fields as
   * search(). Clearance is category "1150109".
   *
   * Costs 1 credit.
   */
  async category(options: SamsClubCategoryOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/samsclub/category", options);
  }

  /**
   * Customer reviews for a Sam's Club item, 10 per page: rating, title, text,
   * author, date, verified purchase and helpful votes, plus the average rating,
   * total count and 1-5 star breakdown.
   *
   * Costs 1 credit.
   */
  async reviews(options: SamsClubReviewsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/samsclub/reviews", options);
  }
}
