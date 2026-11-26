import type { Scavio } from "../client.js";

// RockAuto (rockauto.com, the online auto parts catalog) vehicles, categories, parts, search,
// brand, brands, part, suggestions, resolve, tools and promotions endpoints; the US catalog in 15
// display currencies, language en, es, fr or de; 1 credit each. Generated from the backend routes:
// every option and its doc mirrors the API's own request schema; an input the API only accepts to
// refuse (a 400 that says 'not offered') is left out. The server enforces the value rules and the
// one-of rules (send one of an id or a link). Every call raises the request timeout to
// ROCKAUTO_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused
// inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every rockauto call. */
export const ROCKAUTO_TIMEOUT = 240_000;

export interface RockautoVehiclesOptions {
  /** No make: every make. A make: its years. */
  make?: string;
  /** With make: that year's models. */
  year?: number;
  /** With make and year: the model's engines, each with its carcode. */
  model?: string;
  /**
   * en (default), es, fr or de: RockAuto's page language (names, notes, tiers and labels; part
   * numbers and prices do not change).
   */
  language?: "en" | "es" | "fr" | "de";
  [key: string]: unknown;
}

export interface RockautoCategoriesOptions {
  /** Make as vehicles answers it (engines[].make). */
  make: string;
  year: number;
  /** Model as vehicles answers it (engines[].model). */
  model: string;
  /** Engine as vehicles answers it (engines[].engine). */
  engine: string;
  /**
   * RockAuto's vehicle code (engines[].carcode, or a suggestions / resolve vehicle). RockAuto picks
   * the vehicle by carcode: one that answers another vehicle than make / year / model / engine is a
   * 400, not charged.
   */
  carcode: string | number;
  /**
   * A category from categories[].category: its part types. Without it: the vehicle's categories.
   */
  category?: string;
  /**
   * en (default), es, fr or de: RockAuto's page language (names, notes, tiers and labels; part
   * numbers and prices do not change).
   */
  language?: "en" | "es" | "fr" | "de";
  [key: string]: unknown;
}

export interface RockautoPartsOptions {
  /** Make as vehicles answers it (engines[].make). */
  make: string;
  year: number;
  /** Model as vehicles answers it (engines[].model). */
  model: string;
  /** Engine as vehicles answers it (engines[].engine). */
  engine: string;
  /**
   * RockAuto's vehicle code (engines[].carcode, or a suggestions / resolve vehicle). RockAuto picks
   * the vehicle by carcode: one that answers another vehicle than make / year / model / engine is a
   * 400, not charged.
   */
  carcode: string | number;
  /** categories[].category. */
  category: string;
  /** part_types[].part_type_id (1684 = Brake Pad). */
  part_type_id: string | number;
  /** Optional part type name (part_types[].name); RockAuto reads the part type by its id. */
  part_type?: string;
  /**
   * en (default), es, fr or de: RockAuto's page language (names, notes, tiers and labels; part
   * numbers and prices do not change).
   */
  language?: "en" | "es" | "fr" | "de";
  /**
   * USD (default), AUD, BRL, GBP, CAD, CLP, EUR, HUF, JPY, MXN, NZD, NOK, PLN, SEK or CHF:
   * RockAuto's display currency (one US catalog, prices converted by RockAuto).
   */
  currency?: "USD" | "AUD" | "BRL" | "GBP" | "CAD" | "CLP" | "EUR" | "HUF" | "JPY" | "MXN" | "NZD" | "NOK" | "PLN" | "SEK" | "CHF";
  [key: string]: unknown;
}

