import type { Scavio } from "../client.js";

// Discount Tire (discounttire.com, the US tire and wheel retailer, America's
// Tire in parts of CA, PA, NJ and NY): 15 endpoints, 1 credit each.
// credits_used in the response is what was charged.
//
// Market: US only (www.discounttire.com, USD); Discount Tire and America's
// Tire are one catalog. No method takes a country.
//
// Prices, stock and promotions are per store: search(), vehicleTires(),
// product(), model(), wheels() and browse() take store (a store code from
// stores()) or zip (the nearest store is used), not both, and every answer
// names the store used in store {store_code, brand (Discount Tire or
// America's Tire), name, location_name, address, city, state, zip, phone,
// distance_miles, chosen_by}. Price can differ between stores and is not
// different at every store: measured 2026-11-25, Michelin Defender 2
// 225/65R17 (item 108547) was $206 a tire at 9 stores in 8 states and $205 at
// an America's Tire store in New Jersey. price is per tire or wheel: Discount
// Tire publishes no set-of-four price (4 x price is arithmetic, not a Discount
// Tire price). Promotions are Discount Tire's own title and text with its end
// date (ends, ISO 8601 UTC, and ends_text as given); no start date.
//
// vehicle() is one step per call: no input -> years; year -> makes; year +
// make -> models (vehicle_id); vehicle_id -> trims (trim_id); vehicle_id +
// trim_id -> assemblies (assembly_id, the tire size options); all three ids ->
// fitment (front / rear size, staggered, wheel diameters, optional sizes).
// vehicleTires() and wheels() take the same three ids. Staggered vehicles come
// back as front / rear sets, each tire with its own per-tire price (a set is
// 2 front + 2 rear); original_equipment flags the vehicle maker's OE tire;
// ranking "treadwell" adds Discount Tire's Treadwell ranking fields, Discount
// Tire's own estimates, as given. storeStock() gives the exact units per store
// near a ZIP (5 stores per page); a store with 0 units can still say
// "Available as soon as <date>". Reviews are Discount Tire's own, fully paged,
// with no reviewer names. appointments() is read only: Scavio never books;
// days[].slots[].start and end are the store's local time (YYYY-MM-DDTHH:MM,
// no time zone).
// Not available: the deals page text, road hazard and certificate prices,
// financing, installation and fee amounts, the Treadwell chat, fleet accounts,
// Tire Rack, price history (poll and store the answers), checkout and booking.
//
// The server enforces the cross-field rules: search() takes size or width +
// aspect_ratio + diameter; storeStock() takes item_number or item_numbers and
// zip; stores() takes one of zip, city or latitude + longitude; wheels() takes
// diameter + width + bolt_pattern or the three vehicle ids; browse() takes one
// of category, brand or q. Every call raises the request timeout to
// DISCOUNTTIRE_TIMEOUT. Failed upstream calls and refused inputs are not
// charged; a not-found is charged.

/** Minimum request timeout (ms) for every discounttire call: calls can queue behind the server's upstream limit. */
export const DISCOUNTTIRE_TIMEOUT = 240_000;

/** A Discount Tire item number (items[].item_number, the number after /p/ in a discounttire.com product link; e.g. "108547"). */
export type DiscountTireItemNumber = string | number;

/** A Discount Tire / America's Tire store code (stores[].store_code, e.g. "1009"). */
export type DiscountTireStoreCode = string | number;

/** One label or up to 5, as Discount Tire writes them in its facets. */
export type DiscountTireLabels = string | string[];

/** best_seller (default), price_low, price_high or rating: Discount Tire's sort menu. */
export type DiscountTireSort = "best_seller" | "price_low" | "price_high" | "rating";

/** DiscountTireSort plus treadwell (with ranking "treadwell": its default, Treadwell rank). */
export type DiscountTireVehicleSort = DiscountTireSort | "treadwell";

/** best_seller (default), price_low or price_high. */
export type DiscountTireWheelSort = "best_seller" | "price_low" | "price_high";

/** best_seller (default; relevance with q), price_low, price_high, rating or relevance. */
export type DiscountTireBrowseSort = DiscountTireSort | "relevance";

/** newest (default), highest, lowest or most_helpful. */
export type DiscountTireReviewSort = "newest" | "highest" | "lowest" | "most_helpful";

/** distance (default) or availability. */
export type DiscountTireStockSort = "distance" | "availability";

