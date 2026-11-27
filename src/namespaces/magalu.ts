import type { Scavio } from "../client.js";

// Magazine Luiza (magazineluiza.com.br, Magalu, the Brazilian retailer and marketplace) search,
// category, deals, product, reviews, suggestions, stores and store endpoints; Brazil only, prices
// in BRL (Pix price, coupons, deal end times), 2 credits each. Generated from the backend routes:
// every option and its doc mirrors the API's own request schema; an input the API only accepts to
// refuse (a 400 that says 'not offered') is left out. The server enforces the value rules and the
// one-of rules (send one of an id or a link). Every call raises the request timeout to
// MAGALU_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and refused inputs
// are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every magalu call. */
export const MAGALU_TIMEOUT = 240_000;

export interface MagaluSearchOptions {
  /** Search keywords (Portuguese, as a shopper types them). */
  query: string;
  /**
   * relevance (default), fastest_delivery, price_with_shipping, price_asc, price_desc,
   * best_sellers, top_rated or newest (the site's 8 sorts).
   */
  sort?: "relevance" | "fastest_delivery" | "price_with_shipping" | "price_asc" | "price_desc" | "best_sellers" | "top_rated" | "newest";
  /** Brand slug(s) as the site writes them (facets brand values[].value). */
  brand?: string | string[];
  /** magalu (Magalu's own offers) or marketplace seller id(s) (facets seller values[].value). */
  seller?: string | string[];
  /** Minimum price in BRL (the site's price filter). */
  min_price?: number;
  /** Maximum price in BRL (the site's price filter). */
  max_price?: number;
  /** Minimum star rating, 1-5. */
  min_rating?: number;
  /** true: items in the site's Black Friday promotion (Ofertas Black). */
  black_friday?: boolean;
  /** Promotion id(s) (facets promotion values[].value, e.g. promocao_sazonal_3 Ofertas do Dia). */
  promotion?: string | string[];
  /**
   * Attribute facets: facet slug -> value slug(s), e.g. {"voltagem": "220v", "cor": ["branco",
   * "inox"]} (facets[].slug and values[].value).
   */
  attributes?: Record<string, unknown>;
  /** Results page, 1-25 (40 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface MagaluCategoryOptions {
  /**
   * A category path or magazineluiza.com.br link: a department (/eletrodomesticos/l/ed/) or a
   * subcategory (/geladeira-refrigerador/eletrodomesticos/s/ed/refr/).
   */
  path: string;
  /**
   * relevance (default), fastest_delivery, price_with_shipping, price_asc, price_desc,
   * best_sellers, top_rated or newest (the site's 8 sorts).
   */
  sort?: "relevance" | "fastest_delivery" | "price_with_shipping" | "price_asc" | "price_desc" | "best_sellers" | "top_rated" | "newest";
  /** Brand slug(s) as the site writes them (facets brand values[].value). */
  brand?: string | string[];
  /** magalu (Magalu's own offers) or marketplace seller id(s) (facets seller values[].value). */
  seller?: string | string[];
  /** Minimum price in BRL (the site's price filter). */
  min_price?: number;
  /** Maximum price in BRL (the site's price filter). */
  max_price?: number;
  /** Minimum star rating, 1-5. */
  min_rating?: number;
  /** true: items in the site's Black Friday promotion (Ofertas Black). */
  black_friday?: boolean;
  /** Promotion id(s) (facets promotion values[].value, e.g. promocao_sazonal_3 Ofertas do Dia). */
  promotion?: string | string[];
  /**
   * Attribute facets: facet slug -> value slug(s), e.g. {"voltagem": "220v", "cor": ["branco",
   * "inox"]} (facets[].slug and values[].value).
   */
  attributes?: Record<string, unknown>;
  /** Results page, 1-25 (40 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface MagaluDealsOptions {
  /**
   * A deal selection id or /selecao/ link: ofertasdodia (default, the daily deals),
   * blackfriday2026, blackfriday2026_celulares, blackfriday2026_eletro, blackfriday2026_games,
   * blackfriday2026_info ...
   */
  selection?: string;
  /**
   * relevance (default), fastest_delivery, price_with_shipping, price_asc, price_desc,
   * best_sellers, top_rated or newest (the site's 8 sorts).
   */
  sort?: "relevance" | "fastest_delivery" | "price_with_shipping" | "price_asc" | "price_desc" | "best_sellers" | "top_rated" | "newest";
  /** Brand slug(s) as the site writes them (facets brand values[].value). */
  brand?: string | string[];
  /** magalu (Magalu's own offers) or marketplace seller id(s) (facets seller values[].value). */
  seller?: string | string[];
  /** Minimum price in BRL (the site's price filter). */
  min_price?: number;
  /** Maximum price in BRL (the site's price filter). */
  max_price?: number;
  /** Minimum star rating, 1-5. */
  min_rating?: number;
  /** true: items in the site's Black Friday promotion (Ofertas Black). */
  black_friday?: boolean;
  /** Promotion id(s) (facets promotion values[].value, e.g. promocao_sazonal_3 Ofertas do Dia). */
  promotion?: string | string[];
  /**
   * Attribute facets: facet slug -> value slug(s), e.g. {"voltagem": "220v", "cor": ["branco",
   * "inox"]} (facets[].slug and values[].value).
   */
  attributes?: Record<string, unknown>;
  /** Results page, 1-25 (40 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface MagaluProductOptions {
  /**
   * The Magazine Luiza product id (items[].product_id or variants[].options[].variation_id, e.g.
   * 238058800 or ffh7ah372g).
   */
  product_id?: string;
  /** A magazineluiza.com.br product link, instead of product_id. */
  url?: string;
  [key: string]: unknown;
}

