import type { Scavio } from "../client.js";

// Netshoes (netshoes.com.br, Brazil's sporting-goods store, part of Magalu) search, list, product,
// offers, inventory, shipping, reviews, questions, daily deal, seller and popular searches
// endpoints; Brazil only, prices in BRL with every seller's offer per size, 1 credit each.
// Generated from the backend routes: every option and its doc mirrors the API's own request schema.
// The server enforces the value rules and the one-of rules (send one of an id or a link). Every
// call raises the request timeout to NETSHOES_TIMEOUT and never lowers a longer client timeout.
// Failed upstream calls and refused inputs are not charged; a not-found is charged (credits_used is
// what was charged).

/** Minimum request timeout (ms) for every netshoes call. */
export const NETSHOES_TIMEOUT = 240_000;

export interface NetshoesSearchOptions {
  /** Search keywords (Portuguese, as a shopper types them). */
  query: string;
  /**
   * relevance (default), best_sellers, new_releases, offers, price_asc, price_desc or top_rated:
   * the site's 7 sorts.
   */
  sort?: "relevance" | "best_sellers" | "new_releases" | "offers" | "price_asc" | "price_desc" | "top_rated";
  /**
   * Facet filters: {key: value or [values]} with facets[].key and facets[].values[].value of an
   * answer (marca, tamanho, genero, tipo-de-produto, cor-principal, departamento, promocoes,
   * vendido-por, pisada and more, as the listing offers them). Up to 12 values.
   */
  filters?: Record<string, unknown>;
  /** Brand facet value(s) (marca), e.g. nike or adidas. */
  brand?: string | string[];
  /** Gender facet value(s) (genero): masculino, feminino, unissex, menino, menina ... */
  gender?: string | string[];
  /** Size facet value(s) (tamanho), e.g. 42 or m. */
  size?: string | string[];
  /** Sold-by facet value(s) (vendido-por): netshoes-netshoes or a marketplace seller's value. */
  seller?: string | string[];
  /** Lowest price in BRL. */
  price_min?: number;
  /** Highest price in BRL. */
  price_max?: number;
  /** Results page, 1-100 (100 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface NetshoesListOptions {
  /** A list slug or its netshoes.com.br/lst/ link (tenis-black-friday is the default). */
  slug?: string;
  /**
   * relevance (default), best_sellers, new_releases, offers, price_asc, price_desc or top_rated:
   * the site's 7 sorts.
   */
  sort?: "relevance" | "best_sellers" | "new_releases" | "offers" | "price_asc" | "price_desc" | "top_rated";
  /**
   * Facet filters: {key: value or [values]} with facets[].key and facets[].values[].value of an
   * answer (marca, tamanho, genero, tipo-de-produto, cor-principal, departamento, promocoes,
   * vendido-por, pisada and more, as the listing offers them). Up to 12 values.
   */
  filters?: Record<string, unknown>;
  /** Brand facet value(s) (marca), e.g. nike or adidas. */
  brand?: string | string[];
  /** Gender facet value(s) (genero): masculino, feminino, unissex, menino, menina ... */
  gender?: string | string[];
  /** Size facet value(s) (tamanho), e.g. 42 or m. */
  size?: string | string[];
  /** Sold-by facet value(s) (vendido-por): netshoes-netshoes or a marketplace seller's value. */
  seller?: string | string[];
  /** Lowest price in BRL. */
  price_min?: number;
  /** Highest price in BRL. */
  price_max?: number;
  /** Results page, 1-250 (45 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface NetshoesProductOptions {
  /**
   * The Netshoes product id: the colour code (items[].product_id, colors[].product_id). A size sku
   * works too.
   */
  product_id?: string;
  /** A netshoes.com.br product link, instead of product_id. */
  url?: string;
  [key: string]: unknown;
}

export interface NetshoesOffersOptions {
  /** A size sku (sizes[].sku of the product endpoint). */
  sku: string;
  [key: string]: unknown;
}

export interface NetshoesInventoryOptions {
  /** A size sku (sizes[].sku of the product endpoint). */
  sku: string;
  /** The seller (sizes[].offers[].seller.id; 0 is Netshoes). Default: the size's buy-box seller. */
  seller_id?: string | number;
  [key: string]: unknown;
}

export interface NetshoesShippingOptions {
  /** A size sku (sizes[].sku of the product endpoint). */
  sku: string;
  /** A Brazilian CEP (8 digits). */
  cep: string;
  /** Quote this seller's offer (default: the buy-box seller). */
  seller_id?: string | number;
  [key: string]: unknown;
}

export interface NetshoesReviewsOptions {
  /** The product code shared by every colour (product_code), or a colour product id or size sku. */
  product_id?: string;
  /** A netshoes.com.br product link, instead of product_id. */
  url?: string;
  /** Page, 1-based (13 per page). */
  page?: number;
  /** positive (5 and 4 stars), negative (2 and 1 star), or star values, e.g. [3]. */
  rating?: "positive" | "negative" | number | number[];
  /** Reviews with photos. */
  with_photos?: boolean;
  [key: string]: unknown;
}

export interface NetshoesQuestionsOptions {
  /** The product code (product_code), or a colour product id or size sku. */
  product_id?: string;
  /** A netshoes.com.br product link, instead of product_id. */
  url?: string;
  /** Page, 1-based (10 per page). */
  page?: number;
  [key: string]: unknown;
}

export interface NetshoesDailyDealOptions {
  [key: string]: unknown;
}

