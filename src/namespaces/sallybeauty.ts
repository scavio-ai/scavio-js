import type { Scavio } from "../client.js";

// Sally Beauty (sallybeauty.com, the US and Canadian beauty supply chain) and CosmoProf (its
// professional beauty distributor), chosen by site: search, category, clearance, product, stores,
// store stock, suggestions, brands and reviews endpoints, 1 credit each. Generated from the backend
// routes: every option and its doc mirrors the API's own request schema. The server enforces the
// value rules and the one-of rules (send one of an id or a link). Every call raises the request
// timeout to SALLYBEAUTY_TIMEOUT (reviews to SALLYBEAUTY_REVIEWS_TIMEOUT) and never lowers a longer
// client timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every sallybeauty call. */
export const SALLYBEAUTY_TIMEOUT = 180_000;
/** Minimum request timeout (ms) for sallybeauty.reviews(). */
export const SALLYBEAUTY_REVIEWS_TIMEOUT = 240_000;

export interface SallybeautySearchOptions {
  /** Search keywords. */
  query: string;
  /**
   * sally-us (sallybeauty.com, USD, the default), sally-ca (sallybeauty.ca, CAD), cosmoprof-us
   * (cosmoprofbeauty.com) or cosmoprof-ca (cosmoprofbeauty.ca). CosmoProf sells to licensed
   * professionals: no prices or stock.
   */
  site?: "sally-us" | "sally-ca" | "cosmoprof-us" | "cosmoprof-ca";
  /**
   * best_match (the default, the site's Top Sellers), price_asc, price_desc; top_rated on Sally
   * Beauty; brand and newest on CosmoProf.
   */
  sort?: "best_match" | "price_asc" | "price_desc" | "top_rated" | "brand" | "newest";
  /** Results page, 1-based. total_pages reports the last one. */
  page?: number;
  /** Products per page, 1-24. Defaults to 24. */
  page_size?: number;
  /**
   * Facet filters, at most 6: {attribute_id: value or [values]}, exactly as facets[].attribute_id
   * and facets[].values[].value list them (e.g. ValueBrand, ProductType, Features, onClearance on
   * Sally Beauty; brandcustom, productLine on CosmoProf).
   */
  filters?: Record<string, unknown>;
  /** Lowest price, in the site's currency (Sally Beauty sites; CosmoProf shows no prices). */
  price_min?: number;
  /** Highest price (Sally Beauty sites). */
  price_max?: number;
  [key: string]: unknown;
}

export interface SallybeautyCategoryOptions {
  /**
   * A category id as the site's menu names it, e.g. hair-color, shampoo, nails-clearance (Sally
   * Beauty) or shampoo (CosmoProf).
   */
  category: string;
  /**
   * sally-us (sallybeauty.com, USD, the default), sally-ca (sallybeauty.ca, CAD), cosmoprof-us
   * (cosmoprofbeauty.com) or cosmoprof-ca (cosmoprofbeauty.ca). CosmoProf sells to licensed
   * professionals: no prices or stock.
   */
  site?: "sally-us" | "sally-ca" | "cosmoprof-us" | "cosmoprof-ca";
  /**
   * best_match (the default, the site's Top Sellers), price_asc, price_desc; top_rated on Sally
   * Beauty; brand and newest on CosmoProf.
   */
  sort?: "best_match" | "price_asc" | "price_desc" | "top_rated" | "brand" | "newest";
  /** Results page, 1-based. total_pages reports the last one. */
  page?: number;
  /** Products per page, 1-24. Defaults to 24. */
  page_size?: number;
  /**
   * Facet filters, at most 6: {attribute_id: value or [values]}, exactly as facets[].attribute_id
   * and facets[].values[].value list them (e.g. ValueBrand, ProductType, Features, onClearance on
   * Sally Beauty; brandcustom, productLine on CosmoProf).
   */
  filters?: Record<string, unknown>;
  /** Lowest price, in the site's currency (Sally Beauty sites; CosmoProf shows no prices). */
  price_min?: number;
  /** Highest price (Sally Beauty sites). */
  price_max?: number;
  [key: string]: unknown;
}

