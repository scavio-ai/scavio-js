import type { Scavio } from "../client.js";

// Google Play is 2 credits flat on all three endpoints. It sits on the premium
// per-domain proxy table and is NOT priced like the `google` namespace, which
// is part of why it is a separate namespace.
//
// SEARCH HAS NO PAGINATION - Play serves one shelf of ~30 apps and there is no
// page or cursor to ask for more.
//
// `hl` changes the STOREFRONT, not just the strings: at hl=pt-BR the title,
// description, install formatting and content rating all move with it. Play
// silently falls back to English/US on values it does not serve.
//
// The reviews `cursor` is opaque, SINGLE-USE, and encodes the sort as well as
// the position - send it back with the SAME `sort` it came from. A cursor past
// the last review is a 404, not an empty page.
//
// app() already returns the 20 reviews Play server-renders; reviews() is for
// paging past them or sorting differently. The reviews RPC answering a 200
// with an empty payload is a BILLED 404 - premium price paid to learn the
// package has no reviews or does not exist.
//
// Games are folded into the apps vertical. Books and films use a different
// card shape entirely and are not covered.

export interface GooglePlaySearchOptions {
  /** Search query (1-200 characters). */
  query: string;
  /**
   * Interface language (2-20 characters, default "en"). Changes the
   * STOREFRONT, not only the strings - title, description, install formatting
   * and content rating all move with it. Play falls back to English on values
   * it does not serve.
   */
  hl?: string;
  /** Country code (2-10 characters, default "us"). */
  gl?: string;
  [key: string]: unknown;
}

export interface GooglePlayAppOptions {
  /**
   * Android package name (com.spotify.music) or any play.google.com URL
   * carrying one in its id param. 1-500 characters.
   */
  app_id: string;
  /**
   * Interface language (2-20 characters, default "en"). Changes the storefront
   * as well as the strings.
   */
  hl?: string;
  /** Country code (2-10 characters, default "us"). */
  gl?: string;
  [key: string]: unknown;
}

export interface GooglePlayReviewsOptions {
  /**
   * Android package name or any play.google.com URL carrying one in its id
   * param. 1-500 characters.
   */
  app_id: string;
  /**
   * Review sort order (default "newest"). The cursor encodes this value, so
   * changing `sort` mid-pagination invalidates the cursor.
   */
  sort?: "relevance" | "newest" | "rating";
  /**
   * Reviews per page, 1-200 (default 50). Capped at 200 on our side; Play
   * honours more, but a single page that large is megabytes for one call.
   */
  count?: number;
  /**
   * next_cursor from a prior response (1-4000 characters). OPAQUE and
   * SINGLE-USE, and it encodes the sort as well as the position - send it back
   * with the SAME `sort` it came from. A cursor past the last review is a 404,
   * not an empty page.
   */
  cursor?: string;
  /** Interface language (2-20 characters, default "en"). */
  hl?: string;
  /** Country code (2-10 characters, default "us"). */
  gl?: string;
  [key: string]: unknown;
}

export class GooglePlayNamespace {
  constructor(private client: Scavio) {}

  /**
   * Ranked apps: package name, title, developer, rating, install count, price
   * and IAP range, content rating, icon and screenshots. A branded query
   * returns the hero card as result 1 projected to the same row shape, plus
   * Play's related-query rail.
   *
   * NO PAGINATION - one shelf of ~30 apps, with no page or cursor param.
   * `hl` moves the whole storefront, not just the language of the strings.
   *
   * Costs 2 credits.
   */
  async search(
    options: GooglePlaySearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/googleplay/search", options);
  }

  /**
   * Full store listing: installs including the REAL count Play publishes but
   * never renders, rating and star histogram, description, developer identity
   * and legal contact, price and IAPs, categories and gameplay tags,
   * screenshots and trailer, version and Android requirement, release and
   * update dates, changelog, full permission tree, Data safety table, the 20
   * server-rendered reviews, and the similar-apps and more-by-developer rails.
   *
   * Those 20 reviews ride along at no extra cost - use reviews() only to page
   * past them or to sort differently.
   *
   * Costs 2 credits. Single response, no pagination.
   */
  async app(
    options: GooglePlayAppOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/googleplay/app", options);
  }

  /**
   * A page of reviews: star score, full text, author, thumbs-up count,
   * developer reply, and the APP VERSION the reviewer was running.
   *
   * Paged with `cursor` -> next_cursor. The cursor is opaque and SINGLE-USE
   * and encodes the sort as well as the position, so send it back with the
   * same `sort` it came from; a cursor past the last review is a 404, not an
   * empty page. `count` is capped at 200. An empty payload here is a BILLED
   * 404 - the premium price is paid to learn the package has no reviews or
   * does not exist.
   *
   * Costs 2 credits.
   */
  async reviews(
    options: GooglePlayReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/googleplay/reviews", options);
  }
}
