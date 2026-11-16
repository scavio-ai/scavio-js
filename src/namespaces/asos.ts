import type { Scavio } from "../client.js";

// ASOS: 11 endpoints, 1 credit each.
//
// Markets: the 235 countries in ASOS's own country selector (country, default
// "gb"; gb for the United Kingdom, not uk), served by 13 ASOS stores. Eleven
// have a site of their own in their own language: gb (GBP), us and pr (USD),
// fr and mc (EUR, French; the French overseas territories in USD), de and at
// (EUR, German), es and ad (EUR, Spanish), it, sm and va (EUR, Italian), au
// (AUD), dk (DKK), nl (EUR), pl (PLN), se (SEK). ASOS's European store (33
// countries, English: ie, pt, be, fi, gr, cz, hu, ro, no ...) and its
// international store (170 countries, English: ca, mx, in, za, ch, nz, ae, sa,
// hk, il, jp, kr, sg, tw, cn ...) serve the rest. currency (default ASOS's own
// default for the country) takes any currency ASOS offers the country: 245
// country-currency combinations, e.g. ae AED or GBP, il ILS, GBP or USD, jp
// USD or GBP. Every endpoint serves every combination except suggestions() on
// pl. Russia and Belarus (ASOS is not selling there), uk and countries ASOS
// does not list answer 400 before anything is charged. Every answer carries
// country, currency, store and language.
//
// Product and category ids are global: the same id on every store (titles in
// the store's language). Countries served by the same ASOS store in the same
// currency share one price list, except Ireland, which has its own euro prices
// on ASOS's European store (measured 2026-11-16 on all 245 country-currency
// combinations); which products are offered still differs by country. price is
// the lowest size price when ASOS prices sizes differently (variants carry each
// size's price). Prices come back as numbers in the request's currency, never
// converted: price, previous_price, rrp, lowest_price_30d, is_marked_down,
// is_outlet, discount_percent and discount_basis. stock() is online stock per
// variant (ASOS has no physical stores) with variant ids, not size names.
// Keyword search serves at most 2,088 results (max_reachable); category lists
// page through everything. No outlet, no promo codes, no price history.
//
// The server enforces the cross-field rules: product() takes one of
// product_id, group_id or url; currency must be one ASOS offers the country;
// facet values come from an earlier answer. Every call raises the request
// timeout to ASOS_TIMEOUT. Failed upstream calls are not charged; a not-found
// is charged.

/** Minimum request timeout (ms) for every asos call. */
export const ASOS_TIMEOUT = 120_000;

/** The 235 countries ASOS sells in (gb is the United Kingdom). */
export type AsosCountry =
  | "ad" | "ae" | "af" | "ag" | "ai" | "al" | "am" | "ao" | "aq" | "ar" | "as" | "at" | "au" | "aw"
  | "ax" | "az" | "ba" | "bb" | "bd" | "be" | "bf" | "bg" | "bh" | "bi" | "bj" | "bl" | "bm" | "bn"
  | "bo" | "bq" | "br" | "bs" | "bt" | "bw" | "bz" | "ca" | "cc" | "cd" | "cf" | "cg" | "ch" | "ci"
  | "ck" | "cl" | "cm" | "cn" | "co" | "cr" | "cv" | "cw" | "cx" | "cy" | "cz" | "de" | "dj" | "dk"
  | "dm" | "do" | "dz" | "ec" | "ee" | "eg" | "eh" | "er" | "es" | "et" | "fi" | "fj" | "fk" | "fm"
  | "fo" | "fr" | "ga" | "gb" | "gd" | "ge" | "gf" | "gh" | "gi" | "gl" | "gm" | "gn" | "gp" | "gq"
  | "gr" | "gs" | "gt" | "gu" | "gw" | "gy" | "hk" | "hn" | "hr" | "ht" | "hu" | "id" | "ie" | "il"
  | "in" | "io" | "iq" | "is" | "it" | "jm" | "jo" | "jp" | "ke" | "kg" | "kh" | "ki" | "km" | "kn"
  | "kr" | "kw" | "ky" | "kz" | "la" | "lb" | "lc" | "li" | "lk" | "lr" | "ls" | "lt" | "lu" | "lv"
  | "ma" | "mc" | "md" | "me" | "mf" | "mg" | "mh" | "mk" | "ml" | "mm" | "mn" | "mo" | "mp" | "mq"
  | "mr" | "ms" | "mt" | "mu" | "mv" | "mw" | "mx" | "my" | "mz" | "na" | "nc" | "ne" | "nf" | "ng"
  | "ni" | "nl" | "no" | "np" | "nr" | "nu" | "nz" | "om" | "pa" | "pe" | "pf" | "pg" | "ph" | "pk"
  | "pl" | "pm" | "pn" | "pr" | "ps" | "pt" | "pw" | "py" | "qa" | "re" | "ro" | "rs" | "rw" | "sa"
  | "sb" | "sc" | "sd" | "se" | "sg" | "sh" | "si" | "sj" | "sk" | "sl" | "sm" | "sn" | "sr" | "ss"
  | "st" | "sv" | "sx" | "sz" | "tc" | "td" | "tf" | "tg" | "th" | "tj" | "tk" | "tl" | "tm" | "tn"
  | "to" | "tr" | "tt" | "tv" | "tw" | "tz" | "ua" | "ug" | "um" | "us" | "uy" | "uz" | "va" | "vc"
  | "vg" | "vi" | "vn" | "vu" | "wf" | "ws" | "xk" | "yt" | "za" | "zm" | "zw";
