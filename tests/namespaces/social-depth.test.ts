import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

// The 0.22.0 social depth batch: 12 TikTok, 2 YouTube, 2 Reddit, 3 X methods.
// Each must POST its exact path with the options object as the body.

type Case = [name: string, call: (c: Scavio) => Promise<unknown>, path: string, body: Record<string, unknown>];

const cases: Case[] = [
  ["tiktok.trendingSearches", (c) => c.tiktok.trendingSearches(), "/api/v1/tiktok/trending/searches", {}],
  ["tiktok.trendingVideos", (c) => c.tiktok.trendingVideos(), "/api/v1/tiktok/trending/videos", {}],
  ["tiktok.trendingVideos count", (c) => c.tiktok.trendingVideos({ count: 10 }), "/api/v1/tiktok/trending/videos", { count: 10 }],
  ["tiktok.searchSuggestions", (c) => c.tiktok.searchSuggestions({ keyword: "cooking" }), "/api/v1/tiktok/search/suggestions", { keyword: "cooking" }],
  ["tiktok.music", (c) => c.tiktok.music({ music_id: "7364498342501435408" }), "/api/v1/tiktok/music", { music_id: "7364498342501435408" }],
  ["tiktok.musicVideos", (c) => c.tiktok.musicVideos({ music_id: "7364498342501435408", cursor: "14" }), "/api/v1/tiktok/music/videos", { music_id: "7364498342501435408", cursor: "14" }],
  ["tiktok.searchMusic", (c) => c.tiktok.searchMusic({ keyword: "espresso", count: 5 }), "/api/v1/tiktok/search/music", { keyword: "espresso", count: 5 }],
  ["tiktok.musicChart", (c) => c.tiktok.musicChart(), "/api/v1/tiktok/music/chart", {}],
  ["tiktok.musicChart viral", (c) => c.tiktok.musicChart({ chart: "viral", count: 10 }), "/api/v1/tiktok/music/chart", { chart: "viral", count: 10 }],
  ["tiktok.userSimilar", (c) => c.tiktok.userSimilar({ sec_user_id: "MS4wLjABAAAA", page_token: "t2" }), "/api/v1/tiktok/user/similar", { sec_user_id: "MS4wLjABAAAA", page_token: "t2" }],
  ["tiktok.userPlaylists", (c) => c.tiktok.userPlaylists({ sec_user_id: "MS4wLjABAAAA" }), "/api/v1/tiktok/user/playlists", { sec_user_id: "MS4wLjABAAAA" }],
  ["tiktok.playlistVideos", (c) => c.tiktok.playlistVideos({ playlist_id: "7596415294902389534" }), "/api/v1/tiktok/playlist/videos", { playlist_id: "7596415294902389534" }],
  ["tiktok.userLive", (c) => c.tiktok.userLive({ username: "mrbeast" }), "/api/v1/tiktok/user/live", { username: "mrbeast" }],
  ["tiktok.userRegion", (c) => c.tiktok.userRegion({ username: "@mrbeast" }), "/api/v1/tiktok/user/region", { username: "@mrbeast" }],
  ["youtube.communityPost", (c) => c.youtube.communityPost({ post_id: "Ugkx_post" }), "/api/v1/youtube/community/post", { post_id: "Ugkx_post" }],
  ["youtube.communityPostComments", (c) => c.youtube.communityPostComments({ post_id: "Ugkx_post", cursor: "c2" }), "/api/v1/youtube/community/post/comments", { post_id: "Ugkx_post", cursor: "c2" }],
  ["reddit.searchComments", (c) => c.reddit.searchComments({ query: "web scraping api", sort: "NEW" }), "/api/v1/reddit/search/comments", { query: "web scraping api", sort: "NEW" }],
  ["reddit.searchSubreddits", (c) => c.reddit.searchSubreddits({ query: "web scraping" }), "/api/v1/reddit/search/subreddits", { query: "web scraping" }],
  ["x.searchCommunities", (c) => c.x.searchCommunities({ keyword: "crypto" }), "/api/v1/x/search/communities", { keyword: "crypto" }],
  ["x.community", (c) => c.x.community({ community_id: "1508567430188126209" }), "/api/v1/x/community", { community_id: "1508567430188126209" }],
  ["x.communityTweets", (c) => c.x.communityTweets({ community_id: "1508567430188126209", ranking: "Recency" }), "/api/v1/x/community/tweets", { community_id: "1508567430188126209", ranking: "Recency" }],
];

describe("social depth methods (0.22.0)", () => {
  let client: Scavio;

  beforeEach(() => {
    client = new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50 });
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => Promise.resolve({ data: {} }) } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(cases)("%s posts the right path and body", async (_name, call, path, body) => {
    await call(client);
    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe(`https://api.scavio.dev${path}`);
    expect((init as RequestInit).method).toBe("POST");
    expect(JSON.parse((init as RequestInit).body as string)).toEqual(body);
  });
});
