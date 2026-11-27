import type { Scavio } from "../client.js";

// Natura (the Brazilian beauty brand of Natura &Co; country br, ar, cl, co, mx or pe) search,
// category, categories, product, suggestions, stores and deals endpoints; local currency per
// market, stores Brazil only, 1 credit each. Generated from the backend routes: every option and
// its doc mirrors the API's own request schema. The server enforces the value rules and the one-of
// rules (send one of an id or a link). Every call raises the request timeout to NATURA_TIMEOUT and
// never lowers a longer client timeout. Failed upstream calls and refused inputs are not charged; a
// not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every natura call. */
export const NATURA_TIMEOUT = 240_000;

export interface NaturaSearchOptions {
  /** Search keywords, in the market's language. */
  query: string;
  /**
   * The storefront: br (www.natura.com.br, BRL), ar (www.naturacosmeticos.com.ar, ARS), cl
   * (www.natura.cl, CLP), co (www.natura.com.co, COP), mx (www.natura.com.mx, MXN), pe
   * (www.natura.com.pe, PEN). Default br.
   */
  country?: "br" | "ar" | "cl" | "co" | "mx" | "pe";
  /**
   * The market's own sorts (not every market offers every sort): br: best_sellers, relevance,
   * name_asc, name_desc, price_asc, price_desc, discount; ar: best_sellers, relevance, price_asc,
   * price_desc, name_asc, name_desc, brand, most_popular, discount; cl: best_sellers, discount,
   * price_asc, price_desc; co: best_sellers, name_asc, name_desc, price_asc, price_desc, discount;
   * mx: best_sellers, price_asc, price_desc, relevance, name_asc, name_desc, brand, most_popular;
   * pe: best_sellers, discount, name_asc, name_desc, price_asc, price_desc. Default: the site's
   * order.
   */
  sort?: "best_sellers" | "relevance" | "price_asc" | "price_desc" | "name_asc" | "name_desc" | "discount" | "brand" | "most_popular";
  /**
   * Refinements as the site names them: attribute -> value(s), from facets[].attribute and
   * facets[].values[].value (e.g. {"brand": "Kaiak", "natg_gender": "masculino"}). Up to 5
   * attributes.
   */
  filters?: Record<string, unknown>;
  /** Minimum price, whole units of the market's currency (the site's price filter). */
  min_price?: number;
  /** Maximum price, whole units of the market's currency. */
  max_price?: number;
  /** Results page (default 1). */
  page?: number;
  /** Products per page, 1-100 (default 24). Pages of 100 can take up to a minute. */
  page_size?: number;
  [key: string]: unknown;
}

export interface NaturaCategoryOptions {
  /**
   * A category id (categories[].category_id, e.g. maquiagem, perfumaria, refis) or the market's
   * /c/<id> link.
   */
  category_id: string;
  /**
   * The storefront: br (www.natura.com.br, BRL), ar (www.naturacosmeticos.com.ar, ARS), cl
   * (www.natura.cl, CLP), co (www.natura.com.co, COP), mx (www.natura.com.mx, MXN), pe
   * (www.natura.com.pe, PEN). Default br.
   */
  country?: "br" | "ar" | "cl" | "co" | "mx" | "pe";
  /**
   * The market's own sorts (not every market offers every sort): br: best_sellers, relevance,
   * name_asc, name_desc, price_asc, price_desc, discount; ar: best_sellers, relevance, price_asc,
   * price_desc, name_asc, name_desc, brand, most_popular, discount; cl: best_sellers, discount,
   * price_asc, price_desc; co: best_sellers, name_asc, name_desc, price_asc, price_desc, discount;
   * mx: best_sellers, price_asc, price_desc, relevance, name_asc, name_desc, brand, most_popular;
   * pe: best_sellers, discount, name_asc, name_desc, price_asc, price_desc. Default: the site's
   * order.
   */
  sort?: "best_sellers" | "relevance" | "price_asc" | "price_desc" | "name_asc" | "name_desc" | "discount" | "brand" | "most_popular";
  /**
   * Refinements as the site names them: attribute -> value(s), from facets[].attribute and
   * facets[].values[].value (e.g. {"brand": "Kaiak", "natg_gender": "masculino"}). Up to 5
   * attributes.
   */
  filters?: Record<string, unknown>;
  /** Minimum price, whole units of the market's currency (the site's price filter). */
  min_price?: number;
  /** Maximum price, whole units of the market's currency. */
  max_price?: number;
  /** Results page (default 1). */
  page?: number;
  /** Products per page, 1-100 (default 24). Pages of 100 can take up to a minute. */
  page_size?: number;
  [key: string]: unknown;
}

