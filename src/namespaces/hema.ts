import type { Scavio } from "../client.js";

// HEMA (hema.com, the Dutch variety store; not the chemical HEMA,
// hydroxyethyl methacrylate): 13 endpoints, 1 credit each.
//
// Webshops: country nl (default, www.hema.nl), be (plus language nl or fr),
// fr and de. HEMA also has stores in lu and at: only stores(), store() and
// storeStock() serve them (elsewhere a 400, not charged). Names, labels and
// promotion texts come in the market's language as HEMA writes them (Dutch on
// the default nl market); prices are numbers in EUR. Article numbers (sku)
// are the same in every market and prices are set per market: price one
// article on each market you report. HEMA notes that online prices can
// differ from store prices.
//
// storeStock(): up to 12 articles in the stores near a city, postcode or
// point (or across a country): per store the sellable units HEMA's store
// service reports and the stock level (full, regular or limited), shelf
// locations, hours, address and distance; stock as HEMA reports it, not a
// promise that the shelf has it. product(): EAN, variants and the dated
// price_schedule, upcoming promotions included (e.g. 2+1 gratis with its
// valid_from / valid_to). offers() (nl, be): HEMA's validity label, the ISO
// valid_to, the week and the promotion cards (no products on that page).
// reviews(): HEMA's own reviews, pages 1 to 5 (8, then 30 more a page); nl,
// fr and de read the Dutch pool, be its own; no reviewer identity. No brands
// endpoint (HEMA sells its own brand). Not available: price history (poll and
// store the answers), checkout or ordering, the photo service and cake
// ordering, other countries (no UK or Spain).
//
// The server enforces the cross-field rules: product() takes one of sku or
// url; stores() and storeStock() take query or lat + lng, not both (neither =
// the whole country); language only for be. Every call raises the request
// timeout to HEMA_TIMEOUT. Failed upstream calls and refused inputs are not
// charged; a not-found is charged.

/** Minimum request timeout (ms) for every hema call: reviews take 15 to 70 s and calls can queue behind the server's upstream limit. */
export const HEMA_TIMEOUT = 240_000;

/** The HEMA webshop (default "nl"): nl, be (language nl or fr), fr or de. */
export type HemaCountry = "nl" | "be" | "fr" | "de";

/** Every country with HEMA stores (stores, store and store stock): the four webshop countries plus lu and at. */
export type HemaStoreCountry = HemaCountry | "lu" | "at";

/** For be: "nl" (default) or "fr". The other countries have one language: leave it out. */
export type HemaLanguage = "nl" | "fr" | "de";

/** relevance (default, HEMA's own order), price_asc, price_desc, newest or best_selling. */
export type HemaSort = "relevance" | "price_asc" | "price_desc" | "newest" | "best_selling";

/** newest (default) or highest (highest rating first). */
export type HemaReviewSort = "newest" | "highest";

/** A HEMA article number: items[].sku (6 to 8 digits, the same in every market). */
export type HemaSku = string | number;

export interface HemaMarketOptions {
  /** The HEMA webshop (default "nl"). */
  country?: HemaCountry;
  /** be: "nl" (default) or "fr". Other countries: leave it out. */
  language?: HemaLanguage;
}

export interface HemaListOptions extends HemaMarketOptions {
  /** Sort. Defaults to "relevance". A from-price tile is placed by one of its variants' prices. */
  sort?: HemaSort;
  /** Page, 1 to 100 (24 products a page). */
  page?: number;
  /** Up to 6 facets: { "<facets[].facet>": "<facets[].values[].value>" or [values] }, e.g. { maincolour: "zwart" }. */
  filters?: Record<string, string | string[]>;
  /** Only HEMA's new collection. */
  new_only?: boolean;
  /** Lowest price (EUR). */
  price_min?: number;
  /** Highest price (EUR). */
  price_max?: number;
}

export interface HemaLocationOptions {
  /** A city, town or postcode, e.g. "Utrecht". Leave query and lat / lng out for the whole country. */
  query?: string;
  /** Or latitude (with lng). */
  lat?: number;
  /** Longitude (with lat). */
  lng?: number;
  /** Search radius around the place in km, 1 to 300 (default 50). */
  radius_km?: number;
}

