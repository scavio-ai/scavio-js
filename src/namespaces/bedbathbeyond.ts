import type { Scavio } from "../client.js";

// Bed Bath & Beyond (bedbathandbeyond.com, the US online home goods store) search, category,
// categories, product, deliveryEstimate, reviews, questions, stores and deals endpoints; US only,
// prices in USD, exact online stock (no store stock), 1 credit each, 2 for search, category and
// deal lists. Generated from the backend routes: every option and its doc mirrors the API's own
// request schema; an input the API only accepts to refuse (a 400 that says 'not offered') is left
// out. The server enforces the value rules and the one-of rules (send one of an id or a link).
// Every call raises the request timeout to BEDBATHBEYOND_TIMEOUT and never lowers a longer client
// timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every bedbathbeyond call. */
export const BEDBATHBEYOND_TIMEOUT = 240_000;

export interface BedbathbeyondSearchOptions {
  /** Search keywords. */
  query?: string;
  /**
   * Instead of query: a facets[].values[].url from a search answer (a filtered keyword list, e.g.
   * On Sale, a color or a brand). Price filter links are refused (use category price_min /
   * price_max).
   */
  facet_url?: string;
  /** best_match (default), on_sale, best_selling, price_asc, price_desc, rating or newest. */
  sort?: "best_match" | "on_sale" | "best_selling" | "price_asc" | "price_desc" | "rating" | "newest";
  /** Include out-of-stock products (default false). */
  include_out_of_stock?: boolean | "true" | "false";
  /**
   * Page, 1-84 (default 1). The site serves at most 84 pages of any list; page size varies (about
   * 63-81 products).
   */
  page?: number | string;
  [key: string]: unknown;
}

export interface BedbathbeyondCategoryOptions {
  /**
   * The category path after /c/ (categories links[].slug, child_categories[].slug), with
   * category_id.
   */
  slug?: string;
  /** The category id (the t= value of its link; categories links[].category_id). */
  category_id?: string | number;
  /**
   * Instead of slug + category_id: a bedbathandbeyond.com /c/ link (categories, breadcrumbs,
   * child_categories, a facet value url). Its filters are kept.
   */
  url?: string;
  /**
   * best_selling, on_sale, price_asc, price_desc, rating, newest (default best_selling). The site's
   * own keys (bestselling, onsale, pricelowhigh, pricehighlow, customerrating, newarrivals) are
   * accepted too.
   */
  sort?: string;
  /**
   * Page, 1-84 (default 1). The site serves at most 84 pages of any list; page size varies (about
   * 63-81 products).
   */
  page?: number | string;
  /**
   * Attribute filters: facet id -> value id(s) (facets[].id and facets[].values[].id), e.g. Color
   * Black.
   */
  attributes?: Record<string, unknown>;
  /** Price range low end in USD (with price_max). */
  price_min?: number;
  /** Price range high end in USD (with price_min). */
  price_max?: number;
  /** Customer rating: this many stars and up (1-4). */
  rating?: number;
  /** Brand name(s) as the Brand facet lists them. */
  brand?: string | string[];
  /**
   * Sales and Promotions value(s) as the facet lists them: on sale, top rated, best selling, new
   * products.
   */
  promotion?: string | string[];
  /** Include out-of-stock products (default false). */
  include_out_of_stock?: boolean | "true" | "false";
  /** Limit the list to Fast Delivery products. */
  fast_delivery?: boolean | "true" | "false";
  /** Limit the list to Expedited Shipping Available products. */
  expedited?: boolean | "true" | "false";
  [key: string]: unknown;
}

export interface BedbathbeyondCategoriesOptions {
  [key: string]: unknown;
}

export interface BedbathbeyondProductOptions {
  /**
   * A Bed Bath & Beyond product id: the digits before /product.html in a product link
   * (items[].product_id).
   */
  product_id?: string | number;
  /** A bedbathandbeyond.com product link, instead of product_id. */
  url?: string;
  [key: string]: unknown;
}

export interface BedbathbeyondDeliveryEstimateOptions {
  /** product's options[].option_id. */
  option_id: string | number;
  /** Quantity, 1-99 (default 1). */
  quantity?: number;
  /** The US ZIP code to deliver to. */
  zip: string | number;
  [key: string]: unknown;
}

export interface BedbathbeyondReviewsOptions {
  /**
   * A Bed Bath & Beyond product id: the digits before /product.html in a product link
   * (items[].product_id).
   */
  product_id?: string | number;
  /** A bedbathandbeyond.com product link, instead of product_id. */
  url?: string;
  /** newest (default), most_helpful, highest or lowest. */
  sort?: "newest" | "most_helpful" | "highest" | "lowest";
  /** Reviews with exactly this many stars. */
  rating?: number;
  /** Reviews containing this text. */
  search?: string;
  /** Page, from 1 (default 1). */
  page?: number;
  /** Reviews per page, 1-50 (default 10). */
  page_size?: number;
  [key: string]: unknown;
}

export interface BedbathbeyondQuestionsOptions {
  /**
   * A Bed Bath & Beyond product id: the digits before /product.html in a product link
   * (items[].product_id).
   */
  product_id?: string | number;
  /** A bedbathandbeyond.com product link, instead of product_id. */
  url?: string;
  /** Page, from 1 (default 1); 20 questions per page. */
  page?: number;
  [key: string]: unknown;
}

