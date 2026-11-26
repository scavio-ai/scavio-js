import type { Scavio } from "../client.js";

// Notino (notino.com, the Brno-based online perfume and cosmetics store) search, product, reviews,
// category, brand, promo, brands, suggestions, stores and store endpoints; 27 storefronts in their
// own language and currency; 1 credit (gb 2), a paged, sorted or filtered list 3 (gb 4). Generated
// from the backend routes: every option and its doc mirrors the API's own request schema; an input
// the API only accepts to refuse (a 400 that says 'not offered') is left out. The server enforces
// the value rules and the one-of rules (send one of an id or a link). Every call raises the request
// timeout to NOTINO_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and
// refused inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every notino call. */
export const NOTINO_TIMEOUT = 240_000;
/** Minimum request timeout (ms) for notino.reviews(). */
export const NOTINO_REVIEWS_TIMEOUT = 250_000;

export interface NotinoSearchOptions {
  /** Search text (any language; the storefront's own language matches best). */
  query: string;
  /**
   * The storefront (default de; a product or listing link picks its own): de at ch cz sk pl hu ro
   * bg hr si ua fr be nl it es pt gr gb ie dk se fi lt lv ee. One language each (be is French, ch
   * German), its own currency (EUR, GBP, CZK, HUF, PLN, RON, UAH, DKK, SEK, CHF) and its own
   * prices. gb (notino.co.uk) costs 2 credits per call.
   */
  market?: "de" | "at" | "ch" | "cz" | "sk" | "pl" | "hu" | "ro" | "bg" | "hr" | "si" | "ua" | "fr" | "be" | "nl" | "it" | "es" | "pt" | "gr" | "gb" | "ie" | "dk" | "se" | "fi" | "lt" | "lv" | "ee";
  /** Page of 24 (1 to 500; total_pages says how deep a list goes). */
  page?: number;
  /**
   * relevance (default), bestseller, price_asc, price_desc, top_rated, newest: Notino's own sort
   * options.
   */
  sort?: "relevance" | "bestseller" | "price_asc" | "price_desc" | "top_rated" | "newest";
  /**
   * Up to 10 filter ids: facets[].values[].id of an earlier answer (brand, category, type of goods,
   * skin type, gender, offers, free delivery, new, rating). Ids of one group widen, of different
   * groups narrow, as on the site.
   */
  filters?: number[] | string;
  [key: string]: unknown;
}

export interface NotinoProductOptions {
  /**
   * A Notino product link or path (/<brand>/<product>/, or /<brand>/<product>/p-<variant id>/ for
   * one size or shade).
   */
  url?: string;
  /** A Notino order code: variants[].order_code (one size or shade). */
  order_code?: string;
  /**
   * The storefront (default de; a product or listing link picks its own): de at ch cz sk pl hu ro
   * bg hr si ua fr be nl it es pt gr gb ie dk se fi lt lv ee. One language each (be is French, ch
   * German), its own currency (EUR, GBP, CZK, HUF, PLN, RON, UAH, DKK, SEK, CHF) and its own
   * prices. gb (notino.co.uk) costs 2 credits per call.
   */
  market?: "de" | "at" | "ch" | "cz" | "sk" | "pl" | "hu" | "ro" | "bg" | "hr" | "si" | "ua" | "fr" | "be" | "nl" | "it" | "es" | "pt" | "gr" | "gb" | "ie" | "dk" | "se" | "fi" | "lt" | "lv" | "ee";
  [key: string]: unknown;
}

