import type { Scavio } from "../client.js";

// Allegro: 7 endpoints, allegro.pl plus allegro.cz, allegro.sk and
// allegro.hu on every endpoint, 2 credits each.
//
// Every endpoint takes country (pl when omitted on the server). offer() takes
// offer_id or url; product() and productOffers() take product_id or url;
// category() takes category_id or url. buying_format and deals are pl only
// (a 400 on cz, sk and hu). The server enforces these. Titles, parameters and
// labels come back in the site's language (Polish on pl). sk and hu calls can
// take up to about a minute, so every call raises the request timeout to
// ALLEGRO_TIMEOUT when the client's is shorter. Failed upstream calls are not
// charged; a not-found is a charged 404.

/** Minimum request timeout (ms) for every allegro call. */
export const ALLEGRO_TIMEOUT = 120_000;

/**
 * Markets: pl (allegro.pl, PLN, Polish, default), cz (allegro.cz, CZK,
 * Czech), sk (allegro.sk, EUR, Slovak), hu (allegro.hu, HUF, Hungarian).
 * Titles come in the site's language, prices in its currency.
 */
export type AllegroCountry = "pl" | "cz" | "sk" | "hu";

/**
 * Listing sorts; relevance is the default. ending_soonest puts the auctions
 * that end first on top. Sponsored slots are not sorted; where the site shows
 * promoted offers as their own block, each block is in sort order.
 */
export type AllegroSort =
  | "relevance"
  | "price_low_to_high"
  | "price_high_to_low"
  | "price_with_delivery_low_to_high"
  | "price_with_delivery_high_to_low"
  | "popularity"
  | "ending_soonest"
  | "newest";

/** productOffers() sorts: the listing sorts without ending_soonest and newest. */
export type AllegroOfferSort = Exclude<AllegroSort, "ending_soonest" | "newest">;

/** Price, condition and Allegro Smart! filters, on every listing endpoint. */
export interface AllegroPriceConditionOptions {
  /** Lowest price, in the site's currency. */
  min_price?: number;
  /** Highest price, in the site's currency. */
  max_price?: number;
  /** new or used. */
  condition?: "new" | "used";
  /** Only offers with Allegro Smart! (free delivery and returns for members). */
  smart?: boolean;
}

/** Paging, sort and filters shared by search(), seller() and category(). */
export interface AllegroGridOptions extends AllegroPriceConditionOptions {
  /** pl (default), cz, sk or hu. */
  country?: AllegroCountry;
  /** Results page, 1-based (up to 100). 60 organic offers per page; sponsored slots come on top. */
  page?: number;
  /** relevance (default), price_low_to_high, price_high_to_low, price_with_delivery_low_to_high, price_with_delivery_high_to_low, popularity, ending_soonest or newest. */
  sort?: AllegroSort;
  /** pl only: buy_now (fixed price) or auction. */
  buying_format?: "buy_now" | "auction";
  /** pl only: only offers in Allegro's deals and promotions zone (seasonal campaign deals such as Black Weeks included while they run). */
  deals?: boolean;
}

export interface AllegroSearchOptions extends AllegroGridOptions {
  /** Search keywords, in any language, e.g. "laptop" or "buty nike". Misspellings are not corrected. */
  query: string;
  /** Search inside one category: a category id (category.id or breadcrumb[].id of an offer, e.g. 491 = laptops) or its slug (laptopy-491). */
  category_id?: string | number;
  [key: string]: unknown;
}

/** Pass offer_id or url. */
export interface AllegroOfferOptions {
  /** An offer number: items[].offer_id of a search, category or seller answer, e.g. "17858046919". */
  offer_id?: string | number;
  /** An offer link (allegro.pl/oferta/..., or a product link with ?offerId=; any of the four sites). Alternative to offer_id. */
  url?: string;
  /** pl (default), cz, sk or hu. */
  country?: AllegroCountry;
  [key: string]: unknown;
}

/** Pass product_id or url. */
export interface AllegroProductOptions {
  /** A catalogue product id (a uuid): items[].product_id of a search or product_id of an offer, e.g. "90d08230-e02a-4210-913d-d417453321b8". */
  product_id?: string;
  /** A product link (allegro.pl/produkt/..., any of the four sites). Alternative to product_id. */
  url?: string;
  /** pl (default), cz, sk or hu. */
  country?: AllegroCountry;
  [key: string]: unknown;
}

/** Pass product_id or url. */
export interface AllegroProductOffersOptions extends AllegroProductOptions, AllegroPriceConditionOptions {
  /** Results page, 1-based (up to 100). 60 offers per page. */
  page?: number;
  /** relevance (default), price_low_to_high, price_high_to_low, price_with_delivery_low_to_high, price_with_delivery_high_to_low or popularity. */
  sort?: AllegroOfferSort;
}

export interface AllegroSellerOptions extends AllegroGridOptions {
  /** A seller login: items[].seller.login of a search or seller.login of an offer, e.g. "Yupilo_pl". */
  login: string;
  /** Search within the seller's offers. */
  query?: string;
  /** Only one of the seller's categories: categories[].slug of a previous seller() answer (e.g. "komputery"). */
  category?: string;
  [key: string]: unknown;
}

