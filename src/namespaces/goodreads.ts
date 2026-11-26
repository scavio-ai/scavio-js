import type { Scavio } from "../client.js";

// Goodreads (goodreads.com, Amazon's book community) search, book, reviews, suggestions, author,
// authorBooks, series, editions, list, bookLists, listSearch, quotes, genre and newReleases
// endpoints; one global English site, 1 credit each. Generated from the backend routes: every
// option and its doc mirrors the API's own request schema; an input the API only accepts to refuse
// (a 400 that says 'not offered') is left out. The server enforces the value rules and the one-of
// rules (send one of an id or a link). Every call raises the request timeout to GOODREADS_TIMEOUT
// and never lowers a longer client timeout. Failed upstream calls and refused inputs are not
// charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every goodreads call. */
export const GOODREADS_TIMEOUT = 240_000;

export interface GoodreadsSearchOptions {
  /** Search text: a title, an author, a phrase or an ISBN (an ISBN finds that edition). */
  query: string;
  /** books (default), lists or quotes: Goodreads' own search tabs. */
  type?: "books" | "lists" | "quotes";
  /** Page of 20 (1 to 100; has_more says whether there is another). */
  page?: number;
  [key: string]: unknown;
}

export interface GoodreadsBookOptions {
  /** A Goodreads book id (book_id of any answer) or the id with its slug (44767458-dune). */
  book_id?: string | number;
  /** A goodreads.com book link. */
  url?: string;
  /** An ISBN-13 or ISBN-10 (checksum verified): the edition with it. */
  isbn?: string;
  [key: string]: unknown;
}

export interface GoodreadsReviewsOptions {
  /** A Goodreads book id. */
  book_id?: string | number;
  /** A goodreads.com book link. */
  url?: string;
  /** popular (default), newest or oldest: the review page's own orders. */
  sort?: "popular" | "newest" | "oldest";
  /** Only reviews with this many stars (1-5). */
  stars?: number;
  /**
   * Only reviews in this language, as the page's filter lists it (en, es, fr, de, zh-TW ...;
   * review_languages of a book or plain reviews answer lists them with counts).
   */
  language?: string;
  /** Only reviews of this edition (default: every edition of the work, as Goodreads shows them). */
  edition_only?: boolean;
  /** Pages of 30 to read in this call, 1 to 4 (up to 120 reviews of the view). */
  pages?: number;
  [key: string]: unknown;
}

export interface GoodreadsSuggestionsOptions {
  /** What a reader has typed so far: a title, an author or an ISBN. */
  query: string;
  [key: string]: unknown;
}

export interface GoodreadsAuthorOptions {
  /** A Goodreads author id (author.author_id of any answer). */
  author_id?: string | number;
  /** A goodreads.com author link. */
  url?: string;
  [key: string]: unknown;
}

export interface GoodreadsAuthorBooksOptions {
  /** A Goodreads author id. */
  author_id?: string | number;
  /** A goodreads.com author link. */
  url?: string;
  /**
   * popularity (default), original_publication_year, title, average_rating, number_of_pages: the
   * author page's own sorts.
   */
  sort?: "popularity" | "original_publication_year" | "title" | "average_rating" | "number_of_pages";
  /** Page of 30 (1 to 100; has_more says whether there is another). */
  page?: number;
  [key: string]: unknown;
}

export interface GoodreadsSeriesOptions {
  /** A Goodreads series id (series[].series_id of a book answer). */
  series_id?: string | number;
  /** A goodreads.com series link. */
  url?: string;
  [key: string]: unknown;
}

export interface GoodreadsEditionsOptions {
  /** A Goodreads work id: work_id of a book answer (all editions of a book share it). */
  work_id?: string | number;
  /** A goodreads.com work editions link. */
  url?: string;
  /**
   * title, original_date_published, date_published, avg_rating, num_ratings, format: the editions
   * page's own six sorts (default Goodreads' own order).
   */
  sort?: "title" | "original_date_published" | "date_published" | "avg_rating" | "num_ratings" | "format";
  /** Page of 10 (1 to 1000; has_more says whether there is another). */
  page?: number;
  [key: string]: unknown;
}

export interface GoodreadsListOptions {
  /** A Goodreads Listopia list id (list_id of a list answer). */
  list_id?: string | number;
  /** A goodreads.com list link. */
  url?: string;
  /** Page of 100 (1 to 1000; has_more says whether there is another). */
  page?: number;
  [key: string]: unknown;
}

export interface GoodreadsBookListsOptions {
  /** A Goodreads book id. */
  book_id?: string | number;
  /** A goodreads.com book link. */
  url?: string;
  /** Page of 30 (1 to 1000; has_more says whether there is another). */
  page?: number;
  [key: string]: unknown;
}

export interface GoodreadsListSearchOptions {
  /** Words in a list's title. */
  query: string;
  /** Page of 20 (1 to 100; has_more says whether there is another). */
  page?: number;
  [key: string]: unknown;
}

