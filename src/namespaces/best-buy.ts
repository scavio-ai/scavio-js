import type { Scavio } from "../client.js";

// Best Buy: 9 endpoints, bestbuy.com (US, the default). US credits: search,
// product, reviews and prices 2 each (prices is per call, up to 15 SKUs);
// category 2 for an abcat id and 3 for a pcmcat page; deals 3; stores and
// suggestions 1; availability 2 flat for up to 8 stores.
//
// Best Buy Canada (bestbuy.ca): `country: "ca"` on all 9 methods, plus the
// Canada-only questions(). 1 credit per Canada call. `country` is optional and
// absent by default, so a US call posts exactly what it did before Best Buy
// Canada existed. For Canada, availability() takes sku, url or skus and exactly
// one of postal_code or store_ids; stores() takes postal_code, city or
// latitude + longitude.
//
// product(), reviews() and availability() take sku or url; category() takes
// category_id or url; availability() takes exactly one of zip or store_ids;
// filters.min_price and filters.max_price go together. The server enforces
// these. Availability is store pickup status, not a unit count: quantity is
// set only for "limited" (Best Buy's "only N left") and is null for in_stock.
// Every call raises the request timeout to BEST_BUY_TIMEOUT when the client's
// is shorter (availability typically takes 5-20 s).

/** Minimum request timeout (ms) for every bestBuy call. */
export const BEST_BUY_TIMEOUT = 120_000;

export type BestBuySearchSort =
  | "best_match"
  | "best_selling"
  | "best_discount"
  | "price_low"
  | "price_high"
  | "rating"
  | "newest";

/**
 * US category listings have no best_match order (their default is
 * best_selling). Best Buy Canada categories also take best_match.
 */
export type BestBuyCategorySort = BestBuySearchSort;

/** "us" (default, bestbuy.com) or "ca" (Best Buy Canada, bestbuy.ca, CAD). */
export type BestBuyCountry = "us" | "ca";

/** Best Buy Canada language: "en" (default) or "fr" (same SKUs and prices; French names, specs and links). */
export type BestBuyCaLanguage = "en" | "fr";

/** Best Buy Canada province or territory for the environmental handling fee (default "ON"). Prices do not change by province. */
export type BestBuyCaProvince =
  | "AB" | "BC" | "MB" | "NB" | "NL" | "NS" | "NT" | "NU" | "ON" | "PE" | "QC" | "SK" | "YT";

/** The sorts Best Buy Canada offers (best_selling, best_discount and newest are a 400 for "ca"). */
export type BestBuyCaSort = "best_match" | "price_low" | "price_high" | "rating";

/** Best Buy Canada deal collections. */
export type BestBuyCaCollection = "black_friday" | "top_deals" | "clearance" | "open_box" | "refurbished";

/** Best Buy Canada listing options shared by search, category and deals (country "ca"). */
export interface BestBuyCaListingOptions {
  /** Best Buy Canada only: products per page, 1-100 (default 24). US pages are fixed at 18. */
  page_size?: number;
  /** Best Buy Canada only: province for the environmental handling fee (ehf). */
  province?: BestBuyCaProvince;
  /** Best Buy Canada only: "en" (default) or "fr". */
  language?: BestBuyCaLanguage;
}

export type BestBuyReviewSort =
  | "most_relevant"
  | "most_helpful"
  | "newest"
  | "oldest"
  | "highest_rated"
  | "lowest_rated";

/** Filters, the same as the site's filter sidebar. applied_filters in the response echoes what Best Buy applied. */
export interface BestBuyFilters {
  /** Only this brand, as spelled in the Brand filter (a `facets` value of brand_facet), e.g. "Samsung". */
  brand?: string;
  /** Only products on sale. */
  on_sale?: boolean;
  /** Only clearance products. */
  clearance?: boolean;
  /** Only products with an open-box offer. */
  open_box?: boolean;
  /** Lowest price in dollars (pass with max_price). */
  min_price?: number;
  /** Highest price in dollars (pass with min_price). */
  max_price?: number;
  /** Best Buy Canada only: 3, 4 or 5 (N stars and up). */
  rating?: 3 | 4 | 5;
  /** Best Buy Canada only: sold by Best Buy or by marketplace sellers. */
  sold_by?: "best_buy" | "marketplace";
  /** Best Buy Canada only: one marketplace seller, as its Sellers facet value. */
  seller?: string;
  /** Best Buy Canada only: only products in stock online. */
  in_stock_online?: boolean;
  /** Best Buy Canada only: up to 10 {facet, value} from a response's facets, e.g. [{ facet: "brandName", value: "SAMSUNG" }]. */
  facets?: Array<{ facet: string; value: string }>;
}

