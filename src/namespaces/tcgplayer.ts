import type { Scavio } from "../client.js";

// TCGplayer: 13 endpoints, tcgplayer.com (US marketplace, USD), 1 credit each.
//
// product(), listings(), priceHistory() and sales() take product_id or url (a
// tcgplayer.com /product/<id>/ URL); search() needs a query unless game or set
// is given. The server enforces these. The SKU sale fields on product()
// (lowest_sale_price, highest_sale_price, sale_count) are recent SALE
// statistics, not live listings; sales() returns only the 5 newest sales, so
// use priceHistory() for sold volume. Every call raises the request timeout to
// TCGPLAYER_TIMEOUT when the client's is shorter.

/** Minimum request timeout (ms) for every tcgplayer call. */
export const TCGPLAYER_TIMEOUT = 120_000;

/**
 * relevance (default), best_match, best_selling, name_asc, price_asc or
 * price_desc (by market price). relevance and best_match rankings shift
 * between calls and page 2+ drops products already seen (duplicates_removed),
 * so a price or name sort pages more predictably.
 */
export type TcgplayerSearchSort =
  | "relevance"
  | "best_match"
  | "best_selling"
  | "name_asc"
  | "price_asc"
  | "price_desc";

/** price_shipping (default, cheapest price plus shipping first) or price (item price only). */
export type TcgplayerListingSort = "price_shipping" | "price";

/** month (daily buckets), quarter (default, 3-day buckets), semi_annual (weekly) or annual (weekly). */
export type TcgplayerHistoryRange = "month" | "quarter" | "semi_annual" | "annual";

/** cards (single cards) or sealed (booster boxes, packs, decks, tins...). */
export type TcgplayerProductType = "cards" | "sealed";

/** all (default), pokemon, magic or yugioh. */
export type TcgplayerTrendingGame = "all" | "pokemon" | "magic" | "yugioh";

/** One product by TCGplayer product id or tcgplayer.com product URL. Pass one. */
export interface TcgplayerProductRef {
  /** TCGplayer product id, the number after /product/ in a tcgplayer.com URL (a search result's product_id), e.g. 219058. */
  product_id?: number | string;
  /** A tcgplayer.com product URL (/product/<id>/...). Used when product_id is not given. */
  url?: string;
}

export interface TcgplayerSearchOptions {
  /** Search keywords, e.g. "charizard". Optional when game or set is given (browse a game or a set). */
  query?: string;
  /** Game (product line) url_name from games(): pokemon, magic, yugioh, pokemon-japan, one-piece-card-game, lorcana-tcg... */
  game?: string;
  /** Only this set, by url_name from sets() (or a set facet's url_value), e.g. "base-set". */
  set?: string;
  /** Only this rarity, as spelled in the rarity facet (e.g. Common, Rare, Holo Rare, Secret Rare). */
  rarity?: string;
  product_type?: TcgplayerProductType;
  sort?: TcgplayerSearchSort;
  /** Results page, 1-based, up to 200. Defaults to 1. */
  page?: number;
  /** Products per page, 1-50. Defaults to 24. */
  limit?: number;
  [key: string]: unknown;
}

export interface TcgplayerProductOptions extends TcgplayerProductRef {
  [key: string]: unknown;
}

export interface TcgplayerListingsOptions extends TcgplayerProductRef {
  /** Only these conditions: Near Mint, Lightly Played, Moderately Played, Heavily Played, Damaged, Unopened (or NM, LP, MP, HP, DM, U). Array or comma-separated string. */
  condition?: string[] | string;
  /** Only these printings, as a product's skus[].printing spells them (Normal, Foil, Holofoil, Reverse Holofoil, 1st Edition, Unlimited...). */
  printing?: string[] | string;
  /** Only these languages (English, Japanese, French, German, Italian, Spanish, Portuguese, Korean, Chinese (S), Chinese (T), Russian). */
  language?: string[] | string;
  /** Only verified sellers. */
  verified_sellers?: boolean;
  /** Only TCGplayer Direct sellers. */
  direct_only?: boolean;
  sort?: TcgplayerListingSort;
  /** Page, 1-based, up to 200. Defaults to 1. */
  page?: number;
  /** Listings per page, 1-50. Defaults to 10. */
  limit?: number;
  [key: string]: unknown;
}

export interface TcgplayerPriceHistoryOptions extends TcgplayerProductRef {
  range?: TcgplayerHistoryRange;
  [key: string]: unknown;
}

