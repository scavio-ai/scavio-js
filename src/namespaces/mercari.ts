import type { Scavio } from "../client.js";

// Mercari: 11 endpoints, 1 credit each.
//
// Markets (country): "us" (default; Mercari US, mercari.com, USD, English) and
// "jp" (Mercari Japan, jp.mercari.com, JPY, Japanese). search, item, category,
// categories, brands and brand serve both; deals and trending are us only;
// seller, sellerReviews and shop are jp only. A market an endpoint does not
// serve, Mercari UK (closed: gb / uk) and any other value answer 400 before
// anything is charged. Every answer carries country, currency and language.
//
// Item, category, brand and seller ids are per market: an id from us is not
// valid on jp (a charged not-found). status "sold" returns sold listings (sold
// and in transit) with their prices, so asking and sold prices for the same
// query come from search(). Grids carry no likes and no sold time; item() has
// both, and a sold item keeps its full data. Prices are numbers: US dollars on
// us, whole yen on jp; original_price is the seller's earlier price when above
// price, with discount_percent against it. Search depth: us 50 per page up to
// page 20 (1,000 results), jp 120 per page up to page 91. jp data is in
// Japanese as sellers wrote it (not translated) and jp calls are slower
// (search typically 30-60 s). Not available: US seller profiles and reviews,
// US search suggestions, Japanese trending, price-drop history.
//
// The server enforces the cross-field rules: search() needs query,
// category_id or brand_id; item() takes one of item_id or url; seller() and
// sellerReviews() one of seller_id or url; shop() one of shop_id or url. Every
// call raises the request timeout to MERCARI_TIMEOUT. Failed upstream calls
// are not charged; a not-found is charged.

/** Minimum request timeout (ms) for every mercari call: jp calls take 10-60 s and are retried once server-side. */
export const MERCARI_TIMEOUT = 240_000;

/** us (Mercari US, default) or jp (Mercari Japan). */
export type MercariCountry = "us" | "jp";

/** on_sale (default), sold (sold and in transit) or all. */
export type MercariStatus = "on_sale" | "sold" | "all";

/** relevance (default), newest, price_asc, price_desc; likes on jp only, recently_sold on us only. */
export type MercariSort = "relevance" | "newest" | "price_asc" | "price_desc" | "likes" | "recently_sold";

/** Item condition; bad is jp only. */
export type MercariCondition = "new" | "like_new" | "good" | "fair" | "poor" | "bad";

/** free (the seller pays shipping) or buyer_pays. */
export type MercariShipping = "free" | "buyer_pays";

type Id = string | number;

export interface MercariGridOptions {
  /** on_sale (default), sold (sold listings, including items sold but still in transit) or all. */
  status?: MercariStatus;
  /** Results page, 1-based: us 50 per page up to 20, jp 120 per page up to 91. */
  page?: number;
  /** Sort order. Defaults to "relevance". jp newest follows Mercari Japan's own order (relisted items move up). */
  sort?: MercariSort;
  /** Lowest price: US dollars on us, whole yen on jp. */
  price_min?: number;
  /** Highest price: US dollars on us, whole yen on jp. */
  price_max?: number;
  /** One or more conditions; several are ORed. */
  condition?: MercariCondition | MercariCondition[] | string;
  /** free or buyer_pays. */
  shipping?: MercariShipping;
  /** us only: a Mercari US size id. */
  size_id?: Id;
}

export interface MercariSearchOptions extends MercariGridOptions {
  /** Search keywords, e.g. "nintendo switch" (required unless category_id or brand_id is sent). On jp, Japanese keywords match best. */
  query?: string;
  /** Market. Defaults to "us". */
  country?: MercariCountry;
  /** A category id of the same market (categories()). */
  category_id?: Id;
  /** A brand id of the same market (brands()). */
  brand_id?: Id;
  /** us only: only listings on Mercari's deals filter (price dropped below the seller's earlier price). */
  deals_only?: boolean;
  /** jp only: only Mercari Shops products (business sellers). */
  shops_only?: boolean;
  [key: string]: unknown;
}

export interface MercariItemOptions {
  /** A Mercari item id, e.g. "m38943035688", or on jp a 22-character Mercari Shops product id. One of item_id or url. */
  item_id?: string;
  /** A Mercari item link (mercari.com/us/item/..., jp.mercari.com/item/... or a /shops/product/ link): its market is used. */
  url?: string;
  /** Market. Defaults to "us". */
  country?: MercariCountry;
  [key: string]: unknown;
}

export interface MercariCategoryOptions extends MercariGridOptions {
  /** A category id of the market (categories()), e.g. us 797 Consoles. */
  category_id: Id;
  /** Market. Defaults to "us". */
  country?: MercariCountry;
  /** Optional keywords within the category. */
  query?: string;
  /** A brand id of the same market. */
  brand_id?: Id;
  /** us only: only listings on Mercari's deals filter. */
  deals_only?: boolean;
  /** jp only: only Mercari Shops products. */
  shops_only?: boolean;
  [key: string]: unknown;
}

export interface MercariCategoriesOptions {
  /** Market. Defaults to "us". */
  country?: MercariCountry;
  /** A category id: its children. Omitted: us answers the 17 top-level categories, jp the whole tree. */
  parent_id?: Id;
  [key: string]: unknown;
}

export interface MercariBrandsOptions {
  /** Market. Defaults to "us". */
  country?: MercariCountry;
  /** Filter brands by name, e.g. "nike" (case-insensitive; on jp also the katakana reading). */
  query?: string;
  /** Page of 1,000 brands, 1-based. */
  page?: number;
  [key: string]: unknown;
}

