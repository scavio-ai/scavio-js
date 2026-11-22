import type { Scavio } from "../client.js";

// Action (action.com, the European non-food discount store; not Action S.A.,
// the Polish IT distributor): 16 endpoints, 1 credit each.
//
// 19 storefronts in 16 countries: country nl (default), be, fr, lu, de, at,
// ch, it, es, pt, pl, cz, sk, ro, hr, si, plus language for be (nl or fr) and
// ch (de, fr or it). Titles, descriptions and labels come in the storefront's
// language, as Action writes them (Dutch on the default nl storefront). Prices
// are numbers in the market's currency (EUR; CHF on ch, PLN on pl, CZK on cz,
// RON on ro), never converted. Article numbers (product_code) are the same in
// every market and prices are set per market: price one article on each
// market you report (products() takes up to 60 codes per market).
//
// weeklyDeals(): week_id (e.g. Promo2026Week47), Action's label and ISO
// valid_from / valid_to dates; a deal week runs Wednesday to Tuesday and the
// assortment changes weekly; Belgium adds Action Plus loyalty_deals. stores():
// the 20 stores nearest a city, postcode or lat / lng (they may cross a
// border: country_code per store; distance_km only for lat / lng), with 7
// dated days of opening hours. Action does not publish store stock.
// reviews(): nl, de, fr and pl only (other countries answer 400, not charged),
// scope local (default) / international / all; no reviewer identity.
// webshopSearch() and webshopProduct() read shop.action.com (nl-nl, nl-be,
// fr-be): EAN, online stock_level (not store stock), order_limit,
// shipping_cost. EANs come only from the webshop. Not available: store stock,
// price history (poll and store the answers), leaflets, checkout, other
// countries.
//
// The server enforces the cross-field rules: product() takes one of
// product_code or url; stores() one of query or lat + lng; store() one of
// store or store_id; webshopSearch() one of query or category;
// webshopProduct() one of ean or url. Every call raises the request timeout to
// ACTION_TIMEOUT. Failed upstream calls and refused inputs are not charged; a
// not-found is charged.

/** Minimum request timeout (ms) for every action call: calls can queue behind the server's upstream limit. */
export const ACTION_TIMEOUT = 240_000;

/** The Action storefront's country (default "nl"). */
export type ActionCountry =
  | "nl"
  | "be"
  | "fr"
  | "lu"
  | "de"
  | "at"
  | "ch"
  | "it"
  | "es"
  | "pt"
  | "pl"
  | "cz"
  | "sk"
  | "ro"
  | "hr"
  | "si";

/** The storefront's language where a country has more than one: be nl (default) or fr; ch de (default), fr or it. */
export type ActionLanguage = "nl" | "fr" | "de" | "it" | "es" | "pt" | "pl" | "cs" | "sk" | "ro" | "hr" | "sl";

/** relevance (default, Action's own order), price_asc, price_desc or newest. */
export type ActionSort = "relevance" | "price_asc" | "price_desc" | "newest";

/** relevant (default, Action's own order), newest, oldest, highest or lowest. */
export type ActionReviewSort = "relevant" | "newest" | "oldest" | "highest" | "lowest";

/** local (default: reviews written on this storefront), international (the other three) or all (both). */
export type ActionReviewScope = "local" | "international" | "all";

/** An Action article number: items[].product_code (7 digits, the same code in every market). */
export type ActionProductCode = string | number;

export interface ActionMarketOptions {
  /** The Action storefront's country (default "nl"). */
  country?: ActionCountry;
  /** be: "nl" (default) or "fr"; ch: "de" (default), "fr" or "it". Other countries: leave it out. */
  language?: ActionLanguage;
}

export interface ActionListOptions extends ActionMarketOptions {
  /** Sort. Defaults to "relevance". */
  sort?: ActionSort;
  /** Page, 1 to 200 (24 products a page, 23 on weekly deals). */
  page?: number;
  /** One department: a value of facets[facet=category].values[].value (e.g. "Hobby"). */
  category_filter?: string;
  /** A price band: a value of facets[facet=price_range].values[].value (e.g. "2-5", "<1", ">20"). */
  price_range?: string;
  /** One brand: a value of facets[facet=brand].values[].value (e.g. "Disney"). */
  brand_filter?: string;
  /** New products only (Action's Nieuw / Neu label). */
  new_only?: boolean;
}

export interface ActionSearchOptions extends ActionListOptions {
  /** Search text (the storefront's language works best: "kerst", "weihnachten", "noel", "opbergbox"). */
  query: string;
  [key: string]: unknown;
}

export interface ActionProductOptions extends ActionMarketOptions {
  /** Action article number (items[].product_code), e.g. "3225277". One of product_code or url. */
  product_code?: ActionProductCode;
  /** An action.com product link (https://www.action.com/<market>/p/<code>/<name>/); the market comes from the link. */
  url?: string;
  [key: string]: unknown;
}

