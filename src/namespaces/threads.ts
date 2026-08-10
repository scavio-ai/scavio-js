import type { Scavio } from "../client.js";

// Threads is body-priced. The upstream handle lookup is dead, so addressing a
// user by `username` buys a second upstream call: 2 credits by `user_id`,
// 4 credits by `username`. Only profile, userPosts and userReplies are
// username-keyed - post, postComments and searchUsers are always 2 credits.
// Resolve a handle once with searchUsers() or profile(), keep the returned
// user_id, and every later call stays on the cheap path.
//
// There is NO Threads content search. Only people search exists
// (searchUsers). Nothing here searches posts.
//
// Error codes differ from the scrape.do platforms: 404 when no user matches,
// 422 when the identifier is missing or conflicting, 502 upstream. There is no
// 400 and no 503.

/** A user reference: the cheap numeric id, or the handle at double the cost. */
export interface ThreadsProfileOptions {
  /**
   * Numeric user id, e.g. "63625256886". The cheap path: 2 credits.
   */
  user_id?: string;
  /**
   * Handle without the leading @ (1-60 characters). Costs 2 extra credits
   * because the id has to be resolved upstream first - prefer `user_id`.
   */
  username?: string;
  [key: string]: unknown;
}

export interface ThreadsUserPostsOptions extends ThreadsProfileOptions {
  /** Opaque cursor from a previous response's next_cursor. */
  cursor?: string;
}

export interface ThreadsUserRepliesOptions extends ThreadsProfileOptions {
  /** Opaque cursor from a previous response's next_cursor. */
  cursor?: string;
}

/** A post reference: the post id, or its threads.net URL. */
export interface ThreadsPostOptions {
  /** Post id. */
  post_id?: string;
  /** Full threads.net post URL, as an alternative to post_id. */
  url?: string;
  [key: string]: unknown;
}

export interface ThreadsPostCommentsOptions {
  /** Post id. This endpoint takes the id only - no URL, no username. */
  post_id: string;
  /** Opaque cursor from a previous response's next_cursor. */
  cursor?: string;
  [key: string]: unknown;
}

export interface ThreadsSearchUsersOptions {
  /** Name or handle to search for (1-200 characters). */
  query: string;
  [key: string]: unknown;
}

export class ThreadsNamespace {
  constructor(private client: Scavio) {}

  /**
   * Profile details for a Threads user. Pass `user_id` or `username`;
   * sending neither returns 422 and no match returns 404.
   *
   * Costs 2 credits by `user_id`, 4 credits by `username`.
   */
  async profile(
    options: ThreadsProfileOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/threads/profile", options);
  }

  /**
   * A user's Threads posts. Advance with the previous response's
   * `next_cursor`. Pass `user_id` or `username`.
   *
   * Costs 2 credits by `user_id`, 4 credits by `username` - and that surcharge
   * applies to every page, so resolve the id once before paging.
   */
  async userPosts(
    options: ThreadsUserPostsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/threads/user/posts", options);
  }

  /**
   * A user's replies. Advance with the previous response's `next_cursor`.
   * Pass `user_id` or `username`.
   *
   * Costs 2 credits by `user_id`, 4 credits by `username` - and that surcharge
   * applies to every page, so resolve the id once before paging.
   */
  async userReplies(
    options: ThreadsUserRepliesOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/threads/user/replies", options);
  }

  /**
   * A single post, addressed by `post_id` or by its threads.net `url`.
   * Sending neither returns 422.
   *
   * Costs 2 credits.
   */
  async post(
    options: ThreadsPostOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/threads/post", options);
  }

  /**
   * Replies to a post. Advance with the previous response's `next_cursor`.
   *
   * Costs 2 credits - this endpoint is never username-keyed, so there is no
   * handle surcharge.
   */
  async postComments(
    options: ThreadsPostCommentsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/threads/post/comments", options);
  }

  /**
   * Threads profiles matching a name or handle. This is people search, and it
   * is the only search Threads exposes - there is no content/post search.
   * Use it to turn a handle into the `user_id` every other method prefers.
   *
   * Costs 2 credits. Single response, no pagination.
   */
  async searchUsers(
    options: ThreadsSearchUsersOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/threads/search/users", options);
  }
}
