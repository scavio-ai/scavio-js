import type { Scavio } from "../client.js";

// Kohl's: 9 endpoints, kohls.com (US only, USD). stores() costs 1 credit,
// every other endpoint 2.
//
// product() takes product_id or url; category() takes path or url (a catalog
// path that carries its CN=... filter); brand() takes brand or url; stores()
// takes one location (zip, city + state, or lat + lng); storeAvailability()
// takes a sku (a product's variants[].sku) and a zip. The server enforces
// these. Rating and review count only: review text is not available. Every
// call raises the request timeout to KOHLS_TIMEOUT when the client's is
// shorter.

/** Minimum request timeout (ms) for every kohls call. */
export const KOHLS_TIMEOUT = 120_000;

/** Listing sorts. featured is the site's default order. */
export type KohlsSort =
  | "featured"
  | "new_arrivals"
  | "best_sellers"
  | "price_low_to_high"
  | "price_high_to_low"
  | "highest_rated"
  | "percent_off";

/** deals() lists: clearance (default), sale, kohls_cash (items that earn Kohl's Cash now), sephora (Sephora at Kohl's). */
export type KohlsDealType = "clearance" | "sale" | "kohls_cash" | "sephora";

/** suggestions() mode: terms (keyword completions, default) or products. */
export type KohlsSuggestionType = "terms" | "products";

/** Filters and paging shared by search(), category(), brand() and deals(). */
export interface KohlsGridOptions {
  /** Results page, 1-based (120 products per page). Defaults to 1. */
  page?: number;
  /** featured (default), new_arrivals, best_sellers, price_low_to_high, price_high_to_low, highest_rated or percent_off. */
  sort?: KohlsSort;
  /** Only this color, as the Color facet lists it (Black, Blue, Beig/khaki...). */
  color?: string;
  /** Only this size, as the Size facet lists it (M, 32X30, 10...). */
  size?: string;
  /** Only items on sale. */
  on_sale?: boolean;
  /** Only clearance items. */
  clearance?: boolean;
  /**
   * Any facet value id from a previous response's facets[].values[].value, e.g.
   * "Gender:Womens", "Price:%2425%20to%20%2450" (price buckets), "TopRated:4".
   * An array combines facets (AND). Unencoded values work too ("Price:$25 to $50").
   */
  filters?: string | string[];
}

export interface KohlsSearchOptions extends KohlsGridOptions {
  /** Search keywords, e.g. "jeans". */
  query: string;
  /** Only this brand, as the Brand facet lists it ("Levi's", "Hamilton Beach", "BLACK+DECKER"). */
  brand?: string;
  [key: string]: unknown;
}

export interface KohlsProductOptions {
  /** Kohl's product id: a search result's id, the number after prd- in a product URL, e.g. "6251213". */
  product_id?: number | string;
  /** A kohls.com product URL (its prd-<id> is used). Alternative to product_id. */
  url?: string;
  /** A Kohl's store number (stores() stores[].store_id), e.g. "725": adds that store's availability and in-store price to every variant. */
  store_id?: number | string;
  [key: string]: unknown;
}

export interface KohlsCategoryOptions extends KohlsGridOptions {
  /** A Kohl's catalog path with its CN=... part, as kohls.com category links and a product's breadcrumbs[].url carry it. */
  path?: string;
  /** A kohls.com catalog URL. Its CN facets define the listing; a sort or page in the URL is kept. */
  url?: string;
  /** Only this brand, as the Brand facet lists it. */
  brand?: string;
  [key: string]: unknown;
}

export interface KohlsBrandOptions extends KohlsGridOptions {
  /** A brand name as Kohl's lists it in the Brand facet, e.g. "Hamilton Beach", "Nike", "Levi's". */
  brand?: string;
  /** A kohls.com brand page URL (its CN carries Brand:...). */
  url?: string;
  [key: string]: unknown;
}

export interface KohlsDealsOptions extends KohlsGridOptions {
  /** clearance (default), sale, kohls_cash (items that earn Kohl's Cash now) or sephora (Sephora at Kohl's). */
  type?: KohlsDealType;
  /** Only this brand, as the Brand facet lists it. */
  brand?: string;
  [key: string]: unknown;
}

/** One location: zip, city + state, or lat + lng. */
export interface KohlsStoresOptions {
  /** US ZIP code to search around, e.g. "60601". */
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
  [key: string]: unknown;
}

export interface KohlsStoreAvailabilityOptions {
  /** A Kohl's SKU code: a product's variants[].sku, e.g. "73519108". */
  sku: number | string;
  /** US ZIP code: stores within about 50 miles are listed, e.g. "10001". */
  zip: string | number;
  /** The product's department code (product() dept, e.g. "063"). */
  dept?: string | number;
  [key: string]: unknown;
}

