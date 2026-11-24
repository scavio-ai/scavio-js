import type { Scavio } from "../client.js";

// Nike (nike.com, including Jordan Brand): 8 endpoints, 1 credit each.
// credits_used in the response is what was charged.
//
// Markets: country is a two-letter storefront code (default us, www.nike.com;
// 62 storefronts in 42 countries, cn is www.nike.com.cn) and language picks the
// storefront language where a country has several (ch: de, en, fr, it; be: nl,
// de, en, fr; ca: en, fr; us: en, es; jp: ja, en; default the country's primary
// language). releases() and release() are not offered on vn, cn or jp in
// English (Nike's launch calendar lists no launches there); reviews() is not
// offered on cn. Not served (a 400, not charged): ae, sa, ar, br, cl, in, co,
// pe, kw, qa, eg, ma, nz, pr, ru, uy, hk; uk is gb.
//
// Prices are per storefront and differ between markets, also inside the euro
// zone. price and full_price are as Nike shows them and discount_percent as
// Nike gives it; promotions carry Nike's offer text with its start and end
// dates. search(), category(), brand() and deals() return Nike's first page
// only (the 24 product groups Nike's page shows first). product() lists every
// size with its GTIN and Nike's status: sizes, not stock levels. releases() and
// release() carry price, release start, method (LINE or DRAW, as Nike labels
// it) and a per-size level (HIGH, MEDIUM, LOW or OOS as Nike gives it) for
// launch items; before a launch Nike can show LOW on every size. Read-only
// data: no entry or purchase. reviews() is the summary and the 3 newest
// reviews. Not available: store locator, in-store or pickup stock, stock levels
// for regular products, review paging or Q&A, search suggestions, pages past
// the first, member prices, gift cards, Nike Factory store prices, Converse,
// checkout.
//
// The server enforces the cross-field rules: language must be one the country
// offers; product() and reviews() take url or style_color; release() takes
// url, slug or style_color; category() takes path or url; a url sets the
// storefront; search() takes one filter token, the list methods up to 6. Every
// call raises the request timeout to NIKE_TIMEOUT. Failed upstream calls and
// refused inputs are not charged; a not-found is charged.

/** Minimum request timeout (ms) for every nike call: calls can queue behind the server's upstream limit. */
export const NIKE_TIMEOUT = 240_000;

/** A Nike storefront's two-letter country code (cn is www.nike.com.cn). */
export type NikeCountry =
  | "us" | "at" | "au" | "be" | "bg" | "ca" | "ch" | "cn" | "cz" | "de" | "dk" | "es" | "fi" | "fr"
  | "gb" | "gr" | "hr" | "hu" | "id" | "ie" | "il" | "it" | "jp" | "kr" | "lu" | "mx" | "my" | "nl"
  | "no" | "ph" | "pl" | "pt" | "ro" | "se" | "sg" | "si" | "sk" | "th" | "tr" | "tw" | "vn" | "za";

/** A storefront that lists launches: every one except vn and cn (and jp with language en). */
export type NikeLaunchCountry = Exclude<NikeCountry, "vn" | "cn">;

/** A storefront with a reviews page: every www.nike.com storefront (not cn). */
export type NikeReviewCountry = Exclude<NikeCountry, "cn">;

/** The storefront language where a country has several (default its primary language). */
export type NikeLanguage =
  | "en" | "es" | "de" | "nl" | "fr" | "it" | "zh-Hans" | "cs" | "da" | "ca" | "el" | "hu" | "ja"
  | "ko" | "no" | "pl" | "pt" | "sv" | "th" | "tr" | "zh-Hant";

/** featured (default), newest, price_high or price_low: Nike's sort menu. */
export type NikeSort = "featured" | "newest" | "price_high" | "price_low";

/** jordan (Jordan Brand), acg or sb (Nike SB skateboarding). */
export type NikeBrand = "jordan" | "acg" | "sb";

/** men, women, unisex, boys or girls. */
export type NikeGender = "men" | "women" | "unisex" | "boys" | "girls";

/** upcoming (default), feed or in_stock: the launch calendar's tabs. */
export type NikeReleaseView = "upcoming" | "feed" | "in_stock";

export interface NikeMarket {
  /** Defaults to "us" (www.nike.com). */
  country?: NikeCountry;
  /** Defaults to the country's primary language. */
  language?: NikeLanguage;
}

export interface NikeListOptions extends NikeMarket {
  /** Defaults to "featured". */
  sort?: NikeSort;
  /** One or more (up to 6) facet tokens exactly as an earlier answer gives them in facets[].options[].filter, e.g. "black-90poy". */
  filter?: string | string[];
}

