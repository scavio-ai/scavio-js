import type { Scavio } from "../client.js";

// Barnes & Noble (barnesandnoble.com, the US bookseller) search, product, storeAvailability,
// stores, store, suggestions, bestsellers, category, categories and deals endpoints; US only,
// prices in USD, store pickup flags (no unit counts), 1 credit each. Generated from the backend
// routes: every option and its doc mirrors the API's own request schema; an input the API only
// accepts to refuse (a 400 that says 'not offered') is left out. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to BARNESANDNOBLE_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and
// refused inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every barnesandnoble call. */
export const BARNESANDNOBLE_TIMEOUT = 240_000;

export interface BarnesandnobleSearchOptions {
  /** Keywords: title, author, series, ISBN or subject. */
  query: string;
  /**
   * The site's sort menu: relevance (Top Matches, default), bestselling, newest, oldest, price_asc,
   * price_desc, title (A to Z). price_asc puts free eBooks first.
   */
  sort?: "relevance" | "bestselling" | "newest" | "oldest" | "price_asc" | "price_desc" | "title";
  /**
   * The site's own filters: format, availability, price, subject, age, language; a value or a list
   * of values each (at most 10 in all). facets in an answer lists the values with their counts.
   */
  filters?: { format: string | string[]; availability: string | string[]; price: string | string[]; subject: string | string[]; age: string | string[]; language: string | string[] };
  /**
   * us (default and the only market: barnesandnoble.com serves the United States, prices in USD).
   * Anything else is a 400, not charged.
   */
  country?: string;
  [key: string]: unknown;
}

export interface BarnesandnobleProductOptions {
  /**
   * The book's EAN / ISBN-13 (items[].ean, formats[].ean; 978, 979 or Barnes & Noble's 2940 digital
   * EANs), or an ISBN-10 (converted to its 978 EAN). Check digits are verified.
   */
  ean?: string | number;
  /** Alternative to ean: an ISBN-10 or ISBN-13 (dashes allowed). */
  isbn?: string | number;
  /**
   * us (default and the only market: barnesandnoble.com serves the United States, prices in USD).
   * Anything else is a 400, not charged.
   */
  country?: string;
  [key: string]: unknown;
}

export interface BarnesandnobleStoreAvailabilityOptions {
  /**
   * The book's EAN / ISBN-13 (items[].ean, formats[].ean; 978, 979 or Barnes & Noble's 2940 digital
   * EANs), or an ISBN-10 (converted to its 978 EAN). Check digits are verified.
   */
  ean?: string | number;
  /** Alternative to ean: an ISBN-10 or ISBN-13 (dashes allowed). */
  isbn?: string | number;
  /**
   * Where to check: a US ZIP code (60611), a city and state ("Austin, TX") or a Barnes & Noble
   * store number (2234).
   */
  near: string;
  /**
   * us (default and the only market: barnesandnoble.com serves the United States, prices in USD).
   * Anything else is a 400, not charged.
   */
  country?: string;
  [key: string]: unknown;
}

export interface BarnesandnobleStoresOptions {
  /** A US ZIP code or a city and state ("Austin, TX"). */
  near?: string;
  /** Latitude (with longitude), instead of near. */
  latitude?: number;
  /** Longitude (with latitude). */
  longitude?: number;
  /**
   * us (default and the only market: barnesandnoble.com serves the United States, prices in USD).
   * Anything else is a 400, not charged.
   */
  country?: string;
  [key: string]: unknown;
}

export interface BarnesandnobleStoreOptions {
  /** A Barnes & Noble store id (stores[].store_id). */
  store_id: string | number;
  /**
   * us (default and the only market: barnesandnoble.com serves the United States, prices in USD).
   * Anything else is a 400, not charged.
   */
  country?: string;
  [key: string]: unknown;
}

export interface BarnesandnobleSuggestionsOptions {
  /** What the shopper has typed so far. */
  query: string;
  /**
   * us (default and the only market: barnesandnoble.com serves the United States, prices in USD).
   * Anything else is a 400, not charged.
   */
  country?: string;
  [key: string]: unknown;
}

export interface BarnesandnobleBestsellersOptions {
  /**
   * top (default: the site's Bestsellers page), books (Bestselling Books), nyt (The New York Times
   * Best Sellers), stores (B&N Stores Bestsellers, hardcover fiction and nonfiction).
   */
  list?: "top" | "books" | "nyt" | "stores";
  /**
   * us (default and the only market: barnesandnoble.com serves the United States, prices in USD).
   * Anything else is a 400, not charged.
   */
  country?: string;
  [key: string]: unknown;
}

