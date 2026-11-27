import type { Scavio } from "../client.js";

// Cobasi (cobasi.com.br, the Brazilian pet store of Grupo Petz Cobasi) search, category, brand,
// deals, product, reviews, questions, availability, suggestions, stores and store endpoints; Brazil
// only, prices in BRL, pickup and delivery flags by CEP, 1 credit each. Generated from the backend
// routes: every option and its doc mirrors the API's own request schema. The server enforces the
// value rules and the one-of rules (send one of an id or a link). Every call raises the request
// timeout to COBASI_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and
// refused inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every cobasi call. */
export const COBASI_TIMEOUT = 240_000;

export interface CobasiSearchOptions {
  /** Search keywords, in Portuguese as shoppers type them. */
  query: string;
  /**
   * relevance (the default), price_asc, price_desc or discount_desc (largest discount at the top).
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "discount_desc";
  /**
   * Results page, 1-based, 20 products per page. Cobasi stops paging at page 50 (1,000 products).
   */
  page?: number;
  /**
   * Facet filters, at most 10: values exactly as facets[].values[].value of an answer lists them,
   * e.g. brand/golden, porte/racas-pequenas or category-1/cachorro. Values of one facet widen the
   * match; different facets narrow it.
   */
  filters?: string[];
  [key: string]: unknown;
}

export interface CobasiCategoryOptions {
  /**
   * A category path (a product's categories[].path, a category's subcategories[].path, or the path
   * after /c/ in a category link), e.g. cachorro or cachorro/racao/racao-seca.
   */
  category: string;
  /** top_selling (the default, ordered by Cobasi's sales), price_asc or price_desc. */
  sort?: "top_selling" | "price_asc" | "price_desc";
  /**
   * Results page, 1-based, 20 products per page. Cobasi stops paging at page 50 (1,000 products).
   */
  page?: number;
  [key: string]: unknown;
}

export interface CobasiBrandOptions {
  /**
   * A brand as its Cobasi link shows it (the part after /m/), e.g. golden, premier or gran-plus.
   */
  brand: string;
  /** top_selling (the default, ordered by Cobasi's sales), price_asc or price_desc. */
  sort?: "top_selling" | "price_asc" | "price_desc";
  /**
   * Results page, 1-based, 20 products per page. Cobasi stops paging at page 50 (1,000 products).
   */
  page?: number;
  [key: string]: unknown;
}

export interface CobasiDealsOptions {
  /**
   * relevance (the default), price_asc, price_desc or discount_desc (largest discount at the top).
   */
  sort?: "relevance" | "price_asc" | "price_desc" | "discount_desc";
  /**
   * Results page, 1-based, 20 products per page. Cobasi stops paging at page 50 (1,000 products).
   */
  page?: number;
  [key: string]: unknown;
}

export interface CobasiProductOptions {
  /**
   * The Cobasi product id (items[].product_id; the number before /p in a product link). Send
   * product_id or url.
   */
  product_id?: string | number;
  /**
   * A Cobasi product link (www.cobasi.com.br, ending in -<product id>/p), instead of product_id.
   */
  url?: string;
  [key: string]: unknown;
}

export interface CobasiReviewsOptions {
  /**
   * The Cobasi product id (items[].product_id; the number before /p in a product link). Send
   * product_id or url.
   */
  product_id?: string | number;
  /**
   * A Cobasi product link (www.cobasi.com.br, ending in -<product id>/p), instead of product_id.
   */
  url?: string;
  /** Page, 1-based, 4 per page. total_pages reports the last one. */
  page?: number;
  [key: string]: unknown;
}

export interface CobasiQuestionsOptions {
  /**
   * The Cobasi product id (items[].product_id; the number before /p in a product link). Send
   * product_id or url.
   */
  product_id?: string | number;
  /**
   * A Cobasi product link (www.cobasi.com.br, ending in -<product id>/p), instead of product_id.
   */
  url?: string;
  /** Page, 1-based, 4 per page. total_pages reports the last one. */
  page?: number;
  [key: string]: unknown;
}

export interface CobasiAvailabilityOptions {
  /** The Cobasi SKU id (skus[].sku_id of a product or a listing item; one size or variant). */
  sku_id: string | number;
  /** The Brazilian CEP to pick up near or deliver to (8 digits). */
  cep: string | number;
  /** Units, 1-10. Defaults to 1. */
  quantity?: number;
  [key: string]: unknown;
}

export interface CobasiSuggestionsOptions {
  /** The start of a search, as a shopper types it. */
  query: string;
  [key: string]: unknown;
}

export interface CobasiStoresOptions {
  /** A Brazilian state code (UF), e.g. SP or RJ. */
  state?: string;
  /** A city name; accents and case are ignored. */
  city?: string;
  [key: string]: unknown;
}

export interface CobasiStoreOptions {
  /** The store slug (stores[].slug). */
  slug?: string;
  /** A Cobasi store link (www.cobasi.com.br/lojas/<slug>), instead of slug. */
  url?: string;
  [key: string]: unknown;
}

