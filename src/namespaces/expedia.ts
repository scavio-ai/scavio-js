import type { Scavio } from "../client.js";

// Expedia (expedia.com, Expedia Group's travel booking site) search, property, priceCalendar and
// suggestions endpoints; 51 market-languages (market); billed on actual cost: 2 credits (1 on some
// New Zealand, Korea and Indonesia pages). Generated from the backend routes: every option and its
// doc mirrors the API's own request schema; an input the API only accepts to refuse (a 400 that
// says 'not offered') is left out. The server enforces the value rules and the one-of rules (send
// one of an id or a link). Every call raises the request timeout to EXPEDIA_TIMEOUT and never
// lowers a longer client timeout. Failed upstream calls and refused inputs are not charged; a
// not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every expedia call. */
export const EXPEDIA_TIMEOUT = 250_000;

export interface ExpediaSearchOptions {
  /** A place as you would type it on Expedia (city, area, landmark or airport). */
  destination?: string;
  /** Or an Expedia region id: places[].region_id of suggestions. */
  region_id?: string | number;
  /** Check-in date, YYYY-MM-DD. */
  check_in: string;
  /** Check-out date, YYYY-MM-DD (at most 28 nights after check_in). */
  check_out: string;
  /** Adults in the room (default 2). One room. */
  adults?: number;
  /**
   * recommended (default), price_asc, price_desc, review (guest rating): Expedia's own sort
   * options.
   */
  sort?: "recommended" | "price_asc" | "price_desc" | "review";
  /** Expedia's star rating filter (1-5). */
  star?: number;
  /**
   * One of Expedia's popular amenity filters: POOL, PETS, WIFI, AIR_CONDITIONING,
   * FREE_AIRPORT_TRANSPORTATION, HOT_TUB, SPA_ON_SITE, WASHER_DRYER, KITCHEN_KITCHENETTE,
   * ELECTRIC_CAR, GYM, CRIB, FREE_PARKING, BALCONY_OR_TERRACE, RESTAURANT_IN_HOTEL.
   */
  amenity?: "POOL" | "PETS" | "WIFI" | "AIR_CONDITIONING" | "FREE_AIRPORT_TRANSPORTATION" | "HOT_TUB" | "SPA_ON_SITE" | "WASHER_DRYER" | "KITCHEN_KITCHENETTE" | "ELECTRIC_CAR" | "GYM" | "CRIB" | "FREE_PARKING" | "BALCONY_OR_TERRACE" | "RESTAURANT_IN_HOTEL";
  /** Expedia's guest rating filter: 7 (7+), 8 (8+) or 9 (9+). */
  guest_rating_min?: number;
  /**
   * The Expedia market-language (default us): us, es-us, zh-us, en-gb, en-ie, en-ca, fr-ca, en-au,
   * en-nz, de-de, de-at, de-ch, fr-ch, fr-fr, nl-be, fr-be, nl-nl, it-it, es-es, da-dk, sv-se,
   * no-no, fi-fi, es-mx, pt-br, es-ar, es-cl, es-co, es-pe, es-cr, en-eg, ja-jp, en-jp, ko-kr,
   * en-kr, zh-tw, zh-hk, en-hk, zh-hans-hk, en-sg, en-my, en-ph, id-id, en-id, th-th, en-th, vi-vn,
   * en-in, en-ae, ar-ae, ar-sa. Each answers in its own language and currency (es-cl, es-co, es-pe,
   * es-cr and en-eg are Expedia's Chile, Colombia, Peru, Costa Rica and Egypt sites). property and
   * price_calendar are not available in en-gb, pt-br, zh-hk, en-hk, zh-hans-hk, en-my, en-ph
   * (Expedia answers hotel pages there with another country's site).
   */
  market?: "us" | "es-us" | "zh-us" | "en-gb" | "en-ie" | "en-ca" | "fr-ca" | "en-au" | "en-nz" | "de-de" | "de-at" | "de-ch" | "fr-ch" | "fr-fr" | "nl-be" | "fr-be" | "nl-nl" | "it-it" | "es-es" | "da-dk" | "sv-se" | "no-no" | "fi-fi" | "es-mx" | "pt-br" | "es-ar" | "es-cl" | "es-co" | "es-pe" | "es-cr" | "en-eg" | "ja-jp" | "en-jp" | "ko-kr" | "en-kr" | "zh-tw" | "zh-hk" | "en-hk" | "zh-hans-hk" | "en-sg" | "en-my" | "en-ph" | "id-id" | "en-id" | "th-th" | "en-th" | "vi-vn" | "en-in" | "en-ae" | "ar-ae" | "ar-sa";
  [key: string]: unknown;
}

