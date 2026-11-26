import type { Scavio } from "../client.js";

// Kelley Blue Book (kbb.com, Cox Automotive's car value and research site) carValue, model, search,
// listing, reviews, dealers, dealer and makesModels endpoints; US only, prices in USD; 1 credit
// each (a car value at a zip 2, up to 6; deeper review pages up to 5). Generated from the backend
// routes: every option and its doc mirrors the API's own request schema; an input the API only
// accepts to refuse (a 400 that says 'not offered') is left out. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to KBB_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused inputs
// are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every kbb call. */
export const KBB_TIMEOUT = 250_000;

export interface KbbCarValueOptions {
  /**
   * A make by name or KBB slug (Toyota, Mercedes-Benz, land-rover ...; 68 makes, makes_models lists
   * them).
   */
  make: string;
  /**
   * KBB's model slug as makes_models gives it (rav4, civic, f150-supercrew-cab, 3-series). A model
   * KBB has no page for is a charged 404.
   */
  model: string;
  /** Model year. */
  year: number;
  /**
   * The trim: its trim_slug (model_page trims[].trim_slug, e.g. le-sport-utility-4d), its
   * vehicle_id, or a name that starts exactly one trim (LE). A name several trims share is a 400
   * listing them.
   */
  trim: string;
  /**
   * buy_used (default), buy_new (a new model year) or trade_in_sell. Every KBB price type the value
   * page gives comes back; intent picks the headline values.
   */
  intent?: "buy_used" | "buy_new" | "trade_in_sell";
  /**
   * Condition for the headline trade-in, private party and auction values: fair, good (default),
   * very_good, excellent.
   */
  condition?: "fair" | "good" | "very_good" | "excellent";
  /** Odometer miles. Without it KBB values the mileage it assumes. */
  mileage?: number;
  /**
   * Optional US ZIP code the values are for (buy_used and trade_in_sell; needs mileage). Without it
   * the values are for Kelley Blue Book's default location (location.zip says which). With it: 2
   * credits (6 when a second way of reading the page is needed).
   */
  zip?: string | number;
  /**
   * Optional: us (the only market; kbb.ca and kbb.com.br no longer carry Kelley Blue Book data and
   * are refused).
   */
  country?: string;
  [key: string]: unknown;
}

export interface KbbModelOptions {
  /**
   * A make by name or KBB slug (Toyota, Mercedes-Benz, land-rover ...; 68 makes, makes_models lists
   * them).
   */
  make: string;
  /**
   * KBB's model slug as makes_models gives it (rav4, civic, f150-supercrew-cab, 3-series). A model
   * KBB has no page for is a charged 404.
   */
  model: string;
  /** Model year. */
  year: number;
  /**
   * Optional: us (the only market; kbb.ca and kbb.com.br no longer carry Kelley Blue Book data and
   * are refused).
   */
  country?: string;
  [key: string]: unknown;
}

export interface KbbSearchOptions {
  /**
   * Required. A 5-digit US ZIP code: cars for sale around it (an unknown ZIP is a 400, not
   * charged).
   */
  zip: string | number;
  /** all (default), used or new cars for sale. */
  listing_type?: "all" | "used" | "new";
  /** A make by name or code (Toyota, Ford, Mercedes-Benz, or TOYOTA, MB ...). */
  make?: string;
  /**
   * A model as the listings name it (RAV4, Civic, F150) or a spelling of it (F-150 is matched to
   * F150). Needs make. A model KBB does not list for the make is a charged 404 that lists the
   * make's models (it is never widened to the whole make).
   */
  model?: string;
  /** A model code as listings[].model_code gives it (instead of model). Needs make. */
  model_code?: string;
  /**
   * Miles around the ZIP: 10, 25, 50, 75, 100, 200, 300, 400, 500, 0 (0 = nationwide). KBB's
   * default otherwise (location.radius_miles).
   */
  radius?: number;
  /** Page (default 1, at most 100). */
  page?: number;
  /** Listings a page: 25 (default) or 100. */
  page_size?: number;
  /** relevance (default), price_asc, mileage_asc, year_desc (newest model year). */
  sort?: "relevance" | "price_asc" | "mileage_asc" | "year_desc";
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
  /** Drivetrain: AWD4WD (AWD/4WD), FWD (Front Wheel Drive), RWD (Rear Wheel Drive). */
  drivetrain?: string;
  /**
   * Exterior colour: BEIGE (Beige), BLACK (Black), BLUE (Blue), BROWN (Brown), BURGUNDY (Burgundy),
   * CHARCOAL (Charcoal), GOLD (Gold), GRAY (Gray), GREEN (Green), OFFWHITE (Off White), ORANGE
   * (Orange), PINK (Pink), PURPLE (Purple), RED (Red), SILVER (Silver), TAN (Tan), TURQUOISE
   * (Turquoise), WHITE (White), YELLOW (Yellow).
   */
  exterior_color?: string;
  /** dealer or private (private sellers). */
  seller_type?: "dealer" | "private";
  /**
   * Optional: us (the only market; kbb.ca and kbb.com.br no longer carry Kelley Blue Book data and
   * are refused).
   */
  country?: string;
  [key: string]: unknown;
}

