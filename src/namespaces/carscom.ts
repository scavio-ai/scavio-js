import type { Scavio } from "../client.js";

// Cars.com (cars.com, the US car marketplace) search, listing, dealer, dealerInventory,
// dealerReviews, modelReviews, dealers and research endpoints; US only, prices in USD, 1 credit
// each. Generated from the backend routes: every option and its doc mirrors the API's own request
// schema; an input the API only accepts to refuse (a 400 that says 'not offered') is left out. The
// server enforces the value rules and the one-of rules (send one of an id or a link). Every call
// raises the request timeout to CARSCOM_TIMEOUT and never lowers a longer client timeout. Failed
// upstream calls and refused inputs are not charged; a not-found is charged (credits_used is what
// was charged).

/** Minimum request timeout (ms) for every carscom call. */
export const CARSCOM_TIMEOUT = 240_000;

export interface CarscomSearchOptions {
  /**
   * Required. A 5-digit US ZIP code: Cars.com searches around it (an unknown ZIP is a 400, not
   * charged).
   */
  zip: string | number;
  /**
   * all (default: new, used and certified), new, used, cpo (certified pre-owned), new_cpo (new and
   * certified).
   */
  stock_type?: "all" | "new" | "used" | "cpo" | "new_cpo";
  /**
   * A make as Cars.com lists it (Toyota, Ford, Land Rover, Mercedes-Benz ...) or its slug
   * (land_rover).
   */
  make?: string;
  /**
   * A model of make: the name (RAV4, F-150, CR-V) or Cars.com's slug (rav4, f_150, cr_v;
   * toyota-rav4 also accepted).
   */
  model?: string;
  /**
   * Miles around the ZIP: 10, 20, 30, 40, 50, 75, 100, 150, 200, 250, 500, 750, 1000 (default 50).
   */
  radius?: number;
  /** Page (default 1); 24 listings a page. */
  page?: number;
  /**
   * best_match (default), price_low, price_high, mileage_low, mileage_high, distance, best_deal,
   * year_newest, year_oldest, listed_newest, listed_oldest (Cars.com's 11 sorts).
   */
  sort?: "best_match" | "price_low" | "price_high" | "mileage_low" | "mileage_high" | "distance" | "best_deal" | "year_newest" | "year_oldest" | "listed_newest" | "listed_oldest";
  /** Earliest model year. */
  year_min?: number;
  /** Latest model year. */
  year_max?: number;
  /** Lowest list price, whole USD. */
  price_min?: number;
  /** Highest list price, whole USD. */
  price_max?: number;
  /**
   * Most miles, one of Cars.com's steps: 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000,
   * 90000, 100000, 150000, 200000, 250000.
   */
  mileage_max?: number;
  /**
   * Trims of make + model (names or slugs; one, a list, or comma-separated), e.g. XLE, XLE Premium.
   * Needs make and model.
   */
  trims?: string | string[];
  /**
   * all_wheel_drive, four_wheel_drive, front_wheel_drive, rear_wheel_drive (or awd, 4wd, fwd, rwd);
   * one or a list.
   */
  drivetrain?: string | string[];
  /** Exterior colors (black, white, gray, silver, blue, red ...); one or a list. */
  exterior_color?: string | string[];
  /** Cars.com deal ratings: great, good, fair; one or a list. */
  deal_rating?: string | string[];
  /**
   * Body styles (suv, sedan, truck, coupe, hatchback, minivan, wagon, convertible ...); one or a
   * list.
   */
  body_style?: string | string[];
  /** dealership or private (private sellers). */
  seller_type?: "dealership" | "private";
  /** Cars.com's keyword filter (words in the listing). */
  keyword?: string;
  /** Also return facets: the site's filter options with result counts for this search. */
  include_facets?: boolean;
  [key: string]: unknown;
}

export interface CarscomListingOptions {
  /** A Cars.com listing id (search items[].listing_id) or a cars.com/vehicledetail/<id>/ link. */
  listing_id?: string;
  /** A cars.com/vehicledetail/<id>/ link instead of listing_id. */
  url?: string;
  [key: string]: unknown;
}

