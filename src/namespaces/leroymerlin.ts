import type { Scavio } from "../client.js";

// Leroy Merlin (the home improvement retailer; country br, it, es, pt, pl, ro or fr) search,
// category, product, storeStock, stores, store, reviews, shipping, cep, regions, categories,
// suggestions and offers endpoints; local currency, Brazil priced per region with store stock,
// billed on actual cost per market (1 credit in Brazil, Italy and Romania, 2 in Spain, Portugal and
// Poland, 5 in France). Generated from the backend routes: every option and its doc mirrors the
// API's own request schema; an input the API only accepts to refuse (a 400 that says 'not offered')
// is left out. The server enforces the value rules and the one-of rules (send one of an id or a
// link). Every call raises the request timeout to LEROYMERLIN_TIMEOUT and never lowers a longer
// client timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every leroymerlin call. */
export const LEROYMERLIN_TIMEOUT = 240_000;

export interface LeroymerlinSearchOptions {
  /**
   * Market: br, it, es, pt, pl, ro, fr (Brazil, Italy, Spain, Portugal, Poland, Romania, France).
   * Required. Data comes in the market's language and currency (BRL, EUR, PLN, RON). Ukraine and
   * Greece are not supported.
   */
  country: string;
  /**
   * Keywords or a reference number (Europe sends a reference number to its product page:
   * redirected_to).
   */
  query: string;
  /**
   * Brazil only, and required there: the price region (Leroy Merlin Brasil prices per region). One
   * of acre, alagoas, bahia, baixada_santista, bauru, belo_horizonte, brasilia, campinas, ceara,
   * curitiba, espirito_santo, goiania, grande_porto_alegre, grande_sao_paulo, joinville, londrina,
   * mato_grosso, mato_grosso_do_sul, outros, rib_preto, rio_de_janeiro, rio_grande_do_norte,
   * rondonia, santa_catarina, sao_jose_do_rio_preto, sorocaba, uberlandia, vale_do_paraiba; regions
   * lists them with names.
   */
  region?: string;
  /** Page (1-based). Search: up to 10 pages in Europe (48 a page), 28 in Brazil (36 a page). */
  page?: number;
  /**
   * relevance (default), price_asc, price_desc. Brazil: category only (keyword search keeps the
   * site's order).
   */
  sort?: "relevance" | "price_asc" | "price_desc";
  /**
   * Europe only: {code: value or [values]} from an earlier answer's filters_available (code,
   * values[].value).
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface LeroymerlinCategoryOptions {
  /**
   * Market: br, it, es, pt, pl, ro, fr (Brazil, Italy, Spain, Portugal, Poland, Romania, France).
   * Required. Data comes in the market's language and currency (BRL, EUR, PLN, RON). Ukraine and
   * Greece are not supported.
   */
  country: string;
  /**
   * Brazil: a category slug or link (categories lists them, e.g. furadeiras). Europe: a category
   * path or link (e.g. /prodotti/utensileria/elettroutensili/trapani-e-avvitatori/).
   */
  category: string;
  /**
   * Brazil only, and required there: the price region (Leroy Merlin Brasil prices per region). One
   * of acre, alagoas, bahia, baixada_santista, bauru, belo_horizonte, brasilia, campinas, ceara,
   * curitiba, espirito_santo, goiania, grande_porto_alegre, grande_sao_paulo, joinville, londrina,
   * mato_grosso, mato_grosso_do_sul, outros, rib_preto, rio_de_janeiro, rio_grande_do_norte,
   * rondonia, santa_catarina, sao_jose_do_rio_preto, sorocaba, uberlandia, vale_do_paraiba; regions
   * lists them with names.
   */
  region?: string;
  /** Page (1-based). Search: up to 10 pages in Europe (48 a page), 28 in Brazil (36 a page). */
  page?: number;
  /**
   * relevance (default), price_asc, price_desc. Brazil: category only (keyword search keeps the
   * site's order).
   */
  sort?: "relevance" | "price_asc" | "price_desc";
  /**
   * Europe only: {code: value or [values]} from an earlier answer's filters_available (code,
   * values[].value).
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface LeroymerlinProductOptions {
  /**
   * Market: br, it, es, pt, pl, ro, fr (Brazil, Italy, Spain, Portugal, Poland, Romania, France).
   * Required. Data comes in the market's language and currency (BRL, EUR, PLN, RON). Ukraine and
   * Greece are not supported.
   */
  country: string;
  /** The product reference number (products[].id). France needs url instead. */
  id?: string | number;
  /** A product link on the market's site (products[].url), instead of id. */
  url?: string;
  /**
   * Brazil only, and required there: the price region (Leroy Merlin Brasil prices per region). One
   * of acre, alagoas, bahia, baixada_santista, bauru, belo_horizonte, brasilia, campinas, ceara,
   * curitiba, espirito_santo, goiania, grande_porto_alegre, grande_sao_paulo, joinville, londrina,
   * mato_grosso, mato_grosso_do_sul, outros, rib_preto, rio_de_janeiro, rio_grande_do_norte,
   * rondonia, santa_catarina, sao_jose_do_rio_preto, sorocaba, uberlandia, vale_do_paraiba; regions
   * lists them with names.
   */
  region?: string;
  [key: string]: unknown;
}

