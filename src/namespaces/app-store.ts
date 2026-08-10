import type { Scavio } from "../client.js";

// The Apple App Store is 1 credit flat on all three endpoints - it runs on
// Apple's official iTunes JSON API, which is the cheapest surface here.
//
// SEARCH HAS NO PAGINATION. `limit` (1-200) is the only lever on volume; every
// offset spelling is silently ignored. Raise the limit, never reach for a page
// param.
//
// app() accepts BOTH a numeric App Store id and a bundle id (auto-detected,
// identical payload). reviews() is NUMERIC ONLY - the RSS feed has no
// bundle-id form.
//
// `country` decides price, currency, localised title and whether the app is
// sold there at all. Anything that is not two letters falls back to US, so
// "usa" silently buys a US result set.
//
// An id Apple cannot resolve is a BILLED 404: Apple charges for the 200 that
// carries an empty result list. reviews() cannot 404 at all - an unknown id
// and a real app with zero reviews return the same empty feed.
//
// Mac rows carry NO iPad or Apple TV screenshots, advisories, features,
// supported devices or Game Center flag - those come back empty rather than
// absent.
//
// The transport's `attribute` param is deliberately not exposed:
// softwareDeveloper is valid upstream but has no effect, and plain search
// already matches the developer field.

export interface AppStoreSearchOptions {
  /**
   * Search term (1-500 characters). Matches app name, keyword OR publisher
   * name - searching a developer returns their catalogue.
   */
  term: string;
  /**
   * Number of apps to return, 1-200 (default 25). THE ONLY LEVER on result
   * volume: there is no pagination and every offset spelling is ignored.
   */
  limit?: number;
  /**
   * Two-letter storefront code (default "us"). Decides price, currency,
   * localised title and whether the app is sold there at all. Anything that is
   * not exactly two letters falls back to US.
   */
  country?: string;
  /** Which catalogue to search (default "software", i.e. iPhone apps). */
  entity?: "software" | "ipad_software" | "mac_software";
  /**
   * Five-letter locale for the returned text, e.g. "en_us". Independent of
   * `country`: the storefront sets the price, this sets the words.
   */
  lang?: string;
  [key: string]: unknown;
}

export interface AppStoreAppOptions {
  /**
   * App Store id OR bundle id (notion.id, com.burbn.instagram), auto-detected
   * and returning an identical payload. 1-255 characters matching
   * ^[A-Za-z0-9][A-Za-z0-9._-]*$ - a pasted apps.apple.com URL is rejected
   * with a free 400.
   */
  app_id: string;
  /**
   * Two-letter storefront code (default "us"). Decides price, currency,
   * localised title and availability. Anything not exactly two letters falls
   * back to US.
   */
  country?: string;
  [key: string]: unknown;
}

export interface AppStoreReviewsOptions {
  /**
   * NUMERIC App Store id only - the reviews RSS feed has no bundle-id form,
   * unlike app().
   */
  app_id: string;
  /**
   * Two-letter storefront code (default "us"). Each storefront has its own
   * 500-review ceiling, so a different country is how you read past page 10.
   */
  country?: string;
  /**
   * Result page, 1-10 (default 1), 50 reviews each. HARD STOP AT PAGE 10 -
   * 500 reviews per storefront is Apple's anonymous ceiling.
   */
  page?: number;
  /**
   * Review sort order (default "most_recent"). Under "most_recent" almost
   * every review is too new to have been voted on and the vote fields come
   * back as ZEROES; "most_helpful" returns them densely populated.
   */
  sort?: "most_recent" | "most_helpful";
  [key: string]: unknown;
}

export class AppStoreNamespace {
  constructor(private client: Scavio) {}

  /**
   * Up to 200 fully-shaped App Store apps - the same 43-field row as app() -
   * which makes this a bulk metadata fetch as well as a search, and a
   * publisher lookup when the term is a developer name.
   *
   * NO PAGINATION. `limit` (1-200, default 25) is the only lever on volume;
   * every offset spelling is silently ignored. Mac rows carry no iPad or Apple
   * TV screenshots, advisories, features, supported devices or Game Center
   * flag.
   *
   * Costs 1 credit.
   */
  async search(
    options: AppStoreSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/appstore/search", options);
  }

  /**
   * Full listing: title, description, developer and seller identity, price and
   * currency, all-time and current-version ratings, version and release notes,
   * genres, content rating and advisories, icons at three sizes, screenshots,
   * download size, minimum OS, languages, supported devices, Game Center and
   * VPP flags.
   *
   * Takes a numeric App Store id or a bundle id interchangeably. An id Apple
   * cannot resolve is a BILLED 404 - Apple charges for the empty result list.
   *
   * Costs 1 credit. Single response, no pagination.
   */
  async app(
    options: AppStoreAppOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/appstore/app", options);
  }

  /**
   * A page of reviews: star rating, title, full text, author, and the APP
   * VERSION the review was written against.
   *
   * NUMERIC APP IDS ONLY here. Paged 1-10 at 50 reviews each and hard-stopped
   * at page 10 - 500 reviews per storefront is Apple's anonymous ceiling, so
   * ask a different `country` to reach further. This endpoint CANNOT 404: an
   * unknown id and a real app with zero reviews return the same empty feed.
   * Under sort "most_recent" the vote fields are zeroes.
   *
   * Costs 1 credit.
   */
  async reviews(
    options: AppStoreReviewsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/appstore/reviews", options);
  }
}
