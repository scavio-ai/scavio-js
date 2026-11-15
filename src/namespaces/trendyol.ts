import type { Scavio } from "../client.js";

// Trendyol: 12 endpoints, 1 credit each. 35 markets (country, default "tr")
// with their languages (language, default the market's first): tr (TRY; tr,
// en or ar), de and at (EUR; de), fr, be, hr, dk, ee, fi, it, lv, lt, nl, pt,
// si, es, se, lu (EUR; en), bg (EUR; bg or en), gr (EUR; el or en), cz (CZK;
// cs or en), hu (HUF; hu or en), pl (PLN; pl or en), ro (RON; ro or en), sk
// (EUR; sk or en), rs (RSD; sr or en), ua (UAH; uk or en), md (MDL; ro or en),
// ae (AED; en or ar), sa (SAR; ar or en), qa, kw, om, bh (QAR, KWD, OMR, BHD;
// ar or en), az (AZN; tr). deals() and coupons() serve tr only; rankings() is
// not on the 15 English-language EU storefronts (no ranking lists there);
// delivery()'s city_id / district_id are tr only. Every answer carries
// country, language and currency.
//
// product() returns the buy-box seller and every other seller's offer
// (other_sellers): Trendyol's developer FAQ says the buy box is chosen by
// algorithm metrics, not price alone. Each international storefront has its
// own price list (mostly sold cross-border by Trendyol itself), not a currency
// conversion of the Turkish price. lowest_price_badge is the site's "lowest
// price of the last N days" tag: a day count only. Trendyol publishes no
// numeric 30-day lowest price and no price history.
//
// The server enforces the cross-field rules: language must be one the market
// serves; product(), reviews(), questions(), coupons() and delivery() take
// content_id or url; category() takes category_id or url; brand() brand_id or
// url; seller() seller_id or url; district_id needs city_id. Every call raises
// the request timeout to TRENDYOL_TIMEOUT. Failed upstream calls are not
// charged; a not-found is charged.

/** Minimum request timeout (ms) for every trendyol call. */
export const TRENDYOL_TIMEOUT = 120_000;

/** The 35 Trendyol markets. */
export type TrendyolCountry =
  | "tr" | "de" | "at" | "fr" | "be" | "hr" | "dk" | "ee" | "fi" | "it" | "lv" | "lt" | "nl" | "pt" | "si"
  | "es" | "se" | "lu" | "bg" | "gr" | "cz" | "hu" | "pl" | "ro" | "sk" | "rs" | "ua" | "md" | "ae" | "sa"
  | "qa" | "kw" | "om" | "bh" | "az";

/** Markets with ranking lists: every market except the 15 English-language EU storefronts. */
export type TrendyolRankingsCountry =
  | "tr" | "de" | "at" | "bg" | "gr" | "cz" | "hu" | "pl" | "ro" | "sk" | "rs" | "ua" | "md" | "ae" | "sa"
  | "qa" | "kw" | "om" | "bh" | "az";

/** Each market serves its own languages (see the header comment); another answers 400. */
export type TrendyolLanguage = "tr" | "en" | "ar" | "de" | "bg" | "el" | "cs" | "hu" | "pl" | "ro" | "sk" | "sr" | "uk";

/** recommended (default), price_asc, price_desc, newest, best_seller, most_favourited or most_rated. */
export type TrendyolSort =
  | "recommended" | "price_asc" | "price_desc" | "newest" | "best_seller" | "most_favourited" | "most_rated";

/** recommended (default, the site's order), newest, oldest, rating_desc or rating_asc. */
export type TrendyolReviewSort = "recommended" | "newest" | "oldest" | "rating_desc" | "rating_asc";

/** best_seller (default), most_favourited, most_rated or top_viewed. */
export type TrendyolRanking = "best_seller" | "most_favourited" | "most_rated" | "top_viewed";

/** flash (default) or super_discounts (Super Firsatlar). */
export type TrendyolDealType = "flash" | "super_discounts";

/** official (the brand's official seller), authorized or successful sellers. */
export type TrendyolSellerType = "official" | "authorized" | "successful";

type Id = string | number;

