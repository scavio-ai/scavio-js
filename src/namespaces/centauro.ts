import type { Scavio } from "../client.js";

// Centauro (centauro.com.br, the sporting-goods retailer of Grupo SBF) search, category, deals,
// product, freight, stores and suggestions endpoints; Brazil only, prices in BRL, delivery and
// store pickup by CEP, 1 credit each. Generated from the backend routes: every option and its doc
// mirrors the API's own request schema. The server enforces the value rules and the one-of rules
// (send one of an id or a link). Every call raises the request timeout to CENTAURO_TIMEOUT and
// never lowers a longer client timeout. Failed upstream calls and refused inputs are not charged; a
// not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every centauro call. */
export const CENTAURO_TIMEOUT = 240_000;

export interface CentauroSearchOptions {
  /** Search keywords (Portuguese, as a shopper types them). */
  query: string;
  /** relevance (default), discount, price_asc or price_desc (the site's 4 sorts). */
  sort?: "relevance" | "discount" | "price_asc" | "price_desc";
  /**
   * Facet value(s) as key:value (facets[].values[].filter), up to 10. Keys: marca, tamanho, genero,
   * produto, preco, esportes, modalidade, categorias, cor, desconto, idade, linha, promocao, loja,
   * vendidopor.
   */
  filters?: string | string[];
  /** Brand facet value(s) (marca), e.g. nike or asics. */
  brand?: string | string[];
  /**
   * Store facet value(s) (loja): the products a physical store carries (stores[].filter or facets
   * loja values).
   */
  store?: string | string[];
  /**
   * Sold-by facet value(s) (vendidopor): centauro or a marketplace seller such as nikecombr or
   * adidas.
   */
  seller?: string | string[];
  /** Results page, 1-278 (36 per page; the site caps the total at 10000). */
  page?: number;
  [key: string]: unknown;
}

export interface CentauroCategoryOptions {
  /**
   * A category as its centauro.com.br /nav/ path or link (key / value pairs, as the site's
   * breadcrumb links write them), or one facet value such as categorias:calcados.
   */
  path: string;
  /** relevance (default), discount, price_asc or price_desc (the site's 4 sorts). */
  sort?: "relevance" | "discount" | "price_asc" | "price_desc";
  /**
   * Facet value(s) as key:value (facets[].values[].filter), up to 10. Keys: marca, tamanho, genero,
   * produto, preco, esportes, modalidade, categorias, cor, desconto, idade, linha, promocao, loja,
   * vendidopor.
   */
  filters?: string | string[];
  /** Brand facet value(s) (marca), e.g. nike or asics. */
  brand?: string | string[];
  /**
   * Store facet value(s) (loja): the products a physical store carries (stores[].filter or facets
   * loja values).
   */
  store?: string | string[];
  /**
   * Sold-by facet value(s) (vendidopor): centauro or a marketplace seller such as nikecombr or
   * adidas.
   */
  seller?: string | string[];
  /** Results page, 1-278 (36 per page; the site caps the total at 10000). */
  page?: number;
  [key: string]: unknown;
}

export interface CentauroDealsOptions {
  /**
   * black-friday, outlet, mega-oferta (black-friday is the default), or another /hotsite/ slug or
   * link of the site.
   */
  deal?: string;
  /** relevance (default), discount, price_asc or price_desc (the site's 4 sorts). */
  sort?: "relevance" | "discount" | "price_asc" | "price_desc";
  /**
   * Facet value(s) as key:value (facets[].values[].filter), up to 10. Keys: marca, tamanho, genero,
   * produto, preco, esportes, modalidade, categorias, cor, desconto, idade, linha, promocao, loja,
   * vendidopor.
   */
  filters?: string | string[];
  /** Brand facet value(s) (marca), e.g. nike or asics. */
  brand?: string | string[];
  /**
   * Store facet value(s) (loja): the products a physical store carries (stores[].filter or facets
   * loja values).
   */
  store?: string | string[];
  /**
   * Sold-by facet value(s) (vendidopor): centauro or a marketplace seller such as nikecombr or
   * adidas.
   */
  seller?: string | string[];
  /** Results page, 1-278 (36 per page; the site caps the total at 10000). */
  page?: number;
  [key: string]: unknown;
}