export interface CarscomDealerOptions {
  /**
   * Required. A Cars.com dealer id (digits: listing dealer.dealer_id, dealers items[].dealer_id) or
   * a cars.com/dealers/<id>/ link.
   */
  dealer_id?: string | number;
  /** A cars.com/dealers/<id>/ link instead of dealer_id. */
  url?: string;
  [key: string]: unknown;
}

export interface CarscomDealerInventoryOptions {
  /**
   * Required. A Cars.com dealer id (digits: listing dealer.dealer_id, dealers items[].dealer_id) or
   * a cars.com/dealers/<id>/ link.
   */
  dealer_id?: string | number;
  /** A cars.com/dealers/<id>/ link instead of dealer_id. */
  url?: string;
  /** Page (default 1); 24 vehicles a page. */
  page?: number;
  [key: string]: unknown;
}

export interface CarscomDealerReviewsOptions {
  /**
   * Required. A Cars.com dealer id (digits: listing dealer.dealer_id, dealers items[].dealer_id) or
   * a cars.com/dealers/<id>/ link.
   */
  dealer_id?: string | number;
  /** A cars.com/dealers/<id>/ link instead of dealer_id. */
  url?: string;
  /** Page (default 1); page_size reviews a page. */
  page?: number;
  /** Reviews a page: 10, 20, 30, 40 (default 20). */
  page_size?: number;
  /** most_recent (default), lowest_rated, most_helpful, highest_rated. */
  sort?: "most_recent" | "lowest_rated" | "most_helpful" | "highest_rated";
  [key: string]: unknown;
}

export interface CarscomModelReviewsOptions {
  /**
   * A make as Cars.com lists it (Toyota, Ford, Land Rover, Mercedes-Benz ...) or its slug
   * (land_rover).
   */
  make: string;
  /**
   * A model of make: the name (RAV4, F-150, CR-V) or Cars.com's slug (rav4, f_150, cr_v;
   * toyota-rav4 also accepted).
   */
  model: string;
  /** Required. The model year. */
  year: number;
  /** Page (default 1); page_size reviews a page. */
  page?: number;
  /** Reviews a page: 10, 20, 30, 50, 100, 200 (default 20). */
  page_size?: number;
  /** most_recent (default), lowest_rated, most_helpful, highest_rated. */
  sort?: "most_recent" | "lowest_rated" | "most_helpful" | "highest_rated";
  [key: string]: unknown;
}

export interface CarscomDealersOptions {
  /**
   * Required. A 5-digit US ZIP code: Cars.com searches around it (an unknown ZIP is a 400, not
   * charged).
   */
  zip: string | number;
  /** Miles around the ZIP: 10, 20, 30, 40, 50, 75, 100, 150, 200, 250, 500 (default 30). */
  radius?: number;
  /** Only dealers that sell this make (Cars.com's make filter). */
  make?: string;
  /** Lowest dealer rating: 1, 2, 3, 4 (& up). */
  min_rating?: number;
  /** rating (default), name, distance. */
  sort?: "rating" | "name" | "distance";
  /** Words in the dealer's name. */
  dealer_name?: string;
  /** Page (default 1); about 20 dealers a page. */
  page?: number;
  [key: string]: unknown;
}

export interface CarscomResearchOptions {
  /**
   * A make as Cars.com lists it (Toyota, Ford, Land Rover, Mercedes-Benz ...) or its slug
   * (land_rover).
   */
  make: string;
  /**
   * A model of make: the name (RAV4, F-150, CR-V) or Cars.com's slug (rav4, f_150, cr_v;
   * toyota-rav4 also accepted).
   */
  model?: string;
  /** A model year (with model). */
  year?: number;
  /**
   * make, model, model_year or trims. Default: make without model, model without year, model_year
   * with year.
   */
  level?: "make" | "model" | "model_year" | "trims";
  [key: string]: unknown;
}

