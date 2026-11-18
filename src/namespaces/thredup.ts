import type { Scavio } from "../client.js";

// thredUP: 12 endpoints, 1 credit each.
//
// One store: thredUP's US store (thredup.com, English, USD; thredUP ships to
// the US and Canada from it), so there is no country option.
//
// estimated_retail is the estimated original retail: thredUP's own estimate on
// items thredUP prices, entered by the seller on Direct Listing items.
// percent_off is computed from the price and the estimated retail
// (round((1 - price / estimated_retail) * 100)), null when the estimated retail
// is missing or not above the price. seller_type is thredup, direct_listing
// (peer sellers) or dropship (partner listings); status is available,
// reserved or sold.
//
// List endpoints answer 119 items per page, pages 1 to 21 (about 2,500 items
// per query and filter combination); total caps at 10,000 (total_capped true
// means 10,000+). Free text is matched loosely (semantic): use brand for one
// brand. size takes sizing ids from categories(), not labels; condition,
// color and material take up to 5 values. The price filter is approximate
// (thredUP matches a base price). Every answer reports the sort applied. Sold
// listings take filters only (brand and / or category, no query), with the
// price the item last listed at and no sold date. thredUP has no men's
// department. Not available: product reviews (thredUP shows none), seller
// shops, sold dates, men's clothing, price history. No seller or consignor
// names or ids are returned.
//
// The server enforces the cross-field rules: product() and similar() take one
// of item_number or url; sold() needs brand or category; deals() new_arrivals
// and price_drops take no sort and under_10 takes no price range; brands()
// takes query or letter, not both. Every call raises the request timeout to
// THREDUP_TIMEOUT. Failed upstream calls are not charged; a not-found is
// charged.

/** Minimum request timeout (ms) for every thredup call: list pages take 15 to 45 s and are retried server-side. */
export const THREDUP_TIMEOUT = 240_000;

/** thredUP departments (default women). thredUP has no men's department. */
export type ThredupDepartment =
  | "women" | "girls" | "boys" | "handbags" | "shoes" | "designer" | "plus" | "juniors" | "maternity" | "accessories";

/** Departments of suggestions() and trending(): women (default), girls or boys. */
export type ThredupAssortment = "women" | "girls" | "boys";

/** default (the page's own order; the answer's sort says which), recommended, relevance, newest, price_high, price_low, price_drop (recently discounted). */
export type ThredupSort = "default" | "recommended" | "relevance" | "newest" | "price_high" | "price_low" | "price_drop";

/** flawed = thredUP's Flawed Gems. */
export type ThredupCondition = "new_with_tags" | "excellent" | "very_good" | "good" | "flawed";

/** thredup (thredUP prices and ships), direct_listing (Direct Listings: private sellers), dropship (partner listings). */
export type ThredupSellerType = "thredup" | "direct_listing" | "dropship";

/** clearance, under_10 (Under $10, matched on the base price), new_arrivals (newest first), price_drops (recently discounted first). */
export type ThredupCollection = "clearance" | "under_10" | "new_arrivals" | "price_drops";

/** thredUP colour filter values. */
export type ThredupColor =
  | "black" | "grey" | "white" | "ivory" | "tan" | "brown" | "purple" | "blue" | "teal" | "green" | "red"
  | "pink" | "orange" | "yellow";

/** thredUP material groups. */
export type ThredupMaterial =
  | "natural" | "cashmere" | "cotton" | "linen" | "silk" | "wool" | "leather" | "suede" | "blend"
  | "cashmere blend" | "cotton blend" | "linen blend" | "silk blend" | "wool blend" | "synthetic"
  | "acrylic" | "faux fur" | "nylon" | "polyester" | "rayon" | "spandex" | "vegan leather";

