import type { Scavio } from "../client.js";

// Uniqlo: 12 endpoints, 1 credit per call; storeStock 2 when resolved from
// product_id + color + size (1 with l2_id); prices 1 per market that answered
// (a market that does not sell the product answers too; failed markets are
// free). credits_used in the response is the exact charge.
//
// Markets (country, default "us"; language, default the local language):
//   - every endpoint: us (USD; en), jp (JPY; ja), kr (KRW; ko)
//   - search + product: tw (TWD; zh-Hant), hk (HKD; zh-Hant), cn (CNY;
//     zh-Hans), Uniqlo's Greater China sites, with their own product codes
//   - product + prices: au (AUD; en), be (EUR; nl, fr, en), ca (CAD; en, fr),
//     de (EUR; de, en), dk (DKK; en), es (EUR; es, en), fr (EUR; fr, en), gb
//     (GBP; en; "uk" accepted), id (IDR; id, en), in (INR; en), it (EUR; it,
//     en), my (MYR; en), nl (EUR; nl, en), ph (PHP; en), se (SEK; en), sg
//     (SGD; en), th (THB; th, en), vn (VND; vi, en), and Uniqlo's EU store
//     (EUR; en) for at, bg, cz, ee, fi, gr, hr, hu, ie, lt, lu, lv, pl, pt,
//     ro, si and sk.
// Countries with no Uniqlo online store (ch, no, nz, mx, tr, ae, il, ru), a
// market an endpoint does not serve and a language a market does not serve
// (dk da, se sv, us es, jp en, kr en, in hi, my ms) answer 400 before anything
// is charged. Every answer carries country, language and currency.
//
// Product ids (E479000-000) are global on uniqlo.com; tw, hk and cn use their
// own codes (u0000000055478). Prices are numbers in the market's own currency,
// never converted. On us, jp, kr and ca (and on some items sg, my and in)
// Uniqlo marks a drop with flags only (on_sale, limited_offer, price_flags), so
// promo_price equals price; in Europe, Australia and most of Southeast Asia
// promo_price is below price. Only a limited-time offer has a window: quote
// Uniqlo's own label in price_flags.name (e.g. "until 11/18"), not a date read
// from end; a sale flag carries a start but no end, and Select Colors/Sizes
// Only carries no dates. price_group: product and prices default to "00",
// Uniqlo's regular price list; search can list the same product_id again in
// group "01", mostly the Select Colors/Sizes Only sale price for some colours /
// sizes (pass price_group "01" to product() to read it); prices compares "00"
// unless price_group is sent. No price history, no store-level prices. GU is a
// separate brand and not a separate platform here; Uniqlo's own listings can
// include GU collaboration items (kr limited offers did).
//
// The server enforces the cross-field rules: language must be one the market
// serves; product() takes product_id or url; storeStock() takes l2_id or
// product_id + color + size; stores() takes lat + lng or store_id; sort
// best_selling is tw / hk / cn only and top_rated us / jp / kr only; flag
// online_only is jp only. Every call raises the request timeout to
// UNIQLO_TIMEOUT. Failed upstream calls are not charged; a not-found is
// charged.

/** Minimum request timeout (ms) for every uniqlo call. */
export const UNIQLO_TIMEOUT = 240_000;

/** Markets that serve every endpoint. */
export type UniqloFullCountry = "us" | "jp" | "kr";

/** Uniqlo's Greater China sites: search and product only, with their own product codes. */
export type UniqloGreaterChinaCountry = "tw" | "hk" | "cn";

/** search() markets. */
export type UniqloSearchCountry = UniqloFullCountry | UniqloGreaterChinaCountry;

/** prices() markets: the 38 uniqlo.com markets (uk is accepted for gb). */
export type UniqloPricesCountry =
  | UniqloFullCountry
  | "au" | "be" | "ca" | "de" | "dk" | "es" | "fr" | "gb" | "uk" | "id" | "in" | "it" | "my"
  | "nl" | "ph" | "se" | "sg" | "th" | "vn"
  | "at" | "bg" | "cz" | "ee" | "fi" | "gr" | "hr" | "hu" | "ie" | "lt" | "lu" | "lv" | "pl"
  | "pt" | "ro" | "si" | "sk";