export interface KohlsSuggestionsOptions {
  /** What the shopper has typed so far, e.g. "coff". */
  query: string;
  /** terms (default): keyword completions; products: matching products (id, title, URL, image). */
  type?: KohlsSuggestionType;
  [key: string]: unknown;
}

export interface KohlsCouponsOptions {
  [key: string]: unknown;
}

export class KohlsNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object = {}): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/kohls/${path}`, options, undefined, KOHLS_TIMEOUT);
  }

  /**
   * Search kohls.com (US) by keyword, filtered by brand, color, size, on sale,
   * clearance and any facet value (price buckets, gender, rating, store
   * pickup...), sorted by featured, new arrivals, best sellers, price, highest
   * rated or percent off. 120 products per page, each with id, title, URL,
   * image, price (price_max for a range), regular_price, sale_price,
   * price_label (sale, clearance, clearance+regular), on_sale, is_clearance,
   * percent_off, price_suppressed with price_note (cart-only prices),
   * with_code_price with with_code_offer_codes, promotions, rating,
   * review_count, badges, colors, is_sephora, coupon_eligible, pickup /
   * ship-to-store flags and is_sponsored (sponsored items stay in the list,
   * counted in sponsored_count). Also total, page, total_pages, the sort
   * applied, applied_filters and every facet (value ids feed filters).
   * corrected_query says when the site autocorrected the keyword.
   *
   * Costs 2 credits.
   */
  async search(options: KohlsSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One kohls.com product by id or URL: title, brand, status, dept (what
   * storeAvailability() can take), breadcrumbs, Sephora at Kohl's flag,
   * average rating, review_count and recommended_percent (review text is not
   * available), badges, description, details, images, videos, return policy,
   * the price block (regular, sale, percent_off, lowest_applicable_price,
   * price_suppressed, with_code_price with its savings and offer codes),
   * kohls_cash (earn and redeem windows) when the product has it, the public
   * offers that apply (code, description, terms, dates), pickup /
   * ship-to-store eligibility, online_units, and every variant (sku, UPC,
   * color, size, availability, online_units, prices, Kohl's Cash earned).
   * Add store_id for that store's availability and in-store price on each
   * variant. An unknown id is a 404 (it can take about 20 seconds).
   *
   * Costs 2 credits.
   */
  async product(options: KohlsProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Browse one Kohl's catalog listing by its path or URL (the path carries its
   * CN=... filter), with the same filters, sorts and item fields as search().
   * Also the category's name, breadcrumbs, path and URL.
   *
   * Costs 2 credits.
   */
  async category(options: KohlsCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * Browse one brand at Kohl's by name or URL, with the same filters, sorts
   * and item fields as search() (except brand). An unknown brand is a 404.
   *
   * Costs 2 credits.
   */
  async brand(options: KohlsBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * Kohl's deal listings: Clearance (default), Sale, items that earn Kohl's
   * Cash right now, or Sephora at Kohl's, with the same filters, sorts and
   * item fields as search(). To track clearance prices over time, poll and
   * store your own: there is no price history.
   *
   * Costs 2 credits.
   */
  async deals(options: KohlsDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * Kohl's stores near a US ZIP code, a city + state or a point (lat + lng),
   * within 25 miles by default (up to 100): store_id (what product() store_id
   * takes), name, address, phone, lat / lng, distance in miles, weekly
   * opening hours with the UTC offset, store badges (Sephora, Fine
   * Jewelry...), services (In-Store Pickup...) and the store page URL.
   *
   * Costs 1 credit.
   */
  async stores(options: KohlsStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * Pickup stock for one Kohl's SKU at every store within about 50 miles of a
   * US ZIP code, with unit counts: per store pickup_units, stock_level (In
   * Stock, Low Stock, Out of Stock), in_stock, ship_to_store_units with the
   * ship-to-store window, eligibility flags, and the store's address, phone,
   * distance and hours. Also in_stock_count and total_pickup_units. Take sku
   * (variants[].sku) and dept from product().
   *
   * Costs 2 credits.
   */
  async storeAvailability(options: KohlsStoreAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.post("store-availability", options);
  }

  /**
   * The kohls.com search-box suggestions for a partial query: keyword
   * completions (type terms, default), or matching products with id, title,
   * URL and image (type products).
   *
   * Costs 2 credits.
   */
  async suggestions(options: KohlsSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Today's public Kohl's coupon codes: code, description (the offer, minimum
   * purchase and exclusions as stated), end date, requires_kohls_card, the
   * terms page URL and the URL of the eligible products. Public codes only.
   *
   * Costs 2 credits.
   */
  async coupons(options: KohlsCouponsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("coupons", options);
  }
}
