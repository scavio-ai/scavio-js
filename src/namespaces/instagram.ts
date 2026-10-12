import type { Scavio } from "../client.js";

/**
 * Instagram endpoints (/api/v1/instagram). Typical credit cost per call:
 * - 1: `profile`, `musicPosts` (per page), `userReels` and `userTagged`
 *   (2 the first time a username is looked up)
 * - 2: everything else - `userPosts`, `userStories`, `post`, `postComments`,
 *   `commentReplies`, `searchUsers`, `searchHashtags`, `userFollowers`,
 *   `userFollowings`, `userHighlights`, `highlightStories`, `searchReels`,
 *   `searchMusic`, `searchLocations`, `userSimilar`, `postLikers`
 * - 8: `searchUsers` / `searchHashtags` when a `cursor` is sent
 *
 * A request can cost up to 10 when it needs extra work; `credits_used` in the
 * response is the exact charge. See https://scavio.dev/docs/instagram-api.
 */

export interface InstagramProfileOptions {
  /** Instagram username (without the @). */
  username?: string;
  /** Instagram numeric user id. */
  user_id?: string;
  [key: string]: unknown;
}

export interface InstagramUserFeedOptions {
  /** Instagram username (without the @). */
  username?: string;
  /** Instagram numeric user id. */
  user_id?: string;
  /** Results per page (1-50). */
  count?: number;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface InstagramStoriesOptions {
  /** Instagram username (without the @). */
  username?: string;
  /** Instagram numeric user id. */
  user_id?: string;
  [key: string]: unknown;
}

export interface InstagramPostOptions {
  /** Full Instagram post URL. */
  url?: string;
  /** Instagram media id. */
  media_id?: string;
  /** Instagram shortcode (from the post URL). */
  shortcode?: string;
  [key: string]: unknown;
}

export interface InstagramPostCommentsOptions {
  /** Instagram shortcode (from the post URL). */
  shortcode?: string;
  /** Full Instagram post URL. */
  url?: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  /** Comment sort order. */
  sort_order?: "popular" | "newest";
  [key: string]: unknown;
}

export interface InstagramCommentRepliesOptions {
  /** Instagram media id. */
  media_id: string;
  /** Parent comment id. */
  comment_id: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface InstagramSearchOptions {
  /** Search keyword (1-500 characters). */
  keyword: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface InstagramFollowOptions {
  /** Instagram username (without the @). */
  username?: string;
  /** Instagram numeric user id. */
  user_id?: string;
  /** Results per page (1-100). */
  count?: number;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface InstagramUserRefOptions {
  /** Instagram username (without the @). */
  username?: string;
  /** Instagram numeric user id. */
  user_id?: string;
  [key: string]: unknown;
}

export interface InstagramHighlightStoriesOptions {
  /** Highlight id from `userHighlights`, with or without the `highlight:` prefix. */
  highlight_id: string;
  [key: string]: unknown;
}

export interface InstagramKeywordOptions {
  /** Search keyword (1-500 characters). */
  keyword: string;
  [key: string]: unknown;
}

export interface InstagramMusicPostsOptions {
  /** Numeric audio id (the `id` field from `searchMusic`). */
  music_id: string;
  /** Pagination cursor (`paging_info.max_id`) from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface InstagramPostLikersOptions {
  /** Instagram shortcode (from the post URL). */
  shortcode?: string;
  /** Full Instagram post URL. */
  url?: string;
  [key: string]: unknown;
}

export class InstagramNamespace {
  constructor(private client: Scavio) {}

  /** Get a user profile by username or user_id. 1 credit. */
  async profile(
    options: InstagramProfileOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/profile", options);
  }

  /** Get a user's posts, about 12 per page; page with `data.pagination_token`. 2 credits per page. */
  async userPosts(
    options: InstagramUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/user/posts", options);
  }

  /** Get a user's Reels. 1 credit (2 the first time a username is looked up). */
  async userReels(
    options: InstagramUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/user/reels", options);
  }

  /** Get posts a user is tagged in. 1 credit (2 the first time a username is looked up). */
  async userTagged(
    options: InstagramUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/user/tagged", options);
  }

  /** Get a user's active stories. 2 credits. */
  async userStories(
    options: InstagramStoriesOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/user/stories", options);
  }

  /** Get a single post by url, media_id or shortcode. 2 credits. */
  async post(
    options: InstagramPostOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/post", options);
  }

  /** Get comments on a post; page with `next_min_id`. 2 credits per page. */
  async postComments(
    options: InstagramPostCommentsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/post/comments", options);
  }

  /** Get replies to a comment. 2 credits. */
  async commentReplies(
    options: InstagramCommentRepliesOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/post/comments/replies", options);
  }

  /** Search users by keyword. 2 credits; 8 when a `cursor` is sent. */
  async searchUsers(
    options: InstagramSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/search/users", options);
  }

  /** Search hashtags by keyword. 2 credits; 8 when a `cursor` is sent. */
  async searchHashtags(
    options: InstagramSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/search/hashtags", options);
  }

  /** Get a user's followers; page with `next_max_id`. 2 credits per page. */
  async userFollowers(
    options: InstagramFollowOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/user/followers", options);
  }

  /** Get the accounts a user follows; page with `next_max_id`. 2 credits per page. */
  async userFollowings(
    options: InstagramFollowOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/user/followings", options);
  }

  /** List a user's story highlights (id, title, cover, item count). 2 credits. */
  async userHighlights(
    options: InstagramUserRefOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/user/highlights", options);
  }

  /** Get every story saved in one highlight, with media URLs. 2 credits. */
  async highlightStories(
    options: InstagramHighlightStoriesOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/highlight/stories", options);
  }

  /** Search Reels by keyword; page with `pagination_token`. 2 credits per page. */
  async searchReels(
    options: InstagramSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/search/reels", options);
  }

  /** Search audio tracks by song or artist; returns the id `musicPosts` takes. 2 credits. */
  async searchMusic(
    options: InstagramKeywordOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/search/music", options);
  }

  /** Get the Reels that use an audio track, plus its total reel count. 1 credit per page. */
  async musicPosts(
    options: InstagramMusicPostsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/music/posts", options);
  }

  /** Search places by name (id, name, address, coordinates). 2 credits. */
  async searchLocations(
    options: InstagramKeywordOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/search/locations", options);
  }

  /** Get accounts similar to a user. Most creator accounts have them; some brand accounts return none. 2 credits. */
  async userSimilar(
    options: InstagramUserRefOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/user/similar", options);
  }

  /** Get accounts that liked a post (up to about 1,000) and its total like count. 2 credits. */
  async postLikers(
    options: InstagramPostLikersOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/post/likers", options);
  }
}
