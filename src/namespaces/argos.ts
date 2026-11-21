import type { Scavio } from "../client.js";

// Argos: 10 endpoints, 2 credits each.
//
// One store: argos.co.uk (UK, GBP). There is no country input (Argos Ireland
// closed in 2023).
//
// Store stock is availability, not unit counts: storeStock() answers, for 1 to
// 10 products at the Argos stores near a UK postcode (up to 10 stores within
// 50 miles), a collection state per store and product (collect_now,
// collect_today, collect_tomorrow, collect_later, out_of_stock, not_available)
// with available_from and the site's message, plus delivery to a postcode
// (same_day with Fast Track, next_day, later = Argos's "Delivery within N
// days" with days = N, out_of_stock, not_available; quote delivery from state
// and message: available_from is the date Argos returns, as given). Store
// types: argos_store (a standalone Argos store), inside_sainsburys (an Argos
// counter inside a Sainsbury's store), collection_point (a collect-only point,
// no shop). postcode is where stores are searched; delivery_postcode (default postcode)
// is where delivery is checked. Trusted Seller items are never stocked in
// stores (400).
//
// Prices are numbers in GBP as Argos shows them: price, was_price (the site's
// was price), save (computed by Scavio as was_price - price), offer_text (the
// site's own words, e.g. Half Price) and badges as given (e.g. Black_Friday,
// price_guarantee). seller is argos or trusted_seller (Argos's marketplace;
// seller_name is null there, the page names no seller). search(), category()
// and deals() return 24 per page, pages 1 to 200 (top_100 is 2 pages of 60;
// Argos stops counting at 10,000, flagged by total_capped);
// Tu Clothing items are left out and counted in tu_clothing_excluded.
// reviews(): up to 100 per page, every review reachable, 5 sorts and a star
// filter, syndicated reviews flagged with their source, and Argos's own
// AI-generated summary labelled as such; no reviewer names, locations, ages or
// genders. Not available: unit counts, price history, a brand directory (brand
// is a filter), Argos Ireland, card or checkout prices, Argos Pay terms.
//
// The server enforces the cross-field rules: product(), reviews() and
// questions() take one of product_id or url; stores() one of postcode or
// store; deals() top_100 takes page only. Every call raises the request
// timeout to ARGOS_TIMEOUT. Failed upstream calls are not charged; a not-found
// is charged.

/** Minimum request timeout (ms) for every argos call: calls can queue behind the server's upstream limit. */
export const ARGOS_TIMEOUT = 240_000;

/** relevance (default: Argos's Most Popular), price_low, price_high, rating. */
export type ArgosSort = "relevance" | "price_low" | "price_high" | "rating";

/** argos (sold by Argos) or trusted_seller (Argos's marketplace of third-party sellers). */
export type ArgosSeller = "argos" | "trusted_seller";

/** Offer filters (several = OR). */
export type ArgosOffer = "clearance" | "special_offer" | "black_friday";

/** Deal collections: black_friday, clearance, special_offers, top_100 (Argos's Top 100 deals list). */
export type ArgosCollection = "black_friday" | "clearance" | "special_offers" | "top_100";

/** newest (default), oldest, most_helpful (share of helpful votes), highest_rating, lowest_rating. */
export type ArgosReviewSort = "newest" | "oldest" | "most_helpful" | "highest_rating" | "lowest_rating";

/** newest (default) or oldest. */
export type ArgosQuestionSort = "newest" | "oldest";

/** An Argos product id: a 7-digit catalogue number, or a Trusted Seller item id (8 letters and digits). */
export type ArgosProductId = string | number;