export interface NotinoReviewsOptions {
  /**
   * A Notino product link or path (/<brand>/<product>/, or /<brand>/<product>/p-<variant id>/ for
   * one size or shade).
   */
  url?: string;
  /** A Notino order code: variants[].order_code (one size or shade). */
  order_code?: string;
  /**
   * The storefront (default de; a product or listing link picks its own): de at ch cz sk pl hu ro
   * bg hr si ua fr be nl it es pt gr gb ie dk se fi lt lv ee. One language each (be is French, ch
   * German), its own currency (EUR, GBP, CZK, HUF, PLN, RON, UAH, DKK, SEK, CHF) and its own
   * prices. gb (notino.co.uk) costs 2 credits per call.
   */
  market?: "de" | "at" | "ch" | "cz" | "sk" | "pl" | "hu" | "ro" | "bg" | "hr" | "si" | "ua" | "fr" | "be" | "nl" | "it" | "es" | "pt" | "gr" | "gb" | "ie" | "dk" | "se" | "fi" | "lt" | "lv" | "ee";
  /**
   * newest (default), oldest, highest_rating, lowest_rating, most_helpful: the review tab's own
   * five orders.
   */
  sort?: "newest" | "oldest" | "highest_rating" | "lowest_rating" | "most_helpful";
  /** Reviews with this many stars (1-5). */
  rating?: number;
  /** Page of 8 (1 to 8). */
  page?: number;
  [key: string]: unknown;
}

export interface NotinoCategoryOptions {
  /** A Notino category path (breadcrumbs[].url, facets of type Category) or its link. */
  category: string;
  /**
   * The storefront (default de; a product or listing link picks its own): de at ch cz sk pl hu ro
   * bg hr si ua fr be nl it es pt gr gb ie dk se fi lt lv ee. One language each (be is French, ch
   * German), its own currency (EUR, GBP, CZK, HUF, PLN, RON, UAH, DKK, SEK, CHF) and its own
   * prices. gb (notino.co.uk) costs 2 credits per call.
   */
  market?: "de" | "at" | "ch" | "cz" | "sk" | "pl" | "hu" | "ro" | "bg" | "hr" | "si" | "ua" | "fr" | "be" | "nl" | "it" | "es" | "pt" | "gr" | "gb" | "ie" | "dk" | "se" | "fi" | "lt" | "lv" | "ee";
  /** Page of 24 (1 to 500; total_pages says how deep a list goes). */
  page?: number;
  /**
   * relevance (default), bestseller, price_asc, price_desc, top_rated, newest: Notino's own sort
   * options.
   */
  sort?: "relevance" | "bestseller" | "price_asc" | "price_desc" | "top_rated" | "newest";
  /**
   * Up to 10 filter ids: facets[].values[].id of an earlier answer (brand, category, type of goods,
   * skin type, gender, offers, free delivery, new, rating). Ids of one group widen, of different
   * groups narrow, as on the site.
   */
  filters?: number[] | string;
  [key: string]: unknown;
}

export interface NotinoBrandOptions {
  /** A brand: brands[].slug (e.g. dior, cerave) or its link. */
  brand: string;
  /**
   * The storefront (default de; a product or listing link picks its own): de at ch cz sk pl hu ro
   * bg hr si ua fr be nl it es pt gr gb ie dk se fi lt lv ee. One language each (be is French, ch
   * German), its own currency (EUR, GBP, CZK, HUF, PLN, RON, UAH, DKK, SEK, CHF) and its own
   * prices. gb (notino.co.uk) costs 2 credits per call.
   */
  market?: "de" | "at" | "ch" | "cz" | "sk" | "pl" | "hu" | "ro" | "bg" | "hr" | "si" | "ua" | "fr" | "be" | "nl" | "it" | "es" | "pt" | "gr" | "gb" | "ie" | "dk" | "se" | "fi" | "lt" | "lv" | "ee";
  /** Page of 24 (1 to 500; total_pages says how deep a list goes). */
  page?: number;
  /**
   * relevance (default), bestseller, price_asc, price_desc, top_rated, newest: Notino's own sort
   * options.
   */
  sort?: "relevance" | "bestseller" | "price_asc" | "price_desc" | "top_rated" | "newest";
  /**
   * Up to 10 filter ids: facets[].values[].id of an earlier answer (brand, category, type of goods,
   * skin type, gender, offers, free delivery, new, rating). Ids of one group widen, of different
   * groups narrow, as on the site.
   */
  filters?: number[] | string;
  [key: string]: unknown;
}

