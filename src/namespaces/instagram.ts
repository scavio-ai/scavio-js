import type { Scavio } from "../client.js";

export interface InstagramProfileOptions {
  username?: string;
  user_id?: string;
}

export interface InstagramUserFeedOptions {
  username?: string;
  user_id?: string;
  count?: number;
  cursor?: string;
}

export interface InstagramStoriesOptions {
  username?: string;
  user_id?: string;
}

export interface InstagramPostOptions {
  url?: string;
  media_id?: string;
  shortcode?: string;
}

export interface InstagramPostCommentsOptions {
  shortcode?: string;
  url?: string;
  cursor?: string;
  sort_order?: string;
}

export interface InstagramCommentRepliesOptions {
  media_id: string;
  comment_id: string;
  cursor?: string;
}

export interface InstagramSearchOptions {
  keyword: string;
  cursor?: string;
}

export interface InstagramFollowOptions {
  username?: string;
  user_id?: string;
  count?: number;
  cursor?: string;
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