/** thredUP pattern values. */
export type ThredupPattern =
  | "animal print" | "argyle" | "camo" | "checkered-gingham" | "chevron-herringbone" | "color block"
  | "floral" | "graphic" | "hearts" | "houndstooth" | "metallic" | "paisley" | "plaid" | "polka dots"
  | "print" | "solid" | "stars" | "stripes" | "tie-dye" | "tropical" | "tweed";

export interface ThredupFilterOptions {
  /** Department. Defaults to "women". */
  department?: ThredupDepartment;
  /** Category tag from categories() (categories[].category), e.g. "dresses", "jeans", "outerwear". */
  category?: string;
  /** Sizing ids from categories() (sizes[].size, e.g. 20778 = women's Small tops), up to 10. Ids, not labels. */
  size?: number | string | Array<number | string>;
  /** Conditions, up to 5. */
  condition?: ThredupCondition | ThredupCondition[];
  /** Colours, up to 5. */
  color?: ThredupColor | ThredupColor[];
  /** Material groups, up to 5. */
  material?: ThredupMaterial | ThredupMaterial[];
  /** One pattern. */
  pattern?: ThredupPattern;
  /** Lowest price, whole USD. Approximate: thredUP matches a base price. */
  price_min?: number;
  /** Highest price, whole USD (approximate). */
  price_max?: number;
  /** Only clearance items. */
  clearance?: boolean;
  /** Who sells (default all three). */
  seller_type?: ThredupSellerType | ThredupSellerType[];
  /** Sort; every answer reports the sort applied. */
  sort?: ThredupSort;
  /** Page, 1 to 21, 119 items each. */
  page?: number;
}

export interface ThredupSearchOptions extends ThredupFilterOptions {
  /** Search text, e.g. "denim jacket". Semantic: use brand for one brand. */
  query: string;
  /** Brand as thredUP writes it (items[].brand, brands()), e.g. "Patagonia". */
  brand?: string;
  [key: string]: unknown;
}

export interface ThredupSoldOptions extends ThredupFilterOptions {
  /** Brand as thredUP writes it. Send brand and / or category: sold takes no query. */
  brand?: string;
  [key: string]: unknown;
}

export interface ThredupItemOptions {
  /** thredUP item number (items[].item_number; the number at the end of a thredup.com/product/... link), e.g. 241601590. One of item_number or url. */
  item_number?: number | string;
  /** A thredup.com item link (https://www.thredup.com/product/<slug>/<item number>). */
  url?: string;
  [key: string]: unknown;
}

export interface ThredupCategoryOptions extends ThredupFilterOptions {
  /** Department (required). */
  department: ThredupDepartment;
  /** Category tag from categories() (required), e.g. "dresses". */
  category: string;
  /** Brand as thredUP writes it. */
  brand?: string;
  [key: string]: unknown;
}

export interface ThredupBrandOptions extends ThredupFilterOptions {
  /** Brand as thredUP writes it (brands()[].brand, items[].brand), e.g. "Madewell". An unknown brand answers 0 items. */
  brand: string;
  [key: string]: unknown;
}

export interface ThredupDealsOptions extends ThredupFilterOptions {
  /** clearance, under_10, new_arrivals or price_drops. */
  collection: ThredupCollection;
  /** Brand as thredUP writes it. */
  brand?: string;
  /** Only for clearance and under_10 (new_arrivals and price_drops are sorts themselves). */
  sort?: ThredupSort;
  [key: string]: unknown;
}

export interface ThredupDepartmentOptions {
  /** Department. Defaults to "women". */
  department?: ThredupDepartment;
  [key: string]: unknown;
}

export interface ThredupBrandsOptions extends ThredupDepartmentOptions {
  /** Brands matching a term, e.g. "coach". Not with letter. */
  query?: string;
  /** Every brand under one letter, A-Z. Not with query. */
  letter?: string;
  /** Page of a letter or query answer, 1 to 1000. */
  page?: number;
  /** Brands per page, 1 to 500 (default 100). */
  limit?: number;
}

export interface ThredupTrendingOptions {
  /** women (default), girls or boys. */
  department?: ThredupAssortment;
  [key: string]: unknown;
}

