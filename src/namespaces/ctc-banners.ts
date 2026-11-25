// Shared option types for SportChek (sportchek.ts) and Mark's (marks.ts), Canadian Tire
// Corporation banners on one shared storefront. 1 credit per call on every endpoint;
// credits_used in the response is what was charged. Canada only, prices in CAD.
//
// was_price is the site's was price as given, only where the site shows one; footnote is the
// site's own sentence on it ("Was price reflects the last national regular price this product
// was sold for.", English pages). A percent off is not returned: compute it from price and
// was_price and label it computed. sale_ends is the sale end date the site shows, as given;
// price_message is the site's promotion text. units_at_store are the units at the store the
// site assigns to the request's region (assigned_store); a caller cannot choose a store. In our
// checks prices were the same at every store sampled.
//
// The server enforces the value rules: product, reviews and questions take code or url (not
// both); list takes path or url (not both); deals (or a deals filter) on a deals page is a 400,
// not charged. Answers take about 10-90 seconds, so every call raises the request timeout to
// CTC_TIMEOUT (allow up to 2 minutes). Failed upstream calls and refused inputs are not
// charged; a not-found is charged.

/** Minimum request timeout (ms) for every sportchek and marks call: answers take about 10-90 s. */
export const CTC_TIMEOUT = 240_000;

/** relevance (default), price_high, price_low or rating (highest rated first): the site's sort menu. */
export type CtcSort = "relevance" | "price_high" | "price_low" | "rating";

/** newest (default), relevance, helpful, rating_high or rating_low: SportChek's review sort menu. */
export type CtcReviewSort = "newest" | "relevance" | "helpful" | "rating_high" | "rating_low";

/** The site's Deals filter. Not on a deals page (a 400, not charged). */
export type CtcDeals = "sale" | "clearance" | "both" | Array<"sale" | "clearance">;

/** One of the site's filters as facets[].values[] give it (value: one or a list). */
export interface CtcFilter {
  facet: string;
  value: string | string[];
}

export interface CtcListFilters {
  /** Page (default 1, at most 500); 24 products a page (12 on Mark's category pages), page_size says. */
  page?: number;
  /** Defaults to "relevance". */
  sort?: CtcSort;
  /** Brand, as the site's Brand Name filter names it (one or a list of up to 10): facets[id=brand].values[].value. */
  brand?: string | string[];
  /** sale, clearance or both: the site's Deals filter. */
  deals?: CtcDeals;
  /** Any of the site's filters from facets, up to 6, e.g. [{ facet: "sku_gender_attr", value: "Female" }]. */
  filters?: CtcFilter[];
  /** Also return the site's filters with counts for these results (facets). Still 1 credit. */
  include_facets?: boolean;
}

export interface CtcSearchOptions extends CtcListFilters {
  /** Keywords or a product code. */
  q: string;
  [key: string]: unknown;
}

export interface CtcListOptions extends CtcListFilters {
  /** A category or deals page path (categories[].path, or a sale, clearance or Black Friday page). Send path or url. */
  path?: string;
  /** The page link instead of path. */
  url?: string;
  [key: string]: unknown;
}

export interface CtcProductTarget {
  /** A product code (items[].code). Send code or url. */
  code?: string;
  /** A product link (items[].url) instead of code. */
  url?: string;
  [key: string]: unknown;
}

export interface CtcSuggestionsOptions {
  /** The text typed so far. */
  q: string;
  [key: string]: unknown;
}

export interface CtcStoreOptions {
  /** A store number (assigned_store.id, nearby_stores[].id). */
  store_id: string | number;
  [key: string]: unknown;
}

export interface CtcBrandsOptions {
  /** Optional: only brands starting with this letter or digit. */
  letter?: string;
  [key: string]: unknown;
}
