import type { Scavio } from "../client.js";

// Poshmark: 15 endpoints, 1 credit each.
//
// Markets (country, default "us"): us (poshmark.com, USD) and ca (poshmark.ca,
// CAD); both storefronts are English. Every endpoint accepts both. search,
// sold, category, brand, brands, suggestions, parties, partyListings and
// similar return that market's own listings in its currency; product, closet,
// closetListings, loveNotes, closetsSearch and categories are global (country
// only picks the domain asked). Listing ids and closets are global: a listing
// opens from either market in its own currency (no conversion); closet
// listings are read in the seller's home market. Any other country answers
// 400 before anything is charged.
//
// Sold search reaches up to 480 sold listings per query and filter
// combination (10 pages of 48, Poshmark's own limit): narrow with filters or
// split by price_min / price_max to reach more. On a sold listing, price is
// the price shown on the sold listing (Poshmark says a sold listing reflects
// the final order price; offers are private and not returned) and sold_at is
// the date Poshmark marked it sold. original_price is the original price the
// seller entered; first_price is the price it was first listed at, which can
// be below price when the seller raised the price. Active search reaches
// about 5,000 listings per query (105 pages of 48); total is Poshmark's
// approximate count. items_sold is Poshmark's display string (e.g. "700+").
// Seller usernames only: no real names, cities, likers, comment authors or
// Love Note buyers. Not available: sold results beyond 480 per query and
// filter combination, Love Notes beyond the latest 100, Posh Shows, trending
// searches, the full brand directory (top 50; brand inputs take any name),
// offers, bundles, price history.
//
// The server enforces the cross-field rules: product() takes one of
// listing_id or url; category needs department, subcategory needs category.
// Every call raises the request timeout to POSHMARK_TIMEOUT. Failed upstream
// calls are not charged; a not-found is charged.

/** Minimum request timeout (ms) for every poshmark call: listing pages can take up to about a minute and are retried server-side. */
export const POSHMARK_TIMEOUT = 240_000;

/** us (poshmark.com, USD; default) or ca (poshmark.ca, CAD). */
export type PoshmarkCountry = "us" | "ca";

/** relevance (default), just_shared, just_in (newest listed), price_asc, price_desc, price_drop (recently price dropped), most_liked. */
export type PoshmarkSort = "relevance" | "just_shared" | "just_in" | "price_asc" | "price_desc" | "price_drop" | "most_liked";

/** Condition filter: boutique = Boutique retail listings. */
export type PoshmarkCondition = "new_with_tags" | "new_with_tags_or_boutique" | "boutique" | "like_new" | "good" | "fair";

/** Poshmark departments. */
export type PoshmarkDepartment = "Women" | "Men" | "Kids" | "Home" | "Pets" | "Electronics";

/** Poshmark colour filter values. */
export type PoshmarkColor =
  | "Red" | "Pink" | "Orange" | "Yellow" | "Green" | "Blue" | "Purple" | "Gold" | "Silver" | "Black"
  | "Gray" | "White" | "Cream" | "Brown" | "Tan";

/** available (default), sold or all. Sold pages stop at 10 (480 listings). */
export type PoshmarkAvailability = "available" | "sold" | "all";

/** all (default), scheduled (upcoming) or archived (ended). */
export type PoshmarkPartyStatus = "all" | "scheduled" | "archived";

export interface PoshmarkFilterOptions {
  /** Market. Defaults to "us". */
  country?: PoshmarkCountry;
  /** relevance (default), just_shared, just_in, price_asc, price_desc, price_drop, most_liked. */
  sort?: PoshmarkSort;
  /** Sizes as Poshmark writes them (items[].size, e.g. "10", "M", "OS"), up to 10. */
  size?: string[] | string;
  /** One condition. */
  condition?: PoshmarkCondition;
  /** Colours, up to 5. */
  color?: PoshmarkColor[] | string;
  /** Lowest price, whole units of the market's currency. */
  price_min?: number;
  /** Highest price, whole units of the market's currency. */
  price_max?: number;
}

export interface PoshmarkSearchOptions extends PoshmarkFilterOptions {
  /** Search keywords, e.g. "lululemon align". */
  query: string;
  /** Page, 1 to 105, 48 listings each (about 5,000 reachable per query). Sold listings stop at page 10. */
  page?: number;
  /** available (default), sold or all. */
  availability?: PoshmarkAvailability;
  /** Brand names as Poshmark writes them (items[].brand, brands(), suggestions()), one or up to 10. */
  brand?: string[] | string;
  department?: PoshmarkDepartment;
  /** Category slug or name from categories() (e.g. "Bags", "Pants_&_Jumpsuits"). Needs department. */
  category?: string;
  /** Subcategory slug or name from categories() (e.g. "Totes", "Leggings"). Needs category. */
  subcategory?: string;
  [key: string]: unknown;
}