export interface NotinoPromoOptions {
  /**
   * A promo page path or link (default black-friday, live on every storefront in November 2026).
   */
  promo?: string;
  /**
   * The storefront (default de; a product or listing link picks its own): de at ch cz sk pl hu ro
   * bg hr si ua fr be nl it es pt gr gb ie dk se fi lt lv ee. One language each (be is French, ch
   * German), its own currency (EUR, GBP, CZK, HUF, PLN, RON, UAH, DKK, SEK, CHF) and its own
   * prices. gb (notino.co.uk) costs 2 credits per call.
   */
  market?: "de" | "at" | "ch" | "cz" | "sk" | "pl" | "hu" | "ro" | "bg" | "hr" | "si" | "ua" | "fr" | "be" | "nl" | "it" | "es" | "pt" | "gr" | "gb" | "ie" | "dk" | "se" | "fi" | "lt" | "lv" | "ee";
  /** Page of 24 (1 to 500; total_pages says how deep a list goes). */
  page?: number;
  /**
   * relevance (default), bestseller, price_asc, price_desc, top_rated, newest: Notino's own sort
   * options.
   */
  sort?: "relevance" | "bestseller" | "price_asc" | "price_desc" | "top_rated" | "newest";
  /**
   * Up to 10 filter ids: facets[].values[].id of an earlier answer (brand, category, type of goods,
   * skin type, gender, offers, free delivery, new, rating). Ids of one group widen, of different
   * groups narrow, as on the site.
   */
  filters?: number[] | string;
  [key: string]: unknown;
}

export interface NotinoBrandsOptions {
  /**
   * The storefront (default de; a product or listing link picks its own): de at ch cz sk pl hu ro
   * bg hr si ua fr be nl it es pt gr gb ie dk se fi lt lv ee. One language each (be is French, ch
   * German), its own currency (EUR, GBP, CZK, HUF, PLN, RON, UAH, DKK, SEK, CHF) and its own
   * prices. gb (notino.co.uk) costs 2 credits per call.
   */
  market?: "de" | "at" | "ch" | "cz" | "sk" | "pl" | "hu" | "ro" | "bg" | "hr" | "si" | "ua" | "fr" | "be" | "nl" | "it" | "es" | "pt" | "gr" | "gb" | "ie" | "dk" | "se" | "fi" | "lt" | "lv" | "ee";
  /** Brands whose name contains this text. */
  query?: string;
  /** Brands starting with this letter or digit. */
  letter?: string;
  /** The brands Notino's directory highlights (in bold). */
  featured_only?: boolean;
  page?: number;
  /** Brands per page, 1 to 2000 (default 500). */
  limit?: number;
  [key: string]: unknown;
}

export interface NotinoSuggestionsOptions {
  /** What the shopper has typed so far. */
  query: string;
  /**
   * The storefront (default de; a product or listing link picks its own): de at ch cz sk pl hu ro
   * bg hr si ua fr be nl it es pt gr gb ie dk se fi lt lv ee. One language each (be is French, ch
   * German), its own currency (EUR, GBP, CZK, HUF, PLN, RON, UAH, DKK, SEK, CHF) and its own
   * prices. gb (notino.co.uk) costs 2 credits per call.
   */
  market?: "de" | "at" | "ch" | "cz" | "sk" | "pl" | "hu" | "ro" | "bg" | "hr" | "si" | "ua" | "fr" | "be" | "nl" | "it" | "es" | "pt" | "gr" | "gb" | "ie" | "dk" | "se" | "fi" | "lt" | "lv" | "ee";
  [key: string]: unknown;
}

export interface NotinoStoresOptions {
  /**
   * A storefront with Notino stores and pickup points: cz, sk, pl, at, hu, ro, bg, hr (default cz).
   */
  market?: "cz" | "sk" | "pl" | "at" | "hu" | "ro" | "bg" | "hr";
  /** The stores in this city (accents and case do not matter). */
  city?: string;
  [key: string]: unknown;
}

