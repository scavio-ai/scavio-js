import type { Scavio } from "../client.js";

// Williams-Sonoma, Inc. brands (Williams Sonoma, Pottery Barn, Pottery Barn Kids, Pottery Barn
// Teen, West Elm, Rejuvenation, Mark and Graham, chosen with brand) product, configurator,
// deliveryEstimate, stock, storePickup, stores, floorSamples, categories, category, search,
// popularSearches and reviews endpoints; market us (ca for product), 1 credit each, 5 for search
// and category. Generated from the backend routes: every option and its doc mirrors the API's own
// request schema; an input the API only accepts to refuse (a 400 that says 'not offered') is left
// out. The server enforces the value rules and the one-of rules (send one of an id or a link).
// Every call raises the request timeout to WILLIAMSSONOMA_TIMEOUT and never lowers a longer client
// timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every williamssonoma call. */
export const WILLIAMSSONOMA_TIMEOUT = 240_000;

export interface WilliamssonomaProductOptions {
  /**
   * The brand: williams_sonoma, pottery_barn, pottery_barn_kids, pottery_barn_teen, west_elm,
   * rejuvenation, mark_and_graham. Served on this endpoint: us: every brand; ca: williams_sonoma,
   * pottery_barn, west_elm. Any other brand / market answers 400 "not available for this brand /
   * market" before anything is charged.
   */
  brand?: "williams_sonoma" | "pottery_barn" | "pottery_barn_kids" | "pottery_barn_teen" | "west_elm" | "rejuvenation" | "mark_and_graham";
  /**
   * us (default; USD) or ca (the brand's Canadian site, English, CAD; Williams Sonoma, Pottery Barn
   * and West Elm, on product).
   */
  market?: "us" | "ca";
  /** The product id: the part after /products/ in a product link (items[].product_id). */
  product?: string;
  /** A product link on the brand site, instead of product (brand and market are read from it). */
  url?: string;
  [key: string]: unknown;
}

export interface WilliamssonomaConfiguratorOptions {
  /**
   * The brand: williams_sonoma, pottery_barn, pottery_barn_kids, pottery_barn_teen, west_elm,
   * rejuvenation, mark_and_graham. Served on this endpoint: us: pottery_barn. Any other brand /
   * market answers 400 "not available for this brand / market" before anything is charged.
   */
  brand?: "williams_sonoma" | "pottery_barn" | "pottery_barn_kids" | "pottery_barn_teen" | "west_elm" | "rejuvenation" | "mark_and_graham";
  /** us (default); ca is not served on this endpoint. */
  market?: "us" | "ca";
  /** A configurator base SKU (product configurator_base_skus). */
  base_sku?: string;
  /** The product id: the part after /products/ in a product link (items[].product_id). */
  product?: string;
  /** A product link on the brand site, instead of product (brand and market are read from it). */
  url?: string;
  [key: string]: unknown;
}

export interface WilliamssonomaDeliveryEstimateOptions {
  /**
   * The brand: williams_sonoma, pottery_barn, pottery_barn_kids, pottery_barn_teen, west_elm,
   * rejuvenation, mark_and_graham. Served on this endpoint: us: every brand. Any other brand /
   * market answers 400 "not available for this brand / market" before anything is charged.
   */
  brand?: "williams_sonoma" | "pottery_barn" | "pottery_barn_kids" | "pottery_barn_teen" | "west_elm" | "rejuvenation" | "mark_and_graham";
  /** us (default); ca is not served on this endpoint. */
  market?: "us" | "ca";
  /** The US ZIP code to deliver to. */
  zip: string | number;
  /** The product id: the part after /products/ in a product link (items[].product_id). */
  product?: string;
  /** A product link on the brand site, instead of product (brand and market are read from it). */
  url?: string;
  /** Up to 20 SKU ids (product skus[].sku), instead of product. */
  skus?: string | string[];
  [key: string]: unknown;
}

export interface WilliamssonomaStockOptions {
  /**
   * The brand: williams_sonoma, pottery_barn, pottery_barn_kids, pottery_barn_teen, west_elm,
   * rejuvenation, mark_and_graham. Served on this endpoint: us: every brand. Any other brand /
   * market answers 400 "not available for this brand / market" before anything is charged.
   */
  brand?: "williams_sonoma" | "pottery_barn" | "pottery_barn_kids" | "pottery_barn_teen" | "west_elm" | "rejuvenation" | "mark_and_graham";
  /** us (default); ca is not served on this endpoint. */
  market?: "us" | "ca";
  /** The product id (required, or url). */
  product?: string;
  /** A product link on the brand site, instead of product (brand and market are read from it). */
  url?: string;
  /** Optional: limits the answer to these SKU ids of the product. */
  skus?: string | string[];
  /**
   * Optional US ZIP code for the regional in-stock lists (default 10001). The unit ranges are
   * national.
   */
  zip?: string | number;
  [key: string]: unknown;
}

