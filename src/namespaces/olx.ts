import type { Scavio } from "../client.js";

// OLX: 9 endpoints, OLX Europe only (olx.pl, plus olx.ro, olx.pt, olx.bg,
// olx.ua, olx.kz and olx.uz), 1 credit each. OLX Brasil, olx.in and other
// OLX-branded sites are not covered.
//
// Every endpoint takes country (pl when omitted on the server); filters() and
// similar() are pl, ro, pt, bg and ua only. language is kz / uz only (kk on
// kz, uz on uz, ru on both) and only on search(), sellerAds() and offer().
// search() takes query, category_id or both; offer() and similar() take
// offer_id or url; olx_delivery is refused on kz and uz. The server enforces
// these. Titles, params and labels come back in the site's language (Polish
// on pl, Russian by default on kz and uz). A call can take up to about a
// minute, so every call raises the request timeout to OLX_TIMEOUT when the
// client's is shorter. Failed upstream calls are not charged; a not-found is
// a charged 404, and an ended ad answers the same 404 as a missing one.

/** Minimum request timeout (ms) for every olx call. */
export const OLX_TIMEOUT = 120_000;

/**
 * Markets: pl (olx.pl, PLN, Polish, default), ro (olx.ro, RON, Romanian),
 * pt (olx.pt, EUR, Portuguese), bg (olx.bg, EUR, Bulgarian), ua (olx.ua,
 * UAH, Ukrainian), kz (olx.kz, KZT, Russian or Kazakh), uz (olx.uz, UZS,
 * Russian or Uzbek). Titles come in the site's language, prices in its
 * currency.
 */
export type OlxCountry = "pl" | "ro" | "pt" | "bg" | "ua" | "kz" | "uz";

/** The markets filters() and similar() serve: not kz or uz. */
export type OlxFiltersCountry = Exclude<OlxCountry, "kz" | "uz">;

/** kz and uz only: kk (Kazakh) on kz or uz (Uzbek) on uz; both default to ru (Russian). */
export type OlxLanguage = "ru" | "kk" | "uz";

/**
 * Listing sorts; relevance is the default. newest orders by last refresh
 * (sellers can refresh an ad to the top), not first posting. Promoted ads
 * are not sorted.
 */
export type OlxSort = "relevance" | "newest" | "price_low_to_high" | "price_high_to_low";

/** Radius steps around city_id, in km. */
export type OlxDistanceKm = 0 | 2 | 5 | 10 | 15 | 30 | 50 | 75 | 100;

/**
 * A category's own filters, as listed by filters() (send_as keys): a range
 * filter as filter_float_<name>:from / :to with a number, a choice filter as
 * filter_enum_<name> with one value or a list. Up to 20 keys.
 */
export type OlxCategoryFilters = Record<string, number | string | Array<string | number>>;

/** Paging, sort and filters shared by search() and sellerAds(). */
export interface OlxGridOptions {
  /** pl (default), ro, pt, bg, ua, kz or uz. */
  country?: OlxCountry;
  /** kz and uz only: kk (Kazakh) on kz or uz (Uzbek) on uz; both default to ru (Russian). */
  language?: OlxLanguage;
  /** Results page, 1-based. OLX serves the first 1000 results of a search only, so page x page_size may not exceed 1000. */
  page?: number;
  /** Ads per page, up to 50 (default 40). Promoted ads come on top of these (40 asks return about 52 items). */
  page_size?: number;
  /** relevance (default), newest (last posted or refreshed first), price_low_to_high or price_high_to_low. */
  sort?: OlxSort;
  /** Lowest price, in the site's currency. */
  min_price?: number;
  /** Highest price, in the site's currency. */
  max_price?: number;
  /** new, used, refurbished or damaged (in categories that have a condition). */
  condition?: "new" | "used" | "refurbished" | "damaged";
  /** private (individuals) or business. */
  seller_type?: "private" | "business";
  /** Only ads that can be bought with OLX delivery. Not on kz or uz. */
  olx_delivery?: boolean;
  /** Only ads with photos. */
  with_photos?: boolean;
  /** Only ads in this region: region_id of locations() or of an item's location. */
  region_id?: string | number;
  /** Only ads in this city: city_id of locations() or of an item's location, e.g. 17871. */
  city_id?: string | number;
  /** Only ads in this district of a city: district_id of locations(). */
  district_id?: string | number;
  /** With city_id: include ads within this many km of the city. */
  distance_km?: OlxDistanceKm;
  /** The category's own filters from filters(), e.g. { "filter_float_year:from": 2018, filter_enum_rooms: ["two"] }. */
  filters?: OlxCategoryFilters;
  /** Keep the promoted ads the site places on each page (default true; each is flagged is_promoted with its slot). */
  include_promoted?: boolean;
}

