import type { Scavio } from "../client.js";

// Macy's: 9 endpoints, macys.com (US only, USD), 1 credit each.
//
// product() takes product_id, url or product_ids (up to 10, Macy's summary
// view); reviews() and storeAvailability() take product_id or url; category()
// takes category_id or url; brand() takes brand_id or url; stores() takes one
// location (zip, lat + lng, or city + state); storeAvailability() takes
// store_id OR a location, not both. The server enforces these. Store
// availability is pickup / in-store flags: Macy's publishes no unit counts.
// Every call raises the request timeout to MACYS_TIMEOUT when the client's is
// shorter.

/** Minimum request timeout (ms) for every macys call. */
export const MACYS_TIMEOUT = 120_000;

/** Listing sorts. The total can differ between sorts, as it does on the site. */
export type MacysSort =
  | "featured"
  | "price_low_to_high"
  | "price_high_to_low"
  | "top_rated"
  | "best_sellers"
  | "newest";

export type MacysReviewSort = "newest" | "highest_rated" | "lowest_rated" | "with_photos";

/** The SPECIAL_OFFERS facet values. */
export type MacysSpecialOffer =
  | "limited_time_special"
  | "gift_with_purchase"
  | "black_friday_deal"
  | "clearance"
  | "last_act"
  | "our_lowest_price"
  | "sales_and_discounts"
  | "special_offer"
  | "today_only";

/** deals() pages: sale (all Sales & Offers, default), clearance, today_only, last_act, limited_time_special, black_friday. */
export type MacysDealType =
  | "sale"
  | "clearance"
  | "today_only"
  | "last_act"
  | "limited_time_special"
  | "black_friday";

/** Filters shared by search(), category(), brand() and deals(). */
export interface MacysGridOptions {
  /** Results page, 1-based (60 organic items per page). Defaults to 1. */
  page?: number;
  /** featured (default), price_low_to_high, price_high_to_low, top_rated, best_sellers or newest. */
  sort?: MacysSort;
  /** Only these brands, spelled as the BRAND facet lists them (e.g. "Levi's"). An array matches any of them. */
  brand?: string | string[];
  /** Only these colors, as the COLOR_NORMAL facet lists them (Black, Blue, Red...). An array matches any of them. */
  color?: string | string[];
  /** Minimum price in USD. Any bound works, not only the site's buckets. */
  min_price?: number;
  /** Maximum price in USD. */
  max_price?: number;
  /** Only items available for pickup at this store (a store_id from stores()), e.g. 4592. */
  pickup_store_id?: number | string;
  /** Any other facet from a previous response's facets: its name to one value or a list, e.g. { GENDER: "Women" }. */
  filters?: Record<string, string | string[]>;
  /** Keep ad-only sponsored tiles (flagged is_sponsored). Defaults to false: they are dropped. */
  include_sponsored?: boolean;
}

export interface MacysSearchOptions extends MacysGridOptions {
  /** Search keywords, e.g. "jeans". */
  query: string;
  /** Only items with this offer. An array matches any of them. */
  special_offer?: MacysSpecialOffer | MacysSpecialOffer[];
  [key: string]: unknown;
}

export interface MacysProductOptions {
  /** Macy's product id: a search result's id, or the ID= number in a macys.com product URL, e.g. 25822310. */
  product_id?: number | string;
  /** A macys.com product URL (its ID= is used). Alternative to product_id. */
  url?: string;
  /** Up to 10 product ids in one call (an array or a comma-separated string), instead of product_id / url. */
  product_ids?: Array<number | string> | string;
  [key: string]: unknown;
}

export interface MacysReviewsOptions {
  /** Macy's product id, e.g. 25822310. */
  product_id?: number | string;
  /** A macys.com product URL. Alternative to product_id. */
  url?: string;
  /** newest (default), highest_rated, lowest_rated or with_photos. */
  sort?: MacysReviewSort;
  /** Page, 1-based. Defaults to 1. */
  page?: number;
  /** Reviews per page, 1-100. Defaults to 20. */
  limit?: number;
  /** Only reviews with this star rating. */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Only reviews mentioning this text, e.g. "soft". */
  query?: string;
  [key: string]: unknown;
}

export interface MacysCategoryOptions extends MacysGridOptions {
  /** Macy's category id: the id= of a macys.com /shop/ URL, a product's categories[].id, or a search's redirected_to_category.id, e.g. 3763. */
  category_id?: number | string;
  /** A macys.com category URL with its id=. Filters, page and sort already in the URL are kept. */
  url?: string;
  /** Only items with this offer. An array matches any of them. */
  special_offer?: MacysSpecialOffer | MacysSpecialOffer[];
  [key: string]: unknown;
}

export interface MacysBrandOptions extends MacysGridOptions {
  /** The brand page id: a product's brand_page_id, or the id= of a macys.com /shop/brands/ URL, e.g. 337747 (Calvin Klein). */
  brand_id?: number | string;
  /** A macys.com brand page URL with its id=. */
  url?: string;
  /** Only items with this offer. An array matches any of them. */
  special_offer?: MacysSpecialOffer | MacysSpecialOffer[];
  [key: string]: unknown;
}

export interface MacysDealsOptions extends MacysGridOptions {
  /** sale (all Sales & Offers, default), clearance, today_only, last_act, limited_time_special or black_friday. */
  type?: MacysDealType;
  [key: string]: unknown;
}

