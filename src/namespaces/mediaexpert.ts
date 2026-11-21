import type { Scavio } from "../client.js";

// Media Expert: 13 endpoints, billed on actual cost, 1 to 3 credits per call
// (credits_used in each answer is the exact charge).
//
// One store: mediaexpert.pl (Poland, PLN). There is no country input. Names,
// specifications, labels and reviews come back in Polish, as Media Expert
// writes them.
//
// Credits: product(), stores(), brands(), reviews() and suggestions() cost 1;
// storeStock() and categories() cost 2; search() costs 3 for a search page
// (Media Expert loads search lists lazily: one more lookup for the rest of the
// page) or 1 when Media Expert answers the term with a full category page;
// category(), brand(), outlet(), seller() and a promotion list's products cost
// 1 unsorted and 3 with a sort or a lazily loaded list (the promotion lists
// themselves and the outlet's groups cost 1).
//
// Prices are numbers in PLN: price, old_price (Media Expert's struck-through
// price, as shown), omnibus_lowest_30d (the lowest price of the last 30 days
// that Media Expert shows next to a promotion under the EU Omnibus Directive,
// as shown), code_price {price, code, valid_from, valid_to} (the price with a
// discount code, the code and its dates), discount_shown (Media Expert's own
// figure) and discount_percent (computed by Scavio).
//
// Store stock is Media Expert's stock indicator, a bucket (seen: 0, 2, 9, 20;
// 0 = none on the shelf), not a unit count, at the up to 40 stores nearest a
// Polish city, town or postcode, with collect_in_1h ("Odbierz za godzinę") and
// order_to_store_day when the item is not on the shelf. Send items[].product_id,
// not the offer id (refused before anything is charged). Marketplace items
// (sold and shipped by a marketplace seller) are never stocked in stores (a
// charged 400) and have no Media Expert reviews (a charged 404).
//
// Lists return 30 per page by default (limit 5, 10, 15, 20, 30 or 50), up to
// 100 pages, and stop counting at 5,000 (total_capped). Price sorts are Media
// Expert's own order, which follows promotional and code prices: re-sort a
// page for a strict order. There is no price filter; filters takes
// facets[].values[].filter. reviews(): up to 100 per page, every review
// reachable, 6 sorts, a star range and a verified-purchase filter, with
// verified_purchase and incentivized (a review from a Media Expert promotional
// campaign) flags; no reviewer identity. Not available: Q&A (Media Expert has
// none), leaflets, price history (poll and store the answers), unit counts,
// checkout prices, other countries or languages.
//
// The server enforces the cross-field rules: product() takes one of
// product_id or url; reviews() one of sku, product_id or url. Every call
// raises the request timeout to MEDIAEXPERT_TIMEOUT. Failed upstream calls are
// not charged; a not-found is charged.

/** Minimum request timeout (ms) for every mediaexpert call: calls can queue behind the server's upstream limit. */
export const MEDIAEXPERT_TIMEOUT = 240_000;

/**
 * relevance (default: Media Expert's own order), price_asc, price_desc (Media
 * Expert's own price order: approximate against price), rating, newest,
 * name_asc, name_desc, brand_asc, brand_desc, discount. Any sort costs 3 credits.
 */
export type MediaExpertSort =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "newest"
  | "name_asc"
  | "name_desc"
  | "brand_asc"
  | "brand_desc"
  | "discount";

/** most_helpful (default, Media Expert's own order), least_helpful, newest, oldest, highest_rating, lowest_rating. */
export type MediaExpertReviewSort =
  | "most_helpful"
  | "least_helpful"
  | "newest"
  | "oldest"
  | "highest_rating"
  | "lowest_rating";

/** Products per page: the page sizes Media Expert offers (default 30). */
export type MediaExpertLimit = 5 | 10 | 15 | 20 | 30 | 50;

/** A Media Expert product id: items[].product_id (up to 8 digits), never the offer id. */
export type MediaExpertProductId = string | number;

export interface MediaExpertListOptions {
  /** Sort. Defaults to "relevance"; any sort costs 3 credits. */
  sort?: MediaExpertSort;
  /** Page, 1 to 100 (total_pages says how deep the list goes). */
  page?: number;
  /** Products per page: 5, 10, 15, 20, 30 or 50 (default 30). */
  limit?: MediaExpertLimit;
}

export interface MediaExpertSearchOptions extends MediaExpertListOptions {
  /** Search text (Polish works best: "telewizor", "pralka", "iphone 17"). */
  query: string;
  /** Narrow the search to one category id (categories() categories[].category_id). */
  category_id?: string | number;
  [key: string]: unknown;
}

