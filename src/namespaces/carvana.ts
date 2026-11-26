import type { Scavio } from "../client.js";

// Carvana (the US online used-car retailer) search, vehicle, modelGuide, trims, make and makes
// endpoints; US only, prices in USD, Carvana's own city pages for the location (no ZIP targeting),
// 1 credit each. Generated from the backend routes: every option and its doc mirrors the API's own
// request schema; an input the API only accepts to refuse (a 400 that says 'not offered') is left
// out. The server enforces the value rules and the one-of rules (send one of an id or a link).
// Every call raises the request timeout to CARVANA_TIMEOUT and never lowers a longer client
// timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every carvana call. */
export const CARVANA_TIMEOUT = 240_000;

export interface CarvanaSearchOptions {
  /** A make as Carvana writes it (makes lists them; case ignored): Toyota, Ford, Mercedes-Benz. */
  make?: string;
  /**
   * Needs make. A model as Carvana writes it (make lists them; case ignored, hyphens count): RAV4,
   * F-150, CR-V.
   */
  model?: string;
  /**
   * One of Carvana's city pages (new-york-ny, los-angeles-ca, or "New York, NY"): the location
   * shipping and delivery are shown for. Only with make, model and page: a filter or a sort with
   * city is a 400 (Carvana uses the visit's own location on filtered pages).
   */
  city?: string;
  /** Page, 1-based (default 1); 24 vehicles a page. */
  page?: number;
  /**
   * most_popular (Carvana's default; recomputed per visit, not stable between pages), lowest_price,
   * highest_price, lowest_mileage, newest_year, newest_listed.
   */
  sort?: "most_popular" | "lowest_price" | "highest_price" | "lowest_mileage" | "newest_year" | "newest_listed";
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
  /**
   * Needs make and model. Trim names as Carvana writes them (include_facets lists them under
   * facets.models[].trims).
   */
  trims?: string[] | string;
  /** Any of: 4wd, awd, fwd, rwd (a list or comma-separated). */
  drive_types?: string[] | string;
  /**
   * Any of: beige, black, blue, brown, gold, gray, green, orange, pink, purple, red, silver, white,
   * yellow (a list or comma-separated).
   */
  colors?: string[] | string;
  /**
   * Any of: suv, sedan, truck, coupe, minivan, convertible, wagon, hatchback (a list or
   * comma-separated).
   */
  body_styles?: string[] | string;
  /** Any of: gas, diesel, electric, hybrid, plug_in_hybrid (a list or comma-separated). */
  fuel_types?: string[] | string;
  /**
   * Any of: great_deal, new_price, no_reported_accidents, single_owner, recently_added,
   * low_miles_per_year (Carvana's own labels) (a list or comma-separated).
   */
  tags?: string[] | string;
  /** Only vehicles Carvana ships free to the location the page uses. */
  free_shipping?: boolean;
  /**
   * Also return facets: counts per filter value, the makes, and the make's models with their trims.
   */
  include_facets?: boolean;
  [key: string]: unknown;
}

export interface CarvanaVehicleOptions {
  /** A Carvana vehicle id (items[].vehicle_id from search; the number in a vehicle link). */
  vehicle_id?: string | number;
  /** A carvana.com vehicle link instead of vehicle_id. */
  url?: string;
  [key: string]: unknown;
}

export interface CarvanaModelGuideOptions {
  /** Model year. */
  year: number;
  /** A make as Carvana writes it (makes lists them; case ignored): Toyota, Ford, Mercedes-Benz. */
  make: string;
  /**
   * A model as Carvana writes it (make lists them; case ignored, hyphens count): RAV4, F-150, CR-V.
   */
  model: string;
  [key: string]: unknown;
}

export interface CarvanaTrimsOptions {
  /** A make as Carvana writes it (makes lists them; case ignored): Toyota, Ford, Mercedes-Benz. */
  make: string;
  /**
   * A model as Carvana writes it (make lists them; case ignored, hyphens count): RAV4, F-150, CR-V.
   */
  model: string;
  [key: string]: unknown;
}

export interface CarvanaMakeOptions {
  /** A make as Carvana writes it (makes lists them; case ignored): Toyota, Ford, Mercedes-Benz. */
  make: string;
  [key: string]: unknown;
}

export interface CarvanaMakesOptions {
  [key: string]: unknown;
}

export class CarvanaNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = CARVANA_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/carvana/${path}`, options, undefined, timeout);
  }

  /**
   * Search the used-car inventory of Carvana (carvana.com, the US online used-car retailer). Scavio
   * fetches the public carvana.com page on request; Carvana has no public API. US only, prices in
   * USD. By make and model (names as Carvana writes them), 24 vehicles a page, with six sorts (most
   * popular, lowest and highest price, lowest mileage, newest model year, newest listed) and
   * Carvana's filters: model year, price, maximum mileage, trims, drive types, colors, body styles,
   * fuel types, Carvana's tags (Great Deal, New Price, No Reported Accidents, Single Owner,
   * Recently Added, Low Miles Per Year) and free shipping. Inventory is national; the location
   * (Carvana's own city pages via city, else the one Carvana sets for the visit) changes shipping
   * costs and delivery flags. Costs 1 credit.
   */
  async search(options: CarvanaSearchOptions = {}): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One vehicle of Carvana (carvana.com, the US online used-car retailer). Scavio fetches the
   * public carvana.com page on request; Carvana has no public API. US only, prices in USD. By
   * vehicle id or link. Costs 1 credit.
   */
  async vehicle(options: CarvanaVehicleOptions): Promise<Record<string, unknown>> {
    return this.post("vehicle", options);
  }

  /**
   * Carvana's research page for one model year, from Carvana (carvana.com, the US online used-car
   * retailer). Scavio fetches the public carvana.com page on request; Carvana has no public API. US
   * only, prices in USD. Costs 1 credit.
   */
  async modelGuide(options: CarvanaModelGuideOptions): Promise<Record<string, unknown>> {
    return this.post("model-guide", options);
  }

  /**
   * Carvana's trim guide for one model, from Carvana (carvana.com, the US online used-car
   * retailer). Scavio fetches the public carvana.com page on request; Carvana has no public API. US
   * only, prices in USD. Costs 1 credit.
   */
  async trims(options: CarvanaTrimsOptions): Promise<Record<string, unknown>> {
    return this.post("trims", options);
  }

  /**
   * One make's model lineup on Carvana (carvana.com, the US online used-car retailer). Scavio
   * fetches the public carvana.com page on request; Carvana has no public API. US only, prices in
   * USD. Costs 1 credit.
   */
  async make(options: CarvanaMakeOptions): Promise<Record<string, unknown>> {
    return this.post("make", options);
  }

  /**
   * Every make in the inventory of Carvana (carvana.com, the US online used-car retailer). Scavio
   * fetches the public carvana.com page on request; Carvana has no public API. US only, prices in
   * USD. with its in-stock count. Costs 1 credit.
   */
  async makes(options: CarvanaMakesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("makes", options);
  }
}
