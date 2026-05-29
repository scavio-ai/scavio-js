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
});
