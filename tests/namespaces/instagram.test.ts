import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

describe("InstagramNamespace", () => {
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

  it("profile posts username to /instagram/profile", async () => {
    await client.instagram.profile({ username: "instagram" });

    expect(bodyOf()).toEqual({ username: "instagram" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/instagram/profile",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("profile also accepts user_id", async () => {
    await client.instagram.profile({ user_id: "25025320" });

    expect(bodyOf()).toEqual({ user_id: "25025320" });
  });

  it("userPosts posts username/count/cursor to /instagram/user/posts", async () => {
    await client.instagram.userPosts({
      username: "instagram",
      count: 12,
      cursor: "CUR",
    });

    expect(bodyOf()).toEqual({
      username: "instagram",
      count: 12,
      cursor: "CUR",
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/instagram/user/posts",
      expect.anything(),
    );
  });

  it("userReels posts to /instagram/user/reels", async () => {
    await client.instagram.userReels({ username: "instagram" });

    expect(bodyOf()).toEqual({ username: "instagram" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/instagram/user/reels",
      expect.anything(),
    );
  });

  it("userTagged posts to /instagram/user/tagged", async () => {
    await client.instagram.userTagged({ username: "instagram" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/instagram/user/tagged",
      expect.anything(),
    );
  });

  it("userStories posts to /instagram/user/stories", async () => {
    await client.instagram.userStories({ username: "instagram" });

    expect(bodyOf()).toEqual({ username: "instagram" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/instagram/user/stories",
      expect.anything(),
    );
  });

  it("post posts shortcode to /instagram/post", async () => {
    await client.instagram.post({ shortcode: "DUajw4YkorV" });

    expect(bodyOf()).toEqual({ shortcode: "DUajw4YkorV" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/instagram/post",
      expect.anything(),
    );
  });

  it("post also accepts url and media_id", async () => {
    await client.instagram.post({ url: "https://www.instagram.com/p/DUajw4YkorV/" });

    expect(bodyOf()).toEqual({
      url: "https://www.instagram.com/p/DUajw4YkorV/",
    });
  });

  it("postComments posts shortcode/sort_order to /instagram/post/comments", async () => {
    await client.instagram.postComments({
      shortcode: "DUajw4YkorV",
      sort_order: "newest",
    });

    expect(bodyOf()).toEqual({
      shortcode: "DUajw4YkorV",
      sort_order: "newest",
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/instagram/post/comments",
      expect.anything(),
    );
  });

  it("commentReplies posts media_id/comment_id to /instagram/post/comments/replies", async () => {
    await client.instagram.commentReplies({
      media_id: "123",
      comment_id: "456",
      cursor: "CUR",
    });

    expect(bodyOf()).toEqual({
      media_id: "123",
      comment_id: "456",
      cursor: "CUR",
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/instagram/post/comments/replies",
      expect.anything(),
    );
  });

  it("searchUsers posts keyword to /instagram/search/users", async () => {
    await client.instagram.searchUsers({ keyword: "justin" });

    expect(bodyOf()).toEqual({ keyword: "justin" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/instagram/search/users",
      expect.anything(),
    );
  });

  it("searchHashtags posts keyword to /instagram/search/hashtags", async () => {
    await client.instagram.searchHashtags({ keyword: "fashion" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/instagram/search/hashtags",
      expect.anything(),
    );
  });

  it("userFollowers posts username/count to /instagram/user/followers", async () => {
    await client.instagram.userFollowers({ username: "instagram", count: 50 });

    expect(bodyOf()).toEqual({ username: "instagram", count: 50 });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/instagram/user/followers",
      expect.anything(),
    );
  });

  it("userFollowings posts to /instagram/user/followings", async () => {
    await client.instagram.userFollowings({ username: "instagram" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/instagram/user/followings",
      expect.anything(),
    );
  });

  it("sends the API key as a bearer token", async () => {
    await client.instagram.profile({ username: "instagram" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const headers = (call[1] as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer sk_test");
  });
});