export interface RockautoSearchOptions {
  /**
   * A part number: RockAuto's brands' numbers and the OE / interchange numbers RockAuto maps to
   * them (e.g. 41-110, PH7317, 0986494104).
   */
  part_number: string;
  /** Only this brand (brands[] value). */
  brand?: string;
  /**
   * Only this part type (an id from part_types, brands with include_part_types, or an item's
   * part_type_id).
   */
  part_type_id?: string | number;
  /**
   * en (default), es, fr or de: RockAuto's page language (names, notes, tiers and labels; part
   * numbers and prices do not change).
   */
  language?: "en" | "es" | "fr" | "de";
  /**
   * USD (default), AUD, BRL, GBP, CAD, CLP, EUR, HUF, JPY, MXN, NZD, NOK, PLN, SEK or CHF:
   * RockAuto's display currency (one US catalog, prices converted by RockAuto).
   */
  currency?: "USD" | "AUD" | "BRL" | "GBP" | "CAD" | "CLP" | "EUR" | "HUF" | "JPY" | "MXN" | "NZD" | "NOK" | "PLN" | "SEK" | "CHF";
  [key: string]: unknown;
}

export interface RockautoBrandOptions {
  /** A brand from brands (RockAuto's brand name). */
  brand: string;
  /** A part type id (brands with include_part_types, or part_types from categories). */
  part_type_id: string | number;
  /**
   * en (default), es, fr or de: RockAuto's page language (names, notes, tiers and labels; part
   * numbers and prices do not change).
   */
  language?: "en" | "es" | "fr" | "de";
  /**
   * USD (default), AUD, BRL, GBP, CAD, CLP, EUR, HUF, JPY, MXN, NZD, NOK, PLN, SEK or CHF:
   * RockAuto's display currency (one US catalog, prices converted by RockAuto).
   */
  currency?: "USD" | "AUD" | "BRL" | "GBP" | "CAD" | "CLP" | "EUR" | "HUF" | "JPY" | "MXN" | "NZD" | "NOK" | "PLN" | "SEK" | "CHF";
  [key: string]: unknown;
}

export interface RockautoBrandsOptions {
  /** true adds RockAuto's part type list (about 5,500 ids and names). */
  include_part_types?: boolean;
  /**
   * en (default), es, fr or de: RockAuto's page language (names, notes, tiers and labels; part
   * numbers and prices do not change).
   */
  language?: "en" | "es" | "fr" | "de";
  [key: string]: unknown;
}

export interface RockautoPartOptions {
  /** items[].part.part_key. */
  part_key: string | number;
  /** items[].part.part_type_id. */
  part_type_id: string | number;
  /** items[].part.carcode (0 from search, brand and tools). */
  carcode?: string | number;
  /**
   * USD (default), AUD, BRL, GBP, CAD, CLP, EUR, HUF, JPY, MXN, NZD, NOK, PLN, SEK or CHF:
   * RockAuto's display currency (one US catalog, prices converted by RockAuto).
   */
  currency?: "USD" | "AUD" | "BRL" | "GBP" | "CAD" | "CLP" | "EUR" | "HUF" | "JPY" | "MXN" | "NZD" | "NOK" | "PLN" | "SEK" | "CHF";
  [key: string]: unknown;
}

export interface RockautoSuggestionsOptions {
  /** Typed text: a vehicle (2015 ford f-150), a part type (brake pad) or a tool. */
  query: string;
  [key: string]: unknown;
}

export interface RockautoResolveOptions {
  /** Free text naming a vehicle and, optionally, a part. */
  query: string;
  [key: string]: unknown;
}

export interface RockautoToolsOptions {
  /** A tools category (categories[].category): its subcategories. */
  category?: string;
  /** With category: a subcategory (subcategories[].subcategory): its part types. */
  subcategory?: string;
  /**
   * A tools / universal part type id (part_types[].part_type_id, or suggestions tools[]): its
   * listing.
   */
  part_type_id?: string | number;
  /**
   * en (default), es, fr or de: RockAuto's page language (names, notes, tiers and labels; part
   * numbers and prices do not change).
   */
  language?: "en" | "es" | "fr" | "de";
  /**
   * USD (default), AUD, BRL, GBP, CAD, CLP, EUR, HUF, JPY, MXN, NZD, NOK, PLN, SEK or CHF:
   * RockAuto's display currency (one US catalog, prices converted by RockAuto).
   */
  currency?: "USD" | "AUD" | "BRL" | "GBP" | "CAD" | "CLP" | "EUR" | "HUF" | "JPY" | "MXN" | "NZD" | "NOK" | "PLN" | "SEK" | "CHF";
  [key: string]: unknown;
}

