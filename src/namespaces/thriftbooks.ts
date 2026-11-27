import type { Scavio } from "../client.js";

// ThriftBooks (thriftbooks.com, the US online used-book seller) search, isbn, work, edition,
// copies, editions, reviews and suggestions endpoints; US storefront, prices in USD per format and
// condition, 1 credit each. Generated from the backend routes: every option and its doc mirrors the
// API's own request schema; an input the API only accepts to refuse (a 400 that says 'not offered')
// is left out. The server enforces the value rules and the one-of rules (send one of an id or a
// link). Every call raises the request timeout to THRIFTBOOKS_TIMEOUT and never lowers a longer
// client timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every thriftbooks call. */
export const THRIFTBOOKS_TIMEOUT = 240_000;

export interface ThriftbooksSearchOptions {
  /**
   * Search keywords (title, author, subject). Leave out to browse the whole catalog with list,
   * genre or other filters. An ISBN is a 400 that points to /isbn (ThriftBooks search does not
   * match ISBNs).
   */
  query?: string;
  /**
   * A preset: bestsellers (the site's bestseller order), deals (ThriftBooks Deals) or new_releases
   * (New Releases). Combines with query and the filters.
   */
  list?: "bestsellers" | "deals" | "new_releases";
  /**
   * most_popular (default; bestsellers with list bestsellers), relevance (top matches),
   * bestsellers, title_asc, title_desc, newest or oldest (publication date): the site's sort menu.
   */
  sort?: "most_popular" | "relevance" | "bestsellers" | "title_asc" | "title_desc" | "newest" | "oldest";
  /**
   * Results page, 1-based (default 1). page x page_size must stay within 10000 (the site's search
   * depth).
   */
  page?: number;
  /** Works per page, 1 to 50 (default 25). */
  page_size?: number;
  /**
   * Formats, one or a list: paperback, hardcover, mass_market_paperback, library_binding, audio_cd,
   * mp3_cd, audio_cassette, perfect_paperback, board_book, comic, dvd, blu_ray, 4k_ultra_hd, or a
   * format id an answer lists (format_id).
   */
  format?: string | number | Array<string | number>;
  /** Conditions, one or a list: new, like_new, very_good, good, acceptable. */
  condition?: string | number | Array<string | number>;
  /**
   * Languages, one or a list: english, spanish, french, german, italian, chinese, russian,
   * portuguese, polish, japanese, dutch, turkish, korean, greek, or a language id an answer lists
   * in facets.languages.
   */
  language?: string | number | Array<string | number>;
  /**
   * Genre ids, one or a list, as an answer lists them in facets.genres[].id (13207 Fiction, 13564
   * Horror, 15013 Science Fiction & Fantasy) or facets.age_ranges[].id.
   */
  genre?: string | number | Array<string | number>;
  /** Lowest price in whole US dollars. */
  min_price?: number;
  /** Highest price in whole US dollars. */
  max_price?: number;
  /** ThriftBooks Deals only (the same as list deals). */
  deals?: boolean;
  /** New Releases only (the same as list new_releases). */
  new_releases?: boolean;
  /** Collectibles only. */
  collectible?: boolean;
  /** Signed books only. */
  signed?: boolean;
  /** First editions only. */
  first_edition?: boolean;
  /** Large print only. */
  large_print?: boolean;
  /** Also list works with no copy for sale now (default false, as the site). */
  include_out_of_stock?: boolean;
  [key: string]: unknown;
}

export interface ThriftbooksIsbnOptions {
  /**
   * An ISBN-10 or ISBN-13 (dashes and spaces allowed; the check digit is verified, so a typo is a
   * 400, not charged).
   */
  isbn: string;
  [key: string]: unknown;
}

export interface ThriftbooksWorkOptions {
  /**
   * A ThriftBooks work id (items[].work_id of a search, work_id of an ISBN lookup). A work is the
   * book across all its editions.
   */
  work_id: string | number;
  [key: string]: unknown;
}

export interface ThriftbooksEditionOptions {
  /**
   * A ThriftBooks edition id (edition_id of an ISBN lookup, conditions[].edition_id of a work,
   * editions[].edition_id).
   */
  edition_id: string | number;
  [key: string]: unknown;
}

export interface ThriftbooksCopiesOptions {
  /**
   * A ThriftBooks edition id (edition_id of an ISBN lookup, conditions[].edition_id of a work,
   * editions[].edition_id).
   */
  edition_id: string | number;
  [key: string]: unknown;
}

