import type { Scavio } from "../client.js";

export interface RedditSearchOptions {
  query: string;
  type?: string;
  sort?: string;
  cursor?: string;
}

export interface RedditPostOptions {
  url: string;
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
