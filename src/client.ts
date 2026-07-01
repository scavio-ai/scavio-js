import { MissingAPIKeyError, ScavioError } from "./errors.js";
import { BASE_URL, DEFAULT_MAX_RETRIES, DEFAULT_TIMEOUT, request } from "./http.js";
import { RateLimiter } from "./rate-limiter.js";
import { AmazonNamespace } from "./namespaces/amazon.js";
import type { GoogleSearchOptions } from "./namespaces/google.js";
import { GoogleNamespace } from "./namespaces/google.js";
import { RedditNamespace } from "./namespaces/reddit.js";
import { TikTokNamespace } from "./namespaces/tiktok.js";
import { InstagramNamespace } from "./namespaces/instagram.js";
import { WalmartNamespace } from "./namespaces/walmart.js";
import { YouTubeNamespace } from "./namespaces/youtube.js";

export interface ScavioConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxRequestsPerSecond?: number;
  /**
   * Additional retry attempts after the first request on transient failures
   * (HTTP 429/500/502/503/504 and network/timeout errors). Defaults to 2.
   * Set to 0 to disable retries.
   */
  maxRetries?: number;
}

export class Scavio {
  readonly google: GoogleNamespace;
  readonly amazon: AmazonNamespace;
  readonly walmart: WalmartNamespace;
  readonly youtube: YouTubeNamespace;
  readonly reddit: RedditNamespace;
  readonly tiktok: TikTokNamespace;
  readonly instagram: InstagramNamespace;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly rateLimiter: RateLimiter;

  constructor(config?: ScavioConfig) {
    this.apiKey = config?.apiKey ?? process.env.SCAVIO_API_KEY ?? "";
    if (!this.apiKey) {
      throw new MissingAPIKeyError();
    }

    this.baseUrl = (config?.baseUrl ?? BASE_URL).replace(/\/+$/, "");
    this.timeout = config?.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = config?.maxRetries ?? DEFAULT_MAX_RETRIES;

    const rps = config?.maxRequestsPerSecond ?? 1;
    if (rps < 1 || rps > 10) {
      throw new ScavioError("maxRequestsPerSecond must be between 1 and 10");
    }
    this.rateLimiter = new RateLimiter(rps);

    this.google = new GoogleNamespace(this);
    this.amazon = new AmazonNamespace(this);
    this.walmart = new WalmartNamespace(this);
    this.youtube = new YouTubeNamespace(this);
    this.reddit = new RedditNamespace(this);
    this.tiktok = new TikTokNamespace(this);
    this.instagram = new InstagramNamespace(this);
  }

  /** @internal */
  async _post(
    path: string,
    body: object,
  ): Promise<Record<string, unknown>> {
    return request({
      method: "POST",
      path,
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
      rateLimiter: this.rateLimiter,
      body: body as Record<string, unknown>,
    });
  }

  /** @internal */
  async _get(path: string): Promise<Record<string, unknown>> {
    return request({
      method: "GET",
      path,
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
      rateLimiter: this.rateLimiter,
    });
  }

  async search(
    options: GoogleSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.google.search(options);
  }

  async getUsage(): Promise<Record<string, unknown>> {
    return this._get("/api/v1/usage");
  }
}
