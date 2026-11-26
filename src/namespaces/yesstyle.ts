import type { Scavio } from "../client.js";

// YesStyle (yesstyle.com, the Hong Kong-based online store for Asian beauty and fashion) search,
// category, brand, brands, deals, product, reviews, suggestions and markets endpoints; prices set
// per shipping country (39 countries); listings and product 2 credits, product with variants 3, the
// rest 1. Generated from the backend routes: every option and its doc mirrors the API's own request
// schema; an input the API only accepts to refuse (a 400 that says 'not offered') is left out. The
// server enforces the value rules and the one-of rules (send one of an id or a link). Every call
// raises the request timeout to YESSTYLE_TIMEOUT and never lowers a longer client timeout. Failed
// upstream calls and refused inputs are not charged; a not-found is charged (credits_used is what
// was charged).

/** Minimum request timeout (ms) for every yesstyle call. */
export const YESSTYLE_TIMEOUT = 240_000;

export interface YesstyleSearchOptions {
  /** Keywords or a brand name (required). */
  query: string;
  /**
   * A department id (category ids from breadcrumbs or category, e.g. 15478 Beauty, 15544 Skin
   * Care).
   */
  department?: string | number;
  /**
   * Shipping country, ISO-2 lower case (default us; uk is read as gb). YesStyle prices and stocks
   * by shipping country: 39 countries are served here: ae, at, au, be, ca, ch, cl, cz, de, dk, es,
   * fr, gb, gr, hk, hu, ie, il, in, it, jp, kr, kz, mx, my, nl, no, nz, ph, pl, pt, ro, sa, se, sg,
   * th, tw, us, za. Brazil is held back. Others answer 400 before anything is charged.
   */
  country?: string;
  /**
   * Page language: en, fr, de, es, it, nl, pl, pt, ru, ar, zh_TW (default: the country's own on
   * YesStyle, e.g. de for Germany, ar for Saudi Arabia, zh_TW for Taiwan and Hong Kong, en for
   * most).
   */
  language?: string;
  /** Page, 1-based (100 products a page; default 1). */
  page?: number;
  /**
   * bestsellers (default), newest, price_low_to_high, price_high_to_low, best_value, availability,
   * discount.
   */
  sort?: "bestsellers" | "newest" | "price_low_to_high" | "price_high_to_low" | "best_value" | "availability" | "discount";
  /**
   * YesStyle's Featured filters: in_stock, just_arrived, new_this_week, trending_new, flash_sales,
   * black_friday, clearance, rock_bottom_prices, price_drop, new_items_24hr_sale, value_gift_sets,
   * twin_packs_bundles, mini_travel_sizes, mini_size_exclusives, korean_brands, japanese_brands,
   * chinese_cosmetics, southeast_asian_beauty, western_beauty, korean_pharmacy, cruelty_free,
   * vegan, yesstyle_awards_2026, or Featured ids from facets (key oc).
   */
  featured?: string | string[];
  /** Lowest price, whole units of the country's currency. */
  min_price?: number;
  /** Highest price, whole units of the country's currency. */
  max_price?: number;
  /**
   * Any other facet: {key, value} from facets[].key and facets[].values[].value (e.g. stp skin
   * type, scrn skin concern, si size, cf color family). At most 12 filter values in all.
   */
  filters?: Array<{ key: string; value: string | string[] }>;
  /**
   * Also return facets [{name, type, key, values [{value, name, selected}]}], price_range and
   * sorts.
   */
  include_facets?: boolean;
  /**
   * A category filter: YesStyle's search does not apply it, so it is refused here (400). Use
   * category, brand or deals.
   */
  type?: string;
  /**
   * A category filter: YesStyle's search does not apply it, so it is refused here (400). Use
   * category, brand or deals.
   */
  region?: string;
  /**
   * A category filter: YesStyle's search does not apply it, so it is refused here (400). Use
   * category, brand or deals.
   */
  ingredients?: string;
  [key: string]: unknown;
}

