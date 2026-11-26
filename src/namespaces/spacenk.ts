import type { Scavio } from "../client.js";

// Space NK (spacenk.com, the London-based luxury beauty retailer) search, category, brand, brands,
// product, reviews, suggestions, stores (UK) and offers endpoints; markets uk, ie, nl, au, each in
// its own currency; 1 credit each (a full listing up to 5). Generated from the backend routes:
// every option and its doc mirrors the API's own request schema; an input the API only accepts to
// refuse (a 400 that says 'not offered') is left out. The server enforces the value rules and the
// one-of rules (send one of an id or a link). Every call raises the request timeout to
// SPACENK_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused
// inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every spacenk call. */
export const SPACENK_TIMEOUT = 240_000;

export interface SpacenkSearchOptions {
  /** Keywords or a brand (required). */
  query: string;
  /**
   * Only these brands, by name as Space NK shows it (items[].brand or brands[].name, e.g. Medik8,
   * Drunk Elephant); up to 10.
   */
  brand?: string | string[];
  /** Page, 1-based (36 products a page; default 1). */
  page?: number;
  /**
   * relevance (default), best_sellers, new, our_favourites, price_high_to_low, price_low_to_high,
   * rating (highly reviewed), most_viewed, discount, brand: Space NK's own sorts.
   */
  sort?: "relevance" | "best_sellers" | "new" | "our_favourites" | "price_high_to_low" | "price_low_to_high" | "rating" | "most_viewed" | "discount" | "brand";
  /**
   * Fill all 36 products of the page in full (default false: the first 12 in full, the other 24 as
   * ids in more_product_ids). Up to 5 credits.
   */
  full?: boolean;
  /**
   * One of uk, ie, nl, au: uk (United Kingdom, GBP, default), ie (Ireland, EUR), nl (Netherlands,
   * EUR, Dutch copy), au (Australia, AUD). Not offered (400): us (Space NK's US path shows UK
   * prices), de, ca.
   */
  market?: string;
  [key: string]: unknown;
}

export interface SpacenkCategoryOptions {
  /**
   * A Space NK category id (black-friday, skincare-treatment-serum, makeup-complexion-foundation
   * ...).
   */
  category_id: string;
  /**
   * Only these brands, by name as Space NK shows it (items[].brand or brands[].name, e.g. Medik8,
   * Drunk Elephant); up to 10.
   */
  brand?: string | string[];
  /** Page, 1-based (36 products a page; default 1). */
  page?: number;
  /**
   * relevance (default), best_sellers, new, our_favourites, price_high_to_low, price_low_to_high,
   * rating (highly reviewed), most_viewed, discount, brand: Space NK's own sorts.
   */
  sort?: "relevance" | "best_sellers" | "new" | "our_favourites" | "price_high_to_low" | "price_low_to_high" | "rating" | "most_viewed" | "discount" | "brand";
  /**
   * Fill all 36 products of the page in full (default false: the first 12 in full, the other 24 as
   * ids in more_product_ids). Up to 5 credits.
   */
  full?: boolean;
  /**
   * One of uk, ie, nl, au: uk (United Kingdom, GBP, default), ie (Ireland, EUR), nl (Netherlands,
   * EUR, Dutch copy), au (Australia, AUD). Not offered (400): us (Space NK's US path shows UK
   * prices), de, ca.
   */
  market?: string;
  [key: string]: unknown;
}

export interface SpacenkBrandOptions {
  /** A brand id from brands (brands[].id, e.g. medik8, Charlotte Tilbury). */
  brand_id: string;
  /** Page, 1-based (36 products a page; default 1). */
  page?: number;
  /**
   * relevance (default), best_sellers, new, our_favourites, price_high_to_low, price_low_to_high,
   * rating (highly reviewed), most_viewed, discount, brand: Space NK's own sorts.
   */
  sort?: "relevance" | "best_sellers" | "new" | "our_favourites" | "price_high_to_low" | "price_low_to_high" | "rating" | "most_viewed" | "discount" | "brand";
  /**
   * Fill all 36 products of the page in full (default false: the first 12 in full, the other 24 as
   * ids in more_product_ids). Up to 5 credits.
   */
  full?: boolean;
  /**
   * One of uk, ie, nl, au: uk (United Kingdom, GBP, default), ie (Ireland, EUR), nl (Netherlands,
   * EUR, Dutch copy), au (Australia, AUD). Not offered (400): us (Space NK's US path shows UK
   * prices), de, ca.
   */
  market?: string;
  [key: string]: unknown;
}