export interface NaturaCategoriesOptions {
  /**
   * The storefront: br (www.natura.com.br, BRL), ar (www.naturacosmeticos.com.ar, ARS), cl
   * (www.natura.cl, CLP), co (www.natura.com.co, COP), mx (www.natura.com.mx, MXN), pe
   * (www.natura.com.pe, PEN). Default br.
   */
  country?: "br" | "ar" | "cl" | "co" | "mx" | "pe";
  [key: string]: unknown;
}

export interface NaturaProductOptions {
  /**
   * A product id (items[].product_id, shades[].product_id), e.g. NATBRA-194225 or a shade master
   * NATBRA-PAI3379; the bare number (194225) takes the market's prefix.
   */
  product_id?: string;
  /**
   * The storefront: br (www.natura.com.br, BRL), ar (www.naturacosmeticos.com.ar, ARS), cl
   * (www.natura.cl, CLP), co (www.natura.com.co, COP), mx (www.natura.com.mx, MXN), pe
   * (www.natura.com.pe, PEN). Default br.
   */
  country?: "br" | "ar" | "cl" | "co" | "mx" | "pe";
  /**
   * A product link (https://www.natura.com.br/p/<name>/<id>) instead of product_id; it sets the
   * market.
   */
  url?: string;
  [key: string]: unknown;
}

export interface NaturaSuggestionsOptions {
  /** The start of a search. */
  query: string;
  /**
   * The storefront: br (www.natura.com.br, BRL), ar (www.naturacosmeticos.com.ar, ARS), cl
   * (www.natura.cl, CLP), co (www.natura.com.co, COP), mx (www.natura.com.mx, MXN), pe
   * (www.natura.com.pe, PEN). Default br.
   */
  country?: "br" | "ar" | "cl" | "co" | "mx" | "pe";
  [key: string]: unknown;
}

export interface NaturaStoresOptions {
  /** br (the store list is published on natura.com.br). */
  country?: "br";
  /**
   * Brazilian state code (UF): ac, al, am, ap, ba, ce, df, es, go, ma, mg, ms, mt, pa, pb, pe, pi,
   * pr, rj, rn, ro, rr, rs, sc, se, sp, to.
   */
  state?: string;
  /** City (accents and case ignored). */
  city?: string;
  /** A CEP or its leading digits (a CEP prefix). */
  cep?: string;
  /** own (aurora), franchise (franquia), athena or kiosk (quiosque), as the site labels them. */
  type?: "own" | "franchise" | "athena" | "kiosk";
  /** Page (default 1). */
  page?: number;
  /** Stores per page, 1-200 (default 50). */
  page_size?: number;
  [key: string]: unknown;
}

export interface NaturaDealsOptions {
  /**
   * The storefront: br (www.natura.com.br, BRL), ar (www.naturacosmeticos.com.ar, ARS), cl
   * (www.natura.cl, CLP), co (www.natura.com.co, COP), mx (www.natura.com.mx, MXN), pe
   * (www.natura.com.pe, PEN). Default br.
   */
  country?: "br" | "ar" | "cl" | "co" | "mx" | "pe";
  /**
   * Another campaign category instead of the market's Black Friday category (natura-friday in br,
   * ar, cl, co; promociones in mx and pe).
   */
  category_id?: string;
  /**
   * The market's own sorts (not every market offers every sort): br: best_sellers, relevance,
   * name_asc, name_desc, price_asc, price_desc, discount; ar: best_sellers, relevance, price_asc,
   * price_desc, name_asc, name_desc, brand, most_popular, discount; cl: best_sellers, discount,
   * price_asc, price_desc; co: best_sellers, name_asc, name_desc, price_asc, price_desc, discount;
   * mx: best_sellers, price_asc, price_desc, relevance, name_asc, name_desc, brand, most_popular;
   * pe: best_sellers, discount, name_asc, name_desc, price_asc, price_desc. Default: the site's
   * order.
   */
  sort?: "best_sellers" | "relevance" | "price_asc" | "price_desc" | "name_asc" | "name_desc" | "discount" | "brand" | "most_popular";
  /**
   * Refinements as the site names them: attribute -> value(s), from facets[].attribute and
   * facets[].values[].value (e.g. {"brand": "Kaiak", "natg_gender": "masculino"}). Up to 5
   * attributes.
   */
  filters?: Record<string, unknown>;
  /** Minimum price, whole units of the market's currency (the site's price filter). */
  min_price?: number;
  /** Maximum price, whole units of the market's currency. */
  max_price?: number;
  /** Results page (default 1). */
  page?: number;
  /** Products per page, 1-100 (default 24). Pages of 100 can take up to a minute. */
  page_size?: number;
  [key: string]: unknown;
}

