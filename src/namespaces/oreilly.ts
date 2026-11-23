import type { Scavio } from "../client.js";

// O'Reilly Auto Parts (oreillyauto.com, the US auto parts retailer; also
// O'Reilly's Mexican store directory): 14 endpoints, 2 credits each; product()
// by line_code + part_number 4; crossReference() 2 with part_type_id +
// manufacturer, 4 with one of them or when several manufacturers use the
// number, 6 with neither when one manufacturer matches; brand() index (no
// brand) 4; storeStock() and stores() by zip 4 (by latitude + longitude, or
// the directory, 2); deals() 4.
//
// Markets: country us (default, oreillyauto.com, USD) on every endpoint; mx on
// stores() and store() only (O'Reilly's Mexican store directory, in Spanish;
// Mexico shows no prices, so mx elsewhere is a 400, not charged). Only stores()
// and store() take country.
//
// Every price is O'Reilly's price for the store O'Reilly assigns to the
// request, named in priced_for {store_id, address, city, state, zip}. O'Reilly
// prices differ by store, so two calls can be priced for different stores;
// there is no store or ZIP input for prices. core_charge is the refundable
// deposit O'Reilly adds on parts like batteries until the old part is returned
// (0 when none). Lists (search, category, brand, crossReference) return 24 a
// page and O'Reilly serves 20 pages (page 1-20; above 20 is a 400, not
// charged). List items carry no rating (product() does). vehicle takes
// { base_vehicle_id } from vehicles({ level: "resolve" }); O'Reilly pins year,
// make and model with it. On product(), vehicle_fit.fits is true or null,
// never false: check fit with a vehicle search() / category() or
// compatibility(). storeStock() reports availability states, not unit counts.
// Not available: unit counts in store stock, a chosen store for prices, reviews
// past the 10 most recent, Q&A, Mexico prices or catalog, Canada,
// license-plate lookup, the weekly ad, repair guides or trouble codes,
// O'Reilly Pro / First Call Online commercial pricing, price history (poll and
// store the answers), checkout.
//
// The server enforces the cross-field rules: product() takes url or line_code
// + part_number; storeStock() zip or latitude + longitude; stores() one of zip,
// latitude + longitude or state (+ city); store() store_id (us), url, or
// store_number + state + city (mx). Every call raises the request timeout to
// OREILLY_TIMEOUT. Failed upstream calls and refused inputs are not charged; a
// not-found is charged.

/** Minimum request timeout (ms) for every oreilly call: cross-reference chains up to 3 lookups and calls can queue behind the server's upstream limit. */
export const OREILLY_TIMEOUT = 240_000;

/** us (default) or mx (O'Reilly's Mexican store directory, in Spanish): stores() and store() only. */
export type OreillyCountry = "us" | "mx";

/** relevance (default, O'Reilly's order), price_desc, price_asc, best_selling or brand (A-Z). */
export type OreillySort = "relevance" | "price_desc" | "price_asc" | "best_selling" | "brand";

/** store_pickup (Pick Up in Store) or home_delivery (Ship to Home). */
export type OreillyAvailability = "store_pickup" | "home_delivery";

/** types, years (default), makes, models, submodels, engines, resolve (the base_vehicle_id) or vin. */
export type OreillyVehicleLevel = "types" | "years" | "makes" | "models" | "submodels" | "engines" | "resolve" | "vin";

/** A vehicle from vehicles({ level: "resolve" }): { base_vehicle_id: 129927 } is a 2015 Ford F-150. */
export interface OreillyVehicle {
  base_vehicle_id: number | string;
  slug?: string;
}

export interface OreillyListOptions {
  /** Page 1-20 (24 items a page). A page above 20 is a 400, not charged. */
  page?: number;
  /** Defaults to "relevance". */
  sort?: OreillySort;
  /** Store pickup or ship to home, as O'Reilly filters them. */
  availability?: OreillyAvailability;
  /** Up to 4 attribute facets: { "<facets[].param>": "<facets[].values[].value>" }. */
  filters?: Record<string, string | number>;
  /** Only parts for this vehicle (submodel and engine show in fit_notes). */
  vehicle?: OreillyVehicle;
}

export interface OreillySearchOptions extends OreillyListOptions {
  /** Keywords ("brake pads") or an O'Reilly part number ("SC1001"). For another brand's number use crossReference(). */
  query: string;
  /** A brand as the Brands facet gives it (facets[].values[].value, e.g. "Wagner_OEX"). */
  brand?: string;
  [key: string]: unknown;
}

export interface OreillyCrossReferenceOptions {
  /** Another brand's or an OE part number (e.g. FRAM "PH3614", Motorcraft "FL820S"). */
  part_number: string;
  /** part_types[].id from an earlier answer (e.g. "02269"; saves a call). */
  part_type_id?: string;
  /** The brand whose part number this is (manufacturers[].id, e.g. "FRAM"). With part_type_id too: 2 credits. */
  manufacturer?: string;
  /** Page 1-20 (24 items a page). */
  page?: number;
  [key: string]: unknown;
}