export interface NetshoesSellerOptions {
  /** A marketplace seller id (sizes[].offers[].seller.id, daily_deal items[].seller_ids). */
  seller_id: string | number;
  /** The seller's name slug (name_slug), optional. */
  name?: string;
  [key: string]: unknown;
}

export interface NetshoesPopularSearchesOptions {
  [key: string]: unknown;
}

export class NetshoesNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = NETSHOES_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/netshoes/${path}`, options, undefined, timeout);
  }

  /**
   * Search Netshoes (netshoes.com.br, Brazil's sporting-goods store, part of Magalu). Scavio
   * fetches the public netshoes.com.br data on request; Netshoes has no public product API. Brazil:
   * Portuguese (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. By
   * keyword. 100 per page, pages 1-100, in the site's 7 sorts, filtered by any facet of the listing
   * (brand, size, gender, product type, colour, department, promotion, sold-by and the rest, plus a
   * BRL price range). Costs 1 credit.
   */
  async search(options: NetshoesSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * A list page of Netshoes (netshoes.com.br, Brazil's sporting-goods store, part of Magalu).
   * Scavio fetches the public netshoes.com.br data on request; Netshoes has no public product API.
   * Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in.
   * By its slug or /lst/ link (tenis-black-friday, the Black Friday sneakers, is the default),
   * sorted and filtered like search. 45 per page, pages 1-250, in the site's 7 sorts, filtered by
   * any facet of the listing (brand, size, gender, product type, colour, department, promotion,
   * sold-by and the rest, plus a BRL price range). Costs 1 credit.
   */
  async list(options: NetshoesListOptions = {}): Promise<Record<string, unknown>> {
    return this.post("list", options);
  }

  /**
   * One product of Netshoes (netshoes.com.br, Brazil's sporting-goods store, part of Magalu).
   * Scavio fetches the public netshoes.com.br data on request; Netshoes has no public product API.
   * Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in.
   * By product_id (the colour code), a size sku or a link. Costs 1 credit.
   */
  async product(options: NetshoesProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Every seller's offer for one size of Netshoes (netshoes.com.br, Brazil's sporting-goods store,
   * part of Magalu). Scavio fetches the public netshoes.com.br data on request; Netshoes has no
   * public product API. Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to a visitor
   * who is not signed in. By size sku. Costs 1 credit.
   */
  async offers(options: NetshoesOffersOptions): Promise<Record<string, unknown>> {
    return this.post("offers", options);
  }

  /**
   * The online stock count for one size of Netshoes (netshoes.com.br, Brazil's sporting-goods
   * store, part of Magalu). Scavio fetches the public netshoes.com.br data on request; Netshoes has
   * no public product API. Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to a visitor
   * who is not signed in. By size sku and, optionally, seller. Costs 1 credit.
   */
  async inventory(options: NetshoesInventoryOptions): Promise<Record<string, unknown>> {
    return this.post("inventory", options);
  }

  /**
   * Delivery options for one size of Netshoes (netshoes.com.br, Brazil's sporting-goods store, part
   * of Magalu). Scavio fetches the public netshoes.com.br data on request; Netshoes has no public
   * product API. Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to a visitor who is
   * not signed in. By size sku and CEP. Costs 1 credit.
   */
  async shipping(options: NetshoesShippingOptions): Promise<Record<string, unknown>> {
    return this.post("shipping", options);
  }

  /**
   * Product reviews of Netshoes (netshoes.com.br, Brazil's sporting-goods store, part of Magalu).
   * Scavio fetches the public netshoes.com.br data on request; Netshoes has no public product API.
   * Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in.
   * By product code (or a colour id, sku or link), 13 per page, filtered by stars (positive,
   * negative or star values) and photos. Costs 1 credit.
   */
  async reviews(options: NetshoesReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }

  /**
   * Shoppers' questions on a product of Netshoes (netshoes.com.br, Brazil's sporting-goods store,
   * part of Magalu). Scavio fetches the public netshoes.com.br data on request; Netshoes has no
   * public product API. Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to a visitor
   * who is not signed in. By product code (or a colour id, sku or link), 10 per page. Costs 1
   * credit.
   */
  async questions(options: NetshoesQuestionsOptions): Promise<Record<string, unknown>> {
    return this.post("questions", options);
  }

  /**
   * The daily offer ("Barato do Dia") of Netshoes (netshoes.com.br, Brazil's sporting-goods store,
   * part of Magalu). Scavio fetches the public netshoes.com.br data on request; Netshoes has no
   * public product API. Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to a visitor
   * who is not signed in. The daily offer's dates and products. The answer carries no prices: send
   * a product_id to product. Costs 1 credit.
   */
  async dailyDeal(options: NetshoesDailyDealOptions = {}): Promise<Record<string, unknown>> {
    return this.post("daily-deal", options);
  }

  /**
   * A marketplace seller of Netshoes (netshoes.com.br, Brazil's sporting-goods store, part of
   * Magalu). Scavio fetches the public netshoes.com.br data on request; Netshoes has no public
   * product API. Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to a visitor who is
   * not signed in. By seller id. Costs 1 credit.
   */
  async seller(options: NetshoesSellerOptions): Promise<Record<string, unknown>> {
    return this.post("seller", options);
  }

  /**
   * The popular searches of Netshoes (netshoes.com.br, Brazil's sporting-goods store, part of
   * Magalu). Scavio fetches the public netshoes.com.br data on request; Netshoes has no public
   * product API. Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to a visitor who is
   * not signed in. The popular searches as the site's search box lists them. Costs 1 credit.
   */
  async popularSearches(options: NetshoesPopularSearchesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("popular-searches", options);
  }
}
