import type { Scavio } from "../client.js";

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

export class InstagramNamespace {
  constructor(private client: Scavio) {}

  async profile(
    options: InstagramProfileOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/profile", options);
  }

  async userPosts(
    options: InstagramUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/user/posts", options);
  }

  async userReels(
    options: InstagramUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/user/reels", options);
  }

  async userTagged(
    options: InstagramUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/user/tagged", options);
  }

  async userStories(
    options: InstagramStoriesOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/user/stories", options);
  }

  async post(
    options: InstagramPostOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/post", options);
  }

  async postComments(
    options: InstagramPostCommentsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/post/comments", options);
  }

  async commentReplies(
    options: InstagramCommentRepliesOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/post/comments/replies", options);
  }

  async searchUsers(
    options: InstagramSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/search/users", options);
  }

  async searchHashtags(
    options: InstagramSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/search/hashtags", options);
  }

  async userFollowers(
    options: InstagramFollowOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/user/followers", options);
  }

  async userFollowings(
    options: InstagramFollowOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/instagram/user/followings", options);
  }
}
