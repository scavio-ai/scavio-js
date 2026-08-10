import type { Scavio } from "../client.js";

// Google Ads Transparency Center. 1 credit flat on all three endpoints.
//
// START WITH advertisers(). It is the lookup that turns a brand name or a
// domain into the advertiser_id that search() and creative() are keyed by.
//
// IMPRESSIONS AND REACH ARE EEA-ONLY. They are DSA-compelled, so Google
// publishes them only where the law requires: impressions_min, impressions_max
// and first_shown come back NULL on US creatives. That is not a bug and not a
// gap in the parse - point your examples at an EEA region.
//
// The three format sets are DISJOINT: an advertiser's text, image and video
// ads share no creatives, so a format filter is a partition, not a narrowing.
//
// Totals are RANGES, never exact: an advertiser's headline ad count is
// total_ads_min / total_ads_max, and a creative's impression bucket can carry
// a lower bound, an upper bound, or one alone.

export interface GoogleAdsAdvertisersOptions {
  /** Brand name or domain to resolve (1-200 characters). */
  query: string;
  /**
   * ISO alpha-2 country (US, GB, DE) or a Google geo criteria id as a string.
   * Default: no region filter.
   */
  region?: string;
  /**
   * Rows per arm (1-20, default 10). Advertisers and domains are capped
   * SEPARATELY, so a name query can return up to twice this many rows.
   */
  limit?: number;
  [key: string]: unknown;
}

export interface GoogleAdsSearchOptions {
  /**
   * Bare host, www host or full URL; reduced to the registrable host. THE ONLY
   * WAY to get the `domain` field back on each row. Required unless
   * `advertiser_id` is given.
   */
  domain?: string;
  /**
   * Google advertiser id, e.g. "AR16735076323512287233". The shape is checked
   * before any request is made, so a typo costs nothing. Required unless
   * `domain` is given.
   */
  advertiser_id?: string;
  /**
   * ISO alpha-2 country (US, GB, DE) or a Google geo criteria id as a string.
   * Scopes the deep links on every row - the same advertiser can share ZERO
   * creatives between two countries. Default: worldwide.
   */
  region?: string;
  /** Creative format. The three sets are DISJOINT. Default: all formats. */
  format?: "text" | "image" | "video";
  /** Google surface the ad ran on. Default: all surfaces. */
  platform?: "play" | "maps" | "search" | "shopping" | "youtube";
  /** Ad topic (default "all"). */
  topic?: "all" | "political";
  /**
   * Rows per page (1-100, default 40). 100 is a HARD UPSTREAM CEILING, not our
   * policy: Google answers a larger request with ZERO rows rather than an
   * error.
   */
  limit?: number;
  /**
   * `next_cursor` from the previous response (1-4000 characters). Re-send the
   * SAME filters alongside it. Null once the advertiser is exhausted.
   */
  cursor?: string;
  [key: string]: unknown;
}

export interface GoogleAdsCreativeOptions {
  /** Google advertiser id, e.g. "AR16735076323512287233". */
  advertiser_id: string;
  /**
   * Creative id. MUST belong to the `advertiser_id` sent with it - the lookup
   * is keyed by the pair and a mismatch is a 404.
   */
  creative_id: string;
  [key: string]: unknown;
}

export class GoogleAdsNamespace {
  constructor(private client: Scavio) {}

  /**
   * START HERE. Resolves a brand name or a domain to the `advertiser_id` that
   * search() and creative() are keyed by.
   *
   * Returns two row kinds in one list: `advertiser` rows carry the id, the
   * verified name, the verification country and the total ad count AS A RANGE
   * (total_ads_min / total_ads_max - Google never publishes an exact figure);
   * `domain` rows carry a website. A name query returns both kinds, a
   * domain-shaped query returns domains only.
   *
   * NO PAGINATION - this is an autocomplete, roughly 20 rows per arm, and
   * `limit` caps each arm separately.
   *
   * Costs 1 credit.
   */
  async advertisers(
    options: GoogleAdsAdvertisersOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/googleads/advertisers", options);
  }

  /**
   * Every ad Google is running for one advertiser: the creative (archived
   * image, rich-media bundle, Google's renderer link, dimensions), advertiser
   * id and name, format, first and last seen dates, days actually run, plus
   * total_ads_min / total_ads_max.
   *
   * Cursor-paginated: read `next_cursor` off the response and send it back as
   * `cursor` WITH THE SAME FILTERS, up to 100 rows per page. `next_cursor` is
   * null once exhausted. A `limit` above 100 is not an error - Google answers
   * it with ZERO rows.
   *
   * The three `format` sets are disjoint, and `domain` is dropped from every
   * row when the query is by `advertiser_id`, so query by domain if you need
   * that field. The headline total is a RANGE, never an exact count.
   *
   * Pass `domain` or `advertiser_id`.
   *
   * Costs 1 credit per page.
   */
  async search(
    options: GoogleAdsSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/googleads/search", options);
  }

  /**
   * One creative in full, and the ONLY endpoint carrying its history: every
   * size variation of the asset, the impression bucket, the per-region
   * breakdown with first and last shown dates and a per-surface impression
   * split inside each region, the format, Google's category label, and the
   * funder disclosure on political ads.
   *
   * IMPRESSIONS AND REACH ARE EEA-ONLY: impressions_min, impressions_max and
   * first_shown are NULL on US creatives because Google publishes reach only
   * where the DSA compels it. A bucket row can carry a lower bound, an upper
   * bound, or one alone.
   *
   * Keyed by the `advertiser_id` + `creative_id` PAIR - a mismatched pair is a
   * 404, not an empty response.
   *
   * Costs 1 credit. Single response, no pagination.
   */
  async creative(
    options: GoogleAdsCreativeOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/googleads/creative", options);
  }
}
