import type { Scavio } from "../client.js";

// Ashley Furniture: 6 endpoints. search() and product() serve ashleyfurniture.com
// (country "us", the default) and Ashley's licensed storefronts: ca
// (ashleyhomestore.ca, CAD), mx (store.ashleyfurniture.com.mx, MXN, Spanish),
// ph (store.ashleyfurniture.ph, PHP), sa (store.ashley.sa, SAR, English) and tr
// (ashleyturkiye.com, TRY, Turkish). They cost 2 credits on us and mx and 1
// credit on ca, ph, sa and tr. category(), deals(), stores() and store() are us
// only at 2 credits, so they take no country. Every answer carries country,
// language, currency and source_domain.
//
// Prices are numbers in the market's currency, never converted. regular_price
// is Ashley's own "Regular Price", which Ashley's terms define as its highest
// advertised price in store and online, offered to customers using special
// long-term financing. Ashley prices vary by region and there is no ZIP input:
// every us answer returns priced_for (zipcode, price_zone), the ZIP and price
// zone Ashley priced that answer for, so two calls can come back priced for
// different zones.
//
// The server enforces the cross-field rules: product() takes sku (us), handle
// (licensee storefronts, with country) or url; page and sort on search() are us
// only; category() takes path or category_url; store() takes store_id or url.
// Every call raises the request timeout to ASHLEY_TIMEOUT. Failed upstream
// calls are not charged; an unknown item number, category or store is a
// charged 404.

/** Minimum request timeout (ms) for every ashley call. */
export const ASHLEY_TIMEOUT = 120_000;

/** us (ashleyfurniture.com) or a licensed storefront: ca, mx, ph, sa, tr. */
export type AshleyCountry = "us" | "ca" | "mx" | "ph" | "sa" | "tr";

/** best_sellers (default), price_asc, price_desc, newest, rating or name (A to Z). */
export type AshleySort = "best_sellers" | "price_asc" | "price_desc" | "newest" | "rating" | "name";

/** black_friday (default), clearance or hot_buys. */
export type AshleyDealEvent = "black_friday" | "clearance" | "hot_buys";

/** Store search radius in miles (default 50). */
export type AshleyStoreRadius = 10 | 25 | 50 | 100;

export interface AshleyGridOptions {
  /** Grid page, 1-based (30 products per page). A page past the last returns no items and a note. */
  page?: number;
  /** Sort order. Defaults to "best_sellers". */
  sort?: AshleySort;
  /** Facet refinements: {facets[].id: options[].value}, e.g. {facetUpholsteryDesign: "Chaise"}. At most 6 facets. */
  filters?: Record<string, string | string[]>;
  /** Lowest price (USD), applied to Ashley's own price list. */
  price_min?: number;
  /** Highest price (USD). */
  price_max?: number;
}

export interface AshleySearchOptions {
  /** Search keywords, e.g. "sofa" (tr: Turkish keywords such as "koltuk"). */
  query: string;
  /** Market. Defaults to "us". */
  country?: AshleyCountry;
  /** us only: results page, 1-based (48 per page). */
  page?: number;
  /** us only: sort order. Defaults to "best_sellers". */
  sort?: AshleySort;
  [key: string]: unknown;
}

export interface AshleyProductOptions {
  /** us: an Ashley item number (items[].sku), e.g. "5950418". One of sku, handle or url. */
  sku?: string;
  /** ca, mx, ph, sa, tr: the product handle from search (items[].handle), e.g. "aviemore-sofa". Send it with country. */
  handle?: string;
  /** A product page on a served storefront (the market is read from it). */
  url?: string;
  /** Market. Defaults to "us"; required with handle. */
  country?: AshleyCountry;
  [key: string]: unknown;
}

export interface AshleyCategoryOptions extends AshleyGridOptions {
  /** The part after /c/ in a category URL, e.g. "furniture/living-room/sofas". One of path or category_url. */
  path?: string;
  /** An ashleyfurniture.com category page (/c/... URL); refinements in it are kept. */
  category_url?: string;
  [key: string]: unknown;
}

