import type { Scavio } from "../client.js";

// IKEA: 12 endpoints across 55 markets, 1 credit each; compare() costs 1
// credit per market that answered. country is the market code (default "us"),
// language one of that market's languages (ca en/fr, be nl/fr/en, ch
// de/fr/it/en, us en/es ...). Data comes in the market's language and prices
// in its own currency, never converted; every answer echoes country, language
// and currency.
//
// Markets: search() and product() serve 55 (the 50 ikea.com markets plus cn,
// pr, do, es_islands with island, and is); category(), deals(), suggestions()
// and items() the 50 ikea.com markets plus cn; reviews(), categories(),
// stores(), stock() and compare() the 50 ikea.com markets; asIs() 13 markets.
// A market outside an endpoint's list answers 400 before anything is charged.
// The server enforces the cross-field rules: product() and reviews() take
// item_no or url; category() takes category_id or url; es_islands needs
// island. product() and reviews() raise the request timeout to
// IKEA_PRODUCT_TIMEOUT (a product page can take up to about 100 s), the rest to
// IKEA_TIMEOUT. Failed upstream calls are not charged; an unknown article
// number, category or store id is a charged 404.

/** Minimum request timeout (ms) for every ikea call except product() and reviews(). */
export const IKEA_TIMEOUT = 120_000;
/** Minimum request timeout (ms) for product() and reviews(). */
export const IKEA_PRODUCT_TIMEOUT = 180_000;

/**
 * An IKEA market code, lowercase. The 50 ikea.com markets: us ca gb ie de at
 * ch fr be nl dk se no fi ee lv lt pl cz sk hu hr si rs ro pt es it il ae sa
 * kw qa bh om jo eg ma in my sg ph th jp kr au nz mx cl co; plus cn
 * (ikea.cn), pr (Puerto Rico), do (Dominican Republic), es_islands (Canary
 * and Balearic islands) and is (Iceland) where an endpoint serves them.
 */
export type IkeaCountry = string;

/** The Canary and Balearic island storefronts (country "es_islands"). */
export type IkeaIsland =
  | "tenerife"
  | "grancanaria"
  | "lanzarote"
  | "fuerteventura"
  | "lapalma"
  | "lagomera"
  | "elhierro"
  | "mallorca"
  | "menorca"
  | "ibiza";

/** relevance (default), price_asc, price_desc, newest, rating, name_asc or most_popular. */
export type IkeaSort =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "rating"
  | "name_asc"
  | "most_popular";

/** With store_id: in_store (in stock at the store), click_collect or online. */
export type IkeaAvailability = "in_store" | "click_collect" | "online";

/** The deal lists deals() reads. lowest_price is the lowest-price range. */
export type IkeaDealType =
  | "new_products"
  | "family_price"
  | "new_lower_price"
  | "last_chance"
  | "lowest_price"
  | "top_seller"
  | "limited_edition"
  | "time_restricted"
  | "in_store_price_only"
  | "reduced_price_offer";

/** An IKEA article number: 8 digits, dots allowed ("80275887", "802.758.87"). Use a string to keep leading zeros. */
export type IkeaItemNo = string | number;

/** An IKEA store id (stores[].store_id of stores()), e.g. "399". */
export type IkeaStoreId = string | number;

export interface IkeaMarketOptions {
  /** Market code, lowercase. Defaults to "us". */
  country?: IkeaCountry;
  /** The answer's language: one the market serves (defaults to its first). */
  language?: string;
}

export interface IkeaGridOptions {
  /** Results page, 1-based. */
  page?: number;
  /** Products per page (default 24, up to 100). */
  page_size?: number;
  /** Sort order. Defaults to relevance. */
  sort?: IkeaSort;
  /** Color id(s) from facets (parameter f-colors), e.g. "10156" = white. */
  color?: string | string[];
  /** A price range id from facets (parameter f-price-buckets), e.g. "PRICE_0_5000". */
  price_bucket?: string;
  /** Only new products. */
  new_only?: boolean;
  /** Only last-chance (being discontinued) products. */
  last_chance?: boolean;
  /** Only products with an IKEA Family member price. */
  family_price?: boolean;
  /** Only best sellers. */
  top_seller?: boolean;
  /** Adds each product's availability at this store (stock level, home delivery) and enables availability. */
  store_id?: IkeaStoreId;
  /** With store_id: in_store, click_collect or online. */
  availability?: IkeaAvailability;
  /** Any other facet, keyed by facets[].parameter: {"f-materials": ["47350"]}; boolean facets take true. */
  filters?: Record<string, string | string[] | boolean>;
}