export interface AllegroSellerFeedbackOptions {
  /** A seller login, e.g. "Yupilo_pl". */
  login: string;
  /** pl (default), cz, sk or hu. */
  country?: AllegroCountry;
  /** Ratings page, 1-based (up to 500). 20 ratings per page, newest first. */
  page?: number;
  [key: string]: unknown;
}

/** Pass category_id or url. */
export interface AllegroCategoryOptions extends AllegroGridOptions {
  /** A category id (e.g. 491 = laptops) or its slug (laptopy-491): breadcrumb[].id of an offer or subcategories[].id of a category answer. */
  category_id?: string | number;
  /** A category link (allegro.pl/kategoria/..., any of the four sites), e.g. "https://allegro.pl/kategoria/laptopy-491". */
  url?: string;
  /** Search within the category. */
  query?: string;
  [key: string]: unknown;
}

export class AllegroNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/allegro/${path}`, options, undefined, ALLEGRO_TIMEOUT);
  }

  /**
   * Search Allegro, the largest marketplace in Poland and Central Europe, by
   * keyword: sort by price, price with delivery, popularity, ending soonest
   * or newest; filter by price range, new or used, buy now or auction (pl),
   * Allegro Smart! and deals (pl); optionally inside one category. Items
   * carry offer_id, product_id, title, url, image, price and currency,
   * buy_now_price, price_with_delivery, free_delivery, delivery_text,
   * condition, is_auction with auction_ends_in, discount_percent and
   * lowest_price_30d (the EU disclosure shown next to a discount: the lowest
   * price in the 30 days before it; null without a discount, not a price
   * history), seller (id, login, super_seller, positive_feedback_percent,
   * is_business), rating, rating_count, sold_count (null on auctions) with
   * sold_label, smart, offers_count, stock, placement (regular, promoted,
   * sponsored or featured) with is_sponsored, and source (allegro_lokalnie
   * for Allegro Lokalnie offers inside pl results). Also total (exact),
   * total_pages (at most 100), page, page_size (60), sort, applied_filters,
   * facets, country, language and currency.
   *
   * Costs 2 credits.
   */
  async search(options: AllegroSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Allegro offer (one seller's listing) by number or link: title,
   * condition, status, price, original_price and lowest_price_30d with
   * discount_percent on a discount, price_with_delivery, stock, sold_count
   * (null on auctions and on cz, sk and hu offers), auction state (current
   * price, minimum next bid, bid step, end time, whether anyone has bid; no
   * bid history) or buy now price, every parameter, gtin, brand, the
   * description as plain text, images, breadcrumb, delivery methods with
   * price and estimated delivery, handling time, returns, warranty, the
   * product's rating and offer count, and the seller (login, super seller,
   * positive feedback percent and counts, is_business, company_name for
   * business sellers). A not-found is a 404 (charged).
   *
   * Costs 2 credits.
   */
  async offer(options: AllegroOfferOptions): Promise<Record<string, unknown>> {
    return this.post("offer", options);
  }

  /**
   * One Allegro catalogue product (one item that groups many sellers'
   * offers) by id or link: title, brand, GTIN, parameters, images,
   * breadcrumb, description, lowest_price and offer_count (every seller's
   * offer is on productOffers()), the cheapest and fastest offers as the
   * page highlights them, the featured (buy box) offer, how many people
   * bought it recently, the rating with its 1-5 star distribution, review
   * aspects and the first 20 reviews as shown on the product page (not the
   * full review history).
   *
   * Costs 2 credits.
   */
  async product(options: AllegroProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Every seller's offer for one Allegro catalogue product (the price
   * comparison page, for price monitoring across sellers), 60 per page,
   * sortable by price or price with delivery and filterable by condition,
   * price and Allegro Smart!. Each offer has price, price_with_delivery,
   * delivery_text, condition, seller, smart, stock where shown, is_featured
   * (the buy box offer) and the listing fields of search(). Also total,
   * total_pages, page and facets.
   *
   * Costs 2 credits.
   */
  async productOffers(options: AllegroProductOffersOptions): Promise<Record<string, unknown>> {
    return this.post("product-offers", options);
  }

  /**
   * One Allegro seller's offers by login, with the seller (id, login,
   * is_business, url), whether the seller is active and the categories the
   * seller sells in (with offer counts and a slug for category); search
   * within the seller's offers with the search sorts and filters. The super
   * seller status, feedback score and member since are on sellerFeedback().
   * No seller address or tax id.
   *
   * Costs 2 credits.
   */
  async seller(options: AllegroSellerOptions): Promise<Record<string, unknown>> {
    return this.post("seller", options);
  }

  /**
   * One Allegro seller's buyer ratings: summary (recommended and not
   * recommended counts, positive_percent, received, excluded and removed
   * ratings, member_since, super_seller) and 20 ratings per page, newest
   * first, each with recommended yes / no, comment, the reasons given, date,
   * the offers rated, and whether it was excluded from the score. No buyer
   * identity is returned.
   *
   * Costs 2 credits.
   */
  async sellerFeedback(options: AllegroSellerFeedbackOptions): Promise<Record<string, unknown>> {
    return this.post("seller-feedback", options);
  }

  /**
   * One Allegro category's offers by id or link, with the same sorts and
   * filters as search() and an optional query, plus the category (id, name,
   * url, breadcrumb, subcategories or sibling categories with offer counts).
   *
   * Costs 2 credits.
   */
  async category(options: AllegroCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }
}