/** Pass query, category_id or both. */
export interface OlxSearchOptions extends OlxGridOptions {
  /** Search keywords, in any language, e.g. "iphone". A query with no exact match returns the closest ads. */
  query?: string;
  /** Search inside one category: categories[].id of categories() or an item's category_id, e.g. 84 = cars on olx.pl. */
  category_id?: string | number;
  [key: string]: unknown;
}

/** Pass offer_id or url. */
export interface OlxOfferOptions {
  /** An OLX ad id: items[].id of a search, e.g. "1107557408". */
  offer_id?: string | number;
  /** An OLX ad link on any of the seven sites. Alternative to offer_id. */
  url?: string;
  /** pl (default), ro, pt, bg, ua, kz or uz. */
  country?: OlxCountry;
  /** kz and uz only: kk (Kazakh) on kz or uz (Uzbek) on uz; both default to ru (Russian). */
  language?: OlxLanguage;
  [key: string]: unknown;
}

export interface OlxSellerOptions {
  /** An OLX seller id: items[].seller.id of a search or seller.id of an offer, e.g. "2547532895". */
  user_id: string | number;
  /** pl (default), ro, pt, bg, ua, kz or uz. */
  country?: OlxCountry;
  [key: string]: unknown;
}

export interface OlxSellerAdsOptions extends OlxGridOptions {
  /** An OLX seller id: items[].seller.id of a search or seller.id of an offer. */
  user_id: string | number;
  /** Search within the seller's ads. */
  query?: string;
  /** Only the seller's ads in this category. */
  category_id?: string | number;
  [key: string]: unknown;
}

export interface OlxFiltersOptions {
  /** The category (categories[].id of categories()), e.g. 14 = flats for sale on olx.pl, 84 = cars. */
  category_id: string | number;
  /** Count values for this keyword inside the category. */
  query?: string;
  /** Count values in this region only (locations then lists its cities). */
  region_id?: string | number;
  /** pl (default), ro, pt, bg or ua; not kz or uz. */
  country?: OlxFiltersCountry;
  [key: string]: unknown;
}

export interface OlxCategoriesOptions {
  /** Return this category's whole subtree, e.g. 5. Without it: the top-level categories with their direct children. */
  parent_id?: string | number;
  /** pl (default), ro, pt, bg, ua, kz or uz. */
  country?: OlxCountry;
  [key: string]: unknown;
}

export interface OlxLocationsOptions {
  /** At least 2 letters of a city or district name, e.g. "Warszawa". */
  query: string;
  /** pl (default), ro, pt, bg, ua, kz or uz. */
  country?: OlxCountry;
  [key: string]: unknown;
}

export interface OlxSuggestionsOptions {
  /** What the user has typed so far, e.g. "rower". */
  query: string;
  /** pl (default), ro, pt, bg, ua, kz or uz. */
  country?: OlxCountry;
  [key: string]: unknown;
}

/** Pass offer_id or url. */
export interface OlxSimilarOptions {
  /** An OLX ad id: items[].id of a search, e.g. "1107557408". */
  offer_id?: string | number;
  /** An OLX ad link. Alternative to offer_id. */
  url?: string;
  /** pl (default), ro, pt, bg or ua; not kz or uz. */
  country?: OlxFiltersCountry;
  [key: string]: unknown;
}

