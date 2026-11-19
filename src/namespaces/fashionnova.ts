import type { Scavio } from "../client.js";

// Fashion Nova: 7 endpoints, 1 credit each.
//
// Markets: the 104 countries in Fashion Nova's own country selector (country,
// default us), each in its own currency (37 currencies: us USD, ca CAD, gb GBP,
// au AUD, mx MXN, jp JPY, ae AED, the euro countries EUR ...; zz is the site's
// International storefront, USD). language is en (default, every country) or
// es (Spanish titles, descriptions and attributes, in 67 countries; not the US
// store). A country or language Fashion Nova does not run answers 400 before
// anything is charged. categories() and suggestions() are the same in every
// storefront, reviews() is one English review pool shared by every market (no
// country), and similar() answers from the US store in USD.
//
// Prices are numbers in the storefront's currency, never converted: price (the
// lowest size price), compare_at (the site's struck-through price),
// percent_off (computed by Scavio: round((1 - price / compare_at) * 100)),
// on_sale, price_with_code (the price with the site's current promo code, when
// it shows one) and final_sale. In the 27 EEA countries (at, be, cy, cz, de,
// dk, ee, es, fi, fr, gr, hu, ie, is, it, lt, lu, lv, mt, nl, no, pl, pt, ro,
// se, si, sk) Fashion Nova shows VAT-inclusive prices and no compare-at price,
// so compare_at and percent_off are null there.
// sizes[].quantity is the stock Fashion Nova's page shows per size, not a
// guaranteed inventory count.
//
// search() is semantic and matched loosely: its total moves between calls, a
// later page can repeat a few items, and it shows its first 18 pages of 60 (6
// under a sort other than featured); narrow with filters. collection() pages
// through fully (pages 1 to 200). A facet the list does not offer matches
// nothing and is listed in unrecognized_filters (present only then). Reviewer
// names are never returned. Not available: stores (Fashion Nova lists none), a
// brand directory (everything is Fashion Nova), price history, gift cards,
// new-arrival dates.
//
// The server enforces the cross-field rules: product(), reviews(), similar()
// and collection() take one of handle or url; language es only where the
// storefront serves Spanish; search() page 1 to 18, or 1 to 6 under a sort.
// Every call raises the request timeout to FASHIONNOVA_TIMEOUT. Failed
// upstream calls are not charged; a not-found is charged.

/** Minimum request timeout (ms) for every fashionnova call: review pages take 20 to 60 s and are retried server-side. */
export const FASHIONNOVA_TIMEOUT = 240_000;

/** The 104 countries in Fashion Nova's country selector (zz = the International storefront, USD). */
export type FashionnovaCountry =
  | "ac" | "ad" | "ae" | "ag" | "ai" | "al" | "am" | "ao" | "at" | "au" | "ax" | "be" | "bl" | "ca"
  | "cc" | "ch" | "ck" | "cl" | "cx" | "cy" | "cz" | "de" | "dk" | "do" | "ee" | "eh" | "es" | "fi"
  | "fk" | "fo" | "fr" | "gb" | "gf" | "gg" | "gl" | "gp" | "gr" | "gs" | "hk" | "hu" | "ie" | "il"
  | "io" | "iq" | "is" | "it" | "jp" | "kg" | "ki" | "kr" | "ky" | "lt" | "lu" | "lv" | "mc" | "me"
  | "mf" | "mq" | "mt" | "mx" | "my" | "mz" | "ng" | "nl" | "no" | "nr" | "nu" | "nz" | "pe" | "ph"
  | "pl" | "pm" | "pn" | "pt" | "qa" | "re" | "ro" | "ru" | "sa" | "sb" | "sc" | "se" | "sg" | "sh"
  | "si" | "sj" | "sk" | "sx" | "ta" | "tf" | "tj" | "tk" | "tm" | "to" | "tv" | "um" | "us" | "va"
  | "wf" | "ws" | "xk" | "yt" | "za" | "zz";

/** en (default) or es (only in the 67 countries whose storefront serves Spanish; not us). */
export type FashionnovaLanguage = "en" | "es";

/** featured (default), best_selling, price_low, price_high, newest. */
export type FashionnovaSort = "featured" | "best_selling" | "price_low" | "price_high" | "newest";

/** highest_rated (default, the page's own), most_recent, most_helpful, lowest_rated. */
export type FashionnovaReviewSort = "highest_rated" | "most_recent" | "most_helpful" | "lowest_rated";

/** List division filter: women or curve (Fashion Nova's plus range). */
export type FashionnovaDivision = "women" | "curve";

/** Navigation division of categories() and suggestions(): women (default), men or curve. */
export type FashionnovaNavDivision = "women" | "men" | "curve";

export interface FashionnovaMarketOptions {
  /** Country, ISO-2 lower case. Defaults to "us". */
  country?: FashionnovaCountry;
  /** Language. Defaults to "en"; "es" only where the storefront serves Spanish. */
  language?: FashionnovaLanguage;
}

export interface FashionnovaListOptions extends FashionnovaMarketOptions {
  /** Sort. Defaults to "featured". */
  sort?: FashionnovaSort;
  /** Sizes (facets name size), e.g. ["M", "L"]: up to 10 in a list, or 15 comma-separated. */
  size?: string | string[];
  /** Colour families, up to 10 (facets name color): black, blue, white, pink, brown, red ... */
  color?: string | string[];
  /** Lowest price, whole units of the storefront's currency. */
  price_min?: number;
  /** Highest price, whole units of the storefront's currency. */
  price_max?: number;
  /** women or curve, or both. */
  division?: FashionnovaDivision | FashionnovaDivision[];
  /** Categories as the site writes them (facets name category), e.g. "Jeans", "Dresses". */
  category?: string | string[];
  /** Other facets by facets[].name: value or list of values (facets[].values[].value), e.g. { fit_type: "Baggy" }. Up to 10. */
  filters?: Record<string, string | string[]>;
}

