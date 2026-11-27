import type { Scavio } from "../client.js";

// Abercrombie & Fitch Co. (abercrombie.com: Abercrombie & Fitch, abercrombie kids, YPB;
// hollisterco.com: Hollister, Gilly Hicks; chosen with brand) search, product, storeStock, stores,
// store, category, categories, promotions, reviews and suggestions endpoints; 16 storefronts in
// local currency, exact store units, 1 credit each (reviews without a url 2). Generated from the
// backend routes: every option and its doc mirrors the API's own request schema; an input the API
// only accepts to refuse (a 400 that says 'not offered') is left out. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to ABERCROMBIE_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and
// refused inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every abercrombie call. */
export const ABERCROMBIE_TIMEOUT = 240_000;

export interface AbercrombieSearchOptions {
  /**
   * anf (abercrombie.com: Abercrombie & Fitch, abercrombie kids, YPB; default) or hol
   * (hollisterco.com: Hollister, Gilly Hicks).
   */
  brand?: "anf" | "hol";
  /**
   * The storefront (default us): us, us_es (US in Spanish), ca, ca_fr, uk, eu (English, EUR),
   * eu_de, eu_fr, eu_es, eu_it, eu_nl, am (Hong Kong, HKD), am_zh (Hong Kong, Traditional Chinese),
   * am_ja (Japan, JPY), wd (worldwide, prices converted from USD), wd_es (worldwide in Spanish).
   */
  storefront?: "us" | "us_es" | "ca" | "ca_fr" | "uk" | "eu" | "eu_de" | "eu_fr" | "eu_es" | "eu_it" | "eu_nl" | "am" | "am_zh" | "am_ja" | "wd" | "wd_es";
  /**
   * Ship-to country on eu, eu_ storefronts and wd / wd_es (two letters, e.g. DE, SE, AU, IL). Other
   * storefronts ship to one country.
   */
  country?: string;
  /** Search keywords. */
  query: string;
  /** best_match (default), newest, price_asc, price_desc, rating or best_selling. */
  sort?: "best_match" | "newest" | "price_asc" | "price_desc" | "rating" | "best_selling";
  /**
   * Filters as <facet id>:<value> (facets[].values[].filter in answers), e.g. gender:Men's,
   * colorFamily:Black, sizes:M.
   */
  facets?: string[];
  /** Page, from 1. */
  page?: number;
  [key: string]: unknown;
}

export interface AbercrombieProductOptions {
  /**
   * anf (abercrombie.com: Abercrombie & Fitch, abercrombie kids, YPB; default) or hol
   * (hollisterco.com: Hollister, Gilly Hicks).
   */
  brand?: "anf" | "hol";
  /**
   * The storefront (default us): us, us_es (US in Spanish), ca, ca_fr, uk, eu (English, EUR),
   * eu_de, eu_fr, eu_es, eu_it, eu_nl, am (Hong Kong, HKD), am_zh (Hong Kong, Traditional Chinese),
   * am_ja (Japan, JPY), wd (worldwide, prices converted from USD), wd_es (worldwide in Spanish).
   */
  storefront?: "us" | "us_es" | "ca" | "ca_fr" | "uk" | "eu" | "eu_de" | "eu_fr" | "eu_es" | "eu_it" | "eu_nl" | "am" | "am_zh" | "am_ja" | "wd" | "wd_es";
  /**
   * Ship-to country on eu, eu_ storefronts and wd / wd_es (two letters, e.g. DE, SE, AU, IL). Other
   * storefronts ship to one country.
   */
  country?: string;
  /**
   * A product id (products[].product_id in search answers, or the number at the end of a product
   * link).
   */
  product_id: string;
  /** The product's collection id (products[].collection_id in search answers); saves a lookup. */
  collection_id?: string;
  [key: string]: unknown;
}

