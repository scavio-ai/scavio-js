import type { Scavio } from "../client.js";

// Edmunds (edmunds.com, the US car research and shopping site) search, listing, reviews, dealer,
// model, price, appraisal and makes endpoints; US only, prices in USD, 2 credits each. Generated
// from the backend routes: every option and its doc mirrors the API's own request schema; an input
// the API only accepts to refuse (a 400 that says 'not offered') is left out. The server enforces
// the value rules and the one-of rules (send one of an id or a link). Every call raises the request
// timeout to EDMUNDS_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and
// refused inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every edmunds call. */
export const EDMUNDS_TIMEOUT = 250_000;

export interface EdmundsSearchOptions {
  /**
   * Required. A US city: Edmunds searches around its own page for that city (New York, Los Angeles,
   * Dallas, small towns too). An unknown city is a charged 404.
   */
  city: string;
  /** Required. The city's state, 2-letter code (NY) or name. */
  state: string;
  /**
   * Not accepted: Edmunds places a search by its own city pages and ignores ZIP codes, so pass city
   * and state (a zip is a 400, not charged).
   */
  zip?: string | number;
  /** used (default; used and certified pre-owned) or new (needs make and model). */
  condition?: "used" | "new";
  /** A make (with model). Leave make and model out to search every make (used only). */
  make?: string;
  /** A model of make (with make), e.g. RAV4, Civic, F-150. */
  model?: string;
  /**
   * Miles around the city: 10, 25, 50, 75, 100, 200, 500 (default 25). radius in the answer is the
   * radius Edmunds used.
   */
  radius?: number;
  /** Page (default 1); 21 listings a page. */
  page?: number;
  /** best_match (default), price_asc, price_desc, mileage_asc, newest_listed. */
  sort?: "best_match" | "price_asc" | "price_desc" | "mileage_asc" | "newest_listed";
  /** Earliest model year. */
  year_min?: number;
  /** Latest model year. */
  year_max?: number;
  /** Lowest price, whole USD. */
  price_min?: number;
  /** Highest price, whole USD. */
  price_max?: number;
  /** Fewest miles. */
  mileage_min?: number;
  /** Most miles. */
  mileage_max?: number;
  /** A trim of make + model as Edmunds names it (XLE, LX, Lariat). */
  trim?: string;
  /**
   * all_wheel_drive, four_wheel_drive, front_wheel_drive, rear_wheel_drive (or awd, 4wd, fwd, rwd).
   */
  drivetrain?: string;
  /**
   * Exterior colour: black, white, gray, silver, blue, red, brown, green, beige, gold, orange,
   * yellow, purple.
   */
  exterior_color?: string;
  /**
   * Body type as Edmunds labels it: suv, sedan, pickup, hatchback, coupe, convertible, minivan,
   * wagon (truck = pickup).
   */
  body_type?: string;
  /** Edmunds' deal rating: great, good, fair. */
  deal_rating?: string;
  /** Only listings with no reported accidents. */
  no_accidents?: boolean;
  [key: string]: unknown;
}

export interface EdmundsListingOptions {
  /** A 17-character VIN (input only; never returned), with make, model and year. */
  vin?: string;
  /** The listing's make (with vin). */
  make?: string;
  /** The listing's model (with vin). */
  model?: string;
  /** The listing's model year (with vin). */
  year?: number;
  /**
   * An edmunds.com listing link (https://www.edmunds.com/<make>/<model>/<year>/vin/<VIN>/) instead
   * of vin, make, model and year.
   */
  url?: string;
  [key: string]: unknown;
}

export interface EdmundsReviewsOptions {
  /**
   * Required. A make Edmunds lists (Toyota, Ford, Land Rover, Mercedes-Benz ...) or its slug
   * (land-rover). The makes endpoint lists all 69.
   */
  make: string;
  /**
   * Required. A model of make: its name (RAV4, F-150, CR-V, Grand Cherokee) or Edmunds' slug (rav4,
   * f-150). An unknown model is a charged 404.
   */
  model: string;
  /** Required. The model year. */
  year: number;
  /** Page (default 1); 5 reviews a page. */
  page?: number;
  /** most_helpful (default), most_recent, highest_rated, lowest_rated. */
  sort?: "most_helpful" | "most_recent" | "highest_rated" | "lowest_rated";
  /** Only reviews with this many stars (1 to 5). */
  stars?: number;
  [key: string]: unknown;
}

export interface EdmundsDealerOptions {
  /** An Edmunds dealer id as search and listing give it (seller.dealer_id). */
  dealer_id?: string;
  /**
   * An edmunds.com dealer link (seller.url:
   * https://www.edmunds.com/dealerships/all/<state>/<city>/<dealer id>/) instead of dealer_id.
   */
  url?: string;
  /** Review page (default 1); 21 reviews a page, newest first. */
  page?: number;
  [key: string]: unknown;
}

export interface EdmundsModelOptions {
  /**
   * Required. A make Edmunds lists (Toyota, Ford, Land Rover, Mercedes-Benz ...) or its slug
   * (land-rover). The makes endpoint lists all 69.
   */
  make: string;
  /**
   * Required. A model of make: its name (RAV4, F-150, CR-V, Grand Cherokee) or Edmunds' slug (rav4,
   * f-150). An unknown model is a charged 404.
   */
  model: string;
  /** A model year (default: Edmunds' current model year). */
  year?: number;
  [key: string]: unknown;
}