export interface TrendyolMarketOptions<C extends string = TrendyolCountry> {
  /** Market. Defaults to "tr". */
  country?: C;
  /** Language of the market. Defaults to the market's first. */
  language?: TrendyolLanguage;
}

export interface TrendyolFilterOptions {
  /** Results page, 1-based, 36 per page (at most 138 pages; 139 and up: 400). */
  page?: number;
  /** Sort order. Defaults to "recommended". */
  sort?: TrendyolSort;
  /** Lowest price, in the market's currency. */
  price_min?: number;
  /** Highest price, in the market's currency. */
  price_max?: number;
  /** Product rating and up: 1, 2, 3, 4 or 4.5. */
  min_rating?: 1 | 2 | 3 | 4 | 4.5;
  /** Only items with free shipping. */
  free_shipping?: boolean;
  /** Only items with rush delivery. */
  fast_delivery?: boolean;
  /** Only items at least this many percent off (1 to 90). */
  min_discount?: number;
  /** Only items with the site's lowest-price badge for the last N days (tr 10 / 14 / 30 / 90, international 7 / 14 / 30). */
  lowest_price_days?: 7 | 10 | 14 | 30 | 90;
  /** official, authorized or successful sellers only. */
  seller_type?: TrendyolSellerType;
  /** Only flash-sale items. */
  flash_sale?: boolean;
  /** Only items with a collectable coupon. */
  has_coupon?: boolean;
  /** Any other facet, keyed by facets[].param with option values, e.g. {attr: ["348|1"]} (a color) or {wg: "1"} (a gender). */
  filters?: Record<string, string | string[]>;
  /** Also return facets (filter groups with option values and counts). Still 1 credit. */
  include_facets?: boolean;
}

export interface TrendyolGridOptions extends TrendyolMarketOptions, TrendyolFilterOptions {
  /** 1 to 10 brand ids (items[].brand.id, e.g. 794 Samsung). */
  brand_id?: Id | Id[];
  /** 1 to 10 category ids (product category.id / category.tree[].id). */
  category_id?: Id | Id[];
  /** Only one seller's items (items[].seller.id). */
  seller_id?: Id;
}

export interface TrendyolSearchOptions extends TrendyolGridOptions {
  /** Search keywords, in the market's language, e.g. "telefon". */
  query: string;
  [key: string]: unknown;
}

export interface TrendyolProductRef {
  /** A product's content id (items[].content_id, the number after -p- in a link), e.g. 975557855. One of content_id or url. */
  content_id?: Id;
  /** A product link of any Trendyol storefront (a language-only path like /en/... needs country). */
  url?: string;
}

export interface TrendyolProductOptions extends TrendyolMarketOptions, TrendyolProductRef {
  /** Also return the seller's description (text and HTML). Still 1 credit. */
  include_description?: boolean;
  [key: string]: unknown;
}

export interface TrendyolCategoryOptions extends TrendyolMarketOptions, TrendyolFilterOptions {
  /** A category id (103498 phones, 56 dresses; the same on every market). One of category_id or url. */
  category_id?: Id;
  /** A category link (<name>-x-c<id>). */
  url?: string;
  /** 1 to 10 brand ids. */
  brand_id?: Id | Id[];
  /** Only one seller's items. */
  seller_id?: Id;
  [key: string]: unknown;
}

export interface TrendyolBrandOptions extends TrendyolMarketOptions, TrendyolFilterOptions {
  /** A brand id (items[].brand.id, e.g. 794 Samsung). One of brand_id or url. */
  brand_id?: Id;
  /** A brand link (<brand>-x-b<id>). */
  url?: string;
  /** 1 to 10 category ids. */
  category_id?: Id | Id[];
  /** Only one seller's items. */
  seller_id?: Id;
  [key: string]: unknown;
}

export interface TrendyolReviewsOptions extends TrendyolMarketOptions, TrendyolProductRef {
  /** Page, 1-based. */
  page?: number;
  /** Reviews per page, 1 to 50 (default 20). */
  page_size?: number;
  /** Sort order. Defaults to "recommended". */
  sort?: TrendyolReviewSort;
  /** Only reviews with this many stars (1 to 5). */
  rating?: number;
  /** Only reviews with photos. */
  with_media?: boolean;
  [key: string]: unknown;
}

