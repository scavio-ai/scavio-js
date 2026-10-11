import type { Scavio } from "../client.js";

export interface XSearchOptions {
  /** Search query (1-500 characters). */
  search: string;
  /** Result category (default 'Top'). */
  search_type?: "Top" | "Latest" | "People" | "Photos" | "Videos";
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface XTweetOptions {
  /** Tweet id. */
  tweet_id: string;
  [key: string]: unknown;
}

export interface XTweetCommentsOptions {
  /** Tweet id. */
  tweet_id: string;
  /** 'top' (ranked) or 'latest' (chronological); default 'top'. */
  rank?: "top" | "latest";
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface XTweetRetweetersOptions {
  /** Tweet id. */
  tweet_id: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface XUserOptions {
  /** An X handle (without the @). */
  screen_name: string;
  [key: string]: unknown;
}

export interface XUserFeedOptions {
  /** An X handle (without the @). */
  screen_name: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface XTrendingOptions {
  /** Country name (default 'UnitedStates'). */
  country?: string;
  [key: string]: unknown;
}

export interface XSearchCommunitiesOptions {
  /** Search query (1-500 characters). */
  keyword: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface XCommunityOptions {
  /** Numeric X Community id, as a string. */
  community_id: string;
  [key: string]: unknown;
}

export interface XCommunityTweetsOptions {
  /** Numeric X Community id, as a string. */
  community_id: string;
  /** Ordering (server default: the community's own). */
  ranking?: "Relevance" | "Recency";
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export class XNamespace {
  constructor(private client: Scavio) {}

  async search(
    options: XSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/x/search", options);
  }

  async tweet(
    options: XTweetOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/x/tweet", options);
  }

  async tweetComments(
    options: XTweetCommentsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/x/tweet/comments", options);
  }

  async tweetRetweeters(
    options: XTweetRetweetersOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/x/tweet/retweeters", options);
  }

  async user(
    options: XUserOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/x/user", options);
  }

  async userTweets(
    options: XUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/x/user/tweets", options);
  }

  async userReplies(
    options: XUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/x/user/replies", options);
  }

  async userMedia(
    options: XUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/x/user/media", options);
  }

  async userFollowers(
    options: XUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/x/user/followers", options);
  }

  async userFollowings(
    options: XUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/x/user/followings", options);
  }

  async trending(
    options: XTrendingOptions = {},
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/x/trending", options);
  }

  /**
   * Find X Communities by keyword, with member counts, topic and NSFW flag.
   * Costs 1 credit.
   */
  async searchCommunities(
    options: XSearchCommunitiesOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/x/search/communities", options);
  }

  /**
   * An X Community: name, description, creation date, member count, topic and
   * rules. Costs 1 credit.
   */
  async community(options: XCommunityOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/x/community", options);
  }

  /**
   * Posts in an X Community, by relevance or recency, with pagination.
   * Costs 1 credit.
   */
  async communityTweets(
    options: XCommunityTweetsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/x/community/tweets", options);
  }
}
