import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

describe("YouTubeNamespace", () => {
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

  it("search sends query as 'search' field", async () => {
    await client.youtube.search({ query: "typescript tutorial" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ search: "typescript tutorial" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/search",
      expect.anything(),
    );
  });

  it("search passes optional params alongside search field", async () => {
    await client.youtube.search({
      query: "test",
      upload_date: "week",
      sort_by: "relevance",
      hd: true,
    });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({
      search: "test",
      upload_date: "week",
      sort_by: "relevance",
      hd: true,
    });
  });

  it("maps digit-named fields to their wire names", async () => {
    await client.youtube.search({
      query: "drone footage",
      fourK: true,
      video_360: true,
      video_3d: false,
      hdr: true,
    });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({
      search: "drone footage",
      "4k": true,
      "360": true,
      "3d": false,
      hdr: true,
    });
    // The friendly identifiers must not leak into the wire body.
    expect(body).not.toHaveProperty("fourK");
    expect(body).not.toHaveProperty("video_360");
    expect(body).not.toHaveProperty("video_3d");
  });

  it("omits digit-named fields when not provided", async () => {
    await client.youtube.search({ query: "lofi", hd: true });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ search: "lofi", hd: true });
  });

  it("search passes features[] and cursor through to the wire body", async () => {
    await client.youtube.search({
      query: "aerial",
      features: ["hd", "4k"],
      cursor: "CURSOR",
    });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({
      search: "aerial",
      features: ["hd", "4k"],
      cursor: "CURSOR",
    });
  });

  it("shorts sends query as 'search' to /shorts", async () => {
    await client.youtube.shorts({ query: "cats", sort_by: "view_count" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ search: "cats", sort_by: "view_count" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/shorts",
      expect.anything(),
    );
  });

  it("suggestions sends query as 'search' to /suggestions", async () => {
    await client.youtube.suggestions({ query: "how to", region: "US" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ search: "how to", region: "US" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/suggestions",
      expect.anything(),
    );
  });

  it("video sends POST to /api/v1/youtube/video", async () => {
    await client.youtube.video({ video_id: "dQw4w9WgXcQ" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ video_id: "dQw4w9WgXcQ" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/video",
      expect.anything(),
    );
  });

  it("metadata is a deprecated alias that posts to /api/v1/youtube/video", async () => {
    await client.youtube.metadata({ video_id: "dQw4w9WgXcQ" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ video_id: "dQw4w9WgXcQ" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/video",
      expect.anything(),
    );
  });

  it("comments sends POST to /api/v1/youtube/comments", async () => {
    await client.youtube.comments({ video_id: "abc", cursor: "C1" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ video_id: "abc", cursor: "C1" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/comments",
      expect.anything(),
    );
  });

  it("commentReplies sends POST to /api/v1/youtube/comments/replies", async () => {
    await client.youtube.commentReplies({
      video_id: "abc",
      reply_cursor: "R1",
    });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ video_id: "abc", reply_cursor: "R1" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/comments/replies",
      expect.anything(),
    );
  });

  it("transcript sends POST to /api/v1/youtube/transcript", async () => {
    await client.youtube.transcript({ video_id: "abc", format: "srt" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ video_id: "abc", format: "srt" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/transcript",
      expect.anything(),
    );
  });

  it("related sends POST to /api/v1/youtube/related", async () => {
    await client.youtube.related({ video_id: "abc" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ video_id: "abc" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/related",
      expect.anything(),
    );
  });

  it("channelSearch sends query as 'search' to /channel/search", async () => {
    await client.youtube.channelSearch({ query: "mkbhd" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ search: "mkbhd" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/channel/search",
      expect.anything(),
    );
  });

  it("channel sends POST to /api/v1/youtube/channel", async () => {
    await client.youtube.channel({ channel_id: "UC123" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ channel_id: "UC123" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/channel",
      expect.anything(),
    );
  });

  it("channelVideos sends POST to /api/v1/youtube/channel/videos", async () => {
    await client.youtube.channelVideos({ channel_id: "UC123", cursor: "C1" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ channel_id: "UC123", cursor: "C1" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/channel/videos",
      expect.anything(),
    );
  });

  it("channelShorts sends POST to /api/v1/youtube/channel/shorts", async () => {
    await client.youtube.channelShorts({ channel_id: "UC123" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ channel_id: "UC123" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/channel/shorts",
      expect.anything(),
    );
  });

  it("channelCommunity sends POST to /api/v1/youtube/channel/community", async () => {
    await client.youtube.channelCommunity({ channel_id: "UC123" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ channel_id: "UC123" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/channel/community",
      expect.anything(),
    );
  });

  it("channelResolve sends POST to /api/v1/youtube/channel/resolve", async () => {
    await client.youtube.channelResolve({ channel: "@mkbhd" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ channel: "@mkbhd" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/channel/resolve",
      expect.anything(),
    );
  });

  it("streams sends POST to /api/v1/youtube/streams", async () => {
    await client.youtube.streams({ video_id: "abc" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ video_id: "abc" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/youtube/streams",
      expect.anything(),
    );
  });
});
