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

  it("is a top-level method, not a namespace", () => {
    expect(typeof client.extract).toBe("function");
    expect(
      (client as unknown as Record<string, unknown>).extract,
    ).not.toHaveProperty("extract");
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