/** product() markets: 41 (uk is accepted for gb). */
export type UniqloProductCountry = UniqloPricesCountry | UniqloGreaterChinaCountry;

/** Each market serves its own languages (see the header comment); another answers 400. */
export type UniqloLanguage =
  | "en" | "ja" | "ko" | "de" | "es" | "fr" | "id" | "it" | "nl" | "th" | "vi" | "zh-Hant" | "zh-Hans";

/** Sorts on us, jp and kr. */
export type UniqloSort = "featured" | "newest" | "price_asc" | "price_desc" | "top_rated";

/** search() sorts: top_rated on us / jp / kr, best_selling on tw / hk / cn. */
export type UniqloSearchSort = UniqloSort | "best_selling";

export type UniqloGender = "women" | "men" | "kids" | "baby";

/** Items Uniqlo flags; online_only is jp only. */
export type UniqloFlag = "sale" | "limited_offer" | "new" | "new_color" | "coming_soon" | "online_only";

export type UniqloReviewSort = "newest" | "oldest" | "most_helpful" | "highest" | "lowest";

export interface UniqloMarketOptions<C extends string = UniqloFullCountry> {
  /** Uniqlo market. Defaults to "us". */
  country?: C;
  /** Language of the market. Defaults to the local language. */
  language?: UniqloLanguage;
}

export interface UniqloPagingOptions<S extends string = UniqloSort> {
  /** Results page, 1-based (up to 500). */
  page?: number;
  /** Items per page, 1 to 100 (default 24; 48 at most on tw, hk, cn). Uniqlo answers up to offset 500. */
  page_size?: number;
  /** Sort order. Defaults to "featured" (Uniqlo's order). */
  sort?: S;
}

export interface UniqloSearchOptions
  extends UniqloMarketOptions<UniqloSearchCountry>, UniqloPagingOptions<UniqloSearchSort> {
  /** Search keywords in the market's language (Chinese on tw, hk, cn), e.g. "heattech". */
  query: string;
  gender?: UniqloGender;
  /** 1 to 4 category ids (a node's path from categories()), comma-joined or as an array. */
  category_path?: string | string[];
  flag?: UniqloFlag;
  /** Colour code from facets.colors (e.g. "COL09") or its 2-digit display code ("09"). */
  color?: string;
  /** Size code from facets.sizes (e.g. "SMA004" = M, "INS030" = 30 inch). */
  size?: string;
  /** Lowest price, in the market's currency. */
  price_min?: number;
  /** Highest price, in the market's currency. */
  price_max?: number;
  [key: string]: unknown;
}

export interface UniqloProductOptions extends UniqloMarketOptions<UniqloProductCountry> {
  /** E + 6 digits + -000 on uniqlo.com (e.g. "E479000-000"), u + 13 digits on tw, hk, cn. One of product_id or url. */
  product_id?: string;
  /** A Uniqlo product link from any market; its market is used unless country is sent. */
  url?: string;
  /** Price group (items[].price_group, default "00" = Uniqlo's regular price list; "01" is mostly the Select Colors/Sizes Only sale price search lists for some colours / sizes). */
  price_group?: string;
  [key: string]: unknown;
}

export interface UniqloStockOptions extends UniqloMarketOptions {
  /** A uniqlo.com product id, e.g. "E479000-000". */
  product_id: string;
  /** Price group (items[].price_group, default "00"). */
  price_group?: string;
  [key: string]: unknown;
}

