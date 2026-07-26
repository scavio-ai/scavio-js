import type { Scavio } from "../client.js";

export interface TwitterSearchOptions {
  /** Search query (1-500 characters). */
  search: string;
  /** Result category (default 'Top'). */
  search_type?: "Top" | "Latest" | "People" | "Photos" | "Videos";
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface TwitterTweetOptions {
  /** Tweet id. */
  tweet_id: string;
  [key: string]: unknown;
}

export interface TwitterTweetCommentsOptions {
  /** Tweet id. */
  tweet_id: string;
  /** 'top' (ranked) or 'latest' (chronological); default 'top'. */
  rank?: "top" | "latest";
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface TwitterTweetRetweetersOptions {
  /** Tweet id. */
  tweet_id: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface TwitterUserOptions {
  /** A Twitter handle (without the @). */
  screen_name: string;
  [key: string]: unknown;
}

export interface TwitterUserFeedOptions {
  /** A Twitter handle (without the @). */
  screen_name: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface TwitterTrendingOptions {
  /** Country name (default 'UnitedStates'). */
  country?: string;
  [key: string]: unknown;
}

export class TwitterNamespace {
  constructor(private client: Scavio) {}

  async search(
    options: TwitterSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/twitter/search", options);
  }

  async tweet(
    options: TwitterTweetOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/twitter/tweet", options);
  }

  async tweetComments(
    options: TwitterTweetCommentsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/twitter/tweet/comments", options);
  }

  async tweetRetweeters(
    options: TwitterTweetRetweetersOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/twitter/tweet/retweeters", options);
  }

  async user(
    options: TwitterUserOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/twitter/user", options);
  }

  async userTweets(
    options: TwitterUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/twitter/user/tweets", options);
  }

  async userReplies(
    options: TwitterUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/twitter/user/replies", options);
  }

  async userMedia(
    options: TwitterUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/twitter/user/media", options);
  }

  async userFollowers(
    options: TwitterUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/twitter/user/followers", options);
  }

  async userFollowings(
    options: TwitterUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/twitter/user/followings", options);
  }

  async trending(
    options: TwitterTrendingOptions = {},
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/twitter/trending", options);
  }
}
