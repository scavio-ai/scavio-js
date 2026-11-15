import type { Scavio } from "../client.js";

// Nintendo: 6 endpoints, 1 credit each. The Nintendo eShop and My Nintendo
// Store in 46 countries (country, default "us") with their languages
// (language, default the market's first). Americas: us (USD; en), ca (CAD; en
// or fr), mx (MXN; es), br (BRL; pt), ar (ARS), cl (CLP), co (COP), pe (PEN)
// (es). Europe, in the market's language: gb (GBP; en), ie (EUR; en), de and
// at (EUR; de), ch (CHF; de, fr or it), fr (fr), be (fr or nl), nl (nl), lu
// (fr), it (it), es (es), pt (pt) (EUR); au (AUD), nz (NZD), za (ZAR) (en).
// Europe without a Nintendo site of its own (the English European catalog
// with that country's own prices): pl (PLN), cz (CZK), se (SEK), no (NOK), dk
// (DKK), fi, sk, hu, ro, bg, gr, hr, si, ee, lv, lt, mt, cy (EUR) (en). Japan:
// jp (JPY; ja). prices() also serves kr (KRW; ko), hk (HKD; zh), tw (TWD; zh)
// and il (EUR; en, European item ids). ph, ru, uk (use gb) and countries with
// no eShop data answer 400. Every answer carries country, language, currency
// and region (americas, europe, japan or asia).
//
// Item ids (nsuid) are per eShop region: americas (US CA MX BR AR CL CO PE),
// europe (EU / EFTA, GB, AU, NZ, ZA, IL), japan, kr, and hk-tw (Taiwan uses
// Hong Kong ids). An id from one region is not_found in another and there is
// no cross-region title mapping: look the game up with search() or product()
// in that region, then call prices() for any country of the region (up to 50
// ids). Prices are always the requested country's eShop price in its
// currency; sale_start and sale_end are the eShop's own sale window. Nintendo
// shows no price history or historical low: poll prices() to build one.
//
// The server enforces the cross-field rules: language must be one the market
// serves; product() and dlc() take nsuid, url or slug (slug: Americas only);
// sorts and filters are per region (Americas search: relevance and newest, no
// filters) and an unsupported one answers 400, never silently dropped; sale is
// Americas only. Every call raises the request timeout to NINTENDO_TIMEOUT
// (Americas searches take about 8 to 13 s). Failed upstream calls are not
// charged; a not-found is charged.

/** Minimum request timeout (ms) for every nintendo call. */
export const NINTENDO_TIMEOUT = 120_000;

/** The 42 catalog markets: search, product, deals, releases and dlc. */
export type NintendoCountry =
  | "us" | "ca" | "mx" | "br" | "ar" | "cl" | "co" | "pe"
  | "gb" | "ie" | "de" | "at" | "ch" | "fr" | "be" | "nl" | "lu" | "it" | "es" | "pt" | "au" | "nz" | "za"
  | "pl" | "cz" | "se" | "no" | "dk" | "fi" | "sk" | "hu" | "ro" | "bg" | "gr" | "hr" | "si" | "ee" | "lv"
  | "lt" | "mt" | "cy"
  | "jp";

/** prices() serves the catalog markets plus kr, hk, tw and il (46 countries). */
export type NintendoPricesCountry = NintendoCountry | "kr" | "hk" | "tw" | "il";

/** Each market serves its own languages (see the header comment); another answers 400. */
export type NintendoLanguage = "en" | "fr" | "es" | "pt" | "de" | "it" | "nl" | "ja" | "ko" | "zh";

/** relevance (default), newest, price_asc, price_desc, title or discount. Americas: relevance and newest; jp: the first four; Europe: all six. */
export type NintendoSort = "relevance" | "newest" | "price_asc" | "price_desc" | "title" | "discount";

/** Americas: all five (featured default); Europe: discount (default), price_asc, newest; jp: newest (default), price_asc. */
export type NintendoDealSort = "featured" | "discount" | "price_asc" | "newest" | "ending_soon";

/** game (default), dlc, bundle or all (Europe: game, dlc or all; jp: all four). */
export type NintendoType = "game" | "dlc" | "bundle" | "all";

/** switch or switch_2. */
export type NintendoPlatform = "switch" | "switch_2";

/** new (released games, newest first) or upcoming (future release dates, soonest first). */
export type NintendoReleaseType = "new" | "upcoming";

type Id = string | number;

export interface NintendoMarketOptions<C extends string = NintendoCountry> {
  /** eShop country. Defaults to "us". */
  country?: C;
  /** Language of the market. Defaults to the market's first. */
  language?: NintendoLanguage;
}

export interface NintendoSearchOptions extends NintendoMarketOptions {
  /** Search keywords, e.g. "mario" (Japanese titles on jp). */
  query: string;
  /** Results page, 1-based (Americas: up to 50). */
  page?: number;
  /** Items per page, 1 to 50 (default 24; Europe and jp). Americas pages are fixed at 40. */
  page_size?: number;
  /** Sort order. Defaults to "relevance". */
  sort?: NintendoSort;
  /** switch or switch_2 (Europe and jp; default both). */
  platform?: NintendoPlatform;
  /** Only discounted games (Europe and jp). */
  on_sale?: boolean;
  /** Lowest price (Europe, where the catalog is priced in the market's currency: gb and the EUR markets with a catalog of their own). */
  price_min?: number;
  /** Highest price (as price_min). */
  price_max?: number;
  /** A genre as the catalog names it, in the request language (Europe: e.g. RPG, Action). */
  genre?: string;
  /** At least this many players (Europe). */
  players?: number;
  /** Exact publisher name (Europe; jp in Japanese). */
  publisher?: string;
  /** Only games with a free demo (Europe). */
  has_demo?: boolean;
  /** game (default), dlc, bundle or all (Europe: game, dlc or all; jp: all four). */
  type?: NintendoType;
  [key: string]: unknown;
}

