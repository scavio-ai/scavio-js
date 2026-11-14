import type { Scavio } from "../client.js";

// Wayfair: 4 endpoints, 1 credit each. country is the market (default "us"):
// us (wayfair.com, USD), ca (wayfair.ca, CAD; language en or fr), gb
// (wayfair.co.uk, GBP), ie (wayfair.ie, EUR). site picks one of Wayfair's US
// banner sites (allmodern, birchlane, jossandmain, perigold; country us only)
// on search(), product() and category(). Wayfair no longer sells in Germany or
// Austria. Every answer echoes country, language, site and currency.
//
// Prices are numbers in the market's currency, never converted. was_price is
// Wayfair's strikethrough price, which Wayfair's terms define as the
// manufacturer's suggested price or the highest price Wayfair offered or sold
// the item at in the past; Wayfair's Sale label means a discount against a
// price in the previous 90 days. Wayfair shows no price history: poll price,
// sale_price, was_price and badge to build one.
//
// The server enforces the cross-field rules: product() takes sku or url;
// category() takes category_id or category_url; language fr is ca only; zip is
// us and ca only. Every call raises the request timeout to WAYFAIR_TIMEOUT.
// Failed upstream calls are not charged; an unknown SKU or category is a
// charged 404.

/** Minimum request timeout (ms) for every wayfair call. */
export const WAYFAIR_TIMEOUT = 120_000;

/** us (wayfair.com), ca (wayfair.ca), gb (wayfair.co.uk) or ie (wayfair.ie). */
export type WayfairCountry = "us" | "ca" | "gb" | "ie";

/** en (default) or fr; fr is ca only. */
export type WayfairLanguage = "en" | "fr";

/** The market's own site (wayfair, default) or a US banner site (country us only). */
export type WayfairSite = "wayfair" | "allmodern" | "birchlane" | "jossandmain" | "perigold";

/** recommended (default), price_asc, price_desc or rating (customer rating). */
export type WayfairSort = "recommended" | "price_asc" | "price_desc" | "rating";

/** 5 = five stars only, 4 / 3 = that many stars and up, 1 = every reviewed product. */
export type WayfairMinRating = 1 | 3 | 4 | 5;

export interface WayfairMarketOptions {
  /** Market. Defaults to "us". */
  country?: WayfairCountry;
  /** ca only: en (default) or fr (French names, labels and dates). */
  language?: WayfairLanguage;
}

export interface WayfairGridOptions {
  /** Results page, 1-based. A page past the last returns no items and a note. */
  page?: number;
  /** Sort order. Price sorts follow Wayfair's price per item (per_item_price for sets). */
  sort?: WayfairSort;
  /** Only products on sale. */
  on_sale?: boolean;
  /** Only closeout products. */
  closeout?: boolean;
  /** Only products with an open-box offer (open_box_price). */
  open_box?: boolean;
  /** Only new arrivals. */
  new_arrivals?: boolean;
  /** Only products in stock. */
  in_stock?: boolean;
  /** 1 to 5 brand ids, not names: items[].brand.id or a Brand facet option id (44308 = Ebern Designs). */
  brand?: number | string | Array<number | string>;
  /** Minimum customer rating: 1, 3, 4 or 5. */
  min_rating?: WayfairMinRating;
  /** Lowest price, in the market's currency. */
  price_min?: number;
  /** Highest price, in the market's currency. */
  price_max?: number;
  /** Any facet, keyed by facets[].id with facets[].options[].id values: {"2471": ["274623"]}; ranges as "min~max". */
  filters?: Record<string, string | number | Array<string | number>>;
}

export interface WayfairSearchOptions extends WayfairMarketOptions, WayfairGridOptions {
  /** Search keywords, e.g. "office chair" (a SKU opens that product: redirected_to). */
  query: string;
  /** A US banner site (country us only). Defaults to "wayfair". */
  site?: WayfairSite;
  [key: string]: unknown;
}

export interface WayfairProductOptions extends WayfairMarketOptions {
  /** A Wayfair SKU, e.g. "W005006988". One of sku or url. */
  sku?: string;
  /** A Wayfair product page of a served site (the market, language and site are read from it). */
  url?: string;
  /** options[].choices[].option_id (comma-separated for multi-choice products): that option's price and stock. */
  option_id?: string | number;
  /** Delivery estimate to this ZIP / postal code, e.g. "10001" (us and ca only). */
  zip?: string;
  /** A US banner site (country us only). Defaults to "wayfair". */
  site?: WayfairSite;
  [key: string]: unknown;
}

export interface WayfairCategoryOptions extends WayfairMarketOptions, WayfairGridOptions {
  /** A category id, e.g. "413892" (Sofas) or "c413892". One of category_id or category_url. */
  category_id?: string | number;
  /** A category page of a served site (/sb0/, /sb1/ or /sb2/ URL; filters in it are kept). */
  category_url?: string;
  /** A US banner site (country us only). Defaults to "wayfair". */
  site?: WayfairSite;
  [key: string]: unknown;
}

export interface WayfairDealsOptions extends WayfairMarketOptions {
  [key: string]: unknown;
}

export class WayfairNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/wayfair/${path}`, options, undefined, WAYFAIR_TIMEOUT);
  }

  /**
   * Search Wayfair products by keyword, sorted by price or customer rating
   * and filtered by sale, closeout, open box, new arrivals, in stock, brand
   * id, minimum rating, price range or any facet: query, count, total
   * (approximate, total_is_approximate), page, page_size (30 on keyword
   * pages, 48 on category grids), total_pages, sort, sorts_offered,
   * requested_filters, applied_filters, unapplied_filters, facets,
   * redirected_to (a keyword that matches a category, or a SKU) and items
   * with position, sku, variant_id, name, brand (id, name), url, image,
   * price, sale_price, was_price, price_label, discount_percent,
   * per_item_price, loyalty_savings, prices, badge, rating, review_count,
   * stock_status, stock_text, open_box_price, option_counts,
   * selected_options, category and sponsored.
   *
   * Costs 1 credit.
   */
  async search(options: WayfairSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Wayfair product by sku or url: sku, variant_id, name, brand, url,
   * price, sale_price, was_price, price_label, percent_off, per_item_price,
   * loyalty_savings, prices, badge, limited_time_deal, stock_status,
   * max_quantity, part_number, options (choices with option_id; choices
   * carry no price: call again with option_id, one call per option),
   * dimensions, specifications, features, description, images, breadcrumbs,
   * documents, collection, returns, rating, review_count, rating_histogram,
   * review_summary, review_aspects and reviews (the 5 the page shows; no
   * review paging). delivery and delivery_zip come back for zip (us, ca).
   *
   * Costs 1 credit.
   */
  async product(options: WayfairProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One Wayfair category's products (48 per page) by category_id or
   * category_url, with the search sorts and filters: category (id, name,
   * url, breadcrumbs) and the search grid fields. An unknown category is a
   * charged 404; a department page (/cat/) is not a product list.
   *
   * Costs 1 credit.
   */
  async category(options: WayfairCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The market's current Wayfair sale events (the Daily Sales list): events
   * (event_id, slug, title, url, image) and count. Events are listed, not
   * expanded: for sale, closeout or open-box products use search() or
   * category() with on_sale, closeout or open_box.
   *
   * Costs 1 credit.
   */
  async deals(options: WayfairDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }
}
