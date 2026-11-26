import type { Scavio } from "../client.js";

// Boots (boots.com, the UK health and beauty retailer, and boots.ie) product, storeStock, stores
// and store endpoints; markets uk and ie; 1 credit each (2 when the answer comes on a second
// attempt). No search endpoint: start from a product link. Generated from the backend routes: every
// option and its doc mirrors the API's own request schema; an input the API only accepts to refuse
// (a 400 that says 'not offered') is left out. The server enforces the value rules and the one-of
// rules (send one of an id or a link). Every call raises the request timeout to BOOTS_TIMEOUT and
// never lowers a longer client timeout. Failed upstream calls and refused inputs are not charged; a
// not-found is charged (credits_used is what was charged).

/** Minimum request timeout (ms) for every boots call. */
export const BOOTS_TIMEOUT = 240_000;

export interface BootsProductOptions {
  /** A Boots product link (www.boots.com or www.boots.ie; the market follows the link). */
  url?: string;
  /**
   * The 8 digits a Boots product link ends with. Looked up in Boots' product list first (one more
   * call, usually 5 to 20 seconds).
   */
  product_id?: string | number;
  /**
   * uk (boots.com, GBP, default) or ie (boots.ie, EUR; its own prices, and some UK products are not
   * sold there).
   */
  market?: "uk" | "ie";
  [key: string]: unknown;
}

export interface BootsStoreStockOptions {
  /**
   * product's variants[].item_code (a shade or size, 11 digits), or the product's own 8-digit id
   * when it has no shades or sizes.
   */
  item_code: string | number;
  /** product's catentry_id. */
  catentry_id: string | number;
  /**
   * uk (boots.com, GBP, default) or ie (boots.ie, EUR; its own prices, and some UK products are not
   * sold there).
   */
  market?: "uk" | "ie";
  /** A full UK postcode (uk only). */
  postcode?: string;
  /** With longitude: stores near a point. Required on ie (stores returns the point for a town). */
  latitude?: number;
  /** With latitude. */
  longitude?: number;
  [key: string]: unknown;
}

export interface BootsStoresOptions {
  /**
   * uk (boots.com, GBP, default) or ie (boots.ie, EUR; its own prices, and some UK products are not
   * sold there).
   */
  market?: "uk" | "ie";
  /** A full UK postcode (uk). */
  postcode?: string;
  /** A town or city (uk and ie). */
  city?: string;
  [key: string]: unknown;
}

export interface BootsStoreOptions {
  /**
   * A Boots store page slug or link (boots.com /stores/868-london-battersea-sw11-1qn, boots.ie
   * /stores/cork-boots-patrick-street).
   */
  store?: string;
  /** stores[].store_number (boots.com): found on Boots' store A-Z list (one more call). */
  store_number?: string | number;
  /**
   * stores[].name, exactly (for boots.ie, whose store pages are not numbered): found on Boots'
   * store A-Z list (one more call).
   */
  name?: string;
  /**
   * uk (boots.com, GBP, default) or ie (boots.ie, EUR; its own prices, and some UK products are not
   * sold there).
   */
  market?: "uk" | "ie";
  [key: string]: unknown;
}

export class BootsNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = BOOTS_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/boots/${path}`, options, undefined, timeout);
  }

  /**
   * One product of Boots (boots.com, the UK health and beauty retailer with over 1,800 stores, and
   * boots.ie in Ireland). Scavio fetches the public Boots page on request. By link or 8-digit
   * product id. Costs 1 credit; 2 when the answer comes on a second attempt (3 for two-step
   * lookups). credits_used in the response is the exact charge.
   */
  async product(options: BootsProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Whether the Boots stores near a UK postcode or a point have one product (or one shade or size)
   * of Boots (boots.com, the UK health and beauty retailer with over 1,800 stores, and boots.ie in
   * Ireland). Scavio fetches the public Boots page on request. Costs 1 credit; 2 when the answer
   * comes on a second attempt (3 for two-step lookups). credits_used in the response is the exact
   * charge.
   */
  async storeStock(options: BootsStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /**
   * Boots stores near a UK postcode or a town (uk and ie) of Boots (boots.com, the UK health and
   * beauty retailer with over 1,800 stores, and boots.ie in Ireland). Scavio fetches the public
   * Boots page on request. Costs 1 credit; 2 when the answer comes on a second attempt (3 for
   * two-step lookups). credits_used in the response is the exact charge.
   */
  async stores(options: BootsStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * One store page of Boots (boots.com, the UK health and beauty retailer with over 1,800 stores,
   * and boots.ie in Ireland). Scavio fetches the public Boots page on request. By store page slug
   * or link, store_number (boots.com) or exact name. Costs 1 credit; 2 when the answer comes on a
   * second attempt (3 for two-step lookups). credits_used in the response is the exact charge.
   */
  async store(options: BootsStoreOptions): Promise<Record<string, unknown>> {
    return this.post("store", options);
  }
}
