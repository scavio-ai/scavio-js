import type { Scavio } from "../client.js";

// Buscape and Zoom (buscape.com.br, zoom.com.br, Brazil's price comparison sites; chosen with site)
// search, category, categories, product, offers, priceHistory, lowestPrice, deals, dealLanding,
// store, suggestions and shipping endpoints; Brazil only, prices in BRL, 1 credit each. Generated
// from the backend routes: every option and its doc mirrors the API's own request schema; an input
// the API only accepts to refuse (a 400 that says 'not offered') is left out. The server enforces
// the value rules and the one-of rules (send one of an id or a link). Every call raises the request
// timeout to BUSCAPE_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and
// refused inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every buscape call. */
export const BUSCAPE_TIMEOUT = 240_000;

export interface BuscapeSearchOptions {
  /** Search keywords, in Portuguese as shoppers type them. */
  query: string;
  /** Category id(s) to search in (items[].category.id; categories lists them). */
  category_id?: string | number | Array<string | number>;
  /**
   * buscape (the default, www.buscape.com.br) or zoom (www.zoom.com.br). Both sites share one
   * catalog; site sets the site of the page links returned.
   */
  site?: "buscape" | "zoom";
  /** relevance (the default, the site's own order), price_asc, price_desc, rating or price_drop. */
  sort?: "relevance" | "price_asc" | "price_desc" | "rating" | "price_drop";
  /** Results page, 1-based. total_pages reports the last one. */
  page?: number;
  /** Items per page, 1-100. Defaults to 30. */
  page_size?: number;
  /**
   * Facet filters, at most 8: {key: value or [values]}, keys and values exactly as facets[].key and
   * facets[].values[].value of an answer list them (e.g. Marca, Capacidade Total).
   */
  filters?: Record<string, unknown>;
  /** Lowest price in BRL. */
  price_min?: number;
  /** Highest price in BRL. */
  price_max?: number;
  /** true: marketplace sellers; false: the stores' own offers. */
  marketplace?: boolean;
  /**
   * Products whose best-selling store is this one (a store name as items[].stores[].name gives it).
   */
  store?: string;
  [key: string]: unknown;
}

export interface BuscapeCategoryOptions {
  /** The category id (items[].category.id; categories[].id). Send category_id or category. */
  category_id?: string | number;
  /**
   * The category slug or its link (https://www.buscape.com.br/geladeira), instead of category_id.
   */
  category?: string;
  /** Optional keywords inside the category. */
  query?: string;
  /**
   * buscape (the default, www.buscape.com.br) or zoom (www.zoom.com.br). Both sites share one
   * catalog; site sets the site of the page links returned.
   */
  site?: "buscape" | "zoom";
  /** relevance (the default, the site's own order), price_asc, price_desc, rating or price_drop. */
  sort?: "relevance" | "price_asc" | "price_desc" | "rating" | "price_drop";
  /** Results page, 1-based. total_pages reports the last one. */
  page?: number;
  /** Items per page, 1-100. Defaults to 30. */
  page_size?: number;
  /**
   * Facet filters, at most 8: {key: value or [values]}, keys and values exactly as facets[].key and
   * facets[].values[].value of an answer list them (e.g. Marca, Capacidade Total).
   */
  filters?: Record<string, unknown>;
  /** Lowest price in BRL. */
  price_min?: number;
  /** Highest price in BRL. */
  price_max?: number;
  /** true: marketplace sellers; false: the stores' own offers. */
  marketplace?: boolean;
  /**
   * Products whose best-selling store is this one (a store name as items[].stores[].name gives it).
   */
  store?: string;
  [key: string]: unknown;
}

export interface BuscapeCategoriesOptions {
  /**
   * buscape (the default, www.buscape.com.br) or zoom (www.zoom.com.br). Both sites share one
   * catalog; site sets the site of the page links returned.
   */
  site?: "buscape" | "zoom";
  /** A branch slug (branches[].slug): returns its categories with ids. Without it, the branches. */
  branch?: string;
  [key: string]: unknown;
}

export interface BuscapeProductOptions {
  /**
   * buscape (the default, www.buscape.com.br) or zoom (www.zoom.com.br). Both sites share one
   * catalog; site sets the site of the page links returned.
   */
  site?: "buscape" | "zoom";
  /** The product id: items[].product_id of search, category or deals. */
  product_id?: string | number;
  /**
   * A product page on www.buscape.com.br or www.zoom.com.br (items[].url of search) or its path,
   * instead of product_id.
   */
  url?: string;
  [key: string]: unknown;
}

export interface BuscapeOffersOptions {
  /**
   * buscape (the default, www.buscape.com.br) or zoom (www.zoom.com.br). Both sites share one
   * catalog; site sets the site of the page links returned.
   */
  site?: "buscape" | "zoom";
  /** The product id: items[].product_id of search, category or deals. */
  product_id: string | number;
  /**
   * default (the default), price_asc (cash price), price_desc, installment_price_asc (installment
   * total), discount_desc or cashback_price_asc (the site's product page order).
   */
  sort?: "default" | "price_asc" | "price_desc" | "installment_price_asc" | "discount_desc" | "cashback_price_asc";
  /** A variant (variant_filters[].values[].variant_id, e.g. a voltage): offers of that variant. */
  variant_id?: string | number;
  /** Results page, 1-based. total_pages reports the last one. */
  page?: number;
  /** Offers per page, 1-50. Defaults to 20. */
  page_size?: number;
  [key: string]: unknown;
}

