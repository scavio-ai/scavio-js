import type { Scavio } from "../client.js";

// U-Haul (uhaul.com, the US and Canada truck rental and self-storage company) truckQuote,
// locations, location, storageSearch, storageFacility, reviews, suggestions and supplies endpoints;
// US and Canada (English, Spanish or French site), 1 credit each. Truck quotes are U-Haul's public
// quote form, never a reservation. Generated from the backend routes: every option and its doc
// mirrors the API's own request schema; an input the API only accepts to refuse (a 400 that says
// 'not offered') is left out. The server enforces the value rules and the one-of rules (send one of
// an id or a link). Every call raises the request timeout to UHAUL_TIMEOUT and never lowers a
// longer client timeout. Failed upstream calls and refused inputs are not charged; a not-found is
// charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every uhaul call. */
export const UHAUL_TIMEOUT = 240_000;

export interface UhaulTruckQuoteOptions {
  /**
   * Pickup: a city with its state or province (Dallas, TX; Toronto, ON), a US ZIP or a Canadian
   * postal code.
   */
  pickup: string;
  /** Drop-off for a one-way move. Leave it out for an in-town quote (return to the same area). */
  dropoff?: string;
  /**
   * Pickup day, YYYY-MM-DD: today or later, up to 330 days ahead (U-Haul quotes up to 11 months
   * out).
   */
  date: string;
  /**
   * en (default, www.uhaul.com), es (es.uhaul.com, U-Haul's Spanish site) or fr (fr.uhaul.com,
   * U-Haul's French site). The market (US or Canada) follows the place.
   */
  language?: "en" | "es" | "fr";
  [key: string]: unknown;
}

export interface UhaulLocationsOptions {
  /** A city with its state or province (Dallas, TX), a ZIP or a postal code (M5V 2T6). */
  near: string;
  /** truck_rentals (default), trailer_rentals, moving_supplies or self_storage. */
  service?: "truck_rentals" | "trailer_rentals" | "moving_supplies" | "self_storage";
  /**
   * Page from 1 (6 locations a page where U-Haul pages; some places list every location on page 1).
   */
  page?: number;
  /**
   * en (default, www.uhaul.com), es (es.uhaul.com, U-Haul's Spanish site) or fr (fr.uhaul.com,
   * U-Haul's French site). The market (US or Canada) follows the place.
   */
  language?: "en" | "es" | "fr";
  [key: string]: unknown;
}

export interface UhaulLocationOptions {
  /** A U-Haul location id (locations[].location_id). */
  location_id?: string | number;
  /**
   * Or the location link (locations[].url), e.g.
   * https://www.uhaul.com/Locations/Truck-Rentals-near-Dallas-TX-75206/741028/.
   */
  url?: string;
  /**
   * en (default, www.uhaul.com), es (es.uhaul.com, U-Haul's Spanish site) or fr (fr.uhaul.com,
   * U-Haul's French site). The market (US or Canada) follows the place.
   */
  language?: "en" | "es" | "fr";
  [key: string]: unknown;
}

export interface UhaulStorageSearchOptions {
  /** A city with its state or province (Phoenix, AZ), a ZIP or a postal code. */
  near: string;
  /** distance (default), price (starting rate, low to high) or rating (high to low). */
  sort?: "distance" | "price" | "rating";
  /**
   * Facilities with every one of these features: climate_control (Climate Control), indoor (Indoor
   * Storage), drive_up (Outdoor/Drive Up), portable (Portable Storage), rent_now_online (Online
   * Move-In/Rent Now), vehicle (RV/Boat/Vehicle Storage).
   */
  features?: Array<"climate_control" | "indoor" | "drive_up" | "portable" | "rent_now_online" | "vehicle">;
  /**
   * en (default, www.uhaul.com), es (es.uhaul.com, U-Haul's Spanish site) or fr (fr.uhaul.com,
   * U-Haul's French site). The market (US or Canada) follows the place.
   */
  language?: "en" | "es" | "fr";
  [key: string]: unknown;
}

export interface UhaulStorageFacilityOptions {
  /** A U-Haul storage facility id (facilities[].facility_id). */
  facility_id?: string | number;
  /**
   * Or the facility link (facilities[].url), e.g.
   * https://www.uhaul.com/Locations/Self-Storage-near-Dallas-TX-75231/741065/.
   */
  url?: string;
  /**
   * en (default, www.uhaul.com), es (es.uhaul.com, U-Haul's Spanish site) or fr (fr.uhaul.com,
   * U-Haul's French site). The market (US or Canada) follows the place.
   */
  language?: "en" | "es" | "fr";
  [key: string]: unknown;
}