export interface YesstyleCategoryOptions {
  /**
   * A category id (e.g. 15556 Face Serums, from breadcrumbs, category or a link's bcc.<id>_bpt.46)
   * or a category link.
   */
  category: string | number;
  /**
   * Shipping country, ISO-2 lower case (default us; uk is read as gb). YesStyle prices and stocks
   * by shipping country: 39 countries are served here: ae, at, au, be, ca, ch, cl, cz, de, dk, es,
   * fr, gb, gr, hk, hu, ie, il, in, it, jp, kr, kz, mx, my, nl, no, nz, ph, pl, pt, ro, sa, se, sg,
   * th, tw, us, za. Brazil is held back. Others answer 400 before anything is charged.
   */
  country?: string;
  /**
   * Page language: en, fr, de, es, it, nl, pl, pt, ru, ar, zh_TW (default: the country's own on
   * YesStyle, e.g. de for Germany, ar for Saudi Arabia, zh_TW for Taiwan and Hong Kong, en for
   * most).
   */
  language?: string;
  /** Page, 1-based (100 products a page; default 1). */
  page?: number;
  /**
   * bestsellers (default), newest, price_low_to_high, price_high_to_low, best_value, availability,
   * discount.
   */
  sort?: "bestsellers" | "newest" | "price_low_to_high" | "price_high_to_low" | "best_value" | "availability" | "discount";
  /**
   * YesStyle's Featured filters: in_stock, just_arrived, new_this_week, trending_new, flash_sales,
   * black_friday, clearance, rock_bottom_prices, price_drop, new_items_24hr_sale, value_gift_sets,
   * twin_packs_bundles, mini_travel_sizes, mini_size_exclusives, korean_brands, japanese_brands,
   * chinese_cosmetics, southeast_asian_beauty, western_beauty, korean_pharmacy, cruelty_free,
   * vegan, yesstyle_awards_2026, or Featured ids from facets (key oc).
   */
  featured?: string | string[];
  /** Lowest price, whole units of the country's currency. */
  min_price?: number;
  /** Highest price, whole units of the country's currency. */
  max_price?: number;
  /**
   * Any other facet: {key, value} from facets[].key and facets[].values[].value (e.g. stp skin
   * type, scrn skin concern, si size, cf color family). At most 12 filter values in all.
   */
  filters?: Array<{ key: string; value: string | string[] }>;
  /**
   * Also return facets [{name, type, key, values [{value, name, selected}]}], price_range and
   * sorts.
   */
  include_facets?: boolean;
  /** Type ids from facets (key t). */
  type?: string | string[];
  /** Brand Region ids from facets (key bcs, e.g. 1 South Korea). */
  region?: string | string[];
  /** Ingredient ids from facets (key inp). */
  ingredients?: string | string[];
  /**
   * Not used here: the category is the department (send that category id instead). Refused (400).
   */
  department?: string;
  [key: string]: unknown;
}

export interface YesstyleBrandOptions {
  /**
   * A brand id (e.g. 317041 COSRX, from brands or items[].brand_id) or a brand link
   * (/en/cosrx/list.html/bpt.299_bid.317041).
   */
  brand: string | number;
  /**
   * A department id (category ids from breadcrumbs or category, e.g. 15478 Beauty, 15544 Skin
   * Care).
   */
  department?: string | number;
  /**
   * Shipping country, ISO-2 lower case (default us; uk is read as gb). YesStyle prices and stocks
   * by shipping country: 39 countries are served here: ae, at, au, be, ca, ch, cl, cz, de, dk, es,
   * fr, gb, gr, hk, hu, ie, il, in, it, jp, kr, kz, mx, my, nl, no, nz, ph, pl, pt, ro, sa, se, sg,
   * th, tw, us, za. Brazil is held back. Others answer 400 before anything is charged.
   */
  country?: string;
  /**
   * Page language: en, fr, de, es, it, nl, pl, pt, ru, ar, zh_TW (default: the country's own on
   * YesStyle, e.g. de for Germany, ar for Saudi Arabia, zh_TW for Taiwan and Hong Kong, en for
   * most).
   */
  language?: string;
  /** Page, 1-based (100 products a page; default 1). */
  page?: number;
  /**
   * bestsellers (default), newest, price_low_to_high, price_high_to_low, best_value, availability,
   * discount.
   */
  sort?: "bestsellers" | "newest" | "price_low_to_high" | "price_high_to_low" | "best_value" | "availability" | "discount";
  /**
   * YesStyle's Featured filters: in_stock, just_arrived, new_this_week, trending_new, flash_sales,
   * black_friday, clearance, rock_bottom_prices, price_drop, new_items_24hr_sale, value_gift_sets,
   * twin_packs_bundles, mini_travel_sizes, mini_size_exclusives, korean_brands, japanese_brands,
   * chinese_cosmetics, southeast_asian_beauty, western_beauty, korean_pharmacy, cruelty_free,
   * vegan, yesstyle_awards_2026, or Featured ids from facets (key oc).
   */
  featured?: string | string[];
  /** Lowest price, whole units of the country's currency. */
  min_price?: number;
  /** Highest price, whole units of the country's currency. */
  max_price?: number;
  /**
   * Any other facet: {key, value} from facets[].key and facets[].values[].value (e.g. stp skin
   * type, scrn skin concern, si size, cf color family). At most 12 filter values in all.
   */
  filters?: Array<{ key: string; value: string | string[] }>;
  /**
   * Also return facets [{name, type, key, values [{value, name, selected}]}], price_range and
   * sorts.
   */
  include_facets?: boolean;
  /** Type ids from facets (key t). */
  type?: string | string[];
  /** Brand Region ids from facets (key bcs, e.g. 1 South Korea). */
  region?: string | string[];
  /** Ingredient ids from facets (key inp). */
  ingredients?: string | string[];
  [key: string]: unknown;
}

