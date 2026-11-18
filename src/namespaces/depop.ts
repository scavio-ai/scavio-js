import type { Scavio } from "../client.js";

// Depop: 14 endpoints.
//
// Markets (country, the buyer's country, default "us"): us (USD), gb (GBP;
// "uk" accepted), au (AUD), ie (EUR), ca (CAD), nz (NZD), de (EUR), fr (EUR),
// it (EUR). search, product, category, brand, explore and suggestions serve
// all nine; similar is us only; shop, shopProducts, shopSold, shopReviews,
// shopsSearch, categories and brands are global (no country). Any other
// country answers 400 before anything is charged.
//
// Credits: search, category, brand and explore 1 (5 on nz); product 1 on us,
// 2 on gb, au, ie, ca, de, fr, it and 6 on nz; everything else 1.
// credits_used in the response is the exact charge.
//
// search, category, brand and explore return the first 24 results per query:
// Depop serves no next page, so narrow with filters, sort or a price range.
// Sorts are relevance, price_asc and price_desc (newest and most popular are
// not available). Prices are numbers for a buyer in the market as Depop shows
// them: price, original_price, buyer_fee, tax (tax_type), shipping
// (shipping_boundary), total and headline_price. price.currency is the
// listing's currency, usually the market's (some sellers list in another
// one). Listing ids are global: the same listing priced from another market
// adds that buyer's fee, tax and shipping. On us, Depop returns a buyer fee on
// some calls and not on others for the same listing. Depop has no keyword
// search of sold listings: sold prices come per shop from shopSold(), and
// Depop shows no sale date (updated_at is the listing's last update). Depop's
// interface is English in every storefront; titles and descriptions are what
// sellers wrote (often German, French or Italian on de, fr, it). Not
// available: results past the first 24, keyword sold search, trending
// searches, views, join date, Top Seller badge, offers / bundles, price
// history, similar outside us.
//
// The server enforces the cross-field rules: product() takes one of slug, url
// or product_id; the shop endpoints one of username or shop_id; brands() one
// of letter or slug. Every call raises the request timeout to DEPOP_TIMEOUT.
// Failed upstream calls are not charged; a not-found is charged.

/** Minimum request timeout (ms) for every depop call: storefront pages can take up to about a minute and are retried server-side. */
export const DEPOP_TIMEOUT = 240_000;

/** Buyer market: us (default), gb (or uk), au, ie, ca, nz, de, fr, it. */
export type DepopCountry = "us" | "gb" | "uk" | "au" | "ie" | "ca" | "nz" | "de" | "fr" | "it";

/** relevance (default), price_asc, price_desc. */
export type DepopSort = "relevance" | "price_asc" | "price_desc";

/** Listing condition. */
export type DepopCondition = "brand_new" | "used_like_new" | "used_excellent" | "used_good" | "used_fair";

/** Depop colour ids. */
export type DepopColor =
  | "black" | "blue" | "brown" | "burgundy" | "cream" | "gold" | "green" | "grey" | "khaki" | "multi"
  | "navy" | "orange" | "pink" | "purple" | "red" | "silver" | "tan" | "white" | "yellow";

/** male, female, unisex. */
export type DepopGender = "male" | "female" | "unisex";

/** Category name language: en (default), en-US, de, fr, it. */
export type DepopLanguage = "en" | "en-US" | "de" | "fr" | "it";

/** seller (default: reviews from buyers) or buyer (reviews from sellers). */
export type DepopReviewRole = "seller" | "buyer";

type Id = string | number;

export interface DepopFilterOptions {
  /** Buyer market. Defaults to "us". */
  country?: DepopCountry;
  /** relevance (default), price_asc, price_desc. price sorts return Depop's first 24 for that order, in strict listing-price order. */
  sort?: DepopSort;
  /** Brand ids (brands[].id of brands(), items[].brand.id), up to 20, e.g. [1673] Carhartt. */
  brand_ids?: Id[] | string;
  /** One or more conditions. */
  conditions?: DepopCondition[] | string;
  /** One or more colours. */
  colors?: DepopColor[] | string;
  /** Lowest listing price, in the market's currency. */
  price_min?: number;
  /** Highest listing price, in the market's currency. */
  price_max?: number;
  /** Only listings the seller marked down (items[].discounted). */
  on_sale?: boolean;
  /** male, female, unisex. */
  gender?: DepopGender;
  /** Size filter values (size_set_id.size_id, from categories({ include_sizes: true })), e.g. "4.15". Depop honours it only partly. */
  size?: string[] | string;
  /** Group id from categories() (tops, bottoms, footwear ...). */
  group?: string;
  /** Product type ids from categories() (jeans, hoodies ...). */
  product_type?: string[] | string;
  /** Only kids' listings (true) or none (false). */
  kids?: boolean;
}