/** One location: zip, lat + lng, or city + state. */
export interface MacysLocationOptions {
  /** US ZIP code, e.g. "10001". */
  zip?: string | number;
  /** Latitude (with lng), instead of zip. */
  lat?: number;
  /** Longitude (with lat). */
  lng?: number;
  /** US city (with state), instead of zip, e.g. "Atlanta". */
  city?: string;
  /** 2-letter US state code (with city), e.g. "GA". */
  state?: string;
  /** Search radius in miles, 1-100. Defaults to 100. */
  radius?: number;
}

export interface MacysStoresOptions extends MacysLocationOptions {
  [key: string]: unknown;
}

export interface MacysStoreAvailabilityOptions extends MacysLocationOptions {
  /** Macy's product id, e.g. 25822310. */
  product_id?: number | string;
  /** A macys.com product URL. Alternative to product_id. */
  url?: string;
  /** One store (a store_id from stores()) for per-variant pickup and in-store flags, instead of a location, e.g. 4592. */
  store_id?: number | string;
  [key: string]: unknown;
}

export interface MacysSuggestionsOptions {
  /** What the shopper has typed so far, e.g. "jea". */
  query: string;
  [key: string]: unknown;
}

export class MacysNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object = {}): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/macys/${path}`, options, undefined, MACYS_TIMEOUT);
  }

  /**
   * Search macys.com (US) by keyword, filtered by brand, color, special offer
   * (clearance, Last Act, Today Only, Black Friday deal...), any price range,
   * a pickup store and any other facet, sorted by featured, price, top rated,
   * best sellers or newest. 60 organic items per page, each with id, title,
   * brand, URL, image, price (price_max when the item sells at a range),
   * regular and sale price, percent off, price label, on-sale flag, sale end
   * date, deal label, promotions, rating, review count, colors and
   * is_sponsored. Also total, page, total_pages, the sort applied, the facets
   * (values with counts; any value works in filters) and applied_filters.
   * Ad-only sponsored tiles are dropped (sponsored_dropped counts them) unless
   * include_sponsored; organic items that also hold a paid slot stay, flagged
   * is_sponsored. Totals can differ between sorts. A keyword the site maps to
   * a category comes back with redirected_to_category.
   *
   * Costs 1 credit.
   */
  async search(options: MacysSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One macys.com product by id or URL, or up to 10 by product_ids in one
   * call: title, brand (with brand_page_id for brand()), description,
   * bullets, category path, price block with sale end, promotions, rating,
   * review_count and text_review_count (ratings without text count in
   * review_count only), rating_distribution, fit slider, AI review summary,
   * images, colors with their prices, sizes and every variant (UPC, color,
   * size, available, availability message, low-stock flag, ship days). A
   * collection member's id answers with the collection product (requested_id
   * echoes the id asked for). In a batch, unknown ids are listed in not_found
   * and Macy's serves its summary view: no rating histogram, and a collection
   * without its members' variants. An unknown id is a 404.
   *
   * Costs 1 credit.
   */
  async product(options: MacysProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Customer reviews of one macys.com product by id or URL, newest (default),
   * highest rated, lowest rated or with photos first, up to 100 per page,
   * optionally one star rating or a word: rating, title, text, date,
   * nickname, location, recommended, helpful votes, incentivized and
   * syndicated flags, badges, slider ratings, photos and the brand's
   * response. total counts written reviews only: ratings without text are
   * not returned (product() has the full rating histogram).
   *
   * Costs 1 credit.
   */
  async reviews(options: MacysReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * Browse one macys.com category by id or URL, with the same filters, sorts
   * and item fields as search(). Also the category's id, name and URL. An
   * unknown id is a 404.
   *
   * Costs 1 credit.
   */
  async category(options: MacysCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * Browse one brand's macys.com page by its page id or URL (a product's
   * brand_page_id), with the same filters, sorts and item fields as search().
   * Also the brand's page id, name and URL. To filter by brand name instead,
   * use search() with brand.
   *
   * Costs 1 credit.
   */
  async brand(options: MacysBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * Macy's sale listings: all Sales & Offers (default), Clearance, Today
   * Only, Last Act (final-sale markdowns), Limited-Time Specials or Black
   * Friday Deals, with the same filters, sorts and item fields as search()
   * (except special_offer). sale_ends carries the end date when Macy's
   * states one.
   *
   * Costs 1 credit.
   */
  async deals(options: MacysDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * Macy's stores near a US ZIP code, a point (lat + lng) or a city + state,
   * nearest first (up to 15, within 100 miles by default): store_id (what
   * storeAvailability() and pickup_store_id take), name, address, phone,
   * lat / lng, distance in miles, today's and tomorrow's hours, curbside
   * hours and the order cut-off for same-day pickup.
   *
   * Costs 1 credit.
   */
  async stores(options: MacysStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * Can a macys.com product be picked up in store? Near a location: every
   * store with available true / false and available_items_count (how many of
   * the product's items it has). At one store_id: the store's hours, pickup
   * cut-off and pickup options, and per variant (UPC, color, size)
   * pickup_available and in_store_available. Macy's publishes no unit
   * quantities. Pass store_id or a location, not both. An unknown store_id is
   * a 404.
   *
   * Costs 1 credit.
   */
  async storeAvailability(options: MacysStoreAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.post("store-availability", options);
  }

  /**
   * The macys.com search-box autocomplete for a partial query: up to 7
   * suggested searches.
   *
   * Costs 1 credit.
   */
  async suggestions(options: MacysSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
