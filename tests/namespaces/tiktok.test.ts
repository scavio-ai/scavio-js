import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

describe("TikTokNamespace", () => {
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

  function getBody(): Record<string, unknown> {
    const call = vi.mocked(fetch).mock.calls[0]!;
    return JSON.parse((call[1] as RequestInit).body as string);
  }

  function getUrl(): string {
    return vi.mocked(fetch).mock.calls[0]![0] as string;
  }

  it("profile sends to /api/v1/tiktok/profile", async () => {
    await client.tiktok.profile({ username: "testuser" });
    expect(getUrl()).toBe("https://api.scavio.dev/api/v1/tiktok/profile");
    expect(getBody()).toEqual({ username: "testuser" });
  });

  it("userPosts sends to /api/v1/tiktok/user/posts", async () => {
    await client.tiktok.userPosts({ sec_user_id: "abc123" });
    expect(getUrl()).toBe("https://api.scavio.dev/api/v1/tiktok/user/posts");
    expect(getBody()).toEqual({ sec_user_id: "abc123" });
  });

  it("video sends to /api/v1/tiktok/video", async () => {
    await client.tiktok.video({ video_id: "vid123" });
    expect(getUrl()).toBe("https://api.scavio.dev/api/v1/tiktok/video");
    expect(getBody()).toEqual({ video_id: "vid123" });
  });

  it("videoComments sends to /api/v1/tiktok/video/comments", async () => {
    await client.tiktok.videoComments({ video_id: "vid123", count: 20 });
    expect(getUrl()).toBe(
      "https://api.scavio.dev/api/v1/tiktok/video/comments",
    );
    expect(getBody()).toEqual({ video_id: "vid123", count: 20 });
  });

  it("commentReplies sends to /api/v1/tiktok/video/comments/replies", async () => {
    await client.tiktok.commentReplies({
      video_id: "vid123",
      comment_id: "c456",
    });
    expect(getUrl()).toBe(
      "https://api.scavio.dev/api/v1/tiktok/video/comments/replies",
    );
    expect(getBody()).toEqual({ video_id: "vid123", comment_id: "c456" });
  });

  it("searchVideos sends to /api/v1/tiktok/search/videos", async () => {
    await client.tiktok.searchVideos({ keyword: "dance" });
    expect(getUrl()).toBe(
      "https://api.scavio.dev/api/v1/tiktok/search/videos",
    );
    expect(getBody()).toEqual({ keyword: "dance" });
  });

  it("searchUsers sends to /api/v1/tiktok/search/users", async () => {
    await client.tiktok.searchUsers({ keyword: "cooking" });
    expect(getUrl()).toBe("https://api.scavio.dev/api/v1/tiktok/search/users");
    expect(getBody()).toEqual({ keyword: "cooking" });
  });

  it("hashtag sends to /api/v1/tiktok/hashtag", async () => {
    await client.tiktok.hashtag({ hashtag_name: "fyp" });
    expect(getUrl()).toBe("https://api.scavio.dev/api/v1/tiktok/hashtag");
    expect(getBody()).toEqual({ hashtag_name: "fyp" });
  });

  it("hashtagVideos sends to /api/v1/tiktok/hashtag/videos", async () => {
    await client.tiktok.hashtagVideos({ hashtag_id: "h789" });
    expect(getUrl()).toBe(
      "https://api.scavio.dev/api/v1/tiktok/hashtag/videos",
    );
    expect(getBody()).toEqual({ hashtag_id: "h789" });
  });

  it("userFollowers sends to /api/v1/tiktok/user/followers", async () => {
    await client.tiktok.userFollowers({ sec_user_id: "abc123" });
    expect(getUrl()).toBe(
      "https://api.scavio.dev/api/v1/tiktok/user/followers",
    );
    expect(getBody()).toEqual({ sec_user_id: "abc123" });
  });

  it("userFollowings sends to /api/v1/tiktok/user/followings", async () => {
    await client.tiktok.userFollowings({ sec_user_id: "abc123" });
    expect(getUrl()).toBe(
      "https://api.scavio.dev/api/v1/tiktok/user/followings",
    );
    expect(getBody()).toEqual({ sec_user_id: "abc123" });
  });
});