export interface SallybeautyClearanceOptions {
  /**
   * sally-us (sallybeauty.com, USD, the default), sally-ca (sallybeauty.ca, CAD), cosmoprof-us
   * (cosmoprofbeauty.com) or cosmoprof-ca (cosmoprofbeauty.ca). CosmoProf sells to licensed
   * professionals: no prices or stock.
   */
  site?: "sally-us" | "sally-ca" | "cosmoprof-us" | "cosmoprof-ca";
  /**
   * Sally Beauty sites: hair_care (the default), hair_color, nails, tools or beauty. CosmoProf has
   * one clearance category: leave it out.
   */
  department?: "hair_care" | "hair_color" | "nails" | "tools" | "beauty";
  /**
   * best_match (the default, the site's Top Sellers), price_asc, price_desc; top_rated on Sally
   * Beauty; brand and newest on CosmoProf.
   */
  sort?: "best_match" | "price_asc" | "price_desc" | "top_rated" | "brand" | "newest";
  /** Results page, 1-based. total_pages reports the last one. */
  page?: number;
  /** Products per page, 1-24. Defaults to 24. */
  page_size?: number;
  /**
   * Facet filters, at most 6: {attribute_id: value or [values]}, exactly as facets[].attribute_id
   * and facets[].values[].value list them (e.g. ValueBrand, ProductType, Features, onClearance on
   * Sally Beauty; brandcustom, productLine on CosmoProf).
   */
  filters?: Record<string, unknown>;
  /** Lowest price, in the site's currency (Sally Beauty sites; CosmoProf shows no prices). */
  price_min?: number;
  /** Highest price (Sally Beauty sites). */
  price_max?: number;
  [key: string]: unknown;
}

export interface SallybeautyProductOptions {
  /**
   * A product id as items[].product_id lists it, or a size's variations[].values[].sku. Send
   * product_id or url.
   */
  product_id?: string;
  /**
   * sally-us (sallybeauty.com, USD, the default), sally-ca (sallybeauty.ca, CAD), cosmoprof-us
   * (cosmoprofbeauty.com) or cosmoprof-ca (cosmoprofbeauty.ca). CosmoProf sells to licensed
   * professionals: no prices or stock.
   */
  site?: "sally-us" | "sally-ca" | "cosmoprof-us" | "cosmoprof-ca";
  /**
   * A product link on the site (ending in /<product id>.html), instead of product_id; it also sets
   * site.
   */
  url?: string;
  [key: string]: unknown;
}

export interface SallybeautyStoresOptions {
  /**
   * sally-us (sallybeauty.com, USD, the default), sally-ca (sallybeauty.ca, CAD), cosmoprof-us
   * (cosmoprofbeauty.com) or cosmoprof-ca (cosmoprofbeauty.ca). CosmoProf sells to licensed
   * professionals: no prices or stock.
   */
  site?: "sally-us" | "sally-ca" | "cosmoprof-us" | "cosmoprof-ca";
  /**
   * A 5-digit ZIP code (US sites) or a Canadian postal code (Canadian sites); placed on its area's
   * center. Or send latitude + longitude.
   */
  postal_code?: string | number;
  /** Latitude of the point to search around, with longitude (instead of postal_code). */
  latitude?: number;
  /** Longitude of the point to search around, with latitude. */
  longitude?: number;
  /** Miles: 15, 30, 50, 100 (the site's own choices). Defaults to 15. */
  radius?: number;
  [key: string]: unknown;
}

export interface SallybeautyStoreStockOptions {
  /**
   * A product id as items[].product_id lists it, or a size's variations[].values[].sku. Send
   * product_id or url.
   */
  product_id?: string;
  /**
   * sally-us (sallybeauty.com, USD, the default), sally-ca (sallybeauty.ca, CAD), cosmoprof-us
   * (cosmoprofbeauty.com) or cosmoprof-ca (cosmoprofbeauty.ca). CosmoProf sells to licensed
   * professionals: no prices or stock.
   */
  site?: "sally-us" | "sally-ca" | "cosmoprof-us" | "cosmoprof-ca";
  /**
   * A product link on the site (ending in /<product id>.html), instead of product_id; it also sets
   * site.
   */
  url?: string;
  /**
   * A 5-digit ZIP code (US sites) or a Canadian postal code (Canadian sites); placed on its area's
   * center. Or send latitude + longitude.
   */
  postal_code?: string | number;
  /** Latitude of the point to search around, with longitude (instead of postal_code). */
  latitude?: number;
  /** Longitude of the point to search around, with latitude. */
  longitude?: number;
  /** Miles: 15, 30, 50, 100 (the site's own choices). Defaults to 15. */
  radius?: number;
  [key: string]: unknown;
}