export interface MediaExpertProductOptions {
  /** Media Expert product id (items[].product_id), e.g. "8128227". One of product_id or url. */
  product_id?: MediaExpertProductId;
  /** A Media Expert product link (https://www.mediaexpert.pl/<category>/<product>). */
  url?: string;
  [key: string]: unknown;
}

export interface MediaExpertStoreStockOptions {
  /** Media Expert product id (items[].product_id), e.g. "8128227". Marketplace items are not stocked in stores. */
  product_id: MediaExpertProductId;
  /** A Polish city or town ("Warszawa", "Kraków", "Sanok") or a postcode ("00-950"). */
  location: string;
  /** Stores, nearest first, 1 to 40 (default 40). */
  limit?: number;
  [key: string]: unknown;
}

export interface MediaExpertStoresOptions {
  /** Only the stores in this city (case and Polish accents do not matter), e.g. "Warszawa". Omit both for every store. */
  city?: string;
  /** One store's page: stores[].store (e.g. "warszawa/al-jerozolimskie-148") or its mediaexpert.pl/sklepy/... link. */
  store?: string;
  [key: string]: unknown;
}

export interface MediaExpertReviewsOptions {
  /** Media Expert product code: items[].sku, e.g. "709727" (the cheapest way in: 1 call). One of sku, product_id or url. */
  sku?: string | number;
  /** Media Expert product id (items[].product_id). */
  product_id?: MediaExpertProductId;
  /** A Media Expert product link. */
  url?: string;
  /** Sort. Defaults to "most_helpful". */
  sort?: MediaExpertReviewSort;
  /** Lowest star rating to include (1-5). */
  rating_min?: 1 | 2 | 3 | 4 | 5;
  /** Highest star rating to include (1-5). With a star range Media Expert gives no total. */
  rating_max?: 1 | 2 | 3 | 4 | 5;
  /** Only reviews Media Expert marks as confirmed by purchase. */
  verified?: boolean;
  /** Page (every review is reachable). */
  page?: number;
  /** Reviews per page, 1 to 100 (default 10). */
  limit?: number;
  [key: string]: unknown;
}

export interface MediaExpertCategoryOptions extends MediaExpertListOptions {
  /** A category path (categories() categories[].path, breadcrumbs[].path) or its link, e.g. "agd/pralki-i-suszarki/pralki". */
  category: string;
  /** Up to 10 filters: facets[].values[].filter of an earlier answer. Several filters narrow together. */
  filters?: string | string[];
  [key: string]: unknown;
}

export interface MediaExpertCategoriesOptions {
  /** Start the tree at this category path (e.g. "agd"). */
  category?: string;
  /** Start the tree at this category id (e.g. "12900"). */
  category_id?: string | number;
  /** Levels to return, 1 to 6 (default 2 from the top, 3 from a category). */
  depth?: number;
  [key: string]: unknown;
}

export interface MediaExpertBrandsOptions {
  /** Only brands whose name contains this text, e.g. "sams". */
  query?: string;
  /** Only brands starting with this letter or digit. */
  letter?: string;
  /** Page. */
  page?: number;
  /** Brands per page, 1 to 1000 (default 100). */
  limit?: number;
  [key: string]: unknown;
}

export interface MediaExpertBrandOptions extends MediaExpertListOptions {
  /** A brand: brands[].slug (e.g. "samsung", "amica") or its mediaexpert.pl/<brand> link. */
  brand: string;
  /** Only this brand inside one category path. */
  category?: string;
  /** Up to 10 filters: facets[].values[].filter. */
  filters?: string | string[];
  [key: string]: unknown;
}

export interface MediaExpertPromotionsOptions extends MediaExpertListOptions {
  /** One promotion list: lists[].list or its mediaexpert.pl/lista,... link. Without it, the promotion lists. */
  list?: string;
  /** Only lists whose name or reference contains this text (without list). */
  query?: string;
  /** Only Black Weeks / Black Friday lists (without list). */
  black_weeks?: boolean;
  [key: string]: unknown;
}

export interface MediaExpertOutletOptions extends MediaExpertListOptions {
  /** An outlet group path (subcategories[].path). Without it, the outlet's groups. */
  category?: string;
  /** Up to 10 filters: facets[].values[].filter. */
  filters?: string | string[];
  [key: string]: unknown;
}

export interface MediaExpertSellerOptions extends MediaExpertListOptions {
  /** A marketplace seller: items[].seller.slug (e.g. "autobi") or its mediaexpert.pl/sprzedawca-marketplace/... link. */
  seller: string;
  [key: string]: unknown;
}

export interface MediaExpertSuggestionsOptions {
  /** What the shopper has typed so far, e.g. "pral". */
  query: string;
  /** Suggestions, 1 to 10 (default 8, as on the site). */
  limit?: number;
  [key: string]: unknown;
}

