import type { Scavio } from "../client.js";

// Carrefour: 9 endpoints, carrefour.fr (France) plus Argentina, Romania and
// Belgium for search() and product(), 1 credit each; search() and product()
// on Belgium cost 2.
//
// search() and product() take country (fr when omitted on the server),
// language (be only: fr / nl) and store (fr only); the other seven endpoints
// are carrefour.fr only. product() takes ean or url (url only on ro and be);
// category() takes url or path; stores() takes postal_code or lat + lng;
// store() takes slug or url. The unit-price and top_rated sorts and the
// filters are fr only; ar and ro sort by relevance or price, be by relevance.
// The server enforces these. Without store a price is carrefour.fr's national
// online price; with store, that store's shelf price and assortment. Every
// call raises the request timeout to CARREFOUR_TIMEOUT when the client's is
// shorter.

/** Minimum request timeout (ms) for every carrefour call. */
export const CARREFOUR_TIMEOUT = 120_000;

/**
 * Markets: fr (carrefour.fr, EUR, every endpoint, default), ar (Argentina,
 * ARS, Spanish), ro (Romania, RON, Romanian), be (Belgium, EUR, French or
 * Dutch; 2 credits). Titles come in the market's language, prices in its
 * currency. ar, ro and be serve search() and product() only.
 */
export type CarrefourCountry = "fr" | "ar" | "ro" | "be";

/** Listing sorts; relevance is the default. ar and ro: relevance and the two price sorts; be: relevance. */
export type CarrefourSort =
  | "relevance"
  | "price_low_to_high"
  | "price_high_to_low"
  | "unit_price_low_to_high"
  | "unit_price_high_to_low"
  | "top_rated";

/** reviews() sorts: most_recent (default), oldest, highest_rated, lowest_rated. */
export type CarrefourReviewSort = "most_recent" | "oldest" | "highest_rated" | "lowest_rated";

/**
 * promotions() types: all (default), catalogue (Vu en catalogue), immediate
 * (Remises immédiates), loyalty (Avantage Fidélité: loyalty-card offers) or
 * festive (the site's seasonal Sélection festive).
 */
export type CarrefourPromotionType = "all" | "catalogue" | "immediate" | "loyalty" | "festive";

/** stores() service filter: drive, lad (home delivery), Retrait2h-drive, station_service (fuel station), banque_assurance, spectacles, voyages, location_vehicule, traiteur, Parapharmacie, pro. */
export type CarrefourStoreService =
  | "drive"
  | "lad"
  | "Retrait2h-drive"
  | "station_service"
  | "banque_assurance"
  | "spectacles"
  | "voyages"
  | "location_vehicule"
  | "traiteur"
  | "Parapharmacie"
  | "pro";

/**
 * fr only: a store ref for that store's price and assortment: a store_ref or
 * pickup_refs[].ref from stores(), or stores[].store.ref from
 * storeAvailability(), e.g. "840093". Without it prices are the national
 * online price.
 */
export type CarrefourStoreRef = string | number;

/** fr filters shared by search(), category() and promotions(). */
export interface CarrefourFilterOptions {
  /** fr: one brand as the Marque facet lists it (e.g. NUTELLA, CARREFOUR BIO). Another casing is matched to the facet's own. */
  brand?: string;
  /** fr: only this Nutri-Score. */
  nutriscore?: "A" | "B" | "C" | "D" | "E";
  /** fr: only organic products. */
  organic?: boolean;
  /** fr: only Carrefour's own brands. */
  carrefour_brands?: boolean;
  /** fr: lowest price in EUR. */
  min_price?: number;
  /** fr: highest price in EUR. */
  max_price?: number;
}

/** Paging, sort and store shared by search(), category() and promotions(). */
export interface CarrefourGridOptions extends CarrefourFilterOptions {
  /** fr only: one store's price and assortment. */
  store?: CarrefourStoreRef;
  /** Results page, 1-based (up to 500). Defaults to 1. 30 items per page on fr (ar and ro 24, be 36). */
  page?: number;
  /** relevance (default), price_low_to_high, price_high_to_low, unit_price_low_to_high, unit_price_high_to_low or top_rated. */
  sort?: CarrefourSort;
}

