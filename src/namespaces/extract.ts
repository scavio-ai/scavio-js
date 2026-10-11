import type { Scavio } from "../client.js";
import { ScavioJobTimeoutError } from "../errors.js";

/** Fetch tier, as on Extract: standard, renders JavaScript, hardest pages. */
export type ExtractMode = "normal" | "advanced" | "ultra";
/** Return format for each page, as on Extract. */
export type ExtractFormat = "html" | "markdown" | "text";
/** How a map or crawl uses the site's sitemaps. */
export type ExtractSitemapMode = "include" | "only" | "skip";

export interface ExtractMapOptions {
  /** The site to map. A bare host is upgraded to https. 1-2048 characters. */
  url: string;
  /** Only return URLs containing every word of this text (case-insensitive, max 200). */
  search?: string;
  /**
   * Maximum links to return, 1-5,000. Default 1,000 (or your plan's limit if
   * lower). Plan limits: Free 500, PAYG 1,000, paid plans 5,000.
   */
  limit?: number;
  /**
   * "include" (default) combines the site's sitemaps with the links on the
   * start page; "only" uses sitemaps alone; "skip" uses page links alone.
   */
  sitemap?: ExtractSitemapMode;
  /** Also return URLs on subdomains. Default false (www and the bare domain count as one site). */
  include_subdomains?: boolean;
  /** Path globs to keep (max 20). `*` matches within a segment, `**` across segments. */
  include_paths?: string[];
  /** Path globs to drop (max 20). */
  exclude_paths?: string[];
  /** Treat URLs that differ only by query string as one URL. Default true. */
  ignore_query_parameters?: boolean;
  /** Fetch tier. Default "normal" (1 credit). */
  mode?: ExtractMode;
  [key: string]: unknown;
}

export interface ExtractCrawlOptions {
  /** Where the crawl starts. Only pages on the same site are crawled. */
  url: string;
  /**
   * Maximum pages to fetch, 1-10,000. Default 100. Plan limits: Free 10,
   * PAYG 100, Project 500, Bootstrap 2,000, Startup 5,000, Growth 10,000.
   */
  max_pages?: number;
  /** Links away from the start page to follow, 0-10 (default 3). 0 fetches only the start page. */
  max_depth?: number;
  /** Path globs to crawl (max 20), e.g. ["/blog/**"]. */
  include_paths?: string[];
  /** Path globs to skip (max 20). */
  exclude_paths?: string[];
  /** Also crawl subdomains of the site. Default false. */
  allow_subdomains?: boolean;
  /** Treat URLs that differ only by query string as one page. Default true. */
  ignore_query_parameters?: boolean;
  /**
   * "include" (default) also starts from the site's sitemap; "skip" follows
   * links only; "only" fetches sitemap pages without following links.
   */
  sitemap?: ExtractSitemapMode;
  /** Return format for each page. Default "markdown". */
  format?: ExtractFormat;
  /** Fetch tier, the price per successful page: normal 1, advanced 1, ultra 2. */
  mode?: ExtractMode;
  /**
   * https URL that receives a signed POST when the job completes, fails or is
   * cancelled. The signing secret comes back once, as `webhook_secret`.
   * Verify deliveries with `verifyWebhook`.
   */
  webhook_url?: string;
  [key: string]: unknown;
}

export interface ExtractBatchOptions {
  /**
   * The pages to extract (duplicates removed). Plan limits: Free 10, PAYG 50,
   * Project 100, Bootstrap 500, Startup and Growth 1,000.
   */
  urls: string[];
  /** Return format for each page. Default "markdown". */
  format?: ExtractFormat;
  /** Fetch tier, the price per successful page: normal 1, advanced 1, ultra 2. */
  mode?: ExtractMode;
  /** https URL that receives a signed POST when the job finishes. See `ExtractCrawlOptions.webhook_url`. */
  webhook_url?: string;
  [key: string]: unknown;
}

/** Client-side options for starting a crawl or batch job. */
export interface ExtractJobRequestOptions {
  /**
   * Sent as the `Idempotency-Key` header. Repeating the POST with the same
   * key within 24 hours returns the original job instead of starting a new
   * one. When omitted, a random key is generated for this call and reused
   * across its automatic retries, so a retried start can never begin a
   * second, billed job. Pass your own to dedupe across calls or processes.
   */
  idempotencyKey?: string;
  /**
   * Poll until the job finishes and return every result in one response
   * (all pages of the status endpoint, `next_cursor: null`). Default false:
   * return the 202 job handle immediately.
   */
  wait?: boolean;
  /** With `wait`: milliseconds between status polls. Default 2,000. */
  pollInterval?: number;
  /**
   * With `wait`: give up after this many milliseconds and throw
   * `ScavioJobTimeoutError` (the job keeps running; its id is on the error).
   * Default 600,000 (10 minutes).
   */
  waitTimeout?: number;
}

