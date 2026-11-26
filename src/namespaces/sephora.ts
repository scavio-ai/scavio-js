import type { Scavio } from "../client.js";

// Sephora: sephora.com (US, the default), 3 endpoints: search and category 1
// credit, product 2.
//
// Sephora Canada (sephora.com/ca, Sephora's Canadian store: 152 stores per its
// store list on Nov 25, 2026): `country: "ca"` on search, category and
// product, plus the Canada-only brand(), brands(), suggestions(), offers(),
// stores() and store(). Credits are the same in both countries: 1 per call,
// product and offers 2. `country` is optional and absent by default, so a US
// call posts exactly what it did before Sephora Canada existed. zip is US only
// (a 400 with country "ca"); language, filters, include_facets and the
// category sort are Canada only.
//
// search(), category() and brand() return 60 products per page. product()
// takes a result's url (faster) or its product_id (the same ids in both
// countries). US product() returns a summary of what reviews say with pro and
// con sentiment counts and no review text; Canada adds the 10 latest reviews
// without reviewer names and Sephora's own AI-generated review summary,
// labelled as Sephora's. Every call raises the request timeout to
// SEPHORA_TIMEOUT when the client's is shorter (Sephora Canada pages can take
// up to about 50 s, with one retry).

/** Minimum request timeout (ms) for every sephora call. */
export const SEPHORA_TIMEOUT = 120_000;

export type SephoraSort =
  | "relevance"
  | "best_selling"
  | "rating"
  | "price_low"
  | "price_high"
  | "newest";

/** "us" (default, sephora.com) or "ca" (Sephora Canada, sephora.com/ca, CAD). */
export type SephoraCountry = "us" | "ca";

/** Sephora Canada language: "en" (default) or "fr". Same ids and CAD prices. */
export type SephoraCaLanguage = "en" | "fr";

export type SephoraCaProvince =
  | "AB" | "BC" | "MB" | "NB" | "NL" | "NS" | "NT" | "NU" | "ON" | "PE" | "QC" | "SK" | "YT";

/** One facet value from a Sephora Canada response's facets (include_facets). */
export interface SephoraCaFacetFilter {
  facet?: string;
  value: string;
}

/**
 * Sephora Canada filters. Several filters all apply; an unknown filter is a
 * 400. Or pass up to 10 facet values as a plain list.
 */
export type SephoraCaFilters =
  | {
      /** As the Brand facet shows it, e.g. "The Ordinary". */
      brand?: string;
      on_sale?: boolean;
      new?: boolean;
      /** Clean at Sephora. */
      clean?: boolean;
      /** 1-4: that many stars and up. */
      rating?: number;
      /** CAD. */
      min_price?: number;
      /** CAD. */
      max_price?: number;
      /** Up to 10 facet values from a response's facets. */
      facets?: SephoraCaFacetFilter[];
    }
  | SephoraCaFacetFilter[];

/** Sephora Canada listing options shared by search, category and brand. */
export interface SephoraCaListingOptions {
  /** Sephora Canada only: filters, see SephoraCaFilters. */
  filters?: SephoraCaFilters;
  /** Sephora Canada only: also return facets [{facet, type, values}] to filter on. */
  include_facets?: boolean;
  /** Sephora Canada only: "en" (default) or "fr". */
  language?: SephoraCaLanguage;
}

export interface SephoraSearchOptions extends SephoraCaListingOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** Results page, 1-based (1-100). 60 products per page. */
  page?: number;
  /** relevance (default), best_selling, rating, price_low, price_high or newest. */
  sort?: SephoraSort;
  /** US only: US ZIP code. Each product then carries same_day_eligible for same-day delivery to that ZIP. */
  zip?: string;
  /** "us" (default, sephora.com, unchanged) or "ca" (Sephora Canada, CAD). */
  country?: SephoraCountry;
  [key: string]: unknown;
}

export interface SephoraCategoryOptions extends SephoraCaListingOptions {
  /** Category name as in a sephora.com/shop/ URL (lipstick, face-serum, makeup-cosmetics), or the full URL (a sephora.com/ca link for Canada). */
  category: string;
  /** Results page, 1-based (1-100). 60 products per page. */
  page?: number;
  /** "us" (default, sephora.com, unchanged) or "ca" (Sephora Canada, CAD). */
  country?: SephoraCountry;
  /** Sephora Canada only: relevance (default), best_selling, rating, price_low, price_high or newest. */
  sort?: SephoraSort;
  [key: string]: unknown;
}

export interface SephoraProductOptions {
  /** sephora.com product URL (the `url` of a search or category result). Preferred: it answers faster. Pass this or product_id. */
  url?: string;
  /** Sephora product id, e.g. "P510799" (the same ids in Canada, e.g. "P428500"). Used when url is not given. */
  product_id?: string;
  /** "us" (default, sephora.com, unchanged) or "ca" (Sephora Canada, CAD). */
  country?: SephoraCountry;
  /** Sephora Canada only: "en" (default) or "fr". */
  language?: SephoraCaLanguage;
  [key: string]: unknown;
}

export interface SephoraBrandOptions {
  /** Brand name as in a sephora.com/ca/en/brand/<name> link (e.g. "the-ordinary", "dior"; see brands()), or the link itself. */
  brand: string;
  /** Page, 1-based (1-100). 60 products per page. */
  page?: number;
  /** relevance (default), best_selling, rating, price_low, price_high or newest. */
  sort?: SephoraSort;
  filters?: SephoraCaFilters;
  include_facets?: boolean;
  language?: SephoraCaLanguage;
  [key: string]: unknown;
}