export interface YesstyleBrandsOptions {
  /** Brands whose link name contains this (accents, case and punctuation ignored). */
  query?: string;
  /** Page, 1-based. */
  page?: number;
  /** Brands a page (default 500, at most 5000). */
  page_size?: number;
  [key: string]: unknown;
}

export interface YesstyleDealsOptions {
  /**
   * black_friday, flash_sales, clearance, rock_bottom_prices, price_drop, new_items_24hr_sale,
   * value_gift_sets, twin_packs_bundles (default black_friday, while YesStyle runs it).
   */
  deal?: "black_friday" | "flash_sales" | "clearance" | "rock_bottom_prices" | "price_drop" | "new_items_24hr_sale" | "value_gift_sets" | "twin_packs_bundles";
  /** The department (a category id or link; default 15478 Beauty). */
  department?: string | number;
  /**
   * Shipping country, ISO-2 lower case (default us; uk is read as gb). YesStyle prices and stocks
   * by shipping country: 39 countries are served here: ae, at, au, be, ca, ch, cl, cz, de, dk, es,
   * fr, gb, gr, hk, hu, ie, il, in, it, jp, kr, kz, mx, my, nl, no, nz, ph, pl, pt, ro, sa, se, sg,
   * th, tw, us, za. Brazil is held back. Others answer 400 before anything is charged.
   */
  country?: string;
  /**
   * Page language: en, fr, de, es, it, nl, pl, pt, ru, ar, zh_TW (default: the country's own on
   * YesStyle, e.g. de for Germany, ar for Saudi Arabia, zh_TW for Taiwan and Hong Kong, en for
   * most).
   */
  language?: string;
  /** Page, 1-based (100 products a page; default 1). */
  page?: number;
  /**
   * bestsellers (default), newest, price_low_to_high, price_high_to_low, best_value, availability,
   * discount.
   */
  sort?: "bestsellers" | "newest" | "price_low_to_high" | "price_high_to_low" | "best_value" | "availability" | "discount";
  /**
   * YesStyle's Featured filters: in_stock, just_arrived, new_this_week, trending_new, flash_sales,
   * black_friday, clearance, rock_bottom_prices, price_drop, new_items_24hr_sale, value_gift_sets,
   * twin_packs_bundles, mini_travel_sizes, mini_size_exclusives, korean_brands, japanese_brands,
   * chinese_cosmetics, southeast_asian_beauty, western_beauty, korean_pharmacy, cruelty_free,
   * vegan, yesstyle_awards_2026, or Featured ids from facets (key oc).
   */
  featured?: string | string[];
  /** Lowest price, whole units of the country's currency. */
  min_price?: number;
  /** Highest price, whole units of the country's currency. */
  max_price?: number;
  /**
   * Any other facet: {key, value} from facets[].key and facets[].values[].value (e.g. stp skin
   * type, scrn skin concern, si size, cf color family). At most 12 filter values in all.
   */
  filters?: Array<{ key: string; value: string | string[] }>;
  /**
   * Also return facets [{name, type, key, values [{value, name, selected}]}], price_range and
   * sorts.
   */
  include_facets?: boolean;
  /** Type ids from facets (key t). */
  type?: string | string[];
  /** Brand Region ids from facets (key bcs, e.g. 1 South Korea). */
  region?: string | string[];
  /** Ingredient ids from facets (key inp). */
  ingredients?: string | string[];
  [key: string]: unknown;
}