export interface PoshmarkSoldOptions extends PoshmarkFilterOptions {
  /** Search keywords, e.g. "coach bag". */
  query: string;
  /** Page, 1 to 10, 48 sold listings each (480 per query and filter combination). */
  page?: number;
  /** Brand names as Poshmark writes them, one or up to 10. */
  brand?: string[] | string;
  department?: PoshmarkDepartment;
  /** Category slug or name from categories(). Needs department. */
  category?: string;
  /** Subcategory slug or name from categories(). Needs category. */
  subcategory?: string;
  [key: string]: unknown;
}

export interface PoshmarkProductOptions {
  /** Listing id (items[].listing_id, 24 hex characters), e.g. "6ad80f0dce5b0ace7ee9abd7". One of listing_id or url. */
  listing_id?: string;
  /** A poshmark.com or poshmark.ca listing link. */
  url?: string;
  /** Optional: the domain to ask. The listing answers in its own market and currency either way. */
  country?: PoshmarkCountry;
  [key: string]: unknown;
}

export interface PoshmarkCategoryOptions extends PoshmarkFilterOptions {
  /** Department (required). */
  department: PoshmarkDepartment;
  /** Category slug or name from categories(), e.g. "Bags". */
  category?: string;
  /** Subcategory slug or name from categories(), e.g. "Totes". Needs category. */
  subcategory?: string;
  /** Page, 1 to 105, 48 listings each. Sold listings stop at page 10. */
  page?: number;
  /** available (default), sold or all. */
  availability?: PoshmarkAvailability;
  /** Brand names, one or up to 10. */
  brand?: string[] | string;
  [key: string]: unknown;
}

export interface PoshmarkBrandOptions extends PoshmarkFilterOptions {
  /** One brand: its name ("Coach", "lululemon athletica") or slug (items[].brand_slug, e.g. "lululemon_athletica"). */
  brand: string;
  department?: PoshmarkDepartment;
  /** Category slug or name from categories(). Needs department. */
  category?: string;
  /** Page, 1 to 105, 48 listings each. Sold listings stop at page 10. */
  page?: number;
  /** available (default), sold or all. */
  availability?: PoshmarkAvailability;
  [key: string]: unknown;
}

export interface PoshmarkClosetOptions {
  /** Closet username (poshmark.com/closet/<username>, items[].seller_username), e.g. "thriftedbyher". */
  username: string;
  /** Optional: the domain to ask. Closets are global. */
  country?: PoshmarkCountry;
  [key: string]: unknown;
}

export interface PoshmarkClosetListingsOptions extends PoshmarkClosetOptions {
  /** available (default) or sold. */
  availability?: "available" | "sold";
  /** Page, 48 listings each. */
  page?: number;
}

export interface PoshmarkClosetsSearchOptions {
  /** Part of a closet username, e.g. "vintage". */
  query: string;
  /** Page, 1 to 200, 24 closets each. */
  page?: number;
  /** Optional: the domain to ask. Closets are global. */
  country?: PoshmarkCountry;
  [key: string]: unknown;
}

export interface PoshmarkMarketOptions {
  /** Market. Defaults to "us". */
  country?: PoshmarkCountry;
  [key: string]: unknown;
}

export interface PoshmarkSuggestionsOptions extends PoshmarkMarketOptions {
  /** What the shopper has typed so far, e.g. "lulu". */
  query: string;
}

export interface PoshmarkPartiesOptions extends PoshmarkMarketOptions {
  /** all (default), scheduled (upcoming) or archived (ended). */
  status?: PoshmarkPartyStatus;
}

export interface PoshmarkPartyListingsOptions extends PoshmarkMarketOptions {
  /** Party id (parties[].party_id of parties()). Party ids are per market: send the party's market as country. */
  party_id: string;
  /** next_cursor of the previous page. */
  cursor?: string;
}

export interface PoshmarkSimilarOptions extends PoshmarkMarketOptions {
  /** Listing id (items[].listing_id), e.g. "6ad80f0dce5b0ace7ee9abd7". Ask with the listing's own market. */
  listing_id: string;
}