export interface ActionProductsOptions extends ActionMarketOptions {
  /** 1 to 60 Action article numbers, priced on one market. */
  product_codes: ActionProductCode[];
  [key: string]: unknown;
}

export interface ActionCategoryOptions extends ActionListOptions {
  /** A category path (categories() categories[].path, e.g. "wonen/woonaccessoires") or its action.com/<market>/c/... link. */
  category: string;
  [key: string]: unknown;
}

export interface ActionCategoriesOptions extends ActionMarketOptions {
  /** Levels to return, 1 to 3 (default 3). */
  depth?: number;
  [key: string]: unknown;
}

export interface ActionBrandOptions extends Omit<ActionListOptions, "brand_filter"> {
  /** A brand: brands() brands[].slug or a product's brand_info.slug (e.g. "max-more") or its link. */
  brand: string;
  [key: string]: unknown;
}

export interface ActionBrandsOptions extends ActionMarketOptions {
  /** Brands whose name contains this text. */
  query?: string;
  [key: string]: unknown;
}

export interface ActionNewArrivalsOptions extends Omit<ActionListOptions, "new_only"> {
  [key: string]: unknown;
}

export interface ActionWeeklyDealsOptions extends ActionListOptions {
  [key: string]: unknown;
}

export interface ActionCollectionOptions extends ActionListOptions {
  /** A collection (seasonal moment page) slug: "black-friday", "kerst", "sinterklaas", "basics", or its link. */
  collection: string;
  [key: string]: unknown;
}

export interface ActionSuggestionsOptions extends ActionMarketOptions {
  /** What the shopper has typed so far, e.g. "opberg". */
  query: string;
  [key: string]: unknown;
}

export interface ActionStoresOptions extends ActionMarketOptions {
  /** A city, town or postcode, e.g. "Amsterdam". One of query or lat + lng. */
  query?: string;
  /** Latitude (with lng): the 20 stores nearest this point, with distance_km. */
  lat?: number;
  /** Longitude (with lat). */
  lng?: number;
  [key: string]: unknown;
}

export interface ActionStoreOptions extends ActionMarketOptions {
  /** A store: stores[].store (e.g. "/nl-nl/winkels/amsterdam-kinkerstraat/"), its link, or its slug with country. */
  store?: string;
  /** Or an Action store id (stores[].store_id, e.g. "1260" or "3A11"). */
  store_id?: string | number;
  [key: string]: unknown;
}

export interface ActionReviewsOptions {
  /** Action article number (items[].product_code), e.g. "3224838". */
  product_code: ActionProductCode;
  /** "nl" (default), "de", "fr" or "pl": the four storefronts where Action publishes reviews. */
  country?: "nl" | "de" | "fr" | "pl";
  /** Defaults to "local". With "all", offset + limit must be at most 100. */
  scope?: ActionReviewScope;
  /** Defaults to "relevant". */
  sort?: ActionReviewSort;
  /** Star ratings to include, e.g. [1, 2]. */
  rating?: Array<1 | 2 | 3 | 4 | 5>;
  /** Reviews that mention this text. */
  query?: string;
  /** Reviews per call, 1 to 100 (default 20). */
  limit?: number;
  /** Reviews to skip (paging). */
  offset?: number;
  [key: string]: unknown;
}

export interface ActionWebshopMarketOptions {
  /** "nl" (default) or "be": the webshop (shop.action.com) serves nl-nl, nl-be and fr-be only. */
  country?: "nl" | "be";
  /** For be: "nl" (default) or "fr". */
  language?: "nl" | "fr";
}

export interface ActionWebshopSearchOptions extends ActionWebshopMarketOptions {
  /** Search text, e.g. "stofzuiger". One of query or category. */
  query?: string;
  /** Or a webshop category slug (the /c/<slug> part of a shop.action.com link, e.g. "alle-tijdelijke-deals"). */
  category?: string;
  /** Page. */
  page?: number;
  [key: string]: unknown;
}

export interface ActionWebshopProductOptions extends ActionWebshopMarketOptions {
  /** The product's EAN (webshopSearch() items[].ean), e.g. "8718969571098". One of ean or url. */
  ean?: string;
  /** Or a shop.action.com product link. */
  url?: string;
  [key: string]: unknown;
}

