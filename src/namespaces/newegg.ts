import type { Scavio } from "../client.js";

// Newegg (newegg.com, the US computer and electronics store) search, category, categories, product,
// offers, reviews, deals, seller, sellerProducts and suggestions endpoints; country us, ca or one
// of 9 Newegg Global storefronts (local currency), 2 credits each. Generated from the backend
// routes: every option and its doc mirrors the API's own request schema; an input the API only
// accepts to refuse (a 400 that says 'not offered') is left out. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to NEWEGG_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused
// inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every newegg call. */
export const NEWEGG_TIMEOUT = 240_000;

export interface NeweggSearchOptions {
  /** Keywords. */
  query: string;
  /**
   * us (default; www.newegg.com, USD), ca (www.newegg.ca, CAD) or a Newegg Global storefront: uk,
   * au, nz, jp, ph, sg, kr, th, mx (local currency, part of the catalog, English).
   */
  country?: "us" | "ca" | "uk" | "au" | "nz" | "jp" | "ph" | "sg" | "kr" | "th" | "mx";
  /**
   * Up to 10 filters: sold_by_newegg, in_stock, new, recertified, used, open_box,
   * lowest_price_30_days, 40_percent_off, or a facet id from an answer's facets[].options[].id
   * (brands, specs, price bands).
   */
  filters?: string[];
  /**
   * featured (default, the site's order), price_asc, price_desc, best_selling, top_rated or
   * most_reviews.
   */
  sort?: "featured" | "price_asc" | "price_desc" | "best_selling" | "top_rated" | "most_reviews";
  /**
   * Page, from 1 (36 to 60 items per page as the site lists them). A page past the last answers no
   * items.
   */
  page?: number;
  [key: string]: unknown;
}

export interface NeweggCategoryOptions {
  /**
   * A category id of this storefront: categories[].category_id of categories (us) or of a search
   * answer (every storefront), breadcrumbs[].category_id, or a category link's N=. Ids differ per
   * storefront (GPUs: 100007709 us, 100007708 ca).
   */
  category_id: string;
  /** Keywords within the category. */
  query?: string;
  /**
   * us (default; www.newegg.com, USD), ca (www.newegg.ca, CAD) or a Newegg Global storefront: uk,
   * au, nz, jp, ph, sg, kr, th, mx (local currency, part of the catalog, English).
   */
  country?: "us" | "ca" | "uk" | "au" | "nz" | "jp" | "ph" | "sg" | "kr" | "th" | "mx";
  /**
   * Up to 10 filters: sold_by_newegg, in_stock, new, recertified, used, open_box,
   * lowest_price_30_days, 40_percent_off, or a facet id from an answer's facets[].options[].id
   * (brands, specs, price bands).
   */
  filters?: string[];
  /**
   * featured (default, the site's order), price_asc, price_desc, best_selling, top_rated or
   * most_reviews.
   */
  sort?: "featured" | "price_asc" | "price_desc" | "best_selling" | "top_rated" | "most_reviews";
  /**
   * Page, from 1 (36 to 60 items per page as the site lists them). A page past the last answers no
   * items.
   */
  page?: number;
  [key: string]: unknown;
}

export interface NeweggCategoriesOptions {
  /** us (default; the newegg.com menu). Other markets are a 400. */
  country?: "us" | "ca" | "uk" | "au" | "nz" | "jp" | "ph" | "sg" | "kr" | "th" | "mx";
  [key: string]: unknown;
}

export interface NeweggProductOptions {
  /**
   * A Newegg item number: N82E16819113877 or 19-113-877 (R suffix = open box), 9SIA2W0KDW5195 (a
   * marketplace item) or 0D9-000E-00346 (search items[].item_number).
   */
  item_number: string;
  /**
   * us (default; www.newegg.com, USD), ca (www.newegg.ca, CAD) or a Newegg Global storefront: uk,
   * au, nz, jp, ph, sg, kr, th, mx (local currency, part of the catalog, English).
   */
  country?: "us" | "ca" | "uk" | "au" | "nz" | "jp" | "ph" | "sg" | "kr" | "th" | "mx";
  [key: string]: unknown;
}