export interface BedbathbeyondStoresOptions {
  /** A US ZIP code (placed at its Census center): stores within radius, nearest first. */
  zip?: string | number;
  /** A 2-letter US state code: every store in the state. */
  state?: string;
  /** With longitude: stores within radius of a point. */
  latitude?: number;
  /** Longitude (with latitude). */
  longitude?: number;
  /** Radius in miles, 1-500 (default 50), with zip or latitude / longitude. */
  radius?: number;
  /**
   * bed_bath_beyond (the co-branded Bed Bath & Beyond / The Container Store stores), kirklands or
   * container_store (every store carrying The Container Store, co-branded included).
   */
  banner?: "bed_bath_beyond" | "kirklands" | "container_store";
  [key: string]: unknown;
}

export interface BedbathbeyondDealsOptions {
  /**
   * page (default: the deals page, its sale countdown and doorbuster grid), or a deal list:
   * black_friday, on_sale, doorbusters, holiday_brand_deals.
   */
  type?: "page" | "black_friday" | "on_sale" | "doorbusters" | "holiday_brand_deals";
  /**
   * For a deal list: best_match, on_sale, best_selling, price_asc, price_desc, rating or newest
   * (default: the list's own order).
   */
  sort?: "best_match" | "on_sale" | "best_selling" | "price_asc" | "price_desc" | "rating" | "newest";
  /**
   * Page, 1-84 (default 1). The site serves at most 84 pages of any list; page size varies (about
   * 63-81 products).
   */
  page?: number | string;
  /** For a deal list: include out-of-stock products. */
  include_out_of_stock?: boolean | "true" | "false";
  [key: string]: unknown;
}

export class BedbathbeyondNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = BEDBATHBEYOND_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/bedbathbeyond/${path}`, options, undefined, timeout);
  }

  /**
   * Keyword search on Bed Bath & Beyond (bedbathandbeyond.com, the US online home goods store).
   * Scavio fetches the public page on request; Bed Bath & Beyond has no public API. Market: US
   * (en-US, USD); every answer carries market, host, language and currency. By query (or a facet
   * link from an earlier answer), in the site's sorts, with or without out-of-stock products. Costs
   * 2 credits.
   */
  async search(options: BedbathbeyondSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category's product list on Bed Bath & Beyond (bedbathandbeyond.com, the US online home
   * goods store). Scavio fetches the public page on request; Bed Bath & Beyond has no public API.
   * Market: US (en-US, USD); every answer carries market, host, language and currency. By slug +
   * category_id (or a /c/ link), in the site's category sorts (best_selling, on_sale, price_asc,
   * price_desc, rating, newest) with attribute, price range, rating, brand, promotion, fast
   * delivery, expedited and out-of-stock filters. Costs 2 credits.
   */
  async category(options: BedbathbeyondCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The department menu of Bed Bath & Beyond (bedbathandbeyond.com, the US online home goods
   * store). Scavio fetches the public page on request; Bed Bath & Beyond has no public API. Market:
   * US (en-US, USD); every answer carries market, host, language and currency. Costs 1 credit.
   */
  async categories(options: BedbathbeyondCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One product of Bed Bath & Beyond (bedbathandbeyond.com, the US online home goods store). Scavio
   * fetches the public page on request; Bed Bath & Beyond has no public API. Market. Costs 1
   * credit; occasionally 2 when the page takes a second read. credits_used in the response is the
   * exact charge.
   */
  async product(options: BedbathbeyondProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The delivery date and shipping charge of one product option, for a quantity, to a US ZIP code,
   * on Bed Bath & Beyond (bedbathandbeyond.com, the US online home goods store). Scavio fetches the
   * public page on request; Bed Bath & Beyond has no public API. Market: US (en-US, USD); every
   * answer carries market, host, language and currency. Costs 1 credit.
   */
  async deliveryEstimate(options: BedbathbeyondDeliveryEstimateOptions): Promise<Record<string, unknown>> {
    return this.post("delivery-estimate", options);
  }

  /**
   * Customer reviews of one product of Bed Bath & Beyond (bedbathandbeyond.com, the US online home
   * goods store). Scavio fetches the public page on request; Bed Bath & Beyond has no public API.
   * Market. Costs 1 credit.
   */
  async reviews(options: BedbathbeyondReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * Customer questions and answers of one product of Bed Bath & Beyond (bedbathandbeyond.com, the
   * US online home goods store). Scavio fetches the public page on request; Bed Bath & Beyond has
   * no public API. Market. Costs 1 credit.
   */
  async questions(options: BedbathbeyondQuestionsOptions): Promise<Record<string, unknown>> {
    return this.post("questions", options);
  }

  /**
   * The stores of the Bed Bath & Beyond family on Bed Bath & Beyond (bedbathandbeyond.com, the US
   * online home goods store). Scavio fetches the public page on request; Bed Bath & Beyond has no
   * public API. Market. Costs 1 credit.
   */
  async stores(options: BedbathbeyondStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * The deals of Bed Bath & Beyond (bedbathandbeyond.com, the US online home goods store). Scavio
   * fetches the public page on request; Bed Bath & Beyond has no public API. Market: US (en-US,
   * USD); every answer carries market, host, language and currency. type page (default, 1 credit):
   * event {text, ends_at} (the sale countdown), sections [{name (e.g. DOORBUSTERS), items
   * [{position, product_id, option_id, name, url, image, price, compare_price, compare_type,
   * savings, savings_percent, on_sale, sale_end, qty_on_hand, option_count, rating,
   * review_count}]}] and deal_lists. A deal list (black_friday, on_sale, doorbusters,
   * holiday_brand_deals; 2 credits) answers like search: Costs 1 credit for the deals page (type
   * page, the default); 2 for a deal list (black_friday, on_sale, doorbusters,
   * holiday_brand_deals). credits_used in the response is the exact charge.
   */
  async deals(options: BedbathbeyondDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }
}
