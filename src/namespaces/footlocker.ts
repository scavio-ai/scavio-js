import type { Scavio } from "../client.js";

// Foot Locker: 10 endpoints, footlocker.com + 12 country storefronts (local
// currency), 1 credit each.
//
// search(), product(), category(), brand() and deals() take country (13
// storefronts, us when omitted on the server) and language (ca: en / fr,
// be: nl / fr); releases() covers us, ca and gb; stores(),
// storeAvailability(), reviews() and questions() are US only. product(),
// storeAvailability(), reviews() and questions() take product_id or url;
// category() takes path, url or collection_id; brand() takes brand or url;
// stores() takes zip, city + state or lat + lng; storeAvailability() takes
// zip or lat + lng. The server enforces these. Every call raises the request
// timeout to FOOTLOCKER_TIMEOUT when the client's is shorter, except
// reviews() and questions(): they usually take 25-90 s, up to about 3-4
// minutes, so they use FOOTLOCKER_REVIEWS_TIMEOUT.

/** Minimum request timeout (ms) for every footlocker call except reviews() and questions(). */
export const FOOTLOCKER_TIMEOUT = 120_000;

/** Minimum request timeout (ms) for footlocker.reviews() and footlocker.questions(). */
export const FOOTLOCKER_REVIEWS_TIMEOUT = 240_000;

/**
 * Storefronts: us (footlocker.com, USD, default), ca (CAD), gb (GBP), de, fr,
 * it, es, nl, be, at, ie (EUR), au (AUD), nz (NZD). Titles come in the
 * storefront's language, prices in its currency.
 */
export type FootlockerCountry = "us" | "ca" | "gb" | "de" | "fr" | "it" | "es" | "nl" | "be" | "at" | "ie" | "au" | "nz";

/** Only for ca (en default, fr) and be (nl default, fr). */
export type FootlockerLanguage = "en" | "fr" | "nl";

/** releases() storefronts: us (default), ca, gb. */
export type FootlockerReleaseCountry = "us" | "ca" | "gb";

/** Listing sorts; relevance is the site's Featured order (default). */
export type FootlockerSort =
  | "relevance"
  | "price_low_to_high"
  | "price_high_to_low"
  | "new_arrivals"
  | "top_rated"
  | "name_az"
  | "brand_az";

/** deals() lists: sale (default; every storefront), exclusives (us and ca only), discount_eligible (items a promo code applies to). */
export type FootlockerDealType = "sale" | "exclusives" | "discount_eligible";

/** releases() status: all (default), upcoming (launch date ahead) or launched. */
export type FootlockerReleaseStatus = "all" | "upcoming" | "launched";

/** reviews() sorts. */
export type FootlockerReviewSort = "most_recent" | "most_helpful" | "highest_rating" | "lowest_rating" | "relevance";

/** Storefront and language, shared by search(), product(), category(), brand() and deals(). */
export interface FootlockerMarketOptions {
  /** The storefront (us when omitted). Titles come in its language, prices in its currency. */
  country?: FootlockerCountry;
  /** Only for ca (en default, fr) and be (nl default, fr). */
  language?: FootlockerLanguage;
}

/** Filters and paging shared by search(), category(), brand() and deals(). */
export interface FootlockerGridOptions extends FootlockerMarketOptions {
  /** Results page, 1-based (48 items per page, up to 200). A page past the last one returns an empty items list with the real total. Defaults to 1. */
  page?: number;
  /** relevance (the site's Featured order, default), price_low_to_high, price_high_to_low, new_arrivals, top_rated, name_az or brand_az. */
  sort?: FootlockerSort;
  /** Gender filter value(s) as facets.gender lists them ("Men's", "Women's"; in the storefront's language). */
  gender?: string | string[];
  /** Color filter value(s) as facets.primaryColor lists them, e.g. "Black". */
  color?: string | string[];
  /** Price bucket value(s) as facets.price lists them (25-50, 50-75, 75-100, 100-150, 150-inf). */
  price_range?: string | string[];
  /** Only items on sale. */
  on_sale?: boolean;
  /**
   * Any filter from a previous response: { facets[].id: facets[].values[].value,
   * or a list of values }. Values of one filter are OR, filters combine (AND),
   * e.g. { mensShoesSize: "10.0" }, { style: "Casual Sneakers" }, { sport: "Running" }.
   */
  filters?: Record<string, string | number | boolean | Array<string | number>>;
}

/** Pass product_id or url. */
export interface FootlockerProductTarget {
  /** A Foot Locker SKU: a search result's id, the last part of a product URL (Q5495005 in the US, 12 digits such as 316707025504 in Europe). */
  product_id?: string;
  /** A Foot Locker product URL on any covered storefront (its storefront and SKU are used). Alternative to product_id. */
  url?: string;
}

