import type { Scavio } from "../client.js";

// Autotrader (autotrader.com, the US car marketplace) search, listing, dealers, dealer and makes
// endpoints; US only, prices in USD, KBB price ranges as given, 2 credits each. Generated from the
// backend routes: every option and its doc mirrors the API's own request schema; an input the API
// only accepts to refuse (a 400 that says 'not offered') is left out. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to AUTOTRADER_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused
// inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every autotrader call. */
export const AUTOTRADER_TIMEOUT = 240_000;

export interface AutotraderSearchOptions {
  /**
   * Required. A 5-digit US ZIP code: Autotrader lists cars around it (an unknown ZIP is a 400, not
   * charged).
   */
  zip: string | number;
  /**
   * A make. By name or Autotrader code (Toyota, Ford, Mercedes-Benz, Land Rover, or MB, ROV ...; 72
   * makes).
   */
  make?: string;
  /**
   * A model as Autotrader names it (Civic, F150, RAV4, C-Class) or its model code
   * (listings[].model_code, makes models[].code). Needs make. A different spelling (F-150) is
   * matched to Autotrader's name; a model Autotrader does not list for the make is a charged 404
   * that lists the make's models.
   */
  model?: string;
  /** A trim as listings[].trim_code gives it (MODEL|Trim). Needs make and model. */
  trim_code?: string;
  /**
   * Miles around the ZIP: 10, 25, 50, 75, 100, 200, 300, 400, 500, 0 (0 = nationwide). Autotrader's
   * default otherwise (location.radius_miles says which).
   */
  radius?: number;
  /** Page (default 1, at most 100). */
  page?: number;
  /** Listings a page: 25 (default) or 100. */
  page_size?: number;
  /** relevance (default), price_asc, mileage_asc, year_desc (newest model year), distance_asc. */
  sort?: "relevance" | "price_asc" | "mileage_asc" | "year_desc" | "distance_asc";
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
  /**
   * Body style, code or label: CONVERT (Convertible), COUPE (Coupe), HATCH (Hatchback), SEDAN
   * (Sedan), SUVCROSS (SUV / Crossover), TRUCKS (Truck), VANMV (Van / Minivan), WAGON (Wagon).
   */
  body_style?: string;
  /** Drivetrain: AWD4WD (AWD/4WD), FWD (Front Wheel Drive), RWD (Rear Wheel Drive). */
  drivetrain?: string;
  /**
   * Exterior colour: BEIGE (Beige), BLACK (Black), BLUE (Blue), BROWN (Brown), BURGUNDY (Burgundy),
   * CHARCOAL (Charcoal), GOLD (Gold), GRAY (Gray), GREEN (Green), OFFWHITE (Off White), ORANGE
   * (Orange), PINK (Pink), PURPLE (Purple), RED (Red), SILVER (Silver), TAN (Tan), TURQUOISE
   * (Turquoise), WHITE (White), YELLOW (Yellow).
   */
  exterior_color?: string;
  /** Interior colour (same values as exterior_color). */
  interior_color?: string;
  /** dealer or private (private sellers). */
  seller_type?: "dealer" | "private";
  /** new, used, certified (manufacturer certified pre-owned) or third_party_certified. */
  listing_type?: "new" | "used" | "certified" | "third_party_certified";
  /**
   * Fuel type: GSL (Gasoline), DSL (Diesel), HYB (Hybrid), ELE (Electric), HYD (Hydrogen), PIH
   * (Plug-in Hybrid).
   */
  fuel?: string;
  /** Transmission: AUT (Automatic), MAN (Manual). */
  transmission?: string;
  /**
   * Vehicle history as Autotrader filters it: NO_ACCIDENTS (No Accidents), ONE_OWNER (Single
   * Owner), CLEAN_TITLE (Clean Title), NO_FRAME_DAMAGE (No Frame Damage), FREE_REPORT (Free
   * Report).
   */
  history?: string;
  /**
   * Only listings Autotrader labels a Good Price or Great Price deal (based on the Kelley Blue Book
   * Fair Purchase Price range).
   */
  deal?: "good" | "great";
  /**
   * One feature, code or label: 1062 (Keyless Entry), 1317 (Premium Wheels), 1172 (Roof Rack), 1199
   * (Trailer Hitch), AT0001 (Dual Rear Wheels), 1318 (Disability Equipped), 1327 (Android Auto),
   * 1326 (Apple CarPlay), 1211 (Bluetooth, Hands-Free), 1033 (Cruise Control), 1297 (DVD Player),
   * 1066 (Navigation), 1230 (Portable Audio Connection), 1136 (Premium Audio), 1149 (Satellite
   * Radio), 1161 (Steering Wheel Controls), 1221 (Remote Engine Start), 1313 (Adaptive Cruise
   * Control), 1298 (Heads Up Display), 1160 (Rain Sensing Wipers), 1229 (Keyless Start), 1180
   * (Parking Assist), 1331 (WiFi Hotspot), 1306 (3rd Row Seats), 1319 (Heated Seats), 1078 (Leather
   * Seats), 1132 (Sunroof), 1224 (Backup Camera), 1142 (Night Vision), 1310 (Lane Departure
   * Warning), 1309 (Blind Spot Monitor), 1330 (Cross Traffic Alert), 1228 (Brake Assist), 1013
   * (Security System).
   */
  feature?: string;
  /** Doors: 2 (Two Door), 3 (Three Door), 4 (Four Door), 5 (Five Door). */
  doors?: string;
  /** Seats: 2, 3, 4, 5, 6, 7, 8+. */
  seating?: string;
  [key: string]: unknown;
}