export class ActionNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/action/${path}`, options, undefined, ACTION_TIMEOUT);
  }

  /**
   * Search Action (action.com, the European non-food discount store), 24
   * products a page: country, language, market, currency, query, sort, page,
   * page_size, total, total_pages, has_more, count, items (product_code,
   * title, price, regular_price, unit_price, discount_percent, price_note,
   * is_new, is_deal, deal {label, valid_from, valid_to, loyalty_card}, labels,
   * rating, review_count), facets (category, price_range, brand, new).
   *
   * Costs 1 credit.
   */
  async search(options: ActionSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Action (action.com, the European non-food discount store) product in
   * full on one market, by article number or link: the list item fields plus
   * images, brand_info, long_description, highlights, specifications, aisle,
   * category, sustainability, hazards, availability, related. An article the
   * market does not sell is a charged 404. No EAN (webshopProduct() has it).
   *
   * Costs 1 credit.
   */
  async product(options: ActionProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Up to 60 Action (action.com, the European non-food discount store)
   * articles priced on one market: requested, count, not_sold (codes the
   * market does not sell), items. Compare markets with one call per country.
   * None sold: a charged 404.
   *
   * Costs 1 credit.
   */
  async products(options: ActionProductsOptions): Promise<Record<string, unknown>> {
    return this.post("products", options);
  }

  /**
   * One Action (action.com, the European non-food discount store) category's
   * products by path, with filters, sort and paging.
   *
   * Costs 1 credit.
   */
  async category(options: ActionCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The Action (action.com, the European non-food discount store) category
   * tree on one market (15 departments, about 300 categories in 3 levels):
   * categories {category_id, name, path, url, level, child_count, children}.
   *
   * Costs 1 credit.
   */
  async categories(options: ActionCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One brand's products on Action (action.com, the European non-food
   * discount store), with sort, paging and filters.
   *
   * Costs 1 credit.
   */
  async brand(options: ActionBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * Action's (action.com, the European non-food discount store) own brands,
   * about 54 private labels: total_brands, brands {name, slug, url, image}.
   *
   * Costs 1 credit.
   */
  async brands(options: ActionBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /**
   * New products on one Action (action.com, the European non-food discount
   * store) market, about 200, with sort, paging and filters.
   *
   * Costs 1 credit.
   */
  async newArrivals(options: ActionNewArrivalsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("new-arrivals", options);
  }

  /**
   * This week's Action (action.com, the European non-food discount store)
   * deals on one market, about 130 to 190, 23 a page: week_id (e.g.
   * Promo2026Week47), label, valid_from, valid_to (ISO dates; a deal week
   * runs Wednesday to Tuesday), loyalty_deals (Belgium, Action Plus card
   * deals), items with regular_price (the price outside the deal).
   *
   * Costs 1 credit.
   */
  async weeklyDeals(options: ActionWeeklyDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("weekly-deals", options);
  }

  /**
   * One Action (action.com, the European non-food discount store) collection,
   * a seasonal moment page (black-friday, kerst, sinterklaas, basics), with
   * sort, paging and filters: collection, collection_tag, items. An unknown
   * slug is a charged 404.
   *
   * Costs 1 credit.
   */
  async collection(options: ActionCollectionOptions): Promise<Record<string, unknown>> {
    return this.post("collection", options);
  }

  /**
   * Action (action.com, the European non-food discount store) search
   * suggestions for a partial query: suggestions (search terms),
   * category_suggestion {query, category}, products (up to 5).
   *
   * Costs 1 credit.
   */
  async suggestions(options: ActionSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * The 20 Action (action.com, the European non-food discount store) stores
   * nearest a city, postcode or lat / lng: complete, count, countries, stores
   * {store_id, name, store, url, country_code, address, latitude, longitude,
   * distance_km (lat / lng input only), opening_date, closing_date, hours (7
   * dated days)}. They may cross a border. Action does not publish store stock.
   *
   * Costs 1 credit.
   */
  async stores(options: ActionStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One Action (action.com, the European non-food discount store) store by
   * reference, link, slug or store_id: address, coordinates, opening_date,
   * closing_date, hours (7 dated days). No phone, services or stock.
   *
   * Costs 1 credit.
   */
  async store(options: ActionStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * Customer reviews of one Action (action.com, the European non-food
   * discount store) article on nl, de, fr or pl, up to 100 per call: total,
   * local_total, international_total, has_more, reviews {review_id, language,
   * rating, title, text, reviewed_at, recommends, aspect_ratings, pros, cons}.
   * No reviewer identity. Other countries answer 400 (not charged).
   *
   * Costs 1 credit.
   */
  async reviews(options: ActionReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * Search the Action (action.com, the European non-food discount store)
   * webshop (shop.action.com: nl-nl, nl-be, fr-be) or one webshop category:
   * items {ean, product_code, title, price, regular_price, stock_level (online
   * stock, not store stock), stock_label, order_limit, shipping_cost, is_deal,
   * promo_label}.
   *
   * Costs 1 credit.
   */
  async webshopSearch(options: ActionWebshopSearchOptions): Promise<Record<string, unknown>> {
    return this.post("webshop-search", options);
  }

  /**
   * One Action (action.com, the European non-food discount store) webshop
   * product by EAN or link: stock_level, order_limit, order_minimum,
   * order_multiple, shipping_cost, availability {status, release_date,
   * end_date}, description, specifications, supplier, other_markets. An EAN
   * the webshop does not sell is a charged 404.
   *
   * Costs 1 credit.
   */
  async webshopProduct(options: ActionWebshopProductOptions): Promise<Record<string, unknown>> {
    return this.post("webshop-product", options);
  }
}
