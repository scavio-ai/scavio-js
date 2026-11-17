import type { Scavio } from "../client.js";

// bol.com: 9 endpoints, 2 credits each (product by ean 4, billed on actual cost).
//
// Storefronts (country + language), every endpoint: nl-nl (country "nl", the
// default; Dutch), be-nl (country "be"; Dutch) and be-fr (country "be",
// language "fr"; French). All EUR. language "fr" with country "nl" answers
// 400. Every answer carries country, language, storefront and currency.
//
// Product, EAN, category, seller and offer ids are the same on every
// storefront; prices, offers and stock can differ between the Netherlands and
// Belgium. product_id is a 16-digit STRING (too long for a JSON number). On
// be-fr bol's own texts are French, some partner titles stay Dutch and review
// texts are bol's translation (is_translated).
//
// reference_price_type is rrp (the supplier's recommended price) or
// most_shown_price (bol's most-shown non-promotional price over the last 90
// days); discount_percent is against it. brand_facet_id (the search /
// category filter, a value id of the brand facet: Apple 4294862300) and
// brand_id (items' brand.brand_id, brand(): Apple 5070005) are different id
// spaces. search() stops at page 10 (about 280 results); sorting by anything
// but relevance can narrow bol's result set, and price sorts follow bol's own
// ordering (small inversions against the live buy-box price occur). The
// listing endpoints (sellerProducts, category, brand, campaign) default to
// popularity and do not offer relevance. List items carry no EAN; the offers
// list does not mark the buy box (product's buy_box.offer_id names it).
// Reviews are the first 10 as bol shows them, pooled across the product
// family, with no reviewer names. Not available: search suggestions, review
// paging, seller review texts, price history or 30-day lowest price, pickup
// points, bol Select member prices, a variant selector.
//
// The server enforces the cross-field rules: product() takes exactly one of
// product_id, url or ean; offers() one of product_id or url; seller() and
// sellerProducts() one of seller_id or url; brand() one of brand_id or url;
// campaign() one of campaign_id or url. Every call raises the request timeout
// to BOLCOM_TIMEOUT. Failed upstream calls are not charged; a not-found is
// charged.

/** Minimum request timeout (ms) for every bolcom call: pages take 2-16 s and are retried once server-side within 225 s. */
export const BOLCOM_TIMEOUT = 240_000;

/** nl (bol.com Netherlands, default) or be (bol.com Belgium). */
export type BolcomCountry = "nl" | "be";

/** nl (default) or fr (only with country "be": storefront be-fr). */
export type BolcomLanguage = "nl" | "fr";

/** Search sorts: relevance (default), popularity, price_asc, price_desc, rating, wishlist. No newest. */
export type BolcomSearchSort = "relevance" | "popularity" | "price_asc" | "price_desc" | "rating" | "wishlist";

/** Listing sorts (sellerProducts, category, brand, campaign): popularity (default), price_asc, price_desc, rating, wishlist. */
export type BolcomListSort = "popularity" | "price_asc" | "price_desc" | "rating" | "wishlist";

/** new, refurbished or second_hand. */
export type BolcomCondition = "new" | "refurbished" | "second_hand";

/** Delivery filters as bol offers them. */
export type BolcomDelivery = "today" | "tomorrow" | "evening" | "sunday" | "free_shipping";

type Id = string | number;

export interface BolcomLocaleOptions {
  /** Storefront country. Defaults to "nl". */
  country?: BolcomCountry;
  /** Storefront language. Defaults to "nl"; "fr" only with country "be". */
  language?: BolcomLanguage;
}

export interface BolcomFilterOptions {
  /** Lowest price in euros. */
  price_min?: number;
  /** Highest price in euros. */
  price_max?: number;
  /** One or more conditions. */
  condition?: BolcomCondition | BolcomCondition[];
  /** Only products on a deal. */
  deals_only?: boolean;
  /** Only bol Select member deals. */
  select_deals?: boolean;
  /** One or more delivery filters. */
  delivery?: BolcomDelivery | BolcomDelivery[];
  /** A brand VALUE id from the brand facet of an earlier answer (e.g. 4294862300 = Apple). Not brand_id. */
  brand_facet_id?: Id;
  /** Facet value ids from facets[].values[].id of an earlier answer (up to 10); ids bol did not apply come back in filters_ignored. */
  facets?: Id[];
}

export interface BolcomListOptions {
  /** Results page, 1-based, about 24 items per page (max_page in the answer). */
  page?: number;
  /** Sort order. Defaults to "popularity". */
  sort?: BolcomListSort;
}

export interface BolcomSearchOptions extends BolcomLocaleOptions, BolcomFilterOptions {
  /** Search keywords, e.g. "airpods" (Dutch or French work best; an EAN finds that product). */
  query: string;
  /** Results page, 1-based, 1-10 (bol.com search stops at page 10). */
  page?: number;
  /** Sort order. Defaults to "relevance". */
  sort?: BolcomSearchSort;
  /** Search within one category, e.g. 8440. */
  category_id?: Id;
  [key: string]: unknown;
}

export interface BolcomProductOptions extends BolcomLocaleOptions {
  /** A bol.com product id as a STRING, e.g. "9300000239314960". One of product_id, url or ean. */
  product_id?: string;
  /** A bol.com product link; its storefront is used unless country / language are sent. */
  url?: string;
  /** An EAN / GTIN (8, 12, 13 or 14 digits), e.g. "4242005483976". 4 credits. */
  ean?: string;
  [key: string]: unknown;
}