export interface HemaSearchOptions extends HemaListOptions {
  /** Search text (the market's language works best: "sokken", "kaars", "bougie", "Kerze"). */
  query: string;
  [key: string]: unknown;
}

export interface HemaProductOptions extends HemaMarketOptions {
  /** HEMA article number (items[].sku), e.g. "15300147", or a colour group id. One of sku or url. */
  sku?: HemaSku;
  /** Or a HEMA product link (www.hema.nl or www.hema.com/<locale>/...); the market comes from the link. */
  url?: string;
  [key: string]: unknown;
}

export interface HemaCategoryOptions extends HemaListOptions {
  /** A category path (categories() categories[].path, e.g. "baby/babykleding") or its HEMA link. */
  category: string;
  [key: string]: unknown;
}

export interface HemaCategoriesOptions extends HemaMarketOptions {
  /** Levels to return, 1 to 3 (default 3). */
  depth?: number;
  [key: string]: unknown;
}

export interface HemaNewArrivalsOptions extends Omit<HemaListOptions, "new_only"> {
  [key: string]: unknown;
}

export interface HemaSaleOptions extends Omit<HemaListOptions, "country"> {
  /** "nl" (default, the sale page), "be" or "de" (the outlet page). France has no sale page. */
  country?: "nl" | "be" | "de";
  [key: string]: unknown;
}

export interface HemaOffersOptions {
  /** "nl" (default) or "be": the two markets with HEMA's weekly offers page. */
  country?: "nl" | "be";
  /** For be: "nl" (default) or "fr". */
  language?: "nl" | "fr";
  [key: string]: unknown;
}

export interface HemaCampaignOptions extends HemaMarketOptions {
  /** "christmas" (all markets), "sinterklaas" (nl and be), a campaign slug ("kerst", "noel", "weihnachten", "saint-nicolas") or its link. */
  campaign: string;
  [key: string]: unknown;
}

export interface HemaSuggestionsOptions extends HemaMarketOptions {
  /** What the shopper has typed so far, e.g. "kerst". */
  query: string;
  [key: string]: unknown;
}

export interface HemaStoreMarketOptions {
  /** "nl" (default), "be", "fr", "de", "lu" or "at": every country with HEMA stores. */
  country?: HemaStoreCountry;
  /** For be: "nl" (default) or "fr". */
  language?: HemaLanguage;
}

export interface HemaStoreStockOptions extends HemaStoreMarketOptions, HemaLocationOptions {
  /** 1 to 12 article numbers of one size and colour (items[].sku or variants[].sku). */
  skus: HemaSku[];
  /** Stores to return, 1 to 50 (default 10). */
  limit?: number;
  /** Only stores that hold at least one of the articles. */
  in_stock_only?: boolean;
  [key: string]: unknown;
}

export interface HemaStoresOptions extends HemaStoreMarketOptions, HemaLocationOptions {
  /** Stores to return (default 20 near a place, every store of the country without one, up to 1000). */
  limit?: number;
  [key: string]: unknown;
}

export interface HemaStoreOptions {
  /** A HEMA store id (stores[].store_id, up to 4 digits), e.g. "0013". */
  store_id: string | number;
  /** An article number: adds that article's stock in this store. */
  sku?: HemaSku;
  [key: string]: unknown;
}

export interface HemaReviewsOptions extends HemaMarketOptions {
  /** HEMA article number (items[].sku), e.g. "10860090". */
  sku: HemaSku;
  /** Defaults to "newest". */
  sort?: HemaReviewSort;
  /** 1 = the first 8 reviews, each later page the next 30, up to 5. */
  page?: number;
  [key: string]: unknown;
}