export interface SpacenkBrandsOptions {
  /** Only brands under this letter (A-Z or #). */
  letter?: string;
  /**
   * One of uk, ie, nl, au: uk (United Kingdom, GBP, default), ie (Ireland, EUR), nl (Netherlands,
   * EUR, Dutch copy), au (Australia, AUD). Not offered (400): us (Space NK's US path shows UK
   * prices), de, ca.
   */
  market?: string;
  [key: string]: unknown;
}

export interface SpacenkProductOptions {
  /**
   * A Space NK product id (items[].product_id, e.g. MUK200057800) or one shade / size
   * (variants[].id, e.g. UK200057805).
   */
  product_id: string;
  /**
   * One of uk, ie, nl, au: uk (United Kingdom, GBP, default), ie (Ireland, EUR), nl (Netherlands,
   * EUR, Dutch copy), au (Australia, AUD). Not offered (400): us (Space NK's US path shows UK
   * prices), de, ca.
   */
  market?: string;
  [key: string]: unknown;
}

export interface SpacenkReviewsOptions {
  /**
   * The product id (items[].product_id or product's master_id, starting with M): reviews are kept
   * per product.
   */
  product_id: string;
  /** Page, 1-based (default 1). */
  page?: number;
  /** Reviews a page, 1-100 (default 20). */
  page_size?: number;
  /** newest (default), most_helpful, highest_rating, lowest_rating. */
  sort?: "newest" | "most_helpful" | "highest_rating" | "lowest_rating";
  /** Only reviews with these star ratings. */
  stars?: number | number[];
  /** Only reviews containing this text. */
  search?: string;
  /**
   * One of uk, ie, nl, au: uk (United Kingdom, GBP, default), ie (Ireland, EUR), nl (Netherlands,
   * EUR, Dutch copy), au (Australia, AUD). Not offered (400): us (Space NK's US path shows UK
   * prices), de, ca.
   */
  market?: string;
  [key: string]: unknown;
}

export interface SpacenkSuggestionsOptions {
  /** What a shopper has typed (required). */
  query: string;
  /**
   * One of uk, ie, nl, au: uk (United Kingdom, GBP, default), ie (Ireland, EUR), nl (Netherlands,
   * EUR, Dutch copy), au (Australia, AUD). Not offered (400): us (Space NK's US path shows UK
   * prices), de, ca.
   */
  market?: string;
  [key: string]: unknown;
}

export interface SpacenkStoresOptions {
  /**
   * A Space NK product id (items[].product_id, e.g. MUK200057800) or one shade / size
   * (variants[].id, e.g. UK200057805).
   */
  product_id: string;
  /** A full UK postcode. */
  postcode?: string;
  /** With longitude instead of postcode: a point in the UK. */
  latitude?: number;
  /** With latitude. */
  longitude?: number;
  /** Stores to return, nearest first, 1-20 (default 10). */
  limit?: number;
  /** uk only: Space NK's stores are in the UK. */
  market?: string;
  [key: string]: unknown;
}

export interface SpacenkOffersOptions {
  /** uk (default) or ie: the nl and au offers pages show the UK offers in GBP. */
  market?: string;
  [key: string]: unknown;
}

