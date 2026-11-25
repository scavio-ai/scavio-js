import type { Scavio } from "../client.js";

// OfferUp (offerup.com, the US local marketplace for buying and selling used
// items, cars and trucks): 5 endpoints, 1 credit each; listing() is 1, or 2
// when the listing needs a second, costlier fetch. credits_used in the
// response is what was charged.
//
// US only (no country), prices in USD. search() and category() take a US ZIP
// (required): OfferUp lists local items, and location.resolved is the area
// OfferUp named for the ZIP, location.radius_miles the radius it applied.
// filters_not_applied lists any filter OfferUp did not apply to the feed.
// seller_type applies in Cars & Trucks only: on search() it limits the
// results to category 5.1. Promoted OfferUp listings are marked sponsored.
// About 48 listings a page up to page 50, no total count (has_more); search
// tiles carry no posted date or condition (listing() does).
//
// Prices are asking prices, not sold prices. Private sellers: no seller names
// (a dealer or business account's name only), usernames, avatars, phone
// numbers, emails, street addresses, coordinates or VINs; phone numbers,
// emails and VIN-like codes in titles and descriptions read "[removed]".
// Not available: sold listings or sold prices (OfferUp does not show them
// publicly), shipping (OfferUp ended nationwide shipping in 2025; listings
// are local pickup), search suggestions, a total result count, a seller's
// listings past the first 20, messaging or offers.
//
// The server enforces the value rules: radius and max_mileage take OfferUp's
// steps only, year_min <= year_max, min_price <= max_price; listing() takes
// listing_id or url. Every call raises the request timeout to
// OFFERUP_TIMEOUT. Failed upstream calls and refused inputs are not charged;
// a not-found (an unknown listing, category or seller) is charged.

/** Minimum request timeout (ms) for every offerup call: calls can queue behind the server's upstream limit. */
export const OFFERUP_TIMEOUT = 240_000;

/** best_match (search default), newest (category default), distance, price_low, price_high; vehicles also newest_year and lowest_mileage. */
export type OfferupSort = "best_match" | "newest" | "distance" | "price_low" | "price_high" | "newest_year" | "lowest_mileage";

/** Category feeds have no best_match order. */
export type OfferupCategorySort = Exclude<OfferupSort, "best_match">;

/** OfferUp's condition filter. */
export type OfferupCondition = "new" | "open_box" | "refurbished" | "used" | "for_parts" | "other";

/** Miles around the ZIP: 5-80 for goods (default 30); 5, 25, 80 (default), 100, 200, 1500 for vehicles. */
export type OfferupRadius = 5 | 10 | 20 | 25 | 30 | 50 | 80 | 100 | 200 | 1500;

/** OfferUp's mileage steps. */
export type OfferupMileage = 0 | 25_000 | 50_000 | 75_000 | 100_000 | 125_000 | 150_000 | 175_000 | 200_000;

export interface OfferupFeedFilters {
  /** Required. A 5-digit US ZIP code (e.g. "98101"); an unknown ZIP is a 400, not charged. */
  zip: string | number;
  /** Miles around the ZIP; location.radius_miles says which radius OfferUp applied. */
  radius?: OfferupRadius;
  /** Page (default 1, at most 50); 44-50 listings a page. */
  page?: number;
  /** Lowest asking price, whole USD. */
  min_price?: number;
  /** Highest asking price, whole USD. */
  max_price?: number;
  /** One condition, a list, or comma-separated. */
  condition?: OfferupCondition | OfferupCondition[] | string;
  /** Cars and trucks: dealer (OfferUp's verified dealers) or private. On search it limits the results to Cars & Trucks (category_id 5.1). */
  seller_type?: "dealer" | "private";
  /** Vehicles: the make as OfferUp lists it (e.g. "Toyota"; 61 makes). */
  make?: string;
  /** Vehicles: earliest model year (1936-2027). */
  year_min?: number;
  /** Vehicles: latest model year (1936-2027). */
  year_max?: number;
  /** Vehicles: most miles, one of OfferUp's steps. */
  max_mileage?: OfferupMileage;
}

export interface OfferupSearchOptions extends OfferupFeedFilters {
  /** Keywords (e.g. "iphone 15"). */
  q: string;
  /** Defaults to "best_match". */
  sort?: OfferupSort;
  /** Only listings in this category: categories[].id or children[].id (e.g. "2.1" Furniture, "5.1" Cars & Trucks). */
  category_id?: string;
  [key: string]: unknown;
}

export interface OfferupCategoryOptions extends OfferupFeedFilters {
  /** A category slug (e.g. "furniture", "cars-and-trucks") or id (e.g. "2.1") from categories(). An unknown slug is a charged 404. */
  category: string;
  /** Defaults to "newest". */
  sort?: OfferupCategorySort;
  [key: string]: unknown;
}

export interface OfferupListingOptions {
  /** An OfferUp listing id (items[].listing_id, e.g. "7a392126-fb9d-34c2-a6d8-1b94698428df"). Send listing_id or url. */
  listing_id?: string;
  /** An OfferUp listing link (https://offerup.com/item/detail/<listing id>) instead of listing_id. */
  url?: string;
  [key: string]: unknown;
}

export interface OfferupSellerOptions {
  /** A seller id (a listing's seller.id; digits, e.g. "8668343") or an offerup.com/p/<id> link. */
  seller_id: string | number;
  [key: string]: unknown;
}

export class OfferupNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/offerup/${path}`, options, undefined, OFFERUP_TIMEOUT);
  }

  /** Search listings around a US ZIP: asking price, city, state, sponsored, vehicle miles; filters, sorts and the area OfferUp resolved. */
  async search(options: OfferupSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One listing by id or link: asking price, condition, posted date, description, vehicle details (no VIN), the seller's public numbers. 1 credit, or 2. */
  async listing(options: OfferupListingOptions): Promise<Record<string, unknown>> {
    return this.post("listing", options);
  }

  /** One category by slug or id around a US ZIP, with the search filters, sorts (no best_match) and paging. */
  async category(options: OfferupCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /** The category tree: 14 top-level categories, 151 in all, with slugs and ids. */
  async categories(options: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /** A seller's public profile: seller type, rating, items sold, joined, response time, the first 20 listings; dealers and businesses also name, website and hours. */
  async seller(options: OfferupSellerOptions): Promise<Record<string, unknown>> {
    return this.post("seller", options);
  }
}
