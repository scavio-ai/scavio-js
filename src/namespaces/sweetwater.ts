import type { Scavio } from "../client.js";

// Sweetwater (sweetwater.com, the US music instrument and pro audio retailer) search, category,
// product, serialUnits, reviews and deals endpoints; US only, prices in USD, 1 credit each.
// Generated from the backend routes: every option and its doc mirrors the API's own request schema;
// an input the API only accepts to refuse (a 400 that says 'not offered') is left out. The server
// enforces the value rules and the one-of rules (send one of an id or a link). Every call raises
// the request timeout to SWEETWATER_TIMEOUT and never lowers a longer client timeout. Failed
// upstream calls and refused inputs are not charged; a not-found is charged (credits_used is what
// was charged).

/** Minimum request timeout (ms) for every sweetwater call. */
export const SWEETWATER_TIMEOUT = 240_000;

export interface SweetwaterSearchOptions {
  /** Search keywords. */
  query: string;
  /**
   * relevance, popular, rating, lightest, newest, price_desc, price_asc, brand. Free-text results
   * come in Sweetwater's relevance order; a sort applies when the keyword opens a category
   * (landed_on category).
   */
  sort?: string;
  /**
   * Page, 1-based (default 1). Free-text search shows 42 results on one page (a page past 1 is an
   * empty list); when the keyword opens a category, pages of 42 apply.
   */
  page?: number;
  [key: string]: unknown;
}

export interface SweetwaterCategoryOptions {
  /**
   * A Sweetwater category: an id (c590), a path (c590--Solid_Body_Guitars) or a link
   * (https://www.sweetwater.com/c590--Solid_Body_Guitars; facets on a pasted link are kept when
   * facets is not sent).
   */
  category: string;
  /**
   * popular, rating, lightest, newest, price_desc, price_asc, brand (the site's sort menu: Most
   * Popular, Customer Rating, Lightest Guitar, Newest Arrivals, Price High - Low, Price Low - High,
   * Brand A - Z). popular is the default. The site's own values (low2high, high2low, reviews, name)
   * are accepted too.
   */
  sort?: string;
  /**
   * Page, 1-based, 42 products per page (default 1). Sweetwater counts at most 5,000 products in a
   * listing, so the last page is 120.
   */
  page?: number;
  /**
   * Facet filters as the site names them (facets[].name and values[].value of an answer), several
   * values per facet, up to 12 facets: {"Availability": ["In Stock"], "Brand": ["Fender",
   * "Gibson"], "Price Range": ["$500 - $1,000"]}.
   */
  facets?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SweetwaterProductOptions {
  /**
   * A Sweetwater item id (items[].item_id; the part before -- in a sweetwater.com/store/detail/
   * link). An open-box unit has its own id (open_box[].item_id, e.g. StratAU2HEUBd2).
   */
  item_id?: string;
  /**
   * A sweetwater.com product link instead of item_id (a ?cond= open-box link selects that unit).
   */
  url?: string;
  [key: string]: unknown;
}

export interface SweetwaterSerialUnitsOptions {
  /**
   * A Sweetwater item id (items[].item_id; the part before -- in a sweetwater.com/store/detail/
   * link). An open-box unit has its own id (open_box[].item_id, e.g. StratAU2HEUBd2).
   */
  item_id?: string;
  /**
   * A sweetwater.com product link instead of item_id (a ?cond= open-box link selects that unit).
   */
  url?: string;
  [key: string]: unknown;
}

export interface SweetwaterReviewsOptions {
  /**
   * A Sweetwater item id (items[].item_id; the part before -- in a sweetwater.com/store/detail/
   * link). An open-box unit has its own id (open_box[].item_id, e.g. StratAU2HEUBd2).
   */
  item_id?: string;
  /**
   * A sweetwater.com product link instead of item_id (a ?cond= open-box link selects that unit).
   */
  url?: string;
  /** Reviews with this many stars (the site's own filter). */
  stars?: number;
  /** newest (default), oldest, highest or lowest: the site's review sort menu. */
  sort?: "newest" | "oldest" | "highest" | "lowest";
  /** Reviews page, 1-based (default 1). */
  page?: number;
  /** Reviews per page, 1 to 100 (default 25). */
  limit?: number;
  [key: string]: unknown;
}

export interface SweetwaterDealsOptions {
  /**
   * A Deal Zone page (deal_pages[].slug of an answer: guitar-deals, price-drops, demos, bundles,
   * rebates-and-promos, ...). Leave out for the whole Deal Zone.
   */
  deal?: string;
  /**
   * featured, popular, best_deals, newest_deals, ending_soon, newest, price_desc, price_asc, brand:
   * the Deal Zone sort menu (featured is its own order, the default; best_deals = Best Deals,
   * newest_deals = Newest Deals, ending_soon = Ending Soon).
   */
  sort?: string;
  /**
   * Page, 1-based, 42 products per page (default 1). Sweetwater counts at most 5,000 products in a
   * listing, so the last page is 120.
   */
  page?: number;
  [key: string]: unknown;
}

export class SweetwaterNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = SWEETWATER_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/sweetwater/${path}`, options, undefined, timeout);
  }

  /**
   * Search Sweetwater (sweetwater.com, the US online music instrument and pro audio retailer).
   * Scavio fetches the public page on request; Sweetwater has no public API. Free-text keywords
   * show 42 results in Sweetwater's relevance order (the site does not page or sort free-text
   * results): items [position, item_id, name, brand, type, category, url, image, condition, price
   * (the price now), retail_price, base_price, has_price_drop, instant_rebate, mail_in_rebate,
   * bundle_savings, special_offer {title, value}, in_stock, on_hand (units on hand), available
   * (units available to sell; can be negative when more are sold than on hand), on_order (units on
   * order), pre_order, special_order, free_shipping, open_box [{item_id, condition (Demo), price}],
   * rating, review_count]. Costs 1 credit.
   */
  async search(options: SweetwaterSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category listing of Sweetwater (sweetwater.com, the US online music instrument and pro
   * audio retailer). Scavio fetches the public page on request; Sweetwater has no public API. 42
   * products per page with the site's 7 sorts and facet filters. Costs 1 credit.
   */
  async category(options: SweetwaterCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One product of Sweetwater (sweetwater.com, the US online music instrument and pro audio
   * retailer). Scavio fetches the public page on request; Sweetwater has no public API. By item_id
   * or url. Costs 1 credit.
   */
  async product(options: SweetwaterProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The serial-numbered units of one item of Sweetwater (sweetwater.com, the US online music
   * instrument and pro audio retailer) (Sweetwater photographs and weighs many guitars and basses
   * one by one). Costs 1 credit.
   */
  async serialUnits(options: SweetwaterSerialUnitsOptions): Promise<Record<string, unknown>> {
    return this.post("serial-units", options);
  }

  /**
   * Customer reviews of one product of Sweetwater (sweetwater.com, the US online music instrument
   * and pro audio retailer). Costs 1 credit.
   */
  async reviews(options: SweetwaterReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * The Deal Zone of Sweetwater (sweetwater.com, the US online music instrument and pro audio
   * retailer). Scavio fetches the public page on request; Sweetwater has no public API. The whole
   * Deal Zone or one of its pages (deal. Costs 1 credit.
   */
  async deals(options: SweetwaterDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }
}