export class NaturaNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = NATURA_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/natura/${path}`, options, undefined, timeout);
  }

  /**
   * Search Natura (the Brazilian beauty brand of Natura &Co), on its own storefronts in Brazil,
   * Argentina, Chile, Colombia, Mexico and Peru (country br, ar, cl, co, mx, pe). Scavio fetches
   * the public Natura page on request; Natura has no public product API. Text in the market's
   * language, prices in its currency as shown to a visitor who is not signed in (no consultant
   * prices, no regional prices by CEP / postal code). Natura's US store is not covered (its catalog
   * lists no products). By keyword, sorted by the market's own sorts and filtered by the site's
   * refinements (brand, product type, gender, fragrance family, skin type...) and price range.
   * Costs 1 credit.
   */
  async search(options: NaturaSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category listing of Natura (the Brazilian beauty brand of Natura &Co), on its own
   * storefronts in Brazil, Argentina, Chile, Colombia, Mexico and Peru (country br, ar, cl, co, mx,
   * pe). Scavio fetches the public Natura page on request; Natura has no public product API. Text
   * in the market's language, prices in its currency as shown to a visitor who is not signed in (no
   * consultant prices, no regional prices by CEP / postal code). Natura's US store is not covered
   * (its catalog lists no products). By category id or /c/ link, sorted and filtered like search.
   * Costs 1 credit.
   */
  async category(options: NaturaCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * The category menu of Natura (the Brazilian beauty brand of Natura &Co), on its own storefronts
   * in Brazil, Argentina, Chile, Colombia, Mexico and Peru (country br, ar, cl, co, mx, pe). Scavio
   * fetches the public Natura page on request; Natura has no public product API. Text in the
   * market's language, prices in its currency as shown to a visitor who is not signed in (no
   * consultant prices, no regional prices by CEP / postal code). Natura's US store is not covered
   * (its catalog lists no products). Costs 1 credit.
   */
  async categories(options: NaturaCategoriesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One product of Natura (the Brazilian beauty brand of Natura &Co), on its own storefronts in
   * Brazil, Argentina, Chile, Colombia, Mexico and Peru (country br, ar, cl, co, mx, pe). Scavio
   * fetches the public Natura page on request; Natura has no public product API. Text in the
   * market's language, prices in its currency as shown to a visitor who is not signed in (no
   * consultant prices, no regional prices by CEP / postal code). Natura's US store is not covered
   * (its catalog lists no products). By id or link. Costs 1 credit.
   */
  async product(options: NaturaProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The search suggestions of Natura (the Brazilian beauty brand of Natura &Co), on its own
   * storefronts in Brazil, Argentina, Chile, Colombia, Mexico and Peru (country br, ar, cl, co, mx,
   * pe). Scavio fetches the public Natura page on request; Natura has no public product API. Text
   * in the market's language, prices in its currency as shown to a visitor who is not signed in (no
   * consultant prices, no regional prices by CEP / postal code). Natura's US store is not covered
   * (its catalog lists no products). For the start of a search. Costs 1 credit.
   */
  async suggestions(options: NaturaSuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * The physical Natura stores in Brazil (natura.com.br store list, 1,093 stores on 2026-11-27),
   * filtered by state, city, CEP prefix and store type. Costs 1 credit.
   */
  async stores(options: NaturaStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * The Black Friday campaign listing of Natura (the Brazilian beauty brand of Natura &Co), on its
   * own storefronts in Brazil, Argentina, Chile, Colombia, Mexico and Peru (country br, ar, cl, co,
   * mx, pe). Scavio fetches the public Natura page on request; Natura has no public product API.
   * Text in the market's language, prices in its currency as shown to a visitor who is not signed
   * in (no consultant prices, no regional prices by CEP / postal code). Natura's US store is not
   * covered (its catalog lists no products). The market's campaign category (natura-friday in br,
   * ar, cl, co; promociones in mx and pe), sorted by discount where the market offers that sort (mx
   * does not), filtered like search. Costs 1 credit.
   */
  async deals(options: NaturaDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("deals", options);
  }
}