export interface IkeaSearchOptions extends IkeaMarketOptions, IkeaGridOptions {
  /** Search keywords, in any language the market serves, e.g. "kallax". */
  query: string;
  /** Required with country "es_islands": which island. */
  island?: IkeaIsland;
  /** Narrow to category id(s) from facets (parameter f-subcategories), e.g. "st002". */
  category_id?: string | string[];
  [key: string]: unknown;
}

export interface IkeaProductOptions extends IkeaMarketOptions {
  /** An IKEA article number. One of item_no or url. */
  item_no?: IkeaItemNo;
  /** An IKEA product page of a served market (the market and language are read from it). */
  url?: string;
  /** Required with country "es_islands": which island. */
  island?: IkeaIsland;
  [key: string]: unknown;
}

export interface IkeaReviewsOptions extends IkeaMarketOptions {
  /** An IKEA article number. One of item_no or url. */
  item_no?: IkeaItemNo;
  /** An ikea.com product page. */
  url?: string;
  [key: string]: unknown;
}

export interface IkeaCategoryOptions extends IkeaMarketOptions, IkeaGridOptions {
  /** A category id (categories[].id of categories()), e.g. "10382" = bookcases. One of category_id or url. */
  category_id?: string;
  /** An IKEA category page, e.g. "https://www.ikea.com/us/en/cat/bookcases-10382/". */
  url?: string;
  [key: string]: unknown;
}

export interface IkeaCategoriesOptions extends IkeaMarketOptions {
  /** Return only this category's subtree (categories[].id). */
  parent_id?: string;
  [key: string]: unknown;
}

export interface IkeaDealsOptions extends IkeaMarketOptions, IkeaGridOptions {
  /** The deal list, e.g. "new_lower_price". */
  type: IkeaDealType;
  [key: string]: unknown;
}

export interface IkeaSuggestionsOptions extends IkeaMarketOptions {
  /** What the user has typed so far, e.g. "sof". */
  query: string;
  [key: string]: unknown;
}

export interface IkeaStoresOptions extends IkeaMarketOptions {
  /** Only stores whose name, city, ZIP / postal code or address contains this text. */
  query?: string;
  /** With lng: stores sorted by distance from this point (distance_km). */
  lat?: number;
  /** With lat. */
  lng?: number;
  /** Stores to return (default 50, up to 200). */
  limit?: number;
  [key: string]: unknown;
}

export interface IkeaStockOptions extends IkeaMarketOptions {
  /** 1 to 100 article numbers (a list or a comma-separated string). */
  item_nos: IkeaItemNo[] | string;
  /** The store (stores[].store_id of stores(), on the same market). */
  store_id: IkeaStoreId;
  /** A postal code: adds home-delivery availability to that address. */
  zip?: string;
  [key: string]: unknown;
}

export interface IkeaItemsOptions extends IkeaMarketOptions {
  /** 1 to 100 article numbers (a list or a comma-separated string). */
  item_nos: IkeaItemNo[] | string;
  [key: string]: unknown;
}

export interface IkeaCompareOptions {
  /** The article number to price on every market. */
  item_no: IkeaItemNo;
  /** 2 to 10 ikea.com market codes, e.g. ["de", "fr", "se", "nl", "es", "it"]. */
  countries: IkeaCountry[];
  [key: string]: unknown;
}

export interface IkeaAsIsOptions extends IkeaMarketOptions {
  /** The store (stores[].store_id of stores(), on the same market). */
  store_id: IkeaStoreId;
  /** Results page, 1-based. */
  page?: number;
  /** Products per page (default 24, up to 48). */
  page_size?: number;
  [key: string]: unknown;
}

