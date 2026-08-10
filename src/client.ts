import { MissingAPIKeyError, ScavioError } from "./errors.js";
import { BASE_URL, DEFAULT_MAX_RETRIES, DEFAULT_TIMEOUT, request } from "./http.js";
import { RateLimiter } from "./rate-limiter.js";
import { AmazonNamespace } from "./namespaces/amazon.js";
import type { GoogleSearchOptions } from "./namespaces/google.js";
import { GoogleNamespace } from "./namespaces/google.js";
import { RedditNamespace } from "./namespaces/reddit.js";
import { TikTokNamespace } from "./namespaces/tiktok.js";
import { TikTokShopNamespace } from "./namespaces/tiktok-shop.js";
import { InstagramNamespace } from "./namespaces/instagram.js";
import { WalmartNamespace } from "./namespaces/walmart.js";
import { YouTubeNamespace } from "./namespaces/youtube.js";
import { XNamespace } from "./namespaces/x.js";
import { LinkedInNamespace } from "./namespaces/linkedin.js";
import { ThreadsNamespace } from "./namespaces/threads.js";
import { KuaishouNamespace } from "./namespaces/kuaishou.js";
import { EbayNamespace } from "./namespaces/ebay.js";
import { TargetNamespace } from "./namespaces/target.js";
import { HomeDepotNamespace } from "./namespaces/home-depot.js";
import { ZillowNamespace } from "./namespaces/zillow.js";
import { RedfinNamespace } from "./namespaces/redfin.js";
import { BookingNamespace } from "./namespaces/booking.js";
import { AirbnbNamespace } from "./namespaces/airbnb.js";
import { TripadvisorNamespace } from "./namespaces/tripadvisor.js";
import { YelpNamespace } from "./namespaces/yelp.js";
import { IndeedNamespace } from "./namespaces/indeed.js";
import { GlassdoorNamespace } from "./namespaces/glassdoor.js";
import { AppStoreNamespace } from "./namespaces/app-store.js";
import { GooglePlayNamespace } from "./namespaces/google-play.js";
import { G2Namespace } from "./namespaces/g2.js";
import { CapterraNamespace } from "./namespaces/capterra.js";
import { SECNamespace } from "./namespaces/sec.js";
import { CompaniesHouseNamespace } from "./namespaces/companies-house.js";
import { GoogleAdsNamespace } from "./namespaces/google-ads.js";
import { MetaAdsNamespace } from "./namespaces/meta-ads.js";

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

/**
 * Options for the top-level `extract()` method.
 *
 * Extract is a CORE endpoint, not a platform: it reads any URL, so it hangs
 * off the client itself rather than a namespace.
 */
export interface ExtractOptions {
  /**
   * Page to read. http(s) only; a bare host is upgraded to https. Loopback,
   * private, link-local and cloud-metadata hosts are rejected with a 400.
   * 1-2048 characters.
   */
  url: string;
  /**
   * Output format (default "markdown").
   *
   * - "html": the raw page, unmodified.
   * - "markdown": readability extraction - boilerplate stripped.
   * - "text": that markdown flattened to plain text.
   */
  format?: "html" | "markdown" | "text";
  /**
   * Fetch tier, and THE PRICE-BEARING PARAM (default "normal").
   *
   * - "normal": plain datacenter fetch - 1 credit.
   * - "advanced": headless browser render, for JS-built pages - 1 credit.
   * - "ultra": residential proxy, for hard bot walls - 2 credits.
   */
  mode?: "normal" | "advanced" | "ultra";
  [key: string]: unknown;
}

export class Scavio {
  readonly google: GoogleNamespace;
  readonly amazon: AmazonNamespace;
  readonly walmart: WalmartNamespace;
  readonly youtube: YouTubeNamespace;
  readonly reddit: RedditNamespace;
  readonly tiktok: TikTokNamespace;
  readonly tiktokShop: TikTokShopNamespace;
  readonly instagram: InstagramNamespace;
  readonly x: XNamespace;
  readonly linkedin: LinkedInNamespace;
  readonly threads: ThreadsNamespace;
  readonly kuaishou: KuaishouNamespace;
  readonly ebay: EbayNamespace;
  readonly target: TargetNamespace;
  readonly homeDepot: HomeDepotNamespace;
  readonly zillow: ZillowNamespace;
  readonly redfin: RedfinNamespace;
  readonly booking: BookingNamespace;
  readonly airbnb: AirbnbNamespace;
  readonly tripadvisor: TripadvisorNamespace;
  readonly yelp: YelpNamespace;
  readonly indeed: IndeedNamespace;
  readonly glassdoor: GlassdoorNamespace;
  readonly appStore: AppStoreNamespace;
  readonly googlePlay: GooglePlayNamespace;
  readonly g2: G2Namespace;
  readonly capterra: CapterraNamespace;
  readonly sec: SECNamespace;
  readonly companiesHouse: CompaniesHouseNamespace;
  readonly googleAds: GoogleAdsNamespace;
  readonly metaAds: MetaAdsNamespace;

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
    this.tiktokShop = new TikTokShopNamespace(this);
    this.instagram = new InstagramNamespace(this);
    this.x = new XNamespace(this);
    this.linkedin = new LinkedInNamespace(this);
    this.threads = new ThreadsNamespace(this);
    this.kuaishou = new KuaishouNamespace(this);
    this.ebay = new EbayNamespace(this);
    this.target = new TargetNamespace(this);
    this.homeDepot = new HomeDepotNamespace(this);
    this.zillow = new ZillowNamespace(this);
    this.redfin = new RedfinNamespace(this);
    this.booking = new BookingNamespace(this);
    this.airbnb = new AirbnbNamespace(this);
    this.tripadvisor = new TripadvisorNamespace(this);
    this.yelp = new YelpNamespace(this);
    this.indeed = new IndeedNamespace(this);
    this.glassdoor = new GlassdoorNamespace(this);
    this.appStore = new AppStoreNamespace(this);
    this.googlePlay = new GooglePlayNamespace(this);
    this.g2 = new G2Namespace(this);
    this.capterra = new CapterraNamespace(this);
    this.sec = new SECNamespace(this);
    this.companiesHouse = new CompaniesHouseNamespace(this);
    this.googleAds = new GoogleAdsNamespace(this);
    this.metaAds = new MetaAdsNamespace(this);
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

  /**
   * Read ANY web page and get it back as readability Markdown (the default),
   * plain text, or raw HTML. Returns `{ url, format, mode, content,
   * content_length }`.
   *
   * This is a core endpoint, not a platform, so it lives on the client itself:
   * `scavio.extract({ url })`, never `scavio.extract.extract()`.
   *
   * Credits are a function of `mode`, not a flat per-call constant:
   * "normal" costs 1, "advanced" costs 1, "ultra" costs 2. Billing happens
   * only on a successful extraction - a dead link, bot wall or timeout costs
   * nothing.
   *
   * Start on "normal". Move to "advanced" when the page builds its content in
   * the browser, and to "ultra" only when a bot wall blocks the other two.
   *
   * @example
   * const page = await scavio.extract({ url: "https://example.com/pricing" });
   * console.log(page.content);
   */
  async extract(options: ExtractOptions): Promise<Record<string, unknown>> {
    return this._post("/api/v1/extract", options);
  }

  async getUsage(): Promise<Record<string, unknown>> {
    return this._get("/api/v1/usage");
  }
}
