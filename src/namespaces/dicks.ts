import type { Scavio } from "../client.js";

// Dick's Sporting Goods: 9 endpoints, dickssportinggoods.com (US, USD),
// 1 credit each except product() and reviews() (2 credits).
//
// product() and reviews() take product_id or url; products() takes 1-5
// product_ids; category() takes path, url or category_id; storeAvailability()
// takes skus (a product's variants[].sku) plus zip or lat + lng. The server
// enforces these. Prices differ per SKU (size / color): product() lists every
// variant's own price. Every call raises the request timeout to DICKS_TIMEOUT
// when the client's is shorter, except product() and reviews(): they usually
// take 20-75 s, up to about 2.5 minutes, so they use DICKS_PRODUCT_TIMEOUT.

/** Minimum request timeout (ms) for every dicks call except product() and reviews(). */
export const DICKS_TIMEOUT = 120_000;

/** Minimum request timeout (ms) for dicks.product() and dicks.reviews(). */
export const DICKS_PRODUCT_TIMEOUT = 240_000;

/**
 * Listing sorts. Search and brand default to relevance; category and deals to
 * featured (the site's merchandised order, pinned items first).
 */
export type DicksSort =
  | "relevance"
  | "top_sellers"
  | "savings"
  | "price_low_to_high"
  | "price_high_to_low"
  | "featured"
  | "new_arrivals"
  | "brand_az";

/** deals() lists: clearance (default), sale, weekly_deals (This Week's Deals). */
export type DicksDealType = "clearance" | "sale" | "weekly_deals";

/** storeAvailability() chains: dicks (default, incl. House of Sport and Going, Going, Gone!), golf_galaxy, public_lands. */
export type DicksChain = "dicks" | "golf_galaxy" | "public_lands";

/** Filters and paging shared by search(), category(), brand() and deals(). */
export interface DicksGridOptions {
  /** Results page, 1-based. A page past the last one returns an empty items list with the real total. Defaults to 1. */
  page?: number;
  /** Items per page, 1-144. Defaults to 48. */
  page_size?: number;
  /**
   * relevance, top_sellers, savings (biggest discount first),
   * price_low_to_high, price_high_to_low, featured (pinned items first),
   * new_arrivals or brand_az.
   */
  sort?: DicksSort;
  /**
   * Any facet from a previous response: { facets[].id: facets[].values[].value,
   * or a list of values }. Values of one facet are OR, facets combine (AND),
   * e.g. { "5495": "Men's" } (gender), { rating: "4+" }, { price: "50-100" }.
   */
  filters?: Record<string, string | number | Array<string | number>>;
  /** Approximate lower price bound in USD (the site's price filter is loose). */
  min_price?: number;
  /** Approximate upper price bound in USD. */
  max_price?: number;
}

export interface DicksSearchOptions extends DicksGridOptions {
  /** Search keywords, e.g. "running shoes". */
  query: string;
  /** Only this brand (or any of several), as the Brand facet lists it ("Nike", "HOKA", "YETI"). */
  brand?: string | string[];
  [key: string]: unknown;
}

/** Pass product_id or url. */
export interface DicksProductOptions {
  /** A Dick's product id: a search result's id, the last part of a product URL, e.g. "23FHQMCLFTN9GTXBLMNS". */
  product_id?: string;
  /** A dickssportinggoods.com product URL (its product id is used). Alternative to product_id. */
  url?: string;
  [key: string]: unknown;
}

export interface DicksProductsOptions {
  /** 1 to 5 Dick's product ids. Unknown ids are listed in not_found. */
  product_ids: string[];
  [key: string]: unknown;
}

/** Pass product_id or url. */
export interface DicksReviewsOptions {
  /** A Dick's product id, e.g. "26UNDMFITN1HRI9WUAETC". */
  product_id?: string;
  /** A dickssportinggoods.com product URL (its product id is used). Alternative to product_id. */
  url?: string;
  [key: string]: unknown;
}

/** Pass path, url or category_id. */
export interface DicksCategoryOptions extends DicksGridOptions {
  /** A Dick's category page path (/f/<name> or /c/<name>), e.g. "/f/mens-running-shoes". */
  path?: string;
  /** A dickssportinggoods.com category URL (filters in the URL are not read: send them in filters). */
  url?: string;
  /** A category id: a response's categories[].id or category.id, e.g. "202105". */
  category_id?: string | number;
  /** Only this brand (or any of several), as the Brand facet lists it. */
  brand?: string | string[];
  [key: string]: unknown;
}

export interface DicksBrandOptions extends DicksGridOptions {
  /** A brand name as Dick's lists it in the Brand facet, e.g. "Nike", "YETI"; case does not matter. */
  brand: string;
  /** Narrow the brand to a keyword, e.g. "tumbler". */
  query?: string;
  [key: string]: unknown;
}

export interface DicksDealsOptions extends DicksGridOptions {
  /** clearance (default), sale or weekly_deals (This Week's Deals). */
  type?: DicksDealType;
  /** Only this brand (or any of several), as the Brand facet lists it. */
  brand?: string | string[];
  [key: string]: unknown;
}

/** Pass zip or lat + lng. */
export interface DicksStoreAvailabilityOptions {
  /** 1 to 20 SKU ids from product() variants[].sku. An unknown SKU reads 0 at every store. */
  skus: string[];
  /** US ZIP code to search around, e.g. "60601". */
  zip?: string | number;
  /** Latitude (with lng), instead of zip. */
  lat?: number;
  /** Longitude (with lat). */
  lng?: number;
  /** Search radius in miles, 1-250. Defaults to 25. Up to 100 stores are returned. */
  radius?: number;
  /** dicks (default), golf_galaxy or public_lands. */
  chain?: DicksChain;
  /** Only the stores that have at least one of the SKUs. */
  in_stock_only?: boolean;
  [key: string]: unknown;
}