export interface SephoraBrandsOptions {
  language?: SephoraCaLanguage;
  [key: string]: unknown;
}

export interface SephoraSuggestionsOptions {
  /** What the shopper has typed so far (1-100 characters), e.g. "lip". */
  query: string;
  language?: SephoraCaLanguage;
  [key: string]: unknown;
}

export interface SephoraOffersOptions {
  language?: SephoraCaLanguage;
  [key: string]: unknown;
}

export interface SephoraStoresOptions {
  /** Only stores in this province or territory, e.g. "QC". */
  province?: SephoraCaProvince;
  language?: SephoraCaLanguage;
  [key: string]: unknown;
}

export interface SephoraStoreOptions {
  /** A store slug from stores() (e.g. "toronto-eaton-centre"), or the store's link. */
  store: string;
  language?: SephoraCaLanguage;
  [key: string]: unknown;
}

export class SephoraNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search sephora.com products, 60 per page: product id, sku id, brand, name,
   * URL, image, price, list and sale price (with a price range when sizes are
   * priced differently), value price for sets, rating, review count, extra
   * colors, and bestseller, new, exclusive, online-only, limited-edition and
   * sponsored flags. Pass zip for same-day delivery eligibility (US only).
   * Also returns category facets and related searches. With country "ca",
   * Sephora Canada: CAD prices as given (French prices such as "33,00 $" read
   * as 33.00), sale_scope and an app-exclusive flag per product, total_results,
   * total_pages, has_more, filters_applied, facets (include_facets) and
   * market; a brand keyword answers that brand's products with redirect.
   *
   * Costs 1 credit.
   */
  async search(options: SephoraSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sephora/search", options, undefined, SEPHORA_TIMEOUT);
  }

  /**
   * Products in a sephora.com category, 60 per page, in the same shape as
   * search(), plus the category's id, name and URL, total product count,
   * parent category, subcategories with product counts and breadcrumbs. With
   * country "ca", a Sephora Canada category with sort, filters and facets. An
   * unknown category is a 404 (charged for Canada).
   *
   * Costs 1 credit.
   */
  async category(options: SephoraCategoryOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sephora/category", options, undefined, SEPHORA_TIMEOUT);
  }

  /**
   * One sephora.com product: rating, review count, loves count, price range,
   * description, suggested usage, breadcrumbs, a summary of what reviews say
   * with pro and con sentiment counts (no review text), and every shade or
   * size as a sku with price, list and sale price, in_stock, only_few_left,
   * ingredients, images, and pickup and same-day eligibility. With country
   * "ca", the Sephora Canada product (same ids): CAD prices per sku,
   * review_summary (Sephora's own AI-generated summary of customer reviews,
   * labelled as Sephora's), review_sentiments and latest_reviews (the 10
   * latest, without reviewer names); upc is always null (the pages show
   * none). No stock per store. An unknown product is a 404 (charged for
   * Canada).
   *
   * Costs 2 credits.
   */
  async product(options: SephoraProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sephora/product", options, undefined, SEPHORA_TIMEOUT);
  }

  /**
   * Sephora Canada only (no country needed): one brand's products, 60 per
   * page: brand {brand_id, name, seo_name, url, description}, the brand's
   * categories with product counts, and the search() listing fields, with
   * sort, filters and facets. CAD prices as given. An unknown brand is a
   * charged 404.
   *
   * Costs 1 credit.
   */
  async brand(options: SephoraBrandOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sephora/brand", options, undefined, SEPHORA_TIMEOUT);
  }

  /**
   * Sephora Canada only: every brand in the A-Z brand directory: language,
   * count, brands [{brand_id, name, seo_name, url, letter}]. Pass a seo_name
   * to brand().
   *
   * Costs 1 credit.
   */
  async brands(options: SephoraBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sephora/brands", options, undefined, SEPHORA_TIMEOUT);
  }

  /**
   * Sephora Canada only: the search-box suggestions for a partial query:
   * query, language, count, terms and products [{product_id, sku_id, name,
   * brand, rating, review_count, image, url}], as the site gives them.
   *
   * Costs 1 credit.
   */
  async suggestions(options: SephoraSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sephora/suggestions", options, undefined, SEPHORA_TIMEOUT);
  }

  /**
   * Sephora Canada only: the current offers on the beauty offers page:
   * language, count, offers [{id, section, title, description, eligibility
   * (as given: Online, In Store, Apps, Rouge, VIB, Insider), app_only,
   * threshold, promo_code, promo_id, end_date (as given; null when the offer
   * states none), legal_copy, action_label, url}], note. Offers carry no start
   * date. No prices or member pricing.
   *
   * Costs 2 credits.
   */
  async offers(options: SephoraOffersOptions = {}): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sephora/offers", options, undefined, SEPHORA_TIMEOUT);
  }

  /**
   * Sephora Canada only: the Canadian stores on Sephora's store list,
   * optionally one province: total_stores, province_counts, count, stores
   * [{name, city, location, province, province_name, slug, url}]. Pass a slug
   * to store(). No store finder by postal code.
   *
   * Costs 1 credit.
   */
  async stores(options: SephoraStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sephora/stores", options, undefined, SEPHORA_TIMEOUT);
  }

  /**
   * Sephora Canada only: one store by slug or link: address, phone,
   * coordinates, time zone, weekly hours, holiday hours, curbside hours and
   * services. No stock per store. An unknown store is a charged 404.
   *
   * Costs 1 credit.
   */
  async store(options: SephoraStoreOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/sephora/store", options, undefined, SEPHORA_TIMEOUT);
  }
}