export interface NintendoProductRef {
  /** An eShop item id (14 digits starting 70), e.g. "70010000095431". Ids are per eShop region. One of nsuid, url or slug. */
  nsuid?: Id;
  /** A nintendo.com product link: an Americas store page, a European game page (ending -<id>.html) or a nintendo.com/au game page. */
  url?: string;
  /** Americas markets only: the store slug (items[].slug of an Americas search), e.g. "mario-kart-world-switch-2". */
  slug?: string;
}

export interface NintendoProductOptions extends NintendoMarketOptions, NintendoProductRef {
  [key: string]: unknown;
}

export interface NintendoPricesOptions extends NintendoMarketOptions<NintendoPricesCountry> {
  /** 1 to 50 eShop item ids of one region, as an array or comma-separated. More than 50 answers 400. */
  ids: string | Id[];
  [key: string]: unknown;
}

export interface NintendoDealsOptions extends NintendoMarketOptions {
  /** Results page, 1-based. */
  page?: number;
  /** Items per page, 1 to 50 (default 24). */
  page_size?: number;
  /** Sort order (per region, see NintendoDealSort). */
  sort?: NintendoDealSort;
  /** switch or switch_2 (default both). */
  platform?: NintendoPlatform;
  /** Americas only: one sale page, by its slug from sales[].sale, e.g. "square-enix". */
  sale?: string;
  [key: string]: unknown;
}

export interface NintendoReleasesOptions extends NintendoMarketOptions {
  /** new (default) or upcoming. */
  type?: NintendoReleaseType;
  /** switch or switch_2 (default both). */
  platform?: NintendoPlatform;
  /** Results page, 1-based (Europe and jp; the Americas lists are one page). */
  page?: number;
  /** Items per page, 1 to 50 (default 24; Europe and jp). */
  page_size?: number;
  [key: string]: unknown;
}

export interface NintendoDlcOptions extends NintendoMarketOptions, NintendoProductRef {
  [key: string]: unknown;
}

export class NintendoNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/nintendo/${path}`, options, undefined, NINTENDO_TIMEOUT);
  }

  /**
   * Search one country's eShop catalog by keyword. Europe and jp: items with
   * nsuid, page_id (Europe), url, title, platform, release_date, publisher,
   * price, regular_price, sale_price, discount_percent, sale_start, sale_end,
   * currency, is_free, sales_status, image, type and age_rating, with total,
   * page, page_size and total_pages. Americas: 40 tiles per page with slug
   * (no nsuid: read product() with the slug), price fields, badges, category
   * and has_more (total null), sorted by relevance or newest only.
   *
   * Costs 1 credit.
   */
  async search(options: NintendoSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One product by nsuid, url or (Americas) slug, as product: nsuid,
   * application_id, title, url, platform, type, release_date, publisher,
   * developer, genres, players, languages, file size, age_rating (system,
   * rating, descriptors), description, price fields with sale_start /
   * sale_end, has_demo, nintendo_switch_online, images; on the Americas store
   * also sku, editions, play_modes, the game's dlc with prices and, for
   * hardware, amiibo and merchandise, the stock signal. An id unknown to that
   * region's eShop is a charged 404. No user reviews (age ratings only).
   *
   * Costs 1 credit.
   */
  async product(options: NintendoProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The eShop price of 1 to 50 item ids in one country: prices (nsuid,
   * sales_status, price, regular_price, sale_price, discount_percent,
   * sale_start, sale_end, currency, is_free), not_found and count. Every
   * market including the prices-only kr, hk, tw and il. Poll it to watch
   * prices and sales over time.
   *
   * Costs 1 credit.
   */
  async prices(options: NintendoPricesOptions): Promise<Record<string, unknown>> {
    return this.post("prices", options);
  }

  /**
   * Games on sale now. Europe and jp: every discounted game in the catalog
   * (items with on_sale and sale_end), paged. Americas: Nintendo's featured
   * sale pages, not every discounted game, with each item's sale (the page it
   * is featured in), amount_off and sales (every sale page: pass its slug as
   * sale).
   *
   * Costs 1 credit.
   */
  async deals(options: NintendoDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * New releases (newest first) or upcoming games (soonest first) with the
   * search item fields. Europe and jp paged; the Americas lists are one page,
   * and titles announced for a year or month only carry release_date null and
   * release_date_text.
   *
   * Costs 1 credit.
   */
  async releases(options: NintendoReleasesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("releases", options);
  }

  /**
   * A game's DLC, bundles and upgrade packs by the game's nsuid, url or
   * (Americas) slug: game (nsuid, title, url) and dlc (nsuid, title, url,
   * type dlc / bundle / upgrade, release_date, price fields, sale_start,
   * sale_end, sales_status, image), count and total.
   *
   * Costs 1 credit.
   */
  async dlc(options: NintendoDlcOptions): Promise<Record<string, unknown>> {
    return this.post("dlc", options);
  }
}