export interface EdmundsPriceOptions {
  /**
   * Required. A make Edmunds lists (Toyota, Ford, Land Rover, Mercedes-Benz ...) or its slug
   * (land-rover). The makes endpoint lists all 69.
   */
  make: string;
  /**
   * Required. A model of make: its name (RAV4, F-150, CR-V, Grand Cherokee) or Edmunds' slug (rav4,
   * f-150). An unknown model is a charged 404.
   */
  model: string;
  /** Required. The model year. */
  year: number;
  /**
   * Only this trim (as Edmunds names it). A trim the page does not list is a charged 404 that lists
   * the page's trims.
   */
  trim?: string;
  [key: string]: unknown;
}

export interface EdmundsAppraisalOptions {
  /**
   * Required. A make Edmunds lists (Toyota, Ford, Land Rover, Mercedes-Benz ...) or its slug
   * (land-rover). The makes endpoint lists all 69.
   */
  make: string;
  /**
   * Required. A model of make: its name (RAV4, F-150, CR-V, Grand Cherokee) or Edmunds' slug (rav4,
   * f-150). An unknown model is a charged 404.
   */
  model: string;
  /** Required. The model year. */
  year: number;
  /**
   * Only this trim (as Edmunds names it). A trim the page does not list is a charged 404 that lists
   * the page's trims.
   */
  trim?: string;
  [key: string]: unknown;
}

export interface EdmundsMakesOptions {
  /** Required. A make: its models are returned with every make Edmunds lists. */
  make: string;
  [key: string]: unknown;
}

export class EdmundsNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = EDMUNDS_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/edmunds/${path}`, options, undefined, timeout);
  }

  /**
   * Search the car listings of Edmunds (edmunds.com, the US car research and shopping site owned by
   * CarMax). Scavio fetches the public Edmunds page on request; Edmunds' own API is for partners
   * and dealers only. US only, prices in USD. Used (with certified pre-owned) or new cars around a
   * US city (city + state; Edmunds places a search by its own city pages, so a ZIP is not
   * accepted), by make and model or every make (used), with a radius, 5 sorts and filters for year,
   * price, mileage, trim, drivetrain, exterior colour, body type, Edmunds deal rating and no
   * accidents; 21 a page. Costs 2 credits.
   */
  async search(options: EdmundsSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One car listing on Edmunds (edmunds.com, the US car research and shopping site owned by
   * CarMax). Scavio fetches the public Edmunds page on request; Edmunds' own API is for partners
   * and dealers only. US only, prices in USD. By VIN with make, model and year, or by its
   * edmunds.com link (input only. Costs 2 credits.
   */
  async listing(options: EdmundsListingOptions): Promise<Record<string, unknown>> {
    return this.post("listing", options);
  }

  /**
   * Owner (consumer) reviews of one model year on Edmunds (edmunds.com, the US car research and
   * shopping site owned by CarMax). Scavio fetches the public Edmunds page on request; Edmunds' own
   * API is for partners and dealers only. US only, prices in USD. 5 a page, 4 sorts (most_helpful,
   * most_recent, highest_rated, lowest_rated) and a star filter. Costs 2 credits.
   */
  async reviews(options: EdmundsReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * A car dealer's page on Edmunds (edmunds.com, the US car research and shopping site owned by
   * CarMax). Scavio fetches the public Edmunds page on request; Edmunds' own API is for partners
   * and dealers only. US only, prices in USD. By dealer id or link (search and listing give both).
   * Costs 2 credits.
   */
  async dealer(options: EdmundsDealerOptions): Promise<Record<string, unknown>> {
    return this.post("dealer", options);
  }

  /**
   * A model year's research page on Edmunds (edmunds.com, the US car research and shopping site
   * owned by CarMax). Scavio fetches the public Edmunds page on request; Edmunds' own API is for
   * partners and dealers only. US only, prices in USD. By make, model and year (default. Costs 2
   * credits.
   */
  async model(options: EdmundsModelOptions): Promise<Record<string, unknown>> {
    return this.post("model", options);
  }

  /**
   * MSRP, invoice price and Edmunds Suggested Price per trim of one model year on Edmunds
   * (edmunds.com, the US car research and shopping site owned by CarMax). Scavio fetches the public
   * Edmunds page on request; Edmunds' own API is for partners and dealers only. US only, prices in
   * USD. make, model, year, trim, count, trims [{trim, msrp, invoice (null where Edmunds shows
   * N/A), edmunds_suggested, most_popular}], table_note, suggested_price_near {city, state, zip,
   * text} (Edmunds computes its suggested price for its own location and states it; always shown
   * with the price), sales_through, market, notes. Figures as Edmunds gives them. An unknown model
   * year is a charged 404. 2 credits. Failed upstream calls and refused inputs are not charged; a
   * not-found is charged. Costs 2 credits.
   */
  async price(options: EdmundsPriceOptions): Promise<Record<string, unknown>> {
    return this.post("price", options);
  }

  /**
   * Used-car values of one model year on Edmunds (edmunds.com, the US car research and shopping
   * site owned by CarMax). Scavio fetches the public Edmunds page on request; Edmunds' own API is
   * for partners and dealers only. US only, prices in USD. Per style and condition (outstanding,
   * clean, average, rough) as Edmunds gives them. Costs 2 credits.
   */
  async appraisal(options: EdmundsAppraisalOptions): Promise<Record<string, unknown>> {
    return this.post("appraisal", options);
  }

  /**
   * Every make on Edmunds (edmunds.com, the US car research and shopping site owned by CarMax).
   * Scavio fetches the public Edmunds page on request; Edmunds' own API is for partners and dealers
   * only. US only, prices in USD. (69) and one make's models. Costs 2 credits.
   */
  async makes(options: EdmundsMakesOptions): Promise<Record<string, unknown>> {
    return this.post("makes", options);
  }
}