export interface OreillyProductOptions {
  /** An O'Reilly product link (items[].url): 2 credits. Send url or line_code + part_number. */
  url?: string;
  /** O'Reilly line code (items[].line_code, e.g. "BB"). With part_number: 4 credits. */
  line_code?: string;
  /** Part number as O'Reilly lists it (items[].part_number, e.g. "SC1001"). */
  part_number?: string;
  /** Check the part against this vehicle (vehicle_fit). */
  vehicle?: OreillyVehicle;
  [key: string]: unknown;
}

export interface OreillyVehiclesOptions {
  /** Defaults to "years". makes needs year; models year + make_id; submodels + model_id; engines + submodel_id; resolve year + make_id + model_id; vin a 17-character VIN. */
  level?: OreillyVehicleLevel;
  /** Vehicle type (types[].id): 1 Automotive (default), 2 Motorcycle & Scooter, 3 ATV & UTV, 4 Personal Watercraft, 5 Snowmobile. */
  type_id?: number;
  /** Model year, e.g. 2015. */
  year?: number;
  /** makes[].id (23076 = Ford). */
  make_id?: number;
  /** models[].id (31549 = F-150). */
  model_id?: number;
  /** submodels[].id. */
  submodel_id?: number;
  /** engines[].id (resolve only). */
  engine_id?: number;
  /** A 17-character VIN (level vin). */
  vin?: string;
  [key: string]: unknown;
}

export interface OreillyCompatibilityOptions {
  /** O'Reilly line code (items[].line_code). */
  line_code: string;
  /** Part number as O'Reilly lists it (items[].part_number). */
  part_number: string;
  /** A make from makes (e.g. "Ford"): the models, engines and years the part fits. */
  make?: string;
  [key: string]: unknown;
}

export interface OreillyCategoryOptions extends OreillyListOptions {
  /** A category link or path (categories() categories[].url): /shop/b/<name>/<12-character hash>. */
  category: string;
  /** A brand as the Brands facet gives it. */
  brand?: string;
  [key: string]: unknown;
}

export interface OreillyCategoriesOptions {
  /** A category hash (categories[].hash): only that branch. */
  root?: string;
  [key: string]: unknown;
}

export interface OreillyBrandOptions extends OreillyListOptions {
  /** A brand link or path (brands[].url: /shop/brands/a/<brand>/<code>). Without it: the brand index (4 credits). */
  brand?: string;
  [key: string]: unknown;
}

export interface OreillyStoreStockOptions {
  /** O'Reilly line code (items[].line_code). */
  line_code: string;
  /** Part number as O'Reilly lists it (items[].part_number). */
  part_number: string;
  /** A 5-digit US ZIP: 4 credits. Send zip or latitude + longitude. */
  zip?: string;
  /** Latitude (with longitude): 2 credits. */
  latitude?: number;
  /** Longitude (with latitude). */
  longitude?: number;
  /** Quantity to check (default 1). */
  quantity?: number;
  [key: string]: unknown;
}

export interface OreillyStoresOptions {
  /** us: stores near a 5-digit ZIP (4 credits). */
  zip?: string;
  /** us: stores near a point (with longitude, 2 credits). */
  latitude?: number;
  /** Longitude (with latitude). */
  longitude?: number;
  /** The store directory by state: a US state code ("mo", "tx", "pr"), or on mx agu, bcs, col, gua, jal, mic, nay, sin, son. */
  state?: string;
  /** With state: a city (cities[].city_slug or its name): that city's stores. */
  city?: string;
  /** us (default) or mx (the Mexican store directory, in Spanish). */
  country?: OreillyCountry;
  [key: string]: unknown;
}

export interface OreillyStoreOptions {
  /** us: an O'Reilly store number (stores[].store_id), e.g. "4973". */
  store_id?: string | number;
  /** A store page link from the directory (stores[].url): us or mx. */
  url?: string;
  /** mx: the store number, with state and city. */
  store_number?: string | number;
  /** mx: the state code. */
  state?: string;
  /** mx: the city (cities[].city_slug). */
  city?: string;
  /** us (default) or mx. */
  country?: OreillyCountry;
  [key: string]: unknown;
}

export interface OreillySuggestionsOptions {
  /** Text a shopper types (2 characters or more), e.g. "brake". */
  query: string;
  [key: string]: unknown;
}