export interface CentauroProductOptions {
  /** The Centauro product id: model + colour (items[].product_id, colors[].product_id). */
  product_id?: string;
  /** The model code, with color, instead of product_id. */
  model?: string;
  /** The colour code (colors[].color_code), with model. */
  color?: string;
  /** A centauro.com.br product link with its ?cor= colour, instead of product_id. */
  url?: string;
  [key: string]: unknown;
}

export interface CentauroFreightOptions {
  /** A size sku (sizes[].sku of the product endpoint, or items[].size_skus). */
  sku: string;
  /** A Brazilian CEP (8 digits). */
  cep: string;
  [key: string]: unknown;
}

export interface CentauroStoresOptions {
  /** A Brazilian CEP (8 digits). */
  cep: string;
  [key: string]: unknown;
}

export interface CentauroSuggestionsOptions {
  /** The start of a search, as a shopper types it. */
  query: string;
  [key: string]: unknown;
}

export class CentauroNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = CENTAURO_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/centauro/${path}`, options, undefined, timeout);
  }

  /**
   * Search Centauro (centauro.com.br, the sporting-goods retailer of Grupo SBF). Scavio fetches the
   * public centauro.com.br data on request; Centauro has no public product API. Brazil: Portuguese
   * (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. By keyword. 36 per
   * page, pages 1-278, in the site's 4 sorts (relevance, discount, price_asc, price_desc), filtered
   * by any facet value. Costs 1 credit.
   */
  async search(options: CentauroSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category listing of Centauro (centauro.com.br, the sporting-goods retailer of Grupo SBF).
   * Scavio fetches the public centauro.com.br data on request; Centauro has no public product API.
   * Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in.
   * By its /nav/ path or link (/nav/categorias/calcados/produto/tenis) or a facet value
   * (categorias:calcados), sorted and filtered like search. 36 per page, pages 1-278, in the site's
   * 4 sorts (relevance, discount, price_asc, price_desc), filtered by any facet value. Costs 1
   * credit.
   */
  async category(options: CentauroCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * A deal list of Centauro (centauro.com.br, the sporting-goods retailer of Grupo SBF). Scavio
   * fetches the public centauro.com.br data on request; Centauro has no public product API. Brazil:
   * Portuguese (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. The
   * Black Friday hotsite (black-friday, default), the outlet or the Mega Oferta promotion, or
   * another hotsite slug, sorted and filtered like search. The site publishes no start or end dates
   * for its deals. 36 per page, pages 1-278, in the site's 4 sorts (relevance, discount, price_asc,
   * price_desc), filtered by any facet value. Costs 1 credit.
   */
  async deals(options: CentauroDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }

  /**
   * One product of Centauro (centauro.com.br, the sporting-goods retailer of Grupo SBF). Scavio
   * fetches the public centauro.com.br data on request; Centauro has no public product API. Brazil:
   * Portuguese (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in. By
   * product_id (model + colour), model + color or link. Costs 1 credit.
   */
  async product(options: CentauroProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Delivery and store pickup for one size of Centauro (centauro.com.br, the sporting-goods
   * retailer of Grupo SBF). Scavio fetches the public centauro.com.br data on request; Centauro has
   * no public product API. Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to a visitor
   * who is not signed in. By size sku and CEP. Costs 1 credit.
   */
  async freight(options: CentauroFreightOptions): Promise<Record<string, unknown>> {
    return this.post("freight", options);
  }

  /**
   * The physical stores of Centauro (centauro.com.br, the sporting-goods retailer of Grupo SBF).
   * Scavio fetches the public centauro.com.br data on request; Centauro has no public product API.
   * Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in.
   * Near a CEP, by distance. Costs 1 credit.
   */
  async stores(options: CentauroStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * The search suggestions of Centauro (centauro.com.br, the sporting-goods retailer of Grupo SBF).
   * Scavio fetches the public centauro.com.br data on request; Centauro has no public product API.
   * Brazil: Portuguese (pt-BR) text and prices in BRL, as shown to a visitor who is not signed in.
   * For the start of a search. Costs 1 credit.
   */
  async suggestions(options: CentauroSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }
}
