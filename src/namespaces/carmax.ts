import type { Scavio } from "../client.js";

// CarMax (carmax.com, the US used-car retailer) search, listing, photos, stores, store,
// storeInventory, reviews, reviewSummary, suggestions, makes, models and carValue endpoints; US
// only, prices in USD, 1 credit each. Generated from the backend routes: every option and its doc
// mirrors the API's own request schema; an input the API only accepts to refuse (a 400 that says
// 'not offered') is left out. The server enforces the value rules and the one-of rules (send one of
// an id or a link). Every call raises the request timeout to CARMAX_TIMEOUT and never lowers a
// longer client timeout. Failed upstream calls and refused inputs are not charged; a not-found is
// charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every carmax call. */
export const CARMAX_TIMEOUT = 240_000;

export interface CarmaxSearchOptions {
  /** A make by name or slug (Ford, land-rover; makes lists them). */
  make?: string;
  /**
   * With make: a model by name or slug (F-150 and F150 both work, RAV4, CX-5, Model 3; models lists
   * a make's models).
   */
  model?: string;
  /**
   * Free text CarMax searches across every make (e.g. rav4 hybrid). Not combined with make / model.
   */
  keyword?: string;
  /**
   * A body type as CarMax writes it: the url_segment of a VehicleType facet value (suvs, sedans,
   * trucks, coupes, hatchbacks, minivans-and-vans, convertibles, wagons).
   */
  body_type?: string;
  /**
   * Up to 8 facet values by url_segment (facets[].values[].url_segment with include_facets):
   * drivetrain, colour, engine type, features, packages, cylinders, size, doors.
   */
  filters?: string[];
  year_min?: number;
  year_max?: number;
  /** Lowest price, USD. */
  price_min?: number;
  /** Highest price, USD. */
  price_max?: number;
  mileage_min?: number;
  mileage_max?: number;
  /**
   * CarMax's "Max shipping fee" filter, USD: 0, 99, 199, 299, 399, 499, 999 (0 = free to home or
   * store). No limit by default.
   */
  max_shipping_fee?: 0 | 99 | 199 | 299 | 399 | 499 | 999;
  /**
   * best_match (default), distance (nearest first), price_asc, price_desc, mileage_asc,
   * mileage_desc, year_desc (newest), year_asc.
   */
  sort?: "best_match" | "distance" | "price_asc" | "price_desc" | "mileage_asc" | "mileage_desc" | "year_desc" | "year_asc";
  /** Page, from 1; has_more says whether another page exists. */
  page?: number;
  /** Cars per page, 1 to 100 (default 24). 100 cars can take CarMax 80 seconds. */
  page_size?: number;
  /**
   * Add facets: every filter value with its url_segment and count (makes carry their models), and
   * the year / price / mileage ranges with counts.
   */
  include_facets?: boolean;
  /**
   * A 5-digit US ZIP code. CarMax prices each car's shipping fee and dates to it, and the radius is
   * measured from it.
   */
  zip: string;
  /**
   * Miles from zip: 5, 25, 50, 75, 100, 250, 500 or nationwide (default: every CarMax car, with the
   * shipping fee to zip).
   */
  radius?: "5" | "25" | "50" | "75" | "100" | "250" | "500" | "nationwide" | number;
  [key: string]: unknown;
}

export interface CarmaxListingOptions {
  /** A CarMax stock number (cars[].stock_number). */
  stock_number?: string | number;
  /** Or the car's link (https://www.carmax.com/car/<stock number>). */
  url?: string;
  [key: string]: unknown;
}

export interface CarmaxPhotosOptions {
  /** A CarMax stock number (cars[].stock_number). */
  stock_number?: string | number;
  /** Or the car's link (https://www.carmax.com/car/<stock number>). */
  url?: string;
  [key: string]: unknown;
}