export class SpacenkNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = SPACENK_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/spacenk/${path}`, options, undefined, timeout);
  }

  /**
   * Search the products of Space NK (spacenk.com, the London-based luxury beauty retailer, owned by
   * Ulta Beauty). Scavio fetches the public page on request; Space NK has no public API. Markets uk
   * (GBP), ie (EUR), nl (EUR, Dutch copy), au (AUD), each in its own currency as Space NK prices
   * it. Keywords with paging (36 a page), Space NK's ten sorts and a brand filter. Costs 1 credit;
   * with full: true up to 5 (one more call per product filled). credits_used in the response is the
   * exact charge.
   */
  async search(options: SpacenkSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category of Space NK (spacenk.com, the London-based luxury beauty retailer, owned by Ulta
   * Beauty). Scavio fetches the public page on request; Space NK has no public API. Markets uk
   * (GBP), ie (EUR), nl (EUR, Dutch copy), au (AUD), each in its own currency as Space NK prices
   * it. By category id (black-friday is the Black Friday list), with paging, sorts and the brand
   * filter. Costs 1 credit; with full: true up to 5 (one more call per product filled).
   * credits_used in the response is the exact charge.
   */
  async category(options: SpacenkCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One brand's products on Space NK (spacenk.com, the London-based luxury beauty retailer, owned
   * by Ulta Beauty). Scavio fetches the public page on request; Space NK has no public API. Markets
   * uk (GBP), ie (EUR), nl (EUR, Dutch copy), au (AUD), each in its own currency as Space NK prices
   * it. By brand id (brands[].id), with paging and sorts. Costs 1 credit; with full: true up to 5
   * (one more call per product filled). credits_used in the response is the exact charge.
   */
  async brand(options: SpacenkBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * Every brand Space NK (spacenk.com, the London-based luxury beauty retailer, owned by Ulta
   * Beauty). Scavio fetches the public page on request; Space NK has no public API. Markets uk
   * (GBP), ie (EUR), nl (EUR, Dutch copy), au (AUD), each in its own currency as Space NK prices
   * it. lists A-Z. Costs 1 credit.
   */
  async brands(options: SpacenkBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /**
   * One product of Space NK (spacenk.com, the London-based luxury beauty retailer, owned by Ulta
   * Beauty). Scavio fetches the public page on request; Space NK has no public API. Markets uk
   * (GBP), ie (EUR), nl (EUR, Dutch copy), au (AUD), each in its own currency as Space NK prices
   * it. By product id or shade / size id. Costs 1 credit.
   */
  async product(options: SpacenkProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Customer reviews of one product on Space NK (spacenk.com, the London-based luxury beauty
   * retailer, owned by Ulta Beauty). Scavio fetches the public page on request; Space NK has no
   * public API. Markets uk (GBP), ie (EUR), nl (EUR, Dutch copy), au (AUD), each in its own
   * currency as Space NK prices it. One English review list shown on every market. Paging up to 100
   * a page, four sorts, star filter and text search. Costs 1 credit.
   */
  async reviews(options: SpacenkReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * What Space NK (spacenk.com, the London-based luxury beauty retailer, owned by Ulta Beauty).
   * Scavio fetches the public page on request; Space NK has no public API. Markets uk (GBP), ie
   * (EUR), nl (EUR, Dutch copy), au (AUD), each in its own currency as Space NK prices it. suggests
   * for what a shopper has typed. Costs 1 credit.
   */
  async suggestions(options: SpacenkSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Space NK's UK stores nearest a postcode or point, for one product, from Space NK (spacenk.com,
   * the London-based luxury beauty retailer, owned by Ulta Beauty). Scavio fetches the public page
   * on request; Space NK has no public API. Markets uk (GBP), ie (EUR), nl (EUR, Dutch copy), au
   * (AUD), each in its own currency as Space NK prices it. Costs 1 credit.
   */
  async stores(options: SpacenkStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * The gifts with purchase on the offers page of Space NK (spacenk.com, the London-based luxury
   * beauty retailer, owned by Ulta Beauty). Scavio fetches the public page on request; Space NK has
   * no public API. Markets uk (GBP), ie (EUR), nl (EUR, Dutch copy), au (AUD), each in its own
   * currency as Space NK prices it. uk or ie. Costs 1 credit.
   */
  async offers(options: SpacenkOffersOptions = {}): Promise<Record<string, unknown>> {
    return this.post("offers", options);
  }
}
