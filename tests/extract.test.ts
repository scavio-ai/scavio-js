import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../src/index.js";

describe("extract", () => {
  let client: Scavio;

  beforeEach(() => {
    client = new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 10 });
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: { url: "https://example.com", content: "# Example" },
        }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is callable on the client and carries the website methods", () => {
    expect(typeof client.extract).toBe("function");
    expect(
      (client as unknown as Record<string, unknown>).extract,
    ).not.toHaveProperty("extract");
    for (const m of [
      "map",
      "crawl",
      "crawlStatus",
      "cancelCrawl",
      "batch",
      "batchStatus",
      "cancelBatch",
    ]) {
      expect(typeof (client.extract as unknown as Record<string, unknown>)[m]).toBe("function");
    }
  });

  it("backward compat: extract({ url }) sends the exact 0.22 request", async () => {
    await client.extract({ url: "https://example.com" });
    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("https://api.scavio.dev/api/v1/extract");
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).body).toBe('{"url":"https://example.com"}');
    expect(Object.keys((init as RequestInit).headers as object).sort()).toEqual([
      "Authorization",
      "Content-Type",
      "User-Agent",
      "X-Client-Source",
    ]);
  });

  it("backward compat: extract({ url, format, mode }) sends the exact 0.22 request", async () => {
    await client.extract({ url: "https://example.com", format: "text", mode: "ultra" });
    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("https://api.scavio.dev/api/v1/extract");
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).body).toBe(
      '{"url":"https://example.com","format":"text","mode":"ultra"}',
    );
  });

  it("works detached from the client (bound)", async () => {
    const { extract } = client;
    await extract({ url: "https://example.com" });
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/extract");
  });

  it("each client gets its own extract", () => {
    const other = new Scavio({ apiKey: "sk_other" });
    expect(other.extract).not.toBe(client.extract);
  });

  it("posts to /api/v1/extract", async () => {
    await client.extract({ url: "https://example.com" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/extract",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ url: "https://example.com" }),
      }),
    );
  });

  it("passes format and mode through", async () => {
    await client.extract({
      url: "https://example.com",
      format: "text",
      mode: "ultra",
    });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({
      url: "https://example.com",
      format: "text",
      mode: "ultra",
    });
  });

  it("returns the API response", async () => {
    const result = await client.extract({ url: "https://example.com" });
    expect(result).toEqual({
      data: { url: "https://example.com", content: "# Example" },
    });
  });
});