export interface MercariBrandOptions extends MercariGridOptions {
  /** A brand id of the market (brands()), e.g. us 4591 Nintendo, jp 539 COACH. */
  brand_id: Id;
  /** Market. Defaults to "us". */
  country?: MercariCountry;
  /** Optional keywords within the brand. */
  query?: string;
  /** A category id of the same market. */
  category_id?: Id;
  /** us only: only listings on Mercari's deals filter. */
  deals_only?: boolean;
  /** jp only: only Mercari Shops products. */
  shops_only?: boolean;
  [key: string]: unknown;
}

export interface MercariDealsOptions extends MercariGridOptions {
  /** us only. */
  country?: "us";
  /** Optional keywords. */
  query?: string;
  /** A US category id to narrow the deals. */
  category_id?: Id;
  /** A US brand id. */
  brand_id?: Id;
  [key: string]: unknown;
}

export interface MercariTrendingOptions {
  /** us only. */
  country?: "us";
  [key: string]: unknown;
}

export interface MercariSellerOptions {
  /** A Mercari Japan seller id (seller_id of a search or item answer), e.g. "477123966". One of seller_id or url. */
  seller_id?: Id;
  /** A Mercari Japan profile link (https://jp.mercari.com/user/profile/<id>). */
  url?: string;
  /** jp only (the default for this endpoint). */
  country?: "jp";
  [key: string]: unknown;
}

export interface MercariShopOptions {
  /** A Mercari Shops shop id (22 characters), e.g. "LThudSk3aoGvKcW6R3sA6m". One of shop_id or url. */
  shop_id?: string;
  /** A Mercari Shops link (https://jp.mercari.com/shops/profile/<id>). */
  url?: string;
  /** jp only (the default for this endpoint). */
  country?: "jp";
  [key: string]: unknown;
}

export class MercariNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/mercari/${path}`, options, undefined, MERCARI_TIMEOUT);
  }

  /**
   * Search listings by keyword, category or brand: items (item_id, title,
   * url, price, original_price, discount_percent, currency, status,
   * condition, condition_name, brand, category_id, size, thumbnail,
   * seller_id, free_shipping, created_at; jp adds is_shop, shop_id,
   * is_auction, updated_at), total, page, page_size, max_page, has_more.
   * status "sold" returns sold listings (sold and in transit) with their
   * prices. us and jp.
   *
   * Costs 1 credit.
   */
  async search(options: MercariSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One listing by item_id or link: description, price, original_price,
   * discount_percent (us also price_with_buyer_fee), status, sold_at,
   * condition, category path, size, color, shipping (payer, method, fee,
   * days_to_ship, ships_from), likes, photos and the seller summary (us
   * sold_count, jp good / normal / bad ratings). jp adds the full public
   * comment list (text, date, is_seller; no commenter names) and Mercari
   * Shops products (is_shop, shop). us and jp.
   *
   * Costs 1 credit.
   */
  async item(options: MercariItemOptions): Promise<Record<string, unknown>> {
    return this.post("item", options);
  }

  /**
   * Listings in one category (category_id from categories()), paged and
   * sorted, with keywords and the search filters. An unknown id is a charged
   * 404. us and jp.
   *
   * Costs 1 credit.
   */
  async category(options: MercariCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The category tree: categories (category_id, name, parent_id, level,
   * has_children; us adds title). us answers one level at a time, jp the
   * whole tree (8,700+) or one parent's children. us and jp.
   *
   * Costs 1 credit.
   */
  async categories(options: MercariCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * The brand list (us about 28,800, jp about 52,600), filtered by name and
   * paged by 1,000: brands (brand_id, name; jp adds subname and the katakana
   * reading), total, brands_in_market, has_more. us and jp.
   *
   * Costs 1 credit.
   */
  async brands(options: MercariBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /**
   * Listings of one brand (brand_id from brands()), paged and sorted,
   * optionally within a category or with keywords. us and jp.
   *
   * Costs 1 credit.
   */
  async brand(options: MercariBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * Listings on Mercari's deals filter (the seller dropped the price), each
   * with original_price and discount_percent, 50 per page. us only.
   *
   * Costs 1 credit.
   */
  async deals(options: MercariDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * Mercari's trending keywords (position, keyword, search_rank,
   * rank_change, search_volume_change_percent, trend) and brands (position,
   * brand_id, name, demand, demand_change, sold_rate_7d, recent_listings) as
   * Mercari shows them. us only.
   *
   * Costs 1 credit.
   */
  async trending(options: MercariTrendingOptions = {}): Promise<Record<string, unknown>> {
    return this.post("trending", options);
  }

  /**
   * A Mercari Japan seller's public profile: seller (rating, good / normal /
   * bad ratings, review_count, listings_count, followers, badges, joined,
   * bio) and the first 30 listings. An unknown seller is a charged 404. jp
   * only: US seller profiles are not available.
   *
   * Costs 1 credit.
   */
  async seller(options: MercariSellerOptions): Promise<Record<string, unknown>> {
    return this.post("seller", options);
  }

  /**
   * The most recent 100 reviews of a Mercari Japan user: summary (rating,
   * good / normal / bad counts, review_count) and reviews (rating, text,
   * date, role seller or buyer). No reviewer names. jp only.
   *
   * Costs 1 credit.
   */
  async sellerReviews(options: MercariSellerOptions): Promise<Record<string, unknown>> {
    return this.post("seller-reviews", options);
  }

  /**
   * A Mercari Shops shop profile (a business seller on Mercari Japan): name,
   * description, rating, review_count, followers, is_open, has_time_sale,
   * badges, created_at. No product list: use search() with shops_only or
   * item(). jp only.
   *
   * Costs 1 credit.
   */
  async shop(options: MercariShopOptions): Promise<Record<string, unknown>> {
    return this.post("shop", options);
  }
}
