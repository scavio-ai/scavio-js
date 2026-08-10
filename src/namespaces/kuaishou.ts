import type { Scavio } from "../client.js";

// Kuaishou (China) - kuaishou.com. This is NOT Kwai international: kwai.com
// ids and links are not served upstream and come back as an empty envelope,
// so keep kwai.com URLs out of every call here.
//
// CREDITS ARE PER-ENDPOINT, not a platform constant. profile costs 10,
// video costs 2, videosBatch costs 40, the four search endpoints cost 10 each,
// and everything else costs 1. Each method's own cost is on its JSDoc - read
// it before looping, because the spread between the cheapest and the dearest
// call is 40x.
//
// videosBatch is hard-capped at 20 photo ids for that reason.
//
// Errors: Kuaishou hides upstream failures inside HTTP 200 bodies; the API
// detects those and surfaces them as 502. A missing or invalid identifier is
// 422. There is no 400, no 404 and no 503 on this platform.

export interface KuaishouProfileOptions {
  /** Kuaishou numeric user id, e.g. "5518803932". */
  user_id: string;
  [key: string]: unknown;
}

export interface KuaishouUserPostsOptions {
  /** Kuaishou numeric user id. */
  user_id: string;
  /** Opaque cursor from a previous response's next_cursor. */
  cursor?: string;
  [key: string]: unknown;
}

export interface KuaishouUserLiveOptions {
  /** Kuaishou numeric user id. */
  user_id: string;
  [key: string]: unknown;
}

export interface KuaishouUserResolveOptions {
  /**
   * A kuaishou.com or v.kuaishou.com link, e.g.
   * "https://v.kuaishou.com/KcdKDwFp". Kwai international (kwai.com) links
   * are not supported.
   */
  share_link: string;
  [key: string]: unknown;
}

/** A video reference: the photo id, or a Kuaishou URL. One of the two. */
export interface KuaishouVideoOptions {
  /** Photo (video) id, e.g. "3xtdqvdnqd3psuc". */
  photo_id?: string;
  /** A kuaishou.com or v.kuaishou.com video URL, as an alternative to photo_id. */
  url?: string;
  [key: string]: unknown;
}

export interface KuaishouVideoCommentsOptions {
  /** Photo (video) id. This endpoint takes the id only - no URL. */
  photo_id: string;
  /** Opaque cursor from a previous response's next_cursor. */
  cursor?: string;
  [key: string]: unknown;
}

export interface KuaishouCommentRepliesOptions {
  /** Photo (video) id the root comment sits on. */
  photo_id: string;
  /** Id of the root comment whose replies you want. */
  root_comment_id: string;
  /** Opaque cursor from a previous response's next_cursor. */
  cursor?: string;
  /** Replies per page, 1-50. */
  count?: number;
  [key: string]: unknown;
}

export interface KuaishouVideosBatchOptions {
  /** Photo (video) ids, 1-20 per call. More than 20 is rejected. */
  photo_ids: string[];
  [key: string]: unknown;
}

export interface KuaishouSearchOptions {
  /** Search keyword (1-200 characters). */
  keyword: string;
  /** Opaque cursor from a previous response's next_cursor. */
  cursor?: string;
  [key: string]: unknown;
}

export interface KuaishouSearchVideosOptions {
  /** Search keyword (1-200 characters). */
  keyword: string;
  /** Opaque cursor from a previous response's next_cursor. */
  cursor?: string;
  [key: string]: unknown;
}

export interface KuaishouSearchUsersOptions {
  /** Search keyword (1-200 characters). */
  keyword: string;
  /** Opaque cursor from a previous response's next_cursor. */
  cursor?: string;
  [key: string]: unknown;
}

export interface KuaishouSearchLiveOptions {
  /** Search keyword (1-200 characters). */
  keyword: string;
  /** Opaque cursor from a previous response's next_cursor. */
  cursor?: string;
  [key: string]: unknown;
}

export interface KuaishouTagFeedOptions {
  /** Hashtag text, without the leading # (1-200 characters). */
  tag: string;
  /** Opaque cursor from a previous response's next_cursor. */
  cursor?: string;
  [key: string]: unknown;
}

