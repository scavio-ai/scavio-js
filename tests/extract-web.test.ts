import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ScavioJobTimeoutError } from "../src/index.js";

const BASE = "https://api.scavio.dev";

function ok(body: unknown): Response {
  return { ok: true, status: 200, json: () => Promise.resolve(body) } as Response;
}

function call(i = 0): { url: string; init: RequestInit; headers: Record<string, string> } {
  const [url, init] = vi.mocked(fetch).mock.calls[i]!;
  return { url: url as string, init: init as RequestInit, headers: (init as RequestInit).headers as Record<string, string> };
}

const summary = (status: string, extra: Record<string, unknown> = {}) => ({
  id: "crawl_1",
  type: "crawl",
  status,
  stopped_reason: null,
  error: null,
  url: "https://example.com",
  format: "markdown",
  mode: "normal",
  pages: { discovered: 2, queued: 0, succeeded: 2, failed: 0, skipped: 0 },
  credits_used: 2,
  created_at: null,
  started_at: null,
  completed_at: null,
  expires_at: null,
  webhook: null,
  status_url: `${BASE}/api/v1/extract/crawl/crawl_1`,
  ...extra,
});

const result = (url: string) => ({
  url,
  depth: 0,
  status: "succeeded",
  status_code: 200,
  content: "# x",
  content_length: 3,
  truncated: false,
  error: null,
  skip_reason: null,
  credits: 1,
});

