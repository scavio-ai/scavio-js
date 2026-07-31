import type { Scavio } from "../client.js";

/**
 * Amazon moved to a new upstream in 2026-07 and the API now returns a
 * normalized shape instead of the old raw provider payload. Nine options went
 * with the old provider: language, currency, device, sort_by, pages,
 * category_id, merchant_id, zip_code and autoselect_variant. They are removed
 * rather than kept as no-ops - notably `sort_by`, which the marketplace was
 * verified to ignore entirely (every sort value returned the same unordered
 * set). Sending a retired option anyway still returns 200, with a top-level
 * `warnings` array naming what was ignored.
 *
 * `country` is the canonical marketplace selector; `domain` and `start_page`
 * remain as deprecated aliases because published SDK versions send them.
 */
export interface AmazonSearchOptions {
  /** Product search query (1-500 characters). */
  query: string;
  /** Marketplace country code (ISO 3166-1 alpha-2, e.g. 'us', 'gb', 'de'). Defaults to 'us'. */
  country?: string;
  /** @deprecated Amazon domain suffix ('com', 'co.uk'). Use `country` instead. */
  domain?: string;
  /** Results page, 1-based. One page per call, 1 credit each. */
  page?: number;
  /** @deprecated Alias for `page`. */
  start_page?: number;
  [key: string]: unknown;
}

export interface AmazonProductOptions {
  /** Amazon ASIN (e.g. 'B09XS7JWHH'). Sent to the API as 'query'. */
  asin: string;
  /** Marketplace country code (ISO 3166-1 alpha-2, e.g. 'us', 'gb', 'de'). Defaults to 'us'. */
  country?: string;
  /** @deprecated Amazon domain suffix ('com', 'co.uk'). Use `country` instead. */
  domain?: string;
  [key: string]: unknown;
}

export interface AmazonOffersOptions {
  /** Amazon ASIN (e.g. 'B09XS7JWHH'). Sent to the API as 'query'. */
  asin: string;
  /** Marketplace country code (ISO 3166-1 alpha-2, e.g. 'us', 'gb', 'de'). Defaults to 'us'. */
  country?: string;
  /** @deprecated Amazon domain suffix ('com', 'co.uk'). Use `country` instead. */
  domain?: string;
  [key: string]: unknown;
}

export class AmazonNamespace {
  constructor(private client: Scavio) {}

  async search(
    options: AmazonSearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/amazon/search", options);
  }

  async product(
    options: AmazonProductOptions,
  ): Promise<Record<string, unknown>> {
    const { asin, ...rest } = options;
    return this.client._post("/api/v1/amazon/product", {
      query: asin,
      ...rest,
    });
  }

  /** Every seller offer for one ASIN: price, seller, condition, shipping, and
   *  which offer holds the buy box. Page 1 only. */
  async offers(options: AmazonOffersOptions): Promise<Record<string, unknown>> {
    const { asin, ...rest } = options;
    return this.client._post("/api/v1/amazon/offers", {
      query: asin,
      ...rest,
    });
  }

  /** Supported Amazon marketplaces, as `domains` and `countries`. `languages`
   *  and `currencies` remain in the payload but are always empty: neither is a
   *  request parameter any more. */
  async options(): Promise<Record<string, unknown>> {
    return this.client._get("/api/v1/amazon/options");
  }
}
