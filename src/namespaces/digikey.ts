import type { Scavio } from "../client.js";

// DigiKey (digikey.com, the electronic component distributor) search, product and categories
// endpoints; markets us (USD), ca (CAD, product and categories only) and de (EUR, German labels,
// prices without VAT). 2 credits per call; a product looked up by DigiKey part number is held at 4
// (2 when it lands straight on a digikey.com product page). Generated from the backend routes:
// every option and its doc mirrors the API's own request schema. The server enforces the value
// rules and the one-of rules (search takes query, category_id or both; product takes url or
// digikey_part_number). Every call raises the request timeout to DIGIKEY_TIMEOUT and never lowers a
// longer client timeout. Failed upstream calls and refused inputs are not charged; a not-found is
// charged what it spent (credits_used is what was charged).

/** Minimum request timeout (ms) for every digikey call. */
export const DIGIKEY_TIMEOUT = 300_000;

/**
 * us (default: digikey.com, USD) or de (digikey.de, EUR, German labels, prices without VAT); ca is
 * refused (not charged).
 */
export type DigikeySearchCountry = "us" | "de";

/**
 * us (default: digikey.com, USD), ca (digikey.ca, CAD) or de (digikey.de, EUR, German labels,
 * prices without VAT).
 */
export type DigikeyCountry = "us" | "ca" | "de";

export interface DigikeySearchOptions {
  /**
   * Keywords, a manufacturer part number or a DigiKey part number, e.g. LM7805. Send query,
   * category_id or both.
   */
  query?: string;
  /**
   * A leaf category id (categories[].id of a search or of categories, where leaf is true, e.g. 699)
   * or a DigiKey category link; returns that category's product rows, narrowed by query and
   * filters.
   */
  category_id?: string | number;
  /**
   * With category_id: {<facet id>: [<option id>, ...]} from facets[] and common_filters[] of a
   * category search, e.g. {"-1": ["296"]} for Manufacturer Texas Instruments, {"-2": ["5"]} for In
   * Stock. Up to 10 filters.
   */
  filters?: Record<string, Array<string | number>>;
  /**
   * us (default: digikey.com, USD) or de (digikey.de, EUR, German labels, prices without VAT). ca
   * is refused (not charged): use product and categories for digikey.ca.
   */
  country?: DigikeySearchCountry;
  [key: string]: unknown;
}

export interface DigikeyProductOptions {
  /**
   * A DigiKey product link (items[].url) on digikey.com, digikey.ca or digikey.de, e.g.
   * https://www.digikey.com/en/products/detail/texas-instruments/SN74HCT02N/376866; the link's site
   * sets the market.
   */
  url?: string;
  /**
   * A DigiKey part number (items[].digikey_part_number, digikey_part_numbers[]), e.g.
   * 497-1575-5-ND, instead of url.
   */
  digikey_part_number?: string;
  /**
   * us (default: digikey.com, USD), ca (digikey.ca, CAD) or de (digikey.de, EUR, German labels,
   * prices without VAT).
   */
  country?: DigikeyCountry;
  [key: string]: unknown;
}

export interface DigikeyCategoriesOptions {
  /**
   * A category id (categories[].id, e.g. 32) to read its subcategories and product counts; leave
   * out for the top-level categories.
   */
  category_id?: string | number;
  /**
   * us (default: digikey.com, USD), ca (digikey.ca, CAD) or de (digikey.de, EUR, German labels,
   * prices without VAT).
   */
  country?: DigikeyCountry;
  [key: string]: unknown;
}

export class DigikeyNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/digikey/${path}`, options, undefined, DIGIKEY_TIMEOUT);
  }

  /**
   * Search DigiKey (digikey.com, the electronic component distributor) in us or de by keyword or
   * part number: exact part matches and the categories holding them, or with a leaf category_id
   * that category's first 25 rows (DigiKey's page 1 only; narrow with filters) with price breaks
   * per packaging, stock and specs. Scavio fetches the public DigiKey page on request. Costs 2
   * credits.
   */
  async search(options: DigikeySearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product of DigiKey (digikey.com, the electronic component distributor) by link or DigiKey
   * part number, in us, ca or de: price breaks per packaging, stock, the manufacturer's standard
   * lead time, Part Status, RoHS / REACH / MSL / ECCN / HTSUS, documents, related parts and the
   * substitutes DigiKey's page lists. Scavio fetches the public DigiKey page on request. Costs 2
   * credits by link; a DigiKey part number is held at 4 (2 when it lands straight on a digikey.com
   * product page).
   */
  async product(options: DigikeyProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The product categories of DigiKey (digikey.com, the electronic component distributor): the
   * top-level categories, or one category with its subcategories and product counts; leaf true
   * marks a category whose rows search returns. Scavio fetches the public DigiKey page on request.
   * Costs 2 credits.
   */
  async categories(options: DigikeyCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }
}
