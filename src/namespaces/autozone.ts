import type { Scavio } from "../client.js";

// AutoZone (autozone.com, the US auto parts retailer; also autozone.com.br and
// autozone.com.mx): 12 endpoints, 1 credit each, 2 on br search(), br product()
// and storeStock().
//
// Markets: country us (default, autozone.com, USD) on every endpoint; br
// (autozone.com.br, Portuguese text, BRL) on search, product, storeStock,
// vehicles, stores, store and categories; mx (autozone.com.mx) on vehicles,
// stores, store and categories only (Mexico search and product are a 400, not
// charged: AutoZone Mexico prices only for a Mexican store it does not
// reliably assign). category, brand, reviews, clearance and rebates are us only.
//
// Every price is AutoZone's price for the store AutoZone assigns to the
// request, named in priced_for {store_number, address, city, state, zip}.
// AutoZone prices differ by store (core charges too), so the same part can
// cost more or less elsewhere and two calls can be priced for different
// stores; there is no store or ZIP input on us. core_charge is the refundable
// deposit AutoZone adds on parts like batteries until the old part is
// returned (0 when none). Lists (search, category, brand, clearance) return
// the first 24 results with AutoZone's total and no paging: narrow with one
// facet filter, a price range or sort. List items carry no rating (product()
// does). category() with vehicle returns the parts that fit at year / make /
// model level; items AutoZone ties to an engine read fitment.vehicle_fit
// NEEDS_BASE_VEHICLE. storeStock() is Brazil only. Not available: results past
// the first 24, stores near a ZIP, stock at a chosen US or Mexican store,
// search suggestions, VIN lookup, engine-level fitment, repair guides,
// AutoZonePro / commercial pricing, Mexico prices, price history (poll and
// store the answers), checkout.
//
// The server enforces the cross-field rules: product(), reviews() and
// storeStock() take one of id or url; store() one of slug or url; filters
// take one facet. Every call raises the request timeout to AUTOZONE_TIMEOUT.
// Failed upstream calls and refused inputs are not charged; a not-found is
// charged.

/** Minimum request timeout (ms) for every autozone call: br pages are slow and calls can queue behind the server's upstream limit. */
export const AUTOZONE_TIMEOUT = 240_000;

/** us (autozone.com, default), br (autozone.com.br) or mx (autozone.com.mx). */
export type AutozoneCountry = "us" | "br" | "mx";

/** The markets with prices: us (default) or br (2 credits). */
export type AutozonePriceCountry = "us" | "br";

/** relevance (default, AutoZone's own order), price_asc or price_desc. */
export type AutozoneSort = "relevance" | "price_asc" | "price_desc";

/** default (AutoZone's order), most_recent or most_helpful. */
export type AutozoneReviewSort = "default" | "most_recent" | "most_helpful";

/** years (default), makes, models, submodels or engines (submodels and engines us only). */
export type AutozoneVehicleLevel = "years" | "makes" | "models" | "submodels" | "engines";

/** An AutoZone item id: items[].id, the number at the end of the product link. */
export type AutozoneId = string | number;

/** A year / make / model, names as vehicles() lists them. */
export interface AutozoneVehicle {
  year: number;
  make: string;
  model: string;
}

export interface AutozoneListOptions {
  /** Defaults to "relevance". */
  sort?: AutozoneSort;
  /** One facet: { "<facets[].facet>": "<facets[].values[].value>" }, e.g. { position_name_s: "Front" }. */
  filters?: Record<string, string | number>;
  /** Lowest price, in the market's currency (USD; BRL on br). */
  min_price?: number;
  /** Highest price, in the market's currency. */
  max_price?: number;
}

export interface AutozoneSearchOptions extends AutozoneListOptions {
  /** Keywords ("brake pads"), an AutoZone part number ("DG1210") or another brand's part number ("PH3614", "FL-820S"). */
  query: string;
  /** us (default) or br (2 credits). */
  country?: AutozonePriceCountry;
  /** A brand as facets lists it (e.g. "Duralast Gold"): the same as filters.sub_brand_name_display_s. */
  brand?: string;
  [key: string]: unknown;
}

export interface AutozoneProductOptions {
  /** AutoZone item id (items[].id), e.g. "1399158". One of id or url. */
  id?: AutozoneId;
  /** Or the product link (autozone.com or autozone.com.br); the market comes from the link. */
  url?: string;
  /** With id: us (default) or br (2 credits). */
  country?: AutozonePriceCountry;
  [key: string]: unknown;
}

export interface AutozoneCategoryOptions extends AutozoneListOptions {
  /** A part type path (categories() children[].path with has_products true, e.g. "/brakes-and-traction-control/brake-pads") or its link. */
  category: string;
  /** Only the parts that fit this year / make / model. An unknown make or model for that year is a charged 404. */
  vehicle?: AutozoneVehicle;
  [key: string]: unknown;
}

export interface AutozoneBrandOptions {
  /** A brand slug ("duralast", "duralast-gold", "mobil-1") or its AutoZone link. */
  brand: string;
  /** Optional part type path: that brand's products in that part type. */
  category?: string;
  [key: string]: unknown;
}

export interface AutozoneVehiclesOptions {
  /** Defaults to "years". makes needs year; models year + make_id; submodels and engines year + make_id + model_id (us only). */
  level?: AutozoneVehicleLevel;
  /** Model year, e.g. 2018. */
  year?: number;
  /** makes[].make_id (54 = Ford on us). */
  make_id?: number;
  /** models[].model_id (666 = F-150 on us). */
  model_id?: number;
  /** us (default), br or mx. */
  country?: AutozoneCountry;
  [key: string]: unknown;
}