export interface UhaulReviewsOptions {
  /** A U-Haul location or storage facility id. */
  location_id?: string | number;
  /** Or the location link. */
  url?: string;
  /** Page from 1. */
  page?: number;
  /** Reviews per page, 1-100 (default 20). */
  page_size?: number;
  /** newest (default), highest or lowest rating. */
  sort?: "newest" | "highest" | "lowest";
  /** Reviews with this many stars (1-5). */
  stars?: number;
  /** all (default), trucks, storage or ubox. */
  service?: "all" | "trucks" | "storage" | "ubox";
  [key: string]: unknown;
}

export interface UhaulSuggestionsOptions {
  /** The start of a city, a ZIP or a postal code. */
  term: string;
  [key: string]: unknown;
}

export interface UhaulSuppliesOptions {
  /** us (default, USD) or ca (U-Haul's CAD prices). */
  country?: "us" | "ca";
  /**
   * A moving supplies category as U-Haul's link writes it: Boxes, Packing-Supplies, Tape,
   * Boxes/Standard-Sized-Moving-Boxes.
   */
  category?: string;
  /**
   * Or a moving supplies category or product link (products[].url), e.g.
   * https://www.uhaul.com/MovingSupplies/Boxes/Standard-Sized-Moving-Boxes/Medium-Moving-Box/?id=2793.
   */
  url?: string;
  [key: string]: unknown;
}

export class UhaulNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = UHAUL_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/uhaul/${path}`, options, undefined, timeout);
  }

  /**
   * U-Haul's own truck rental rates for a move on U-Haul (uhaul.com, the US and Canada truck rental
   * and self-storage company). Scavio fetches U-Haul's public page on request. Pickup and optional
   * drop-off (empty = in-town) and a date, US or Canada, in English, Spanish or French. Costs 1
   * credit.
   */
  async truckQuote(options: UhaulTruckQuoteOptions): Promise<Record<string, unknown>> {
    return this.post("truck-quote", options);
  }

  /**
   * U-Haul locations near a city, ZIP or postal code on U-Haul (uhaul.com, the US and Canada truck
   * rental and self-storage company). Scavio fetches U-Haul's public page on request. For truck
   * rentals, trailer rentals, moving supplies or self-storage. Costs 1 credit.
   */
  async locations(options: UhaulLocationsOptions): Promise<Record<string, unknown>> {
    return this.post("locations", options);
  }

  /**
   * One U-Haul location by id or link on U-Haul (uhaul.com, the US and Canada truck rental and
   * self-storage company). Scavio fetches U-Haul's public page on request. Costs 1 credit.
   */
  async location(options: UhaulLocationOptions): Promise<Record<string, unknown>> {
    return this.post("location", options);
  }

  /**
   * Self-storage facilities near a city, ZIP or postal code on U-Haul (uhaul.com, the US and Canada
   * truck rental and self-storage company). Scavio fetches U-Haul's public page on request. Up to
   * 18 facilities, sorted by distance, starting rate or rating and filtered by features in Scavio.
   * Costs 1 credit.
   */
  async storageSearch(options: UhaulStorageSearchOptions): Promise<Record<string, unknown>> {
    return this.post("storage-search", options);
  }

  /**
   * One U-Haul self-storage facility in full by id or link on U-Haul (uhaul.com, the US and Canada
   * truck rental and self-storage company). Scavio fetches U-Haul's public page on request. Costs 1
   * credit.
   */
  async storageFacility(options: UhaulStorageFacilityOptions): Promise<Record<string, unknown>> {
    return this.post("storage-facility", options);
  }

  /**
   * U-Haul's own customer reviews of one location on U-Haul (uhaul.com, the US and Canada truck
   * rental and self-storage company). Scavio fetches U-Haul's public page on request. Every text
   * review the location's page shows, filtered by service and stars, sorted newest, highest or
   * lowest and paged in Scavio. Costs 1 credit.
   */
  async reviews(options: UhaulReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * U-Haul's own place suggestions for the start of a city, ZIP or postal code (US and Canada) on
   * U-Haul (uhaul.com, the US and Canada truck rental and self-storage company). Scavio fetches
   * U-Haul's public page on request. Costs 1 credit.
   */
  async suggestions(options: UhaulSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * U-Haul moving supplies prices, US (USD) or Canada (CAD), by category or product link on U-Haul
   * (uhaul.com, the US and Canada truck rental and self-storage company). Scavio fetches U-Haul's
   * public page on request. A category returns country, currency, kind, category, name, count,
   * products [product_id, name, url, price, price_text, as_low_as, pickup_only,
   * free_in_store_pickup, next_day_delivery]; a product returns country, currency, kind,
   * product_id, name, url, category, description, brand, image, sku, price, as_low_as_price, bundle
   * {quantity, price, unit_price, text}, availability, rating, review_count, dimensions, sizes,
   * notes. An unknown category or product is a charged 404. 1 credit. Failed upstream calls and
   * refused inputs are not charged; a not-found is charged. Costs 1 credit.
   */
  async supplies(options: UhaulSuppliesOptions): Promise<Record<string, unknown>> {
    return this.post("supplies", options);
  }
}
