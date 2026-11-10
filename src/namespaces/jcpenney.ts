import type { Scavio } from "../client.js";

// JCPenney: 11 endpoints, jcpenney.com (US incl. Puerto Rico stores, USD),
// 1 credit each.
//
// product() takes product_id, url or up to 20 product_ids; category() takes
// path or url (a /g/ path that carries its id=cat...); brand() takes brand or
// url; stores() takes one location (zip, city + state, or lat + lng);
// storeAvailability() takes a sku (a product's variants[].sku) plus zip or
// lat + lng; reviews() and questions() take product_id or url. The server
// enforces these. Prices are product-level ranges (no price per size or
// color). Every call raises the request timeout to JCPENNEY_TIMEOUT when the
// client's is shorter, except reviews() and questions(): they usually take
// 15-90 s, up to about 3 minutes, so they use JCPENNEY_REVIEWS_TIMEOUT.

/** Minimum request timeout (ms) for every jcpenney call except reviews() and questions(). */
export const JCPENNEY_TIMEOUT = 120_000;

/** Minimum request timeout (ms) for jcpenney.reviews() and jcpenney.questions(). */
export const JCPENNEY_REVIEWS_TIMEOUT = 240_000;

/** reviews() sorts: the review list's own sort menu. most_recent is the default. */
export type JcpenneyReviewSort =
  | "most_recent"
  | "most_helpful"
  | "highest_rating"
  | "lowest_rating"
  | "relevance";

/** Listing sorts. relevance is the site's default order. */
export type JcpenneySort =
  | "relevance"
  | "new_arrivals"
  | "best_sellers"
  | "rating"
  | "price_low_to_high"
  | "price_high_to_low";

/**
 * deals() lists: clearance (default), sale, black_friday, big_buy,
 * limited_time_special, best_value, gotta_have_it, closeout, bogo (every Buy 1
 * Get 1 offer).
 */
export type JcpenneyDealType =
  | "clearance"
  | "sale"
  | "black_friday"
  | "big_buy"
  | "limited_time_special"
  | "best_value"
  | "gotta_have_it"
  | "closeout"
  | "bogo";

/** Filters and paging shared by search(), category(), brand() and deals(). */
export interface JcpenneyGridOptions {
  /** Results page, 1-based (48 items per page, at most 25 pages). Defaults to 1. */
  page?: number;
  /**
   * relevance (default), new_arrivals, best_sellers, rating (highest rated
   * first), price_low_to_high or price_high_to_low. The price orders are
   * JCPenney's own and loose: sort the items yourself for a strict order.
   */
  sort?: JcpenneySort;
  /** Only this color (or any of several), as the Color facet lists it (black, blue, beige...). */
  color?: string | string[];
  /** Only this size (or any of several), as the Size facet lists it (m, 12, 32x30...). */
  size?: string | string[];
  /** A Price Range facet value ("under $5", "$20 - $24"...). */
  price_range?: string | string[];
  /**
   * Any facet from a previous response: { facets[].id: facets[].values[].value,
   * or a list of values (any of them) }, e.g. { gender: "women" },
   * { store_availability: "same day pickup" }. Several facets combine (AND).
   */
  filters?: Record<string, string | number | Array<string | number>>;
}

export interface JcpenneySearchOptions extends JcpenneyGridOptions {
  /** Search keywords, e.g. "jeans". */
  query: string;
  /** Only this brand (or any of several), as the Brand facet lists it ("levi's", "nike"). */
  brand?: string | string[];
  /** Only items with this Deals & Promotions label ("SALE", "CLEARANCE", "BIG BUY!"...). */
  deal?: string | string[];
  /**
   * JCPenney narrows many keywords to a category on its own (visible in
   * applied_filters). true searches the keyword across every category instead.
   */
  exact?: boolean;
  [key: string]: unknown;
}

export interface JcpenneyProductOptions {
  /** A JCPenney product id (ppr / ppm / pp + digits), e.g. "ppr5008604049". */
  product_id?: string;
  /** A jcpenney.com product URL (its product id is used). Alternative to product_id. */
  url?: string;
  /** Up to 20 product ids in one call (still 1 credit). Batch results carry no online stock. */
  product_ids?: string[];
  [key: string]: unknown;
}

export interface JcpenneyCategoryOptions extends JcpenneyGridOptions {
  /** A JCPenney category path with its id=cat... part, e.g. "/g/women/dresses?id=cat100210008". */
  path?: string;
  /** A jcpenney.com category URL. Filters, a sort or a page in the URL are kept. */
  url?: string;
  /** Only this brand (or any of several), as the Brand facet lists it. */
  brand?: string | string[];
  /** Only items with this Deals & Promotions label. */
  deal?: string | string[];
  [key: string]: unknown;
}

export interface JcpenneyBrandOptions extends JcpenneyGridOptions {
  /** A brand name as JCPenney lists it in the Brand facet, e.g. "Nike", "St. John's Bay". */
  brand?: string;
  /** A jcpenney.com brand page URL (its assortment can differ slightly from the brand name listing). */
  url?: string;
  /** Only items with this Deals & Promotions label. */
  deal?: string | string[];
  [key: string]: unknown;
}