export interface NikeSearchOptions extends NikeMarket {
  /** Keywords ("dunk low") or a style color. */
  q: string;
  /** Defaults to "featured". */
  sort?: NikeSort;
  /** ONE facet token exactly as an earlier search answer gives it in facets[].options[].filter; a token from a filtered answer already carries every filter applied there. */
  filter?: string | [string];
  [key: string]: unknown;
}

export interface NikeProductOptions extends NikeMarket {
  /** A Nike style color (items[].style_color, e.g. "DD1503-103"). Send style_color or url. */
  style_color?: string;
  /** A Nike product link (items[].url; a Nike By You /u/ link too), instead of style_color. Its storefront comes from the link. */
  url?: string;
  [key: string]: unknown;
}

export interface NikeCategoryOptions extends NikeListOptions {
  /** A Nike listing path token (categories[].path, or the part after /w/ of a Nike listing link), e.g. "mens-shoes-nik1zy7ok". Send path or url. */
  path?: string;
  /** A Nike listing link (www.nike.com/.../w/<path>) instead of path. Its storefront comes from the link. */
  url?: string;
  [key: string]: unknown;
}

export interface NikeBrandOptions extends NikeListOptions {
  /** jordan (Jordan Brand), acg or sb (Nike SB). */
  brand: NikeBrand;
  [key: string]: unknown;
}

export interface NikeDealsOptions extends NikeListOptions {
  /** Only this gender. */
  gender?: NikeGender;
  /** Only this listing path token (categories[].path of an earlier deals answer, e.g. "shoes-y7ok"). */
  category?: string;
  [key: string]: unknown;
}

export interface NikeReleasesOptions {
  /** Defaults to "upcoming". */
  view?: NikeReleaseView;
  /** Defaults to "us". Not vn or cn (nor jp with language en). */
  country?: NikeLaunchCountry;
  /** Defaults to the country's primary language. */
  language?: NikeLanguage;
  [key: string]: unknown;
}

export interface NikeReleaseOptions {
  /** A Nike launch link (launches[].thread.url, e.g. "https://www.nike.com/launch/t/air-jordan-4-bred"). Its storefront comes from the link. */
  url?: string;
  /** A launch thread slug (launches[].thread.slug) instead of url. */
  slug?: string;
  /** The style color of a launch-calendar product (e.g. "IX8180-001"; past launches too). Send url, slug or style_color. */
  style_color?: string;
  /** Defaults to "us". Not vn or cn (nor jp with language en). */
  country?: NikeLaunchCountry;
  /** Defaults to the country's primary language. */
  language?: NikeLanguage;
  [key: string]: unknown;
}

export interface NikeReviewsOptions {
  /** A Nike style color (e.g. "CW2288-111"). Send style_color or url. */
  style_color?: string;
  /** A Nike product link (items[].url), instead of style_color. Its storefront comes from the link. */
  url?: string;
  /** Defaults to "us". Not cn (www.nike.com.cn has no reviews page). */
  country?: NikeReviewCountry;
  /** Defaults to the country's primary language. */
  language?: NikeLanguage;
  [key: string]: unknown;
}

export class NikeNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/nike/${path}`, options, undefined, NIKE_TIMEOUT);
  }

  /** Search by keywords or a style color (first page only: 24 product groups): price, full price, discount percent, promotions, colorways, facets. 1 credit. */
  async search(options: NikeSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One product by style color or link: every size with its GTIN and Nike's status (sizes, not stock levels), colorways, launch dates. 1 credit. */
  async product(options: NikeProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** One listing by path token or link (first page only), sorted and filtered by up to 6 facet tokens. 1 credit. */
  async category(options: NikeCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /** Jordan Brand, ACG or Nike SB products (first page only), sorted and filtered. 1 credit. */
  async brand(options: NikeBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /** Nike's Sale listing (first page only), optionally for one gender or one category. 1 credit. */
  async deals(options: NikeDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /** Nike's launch calendar (upcoming, feed or in stock): price, release start, method and per-size level for launch items. 1 credit. */
  async releases(options: NikeReleasesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("releases", options);
  }

  /** One launch by link, thread slug or style color (past launches too). 1 credit. */
  async release(options: NikeReleaseOptions): Promise<Record<string, unknown>> {
    return this.post("release", options);
  }

  /** One product's review summary: totals, averages, Nike's own summary and the 3 newest reviews. 1 credit. */
  async reviews(options: NikeReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }
}