export class IkeaNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, minTimeout = IKEA_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/ikea/${path}`, options, undefined, minTimeout);
  }

  /**
   * Search IKEA products by keyword on any of 55 markets: query, total, page,
   * page_size, total_pages, count, sort, applied_filters, facets (name,
   * parameter, type, values), did_you_mean, related_searches, content and
   * items with item_no, item_no_global, is_combination, name, type_name,
   * design, measure_text, url, image, images, price, previous_price,
   * discount_amount, discount_percent, price_tag (family_price,
   * new_lower_price, lower_price_in_store, new_product, discontinued or
   * none), price_tag_text, lowest_price, price_valid_from / to, rating,
   * rating_count (pooled across markets), badge, colors, variant_count,
   * variants, last_chance, online_sellable, category_path and availability
   * (with store_id). The franchise sites (pr, do, es_islands, is) take query
   * and page only; Puerto Rico, Dominican Republic and the islands return the
   * first 40 results only.
   *
   * Costs 1 credit.
   */
  async search(options: IkeaSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One IKEA product by article number or product URL: item_no,
   * article_number, name, full_name, type_name, summary, description, url,
   * price, previous_price, price_valid_from / to, family_price, currency,
   * images, rating, rating_count, measurements, materials, care,
   * good_to_know, safety, packaging, assembly_pdfs, manuals, designer,
   * variants, secondary_ratings, reviews_preview (3 newest),
   * availability_online and detail_level. The franchise sites (pr, do,
   * es_islands, is) answer basic detail. Can take up to about 100 seconds.
   *
   * Costs 1 credit.
   */
  async product(options: IkeaProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options, IKEA_PRODUCT_TIMEOUT);
  }

  /**
   * An IKEA product's rating, rating_count, secondary_ratings and the 20
   * most recent reviews the product page shows (title, text, rating, date,
   * author, country), plus highlighted reviews. No paging, sort or star
   * filter. Ratings and reviews are pooled across IKEA markets. Can take up
   * to about 100 seconds.
   *
   * Costs 1 credit.
   */
  async reviews(options: IkeaReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options, IKEA_PRODUCT_TIMEOUT);
  }

  /**
   * One IKEA category's products by category_id or url, with the search
   * sorts and filters: category (id, name, url, parents) and the search
   * fields. An unknown category id is a charged 404.
   *
   * Costs 1 credit.
   */
  async category(options: IkeaCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The market's IKEA category tree (about 1,500 categories): id (for
   * category()), name, url and children; plus parent_id and count.
   *
   * Costs 1 credit.
   */
  async categories(options: IkeaCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One of the market's IKEA deal lists (new_products, family_price,
   * new_lower_price, last_chance, lowest_price, top_seller, limited_edition,
   * time_restricted, in_store_price_only, reduced_price_offer), with the
   * search sorts and filters: type and the search fields.
   *
   * Costs 1 credit.
   */
  async deals(options: IkeaDealsOptions): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * What the IKEA search box suggests for a partial query: suggestions with
   * text, type (completion, category, product, planner, content), label,
   * url, category_id, item_no and image when given.
   *
   * Costs 1 credit.
   */
  async suggestions(options: IkeaSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * The market's IKEA stores and pick-up / plan-and-order points: store_id,
   * name, display_name, type, address, latitude, longitude, hours,
   * restaurant, bistro, cafe, click & collect, Swedish Food Market and
   * Smaland hours, store_url and opening_date (distance_km with lat / lng).
   *
   * Costs 1 credit.
   */
  async stores(options: IkeaStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * Stock at one IKEA store for up to 100 article numbers: store (id, name),
   * zip, items (item_no, name, type_name, design, url, price,
   * store_availability with status in_stock_high, in_stock_low or
   * out_of_stock, home_delivery, click_collect) and not_found. A level, not
   * a quantity. An unknown store id is a charged 404.
   *
   * Costs 1 credit.
   */
  async stock(options: IkeaStockOptions): Promise<Record<string, unknown>> {
    return this.post("stock", options);
  }

  /**
   * Up to 100 IKEA article numbers on one market in one call, each with the
   * search item fields; numbers the market does not sell are in not_found.
   *
   * Costs 1 credit.
   */
  async items(options: IkeaItemsOptions): Promise<Record<string, unknown>> {
    return this.post("items", options);
  }

  /**
   * IKEA prices by country: one article number across 2 to 10 ikea.com
   * markets. Returns item_no, count, found_count, markets (country,
   * language, currency, found, name, type_name, design, price,
   * previous_price, price_tag, url), errors and note. Prices are in each
   * market's own currency, never converted. Some markets (us, ca, jp, au,
   * kr, in, my, sg, ph ...) sell the same product under a different article
   * number, so found is false there.
   *
   * Costs 1 credit per market that answered (the balance must cover every
   * market asked); a market that fails is listed in errors and not charged.
   */
  async compare(options: IkeaCompareOptions): Promise<Record<string, unknown>> {
    return this.post("compare", options);
  }

  /**
   * One IKEA store's As-is offers (ex-display, returned and second-hand
   * items): store_id, total, page, page_size, total_pages and offers (title,
   * description, article_numbers, currency, original_price, min_price,
   * max_price, image and offers with offer_id, offer_number, price,
   * lowest_previous_price, condition, in_box, reason_discount). Served in
   * us, gb, de, fr, se, jp, nl, es, it, pl, au, ch and at.
   *
   * Costs 1 credit.
   */
  async asIs(options: IkeaAsIsOptions): Promise<Record<string, unknown>> {
    return this.post("as-is", options);
  }
}