export interface AbercrombieStoreStockOptions {
  /**
   * anf (abercrombie.com: Abercrombie & Fitch, abercrombie kids, YPB; default) or hol
   * (hollisterco.com: Hollister, Gilly Hicks).
   */
  brand?: "anf" | "hol";
  /**
   * Store country (default US): US, CA, GB, IE, AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU,
   * IT, LV, LT, LU, MT, MC, NL, NO, PL, PT, RO, SK, SI, ES, SE, CH, JP, HK, MO, CN, AE.
   */
  country?: string;
  /** A US ZIP code (US stores). */
  zip?: string;
  /** Latitude (with longitude), instead of zip. */
  latitude?: number;
  /** Longitude (with latitude). */
  longitude?: number;
  /** Search radius (default 50). */
  radius?: number;
  /** mi (default in the US) or km (default elsewhere). */
  unit?: "mi" | "km";
  /** Stores, 1-25 (default 10), nearest first. */
  limit?: number;
  /** 1-10 SKUs (colors[].skus[].sku in product answers). */
  skus: string[];
  [key: string]: unknown;
}

export interface AbercrombieStoresOptions {
  /**
   * anf (abercrombie.com: Abercrombie & Fitch, abercrombie kids, YPB; default) or hol
   * (hollisterco.com: Hollister, Gilly Hicks).
   */
  brand?: "anf" | "hol";
  /**
   * Store country (default US): US, CA, GB, IE, AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU,
   * IT, LV, LT, LU, MT, MC, NL, NO, PL, PT, RO, SK, SI, ES, SE, CH, JP, HK, MO, CN, AE.
   */
  country?: string;
  /** A US ZIP code (US stores). */
  zip?: string;
  /** Latitude (with longitude), instead of zip. */
  latitude?: number;
  /** Longitude (with latitude). */
  longitude?: number;
  /** Search radius (default 50). */
  radius?: number;
  /** mi (default in the US) or km (default elsewhere). */
  unit?: "mi" | "km";
  /** Stores, 1-25 (default 10), nearest first. */
  limit?: number;
  [key: string]: unknown;
}

export interface AbercrombieStoreOptions {
  /**
   * anf (abercrombie.com: Abercrombie & Fitch, abercrombie kids, YPB; default) or hol
   * (hollisterco.com: Hollister, Gilly Hicks).
   */
  brand?: "anf" | "hol";
  /**
   * Store country (default US): US, CA, GB, IE, AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU,
   * IT, LV, LT, LU, MT, MC, NL, NO, PL, PT, RO, SK, SI, ES, SE, CH, JP, HK, MO, CN, AE.
   */
  country?: string;
  /** A store number (stores[].store_number). */
  store_number: string;
  [key: string]: unknown;
}

export interface AbercrombieCategoryOptions {
  /**
   * anf (abercrombie.com: Abercrombie & Fitch, abercrombie kids, YPB; default) or hol
   * (hollisterco.com: Hollister, Gilly Hicks).
   */
  brand?: "anf" | "hol";
  /**
   * The storefront (default us): us, us_es (US in Spanish), ca, ca_fr, uk, eu (English, EUR),
   * eu_de, eu_fr, eu_es, eu_it, eu_nl, am (Hong Kong, HKD), am_zh (Hong Kong, Traditional Chinese),
   * am_ja (Japan, JPY), wd (worldwide, prices converted from USD), wd_es (worldwide in Spanish).
   */
  storefront?: "us" | "us_es" | "ca" | "ca_fr" | "uk" | "eu" | "eu_de" | "eu_fr" | "eu_es" | "eu_it" | "eu_nl" | "am" | "am_zh" | "am_ja" | "wd" | "wd_es";
  /**
   * Ship-to country on eu, eu_ storefronts and wd / wd_es (two letters, e.g. DE, SE, AU, IL). Other
   * storefronts ship to one country.
   */
  country?: string;
  /** A category id from the categories endpoint (ids are per region). */
  category_id: string;
  /** best_match (default), newest, price_asc, price_desc, rating or best_selling. */
  sort?: "best_match" | "newest" | "price_asc" | "price_desc" | "rating" | "best_selling";
  /**
   * Filters as <facet id>:<value> (facets[].values[].filter in answers), e.g. gender:Men's,
   * colorFamily:Black, sizes:M.
   */
  facets?: string[];
  /** Page, from 1. */
  page?: number;
  /** Products per page, 1-90 (default 90). */
  page_size?: number;
  [key: string]: unknown;
}

