import type { Scavio } from "../client.js";

// Menards: 2 endpoints. stores costs 1 credit; product costs 1, or 2 with a
// store_id.
//
// There is no search: product() takes an item id (the number after p- in a
// menards.com URL) or the URL. Prices carry the mail-in rebates (such as the
// 11% rebate) and the final price after rebates. store_id adds that store's
// stock quantity and aisle and can take 10-40 seconds, so product() raises
// the request timeout to MENARDS_PRODUCT_TIMEOUT when the client's is
// shorter.

/** Minimum request timeout (ms) for menards.product(). */
export const MENARDS_PRODUCT_TIMEOUT = 120_000;

export interface MenardsProductOptions {
  /** Menards item id: the number after p- in a menards.com product URL, e.g. "60893666613". Not the SKU or model number. Pass this or url. */
  item_id?: string;
  /** A menards.com product URL. */
  url?: string;
  /** Menards store number from stores(), e.g. "3181". Adds that store's stock quantity, stock message and aisle; costs 2 credits instead of 1. Without it, prices are the default store's and stock fields are null. */
  store_id?: string;
  [key: string]: unknown;
}

export interface MenardsStoresOptions {
  /** US ZIP code to search around. Pass this, or city and state. */
  zip?: string;
  /** City to search around, with state. */
  city?: string;
  /** 2-letter US state code, with city, e.g. "WI". */
  state?: string;
  [key: string]: unknown;
}

export class MenardsNamespace {
  constructor(private client: Scavio) {}

  /**
   * One Menards product by item id or URL: name, brand, model number, SKU,
   * description, bullets, specifications, images, videos and documents, with
   * the full price ladder: everyday price, sale price and end date, mail-in
   * rebates (text, amount, dates), final price after rebates and you_save.
   * Also pickup, delivery and ship-to-store flags. With store_id, that store's
   * stock quantity, stock message, aisle location and not_available_at_store.
   * An unknown item id or store number is a 404.
   *
   * Costs 1 credit, or 2 with store_id.
   */
  async product(options: MenardsProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/menards/product", options, undefined, MENARDS_PRODUCT_TIMEOUT);
  }

  /**
   * Menards stores near a US ZIP code or a city and state, nearest first:
   * store_id, name, address, coordinates, distance in miles and services
   * (garden center, grocery, rental center, propane and more).
   *
   * Costs 1 credit.
   */
  async stores(options: MenardsStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/menards/stores", options);
  }
}