export interface AutozoneReviewsOptions {
  /** AutoZone item id (items[].id). One of id or url. */
  id?: AutozoneId;
  /** Or the product link. */
  url?: string;
  /** Page (10 reviews a page); total_pages says how deep they go. */
  page?: number;
  /** Defaults to "default". */
  sort?: AutozoneReviewSort;
  /** Only reviews with these star ratings, e.g. [1, 2]. */
  stars?: number[];
  [key: string]: unknown;
}

export interface AutozoneStoresOptions {
  /** us (default), br or mx. */
  country?: AutozoneCountry;
  /** A state from the states list (states[].state: "tx", "nuevo-leon", "sao-paulo"): lists its cities. */
  state?: string;
  /** With state: a city slug (cities[].city_slug, e.g. "houston"): lists its stores. */
  city?: string;
  [key: string]: unknown;
}

export interface AutozoneStoreOptions {
  /** A store slug (stores[].slug), e.g. "vt/barre/18-overlook-dr.html". One of slug or url. */
  slug?: string;
  /** Or the store page link; the market comes from the link. */
  url?: string;
  /** With slug: us (default), br or mx. */
  country?: AutozoneCountry;
  [key: string]: unknown;
}

export interface AutozoneCategoriesOptions {
  /** us (default), br or mx. */
  country?: AutozoneCountry;
  [key: string]: unknown;
}

export interface AutozoneStoreStockOptions {
  /** AutoZone Brazil item id (items[].id from a br search), e.g. "100123563". One of id or url. */
  id?: AutozoneId;
  /** Or the autozone.com.br product link. */
  url?: string;
  /** A Brazilian store number (stores[].store_number with country br), e.g. "7602". */
  store_number: string | number;
  [key: string]: unknown;
}

export class AutozoneNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/autozone/${path}`, options, undefined, AUTOZONE_TIMEOUT);
  }

  /**
   * Search AutoZone (autozone.com, the US auto parts retailer) by keywords,
   * an AutoZone part number or another brand's part number (cross-reference:
   * PH3614 finds the parts AutoZone matches to it): priced_for, ranking_variant,
   * part_number_search, oem_part_number, oem_brand, redirected_to, total
   * (as AutoZone reports it), count, page_size (24), items (id, part_number,
   * name, brand, fitment, price, was_price, deal_price, core_charge,
   * warranty, availability), facets. The first 24 results only.
   *
   * Costs 1 credit on us (the default), 2 credits on br.
   */
  async search(options: AutozoneSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One AutoZone product in full by item id or link: priced_for,
   * specifications, features, safety_data_sheets, fitment, price, was_price,
   * deal_price, deal, core_charge, warranty, availability per fulfilment
   * option, rating with its distribution. No per-vehicle fit list. An id
   * AutoZone does not have is a charged 404.
   *
   * Costs 1 credit on us (the default), 2 credits on br.
   */
  async product(options: AutozoneProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One AutoZone part type's products by path, optionally only the parts that
   * fit a vehicle (year, make, model), sorted and filtered (us): priced_for,
   * list_type (products or group), vehicle (as AutoZone applied it), total,
   * items, facets. The first 24 results only.
   *
   * Costs 1 credit.
   */
  async category(options: AutozoneCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One brand's products on AutoZone, optionally within one part type (us):
   * priced_for, total, items, facets. An unknown brand is a charged 404.
   *
   * Costs 1 credit.
   */
  async brand(options: AutozoneBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * AutoZone's vehicle selector, one level at a time: years, makes [{make_id,
   * name}], models [{model_id, name}], submodels and engines (us; br and mx:
   * years, makes, models). Send the make and model names as vehicle to
   * category().
   *
   * Costs 1 credit.
   */
  async vehicles(options: AutozoneVehiclesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("vehicles", options);
  }

  /**
   * Customer reviews of one AutoZone product (us), 10 a page, full depth:
   * total_reviews, total_pages, average_rating, rating_distribution, summary
   * (page 1 without a star filter), reviews (rating, title, text,
   * verified_purchase, submitted_at, vehicle as written, images). No reviewer
   * identity is returned.
   *
   * Costs 1 credit.
   */
  async reviews(options: AutozoneReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * AutoZone's store directory (us, br, mx), one level at a time: states,
   * then a state's cities, then a city's stores (up to 50) with slug, address
   * and hours. There is no stores-near-a-ZIP search. An unknown state or city
   * is a charged 404.
   *
   * Costs 1 credit.
   */
  async stores(options: AutozoneStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One AutoZone store by slug or link (us, br, mx): store_number, address,
   * phone, latitude, longitude, hours, holiday_hours. An unknown store is a
   * charged 404.
   *
   * Costs 1 credit.
   */
  async store(options: AutozoneStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * AutoZone's category menu (us, br, mx; about 23 departments) with the part
   * type paths for category() (has_products marks part types with a list).
   *
   * Costs 1 credit.
   */
  async categories(options: AutozoneCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * AutoZone's clearance list (us): priced_for, total, the first 24 items,
   * facets.
   *
   * Costs 1 credit.
   */
  async clearance(options: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.post("clearance", options);
  }

  /**
   * AutoZone's current mail-in rebates (us): title, end_date (last purchase
   * day), postmark_date (last day to mail the form), form_url (PDF).
   *
   * Costs 1 credit.
   */
  async rebates(options: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.post("rebates", options);
  }

  /**
   * Brazil only: one AutoZone Brazil product at a Brazilian store you choose
   * (autozone.com.br; stock at a chosen US or Mexican store is not offered):
   * priced_for (the store asked), price, was_price, deal_price, core_charge,
   * in_store {available, quantity}, availability. BRL, Portuguese text. If
   * AutoZone does not apply the store the call fails unbilled.
   *
   * Costs 2 credits.
   */
  async storeStock(options: AutozoneStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }
}
