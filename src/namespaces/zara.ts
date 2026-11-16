import type { Scavio } from "../client.js";

// Zara: 12 endpoints, each billed what the request spent (credits_used in the
// response): 2 credits per call for search, materials, stock, stores,
// categories and category; product 2 (4 by reference or when the slug is
// another market's or language's, 6 for both); storeStock 2 with store_ids,
// 4 with lat + lng; deals 4 (2 when the market has no special-prices
// category); newArrivals 4; prices 2 per market that answered; suggestions 2
// (4 when the English fallback runs). China (cn, Zara's separate site) costs 1
// credit per call instead of 2.
//
// Markets: the 102 Zara storefronts with an online store of their own
// (country, default "us"; gb for the United Kingdom), each in its own currency
// and Zara's own languages (language, default the first Zara lists): e.g. us
// (USD; en, es), ca (CAD; en, fr), mx (MXN; es, en), br (BRL; pt, en), gb
// (GBP; en), es (EUR; es, en, eu, gl, ca), ch (CHF; en, fr, de, it), pl (PLN;
// pl, uk, en), jp (JPY; ja, en), kr (KRW; ko, en), cn (CNY; zh, en), hk, mo
// and tw (zh-Hant, en); ic is the Canary Islands, xe Abu Dhabi, Al Ain and Ras
// Al Khaimah, xk Kosovo. stores() and storeStock() are not served on ao or iq
// (Zara lists no stores there), newArrivals() not on dz, suggestions() not on
// ad, al, am, az, ba, dz, mk, mo, uz or xk. Belarus, uk (use gb) and the
// countries Zara serves only from its worldwide store answer 400 before
// anything is charged. Every answer carries country, language and currency.
//
// Product ids (one per colour) and references are global on Zara's
// international site; cn runs its own ids, so use the reference there. Prices
// are numbers in the market's own currency, never converted; old_price is set
// only on a markdown. No reviews (Zara shows none) and no price history.
//
// The server enforces the cross-field rules: language must be one the market
// serves; search() takes query or reference; product() takes url, product_id
// + slug, or reference; storeStock() takes store_ids or lat + lng; color and
// size values come from the same market's facets. Every call raises the
// request timeout to ZARA_TIMEOUT. Failed upstream calls are not charged; a
// not-found is charged.

/** Minimum request timeout (ms) for every zara call. */
export const ZARA_TIMEOUT = 120_000;

/** The 102 Zara storefronts (gb is the United Kingdom). */
export type ZaraCountry =
  | "ad" | "ae" | "al" | "am" | "ao" | "ar" | "at" | "au" | "aw" | "az" | "ba" | "be" | "bg"
  | "bh" | "br" | "ca" | "ch" | "cl" | "cn" | "co" | "cr" | "cw" | "cy" | "cz" | "de" | "dk"
  | "do" | "dz" | "ec" | "ee" | "eg" | "es" | "fi" | "fr" | "gb" | "ge" | "gr" | "gt" | "hk"
  | "hn" | "hr" | "hu" | "ic" | "id" | "ie" | "il" | "in" | "iq" | "is" | "it" | "jo" | "jp"
  | "kh" | "kr" | "kw" | "kz" | "lb" | "lt" | "lu" | "lv" | "ma" | "mc" | "me" | "mk" | "mo"
  | "mt" | "mx" | "my" | "ni" | "nl" | "no" | "nz" | "om" | "pa" | "pe" | "ph" | "pl" | "pr"
  | "pt" | "py" | "qa" | "ro" | "rs" | "sa" | "se" | "sg" | "si" | "sk" | "sv" | "th" | "tn"
  | "tr" | "tw" | "ua" | "us" | "uy" | "uz" | "ve" | "vn" | "xe" | "xk" | "za";

/** stores() and storeStock() markets: every storefront except ao and iq (100). */
export type ZaraStoresCountry = Exclude<ZaraCountry, "ao" | "iq">;

/** newArrivals() markets: every storefront except dz (101). */
export type ZaraNewArrivalsCountry = Exclude<ZaraCountry, "dz">;

/** suggestions() markets (92). */
export type ZaraSuggestionsCountry = Exclude<
  ZaraCountry,
  "ad" | "al" | "am" | "az" | "ba" | "dz" | "mk" | "mo" | "uz" | "xk"
>;

/** Each market serves its own languages (see the header comment); another answers 400. */
export type ZaraLanguage =
  | "ar" | "bg" | "ca" | "cs" | "da" | "de" | "el" | "en" | "es" | "et" | "eu" | "fi" | "fr" | "gl"
  | "he" | "hr" | "hu" | "hy" | "id" | "it" | "ja" | "ka" | "kk" | "ko" | "lt" | "lv" | "mk" | "nl"
  | "no" | "pl" | "pt" | "ro" | "ru" | "sk" | "sl" | "sq" | "sr" | "sv" | "th" | "tr" | "uk" | "uz"
  | "vi" | "zh" | "zh-Hant";