/** US store search area: pass zip or lat + lng. */
export interface FootlockerWhereOptions {
  /** US ZIP code to search around, e.g. "10001". */
  zip?: string | number;
  /** Latitude (with lng), instead of zip. */
  lat?: number;
  /** Longitude (with lat). */
  lng?: number;
  /** Search radius in miles, 1-120. Defaults to 25. */
  radius?: number;
  /** Stores to return, nearest first, 1-50. Defaults to 10. */
  limit?: number;
  /** us only. */
  country?: "us";
}

export interface FootlockerSearchOptions extends FootlockerGridOptions {
  /** Search keywords, e.g. "nike dunk". */
  query: string;
  /** Only this brand (or any of several), e.g. "Nike", "Jordan", "HOKA"; case does not matter. */
  brand?: string | string[];
  [key: string]: unknown;
}

export interface FootlockerProductOptions extends FootlockerProductTarget, FootlockerMarketOptions {
  [key: string]: unknown;
}

/** Pass path, url or collection_id. */
export interface FootlockerCategoryOptions extends FootlockerGridOptions {
  /** A Foot Locker category page path (/category/<path>.html), e.g. "/category/mens/shoes.html". */
  path?: string;
  /** A Foot Locker category URL (its storefront and page are used). */
  url?: string;
  /** A collection id: a previous response's category.id, e.g. "men-s-shoes". */
  collection_id?: string;
  /** Only this brand (or any of several); case does not matter. */
  brand?: string | string[];
  [key: string]: unknown;
}

/** Pass brand or url. */
export interface FootlockerBrandOptions extends FootlockerGridOptions {
  /** A brand name, e.g. "Nike", "Jordan", "adidas", "New Balance", "HOKA"; case does not matter. An unknown brand is a 404. */
  brand?: string;
  /** A Foot Locker brand page URL (/category/brands/<brand>.html). Alternative to brand. */
  url?: string;
  /** Narrow the brand to a keyword, e.g. "running shoes". */
  query?: string;
  [key: string]: unknown;
}

export interface FootlockerDealsOptions extends FootlockerGridOptions {
  /** sale (default; every storefront), exclusives (us and ca only) or discount_eligible. */
  type?: FootlockerDealType;
  /** Only this brand (or any of several); case does not matter. */
  brand?: string | string[];
  [key: string]: unknown;
}

export interface FootlockerReleasesOptions {
  /** us (default), ca or gb. */
  country?: FootlockerReleaseCountry;
  /** ca only: en (default) or fr. */
  language?: "en" | "fr";
  /** all (default), upcoming (launch date ahead) or launched. */
  status?: FootlockerReleaseStatus;
  /** Only releases launching on or after this ISO date, e.g. "2026-11-01". */
  from?: string;
  /** Only releases launching on or before this ISO date, e.g. "2026-12-31". */
  to?: string;
  /** Only this brand, e.g. "Nike" (case does not matter). */
  brand?: string;
  [key: string]: unknown;
}

/** Pass zip, city + state, or lat + lng. */
export interface FootlockerStoresOptions extends FootlockerWhereOptions {
  /** US city (with state), instead of zip, e.g. "Atlanta". */
  city?: string;
  /** 2-letter US state code (with city), e.g. "GA". */
  state?: string;
  [key: string]: unknown;
}

/** Pass product_id or url, plus zip or lat + lng. */
export interface FootlockerStoreAvailabilityOptions extends FootlockerProductTarget, FootlockerWhereOptions {
  /** One size as product() sizes[].size lists it (10.0, 10, XL). Without it, every size. */
  size?: string | number;
  [key: string]: unknown;
}

/** Pass product_id or url. */
export interface FootlockerReviewsOptions extends FootlockerProductTarget {
  /** us only. */
  country?: "us";
  /** most_recent (default), most_helpful, highest_rating, lowest_rating or relevance. */
  sort?: FootlockerReviewSort;
  /** Only reviews with this many stars (1-5). */
  rating?: number;
  /** Reviews to return, 1-98. Defaults to 38. More reviews take longer (about 4 s per 30). */
  limit?: number;
  [key: string]: unknown;
}

/** Pass product_id or url. */
export interface FootlockerQuestionsOptions extends FootlockerProductTarget {
  /** us only. */
  country?: "us";
  /** Questions to return, 1-50. Defaults to 10. */
  limit?: number;
  [key: string]: unknown;
}

export class FootlockerNamespace {
  constructor(private client: Scavio) {}