export interface CarrefourSearchOptions extends CarrefourGridOptions {
  /** Search keywords, e.g. "nutella" or "lait". Misspellings are corrected by the site on fr (corrected_query). */
  query: string;
  /** fr (default), ar, ro or be (2 credits). */
  country?: CarrefourCountry;
  /** be only: fr (default) or nl. */
  language?: "fr" | "nl";
  /** fr: one value of the Promotions facet (facets[id=facet_promotions]): Toutes les promotions, Remises immédiates, Vu en catalogue, Avantage Fidélité... */
  promotion?: string;
  [key: string]: unknown;
}

/** Pass ean or url (url only on ro and be). */
export interface CarrefourProductOptions {
  /** The product barcode (EAN / GTIN): items[].ean of a search, e.g. "3017620422003". fr and ar. */
  ean?: string;
  /** A product URL (items[].url of a search). Alternative to ean on fr and ar; required on ro and be. */
  url?: string;
  /** fr (default), ar, ro or be (2 credits). */
  country?: CarrefourCountry;
  /** be only: fr (default) or nl. */
  language?: "fr" | "nl";
  /** fr only: one store's price and assortment. */
  store?: CarrefourStoreRef;
  /** fr: a marketplace seller id (items[].seller.id) to read that seller's offer. */
  seller?: string | number;
  [key: string]: unknown;
}

export interface CarrefourReviewsOptions {
  /** The product barcode (EAN / GTIN), e.g. "8006530256179". */
  ean: string;
  /** fr only. */
  country?: "fr";
  /** most_recent (default), oldest, highest_rated or lowest_rated. */
  sort?: CarrefourReviewSort;
  /** Only reviews with this many stars (1-5). */
  rating?: number;
  /** Reviews to return, 1-50. Defaults to 10. */
  limit?: number;
  /** Reviews to skip (paging). Defaults to 0. */
  offset?: number;
  [key: string]: unknown;
}

/** Pass url or path. */
export interface CarrefourCategoryOptions extends CarrefourGridOptions {
  /** A carrefour.fr category page URL (/r/...), e.g. "https://www.carrefour.fr/r/cremerie". */
  url?: string;
  /** The category path ("/r/cremerie", "/r/epicerie-sucree/petit-dejeuner") or its slug ("cremerie"): a breadcrumb[].url of a product. */
  path?: string;
  /** fr only. */
  country?: "fr";
  /** fr: one value of the Promotions facet. */
  promotion?: string;
  [key: string]: unknown;
}

export interface CarrefourPromotionsOptions extends CarrefourGridOptions {
  /** all (default), catalogue, immediate, loyalty or festive. */
  type?: CarrefourPromotionType;
  /** Only one aisle: a value of the Rayons facet (facets[id=product.categories.name].values[].label), e.g. "Boissons". */
  category?: string;
  /** fr only. */
  country?: "fr";
  [key: string]: unknown;
}

export interface CarrefourSuggestionsOptions {
  /** What a shopper has typed so far, e.g. "nutel". */
  query: string;
  /** fr only. */
  country?: "fr";
  [key: string]: unknown;
}

/** Pass postal_code or lat + lng. */
export interface CarrefourStoresOptions {
  /** A French postal code, e.g. "69003". */
  postal_code?: string;
  /** Latitude (metropolitan France), with lng. */
  lat?: number;
  /** Longitude, with lat. */
  lng?: number;
  /** Page of stores, 1-based (up to 50). */
  page?: number;
  /** Stores per page, 1-20. Defaults to 10. */
  limit?: number;
  /** Only stores with this service. */
  service?: CarrefourStoreService;
  /** fr only. */
  country?: "fr";
  [key: string]: unknown;
}

export interface CarrefourStoreAvailabilityOptions {
  /** The product barcode (EAN / GTIN), e.g. "3017620422003". */
  ean: string;
  /** A French postal code, e.g. "69003": stores around it are checked. */
  postal_code: string;
  /** fr only. */
  country?: "fr";
  [key: string]: unknown;
}

/** Pass slug or url. */
export interface CarrefourStoreOptions {
  /** A store page slug: stores[].slug from stores(), e.g. "venissieux". */
  slug?: string;
  /** A carrefour.fr/magasin/... store page URL. Alternative to slug. */
  url?: string;
  /** fr only. */
  country?: "fr";
  [key: string]: unknown;
}