export class MediaExpertNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/mediaexpert/${path}`, options, undefined, MEDIAEXPERT_TIMEOUT);
  }

  /**
   * Search Media Expert: query, category_id, redirected_to (Media Expert sends
   * many single words to a category page, e.g. telewizor), sort, page,
   * page_size, total (stops at 5,000: total_capped), total_pages, has_more,
   * count, currency, items (product_id, offer_id, sku, ean, name, brand, price,
   * old_price, omnibus_lowest_30d, code_price, discount_percent,
   * discount_shown, availability, rating, review_count, seller {id, name,
   * slug, marketplace}, in_store, energy_class, category, labels), facets.
   *
   * Costs 3 credits for a search page, 1 when Media Expert answers with a full
   * category page.
   */
  async search(options: MediaExpertSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product by product_id or link: the list item fields plus eans,
   * description, images, key_attributes, specifications, variants, delivery
   * {delivery_label, store_pickup_label, parcel_locker_label, collect_in_1h,
   * delivery_info, min_shipping_price}, installments, seller with rating,
   * preorder, renewed, first_listed_at, rating_summary, breadcrumbs, related.
   * A product Media Expert no longer lists is a charged 404.
   *
   * Costs 1 credit.
   */
  async product(options: MediaExpertProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One product's stock indicator at the up to 40 Media Expert stores nearest
   * a Polish city, town or postcode: count, in_stock_count,
   * collect_in_1h_count, stores {store_id, name, type (store or pickup_point),
   * address, phone, distance_km, hours, stock_level (a bucket, not a unit
   * count), in_stock, collect_in_1h, order_to_store_day, availability_label}.
   * An offer id is a 400 before anything is charged; an unknown product id a
   * charged 404; a marketplace item a charged 400.
   *
   * Costs 2 credits.
   */
  async storeStock(options: MediaExpertStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /**
   * Every Media Expert store (about 640) or one city's stores (address,
   * hours, closed_today, next_open_day, services), or one store's page by
   * stores[].store with phone, events and alerts. No stock: use storeStock().
   *
   * Costs 1 credit.
   */
  async stores(options: MediaExpertStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * Media Expert's own reviews of one product, by sku, product_id or link, up
   * to 100 per page: total, average_rating, recommendations,
   * verified_purchases, features, reviews {id, rating, title, text,
   * created_at, verified_purchase, incentivized, incentive_label,
   * feature_ratings, helpful_yes, helpful_no, store_reply_count}. No reviewer
   * identity. Marketplace offers have no Media Expert reviews (charged 404).
   *
   * Costs 1 credit.
   */
  async reviews(options: MediaExpertReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * One category's products by path, with facet filters, sorts and paging
   * (kind subcategories for a parent category page).
   *
   * Costs 1 credit unsorted, 3 with a sort or a lazily loaded list.
   */
  async category(options: MediaExpertCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The category tree (24 departments, about 5,000 categories) or one
   * subtree: categories {category_id, name, path, url, product_count,
   * child_count, children}.
   *
   * Costs 2 credits.
   */
  async categories(options: MediaExpertCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * The brand directory (about 16,000 brands): total_brands, matches,
   * featured, brands {brand_id, name, slug, url}.
   *
   * Costs 1 credit.
   */
  async brands(options: MediaExpertBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /**
   * One brand's products, optionally inside a category, with filters, sorts
   * and paging.
   *
   * Costs 1 credit unsorted, 3 with a sort or a lazily loaded list.
   */
  async brand(options: MediaExpertBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * Promotion lists, Black Weeks included (lists {list, list_id, name, url,
   * black_weeks}), or with list, that list's products.
   *
   * Costs 1 credit for the lists; a list's products 1 unsorted, 3 with a sort
   * or a lazily loaded list.
   */
  async promotions(options: MediaExpertPromotionsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("promotions", options);
  }

  /**
   * The outlet (ex-display, returned and end-of-line items): its groups, or
   * one group's subgroups or products. old_price is the price before the
   * outlet price.
   *
   * Costs 1 credit unsorted, 3 with a sort or a lazily loaded list.
   */
  async outlet(options: MediaExpertOutletOptions = {}): Promise<Record<string, unknown>> {
    return this.post("outlet", options);
  }

  /**
   * A marketplace seller: seller {seller_id, name, slug, url, rating,
   * min_shipping_price, delivery_info, categories} and its offers.
   *
   * Costs 1 credit unsorted, 3 with a sort or a lazily loaded list.
   */
  async seller(options: MediaExpertSellerOptions): Promise<Record<string, unknown>> {
    return this.post("seller", options);
  }

  /**
   * Search suggestions for a partial query: suggestions {phrase, searches
   * (Media Expert's count), average_results}, categories {name, path, url}.
   *
   * Costs 1 credit.
   */
  async suggestions(options: MediaExpertSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