/** suggestions() countries: every country except pl (234). */
export type AsosSuggestionsCountry = Exclude<AsosCountry, "pl">;

/** Currencies ASOS offers (each country accepts its own subset; markets() lists them). */
export type AsosCurrency =
  | "AED" | "AUD" | "CAD" | "CHF" | "CNY" | "DKK" | "EUR" | "GBP" | "HKD" | "ILS" | "NOK" | "NZD"
  | "PLN" | "SAR" | "SEK" | "SGD" | "TWD" | "USD";

/** relevance (default, ASOS's own order), newest, price_asc or price_desc. */
export type AsosSort = "relevance" | "newest" | "price_asc" | "price_desc";

/** reviews() order (default relevance). */
export type AsosReviewSort = "relevance" | "newest" | "oldest" | "rating_desc" | "rating_asc";

/** search() and category() gender filter (ASOS's Gender facet). */
export type AsosGender = "women" | "men" | "unisex";

/** categories(), brands(), deals() and newArrivals() section. */
export type AsosSection = "women" | "men";

/** Colour names (or base_colour facet ids). */
export type AsosColor =
  | "red" | "green" | "blue" | "black" | "white" | "yellow" | "orange" | "purple" | "pink" | "brown"
  | "gold" | "silver" | "copper" | "grey" | "multi" | "navy" | "neutral";

/** Body-fit ranges (or Body Fit facet ids, attribute_10155). */
export type AsosRange = "plus" | "petite" | "tall" | "maternity" | "hourglass" | "wide_fit" | "fuller_bust";

type Ids<T extends string = string> = T | string | number | Array<T | string | number>;

export interface AsosMarketOptions<C extends string = AsosCountry> {
  /** Country. Defaults to "gb". */
  country?: C;
  /** Currency. Defaults to ASOS's own default for the country. */
  currency?: AsosCurrency;
}

export interface AsosGridOptions {
  /** Results page, 1-based (up to 1000). */
  page?: number;
  /** Items per page, 1 to 200 (default 72). */
  page_size?: number;
  /** Sort order. Defaults to "relevance". */
  sort?: AsosSort;
  /** Brand facet value ids of an earlier answer (e.g. "53" ASOS DESIGN, "401" Levi's); several are ORed. Not brands()[].brand_id. */
  brand?: Ids;
  /** Colour names or base_colour facet ids; several are ORed. */
  color?: Ids<AsosColor>;
  /** Size facet value ids of an earlier answer (e.g. "279" XS); several are ORed. */
  size?: Ids;
  /** Body-fit range names or Body Fit facet ids. */
  range?: Ids<AsosRange>;
  /** Product Type facet value ids (attribute_1047), e.g. "8393" Jeans. */
  product_type?: Ids;
  /** Lowest price, in the request's currency. */
  price_min?: number;
  /** Highest price, in the request's currency. */
  price_max?: number;
  /** Any other facet of an earlier answer: { facet id: value id or [value ids] }. */
  facets?: Record<string, string | string[]>;
}

export interface AsosSearchOptions extends AsosMarketOptions, AsosGridOptions {
  /** Search keywords (in the store's language or English), e.g. "jeans". */
  query: string;
  /** women, men or unisex. */
  gender?: AsosGender;
  /** Only sale items (ASOS's Sale facet). */
  on_sale?: boolean;
  [key: string]: unknown;
}

export interface AsosProductOptions extends AsosMarketOptions {
  /** An ASOS product id (items[].product_id), e.g. "210309625". One of product_id, group_id or url. */
  product_id?: string | number;
  /** An ASOS co-ord group id (items[].group_id, the number after /grp/ in a link). */
  group_id?: string | number;
  /** An ASOS product link from any store; its store's country is used unless country is sent. */
  url?: string;
  [key: string]: unknown;
}

export interface AsosStockOptions extends AsosMarketOptions {
  /** 1 to 100 ASOS product ids (a list or comma-separated), e.g. ["205338218", "206956133"]. */
  product_ids: string | Array<string | number>;
  [key: string]: unknown;
}

export interface AsosReviewsOptions extends AsosMarketOptions {
  /** An ASOS product id, e.g. "210309625". */
  product_id: string | number;
  /** Results page, 1-based (up to 500). */
  page?: number;
  /** Reviews per page, 1 to 50 (default 10). */
  page_size?: number;
  /** Order. Defaults to "relevance". */
  sort?: AsosReviewSort;
  /** Only reviews with this star rating (1 to 5). */
  rating?: 1 | 2 | 3 | 4 | 5;
  [key: string]: unknown;
}