export interface TrendyolQuestionsOptions extends TrendyolMarketOptions, TrendyolProductRef {
  /** Page, 1-based. */
  page?: number;
  /** Questions per page, 1 to 20 (default 20). */
  page_size?: number;
  [key: string]: unknown;
}

export interface TrendyolSellerOptions extends TrendyolMarketOptions, TrendyolFilterOptions {
  /** A seller id (items[].seller.id, buy_box.seller.id, other_sellers[].seller.id), e.g. 4473. One of seller_id or url. */
  seller_id?: Id;
  /** A seller store link (/magaza/<name>-m-<id>, or /store/<name>-m-<id> on international storefronts). */
  url?: string;
  /** Also return the seller's products as a grid. Still 1 credit. */
  include_products?: boolean;
  /** Search within the seller's products (with include_products). */
  query?: string;
  /** 1 to 10 brand ids. */
  brand_id?: Id | Id[];
  /** 1 to 10 category ids. */
  category_id?: Id | Id[];
  [key: string]: unknown;
}

export interface TrendyolDealsOptions extends TrendyolGridOptions {
  /** Deal type. Defaults to "flash" (the live slot unless slot is sent). */
  type?: TrendyolDealType;
  /** A flash slot tag from slots[].tag of a previous answer (dated), e.g. "fs_15_11_2026_21_24". */
  slot?: string;
  /** tr only. */
  country?: "tr";
  [key: string]: unknown;
}

export interface TrendyolCouponsOptions extends TrendyolMarketOptions<"tr">, TrendyolProductRef {
  /** Which seller's listing to read coupons for (default the buy box; another from other_sellers[].seller.id). */
  seller_id?: Id;
  [key: string]: unknown;
}

export interface TrendyolRankingsOptions extends TrendyolMarketOptions<TrendyolRankingsCountry> {
  /** A category id (required): 56 dresses, 103498 phones, 1156 lipsticks. */
  category_id: Id;
  /** Which list. Defaults to "best_seller". */
  ranking?: TrendyolRanking;
  /** Page of 20, 1 to 5 (the top 100). */
  page?: number;
  [key: string]: unknown;
}

export interface TrendyolSuggestionsOptions extends TrendyolMarketOptions {
  /** What the shopper has typed so far, e.g. "iph". */
  query: string;
  [key: string]: unknown;
}

export interface TrendyolDeliveryOptions extends TrendyolMarketOptions, TrendyolProductRef {
  /** The variant (variants[].item_number or buy_box.item_number); default the buy box's. */
  item_number?: Id;
  /** The default listing (buy_box.listing_id, 32 characters); default the buy box's. */
  listing_id?: string;
  /** A Turkish city id (tr only; Istanbul is 133). */
  city_id?: Id;
  /** A district id of that city (tr only, needs city_id; Istanbul's Sisli is 54). */
  district_id?: Id;
  [key: string]: unknown;
}

