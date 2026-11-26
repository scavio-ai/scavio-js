import type { Scavio } from "../client.js";

// StreetEasy (streeteasy.com, Zillow Group's New York City real estate site) search, listing,
// building, buildings and market endpoints; NYC and North NJ (market data NYC only), prices in USD,
// 1 credit each. Generated from the backend routes: every option and its doc mirrors the API's own
// request schema; an input the API only accepts to refuse (a 400 that says 'not offered') is left
// out. The server enforces the value rules and the one-of rules (send one of an id or a link).
// Every call raises the request timeout to STREETEASY_TIMEOUT and never lowers a longer client
// timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every streeteasy call. */
export const STREETEASY_TIMEOUT = 240_000;

export interface StreeteasySearchOptions {
  /** sale (homes for sale, default), rent (rentals) or sold (past sales). */
  mode?: "sale" | "rent" | "sold";
  /**
   * A StreetEasy area by name, slug or id: a borough (Manhattan, Brooklyn, Queens, Bronx, Staten
   * Island), a neighborhood (Williamsburg, Upper West Side), a New Jersey city (Jersey City,
   * Hoboken), or nyc for all of NYC and NJ. Ids: 100 Manhattan, 300 Brooklyn, 400 Queens, 302
   * Williamsburg, 1001000 Jersey City. The answer returns the area id.
   */
  area: string | number;
  /** Lowest price (rent per month on mode rent), USD. */
  price_min?: number;
  /** Highest price (rent per month on mode rent), USD. */
  price_max?: number;
  /** Fewest bedrooms (0 = studio). */
  beds_min?: number;
  /** Most bedrooms. beds_min = beds_max asks for exactly that many. */
  beds_max?: number;
  /** Fewest bathrooms. */
  baths_min?: number;
  /** Smallest size in square feet (listings without a size are left out). */
  sqft_min?: number;
  /** Mode sale and sold: condo, coop, house, multifamily. */
  home_types?: Array<"condo" | "coop" | "house" | "multifamily">;
  /**
   * Mode sale and sold: sponsor, resale, foreclosure, restricted (sponsor = a sponsor unit, sold by
   * the developer).
   */
  sale_types?: Array<"sponsor" | "resale" | "foreclosure" | "restricted">;
  year_built_min?: number;
  year_built_max?: number;
  /**
   * StreetEasy's amenity filters, all required: washer_dryer, dishwasher, elevator, doorman,
   * laundry, gym, parking, pool, storage, private_outdoor_space, public_outdoor_space, central_ac,
   * furnished, fireplace, loft, city_view, garden_view, park_view, skyline_view, waterview,
   * guarantor_ok, pied_a_terre, childrens_playroom, smoke_free.
   */
  amenities?: Array<"washer_dryer" | "dishwasher" | "elevator" | "doorman" | "laundry" | "gym" | "parking" | "pool" | "storage" | "private_outdoor_space" | "public_outdoor_space" | "central_ac" | "furnished" | "fireplace" | "loft" | "city_view" | "garden_view" | "park_view" | "skyline_view" | "waterview" | "guarantor_ok" | "pied_a_terre" | "childrens_playroom" | "smoke_free">;
  /** Only listings that allow pets. */
  pets_allowed?: boolean;
  /** Only listings in this ZIP code (with area nyc to search every borough). */
  zip?: string;
  /** Mode rent: only listings posted by the owner (no broker). */
  by_owner?: boolean;
  /** Mode sale: active (default: on the market) or in_contract (StreetEasy's pending). */
  status?: "active" | "in_contract";
  /**
   * recommended (StreetEasy's default; mode sold defaults to newest), newest, recently_updated,
   * price_desc, price_asc, sqft_desc, sqft_asc. The sort orders the organic results.
   */
  sort?: "recommended" | "newest" | "recently_updated" | "price_desc" | "price_asc" | "sqft_desc" | "sqft_asc";
  /**
   * Page, from 1; pages and has_more say how deep the results go (sale pages hold about 38 cards,
   * rent pages 14).
   */
  page?: number;
  [key: string]: unknown;
}

export interface StreeteasyListingOptions {
  /**
   * A StreetEasy listing link or path (listings[].url), e.g. /building/<building>/<unit> or
   * /sale/<id>.
   */
  url?: string;
  /** Or a StreetEasy listing id (listings[].id) with listing_type. */
  id?: string | number;
  /** With id: sale (for sale and sold listings) or rent. */
  listing_type?: "sale" | "rent";
  [key: string]: unknown;
}