export interface NotinoStoreOptions {
  /** stores[].store of a stores answer, or the store's link. */
  store: string;
  /**
   * A storefront with Notino stores and pickup points: cz, sk, pl, at, hu, ro, bg, hr (default cz).
   */
  market?: "cz" | "sk" | "pl" | "at" | "hu" | "ro" | "bg" | "hr";
  [key: string]: unknown;
}

export class NotinoNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = NOTINO_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/notino/${path}`, options, undefined, timeout);
  }

  /**
   * Search Notino (notino.com, the Brno-based online perfume and cosmetics store with 27 country
   * shops). Scavio fetches the public Notino page on request. Names, labels and review texts are in
   * the storefront's language, as Notino writes them; field names are English. market, shop,
   * language, currency, query, redirected_to {page_type, path, url} (Notino sends brand names and
   * some category words to that page; the list is then that page's), page_type (Category, Brand,
   * Promo), title, breadcrumbs [{name, url}], sort, page, page_size (24), total, total_pages,
   * has_more, count, currency, items (product_id, master_id, url, name, sub_name, brand,
   * annotation, image, price, currency, rrp (as shown; listings rarely carry one), unit_price
   * {value, unit, per_amount}, stock_level (Notino's stock word. Costs 1 credit (2 on gb); 3 (4 on
   * gb) when Notino answers the search with a brand or category page that is then read with the
   * page, sort or filters. credits_used in the response is the exact charge.
   */
  async search(options: NotinoSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Notino product with every variant (size, shade) by link or order code. Costs 1 credit; 2 on
   * gb (notino.co.uk). credits_used in the response is the exact charge.
   */
  async product(options: NotinoProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Customer reviews of one Notino product, 8 per page. Costs 1 credit; the newest 8 on gb 2 (4 by
   * order_code); any other page, sort or star filter 1 on every storefront. credits_used in the
   * response is the exact charge.
   */
  async reviews(options: NotinoReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options, NOTINO_REVIEWS_TIMEOUT);
  }

  /**
   * One Notino category's products by path, with page, sort and filters. Costs 1 credit (2 on gb)
   * for page 1 unsorted and unfiltered; 3 (4 on gb) for any other page, sort or filter.
   * credits_used in the response is the exact charge.
   */
  async category(options: NotinoCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One brand's products on a Notino storefront, with page, sort and filters. Costs 1 credit (2 on
   * gb) for page 1 unsorted and unfiltered; 3 (4 on gb) for any other page, sort or filter.
   * credits_used in the response is the exact charge.
   */
  async brand(options: NotinoBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * A Notino promo list (default Black Friday) with its products and the terms its banner gives.
   * Costs 1 credit (2 on gb) for page 1 unsorted and unfiltered; 3 (4 on gb) for any other page,
   * sort or filter. credits_used in the response is the exact charge.
   */
  async promo(options: NotinoPromoOptions = {}): Promise<Record<string, unknown>> {
    return this.post("promo", options);
  }

  /**
   * A Notino storefront's brand directory (about 1,800 brands on notino.de). Costs 1 credit; 2 on
   * gb (notino.co.uk). credits_used in the response is the exact charge.
   */
  async brands(options: NotinoBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /**
   * Notino's search suggestions for a partial query. Costs 1 credit; 2 on gb (notino.co.uk).
   * credits_used in the response is the exact charge.
   */
  async suggestions(options: NotinoSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Notino's stores and pickup points in one storefront (cz, sk, pl, at, hu, ro, bg, hr). Costs 1
   * credit.
   */
  async stores(options: NotinoStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One Notino store's page: market, shop, language, currency, store, url, name, description,
   * open_now, status_changes_at, services {card_payment, complaints, direct_sale, order_pickup,
   * dermo_shop}, opening_hours (7 days from today. Costs 1 credit.
   */
  async store(options: NotinoStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }
}