export interface SallybeautySuggestionsOptions {
  /** What a shopper has typed so far. */
  query: string;
  /**
   * sally-us (sallybeauty.com, USD, the default), sally-ca (sallybeauty.ca, CAD), cosmoprof-us
   * (cosmoprofbeauty.com) or cosmoprof-ca (cosmoprofbeauty.ca). CosmoProf sells to licensed
   * professionals: no prices or stock.
   */
  site?: "sally-us" | "sally-ca" | "cosmoprof-us" | "cosmoprof-ca";
  [key: string]: unknown;
}

export interface SallybeautyBrandsOptions {
  /**
   * sally-us (sallybeauty.com, USD, the default), sally-ca (sallybeauty.ca, CAD), cosmoprof-us
   * (cosmoprofbeauty.com) or cosmoprof-ca (cosmoprofbeauty.ca). CosmoProf sells to licensed
   * professionals: no prices or stock.
   */
  site?: "sally-us" | "sally-ca" | "cosmoprof-us" | "cosmoprof-ca";
  [key: string]: unknown;
}

export interface SallybeautyReviewsOptions {
  /**
   * A product id as items[].product_id lists it, or a size's variations[].values[].sku. Send
   * product_id or url.
   */
  product_id?: string;
  /**
   * sally-us (sallybeauty.com, USD, the default), sally-ca (sallybeauty.ca, CAD), cosmoprof-us
   * (cosmoprofbeauty.com) or cosmoprof-ca (cosmoprofbeauty.ca). CosmoProf sells to licensed
   * professionals: no prices or stock.
   */
  site?: "sally-us" | "sally-ca" | "cosmoprof-us" | "cosmoprof-ca";
  /**
   * A product link on the site (ending in /<product id>.html), instead of product_id; it also sets
   * site.
   */
  url?: string;
  [key: string]: unknown;
}