/** Staggered vehicles only: set (default: front / rear pairs), front or rear. */
export type DiscountTirePosition = "set" | "front" | "rear";

/** tires or wheels. */
export type DiscountTireProductType = "tires" | "wheels";

/** Store stock radius in miles: 10, 25 (default), 50, 75 or 150. */
export type DiscountTireRadius = 10 | 25 | 50 | 75 | 150;

export interface DiscountTireStoreOrZip {
  /** A store code (stores[].store_code, e.g. "1009"). Prices, stock and promotions are this store's. Send store or zip. */
  store?: DiscountTireStoreCode;
  /** A US ZIP code instead of store: the nearest store in Discount Tire's store search is used (echoed in store). */
  zip?: string | number;
}

export interface DiscountTireVehicleIds {
  /** options[].vehicle_id of vehicle()'s models step (e.g. "17361", a 2022 Ford F-150). */
  vehicle_id?: string | number;
  /** options[].trim_id of the trims step (e.g. "52455", XLT Crew Cab 2WD). */
  trim_id?: string | number;
  /** options[].assembly_id of the assemblies step: the tire size option (e.g. "0000E28B", 245/70R17). */
  assembly_id?: string;
}

export interface DiscountTireListOptions extends DiscountTireStoreOrZip {
  /** Page (1-500). */
  page?: number;
  /** Items per page (1-100, default 20). */
  page_size?: number;
  /** Up to 10 filter tokens exactly as an earlier answer gives them in facets[].values[].filter (e.g. "brands:brand-MCH"); several are combined. */
  filters?: string[];
  /** Brand name(s) as Discount Tire writes them (its Brands facet, e.g. "Michelin"). */
  brand?: DiscountTireLabels;
  /** Lowest price per tire or wheel (USD) at the store. */
  min_price?: number;
  /** Highest price per tire or wheel (USD) at the store. */
  max_price?: number;
  /** Only items with an instant saving. */
  instant_savings?: boolean;
  /** Only items in stock at the store. */
  in_stock?: boolean;
}

export interface DiscountTireTireFilters {
  /** Tire category as Discount Tire writes it (e.g. "All-Season Tires", or its code, e.g. "winterTires"). */
  category?: DiscountTireLabels;
  /** Speed rating letter(s) (e.g. "H", "V"). */
  speed_rating?: DiscountTireLabels;
  /** A Mileage Warranty facet label as Discount Tire writes it (e.g. "60,000-70,000"). */
  mileage_warranty?: DiscountTireLabels;
  /** Load range (SL, XL, C, D, E, ...). */
  load_range?: string;
  /** Only tires with the Three-Peak Mountain Snowflake mark. */
  three_peak?: boolean;
  /** Only run-flat tires. */
  run_flat?: boolean;
  /** Only tires with a rebate. */
  rebates?: boolean;
}

export interface DiscountTireSearchOptions extends DiscountTireListOptions, DiscountTireTireFilters {
  /** Tire size ("225/65R17", "LT265/70R17", "35x12.50R20"). Send size or width + aspect_ratio + diameter. */
  size?: string;
  /** Section width (e.g. 225), with aspect_ratio and diameter. */
  width?: string | number;
  /** Aspect ratio (e.g. 65). */
  aspect_ratio?: string | number;
  /** Rim diameter in inches (e.g. 17). */
  diameter?: string | number;
  /** Rear size for a staggered pair (e.g. "305/30R20"): items become front / rear pairs. */
  rear_size?: string;
  /** Defaults to "best_seller". */
  sort?: DiscountTireSort;
  [key: string]: unknown;
}

export interface DiscountTireVehicleOptions extends DiscountTireVehicleIds {
  /** Model year (e.g. 2022): its makes (with make: its models). */
  year?: number | string;
  /** A make as Discount Tire writes it (options[].make of the makes step, e.g. "Ford"), with year. */
  make?: string;
  [key: string]: unknown;
}

export interface DiscountTireVehicleTiresOptions extends DiscountTireListOptions, DiscountTireTireFilters {
  /** options[].vehicle_id of vehicle()'s models step. Required. */
  vehicle_id: string | number;
  /** options[].trim_id of the trims step. Required. */
  trim_id: string | number;
  /** options[].assembly_id of the assemblies step. Required. */
  assembly_id: string;
  /** Staggered vehicles only. Defaults to "set" (front / rear pairs). */
  position?: DiscountTirePosition;
  /** "all" (default) or "treadwell": Discount Tire's Treadwell ranking with its own estimates. */
  ranking?: "all" | "treadwell";
  /** Defaults to "best_seller" ("treadwell" with ranking "treadwell"). */
  sort?: DiscountTireVehicleSort;
  [key: string]: unknown;
}

