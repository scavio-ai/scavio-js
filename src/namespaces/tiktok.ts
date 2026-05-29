import type { Scavio } from "../client.js";

export interface TikTokProfileOptions {
  username?: string;
  sec_user_id?: string;
}

export interface TikTokUserPostsOptions {
  sec_user_id: string;
  cursor?: string;
  count?: number;
  sort_type?: string;
}

export interface TikTokVideoOptions {
  video_id: string;
}

export interface TikTokVideoCommentsOptions {
  video_id: string;
  cursor?: string;
  count?: number;
}

export interface TikTokCommentRepliesOptions {
  video_id: string;
  comment_id: string;
  cursor?: string;
  count?: number;
}

export interface TikTokSearchVideosOptions {
  keyword: string;
  cursor?: string;
  count?: number;
  sort_type?: string;
  publish_time?: string;
}

export interface TikTokSearchUsersOptions {
  keyword: string;
  cursor?: string;
  count?: number;
}

export interface TikTokHashtagOptions {
  hashtag_name?: string;
  hashtag_id?: string;
}

export interface TikTokHashtagVideosOptions {
  hashtag_id: string;
  cursor?: string;
  count?: number;
}

export interface TikTokUserFollowersOptions {
  sec_user_id: string;
  count?: number;
  page_token?: string;
  min_time?: number;
}

export interface TikTokUserFollowingsOptions {
  sec_user_id: string;
  count?: number;
  page_token?: string;
  min_time?: number;
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