export interface AutotraderListingOptions {
  /** An Autotrader listing id (listings[].listing_id). */
  listing_id?: string | number;
  /**
   * An Autotrader listing link (https://www.autotrader.com/cars-for-sale/vehicle/<id>) instead of
   * listing_id.
   */
  url?: string;
  /**
   * Optional: the distance (seller.distance_miles) is measured from this US ZIP code; without it
   * distance_miles is null.
   */
  zip?: string | number;
  [key: string]: unknown;
}

export interface AutotraderDealersOptions {
  /**
   * Required. A 5-digit US ZIP code: Autotrader lists cars around it (an unknown ZIP is a 400, not
   * charged).
   */
  zip: string | number;
  /**
   * Only dealers of this make (Autotrader's franchise filter). By name or Autotrader code (Toyota,
   * Ford, Mercedes-Benz, Land Rover, or MB, ROV ...; 72 makes).
   */
  make?: string;
  /**
   * Miles around the ZIP: 10, 25, 50, 75, 100, 200, 300, 500, 0 (0 = any). Autotrader's default
   * otherwise.
   */
  radius?: number;
  /** Dealers with cars from this price, whole USD. */
  price_min?: number;
  /** Dealers with cars up to this price, whole USD. */
  price_max?: number;
  /** Dealers with cars from this model year. */
  year_min?: number;
  /** Dealers with cars up to this model year. */
  year_max?: number;
  [key: string]: unknown;
}

export interface AutotraderDealerOptions {
  /** An Autotrader dealer id (dealers[].dealer_id, listings[].seller.dealer_id). */
  dealer_id?: string | number;
  /**
   * An Autotrader dealer link (https://www.autotrader.com/car-dealers/<city-st>/<id>/<name>)
   * instead of dealer_id.
   */
  url?: string;
  [key: string]: unknown;
}

export interface AutotraderMakesOptions {
  /**
   * Required. By name or Autotrader code (Toyota, Ford, Mercedes-Benz, Land Rover, or MB, ROV ...;
   * 72 makes).
   */
  make: string;
  [key: string]: unknown;
}

export class AutotraderNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = AUTOTRADER_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/autotrader/${path}`, options, undefined, timeout);
  }

  /**
   * Search the cars for sale on Autotrader (autotrader.com, the US car marketplace run by Cox
   * Automotive). Scavio fetches the public Autotrader page on request; Autotrader has no public API
   * for reading listings. Around a US ZIP code with a radius, by make, model and trim, sorted by
   * relevance, price, mileage, model year or distance, filtered by model year, price, mileage, body
   * style, drivetrain, colours, dealer or private seller, new / used / certified, fuel,
   * transmission, vehicle history, Good or Great deal, a feature, doors and seats; 25 or 100 a
   * page. Costs 2 credits.
   */
  async search(options: AutotraderSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One car listing on Autotrader (autotrader.com, the US car marketplace run by Cox Automotive).
   * Scavio fetches the public Autotrader page on request; Autotrader has no public API for reading
   * listings. By listing id or link. Costs 2 credits.
   */
  async listing(options: AutotraderListingOptions): Promise<Record<string, unknown>> {
    return this.post("listing", options);
  }

  /**
   * Car dealers near a US ZIP code on Autotrader (autotrader.com, the US car marketplace run by Cox
   * Automotive). Scavio fetches the public Autotrader page on request; Autotrader has no public API
   * for reading listings. Optionally of one make, within a radius, and with cars in a price or
   * model-year range. Costs 2 credits.
   */
  async dealers(options: AutotraderDealersOptions): Promise<Record<string, unknown>> {
    return this.post("dealers", options);
  }

  /**
   * One dealer on Autotrader (autotrader.com, the US car marketplace run by Cox Automotive). Scavio
   * fetches the public Autotrader page on request; Autotrader has no public API for reading
   * listings. By dealer id or link. Costs 2 credits.
   */
  async dealer(options: AutotraderDealerOptions): Promise<Record<string, unknown>> {
    return this.post("dealer", options);
  }

  /**
   * One make's models on Autotrader (autotrader.com, the US car marketplace run by Cox Automotive).
   * Scavio fetches the public Autotrader page on request; Autotrader has no public API for reading
   * listings. By make. Costs 2 credits.
   */
  async makes(options: AutotraderMakesOptions): Promise<Record<string, unknown>> {
    return this.post("makes", options);
  }
}