export class CarscomNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = CARSCOM_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/carscom/${path}`, options, undefined, timeout);
  }

  /**
   * Search the car listings of Cars.com (cars.com, the US car marketplace run by Cars Commerce).
   * Scavio fetches the public Cars.com page on request; Cars.com has no public API for reading
   * listings. US only, prices in USD. New, used and certified cars around a ZIP code with a radius,
   * by make and model, sorted (Cars.com's 11 sorts) and filtered by year, price, mileage, trims,
   * drivetrain, color, Cars.com deal rating, body style, seller type and keyword; 24 a page. Costs
   * 1 credit.
   */
  async search(options: CarscomSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One car listing on Cars.com (cars.com, the US car marketplace run by Cars Commerce). Scavio
   * fetches the public Cars.com page on request; Cars.com has no public API for reading listings.
   * US only, prices in USD. By listing id or link. Costs 1 credit.
   */
  async listing(options: CarscomListingOptions): Promise<Record<string, unknown>> {
    return this.post("listing", options);
  }

  /**
   * A car dealer's public profile on Cars.com (cars.com, the US car marketplace run by Cars
   * Commerce). Scavio fetches the public Cars.com page on request; Cars.com has no public API for
   * reading listings. US only, prices in USD. By dealer id. Costs 1 credit.
   */
  async dealer(options: CarscomDealerOptions): Promise<Record<string, unknown>> {
    return this.post("dealer", options);
  }

  /**
   * A dealer's vehicles for sale on Cars.com (cars.com, the US car marketplace run by Cars
   * Commerce). Scavio fetches the public Cars.com page on request; Cars.com has no public API for
   * reading listings. US only, prices in USD. 24 a page. Costs 1 credit.
   */
  async dealerInventory(options: CarscomDealerInventoryOptions): Promise<Record<string, unknown>> {
    return this.post("dealer-inventory", options);
  }

  /**
   * A dealer's customer reviews on Cars.com (cars.com, the US car marketplace run by Cars
   * Commerce). Scavio fetches the public Cars.com page on request; Cars.com has no public API for
   * reading listings. US only, prices in USD. Paged (10-40 a page), sorted most_recent,
   * lowest_rated, most_helpful or highest_rated. Costs 1 credit.
   */
  async dealerReviews(options: CarscomDealerReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("dealer-reviews", options);
  }

  /**
   * Owner (consumer) reviews of one model year on Cars.com (cars.com, the US car marketplace run by
   * Cars Commerce). Scavio fetches the public Cars.com page on request; Cars.com has no public API
   * for reading listings. US only, prices in USD. By make, model and year, paged (10-200 a page),
   * sorted most_recent, lowest_rated, most_helpful or highest_rated. Costs 1 credit.
   */
  async modelReviews(options: CarscomModelReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("model-reviews", options);
  }

  /**
   * Find car dealers on Cars.com (cars.com, the US car marketplace run by Cars Commerce). Scavio
   * fetches the public Cars.com page on request; Cars.com has no public API for reading listings.
   * US only, prices in USD. Around a ZIP code with a radius, by make, minimum rating and dealer
   * name, sorted by rating, name or distance. Costs 1 credit.
   */
  async dealers(options: CarscomDealersOptions): Promise<Record<string, unknown>> {
    return this.post("dealers", options);
  }

  /**
   * Car research pages on Cars.com (cars.com, the US car marketplace run by Cars Commerce). Scavio
   * fetches the public Cars.com page on request; Cars.com has no public API for reading listings.
   * US only, prices in USD. level make (description, lineup, models), model (generations,
   * competitors, model years with price range and rating), model_year (average listing price on
   * used years or starting price on new ones, MPG, ratings, NHTSA score, notable features, the good
   * and the bad, warranty, trims with price) or trims (starting MSRP, combined MPG, engine,
   * drivetrain, transmission, seating), as Cars.com publishes them. Costs 1 credit.
   */
  async research(options: CarscomResearchOptions): Promise<Record<string, unknown>> {
    return this.post("research", options);
  }
}
