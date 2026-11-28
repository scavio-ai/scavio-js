import type { Scavio } from "../client.js";

// Global Industrial (globalindustrial.com, the US industrial-equipment and MRO supplier; Global
// Industrial Canada at globalindustrial.ca) search, category, brand, product and clearance
// endpoints; market us (USD) or ca (CAD), pack price, per-piece unit price and quantity breaks, 1
// credit each. Generated from the backend routes: every option and its doc mirrors the API's own
// request schema. The server enforces the value rules and the one-of rules (send one of an id or a
// link). Every call raises the request timeout to the constant below and never lowers a longer
// client timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every globalindustrial call. */
export const GLOBALINDUSTRIAL_TIMEOUT = 180_000;

export interface GlobalindustrialSearchOptions {
  /**
   * Keywords, a Global Industrial item number (e.g. 652508) or a manufacturer part number (e.g.
   * 240083).
   */
  query: string;
  /**
   * A brand as Global Industrial writes it (items[].brand or a brand facet value, e.g. Wesco,
   * Global Industrial, Valley Craft).
   */
  brand?: string;
  /**
   * us (default: www.globalindustrial.com, prices in USD) or ca (www.globalindustrial.ca, Global
   * Industrial Canada, prices in CAD, English).
   */
  market?: "us" | "ca";
  [key: string]: unknown;
}

export interface GlobalindustrialCategoryOptions {
  /**
   * A category path (/c/..., as subcategories[].path, items[].category_path or a category link give
   * it) or a department path (/t/carts-trucks), or a link to one.
   */
  path: string;
  /** Limit the category to this brand's products (as Global Industrial writes the brand). */
  brand?: string;
  /** A product group of a leaf category (groups[].group_id): every product of that group. */
  group?: number | string;
  /**
   * us (default: www.globalindustrial.com, prices in USD) or ca (www.globalindustrial.ca, Global
   * Industrial Canada, prices in CAD, English).
   */
  market?: "us" | "ca";
  [key: string]: unknown;
}

export interface GlobalindustrialBrandOptions {
  /**
   * A brand as Global Industrial writes it (items[].brand or a brand facet value, e.g. Wesco,
   * Global Industrial, Valley Craft).
   */
  brand: string;
  /**
   * us (default: www.globalindustrial.com, prices in USD) or ca (www.globalindustrial.ca, Global
   * Industrial Canada, prices in CAD, English).
   */
  market?: "us" | "ca";
  [key: string]: unknown;
}

export interface GlobalindustrialProductOptions {
  /**
   * A Global Industrial item number (items[].item_number) or a manufacturer part number, instead of
   * url.
   */
  item?: string;
  /**
   * A product link or path (items[].url, /p/<name>) or its slug (items[].slug). Send url or item.
   */
  url?: string;
  /**
   * us (default: www.globalindustrial.com, prices in USD) or ca (www.globalindustrial.ca, Global
   * Industrial Canada, prices in CAD, English).
   */
  market?: "us" | "ca";
  [key: string]: unknown;
}

export interface GlobalindustrialClearanceOptions {
  /**
   * A clearance category id (categories[].id of a clearance answer, e.g. PRIME30 for Carts &
   * Trucks).
   */
  category?: string;
  /** Limit the clearance listing to this brand. */
  brand?: string;
  /**
   * us (default: www.globalindustrial.com, prices in USD) or ca (www.globalindustrial.ca, Global
   * Industrial Canada, prices in CAD, English).
   */
  market?: "us" | "ca";
  [key: string]: unknown;
}

export class GlobalindustrialNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = GLOBALINDUSTRIAL_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/globalindustrial/${path}`, options, undefined, timeout);
  }

  /**
   * Search Global Industrial (globalindustrial.com, the US industrial-equipment and MRO supplier;
   * Global Industrial Canada at globalindustrial.ca with market ca). Scavio fetches the public
   * Global Industrial page on request. By keyword, item number or part number, optionally one
   * brand: up to 42 products with the full total; a keyword can land on a category or a product
   * page (landed_on says which). Each item carries the price of one selling unit, the pieces in it,
   * the per-piece unit price and the quantity breaks. Costs 1 credit.
   */
  async search(options: GlobalindustrialSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category of Global Industrial (globalindustrial.com). Scavio fetches the public Global
   * Industrial page on request. By category path (/c/...), optionally one brand or one product
   * group: a leaf category lists its products by product group, a broader category or a department
   * its subcategories. Results come in the site's default order. Costs 1 credit.
   */
  async category(options: GlobalindustrialCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The products of one brand on Global Industrial (globalindustrial.com): up to 42, with the
   * brand's full product count and its count per top-level category. Scavio fetches the public
   * Global Industrial page on request. Costs 1 credit.
   */
  async brand(options: GlobalindustrialBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * One product of Global Industrial (globalindustrial.com) by link, slug, item number or
   * manufacturer part number. Scavio fetches the public Global Industrial page on request. Price,
   * pack quantity, per-piece unit price, quantity breaks, specs and documents. A MAP-priced item
   * shows "See price in cart" instead of a price, so its price fields are null and map_pricing is
   * true; msrp is not shown on the page and can sit below the price. Reviews and questions are not
   * included. Costs 1 credit.
   */
  async product(options: GlobalindustrialProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The clearance section of Global Industrial (globalindustrial.com): without filters the
   * clearance counts per category and the page's New to Clearance and Bestsellers products; with
   * category and / or brand up to 42 matching clearance products. Scavio fetches the public Global
   * Industrial page on request. Costs 1 credit.
   */
  async clearance(options: GlobalindustrialClearanceOptions = {}): Promise<Record<string, unknown>> {
    return this.post("clearance", options);
  }
}
