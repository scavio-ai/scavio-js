import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

describe("TwitterNamespace", () => {
  let client: Scavio;

  beforeEach(() => {
    client = new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 10 });
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function bodyOf() {
    const call = vi.mocked(fetch).mock.calls[0]!;
    return JSON.parse((call[1] as RequestInit).body as string);
  }

  it("search posts search/search_type/cursor to /twitter/search", async () => {
    await client.twitter.search({
      search: "artificial intelligence",
      search_type: "Latest",
      cursor: "CUR",
    });

    expect(bodyOf()).toEqual({
      search: "artificial intelligence",
      search_type: "Latest",
      cursor: "CUR",
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/twitter/search",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("tweet posts tweet_id to /twitter/tweet", async () => {
    await client.twitter.tweet({ tweet_id: "1808168603721650364" });

    expect(bodyOf()).toEqual({ tweet_id: "1808168603721650364" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/twitter/tweet",
      expect.anything(),
    );
  });

  it("tweetComments posts to /twitter/tweet/comments", async () => {
    await client.twitter.tweetComments({ tweet_id: "123", rank: "latest" });

    expect(bodyOf()).toEqual({ tweet_id: "123", rank: "latest" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/twitter/tweet/comments",
      expect.anything(),
    );
  });

  it("tweetRetweeters posts to /twitter/tweet/retweeters", async () => {
    await client.twitter.tweetRetweeters({ tweet_id: "123" });

    expect(bodyOf()).toEqual({ tweet_id: "123" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/twitter/tweet/retweeters",
      expect.anything(),
    );
  });

  it("user posts screen_name to /twitter/user", async () => {
    await client.twitter.user({ screen_name: "elonmusk" });

    expect(bodyOf()).toEqual({ screen_name: "elonmusk" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/twitter/user",
      expect.anything(),
    );
  });

  it("userTweets posts to /twitter/user/tweets", async () => {
    await client.twitter.userTweets({ screen_name: "elonmusk", cursor: "C" });

    expect(bodyOf()).toEqual({ screen_name: "elonmusk", cursor: "C" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/twitter/user/tweets",
      expect.anything(),
    );
  });

  it("userReplies posts to /twitter/user/replies", async () => {
    await client.twitter.userReplies({ screen_name: "elonmusk" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/twitter/user/replies",
      expect.anything(),
    );
  });

  it("userMedia posts to /twitter/user/media", async () => {
    await client.twitter.userMedia({ screen_name: "elonmusk" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/twitter/user/media",
      expect.anything(),
    );
  });

  it("userFollowers posts to /twitter/user/followers", async () => {
    await client.twitter.userFollowers({ screen_name: "elonmusk" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/twitter/user/followers",
      expect.anything(),
    );
  });

  it("userFollowings posts to /twitter/user/followings", async () => {
    await client.twitter.userFollowings({ screen_name: "elonmusk" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/twitter/user/followings",
      expect.anything(),
    );
  });

  it("trending posts country to /twitter/trending", async () => {
    await client.twitter.trending({ country: "UnitedStates" });

    expect(bodyOf()).toEqual({ country: "UnitedStates" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/twitter/trending",
      expect.anything(),
    );
  });

  it("trending works with no arguments", async () => {
    await client.twitter.trending();

    expect(bodyOf()).toEqual({});
  });
});