export interface BuscapePriceHistoryOptions {
  /**
   * buscape (the default, www.buscape.com.br) or zoom (www.zoom.com.br). Both sites share one
   * catalog; site sets the site of the page links returned.
   */
  site?: "buscape" | "zoom";
  /** The product id: items[].product_id of search, category or deals. */
  product_id: string | number;
  /** days (the default: 40 daily points) or months (with months). */
  period?: "days" | "months";
  /** With period months: 3 to 12 months of daily points. */
  months?: number;
  [key: string]: unknown;
}

export interface BuscapeLowestPriceOptions {
  /**
   * buscape (the default, www.buscape.com.br) or zoom (www.zoom.com.br). Both sites share one
   * catalog; site sets the site of the page links returned.
   */
  site?: "buscape" | "zoom";
  /** The product id: items[].product_id of search, category or deals. */
  product_id: string | number;
  [key: string]: unknown;
}

export interface BuscapeDealsOptions {
  /** Optional keywords inside the deals. */
  query?: string;
  /** Category id(s) to list the deals of. */
  category_id?: string | number | Array<string | number>;
  /**
   * buscape (the default, www.buscape.com.br) or zoom (www.zoom.com.br). Both sites share one
   * catalog; site sets the site of the page links returned.
   */
  site?: "buscape" | "zoom";
  /** relevance (the default, the site's own order), price_asc, price_desc, rating or price_drop. */
  sort?: "relevance" | "price_asc" | "price_desc" | "rating" | "price_drop";
  /** Results page, 1-based. total_pages reports the last one. */
  page?: number;
  /** Items per page, 1-100. Defaults to 30. */
  page_size?: number;
  /**
   * Facet filters, at most 8: {key: value or [values]}, keys and values exactly as facets[].key and
   * facets[].values[].value of an answer list them (e.g. Marca, Capacidade Total).
   */
  filters?: Record<string, unknown>;
  /** Lowest price in BRL. */
  price_min?: number;
  /** Highest price in BRL. */
  price_max?: number;
  /** true: marketplace sellers; false: the stores' own offers. */
  marketplace?: boolean;
  /**
   * Products whose best-selling store is this one (a store name as items[].stores[].name gives it).
   */
  store?: string;
  [key: string]: unknown;
}

export interface BuscapeDealLandingOptions {
  /**
   * buscape (the default, www.buscape.com.br) or zoom (www.zoom.com.br). Both sites share one
   * catalog; site sets the site of the page links returned.
   */
  site?: "buscape" | "zoom";
  /**
   * A campaign landing slug or link, e.g. black-friday, oferta-do-dia-buscape (Buscape) or
   * black-friday-zoom (Zoom).
   */
  slug: string;
  [key: string]: unknown;
}

export interface BuscapeStoreOptions {
  /**
   * buscape (the default, www.buscape.com.br) or zoom (www.zoom.com.br). Both sites share one
   * catalog; site sets the site of the page links returned.
   */
  site?: "buscape" | "zoom";
  /** The store id (items[].stores[].id, offers[].store.id). Send store_id or store. */
  store_id?: string | number;
  /**
   * The store page path <slug>-<id> or its link
   * (https://www.buscape.com.br/cupom-de-desconto/kabum!-21), instead of store_id.
   */
  store?: string;
  [key: string]: unknown;
}

export interface BuscapeSuggestionsOptions {
  /**
   * buscape (the default, www.buscape.com.br) or zoom (www.zoom.com.br). Both sites share one
   * catalog; site sets the site of the page links returned.
   */
  site?: "buscape" | "zoom";
  /** What the shopper has typed so far. */
  query: string;
  /** Suggestions, 1-20. Defaults to 8. */
  limit?: number;
  [key: string]: unknown;
}

export interface BuscapeShippingOptions {
  /**
   * buscape (the default, www.buscape.com.br) or zoom (www.zoom.com.br). Both sites share one
   * catalog; site sets the site of the page links returned.
   */
  site?: "buscape" | "zoom";
  /** The product id: items[].product_id of search, category or deals. */
  product_id: string | number;
  /** The Brazilian CEP to deliver to (8 digits). */
  cep: string | number;
  /**
   * The CEP's state, a two-letter UF: AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB,
   * PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO.
   */
  state: string;
  /** The CEP's city, as written in Portuguese. */
  city: string;
  /** Which offers to estimate: price_asc (the default) or another offers sort. */
  sort?: "default" | "price_asc" | "price_desc" | "installment_price_asc" | "discount_desc" | "cashback_price_asc";
  /** Offers to estimate, 1-50. Defaults to 10. */
  page_size?: number;
  /** A variant (variant_filters[].values[].variant_id, e.g. a voltage): offers of that variant. */
  variant_id?: string | number;
  [key: string]: unknown;
}