export interface ExpediaPropertyOptions {
  /** An Expedia property id: properties[].property_id of search. */
  id?: string;
  /** Or properties[].path of search (or an Expedia hotel link). */
  path?: string;
  /**
   * The Expedia market-language (default us): us, es-us, zh-us, en-gb, en-ie, en-ca, fr-ca, en-au,
   * en-nz, de-de, de-at, de-ch, fr-ch, fr-fr, nl-be, fr-be, nl-nl, it-it, es-es, da-dk, sv-se,
   * no-no, fi-fi, es-mx, pt-br, es-ar, es-cl, es-co, es-pe, es-cr, en-eg, ja-jp, en-jp, ko-kr,
   * en-kr, zh-tw, zh-hk, en-hk, zh-hans-hk, en-sg, en-my, en-ph, id-id, en-id, th-th, en-th, vi-vn,
   * en-in, en-ae, ar-ae, ar-sa. Each answers in its own language and currency (es-cl, es-co, es-pe,
   * es-cr and en-eg are Expedia's Chile, Colombia, Peru, Costa Rica and Egypt sites). property and
   * price_calendar are not available in en-gb, pt-br, zh-hk, en-hk, zh-hans-hk, en-my, en-ph
   * (Expedia answers hotel pages there with another country's site).
   */
  market?: "us" | "es-us" | "zh-us" | "en-gb" | "en-ie" | "en-ca" | "fr-ca" | "en-au" | "en-nz" | "de-de" | "de-at" | "de-ch" | "fr-ch" | "fr-fr" | "nl-be" | "fr-be" | "nl-nl" | "it-it" | "es-es" | "da-dk" | "sv-se" | "no-no" | "fi-fi" | "es-mx" | "pt-br" | "es-ar" | "es-cl" | "es-co" | "es-pe" | "es-cr" | "en-eg" | "ja-jp" | "en-jp" | "ko-kr" | "en-kr" | "zh-tw" | "zh-hk" | "en-hk" | "zh-hans-hk" | "en-sg" | "en-my" | "en-ph" | "id-id" | "en-id" | "th-th" | "en-th" | "vi-vn" | "en-in" | "en-ae" | "ar-ae" | "ar-sa";
  [key: string]: unknown;
}

export interface ExpediaPriceCalendarOptions {
  /** An Expedia property id: properties[].property_id of search. */
  id?: string;
  /**
   * properties[].path of search (recommended: some market sites answer a page opened from the id
   * alone without its calendar), or an Expedia hotel link.
   */
  path?: string;
  /** Check-in date, YYYY-MM-DD (opens the page; the calendar spans Expedia's own window). */
  check_in: string;
  /** Check-out date, YYYY-MM-DD. */
  check_out: string;
  /** Adults (default 2). */
  adults?: number;
  /**
   * The Expedia market-language (default us): us, es-us, zh-us, en-gb, en-ie, en-ca, fr-ca, en-au,
   * en-nz, de-de, de-at, de-ch, fr-ch, fr-fr, nl-be, fr-be, nl-nl, it-it, es-es, da-dk, sv-se,
   * no-no, fi-fi, es-mx, pt-br, es-ar, es-cl, es-co, es-pe, es-cr, en-eg, ja-jp, en-jp, ko-kr,
   * en-kr, zh-tw, zh-hk, en-hk, zh-hans-hk, en-sg, en-my, en-ph, id-id, en-id, th-th, en-th, vi-vn,
   * en-in, en-ae, ar-ae, ar-sa. Each answers in its own language and currency (es-cl, es-co, es-pe,
   * es-cr and en-eg are Expedia's Chile, Colombia, Peru, Costa Rica and Egypt sites). property and
   * price_calendar are not available in en-gb, pt-br, zh-hk, en-hk, zh-hans-hk, en-my, en-ph
   * (Expedia answers hotel pages there with another country's site).
   */
  market?: "us" | "es-us" | "zh-us" | "en-gb" | "en-ie" | "en-ca" | "fr-ca" | "en-au" | "en-nz" | "de-de" | "de-at" | "de-ch" | "fr-ch" | "fr-fr" | "nl-be" | "fr-be" | "nl-nl" | "it-it" | "es-es" | "da-dk" | "sv-se" | "no-no" | "fi-fi" | "es-mx" | "pt-br" | "es-ar" | "es-cl" | "es-co" | "es-pe" | "es-cr" | "en-eg" | "ja-jp" | "en-jp" | "ko-kr" | "en-kr" | "zh-tw" | "zh-hk" | "en-hk" | "zh-hans-hk" | "en-sg" | "en-my" | "en-ph" | "id-id" | "en-id" | "th-th" | "en-th" | "vi-vn" | "en-in" | "en-ae" | "ar-ae" | "ar-sa";
  [key: string]: unknown;
}

