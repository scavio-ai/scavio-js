import type { Scavio } from "../client.js";

/** Comment / feed sort orders. */
export type RedditSort = "HOT" | "NEW" | "TOP" | "BEST" | "CONTROVERSIAL";
/** Subreddit feed sort orders. */
export type RedditFeedSort =
  | "BEST"
  | "HOT"
  | "NEW"
  | "TOP"
  | "CONTROVERSIAL"
  | "RISING";

export interface RedditSearchOptions {
  /** Search query (1-500 characters). */
  query: string;
  /** Result type (server default 'posts'). */
  type?: "posts" | "comments";
  /** Sort order (server default 'new'). */
  sort?: "new" | "relevance" | "hot" | "top" | "comments";
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface RedditSearchSuggestionsOptions {
  /** Search query (1-500 characters). */
  query: string;
  [key: string]: unknown;
}

export interface RedditPostOptions {
  /** Post fullname (t3_...) or bare id. */
  post_id?: string;
  /** Full Reddit post URL. */
  url?: string;
  [key: string]: unknown;
}

export interface RedditPostCommentsOptions {
  /** Post fullname (t3_...). */
  post_id: string;
  /** Comment sort order (default 'TOP'). */
  sort?: RedditSort;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface RedditCommentRepliesOptions {
  /** Post fullname (t3_...). */
  post_id: string;
  /** reply_cursor from a comment in the comments endpoint. */
  cursor: string;
  /** Comment sort order (default 'TOP'). */
  sort?: RedditSort;
  [key: string]: unknown;
}

export interface RedditSubredditOptions {
  /** Subreddit name (without r/). */
  subreddit: string;
  [key: string]: unknown;
}

export interface RedditSubredditPostsOptions {
  /** Subreddit name (without r/). */
  subreddit: string;
  /** Feed sort order (default 'HOT'). */
  sort?: RedditFeedSort;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface RedditUserOptions {
  /** Redditor username (without u/). */
  username: string;
  [key: string]: unknown;
}

export interface RedditUserFeedOptions {
  /** Redditor username (without u/). */
  username: string;
  /** Sort order (default 'NEW'). */
  sort?: RedditSort;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface RedditPopularOptions {
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export class RedditNamespace {
  constructor(private client: Scavio) {}

  async search(
    options: RedditSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/reddit/search", options);
  }

  async searchSuggestions(
    options: RedditSearchSuggestionsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/reddit/search/suggestions", options);
  }

  async post(options: RedditPostOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/reddit/post", options);
  }

  async postComments(
    options: RedditPostCommentsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/reddit/post/comments", options);
  }

  async commentReplies(
    options: RedditCommentRepliesOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/reddit/post/comments/replies", options);
  }

  async subreddit(
    options: RedditSubredditOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/reddit/subreddit", options);
  }

  async subredditPosts(
    options: RedditSubredditPostsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/reddit/subreddit/posts", options);
  }

  async user(options: RedditUserOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/reddit/user", options);
  }

  async userPosts(
    options: RedditUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/reddit/user/posts", options);
  }

  async userComments(
    options: RedditUserFeedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/reddit/user/comments", options);
  }

  async popular(
    options: RedditPopularOptions = {},
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/reddit/popular", options);
  }

  async trending(): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/reddit/trending", {});
  }
}