export interface BestBuySearchOptions extends BestBuyCaListingOptions {
  /** Search keywords. */
  query: string;
  /** Results page, 1-based. US: up to 100, 18 products per page. Canada: page_size per page, within the first 2,000 results. */
  page?: number;
  /** best_match (default), best_selling, best_discount, price_low, price_high, rating or newest. best_selling, best_discount and newest are US only. */
  sort?: BestBuySearchSort;
  filters?: BestBuyFilters;
  /** Include the sponsored tiles Best Buy mixes into the grid (sponsored: true, position null). Defaults to false. */
  include_sponsored?: boolean;
  /** "us" (default) or "ca" (Best Buy Canada). */
  country?: BestBuyCountry;
  [key: string]: unknown;
}

export interface BestBuyProductOptions {
  /** Best Buy SKU, a search result's `sku`; for "ca" a Best Buy Canada SKU (8 digits, e.g. "19791103"). */
  sku?: string;
  /** Product URL naming a SKU: bestbuy.com, or for "ca" bestbuy.ca (/en-ca/product/<name>/<sku>). Used when sku is not given. */
  url?: string;
  /** "us" (default) or "ca" (Best Buy Canada). */
  country?: BestBuyCountry;
  /** Best Buy Canada only: province for the environmental handling fee (ehf). */
  province?: BestBuyCaProvince;
  /** Best Buy Canada only: "en" (default) or "fr". */
  language?: BestBuyCaLanguage;
  [key: string]: unknown;
}

export interface BestBuyReviewsOptions {
  /** Best Buy SKU (a search result's `sku`). */
  sku?: string;
  /** bestbuy.com product URL that names a SKU. Used when sku is not given. */
  url?: string;
  /** Reviews page, 1-based. US: 20 per page, up to 500. Canada: page_size per page. Defaults to 1. */
  page?: number;
  /** most_relevant (default), most_helpful, newest, oldest, highest_rated or lowest_rated. */
  sort?: BestBuyReviewSort;
  /** Only reviews with this many stars, 1-5. */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** "us" (default) or "ca" (Best Buy Canada). */
  country?: BestBuyCountry;
  /** Best Buy Canada only: reviews per page, 1-100 (default 20). */
  page_size?: number;
  /** Best Buy Canada only: verified purchases only. */
  verified_only?: boolean;
  /** Best Buy Canada only: reviews with photos only. */
  with_photos?: boolean;
  /** Best Buy Canada only: "en" (default) or "fr" (French-language reviews only). */
  language?: BestBuyCaLanguage;
  [key: string]: unknown;
}

export interface BestBuyCategoryOptions extends BestBuyCaListingOptions {
  /**
   * Best Buy category id: abcat... (catalogue categories, e.g. abcat0101001
   * All Flat-Screen TVs) or pcmcat... (merchandised pages, e.g.
   * pcmcat1674241939957 All Electronics on Sale). A search result's facets
   * list category ids under category_facet. Pass category_id or url. For
   * "ca" a numeric id (e.g. "21344" Televisions), a slug id or "departments".
   */
  category_id?: string;
  /** A bestbuy.com category page URL (.../<id>.c?id=<id>; its qp= filters are kept, its sort is not) or, for "ca", a bestbuy.ca category link. */
  url?: string;
  /** Results page, 1-based. US: up to 100, 18 products per page. Canada: page_size per page, within the first 2,000 results. */
  page?: number;
  /** US: best_selling (the default on most pages), best_discount, price_low, price_high, rating or newest (no best_match). Canada: best_match (default), price_low, price_high or rating. */
  sort?: BestBuyCategorySort;
  filters?: BestBuyFilters;
  /** Include the sponsored tiles Best Buy mixes into the grid. Defaults to false. */
  include_sponsored?: boolean;
  /** "us" (default) or "ca" (Best Buy Canada). */
  country?: BestBuyCountry;
  [key: string]: unknown;
}