export interface FashionnovaSearchOptions extends FashionnovaListOptions {
  /** Search text, e.g. "bodycon dress". Semantic: narrow with filters. */
  query: string;
  /** Page, 60 per page: 1 to 18, or 1 to 6 with a sort other than featured. */
  page?: number;
  [key: string]: unknown;
}

export interface FashionnovaCollectionOptions extends FashionnovaListOptions {
  /** Collection handle (categories() handles), e.g. "sale", "best-sellers", "new", "back-in-stock". One of handle or url. */
  handle?: string;
  /** A fashionnova.com collection link (https://www.fashionnova.com/collections/<handle>). */
  url?: string;
  /** Page, 60 per page, 1 to 200. */
  page?: number;
  [key: string]: unknown;
}

export interface FashionnovaProductRef {
  /** Style handle (items[].handle), e.g. "san-diego-sculpting-stretch-flare-jeans". One of handle or url. */
  handle?: string;
  /** A fashionnova.com product link (https://www.fashionnova.com/products/<handle>?color=<colour>), any storefront. */
  url?: string;
  /** Colour slug (items[].color_slug), e.g. "black-wash". Defaults to the style's default colour. */
  color?: string;
}

export interface FashionnovaProductOptions extends FashionnovaProductRef, FashionnovaMarketOptions {
  [key: string]: unknown;
}

export interface FashionnovaReviewsOptions extends FashionnovaProductRef {
  /** Sort. Defaults to "highest_rated". */
  sort?: FashionnovaReviewSort;
  /** Only reviews with this star rating (1-5). */
  star?: 1 | 2 | 3 | 4 | 5;
  /** Page, 10 reviews each, 1 to 8. */
  page?: number;
  [key: string]: unknown;
}

export interface FashionnovaSimilarOptions extends FashionnovaProductRef {
  /** Products to return, 1 to 24 (default 12). */
  limit?: number;
  [key: string]: unknown;
}

export interface FashionnovaCategoriesOptions {
  /** Division. Defaults to "women". */
  division?: FashionnovaNavDivision;
  [key: string]: unknown;
}

export interface FashionnovaSuggestionsOptions extends FashionnovaCategoriesOptions {
  /** What the shopper has typed so far, e.g. "dress". */
  query: string;
}

export class FashionnovaNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/fashionnova/${path}`, options, undefined, FASHIONNOVA_TIMEOUT);
  }

  /**
   * Search one Fashion Nova storefront, 60 per page up to page 18 (6 under a
   * sort): country, language, currency, sort, filters, page, total,
   * total_pages, has_more, count, items (product_id, handle, color,
   * color_slug, title, url, price, compare_at, percent_off, on_sale,
   * price_with_code, final_sale, badge, in_stock, sizes_in_stock, sizes
   * {size, quantity, available, low_stock}, image, colors), facets. Semantic:
   * the total moves between calls; narrow with filters.
   *
   * Costs 1 credit.
   */
  async search(options: FashionnovaSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One style in one colour by handle (+ color) or link: price, compare_at,
   * percent_off, price_with_code, promo, final_sale, sizes {size, sku, price,
   * compare_at, quantity, available, low_stock}, every colour with its own
   * sizes, rating {average, count, histogram, fit, fit_score}, the first 3
   * reviews, site_ai_review_summary (Fashion Nova's own AI summary), size_guide,
   * delivery, attributes, materials. An unknown handle or colour is a charged
   * 404.
   *
   * Costs 1 credit.
   */
  async product(options: FashionnovaProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One collection by handle or link (sale, best-sellers, new,
   * new-this-week, back-in-stock, jeans ...), to full depth (pages 1 to 200
   * of 60), with the search filters and sorts. An unknown handle is a charged
   * 404.
   *
   * Costs 1 credit.
   */
  async collection(options: FashionnovaCollectionOptions): Promise<Record<string, unknown>> {
    return this.post("collection", options);
  }

  /**
   * The navigation tree for women (default), men or curve as collection
   * handles: categories {name, handle, url, sections}, trending_searches. The
   * same handles work in every storefront.
   *
   * Costs 1 credit.
   */
  async categories(options: FashionnovaCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * Search suggestions for a partial query: queries, products {product_id,
   * title, title_es, handle, color_slug, url, image} (no prices), collections.
   * The same for every storefront.
   *
   * Costs 1 credit.
   */
  async suggestions(options: FashionnovaSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * One style's reviews, 10 per page, pages 1 to 8, sorted and filtered by
   * star: total (as returned), rating, reviews {id, rating, title, body,
   * date, verified_buyer, votes_up, votes_down, fit, fit_score,
   * size_purchased, usual_size, color_purchased, language, topics}. One
   * English pool for every storefront (no country). No reviewer names. Takes
   * 20 to 60 seconds.
   *
   * Costs 1 credit.
   */
  async reviews(options: FashionnovaReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * Up to 24 styles Fashion Nova recommends as similar to one style (US
   * store, USD), as search items.
   *
   * Costs 1 credit.
   */
  async similar(options: FashionnovaSimilarOptions): Promise<Record<string, unknown>> {
    return this.post("similar", options);
  }
}
