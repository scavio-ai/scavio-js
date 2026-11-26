import type { Scavio } from "../client.js";

// Academy Sports + Outdoors (academy.com, the US sporting goods retailer) search, product,
// storeAvailability, stores, store, category, categories, deals and suggestions endpoints; US only,
// prices in USD (national), exact units per store, 1 credit each. Generated from the backend
// routes: every option and its doc mirrors the API's own request schema; an input the API only
// accepts to refuse (a 400 that says 'not offered') is left out. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to ACADEMY_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused
// inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every academy call. */
export const ACADEMY_TIMEOUT = 240_000;

export interface AcademySearchOptions {
  /** Search keywords. */
  query: string;
  /**
   * Results page, 1-based (the site shows up to 29 organic results per page; page_size reports it).
   * A page past the last one returns an empty items list (total 0). Defaults to 1.
   */
  page?: number;
  /**
   * relevance (default, the site's own order), best_selling, newest, top_rated, price_asc or
   * price_desc (Academy's own price order, by its list price: promotions and cart prices can sit
   * slightly out of order).
   */
  sort?: "relevance" | "best_selling" | "newest" | "top_rated" | "price_asc" | "price_desc";
  /**
   * Facet filters from a previous answer: {facets[].id: facets[].values[].value, or a list of
   * values}, e.g. {"facet_Brand": "Nike"}, {"facet_Deals": "Clearance"}, {"facet_IndustrySubGroup":
   * "Black"} (color). Values are case-sensitive and must be passed exactly as the site lists them
   * ("Yeti" and "YETI" are different brand values). Facets combine.
   */
  facets?: Record<string, unknown>;
  /** Lowest price in USD (the site's price filter). */
  min_price?: number;
  /** Highest price in USD. */
  max_price?: number;
  [key: string]: unknown;
}

export interface AcademyProductOptions {
  /**
   * An academy.com product link (/p/<slug>; a ?sku= in it is not needed, every variant is
   * returned).
   */
  url?: string;
  /** The product slug (items[].slug, the part after /p/). Alternative to url. */
  slug?: string;
  [key: string]: unknown;
}

export interface AcademyStoreAvailabilityOptions {
  /** The product's part number: items[].part_number or product part_number. */
  part_number: string;
  /** The store: stores[].store_id (19, 0019 and store-0019 all work). */
  store_id: string | number;
  /**
   * The store's state (stores[].address.state), as the site sends it with the store: one of AL, AR,
   * FL, GA, IL, IN, KS, KY, LA, MD, MS, MO, NC, OH, OK, PA, SC, TN, TX, VA, WV.
   */
  state: string;
  [key: string]: unknown;
}

export interface AcademyStoresOptions {
  /** US ZIP code to search around. */
  zip?: string | number;
  /** Latitude (with longitude), instead of zip. */
  latitude?: number;
  /** Longitude (with latitude). */
  longitude?: number;
  /** Radius in miles, 1-250. Defaults to 50. */
  radius?: number;
  [key: string]: unknown;
}

export interface AcademyStoreOptions {
  /** 1 to 20 store ids (stores[].store_id), a list or a comma-separated string. */
  store_ids: string | number | Array<string | number>;
  [key: string]: unknown;
}

export interface AcademyCategoryOptions {
  /** A category path (/c/...), as categories and subcategories[].path give it. */
  path?: string;
  /** An academy.com category link (its query string is not read: send filters in facets). */
  url?: string;
  /**
   * Results page, 1-based (the site shows up to 29 organic results per page; page_size reports it).
   * A page past the last one returns an empty items list (total 0). Defaults to 1.
   */
  page?: number;
  /**
   * relevance (default, the site's own order), best_selling, newest, top_rated, price_asc or
   * price_desc (Academy's own price order, by its list price: promotions and cart prices can sit
   * slightly out of order).
   */
  sort?: "relevance" | "best_selling" | "newest" | "top_rated" | "price_asc" | "price_desc";
  /**
   * Facet filters from a previous answer: {facets[].id: facets[].values[].value, or a list of
   * values}, e.g. {"facet_Brand": "Nike"}, {"facet_Deals": "Clearance"}, {"facet_IndustrySubGroup":
   * "Black"} (color). Values are case-sensitive and must be passed exactly as the site lists them
   * ("Yeti" and "YETI" are different brand values). Facets combine.
   */
  facets?: Record<string, unknown>;
  /** Lowest price in USD (the site's price filter). */
  min_price?: number;
  /** Highest price in USD. */
  max_price?: number;
  [key: string]: unknown;
}

export interface AcademyCategoriesOptions {
  [key: string]: unknown;
}