/** Best Buy Canada deal collection options (country "ca"); the US Deal of the Day takes none. */
export interface BestBuyDealsOptions extends BestBuyCaListingOptions {
  /** "us" (default: Deal of the Day, no other options) or "ca" (Best Buy Canada collections). */
  country?: BestBuyCountry;
  /** Best Buy Canada only: black_friday, top_deals (default), clearance, open_box or refurbished. */
  collection?: BestBuyCaCollection;
  /** Best Buy Canada only: page, 1-based. */
  page?: number;
  /** Best Buy Canada only: best_match (default), price_low, price_high or rating. */
  sort?: BestBuyCaSort;
  /** Best Buy Canada only: the same filters as search(). */
  filters?: BestBuyFilters;
  /** Best Buy Canada only: include sponsored tiles. */
  include_sponsored?: boolean;
  [key: string]: unknown;
}

export interface BestBuyStoresOptions {
  /** US ZIP code, e.g. "94103". Required for the US; for "ca" pass postal_code, city or latitude + longitude. */
  zip?: string;
  /** "us" (default) or "ca" (Best Buy Canada). */
  country?: BestBuyCountry;
  /** Best Buy Canada only: a Canadian postal code, e.g. "M5V 3L9". */
  postal_code?: string;
  /** Best Buy Canada only: a city instead of postal_code, e.g. "Winnipeg". */
  city?: string;
  /** Best Buy Canada only: with longitude, instead of postal_code. */
  latitude?: number;
  /** Best Buy Canada only: with latitude. */
  longitude?: number;
  /** Best Buy Canada only: 1-100 km (default 25). */
  radius_km?: number;
  /** Best Buy Canada only: stores to return, 1-100 (default 20). */
  limit?: number;
  /** Best Buy Canada only: "en" (default) or "fr". */
  language?: BestBuyCaLanguage;
  [key: string]: unknown;
}

export interface BestBuyAvailabilityOptions {
  /** Best Buy SKU (a search result's `sku`). */
  sku?: string;
  /** bestbuy.com product URL that names a SKU. Used when sku is not given. */
  url?: string;
  /** Check the stores nearest this US ZIP code (max_stores of them). Pass exactly one of zip or store_ids. */
  zip?: string;
  /** With zip or postal_code: how many of the nearest stores to check. US 1-8 (default 5); Canada 1-50 (default 10). */
  max_stores?: number;
  /** Check these stores instead (store numbers, a stores() result's store_id), up to 8 in the US and 50 in Canada: an array or a comma-separated string. */
  store_ids?: string[] | string;
  /** "us" (default) or "ca" (Best Buy Canada: exact units per store). */
  country?: BestBuyCountry;
  /** Best Buy Canada only: the stores nearest this postal code, e.g. "H3B 4W8". Pass exactly one of postal_code or store_ids. */
  postal_code?: string;
  /** Best Buy Canada only: 1-20 SKUs in one call instead of sku, an array or a comma-separated string. */
  skus?: string[] | string;
  /** Best Buy Canada only: "en" (default) or "fr". */
  language?: BestBuyCaLanguage;
  [key: string]: unknown;
}

export interface BestBuySuggestionsOptions {
  /** What the shopper has typed so far, e.g. "ps5 con". */
  query: string;
  /** "us" (default) or "ca" (Best Buy Canada). */
  country?: BestBuyCountry;
  /** Best Buy Canada only: "en" (default) or "fr". */
  language?: BestBuyCaLanguage;
  [key: string]: unknown;
}

export interface BestBuyPricesOptions {
  /** 1-15 Best Buy SKUs (1-20 for "ca"), an array or a comma-separated string. */
  skus: string[] | string;
  /** "us" (default) or "ca" (Best Buy Canada). */
  country?: BestBuyCountry;
  /** Best Buy Canada only: province for the environmental handling fee (ehf). */
  province?: BestBuyCaProvince;
  /** Best Buy Canada only: "en" (default) or "fr". */
  language?: BestBuyCaLanguage;
  [key: string]: unknown;
}

export interface BestBuyQuestionsOptions {
  /** A Best Buy Canada SKU (8 digits), e.g. "19296507". */
  sku?: string;
  /** A bestbuy.ca product link. Used when sku is not given. */
  url?: string;
  /** Page, 1-based. */
  page?: number;
  /** Questions per page, 1-50 (default 10). */
  page_size?: number;
  /** most_answered (default) or newest. */
  sort?: "most_answered" | "newest";
  /** "en" (default) or "fr". */
  language?: BestBuyCaLanguage;
  [key: string]: unknown;
}