export interface TcgplayerSalesOptions extends TcgplayerProductRef {
  /** Only sales in these conditions (Near Mint... or NM, LP, MP, HP, DM, U). Array or comma-separated string. */
  condition?: string[] | string;
  [key: string]: unknown;
}

export interface TcgplayerSetsOptions {
  /** Game url_name or game_id from games() (pokemon, magic, yugioh, or 3, 1, 2...). */
  game: string | number;
  [key: string]: unknown;
}

export interface TcgplayerPriceGuideOptions {
  /** Set id from sets(), e.g. 604 (Pokemon Base Set). */
  set_id: number | string;
  /** cards (default) or sealed. */
  product_type?: TcgplayerProductType;
  /** Page, 1-based, up to 100. Defaults to 1. */
  page?: number;
  /** Rows per page, 1-500. Defaults to 100. One row per card per condition and printing. */
  limit?: number;
  [key: string]: unknown;
}

export interface TcgplayerSuggestionsOptions {
  /** What the shopper has typed so far, e.g. "charizard". */
  query: string;
  [key: string]: unknown;
}

export interface TcgplayerTrendingOptions {
  game?: TcgplayerTrendingGame;
  [key: string]: unknown;
}

export interface TcgplayerSellerOptions {
  /** TCGplayer seller key, a listing's seller.key (8 characters), e.g. "58f7acae". */
  seller_key: string;
  [key: string]: unknown;
}

export interface TcgplayerSellerFeedbackOptions {
  /** TCGplayer seller key, a listing's seller.key. */
  seller_key: string;
  /** Only feedback with this many stars, 1-5. */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Only feedback that has a written comment. */
  with_comment?: boolean;
  /** Page, 1-based, up to 500. Defaults to 1. */
  page?: number;
  /** Feedback per page, 1-50. Defaults to 10. */
  limit?: number;
  [key: string]: unknown;
}

export interface TcgplayerSellerProductsOptions {
  /** TCGplayer seller key, a listing's seller.key. */
  seller_key: string;
  /** Only the seller's products matching these keywords. Optional. */
  query?: string;
  /** Game url_name from games(). */
  game?: string;
  sort?: TcgplayerSearchSort;
  /** Results page, 1-based, up to 200. Defaults to 1. */
  page?: number;
  /** Products per page, 1-50. Defaults to 24. */
  limit?: number;
  [key: string]: unknown;
}

