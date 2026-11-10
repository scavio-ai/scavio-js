import type { Scavio } from "../client.js";

// Saks Fifth Avenue: 9 endpoints, saksfifthavenue.com (US only, USD), 2 credits
// each.
//
// product() takes product_id or url; category() takes path or url; brand()
// takes brand (a designer slug) or url; stores() and storeAvailability() take
// one location (zip, or lat + lng). storeAvailability() needs a VARIANT sku
// (a product's variants[].sku). The server enforces these. Rating and review
// count only: review text is not available. Every call raises the request
// timeout to SAKS_TIMEOUT when the client's is shorter.

/** Minimum request timeout (ms) for every saks call. */
export const SAKS_TIMEOUT = 120_000;

/** Listing sorts. featured is the site's own order. */
export type SaksSort =
  | "featured"
  | "best_sellers"
  | "newest"
  | "price_high_to_low"
  | "price_low_to_high"
  | "sale_first"
  | "brand_az";

/** deals() lists: sale (all sale, default), womens_sale, mens_sale, womens_new_arrivals, mens_new_arrivals. No clearance list exists. */
export type SaksDealType = "sale" | "womens_sale" | "mens_sale" | "womens_new_arrivals" | "mens_new_arrivals";

/** Store search radius in miles. */
export type SaksRadius = 15 | 30 | 50 | 100 | 300;

/** Filters and paging shared by search(), category(), brand() and deals(). */
export interface SaksGridOptions {
  /** Results page, 1-based (24 grid positions per page). Defaults to 1. */
  page?: number;
  /** Item offset, instead of page: pass a previous response's next_start (an editorial tile can take a grid position, so a page may carry 22-23 items). */
  start?: number;
  /** featured (default), best_sellers, newest, price_high_to_low, price_low_to_high, sale_first or brand_az. */
  sort?: SaksSort;
  /** Only these colors, as the colorRefinement facet lists them (Black, Blue, Red...). An array matches any of them. */
  color?: string | string[];
  /** Only these sizes, spelled as the sizeRefinement facet LABEL lists them ("Medium", "X-Small, 0"; "M" matches nothing). */
  size?: string | string[];
  /** Minimum price in USD. Any bound works, not only the site's buckets. */
  min_price?: number;
  /** Maximum price in USD. */
  max_price?: number;
  /** Only items on sale. */
  on_sale?: boolean;
  /** Only new arrivals. */
  new_arrivals?: boolean;
  /** Any other facet from a previous response's facets: its id to one value or a list, e.g. { refGender: "Women's" }. */
  filters?: Record<string, string | string[]>;
}

export interface SaksSearchOptions extends SaksGridOptions {
  /** Search keywords, e.g. "coat". */
  query: string;
  /** Only these designers, spelled as the brand facet lists them (e.g. "Prada"). An array matches any of them. */
  brand?: string | string[];
  [key: string]: unknown;
}

export interface SaksProductOptions {
  /** Saks product id: a search result's id (the number at the end of a product URL), or a variant sku, e.g. "0400019127312". */
  product_id?: number | string;
  /** A saksfifthavenue.com product URL (its trailing id is used; a color / size it selects is kept). Alternative to product_id. */
  url?: string;
  /** Pick one color (a colors[].value), e.g. "BLUE OPAL". */
  color?: string;
  /** Pick one size (a sizes[].value). With color, the answer is that variant. */
  size?: string;
  [key: string]: unknown;
}

export interface SaksCategoryOptions extends SaksGridOptions {
  /** A Saks category path (/c/...): from a category URL, a suggestions() categories[].path or a breadcrumb, e.g. "/c/women-s-apparel/dresses". */
  path?: string;
  /** A saksfifthavenue.com category URL. Filters, sort and page already in the URL are kept. */
  url?: string;
  /** Only these designers, spelled as the brand facet lists them. An array matches any of them. */
  brand?: string | string[];
  [key: string]: unknown;
}

export interface SaksBrandOptions extends SaksGridOptions {
  /** A designer slug from designers(), e.g. "gucci", "chloé", "alice-olivia". A plain name is slugified. */
  brand?: string;
  /** A saksfifthavenue.com /brand/ URL. Filters, sort and page already in the URL are kept. */
  url?: string;
  [key: string]: unknown;
}

export interface SaksDealsOptions extends SaksGridOptions {
  /** sale (all sale, default), womens_sale (women's clothing), mens_sale, womens_new_arrivals or mens_new_arrivals. */
  type?: SaksDealType;
  /** Only these designers, spelled as the brand facet lists them. An array matches any of them. */
  brand?: string | string[];
  [key: string]: unknown;
}

/** One location: zip, or lat + lng. */
export interface SaksLocationOptions {
  /** US ZIP code, e.g. "10022". */
  zip?: string | number;
  /** Latitude (with lng), instead of zip. */
  lat?: number;
  /** Longitude (with lat). */
  lng?: number;
  /** Search radius in miles: 15, 30, 50, 100 or 300. Defaults to 50. */
  radius?: SaksRadius;
}