export interface ThriftbooksEditionsOptions {
  /**
   * A ThriftBooks work id (items[].work_id of a search, work_id of an ISBN lookup). A work is the
   * book across all its editions.
   */
  work_id: string | number;
  /**
   * Formats, one or a list: paperback, hardcover, mass_market_paperback, library_binding, audio_cd,
   * mp3_cd, audio_cassette, perfect_paperback, board_book, comic, dvd, blu_ray, 4k_ultra_hd, or a
   * format id an answer lists (format_id).
   */
  format?: string | number | Array<string | number>;
  /** Conditions, one or a list: new, like_new, very_good, good, acceptable. */
  condition?: string | number | Array<string | number>;
  /**
   * bestselling (default), newest, oldest (publication date), price_asc or price_desc: the site's
   * sort menu.
   */
  sort?: "bestselling" | "newest" | "oldest" | "price_asc" | "price_desc";
  /** Editions page, 1-based, 25 per page (total_pages says how many). */
  page?: number;
  /**
   * Editions with a copy for sale now only (default true, as the site). false lists every edition.
   */
  in_stock_only?: boolean;
  [key: string]: unknown;
}

export interface ThriftbooksReviewsOptions {
  /**
   * A ThriftBooks work id (items[].work_id of a search, work_id of an ISBN lookup). A work is the
   * book across all its editions.
   */
  work_id: string | number;
  /** Reviews page, 1-based, 10 per page (has_next says if there is another). */
  page?: number;
  [key: string]: unknown;
}

export interface ThriftbooksSuggestionsOptions {
  /** A partial search query. */
  query: string;
  [key: string]: unknown;
}

export class ThriftbooksNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = THRIFTBOOKS_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/thriftbooks/${path}`, options, undefined, timeout);
  }

  /**
   * Search ThriftBooks (thriftbooks.com, the US online used-book seller). Scavio fetches the public
   * page on request; ThriftBooks has no public API. Keywords or the whole catalog, with the presets
   * bestsellers, deals (ThriftBooks Deals) and new_releases; filters for format, condition,
   * language, genre, price, deals, new releases, collectible, signed, first edition and large
   * print; the site's 7 sorts; up to 50 works per page. Costs 1 credit.
   */
  async search(options: ThriftbooksSearchOptions = {}): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * Look a book up on ThriftBooks (thriftbooks.com, the US online used-book seller). Scavio fetches
   * the public page on request; ThriftBooks has no public API. by ISBN-10 or ISBN-13 (check digit
   * verified; an ISBN-10 is converted to ISBN-13): the work and edition ThriftBooks matches, then
   * the work's format x condition table. Costs 1 credit.
   */
  async isbn(options: ThriftbooksIsbnOptions): Promise<Record<string, unknown>> {
    return this.post("isbn", options);
  }

  /**
   * The format x condition table of one work on ThriftBooks (thriftbooks.com, the US online
   * used-book seller). Scavio fetches the public page on request; ThriftBooks has no public API. By
   * work_id: for each format (Hardcover, Paperback, Audio CD, ...) the price, quantity and copy
   * details of each condition (New, Like New, Very Good, Good, Acceptable), as the work's page
   * shows them. Costs 1 credit.
   */
  async work(options: ThriftbooksWorkOptions): Promise<Record<string, unknown>> {
    return this.post("work", options);
  }

  /**
   * One edition of a book on ThriftBooks (thriftbooks.com, the US online used-book seller). Scavio
   * fetches the public page on request; ThriftBooks has no public API. By edition_id. Costs 1
   * credit.
   */
  async edition(options: ThriftbooksEditionOptions): Promise<Record<string, unknown>> {
    return this.post("edition", options);
  }

  /**
   * Every copy for sale of one edition on ThriftBooks (thriftbooks.com, the US online used-book
   * seller). Scavio fetches the public page on request; ThriftBooks has no public API. By
   * edition_id, one row per condition and copy type. Costs 1 credit.
   */
  async copies(options: ThriftbooksCopiesOptions): Promise<Record<string, unknown>> {
    return this.post("copies", options);
  }

  /**
   * All editions of one work on ThriftBooks (thriftbooks.com, the US online used-book seller).
   * Scavio fetches the public page on request; ThriftBooks has no public API. 25 per page, filtered
   * by format and condition, in stock only (default) or every edition, sorted bestselling, newest,
   * oldest or by price. Costs 1 credit.
   */
  async editions(options: ThriftbooksEditionsOptions): Promise<Record<string, unknown>> {
    return this.post("editions", options);
  }

  /**
   * ThriftBooks customer reviews of one work on ThriftBooks (thriftbooks.com, the US online
   * used-book seller). Scavio fetches the public page on request; ThriftBooks has no public API. 10
   * per page in the site's order. Costs 1 credit.
   */
  async reviews(options: ThriftbooksReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * The search-box suggestions of ThriftBooks (thriftbooks.com, the US online used-book seller).
   * Scavio fetches the public page on request; ThriftBooks has no public API. Title and author
   * completions for a partial query, as given. Costs 1 credit.
   */
  async suggestions(options: ThriftbooksSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
