import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

describe("RedditNamespace", () => {
  let client: Scavio;

  beforeEach(() => {
    client = new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 10 });
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function bodyOf() {
    const call = vi.mocked(fetch).mock.calls[0]!;
    return JSON.parse((call[1] as RequestInit).body as string);
  }

  it("search sends POST to /api/v1/reddit/search", async () => {
    await client.reddit.search({ query: "typescript" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/reddit/search",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ query: "typescript" }),
      }),
    );
  });

  it("post sends url to /api/v1/reddit/post", async () => {
    await client.reddit.post({
      url: "https://reddit.com/r/typescript/comments/abc123",
    });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({
      url: "https://reddit.com/r/typescript/comments/abc123",
    });
  });

  it("post also accepts post_id", async () => {
    await client.reddit.post({ post_id: "t3_1v6ngaf" });

    expect(bodyOf()).toEqual({ post_id: "t3_1v6ngaf" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/reddit/post",
      expect.anything(),
    );
  });

  it("searchSuggestions posts query to /reddit/search/suggestions", async () => {
    await client.reddit.searchSuggestions({ query: "python" });

    expect(bodyOf()).toEqual({ query: "python" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/reddit/search/suggestions",
      expect.anything(),
    );
  });

  it("postComments posts post_id/sort/cursor to /reddit/post/comments", async () => {
    await client.reddit.postComments({ post_id: "t3_1v6ngaf", sort: "NEW" });

    expect(bodyOf()).toEqual({ post_id: "t3_1v6ngaf", sort: "NEW" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/reddit/post/comments",
      expect.anything(),
    );
  });

  it("commentReplies posts to /reddit/post/comments/replies", async () => {
    await client.reddit.commentReplies({ post_id: "t3_1v6ngaf", cursor: "CUR" });

    expect(bodyOf()).toEqual({ post_id: "t3_1v6ngaf", cursor: "CUR" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/reddit/post/comments/replies",
      expect.anything(),
    );
  });

  it("subreddit posts subreddit to /reddit/subreddit", async () => {
    await client.reddit.subreddit({ subreddit: "AskReddit" });

    expect(bodyOf()).toEqual({ subreddit: "AskReddit" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/reddit/subreddit",
      expect.anything(),
    );
  });

  it("subredditPosts posts subreddit/sort to /reddit/subreddit/posts", async () => {
    await client.reddit.subredditPosts({ subreddit: "AskReddit", sort: "TOP" });

    expect(bodyOf()).toEqual({ subreddit: "AskReddit", sort: "TOP" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/reddit/subreddit/posts",
      expect.anything(),
    );
  });

  it("user posts username to /reddit/user", async () => {
    await client.reddit.user({ username: "spez" });

    expect(bodyOf()).toEqual({ username: "spez" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/reddit/user",
      expect.anything(),
    );
  });

  it("userPosts posts to /reddit/user/posts", async () => {
    await client.reddit.userPosts({ username: "spez", sort: "TOP" });

    expect(bodyOf()).toEqual({ username: "spez", sort: "TOP" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/reddit/user/posts",
      expect.anything(),
    );
  });

  it("userComments posts to /reddit/user/comments", async () => {
    await client.reddit.userComments({ username: "spez" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/reddit/user/comments",
      expect.anything(),
    );
  });

  it("popular posts cursor to /reddit/popular", async () => {
    await client.reddit.popular({ cursor: "CUR" });

    expect(bodyOf()).toEqual({ cursor: "CUR" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/reddit/popular",
      expect.anything(),
    );
  });

  it("popular works with no arguments", async () => {
    await client.reddit.popular();

    expect(bodyOf()).toEqual({});
  });

  it("trending posts to /reddit/trending", async () => {
    await client.reddit.trending();

    expect(bodyOf()).toEqual({});
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/reddit/trending",
      expect.anything(),
    );
  });
});
