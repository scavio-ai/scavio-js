import type { Scavio } from "../client.js";
import {
  CTC_TIMEOUT,
  type CtcBrandsOptions,
  type CtcListOptions,
  type CtcProductTarget,
  type CtcSearchOptions,
  type CtcStoreOptions,
  type CtcSuggestionsOptions,
} from "./ctc-banners.js";

// Mark's (marks.com, the Canadian workwear, casual clothing and footwear retailer, a Canadian
// Tire Corporation banner; L'Equipeur in French): 8 endpoints, 1 credit each: search, list,
// product, questions, suggestions, store, brands, categories. language "fr" reads L'Equipeur
// (lequipeur.com: the same product codes and CAD prices, French titles) on search, list, product,
// brands and categories; questions, suggestions and store are English. Shared rules and fields:
// ./ctc-banners.ts. Questions: the newest 10 with answers (brand_answer flag), no asker names.
// Not available: choosing a store for price or stock, stores near a postal code, customer
// reviews, the flyer, Triangle Rewards or CT Money prices, price history, UPC or barcodes (the
// site shows none), cart or checkout. Every call raises the request timeout to MARKS_TIMEOUT.

/** Minimum request timeout (ms) for every marks call: answers take about 10-90 s. */
export const MARKS_TIMEOUT = CTC_TIMEOUT;

/** en (default, marks.com) or fr (L'Equipeur, lequipeur.com). */
export type MarksLanguage = "en" | "fr";

export interface MarksLanguageOption {
  /** en (default, marks.com) or fr (L'Equipeur: the same product codes and CAD prices, in French). */
  language?: MarksLanguage;
}

export type MarksSearchOptions = CtcSearchOptions & MarksLanguageOption;
export type MarksListOptions = CtcListOptions & MarksLanguageOption;
export type MarksProductOptions = CtcProductTarget & MarksLanguageOption;
export type MarksQuestionsOptions = CtcProductTarget;
export type MarksSuggestionsOptions = CtcSuggestionsOptions;
export type MarksStoreOptions = CtcStoreOptions;
export type MarksBrandsOptions = CtcBrandsOptions & MarksLanguageOption;
export type MarksCategoriesOptions = MarksLanguageOption & { [key: string]: unknown };

export class MarksNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/marks/${path}`, options, undefined, MARKS_TIMEOUT);
  }

  /** Search by keywords or a product code: price, was_price, sale_ends, price_message, badges, colours; sorts, brand, deals and facet filters; 24 a page; language en or fr. */
  async search(options: MarksSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** A category or deals page (sale, clearance, Black Friday) by path or link; 12 a page on category pages; language en or fr. */
  async list(options: MarksListOptions): Promise<Record<string, unknown>> {
    return this.post("list", options);
  }

  /** One product by code or link: variants with their own price, was price, sale_ends, units_at_store (the assigned store) and units_online; language en or fr. */
  async product(options: MarksProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** The newest 10 customer questions with their answers (brand_answer flag); English. */
  async questions(options: MarksQuestionsOptions): Promise<Record<string, unknown>> {
    return this.post("questions", options);
  }

  /** Search-box suggestions for typed text: terms, top_hit, categories, brands. */
  async suggestions(options: MarksSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /** One store by number: address, phone, coordinates, hours, special hours, curbside, up to 49 nearby stores. */
  async store(options: MarksStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /** Mark's brand pages: name, slug, url; language en or fr. */
  async brands(options: MarksBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /** The category tree; path is the input of list(); language en or fr. */
  async categories(options: MarksCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }
}