export interface StreeteasyBuildingOptions {
  /** A StreetEasy building slug (building.slug). */
  slug?: string;
  /** Or the building's StreetEasy link (a listing link in the building works too). */
  url?: string;
  [key: string]: unknown;
}

export interface StreeteasyBuildingsOptions {
  /** A StreetEasy area by name, slug or id (as in search). */
  area: string | number;
  /** Only condo, coop, rental buildings. */
  building_type?: "condo" | "coop" | "rental";
  /** Page, from 1 (StreetEasy lists about 11 buildings a page). */
  page?: number;
  [key: string]: unknown;
}

export interface StreeteasyMarketOptions {
  /** sales (default) or rentals. */
  type?: "sales" | "rentals";
  /**
   * sales: price_index, inventory, sale_to_list_ratio, recorded_sales, median_sale_price,
   * median_asking_price, median_days_on_market, share_of_price_cuts (default median_sale_price).
   * rentals: rental_index, inventory, median_asking_rent, share_of_rent_cuts (default
   * median_asking_rent).
   */
  metric?: string;
  /**
   * sales by home type: all (default), condo, coop, single_family. rentals by bedrooms: all,
   * studio, one_bedroom, two_bedrooms, three_plus_bedrooms. price_index and rental_index are
   * published for all only. (8 values.)
   */
  filter?: string;
  /**
   * One area by name, slug or id (a neighborhood, a borough, or NYC); every published area when
   * omitted. The data covers New York City.
   */
  area?: string | number;
  /**
   * First month (YYYY-MM); StreetEasy's series start in 2010-01 (price_index in 2005-01,
   * rental_index in 2007-01).
   */
  start_month?: string;
  /** Last month (YYYY-MM). */
  end_month?: string;
  [key: string]: unknown;
}

export class StreeteasyNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = STREETEASY_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/streeteasy/${path}`, options, undefined, timeout);
  }

  /**
   * Search homes for sale, rentals or past sales in an NYC or North NJ area on StreetEasy
   * (streeteasy.com, Zillow Group's New York City real estate site). StreetEasy covers NYC's five
   * boroughs and North New Jersey. Scavio fetches the public StreetEasy page on request. Filters:
   * price, bedrooms, bathrooms, size, home type, sale type, year built, amenities, pets, ZIP, by
   * owner (rent) and in contract (sale); 7 sorts; up to 100 pages. Costs 1 credit.
   */
  async search(options: StreeteasySearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One StreetEasy (streeteasy.com, Zillow Group's New York City real estate site) listing in full
   * (for sale, sold or for rent) by link or by id with listing_type. Costs 1 credit.
   */
  async listing(options: StreeteasyListingOptions): Promise<Record<string, unknown>> {
    return this.post("listing", options);
  }

  /**
   * One NYC or North NJ building on StreetEasy (streeteasy.com, Zillow Group's New York City real
   * estate site) by slug or link. Costs 1 credit.
   */
  async building(options: StreeteasyBuildingOptions): Promise<Record<string, unknown>> {
    return this.post("building", options);
  }

  /**
   * The building directory of StreetEasy (streeteasy.com, Zillow Group's New York City real estate
   * site) for an area. Costs 1 credit.
   */
  async buildings(options: StreeteasyBuildingsOptions): Promise<Record<string, unknown>> {
    return this.post("buildings", options);
  }

  /**
   * The monthly market data StreetEasy (streeteasy.com, Zillow Group's New York City real estate
   * site) publishes for New York City from 2010-01 (its neighborhoods, the five boroughs and NYC;
   * the price and rental indexes for Brooklyn, Manhattan, Queens and NYC, from 2005 and 2007), as
   * StreetEasy publishes it; New Jersey areas have no published series. Sales: price_index,
   * inventory, sale_to_list_ratio, recorded_sales, median_sale_price, median_asking_price,
   * median_days_on_market, share_of_price_cuts, by home type. Rentals: rental_index, inventory,
   * median_asking_rent, share_of_rent_cuts, by bedrooms. Costs 1 credit.
   */
  async market(options: StreeteasyMarketOptions = {}): Promise<Record<string, unknown>> {
    return this.post("market", options);
  }
}