export interface NeweggOffersOptions {
  /**
   * A Newegg item number: N82E16819113877 or 19-113-877 (R suffix = open box), 9SIA2W0KDW5195 (a
   * marketplace item) or 0D9-000E-00346 (search items[].item_number).
   */
  item_number: string;
  /**
   * us (default; www.newegg.com, USD) or ca (www.newegg.ca, CAD). The Newegg Global storefronts do
   * not serve this endpoint (400).
   */
  country?: "us" | "ca" | "uk" | "au" | "nz" | "jp" | "ph" | "sg" | "kr" | "th" | "mx";
  /** all (default), new or used. */
  condition?: "all" | "new" | "used";
  /** price (default, low to high) or seller_rating. */
  sort?: "price" | "seller_rating";
  /** Offers page, 1 to 50. */
  page?: number;
  /** Offers per page, 1 to 20 (default 20). */
  page_size?: number;
  [key: string]: unknown;
}

export interface NeweggReviewsOptions {
  /**
   * A Newegg item number: N82E16819113877 or 19-113-877 (R suffix = open box), 9SIA2W0KDW5195 (a
   * marketplace item) or 0D9-000E-00346 (search items[].item_number).
   */
  item_number: string;
  /** review_params.group_id of the product (or search) answer for this item. */
  group_id: number;
  /** review_params.subcategory_id of the product (or search) answer for this item. */
  subcategory_id: number;
  /**
   * us (default; www.newegg.com, USD), ca (www.newegg.ca, CAD) or a Newegg Global storefront: uk,
   * au, nz, jp, ph, sg, kr, th, mx (local currency, part of the catalog, English).
   */
  country?: "us" | "ca" | "uk" | "au" | "nz" | "jp" | "ph" | "sg" | "kr" | "th" | "mx";
  /** most_helpful (default), newest, highest_rated or lowest_rated. */
  sort?: "most_helpful" | "newest" | "highest_rated" | "lowest_rated";
  /** Reviews with this star rating. */
  rating?: number;
  /** Verified owners' reviews when true. */
  verified_only?: boolean;
  /** Page of 25 reviews, from 1. */
  page?: number;
  [key: string]: unknown;
}

export interface NeweggDealsOptions {
  /**
   * shell_shocker (default, Newegg's daily deals) or black_friday (the Black Friday event store).
   */
  type?: "shell_shocker" | "black_friday";
  /** Deals in this category (the answer's categories[].category_id). */
  category_id?: string;
  /**
   * us (default; www.newegg.com, USD) or ca (www.newegg.ca, CAD). The Newegg Global storefronts do
   * not serve this endpoint (400).
   */
  country?: "us" | "ca" | "uk" | "au" | "nz" | "jp" | "ph" | "sg" | "kr" | "th" | "mx";
  /**
   * Page, from 1 (36 to 60 items per page as the site lists them). A page past the last answers no
   * items.
   */
  page?: number;
  [key: string]: unknown;
}

export interface NeweggSellerOptions {
  /**
   * A marketplace seller's store key: items[].seller.url_key of search or offers, or a
   * /Seller-Store/ link.
   */
  seller: string;
  /**
   * us (default; www.newegg.com, USD) or ca (www.newegg.ca, CAD). The Newegg Global storefronts do
   * not serve this endpoint (400).
   */
  country?: "us" | "ca" | "uk" | "au" | "nz" | "jp" | "ph" | "sg" | "kr" | "th" | "mx";
  [key: string]: unknown;
}

export interface NeweggSellerProductsOptions {
  /** The seller's listing id: seller_id of the seller answer. */
  seller_id: string;
  /** Keywords within the seller's items. */
  query?: string;
  /**
   * us (default; www.newegg.com, USD) or ca (www.newegg.ca, CAD). The Newegg Global storefronts do
   * not serve this endpoint (400).
   */
  country?: "us" | "ca" | "uk" | "au" | "nz" | "jp" | "ph" | "sg" | "kr" | "th" | "mx";
  /**
   * Up to 10 filters: sold_by_newegg, in_stock, new, recertified, used, open_box,
   * lowest_price_30_days, 40_percent_off, or a facet id from an answer's facets[].options[].id
   * (brands, specs, price bands).
   */
  filters?: string[];
  /**
   * featured (default, the site's order), price_asc, price_desc, best_selling, top_rated or
   * most_reviews.
   */
  sort?: "featured" | "price_asc" | "price_desc" | "best_selling" | "top_rated" | "most_reviews";
  /**
   * Page, from 1 (36 to 60 items per page as the site lists them). A page past the last answers no
   * items.
   */
  page?: number;
  [key: string]: unknown;
}