export interface CarmaxStoresOptions {
  /**
   * A 5-digit US ZIP code. CarMax prices each car's shipping fee and dates to it, and the radius is
   * measured from it.
   */
  zip?: string;
  /** Or a US state (TX or Texas): CarMax's stores in it. */
  state?: string;
  /** Or a city name (e.g. Atlanta). */
  city?: string;
  /** Most stores to return (default 25). */
  limit?: number;
  [key: string]: unknown;
}

export interface CarmaxStoreOptions {
  /** A CarMax store id (stores[].id). */
  store_id: string | number;
  [key: string]: unknown;
}

export interface CarmaxStoreInventoryOptions {
  /** A CarMax store id (stores[].id). */
  store_id: string | number;
  /** A make by name or slug (Ford, land-rover; makes lists them). */
  make?: string;
  /**
   * With make: a model by name or slug (F-150 and F150 both work, RAV4, CX-5, Model 3; models lists
   * a make's models).
   */
  model?: string;
  /**
   * A body type as CarMax writes it: the url_segment of a VehicleType facet value (suvs, sedans,
   * trucks, coupes, hatchbacks, minivans-and-vans, convertibles, wagons).
   */
  body_type?: string;
  /**
   * Up to 8 facet values by url_segment (facets[].values[].url_segment with include_facets):
   * drivetrain, colour, engine type, features, packages, cylinders, size, doors.
   */
  filters?: string[];
  year_min?: number;
  year_max?: number;
  /** Lowest price, USD. */
  price_min?: number;
  /** Highest price, USD. */
  price_max?: number;
  mileage_min?: number;
  mileage_max?: number;
  /**
   * CarMax's "Max shipping fee" filter, USD: 0, 99, 199, 299, 399, 499, 999 (0 = free to home or
   * store). No limit by default.
   */
  max_shipping_fee?: 0 | 99 | 199 | 299 | 399 | 499 | 999;
  /**
   * best_match (default), distance (nearest first), price_asc, price_desc, mileage_asc,
   * mileage_desc, year_desc (newest), year_asc.
   */
  sort?: "best_match" | "distance" | "price_asc" | "price_desc" | "mileage_asc" | "mileage_desc" | "year_desc" | "year_asc";
  /** Page, from 1; has_more says whether another page exists. */
  page?: number;
  /** Cars per page, 1 to 100 (default 24). 100 cars can take CarMax 80 seconds. */
  page_size?: number;
  /**
   * Add facets: every filter value with its url_segment and count (makes carry their models), and
   * the year / price / mileage ranges with counts.
   */
  include_facets?: boolean;
  /**
   * A 5-digit US ZIP code. CarMax prices each car's shipping fee and dates to it, and the radius is
   * measured from it.
   */
  zip: string;
  [key: string]: unknown;
}

export interface CarmaxReviewsOptions {
  /** The make as CarMax names it (makes[].name). */
  make: string;
  /** The model as CarMax names it (models[].name; F-150 is read as F150). */
  model: string;
  /** The model year. */
  year: number;
  /** Page (10 reviews a page); total_pages says how deep they go. */
  page?: number;
  /** most_helpful (default), newest, oldest, highest_rating or lowest_rating. */
  sort?: "most_helpful" | "newest" | "oldest" | "highest_rating" | "lowest_rating";
  /** Only reviews with exactly this many stars. */
  rating?: number;
  [key: string]: unknown;
}

export interface CarmaxReviewSummaryOptions {
  /** The make as CarMax names it (makes[].name). */
  make: string;
  /** The model as CarMax names it (models[].name; F-150 is read as F150). */
  model: string;
  /** The model year. */
  year: number;
  [key: string]: unknown;
}

export interface CarmaxSuggestionsOptions {
  /** The start of a make or model name. */
  query: string;
  [key: string]: unknown;
}

export interface CarmaxMakesOptions {
  [key: string]: unknown;
}

export interface CarmaxModelsOptions {
  /** A make by name or slug (makes[].slug). */
  make: string;
  [key: string]: unknown;
}

export interface CarmaxCarValueOptions {
  /** A make by name or slug. */
  make: string;
  /** A model by name or slug (models[].slug; F-150 is read as f150, the slug CarMax uses). */
  model: string;
  /** The model year. */
  year: number;
  [key: string]: unknown;
}