export interface KuaishouTrendingOptions {
  /** Which leaderboard to read (default "hot"). */
  board?: "hot" | "live" | "shopping" | "brand" | "music";
  [key: string]: unknown;
}

export class KuaishouNamespace {
  constructor(private client: Scavio) {}

  /**
   * Profile details for a Kuaishou user, addressed by numeric `user_id`.
   *
   * Costs 10 credits - the dearest single-object call on the platform. If you
   * only have a share link, resolve it with `userResolve()` (1 credit) first.
   */
  async profile(
    options: KuaishouProfileOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kuaishou/profile", options);
  }

  /**
   * A user's top posts. Advance with the previous response's `next_cursor`.
   *
   * Costs 1 credit per page.
   */
  async userPosts(
    options: KuaishouUserPostsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kuaishou/user/posts", options);
  }

  /**
   * A user's current live-stream status.
   *
   * Costs 1 credit.
   */
  async userLive(
    options: KuaishouUserLiveOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kuaishou/user/live", options);
  }

  /**
   * Turns a Kuaishou share link into a `user_id` you can feed to the other
   * user endpoints. kuaishou.com and v.kuaishou.com links only - kwai.com is
   * not supported.
   *
   * Costs 1 credit.
   */
  async userResolve(
    options: KuaishouUserResolveOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kuaishou/user/resolve", options);
  }

  /**
   * A single video, addressed by `photo_id` or by its Kuaishou `url`.
   * Sending neither returns 422.
   *
   * Costs 2 credits.
   */
  async video(
    options: KuaishouVideoOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kuaishou/video", options);
  }

  /**
   * Comments on a video. Advance with the previous response's `next_cursor`.
   *
   * Costs 1 credit per page.
   */
  async videoComments(
    options: KuaishouVideoCommentsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kuaishou/video/comments", options);
  }

  /**
   * Replies under a root comment. Advance with the previous response's
   * `next_cursor`; `count` (1-50) sizes the page.
   *
   * Costs 1 credit per page.
   */
  async commentReplies(
    options: KuaishouCommentRepliesOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kuaishou/video/sub-comments", options);
  }

  /**
   * Several videos in one call, up to 20 photo ids (a hard cap - a longer
   * `photo_ids` array is rejected).
   *
   * Costs 40 credits per call, flat, whether you send 1 id or 20 - so batch
   * to the cap. For a single video `video()` costs 2.
   */
  async videosBatch(
    options: KuaishouVideosBatchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kuaishou/videos/batch", options);
  }

  /**
   * Mixed-result search across Kuaishou. Advance with the previous response's
   * `next_cursor`.
   *
   * Costs 10 credits per page.
   */
  async search(
    options: KuaishouSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kuaishou/search", options);
  }

  /**
   * Video search results. Advance with the previous response's `next_cursor`.
   *
   * Costs 10 credits per page.
   */
  async searchVideos(
    options: KuaishouSearchVideosOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kuaishou/search/videos", options);
  }

  /**
   * User search results. Advance with the previous response's `next_cursor`.
   *
   * Costs 10 credits per page.
   */
  async searchUsers(
    options: KuaishouSearchUsersOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kuaishou/search/users", options);
  }

  /**
   * Live-stream search results. Advance with the previous response's
   * `next_cursor`.
   *
   * Costs 10 credits per page.
   */
  async searchLive(
    options: KuaishouSearchLiveOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kuaishou/search/live", options);
  }

  /**
   * Posts under a hashtag. Advance with the previous response's `next_cursor`.
   *
   * Costs 1 credit per page - the cheap way to pull volume, versus 10 for
   * `search()`.
   */
  async tagFeed(
    options: KuaishouTagFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kuaishou/tag/feed", options);
  }

  /**
   * Leaderboards: hot, live, shopping, brand or music. Defaults to "hot".
   *
   * Costs 1 credit.
   */
  async trending(
    options: KuaishouTrendingOptions = {},
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/kuaishou/trending", options);
  }
}
