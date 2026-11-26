import type { Scavio } from "../client.js";

// Lookfantastic (lookfantastic.com, THG's beauty retailer with 10 country sites) search, list,
// product, suggestions, offers, brands and categories endpoints; market (10 sites) and currency on
// every method, 1 credit each. Generated from the backend routes: every option and its doc mirrors
// the API's own request schema; an input the API only accepts to refuse (a 400 that says 'not
// offered') is left out. The server enforces the value rules and the one-of rules (send one of an
// id or a link). Every call raises the request timeout to LOOKFANTASTIC_TIMEOUT and never lowers a
// longer client timeout. Failed upstream calls and refused inputs are not charged; a not-found is
// charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every lookfantastic call. */
export const LOOKFANTASTIC_TIMEOUT = 240_000;

export interface LookfantasticSearchOptions {
  /**
   * Keywords (in the site's language) or a Lookfantastic SKU. A keyword Lookfantastic maps to a
   * page (a brand, a category, many generic terms) returns that page's products, with
   * resolved_from.
   */
  q: string;
  /** Page (default 1). At most 10,000 positions (page x page_size). */
  page?: number;
  /** Products per page (1-40, default 40). */
  page_size?: number;
  /**
   * relevance (default), popularity, price_low, price_high, name, newest or discount (highest
   * percent off first): Lookfantastic's sort menu.
   */
  sort?: "relevance" | "popularity" | "price_low" | "price_high" | "name" | "newest" | "discount";
  /**
   * Brand, as the site names it (one or a list; exact, e.g. CeraVe):
   * facets[filter=brand].options[].value.
   */
  brand?: string | string[];
  /**
   * Skin type as the site lists it (one or a list), e.g. Dry, Oily, Sensitive (in the site's
   * language).
   */
  skin_type?: string | string[];
  /** Skincare concern as the site lists it (one or a list), e.g. Anti-Ageing, Dehydration. */
  concern?: string | string[];
  /** SPF band as the site lists it (one or a list), e.g. SPF 30+, SPF 50+. */
  spf?: string | string[];
  /**
   * Key ingredient as the site lists it (one or a list), e.g. Retinol, Hyaluronic Acid,
   * Niacinamide.
   */
  key_ingredient?: string | string[];
  /** Formulation as the site lists it (one or a list), e.g. Vegan, Fragrance Free, Alcohol Free. */
  formulation?: string | string[];
  /**
   * Any other of the site's filters, as facets[] give them (with include_facets): {facet
   * (facets[].facet), value (options[].value; one or a list)}, up to 10. Facet names carry the
   * site's language (de_ on lookfantastic.de).
   */
  filters?: Array<{ facet: string; value: string | string[] }>;
  /** Lowest price, in the currency asked. */
  min_price?: number;
  /** Highest price, in the currency asked. */
  max_price?: number;
  /** Lowest average star rating (1-5). */
  min_rating?: number;
  /** Lowest percent off Lookfantastic's RRP (0-100). */
  min_discount?: number;
  /** Highest percent off Lookfantastic's RRP (0-100). */
  max_discount?: number;
  /** Also return Lookfantastic's filter counts for the results (facets). Still 1 credit. */
  include_facets?: boolean;
  /**
   * Lookfantastic's site to read (default gb): gb (UK and international site (lookfantastic.com, 22
   * currencies); currencies GBP, USD, EUR, AUD, CAD, CHF, SEK, DKK, NOK, JPY, KRW, HKD, SGD, AED,
   * SAR, ILS, NZD, CNY, MYR, TWD, THB, IDR, default GBP); de (Germany (lookfantastic.de); EUR); fr
   * (France (lookfantastic.fr); EUR); es (Spain (lookfantastic.es); EUR); it (Italy
   * (lookfantastic.it); EUR); nl (Netherlands (lookfantastic.nl); EUR); pl (Poland
   * (lookfantastic.pl); currencies PLN, EUR, default PLN); at (Austria (lookfantastic.at); EUR); ie
   * (Ireland (lookfantastic.ie); EUR); eu (EU site (eu.lookfantastic.com, English, euro prices of
   * its own); EUR). The site's host name works too. Anything else is a 400, not charged.
   */
  market?: string;
  /**
   * The currency, as the site's own currency selector offers it for that site (default: the site's
   * own). A currency the site does not offer is a 400, not charged (the site would answer in its
   * default currency).
   */
  currency?: string;
  [key: string]: unknown;
}

