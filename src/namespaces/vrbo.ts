import type { Scavio } from "../client.js";

// Vrbo (vrbo.com, Expedia Group's vacation rental site) search, property and suggestions endpoints;
// 20 market-languages; billed on actual cost: 2 credits per attempt (a search usually 2 to 8).
// Generated from the backend routes: every option and its doc mirrors the API's own request schema;
// an input the API only accepts to refuse (a 400 that says 'not offered') is left out. The server
// enforces the value rules and the one-of rules (send one of an id or a link). Every call raises
// the request timeout to VRBO_TIMEOUT and never lowers a longer client timeout. Failed upstream
// calls and refused inputs are not charged; a not-found is charged (credits_used is what was
// charged).

/** Minimum request timeout (ms) for every vrbo call. */
export const VRBO_TIMEOUT = 250_000;

export interface VrboSearchOptions {
  /** A place as you would type it on Vrbo (city, region, area or landmark). */
  destination?: string;
  /** Or a Vrbo region id: places[].region_id of suggestions (exact, no guessing). */
  region_id?: string | number;
  /** Check-in date, YYYY-MM-DD. */
  check_in: string;
  /** Check-out date, YYYY-MM-DD (at most 90 nights after check_in). */
  check_out: string;
  /** Adults (default 2). */
  adults?: number;
  /** Children's ages, one per child (0-17). */
  children?: number[];
  /**
   * recommended (default), price_low, price_high, review (guest rating), review_count: Vrbo's own
   * sort options.
   */
  sort?: "recommended" | "price_low" | "price_high" | "review" | "review_count";
  /**
   * Vrbo's property type filter: house, apartment_or_condo, cottage, cabin, estate, resort, villa,
   * hotel, houseboat, guest_house, boat, chalet, RV.
   */
  property_type?: "house" | "apartment_or_condo" | "cottage" | "cabin" | "estate" | "resort" | "villa" | "hotel" | "houseboat" | "guest_house" | "boat" | "chalet" | "RV";
  /**
   * One of Vrbo's amenity filters: pool, private_pool, heated_pool, hot_tub, balcony,
   * king_sized_bed, parking, internet_available, fireplace, washer, clothes_dryer,
   * electric_vehicle_charging_station, air_conditioning, television, outdoor_grill, patio_or_deck,
   * garden_or_backyard, bed_linens_provided, crib, stove, microwave, oven, dishwasher,
   * kids_high_chair, iron_and_board.
   */
  amenity?: "pool" | "private_pool" | "heated_pool" | "hot_tub" | "balcony" | "king_sized_bed" | "parking" | "internet_available" | "fireplace" | "washer" | "clothes_dryer" | "electric_vehicle_charging_station" | "air_conditioning" | "television" | "outdoor_grill" | "patio_or_deck" | "garden_or_backyard" | "bed_linens_provided" | "crib" | "stove" | "microwave" | "oven" | "dishwasher" | "kids_high_chair" | "iron_and_board";
  /**
   * One of Vrbo's house-rule filters: pets_allowed, pet_free, children_allowed, events_allowed,
   * smoking_allowed.
   */
  house_rule?: "pets_allowed" | "pet_free" | "children_allowed" | "events_allowed" | "smoking_allowed";
  /** Pet-friendly places only (the same as house_rule pets_allowed). */
  pets_allowed?: boolean;
  /**
   * One of Vrbo's location filters: oceanfront, waterfront, downtown_location, lake_location,
   * mountains_location, rural_location, golf_course, village_location, skiin_skiout.
   */
  location_type?: "oceanfront" | "waterfront" | "downtown_location" | "lake_location" | "mountains_location" | "rural_location" | "golf_course" | "village_location" | "skiin_skiout";
  /** Places run by Premier Hosts only. */
  premier_host?: boolean;
  /**
   * Vrbo's bedrooms filter: this many bedrooms or more (Vrbo may still mix in sponsored places).
   */
  bedrooms_min?: number;
  /**
   * The vrbo.com market-language (default us): us, en-gb, en-ca, fr-ca, es-mx, pt-br, es-es, it-it,
   * pt-pt, nl-nl, de-at, el-gr, fi-fi, da-dk, sv-se, no-no, ja-jp, en-sg, en-au, en-nz. Each
   * answers in its own language and currency (USD, GBP, CAD, MXN, BRL, EUR, DKK, SEK, NOK, JPY,
   * SGD, AUD, NZD). abritel.fr, fewo-direkt.de, stayz.com.au and bookabach.co.nz are separate sites
   * and are not covered.
   */
  market?: "us" | "en-gb" | "en-ca" | "fr-ca" | "es-mx" | "pt-br" | "es-es" | "it-it" | "pt-pt" | "nl-nl" | "de-at" | "el-gr" | "fi-fi" | "da-dk" | "sv-se" | "no-no" | "ja-jp" | "en-sg" | "en-au" | "en-nz";
  [key: string]: unknown;
}

