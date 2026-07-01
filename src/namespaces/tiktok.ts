import type { Scavio } from "../client.js";

export interface TikTokProfileOptions {
  /** TikTok @username (without the @). */
  username?: string;
  /** TikTok sec_user_id. */
  sec_user_id?: string;
  [key: string]: unknown;
}

export interface TikTokUserPostsOptions {
  /** TikTok sec_user_id. */
  sec_user_id: string;
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Results per page (1-30). */
  count?: number;
  /** '0' = latest, '1' = popular. */
  sort_type?: "0" | "1";
  [key: string]: unknown;
}

export interface TikTokVideoOptions {
  /** TikTok video id. */
  video_id: string;
  [key: string]: unknown;
}

export interface TikTokVideoCommentsOptions {
  /** TikTok video id. */
  video_id: string;
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Results per page (1-50). */
  count?: number;
  [key: string]: unknown;
}

export interface TikTokCommentRepliesOptions {
  /** TikTok video id. */
  video_id: string;
  /** Parent comment id. */
  comment_id: string;
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Results per page (1-50). */
  count?: number;
  [key: string]: unknown;
}

export interface TikTokSearchVideosOptions {
  /** Search keyword (1-500 characters). */
  keyword: string;
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Results per page (1-30). */
  count?: number;
  /** '0' = relevance, '1' = most likes. */
  sort_type?: "0" | "1";
  /** Age filter in days: 0 = all time, 1, 7, 30, 90, 180. */
  publish_time?: "0" | "1" | "7" | "30" | "90" | "180";
  [key: string]: unknown;
}

export interface TikTokSearchUsersOptions {
  /** Search keyword (1-500 characters). */
  keyword: string;
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Results per page (1-30). */
  count?: number;
  [key: string]: unknown;
}

export interface TikTokHashtagOptions {
  /** Hashtag name (without the #). */
  hashtag_name?: string;
  /** Hashtag id. */
  hashtag_id?: string;
  [key: string]: unknown;
}

export interface TikTokHashtagVideosOptions {
  /** Hashtag id. */
  hashtag_id: string;
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Results per page (1-30). */
  count?: number;
  [key: string]: unknown;
}

export interface TikTokUserFollowersOptions {
  /** TikTok sec_user_id. */
  sec_user_id: string;
  /** Results per page (1-20). */
  count?: number;
  /** Pagination token from a prior response. */
  page_token?: string;
  /** Minimum timestamp cursor. */
  min_time?: number;
  [key: string]: unknown;
}

export interface TikTokUserFollowingsOptions {
  /** TikTok sec_user_id. */
  sec_user_id: string;
  /** Results per page (1-20). */
  count?: number;
  /** Pagination token from a prior response. */
  page_token?: string;
  /** Minimum timestamp cursor. */
  min_time?: number;
  [key: string]: unknown;
}

export class TikTokNamespace {
  constructor(private client: Scavio) {}

  async profile(
    options: TikTokProfileOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/profile", options);
  }

  async userPosts(
    options: TikTokUserPostsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/user/posts", options);
  }

  async video(
    options: TikTokVideoOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/video", options);
  }

  async videoComments(
    options: TikTokVideoCommentsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/video/comments", options);
  }

  async commentReplies(
    options: TikTokCommentRepliesOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/video/comments/replies", options);
  }

  async searchVideos(
    options: TikTokSearchVideosOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/search/videos", options);
  }

  async searchUsers(
    options: TikTokSearchUsersOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/search/users", options);
  }

  async hashtag(
    options: TikTokHashtagOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/hashtag", options);
  }

  async hashtagVideos(
    options: TikTokHashtagVideosOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/hashtag/videos", options);
  }

  async userFollowers(
    options: TikTokUserFollowersOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/user/followers", options);
  }

  async userFollowings(
    options: TikTokUserFollowingsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/user/followings", options);
  }
}
