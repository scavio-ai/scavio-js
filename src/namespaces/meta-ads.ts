import type { Scavio } from "../client.js";

// Meta Ad Library (Facebook and Instagram ads). 1 credit flat on all three
// endpoints.
//
// THE PATHS ARE /api/v1/meta-ads/* - HYPHENATED. The route key and namespace
// are metaAds, but the URL segment is meta-ads. Never derive one from the
// other.
//
// FULL CURSOR PAGINATION on search() and advertiser(): page 1 is 30 ads, then
// 10 per page. Walk `has_next_page` to scrape a whole query or a whole
// advertiser. The cursor is an opaque self-contained blob, so paging is
// stateless - and THE OTHER FILTERS ARE IGNORED when a cursor is present,
// because the cursor already carries them. Each page is another credit, so
// depth costs roughly 10 ads per credit past the first 30.
//
// Spend, reach, impressions and the paid-for-by disclosure are NULL on
// COMMERCIAL ads. Only political/issue ads carry them - set
// ad_type: "political_and_issue_ads" to surface them. Expected, not a bug.
//
// Logged-out public data only: nothing here touches a login or the
// token-gated graph.facebook.com/ads_archive API.

export interface MetaAdsSearchOptions {
  /** Search term (1-200 characters). */
  query: string;
  /** Two-letter country code (default "US"). */
  country?: string;
  /** Whether to include ads that have stopped running (default "all"). */
  active_status?: "all" | "active" | "inactive";
  /**
   * Ad category (default "all"). "political_and_issue_ads" is the only way to
   * get spend, reach, impressions and the paid-for-by disclosure back.
   */
  ad_type?: "all" | "political_and_issue_ads";
  /** Creative media filter. Default: no media filter. */
  media_type?: "all" | "image" | "video" | "meme" | "image_and_meme" | "none";
  /** How the query terms are matched (default "keyword_unordered"). */
  search_type?: "keyword_unordered" | "keyword_exact_phrase";
  /**
   * `next_cursor` from the previous response. Page 1 is 30 ads, then 10 per
   * page. EVERY OTHER FILTER IS IGNORED when this is present - the cursor
   * already carries them.
   */
  cursor?: string;
  [key: string]: unknown;
}

export interface MetaAdsAdvertiserOptions {
  /** The advertiser's numeric Facebook Page id (3-25 digits, as a string). */
  page_id: string;
  /** Two-letter country code (default "US"). */
  country?: string;
  /** Whether to include ads that have stopped running (default "all"). */
  active_status?: "all" | "active" | "inactive";
  /**
   * Ad category (default "all"). "political_and_issue_ads" is the only way to
   * get spend, reach, impressions and the paid-for-by disclosure back.
   */
  ad_type?: "all" | "political_and_issue_ads";
  /** Creative media filter. Default: no media filter. */
  media_type?: "all" | "image" | "video" | "meme" | "image_and_meme" | "none";
  /**
   * `next_cursor` from the previous response. Page 1 is 30 ads, then 10 per
   * page. EVERY OTHER FILTER IS IGNORED when this is present.
   */
  cursor?: string;
  [key: string]: unknown;
}

export interface MetaAdsAdOptions {
  /** The ad's archive id (3-25 digits, as a string). */
  ad_archive_id: string;
  [key: string]: unknown;
}

export class MetaAdsNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search the Meta Ad Library. Page 1 returns 30 ads with the full creative:
   * page name, ad copy, headline, CTA, images and videos, the platforms each
   * ran on, and run dates - plus `total_results`, `total_is_capped`,
   * `has_next_page` and `next_cursor`.
   *
   * Cursor-paginated the whole way down: 30 ads on page 1, then 10 per page.
   * Walk `has_next_page` to pull an entire query. THE OTHER FILTERS ARE
   * IGNORED once `cursor` is set, because the cursor carries them itself.
   *
   * `total_results` CAPS AT 50000 with `total_is_capped: true` - Meta only
   * reports ">50,000", so never present it as an exact count. Spend, reach,
   * impressions and the paid-for-by disclosure are null unless
   * `ad_type` is "political_and_issue_ads".
   *
   * Costs 1 credit PER PAGE, so depth costs roughly 10 ads per credit past the
   * first 30.
   */
  async search(
    options: MetaAdsSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/meta-ads/search", options);
  }

  /**
   * Every ad a Facebook Page is running, addressed by its numeric page id.
   * Page 1 returns 30 ads with the same creative detail as search(), then 10
   * per page off `next_cursor`; walk `has_next_page` to pull the advertiser's
   * whole library.
   *
   * The other filters are ignored once `cursor` is set. Spend, reach,
   * impressions and the paid-for-by disclosure are null on commercial ads -
   * only political/issue ads carry them.
   *
   * Costs 1 credit per page.
   */
  async advertiser(
    options: MetaAdsAdvertiserOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/meta-ads/advertiser", options);
  }

  /**
   * One ad in full by archive id: creative, advertiser, run dates, platforms
   * and any political disclosure.
   *
   * Spend, reach and impressions are null unless the ad is a political/issue
   * ad.
   *
   * Costs 1 credit. Single response, no pagination.
   */
  async ad(
    options: MetaAdsAdOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/meta-ads/ad", options);
  }
}