export interface BolcomOffersOptions extends BolcomLocaleOptions {
  /** A bol.com product id as a STRING. One of product_id or url. */
  product_id?: string;
  /** A bol.com product link or its price overview link. */
  url?: string;
  [key: string]: unknown;
}

export interface BolcomSellerOptions extends BolcomLocaleOptions {
  /** A bol.com seller id, e.g. "1770745" ("0" is bol itself). One of seller_id or url. */
  seller_id?: Id;
  /** A bol.com seller page link. */
  url?: string;
  [key: string]: unknown;
}

export interface BolcomSellerProductsOptions extends BolcomSellerOptions, BolcomListOptions {
  [key: string]: unknown;
}

export interface BolcomCategoryOptions extends BolcomLocaleOptions, BolcomListOptions, BolcomFilterOptions {
  /** A bol.com category id, e.g. "8440". */
  category_id: Id;
  [key: string]: unknown;
}

export interface BolcomBrandOptions extends BolcomLocaleOptions, BolcomListOptions {
  /** A bol.com brand id (items' brand.brand_id), e.g. "5070005" (Apple). One of brand_id or url. */
  brand_id?: Id;
  /** A bol.com brand page link. */
  url?: string;
  [key: string]: unknown;
}

export interface BolcomDealsOptions extends BolcomLocaleOptions {
  [key: string]: unknown;
}

export interface BolcomCampaignOptions extends BolcomLocaleOptions, BolcomListOptions {
  /** A bol.com campaign id (labels[].campaign_id, day_deal.campaign_id), e.g. "555136". One of campaign_id or url. */
  campaign_id?: Id;
  /** A bol.com campaign (promotion) link. */
  url?: string;
  [key: string]: unknown;
}

export class BolcomNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/bolcom/${path}`, options, undefined, BOLCOM_TIMEOUT);
  }

  /**
   * Search bol.com by keyword: items (product_id, title, url, brand,
   * category, rating, offer: the buy box with price, reference_price,
   * reference_price_type, discount_percent, condition, seller_id,
   * seller_name, delivery_text, labels; sponsored), total, page, max_page,
   * has_more, sort, facets, filters_ignored, dominant_category. Up to page
   * 10; filters for price, condition, deals, Select deals, delivery,
   * category, brand facet and any facet value.
   *
   * Costs 2 credits.
   */
  async search(options: BolcomSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product by product_id, link or EAN (the competitor-price call): ean,
   * specifications, category_path, buy_box (price, reference price and type,
   * discount, seller with rating out of 10, shipping_cost, delivery promise),
   * offer_count, cheapest_new, fastest_new, cheapest_second_hand,
   * refurbished grades, rating with 1-5 distribution, review_topics and
   * review_summary (bol's own AI summaries), the first 10 reviews (pooled
   * across the product family, no reviewer names). An unknown product is a
   * charged 404.
   *
   * Costs 2 credits; 4 by ean (a search plus the product page).
   */
  async product(options: BolcomProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Every seller's offer for one product: counts (new, refurbished,
   * second_hand) and offers (price, reference price, condition with
   * refurbished_grade / second_hand_state, shipping_cost, delivery promise,
   * seller with rating out of 10, rating_percent, top_seller, labels). The
   * buy box is not marked: product()'s buy_box.offer_id names it.
   *
   * Costs 2 credits.
   */
  async offers(options: BolcomOffersOptions): Promise<Record<string, unknown>> {
    return this.post("offers", options);
  }

  /**
   * A seller's public profile: rating out of 10 with product_info,
   * delivery_time, shipping and service sub-ratings, positive_percent,
   * review totals, product_count and business (company_name, city, country,
   * registration_number, vat_number; no street address). No review texts.
   *
   * Costs 2 credits.
   */
  async seller(options: BolcomSellerOptions): Promise<Record<string, unknown>> {
    return this.post("seller", options);
  }

  /**
   * The products a seller sells, paged and sorted (default popularity); each
   * item's offer is the product's buy box, which may be another seller's.
   *
   * Costs 2 credits.
   */
  async sellerProducts(options: BolcomSellerProductsOptions): Promise<Record<string, unknown>> {
    return this.post("seller-products", options);
  }

  /**
   * Products in one category, paged, sorted (default popularity) and
   * filtered like search(), with the category breadcrumbs. An unknown
   * category is a charged 404.
   *
   * Costs 2 credits.
   */
  async category(options: BolcomCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * Products of one brand by brand_id or link, paged and sorted (default
   * popularity): brand (brand_id, name, premium_brand) and items.
   *
   * Costs 2 credits.
   */
  async brand(options: BolcomBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * Today's deals: day_deal (title, campaign_id, url, ends_at,
   * highlighted_product) and category_deals (products with price, reference
   * price, discount; seller_id only). Open the day deal with campaign().
   *
   * Costs 2 credits.
   */
  async deals(options: BolcomDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * The products of one promotion (a Black Friday list, the day deal) by
   * campaign_id or link, paged and sorted (default popularity): campaign
   * (campaign_id, name, description, type, ends_at) and items. An ended or
   * unknown campaign is a charged 404.
   *
   * Costs 2 credits.
   */
  async campaign(options: BolcomCampaignOptions): Promise<Record<string, unknown>> {
    return this.post("campaign", options);
  }
}