export interface NeweggSuggestionsOptions {
  /** What has been typed so far. */
  query: string;
  /**
   * us (default; www.newegg.com, USD) or ca (www.newegg.ca, CAD). The Newegg Global storefronts do
   * not serve this endpoint (400).
   */
  country?: "us" | "ca" | "uk" | "au" | "nz" | "jp" | "ph" | "sg" | "kr" | "th" | "mx";
  [key: string]: unknown;
}

export class NeweggNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = NEWEGG_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/newegg/${path}`, options, undefined, timeout);
  }

  /**
   * Keyword search on Newegg (newegg.com, the US computer and electronics store). Scavio fetches
   * the public Newegg page on request; Newegg has no public product API (its developer API is for
   * marketplace sellers). Filters by name (sold_by_newegg, in_stock, new, recertified, used,
   * open_box, lowest_price_30_days, 40_percent_off) or facet id; sorts featured, price_asc,
   * price_desc, best_selling, top_rated, most_reviews. Costs 2 credits.
   */
  async search(options: NeweggSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * The items of one category (category_id from categories, or from a search answer's categories on
   * ca and the Global storefronts. Costs 2 credits.
   */
  async category(options: NeweggCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The newegg.com menu tree: department_count, category_count, categories [{name, category_id,
   * link, children}], notes. category_id is the id category takes. Market. Costs 2 credits.
   */
  async categories(options: NeweggCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One item by item number: item_number, buy_box_changed, requested_item, served_item,
   * parent_item, title, brand, model, mpn, upc, url, currency, list_price, original_price, price,
   * instant_rebate, lowest_price_30_days, is_lowest_price_30_days, black_friday_save_percent, promo
   * {text, code, code_discount}, promo_expires_at, shell_shocker, badges [{title, starts_at,
   * ends_at}], in_stock, stock, quantity_limit, shipping, ship_from_country, seller {name, url_key,
   * marketplace, rating, review_count, top_rated}, shipped_by_newegg, open_box, refurbished,
   * rating, review_count, review_params {group_id, subcategory_id}, category, breadcrumbs, bullets,
   * specs [{group, specs [{name, value}]}], warranty, images, variants {options, items
   * [{item_number, options, active}]}, combo_builder, package_options, review_summary {total,
   * stars}, reviews (those the page shows, up to 8, no reviewer names), questions [{que Costs 2
   * credits.
   */
  async product(options: NeweggProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** Every seller's offer on one item (Newegg's own included), by condition. Costs 2 credits. */
  async offers(options: NeweggOffersOptions): Promise<Record<string, unknown>> {
    return this.post("offers", options);
  }

  /**
   * Customer reviews of one item, 25 per page, with group_id and subcategory_id from the product
   * answer's review_params. Costs 2 credits.
   */
  async reviews(options: NeweggReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * Newegg's deal event stores: Shell Shocker (daily deals) or the Black Friday store, optionally
   * one category. Costs 2 credits.
   */
  async deals(options: NeweggDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /** A marketplace seller's public store details. Costs 2 credits. */
  async seller(options: NeweggSellerOptions): Promise<Record<string, unknown>> {
    return this.post("seller", options);
  }

  /**
   * The items one marketplace seller lists (seller_id from seller), with keywords, filters and
   * sorts as search. Costs 2 credits.
   */
  async sellerProducts(options: NeweggSellerProductsOptions): Promise<Record<string, unknown>> {
    return this.post("seller-products", options);
  }

  /** The search box's suggestions for what has been typed. Costs 2 credits. */
  async suggestions(options: NeweggSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