export interface SaksStoresOptions extends SaksLocationOptions {
  [key: string]: unknown;
}

export interface SaksStoreAvailabilityOptions extends SaksLocationOptions {
  /** A variant sku: a product's variants[].sku, or a product's id after picking color + size, e.g. "10781654". */
  sku: number | string;
  [key: string]: unknown;
}

export interface SaksSuggestionsOptions {
  /** What the shopper has typed so far, e.g. "gucci". */
  query: string;
  [key: string]: unknown;
}

export interface SaksDesignersOptions {
  /** Only designers under this letter (A-Z, or "#" for names starting with a digit). */
  letter?: string;
  [key: string]: unknown;
}

export class SaksNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object = {}): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/saks/${path}`, options, undefined, SAKS_TIMEOUT);
  }

  /**
   * Search saksfifthavenue.com (US) by keyword, filtered by designer, color,
   * size (the facet label, e.g. Medium), any price range, on sale, new
   * arrivals and any other facet, sorted by featured, best sellers, newest,
   * price, sale first or designer A-Z. 24 grid positions per page, each item
   * with id, title, brand, URL, image, price (price_max at a range), regular
   * and sale price, percent off, on-sale flag, review count, badge,
   * is_final_sale and is_clearance (null when the tile leaves them blank),
   * returnable, limited_inventory, promotions, product_type and colors. Also
   * total, page, total_pages, start and next_start (pass it as start), the
   * sort applied, the facets (values with counts; any value works in
   * filters), price_ranges and applied_filters. A keyword the site sends to a
   * designer or category page is answered from that page, named in
   * redirected_to.
   *
   * Costs 2 credits.
   */
  async search(options: SaksSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One saksfifthavenue.com product by id or URL: title, brand, type (master
   * or variant), UPC (for a variant), price block, is_new / is_sale /
   * is_clearance / is_final_sale, badge, returnable, promotions, description,
   * style code, images, colors and sizes with availability, every SKU in
   * variants[] with its online warehouse unit count, availability (units
   * available to sell, message, in_stock_date), available_in_store,
   * marketplace, drop_ship, preorder, merchandising attributes, the average
   * star rating and review_count. Review text is not available. Add color +
   * size (or pass a variant sku) to resolve one variant. An unknown id is a
   * 404.
   *
   * Costs 2 credits.
   */
  async product(options: SaksProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Browse one Saks category by its /c/ path or URL, with the same filters,
   * sorts and item fields as search(). Also the category's name, path, URL
   * and breadcrumbs. An unknown path is a 404.
   *
   * Costs 2 credits.
   */
  async category(options: SaksCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * Browse one designer's Saks page by slug (from designers()) or URL, with
   * the same filters, sorts and item fields as search() (except brand). Also
   * the brand's name, slug and URL. An unknown slug is a 404.
   *
   * Costs 2 credits.
   */
  async brand(options: SaksBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * Saks sale and new-arrival listings: all Sale (default), Women's Clothing
   * Sale, Men's Sale, Women's New Arrivals or Men's New Arrivals, with the
   * same filters, sorts and item fields as search(). Saks has no clearance or
   * final-sale listing (items carry is_clearance / is_final_sale flags).
   *
   * Costs 2 credits.
   */
  async deals(options: SaksDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * Saks Fifth Avenue stores near a US ZIP code or a point (lat + lng), within
   * 15 / 30 / 50 / 100 / 300 miles (default 50): store_id, name, address,
   * city, state, ZIP, lat / lng, distance in miles (pickup stores), today's
   * opening and closing times, hours, closed flag, and pickup (true for
   * stores that offer in-store pickup; other locations are listed with pickup
   * false).
   *
   * Costs 2 credits.
   */
  async stores(options: SaksStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * Can one Saks variant (sku) be picked up near a ZIP or a point? Per pickup
   * store: availability_message (In Stock, Limited Inventory, Not Available),
   * in_stock, limited, units_at_store when the site gives a count (otherwise
   * null), and the store's address, distance and today's hours. Take the sku
   * from product() variants[].sku.
   *
   * Costs 2 credits.
   */
  async storeAvailability(options: SaksStoreAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.post("store-availability", options);
  }

  /**
   * The saksfifthavenue.com search-box suggestions for a partial query: the
   * result count, matching designers, suggested categories (with a path for
   * category()), up to 5 featured products and the site's popular searches.
   *
   * Costs 2 credits.
   */
  async suggestions(options: SaksSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * The Saks A-Z designer index (about 1,200 designers): name, slug (what
   * brand() takes), URL and letter, optionally only one letter.
   *
   * Costs 2 credits.
   */
  async designers(options: SaksDesignersOptions = {}): Promise<Record<string, unknown>> {
    return this.post("designers", options);
  }
}