export class CarrefourNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/carrefour/${path}`, options, undefined, CARREFOUR_TIMEOUT);
  }

  /**
   * Search Carrefour grocery and household products by keyword: carrefour.fr
   * with every filter (brand, promotion, Nutri-Score, organic, Carrefour
   * brands, price range), sorts by price, unit price or rating, and
   * store-scoped prices; also the Argentina (ARS), Romania (RON) and Belgium
   * (EUR, French or Dutch) sites, which return the fields their site carries
   * (no facets or store scope). Items carry ean, title, brand, url, image,
   * type, sponsored, price, unit_price with unit and unit_price_label (per
   * kg / L), packaging, format, nutriscore, ecoscore, rating, review_count,
   * available, low_stock, promotion (type, label, loyalty_only for
   * loyalty-card prices, discounted_price, initial_price, quantity,
   * starts_at, ends_at; on multi-buy deals the prices cover quantity items
   * and discounted_price is null when the site does not price the deal),
   * seller and category. Also total, total_pages, facets, corrected_query,
   * results_type, store, price_scope, country, language and currency. Titles
   * come in the market's language (French on fr).
   *
   * Costs 1 credit, or 2 when country is "be".
   */
  async search(options: CarrefourSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Carrefour product by EAN or URL. On fr: title, brand, description,
   * key features, breadcrumb, categories, images, packaging, format, origin,
   * Nutri-Score, Eco-Score, regulated name, ingredients, allergens (as
   * written in the ingredients), nutrition per 100 g / ml and per portion,
   * storage, advice, characteristics, weights, the price block (price, unit
   * price, promotion with loyalty_only), availability, the marketplace seller
   * and every offer, and the rating (average, count, distribution). ar (by
   * EAN or URL), ro and be (by URL) return the fields their site gives. A
   * not-found is a 404 (charged).
   *
   * Costs 1 credit, or 2 when country is "be".
   */
  async product(options: CarrefourProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Verified-purchase reviews of one carrefour.fr product by EAN, 1-50 per
   * call (default 10), with 4 sorts, a star filter and offset paging: total,
   * has_more and per review author (first name and last initial, as
   * published), rating, title, text, reviewed_at, purchased_at and source.
   *
   * Costs 1 credit.
   */
  async reviews(options: CarrefourReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * A carrefour.fr category (aisle) grid by URL or path, with the same
   * filters, sorts and store scope as search(), plus the category's label,
   * path, url and breadcrumb.
   *
   * Costs 1 credit.
   */
  async category(options: CarrefourCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * carrefour.fr items on promotion: all, catalogue, immediate discounts,
   * loyalty-card offers (member prices) or the site's festive selection,
   * optionally for one aisle, with the search filters and sorts. Each
   * promotion carries type, label, loyalty_only, discounted_price,
   * initial_price and its start and end dates. No price history: to track
   * promotions, poll and store your own.
   *
   * Costs 1 credit.
   */
  async promotions(options: CarrefourPromotionsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("promotions", options);
  }

  /**
   * carrefour.fr search box suggestions for a partial query: suggestions
   * (text, url) and category suggestions (category, text, url).
   *
   * Costs 1 credit.
   */
  async suggestions(options: CarrefourSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Carrefour stores in France near a postal code or a point, nearest first
   * (up to 20 per page), optionally with one service. Each store has id,
   * store_ref and pickup_refs (pass either as store for that store's
   * prices), name, banner, format, distance_km, address, lat, lng,
   * open_today, today's opening hours, slug (for store()) and store_url.
   *
   * Costs 1 credit.
   */
  async stores(options: CarrefourStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * Whether the Carrefour stores around a French postal code carry one
   * product (EAN): count, available_count and per store available yes / no,
   * distance_km and the store (id, ref, pickup_refs, name, address, phone,
   * weekly opening hours, drive hours). Availability only, no price: for a
   * store's price call search() or product() with store set to
   * stores[].store.ref.
   *
   * Costs 1 credit.
   */
  async storeAvailability(options: CarrefourStoreAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.post("store-availability", options);
  }

  /**
   * One Carrefour store in France by slug or URL: address, phone, services,
   * weekly opening hours and drive hours, the next pickup slots as shown,
   * delivery flags, nearby stores and, at stores with a fuel station, fuel
   * prices per litre with their update times (fuel is null elsewhere).
   *
   * Costs 1 credit.
   */
  async store(options: CarrefourStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }
}