export interface UniqloStoreStockOptions extends UniqloMarketOptions {
  /** Latitude of a point in the country (40.758 New York, 35.6595 Tokyo, 37.5636 Seoul). */
  lat: number;
  /** Longitude (-73.9855 New York, 139.7005 Tokyo, 126.9826 Seoul). */
  lng: number;
  /** Variant id (variants[].l2_id of stock() or product()), e.g. "08665900". One of l2_id or product_id + color + size. */
  l2_id?: string;
  /** With color and size, instead of l2_id (2 credits). */
  product_id?: string;
  /** Price group the variant came from (items[].price_group or the product's price_group, default "00"), with l2_id or with product_id + color + size. A variant of price group 01 asked as 00 reads out of stock in every store. */
  price_group?: string;
  /** With product_id: colour code (colors[].code, e.g. "COL67"). */
  color?: string;
  /** With product_id: size code (sizes[].code, e.g. "INS028"). */
  size?: string;
  /** With product_id, when the product comes in lengths: length code (lengths[].code). */
  length?: string;
  /** Stores, 1 to 10 (default 10). */
  limit?: number;
  [key: string]: unknown;
}

export interface UniqloStoresOptions extends UniqloMarketOptions {
  /** With lng: stores nearest this point. One of lat + lng or store_id. */
  lat?: number;
  lng?: number;
  /** One store by id (stores[].store_id). */
  store_id?: string;
  /** Stores per page, 1 to 10 (default 10). */
  limit?: number;
  /** Results page, 1-based (up to 100). */
  page?: number;
  [key: string]: unknown;
}

export interface UniqloReviewsOptions extends UniqloMarketOptions {
  product_id: string;
  /** Results page, 1-based (up to 1000). */
  page?: number;
  /** Reviews per page, 1 to 25 (default 10). */
  page_size?: number;
  /** Defaults to "newest". */
  sort?: UniqloReviewSort;
  [key: string]: unknown;
}

export interface UniqloSuggestionsOptions extends UniqloMarketOptions {
  /** What the shopper has typed so far, e.g. "jea". Absent: Uniqlo's trending search words. */
  query?: string;
  [key: string]: unknown;
}

export interface UniqloCategoryOptions extends UniqloMarketOptions, UniqloPagingOptions {
  /** 1 to 4 category ids (gender, class, category, subcategory), e.g. "22210,23296,23339" (women > bottoms > jeans on us). */
  category_path: string | string[];
  flag?: UniqloFlag;
  [key: string]: unknown;
}

export interface UniqloDealsOptions extends UniqloMarketOptions, UniqloPagingOptions {
  /** sale (default: items flagged Sale) or limited_offer (items flagged Limited-Time Offer). */
  type?: "sale" | "limited_offer";
  gender?: UniqloGender;
  [key: string]: unknown;
}

export interface UniqloNewArrivalsOptions extends UniqloMarketOptions, UniqloPagingOptions {
  gender?: UniqloGender;
  [key: string]: unknown;
}

export interface UniqloCategoriesOptions extends UniqloMarketOptions {
  gender?: UniqloGender;
  /** Add the subcategory level (a much larger answer). Default false. */
  include_subcategories?: boolean;
  [key: string]: unknown;
}

export interface UniqloPricesOptions {
  /** A uniqlo.com product id (e.g. "E479000-000"), the same in every market. */
  product_id: string;
  /** Price group (default "00", Uniqlo's regular price list); prices compares group 00 unless this is sent. */
  price_group?: string;
  /** 1 to 10 markets (default jp, us, gb, de, fr, kr, au, ca, sg, th). */
  countries?: UniqloPricesCountry[];
  /** Language for the titles where the market serves it (else the market's default). */
  language?: UniqloLanguage;
  [key: string]: unknown;
}

