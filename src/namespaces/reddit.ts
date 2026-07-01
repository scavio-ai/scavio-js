import type { Scavio } from "../client.js";

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

export interface RedditPostOptions {
  /** Full Reddit post URL. */
  url: string;
  [key: string]: unknown;
}

export class RedditNamespace {
  constructor(private client: Scavio) {}

  async search(
    options: RedditSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/reddit/search", options);
  }

  async post(options: RedditPostOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/reddit/post", options);
  }
}