export interface LookfantasticListOptions {
  /**
   * A Lookfantastic list page: a category, brand (/brands/cerave), sale or offer page (Black
   * Friday), the path of its /c/ link. Paths come from categories, brands and offers (list_path).
   */
  path?: string;
  /** A Lookfantastic list page link (https://www.lookfantastic.com/c/<page>/) instead of path. */
  url?: string;
  /** Page (default 1). At most 10,000 positions (page x page_size). */
  page?: number;
  /** Products per page (1-200, default 60). */
  page_size?: number;
  /**
   * relevance (default), popularity, price_low, price_high, name, newest or discount (highest
   * percent off first): Lookfantastic's sort menu.
   */
  sort?: "relevance" | "popularity" | "price_low" | "price_high" | "name" | "newest" | "discount";
  /**
   * Brand, as the site names it (one or a list; exact, e.g. CeraVe):
   * facets[filter=brand].options[].value.
   */
  brand?: string | string[];
  /**
   * Skin type as the site lists it (one or a list), e.g. Dry, Oily, Sensitive (in the site's
   * language).
   */
  skin_type?: string | string[];
  /** Skincare concern as the site lists it (one or a list), e.g. Anti-Ageing, Dehydration. */
  concern?: string | string[];
  /** SPF band as the site lists it (one or a list), e.g. SPF 30+, SPF 50+. */
  spf?: string | string[];
  /**
   * Key ingredient as the site lists it (one or a list), e.g. Retinol, Hyaluronic Acid,
   * Niacinamide.
   */
  key_ingredient?: string | string[];
  /** Formulation as the site lists it (one or a list), e.g. Vegan, Fragrance Free, Alcohol Free. */
  formulation?: string | string[];
  /**
   * Any other of the site's filters, as facets[] give them (with include_facets): {facet
   * (facets[].facet), value (options[].value; one or a list)}, up to 10. Facet names carry the
   * site's language (de_ on lookfantastic.de).
   */
  filters?: Array<{ facet: string; value: string | string[] }>;
  /** Lowest price, in the currency asked. */
  min_price?: number;
  /** Highest price, in the currency asked. */
  max_price?: number;
  /** Lowest average star rating (1-5). */
  min_rating?: number;
  /** Lowest percent off Lookfantastic's RRP (0-100). */
  min_discount?: number;
  /** Highest percent off Lookfantastic's RRP (0-100). */
  max_discount?: number;
  /** Also return Lookfantastic's filter counts for the results (facets). Still 1 credit. */
  include_facets?: boolean;
  /**
   * Lookfantastic's site to read (default gb): gb (UK and international site (lookfantastic.com, 22
   * currencies); currencies GBP, USD, EUR, AUD, CAD, CHF, SEK, DKK, NOK, JPY, KRW, HKD, SGD, AED,
   * SAR, ILS, NZD, CNY, MYR, TWD, THB, IDR, default GBP); de (Germany (lookfantastic.de); EUR); fr
   * (France (lookfantastic.fr); EUR); es (Spain (lookfantastic.es); EUR); it (Italy
   * (lookfantastic.it); EUR); nl (Netherlands (lookfantastic.nl); EUR); pl (Poland
   * (lookfantastic.pl); currencies PLN, EUR, default PLN); at (Austria (lookfantastic.at); EUR); ie
   * (Ireland (lookfantastic.ie); EUR); eu (EU site (eu.lookfantastic.com, English, euro prices of
   * its own); EUR). The site's host name works too. Anything else is a 400, not charged.
   */
  market?: string;
  /**
   * The currency, as the site's own currency selector offers it for that site (default: the site's
   * own). A currency the site does not offer is a 400, not charged (the site would answer in its
   * default currency).
   */
  currency?: string;
  [key: string]: unknown;
}

