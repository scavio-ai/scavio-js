import type { Scavio } from "../client.js";

// PC Express (Loblaw's online grocery for Real Canadian Superstore, No Frills, Loblaws, Zehrs,
// Fortinos, Valu-mart, Your Independent Grocer, Wholesale Club, Provigo and Maxi; Loblaw operates
// 2,504 stores per its 2025 annual report): 7 endpoints: search, category, collection, product,
// stores, store, suggestions. Canada only, prices in CAD. Credits: search, category, collection,
// stores and suggestions 1; product 5 (1 when it answers from the search listing, source
// "search"); store 5. credits_used in the response is what was charged.
//
// banner picks the banner (default superstore); language is en, or fr on provigo (French only)
// and maxi (French by default, English too). Prices are each banner's default online store's:
// choosing a store is not offered (a store_id on a priced endpoint is a 400), and every answer
// says which store priced it in store {store_id, banner, requested false}. The same product code
// is priced per banner (captured 2026-11-26: No Name Large Size Eggs 12 Pack, 20812144001_EA,
// 3.93 CAD at Real Canadian Superstore's default store 1033, 4.17 at Maxi's default store 8976).
// deal carries the end date as shown (expiry_date), no start date; pc_optimum_points is the PC
// Optimum offer as shown; member_only_price is the price the site shows publicly on the item.
// Not available: choosing a store, review text, the printed flyer, Shoppers Drug Mart, Atlantic
// Superstore, City Market and T&T, cart or checkout, PC Optimum prices behind a login, price
// history.
//
// The server enforces the value rules: fr only on provigo and maxi; product() takes code or url;
// latitude and longitude go together; at most 10 filter values in all. Every call raises the
// request timeout to PCEXPRESS_TIMEOUT. Failed upstream calls and refused inputs are not charged;
// a not-found (an unknown code, category, collection or store) is charged.

/** Minimum request timeout (ms) for every pcexpress call: product, store, stores and suggestions can take up to 2 minutes. */
export const PCEXPRESS_TIMEOUT = 240_000;

/** superstore (Real Canadian Superstore, default), nofrills, loblaw (Loblaws), zehrs, fortinos, valumart, independent (Your Independent Grocer), wholesaleclub (Real Canadian Wholesale Club), provigo, maxi. */
export type PcexpressBanner =
  | "superstore"
  | "nofrills"
  | "loblaw"
  | "zehrs"
  | "fortinos"
  | "valumart"
  | "independent"
  | "wholesaleclub"
  | "provigo"
  | "maxi";

/** en, or fr on provigo (French only) and maxi (French by default, English too). */
export type PcexpressLanguage = "en" | "fr";

/** relevance (default), price_low_to_high, price_high_to_low, name_a_to_z, newest. */
export type PcexpressSort = "relevance" | "price_low_to_high" | "price_high_to_low" | "name_a_to_z" | "newest";

/** price_reduction, pc_points (PC Optimum points offers), multi_buy, member_only_price, dollar_deals ($1-$5). */
export type PcexpressDeal = "price_reduction" | "pc_points" | "multi_buy" | "member_only_price" | "dollar_deals";

export interface PcexpressBannerOptions {
  banner?: PcexpressBanner;
  language?: PcexpressLanguage;
}

export interface PcexpressListFilters extends PcexpressBannerOptions {
  /** Page, 1-based (48 products a page; default 1). */
  page?: number;
  sort?: PcexpressSort;
  /** Brand codes from facets (productBrand), e.g. "N" No Name, "P" President's Choice, "PO" PC Organics, "PCB" PC Blue Menu. */
  brand?: string | string[];
  deals?: PcexpressDeal | PcexpressDeal[];
  /** Price bands from facets (e.g. "$5-$10"). */
  price_range?: string | string[];
  /** Only products marked Prepared in Canada. */
  prepared_in_canada?: boolean;
  /** Dietary codes from facets (e.g. "gluten_free", "organic", "vegan", "lactose_free"). */
  dietary?: string | string[];
  /** Aisle (category) ids from facets. */
  aisle?: string | string[];
  /** Any other facet: {facet, value} from facets[].facet and facets[].values[].value. At most 10 filter values in all. */
  filters?: Array<{ facet: string; value: string | string[] }>;
  /** Also return facets [{facet, name, multi_select, values [{value, name, count, selected}]}] and sorts. */
  include_facets?: boolean;
}