export interface LeroymerlinStoreStockOptions {
  /** br (store stock is available for Brazil). */
  country: string;
  /** The product reference number (products[].id). France needs url instead. */
  id?: string | number;
  /** A product link on the market's site (products[].url), instead of id. */
  url?: string;
  /** Required: the price region whose stores are listed. */
  region?: string;
  /**
   * Optional: one store of the region (stores[].store_id); without it every store of the region.
   */
  store?: string;
  [key: string]: unknown;
}

export interface LeroymerlinStoresOptions {
  /**
   * Market: br, it, es, pt, pl, ro, fr (Brazil, Italy, Spain, Portugal, Poland, Romania, France).
   * Required. Data comes in the market's language and currency (BRL, EUR, PLN, RON). Ukraine and
   * Greece are not supported.
   */
  country: string;
  /** Europe: a city or postcode (the nearest stores to the first place the site matches). */
  place?: string;
  /** Latitude (with longitude), instead of place. */
  latitude?: number;
  /** Longitude (with latitude). */
  longitude?: number;
  /** Brazil only: the stores in the state of this price region. */
  region?: string;
  /** Brazil only: a state code (SP, RJ, RS ...). */
  state?: string;
  [key: string]: unknown;
}

export interface LeroymerlinStoreOptions {
  /**
   * Market: br, it, es, pt, pl, ro, fr (Brazil, Italy, Spain, Portugal, Poland, Romania, France).
   * Required. Data comes in the market's language and currency (BRL, EUR, PLN, RON). Ukraine and
   * Greece are not supported.
   */
  country: string;
  /** Brazil: the store id (stores[].store_id). */
  store?: string;
  /** Europe: the store page link (stores[].url). */
  url?: string;
  [key: string]: unknown;
}

export interface LeroymerlinReviewsOptions {
  /**
   * Market: br, it, es, pt, pl, ro, fr (Brazil, Italy, Spain, Portugal, Poland, Romania, France).
   * Required. Data comes in the market's language and currency (BRL, EUR, PLN, RON). Ukraine and
   * Greece are not supported.
   */
  country: string;
  /** The product reference number (products[].id). France needs url instead. */
  id?: string | number;
  /** A product link on the market's site (products[].url), instead of id. */
  url?: string;
  /** Page (1-based). Search: up to 10 pages in Europe (48 a page), 28 in Brazil (36 a page). */
  page?: number;
  /**
   * Europe: newest, oldest, highest_rating, lowest_rating (default: the site's order). Brazil:
   * most_helpful only (the default).
   */
  sort?: "newest" | "oldest" | "highest_rating" | "lowest_rating" | "most_helpful";
  /** Europe only: only reviews with this many stars. */
  rating?: number;
  [key: string]: unknown;
}

export interface LeroymerlinShippingOptions {
  /** br (default and the only market for this endpoint). */
  country?: string;
  /** The product reference number (products[].id). France needs url instead. */
  id?: string | number;
  /** A product link on the market's site (products[].url), instead of id. */
  url?: string;
  /** Required: the price region. */
  region?: string;
  /** A Brazilian CEP (8 digits). */
  cep: string;
  [key: string]: unknown;
}

export interface LeroymerlinCepOptions {
  /** br (default and the only market for this endpoint). */
  country?: string;
  /** A Brazilian CEP (8 digits). */
  cep: string;
  [key: string]: unknown;
}

export interface LeroymerlinRegionsOptions {
  /** br (default and the only market for this endpoint). */
  country?: string;
  [key: string]: unknown;
}

export interface LeroymerlinCategoriesOptions {
  /** br (default and the only market for this endpoint). */
  country?: string;
  /** A category slug or link: its subtree. Without it: every department. */
  category?: string;
  /** Levels returned (1-4, default 2). */
  depth?: number;
  [key: string]: unknown;
}

