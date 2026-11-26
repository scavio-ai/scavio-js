import type { Scavio } from "../client.js";

// Gap Inc. (gap.com: Gap, Old Navy, Banana Republic, Athleta, Gap Factory and Banana Republic
// Factory, chosen with brand) search, category, categories, product, prices, stores, store,
// storeStock, suggestions, trending and deals endpoints; country us or ca (English or French),
// prices in USD or CAD, 1 credit each. Generated from the backend routes: every option and its doc
// mirrors the API's own request schema; an input the API only accepts to refuse (a 400 that says
// 'not offered') is left out. The server enforces the value rules and the one-of rules (send one of
// an id or a link). Every call raises the request timeout to GAP_TIMEOUT and never lowers a longer
// client timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every gap call. */
export const GAP_TIMEOUT = 240_000;

export interface GapSearchOptions {
  /** Keywords. */
  query: string;
  /** gap (default), old_navy, banana_republic, athleta, gap_factory or banana_republic_factory. */
  brand?: "gap" | "old_navy" | "banana_republic" | "athleta" | "gap_factory" | "banana_republic_factory";
  /** us (default; gap.com sites, USD) or ca (the Canadian sites, CAD). */
  country?: "us" | "ca";
  /** en (default) or fr (country ca only: the French Canadian site). */
  language?: "en" | "fr";
  /** featured (default, the site's order), price_asc, price_desc, top_rated or best_sellers. */
  sort?: "featured" | "price_asc" | "price_desc" | "top_rated" | "best_sellers";
  /** Page, from 1. A page past the last is a charged 404. */
  page?: number;
  /** Per page, 1 to 200 (default 50). Large pages are slow (200 items can take 25 s). */
  page_size?: number;
  /** A department as the facets list it (Women, Men, Girls, Boys, ...). */
  department?: string;
  /**
   * regular, sale (promotion) or clearance (markdown): styles with at least one color of that type.
   */
  sale_type?: "regular" | "sale" | "clearance";
  /** A color family as the facets list it. */
  color?: string;
  /** Lowest price, 0 to 100000. */
  min_price?: number;
  /** Highest price, 0 to 100000. */
  max_price?: number;
  /** Minimum star rating, 1 to 4 ("4 & up"). */
  rating?: number;
  /** Only products available for pickup at this store (stores[].store_id). */
  store_id?: string;
  /**
   * Other filters as facet name to value: facets[].name and facets[].options[].value of an answer.
   */
  facets?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface GapCategoryOptions {
  /** A category id: categories[].cid (the cid of the category link, not the nav node id). */
  cid?: string;
  /** The link's style= (categories[].style), when it has one. */
  style?: string;
  /**
   * Or a category link, e.g. https://oldnavy.gap.com/browse/todays-deals/for-fam-1?cid=3033077
   * (sets brand and country).
   */
  url?: string;
  /** gap (default), old_navy, banana_republic, athleta, gap_factory or banana_republic_factory. */
  brand?: "gap" | "old_navy" | "banana_republic" | "athleta" | "gap_factory" | "banana_republic_factory";
  /** us (default; gap.com sites, USD) or ca (the Canadian sites, CAD). */
  country?: "us" | "ca";
  /** en (default) or fr (country ca only: the French Canadian site). */
  language?: "en" | "fr";
  /** featured (default, the site's order), price_asc, price_desc, top_rated or best_sellers. */
  sort?: "featured" | "price_asc" | "price_desc" | "top_rated" | "best_sellers";
  /** Page, from 1. A page past the last is a charged 404. */
  page?: number;
  /** Per page, 1 to 200 (default 50). Large pages are slow (200 items can take 25 s). */
  page_size?: number;
  /**
   * Other filters as facet name to value: facets[].name and facets[].options[].value of an answer.
   */
  facets?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface GapCategoriesOptions {
  /** gap (default), old_navy, banana_republic, athleta, gap_factory or banana_republic_factory. */
  brand?: "gap" | "old_navy" | "banana_republic" | "athleta" | "gap_factory" | "banana_republic_factory";
  /** us (default; gap.com sites, USD) or ca (the Canadian sites, CAD). */
  country?: "us" | "ca";
  /** en (default) or fr (country ca only: the French Canadian site). */
  language?: "en" | "fr";
  [key: string]: unknown;
}

export interface GapProductOptions {
  /** A color id (search items[].pid or colors[].pid; the pid= of a product link). */
  pid?: string;
  /**
   * Or a product link, e.g. https://www.gap.com/browse/product.do?pid=403540002 (sets brand and
   * country).
   */
  url?: string;
  /** gap (default), old_navy, banana_republic, athleta, gap_factory or banana_republic_factory. */
  brand?: "gap" | "old_navy" | "banana_republic" | "athleta" | "gap_factory" | "banana_republic_factory";
  /** us (default; gap.com sites, USD) or ca (the Canadian sites, CAD). */
  country?: "us" | "ca";
  /** en (default) or fr (country ca only: the French Canadian site). */
  language?: "en" | "fr";
  [key: string]: unknown;
}

export interface GapPricesOptions {
  /** Up to 100 colors, brands may mix: {"brand", "pid"} or "brand:pid". */
  items: Array<string | { brand?: "gap" | "old_navy" | "banana_republic" | "athleta" | "gap_factory" | "banana_republic_factory"; pid: string }>;
  /** The brand of items that do not name one. */
  brand?: "gap" | "old_navy" | "banana_republic" | "athleta" | "gap_factory" | "banana_republic_factory";
  /** us (default; gap.com sites, USD) or ca (the Canadian sites, CAD). */
  country?: "us" | "ca";
  /** en (default) or fr (country ca only: the French Canadian site). */
  language?: "en" | "fr";
  [key: string]: unknown;
}

export interface GapStoresOptions {
  /** A US ZIP (country us) or a Canadian postal code (A1A 1A1, country ca). */
  zip?: string;
  /** Or a point: latitude with longitude. */
  latitude?: number;
  /** With latitude: the point's longitude. */
  longitude?: number;
  /** Search radius in miles (the site's default when omitted). */
  radius?: number;
  /** Stores to return, 1 to 20 (default 10). */
  limit?: number;
  /** gap (default), old_navy, banana_republic, athleta, gap_factory or banana_republic_factory. */
  brand?: "gap" | "old_navy" | "banana_republic" | "athleta" | "gap_factory" | "banana_republic_factory";
  /** us (default; gap.com sites, USD) or ca (the Canadian sites, CAD). */
  country?: "us" | "ca";
  [key: string]: unknown;
}

export interface GapStoreOptions {
  /** A store id (stores[].store_id). */
  store_id: string;
  /** gap (default), old_navy, banana_republic, athleta, gap_factory or banana_republic_factory. */
  brand?: "gap" | "old_navy" | "banana_republic" | "athleta" | "gap_factory" | "banana_republic_factory";
  /** us (default; gap.com sites, USD) or ca (the Canadian sites, CAD). */
  country?: "us" | "ca";
  [key: string]: unknown;
}

export interface GapStoreStockOptions {
  /** 1 to 10 store ids from stores (same banner and market). */
  store_ids: string[];
  /** 1 to 20 SKU ids (product colors[].skus[].sku_id). */
  sku_ids?: string[];
  /** Or a style id (every SKU of the style): product style_id or search items[].style_id. */
  style_id?: string;
  /** gap (default), old_navy, banana_republic, athleta, gap_factory or banana_republic_factory. */
  brand?: "gap" | "old_navy" | "banana_republic" | "athleta" | "gap_factory" | "banana_republic_factory";
  /** us (default; gap.com sites, USD) or ca (the Canadian sites, CAD). */
  country?: "us" | "ca";
  [key: string]: unknown;
}

export interface GapSuggestionsOptions {
  /** What has been typed so far. */
  query: string;
  /** gap (default), old_navy, banana_republic, athleta, gap_factory or banana_republic_factory. */
  brand?: "gap" | "old_navy" | "banana_republic" | "athleta" | "gap_factory" | "banana_republic_factory";
  /** us (default; gap.com sites, USD) or ca (the Canadian sites, CAD). */
  country?: "us" | "ca";
  /** en (default) or fr (country ca only: the French Canadian site). */
  language?: "en" | "fr";
  [key: string]: unknown;
}

export interface GapTrendingOptions {
  /** gap (default), old_navy, banana_republic, athleta, gap_factory or banana_republic_factory. */
  brand?: "gap" | "old_navy" | "banana_republic" | "athleta" | "gap_factory" | "banana_republic_factory";
  /** us (default; gap.com sites, USD) or ca (the Canadian sites, CAD). */
  country?: "us" | "ca";
  /** en (default) or fr (country ca only: the French Canadian site). */
  language?: "en" | "fr";
  [key: string]: unknown;
}

export interface GapDealsOptions {
  /** gap (default), old_navy, banana_republic, athleta, gap_factory or banana_republic_factory. */
  brand?: "gap" | "old_navy" | "banana_republic" | "athleta" | "gap_factory" | "banana_republic_factory";
  /** us (default; gap.com sites, USD) or ca (the Canadian sites, CAD). */
  country?: "us" | "ca";
  /** en (default) or fr (country ca only: the French Canadian site). */
  language?: "en" | "fr";
  [key: string]: unknown;
}

export class GapNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = GAP_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/gap/${path}`, options, undefined, timeout);
  }

  /**
   * Keyword search on one banner of Gap Inc. (gap.com: Gap, Old Navy, Banana Republic, Athleta and
   * the factory stores). Scavio fetches the public Gap Inc. page on request; Gap Inc. has no public
   * API. brand picks the banner; country us (USD) or ca (CAD, language en or fr). Ids are per
   * banner and market. Filters: department, sale_type (regular, sale, clearance), color, min_price
   * / max_price, rating, store_id (pickup) and any facet; sorts featured, price_asc, price_desc,
   * top_rated, best_sellers; up to 200 per page. Costs 1 credit.
   */
  async search(options: GapSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * The items of one category (cid and style from categories, or a category link), sorted and
   * filtered by facets, with each color's online unit count as given. Costs 1 credit.
   */
  async category(options: GapCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /** The banner's navigation tree as its site menu lists it. Costs 1 credit. */
  async categories(options: GapCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /** One product by color id or product link. Costs 1 credit. */
  async product(options: GapProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** Current prices for up to 100 colors in one call, brands may mix. Costs 1 credit. */
  async prices(options: GapPricesOptions): Promise<Record<string, unknown>> {
    return this.post("prices", options);
  }

  /**
   * Stores of one banner near a ZIP / postal code or a point, with in-store pickup. Costs 1 credit.
   */
  async stores(options: GapStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /** One store's public details by store id. Costs 1 credit. */
  async store(options: GapStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * Pickup stock at up to 10 stores for up to 20 SKUs (or every SKU of one style), as the site's
   * buckets. Costs 1 credit.
   */
  async storeStock(options: GapStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /** The search box's suggestions for what has been typed. Costs 1 credit. */
  async suggestions(options: GapSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /** The trending searches the banner's search box shows. Costs 1 credit. */
  async trending(options: GapTrendingOptions = {}): Promise<Record<string, unknown>> {
    return this.post("trending", options);
  }

  /**
   * The banner's current promotions as its promo drawer words them, and its menu's sale, deal and
   * clearance links. Costs 1 credit.
   */
  async deals(options: GapDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }
}