export class UniqloNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/uniqlo/${path}`, options, undefined, UNIQLO_TIMEOUT);
  }

  /**
   * Search Uniqlo's catalogue by keyword. On us, jp, kr: items (product_id,
   * price_group, title, url, gender, price, promo_price, currency,
   * discount_percent, on_sale, limited_offer, price_flags, flags, colors,
   * sizes, lengths, rating, review_count, image, store_only), total, count,
   * page, page_size, has_more, sort, facets and related_keywords. On tw, hk,
   * cn: Uniqlo's Greater China catalogue in Chinese (u-code product ids,
   * style_code, in_stock, season). Not served on other storefronts. Search
   * can list one product_id twice: price_group "00" (regular price list) and
   * "01" (mostly the Select Colors/Sizes Only sale price).
   *
   * Costs 1 credit.
   */
  async search(options: UniqloSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product by product_id or link, on 41 markets: description,
   * composition, care, countries_of_origin, category, price, promo_price,
   * on_sale, limited_offer, price_flags, lowest_price_30d (Europe), tax,
   * colors, sizes, lengths, rating (with fit), images; variants with l2_id on
   * us, jp, kr. A product a market does not sell is a charged 404. Ratings
   * are per region (Europe shares one pool). price_group "01" reads the
   * Select Colors/Sizes Only sale price and the colours / sizes it covers.
   *
   * Costs 1 credit.
   */
  async product(options: UniqloProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Online stock of every colour x size x length variant: variants (l2_id,
   * sku, color, size, length, status in_stock / low_stock / out_of_stock,
   * quantity, quantity_capped (Uniqlo shows at most 11), back_in_stock,
   * in_transit, prices), variants_total, variants_in_stock. us, jp, kr.
   *
   * Costs 1 credit.
   */
  async stock(options: UniqloStockOptions): Promise<Record<string, unknown>> {
    return this.post("stock", options);
  }

  /**
   * Stock of one variant in the stores nearest a point: per store
   * store_code, name, distance_km, status (no unit counts), store_status,
   * order_and_pick, sections; price_group, stores_with_stock, total_stores.
   * By l2_id or by product_id + color + size (+ length), with the price_group
   * the variant came from (default "00"): a variant of price group 01 asked
   * as 00 reads out of stock in every store. us, jp, kr.
   *
   * Costs 1 credit with l2_id, 2 with product_id + color + size.
   */
  async storeStock(options: UniqloStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /**
   * Stores nearest a point, or one store by store_id: address, lat, lng,
   * distance_km, phone, opening_hours, store_type, click_and_collect,
   * sections, services; total (every store of the market), paging. us, jp, kr.
   *
   * Costs 1 credit.
   */
  async stores(options: UniqloStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * Reviews of a product: rating (average, count, fit, distribution) and
   * reviews (rating, title, text, created_at, fit 1 tight to 5 loose with
   * fit_label (null when not given), purchased_size, purchased_color,
   * height_range, weight_range, age_range, helpful_count). No reviewer names
   * or locations. Totals are pooled per region. us, jp, kr.
   *
   * Costs 1 credit.
   */
  async reviews(options: UniqloReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * Search suggestions, categories and feature pages for a partial query;
   * with no query, Uniqlo's trending search words. us, jp, kr.
   *
   * Costs 1 credit.
   */
  async suggestions(options: UniqloSuggestionsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Every product of one category path (ids from categories()), paged and
   * sorted, optionally one flag. us, jp, kr.
   *
   * Costs 1 credit.
   */
  async category(options: UniqloCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The sale (type sale) or limited-time-offer (type limited_offer) list of a
   * market, optionally one gender, with limited_offer (name: Uniqlo's own
   * label, start / end its window) where Uniqlo shows them. Uniqlo's own
   * listings can include GU collaboration items (kr limited offers did).
   * us, jp, kr.
   *
   * Costs 1 credit.
   */
  async deals(options: UniqloDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * Items Uniqlo flags New on a market, optionally one gender. us, jp, kr.
   *
   * Costs 1 credit.
   */
  async newArrivals(options: UniqloNewArrivalsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("new-arrivals", options);
  }

  /**
   * The category tree of a market in its language: nodes (id, name, key,
   * level, gender_id, parent_id, path for category_path). Ids are per market.
   * us, jp, kr.
   *
   * Costs 1 credit.
   */
  async categories(options: UniqloCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * Uniqlo prices by country: one uniqlo.com product across up to 10 markets
   * (country, language, currency, available, title, price, promo_price,
   * discount_percent, on_sale, limited_offer, price_flags, lowest_price_30d,
   * tax, url), not_sold and errors. Each price is in that market's own
   * currency, never converted. Compares price group "00" unless price_group
   * is sent. Greater China is not offered (own codes).
   *
   * Costs 1 credit per market that answered; failed markets are not charged.
   */
  async prices(options: UniqloPricesOptions): Promise<Record<string, unknown>> {
    return this.post("prices", options);
  }
}