export interface AshleyDealsOptions extends AshleyGridOptions {
  /** Deal event. Defaults to "black_friday". */
  event?: AshleyDealEvent;
  [key: string]: unknown;
}

export interface AshleyStoresOptions {
  /** Latitude in decimal degrees, e.g. 40.7506 (there is no address or ZIP lookup). */
  lat: number;
  /** Longitude in decimal degrees, e.g. -73.9972. */
  lng: number;
  /** Search radius in miles. Defaults to 50. */
  radius?: AshleyStoreRadius;
  [key: string]: unknown;
}

export interface AshleyStoreOptions {
  /** A store id from stores() (stores[].store_id), e.g. "us/wisconsin/greenfield/4771-s-27th-st/luxe". One of store_id or url. */
  store_id?: string;
  /** A store page on stores.ashleyfurniture.com (stores[].url). */
  url?: string;
  [key: string]: unknown;
}

export class AshleyNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/ashley/${path}`, options, undefined, ASHLEY_TIMEOUT);
  }

  /**
   * Search Ashley Furniture by keyword. us: 48 results per page with the
   * exact total, sorted by best sellers, price, newest, customer rating or
   * name; items carry position, sku, master_id, name, brand, url, image,
   * swatch_image, price, regular_price, discount_percent, color, size, flag,
   * badges, new_since, rating, review_count, variant_count, variants and
   * promotions; also priced_for, total, total_pages, page_size, sorts_offered
   * and facets (informational: use category() for filters). ca, mx, ph, sa,
   * tr: the storefront's best matches (up to 10; tr its first results page)
   * with handle (for product()), product_id, name, brand, product_type, url,
   * image, price, regular_price, discount_percent and available; no sort,
   * paging or total.
   *
   * Costs 2 credits on us and mx, 1 credit on ca, ph, sa and tr.
   */
  async search(options: AshleySearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Ashley product. us (by sku or url): priced_for, price,
   * regular_price, discount_percent, badges, item_status, description,
   * features, options, variants, is_set and components (each piece of a set
   * with its own price and stock), dimensions, materials, assembly, images,
   * breadcrumbs, stock (status, quantity, delivery), nearest_store, rating,
   * review_count, rating_histogram, reviews (the first 10 the page shows; no
   * review paging), customer_photos, questions_total and questions. ca, mx,
   * ph, sa, tr (by handle or url, not sku): sku, handle, product_id, name,
   * brand, product_type, url, price, regular_price, discount_percent,
   * available, description, options, variants and images.
   *
   * Costs 2 credits on us and mx, 1 credit on ca, ph, sa and tr.
   */
  async product(options: AshleyProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One ashleyfurniture.com category's products (30 per page) by path or
   * category_url, sorted and filtered: category (path, name, url,
   * breadcrumbs), priced_for, items, count, total, page, page_size,
   * total_pages, sort, requested_filters and facets. us only.
   *
   * Costs 2 credits.
   */
  async category(options: AshleyCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The products of one Ashley deal event (black_friday, clearance or
   * hot_buys), with the category sorts and filters: event, event_name,
   * event_url, priced_for and the category grid fields. us only.
   *
   * Costs 2 credits.
   */
  async deals(options: AshleyDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * Ashley stores near a point (lat and lng; no address or ZIP lookup):
   * latitude, longitude, radius_miles, count and stores with store_id, name
   * and url, alphabetical (not by distance). Call store() for the address,
   * phone and hours. us only.
   *
   * Costs 2 credits.
   */
  async stores(options: AshleyStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One Ashley store by store_id or url: name, url, phone, address,
   * latitude, longitude, hours (day, opens, closes), payment_accepted,
   * services, rating, image and map_url. us only.
   *
   * Costs 2 credits.
   */
  async store(options: AshleyStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }
}
