import type { Scavio } from "../client.js";

// Vinted: 9 endpoints across 27 Vinted country sites, 1 credit each.
//
// Every method takes an optional country (fr when omitted, on the server).
// Category, condition and filter names come back in the site's language. Every
// site can show listings from sellers in other countries, priced in the site's
// currency after conversion; the EU sites share one cross-border pool.
// product() takes item_id or url (the server enforces one), and returns the
// SELLER's own price and currency.
// search() needs a query unless category_id or brand_ids is given. Every call
// raises the request timeout to VINTED_TIMEOUT when the client's is shorter.

/** Minimum request timeout (ms) for every vinted call. */
export const VINTED_TIMEOUT = 120_000;

/**
 * Vinted country site: fr (default), be, lu, es, nl, lt, de, at, it, uk
 * (vinted.co.uk), pt, us (vinted.com), cz, sk, pl, se, ro, hu, dk, fi, hr, gr,
 * ie, ee, lv, si, au (vinted.com.au). The EU sites are priced in EUR, or CZK,
 * PLN, SEK, RON, HUF, DKK; uk is GBP, us USD and au AUD.
 */
export type VintedCountry =
  | "fr"
  | "be"
  | "lu"
  | "es"
  | "nl"
  | "lt"
  | "de"
  | "at"
  | "it"
  | "uk"
  | "pt"
  | "us"
  | "cz"
  | "sk"
  | "pl"
  | "se"
  | "ro"
  | "hu"
  | "dk"
  | "fi"
  | "hr"
  | "gr"
  | "ie"
  | "ee"
  | "lv"
  | "si"
  | "au";

/**
 * relevance (default), newest_first, price_low_to_high or price_high_to_low.
 * Price sorts rank loosely matching items too (very cheap or
 * placeholder-priced listings), so pair them with a category or price range.
 */
export type VintedSearchSort = "relevance" | "newest_first" | "price_low_to_high" | "price_high_to_low";

/** newest_first (default), price_low_to_high or relevance. */
export type VintedSellerProductsSort = "newest_first" | "price_low_to_high" | "relevance";

/** size, status (condition), color or material. */
export type VintedFilterCode = "size" | "status" | "color" | "material";

/** Ids as an array or a comma-separated string, up to 20. */
export type VintedIdList = Array<number | string> | string;

export interface VintedSearchOptions {
  country?: VintedCountry;
  /** Search keywords, e.g. "barbour jacket". Optional when category_id or brand_ids is given. */
  query?: string;
  /** Only this category and its subcategories, by id from categories() (1907 is Women > Clothing > Outerwear > Coats). */
  category_id?: number | string;
  /** Only these brands, by id from brands() (Nike 53, Levi's 10, Barbour 46805). */
  brand_ids?: VintedIdList;
  /** Only these conditions: 6 New with tags, 1 New without tags, 2 Very good, 3 Good, 4 Satisfactory. */
  status_ids?: VintedIdList;
  /** Only these sizes, by option id from filters({ filter: "size" }) (4 is women's M / UK 12-14 / US 8-10). */
  size_ids?: VintedIdList;
  /** Only these colors, by option id from filters({ filter: "color" }) (1 is black). */
  color_ids?: VintedIdList;
  /** Only these materials, by option id from filters({ filter: "material" }) (123 is cashmere). */
  material_ids?: VintedIdList;
  /** Minimum item price, in the country site's currency. */
  price_from?: number;
  /** Maximum item price, in the country site's currency. */
  price_to?: number;
  sort?: VintedSearchSort;
  /** Results page, 1-10 (Vinted serves at most 10 pages of 96). Defaults to 1. */
  page?: number;
  [key: string]: unknown;
}

export interface VintedProductOptions {
  country?: VintedCountry;
  /** Vinted item id (a search result's id, the number after /items/ in a Vinted URL), e.g. 10671938315. Pass item_id or url. */
  item_id?: number | string;
  /** A Vinted item URL on any country site. Its own site is used (and echoed as country), whatever country says. */
  url?: string;
  [key: string]: unknown;
}

export interface VintedSellerOptions {
  country?: VintedCountry;
  /** Vinted member id: a search result's seller.id, a product's seller.id, or the number after /member/ in a profile URL, e.g. 65958245. */
  user_id: number | string;
  [key: string]: unknown;
}

export interface VintedSellerProductsOptions extends VintedSellerOptions {
  sort?: VintedSellerProductsSort;
  /** Page, 1-based, up to 500. Defaults to 1. */
  page?: number;
  /** Items per page, 1-96. Defaults to 20. */
  limit?: number;
}

export interface VintedSellerFeedbackOptions extends VintedSellerOptions {
  /** Page, 1-based, newest first, up to 500. Defaults to 1. */
  page?: number;
  /** Feedback per page, 1-50. Defaults to 20. */
  limit?: number;
}

export interface VintedBrandsOptions {
  country?: VintedCountry;
  /** Brand name or part of it, e.g. "barbour". */
  query: string;
  [key: string]: unknown;
}