export interface VrboPropertyOptions {
  /**
   * A Vrbo property id: properties[].property_id of search (e.g. 1046285, 12245744ha or
   * pdp/lo/30792130).
   */
  id?: string;
  /** Or a vrbo.com property link (any market; the link's market is used unless market is sent). */
  url?: string;
  /**
   * The vrbo.com market-language (default us): us, en-gb, en-ca, fr-ca, es-mx, pt-br, es-es, it-it,
   * pt-pt, nl-nl, de-at, el-gr, fi-fi, da-dk, sv-se, no-no, ja-jp, en-sg, en-au, en-nz. Each
   * answers in its own language and currency (USD, GBP, CAD, MXN, BRL, EUR, DKK, SEK, NOK, JPY,
   * SGD, AUD, NZD). abritel.fr, fewo-direkt.de, stayz.com.au and bookabach.co.nz are separate sites
   * and are not covered.
   */
  market?: "us" | "en-gb" | "en-ca" | "fr-ca" | "es-mx" | "pt-br" | "es-es" | "it-it" | "pt-pt" | "nl-nl" | "de-at" | "el-gr" | "fi-fi" | "da-dk" | "sv-se" | "no-no" | "ja-jp" | "en-sg" | "en-au" | "en-nz";
  [key: string]: unknown;
}

export interface VrboSuggestionsOptions {
  /** What a traveller has typed so far. */
  query: string;
  /** Most places to return (1-8, default 8). */
  limit?: number;
  /**
   * The vrbo.com market-language (default us): us, en-gb, en-ca, fr-ca, es-mx, pt-br, es-es, it-it,
   * pt-pt, nl-nl, de-at, el-gr, fi-fi, da-dk, sv-se, no-no, ja-jp, en-sg, en-au, en-nz. Each
   * answers in its own language and currency (USD, GBP, CAD, MXN, BRL, EUR, DKK, SEK, NOK, JPY,
   * SGD, AUD, NZD). abritel.fr, fewo-direkt.de, stayz.com.au and bookabach.co.nz are separate sites
   * and are not covered.
   */
  market?: "us" | "en-gb" | "en-ca" | "fr-ca" | "es-mx" | "pt-br" | "es-es" | "it-it" | "pt-pt" | "nl-nl" | "de-at" | "el-gr" | "fi-fi" | "da-dk" | "sv-se" | "no-no" | "ja-jp" | "en-sg" | "en-au" | "en-nz";
  [key: string]: unknown;
}

export class VrboNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = VRBO_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/vrbo/${path}`, options, undefined, timeout);
  }

  /**
   * Search vacation rentals on Vrbo (vrbo.com, Expedia Group's vacation rental site). Scavio
   * fetches the public Vrbo page on request. Labels and texts are in the market's language, as Vrbo
   * writes them (host-written titles and descriptions can stay in the host's language); field names
   * are English. By place name or region id, dates and guests, with Vrbo's sorts and filters
   * (property type, amenity, house rule incl. pets, location type, Premier Host, minimum bedrooms).
   * Costs 2 credits per attempt, 2 to 8 (typically 2 to 6): Vrbo answers a results page in a
   * 50-card or a 3-card form and a search makes up to 4 attempts for the 50-card one. credits_used
   * in the response is the exact charge.
   */
  async search(options: VrboSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One Vrbo property in full by id or link, fetched without dates. Costs 2 credits. */
  async property(options: VrboPropertyOptions): Promise<Record<string, unknown>> {
    return this.post("property", options);
  }

  /** Vrbo's destination suggestions for a partial place name. Costs 2 credits. */
  async suggestions(options: VrboSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