export interface PcexpressSearchOptions extends PcexpressListFilters {
  /** Keywords or an article number (e.g. "eggs"). */
  query: string;
  [key: string]: unknown;
}

export interface PcexpressCategoryOptions extends PcexpressListFilters {
  /** A category id (e.g. "28224" Milk & Cream, from category.children, breadcrumbs or a link's /c/<id>) or a category link or path. */
  category: string | number;
  [key: string]: unknown;
}

export interface PcexpressCollectionOptions extends PcexpressListFilters {
  /** A collection name from the site's links ("deals-centre", "black-friday", "no-name", "pc-value", "new-arrivals" ...) or a collection link. */
  collection: string;
  [key: string]: unknown;
}

export interface PcexpressProductOptions extends PcexpressBannerOptions {
  /** A product code (items[].code: article number and unit, e.g. "20812144001_EA"). Send code or url. */
  code?: string;
  /** A product link on any of the ten banner sites instead of code (its site sets the banner). */
  url?: string;
  [key: string]: unknown;
}

export interface PcexpressStoresOptions extends PcexpressBannerOptions {
  /** Stores whose city contains this (accents and case ignored), e.g. "Winnipeg". */
  city?: string;
  /** Stores whose postal code starts with this ("T5", "M5V", "M5V 3L9"). */
  postal_code?: string;
  /** A province code or name (e.g. "BC"). */
  province?: string;
  /** With longitude: stores nearest this point, with distance_km. */
  latitude?: number;
  /** With latitude. */
  longitude?: number;
  /** Only stores that take PC Express orders. */
  shoppable_only?: boolean;
  /** Stores to return, 1-400 (default 20 near a point, else all). */
  limit?: number;
  [key: string]: unknown;
}

export interface PcexpressStoreOptions extends PcexpressBannerOptions {
  /** A store id from stores(), sent as a string: leading zeros count (e.g. "1517", "0559"). */
  store_id: string | number;
  [key: string]: unknown;
}

export interface PcexpressSuggestionsOptions extends PcexpressBannerOptions {
  /** What a shopper has typed (e.g. "egg"). */
  query: string;
  [key: string]: unknown;
}

export class PcexpressNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/pcexpress/${path}`, options, undefined, PCEXPRESS_TIMEOUT);
  }

  /** Search one banner by keywords or article number: price, was price, unit price, deal with expiry date, PC Optimum points, member-only price; 48 a page, 5 sorts, filters. 1 credit. */
  async search(options: PcexpressSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One category by id or link: a product list (paged, sorted, filtered) or a department's carousels and sub-categories. 1 credit. */
  async category(options: PcexpressCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /** One collection page (deals-centre, black-friday, no-name, pc-value, new-arrivals ...): products with prices and deals, in sections. 1 credit. */
  async collection(options: PcexpressCollectionOptions): Promise<Record<string, unknown>> {
    return this.post("collection", options);
  }

  /** One product by code or link: GTIN, ingredients, nutrition, comparison prices, deal, stock status as given. 5 credits; 1 when it answers from the search listing (source "search"). */
  async product(options: PcexpressProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** A banner's pickup stores by city, postal code start or province, or nearest a point, with today's hours. 1 credit. */
  async stores(options: PcexpressStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /** One store by id: 7 dated days of store, pharmacy, clinic, optical and holiday hours, services. 5 credits. */
  async store(options: PcexpressStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /** The search terms PC Express suggests for a partial query. 1 credit. */
  async suggestions(options: PcexpressSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