export interface ArgosListOptions {
  /** Brands, up to 10 (OR): facets name brands, values[].value in lower case, e.g. "russell hobbs". */
  brand?: string | string[];
  /** argos or trusted_seller. */
  seller?: ArgosSeller;
  /** Only products Argos marks New In. */
  new_in?: boolean;
  /** Colour groups, up to 10 (facets name colour group), e.g. "blacks". */
  colour?: string | string[];
  /** Lowest price, GBP. */
  price_min?: number;
  /** Highest price, GBP. */
  price_max?: number;
  /** Customer rating: 5 (five stars only) or 1-4 (that many stars or more). */
  rating_min?: 1 | 2 | 3 | 4 | 5;
  /** Any facet by facets[].name: a value or list of values, e.g. { "kettle capacity (l)": "1.6l - 2.0l" }. Up to 10. */
  filters?: Record<string, string | string[]>;
  /** Sort. Defaults to "relevance". */
  sort?: ArgosSort;
  /** Page, 24 products each, 1 to 200. */
  page?: number;
}

export interface ArgosSearchOptions extends ArgosListOptions {
  /** Search text, e.g. "air fryer". */
  query: string;
  /** Category id (categories() category_id), e.g. "29560" Kettles. */
  category?: string | number;
  /** Offers, up to 3 (OR). */
  offers?: ArgosOffer | ArgosOffer[];
  [key: string]: unknown;
}

export interface ArgosCategoryOptions extends ArgosListOptions {
  /** Category id: categories() category_id (any level), the category facet's values, or the c:<id> of a browse link. */
  category_id: string | number;
  /** Optional text inside the category. */
  query?: string;
  /** Offers, up to 3 (OR). */
  offers?: ArgosOffer | ArgosOffer[];
  [key: string]: unknown;
}

export interface ArgosDealsOptions extends ArgosListOptions {
  /** black_friday, clearance, special_offers or top_100 (page only). */
  collection: ArgosCollection;
  /** Optional text within the collection (not with top_100). */
  query?: string;
  /** Category id. */
  category?: string | number;
  /** Page: 24 products each, or 1 to 2 (60 each) for top_100. */
  page?: number;
  [key: string]: unknown;
}

export interface ArgosProductRef {
  /** Argos product id (items[].product_id, e.g. "8377058"). One of product_id or url. */
  product_id?: ArgosProductId;
  /** An Argos product link (https://www.argos.co.uk/product/<id>/). */
  url?: string;
}

export interface ArgosProductOptions extends ArgosProductRef {
  [key: string]: unknown;
}

export interface ArgosStoreStockOptions {
  /** 1 to 10 Argos catalogue numbers (7 digits), as a list or comma-separated. */
  product_ids: string | ArgosProductId[];
  /** A full UK postcode where stores are searched, e.g. "SW1A 1AA". */
  postcode: string;
  /** Postcode for home delivery availability. Defaults to postcode. */
  delivery_postcode?: string;
  /** Search radius in miles, 1 to 50 (default 50). */
  max_distance?: number;
  /** Stores, 1 to 10 (default 10). */
  max_results?: number;
  [key: string]: unknown;
}

export interface ArgosStoresOptions {
  /** Stores near this full UK postcode. One of postcode or store. */
  postcode?: string;
  /** One store: stores[].store (e.g. "661-manchester-arndale-argos") or its argos.co.uk/stores/... link. */
  store?: string;
  /** Search radius in miles, 1 to 50 (default 50). */
  max_distance?: number;
  /** Stores, 1 to 10 (default 10). */
  max_results?: number;
  [key: string]: unknown;
}

export interface ArgosReviewsOptions extends ArgosProductRef {
  /** Sort. Defaults to "newest". */
  sort?: ArgosReviewSort;
  /** Only reviews with these star ratings (one or a list). */
  rating?: 1 | 2 | 3 | 4 | 5 | Array<1 | 2 | 3 | 4 | 5>;
  /** Page (page * limit up to total). */
  page?: number;
  /** Reviews per page, 1 to 100 (default 20). */
  limit?: number;
  [key: string]: unknown;
}

export interface ArgosQuestionsOptions extends ArgosProductRef {
  /** Sort. Defaults to "newest". */
  sort?: ArgosQuestionSort;
  /** Page. */
  page?: number;
  /** Questions per page, 1 to 50 (default 10). */
  limit?: number;
  [key: string]: unknown;
}