export class HemaNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/hema/${path}`, options, undefined, HEMA_TIMEOUT);
  }

  /**
   * Search HEMA (hema.com, the Dutch variety store), 24 products a page:
   * country, language, market, currency, query, redirected_to, list_type,
   * sort, page, page_size, total, total_pages, has_more, count, items (sku,
   * name, price, was_price, price_from, discount_percent, promotion, labels,
   * stock_status, online, rating), facets. A keyword HEMA sends to a landing
   * page (e.g. kerst) comes back as that page's carousels.
   *
   * Costs 1 credit.
   */
  async search(options: HemaSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One HEMA (hema.com, the Dutch variety store) product in full on one
   * market, by article number or link: ean, variants, specifications, price,
   * was_price, unit_price, promotion {label, valid_from, valid_to},
   * price_schedule (dated prices, upcoming promotions included), online_stock,
   * sellable_in_store, order_limit. An article number HEMA does not have is a
   * charged 404.
   *
   * Costs 1 credit.
   */
  async product(options: HemaProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One HEMA (hema.com, the Dutch variety store) category's products by path
   * or link, with filters, sort and paging.
   *
   * Costs 1 credit.
   */
  async category(options: HemaCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * HEMA's (hema.com, the Dutch variety store) category menu on one market
   * (13 to 18 departments, 3 levels): categories {name, path, url, level,
   * child_count, children}.
   *
   * Costs 1 credit.
   */
  async categories(options: HemaCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * HEMA's (hema.com, the Dutch variety store) new collection on one market
   * (about 550 to 1,100 products), with sort, paging and filters.
   *
   * Costs 1 credit.
   */
  async newArrivals(options: HemaNewArrivalsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("new-arrivals", options);
  }

  /**
   * HEMA's (hema.com, the Dutch variety store) sale page (nl) or outlet page
   * (be, de), with sort, paging and filters. France has no sale page (a 400,
   * not charged).
   *
   * Costs 1 credit.
   */
  async sale(options: HemaSaleOptions = {}): Promise<Record<string, unknown>> {
    return this.post("sale", options);
  }

  /**
   * HEMA's (hema.com, the Dutch variety store) weekly offers page (nl, be):
   * label (HEMA's validity text as shown), valid_to (ISO date), week,
   * sections {name, week, cards {title, subtitle, url, category}}. Promotion
   * cards, no products: each product's mechanic and dates are on the lists
   * and product().
   *
   * Costs 1 credit.
   */
  async offers(options: HemaOffersOptions = {}): Promise<Record<string, unknown>> {
    return this.post("offers", options);
  }

  /**
   * A HEMA (hema.com, the Dutch variety store) campaign page with its
   * products and promotion texts: christmas (all markets), sinterklaas (nl,
   * be) or a campaign slug; carousels {title, link, count, skus}.
   *
   * Costs 1 credit.
   */
  async campaign(options: HemaCampaignOptions): Promise<Record<string, unknown>> {
    return this.post("campaign", options);
  }

  /**
   * HEMA (hema.com, the Dutch variety store) search suggestions for a partial
   * query: phrases, categories, products (up to 5), terms, content.
   *
   * Costs 1 credit.
   */
  async suggestions(options: HemaSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * HEMA store stock: up to 12 HEMA (hema.com, the Dutch variety store)
   * articles in the stores near a city, postcode or point (or across a
   * country), in nl, be, fr, de, lu and at: location, summary {sku,
   * stores_with_stock}, stores {store_id, name, address, distance_km, hours,
   * stock {sku, sellable_units, stock_level (full, regular or limited),
   * shelf_locations, in_stock}}. Stock as HEMA's store service reports it,
   * not a promise that the shelf has it.
   *
   * Costs 1 credit.
   */
  async storeStock(options: HemaStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /**
   * HEMA (hema.com, the Dutch variety store) stores of one country (about
   * 570 nl, 111 be, 69 fr, 17 de, 5 at, 4 lu), or the ones near a city,
   * postcode or point: stores {store_id, name, status, operator, address,
   * distance_km, phone, hours, special_hours, closed_dates, services}.
   *
   * Costs 1 credit.
   */
  async stores(options: HemaStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One HEMA (hema.com, the Dutch variety store) store by id, in any HEMA
   * country: address, hours, services, status, and with sku that article's
   * stock {sellable_units, stock_level, shelf_locations, in_stock}. An
   * unknown store id is a charged 404.
   *
   * Costs 1 credit.
   */
  async store(options: HemaStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * Customer reviews of one HEMA (hema.com, the Dutch variety store) article:
   * review_pool (nl-nl for nl, fr and de; nl-be for be), total_text_reviews,
   * total_ratings, average_rating, rating_distribution, reviews {review_id,
   * language, rating, title, text, submitted_at, recommends,
   * verified_purchaser}. No reviewer identity. Slower than the other
   * endpoints (15 to 70 s).
   *
   * Costs 1 credit.
   */
  async reviews(options: HemaReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }
}