/** relevance (default, Zara's own order), price_asc or price_desc. */
export type ZaraSort = "relevance" | "price_asc" | "price_desc";

/** search() and suggestions() sections (default: every section). */
export type ZaraSearchSection = "woman" | "man" | "kids" | "home";

/** categories() sections. */
export type ZaraCategorySection = "woman" | "man" | "kids" | "home" | "beauty";

/** deals() and newArrivals() sections (default woman). */
export type ZaraTreeSection = "woman" | "man" | "girl" | "boy";

export interface ZaraMarketOptions<C extends string = ZaraCountry> {
  /** Zara market. Defaults to "us". */
  country?: C;
  /** Language of the market. Defaults to Zara's own default for it. */
  language?: ZaraLanguage;
}

export interface ZaraPagingOptions {
  /** Results page, 1-based (up to 100). */
  page?: number;
  /** Items per page, 1 to 96 (default 24). */
  page_size?: number;
  /** Sort order. Defaults to "relevance". */
  sort?: ZaraSort;
}

export interface ZaraSearchOptions extends ZaraMarketOptions, ZaraPagingOptions {
  /** Search keywords in any language, e.g. "blazer". One of query or reference. */
  query?: string;
  /** A Zara reference (display_reference), e.g. "4591/381": all its colours. */
  reference?: string;
  /** woman, man, kids or home (default: every section). */
  section?: ZaraSearchSection;
  /** One value of the color facet of an earlier answer in the same market (e.g. "black"). */
  color?: string;
  /** One value of the size facet of an earlier answer (e.g. "38"). */
  size?: string;
  /** Lowest price, in the market's currency. */
  price_min?: number;
  /** Highest price, in the market's currency. */
  price_max?: number;
  [key: string]: unknown;
}

export interface ZaraProductOptions extends ZaraMarketOptions {
  /** A Zara product link from any market; its market is used unless country is sent. */
  url?: string;
  /** The colour's product id (items[].product_id), e.g. "553306790"; goes with slug. */
  product_id?: string;
  /** The product's slug (items[].seo_slug), e.g. "100-wool-suit-blazer-p04591381". */
  slug?: string;
  /** A Zara reference (display_reference), e.g. "4591/381". */
  reference?: string;
  [key: string]: unknown;
}

export interface ZaraMaterialsOptions extends ZaraMarketOptions {
  /** The colour's product id, e.g. "588478514". */
  product_id: string;
  [key: string]: unknown;
}

export interface ZaraStockOptions {
  /** The colour's product id, e.g. "588478514". */
  product_id: string;
  /** Zara market. Defaults to "us". */
  country?: ZaraCountry;
  [key: string]: unknown;
}

export interface ZaraStoresOptions extends ZaraMarketOptions<ZaraStoresCountry> {
  /** Latitude of a point in the country, e.g. 40.7128 (New York). */
  lat: number;
  /** Longitude, e.g. -74.006 (New York). */
  lng: number;
  [key: string]: unknown;
}

export interface ZaraStoreStockOptions extends ZaraMarketOptions<ZaraStoresCountry> {
  /** The colour's product id, e.g. "553306790". */
  product_id: string;
  /** Up to 8 store ids (stores[].store_id of stores()), e.g. ["3904", "3862"]. One of store_ids or lat + lng. */
  store_ids?: string[];
  /** Latitude: the 8 nearest stores (with lng). */
  lat?: number;
  /** Longitude (with lat). */
  lng?: number;
  [key: string]: unknown;
}

export interface ZaraCategoriesOptions extends ZaraMarketOptions {
  /** Only one part of the tree. */
  section?: ZaraCategorySection;
  [key: string]: unknown;
}

export interface ZaraCategoryOptions extends ZaraMarketOptions, ZaraPagingOptions {
  /** A leaf id of categories() (or a parent's redirect_id), e.g. "2420896" (women's dresses on us). */
  category_id: string;
  /** Only marked-down items (with old_price). */
  on_sale?: boolean;
  [key: string]: unknown;
}

export interface ZaraDealsOptions extends ZaraMarketOptions, ZaraPagingOptions {
  /** Section. Defaults to "woman". */
  section?: ZaraTreeSection;
  [key: string]: unknown;
}

export interface ZaraNewArrivalsOptions extends ZaraMarketOptions<ZaraNewArrivalsCountry>, ZaraPagingOptions {
  /** Section. Defaults to "woman". */
  section?: ZaraTreeSection;
  [key: string]: unknown;
}

export interface ZaraPricesOptions {
  /** A Zara reference (display_reference), e.g. "4591/381". */
  reference: string;
  /** 1 to 10 markets (default us, gb, es, de, fr, it, jp, kr, mx, pl). */
  countries?: ZaraCountry[];
  /** Language for the titles where the market serves it (else the market's default). */
  language?: ZaraLanguage;
  [key: string]: unknown;
}