export interface AbercrombieCategoriesOptions {
  /**
   * anf (abercrombie.com: Abercrombie & Fitch, abercrombie kids, YPB; default) or hol
   * (hollisterco.com: Hollister, Gilly Hicks).
   */
  brand?: "anf" | "hol";
  /**
   * The storefront (default us): us, us_es (US in Spanish), ca, ca_fr, uk, eu (English, EUR),
   * eu_de, eu_fr, eu_es, eu_it, eu_nl, am (Hong Kong, HKD), am_zh (Hong Kong, Traditional Chinese),
   * am_ja (Japan, JPY), wd (worldwide, prices converted from USD), wd_es (worldwide in Spanish).
   */
  storefront?: "us" | "us_es" | "ca" | "ca_fr" | "uk" | "eu" | "eu_de" | "eu_fr" | "eu_es" | "eu_it" | "eu_nl" | "am" | "am_zh" | "am_ja" | "wd" | "wd_es";
  /**
   * Ship-to country on eu, eu_ storefronts and wd / wd_es (two letters, e.g. DE, SE, AU, IL). Other
   * storefronts ship to one country.
   */
  country?: string;
  [key: string]: unknown;
}

export interface AbercrombiePromotionsOptions {
  /**
   * anf (abercrombie.com: Abercrombie & Fitch, abercrombie kids, YPB; default) or hol
   * (hollisterco.com: Hollister, Gilly Hicks).
   */
  brand?: "anf" | "hol";
  /**
   * The storefront (default us): us, us_es (US in Spanish), ca, ca_fr, uk, eu (English, EUR),
   * eu_de, eu_fr, eu_es, eu_it, eu_nl, am (Hong Kong, HKD), am_zh (Hong Kong, Traditional Chinese),
   * am_ja (Japan, JPY), wd (worldwide, prices converted from USD), wd_es (worldwide in Spanish).
   */
  storefront?: "us" | "us_es" | "ca" | "ca_fr" | "uk" | "eu" | "eu_de" | "eu_fr" | "eu_es" | "eu_it" | "eu_nl" | "am" | "am_zh" | "am_ja" | "wd" | "wd_es";
  /**
   * Ship-to country on eu, eu_ storefronts and wd / wd_es (two letters, e.g. DE, SE, AU, IL). Other
   * storefronts ship to one country.
   */
  country?: string;
  [key: string]: unknown;
}

export interface AbercrombieReviewsOptions {
  /**
   * anf (abercrombie.com: Abercrombie & Fitch, abercrombie kids, YPB; default) or hol
   * (hollisterco.com: Hollister, Gilly Hicks).
   */
  brand?: "anf" | "hol";
  /**
   * The storefront (default us): us, us_es (US in Spanish), ca, ca_fr, uk, eu (English, EUR),
   * eu_de, eu_fr, eu_es, eu_it, eu_nl, am (Hong Kong, HKD), am_zh (Hong Kong, Traditional Chinese),
   * am_ja (Japan, JPY), wd (worldwide, prices converted from USD), wd_es (worldwide in Spanish).
   */
  storefront?: "us" | "us_es" | "ca" | "ca_fr" | "uk" | "eu" | "eu_de" | "eu_fr" | "eu_es" | "eu_it" | "eu_nl" | "am" | "am_zh" | "am_ja" | "wd" | "wd_es";
  /**
   * Ship-to country on eu, eu_ storefronts and wd / wd_es (two letters, e.g. DE, SE, AU, IL). Other
   * storefronts ship to one country.
   */
  country?: string;
  /**
   * A product id (products[].product_id in search answers, or the number at the end of a product
   * link).
   */
  product_id: string;
  /** The product link (url in search or product answers); saves a lookup. */
  url?: string;
  [key: string]: unknown;
}

export interface AbercrombieSuggestionsOptions {
  /**
   * anf (abercrombie.com: Abercrombie & Fitch, abercrombie kids, YPB; default) or hol
   * (hollisterco.com: Hollister, Gilly Hicks).
   */
  brand?: "anf" | "hol";
  /**
   * The storefront (default us): us, us_es (US in Spanish), ca, ca_fr, uk, eu (English, EUR),
   * eu_de, eu_fr, eu_es, eu_it, eu_nl, am (Hong Kong, HKD), am_zh (Hong Kong, Traditional Chinese),
   * am_ja (Japan, JPY), wd (worldwide, prices converted from USD), wd_es (worldwide in Spanish).
   */
  storefront?: "us" | "us_es" | "ca" | "ca_fr" | "uk" | "eu" | "eu_de" | "eu_fr" | "eu_es" | "eu_it" | "eu_nl" | "am" | "am_zh" | "am_ja" | "wd" | "wd_es";
  /**
   * Ship-to country on eu, eu_ storefronts and wd / wd_es (two letters, e.g. DE, SE, AU, IL). Other
   * storefronts ship to one country.
   */
  country?: string;
  /** What the shopper has typed so far. */
  query: string;
  [key: string]: unknown;
}

