import type { Scavio } from "../client.js";

// Bring a Trailer (bringatrailer.com, the online collector-car auction site) results, priceHistory,
// listing, live, make, model, location and suggestions endpoints; one site, each lot in its own
// currency, 1 credit each. Generated from the backend routes: every option and its doc mirrors the
// API's own request schema; an input the API only accepts to refuse (a 400 that says 'not offered')
// is left out. The server enforces the value rules and the one-of rules (send one of an id or a
// link). Every call raises the request timeout to BRINGATRAILER_TIMEOUT and never lowers a longer
// client timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every bringatrailer call. */
export const BRINGATRAILER_TIMEOUT = 240_000;

export interface BringatrailerResultsOptions {
  /** Keywords. Omitted: every completed result (filters and sort still apply). */
  q?: string;
  /** Leave out results matching these words. */
  exclude?: string;
  /** recently_closed (default), popular, highest_bid or oldest (Bring a Trailer's own sorts). */
  sort?: "recently_closed" | "popular" | "highest_bid" | "oldest";
  /** all (default), sold, or reserve_not_met (ended under the reserve). */
  status?: "all" | "sold" | "reserve_not_met";
  /**
   * Only results that ended in the last 7 days (7d), 30 days, 1, 2 or 5 years. Default all time.
   */
  recency?: "7d" | "30d" | "1y" | "2y" | "5y";
  /** Earliest model year. */
  year_min?: number;
  /** Latest model year. */
  year_max?: number;
  /**
   * Only results below this amount, one of Bring a Trailer's steps: 10000, 25000, 50000, 100000,
   * 250000, 500000, 750000, 1000000.
   */
  max_bid?: number;
  /**
   * A category name or id: Aircraft (543), All-Terrain Vehicles (431), Boats (383), Charity &
   * Non-Profit (415), Convertibles (434), Diesels (560), Electric Vehicles (426), Go-Karts (428),
   * Hot Rods (429), Kei Vehicles (556), Military Vehicles (447), Minibikes & Scooters (430),
   * Motorcycles (70), Parts (379), Projects (10), Race Cars (11), Right-Hand Drive (557), RVs &
   * Campers (436), Service Vehicles (479), Side-by-Sides (553), Station Wagons (433), Tractors
   * (432), Trains (544), Truck & 4x4 (21), Vans (418), Wheels (380).
   */
  category?: string | number;
  /**
   * An origin name or id: American (3), Brazilian (499), British (4), Canadian (498), Czech (542),
   * Dutch (497), French (6), German (7), Italian (8), Japanese (9), Korean (496), Prewar (441),
   * Spanish (82), Swedish (18).
   */
  origin?: string | number;
  /**
   * A decade: 2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920, 1910, 1900,
   * pre-1900.
   */
  era?: string | number;
  /**
   * Only no-reserve auctions (not together with premium: the site applies the two as either-or).
   */
  no_reserve?: boolean;
  /** Only Premium listings (not together with no_reserve). */
  premium?: boolean;
  /**
   * A make name as Bring a Trailer lists it (BMW, Porsche, Land Rover): make's filter.make. Use one
   * of make, model_id or location_id.
   */
  make?: string;
  /**
   * A model page id (suggestions id or make models[].id, e.g. 1833018 = BMW E30 M3), or a list of
   * up to 200 ids (model filter_ids for a model family such as Porsche 911).
   */
  model_id?: number | string | Array<number | string>;
  /**
   * A location page id (location's location_id or a location suggestion id, e.g. 89009067 =
   * Germany): only lots located there.
   */
  location_id?: number | string;
  /**
   * Page (default 1). The site pages through the first 10,000 results of a query: page x page_size
   * at most 10,000.
   */
  page?: number;
  /** Results per page, 1-60 (default 36). */
  page_size?: number;
  [key: string]: unknown;
}

export interface BringatrailerPriceHistoryOptions {
  /**
   * A model page id (suggestions id or make models[].id, e.g. 1833018 = BMW E30 M3), or a list of
   * up to 200 ids (model filter_ids for a model family such as Porsche 911).
   */
  model_id?: number | string | Array<number | string>;
  /** A make name (instead of model_id): its results, at most the 10,000 most recent. */
  make?: string;
  /**
   * Only results that ended in the last 7 days (7d), 30 days, 1, 2 or 5 years. Default all time.
   */
  recency?: "7d" | "30d" | "1y" | "2y" | "5y";
  /** Earliest model year. */
  year_min?: number;
  /** Latest model year. */
  year_max?: number;
  [key: string]: unknown;
}

export interface BringatrailerListingOptions {
  /** A listing slug (lots[].slug), the part after /listing/ in a bringatrailer.com link. */
  slug?: string;
  /** A bringatrailer.com/listing/<slug>/ link instead of slug. */
  url?: string;
  /** Comments page (default 1). */
  comments_page?: number;
  /** Comments per page, 1-500 (default 100). */
  comments_page_size?: number;
  [key: string]: unknown;
}