export interface ZaraSuggestionsOptions extends ZaraMarketOptions<ZaraSuggestionsCountry> {
  /** What the shopper has typed so far, e.g. "jea". */
  query: string;
  /** woman, man, kids or home (default: every section). */
  section?: ZaraSearchSection;
  [key: string]: unknown;
}

export class ZaraNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/zara/${path}`, options, undefined, ZARA_TIMEOUT);
  }

  /**
   * Search one market's catalogue by keyword, or look up a reference (all
   * its colours; the answer adds sold_here): items (product_id, reference,
   * display_reference, title, url, seo_slug, section, family, subfamily,
   * price, old_price, discount_percent, currency, availability, colors,
   * additional_colors, tags, image), count, total, page, page_size, has_more,
   * sort, sorts_offered, filters, facets (color and size) and price_range.
   * cn takes no sort.
   *
   * Costs 2 credits (1 on cn).
   */
  async search(options: ZaraSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product by link, product_id + slug, or reference: description, the
   * prices, composition, every colour (hex, prices, promotions, sizes with
   * sku and online availability: in_stock, out_of_stock, low_on_stock,
   * coming_soon, store_stock_available, images) and color_count. A product id
   * alone does not open a product page: send its slug, a url or a reference.
   * An unknown product is a charged 404.
   *
   * Costs 2 credits; 4 by reference or when the slug is another market's or
   * language's (Zara's own link is followed once); 6 for both; 1 on cn.
   */
  async product(options: ZaraProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Composition, care and origin as the product page states them:
   * composition, sustainable_materials, certifications, care, origin (the
   * country of production as Zara states it) and, on fr, traceability. Zara
   * names no factories.
   *
   * Costs 2 credits (1 on cn).
   */
  async materials(options: ZaraMaterialsOptions): Promise<Record<string, unknown>> {
    return this.post("materials", options);
  }

  /**
   * Online availability per size of one colour: skus (sku, availability),
   * sizes_total and sizes_in_stock. Online stock, not store stock (see
   * storeStock()); match sku to product()'s colors[].sizes[].sku.
   *
   * Costs 2 credits (1 on cn).
   */
  async stock(options: ZaraStockOptions): Promise<Record<string, unknown>> {
    return this.post("stock", options);
  }

  /**
   * Stores near a point of the country, nearest first: store_id, address,
   * city, postal_code, lat, lng, distance_km, phones, opening_hours (7 dated
   * days), sections, services, pickup and status. Pass store_id values to
   * storeStock() as store_ids. Not on ao or iq.
   *
   * Costs 2 credits (1 on cn).
   */
  async stores(options: ZaraStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * Units of one colour in physical stores, per size (units, on_sale,
   * sales_floor_units, stockroom_units), units_total and the location in the
   * store; stores_with_stock and stores_without_stock. By up to 8 store_ids
   * or by lat + lng (the 8 nearest stores). Not on ao or iq.
   *
   * Costs 2 credits with store_ids, 4 with lat + lng (1 on cn).
   */
  async storeStock(options: ZaraStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /**
   * The category tree of a market in the request language: id, name,
   * section, parent_id, level, leaf, redirect_id and key. Category ids are
   * shared across the northern-hemisphere markets; au, za and br run their
   * own.
   *
   * Costs 2 credits (1 on cn).
   */
  async categories(options: ZaraCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * Every product of one category (a leaf id), paged and sorted over the
   * whole list: items, total, total_pages, on_sale_count. An unknown id is a
   * charged 404; a parent without products of its own a charged 400.
   *
   * Costs 2 credits (1 on cn).
   */
  async category(options: ZaraCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The market's SPECIAL PRICES category for a section (default woman),
   * found live in the market's category tree: items with old_price and
   * discount_percent, marked_down and paging. Where Zara shows no
   * special-prices category the answer has no items and a note (not an
   * error); on fr, be, lu, mc and iq Zara lists special prices without a
   * previous price.
   *
   * Costs 4 credits (2 when the market has no special-prices category; 1 on cn).
   */
  async deals(options: ZaraDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * The market's NEW ARRIVALS > THE NEW category for a section (default
   * woman), found live in the market's category tree. Not on dz.
   *
   * Costs 4 credits (1 on cn).
   */
  async newArrivals(options: ZaraNewArrivalsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("new-arrivals", options);
  }

  /**
   * Zara prices by country: one reference across up to 10 markets (country,
   * language, currency, available, title, price, old_price,
   * discount_percent, product_id, url, colors), not_sold and errors. Each
   * price is in that market's own currency, never converted.
   *
   * Costs 2 credits per market that answered (1 on cn); failed markets are not charged.
   */
  async prices(options: ZaraPricesOptions): Promise<Record<string, unknown>> {
    return this.post("prices", options);
  }

  /**
   * Search suggestions for what a shopper has typed, in the market's
   * language: suggestions (text), count and language_used (en when the
   * market's English suggestions answered instead).
   *
   * Costs 2 credits, 4 when the English fallback is used (1 on cn).
   */
  async suggestions(options: ZaraSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