export interface KbbListingOptions {
  /** A KBB listing id (search listings[].listing_id, dealer inventory[].listing_id). */
  listing_id?: string | number;
  /** A KBB listing link (https://www.kbb.com/cars-for-sale/vehicle/<id>) instead of listing_id. */
  url?: string;
  /**
   * Optional: seller.distance_miles is measured from this US ZIP code; without it distance_miles is
   * null.
   */
  zip?: string | number;
  /**
   * Optional: us (the only market; kbb.ca and kbb.com.br no longer carry Kelley Blue Book data and
   * are refused).
   */
  country?: string;
  [key: string]: unknown;
}

export interface KbbReviewsOptions {
  /**
   * A make by name or KBB slug (Toyota, Mercedes-Benz, land-rover ...; 68 makes, makes_models lists
   * them).
   */
  make: string;
  /**
   * KBB's model slug as makes_models gives it (rav4, civic, f150-supercrew-cab, 3-series). A model
   * KBB has no page for is a charged 404.
   */
  model: string;
  /** Model year. */
  year: number;
  /** Page of 8 reviews (default 1, at most 10). */
  page?: number;
  /**
   * recent (default, most recent first), rating_desc (highest rated first) or rating_asc (lowest
   * rated first).
   */
  sort?: "recent" | "rating_desc" | "rating_asc";
  /** Only reviews with this overall star rating (1 to 5). */
  stars?: number;
  /**
   * Optional: us (the only market; kbb.ca and kbb.com.br no longer carry Kelley Blue Book data and
   * are refused).
   */
  country?: string;
  [key: string]: unknown;
}

export interface KbbDealersOptions {
  /** Required. A 5-digit US ZIP code: dealers near it. */
  zip: string | number;
  /** Only dealers of this make (by name or code). */
  make?: string;
  /**
   * Miles around the ZIP: 10, 25, 50, 75, 100, 200, 300, 500, 0 (0 = any). KBB's default otherwise
   * (25).
   */
  radius?: number;
  /**
   * Optional: us (the only market; kbb.ca and kbb.com.br no longer carry Kelley Blue Book data and
   * are refused).
   */
  country?: string;
  [key: string]: unknown;
}

export interface KbbDealerOptions {
  /** A KBB dealer id (dealers[].dealer_id, listings[].seller.dealer_id). */
  dealer_id?: string | number;
  /**
   * A KBB dealer link (https://www.kbb.com/dealers/<city-st>/<id>/<name>/) instead of dealer_id.
   */
  url?: string;
  /**
   * Optional: us (the only market; kbb.ca and kbb.com.br no longer carry Kelley Blue Book data and
   * are refused).
   */
  country?: string;
  [key: string]: unknown;
}

export interface KbbMakesModelsOptions {
  /** used (default: every model year KBB values) or new (models sold new). */
  vehicle_class?: "used" | "new";
  /** Only this make's models. */
  make?: string;
  /**
   * Optional: us (the only market; kbb.ca and kbb.com.br no longer carry Kelley Blue Book data and
   * are refused).
   */
  country?: string;
  [key: string]: unknown;
}

