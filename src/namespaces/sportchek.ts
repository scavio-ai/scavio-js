import type { Scavio } from "../client.js";
import {
  CTC_TIMEOUT,
  type CtcBrandsOptions,
  type CtcListOptions,
  type CtcProductTarget,
  type CtcReviewSort,
  type CtcSearchOptions,
  type CtcStoreOptions,
  type CtcSuggestionsOptions,
} from "./ctc-banners.js";

// SportChek (sportchek.ca, Canada's sporting goods retailer, a Canadian Tire Corporation
// banner): 8 endpoints, 1 credit each: search, list, product, reviews, suggestions, store,
// brands, categories. English only (no language), prices in CAD. Shared rules and fields:
// ./ctc-banners.ts. Reviews: page 1 is the first 8, pages 2-4 the next 30 each (up to 98 per
// sort and star filter), no reviewer names. Not available: choosing a store for price or stock,
// stores near a postal code, customer questions, the flyer, Triangle Rewards or CT Money prices,
// price history, UPC or barcodes (the site shows none), cart or checkout. Every call raises the
// request timeout to SPORTCHEK_TIMEOUT.

/** Minimum request timeout (ms) for every sportchek call: answers take about 10-90 s. */
export const SPORTCHEK_TIMEOUT = CTC_TIMEOUT;

export type SportchekSearchOptions = CtcSearchOptions;
export type SportchekListOptions = CtcListOptions;
export type SportchekProductOptions = CtcProductTarget;
export type SportchekSuggestionsOptions = CtcSuggestionsOptions;
export type SportchekStoreOptions = CtcStoreOptions;
export type SportchekBrandsOptions = CtcBrandsOptions;

export interface SportchekReviewsOptions extends CtcProductTarget {
  /** Page 1 (default, the first 8 reviews) to 4; each later page is the next 30. */
  page?: number;
  /** Defaults to "newest". */
  sort?: CtcReviewSort;
  /** Only reviews with this many stars (1-5). */
  rating?: 1 | 2 | 3 | 4 | 5;
}

export class SportchekNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/sportchek/${path}`, options, undefined, SPORTCHEK_TIMEOUT);
  }

  /** Search by keywords or a product code: price, was_price, sale_ends, price_message, badges, colours; sorts, brand, deals and facet filters; 24 a page. */
  async search(options: SportchekSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** A category or deals page (sale, clearance, Black Friday) by path or link, with the same sorts and filters. */
  async list(options: SportchekListOptions): Promise<Record<string, unknown>> {
    return this.post("list", options);
  }

  /** One product by code or link: variants with their own price, was price, sale_ends, units_at_store (the assigned store) and units_online. */
  async product(options: SportchekProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** Customer reviews with a summary (average, count, distribution, recommended); 5 sorts and a star filter. */
  async reviews(options: SportchekReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /** Search-box suggestions for typed text: terms, top_hit, categories, brands. */
  async suggestions(options: SportchekSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /** One store by number: address, phone, coordinates, hours, special hours, curbside, up to 49 nearby stores. */
  async store(options: SportchekStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /** SportChek's brand pages: name, slug, url. */
  async brands(options: SportchekBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /** The category tree; path is the input of list(). */
  async categories(options: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }
}