export interface JcpenneyDealsOptions extends JcpenneyGridOptions {
  /** clearance (default), sale, black_friday, big_buy, limited_time_special, best_value, gotta_have_it, closeout or bogo. */
  type?: JcpenneyDealType;
  /** Any Deals & Promotions label verbatim from a previous response's facets, instead of type, e.g. "BUY 1 GET 1 50% OFF". */
  label?: string;
  /** Limit the deal to one department or category id (dept... / cat...), e.g. "dept20000011". */
  department?: string;
  /** Only this brand (or any of several), as the Brand facet lists it. */
  brand?: string | string[];
  [key: string]: unknown;
}

/** One location: zip, city + state, or lat + lng. */
export interface JcpenneyStoresOptions {
  /** US or Puerto Rico ZIP code to search around, e.g. "75024". */
  zip?: string | number;
  /** City (with state), instead of zip, e.g. "Austin". */
  city?: string;
  /** 2-letter state code (with city), e.g. "TX". */
  state?: string;
  /** Latitude (with lng), instead of zip. */
  lat?: number;
  /** Longitude (with lat). */
  lng?: number;
  /** Search radius in miles, 1-100. Defaults to 25. */
  radius?: number;
  /** Results page, 1-based. Defaults to 1. */
  page?: number;
  /** Stores per page, 1-20. Defaults to 10. */
  page_size?: number;
  [key: string]: unknown;
}

export interface JcpenneyStoreAvailabilityOptions {
  /** A JCPenney SKU id: a product's variants[].sku (or a search result's sku_id), e.g. "84630160042". */
  sku: string | number;
  /** US or Puerto Rico ZIP code: the 5 nearest stores are checked, e.g. "90012". */
  zip?: string | number;
  /** Latitude (with lng), instead of zip. */
  lat?: number;
  /** Longitude (with lat). */
  lng?: number;
  /** Search radius in miles. Defaults to 25. */
  radius?: number;
  /** Drop the stores (of the 5 nearest) that have none. */
  in_stock_only?: boolean;
  [key: string]: unknown;
}

export interface JcpenneySuggestionsOptions {
  /** What the shopper has typed so far, e.g. "jea". */
  query: string;
  [key: string]: unknown;
}

export interface JcpenneyCouponsOptions {
  [key: string]: unknown;
}

/** Pass product_id or url. */
export interface JcpenneyReviewsOptions {
  /** A JCPenney product id (ppr / ppm / pp + digits), e.g. "ppr5008604049". */
  product_id?: string;
  /** A jcpenney.com product URL (its product id is used). Alternative to product_id. */
  url?: string;
  /** most_recent (default), most_helpful, highest_rating, lowest_rating or relevance. */
  sort?: JcpenneyReviewSort;
  /** Only reviews with this star rating (1-5). A rating nobody gave returns an empty list. */
  rating?: number;
  /**
   * Reviews to return, 8-98. Defaults to 38. JCPenney loads 8, then 30 more
   * per page, so 8, 38, 68 and 98 are the natural sizes; larger values take
   * longer.
   */
  max_reviews?: number;
  [key: string]: unknown;
}

/** Pass product_id or url. */
export interface JcpenneyQuestionsOptions {
  /** A JCPenney product id (ppr / ppm / pp + digits), e.g. "ppr5008212471". */
  product_id?: string;
  /** A jcpenney.com product URL (its product id is used). Alternative to product_id. */
  url?: string;
  /** Questions to return, 10-50 (10 per page). Defaults to 10. */
  max_questions?: number;
  [key: string]: unknown;
}

export class JcpenneyNamespace {
  constructor(private client: Scavio) {}