export interface AcademyDealsOptions {
  /** hot_deals (default), clearance, black_friday or flash_sale. */
  type?: "hot_deals" | "clearance" | "black_friday" | "flash_sale";
  /** black_friday only: one sub-shop, sub_shops[].slug of a black_friday answer. */
  sub_shop?: string;
  /**
   * Results page, 1-based (the site shows up to 29 organic results per page; page_size reports it).
   * A page past the last one returns an empty items list (total 0). Defaults to 1.
   */
  page?: number;
  /**
   * relevance (default, the site's own order), best_selling, newest, top_rated, price_asc or
   * price_desc (Academy's own price order, by its list price: promotions and cart prices can sit
   * slightly out of order).
   */
  sort?: "relevance" | "best_selling" | "newest" | "top_rated" | "price_asc" | "price_desc";
  /**
   * Facet filters from a previous answer: {facets[].id: facets[].values[].value, or a list of
   * values}, e.g. {"facet_Brand": "Nike"}, {"facet_Deals": "Clearance"}, {"facet_IndustrySubGroup":
   * "Black"} (color). Values are case-sensitive and must be passed exactly as the site lists them
   * ("Yeti" and "YETI" are different brand values). Facets combine.
   */
  facets?: Record<string, unknown>;
  /** Lowest price in USD (the site's price filter). */
  min_price?: number;
  /** Highest price in USD. */
  max_price?: number;
  [key: string]: unknown;
}

export interface AcademySuggestionsOptions {
  /** What the shopper has typed so far. */
  query: string;
  /** Also return the site's popular searches. Defaults to false. */
  include_popular?: boolean;
  [key: string]: unknown;
}

export class AcademyNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = ACADEMY_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/academy/${path}`, options, undefined, timeout);
  }

  /**
   * Search Academy Sports + Outdoors (academy.com, the US sporting goods retailer). Scavio fetches
   * the public academy.com page on request; Academy has no public API. US storefront, prices in US
   * dollars; prices are national (the same at every store). By keyword, sorted (relevance, best
   * selling, newest, top rated, price), filtered by any facet (brand, product type, color, deals,
   * size...) and a price range. Costs 1 credit.
   */
  async search(options: AcademySearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product of Academy Sports + Outdoors (academy.com, the US sporting goods retailer). Scavio
   * fetches the public academy.com page on request; Academy has no public API. US storefront,
   * prices in US dollars; prices are national (the same at every store). By link or slug, every
   * variant. Costs 1 credit.
   */
  async product(options: AcademyProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Per-variant stock of one product at one store of Academy Sports + Outdoors (academy.com, the US
   * sporting goods retailer). Scavio fetches the public academy.com page on request; Academy has no
   * public API. US storefront, prices in US dollars; prices are national (the same at every store).
   * By part_number, store_id and the store's state. Costs 1 credit.
   */
  async storeAvailability(options: AcademyStoreAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.post("store-availability", options);
  }

  /**
   * The stores of Academy Sports + Outdoors (academy.com, the US sporting goods retailer). Scavio
   * fetches the public academy.com page on request; Academy has no public API. US storefront,
   * prices in US dollars; prices are national (the same at every store). Near a US ZIP code or a
   * point, nearest first, within 50 miles by default (up to 250). Each store. Costs 1 credit.
   */
  async stores(options: AcademyStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * 1 to 20 stores of Academy Sports + Outdoors (academy.com, the US sporting goods retailer).
   * Scavio fetches the public academy.com page on request; Academy has no public API. US
   * storefront, prices in US dollars; prices are national (the same at every store). By id, in the
   * order asked, with the same fields as stores (distance excepted) and not_found for ids Academy
   * does not know. When none is found it is a charged 404. 1 credit. A not-found is charged; failed
   * upstream calls and refused inputs are not. Usually 2-20 s; set a client timeout of at least 90
   * s. Costs 1 credit.
   */
  async store(options: AcademyStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * One category of Academy Sports + Outdoors (academy.com, the US sporting goods retailer). Scavio
   * fetches the public academy.com page on request; Academy has no public API. US storefront,
   * prices in US dollars; prices are national (the same at every store). By path or link (Coolers,
   * Men's Running Shoes, Handguns...), sorted and filtered like search. Costs 1 credit.
   */
  async category(options: AcademyCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The category navigation of Academy Sports + Outdoors (academy.com, the US sporting goods
   * retailer). Scavio fetches the public academy.com page on request; Academy has no public API. US
   * storefront, prices in US dollars; prices are national (the same at every store). As the site's
   * header shows it. Costs 1 credit.
   */
  async categories(options: AcademyCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * The deal listings of Academy Sports + Outdoors (academy.com, the US sporting goods retailer).
   * Scavio fetches the public academy.com page on request; Academy has no public API. US
   * storefront, prices in US dollars; prices are national (the same at every store). Hot Deals
   * (default), Clearance, Black Friday (and one of its sub_shops) or the Flash Sale, sorted and
   * filtered like search. Costs 1 credit.
   */
  async deals(options: AcademyDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * The search-box suggestions of Academy Sports + Outdoors (academy.com, the US sporting goods
   * retailer). Scavio fetches the public academy.com page on request; Academy has no public API. US
   * storefront, prices in US dollars; prices are national (the same at every store). For a partial
   * query. Costs 1 credit.
   */
  async suggestions(options: AcademySuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
