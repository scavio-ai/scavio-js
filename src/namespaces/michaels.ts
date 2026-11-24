import type { Scavio } from "../client.js";

// Michaels (michaels.com, the US and Canada arts and crafts retailer): 11
// endpoints, 2 credits each; category() and deals() 4 when the category is a
// /shop/ link or path (one more call finds its code path; a code path costs 2).
// credits_used in the response is what was charged.
//
// Markets: country us (default, www.michaels.com, USD) or ca
// (canada.michaels.com, CAD); language en (default) or fr (with ca only).
// stores(), categories() and suggestions() are US only. With country ca a
// category is a code path (root//Categories//..., search facets list them),
// never a /shop/ path.
//
// Prices are national per country: the store does not change them, it matters
// for stock. Price and was price come as Michaels shows them (was_price_text
// keeps its own Reg. label); discount_percent is computed by Scavio from the
// two. promotions carry Michaels's own offer text with its start and end
// dates. storeStock() returns units of one SKU at the stores near a ZIP or
// postal code as Michaels reports them (virtual or pop-up stores appear with 0
// units and virtual: true); storeInventory() returns units of up to 30 SKUs at
// one store. online_stock on product() is Michaels's online stock, not a
// store's. Search and the list methods mix Michaels items and Marketplace items
// (seller_type); Marketplace items carry a seller id, no seller name. A UPC
// search answers with the product group's lead SKU. Not available: review or
// Q&A text (rating and count only), the weekly ad, coupons, classes and events,
// aisle locations, Marketplace seller names, custom framing, price history
// (poll and store the answers), checkout.
//
// The server enforces the cross-field rules: language fr needs country ca; zip
// is a US ZIP for us and a Canadian postal code for ca; product() takes sku or
// url; deals() needs q or category; pickup needs store. Every call raises the
// request timeout to MICHAELS_TIMEOUT. Failed upstream calls and refused inputs
// are not charged; a not-found is charged.

/** Minimum request timeout (ms) for every michaels call: calls can queue behind the server's upstream limit. */
export const MICHAELS_TIMEOUT = 240_000;

/** us (default: www.michaels.com, USD) or ca (canada.michaels.com, CAD). */
export type MichaelsCountry = "us" | "ca";

/** en (default) or fr (country ca only: canada.michaels.com/fr). */
export type MichaelsLanguage = "en" | "fr";

/** A Michaels SKU (items[].sku: 8 digits for Michaels items, e.g. "10228177"; 18 for Marketplace items; MP... for Pro packs). */
export type MichaelsSku = string | number;

/** A Michaels store number (e.g. "1040" Chicago IL, "4936" Toronto ON; storeStock() and stores() list them). */
export type MichaelsStore = string | number;

/** best_match (default), best_sellers, new_arrivals, price_asc, price_desc or rating: Michaels's sort menu. */
export type MichaelsSort = "best_match" | "best_sellers" | "new_arrivals" | "price_asc" | "price_desc" | "rating";

/** michaels (Michaels's own items), marketplace (MakerPlace sellers) or michaels_pro (Pro bulk packs). US only. */
export type MichaelsSeller = "michaels" | "marketplace" | "michaels_pro";

/** sale (default), new, clearance or great_buy (www.michaels.com only): Michaels's More Ways to Shop filters. */
export type MichaelsDealType = "sale" | "new" | "clearance" | "great_buy";

export interface MichaelsMarket {
  /** Defaults to "us". */
  country?: MichaelsCountry;
  /** Defaults to "en"; "fr" needs country ca. */
  language?: MichaelsLanguage;
}

export interface MichaelsListOptions extends MichaelsMarket {
  /** Page, from 1 ((page - 1) x page_size at most 8000). */
  page?: number;
  /** Products per page (1-100, default 40). */
  page_size?: number;
  /** Defaults to "best_match". */
  sort?: MichaelsSort;
  /** Lowest price. */
  min_price?: number;
  /** Highest price. */
  max_price?: number;
  /** Only products rated at least this many stars (1-4). */
  min_rating?: number;
  /** A Michaels store number: only products with free store pickup there. */
  store?: MichaelsStore;
  /** Free store pickup only (needs store). */
  pickup?: boolean;
  /** Only products offered for same-day delivery. */
  same_day?: boolean;
  /** Only products Michaels ships. */
  ship_to_me?: boolean;
  /** Only this seller type. US only. */
  seller?: MichaelsSeller;
  /** Facet filters: {facets[].key: [facets[].values[].value]} from an earlier answer, sent exactly as given, e.g. {material: ["Acrylic"]}. */
  filters?: Record<string, string | string[]>;
}

export interface MichaelsDealFlags {
  /** Only products in Michaels's Sale filter. */
  on_sale?: boolean;
  /** Only products in Michaels's New filter. */
  new?: boolean;
  /** Only products in Michaels's Clearance filter. */
  clearance?: boolean;
  /** Only products in Michaels's Great Buy filter (www.michaels.com). */
  great_buy?: boolean;
}

export interface MichaelsSearchOptions extends MichaelsListOptions, MichaelsDealFlags {
  /** Keywords ("yarn"), a Michaels item number or a UPC. */
  q: string;
  /** Only this brand (the Brand facet's values, e.g. "Cricut", "Lion Brand Yarn"). */
  brand?: string;
  /** Only this category: a code path (categories[].code_path or a By category code facet value). */
  category?: string;
  [key: string]: unknown;
}

