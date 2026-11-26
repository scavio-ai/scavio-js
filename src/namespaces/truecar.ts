import type { Scavio } from "../client.js";

// TrueCar (truecar.com, the US car-buying marketplace) search, listing, model, reviews, dealer,
// dealerInventory, suggestions, makes and models endpoints; US only, prices in USD, 1 credit each.
// Generated from the backend routes: every option and its doc mirrors the API's own request schema;
// an input the API only accepts to refuse (a 400 that says 'not offered') is left out. The server
// enforces the value rules and the one-of rules (send one of an id or a link). Every call raises
// the request timeout to TRUECAR_TIMEOUT and never lowers a longer client timeout. Failed upstream
// calls and refused inputs are not charged; a not-found is charged (credits_used is what was
// charged).

/** Minimum request timeout (ms) for every truecar call. */
export const TRUECAR_TIMEOUT = 240_000;

export interface TruecarSearchOptions {
  /** Required. A 5-digit US ZIP code: TrueCar searches dealers around it. */
  zip: string;
  /** used (default) or new. */
  condition?: "used" | "new";
  /**
   * A make name or slug as TrueCar writes it (makes lists them): Toyota, Ford, Mercedes-Benz,
   * land-rover.
   */
  make?: string;
  /** Needs make. A model name or slug as TrueCar writes it: RAV4, F-150, CR-V. */
  model?: string;
  /** Needs make and model. One trim name or slug (national.trims lists them). */
  trim?: string;
  /** One of convertible, coupe, hatchback, sedan, suv, truck, van, wagon. */
  body_style?: "convertible" | "coupe" | "hatchback" | "sedan" | "suv" | "truck" | "van" | "wagon";
  /**
   * Miles around the ZIP (TrueCar's default: 75 used, 150 new). TrueCar also lists far-away
   * vehicles offered with delivery: check items[].distance_miles.
   */
  radius?: number;
  /** Model year from. */
  year_min?: number;
  /** Model year to. */
  year_max?: number;
  /** Price from, USD. */
  price_min?: number;
  /** Price to, USD. */
  price_max?: number;
  /** Mileage up to. */
  mileage_max?: number;
  /** Any of: 4wd, awd, fwd, rwd (a list or comma-separated). */
  drivetrains?: string[] | string;
  /**
   * Any of: beige, black, blue, brown, gold, gray, green, orange, purple, red, silver, white,
   * yellow (a list or comma-separated).
   */
  colors?: string[] | string;
  /** Any of: gas, hybrid, electric, diesel, plug_in_hybrid (a list or comma-separated). */
  fuel_types?: string[] | string;
  /** Only vehicles with no reported accident. */
  accident_free?: boolean;
  /** Only certified pre-owned vehicles. */
  certified_pre_owned?: boolean;
  /**
   * TrueCar's sorts: best_match, best_deal, lowest_price, highest_price, nearest, lowest_mileage,
   * highest_mileage, oldest_year, newest_year, newest_listed (default best_match).
   */
  sort?: "best_match" | "best_deal" | "lowest_price" | "highest_price" | "nearest" | "lowest_mileage" | "highest_mileage" | "oldest_year" | "newest_year" | "newest_listed";
  /** Page, 1-based (default 1); 30 vehicles a page, up to page 334. */
  page?: number;
  [key: string]: unknown;
}

export interface TruecarListingOptions {
  /** A 17-character VIN of a vehicle listed on TrueCar. Input only: it is never returned. */
  vin?: string;
  /**
   * A truecar.com listing link instead of vin
   * (https://www.truecar.com/used-cars-for-sale/listing/<VIN>/...).
   */
  url?: string;
  [key: string]: unknown;
}

export interface TruecarModelOptions {
  /**
   * A make name or slug as TrueCar writes it (makes lists them): Toyota, Ford, Mercedes-Benz,
   * land-rover.
   */
  make: string;
  /**
   * A model name or slug as TrueCar writes it (models lists a make's models): RAV4, F-150, CR-V.
   */
  model: string;
  /** A model year (model_years lists them). Default: TrueCar's current model year. */
  year?: number;
  [key: string]: unknown;
}

export interface TruecarReviewsOptions {
  /**
   * A make name or slug as TrueCar writes it (makes lists them): Toyota, Ford, Mercedes-Benz,
   * land-rover.
   */
  make: string;
  /**
   * A model name or slug as TrueCar writes it (models lists a make's models): RAV4, F-150, CR-V.
   */
  model: string;
  /** A model year: the reviews of that year's generation. Default: the current generation. */
  year?: number;
  /** Overall owner ratings to keep (1-5; a list or comma-separated). */
  stars?: number[] | number | string;
  /** Words to match in the review text. */
  search?: string;
  /** Page, 1-based (default 1). */
  page?: number;
  /** Reviews a page, 1-100 (default 20). */
  page_size?: number;
  [key: string]: unknown;
}

