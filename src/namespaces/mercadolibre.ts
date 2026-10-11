import type { Scavio } from "../client.js";

// Mercado Libre: 5 endpoints, all POST /api/v1/mercadolibre/<endpoint>.
// reviews costs 1 credit; search, product, questions and best-sellers cost 2.
// best-sellers is bestSellers() here.
//
// Countries: Mexico (mx), Brazil (br, Mercado Livre), Argentina (ar) and
// Colombia (co); prices come back in MXN, BRL, ARS or COP. Chile is not
// supported, and best sellers are not available for Brazil. search() takes
// query, seller_id or seller_nickname; product() and reviews() take exactly one
// of url, product_id or item_id; questions() exactly one of item_id or url. A
// zero-result search is an empty, billed page; an unknown product, item or
// seller nickname, or a listing with no public questions, returns a billed 404.

export type MercadoLibreCountry = "mx" | "br" | "ar" | "co";
export type MercadoLibreBestSellersCountry = "mx" | "ar" | "co";
export type MercadoLibreCondition = "new" | "used" | "refurbished" | "open_box";
export type MercadoLibreSort = "relevance" | "price_asc" | "price_desc";
export type MercadoLibreDiscount = 5 | 10 | 15 | 20 | 25 | 30 | 40;

/** Pass country and one of query, seller_id or seller_nickname. */
export interface MercadoLibreSearchOptions {
  /** Mexico (mx), Brazil (br, Mercado Livre), Argentina (ar) or Colombia (co). Chile is not supported. */
  country: MercadoLibreCountry;
  /**
   * Keywords (1-200 characters). Mercado Libre may narrow a query to a
   * category, brand or line on its own; the response lists those in
   * auto_applied_filters.
   */
  query?: string;
  /**
   * Only this seller's listings (numeric id, as returned in product's
   * seller.seller_id). Combines with query, filters, sort and page.
   */
  seller_id?: string;
  /**
   * A seller's public nickname. Returns the seller's first page of listings
   * without filters, plus their seller_id; use seller_id for filters, sort and
   * further pages.
   */
  seller_nickname?: string;
  /**
   * Item condition. Without it, Mercado Libre may show new items only for some
   * queries (listed in auto_applied_filters).
   */
  condition?: MercadoLibreCondition;
  /** Minimum price in the country's currency (MXN, BRL, ARS or COP). */
  min_price?: number;
  /** Maximum price in the country's currency. */
  max_price?: number;
  /** Only listings at least this many percent off: 5, 10, 15, 20, 25, 30 or 40. */
  min_discount?: MercadoLibreDiscount;
  /** Only listings with free shipping. */
  free_shipping?: boolean;
  /** Only listings shipped by Mercado Libre Full fulfillment. */
  full_fulfillment?: boolean;
  /** Only listings from official brand stores. */
  official_stores_only?: boolean;
  /** Only listings payable in interest-free installments. */
  interest_free_installments?: boolean;
  /** relevance (default), price_asc or price_desc. Mercado Libre offers no newest or best-selling sort. */
  sort?: MercadoLibreSort;
  /**
   * Results page, 1-42 (about 48 per page, so about 2,000 results per query).
   * Narrow by price range, condition or seller to reach more.
   */
  page?: number;
  [key: string]: unknown;
}

/** Pass exactly one of url, product_id or item_id. */
export interface MercadoLibreProductOptions {
  /** Catalog product id, as returned in product_id by search() (e.g. "MLM1027172667"). */
  product_id?: string;
  /** Item (listing) id, as returned in item_id by search() (e.g. "MLM2746152281"; "MLM-2746152281" works too). */
  item_id?: string;
  /** A Mercado Libre or Mercado Livre product (/p/), user product (/up/) or listing page URL. */
  url?: string;
  [key: string]: unknown;
}

/** Pass exactly one of url, product_id or item_id. */
export interface MercadoLibreReviewsOptions {
  /** Catalog product id, as returned in product_id by search(). */
  product_id?: string;
  /** Item (listing) id, as returned in item_id by search(). */
  item_id?: string;
  /** A Mercado Libre or Mercado Livre product (/p/), user product (/up/) or listing page URL. */
  url?: string;
  /** Only reviews with this star rating (1-5). */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Reviews page, 1-based (up to 15 per page; a page past the last one comes back empty). */
  page?: number;
  [key: string]: unknown;
}

/** Pass exactly one of item_id or url. */
export interface MercadoLibreQuestionsOptions {
  /** Item (listing) id, as returned in item_id by search() (e.g. "MLM3571336480"). */
  item_id?: string;
  /**
   * A listing page URL, or a product (/p/, /up/) URL: a product's questions
   * are those of the listing in its buy box. Alternative to item_id.
   */
  url?: string;
  /** Where to start, from next_offset of the previous page. Defaults to 0. */
  offset?: number;
  [key: string]: unknown;
}

export interface MercadoLibreBestSellersOptions {
  /**
   * Category id, as returned in category_id or category_path by search(), or
   * category_id by product() (e.g. "MLM1055"). Its prefix must match the country.
   */
  category_id: string;
  /** mx, ar or co. Not available for Brazil. */
  country: MercadoLibreBestSellersCountry;
  [key: string]: unknown;
}

export class MercadoLibreNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search Mercado Libre listings in Mexico, Brazil (Mercado Livre), Argentina
   * or Colombia by keyword or seller, with condition, price range, discount,
   * free shipping, Full fulfillment, official stores and interest-free
   * installment filters, sorted by relevance or price. Each row has price,
   * list price, discount, installments, seller and official-store flag where
   * shown, rating, units sold as a lower bound ("at least 500"), shipping
   * flags, a sponsored flag and catalog ids. About 48 rows per page and 42
   * pages (about 2,000 results) per query.
   *
   * Costs 2 credits.
   */
  async search(options: MercadoLibreSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/mercadolibre/search", options);
  }

  /**
   * One Mercado Libre catalog product or listing: title, price, list price,
   * installments, promotions, the buy-box seller with reputation level and
   * seller tier, stock, shipping, rating with its star distribution,
   * variations with sibling product ids, specs, description, pictures and
   * categories. Only the buy-box seller is returned; units sold is a lower
   * bound. Some fields are null where the page omits them. Pass exactly one of
   * url, product_id or item_id; the id prefix (MLM, MLB, MLA, MCO) sets the
   * country.
   *
   * Costs 2 credits.
   */
  async product(options: MercadoLibreProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/mercadolibre/product", options);
  }

  /**
   * One page of up to 15 Mercado Libre product reviews (page until a page
   * comes back empty), optionally filtered by star rating: rating, text, the
   * original text when Mercado Libre translated it, exact date, likes, the
   * review's country and photos. Catalog products pool reviews from several
   * countries. Totals and the star distribution come from product().
   *
   * Costs 1 credit.
   */
  async reviews(options: MercadoLibreReviewsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/mercadolibre/reviews", options);
  }

  /**
   * A page of buyer questions on a Mercado Libre listing with the seller's
   * answers and answer dates (Mercado Libre shows no question dates). Page
   * through with next_offset. A listing with no public questions returns 404.
   *
   * Costs 2 credits.
   */
  async questions(options: MercadoLibreQuestionsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/mercadolibre/questions", options);
  }

  /**
   * The ranked top 20 best sellers in a Mercado Libre category in Mexico,
   * Argentina or Colombia, with price, discount, installments, rating, units
   * sold as a lower bound and seller where shown. Not available for Brazil.
   *
   * Costs 2 credits.
   */
  async bestSellers(options: MercadoLibreBestSellersOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/mercadolibre/best-sellers", options);
  }
}