export interface ArgosSuggestionsOptions {
  /** What the shopper has typed so far, e.g. "lego". */
  query: string;
  /** Suggestions, 1 to 10 (default 10). */
  limit?: number;
  [key: string]: unknown;
}

export class ArgosNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/argos/${path}`, options, undefined, ARGOS_TIMEOUT);
  }

  /**
   * Search Argos, 24 per page up to page 200: sort, filters, page, total,
   * total_capped (Argos stops counting at 10,000), total_pages, has_more, count, tu_clothing_excluded, items (product_id, url,
   * name, brand, price, was_price, save, offer_text, clearance, badges, rating,
   * review_count, seller, deliverable, reservable, free_delivery,
   * delivery_cost, argos_pay, image), facets.
   *
   * Costs 2 credits.
   */
  async search(options: ArgosSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product by product_id or link: template (argos or trusted_seller),
   * ean, price, was_price, save, offer_text, badges with start and end dates
   * (one entry per badge code), rating (null without reviews),
   * features, variants, special_offers, nectar_points, care_plans,
   * payment_options, bundles, breadcrumb, rating_distribution, question and
   * answer counts, the first 10 reviews. A withdrawn or unknown product is a
   * charged 404; a Tu Clothing id is a 400.
   *
   * Costs 2 credits.
   */
  async product(options: ArgosProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Argos store stock: whether 1 to 10 products can be collected at the Argos
   * stores near a UK postcode (nearest first) and delivered to a postcode:
   * stores {store_id, name, store, type, distance_miles, address, hours,
   * products {product_id, state, available_from, message}}, delivery
   * {postcode, products {product_id, state, available_from, days, fast_track}},
   * products {product_id, known, collectable, deliverable,
   * globally_out_of_stock}. States, not unit counts. A postcode that does not
   * exist gets no answer from Argos: an unbilled 502 after about 50 seconds.
   *
   * Costs 2 credits.
   */
  async storeStock(options: ArgosStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /**
   * Argos stores near a UK postcode (up to 10 within 50 miles; no stock: use
   * storeStock()), or one store by stores[].store with opening hours, special
   * hours and services.
   *
   * Costs 2 credits.
   */
  async stores(options: ArgosStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One product's reviews, up to 100 per page: total, summary (Argos's own
   * AI-generated summary, labelled by summary_source), stats, reviews {id,
   * rating, title, text, submitted_at, recommended, helpful_count, syndicated,
   * syndication_source, argos_colleague, photos, brand_response}. No reviewer
   * names, locations, ages or genders.
   *
   * Costs 2 credits.
   */
  async reviews(options: ArgosReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * One product's customer questions with answers {text, source (staff, brand
   * or customer), best_answer, helpful_count}, up to 50 per page. No names.
   *
   * Costs 2 credits.
   */
  async questions(options: ArgosQuestionsOptions): Promise<Record<string, unknown>> {
    return this.post("questions", options);
  }

  /**
   * Argos's department tree (14 departments): departments {name, category_id,
   * url, groups {name, category_id, links {name, category_id, url,
   * url_filters}}}.
   *
   * Costs 2 credits.
   */
  async categories(options: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One category's products by category_id, 24 per page, with the search
   * filters and sorts.
   *
   * Costs 2 credits.
   */
  async category(options: ArgosCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * Deal collections: black_friday, clearance and special_offers as full
   * lists (24 per page, with filters and sorts), or top_100, Argos's own Top
   * 100 deals list (2 pages of 60, page only).
   *
   * Costs 2 credits.
   */
  async deals(options: ArgosDealsOptions): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * Search suggestions for a partial query: suggestions {text, weight
   * (Argos's popularity weight)}, in Argos's order (not sorted by weight).
   *
   * Costs 2 credits.
   */
  async suggestions(options: ArgosSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
