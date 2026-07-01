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

  it("metadata sends POST to /api/v1/youtube/metadata", async () => {
    await client.youtube.metadata({ video_id: "dQw4w9WgXcQ" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ video_id: "dQw4w9WgXcQ" });
  });
});