export interface RockautoPromotionsOptions {
  /**
   * en (default), es, fr or de: RockAuto's page language (names, notes, tiers and labels; part
   * numbers and prices do not change).
   */
  language?: "en" | "es" | "fr" | "de";
  [key: string]: unknown;
}

export class RockautoNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = ROCKAUTO_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/rockauto/${path}`, options, undefined, timeout);
  }

  /**
   * RockAuto's vehicle catalog, one level at a time (RockAuto (rockauto.com, the online auto parts
   * catalog based in Madison, Wisconsin). Scavio fetches the public RockAuto page on request.).
   * Costs 1 credit.
   */
  async vehicles(options: RockautoVehiclesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("vehicles", options);
  }

  /**
   * One vehicle's part categories on RockAuto (rockauto.com, the online auto parts catalog based in
   * Madison, Wisconsin). Scavio fetches the public RockAuto page on request. Without category:
   * categories [{category (the input), name (in the page language), url}]; with category:
   * part_types [{part_type_id (the input of parts), name, category, url}]. Costs 1 credit.
   */
  async categories(options: RockautoCategoriesOptions): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * Every brand's listing for one part type on one vehicle (RockAuto (rockauto.com, the online auto
   * parts catalog based in Madison, Wisconsin). Scavio fetches the public RockAuto page on
   * request.). Costs 1 credit.
   */
  async parts(options: RockautoPartsOptions): Promise<Record<string, unknown>> {
    return this.post("parts", options);
  }

  /**
   * Part number and interchange search on RockAuto (rockauto.com, the online auto parts catalog
   * based in Madison, Wisconsin). Scavio fetches the public RockAuto page on request. Matches
   * across brands, including OE and interchange numbers RockAuto maps to its listings. Costs 1
   * credit.
   */
  async search(options: RockautoSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One brand's parts of one part type on RockAuto (rockauto.com, the online auto parts catalog
   * based in Madison, Wisconsin). Scavio fetches the public RockAuto page on request. Costs 1
   * credit.
   */
  async brand(options: RockautoBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * RockAuto's brand list and part groups (RockAuto (rockauto.com, the online auto parts catalog
   * based in Madison, Wisconsin). Scavio fetches the public RockAuto page on request.). Costs 1
   * credit.
   */
  async brands(options: RockautoBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /**
   * One part's detail page on RockAuto (rockauto.com, the online auto parts catalog based in
   * Madison, Wisconsin). Scavio fetches the public RockAuto page on request. by the part keys from
   * an item. Costs 1 credit.
   */
  async part(options: RockautoPartOptions): Promise<Record<string, unknown>> {
    return this.post("part", options);
  }

  /**
   * RockAuto's search box suggestions for typed text (RockAuto (rockauto.com, the online auto parts
   * catalog based in Madison, Wisconsin). Scavio fetches the public RockAuto page on request.).
   * Costs 1 credit.
   */
  async suggestions(options: RockautoSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Free text to a RockAuto vehicle (RockAuto (rockauto.com, the online auto parts catalog based in
   * Madison, Wisconsin). Scavio fetches the public RockAuto page on request.): how RockAuto's
   * search box reads "2010 honda accord brake pads". Costs 1 credit.
   */
  async resolve(options: RockautoResolveOptions): Promise<Record<string, unknown>> {
    return this.post("resolve", options);
  }

  /**
   * RockAuto's tools and universal parts catalog (RockAuto (rockauto.com, the online auto parts
   * catalog based in Madison, Wisconsin). Costs 1 credit.
   */
  async tools(options: RockautoToolsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("tools", options);
  }

  /**
   * RockAuto's promotions and manufacturer rebates page (RockAuto (rockauto.com, the online auto
   * parts catalog based in Madison, Wisconsin). Scavio fetches the public RockAuto page on
   * request.). Costs 1 credit.
   */
  async promotions(options: RockautoPromotionsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("promotions", options);
  }
}