export interface ExpediaSuggestionsOptions {
  /** What a traveller has typed so far (a place name). */
  query?: string;
  /** The same as query. */
  text?: string;
  /** Most places to return (1-8, default 8). */
  limit?: number;
  /**
   * The Expedia market-language (default us): us, es-us, zh-us, en-gb, en-ie, en-ca, fr-ca, en-au,
   * en-nz, de-de, de-at, de-ch, fr-ch, fr-fr, nl-be, fr-be, nl-nl, it-it, es-es, da-dk, sv-se,
   * no-no, fi-fi, es-mx, pt-br, es-ar, es-cl, es-co, es-pe, es-cr, en-eg, ja-jp, en-jp, ko-kr,
   * en-kr, zh-tw, zh-hk, en-hk, zh-hans-hk, en-sg, en-my, en-ph, id-id, en-id, th-th, en-th, vi-vn,
   * en-in, en-ae, ar-ae, ar-sa. Each answers in its own language and currency (es-cl, es-co, es-pe,
   * es-cr and en-eg are Expedia's Chile, Colombia, Peru, Costa Rica and Egypt sites). property and
   * price_calendar are not available in en-gb, pt-br, zh-hk, en-hk, zh-hans-hk, en-my, en-ph
   * (Expedia answers hotel pages there with another country's site).
   */
  market?: "us" | "es-us" | "zh-us" | "en-gb" | "en-ie" | "en-ca" | "fr-ca" | "en-au" | "en-nz" | "de-de" | "de-at" | "de-ch" | "fr-ch" | "fr-fr" | "nl-be" | "fr-be" | "nl-nl" | "it-it" | "es-es" | "da-dk" | "sv-se" | "no-no" | "fi-fi" | "es-mx" | "pt-br" | "es-ar" | "es-cl" | "es-co" | "es-pe" | "es-cr" | "en-eg" | "ja-jp" | "en-jp" | "ko-kr" | "en-kr" | "zh-tw" | "zh-hk" | "en-hk" | "zh-hans-hk" | "en-sg" | "en-my" | "en-ph" | "id-id" | "en-id" | "th-th" | "en-th" | "vi-vn" | "en-in" | "en-ae" | "ar-ae" | "ar-sa";
  [key: string]: unknown;
}

export class ExpediaNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = EXPEDIA_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/expedia/${path}`, options, undefined, timeout);
  }

  /**
   * Search hotels and stays on Expedia (expedia.com, Expedia Group's travel booking site). Scavio
   * fetches the public Expedia page on request. Labels and texts are in the market's language, as
   * Expedia writes them; field names are English. By place name or region id, dates and adults (one
   * room), with Expedia's sorts and filters (star rating, amenity, guest rating). Costs 2 credits,
   * billed on actual cost (1 on some New Zealand, Korea and Indonesia pages); another market's page
   * and failed upstream calls are not charged. credits_used in the response is the exact charge.
   */
  async search(options: ExpediaSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Expedia property page by id or path, fetched without dates. Costs 2 credits, billed on
   * actual cost (1 on some New Zealand, Korea and Indonesia pages); another market's page and
   * failed upstream calls are not charged. credits_used in the response is the exact charge.
   */
  async property(options: ExpediaPropertyOptions): Promise<Record<string, unknown>> {
    return this.post("property", options);
  }

  /**
   * Expedia's price calendar for one property. Costs 2 credits, billed on actual cost (1 on some
   * New Zealand, Korea and Indonesia pages); another market's page and failed upstream calls are
   * not charged. credits_used in the response is the exact charge.
   */
  async priceCalendar(options: ExpediaPriceCalendarOptions): Promise<Record<string, unknown>> {
    return this.post("price-calendar", options);
  }

  /**
   * Expedia's destination suggestions for a partial place name. Costs 2 credits, billed on actual
   * cost (1 on some New Zealand, Korea and Indonesia pages); another market's page and failed
   * upstream calls are not charged. credits_used in the response is the exact charge.
   */
  async suggestions(options: ExpediaSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