export interface GoodreadsQuotesOptions {
  /** Quotes containing these words, or by this author or from this book. */
  query?: string;
  /** Quotes with this tag (tags[] of a quote answer). */
  tag?: string;
  /** Quotes from one book: its work_id (book answer). */
  work_id?: string | number;
  /** Page of 20 (query) or 30 (tag, work_id) (1 to 100; has_more says whether there is another). */
  page?: number;
  [key: string]: unknown;
}

export interface GoodreadsGenreOptions {
  /**
   * A Goodreads genre as its link writes it (fantasy, science-fiction, young-adult,
   * historical-fiction; genres[].slug of a book answer).
   */
  genre: string;
  /**
   * popular (default): the first 50 books of the genre's shelf, most shelved first; most_read: the
   * books most read this week in the genre.
   */
  list?: "popular" | "most_read";
  [key: string]: unknown;
}

export interface GoodreadsNewReleasesOptions {
  /** New releases Goodreads tags with this genre. */
  genre?: string;
  /**
   * YYYY-MM: the month's most popular releases across every genre (the first 15 Goodreads shows).
   */
  month?: string;
  [key: string]: unknown;
}

export class GoodreadsNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = GOODREADS_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/goodreads/${path}`, options, undefined, timeout);
  }

  /**
   * Search Goodreads (goodreads.com, Amazon's book community) for books (by title, author or ISBN),
   * Listopia lists or quotes, 20 per page. Costs 1 credit.
   */
  async search(options: GoodreadsSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One book on Goodreads (goodreads.com, Amazon's book community) by id, link or ISBN. Costs 1
   * credit.
   */
  async book(options: GoodreadsBookOptions): Promise<Record<string, unknown>> {
    return this.post("book", options);
  }

  /**
   * Reader reviews of one book on Goodreads (goodreads.com, Amazon's book community), 30 per page,
   * with Goodreads' own sort (popular, newest, oldest), star filter, language filter and
   * this-edition filter. Costs 1 credit.
   */
  async reviews(options: GoodreadsReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * The books Goodreads (goodreads.com, Amazon's book community) suggests as a reader types a
   * title, author or ISBN (its search box). Costs 1 credit.
   */
  async suggestions(options: GoodreadsSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /** One author's page on Goodreads (goodreads.com, Amazon's book community). Costs 1 credit. */
  async author(options: GoodreadsAuthorOptions): Promise<Record<string, unknown>> {
    return this.post("author", options);
  }

  /**
   * Every book of one author on Goodreads (goodreads.com, Amazon's book community), 30 per page, in
   * Goodreads' order or by original_publication_year, title, average_rating or number_of_pages.
   * Costs 1 credit.
   */
  async authorBooks(options: GoodreadsAuthorBooksOptions): Promise<Record<string, unknown>> {
    return this.post("author-books", options);
  }

  /**
   * One series on Goodreads (goodreads.com, Amazon's book community) with every book in Goodreads'
   * reading order. Costs 1 credit.
   */
  async series(options: GoodreadsSeriesOptions): Promise<Record<string, unknown>> {
    return this.post("series", options);
  }

  /**
   * Every edition of one work on Goodreads (goodreads.com, Amazon's book community), 10 per page,
   * with Goodreads' six sorts. Costs 1 credit.
   */
  async editions(options: GoodreadsEditionsOptions): Promise<Record<string, unknown>> {
    return this.post("editions", options);
  }

  /**
   * One Listopia list on Goodreads (goodreads.com, Amazon's book community), 100 books per page in
   * vote order. Costs 1 credit.
   */
  async list(options: GoodreadsListOptions): Promise<Record<string, unknown>> {
    return this.post("list", options);
  }

  /**
   * The Listopia lists that contain one book on Goodreads (goodreads.com, Amazon's book community),
   * 30 per page. Costs 1 credit.
   */
  async bookLists(options: GoodreadsBookListsOptions): Promise<Record<string, unknown>> {
    return this.post("book-lists", options);
  }

  /**
   * Listopia lists on Goodreads (goodreads.com, Amazon's book community) whose title matches, 20
   * per page. Costs 1 credit.
   */
  async listSearch(options: GoodreadsListSearchOptions): Promise<Record<string, unknown>> {
    return this.post("list-search", options);
  }

  /**
   * Quotes on Goodreads (goodreads.com, Amazon's book community) by search words, by tag or from
   * one book (work_id). Costs 1 credit.
   */
  async quotes(options: GoodreadsQuotesOptions): Promise<Record<string, unknown>> {
    return this.post("quotes", options);
  }

  /** Books of one genre on Goodreads (goodreads.com, Amazon's book community). Costs 1 credit. */
  async genre(options: GoodreadsGenreOptions): Promise<Record<string, unknown>> {
    return this.post("genre", options);
  }

  /** New releases on Goodreads (goodreads.com, Amazon's book community). Costs 1 credit. */
  async newReleases(options: GoodreadsNewReleasesOptions): Promise<Record<string, unknown>> {
    return this.post("new-releases", options);
  }
}
