import type { Scavio } from "../client.js";

// PetSmart: 6 endpoints, 1 credit each.
//
// Prices are national, in dollars, with the Autoship first-order and
// recurring price on product(). Stock is a unit count per store: stores()
// with a sku, storeStock() for up to 20 SKUs at one store, availability() for
// up to 20 store and SKU pairs. Store numbers come from stores().

export type PetsmartSort =
  | "relevance"
  | "best_sellers"
  | "price_low"
  | "price_high"
  | "top_rated"
  | "new_arrivals";

export type PetsmartPet = "dog" | "cat" | "fish" | "small_pet" | "reptile" | "bird";

export interface PetsmartSearchOptions {
  /** Search keywords (1-200 characters). */
  query: string;
  /** Results page, 1-based (1-100). */
  page?: number;
  /** Results per page (1-40; default 40). */
  limit?: number;
  /** PetSmart store number from stores(), e.g. "1658". Lists only products in stock at that store, each with in_stock_at_store. */
  store_id?: string;
  /** relevance (default), best_sellers, price_low, price_high, top_rated or new_arrivals. */
  sort?: PetsmartSort;
  [key: string]: unknown;
}

export interface PetsmartProductOptions {
  /** Product id: the number at the end of a product URL (...-570.html), a search result's web_style_id. Pass exactly one of web_style_id, sku or url. */
  web_style_id?: string;
  /** One SKU (a size or flavor), a search result's sku. Returns the whole product it belongs to. */
  sku?: string;
  /** A petsmart.com product page URL. */
  url?: string;
  [key: string]: unknown;
}

export interface PetsmartStoresOptions {
  /** US ZIP code to search around. */
  zip: string;
  /** Search radius in miles (1-100; default 30). */
  radius?: number;
  /** A SKU. Each store then also carries its quantity and in_stock for it. */
  sku?: string;
  [key: string]: unknown;
}

export interface PetsmartStoreStockOptions {
  /** PetSmart store number from stores(), e.g. "1658". */
  store_id: string;
  /** 1-20 SKUs, e.g. every variant of a product. */
  skus: string[];
  [key: string]: unknown;
}

export interface PetsmartAvailabilityPair {
  /** PetSmart store number. */
  store_id: string;
  /** PetSmart SKU. */
  sku: string;
}

export interface PetsmartAvailabilityOptions {
  /** 1-20 store and SKU pairs, mixed freely. */
  pairs: PetsmartAvailabilityPair[];
  [key: string]: unknown;
}

export interface PetsmartDealsOptions {
  /** Only deals for this pet: dog, cat, fish, small_pet, reptile or bird. */
  pet?: PetsmartPet;
  /** One sale event by its exact name from the events list of a previous deals() answer, e.g. "Sale > November > Dog Sale". */
  event?: string;
  /** Keywords to search within the sale. */
  query?: string;
  /** Results page, 1-based (1-100). */
  page?: number;
  /** Results per page (1-40; default 40). */
  limit?: number;
  /** PetSmart store number: only products in stock at that store. */
  store_id?: string;
  /** relevance (default), best_sellers, price_low, price_high, top_rated or new_arrivals. */
  sort?: PetsmartSort;
  [key: string]: unknown;
}

export class PetsmartNamespace {
  constructor(private client: Scavio) {}

  /**
   * Search PetSmart products, up to 40 per page: SKU, web_style_id, name,
   * brand, UPC, price, original and sale price, price range across sizes,
   * rating, review count, image, size, variations, category, pets,
   * promotions, stores_in_stock (how many stores stock it), pickup and
   * Autoship eligibility and URL. Prices are national. Pass store_id to list
   * only products in stock at that store.
   *
   * Costs 1 credit.
   */
  async search(options: PetsmartSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/petsmart/search", options);
  }

  /**
   * One PetSmart product by web_style_id, SKU or URL, with every variant
   * (size, flavor): SKU, UPC, price, original price, sale price and end date,
   * Autoship discount with first-order and recurring price, ship-to-home
   * stock, pickup and same-day options, images and promotions. Also brand,
   * rating, review count, categories and description. An unknown id is a 404.
   *
   * Costs 1 credit.
   */
  async product(options: PetsmartProductOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/petsmart/product", options);
  }

  /**
   * The 12 PetSmart stores nearest a US ZIP code: store_id, name, address,
   * phone, coordinates, distance in miles, time zone, the next 7 days of
   * hours and services (grooming, PetsHotel, veterinary, adoptions). Pass a
   * sku and each store also carries quantity and in_stock for it.
   *
   * Costs 1 credit.
   */
  async stores(options: PetsmartStoresOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/petsmart/stores", options);
  }

  /**
   * Stock of up to 20 SKUs at one PetSmart store: units for in-store pickup
   * at that store, units to ship to home, and a nearby alternate store with
   * its count when the store has none. Includes the store's address and
   * pickup options. An unknown store is a 404; an unknown SKU reads 0.
   *
   * Costs 1 credit.
   */
  async storeStock(options: PetsmartStoreStockOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/petsmart/store-stock", options);
  }

  /**
   * Unit counts for up to 20 store and SKU pairs in one call, mixing stores
   * and SKUs freely: quantity and in_stock per pair. Unknown stores or SKUs
   * read 0.
   *
   * Costs 1 credit.
   */
  async availability(options: PetsmartAvailabilityOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/petsmart/availability", options);
  }

  /**
   * Products in PetSmart's Sale section, up to 40 per page, in the same shape
   * as search, plus the current sale events with approximate product counts.
   * The Sale section also lists points and Autoship promotions, so on_sale
   * marks the rows whose price is actually reduced.
   *
   * Costs 1 credit.
   */
  async deals(options: PetsmartDealsOptions = {}): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/petsmart/deals", options);
  }
}