export interface MichaelsProductOptions extends MichaelsMarket {
  /** A Michaels SKU (e.g. "10228177"). Send sku or url. */
  sku?: MichaelsSku;
  /** A www.michaels.com or canada.michaels.com product link (items[].url), instead of sku. The link sets the country. */
  url?: string;
  [key: string]: unknown;
}

export interface MichaelsStoreStockOptions extends MichaelsMarket {
  /** A Michaels SKU (e.g. "10228177"). */
  sku: MichaelsSku;
  /** A US ZIP code ("10001"), or with country ca a Canadian postal code ("M5V 2T6"). */
  zip: string | number;
  /** Miles around the location (1-200, default 20). */
  radius?: number;
  [key: string]: unknown;
}

export interface MichaelsStoreInventoryOptions extends MichaelsMarket {
  /** A Michaels store number (e.g. "1191"). */
  store: MichaelsStore;
  /** 1-30 Michaels SKUs, e.g. ["10228177", "10816737"]. */
  skus: MichaelsSku[];
  [key: string]: unknown;
}

export interface MichaelsStoresOptions {
  /** A US ZIP code (e.g. "60657"). Send zip, city or latitude + longitude. */
  zip?: string | number;
  /** A city, e.g. "San Francisco, CA". */
  city?: string;
  /** Latitude (with longitude). */
  latitude?: number;
  /** Longitude (with latitude). */
  longitude?: number;
  /** Miles around the location (1-200, default 20). */
  radius?: number;
  [key: string]: unknown;
}

export interface MichaelsStoreOptions extends MichaelsMarket {
  /** A Michaels store number (US or Canada, e.g. "1040", "4936"). */
  store: MichaelsStore;
  [key: string]: unknown;
}

export interface MichaelsCategoryOptions extends MichaelsListOptions, MichaelsDealFlags {
  /** A /shop/ link or path ("/shop/art-supplies/artist-canvas", categories[].path; 4 credits) or its code path (categories[].code_path; 2 credits). With country ca: a code path. */
  category: string;
  /** Only products matching these keywords. */
  q?: string;
  /** Only this brand. */
  brand?: string;
  [key: string]: unknown;
}

export interface MichaelsCategoriesOptions {
  /** A category's /shop/ path or link (categories[].path, e.g. "/shop/art-supplies"): its subcategories. Without it: the departments. */
  path?: string;
  [key: string]: unknown;
}

export interface MichaelsBrandOptions extends MichaelsListOptions, MichaelsDealFlags {
  /** A brand as Michaels names it (the Brand facet values of a search, e.g. "Cricut", "Lion Brand Yarn"). */
  brand: string;
  /** Only this brand's products matching these keywords (default: the brand name). */
  q?: string;
  /** Only this category (a code path, categories[].code_path). */
  category?: string;
  [key: string]: unknown;
}

export interface MichaelsDealsOptions extends MichaelsListOptions {
  /** Defaults to "sale". */
  type?: MichaelsDealType;
  /** Deals matching these keywords, e.g. "christmas" (q or category is required). */
  q?: string;
  /** Deals in this category: a code path, or in the US a /shop/ path (4 credits). */
  category?: string;
  /** Only this brand. */
  brand?: string;
  [key: string]: unknown;
}

export interface MichaelsSuggestionsOptions {
  /** The text typed so far, e.g. "yarn". */
  q: string;
  [key: string]: unknown;
}

export class MichaelsNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/michaels/${path}`, options, undefined, MICHAELS_TIMEOUT);
  }

  /** Search by keywords, an item number or a UPC: price, was_price_text (Michaels's Reg. label), seller type, promotions, facets. 2 credits. */
  async search(options: MichaelsSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One product in full by SKU or link: variants with price and UPC, promotions with dates, online stock (not a store's), Pro-pack unit price. 2 credits. */
  async product(options: MichaelsProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** Units of one SKU at the stores near a US ZIP or Canadian postal code, as Michaels reports them. 2 credits. */
  async storeStock(options: MichaelsStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /** Units of up to 30 SKUs at one store, as Michaels reports them. 2 credits. */
  async storeInventory(options: MichaelsStoreInventoryOptions): Promise<Record<string, unknown>> {
    return this.post("store-inventory", options);
  }

  /** The stores near a US ZIP, a city or a point (US only): address, hours, services. 2 credits. */
  async stores(options: MichaelsStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /** One store by store number (US or Canada): address, phone, hours, services. 2 credits. */
  async store(options: MichaelsStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /** One category's products by /shop/ link or path (4 credits) or code path (2 credits). */
  async category(options: MichaelsCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /** Michaels's departments, or one category's subcategories, with their code paths (US only). 2 credits. */
  async categories(options: MichaelsCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /** One brand's products, optionally matching keywords or within a category. 2 credits. */
  async brand(options: MichaelsBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /** Sale (default), New, Clearance or Great Buy (US) products matching keywords or within a category. 2 credits (4 with a /shop/ category). */
  async deals(options: MichaelsDealsOptions): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /** The search suggestions Michaels shows as you type (US only). 2 credits. */
  async suggestions(options: MichaelsSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