export class AbercrombieNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = ABERCROMBIE_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/abercrombie/${path}`, options, undefined, timeout);
  }

  /**
   * Search products on Abercrombie & Fitch Co. (abercrombie.com and hollisterco.com: Abercrombie &
   * Fitch, abercrombie kids, Hollister, Gilly Hicks). Scavio fetches the public storefront data on
   * request. brand anf or hol; storefront us, us_es, ca, ca_fr, uk, eu, eu_de, eu_fr, eu_es, eu_it,
   * eu_nl, am, am_zh, am_ja, wd, wd_es (country picks the ship-to country on eu and wd
   * storefronts). 48 products per page with total and total_pages; 6 sorts; facets. Costs 1 credit.
   */
  async search(options: AbercrombieSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product on Abercrombie & Fitch Co. (abercrombie.com and hollisterco.com: Abercrombie &
   * Fitch, abercrombie kids, Hollister, Gilly Hicks). Scavio fetches the public storefront data on
   * request. brand anf or hol; storefront us, us_es, ca, ca_fr, uk, eu, eu_de, eu_fr, eu_es, eu_it,
   * eu_nl, am, am_zh, am_ja, wd, wd_es (country picks the ship-to country on eu and wd storefronts)
   * by product id (collection_id saves a lookup): every color with every size and length SKU. Costs
   * 1 credit.
   */
  async product(options: AbercrombieProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Store stock for 1-10 SKUs at the Abercrombie & Fitch Co. (abercrombie.com and hollisterco.com:
   * Abercrombie & Fitch, abercrombie kids, Hollister, Gilly Hicks) stores near a US ZIP or a point:
   * exact units per SKU per store and status available, backorderable (with available_date) or
   * unavailable, with each store's address, phone, distance and this week's hours (holiday hours
   * included). Scavio fetches the public store data on request. Costs 1 credit.
   */
  async storeStock(options: AbercrombieStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /** The Abercrombie & Fitch Co. (abercrombie.com and hollisterco.com. Costs 1 credit. */
  async stores(options: AbercrombieStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /** One Abercrombie & Fitch Co. (abercrombie.com and hollisterco.com. Costs 1 credit. */
  async store(options: AbercrombieStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * One category's products on Abercrombie & Fitch Co. (abercrombie.com and hollisterco.com:
   * Abercrombie & Fitch, abercrombie kids, Hollister, Gilly Hicks). Scavio fetches the public
   * storefront data on request. brand anf or hol; storefront us, us_es, ca, ca_fr, uk, eu, eu_de,
   * eu_fr, eu_es, eu_it, eu_nl, am, am_zh, am_ja, wd, wd_es (country picks the ship-to country on
   * eu and wd storefronts): 1-90 per page, 6 sorts, facets. Costs 1 credit.
   */
  async category(options: AbercrombieCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The category tree of one storefront on Abercrombie & Fitch Co. (abercrombie.com and
   * hollisterco.com. Costs 1 credit.
   */
  async categories(options: AbercrombieCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * The banner offers one storefront of Abercrombie & Fitch Co. (abercrombie.com and
   * hollisterco.com. Costs 1 credit.
   */
  async promotions(options: AbercrombiePromotionsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("promotions", options);
  }

  /**
   * The 8 newest reviews of a product on Abercrombie & Fitch Co. (abercrombie.com and
   * hollisterco.com. Costs 1 credit with the product url; 2 without it (one extra lookup).
   * credits_used in the response is the exact charge.
   */
  async reviews(options: AbercrombieReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * The search suggestions one storefront of Abercrombie & Fitch Co. (abercrombie.com and
   * hollisterco.com. Costs 1 credit.
   */
  async suggestions(options: AbercrombieSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