export class CarmaxNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = CARMAX_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/carmax/${path}`, options, undefined, timeout);
  }

  /**
   * Search CarMax's used-car inventory: CarMax (carmax.com, the largest US used-car retailer, with
   * 263 stores in 42 states and no-haggle prices). Scavio fetches the public CarMax page on
   * request. By make and model (F-150 and F150 both work), body type, keyword, facet filters, year
   * / price / mileage ranges and max shipping fee, within a radius of a ZIP (or nationwide), sorted
   * 8 ways, up to 100 cars a page. Costs 1 credit.
   */
  async search(options: CarmaxSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One CarMax car in full by stock number or link. Costs 1 credit. */
  async listing(options: CarmaxListingOptions): Promise<Record<string, unknown>> {
    return this.post("listing", options);
  }

  /** Every photo of one CarMax car by stock number or link. Costs 1 credit. */
  async photos(options: CarmaxPhotosOptions): Promise<Record<string, unknown>> {
    return this.post("photos", options);
  }

  /**
   * CarMax stores near a ZIP (nearest first, with distance_miles) or in a state or city. Costs 1
   * credit.
   */
  async stores(options: CarmaxStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One CarMax store by id: id, name, url, address, phone, toll_free_phone, latitude, longitude,
   * status, is_microstore, is_car_buying_center, hours, service_hours, holiday_hours, is_open_now,
   * todays_hours_label, alert, fee_disclaimer (CarMax's price and fee terms for that store's
   * state). An unknown id is a charged 404. CarMax (carmax.com, the largest US used-car retailer,
   * with 263 stores in 42 states and no-haggle prices). Scavio fetches the public CarMax page on
   * request. 1 credit. Failed upstream calls and refused inputs are not charged; a not-found is
   * charged. Costs 1 credit.
   */
  async store(options: CarmaxStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * The cars on one CarMax store's lot, with the same filters, sorts and paging as search. Costs 1
   * credit.
   */
  async storeInventory(options: CarmaxStoreInventoryOptions): Promise<Record<string, unknown>> {
    return this.post("store-inventory", options);
  }

  /**
   * Owner reviews of one model-year on CarMax (e.g. 2022 Toyota RAV4), 10 a page, full depth, 5
   * sorts and an exact star filter. Costs 1 credit.
   */
  async reviews(options: CarmaxReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /** The owner-review summary of one model-year on CarMax. Costs 1 credit. */
  async reviewSummary(options: CarmaxReviewSummaryOptions): Promise<Record<string, unknown>> {
    return this.post("review-summary", options);
  }

  /** CarMax's make and model suggestions for the start of a name. Costs 1 credit. */
  async suggestions(options: CarmaxSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Every make CarMax lists: count, makes [{name, slug}]. CarMax (carmax.com, the largest US
   * used-car retailer, with 263 stores in 42 states and no-haggle prices). Scavio fetches the
   * public CarMax page on request. 1 credit. Failed upstream calls and refused inputs are not
   * charged; a not-found is charged. Costs 1 credit.
   */
  async makes(options: CarmaxMakesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("makes", options);
  }

  /**
   * One make's models on CarMax: make, make_slug, count, models [{name, slug (the model input of
   * search and car-value)}]. An unknown make is a charged 404. CarMax (carmax.com, the largest US
   * used-car retailer, with 263 stores in 42 states and no-haggle prices). Scavio fetches the
   * public CarMax page on request. 1 credit. Failed upstream calls and refused inputs are not
   * charged; a not-found is charged. Costs 1 credit.
   */
  async models(options: CarmaxModelsOptions): Promise<Record<string, unknown>> {
    return this.post("models", options);
  }

  /**
   * Recent CarMax instant offers for one model-year (e.g. 2019 Ford F-150), as CarMax shows them.
   * Costs 1 credit.
   */
  async carValue(options: CarmaxCarValueOptions): Promise<Record<string, unknown>> {
    return this.post("car-value", options);
  }
}