  private post(
    path: string,
    options: object = {},
    timeout: number = JCPENNEY_TIMEOUT,
  ): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/jcpenney/${path}`, options, undefined, timeout);
  }

  /**
   * Search jcpenney.com (US) by keyword, filtered by brand, color, size, price
   * range, deal label and any facet value, sorted by relevance, new arrivals,
   * best sellers, rating or price. 48 products per page (at most 25 pages),
   * each with id, title, brand, URL, image, sku_id, price and price_max,
   * regular_price and regular_price_max, price_type (sale, clearance,
   * original), percent_off, deal_label, coupon_price with coupon_code (the
   * price after today's coupon), rating, review_count, badge,
   * availability_label, colors with their SKU ids, and is_marketplace with the
   * seller. Also total, page, total_pages, the sort applied, applied_filters
   * and every facet (values feed filters). corrected_query says when the site
   * autocorrected the keyword; redirected_to says where a keyword (doorbusters)
   * was sent.
   *
   * Costs 1 credit.
   */
  async search(options: JcpenneySearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One jcpenney.com product by id or URL, or up to 20 by product_ids: title,
   * brand, description, features, category and breadcrumbs, images, average
   * rating, review_count, question and answer counts (review text and Q&A:
   * reviews() and questions()), the price block (regular, sale and clearance min / max ranges,
   * percent off, price type, deal label, the after-coupon price with its code,
   * the price window), channel, in-store pickup, marketplace flag, and every
   * variant (sku, UPC, color, size, options, status, max per order, online
   * stock level high / low / out). Prices are product-level ranges: JCPenney
   * does not expose a price per size or color. An unknown id is a 404.
   *
   * Costs 1 credit.
   */
  async product(options: JcpenneyProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Browse one JCPenney category by its /g/ path or URL (the path carries its
   * id=cat...), with the same filters, sorts and item fields as search(). Also
   * the category's name, id, path, URL and breadcrumbs. A department page
   * (dept...) lists no products by itself: it needs a deal or another filter.
   *
   * Costs 1 credit.
   */
  async category(options: JcpenneyCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * Every JCPenney product of one brand by name or a brand page URL, with the
   * same filters, sorts and item fields as search() (except brand). An
   * unknown brand is a 404.
   *
   * Costs 1 credit.
   */
  async brand(options: JcpenneyBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * JCPenney deal listings across all products or one department: Clearance
   * (default), Sale, Black Friday deals, Big Buy, Limited Time Special, Best
   * Value, Gotta Have It, Closeout, Buy 1 Get 1, or any Deals & Promotions
   * label, with the same filters, sorts and item fields as search(). To track
   * clearance prices over time, poll and store your own: there is no price
   * history.
   *
   * Costs 1 credit.
   */
  async deals(options: JcpenneyDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * JCPenney stores near a ZIP code, a city + state or a point (lat + lng),
   * within 25 miles by default (up to 100), paged: store_id, name, address,
   * phone, lat / lng, distance in miles, weekly opening hours, timezone,
   * services (Curbside Pickup, salon, portrait studio, JCPenney Beauty...),
   * curbside and in-store pickup directions, bookable appointments and the
   * store page URL. Puerto Rico stores included.
   *
   * Costs 1 credit.
   */
  async stores(options: JcpenneyStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * Real unit counts for one JCPenney SKU at the 5 nearest stores to a ZIP
   * code (or lat + lng): per store quantity, status (in_stock, low,
   * out_of_stock, not_stocked), updated_at, and the store's address, phone,
   * distance and hours. Also stores_with_stock and total_quantity. Take sku
   * from product() variants[].sku.
   *
   * Costs 1 credit.
   */
  async storeAvailability(options: JcpenneyStoreAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.post("store-availability", options);
  }

  /**
   * The jcpenney.com search-box suggestions for a partial query: keyword
   * completions with their search URL and, where JCPenney offers them,
   * department refinements.
   *
   * Costs 1 credit.
   */
  async suggestions(options: JcpenneySuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Today's public JCPenney coupons: code (null for in-store offers that need
   * none), channel (online, in store or both), headline and details, start
   * and end dates, the disclaimer with its exclusions and the URL of the
   * eligible products. Public codes only.
   *
   * Costs 1 credit.
   */
  async coupons(options: JcpenneyCouponsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("coupons", options);
  }

  /**
   * Real customer review text of one jcpenney.com (US) product by id or URL,
   * up to 98 per call (default 38), sorted most recent (default), most
   * helpful, highest or lowest rating, or relevance, optionally only one star
   * rating. Returns total_reviews (every language), displayed_reviews (the
   * English reviews JCPenney lists, often fewer), average_rating,
   * rating_distribution (1-5), recommended_percent,
   * secondary_ratings_averages (Quality, Value...), photo_count and
   * matching_reviews for the sort and filter. Each review has id, rating,
   * title, text, author nickname, location, submitted_at and updated_at,
   * recommended, helpful and unhelpful votes, verified_purchaser and
   * incentivized badges, syndicated with syndication_source (the brand site it
   * came from), photos, videos, secondary ratings, the brand's public response
   * and the original product name. Reviewer age, gender and IP are never
   * returned. Usually takes 15-90 s, up to about 3 minutes (request timeout
   * raised to JCPENNEY_REVIEWS_TIMEOUT); failed calls are not charged. A
   * product with no reviews returns an empty list; an unknown product is a
   * 404.
   *
   * Costs 1 credit.
   */
  async reviews(options: JcpenneyReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options, JCPENNEY_REVIEWS_TIMEOUT);
  }

  /**
   * Customer questions and every answer for one jcpenney.com (US) product by
   * id or URL, up to 50 questions per call (default 10), newest answers first
   * (no sort option). Returns total_questions and total_answers. Each
   * question has id, question, details, author, submitted_at, answer_count
   * and helpful_votes; each answer has id, text, author, author_type (brand
   * for the manufacturer's product experts, retailer for JCPenney staff, ai
   * for AI-generated answers, customer), ai_label (AI-Generated / AI-Assisted
   * when JCPenney labels it), is_best_answer, submitted_at and helpful /
   * unhelpful votes. Answerer IPs are never returned. Usually takes 15-90 s,
   * up to about 3 minutes (request timeout raised to
   * JCPENNEY_REVIEWS_TIMEOUT); failed calls are not charged.
   *
   * Costs 1 credit.
   */
  async questions(options: JcpenneyQuestionsOptions): Promise<Record<string, unknown>> {
    return this.post("questions", options, JCPENNEY_REVIEWS_TIMEOUT);
  }
}