export class TrendyolNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/trendyol/${path}`, options, undefined, TRENDYOL_TIMEOUT);
  }

  /**
   * Search Trendyol by keyword, 36 per page: items with position,
   * content_id, listing_id, item_number, name, brand, category, url, images,
   * price, original_price, discount_percent, rrp, plus_price, currency,
   * lowest_price_badge (days, text), badges, best_seller_rank, labels,
   * promotions, rating, review_count, favourites and orders (the site's
   * rounded text), seller (id), color, variant and sponsored (flagged, kept,
   * repeating across pages); also count (organic), sponsored_count, total
   * (capped at 100000: total_capped), page, total_pages (at most 138), sort,
   * requested_filters and, with include_facets, facets.
   *
   * Costs 1 credit.
   */
  async search(options: TrendyolSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product by content_id or url: prices, lowest_price_badge, stock,
   * variants (with barcode), attributes, images, rating, review_count,
   * favourite_count, category_rankings, buy_box (seller id, name, score out
   * of 10, badges, city; listing_id, prices, free_shipping,
   * rush_delivery_hours, has_coupon), other_sellers (every other seller's
   * price, score, badges, lowest_price_badge, promotions),
   * other_seller_count, promotions, returnable, max_installments,
   * vat_percent and, with include_description, description. No seller
   * e-mail, tax number or address. An unknown product, or one not sold on
   * that storefront, is a charged 404.
   *
   * Costs 1 credit.
   */
  async product(options: TrendyolProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One category's products (36 per page) by category_id or url, with the
   * search sorts and filters: category (id, name, url) and the grid fields.
   * Category ids are the same on every market.
   *
   * Costs 1 credit.
   */
  async category(options: TrendyolCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One brand's products (36 per page) by brand_id or url, with the search
   * sorts and filters: brand (id, name, url) and the grid fields.
   *
   * Costs 1 credit.
   */
  async brand(options: TrendyolBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * A product's reviews: rating, rating_count, review_count,
   * photo_review_count, rating_histogram, topics, sizes, review_summary
   * (Trendyol's own) and reviews (rating, text, date, likes, author as the
   * site shows it, already masked, verified_buyer, seller, size, fit,
   * variant, language, photos), page, page_size, total_pages.
   *
   * Costs 1 credit.
   */
  async reviews(options: TrendyolReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * A product's answered seller questions: questions (id, text, date,
   * verified_buyer, answer with text, answered_in and seller), topics,
   * total, total_asked, page, total_pages. Askers are not named.
   *
   * Costs 1 credit.
   */
  async questions(options: TrendyolQuestionsOptions): Promise<Record<string, unknown>> {
    return this.post("questions", options);
  }

  /**
   * A seller's store profile by seller_id or url: seller (id, name, score
   * out of 10, product_count, follower_count, badges, city,
   * on_trendyol_for, average_shipping_time, question_response_time,
   * average_product_rating, average_seller_rating, metrics, logo, store_url)
   * and, with include_products, the seller's products as a grid. No e-mail,
   * tax number, address or legal name.
   *
   * Costs 1 credit.
   */
  async seller(options: TrendyolSellerOptions): Promise<Record<string, unknown>> {
    return this.post("seller", options);
  }

  /**
   * Flash deals (slots plus the live or chosen slot's items) or
   * super_discounts (Super Firsatlar) as a grid, with the search sorts and
   * filters. tr only.
   *
   * Costs 1 credit.
   */
  async deals(options: TrendyolDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * The collectable coupons on one product's listing (the buy box, or
   * seller_id's): coupons (id, discount, discount_type, min_basket,
   * max_discount, valid_until, issued_by, seller_id, mega_coupon,
   * plus_members_only, collectable), count and product (name, seller, price).
   * Coupons belong to each seller's listing: the buy box often has none
   * while another seller has some. tr only.
   *
   * Costs 1 credit.
   */
  async coupons(options: TrendyolCouponsOptions): Promise<Record<string, unknown>> {
    return this.post("coupons", options);
  }

  /**
   * A category's top-100 list (best_seller, most_favourited, most_rated or
   * top_viewed), 20 per page: ranking, category, items (rank, content_id,
   * name, brand, prices, lowest_price_badge, rating, review_count, in_stock,
   * seller), total, page, total_pages. Not on the 15 English-language EU
   * storefronts (no ranking lists there).
   *
   * Costs 1 credit.
   */
  async rankings(options: TrendyolRankingsOptions): Promise<Record<string, unknown>> {
    return this.post("rankings", options);
  }

  /**
   * Search-box suggestions for a partial query: suggestions (text, type
   * keyword / category / brand / store / other, url, category_ids,
   * seller_id, brand_id, image), count.
   *
   * Costs 1 credit.
   */
  async suggestions(options: TrendyolSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Delivery estimate for one variant from every seller listing it:
   * time_zone and listings (listing_id, seller, buy_box, delivery start and
   * end, ships_by, ships_in_days, cutoffs, rush_delivery_hours,
   * local_delivery, carriers). city_id / district_id narrow it to a Turkish
   * address (Istanbul 133, Sisli 54). No pickup points.
   *
   * Costs 1 credit.
   */
  async delivery(options: TrendyolDeliveryOptions): Promise<Record<string, unknown>> {
    return this.post("delivery", options);
  }
}