export interface ExtractJobStatusQuery {
  /** `next_cursor` from the previous response. */
  cursor?: string;
  /** Results per response, 1-100 (default 25). Responses are also cut at about 5 MB of content. */
  limit?: number;
  /** Only results with this status. */
  status?: "succeeded" | "failed" | "skipped";
  /** Set false to page through results without their content. Default true. */
  include_content?: boolean;
}

export interface ExtractMapLink {
  url: string;
  source: "sitemap" | "page";
  lastmod?: string;
}

export interface ExtractMapResponse {
  data: {
    url: string;
    links: ExtractMapLink[];
    total_found: number;
    returned: number;
    truncated: boolean;
    sitemaps_read: number;
  };
  response_time: number;
  credits_used: number;
  credits_remaining: number;
}

export interface ExtractJobCreatedResponse {
  data: {
    id: string;
    type: "crawl" | "batch";
    status: string;
    url: string | null;
    max_pages: number;
    max_depth: number;
    format: string;
    mode: string;
    credits_per_page: number;
    status_url: string;
    urls_count?: number;
    invalid_urls?: { url: string; error: string }[];
    webhook_url?: string;
    /** Returned once, on creation. Keep it to verify webhook deliveries. */
    webhook_secret?: string;
  };
  credits_used: number;
}

export type ExtractJobState = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface ExtractJobSummary {
  id: string;
  type: string;
  status: ExtractJobState;
  /** Why a completed job stopped early: max_pages, insufficient_credits, time_limit, storage_limit, or cancelled. */
  stopped_reason: string | null;
  error: string | null;
  url: string | null;
  format: string;
  mode: string;
  pages: { discovered: number; queued: number; succeeded: number; failed: number; skipped: number };
  credits_used: number;
  created_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  /** Results are deleted after this time (3 days after the job finishes). */
  expires_at: string | null;
  webhook: { status: string | null; attempts: number } | null;
  status_url: string;
}

export interface ExtractJobResult {
  url: string;
  depth: number;
  status: "succeeded" | "failed" | "skipped";
  status_code: number | null;
  content?: string | null;
  content_length: number | null;
  truncated: boolean;
  error: string | null;
  skip_reason: string | null;
  credits: number;
}

export interface ExtractJobStatusResponse {
  data: ExtractJobSummary & { results: ExtractJobResult[]; next_cursor: string | null };
}

/**
 * What `{ wait: true }` returns: the finished job with every result, plus
 * `created`, the 202 job handle (it carries `webhook_secret`, which is only
 * ever returned on creation).
 */
export interface ExtractJobWaitResponse extends ExtractJobStatusResponse {
  created: ExtractJobCreatedResponse["data"];
}

export interface ExtractJobSummaryResponse {
  data: ExtractJobSummary;
}

type JobType = "crawl" | "batch";
type WaitOptions = ExtractJobRequestOptions & { wait: true };
type NoWaitOptions = ExtractJobRequestOptions & { wait?: false };

const TERMINAL = new Set<string>(["completed", "failed", "cancelled"]);
const DEFAULT_POLL_INTERVAL = 2_000;
const DEFAULT_WAIT_TIMEOUT = 600_000;
const COLLECT_PAGE_SIZE = 100;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function randomUUID(): Promise<string> {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (typeof g.crypto?.randomUUID === "function") return g.crypto.randomUUID();
  // Node 18 without the global Web Crypto.
  const nodeCrypto = (await import("node:crypto")) as unknown as { randomUUID: () => string };
  return nodeCrypto.randomUUID();
}

/**
 * The website operations of Extract: map a site's URLs, crawl a site, and
 * extract a list of URLs in one job. Reached as `scavio.extract.map(...)`,
 * `scavio.extract.crawl(...)` and so on; `scavio.extract({ url })` itself
 * still reads a single page.
 *
 * Map is synchronous (1 credit). Crawl and batch are jobs: they return 202
 * with an id, and you poll the status method (free) for results, or pass
 * `{ wait: true }`. Jobs bill per SUCCESSFUL page at Extract's price for the
 * tier (normal 1, advanced 1, ultra 2); failed and skipped pages are free.
 */
export class ExtractNamespace {
  constructor(private readonly client: Scavio) {}

  /**
   * List a site's page URLs, gathered from its sitemaps and its start page,
   * deduplicated, filtered by path and limited. Pages disallowed by the
   * site's robots.txt are left out. 1 credit on the normal tier.
   */
  async map(options: ExtractMapOptions): Promise<ExtractMapResponse> {
    return (await this.client._post("/api/v1/extract/map", options)) as unknown as ExtractMapResponse;
  }