export class KbbNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = KBB_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/kbb/${path}`, options, undefined, timeout);
  }

  /**
   * A car's Kelley Blue Book values on Kelley Blue Book (kbb.com, Cox Automotive's car value and
   * research site), US. Scavio fetches the public KBB page on request; KBB's own data feed
   * (InfoDriver) is a business contract, not a self-serve API. By make, model, year and trim (KBB
   * slugs; model_page lists the trims), intent (buy_used, buy_new, trade_in_sell), condition and
   * mileage, optionally for a ZIP code. Costs 1 credit; 2 with a zip (6 when a second way of
   * reading the page is needed). credits_used in the response is the exact charge.
   */
  async carValue(options: KbbCarValueOptions): Promise<Record<string, unknown>> {
    return this.post("car-value", options);
  }

  /**
   * One model year on Kelley Blue Book (kbb.com, Cox Automotive's car value and research site), US.
   * Scavio fetches the public KBB page on request; KBB's own data feed (InfoDriver) is a business
   * contract, not a self-serve API. By make, model and year. Costs 1 credit.
   */
  async model(options: KbbModelOptions): Promise<Record<string, unknown>> {
    return this.post("model", options);
  }

  /**
   * Search the cars for sale on Kelley Blue Book (kbb.com, Cox Automotive's car value and research
   * site), US. Scavio fetches the public KBB page on request; KBB's own data feed (InfoDriver) is a
   * business contract, not a self-serve API. Around a US ZIP code with a radius, used, new or all,
   * by make and model (validated: never widened to the make), sorted by relevance, price, mileage
   * or model year, filtered by model year, price, mileage, drivetrain, exterior colour and dealer
   * or private seller; 25 or 100 a page. Costs 1 credit.
   */
  async search(options: KbbSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One car for sale on Kelley Blue Book (kbb.com, Cox Automotive's car value and research site),
   * US. Scavio fetches the public KBB page on request; KBB's own data feed (InfoDriver) is a
   * business contract, not a self-serve API. By listing id or link. Costs 1 credit.
   */
  async listing(options: KbbListingOptions): Promise<Record<string, unknown>> {
    return this.post("listing", options);
  }

  /**
   * Owner reviews of a model year on Kelley Blue Book (kbb.com, Cox Automotive's car value and
   * research site), US. Scavio fetches the public KBB page on request; KBB's own data feed
   * (InfoDriver) is a business contract, not a self-serve API. By make, model and year, a page of 8
   * (1 to 10), sorted most recent, highest or lowest rated, optionally only one star rating. Costs
   * 1 credit; a page beyond 1, a sort other than recent or a star filter up to 5. credits_used in
   * the response is the exact charge.
   */
  async reviews(options: KbbReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * Car dealers near a US ZIP code on Kelley Blue Book (kbb.com, Cox Automotive's car value and
   * research site), US. Scavio fetches the public KBB page on request; KBB's own data feed
   * (InfoDriver) is a business contract, not a self-serve API. Optionally of one make and within a
   * radius. Costs 1 credit.
   */
  async dealers(options: KbbDealersOptions): Promise<Record<string, unknown>> {
    return this.post("dealers", options);
  }

  /**
   * One dealer on Kelley Blue Book (kbb.com, Cox Automotive's car value and research site), US.
   * Scavio fetches the public KBB page on request; KBB's own data feed (InfoDriver) is a business
   * contract, not a self-serve API. By dealer id or link. Costs 1 credit.
   */
  async dealer(options: KbbDealerOptions): Promise<Record<string, unknown>> {
    return this.post("dealer", options);
  }

  /**
   * Kelley Blue Book's make and model directory on Kelley Blue Book (kbb.com, Cox Automotive's car
   * value and research site), US. Scavio fetches the public KBB page on request; KBB's own data
   * feed (InfoDriver) is a business contract, not a self-serve API. Used (every model year KBB
   * values; 68 makes, about 1,500 models) or new. Costs 1 credit.
   */
  async makesModels(options: KbbMakesModelsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("makes-models", options);
  }
}
