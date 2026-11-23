import type { Scavio } from "../client.js";

// Instacart (instacart.com, the US and Canada grocery delivery and pickup
// marketplace; instacart.ca for Canada): 11 endpoints, 1 credit each; search()
// 3 (2 when the page fits in Instacart's first answer); crossSearch() 3 for
// up to 5 stores, 4 for 6 to 10.
//
// Markets: country us (default, instacart.com, USD) on every endpoint; ca
// (instacart.ca, CAD, zip a Canadian postal code) on every endpoint except
// crossSearch() and reviews() (a 400, not charged). language fr (Canada only)
// returns French names, aisles and price text as Instacart shows them in
// Quebec; suggestions() are English only. Every endpoint but reviews() takes
// a zip; a ZIP with no Instacart service area answers 200 with an empty list
// and a note.
//
// Every price is Instacart's price for that store, ZIP and service type,
// named in priced_for {retailer_id, retailer_slug, retailer_name,
// service_type, shop_id, retailer_location_id, zip, pricing_label (the
// retailer's pricing statement as Instacart shows it)}. Retailers set their
// Instacart prices, which can be above their in-store prices, so an Instacart
// delivery price is not the store's shelf price; service_type "instore"
// returns Instacart's in-store prices where it shows them. product_id is the
// same at every store. priceCompare() returns Instacart delivery prices with
// no unit price or stock (product() gives them per store). Not available:
// delivery and service fees or order minimums as numbers (Instacart shows
// them at checkout), coupons, Instacart+ member prices, account, order or
// cart data, price history (poll and store the answers).
//
// The server enforces the cross-field rules: zip must match country; language
// fr needs country ca; product() needs retailer unless the product link names
// the store. Every call raises the request timeout to INSTACART_TIMEOUT.
// Failed upstream calls and refused inputs are not charged; a not-found is
// charged.

/** Minimum request timeout (ms) for every instacart call: calls can queue behind the server's upstream limit. */
export const INSTACART_TIMEOUT = 240_000;

/** us (instacart.com, USD, default) or ca (instacart.ca, CAD). */
export type InstacartCountry = "us" | "ca";

/** en (default) or fr (country ca only). */
export type InstacartLanguage = "en" | "fr";

/** delivery (default), pickup or instore (Instacart's in-store prices, where it shows them). */
export type InstacartServiceType = "delivery" | "pickup" | "instore";

/** best_match (default, Instacart's order), price_asc or price_desc. */
export type InstacartSort = "best_match" | "price_asc" | "price_desc";

/** A US ZIP ("10001") or, with country ca, a Canadian postal code ("M5V 2T6" or "M5V2T6"). */
export type InstacartZip = string | number;

/** A retailer slug or id from retailers() (retailers[].slug or retailer_id, e.g. "costco", "jewel-osco", "wegmans"). */
export type InstacartRetailer = string | number;

/** An Instacart product id (items[].product_id, the same at every store), an item id or an Instacart product link. */
export type InstacartProductId = string | number;

interface InstacartMarket {
  /** The delivery ZIP or Canadian postal code: prices, stores and availability are for this location. */
  zip: InstacartZip;
  /** Defaults to "us". */
  country?: InstacartCountry;
  /** Defaults to "en"; "fr" needs country ca. */
  language?: InstacartLanguage;
}

interface InstacartPaging {
  /** Page, from 1 (1-100; total_pages says how deep the list goes). */
  page?: number;
  /** Products per page, 1-60 (default 30). */
  limit?: number;
}

export interface InstacartRetailersOptions extends InstacartMarket {
  [key: string]: unknown;
}

export interface InstacartSearchOptions extends InstacartMarket, InstacartPaging {
  /** Search keywords, e.g. "yogurt" (French keywords with language fr, e.g. "lait"). */
  query: string;
  /** The store to search; it must serve the ZIP. */
  retailer: InstacartRetailer;
  /** Defaults to "delivery". */
  service_type?: InstacartServiceType;
  /** Defaults to "best_match". */
  sort?: InstacartSort;
  /** true: only the products Instacart marks on sale at this store. */
  on_sale?: boolean;
  /** A brand id from brand_filters[].brand_id of an earlier search (e.g. "18514"). */
  brand_id?: string | number;
  [key: string]: unknown;
}

export interface InstacartCrossSearchOptions {
  /** Search keywords, e.g. "milk". */
  query: string;
  /** A US ZIP (cross-search is us only). */
  zip: InstacartZip;
  /** us only (the default). */
  country?: "us";
  /** Stores to price, 1-10 (default 5). 3 credits up to 5 stores, 4 above. */
  max_retailers?: number;
  /** Products per store, 1-20 (default 5). */
  items_per_retailer?: number;
  [key: string]: unknown;
}

export interface InstacartProductOptions extends InstacartMarket {
  product_id: InstacartProductId;
  /** Required unless the product link names the store. */
  retailer?: InstacartRetailer;
  /** Defaults to "delivery". */
  service_type?: InstacartServiceType;
  [key: string]: unknown;
}

export interface InstacartPriceCompareOptions extends InstacartMarket {
  product_id: InstacartProductId;
  [key: string]: unknown;
}

export interface InstacartCategoriesOptions extends InstacartMarket {
  retailer: InstacartRetailer;
  [key: string]: unknown;
}