export interface LookfantasticProductOptions {
  /**
   * A Lookfantastic SKU (items[].sku or variants[].sku; SKUs are the same on every Lookfantastic
   * site).
   */
  sku?: string | number;
  /**
   * A Lookfantastic product link (https://www.lookfantastic.com/p/<name>/<sku>/) instead of sku.
   * The market still comes from market.
   */
  url?: string;
  /**
   * Lookfantastic's site to read (default gb): gb (UK and international site (lookfantastic.com, 22
   * currencies); currencies GBP, USD, EUR, AUD, CAD, CHF, SEK, DKK, NOK, JPY, KRW, HKD, SGD, AED,
   * SAR, ILS, NZD, CNY, MYR, TWD, THB, IDR, default GBP); de (Germany (lookfantastic.de); EUR); fr
   * (France (lookfantastic.fr); EUR); es (Spain (lookfantastic.es); EUR); it (Italy
   * (lookfantastic.it); EUR); nl (Netherlands (lookfantastic.nl); EUR); pl (Poland
   * (lookfantastic.pl); currencies PLN, EUR, default PLN); at (Austria (lookfantastic.at); EUR); ie
   * (Ireland (lookfantastic.ie); EUR); eu (EU site (eu.lookfantastic.com, English, euro prices of
   * its own); EUR). The site's host name works too. Anything else is a 400, not charged.
   */
  market?: string;
  /**
   * The currency, as the site's own currency selector offers it for that site (default: the site's
   * own). A currency the site does not offer is a 400, not charged (the site would answer in its
   * default currency).
   */
  currency?: string;
  [key: string]: unknown;
}

export interface LookfantasticSuggestionsOptions {
  /** The text typed so far. */
  q: string;
  /**
   * Lookfantastic's site to read (default gb): gb (UK and international site (lookfantastic.com, 22
   * currencies); currencies GBP, USD, EUR, AUD, CAD, CHF, SEK, DKK, NOK, JPY, KRW, HKD, SGD, AED,
   * SAR, ILS, NZD, CNY, MYR, TWD, THB, IDR, default GBP); de (Germany (lookfantastic.de); EUR); fr
   * (France (lookfantastic.fr); EUR); es (Spain (lookfantastic.es); EUR); it (Italy
   * (lookfantastic.it); EUR); nl (Netherlands (lookfantastic.nl); EUR); pl (Poland
   * (lookfantastic.pl); currencies PLN, EUR, default PLN); at (Austria (lookfantastic.at); EUR); ie
   * (Ireland (lookfantastic.ie); EUR); eu (EU site (eu.lookfantastic.com, English, euro prices of
   * its own); EUR). The site's host name works too. Anything else is a 400, not charged.
   */
  market?: string;
  /**
   * The currency, as the site's own currency selector offers it for that site (default: the site's
   * own). A currency the site does not offer is a 400, not charged (the site would answer in its
   * default currency).
   */
  currency?: string;
  [key: string]: unknown;
}

export interface LookfantasticOffersOptions {
  /**
   * Lookfantastic's site to read (default gb): gb (UK and international site (lookfantastic.com, 22
   * currencies); currencies GBP, USD, EUR, AUD, CAD, CHF, SEK, DKK, NOK, JPY, KRW, HKD, SGD, AED,
   * SAR, ILS, NZD, CNY, MYR, TWD, THB, IDR, default GBP); de (Germany (lookfantastic.de); EUR); fr
   * (France (lookfantastic.fr); EUR); es (Spain (lookfantastic.es); EUR); it (Italy
   * (lookfantastic.it); EUR); nl (Netherlands (lookfantastic.nl); EUR); pl (Poland
   * (lookfantastic.pl); currencies PLN, EUR, default PLN); at (Austria (lookfantastic.at); EUR); ie
   * (Ireland (lookfantastic.ie); EUR); eu (EU site (eu.lookfantastic.com, English, euro prices of
   * its own); EUR). The site's host name works too. Anything else is a 400, not charged.
   */
  market?: string;
  /**
   * The currency, as the site's own currency selector offers it for that site (default: the site's
   * own). A currency the site does not offer is a 400, not charged (the site would answer in its
   * default currency).
   */
  currency?: string;
  [key: string]: unknown;
}

export interface LookfantasticBrandsOptions {
  /** Optional: only brands under this letter (A-Z, or 0-9). */
  letter?: string;
  /**
   * Lookfantastic's site to read (default gb): gb (UK and international site (lookfantastic.com, 22
   * currencies); currencies GBP, USD, EUR, AUD, CAD, CHF, SEK, DKK, NOK, JPY, KRW, HKD, SGD, AED,
   * SAR, ILS, NZD, CNY, MYR, TWD, THB, IDR, default GBP); de (Germany (lookfantastic.de); EUR); fr
   * (France (lookfantastic.fr); EUR); es (Spain (lookfantastic.es); EUR); it (Italy
   * (lookfantastic.it); EUR); nl (Netherlands (lookfantastic.nl); EUR); pl (Poland
   * (lookfantastic.pl); currencies PLN, EUR, default PLN); at (Austria (lookfantastic.at); EUR); ie
   * (Ireland (lookfantastic.ie); EUR); eu (EU site (eu.lookfantastic.com, English, euro prices of
   * its own); EUR). The site's host name works too. Anything else is a 400, not charged.
   */
  market?: string;
  /**
   * The currency, as the site's own currency selector offers it for that site (default: the site's
   * own). A currency the site does not offer is a 400, not charged (the site would answer in its
   * default currency).
   */
  currency?: string;
  [key: string]: unknown;
}