export interface BringatrailerLiveOptions {
  /** Words in the lot title or excerpt. */
  q?: string;
  /** A make, matched in the lot title. */
  make?: string;
  /**
   * Country of the lot: a two-letter code (US, DE, GB) or a country name as listed (United
   * Kingdom).
   */
  country?: string;
  /** Only auctions scheduled to end within this many hours. */
  ending_within_hours?: number;
  /** Only no-reserve auctions. */
  no_reserve?: boolean;
  /** Only Premium listings. */
  premium?: boolean;
  /** ending_soon (default), ending_latest, bid_high or bid_low. */
  sort?: "ending_soon" | "ending_latest" | "bid_high" | "bid_low";
  /** Lots per page, 1-2000 (default 100). */
  limit?: number;
  /** Page of the filtered list (default 1). */
  page?: number;
  [key: string]: unknown;
}

export interface BringatrailerMakeOptions {
  /** A make slug or name (bmw, porsche, land-rover, Land Rover) or its bringatrailer.com link. */
  make: string;
  [key: string]: unknown;
}

export interface BringatrailerModelOptions {
  /**
   * A make and model path (make models[].path, e.g. bmw/e30-m3 or porsche/911) or its
   * bringatrailer.com link.
   */
  model: string;
  [key: string]: unknown;
}

export interface BringatrailerLocationOptions {
  /**
   * A country name or slug (germany, united-kingdom, Italy) or its bringatrailer.com/location/
   * link.
   */
  country: string;
  [key: string]: unknown;
}

export interface BringatrailerSuggestionsOptions {
  /** A partial make, model or place. */
  q: string;
  [key: string]: unknown;
}

export class BringatrailerNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = BRINGATRAILER_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/bringatrailer/${path}`, options, undefined, timeout);
  }

  /**
   * Search the completed auctions of Bring a Trailer (bringatrailer.com, the online collector-car
   * auction site owned by Hearst). Scavio fetches the public Bring a Trailer page on request; Bring
   * a Trailer has no public API. Keywords (or none), with Bring a Trailer's sorts (recently closed,
   * popular, highest bid, oldest) and filters: sold or reserve not met, recency, model years, max
   * bid, category, origin, era, no reserve, Premium, and one make, model (model_id) or location
   * (location_id) from suggestions, make or model. Up to 60 a page, through the first 10,000
   * results of a query. Costs 1 credit.
   */
  async results(options: BringatrailerResultsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("results", options);
  }

  /**
   * Every completed result of one model (model_id, or a list of ids for a model family) or make on
   * Bring a Trailer (bringatrailer.com, the online collector-car auction site owned by Hearst).
   * Scavio fetches the public Bring a Trailer page on request; Bring a Trailer has no public API.
   * In one call. Costs 1 credit.
   */
  async priceHistory(options: BringatrailerPriceHistoryOptions): Promise<Record<string, unknown>> {
    return this.post("price-history", options);
  }

  /**
   * One auction on Bring a Trailer (bringatrailer.com, the online collector-car auction site owned
   * by Hearst). Scavio fetches the public Bring a Trailer page on request; Bring a Trailer has no
   * public API. by slug or link, live or ended. Costs 1 credit.
   */
  async listing(options: BringatrailerListingOptions): Promise<Record<string, unknown>> {
    return this.post("listing", options);
  }

  /**
   * Every live auction on Bring a Trailer (bringatrailer.com, the online collector-car auction site
   * owned by Hearst). Scavio fetches the public Bring a Trailer page on request; Bring a Trailer
   * has no public API. (about 1,000 lots, read from one page, so a call takes 20 seconds to 3
   * minutes: allow 200 seconds), filtered by Scavio by keyword, make, country, ending within N
   * hours, no reserve and Premium, sorted by ending time or current bid, paged. Costs 1 credit.
   */
  async live(options: BringatrailerLiveOptions = {}): Promise<Record<string, unknown>> {
    return this.post("live", options);
  }

  /**
   * One make page of Bring a Trailer (bringatrailer.com, the online collector-car auction site
   * owned by Hearst). Scavio fetches the public Bring a Trailer page on request; Bring a Trailer
   * has no public API. Costs 1 credit.
   */
  async make(options: BringatrailerMakeOptions): Promise<Record<string, unknown>> {
    return this.post("make", options);
  }

  /**
   * One model page of Bring a Trailer (bringatrailer.com, the online collector-car auction site
   * owned by Hearst). Scavio fetches the public Bring a Trailer page on request; Bring a Trailer
   * has no public API. (e.g. bmw/e30-m3, or a family such as porsche/911). Costs 1 credit.
   */
  async model(options: BringatrailerModelOptions): Promise<Record<string, unknown>> {
    return this.post("model", options);
  }

  /**
   * The lots of Bring a Trailer (bringatrailer.com, the online collector-car auction site owned by
   * Hearst). Scavio fetches the public Bring a Trailer page on request; Bring a Trailer has no
   * public API. located in one country. Costs 1 credit.
   */
  async location(options: BringatrailerLocationOptions): Promise<Record<string, unknown>> {
    return this.post("location", options);
  }

  /**
   * The search-box suggestions of Bring a Trailer (bringatrailer.com, the online collector-car
   * auction site owned by Hearst). Scavio fetches the public Bring a Trailer page on request; Bring
   * a Trailer has no public API. for a partial make, model or place. Costs 1 credit.
   */
  async suggestions(options: BringatrailerSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
