import type { Scavio } from "../client.js";

// eBay is 1 credit flat on all three endpoints.
//
// `seller` (the method) is a PROFILE endpoint - it returns the storefront card
// and cannot enumerate a catalogue. To page a seller's inventory, call
// search() with the `seller` option set and no `query` at all.
//
// `sold: true` searches completed listings that actually sold, which is the
// price-research surface. eBay publishes no headline count on that view, so
// `total_results` comes back null there.

export interface EbaySearchOptions {
  /**
   * Search keywords (1-500 characters). Optional, but either `query` or
   * `seller` must be present or the request is rejected.
   */
  query?: string;
  /**
   * Scope results to one seller's username. Usable with NO `query` to page
   * that seller's whole catalogue - this, not seller(), is how you enumerate
   * inventory.
   */
  seller?: string;
  /** Result page, 1-indexed. */
  page?: number;
  /** Result sort order (default "best_match"). */
  sort_by?:
    | "best_match"
    | "ending_soonest"
    | "newly_listed"
    | "price_low"
    | "price_high";
  /** Minimum price filter. */
  min_price?: number;
  /** Maximum price filter. */
  max_price?: number;
  /**
   * Item condition. "refurbished" is eBay's parent condition, not one of its
   * three graded tiers.
   */
  condition?: "new" | "open_box" | "refurbished" | "used" | "for_parts";
  /** Listing format filter. */
  buying_format?: "auction" | "buy_it_now" | "best_offer";
  /** Free-shipping listings only. */
  free_shipping?: boolean;
  /**
   * Search completed listings that SOLD rather than live inventory.
   * `total_results` is null on this view - eBay publishes no headline count.
   */
  sold?: boolean;
  /**
   * eBay category id. Must be numeric: an unrecognised id is not an error,
   * it silently returns the UNFILTERED set under a 200.
   */
  category_id?: string;
  /**
   * Results per page. eBay accepts only 60, 120 or 240 and silently falls
   * back to 60 for anything else. Defaults to 60.
   */
  per_page?: 60 | 120 | 240;
  [key: string]: unknown;
}

export interface EbayProductOptions {
  /**
   * eBay item number, or a full ebay.com/itm/... URL. Tracking params on a
   * pasted URL are discarded.
   */
  item_id: string;
  [key: string]: unknown;
}

export interface EbaySellerOptions {
  /** eBay username as it appears in ebay.com/usr/<name>. */
  seller: string;
  [key: string]: unknown;
}

export class EbayNamespace {
  constructor(private client: Scavio) {}

  /**
   * Structured eBay listing results: price, condition, bids, shipping, seller,
   * feedback, plus `count` and `total_results`.
   *
   * Either `query` or `seller` is required. Set `sold: true` to search
   * completed listings that actually sold - on that view `total_results` is
   * always null because eBay publishes no headline count for it.
   *
   * Paged with `page`; `per_page` accepts only 60, 120 or 240 and silently
   * falls back to 60 for any other value.
   *
   * Costs 1 credit.
   */
  async search(
    options: EbaySearchOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/ebay/search", options);
  }

  /**
   * One eBay listing in full: price, condition, images, item specifics,
   * shipping, returns, auction state and seller.
   *
   * Costs 1 credit. Single response, no pagination.
   */
  async product(
    options: EbayProductOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/ebay/product", options);
  }

  /**
   * A seller's profile card: store name, feedback score and percentage, items
   * sold, followers, location and categories.
   *
   * PROFILE ONLY - it cannot list what the seller is selling. For inventory,
   * call search({ seller }) with no query and page through it.
   *
   * Costs 1 credit. Single response, no pagination.
   */
  async seller(
    options: EbaySellerOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/ebay/seller", options);
  }
}