  /**
   * Start a crawl from one URL: same-site pages are discovered breadth-first
   * (URLs under the start path first) within your depth, page and path
   * limits, each returned like Extract. robots.txt is always obeyed. Returns
   * the 202 job handle, or every result when `wait` is true.
   */
  crawl(options: ExtractCrawlOptions, request: WaitOptions): Promise<ExtractJobWaitResponse>;
  crawl(options: ExtractCrawlOptions, request?: NoWaitOptions): Promise<ExtractJobCreatedResponse>;
  crawl(
    options: ExtractCrawlOptions,
    request?: ExtractJobRequestOptions,
  ): Promise<ExtractJobCreatedResponse | ExtractJobWaitResponse>;
  async crawl(
    options: ExtractCrawlOptions,
    request: ExtractJobRequestOptions = {},
  ): Promise<ExtractJobCreatedResponse | ExtractJobWaitResponse> {
    return this.start("crawl", options, request);
  }

  /** A crawl's progress and its page results, paged by cursor. Free. */
  async crawlStatus(id: string, query?: ExtractJobStatusQuery): Promise<ExtractJobStatusResponse> {
    return this.status("crawl", id, query);
  }

  /**
   * Stop a queued or running crawl. No further pages are fetched or billed;
   * results so far stay available. A finished crawl answers 409. Free.
   */
  async cancelCrawl(id: string): Promise<ExtractJobSummaryResponse> {
    return this.cancel("crawl", id);
  }

  /**
   * Extract a list of URLs in one job, each returned like Extract. Invalid
   * URLs come back in `invalid_urls` and are never billed. Returns the 202
   * job handle, or every result (in input order) when `wait` is true.
   */
  batch(options: ExtractBatchOptions, request: WaitOptions): Promise<ExtractJobWaitResponse>;
  batch(options: ExtractBatchOptions, request?: NoWaitOptions): Promise<ExtractJobCreatedResponse>;
  batch(
    options: ExtractBatchOptions,
    request?: ExtractJobRequestOptions,
  ): Promise<ExtractJobCreatedResponse | ExtractJobWaitResponse>;
  async batch(
    options: ExtractBatchOptions,
    request: ExtractJobRequestOptions = {},
  ): Promise<ExtractJobCreatedResponse | ExtractJobWaitResponse> {
    return this.start("batch", options, request);
  }

  /** A batch's progress and its page results in input order, paged by cursor. Free. */
  async batchStatus(id: string, query?: ExtractJobStatusQuery): Promise<ExtractJobStatusResponse> {
    return this.status("batch", id, query);
  }

  /** Stop a queued or running batch. A finished batch answers 409. Free. */
  async cancelBatch(id: string): Promise<ExtractJobSummaryResponse> {
    return this.cancel("batch", id);
  }

  private async start(
    type: JobType,
    body: object,
    request: ExtractJobRequestOptions,
  ): Promise<ExtractJobCreatedResponse | ExtractJobWaitResponse> {
    // Always keyed: one key per logical call, reused by every retry of this
    // POST, so a retried start returns the first job instead of a second one.
    const headers = { "Idempotency-Key": request.idempotencyKey ?? (await randomUUID()) };
    const created = (await this.client._post(
      `/api/v1/extract/${type}`,
      body,
      headers,
    )) as unknown as ExtractJobCreatedResponse;
    if (!request.wait) return created;
    const done = await this.waitFor(type, created.data.id, created.data.status_url, request);
    return { ...done, created: created.data };
  }

  private async status(
    type: JobType,
    id: string,
    query: ExtractJobStatusQuery = {},
  ): Promise<ExtractJobStatusResponse> {
    return (await this.client._get(`/api/v1/extract/${type}/${encodeURIComponent(id)}`, {
      cursor: query.cursor,
      limit: query.limit,
      status: query.status,
      include_content: query.include_content,
    })) as unknown as ExtractJobStatusResponse;
  }

  private async cancel(type: JobType, id: string): Promise<ExtractJobSummaryResponse> {
    return (await this.client._delete(
      `/api/v1/extract/${type}/${encodeURIComponent(id)}`,
    )) as unknown as ExtractJobSummaryResponse;
  }

  private async waitFor(
    type: JobType,
    id: string,
    statusUrl: string,
    request: ExtractJobRequestOptions,
  ): Promise<ExtractJobStatusResponse> {
    const interval = request.pollInterval ?? DEFAULT_POLL_INTERVAL;
    const deadline = Date.now() + (request.waitTimeout ?? DEFAULT_WAIT_TIMEOUT);
    for (;;) {
      const probe = await this.status(type, id, { limit: 1, include_content: false });
      if (TERMINAL.has(probe.data.status)) break;
      if (Date.now() + interval > deadline) {
        throw new ScavioJobTimeoutError(type, id, statusUrl, probe.data.status);
      }
      await sleep(interval);
    }

    // Finished: collect every result page into one response.
    const results: ExtractJobResult[] = [];
    let cursor: string | undefined;
    let last: ExtractJobStatusResponse;
    do {
      last = await this.status(type, id, { cursor, limit: COLLECT_PAGE_SIZE });
      results.push(...last.data.results);
      cursor = last.data.next_cursor ?? undefined;
    } while (cursor);
    return { data: { ...last.data, results, next_cursor: null } };
  }
}