export interface WilliamssonomaStorePickupOptions {
  /**
   * The brand: williams_sonoma, pottery_barn, pottery_barn_kids, pottery_barn_teen, west_elm,
   * rejuvenation, mark_and_graham. Served on this endpoint: us: williams_sonoma, pottery_barn,
   * pottery_barn_kids, pottery_barn_teen, west_elm, rejuvenation. Any other brand / market answers
   * 400 "not available for this brand / market" before anything is charged.
   */
  brand: "williams_sonoma" | "pottery_barn" | "pottery_barn_kids" | "pottery_barn_teen" | "west_elm" | "rejuvenation" | "mark_and_graham";
  /** us (default); ca is not served on this endpoint. */
  market?: "us" | "ca";
  /** Up to 20 SKU ids (product skus[].sku). */
  skus: string | string[];
  /** Up to 10 store codes (stores[].pickup_location_code, e.g. ST:0859). */
  stores: string | string[];
  [key: string]: unknown;
}

export interface WilliamssonomaStoresOptions {
  /**
   * Brands to list (default every brand with stores: williams_sonoma, pottery_barn,
   * pottery_barn_kids, pottery_barn_teen, west_elm, rejuvenation). Mark and Graham has no stores.
   */
  brands?: string | string[];
  /** A US ZIP code (placed at its Census centroid). Pass zip or latitude + longitude. */
  zip?: string | number;
  /** Latitude (with longitude), instead of zip. */
  latitude?: number;
  /** Longitude (with latitude). */
  longitude?: number;
  /** Radius in miles, 1-200 (default 25). */
  radius?: number;
  /** Include outlet stores (default false). */
  include_outlets?: boolean;
  [key: string]: unknown;
}

export interface WilliamssonomaFloorSamplesOptions {
  /**
   * The brand: williams_sonoma, pottery_barn, pottery_barn_kids, pottery_barn_teen, west_elm,
   * rejuvenation, mark_and_graham. Served on this endpoint: us: williams_sonoma, pottery_barn,
   * pottery_barn_kids, pottery_barn_teen, west_elm, rejuvenation. Any other brand / market answers
   * 400 "not available for this brand / market" before anything is charged.
   */
  brand?: "williams_sonoma" | "pottery_barn" | "pottery_barn_kids" | "pottery_barn_teen" | "west_elm" | "rejuvenation" | "mark_and_graham";
  /** us (default); ca is not served on this endpoint. */
  market?: "us" | "ca";
  /** The product id: the part after /products/ in a product link (items[].product_id). */
  product?: string;
  /** A product link on the brand site, instead of product (brand and market are read from it). */
  url?: string;
  /** A SKU id, instead of product. */
  sku?: string;
  /** A US ZIP code. Pass zip or latitude + longitude. */
  zip?: string | number;
  /** Latitude (with longitude), instead of zip. */
  latitude?: number;
  /** Longitude (with latitude). */
  longitude?: number;
  /** Radius in miles, 1-200 (default 50). */
  radius?: number;
  [key: string]: unknown;
}

export interface WilliamssonomaCategoriesOptions {
  /**
   * The brand: williams_sonoma, pottery_barn, pottery_barn_kids, pottery_barn_teen, west_elm,
   * rejuvenation, mark_and_graham. Served on this endpoint: us: every brand. Any other brand /
   * market answers 400 "not available for this brand / market" before anything is charged.
   */
  brand: "williams_sonoma" | "pottery_barn" | "pottery_barn_kids" | "pottery_barn_teen" | "west_elm" | "rejuvenation" | "mark_and_graham";
  /** us (default); ca is not served on this endpoint. */
  market?: "us" | "ca";
  /**
   * A top-level category id (categories[].id): returns its full subtree. Leave out for the
   * top-level list.
   */
  category?: string;
  [key: string]: unknown;
}

export interface WilliamssonomaCategoryOptions {
  /**
   * The brand: williams_sonoma, pottery_barn, pottery_barn_kids, pottery_barn_teen, west_elm,
   * rejuvenation, mark_and_graham. Served on this endpoint: us: pottery_barn. Any other brand /
   * market answers 400 "not available for this brand / market" before anything is charged.
   */
  brand: "williams_sonoma" | "pottery_barn" | "pottery_barn_kids" | "pottery_barn_teen" | "west_elm" | "rejuvenation" | "mark_and_graham";
  /** us (default); ca is not served on this endpoint. */
  market?: "us" | "ca";
  /**
   * A category path under /shop/ (categories[].path without /shop/), e.g. furniture/sofas or a sale
   * path.
   */
  path?: string;
  /** A category link on the brand site, instead of path. */
  url?: string;
  /**
   * featured (default), price_asc, price_desc, newest or best_selling (the site's category sorts).
   */
  sort?: "featured" | "price_asc" | "price_desc" | "newest" | "best_selling";
  [key: string]: unknown;
}