export class PoshmarkNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/poshmark/${path}`, options, undefined, POSHMARK_TIMEOUT);
  }

  /**
   * Search listings in one market, 48 per page (about 5,000 reachable per
   * query): market, currency, sort, availability, filters, page, page_size,
   * total (approximate), has_more, count, items (listing_id, url, title,
   * price, original_price, first_price, price_drop_percent, size, brand,
   * condition, department, category, colors, status, sold_at, counts,
   * seller_username, created_at, updated_at, market), facets. availability
   * available (default), sold or all.
   *
   * Costs 1 credit.
   */
  async search(options: PoshmarkSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * Sold listings by keyword in one market: price is the price shown on the
   * sold listing (offers are private and not returned), sold_at the date
   * Poshmark marked it sold. Up to 480 per query and filter combination (10
   * pages of 48): narrow with filters or split by price range to reach more.
   *
   * Costs 1 credit.
   */
  async sold(options: PoshmarkSoldOptions): Promise<Record<string, unknown>> {
    return this.post("sold", options);
  }

  /**
   * One listing in full by listing_id or link: description, status, sold_at,
   * price, original_price (seller-entered), first_price, price drop, shipping,
   * bundle_discount, promotions, sizes with quantities, colors, pictures,
   * comments (no authors), dates and seller (username, home_market,
   * posh_ambassador, super_seller, followers, listings, items_sold,
   * orders_shipped, love_notes, last_active_at, joined_at). Global ids.
   *
   * Costs 1 credit.
   */
  async product(options: PoshmarkProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One category's listings (department required; category and subcategory
   * from categories()), available, sold or all, sorted and filtered as
   * search. An unknown category is a charged 404.
   *
   * Costs 1 credit.
   */
  async category(options: PoshmarkCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One brand's listings (brand {id, name}, brand_slug), optionally in one
   * department and category, available, sold or all. An unknown brand is a
   * charged 404.
   *
   * Costs 1 credit.
   */
  async brand(options: PoshmarkBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * A closet (seller) by username: home_market, posh_ambassador,
   * super_seller, followers, following, listings, shares, items_sold
   * (rounded, e.g. "700+"), orders_shipped, love_notes, on_vacation,
   * last_active_at, joined_at, description. Global. An unknown username is a
   * charged 404.
   *
   * Costs 1 credit.
   */
  async closet(options: PoshmarkClosetOptions): Promise<Record<string, unknown>> {
    return this.post("closet", options);
  }

  /**
   * A closet's available (default) or sold listings, 48 per page, read in the
   * seller's home market (market, currency), with on_vacation.
   *
   * Costs 1 credit.
   */
  async closetListings(options: PoshmarkClosetListingsOptions): Promise<Record<string, unknown>> {
    return this.post("closet-listings", options);
  }

  /**
   * The latest Love Notes a closet received (at most 100, no paging): count,
   * total (all received), complete, notes (comment, created_at, listing_id,
   * picture_url). No author is returned. Global.
   *
   * Costs 1 credit.
   */
  async loveNotes(options: PoshmarkClosetOptions): Promise<Record<string, unknown>> {
    return this.post("love-notes", options);
  }

  /**
   * Closets whose username matches a query, 24 per page: closets (username,
   * url, home_market, joined_at), total, has_more. Global.
   *
   * Costs 1 credit.
   */
  async closetsSearch(options: PoshmarkClosetsSearchOptions): Promise<Record<string, unknown>> {
    return this.post("closets-search", options);
  }

  /**
   * The category tree (the same on us and ca): 6 departments with their
   * categories and subcategories (id, name, slug). Slugs feed search, sold,
   * category and brand.
   *
   * Costs 1 credit.
   */
  async categories(options: PoshmarkMarketOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * Poshmark's top 50 brands in a market (id, name). The full brand
   * directory is not available; brand inputs take any brand name.
   *
   * Costs 1 credit.
   */
  async brands(options: PoshmarkMarketOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /**
   * Brand and brand + category suggestions for a partial query: suggestions
   * (type, text, brand, brand_id, category), count.
   *
   * Costs 1 credit.
   */
  async suggestions(options: PoshmarkSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Posh Parties of one market, upcoming and recent (20): party_id, name,
   * type, status, start_time, end_time, listing_count, themes, hosts.
   *
   * Costs 1 credit.
   */
  async parties(options: PoshmarkPartiesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("parties", options);
  }

  /**
   * Listings shared to one Posh Party, 20 per page by cursor (has_more,
   * next_cursor). An unknown party id answers 0 items.
   *
   * Costs 1 credit.
   */
  async partyListings(options: PoshmarkPartyListingsOptions): Promise<Record<string, unknown>> {
    return this.post("party-listings", options);
  }

  /**
   * 16 listings Poshmark shows as similar to one listing, from the market
   * asked. An unknown listing is a charged 404.
   *
   * Costs 1 credit.
   */
  async similar(options: PoshmarkSimilarOptions): Promise<Record<string, unknown>> {
    return this.post("similar", options);
  }
}