export interface LeroymerlinSuggestionsOptions {
  /** it, es, pt or pl. */
  country: string;
  /** What the shopper has typed so far (2 characters or more). */
  query: string;
  [key: string]: unknown;
}

export interface LeroymerlinOffersOptions {
  /** it (the market whose offers page is a product list). */
  country: string;
  /** Page (1-based). Search: up to 10 pages in Europe (48 a page), 28 in Brazil (36 a page). */
  page?: number;
  /**
   * relevance (default), price_asc, price_desc. Brazil: category only (keyword search keeps the
   * site's order).
   */
  sort?: "relevance" | "price_asc" | "price_desc";
  /**
   * Europe only: {code: value or [values]} from an earlier answer's filters_available (code,
   * values[].value).
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export class LeroymerlinNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = LEROYMERLIN_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/leroymerlin/${path}`, options, undefined, timeout);
  }

  /**
   * Search Leroy Merlin (the home improvement retailer of the ADEO group). Scavio fetches the
   * public Leroy Merlin page on request. Brazil (region required, priced for the region, promotion
   * dates and Black Friday flags) and Italy, Spain, Portugal, Poland and Romania (sorted, filtered,
   * paged). Not available for France (400). Billed on what the request spent in its market: 1
   * credit in Brazil, Italy and Romania; 2 in Spain, Portugal and Poland (France has no search).
   * credits_used in the response is the exact charge.
   */
  async search(options: LeroymerlinSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One Leroy Merlin category's products by slug, path or link, sorted and paged, in any of the
   * seven markets. Billed on what the request spent in its market: 1 credit in Brazil and Romania;
   * 2 in Italy, Spain, Portugal and Poland; 5 in France. credits_used in the response is the exact
   * charge.
   */
  async category(options: LeroymerlinCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * One Leroy Merlin product by reference number or link. Brazil (region required). Billed on what
   * the request spent in its market: 1 credit in Brazil and Romania; 2 in Italy, Spain, Portugal
   * and Poland; 5 in France. credits_used in the response is the exact charge.
   */
  async product(options: LeroymerlinProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Units in store as Leroy Merlin Brasil reports them, for every store of a price region (or one):
   * exact units, the aisle and pickup. Costs 1 credit.
   */
  async storeStock(options: LeroymerlinStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /**
   * Leroy Merlin stores. Brazil: the store list (optionally the stores of a region's state or a
   * state, or sorted by distance from latitude / longitude, computed by Scavio). Billed on what the
   * request spent in its market: 1 credit in Brazil, Italy and Romania; 2 in Spain, Portugal and
   * Poland; 5 in France. credits_used in the response is the exact charge.
   */
  async stores(options: LeroymerlinStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One Leroy Merlin store. Brazil by store id. Billed on what the request spent in its market: 1
   * credit in Brazil, Italy and Romania; 2 in Spain, Portugal and Poland; 5 in France. credits_used
   * in the response is the exact charge.
   */
  async store(options: LeroymerlinStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * One page of a product's reviews and its rating summary. Brazil (6 a page, most helpful first).
   * Billed on what the request spent in its market: 1 credit in Brazil, Italy and Romania; 2 in
   * Spain, Portugal and Poland; 5 in France. credits_used in the response is the exact charge.
   */
  async reviews(options: LeroymerlinReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * Delivery quote for one Leroy Merlin Brasil product to a CEP in a price region. Costs 1 credit.
   */
  async shipping(options: LeroymerlinShippingOptions): Promise<Record<string, unknown>> {
    return this.post("shipping", options);
  }

  /** The address Leroy Merlin Brasil holds for a CEP. Costs 1 credit. */
  async cep(options: LeroymerlinCepOptions): Promise<Record<string, unknown>> {
    return this.post("cep", options);
  }

  /**
   * Leroy Merlin Brasil's 28 price regions (the region input of every priced Brazil call). Costs 1
   * credit.
   */
  async regions(options: LeroymerlinRegionsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("regions", options);
  }

  /** Leroy Merlin Brasil's department tree, or one category's subtree. Costs 1 credit. */
  async categories(options: LeroymerlinCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * Search suggestions as Leroy Merlin's search box gives them (Italy, Spain, Portugal, Poland).
   * Billed on what the request spent in its market: 1 credit in Italy; 2 in Spain, Portugal and
   * Poland. credits_used in the response is the exact charge.
   */
  async suggestions(options: LeroymerlinSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Leroy Merlin Italia's offers page as a product list (offerte), sorted, filtered and paged.
   * Costs 1 credit.
   */
  async offers(options: LeroymerlinOffersOptions): Promise<Record<string, unknown>> {
    return this.post("offers", options);
  }
}