export class OlxNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/olx/${path}`, options, undefined, OLX_TIMEOUT);
  }

  /**
   * Search OLX Europe classifieds (used goods, cars, real estate, jobs) by
   * keyword and / or category: sort by newest or price; filter by price
   * range, condition, private or business seller, OLX delivery, photos,
   * region / city / district with a radius, and the category's own filters
   * (from filters()). Up to 1000 results per query (OLX's own cap). Items
   * carry id, url, title, description_snippet, price (value, currency,
   * negotiable, type, label, previous_value; original_value and
   * original_currency when the site converts a price, e.g. olx.uz y.e. to
   * UZS), salary for jobs, condition, params, category_id, location with
   * ids, created_at, refreshed_at, valid_to, status, is_promoted with
   * promoted_position (promoted ads are interleaved), is_highlighted,
   * is_business, olx_delivery, photos and seller (id; business_name for
   * business sellers only). Also total (null on kz and uz once a search
   * reaches 1000 ads), total_capped, total_pages, page, page_size,
   * has_next_page, count, promoted_count, sort, applied_filters, country,
   * language and currency. No phone numbers, emails or private names.
   *
   * Costs 1 credit.
   */
  async search(options: OlxSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One OLX ad by id or link: title, the full description as plain text,
   * price, salary for jobs, condition, every parameter (a car's VIN is never
   * returned), category with breadcrumb, all photos, location, created_at,
   * refreshed_at, valid_to, status, is_active, is_promoted, olx_delivery,
   * is_job and the seller (id, is_business, business_name for business
   * sellers, member_since). An ad that does not exist and an ad that has
   * ended answer the same 404 ("not found or no longer active", charged).
   *
   * Costs 1 credit.
   */
  async offer(options: OlxOfferOptions): Promise<Record<string, unknown>> {
    return this.post("offer", options);
  }

  /**
   * One OLX seller by id: is_business, business_name (business sellers
   * only; null otherwise), member_since, active_ads (null on kz and uz from
   * 1000 ads up) and ads_url. OLX shows no seller ratings or reviews.
   *
   * Costs 1 credit.
   */
  async seller(options: OlxSellerOptions): Promise<Record<string, unknown>> {
    return this.post("seller", options);
  }

  /**
   * One OLX seller's live ads, with the search() sorts and filters and an
   * optional query, in the search() shape.
   *
   * Costs 1 credit.
   */
  async sellerAds(options: OlxSellerAdsOptions): Promise<Record<string, unknown>> {
    return this.post("seller-ads", options);
  }

  /**
   * The filters one OLX category offers, ready to send as search() filters:
   * key, label, type, kind (range or choice), unit, send_as (the filters keys
   * to use), suggested range steps and, for choice filters, every value with
   * its label and ad count. Also the category's ad counts per region (or per
   * city inside region_id) and per category. pl, ro, pt, bg and ua only.
   *
   * Costs 1 credit.
   */
  async filters(options: OlxFiltersOptions): Promise<Record<string, unknown>> {
    return this.post("filters", options);
  }

  /**
   * The OLX category tree of one site: id, name, parent_id, level, path,
   * url, type and count (active ads), with children. Without parent_id: the
   * top-level categories and their direct children; with parent_id: that
   * category's whole subtree.
   *
   * Costs 1 credit.
   */
  async categories(options: OlxCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * Place autocomplete for OLX location filters: cities and districts
   * matching a name, with city_id, district_id and region_id to send to
   * search(), plus the municipality, county and region names.
   *
   * Costs 1 credit.
   */
  async locations(options: OlxLocationsOptions): Promise<Record<string, unknown>> {
    return this.post("locations", options);
  }

  /**
   * The suggestions the OLX search box shows for what a user typed: popular
   * searches, each with the category it is most searched in (category_id,
   * name and its parent categories).
   *
   * Costs 1 credit.
   */
  async suggestions(options: OlxSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * The ads OLX recommends next to one ad (about 30), in the search() item
   * shape, with offer_id and count. pl, ro, pt, bg and ua only.
   *
   * Costs 1 credit.
   */
  async similar(options: OlxSimilarOptions): Promise<Record<string, unknown>> {
    return this.post("similar", options);
  }
}