export interface DiscountTireProductOptions extends DiscountTireStoreOrZip {
  /** A Discount Tire item number (e.g. "108547"). */
  item_number: DiscountTireItemNumber;
  /** Optional store codes (up to 10) Discount Tire checks for a nearby store with stock (nearby_store_stock). */
  nearby_stores?: DiscountTireStoreCode[];
  [key: string]: unknown;
}

export interface DiscountTireModelOptions extends DiscountTireStoreOrZip {
  /** A model id (items[].model_id, e.g. "michelin-defender-2") or a discounttire.com /buy-tires/ or /buy-wheels/ link. */
  model_id: string;
  /** Default: from the link, else tires then wheels. */
  type?: DiscountTireProductType;
  [key: string]: unknown;
}

export interface DiscountTireStoreStockOptions {
  /** One item number. Send item_number or item_numbers. */
  item_number?: DiscountTireItemNumber;
  /** Up to 4 item numbers checked together (e.g. a staggered front and rear). */
  item_numbers?: DiscountTireItemNumber[];
  /** US ZIP code (e.g. "85251"): the stores near it. Required. */
  zip: string | number;
  /** Defaults to 25 miles. */
  radius?: DiscountTireRadius;
  /** Defaults to "distance". */
  sort?: DiscountTireStockSort;
  /** Page (5 stores per page). */
  page?: number;
  /** How many of each item (1-8, default 4): Discount Tire's availability text is written for this quantity. */
  quantity?: number;
  /** Optional: your store; its units come back in my_store. */
  store?: DiscountTireStoreCode;
  [key: string]: unknown;
}

export interface DiscountTireStoresOptions {
  /** A US ZIP code (e.g. "85251"). Send one of zip, city or latitude + longitude. */
  zip?: string | number;
  /** A US city, e.g. "Phoenix, AZ". */
  city?: string;
  /** Latitude, with longitude: a point in the United States. */
  latitude?: number;
  /** Longitude, with latitude. */
  longitude?: number;
  /** Miles, 1-150 (Discount Tire's default when omitted). */
  radius?: number;
  /** Page (10 stores per page). */
  page?: number;
  [key: string]: unknown;
}

export interface DiscountTireStoreOptions {
  /** A store code (stores[].store_code, e.g. "1009"). */
  store_code: DiscountTireStoreCode;
  [key: string]: unknown;
}

export interface DiscountTireReviewsOptions {
  /** A Discount Tire item number (e.g. "108547"). */
  item_number: DiscountTireItemNumber;
  /** "model" (default: every size of the tire model) or "size" (this item only). */
  scope?: "model" | "size";
  /** Defaults to "newest". */
  sort?: DiscountTireReviewSort;
  /** Only reviews with this star rating (1-5). */
  rating?: number;
  /** Page (1-5000). */
  page?: number;
  /** Reviews per page (1-100, default 10). */
  page_size?: number;
  [key: string]: unknown;
}

export interface DiscountTireStoreReviewsOptions {
  /** A store code (stores[].store_code, e.g. "1009"). */
  store_code: DiscountTireStoreCode;
  /** Defaults to "newest". */
  sort?: DiscountTireReviewSort;
  /** Only reviews with this star rating (1-5). */
  rating?: number;
  /** Page (5 reviews per page). */
  page?: number;
  [key: string]: unknown;
}

export interface DiscountTireWheelsOptions extends DiscountTireListOptions, DiscountTireVehicleIds {
  /** Wheel diameter in inches (e.g. 20; with width for wheels by size; with a vehicle: another diameter than the vehicle's). */
  diameter?: string | number;
  /** Wheel width in inches (e.g. 9). */
  width?: string | number;
  /** Bolt pattern (required with diameter + width): "6-135", "6x139.7" or "5x4.5". */
  bolt_pattern?: string;
  /** Defaults to "best_seller". */
  sort?: DiscountTireWheelSort;
  /** Wheel category as Discount Tire writes it (e.g. "Chrome Wheels"). */
  category?: DiscountTireLabels;
  /** Wheel color as Discount Tire writes it (e.g. "Black"). */
  color?: DiscountTireLabels;
  /** Only wheels with a special offer. */
  special_offers?: boolean;
  [key: string]: unknown;
}