export class CobasiNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = COBASI_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/cobasi/${path}`, options, undefined, timeout);
  }

  /**
   * Search Cobasi (cobasi.com.br, the Brazilian pet store of Grupo Petz Cobasi). Scavio fetches the
   * public Cobasi page on request. Brazil (pt-BR): Portuguese text, prices in BRL as shown to a
   * visitor who is not signed in. By keyword, sorted by relevance, price or discount and narrowed
   * by any facet (brand, department, size, age, flavour and more). 20 products per page; Cobasi
   * stops paging at page 50 (1,000 products). Costs 1 credit.
   */
  async search(options: CobasiSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category of Cobasi (cobasi.com.br, the Brazilian pet store of Grupo Petz Cobasi). Scavio
   * fetches the public Cobasi page on request. Brazil (pt-BR): Portuguese text, prices in BRL as
   * shown to a visitor who is not signed in. By category path, sorted by best sellers or price,
   * with the category, its subcategories [{category_id, name, path, has_children}] and facet
   * counts. 20 products per page; Cobasi stops paging at page 50 (1,000 products). Costs 1 credit.
   */
  async category(options: CobasiCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The products of one brand at Cobasi (cobasi.com.br, the Brazilian pet store of Grupo Petz
   * Cobasi). Scavio fetches the public Cobasi page on request. Brazil (pt-BR): Portuguese text,
   * prices in BRL as shown to a visitor who is not signed in. By brand slug, sorted by best sellers
   * or price. 20 products per page; Cobasi stops paging at page 50 (1,000 products). Costs 1
   * credit.
   */
  async brand(options: CobasiBrandOptions): Promise<Record<string, unknown>> {
    return this.post("brand", options);
  }

  /**
   * The deals page (Promoções) of Cobasi (cobasi.com.br, the Brazilian pet store of Grupo Petz
   * Cobasi). Scavio fetches the public Cobasi page on request. Brazil (pt-BR): Portuguese text,
   * prices in BRL as shown to a visitor who is not signed in. Products on promotion with the deal
   * price next to the regular price (list_price) and discount_percent, sorted by relevance, price
   * or discount. 20 products per page; Cobasi stops paging at page 50 (1,000 products). Costs 1
   * credit.
   */
  async deals(options: CobasiDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * One product of Cobasi (cobasi.com.br, the Brazilian pet store of Grupo Petz Cobasi). Scavio
   * fetches the public Cobasi page on request. Brazil (pt-BR): Portuguese text, prices in BRL as
   * shown to a visitor who is not signed in. By product_id or link: every SKU (size) with its
   * price, list price, installments, price per kg and, when the product can be subscribed, the
   * subscription (Compra Programada) price; specs, dimensions, rating and recent reviews.
   * Availability is a flag, not a unit count. Costs 1 credit.
   */
  async product(options: CobasiProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Customer reviews of one product of Cobasi (cobasi.com.br, the Brazilian pet store of Grupo Petz
   * Cobasi). Scavio fetches the public Cobasi page on request. In Cobasi's own recent-review order,
   * 4 per page. Costs 1 credit.
   */
  async reviews(options: CobasiReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * Shopper questions about one product of Cobasi (cobasi.com.br, the Brazilian pet store of Grupo
   * Petz Cobasi). Scavio fetches the public Cobasi page on request. Shopper questions with Cobasi's
   * answers, 4 per page; no asker names. Costs 1 credit.
   */
  async questions(options: CobasiQuestionsOptions): Promise<Record<string, unknown>> {
    return this.post("questions", options);
  }

  /**
   * Pickup and delivery for one SKU of Cobasi (cobasi.com.br, the Brazilian pet store of Grupo Petz
   * Cobasi). Scavio fetches the public Cobasi page on request. At a Brazilian CEP: the stores near
   * it that can hand the SKU over and the delivery options, for the quantity asked. Flags, not unit
   * counts. Costs 1 credit.
   */
  async availability(options: CobasiAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.post("availability", options);
  }

  /**
   * The search suggestions of Cobasi (cobasi.com.br, the Brazilian pet store of Grupo Petz Cobasi).
   * Scavio fetches the public Cobasi page on request. Up to 5 suggested terms for the start of a
   * search, and whether Cobasi corrected the spelling. Costs 1 credit.
   */
  async suggestions(options: CobasiSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * The store directory of Cobasi (cobasi.com.br, the Brazilian pet store of Grupo Petz Cobasi).
   * Scavio fetches the public Cobasi page on request. All Cobasi stores (about 250) with address,
   * coordinates and services, narrowed by state and city. Costs 1 credit.
   */
  async stores(options: CobasiStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One store of Cobasi (cobasi.com.br, the Brazilian pet store of Grupo Petz Cobasi). Scavio
   * fetches the public Cobasi page on request. By slug or link: address, coordinates, phone, hours
   * per weekday, grooming and vet hours where offered, and services. Costs 1 credit.
   */
  async store(options: CobasiStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }
}