export interface YesstyleProductOptions {
  /** A YesStyle product id (items[].product_id; every shade and size has its own). */
  product_id?: string | number;
  /**
   * A product link (https://www.yesstyle.com/<lang>/<name>/info.html/pid.<id>) instead of
   * product_id.
   */
  url?: string;
  /**
   * Shipping country, ISO-2 lower case (default us; uk is read as gb). YesStyle prices and stocks
   * by shipping country: 39 countries are served here: ae, at, au, be, ca, ch, cl, cz, de, dk, es,
   * fr, gb, gr, hk, hu, ie, il, in, it, jp, kr, kz, mx, my, nl, no, nz, ph, pl, pt, ro, sa, se, sg,
   * th, tw, us, za. Brazil is held back. Others answer 400 before anything is charged.
   */
  country?: string;
  /**
   * Page language: en, fr, de, es, it, nl, pl, pt, ru, ar, zh_TW (default: the country's own on
   * YesStyle, e.g. de for Germany, ar for Saudi Arabia, zh_TW for Taiwan and Hong Kong, en for
   * most).
   */
  language?: string;
  /**
   * Also return every shade / size: product_id, name, availability, sellable, price (+1 credit).
   */
  include_variants?: boolean;
  [key: string]: unknown;
}

export interface YesstyleReviewsOptions {
  /** A product id (any shade or size of the family) or url. */
  product_id?: string | number;
  /** A product link instead of product_id. */
  url?: string;
  /** Page, 1-based (15 reviewers a page; YesStyle answers up to 67 pages per sort and filter). */
  page?: number;
  /** relevant (default), highest_rating, newest, helpful. */
  sort?: "relevant" | "highest_rating" | "newest" | "helpful";
  /** all (default), 5, 4, 3, 2, 1 (stars), positive, negative, photo, video. */
  filter?: "1" | "2" | "3" | "4" | "5" | "all" | "positive" | "negative" | "photo" | "video" | number;
  /** Also return the summary (total, star counts, satisfaction) on pages after the first. */
  include_summary?: boolean;
  /**
   * Shipping country, ISO-2 lower case (default us): any of the 153 countries YesStyle ships to
   * (see markets).
   */
  country?: string;
  /**
   * Page language: en, fr, de, es, it, nl, pl, pt, ru, ar, zh_TW (default: the country's own on
   * YesStyle, e.g. de for Germany, ar for Saudi Arabia, zh_TW for Taiwan and Hong Kong, en for
   * most).
   */
  language?: string;
  [key: string]: unknown;
}

export interface YesstyleSuggestionsOptions {
  /** What a shopper has typed (at least 2 characters). */
  query: string;
  /**
   * Shipping country, ISO-2 lower case (default us): any of the 153 countries YesStyle ships to
   * (see markets).
   */
  country?: string;
  /**
   * Page language: en, fr, de, es, it, nl, pl, pt, ru, ar, zh_TW (default: the country's own on
   * YesStyle, e.g. de for Germany, ar for Saudi Arabia, zh_TW for Taiwan and Hong Kong, en for
   * most).
   */
  language?: string;
  [key: string]: unknown;
}

export interface YesstyleMarketsOptions {
  /** Names in this language (en, fr, de, es, it, nl, pl, pt, ru, ar, zh_TW; default en). */
  language?: string;
  [key: string]: unknown;
}