export class OreillyNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/oreilly/${path}`, options, undefined, OREILLY_TIMEOUT);
  }

  /**
   * Search O'Reilly Auto Parts (oreillyauto.com, the US auto parts retailer)
   * by keywords or an O'Reilly part number, sorted, filtered and optionally
   * only parts for a vehicle: priced_for, vehicle (as O'Reilly applied it),
   * redirected_to, total (as O'Reilly reports it), page, page_size (24),
   * total_pages, max_page (20), items (line_code, part_number, name, brand,
   * price, regular_price, sale_price, core_charge, warranty, fit_notes,
   * availability, deals), facets.
   *
   * Costs 2 credits.
   */
  async search(options: OreillySearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * O'Reilly's parts that replace another brand's or an OE part number
   * (O'Reilly's own interchange): part_types, manufacturers, replacing_brands,
   * priced_for, total, items (the search() item shape). When several
   * manufacturers use the number and none is sent, it answers the lists with
   * no items: send manufacturer next. No replacement is an empty list
   * (charged).
   *
   * Costs 2 credits with part_type_id and manufacturer, 4 with one of them or
   * when several manufacturers use the number, 6 with neither when one
   * manufacturer matches.
   */
  async crossReference(options: OreillyCrossReferenceOptions): Promise<Record<string, unknown>> {
    return this.post("cross-reference", options);
  }

  /**
   * One O'Reilly product in full by link or by line_code + part_number:
   * priced_for, upc, specifications, description, images, documents,
   * breadcrumbs, price, core_charge, deals, rebates, availability,
   * stock_status, rating {average, count} and the 10 most recent reviews (no
   * reviewer identity); with vehicle, vehicle_fit (fits true or null, never
   * false). A product O'Reilly does not list is a charged 404.
   *
   * Costs 2 credits by url, 4 by line_code + part_number.
   */
  async product(options: OreillyProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * O'Reilly's vehicle selector one level at a time: types, years, makes,
   * models, submodels, engines; level resolve returns the base_vehicle_id the
   * vehicle inputs take; level vin decodes a 17-character VIN (an undecodable
   * VIN is a charged 404).
   *
   * Costs 2 credits.
   */
  async vehicles(options: OreillyVehiclesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("vehicles", options);
  }

  /**
   * The vehicles one O'Reilly part fits: without make, the makes; with make,
   * models [{model, engine, years}] as O'Reilly lists them.
   *
   * Costs 2 credits.
   */
  async compatibility(options: OreillyCompatibilityOptions): Promise<Record<string, unknown>> {
    return this.post("compatibility", options);
  }

  /**
   * One O'Reilly category's products by link or path, sorted, filtered and
   * optionally only parts for a vehicle: priced_for, total, items, facets. A
   * wrong category hash is a charged 404.
   *
   * Costs 2 credits.
   */
  async category(options: OreillyCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * O'Reilly's category tree (about 34 departments, 1,300 nodes) with the
   * links for category(); with root, one branch.
   *
   * Costs 2 credits.
   */
  async categories(options: OreillyCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One brand's products on O'Reilly by brand link (priced_for, total, items,
   * facets), or without brand O'Reilly's brand index (brands, top_brands,
   * featured_brands). An unknown brand is a charged 404.
   *
   * Costs 2 credits for one brand, 4 for the brand index (no brand).
   */
  async brand(options: OreillyBrandOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * Which O'Reilly stores within 50 miles of a ZIP or a point can hand over
   * one part: stores [{store_id, address, distance_miles, hours_message,
   * availability {store_pickup, in_store_now, pickup_time}}]. Availability
   * states, not unit counts.
   *
   * Costs 4 credits with zip, 2 with latitude + longitude.
   */
  async storeStock(options: OreillyStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /**
   * O'Reilly stores: us near a ZIP or a point (the 25 nearest within 50 miles,
   * with hours, holiday adjustments and services), or the store directory by
   * state (+ city) on us and mx (mx in Spanish). An unknown state or city is a
   * charged 404.
   *
   * Costs 4 credits near a zip, 2 near latitude + longitude or by state (+
   * city).
   */
  async stores(options: OreillyStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One O'Reilly store: us by store_id; us or mx by directory link; mx by
   * store_number + state + city. Address, phone, coordinates, hours,
   * services. An unknown store is a charged 404.
   *
   * Costs 2 credits.
   */
  async store(options: OreillyStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * O'Reilly's part-type search suggestions for typed text, with the category
   * each opens.
   *
   * Costs 2 credits.
   */
  async suggestions(options: OreillySuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * O'Reilly's current rebates: title, details, valid_from, valid_to,
   * postmark_by, terms_url, form_url (PDF), redeem_online_url.
   *
   * Costs 2 credits.
   */
  async rebates(options: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.post("rebates", options);
  }

  /**
   * O'Reilly's coupons, offers and promotions (O'Reilly's own text, with any
   * promo code the offer names) plus its deals menu.
   *
   * Costs 4 credits.
   */
  async deals(options: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }
}