export interface DicksSuggestionsOptions {
  /** What the shopper has typed so far, e.g. "yeti tum". */
  query: string;
  [key: string]: unknown;
}

export class DicksNamespace {
  constructor(private client: Scavio) {}

  private post(
    path: string,
    options: object = {},
    timeout: number = DICKS_TIMEOUT,
  ): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/dicks/${path}`, options, undefined, timeout);
  }

  /**
   * Search dickssportinggoods.com (US) by keyword, filtered by brand, an
   * approximate price range and any facet, sorted by relevance, top sellers,
   * savings, price, featured, new arrivals or brand A-Z. 48 items per page by
   * default (up to 144), each with id, sku, title, brand, URL, image, price
   * and price_max, list_price and list_price_max, percent_off,
   * map_price_applies (the lowest price only shows in the cart), rating,
   * review_count, badge, sku_count, options, is_pinned and scheduled_prices
   * (the offer-price windows Dick's has planned; they can change, not a
   * forecast). Also total, page, page_size, total_pages, the sort applied,
   * applied_filters, every facet (values feed filters) and categories.
   * did_you_mean carries the spelling suggestion; redirected_to says where a
   * keyword sent to a landing page (golf balls, clearance) was followed.
   *
   * Costs 1 credit.
   */
  async search(options: DicksSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Dick's product by id or URL with every SKU: title, brand,
   * description, features, specs, attributes, category, images, rating,
   * review_count, question and answer counts, the price block (min, max,
   * list_min, list_max, percent_off, map_price_applies), clearance flag,
   * option axes and every variant (sku, UPC, options, color, size, price,
   * list_price, percent_off, map_price_applies, is_clearance, online_units,
   * buyable, ship_class, lead_time). Prices differ per SKU, so read the
   * variant you need. Usually takes 20-75 s, up to about 2.5 minutes (request
   * timeout raised to DICKS_PRODUCT_TIMEOUT); failed calls and unknown
   * products are not charged. An unknown id is a 404.
   *
   * Costs 2 credits.
   */
  async product(options: DicksProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options, DICKS_PRODUCT_TIMEOUT);
  }

  /**
   * Up to 5 Dick's products in one call: the fast style-level check of
   * title, brand, URL, image, price and list-price ranges, percent_off,
   * map_price_applies, clearance, buyable, option axes, attributes, specs,
   * product type, rating, review_count and description. No per-SKU prices or
   * units (those come from product()). Unknown ids are listed in not_found.
   *
   * Costs 1 credit.
   */
  async products(options: DicksProductsOptions): Promise<Record<string, unknown>> {
    return this.post("products", options);
  }

  /**
   * The 15 newest customer reviews of one Dick's product by id or URL, with
   * its review statistics: total, average, distribution (1-5), recommended
   * and not-recommended counts, photo count, first and last review dates,
   * question and answer counts, and secondary rating averages. Each review
   * has id, rating, title, text, pros, cons, author, submitted_at,
   * recommended, helpful and unhelpful votes, verified_purchaser,
   * incentivized, syndicated_from, secondary ratings, photos and the brand's
   * response. The newest 15 only: no paging, sort or star filter; questions
   * and answers are counts only. Usually takes 20-75 s, up to about 2.5
   * minutes (request timeout raised to DICKS_PRODUCT_TIMEOUT); failed calls
   * are not charged.
   *
   * Costs 2 credits.
   */
  async reviews(options: DicksReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options, DICKS_PRODUCT_TIMEOUT);
  }

  /**
   * Browse one Dick's category by its /f/ or /c/ path, URL or id, in the
   * site's featured order by default, with the same filters, sorts and item
   * fields as search(). Also the category's id, name, path and URL. An
   * unknown category is a 404.
   *
   * Costs 1 credit.
   */
  async category(options: DicksCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * Every Dick's product of one brand by name, optionally narrowed by a
   * keyword, with the same filters, sorts and item fields as search()
   * (except brand). An unknown brand is a 404.
   *
   * Costs 1 credit.
   */
  async brand(options: DicksBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * Dick's deal listings: Clearance (default), Sale or This Week's Deals, in
   * the site's featured order by default (sort savings for the biggest
   * discounts first), with the same filters, sorts and item fields as
   * search(). To track clearance prices over time, poll and store your own:
   * there is no price history.
   *
   * Costs 1 credit.
   */
  async deals(options: DicksDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * Store unit counts for 1-20 SKUs at up to 100 DICK'S, Golf Galaxy or
   * Public Lands stores near a ZIP code or a point, nearest first, within 25
   * miles by default (up to 250): store_id, chain, name, address, city,
   * state, ZIP, phone, lat / lng, distance_miles, weekly hours and per SKU
   * units and in_store_units. Also sku_totals and stores_with_stock. No
   * standalone store locator: store details come with a SKU lookup. Take
   * SKUs from product() variants[].sku: an unknown SKU reads 0 everywhere.
   *
   * Costs 1 credit.
   */
  async storeAvailability(options: DicksStoreAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.post("store-availability", options);
  }

  /**
   * The dickssportinggoods.com search-box suggestions for a partial query:
   * keyword completions, brands, categories (id, name, path, URL,
   * product_count) and products with price and list-price ranges.
   *
   * Costs 1 credit.
   */
  async suggestions(options: DicksSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
