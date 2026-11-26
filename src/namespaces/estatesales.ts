import type { Scavio } from "../client.js";

// EstateSales.net (estatesales.net, the US estate sale directory) sales, sale, companies, company,
// search and item endpoints; US only, prices in USD, 1 credit each. Generated from the backend
// routes: every option and its doc mirrors the API's own request schema; an input the API only
// accepts to refuse (a 400 that says 'not offered') is left out. The server enforces the value
// rules and the one-of rules (send one of an id or a link). Every call raises the request timeout
// to ESTATESALES_TIMEOUT and never lowers a longer client timeout. Failed upstream calls and
// refused inputs are not charged; a not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every estatesales call. */
export const ESTATESALES_TIMEOUT = 240_000;

export interface EstatesalesSalesOptions {
  /** A 5-digit US ZIP code: the sales around it. */
  zip?: string;
  /** Or a city (with state): EstateSales.net lists the sales of its metro area. */
  city?: string;
  /** A US state code (the 50 states and DC). */
  state?: "AL" | "AK" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "DC" | "FL" | "GA" | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME" | "MD" | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH" | "NJ" | "NM" | "NY" | "NC" | "ND" | "OH" | "OK" | "OR" | "PA" | "RI" | "SC" | "SD" | "TN" | "TX" | "UT" | "VT" | "VA" | "WA" | "WV" | "WI" | "WY";
  /**
   * any (default), today, tomorrow or 15_days (starting within 15 days), read as the site's own
   * date filter reads each sale.
   */
  when?: "any" | "today" | "tomorrow" | "15_days";
  /**
   * Sale types to keep: estate_sales, auctions, moving_sales, business_closings,
   * moved_offsite_to_warehouse, by_appointment, online_only_auctions, auction_house,
   * moved_offsite_to_store, charity_sales, outside_sales, single_item_type_collections,
   * buyouts_or_cleanouts, demolition_sales, online_estate_sales.
   */
  type?: "estate_sales" | "auctions" | "moving_sales" | "business_closings" | "moved_offsite_to_warehouse" | "by_appointment" | "online_only_auctions" | "auction_house" | "moved_offsite_to_store" | "charity_sales" | "outside_sales" | "single_item_type_collections" | "buyouts_or_cleanouts" | "demolition_sales" | "online_estate_sales" | Array<"estate_sales" | "auctions" | "moving_sales" | "business_closings" | "moved_offsite_to_warehouse" | "by_appointment" | "online_only_auctions" | "auction_house" | "moved_offsite_to_store" | "charity_sales" | "outside_sales" | "single_item_type_collections" | "buyouts_or_cleanouts" | "demolition_sales" | "online_estate_sales">;
  /**
   * distance (default: the site's order, nearest first), start_date, end_date, newest (first
   * published) or most_pictures.
   */
  sort?: "distance" | "start_date" | "end_date" | "newest" | "most_pictures";
  [key: string]: unknown;
}

export interface EstatesalesSaleOptions {
  /** An EstateSales.net sale id (sales[].sale_id). */
  sale_id?: string | number;
  /** Or the sale link (sales[].url), e.g. https://www.estatesales.net/TX/Garland/75041/5114622. */
  url?: string;
  [key: string]: unknown;
}

export interface EstatesalesCompaniesOptions {
  /** A US state code (the 50 states and DC). */
  state: "AL" | "AK" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "DC" | "FL" | "GA" | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME" | "MD" | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH" | "NJ" | "NM" | "NY" | "NC" | "ND" | "OH" | "OK" | "OR" | "PA" | "RI" | "SC" | "SD" | "TN" | "TX" | "UT" | "VT" | "VA" | "WA" | "WV" | "WI" | "WY";
  /**
   * The metro area as EstateSales.net names it (Dallas-Fort-Worth-Arlington, New-York) or a city in
   * it (Dallas).
   */
  metro?: string;
  /** Alias of metro: a city resolves to its metro area. */
  city?: string;
  [key: string]: unknown;
}

export interface EstatesalesCompanyOptions {
  /** An EstateSales.net company id (companies[].org_id, sales[].company.org_id). */
  org_id?: string | number;
  /**
   * Or the company link (companies[].page_url), e.g.
   * https://www.estatesales.net/companies/TX/Arlington/76017/14402.
   */
  url?: string;
  [key: string]: unknown;
}

export interface EstatesalesSearchOptions {
  /** A keyword: searches sales and marketplace items. */
  query: string;
  /** Page of 24, 1 to 4. */
  page?: number;
  [key: string]: unknown;
}

export interface EstatesalesItemOptions {
  /** An EstateSales.net marketplace item id (search items[].item_id). */
  item_id?: string | number;
  /** Or the item link, e.g. https://www.estatesales.net/marketplace/items/2038603. */
  url?: string;
  [key: string]: unknown;
}

export class EstatesalesNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = ESTATESALES_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/estatesales/${path}`, options, undefined, timeout);
  }

  /**
   * Estate sales, auctions and moving sales near a US ZIP code or in a city's metro area on
   * EstateSales.net (estatesales.net, the US estate sale directory run by Vintage Software). Scavio
   * fetches the public EstateSales.net page on request. Costs 1 credit.
   */
  async sales(options: EstatesalesSalesOptions): Promise<Record<string, unknown>> {
    return this.post("sales", options);
  }

  /** One estate sale in full by sale id or link. Costs 1 credit. */
  async sale(options: EstatesalesSaleOptions): Promise<Record<string, unknown>> {
    return this.post("sale", options);
  }

  /** Every estate sale company EstateSales.net lists for a US metro area. Costs 1 credit. */
  async companies(options: EstatesalesCompaniesOptions): Promise<Record<string, unknown>> {
    return this.post("companies", options);
  }

  /** One estate sale company's public page by org id or link. Costs 1 credit. */
  async company(options: EstatesalesCompanyOptions): Promise<Record<string, unknown>> {
    return this.post("company", options);
  }

  /**
   * EstateSales.net's keyword search over estate sales and marketplace items, 24 a page (pages 1 to
   * 4). Costs 1 credit.
   */
  async search(options: EstatesalesSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /** One EstateSales.net marketplace item by item id or link. Costs 1 credit. */
  async item(options: EstatesalesItemOptions): Promise<Record<string, unknown>> {
    return this.post("item", options);
  }
}