export interface MagaluReviewsOptions {
  /**
   * The Magazine Luiza product id (items[].product_id or variants[].options[].variation_id, e.g.
   * 238058800 or ffh7ah372g).
   */
  product_id?: string;
  /** A magazineluiza.com.br product link, instead of product_id. */
  url?: string;
  /** most_relevant (default), most_recent, most_positive or most_negative. */
  sort?: "most_relevant" | "most_recent" | "most_positive" | "most_negative";
  /** Reviews page (default 1). */
  page?: number;
  /** Reviews per page, 1-50 (default 10). */
  page_size?: number;
  [key: string]: unknown;
}

export interface MagaluSuggestionsOptions {
  /** The start of a search, as a shopper types it. */
  query: string;
  [key: string]: unknown;
}

export interface MagaluStoresOptions {
  /**
   * Brazilian state code (UF): ac, al, am, ap, ba, ce, df, es, go, ma, mg, ms, mt, pa, pb, pe, pi,
   * pr, rj, rn, ro, rr, rs, sc, se, sp, to.
   */
  state: string;
  /** Optional city: the stores in that city (accents and case ignored). */
  city?: string;
  [key: string]: unknown;
}

export interface MagaluStoreOptions {
  /** A store number (stores[].store_id). */
  store_id?: string | number;
  /** A lojas.magazineluiza.com.br store link, instead of store_id. */
  url?: string;
  [key: string]: unknown;
}

export class MagaluNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = MAGALU_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/magalu/${path}`, options, undefined, timeout);
  }

  /**
   * Search Magazine Luiza (magazineluiza.com.br, Magalu, the Brazilian retailer). Scavio fetches
   * the public magazineluiza.com.br page on request; Magazine Luiza has no public product API (it
   * runs an affiliate program). Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to a
   * visitor who is not signed in. By keyword. 40 per page (sponsored cards mixed in by the site are
   * flagged), pages 1-25, in the site's 8 sorts, filtered by brand, seller (Magalu or a marketplace
   * seller), price range, minimum rating, Black Friday promotion and attribute facets (voltage,
   * colour, capacity...). Costs 2 credits.
   */
  async search(options: MagaluSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category listing of Magazine Luiza (magazineluiza.com.br, Magalu, the Brazilian retailer).
   * Scavio fetches the public magazineluiza.com.br page on request; Magazine Luiza has no public
   * product API (it runs an affiliate program). Brazil: Portuguese (pt-BR) text and prices in BRL,
   * as shown to a visitor who is not signed in. A department or subcategory by path or link, sorted
   * and filtered like search. 40 per page (sponsored cards mixed in by the site are flagged), pages
   * 1-25, in the site's 8 sorts, filtered by brand, seller (Magalu or a marketplace seller), price
   * range, minimum rating, Black Friday promotion and attribute facets (voltage, colour,
   * capacity...). Costs 2 credits.
   */
  async category(options: MagaluCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * A deal selection of Magazine Luiza (magazineluiza.com.br, Magalu, the Brazilian retailer).
   * Scavio fetches the public magazineluiza.com.br page on request; Magazine Luiza has no public
   * product API (it runs an affiliate program). Brazil: Portuguese (pt-BR) text and prices in BRL,
   * as shown to a visitor who is not signed in. The daily deals (ofertasdodia, default) or a
   * campaign selection (blackfriday2026, blackfriday2026_celulares ...), sorted and filtered like
   * search; each card carries its own deal timer (deal_starts_at, deal_ends_at, e.g.
   * 2026-11-27T00:00:00-03:00 to 2026-11-30T09:59:59-03:00) where the site shows one. 40 per page
   * (sponsored cards mixed in by the site are flagged), pages 1-25, in the site's 8 sorts, filtered
   * by brand, seller (Magalu or a marketplace seller), price range, minimum rating, Black Friday
   * promotion and attribute facets (voltage, colour, capacity...). Costs 2 credits.
   */
  async deals(options: MagaluDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * One product of Magazine Luiza (magazineluiza.com.br, Magalu, the Brazilian retailer). Scavio
   * fetches the public magazineluiza.com.br page on request; Magazine Luiza has no public product
   * API (it runs an affiliate program). Brazil. Costs 2 credits.
   */
  async product(options: MagaluProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Reviews of one product of Magazine Luiza (magazineluiza.com.br, Magalu, the Brazilian
   * retailer). Scavio fetches the public magazineluiza.com.br page on request; Magazine Luiza has
   * no public product API (it runs an affiliate program). Brazil. Costs 2 credits.
   */
  async reviews(options: MagaluReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * The search suggestions of Magazine Luiza (magazineluiza.com.br, Magalu, the Brazilian
   * retailer). Scavio fetches the public magazineluiza.com.br page on request; Magazine Luiza has
   * no public product API (it runs an affiliate program). Brazil. Costs 2 credits.
   */
  async suggestions(options: MagaluSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * The physical stores of Magazine Luiza (magazineluiza.com.br, Magalu, the Brazilian retailer).
   * Scavio fetches the public magazineluiza.com.br page on request; Magazine Luiza has no public
   * product API (it runs an affiliate program). Brazil. Costs 2 credits.
   */
  async stores(options: MagaluStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One store page of Magazine Luiza (magazineluiza.com.br, Magalu, the Brazilian retailer). Scavio
   * fetches the public magazineluiza.com.br page on request; Magazine Luiza has no public product
   * API (it runs an affiliate program). Brazil. Costs 2 credits.
   */
  async store(options: MagaluStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }
}