export interface InstacartCategoryOptions extends InstacartMarket, InstacartPaging {
  /** A department or aisle slug from categories() (categories[].slug or categories[].aisles[].slug, e.g. "produce"). */
  category: string;
  retailer: InstacartRetailer;
  /** Defaults to "delivery". */
  service_type?: InstacartServiceType;
  [key: string]: unknown;
}

export interface InstacartDealsOptions extends InstacartMarket, InstacartPaging {
  retailer: InstacartRetailer;
  /** Defaults to "delivery". */
  service_type?: InstacartServiceType;
  [key: string]: unknown;
}

export interface InstacartStoresOptions extends InstacartMarket {
  retailer: InstacartRetailer;
  /** Stores to return, 1-50 (default 10). */
  limit?: number;
  [key: string]: unknown;
}

export interface InstacartSuggestionsOptions {
  /** What the shopper has typed so far, e.g. "eg". */
  query: string;
  zip: InstacartZip;
  /** That store's suggestions. Without it, suggestions across every store serving the ZIP. */
  retailer?: InstacartRetailer;
  /** Defaults to "us". Suggestions are English only. */
  country?: InstacartCountry;
  [key: string]: unknown;
}

export interface InstacartReviewsOptions {
  product_id: InstacartProductId;
  /** us only (the default). */
  country?: "us";
  /** Page, from 1 (15 reviews a page). */
  page?: number;
  [key: string]: unknown;
}

export class InstacartNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/instacart/${path}`, options, undefined, INSTACART_TIMEOUT);
  }

  /**
   * Every store on Instacart (instacart.com, the US and Canada grocery
   * delivery and pickup marketplace) serving a ZIP or Canadian postal code:
   * count, no_markups_count, retailers [{retailer_id, slug (the retailer
   * input of the other methods), name, delivery_eta, pickup_eta, no_markups
   * (Instacart's "No markups" label), accepts_ebt, delivery_available,
   * pickup_available}]. No delivery fees or order minimums.
   *
   * Costs 1 credit.
   */
  async retailers(options: InstacartRetailersOptions): Promise<Record<string, unknown>> {
    return this.post("retailers", options);
  }

  /**
   * Search one Instacart store at a ZIP: priced_for (store, service type,
   * ZIP, pricing_label), total, total_pages, items (product_id, name, size,
   * price, was_price, deal, unit_price, loyalty_price, stock, dietary),
   * brand_filters. Sort by price, filter to sale items or a brand, page
   * through every match. A retailer that does not serve the ZIP is a charged
   * 404.
   *
   * Costs 3 credits (2 when the page fits in Instacart's first answer).
   */
  async search(options: InstacartSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One query across up to 10 stores delivering to a US ZIP (us only), each
   * store's first matching products priced for delivery: retailers_matched,
   * groups [{retailer_slug, retailer_name, no_markups, matches, items}].
   *
   * Costs 3 credits for up to 5 stores (max_retailers), 4 for 6 to 10.
   */
  async crossSearch(options: InstacartCrossSearchOptions): Promise<Record<string, unknown>> {
    return this.post("cross-search", options);
  }

  /**
   * One product at one Instacart store: priced_for, available_at_store,
   * ingredients, directions, warnings (allergens as given), key_nutrients
   * (as Instacart lists them, not a full panel), images, item (the store's
   * price block, null when it shows no price), rating with its distribution.
   * An id Instacart does not know is a charged 404.
   *
   * Costs 1 credit.
   */
  async product(options: InstacartProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The same product priced at every store delivering to a ZIP, Instacart
   * delivery prices sorted low to high: stores_checked, count, prices
   * [{retailer_slug, retailer_name, price, was_price, discount_percent,
   * on_sale, no_markups}]. No unit price or stock (product() has them).
   *
   * Costs 1 credit.
   */
  async priceCompare(options: InstacartPriceCompareOptions): Promise<Record<string, unknown>> {
    return this.post("price-compare", options);
  }

  /**
   * One Instacart store's department and aisle tree: categories [{name, slug
   * (the input of category()), type, aisles [{name, slug}]}].
   *
   * Costs 1 credit.
   */
  async categories(options: InstacartCategoriesOptions): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * The products of one department, aisle or collection of an Instacart
   * store, paged: priced_for, total, total_pages, items. A slug the store
   * does not have is a charged 404.
   *
   * Costs 1 credit.
   */
  async category(options: InstacartCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One Instacart store's Sales collection, paged: sale prices with the
   * regular price (was_price) and multi-buy offers (deal). No coupons.
   *
   * Costs 1 credit.
   */
  async deals(options: InstacartDealsOptions): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * A retailer's pickup locations near a ZIP, nearest first: address,
   * coordinates, distance, phone, hours for the next 7 days (the 5 nearest).
   * Empty with a note when the retailer has no pickup there.
   *
   * Costs 1 credit.
   */
  async stores(options: InstacartStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * Instacart's search suggestions for a partial query, for one store or
   * across every store serving the ZIP: suggestions [{type, text,
   * search_term, category, retailer}]. English only.
   *
   * Costs 1 credit.
   */
  async suggestions(options: InstacartSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Customer reviews of one Instacart product (us only), 15 a page: rating
   * summary (page 1), reviews [{rating, title, text, date, source,
   * incentivized}]. No reviewer identity is returned.
   *
   * Costs 1 credit.
   */
  async reviews(options: InstacartReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }
}
