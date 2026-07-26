import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

describe("XNamespace", () => {
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

  it("search posts search/search_type/cursor to /x/search", async () => {
    await client.x.search({
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
      "https://api.scavio.dev/api/v1/x/search",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("tweet posts tweet_id to /x/tweet", async () => {
    await client.x.tweet({ tweet_id: "1808168603721650364" });

    expect(bodyOf()).toEqual({ tweet_id: "1808168603721650364" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/x/tweet",
      expect.anything(),
    );
  });

  it("tweetComments posts to /x/tweet/comments", async () => {
    await client.x.tweetComments({ tweet_id: "123", rank: "latest" });

    expect(bodyOf()).toEqual({ tweet_id: "123", rank: "latest" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/x/tweet/comments",
      expect.anything(),
    );
  });

  it("tweetRetweeters posts to /x/tweet/retweeters", async () => {
    await client.x.tweetRetweeters({ tweet_id: "123" });

    expect(bodyOf()).toEqual({ tweet_id: "123" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/x/tweet/retweeters",
      expect.anything(),
    );
  });

  it("user posts screen_name to /x/user", async () => {
    await client.x.user({ screen_name: "elonmusk" });

    expect(bodyOf()).toEqual({ screen_name: "elonmusk" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/x/user",
      expect.anything(),
    );
  });

  it("userTweets posts to /x/user/tweets", async () => {
    await client.x.userTweets({ screen_name: "elonmusk", cursor: "C" });

    expect(bodyOf()).toEqual({ screen_name: "elonmusk", cursor: "C" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/x/user/tweets",
      expect.anything(),
    );
  });

  it("userReplies posts to /x/user/replies", async () => {
    await client.x.userReplies({ screen_name: "elonmusk" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/x/user/replies",
      expect.anything(),
    );
  });

  it("userMedia posts to /x/user/media", async () => {
    await client.x.userMedia({ screen_name: "elonmusk" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/x/user/media",
      expect.anything(),
    );
  });

  it("userFollowers posts to /x/user/followers", async () => {
    await client.x.userFollowers({ screen_name: "elonmusk" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/x/user/followers",
      expect.anything(),
    );
  });

  it("userFollowings posts to /x/user/followings", async () => {
    await client.x.userFollowings({ screen_name: "elonmusk" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/x/user/followings",
      expect.anything(),
    );
  });

  it("trending posts country to /x/trending", async () => {
    await client.x.trending({ country: "UnitedStates" });

    expect(bodyOf()).toEqual({ country: "UnitedStates" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/x/trending",
      expect.anything(),
    );
  });

  it("trending works with no arguments", async () => {
    await client.x.trending();

    expect(bodyOf()).toEqual({});
  });
});