export interface ThredupSuggestionsOptions extends ThredupTrendingOptions {
  /** What the shopper has typed so far, e.g. "made". */
  query: string;
}

export class ThredupNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/thredup/${path}`, options, undefined, THREDUP_TIMEOUT);
  }

  /**
   * Search thredUP's US store, 119 items per page up to page 21 (about 2,500
   * per query): sort (applied), filters, page, page_size, total (caps at
   * 10,000; total_capped), has_more, count, currency, items (item_number, url,
   * title, brand, category, department, size, condition, price,
   * estimated_retail, percent_off, promo, clearance, final_sale, seller_type,
   * status, colors, materials, pictures, favorite_count). Free text is
   * semantic: use brand for one brand.
   *
   * Costs 1 credit.
   */
  async search(options: ThredupSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * Sold listings by filters only (brand and / or category, no query): every
   * item status sold, price is the price the item last listed at. thredUP
   * shows no sold date.
   *
   * Costs 1 credit.
   */
  async sold(options: ThredupSoldOptions): Promise<Record<string, unknown>> {
    return this.post("sold", options);
  }

  /**
   * One item in full by item_number or link: price, estimated_retail,
   * percent_off, condition, condition_notes (the flaws thredUP noted),
   * size_detail, measurements, characteristics, materials, pictures,
   * authentication, direct_listing {shipping_cost, shipping_covered,
   * buyer_protection_price, on_vacation} (Direct Listings only),
   * similar_brands. Sold items still answer. No seller names or ids.
   *
   * Costs 1 credit.
   */
  async product(options: ThredupItemOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * One department's category (department and category tag required),
   * filtered and sorted as search.
   *
   * Costs 1 credit.
   */
  async category(options: ThredupCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One brand's items in a department (default women). An unknown brand
   * answers 0 items.
   *
   * Costs 1 credit.
   */
  async brand(options: ThredupBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * Deal collections: clearance, under_10 (Under $10, matched on the base
   * price), new_arrivals (newest first), price_drops (recently discounted
   * first), with the usual filters.
   *
   * Costs 1 credit.
   */
  async deals(options: ThredupDealsOptions): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * Rescue boxes (mystery bundles of items): count, available_count,
   * currency, boxes (id, name, description, available, sizes, picture_url,
   * bundles {items, price, currency, state (listed = on sale now), sizes}).
   *
   * Costs 1 credit.
   */
  async rescueBoxes(options: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.post("rescue-boxes", options);
  }

  /**
   * One department's categories and filter values (default women):
   * categories {name, category}, other_departments, sizes {group, label,
   * long_label, size (the sizing id)}, conditions, colors, materials,
   * patterns, price_ranges.
   *
   * Costs 1 credit.
   */
  async categories(options: ThredupDepartmentOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * The brand directory per department: query (brands matching a term),
   * letter (every brand under a letter, paged) or neither (the letter
   * groups, 50 brands each). brands {id, name, brand (the brand input)}.
   *
   * Costs 1 credit.
   */
  async brands(options: ThredupBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /**
   * Search suggestions for a partial query (women, girls or boys): each
   * {text, query, department, brand, category, free_text} is a ready filter
   * set for search().
   *
   * Costs 1 credit.
   */
  async suggestions(options: ThredupSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Trending searches for women (default), girls or boys: searches {text,
   * query, department, brand, category, free_text}.
   *
   * Costs 1 credit.
   */
  async trending(options: ThredupTrendingOptions = {}): Promise<Record<string, unknown>> {
    return this.post("trending", options);
  }

  /**
   * The first 120 items thredUP shows as similar to one item (by item_number
   * or link; no paging). An unknown item is a charged 404.
   *
   * Costs 1 credit.
   */
  async similar(options: ThredupItemOptions): Promise<Record<string, unknown>> {
    return this.post("similar", options);
  }
}