  private post(
    path: string,
    options: object = {},
    timeout: number = FOOTLOCKER_TIMEOUT,
  ): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/footlocker/${path}`, options, undefined, timeout);
  }

  /**
   * Search Foot Locker by keyword on any of 13 storefronts, filtered by
   * brand, gender, color, price bucket, on_sale and any facet (shoe size per
   * gender, style, sport...), sorted by relevance, price, new arrivals, top
   * rated, name or brand. 48 items per page, each with id (the SKU),
   * base_product, title, brand, URL, image, price, list_price, percent_off,
   * lowest_price_30d (European storefronts), on_sale, is_new, is_launch,
   * member_only_sale, rating, review_count, color_count and colors. Also
   * total, page, page_size, total_pages, the sort applied, applied_filters,
   * every facet (values feed filters), country, language, currency and
   * data_as_of: listings can be a few hours old. A bare brand keyword (nike,
   * hoka) returns that brand's listing and redirected_to says which; a
   * keyword the site sends to a landing page without a product listing is an
   * unbilled 400 (use brand(), category() or deals()).
   *
   * Costs 1 credit.
   */
  async search(options: FootlockerSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Foot Locker product by SKU or URL on any of the 13 storefronts:
   * title, brand, description, genders, sports, category, color, style code,
   * images, rating, review_count, the price block (price, list_price,
   * percent_off, lowest_price_30d), availability online / to ship / for
   * pickup, launch info, flags, the size chart, every colorway (sku, color,
   * price, availability) and every size: available, ship, pickup,
   * stores_available (a store count, not units), UPC and store SKU.
   * Availability is yes / no per size: Foot Locker publishes no unit counts.
   * A SKU without an online page is a 404 (charged).
   *
   * Costs 1 credit.
   */
  async product(options: FootlockerProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Browse one Foot Locker category by its page path, URL or collection id,
   * in the site's order by default, with the same filters, sorts and item
   * fields as search(). Also the category's id (collection id), name, path
   * and URL. An unknown category is a 404 (charged).
   *
   * Costs 1 credit.
   */
  async category(options: FootlockerCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * Every Foot Locker product of one brand by name (any case) or brand page
   * URL, optionally narrowed by a keyword, with the same filters, sorts and
   * item fields as search() (except brand). brand echoes the brand as the
   * site writes it, brand_id its id. An unknown brand is a 404 (charged).
   *
   * Costs 1 credit.
   */
  async brand(options: FootlockerBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * Foot Locker deal listings: sale (default; every storefront), Foot Locker
   * Exclusives (us and ca only) or discount_eligible (the items a promo code
   * applies to), with the same filters, sorts and item fields as search().
   * No price history: to track prices over time, poll and store your own.
   *
   * Costs 1 credit.
   */
  async deals(options: FootlockerDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * The Foot Locker sneaker release calendar as monitoring data (us, ca,
   * gb): sku, title, brand, colorway (style), style_code, gender, launch_at,
   * online_at, heat_level, in_stock, image, url, retail_price and currency
   * (us and ca; gb has no prices), the reservation status and windows where
   * the storefront runs them (not on gb) and sizes (us, eu, uk,
   * participating channels). Also total, count and data_as_of. Read-only:
   * nothing here enters, reserves or buys a release.
   *
   * Costs 1 credit.
   */
  async releases(options: FootlockerReleasesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("releases", options);
  }

  /**
   * Foot Locker stores near a US ZIP code, a city + state or a point,
   * nearest first (up to 50, default 10): store_id, name, name_secondary,
   * address, city, state, ZIP, phone, lat / lng, distance_miles, weekly
   * hours, opened_at, alert and closure notices, and the store page URL.
   * Foot Locker banner stores only (no Kids Foot Locker or Champs). US only.
   *
   * Costs 1 credit.
   */
  async stores(options: FootlockerStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * Which Foot Locker stores near a US ZIP code or a point show a product
   * (or one size) as available: each store with available and
   * sizes_available, plus per size whether it ships online, can be picked up
   * and in how many of the listed stores it shows (stores_in_results), and
   * stores_with_availability. Yes / no only: Foot Locker publishes no unit
   * counts. Foot Locker banner stores only. US only.
   *
   * Costs 1 credit.
   */
  async storeAvailability(options: FootlockerStoreAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.post("store-availability", options);
  }

  /**
   * Customer reviews of one Foot Locker (US) product by SKU or URL, 1-98
   * per call (default 38), with sort and a star filter, plus the review
   * statistics (total_reviews, displayed_reviews, average_rating,
   * rating_distribution, recommended_percent, secondary rating averages,
   * photo_count) and matching_reviews. Each review has id, rating, title,
   * text, author, submitted_at, recommended, helpful and unhelpful votes,
   * verified_purchaser, incentivized, syndicated and its source, secondary
   * ratings, photos, videos and the brand's response. Usually takes 25-90 s,
   * up to about 3-4 minutes (request timeout raised to
   * FOOTLOCKER_REVIEWS_TIMEOUT); failed calls are not charged.
   *
   * Costs 1 credit.
   */
  async reviews(options: FootlockerReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options, FOOTLOCKER_REVIEWS_TIMEOUT);
  }

  /**
   * Shopper questions about one Foot Locker (US) product by SKU or URL, 1-50
   * per call (default 10), newest answered first, with every answer (text,
   * author, author_type: brand, retailer or customer, best-answer flag, date
   * and votes). Also total_questions. Usually takes 25-90 s, up to about 3-4
   * minutes (request timeout raised to FOOTLOCKER_REVIEWS_TIMEOUT); failed
   * calls are not charged.
   *
   * Costs 1 credit.
   */
  async questions(options: FootlockerQuestionsOptions): Promise<Record<string, unknown>> {
    return this.post("questions", options, FOOTLOCKER_REVIEWS_TIMEOUT);
  }
}