export class SallybeautyNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = SALLYBEAUTY_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/sallybeauty/${path}`, options, undefined, timeout);
  }

  /**
   * Search Sally Beauty (sallybeauty.com, the US beauty supply chain, and sallybeauty.ca) or its
   * licensed-professional arm CosmoProf (cosmoprofbeauty.com, cosmoprofbeauty.ca), chosen by site.
   * Scavio fetches the public page on request. Sally Beauty UK / Ireland is a separate storefront
   * and is not covered. Sally Beauty prices in USD (sally-us) or CAD (sally-ca) as shown to a
   * visitor who is not signed in; CosmoProf prices and stock are for signed-in licensed
   * professionals, so they are null. By keyword, up to 24 per page, sorted and filtered by any
   * facet (brand, product type, benefits, color, rating, clearance) or a price range. Costs 1
   * credit.
   */
  async search(options: SallybeautySearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One category of Sally Beauty (sallybeauty.com, the US beauty supply chain, and sallybeauty.ca)
   * or its licensed-professional arm CosmoProf (cosmoprofbeauty.com, cosmoprofbeauty.ca), chosen by
   * site. Scavio fetches the public page on request. Sally Beauty UK / Ireland is a separate
   * storefront and is not covered. Sally Beauty prices in USD (sally-us) or CAD (sally-ca) as shown
   * to a visitor who is not signed in; CosmoProf prices and stock are for signed-in licensed
   * professionals, so they are null. By category id, sorted and filtered like search, with
   * category_name. Costs 1 credit.
   */
  async category(options: SallybeautyCategoryOptions): Promise<Record<string, unknown>> {
    return this.post("category", options);
  }

  /**
   * Clearance products of Sally Beauty (sallybeauty.com, the US beauty supply chain, and
   * sallybeauty.ca) or its licensed-professional arm CosmoProf (cosmoprofbeauty.com,
   * cosmoprofbeauty.ca), chosen by site. Scavio fetches the public page on request. Sally Beauty UK
   * / Ireland is a separate storefront and is not covered. Sally Beauty prices in USD (sally-us) or
   * CAD (sally-ca) as shown to a visitor who is not signed in; CosmoProf prices and stock are for
   * signed-in licensed professionals, so they are null. Sally Beauty by department (hair_care,
   * hair_color, nails, tools, beauty), CosmoProf in one list; sorted and filtered like search. On
   * clearance items price is the clearance price and list_price the regular price. Costs 1 credit.
   */
  async clearance(options: SallybeautyClearanceOptions = {}): Promise<Record<string, unknown>> {
    return this.post("clearance", options);
  }

  /**
   * One product of Sally Beauty (sallybeauty.com, the US beauty supply chain, and sallybeauty.ca)
   * or its licensed-professional arm CosmoProf (cosmoprofbeauty.com, cosmoprofbeauty.ca), chosen by
   * site. Scavio fetches the public page on request. Sally Beauty UK / Ireland is a separate
   * storefront and is not covered. Sally Beauty prices in USD (sally-us) or CAD (sally-ca) as shown
   * to a visitor who is not signed in; CosmoProf prices and stock are for signed-in licensed
   * professionals, so they are null. Sally Beauty. Costs 1 credit.
   */
  async product(options: SallybeautyProductOptions): Promise<Record<string, unknown>> {
    return this.post("product", options);
  }

  /**
   * Stores of Sally Beauty (sallybeauty.com, the US beauty supply chain, and sallybeauty.ca) or its
   * licensed-professional arm CosmoProf (cosmoprofbeauty.com, cosmoprofbeauty.ca), chosen by site.
   * Scavio fetches the public page on request. Sally Beauty UK / Ireland is a separate storefront
   * and is not covered. near a ZIP / postal code or a point, within 15, 30, 50 or 100 miles,
   * ordered by distance. Costs 1 credit.
   */
  async stores(options: SallybeautyStoresOptions = {}): Promise<Record<string, unknown>> {
    return this.post("stores", options);
  }

  /**
   * In-store stock of one product at the Sally Beauty stores near a ZIP / postal code or a point
   * (sally-us, sally-ca). Costs 1 credit.
   */
  async storeStock(options: SallybeautyStoreStockOptions): Promise<Record<string, unknown>> {
    return this.post("store-stock", options);
  }

  /**
   * The search box suggestions of Sally Beauty (sallybeauty.com, the US beauty supply chain, and
   * sallybeauty.ca) or its licensed-professional arm CosmoProf (cosmoprofbeauty.com,
   * cosmoprofbeauty.ca), chosen by site. Scavio fetches the public page on request. Sally Beauty UK
   * / Ireland is a separate storefront and is not covered. for what a shopper has typed. Costs 1
   * credit.
   */
  async suggestions(options: SallybeautySuggestionsOptions): Promise<Record<string, unknown>> {
    return this.post("suggestions", options);
  }

  /**
   * The brand directory of Sally Beauty (sallybeauty.com, the US beauty supply chain, and
   * sallybeauty.ca) or its licensed-professional arm CosmoProf (cosmoprofbeauty.com,
   * cosmoprofbeauty.ca), chosen by site. Scavio fetches the public page on request. Sally Beauty UK
   * / Ireland is a separate storefront and is not covered. brands [{name, slug, url}] (about 370 on
   * Sally Beauty, 140 on CosmoProf). List a brand's products with search filters (ValueBrand on
   * Sally Beauty, brandcustom on CosmoProf). Costs 1 credit.
   */
  async brands(options: SallybeautyBrandsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("brands", options);
  }

  /**
   * Customer reviews and questions of one product of Sally Beauty (sally-us, sally-ca; CosmoProf
   * sites are refused with a 400). Scavio fetches the public page on request. Page 1 as the product
   * page shows it. Costs 1 credit.
   */
  async reviews(options: SallybeautyReviewsOptions): Promise<Record<string, unknown>> {
    return this.post("reviews", options, SALLYBEAUTY_REVIEWS_TIMEOUT);
  }
}