describe("extract website operations", () => {
  let client: Scavio;

  beforeEach(() => {
    client = new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, maxRetries: 0 });
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue(ok({ data: {} }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("map posts the body as given", async () => {
    await client.extract.map({
      url: "https://scavio.dev",
      limit: 5,
      sitemap: "only",
      include_paths: ["/docs/**"],
      ignore_query_parameters: false,
    });
    const c = call();
    expect(c.url).toBe(`${BASE}/api/v1/extract/map`);
    expect(c.init.method).toBe("POST");
    expect(JSON.parse(c.init.body as string)).toEqual({
      url: "https://scavio.dev",
      limit: 5,
      sitemap: "only",
      include_paths: ["/docs/**"],
      ignore_query_parameters: false,
    });
    expect(c.headers["Idempotency-Key"]).toBeUndefined();
  });

  it("crawl posts the body and returns the 202 handle", async () => {
    const created = { data: { id: "crawl_1", status: "queued" }, credits_used: 0 };
    vi.mocked(fetch).mockResolvedValue(ok(created));
    const out = await client.extract.crawl({ url: "https://example.com", max_pages: 2, format: "text", mode: "advanced" });
    expect(out).toEqual(created);
    const c = call();
    expect(c.url).toBe(`${BASE}/api/v1/extract/crawl`);
    expect(c.init.method).toBe("POST");
    expect(JSON.parse(c.init.body as string)).toEqual({
      url: "https://example.com",
      max_pages: 2,
      format: "text",
      mode: "advanced",
    });
    expect(c.headers["Idempotency-Key"]).toBeUndefined();
  });

  it("crawl sends idempotencyKey as the Idempotency-Key header, not in the body", async () => {
    await client.extract.crawl({ url: "https://example.com" }, { idempotencyKey: "job-42" });
    const c = call();
    expect(c.headers["Idempotency-Key"]).toBe("job-42");
    expect(c.headers.Authorization).toBe("Bearer sk_test");
    expect(JSON.parse(c.init.body as string)).toEqual({ url: "https://example.com" });
  });

  it("crawlStatus GETs with the query string", async () => {
    await client.extract.crawlStatus("crawl_1", { cursor: "25", limit: 50, status: "failed", include_content: false });
    const c = call();
    expect(c.url).toBe(`${BASE}/api/v1/extract/crawl/crawl_1?cursor=25&limit=50&status=failed&include_content=false`);
    expect(c.init.method).toBe("GET");
    expect(c.init.body).toBeUndefined();
  });

  it("crawlStatus without a query has no query string", async () => {
    await client.extract.crawlStatus("crawl_1");
    expect(call().url).toBe(`${BASE}/api/v1/extract/crawl/crawl_1`);
  });

  it("cancelCrawl sends DELETE", async () => {
    await client.extract.cancelCrawl("crawl_1");
    const c = call();
    expect(c.url).toBe(`${BASE}/api/v1/extract/crawl/crawl_1`);
    expect(c.init.method).toBe("DELETE");
    expect(c.init.body).toBeUndefined();
  });

  it("batch posts urls with the idempotency header", async () => {
    await client.extract.batch(
      { urls: ["https://a.com", "https://b.com"], mode: "ultra", webhook_url: "https://hooks.example.com/x" },
      { idempotencyKey: "b-1" },
    );
    const c = call();
    expect(c.url).toBe(`${BASE}/api/v1/extract/batch`);
    expect(c.init.method).toBe("POST");
    expect(c.headers["Idempotency-Key"]).toBe("b-1");
    expect(JSON.parse(c.init.body as string)).toEqual({
      urls: ["https://a.com", "https://b.com"],
      mode: "ultra",
      webhook_url: "https://hooks.example.com/x",
    });
  });

  it("batchStatus and cancelBatch hit the batch paths", async () => {
    await client.extract.batchStatus("batch_1", { include_content: true });
    await client.extract.cancelBatch("batch_1");
    expect(call(0).url).toBe(`${BASE}/api/v1/extract/batch/batch_1?include_content=true`);
    expect(call(0).init.method).toBe("GET");
    expect(call(1).url).toBe(`${BASE}/api/v1/extract/batch/batch_1`);
    expect(call(1).init.method).toBe("DELETE");
  });

  it("job ids are path-encoded", async () => {
    await client.extract.crawlStatus("a/b");
    expect(call().url).toBe(`${BASE}/api/v1/extract/crawl/a%2Fb`);
  });

  it("wait: polls until finished and collects every result page", async () => {
    const f = vi.mocked(fetch);
    f.mockReset();
    f.mockResolvedValueOnce(ok({ data: { id: "crawl_1", status: "queued", status_url: "u" }, credits_used: 0 }))
      .mockResolvedValueOnce(ok({ data: { ...summary("running"), results: [], next_cursor: null } }))
      .mockResolvedValueOnce(ok({ data: { ...summary("completed"), results: [], next_cursor: "1" } }))
      .mockResolvedValueOnce(ok({ data: { ...summary("completed"), results: [result("https://example.com/a")], next_cursor: "1" } }))
      .mockResolvedValueOnce(ok({ data: { ...summary("completed"), results: [result("https://example.com/b")], next_cursor: null } }));

    const out = await client.extract.crawl({ url: "https://example.com", max_pages: 2 }, { wait: true, pollInterval: 1 });
    expect(out.data.status).toBe("completed");
    expect(out.data.next_cursor).toBeNull();
    expect(out.data.results.map((r) => r.url)).toEqual(["https://example.com/a", "https://example.com/b"]);
    expect(call(1).url).toBe(`${BASE}/api/v1/extract/crawl/crawl_1?limit=1&include_content=false`);
    expect(call(3).url).toBe(`${BASE}/api/v1/extract/crawl/crawl_1?limit=100`);
    expect(call(4).url).toBe(`${BASE}/api/v1/extract/crawl/crawl_1?cursor=1&limit=100`);
  });

  it("wait: throws ScavioJobTimeoutError carrying the job id", async () => {
    const f = vi.mocked(fetch);
    f.mockReset();
    f.mockResolvedValueOnce(ok({ data: { id: "batch_9", status: "queued", status_url: "su" }, credits_used: 0 }))
      .mockResolvedValue(ok({ data: { ...summary("running"), results: [], next_cursor: null } }));
    const err = await client.extract
      .batch({ urls: ["https://a.com"] }, { wait: true, pollInterval: 5, waitTimeout: 1 })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ScavioJobTimeoutError);
    expect((err as ScavioJobTimeoutError).jobId).toBe("batch_9");
    expect((err as ScavioJobTimeoutError).jobType).toBe("batch");
    expect((err as ScavioJobTimeoutError).statusUrl).toBe("su");
  });
});