export interface DepopSearchOptions extends DepopFilterOptions {
  /** Search keywords, e.g. "levis 501". */
  query: string;
  [key: string]: unknown;
}

export interface DepopProductOptions {
  /** Listing slug (items[].slug), e.g. "f0omem-levis-550-38x36-blue-jeans-662f". One of slug, url or product_id. */
  slug?: string;
  /** A depop.com product link (https://www.depop.com/products/<slug>/); the market is country, not the link. */
  url?: string;
  /** Product id (items[].product_id), e.g. 1002884801. */
  product_id?: Id;
  /** Buyer market. Defaults to "us". */
  country?: DepopCountry;
  [key: string]: unknown;
}

export interface DepopCategoryOptions extends DepopFilterOptions {
  /** Category path department[/group[/product_type]] (mens, womens, kids, everything-else), e.g. "mens/bottoms/jeans". */
  category: string | string[];
  [key: string]: unknown;
}

export interface DepopBrandOptions extends Omit<DepopFilterOptions, "brand_ids"> {
  /** Brand slug (brands[].slug, items[].brand.slug), e.g. "carhartt", "levi-s", "nike". */
  slug: string;
  [key: string]: unknown;
}

export interface DepopExploreOptions {
  /** Explore page slug (depop.com/explore/<slug>/), e.g. "90s-menswear". Every answer lists the market's other pages in more_slugs. */
  slug: string;
  /** Buyer market. Defaults to "us". */
  country?: DepopCountry;
  [key: string]: unknown;
}

export interface DepopSuggestionsOptions {
  /** What the shopper has typed so far, e.g. "carh". */
  query: string;
  /** Buyer market. Defaults to "us". */
  country?: DepopCountry;
  [key: string]: unknown;
}

export interface DepopShopOptions {
  /** Shop username (depop.com/<username>/), e.g. "flomem". One of username or shop_id. */
  username?: string;
  /** Shop id (shop_id of shop(), seller.id of product()), e.g. 46847613. */
  shop_id?: Id;
  [key: string]: unknown;
}

export interface DepopShopListOptions extends DepopShopOptions {
  /** next_cursor of the previous page. */
  cursor?: string;
  /** Listings per page, 1 to 24 (default 24). */
  limit?: number;
}

export interface DepopShopReviewsOptions extends DepopShopOptions {
  /** seller (default: reviews the shop got from buyers) or buyer (reviews it got from sellers). */
  role?: DepopReviewRole;
  /** Page, 1-based (up to 200), 24 reviews each. */
  page?: number;
}

export interface DepopShopsSearchOptions {
  /** Part of a shop username, e.g. "y2k". */
  query: string;
  [key: string]: unknown;
}

export interface DepopCategoriesOptions {
  /** Names of groups and product types: en (default), en-US, de, fr, it. Department names stay English. */
  language?: DepopLanguage;
  /** Add size_sets (size systems and their size filter values). Larger answer. */
  include_sizes?: boolean;
  [key: string]: unknown;
}

export interface DepopBrandsOptions {
  /** First letter a-z, or 0-9 for brands starting with a digit or symbol. One of letter or slug. */
  letter?: string;
  /** One brand by slug (with its description). */
  slug?: string;
  [key: string]: unknown;
}

export interface DepopSimilarOptions {
  /** Product id (items[].product_id), e.g. 1002884801. */
  product_id: Id;
  /** us only. */
  country?: "us";
  [key: string]: unknown;
}