export interface WilliamssonomaSearchOptions {
  /**
   * The brand: williams_sonoma, pottery_barn, pottery_barn_kids, pottery_barn_teen, west_elm,
   * rejuvenation, mark_and_graham. Served on this endpoint: us: williams_sonoma, pottery_barn. Any
   * other brand / market answers 400 "not available for this brand / market" before anything is
   * charged.
   */
  brand: "williams_sonoma" | "pottery_barn" | "pottery_barn_kids" | "pottery_barn_teen" | "west_elm" | "rejuvenation" | "mark_and_graham";
  /** us (default); ca is not served on this endpoint. */
  market?: "us" | "ca";
  /** Search keywords. */
  query: string;
  [key: string]: unknown;
}

export interface WilliamssonomaPopularSearchesOptions {
  /**
   * The brand: williams_sonoma, pottery_barn, pottery_barn_kids, pottery_barn_teen, west_elm,
   * rejuvenation, mark_and_graham. Served on this endpoint: us: every brand. Any other brand /
   * market answers 400 "not available for this brand / market" before anything is charged.
   */
  brand: "williams_sonoma" | "pottery_barn" | "pottery_barn_kids" | "pottery_barn_teen" | "west_elm" | "rejuvenation" | "mark_and_graham";
  /** us (default); ca is not served on this endpoint. */
  market?: "us" | "ca";
  [key: string]: unknown;
}

export interface WilliamssonomaReviewsOptions {
  /**
   * The brand: williams_sonoma, pottery_barn, pottery_barn_kids, pottery_barn_teen, west_elm,
   * rejuvenation, mark_and_graham. Served on this endpoint: us: williams_sonoma. Any other brand /
   * market answers 400 "not available for this brand / market" before anything is charged.
   */
  brand?: "williams_sonoma" | "pottery_barn" | "pottery_barn_kids" | "pottery_barn_teen" | "west_elm" | "rejuvenation" | "mark_and_graham";
  /** us (default); ca is not served on this endpoint. */
  market?: "us" | "ca";
  /** A Williams Sonoma product id. */
  product?: string;
  /** A product link on the brand site, instead of product (brand and market are read from it). */
  url?: string;
  /** Page, 1-5: page 1 holds 8 reviews, every later page 30 (newest to oldest). */
  page?: number;
  [key: string]: unknown;
}