export interface DiscountTireBrowseOptions extends DiscountTireStoreOrZip {
  /** A category slug from categories() (categories[].slug, e.g. "all-season-tires"). */
  category?: string;
  /** A tire brand (e.g. "Michelin"): its models. */
  brand?: string;
  /** Keywords (e.g. "michelin defender"). */
  q?: string;
  /** Defaults to "best_seller" (relevance with q). */
  sort?: DiscountTireBrowseSort;
  /** Page (1-500). */
  page?: number;
  /** Items per page (1-100, default 20). */
  page_size?: number;
  [key: string]: unknown;
}

export interface DiscountTireCategoriesOptions {
  /** Defaults to "tires". */
  type?: DiscountTireProductType;
  [key: string]: unknown;
}

export interface DiscountTireSuggestionsOptions {
  /** What a shopper types (3 characters or more, e.g. "michelin"). */
  q: string;
  [key: string]: unknown;
}

export interface DiscountTireAppointmentsOptions {
  /** A store code (stores[].store_code, e.g. "1009"). */
  store_code: DiscountTireStoreCode;
  /** Month number, 1-12 (default: the current month). */
  month?: number;
  [key: string]: unknown;
}

export class DiscountTireNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/discounttire/${path}`, options, undefined, DISCOUNTTIRE_TIMEOUT);
  }

  /** Tires in one size at one store (store or zip): price per tire, promotions with end dates, exact units at the store, facets. 1 credit. */
  async search(options: DiscountTireSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** The vehicle selector, one step per call: years, makes, models, trims, tire size options, then the fitment. 1 credit. */
  async vehicle(options: DiscountTireVehicleOptions = {}): Promise<Record<string, unknown>> {
    return this.post("vehicle", options);
  }

  /** The tires that fit a vehicle at one store, OE flagged; staggered vehicles as front / rear sets; optional Treadwell ranking. 1 credit. */
  async vehicleTires(options: DiscountTireVehicleTiresOptions): Promise<Record<string, unknown>> {
    return this.post("vehicle-tires", options);
  }

  /** One tire or wheel by item number at one store: price, promotions, units, tire or wheel specs, FAQs. 1 credit. */
  async product(options: DiscountTireProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /** Every size of one tire or wheel model at one store, with each size's price and the price range. 1 credit. */
  async model(options: DiscountTireModelOptions): Promise<Record<string, unknown>> {
    return this.post("model", options);
  }

  /** Exact units of 1-4 items at the stores near a ZIP (5 stores per page). 1 credit. */
  async storeStock(options: DiscountTireStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /** Discount Tire and America's Tire stores near a ZIP, city or point (10 per page). 1 credit. */
  async stores(options: DiscountTireStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /** One store by store code: address, dated hours for the coming week, ratings, services, nearby stores. 1 credit. */
  async store(options: DiscountTireStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /** Discount Tire's own reviews of a tire model or one size; sorts, star filter, full paging; no reviewer names. 1 credit. */
  async reviews(options: DiscountTireReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /** Discount Tire's own reviews of one store (5 per page). 1 credit. */
  async storeReviews(options: DiscountTireStoreReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("store-reviews", options);
  }

  /** Wheels by size and bolt pattern, or that fit a vehicle, at one store. 1 credit. */
  async wheels(options: DiscountTireWheelsOptions): Promise<Record<string, unknown>> {
    return this.post("wheels", options);
  }

  /** Tire models in a category, of a brand, or matching keywords, with the price range at one store. 1 credit. */
  async browse(options: DiscountTireBrowseOptions): Promise<Record<string, unknown>> {
    return this.post("browse", options);
  }

  /** Discount Tire's tire or wheel types (the category filter and the browse slug). 1 credit. */
  async categories(options: DiscountTireCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /** What Discount Tire's search box suggests for a few letters (models and categories, no prices). 1 credit. */
  async suggestions(options: DiscountTireSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /** One store's appointment calendar for a month, read only (Scavio never books); slot start / end in the store's local time (YYYY-MM-DDTHH:MM, no time zone). 1 credit. */
  async appointments(options: DiscountTireAppointmentsOptions): Promise<Record<string, unknown>> {
    return this.post("appointments", options);
  }
}