export interface BarnesandnobleCategoryOptions {
  /** A collection path (categories[].path, topics[].path; /collections/ optional). */
  path?: string;
  /**
   * A barnesandnoble.com/collections/ link, instead of path (its query string is not read: send
   * sort and filters).
   */
  url?: string;
  /**
   * The site's sort menu: relevance (Top Matches, default), bestselling, newest, oldest, price_asc,
   * price_desc, title (A to Z). price_asc puts free eBooks first.
   */
  sort?: "relevance" | "bestselling" | "newest" | "oldest" | "price_asc" | "price_desc" | "title";
  /**
   * The site's own filters: format, availability, price, subject, age, language; a value or a list
   * of values each (at most 10 in all). facets in an answer lists the values with their counts.
   */
  filters?: { format: string | string[]; availability: string | string[]; price: string | string[]; subject: string | string[]; age: string | string[]; language: string | string[] };
  /**
   * us (default and the only market: barnesandnoble.com serves the United States, prices in USD).
   * Anything else is a 400, not charged.
   */
  country?: string;
  [key: string]: unknown;
}

export interface BarnesandnobleCategoriesOptions {
  /**
   * us (default and the only market: barnesandnoble.com serves the United States, prices in USD).
   * Anything else is a 400, not charged.
   */
  country?: string;
  [key: string]: unknown;
}

export interface BarnesandnobleDealsOptions {
  /**
   * black_friday (default: the Black Friday and Cyber Monday deals page while it runs), coupons
   * (Coupons & Deals), kids (Book Deals for Kids), ebooks (eBook deals), audiobooks (audiobook
   * deals).
   */
  type?: "black_friday" | "coupons" | "kids" | "ebooks" | "audiobooks";
  /**
   * us (default and the only market: barnesandnoble.com serves the United States, prices in USD).
   * Anything else is a 400, not charged.
   */
  country?: string;
  [key: string]: unknown;
}

export class BarnesandnobleNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = BARNESANDNOBLE_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/barnesandnoble/${path}`, options, undefined, timeout);
  }

  /**
   * Search Barnes & Noble (barnesandnoble.com, the US bookseller). Scavio fetches the public
   * barnesandnoble.com page on request; Barnes & Noble has no public API. US storefront, prices in
   * US dollars. By keyword (title, author, series, ISBN), sorted with the site's sort menu and
   * filtered by format, availability, price band, subject, age and language. Costs 1 credit.
   */
  async search(options: BarnesandnobleSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One title of Barnes & Noble (barnesandnoble.com, the US bookseller). Scavio fetches the public
   * barnesandnoble.com page on request; Barnes & Noble has no public API. US storefront, prices in
   * US dollars. By EAN / ISBN-13 or ISBN-10 (converted to its 978 EAN). Costs 1 credit.
   */
  async product(options: BarnesandnobleProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Store pickup availability of one title at the Barnes & Noble stores near a ZIP code, a city or
   * a store number (usually 16-32 stores, nearest first). Costs 1 credit.
   */
  async storeAvailability(options: BarnesandnobleStoreAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.post("store-availability", options);
  }

  /**
   * The Barnes & Noble stores near a US ZIP code, a city and state or a point, nearest first. Costs
   * 1 credit.
   */
  async stores(options: BarnesandnobleStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /** One Barnes & Noble store by id. Costs 1 credit. */
  async store(options: BarnesandnobleStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * The search-box suggestions of Barnes & Noble (barnesandnoble.com, the US bookseller). Scavio
   * fetches the public barnesandnoble.com page on request; Barnes & Noble has no public API. US
   * storefront, prices in US dollars. For a partial query. Costs 1 credit.
   */
  async suggestions(options: BarnesandnobleSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * A bestseller list of Barnes & Noble (barnesandnoble.com, the US bookseller). Scavio fetches the
   * public barnesandnoble.com page on request; Barnes & Noble has no public API. US storefront,
   * prices in US dollars. The Bestsellers page (top, default), Bestselling Books, The New York
   * Times Best Sellers or B&N Stores Bestsellers. Costs 1 credit.
   */
  async bestsellers(options: BarnesandnobleBestsellersOptions = {}): Promise<Record<string, unknown>> {
    return this.post("bestsellers", options);
  }

  /**
   * One collection of Barnes & Noble (barnesandnoble.com, the US bookseller). Scavio fetches the
   * public barnesandnoble.com page on request; Barnes & Noble has no public API. US storefront,
   * prices in US dollars. By path or link (Mystery & Thriller, New Releases, Kids ages 3-5 ...),
   * sorted and filtered like search. Costs 1 credit.
   */
  async category(options: BarnesandnobleCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The header navigation of Barnes & Noble (barnesandnoble.com, the US bookseller). Scavio fetches
   * the public barnesandnoble.com page on request; Barnes & Noble has no public API. US storefront,
   * prices in US dollars. As the site shows it. Costs 1 credit.
   */
  async categories(options: BarnesandnobleCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * A deals page of Barnes & Noble (barnesandnoble.com, the US bookseller). Scavio fetches the
   * public barnesandnoble.com page on request; Barnes & Noble has no public API. US storefront,
   * prices in US dollars. The Black Friday and Cyber Monday deals (default, while the site runs
   * it), Coupons & Deals, Book Deals for Kids, eBook or audiobook deals. Costs 1 credit.
   */
  async deals(options: BarnesandnobleDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }
}