export class YesstyleNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = YESSTYLE_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/yesstyle/${path}`, options, undefined, timeout);
  }

  /**
   * Search the catalog of YesStyle (yesstyle.com, the Hong Kong-based online store for Asian beauty
   * and fashion, shipping to 150+ countries; owned by YesAsia Holdings, HKEX 2209). Scavio fetches
   * the public page on request; YesStyle has no public API. Keywords with paging (100 a page),
   * seven sorts (bestsellers, newest, price both ways, best value, availability, discount) and
   * YesStyle's filters: Featured (in stock, flash sales, Black Friday, clearance, rock-bottom
   * prices, value & gift sets, twin packs, mini sizes, Korean / Japanese brands, cruelty-free,
   * vegan, YesStyle Awards ...), price band and department. Prices are YesStyle's own for the
   * shipping country, in that country's currency (regional price lists: the same product can be
   * US$16.09 in the US and US$14.86 in South Africa); which products ship differs by country. Costs
   * 2 credits.
   */
  async search(options: YesstyleSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * Browse one category of YesStyle (yesstyle.com, the Hong Kong-based online store for Asian
   * beauty and fashion, shipping to 150+ countries; owned by YesAsia Holdings, HKEX 2209). Scavio
   * fetches the public page on request; YesStyle has no public API. By category id or link, with
   * paging, sorts and the Featured, price, Type, Region (brand country) and Ingredients filters
   * plus any facet (skin type, skin concern ...). Prices are YesStyle's own for the shipping
   * country, in that country's currency (regional price lists: the same product can be US$16.09 in
   * the US and US$14.86 in South Africa); which products ship differs by country. Every answer is
   * checked for its country; market {country, country_name, currency, language} says which. Costs 2
   * credits.
   */
  async category(options: YesstyleCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One brand's products on YesStyle (yesstyle.com, the Hong Kong-based online store for Asian
   * beauty and fashion, shipping to 150+ countries; owned by YesAsia Holdings, HKEX 2209). Scavio
   * fetches the public page on request; YesStyle has no public API. By brand id or link, with
   * paging, sorts, department and filters, plus the brand's name, region and customer satisfaction
   * (brand {name, region, satisfaction_percent, total_reviews, star_counts}). Prices are YesStyle's
   * own for the shipping country, in that country's currency (regional price lists: the same
   * product can be US$16.09 in the US and US$14.86 in South Africa); which products ship differs by
   * country. Every answer is checked for its country; market {country, country_name, currency,
   * language} says which. Costs 2 credits.
   */
  async brand(options: YesstyleBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * Every brand of YesStyle (yesstyle.com, the Hong Kong-based online store for Asian beauty and
   * fashion, shipping to 150+ countries; owned by YesAsia Holdings, HKEX 2209). Scavio fetches the
   * public page on request; YesStyle has no public API. (about 4,300): brand_id, slug (the brand's
   * link name), url, last_modified, filtered by query and paged. Costs 1 credit.
   */
  async brands(options: YesstyleBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /**
   * The deal lists of YesStyle (yesstyle.com, the Hong Kong-based online store for Asian beauty and
   * fashion, shipping to 150+ countries; owned by YesAsia Holdings, HKEX 2209). Scavio fetches the
   * public page on request; YesStyle has no public API.: Black Friday, flash sales, clearance,
   * rock-bottom prices, price drops, new items 24-hour sale, value & gift sets, twin packs, on a
   * department (default Beauty), with the listing's paging, sorts and filters. Prices are
   * YesStyle's own for the shipping country, in that country's currency (regional price lists: the
   * same product can be US$16.09 in the US and US$14.86 in South Africa); which products ship
   * differs by country. Every answer is checked for its country; market {country, country_name,
   * currency, language} says which. Costs 2 credits.
   */
  async deals(options: YesstyleDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * One product of YesStyle (yesstyle.com, the Hong Kong-based online store for Asian beauty and
   * fashion, shipping to 150+ countries; owned by YesAsia Holdings, HKEX 2209). Scavio fetches the
   * public page on request; YesStyle has no public API. By product id or link. Costs 2 credits; 3
   * with include_variants. credits_used in the response is the exact charge.
   */
  async product(options: YesstyleProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Customer reviews of one product family on YesStyle (yesstyle.com, the Hong Kong-based online
   * store for Asian beauty and fashion, shipping to 150+ countries; owned by YesAsia Holdings, HKEX
   * 2209). Scavio fetches the public page on request; YesStyle has no public API. 15 reviewers a
   * page, four sorts (relevant, highest rating, newest, helpful) and filters (1-5 stars, positive,
   * negative, photo, video); YesStyle answers up to 67 pages (about 1,000 reviews) per sort and
   * filter. Costs 1 credit.
   */
  async reviews(options: YesstyleReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * The search terms and products YesStyle (yesstyle.com, the Hong Kong-based online store for
   * Asian beauty and fashion, shipping to 150+ countries; owned by YesAsia Holdings, HKEX 2209).
   * Scavio fetches the public page on request; YesStyle has no public API. suggests for what a
   * shopper has typed, priced for the shipping country (any of the 153 countries YesStyle ships
   * to). Costs 1 credit.
   */
  async suggestions(options: YesstyleSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * The shipping countries, currencies and languages of YesStyle (yesstyle.com, the Hong Kong-based
   * online store for Asian beauty and fashion, shipping to 150+ countries; owned by YesAsia
   * Holdings, HKEX 2209). Scavio fetches the public page on request; YesStyle has no public API.
   * Costs 1 credit.
   */
  async markets(options: YesstyleMarketsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("markets", options);
  }
}