export class BuscapeNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = BUSCAPE_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/buscape/${path}`, options, undefined, timeout);
  }

  /**
   * Search Buscape and Zoom (buscape.com.br, zoom.com.br, Brazil's price comparison sites). Scavio
   * fetches the public page on request; the sites have no public API. site picks buscape (the
   * default) or zoom: one catalog, the same ids. Brazil: Portuguese text, prices in BRL. By
   * keyword, up to 100 per page, sorted (relevance, price, rating, price drop) and filtered by any
   * facet (brand, capacity...), price range, category, marketplace or best-selling store. Costs 1
   * credit.
   */
  async search(options: BuscapeSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category of Buscape and Zoom (buscape.com.br, zoom.com.br, Brazil's price comparison
   * sites). Scavio fetches the public page on request; the sites have no public API. site picks
   * buscape (the default) or zoom: one catalog, the same ids. Brazil: Portuguese text, prices in
   * BRL. By id or slug, sorted and filtered like search: category {id, name, slug, type, url},
   * breadcrumb [{id, name, slug, type}] (branch to category). Costs 1 credit.
   */
  async category(options: BuscapeCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The category tree of Buscape and Zoom (buscape.com.br, zoom.com.br, Brazil's price comparison
   * sites). Scavio fetches the public page on request; the sites have no public API. site picks
   * buscape (the default) or zoom. Costs 1 credit.
   */
  async categories(options: BuscapeCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One product of Buscape and Zoom (buscape.com.br, zoom.com.br, Brazil's price comparison sites).
   * Scavio fetches the public page on request; the sites have no public API. site picks buscape
   * (the default) or zoom. Costs 1 credit.
   */
  async product(options: BuscapeProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Every store offer for one product of Buscape and Zoom (buscape.com.br, zoom.com.br, Brazil's
   * price comparison sites). Scavio fetches the public page on request; the sites have no public
   * API. site picks buscape (the default) or zoom. Costs 1 credit.
   */
  async offers(options: BuscapeOffersOptions): Promise<Record<string, unknown>> {
    return this.post("offers", options);
  }

  /**
   * The price history of one product of Buscape and Zoom (buscape.com.br, zoom.com.br, Brazil's
   * price comparison sites). Scavio fetches the public page on request; the sites have no public
   * API. site picks buscape (the default) or zoom. Costs 1 credit.
   */
  async priceHistory(options: BuscapePriceHistoryOptions): Promise<Record<string, unknown>> {
    return this.post("price-history", options);
  }

  /**
   * The lowest current price of one product of Buscape and Zoom (buscape.com.br, zoom.com.br,
   * Brazil's price comparison sites). Scavio fetches the public page on request; the sites have no
   * public API. site picks buscape (the default) or zoom. Costs 1 credit.
   */
  async lowestPrice(options: BuscapeLowestPriceOptions): Promise<Record<string, unknown>> {
    return this.post("lowest-price", options);
  }

  /**
   * The deals list of Buscape and Zoom (buscape.com.br, zoom.com.br, Brazil's price comparison
   * sites). Scavio fetches the public page on request; the sites have no public API. site picks
   * buscape (the default) or zoom: one catalog, the same ids. Brazil: Portuguese text, prices in
   * BRL. As the site's Ofertas page builds it (products scoring 0.8 or more on its competitiveness
   * index), by category or keyword, sorted and filtered like search. Costs 1 credit.
   */
  async deals(options: BuscapeDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * One campaign landing of Buscape and Zoom (buscape.com.br, zoom.com.br, Brazil's price
   * comparison sites). Scavio fetches the public page on request; the sites have no public API.
   * site picks buscape (the default) or zoom. Costs 1 credit.
   */
  async dealLanding(options: BuscapeDealLandingOptions): Promise<Record<string, unknown>> {
    return this.post("deal-landing", options);
  }

  /**
   * One store on Buscape and Zoom (buscape.com.br, zoom.com.br, Brazil's price comparison sites).
   * Scavio fetches the public page on request; the sites have no public API. site picks buscape
   * (the default) or zoom. Costs 1 credit.
   */
  async store(options: BuscapeStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }

  /**
   * Search suggestions of Buscape and Zoom (buscape.com.br, zoom.com.br, Brazil's price comparison
   * sites). Scavio fetches the public page on request; the sites have no public API. site picks
   * buscape (the default) or zoom. Costs 1 credit.
   */
  async suggestions(options: BuscapeSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * Freight estimates for one product of Buscape and Zoom (buscape.com.br, zoom.com.br, Brazil's
   * price comparison sites). Scavio fetches the public page on request; the sites have no public
   * API. site picks buscape (the default) or zoom. Costs 1 credit.
   */
  async shipping(options: BuscapeShippingOptions): Promise<Record<string, unknown>> {
    return this.post("shipping", options);
  }
}