export class TcgplayerNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/tcgplayer/${path}`, options, undefined, TCGPLAYER_TIMEOUT);
  }

  /**
   * Search TCGplayer (US marketplace, USD) for trading cards and sealed
   * products across every game (Pokemon, Magic: The Gathering, Yu-Gi-Oh!, One
   * Piece, Lorcana and 60+ more), up to 50 per page, sorted by relevance, best
   * match, best selling, name or market price, filtered by game, set, rarity
   * and cards vs sealed. query is optional when game or set is given. Each
   * product has product id, name, URL, image, game, set, card number, rarity,
   * product type, sealed and foil-only flags, release date, market, median and
   * lowest price, lowest price with shipping, listing count and up to 3
   * featured live listings. Also returns total_results, has_more and the
   * filter facets with counts (a facet's url_value is what game and set accept).
   *
   * Costs 1 credit.
   */
  async search(options: TcgplayerSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One TCGplayer product by product id or URL: images (200, 400 and 1000 px),
   * game, set, card number, rarity, release date, market, median and lowest
   * listing price, listing and seller counts, card text, the game's card
   * attributes, and every SKU (condition x printing x language, e.g. Near Mint
   * / Normal / English) with its market price, lowest_sale_price and
   * highest_sale_price over recent sales, sale_count and when it was
   * calculated. The sale fields are sale statistics, not live listings. An
   * unknown id is a 404 (not billed).
   *
   * Costs 1 credit.
   */
  async product(options: TcgplayerProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Live marketplace listings for one TCGplayer product, cheapest first by
   * price plus shipping (default) or by item price, up to 50 per page,
   * filtered by condition, printing, language, verified sellers or TCGplayer
   * Direct. Each listing has price, shipping, total, quantity, condition,
   * printing, language, listing type and the seller (key, name, URL, rating
   * percent, sales band, gold star, verified and Direct flags, location). Also
   * total_results, has_more and condition / printing / language counts.
   *
   * Costs 1 credit.
   */
  async listings(options: TcgplayerListingsOptions): Promise<Record<string, unknown>> {
    return this.post("listings", options);
  }

  /**
   * Sales price history for one TCGplayer product over a month, quarter
   * (default), half year or year, per SKU: total quantity sold, transaction
   * count, average daily sales, and buckets newest first (daily for month,
   * 3-day for quarter, weekly for semi_annual and annual) with market price,
   * quantity sold, transaction count and the low and high sale price with and
   * without shipping (null for a bucket with no sales). Totals across SKUs
   * included. A product with no history is a 404.
   *
   * Costs 1 credit.
   */
  async priceHistory(options: TcgplayerPriceHistoryOptions): Promise<Record<string, unknown>> {
    return this.post("price-history", options);
  }

  /**
   * The 5 most recent sales of one TCGplayer product, optionally only in some
   * conditions: order date, condition, printing, language, quantity, sale
   * price, shipping, total and listing type. TCGplayer shows only the newest
   * 5, so this is not a full sold history; use priceHistory() for volume.
   *
   * Costs 1 credit.
   */
  async sales(options: TcgplayerSalesOptions): Promise<Record<string, unknown>> {
    return this.post("sales", options);
  }

  /**
   * Every game (product line) on TCGplayer, 70+: game_id, name, url_name
   * (what search(), sets() and sellerProducts() accept as game) and whether
   * TCGplayer Direct carries it.
   *
   * Costs 1 credit.
   */
  async games(): Promise<Record<string, unknown>> {
    return this.post("games", {});
  }

  /**
   * Every set of one TCGplayer game, newest release first: set_id (for
   * priceGuide()), name, url_name (for search()'s set filter), abbreviation,
   * release date and the supplemental flag. An unknown game is a 404.
   *
   * Costs 1 credit.
   */
  async sets(options: TcgplayerSetsOptions): Promise<Record<string, unknown>> {
    return this.post("sets", options);
  }

  /**
   * The TCGplayer price guide for one whole set: one row per product per
   * condition and printing with product id, name, URL, card number, rarity,
   * market price and low price, for cards (default) or sealed products, up to
   * 500 rows per page. total_results is given for cards (null for sealed). A
   * set with nothing in the guide is a 404.
   *
   * Costs 1 credit.
   */
  async priceGuide(options: TcgplayerPriceGuideOptions): Promise<Record<string, unknown>> {
    return this.post("price-guide", options);
  }

  /**
   * The TCGplayer search-box autocomplete for a partial query (no game
   * filter): suggested products (product id, name, URL, set, game, score),
   * matching sets and the games the matches come from with counts.
   *
   * Costs 1 credit.
   */
  async suggestions(options: TcgplayerSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * What shoppers are searching on TCGplayer right now, overall or for
   * Pokemon, Magic or Yu-Gi-Oh!: up to 10 terms with a popularity score.
   *
   * Costs 1 credit.
   */
  async trending(options: TcgplayerTrendingOptions = {}): Promise<Record<string, unknown>> {
    return this.post("trending", options);
  }

  /**
   * One TCGplayer seller by seller key (a listing's seller.key): store name,
   * URL, location, member since, lifetime sales band, rating percent, gold
   * star, Direct, Pro, certified hobby shop and WPN flags, shipping, store
   * hours, games sold, and the last 365 days of buyer feedback summarized
   * (total, percent positive, count per star, as described / arrived when
   * expected / good communication). An unknown key is a 404.
   *
   * Costs 1 credit.
   */
  async seller(options: TcgplayerSellerOptions): Promise<Record<string, unknown>> {
    return this.post("seller", options);
  }

  /**
   * Individual buyer feedback on one TCGplayer seller from the last 365 days,
   * newest first, up to 50 per page, optionally only one star rating or only
   * feedback with a comment: date, rating, comment, as described / arrived
   * when expected / good communication, and the buyer's masked nickname as
   * the site shows it. total_results is approximate under the rating and
   * with_comment filters.
   *
   * Costs 1 credit.
   */
  async sellerFeedback(options: TcgplayerSellerFeedbackOptions): Promise<Record<string, unknown>> {
    return this.post("seller-feedback", options);
  }

  /**
   * The products one TCGplayer seller has listed, optionally matching
   * keywords or one game, up to 50 per page, sorted like search(). Each
   * product carries the same fields as search() plus the seller's own
   * listings of it (price, shipping, condition, printing, language,
   * quantity). Also total_results, has_more and facets.
   *
   * Costs 1 credit.
   */
  async sellerProducts(options: TcgplayerSellerProductsOptions): Promise<Record<string, unknown>> {
    return this.post("seller-products", options);
  }
}