export interface TruecarDealerOptions {
  /**
   * A TrueCar dealer id (items[].dealer.id from search; the number at the end of a truecar.com
   * dealership link).
   */
  dealer_id?: string | number;
  /** A truecar.com dealership link instead of dealer_id. */
  url?: string;
  [key: string]: unknown;
}

export interface TruecarDealerInventoryOptions {
  /**
   * A TrueCar dealer id (items[].dealer.id from search; the number at the end of a truecar.com
   * dealership link).
   */
  dealer_id?: string | number;
  /** A truecar.com dealership link instead of dealer_id. */
  url?: string;
  /** used (default) or new. */
  condition?: "used" | "new";
  /** Page, 1-based (default 1); 30 vehicles a page. */
  page?: number;
  [key: string]: unknown;
}

export interface TruecarSuggestionsOptions {
  /** Text to complete (at least 2 characters): a make, model, trim or body style. */
  query: string;
  [key: string]: unknown;
}

export interface TruecarMakesOptions {
  [key: string]: unknown;
}

export interface TruecarModelsOptions {
  /**
   * A make name or slug as TrueCar writes it (makes lists them): Toyota, Ford, Mercedes-Benz,
   * land-rover.
   */
  make: string;
  [key: string]: unknown;
}

export class TruecarNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = TRUECAR_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/truecar/${path}`, options, undefined, timeout);
  }

  /**
   * Search the new or used dealer inventory of TrueCar (truecar.com, the US car-buying
   * marketplace). Scavio fetches the public truecar.com page on request; TrueCar has no public API.
   * US only, prices in USD. Around a US ZIP, by make and model (names or slugs), 30 vehicles a
   * page, with TrueCar's ten sorts and its filters: radius, model year, price, maximum mileage,
   * trim, body style, drivetrains, colors, fuel types, accident-free and certified pre-owned. Costs
   * 1 credit.
   */
  async search(options: TruecarSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One listing of TrueCar (truecar.com, the US car-buying marketplace). Scavio fetches the public
   * truecar.com page on request; TrueCar has no public API. US only, prices in USD. By VIN or
   * truecar.com listing link (input only. Costs 1 credit.
   */
  async listing(options: TruecarListingOptions): Promise<Record<string, unknown>> {
    return this.post("listing", options);
  }

  /**
   * TrueCar's overview of one model (optionally one model year) on TrueCar (truecar.com, the US
   * car-buying marketplace). Scavio fetches the public truecar.com page on request; TrueCar has no
   * public API. US only, prices in USD. Costs 1 credit.
   */
  async model(options: TruecarModelOptions): Promise<Record<string, unknown>> {
    return this.post("model", options);
  }

  /**
   * Owner reviews of one model on TrueCar (truecar.com, the US car-buying marketplace). Scavio
   * fetches the public truecar.com page on request; TrueCar has no public API. US only, prices in
   * USD. TrueCar groups them by generation (pass year for an earlier one). Filter by overall stars
   * and by words in the text, page up to 100 a page; TrueCar's own order (no sort). Costs 1 credit.
   */
  async reviews(options: TruecarReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * One dealer's profile on TrueCar (truecar.com, the US car-buying marketplace). Scavio fetches
   * the public truecar.com page on request; TrueCar has no public API. US only, prices in USD. By
   * dealer id or dealership link. Costs 1 credit.
   */
  async dealer(options: TruecarDealerOptions): Promise<Record<string, unknown>> {
    return this.post("dealer", options);
  }

  /**
   * One dealer's new or used vehicles on TrueCar (truecar.com, the US car-buying marketplace).
   * Scavio fetches the public truecar.com page on request; TrueCar has no public API. US only,
   * prices in USD. 30 a page. Costs 1 credit.
   */
  async dealerInventory(options: TruecarDealerInventoryOptions): Promise<Record<string, unknown>> {
    return this.post("dealer-inventory", options);
  }

  /**
   * TrueCar's own search suggestions for a text on TrueCar (truecar.com, the US car-buying
   * marketplace). Scavio fetches the public truecar.com page on request; TrueCar has no public API.
   * US only, prices in USD. Costs 1 credit.
   */
  async suggestions(options: TruecarSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Every make with used inventory on TrueCar (truecar.com, the US car-buying marketplace). Scavio
   * fetches the public truecar.com page on request; TrueCar has no public API. US only, prices in
   * USD. Costs 1 credit.
   */
  async makes(options: TruecarMakesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("makes", options);
  }

  /**
   * One make's models on TrueCar (truecar.com, the US car-buying marketplace). Scavio fetches the
   * public truecar.com page on request; TrueCar has no public API. US only, prices in USD. Costs 1
   * credit.
   */
  async models(options: TruecarModelsOptions): Promise<Record<string, unknown>> {
    return this.post("models", options);
  }
}