export interface LookfantasticCategoriesOptions {
  /**
   * Lookfantastic's site to read (default gb): gb (UK and international site (lookfantastic.com, 22
   * currencies); currencies GBP, USD, EUR, AUD, CAD, CHF, SEK, DKK, NOK, JPY, KRW, HKD, SGD, AED,
   * SAR, ILS, NZD, CNY, MYR, TWD, THB, IDR, default GBP); de (Germany (lookfantastic.de); EUR); fr
   * (France (lookfantastic.fr); EUR); es (Spain (lookfantastic.es); EUR); it (Italy
   * (lookfantastic.it); EUR); nl (Netherlands (lookfantastic.nl); EUR); pl (Poland
   * (lookfantastic.pl); currencies PLN, EUR, default PLN); at (Austria (lookfantastic.at); EUR); ie
   * (Ireland (lookfantastic.ie); EUR); eu (EU site (eu.lookfantastic.com, English, euro prices of
   * its own); EUR). The site's host name works too. Anything else is a 400, not charged.
   */
  market?: string;
  /**
   * The currency, as the site's own currency selector offers it for that site (default: the site's
   * own). A currency the site does not offer is a 400, not charged (the site would answer in its
   * default currency).
   */
  currency?: string;
  [key: string]: unknown;
}

export class LookfantasticNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = LOOKFANTASTIC_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/lookfantastic/${path}`, options, undefined, timeout);
  }

  /**
   * Search the catalogue of Lookfantastic (lookfantastic.com, THG's beauty retailer with 10 country
   * sites). Scavio fetches the public Lookfantastic page on request, for the site and currency
   * asked (10 sites: www.lookfantastic.com, www.lookfantastic.de, www.lookfantastic.fr,
   * www.lookfantastic.es, www.lookfantastic.it, www.lookfantastic.nl, www.lookfantastic.pl,
   * www.lookfantastic.at, www.lookfantastic.ie, eu.lookfantastic.com); Lookfantastic has no public
   * API (its product feeds are for approved affiliate publishers only). Keywords or a SKU, sorted
   * (relevance, popularity, price, name, newest, discount) and filtered (brand, skin type, concern,
   * spf, key ingredient, formulation, price range, minimum rating, discount range, and any of the
   * site's filters), up to 40 a page. Costs 1 credit.
   */
  async search(options: LookfantasticSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * The products of any Lookfantastic list page by path or link: a category, brand
   * (/brands/cerave), sale or offer page (Black Friday: /black-friday), sorted (relevance,
   * popularity, price, name, newest, discount) and filtered (brand, skin type, concern, spf, key
   * ingredient, formulation, price range, minimum rating, discount range, and any of the site's
   * filters), up to 200 a page. An editorial page without a product list is listed through its
   * view-all page (listed_path). Costs 1 credit.
   */
  async list(options: LookfantasticListOptions): Promise<Record<string, unknown>> {
    return this.post("list", options);
  }

  /** One Lookfantastic product by SKU or link, for the site and currency asked. Costs 1 credit. */
  async product(options: LookfantasticProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Lookfantastic's search-box suggestions for typed text, in the site's language. Costs 1 credit.
   */
  async suggestions(options: LookfantasticSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /** Lookfantastic's current offers as its voucher-codes page lists them. Costs 1 credit. */
  async offers(options: LookfantasticOffersOptions = {}): Promise<Record<string, unknown>> {
    return this.post("offers", options);
  }

  /** Lookfantastic's A-Z brand directory for the site asked. Costs 1 credit. */
  async brands(options: LookfantasticBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /**
   * Lookfantastic's category tree as the site navigation shows it, in the site's language. Costs 1
   * credit.
   */
  async categories(options: LookfantasticCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }
}
