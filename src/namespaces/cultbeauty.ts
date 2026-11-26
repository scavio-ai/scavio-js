import type { Scavio } from "../client.js";

// Cult Beauty (cultbeauty.co.uk, THG's beauty retailer) search, list, product, suggestions, offers,
// brands and categories endpoints; market gb or intl and currency (12) on every method, 1 credit
// each. Generated from the backend routes: every option and its doc mirrors the API's own request
// schema; an input the API only accepts to refuse (a 400 that says 'not offered') is left out. The
// server enforces the value rules and the one-of rules (send one of an id or a link). Every call
// raises the request timeout to CULTBEAUTY_TIMEOUT and never lowers a longer client timeout. Failed
// upstream calls and refused inputs are not charged; a not-found is charged (credits_used is what
// was charged).

/** Minimum request timeout (ms) for every cultbeauty call. */
export const CULTBEAUTY_TIMEOUT = 240_000;

export interface CultbeautySearchOptions {
  /**
   * Keywords (in the site's language) or a Cult Beauty SKU. A keyword Cult Beauty maps to a page (a
   * brand, a category, many generic terms) returns that page's products, with resolved_from.
   */
  q: string;
  /** Page (default 1). At most 10,000 positions (page x page_size). */
  page?: number;
  /** Products per page (1-40, default 40). */
  page_size?: number;
  /**
   * relevance (default), popularity, price_low, price_high, name, newest or discount (highest
   * percent off first): Cult Beauty's sort menu.
   */
  sort?: "relevance" | "popularity" | "price_low" | "price_high" | "name" | "newest" | "discount";
  /**
   * Brand, as Cult Beauty names it (one or a list; exact, e.g. CeraVe):
   * facets[filter=brand].options[].value.
   */
  brand?: string | string[];
  /** Skin type as Cult Beauty lists it (one or a list), e.g. Dry, Oily, Sensitive. */
  skin_type?: string | string[];
  /** Skin concern as Cult Beauty lists it (one or a list), e.g. Anti-Ageing, Dry, Dullness. */
  concern?: string | string[];
  /** SPF content as Cult Beauty lists it (one or a list), e.g. No SPF, SPF 15+, SPF 30+. */
  spf?: string | string[];
  /** Key ingredient as Cult Beauty lists it (one or a list), e.g. Retinol, Hyaluronic Acid. */
  key_ingredient?: string | string[];
  /** Formulation as Cult Beauty lists it (one or a list), e.g. Vegan, Alcohol Free. */
  formulation?: string | string[];
  /** A brand's product range as Cult Beauty lists it (one or a list). */
  range?: string | string[];
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
  /** Lowest percent off Cult Beauty's RRP (0-100). */
  min_discount?: number;
  /** Highest percent off Cult Beauty's RRP (0-100). */
  max_discount?: number;
  /** Also return Cult Beauty's filter counts for the results (facets). Still 1 credit. */
  include_facets?: boolean;
  /**
   * Cult Beauty's site to read (default gb): gb (UK site (cultbeauty.co.uk); currencies GBP, EUR,
   * USD, AUD, CHF, AED, SAR, ILS, HKD, SGD, JPY, CNY, default GBP); intl (International site
   * (cultbeauty.com); currencies EUR, GBP, USD, AUD, CHF, AED, SAR, ILS, HKD, SGD, JPY, CNY,
   * default EUR). The site's host name works too. Anything else is a 400, not charged.
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

export interface CultbeautyListOptions {
  /**
   * A Cult Beauty list page: a category, brand (/brands/cerave), sale or offer page (Black Friday),
   * the path of its /c/ link. Paths come from categories, brands and offers (list_path).
   */
  path?: string;
  /** A Cult Beauty list page link (https://www.cultbeauty.co.uk/c/<page>/) instead of path. */
  url?: string;
  /** Page (default 1). At most 10,000 positions (page x page_size). */
  page?: number;
  /** Products per page (1-200, default 60). */
  page_size?: number;
  /**
   * relevance (default), popularity, price_low, price_high, name, newest or discount (highest
   * percent off first): Cult Beauty's sort menu.
   */
  sort?: "relevance" | "popularity" | "price_low" | "price_high" | "name" | "newest" | "discount";
  /**
   * Brand, as Cult Beauty names it (one or a list; exact, e.g. CeraVe):
   * facets[filter=brand].options[].value.
   */
  brand?: string | string[];
  /** Skin type as Cult Beauty lists it (one or a list), e.g. Dry, Oily, Sensitive. */
  skin_type?: string | string[];
  /** Skin concern as Cult Beauty lists it (one or a list), e.g. Anti-Ageing, Dry, Dullness. */
  concern?: string | string[];
  /** SPF content as Cult Beauty lists it (one or a list), e.g. No SPF, SPF 15+, SPF 30+. */
  spf?: string | string[];
  /** Key ingredient as Cult Beauty lists it (one or a list), e.g. Retinol, Hyaluronic Acid. */
  key_ingredient?: string | string[];
  /** Formulation as Cult Beauty lists it (one or a list), e.g. Vegan, Alcohol Free. */
  formulation?: string | string[];
  /** A brand's product range as Cult Beauty lists it (one or a list). */
  range?: string | string[];
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
  /** Lowest percent off Cult Beauty's RRP (0-100). */
  min_discount?: number;
  /** Highest percent off Cult Beauty's RRP (0-100). */
  max_discount?: number;
  /** Also return Cult Beauty's filter counts for the results (facets). Still 1 credit. */
  include_facets?: boolean;
  /**
   * Cult Beauty's site to read (default gb): gb (UK site (cultbeauty.co.uk); currencies GBP, EUR,
   * USD, AUD, CHF, AED, SAR, ILS, HKD, SGD, JPY, CNY, default GBP); intl (International site
   * (cultbeauty.com); currencies EUR, GBP, USD, AUD, CHF, AED, SAR, ILS, HKD, SGD, JPY, CNY,
   * default EUR). The site's host name works too. Anything else is a 400, not charged.
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

export interface CultbeautyProductOptions {
  /**
   * A Cult Beauty SKU (items[].sku or variants[].sku; SKUs are the same on every Cult Beauty site).
   */
  sku?: string | number;
  /**
   * A Cult Beauty product link (https://www.cultbeauty.co.uk/p/<name>/<sku>/) instead of sku. The
   * market still comes from market.
   */
  url?: string;
  /**
   * Cult Beauty's site to read (default gb): gb (UK site (cultbeauty.co.uk); currencies GBP, EUR,
   * USD, AUD, CHF, AED, SAR, ILS, HKD, SGD, JPY, CNY, default GBP); intl (International site
   * (cultbeauty.com); currencies EUR, GBP, USD, AUD, CHF, AED, SAR, ILS, HKD, SGD, JPY, CNY,
   * default EUR). The site's host name works too. Anything else is a 400, not charged.
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

export interface CultbeautySuggestionsOptions {
  /** The text typed so far. */
  q: string;
  /**
   * Cult Beauty's site to read (default gb): gb (UK site (cultbeauty.co.uk); currencies GBP, EUR,
   * USD, AUD, CHF, AED, SAR, ILS, HKD, SGD, JPY, CNY, default GBP); intl (International site
   * (cultbeauty.com); currencies EUR, GBP, USD, AUD, CHF, AED, SAR, ILS, HKD, SGD, JPY, CNY,
   * default EUR). The site's host name works too. Anything else is a 400, not charged.
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

export interface CultbeautyOffersOptions {
  /**
   * Cult Beauty's site to read (default gb): gb (UK site (cultbeauty.co.uk); currencies GBP, EUR,
   * USD, AUD, CHF, AED, SAR, ILS, HKD, SGD, JPY, CNY, default GBP); intl (International site
   * (cultbeauty.com); currencies EUR, GBP, USD, AUD, CHF, AED, SAR, ILS, HKD, SGD, JPY, CNY,
   * default EUR). The site's host name works too. Anything else is a 400, not charged.
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

export interface CultbeautyBrandsOptions {
  /** Optional: only brands under this letter (A-Z, or 0-9). */
  letter?: string;
  /**
   * Cult Beauty's site to read (default gb): gb (UK site (cultbeauty.co.uk); currencies GBP, EUR,
   * USD, AUD, CHF, AED, SAR, ILS, HKD, SGD, JPY, CNY, default GBP); intl (International site
   * (cultbeauty.com); currencies EUR, GBP, USD, AUD, CHF, AED, SAR, ILS, HKD, SGD, JPY, CNY,
   * default EUR). The site's host name works too. Anything else is a 400, not charged.
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

export interface CultbeautyCategoriesOptions {
  /**
   * Cult Beauty's site to read (default gb): gb (UK site (cultbeauty.co.uk); currencies GBP, EUR,
   * USD, AUD, CHF, AED, SAR, ILS, HKD, SGD, JPY, CNY, default GBP); intl (International site
   * (cultbeauty.com); currencies EUR, GBP, USD, AUD, CHF, AED, SAR, ILS, HKD, SGD, JPY, CNY,
   * default EUR). The site's host name works too. Anything else is a 400, not charged.
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

export class CultbeautyNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = CULTBEAUTY_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/cultbeauty/${path}`, options, undefined, timeout);
  }

  /**
   * Search the catalogue of Cult Beauty (cultbeauty.co.uk, THG's beauty retailer). Scavio fetches
   * the public Cult Beauty page on request, for the site and currency asked (2 sites:
   * www.cultbeauty.co.uk, www.cultbeauty.com); Cult Beauty has no public API (its product feeds are
   * for approved affiliate publishers only). Keywords or a SKU, sorted (relevance, popularity,
   * price, name, newest, discount) and filtered (brand, skin type, concern, spf, key ingredient,
   * formulation, range, price range, minimum rating, discount range, and any of the site's
   * filters), up to 40 a page. A keyword Cult Beauty maps to one of its pages returns that page's
   * products, as Cult Beauty's own search does, with resolved_from {type (brand, category, landing
   * or product), path, listed_path, url, title, sku}. Costs 1 credit.
   */
  async search(options: CultbeautySearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * The products of any Cult Beauty list page by path or link: a category, brand (/brands/cerave),
   * sale or offer page (Black Friday: /black-friday-cyber-monday), sorted (relevance, popularity,
   * price, name, newest, discount) and filtered (brand, skin type, concern, spf, key ingredient,
   * formulation, range, price range, minimum rating, discount range, and any of the site's
   * filters), up to 200 a page. An editorial page without a product list is listed through its
   * shop-all page (listed_path). Costs 1 credit.
   */
  async list(options: CultbeautyListOptions): Promise<Record<string, unknown>> {
    return this.post("list", options);
  }

  /** One Cult Beauty product by SKU or link, for the site and currency asked. Costs 1 credit. */
  async product(options: CultbeautyProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Cult Beauty's search-box suggestions for typed text, in the site's language. Costs 1 credit.
   */
  async suggestions(options: CultbeautySuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /** Cult Beauty's current offers as its voucher-codes page lists them. Costs 1 credit. */
  async offers(options: CultbeautyOffersOptions = {}): Promise<Record<string, unknown>> {
    return this.post("offers", options);
  }

  /** Cult Beauty's A-Z brand directory for the site asked. Costs 1 credit. */
  async brands(options: CultbeautyBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /**
   * Cult Beauty's category tree as the site navigation shows it, in the site's language. Costs 1
   * credit.
   */
  async categories(options: CultbeautyCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }
}