export class WilliamssonomaNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = WILLIAMSSONOMA_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/williamssonoma/${path}`, options, undefined, timeout);
  }

  /**
   * One product of the Williams-Sonoma, Inc. brands (Williams Sonoma, Pottery Barn, Pottery Barn
   * Kids, Pottery Barn Teen, West Elm, Rejuvenation, Mark and Graham). Scavio fetches the brand's
   * public page on request; the brands have no public API. Every answer carries brand, brand_name,
   * market, currency, language and host. By brand + product id or a product link, us or ca
   * (Williams Sonoma, Pottery Barn and West Elm in Canada, in CAD). Costs 1 credit.
   */
  async product(options: WilliamssonomaProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * The fabric configurator of a made-to-order piece of the Williams-Sonoma, Inc. brands (Williams
   * Sonoma, Pottery Barn, Pottery Barn Kids, Pottery Barn Teen, West Elm, Rejuvenation, Mark and
   * Graham). Scavio fetches the brand's public page on request; the brands have no public API.
   * Every answer carries brand, brand_name, market, currency, language and host. By base SKU
   * (product configurator_base_skus) or product. Costs 1 credit.
   */
  async configurator(options: WilliamssonomaConfiguratorOptions): Promise<Record<string, unknown>> {
    return this.post("configurator", options);
  }

  /**
   * Standard-delivery dates to a US ZIP code for every SKU of a product, or for up to 20 SKUs, of
   * the Williams-Sonoma, Inc. brands (Williams Sonoma, Pottery Barn, Pottery Barn Kids, Pottery
   * Barn Teen, West Elm, Rejuvenation, Mark and Graham). Scavio fetches the brand's public page on
   * request; the brands have no public API. Every answer carries brand, brand_name, market,
   * currency, language and host. Costs 1 credit.
   */
  async deliveryEstimate(options: WilliamssonomaDeliveryEstimateOptions): Promise<Record<string, unknown>> {
    return this.post("delivery-estimate", options);
  }

  /**
   * Online stock ranges per SKU of one product of the Williams-Sonoma, Inc. brands (Williams
   * Sonoma, Pottery Barn, Pottery Barn Kids, Pottery Barn Teen, West Elm, Rejuvenation, Mark and
   * Graham). Scavio fetches the brand's public page on request; the brands have no public API.
   * Every answer carries brand, brand_name, market, currency, language and host. Costs 1 credit.
   */
  async stock(options: WilliamssonomaStockOptions): Promise<Record<string, unknown>> {
    return this.post("stock", options);
  }

  /**
   * Store pickup per SKU per store of the Williams-Sonoma, Inc. brands (Williams Sonoma, Pottery
   * Barn, Pottery Barn Kids, Pottery Barn Teen, West Elm, Rejuvenation, Mark and Graham). Scavio
   * fetches the brand's public page on request; the brands have no public API. Every answer carries
   * brand, brand_name, market, currency, language and host. For up to 20 SKUs at up to 10 stores
   * (store codes from stores). Costs 1 credit.
   */
  async storePickup(options: WilliamssonomaStorePickupOptions): Promise<Record<string, unknown>> {
    return this.post("store-pickup", options);
  }

  /**
   * The stores of the Williams-Sonoma, Inc. brands (Williams Sonoma, Pottery Barn, Pottery Barn
   * Kids, Pottery Barn Teen, West Elm, Rejuvenation, Mark and Graham). Scavio fetches the brand's
   * public page on request; the brands have no public API. Every answer carries brand, brand_name,
   * market, currency, language and host. Near a US ZIP code or a point, every brand in one call (or
   * the brands asked for), by distance. Costs 1 credit.
   */
  async stores(options: WilliamssonomaStoresOptions): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * The stores showing one furniture piece on their floor, for the Williams-Sonoma, Inc. brands
   * (Williams Sonoma, Pottery Barn, Pottery Barn Kids, Pottery Barn Teen, West Elm, Rejuvenation,
   * Mark and Graham). Scavio fetches the brand's public page on request; the brands have no public
   * API. Every answer carries brand, brand_name, market, currency, language and host. By product or
   * SKU near a US ZIP code or a point. Costs 1 credit.
   */
  async floorSamples(options: WilliamssonomaFloorSamplesOptions): Promise<Record<string, unknown>> {
    return this.post("floor-samples", options);
  }

  /**
   * The category tree of one brand of the Williams-Sonoma, Inc. brands (Williams Sonoma, Pottery
   * Barn, Pottery Barn Kids, Pottery Barn Teen, West Elm, Rejuvenation, Mark and Graham). Scavio
   * fetches the brand's public page on request; the brands have no public API. Every answer carries
   * brand, brand_name, market, currency, language and host. Including the Sale and Black Friday
   * listings. Without category. Costs 1 credit.
   */
  async categories(options: WilliamssonomaCategoriesOptions): Promise<Record<string, unknown>> {
    return this.post("categories", options);
  }

  /**
   * One category listing of the Williams-Sonoma, Inc. brands (Williams Sonoma, Pottery Barn,
   * Pottery Barn Kids, Pottery Barn Teen, West Elm, Rejuvenation, Mark and Graham). Scavio fetches
   * the brand's public page on request; the brands have no public API. Every answer carries brand,
   * brand_name, market, currency, language and host. By path or category link, in the site's sorts
   * (featured, price_asc, price_desc, newest, best_selling). Sale and Black Friday listings are
   * category paths. Costs 5 credits.
   */
  async category(options: WilliamssonomaCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * Keyword search on one brand of the Williams-Sonoma, Inc. brands (Williams Sonoma, Pottery Barn,
   * Pottery Barn Kids, Pottery Barn Teen, West Elm, Rejuvenation, Mark and Graham). Scavio fetches
   * the brand's public page on request; the brands have no public API. Every answer carries brand,
   * brand_name, market, currency, language and host. Costs 5 credits.
   */
  async search(options: WilliamssonomaSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * The day's most searched terms on one brand of the Williams-Sonoma, Inc. brands (Williams
   * Sonoma, Pottery Barn, Pottery Barn Kids, Pottery Barn Teen, West Elm, Rejuvenation, Mark and
   * Graham). Scavio fetches the brand's public page on request; the brands have no public API.
   * Every answer carries brand, brand_name, market, currency, language and host. The list the
   * brand's own search box shows. Costs 1 credit.
   */
  async popularSearches(options: WilliamssonomaPopularSearchesOptions): Promise<Record<string, unknown>> {
    return this.post("popular-searches", options);
  }

  /**
   * Customer reviews of one Williams Sonoma product (the other brands show no reviews), newest to
   * oldest. Costs 1 credit.
   */
  async reviews(options: WilliamssonomaReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options);
  }
}