export class DepopNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/depop/${path}`, options, undefined, DEPOP_TIMEOUT);
  }

  /**
   * Search listings for sale in one buyer market: the first 24 results per
   * query (Depop serves no next page). items (product_id, slug, url, title,
   * description, brand, category, group, product_type, status,
   * seller_country, pictures, picture_count, sizes, condition, colors,
   * gender, kids, like_count, boosted, discounted, discount_percentage,
   * price), count, total_count (approximate), facets, country, currency,
   * sort, filters. All 9 markets.
   *
   * Costs 1 credit (5 on nz).
   */
  async search(options: DepopSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One listing by slug, link or product_id, priced for a buyer in the
   * market: description, hashtags, brand, category with breadcrumbs,
   * condition, colors, sizes, shipping, discount, price (buyer market:
   * buyer_fee, tax, shipping, total), listing_price (the seller's own currency
   * and price) and seller (username, verified, country, reviews_rating,
   * reviews_total, items_sold, last_seen, average_shipping_days). All 9
   * markets.
   *
   * Costs 1 credit on us, 2 on gb, au, ie, ca, de, fr, it and 6 on nz.
   */
  async product(options: DepopProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The first 24 listings of one category path (from categories(), e.g.
   * "mens/bottoms/jeans") in a buyer market, sorted and filtered as search.
   * All 9 markets.
   *
   * Costs 1 credit (5 on nz).
   */
  async category(options: DepopCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The first 24 listings of one brand (slug from brands()) in a buyer
   * market, with brand (id, name, slug). An unknown brand is a charged 404.
   * All 9 markets.
   *
   * Costs 1 credit (5 on nz).
   */
  async brand(options: DepopBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * One of Depop's curated explore pages (e.g. "90s-menswear"): title,
   * search_query, the first 24 listings, total_count and more_slugs (the
   * market's other explore pages). An unknown page is a charged 404. All 9
   * markets.
   *
   * Costs 1 credit (5 on nz).
   */
  async explore(options: DepopExploreOptions): Promise<Record<string, unknown>> {
    return this.post("explore", options);
  }

  /**
   * Search suggestions for a partial query, ranked for a buyer market:
   * suggestions (text, group, gender, filter_label), count. All 9 markets.
   *
   * Costs 1 credit.
   */
  async suggestions(options: DepopSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * A shop (seller) by username or shop_id: bio, verified, followers,
   * following, reviews_rating, reviews_total, seller_ratings, buyer_ratings,
   * items_sold, last_seen, category_counts. No real names, join date or Top
   * Seller badge. An unknown shop is a charged 404. Global.
   *
   * Costs 1 credit.
   */
  async shop(options: DepopShopOptions): Promise<Record<string, unknown>> {
    return this.post("shop", options);
  }

  /**
   * A shop's listings for sale, cursor-paged (up to 24 per page), with
   * created_at and updated_at; has_more and next_cursor. Prices in the
   * seller's listing currency. Global.
   *
   * Costs 1 credit per page.
   */
  async shopProducts(options: DepopShopListOptions): Promise<Record<string, unknown>> {
    return this.post("shop-products", options);
  }

  /**
   * A shop's sold listings with the price they sold at (price,
   * original_price, discounted, discount_percentage), cursor-paged (up to 24
   * per page). Depop shows no sale date: updated_at is the listing's last
   * update. Depop's only sold data: there is no keyword sold search. Global.
   *
   * Costs 1 credit per page.
   */
  async shopSold(options: DepopShopListOptions): Promise<Record<string, unknown>> {
    return this.post("shop-sold", options);
  }

  /**
   * Reviews a shop received as a seller (role "seller", default) or as a
   * buyer (role "buyer"), 24 per page: date, rating, text, product
   * (product_id, image). No reviewer names. Global.
   *
   * Costs 1 credit per page.
   */
  async shopReviews(options: DepopShopReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("shop-reviews", options);
  }

  /**
   * Shops whose username matches a query: shops (shop_id, username, url),
   * count. Use shop() for ratings and items sold. Global.
   *
   * Costs 1 credit.
   */
  async shopsSearch(options: DepopShopsSearchOptions): Promise<Record<string, unknown>> {
    return this.post("shops-search", options);
  }

  /**
   * The category tree: departments > groups > product_types (id, name, path).
   * path feeds category(); group and product type ids feed the search
   * filters. Names in en, en-US, de, fr or it; include_sizes adds size_sets.
   * Global.
   *
   * Costs 1 credit.
   */
  async categories(options: DepopCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * Brands by first letter (brands: id, name, slug), or one brand by slug
   * with its description. slug feeds brand(), id the brand_ids filter. An
   * unknown slug is a charged 404. Global.
   *
   * Costs 1 credit.
   */
  async brands(options: DepopBrandsOptions): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /**
   * Listings Depop shows as similar to one listing, for a US buyer, with
   * created_at and updated_at. us only.
   *
   * Costs 1 credit.
   */
  async similar(options: DepopSimilarOptions): Promise<Record<string, unknown>> {
    return this.post("similar", options);
  }
}