export interface AsosSuggestionsOptions extends AsosMarketOptions<AsosSuggestionsCountry> {
  /** What the shopper has typed so far, e.g. "dre". */
  query: string;
  [key: string]: unknown;
}

export interface AsosCategoryOptions extends AsosMarketOptions, AsosGridOptions {
  /** An ASOS category id (categories() category_id or brands() brand_id), e.g. "8799" women's dresses. */
  category_id: string | number;
  /** women, men or unisex. */
  gender?: AsosGender;
  /** Only sale items (ASOS's Sale facet). */
  on_sale?: boolean;
  [key: string]: unknown;
}

export interface AsosCategoriesOptions extends AsosMarketOptions {
  /** women or men (default: both). */
  gender?: AsosSection;
  [key: string]: unknown;
}

export interface AsosBrandsOptions extends AsosMarketOptions {
  /** women or men (default women). */
  gender?: AsosSection;
  [key: string]: unknown;
}

export interface AsosListOptions extends AsosMarketOptions, AsosGridOptions {
  /** women or men (default women). */
  gender?: AsosSection;
  [key: string]: unknown;
}

export type AsosDealsOptions = AsosListOptions;
export type AsosNewArrivalsOptions = AsosListOptions;

export interface AsosMarketsOptions extends AsosMarketOptions {
  [key: string]: unknown;
}

export class AsosNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/asos/${path}`, options, undefined, ASOS_TIMEOUT);
  }

  /**
   * Search one store by keyword: items (product_id, product_type, group_id,
   * title, brand, color, url, the prices, currency, selling_fast,
   * restocking_soon, is_new, sponsored, color_product_ids, image, images,
   * video), total, max_reachable, page, page_size, has_more, sort,
   * sorts_offered, filters, facets and price_range. At most 2,088 results
   * are reachable whatever total says: narrow with filters or use category().
   *
   * Costs 1 credit.
   */
  async search(options: AsosSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product by product_id, group_id or link: description, composition,
   * care, size_and_fit, the prices, variants (variant_id, size, sku, ean,
   * price, previous_price, in_stock, low_stock: online stock per size),
   * rating (with fit and quality), ai_summary (ASOS's own AI summary of
   * reviews), color_products, images and video. A co-ord set answers the
   * group (items[]). An unknown id, or a product the store does not sell, is
   * a charged 404.
   *
   * Costs 1 credit.
   */
  async product(options: AsosProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Price and online stock of up to 100 products in one call: products
   * (product_id, the prices, in_stock, variants with variant_id, in_stock,
   * low_stock, price, previous_price), count and not_found. Variant ids, not
   * size names: product() maps them to sizes. ASOS has no physical stores.
   *
   * Costs 1 credit.
   */
  async stock(options: AsosStockOptions): Promise<Record<string, unknown>> {
    return this.post("stock", options);
  }

  /**
   * Reviews of one product on one store, up to 50 per page: summary (average,
   * count, distribution, recommended, fit and quality averages), ai_summary
   * (ASOS's labelled AI summary) and reviews (rating, title, text, date, fit,
   * quality, verified_purchaser, syndicated, source, photos). Which reviews
   * come back depends on the store: gb, us, au and ASOS's European and
   * international stores share one English review pool; es, it, nl, se, dk and
   * pl add reviews written in their own language to that pool; fr and de show
   * only reviews written in French or German (each review carries its
   * language; totals differ by store). No reviewer names.
   *
   * Costs 1 credit.
   */
  async reviews(options: AsosReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * Search suggestions for what a shopper has typed, in the store's language:
   * suggestions (text, count). Not on pl.
   *
   * Costs 1 credit.
   */
  async suggestions(options: AsosSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Every product of one category (or brand page: pass brands()' brand_id),
   * paged and sorted through the whole list: category_id, category_name,
   * items, total, has_more, facets and price_range. An unknown id is a
   * charged 404.
   *
   * Costs 1 credit.
   */
  async category(options: AsosCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The store's women and men navigation tree in the store's language:
   * sections with category nodes (name, category_id, url, path, children).
   *
   * Costs 1 credit.
   */
  async categories(options: AsosCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * The store's A-Z brand list for women or men (default women): brands
   * (brand_id, name, url, letter). brand_id is a category id: pass it to
   * category(); the search() brand filter takes brand facet ids instead.
   *
   * Costs 1 credit.
   */
  async brands(options: AsosBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /**
   * The store's SALE category for women (7046) or men (8409), default women:
   * items with previous_price and discount_percent, marked_down, paging and
   * facets.
   *
   * Costs 1 credit.
   */
  async deals(options: AsosDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * The store's NEW IN category for women (27108) or men (27110), default
   * women; sort "newest" for the latest first.
   *
   * Costs 1 credit.
   */
  async newArrivals(options: AsosNewArrivalsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("new-arrivals", options);
  }

  /**
   * Every country ASOS sells in: country, name, store, language, currencies
   * (the first is the default), default_currency, size_schema and served;
   * selected carries the requested country's live currencies.
   *
   * Costs 1 credit.
   */
  async markets(options: AsosMarketsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("markets", options);
  }
}