export class BestBuyNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search bestbuy.com (US), 18 products per page, sorted by best match, best
   * selling, best discount, price, rating or newest, filtered by brand, on
   * sale, clearance, open box or a price range. Each product has SKU, BSIN,
   * name, brand, model number, URL, image, price, regular price, savings in
   * dollars and percent, on-sale flag, deal badge, condition, rating, review
   * count, seller type (best_buy or marketplace), product type, badges and
   * release date. Also returns total_results, total_pages, the applied sort
   * and filters, the category, the filter sidebar (facets with value counts;
   * category_facet values carry category ids), sort options, related searches
   * and any spelling correction. Sponsored tiles are left out unless
   * include_sponsored.
   *
   * With country "ca", Best Buy Canada (bestbuy.ca, Best Buy's Canadian
   * store: 142 stores across Canada per Best Buy's FY2026 10-K, plus a
   * marketplace of third-party sellers): page_size 1-100, the sorts
   * best_match, price_low, price_high and rating, results capped at the first
   * 2,000 (results_capped), CAD prices with sale_ends_at and the ehf for
   * province; marketplace sellers as returned.
   *
   * Costs 2 credits in the US; 1 credit with country "ca".
   */
  async search(options: BestBuySearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/search", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * One bestbuy.com (US) product by SKU or URL: name, brand, model, UPC, URL,
   * status, condition, product type, category path, price, regular price,
   * savings, on-sale flag, deal badge, financing offer, every open-box offer
   * by condition (fair, good, excellent) with its price, savings against new
   * (savings_vs_new) and against the regular price (savings_vs_regular),
   * other sellers' and conditions' SKUs of the same product, rating, review
   * count, the AI review summary and what customers love, description,
   * features, what's included, the full specification table by group,
   * dimensions, images, manuals and badges. An unknown SKU is a 404.
   *
   * With country "ca", Best Buy Canada: UPC, CAD price, regular price,
   * savings, sale_starts_at and sale_ends_at (UTC), ehf and ehf_by_province,
   * seller, online units, open_box (Geek Squad open-box, open-box and
   * refurbished SKUs with their own prices), specifications and images.
   * rating and review_count are null for Canada (read them from reviews() or
   * prices()).
   *
   * Costs 2 credits in the US; 1 credit with country "ca".
   */
  async product(options: BestBuyProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/product", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * Customer reviews of one bestbuy.com (US) product by SKU or URL, 20 per
   * page, sorted most relevant (default), most helpful, newest, oldest,
   * highest or lowest rated, optionally only one star rating. Returns the
   * review summary (average rating, review count, recommended percent, star
   * histogram, the most mentioned pros and cons with mention counts),
   * total_results for the filter, total_pages and has_more. Each review has
   * id, title, text, rating, author, date, recommended flag, verified-purchase
   * and incentivized flags, days of ownership, helpful and not-helpful votes,
   * badges, photos, the site it was syndicated from and the brand's response.
   * An unknown SKU is a 404.
   *
   * With country "ca", Best Buy Canada: page_size 1-100, verified_only,
   * with_photos, language ("fr": French reviews only); the summary has the
   * star distribution, recommended percent and Best Buy Canada's own AI
   * summary. No reviewer names.
   *
   * Costs 2 credits in the US; 1 credit with country "ca".
   */
  async reviews(options: BestBuyReviewsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/reviews", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * Browse a bestbuy.com (US) category or deals page by category id or URL,
   * 18 products per page, sorted by best selling, best discount, price,
   * rating or newest, with the same filters as search(). Works on catalogue
   * categories (abcat0101001) and merchandised pages such as All Electronics
   * on Sale (pcmcat1674241939957). Products and listing fields are the same
   * as search(). An unknown category, or a page without a product grid, is a
   * 404.
   *
   * With country "ca", a Best Buy Canada category by numeric id (e.g. 21344
   * Televisions), slug id or "departments", with its parents and
   * subcategories to walk the tree.
   * With country "ca", Best Buy Canada (bestbuy.ca, Best Buy's Canadian
   * store: 142 stores across Canada per Best Buy's FY2026 10-K, plus a
   * marketplace of third-party sellers): page_size 1-100, the sorts
   * best_match, price_low, price_high and rating, results capped at the first
   * 2,000 (results_capped), CAD prices with sale_ends_at and the ehf for
   * province; marketplace sellers as returned.
   *
   * Costs 2 credits in the US for an abcat id and 3 for a pcmcat page (the
   * page is read first); 1 credit with country "ca".
   */
  async category(options: BestBuyCategoryOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/category", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * Today's Best Buy Deal of the Day and the more-deals row under it, with
   * live prices: SKU, name, URL, image, rating, review count, price, regular
   * price, savings in dollars and percent, on-sale flag and deal badge, plus
   * the countdown end as the page shows it. Up to 15 products. Called with
   * no options it posts an empty body, as before.
   *
   * With country "ca" (Best Buy Canada has no Deal of the Day): one deal
   * collection (black_friday, top_deals (default), clearance, open_box,
   * refurbished) as a listing with the search options, plus dates_text, the
   * collection's own dates when its page states them.
   *
   * Costs 3 credits in the US; 1 credit with country "ca".
   */
  async deals(options: BestBuyDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/deals", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * Best Buy stores near a US ZIP code, nearest first (up to 15): store id,
   * name, address, city, state, ZIP, phone, open status, store type, distance
   * in miles, and dated opening hours for the next 35 days (holiday hours and
   * closed days included). Use a store_id with availability().
   *
   * With country "ca", Best Buy Canada stores near a postal_code
   * (radius_km), in a city, or near latitude + longitude: store id, name,
   * type (BigBox, SmallFormat, Mobile, ExpressKiosk), address, province,
   * phone, coordinates, distance in km, 7 dated days of hours and services.
   *
   * Costs 1 credit.
   */
  async stores(options: BestBuyStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/stores", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * Store pickup availability of one bestbuy.com SKU at up to 8 stores: the
   * stores nearest a ZIP code or the store ids you pass. Each store has a
   * status: in_stock, limited (with the real quantity when Best Buy shows
   * "only N left"), ship_to_store (can be shipped there for pickup by
   * pickup_date), out_of_stock, not_available_for_pickup, or unknown (with a
   * reason; never reported as out of stock). Also the pickup date, the
   * minimum hours until pickup, and the nearby store Best Buy suggests when
   * this one cannot fill it. quantity is null for in_stock: Best Buy does not
   * publish unit counts for well-stocked items. Takes 5-20s. An unknown SKU
   * is a 404.
   *
   * With country "ca", Best Buy Canada: exact units per store for 1-20 SKUs
   * (skus) at the stores nearest a postal_code (max_stores 1-50, default 10)
   * or up to 50 store_ids, plus online units; status in_stock, out_of_stock
   * or unknown (units null: no stock record for that store, never out of
   * stock). No prices here (Canada prices are national).
   *
   * Costs 2 credits flat in the US; 1 credit with country "ca".
   */
  async availability(options: BestBuyAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/availability", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * The bestbuy.com search-box autocomplete for a partial query (e.g. "ps5
   * con"): suggested search terms, each with the categories (id and name) and
   * SKUs Best Buy shows for it, plus any spelling correction. With country
   * "ca", Best Buy Canada's suggested search terms only, each flagged
   * is_brand.
   *
   * Costs 1 credit.
   */
  async suggestions(options: BestBuySuggestionsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/suggestions", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * Current bestbuy.com prices for up to 15 SKUs in one call: price, regular
   * price, savings in dollars and percent, on-sale flag, deal badge and deal
   * end time per SKU. A SKU Best Buy does not know comes back found: false;
   * all unknown is a 404.
   *
   * With country "ca", up to 20 Best Buy Canada SKUs: CAD price, regular
   * price, savings, sale_ends_at, ehf for province and ehf_by_province,
   * rating, review count and seller type.
   *
   * Costs 2 credits per call in the US, whatever the number of SKUs; 1 credit
   * with country "ca".
   */
  async prices(options: BestBuyPricesOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/prices", options, undefined, BEST_BUY_TIMEOUT);
  }

  /**
   * Best Buy Canada only (bestbuy.ca): customer questions about one product
   * by SKU or link, each with its answer count and the top answer (text,
   * date, verified purchase, helpful votes), most answered first or newest;
   * total_questions, total_pages and has_more. Questions syndicated from
   * bestbuy.com are flagged. No asker or answerer names. An unknown SKU is a
   * charged 404.
   *
   * Costs 1 credit.
   */
  async questions(options: BestBuyQuestionsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/bestbuy/questions", options, undefined, BEST_BUY_TIMEOUT);
  }
}