export interface VintedSuggestionsOptions {
  country?: VintedCountry;
  /** What the shopper has typed so far, e.g. "barb". */
  query: string;
  [key: string]: unknown;
}

export interface VintedFiltersOptions {
  country?: VintedCountry;
  filter: VintedFilterCode;
  /** Count options for this search, e.g. "dress". Optional. */
  query?: string;
  /** Count options within this category, e.g. 1904 (Women). Sizes are grouped per category, so pass one for size. */
  category_id?: number | string;
  [key: string]: unknown;
}

export interface VintedCategoriesOptions {
  country?: VintedCountry;
  /** Return only this category's subtree (1904 is Women). Omit for the whole tree. */
  parent_id?: number | string;
  [key: string]: unknown;
}

export class VintedNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/vinted/${path}`, options, undefined, VINTED_TIMEOUT);
  }

  /**
   * Search second-hand listings on any of 27 Vinted country sites by
   * keywords, category, brand, condition, size, color, material and price
   * range, sorted by relevance, newest or price. 96 items per page, pages
   * 1-10 (Vinted serves no deeper). Each item has id, title, URL, price and
   * currency (the country site's currency), price_with_discount, service_fee
   * (the Vinted fee the buyer pays on top of the price, formerly the Buyer
   * Protection fee), total_price, brand, size, condition, favourite count,
   * promoted flag, photos and the seller's id and business flag. Also
   * listed_results and total_pages (capped at 960 and 10; total_is_capped is
   * true when there are more matches) and the filters Vinted actually
   * applied. Live listings only: sold items are not searchable.
   *
   * Costs 1 credit.
   */
  async search(options: VintedSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Vinted listing by item id or URL: title, description, price and
   * currency (the seller's currency, which can differ from the country
   * site's), brand, size, condition, color, material, uploaded_relative (e.g.
   * "8 hours ago"), category id and path, all photos, favourite count,
   * reserved and sold state, whether it can be bought now, and the seller
   * (id, login, profile URL, business flag, feedback count, rating 0-1,
   * badges). Sold listings still return their last price. An unknown id is a
   * 404.
   *
   * Costs 1 credit.
   */
  async product(options: VintedProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One Vinted member's public seller profile: login, profile URL, business
   * flag, feedback count, rating (0-1), positive / neutral / negative
   * feedback counts, listed item count, country, city (only when the member
   * shows it), email / Facebook / Google verification, average response time,
   * holiday mode and the date last seen. An unknown id is a 404.
   *
   * Costs 1 credit.
   */
  async seller(options: VintedSellerOptions): Promise<Record<string, unknown>> {
    return this.post("seller", options);
  }

  /**
   * The items one Vinted member has listed, newest first, cheapest first or
   * by relevance, up to 96 per page: id, title, URL, price, currency,
   * service_fee, total_price, brand, size, condition, favourite count,
   * reserved, sold and promoted flags and photos. Also total_results,
   * total_pages and has_more. A member with no listings (or an unknown id)
   * returns an empty list.
   *
   * Costs 1 credit.
   */
  async sellerProducts(options: VintedSellerProductsOptions): Promise<Record<string, unknown>> {
    return this.post("seller-products", options);
  }

  /**
   * Reviews left for one Vinted member, newest first, up to 50 per page:
   * rating 1-5, review text, date, whether it is Vinted's automatic feedback,
   * and the member's reply. Reviewer identities and the items reviewed are
   * not included. Also total_results, total_pages and has_more.
   *
   * Costs 1 credit.
   */
  async sellerFeedback(options: VintedSellerFeedbackOptions): Promise<Record<string, unknown>> {
    return this.post("seller-feedback", options);
  }

  /**
   * Find Vinted brands by name: brand id (what search()'s brand_ids takes),
   * title, slug, URL, number of listings, luxury flag and whether Vinted
   * authenticity-checks it.
   *
   * Costs 1 credit.
   */
  async brands(options: VintedBrandsOptions): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /**
   * The Vinted search-box autocomplete for a partial query, in the country
   * site's language: up to 10 suggestions, each with its type
   * (popular_search, or the catalog match it comes from such as brand,
   * brand+parent_cat or attr).
   *
   * Costs 1 credit.
   */
  async suggestions(options: VintedSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * The options of one Vinted search filter (size, condition, color or
   * material) with live item counts, optionally for a query and a category:
   * id (what search()'s size_ids, status_ids, color_ids and material_ids
   * take), localized title, item count, the size group and, for conditions,
   * the description.
   *
   * Costs 1 credit.
   */
  async filters(options: VintedFiltersOptions): Promise<Record<string, unknown>> {
    return this.post("filters", options);
  }

  /**
   * The Vinted category tree in the country site's language (9 top-level
   * categories, about 3,000 in all): id (what search()'s category_id takes),
   * title, URL and children; or one category's subtree with its path.
   *
   * Costs 1 credit.
   */
  async categories(options: VintedCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }
}
