import type { Scavio } from "../client.js";

// CarGurus (cargurus.com, the car marketplace in the US, Canada and the UK) search, dealer,
// dealers, priceTrends, research, expertReviews, makes and models endpoints; markets us, us-es, ca,
// ca-fr, uk; 1 credit each. Generated from the backend routes: every option and its doc mirrors the
// API's own request schema; an input the API only accepts to refuse (a 400 that says 'not offered')
// is left out. The server enforces the value rules and the one-of rules (send one of an id or a
// link). Every call raises the request timeout to CARGURUS_TIMEOUT and never lowers a longer client
// timeout. Failed upstream calls and refused inputs are not charged; a not-found is charged
// (credits_used is what was charged).

/** Minimum request timeout (ms) for every cargurus call. */
export const CARGURUS_TIMEOUT = 240_000;

export interface CargurusSearchOptions {
  /**
   * us, us-es, ca, ca-fr, uk (default us). us = cargurus.com (USD, miles), us-es = its Spanish
   * pages, ca = cargurus.ca (CAD, km), ca-fr = its French pages, uk = cargurus.co.uk (GBP, miles).
   * Data comes in the market's language and currency.
   */
  market?: string;
  /**
   * Required. Where to search around: a 5-digit US ZIP code (us, us-es), a Canadian postal code
   * (ca, ca-fr, e.g. M5V 2T6) or a UK postcode (uk, e.g. M1 1AE). A malformed code is a 400, not
   * charged.
   */
  zip: string | number;
  /**
   * Radius around zip, as the site offers it: us / uk 10, 25, 50 (default), 75, 100, 150, 200, 500
   * miles; ca 25, 50, 75, 100, 250, 500 km; or "nationwide".
   */
  distance?: number | string;
  /**
   * A make as CarGurus names it (Toyota, Ford, Mercedes-Benz ...) or its make_id (m7; from makes).
   * Ids differ per site (Ford is m2 on the US and Canadian sites, m273 on the UK site): names
   * resolve to the market's id.
   */
  make?: string;
  /**
   * A model as CarGurus names it (RAV4, F-150) or its model_id (d306; from models). Needs make. A
   * model name is resolved from the make's models on a first CarGurus page (same 1 credit; send
   * model_id to save that step).
   */
  model?: string;
  /**
   * A trim as CarGurus names it (search's trims list, e.g. XLE, XLT SuperCrew 4WD). Needs model.
   */
  trim?: string;
  /** Page (default 1, at most 500); 24 tiles a page. */
  page?: number;
  /**
   * best_match, best_deal, price_low, price_high, mileage_low, mileage_high, closest, year_newest,
   * year_oldest, listed_newest, listed_oldest (CarGurus' 11 sorts; default best_match). best_deal
   * is CarGurus' "Best deals first" (used cars).
   */
  sort?: string;
  /** Earliest model year. */
  year_min?: number;
  /** Latest model year. */
  year_max?: number;
  /** Lowest price, whole units of the market's currency. */
  price_min?: number;
  /** Highest price. */
  price_max?: number;
  /** Lowest mileage (miles; km in ca / ca-fr). */
  mileage_min?: number;
  /** Highest mileage. */
  mileage_max?: number;
  /** One or a list: awd, 4wd, fwd, rwd, 4x2. */
  drivetrain?: string | string[];
  /**
   * Exterior colour group(s): black, blue, brown, gold, gray (grey), green, orange, pink, purple,
   * red, silver, teal, white, yellow.
   */
  color?: string | string[];
  /**
   * coupe, convertible, hatchback, minivan (mpv), pickup, sedan (saloon), suv, van, wagon (estate).
   */
  body_type?: string | string[];
  /**
   * us / ca: used, certified (manufacturer certified), third_party_certified; uk: approved_used.
   */
  condition?: string | string[];
  /** franchise_dealer or cargurus_partner (CarGurus Partners). */
  seller_type?: string | string[];
  /**
   * CarGurus deal rating(s) by name: great, good, fair, high, overpriced, uncertain, no_analysis
   * (or CarGurus' own names GREAT_PRICE, GOOD_PRICE, FAIR_PRICE, POOR_PRICE, OVERPRICED, OUTLIER,
   * NA).
   */
  deal_rating?: string | string[];
  /**
   * gasoline (petrol), diesel, electric, hybrid, flex_fuel, cng, biodiesel, hydrogen, dual_fuel.
   */
  fuel_type?: string | string[];
  /** automatic or manual. */
  transmission?: string | string[];
  /** Only cars CarGurus reports as single-owner. */
  single_owner?: boolean;
  /** Only cars with no accidents reported. */
  no_accidents?: boolean;
  /** Only listings with a recent price drop. */
  price_drops_only?: boolean;
  /**
   * Other CarGurus filters by the site's own key (facets[].key from include_facets) to a value or
   * list: daysOnMarketMin, daysOnMarketMax, minMpg, maxMpg, hideWithoutPhotos, hideFrameDamaged,
   * hideTheft, interiorColors, hideFleet, hideLemon, hideSalvage, doors, installedOptionIds,
   * safetyRatings, averageDealerRatings, minEVBatteryChargingTime, maxEVBatteryChargingTime,
   * minEVBatteryRange, maxEVBatteryRange, hideEvOrPhev, numberOfSeats, enginePaths,
   * vehicleHistoryOptions, dealerFeesIncluded, ulezCompliant, hideScrapped, seatingCapacity.
   */
  filters?: Record<string, unknown>;
  /**
   * Also return facets [{facet, label, key, min_key, max_key, values [{name, value, label, count}],
   * range}]: CarGurus' filters with counts for this search (a filters entry takes key with the
   * value; deal ratings go by name through deal_rating).
   */
  include_facets?: boolean;
  [key: string]: unknown;
}

export interface CargurusDealerOptions {
  /** A CarGurus dealer id (listings[].dealer.dealer_id, dealers[].dealer_id). */
  dealer_id?: string | number;
  /**
   * A CarGurus dealer link (https://www.cargurus.com/Cars/m-<dealer name>-sp<id>, or the .ca /
   * .co.uk site) instead of dealer_id; its site sets the market.
   */
  url?: string;
  /**
   * us, us-es, ca, ca-fr, uk (default us). us = cargurus.com (USD, miles), us-es = its Spanish
   * pages, ca = cargurus.ca (CAD, km), ca-fr = its French pages, uk = cargurus.co.uk (GBP, miles).
   * Data comes in the market's language and currency.
   */
  market?: string;
  /**
   * A make as CarGurus names it (Toyota, Ford, Mercedes-Benz ...) or its make_id (m7; from makes).
   * Ids differ per site (Ford is m2 on the US and Canadian sites, m273 on the UK site): names
   * resolve to the market's id.
   */
  make?: string;
  /**
   * A model as CarGurus names it (RAV4, F-150) or its model_id (d306; from models). Needs make. A
   * model name is resolved from the make's models on a first CarGurus page (same 1 credit; send
   * model_id to save that step).
   */
  model?: string;
  /**
   * A trim as CarGurus names it (search's trims list, e.g. XLE, XLT SuperCrew 4WD). Needs model.
   */
  trim?: string;
  /** Page (default 1, at most 500); 24 tiles a page. */
  page?: number;
  /**
   * best_match, best_deal, price_low, price_high, mileage_low, mileage_high, closest, year_newest,
   * year_oldest, listed_newest, listed_oldest (CarGurus' 11 sorts; default best_match). best_deal
   * is CarGurus' "Best deals first" (used cars).
   */
  sort?: string;
  /** Earliest model year. */
  year_min?: number;
  /** Latest model year. */
  year_max?: number;
  /** Lowest price, whole units of the market's currency. */
  price_min?: number;
  /** Highest price. */
  price_max?: number;
  /** Lowest mileage (miles; km in ca / ca-fr). */
  mileage_min?: number;
  /** Highest mileage. */
  mileage_max?: number;
  /** One or a list: awd, 4wd, fwd, rwd, 4x2. */
  drivetrain?: string | string[];
  /**
   * Exterior colour group(s): black, blue, brown, gold, gray (grey), green, orange, pink, purple,
   * red, silver, teal, white, yellow.
   */
  color?: string | string[];
  /**
   * coupe, convertible, hatchback, minivan (mpv), pickup, sedan (saloon), suv, van, wagon (estate).
   */
  body_type?: string | string[];
  /**
   * us / ca: used, certified (manufacturer certified), third_party_certified; uk: approved_used.
   */
  condition?: string | string[];
  /** franchise_dealer or cargurus_partner (CarGurus Partners). */
  seller_type?: string | string[];
  /**
   * CarGurus deal rating(s) by name: great, good, fair, high, overpriced, uncertain, no_analysis
   * (or CarGurus' own names GREAT_PRICE, GOOD_PRICE, FAIR_PRICE, POOR_PRICE, OVERPRICED, OUTLIER,
   * NA).
   */
  deal_rating?: string | string[];
  /**
   * gasoline (petrol), diesel, electric, hybrid, flex_fuel, cng, biodiesel, hydrogen, dual_fuel.
   */
  fuel_type?: string | string[];
  /** automatic or manual. */
  transmission?: string | string[];
  /** Only cars CarGurus reports as single-owner. */
  single_owner?: boolean;
  /** Only cars with no accidents reported. */
  no_accidents?: boolean;
  /** Only listings with a recent price drop. */
  price_drops_only?: boolean;
  /**
   * Other CarGurus filters by the site's own key (facets[].key from include_facets) to a value or
   * list: daysOnMarketMin, daysOnMarketMax, minMpg, maxMpg, hideWithoutPhotos, hideFrameDamaged,
   * hideTheft, interiorColors, hideFleet, hideLemon, hideSalvage, doors, installedOptionIds,
   * safetyRatings, averageDealerRatings, minEVBatteryChargingTime, maxEVBatteryChargingTime,
   * minEVBatteryRange, maxEVBatteryRange, hideEvOrPhev, numberOfSeats, enginePaths,
   * vehicleHistoryOptions, dealerFeesIncluded, ulezCompliant, hideScrapped, seatingCapacity.
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CargurusDealersOptions {
  /**
   * us, us-es (default us). us = cargurus.com (USD, miles), us-es = its Spanish pages, ca =
   * cargurus.ca (CAD, km), ca-fr = its French pages, uk = cargurus.co.uk (GBP, miles). Data comes
   * in the market's language and currency. The Canadian and UK search pages carry no dealer list.
   */
  market?: string;
  /**
   * Required. Where to search around: a 5-digit US ZIP code (us, us-es), a Canadian postal code
   * (ca, ca-fr, e.g. M5V 2T6) or a UK postcode (uk, e.g. M1 1AE). A malformed code is a 400, not
   * charged.
   */
  zip: string | number;
  /**
   * Radius around zip, as the site offers it: us / uk 10, 25, 50 (default), 75, 100, 150, 200, 500
   * miles; ca 25, 50, 75, 100, 250, 500 km; or "nationwide".
   */
  distance?: number | string;
  /**
   * A make as CarGurus names it (Toyota, Ford, Mercedes-Benz ...) or its make_id (m7; from makes).
   * Ids differ per site (Ford is m2 on the US and Canadian sites, m273 on the UK site): names
   * resolve to the market's id.
   */
  make?: string;
  /**
   * A model as CarGurus names it (RAV4, F-150) or its model_id (d306; from models). Needs make. A
   * model name is resolved from the make's models on a first CarGurus page (same 1 credit; send
   * model_id to save that step).
   */
  model?: string;
  [key: string]: unknown;
}

export interface CargurusPriceTrendsOptions {
  /**
   * us, ca, uk (default us). us = cargurus.com (USD, miles), us-es = its Spanish pages, ca =
   * cargurus.ca (CAD, km), ca-fr = its French pages, uk = cargurus.co.uk (GBP, miles). Data comes
   * in the market's language and currency.
   */
  market?: string;
  /**
   * Optional: a make (name or make_id): its price trends and its models. Without make: the market's
   * CarGurus Index, makes and body styles.
   */
  make?: string;
  /**
   * Optional, with make: a model (name or model_id): its price trends and each model year
   * (model_years, with research_id).
   */
  model?: string;
  [key: string]: unknown;
}

export interface CargurusResearchOptions {
  /**
   * A CarGurus model-year id (c<digits>; expert_reviews[].research_id, price_trends
   * groups.model_years[].research_id).
   */
  research_id?: string;
  /**
   * A CarGurus research link (https://www.cargurus.com/research/<year>-<make>-<model>-c<id>)
   * instead of research_id.
   */
  url?: string;
  /**
   * With make and model instead of research_id: the model year, found through CarGurus' price
   * trends (same 1 credit).
   */
  year?: number;
  /** With year and model. */
  make?: string;
  /** With year and make. */
  model?: string;
  /**
   * us (default us). us = cargurus.com (USD, miles), us-es = its Spanish pages, ca = cargurus.ca
   * (CAD, km), ca-fr = its French pages, uk = cargurus.co.uk (GBP, miles). Data comes in the
   * market's language and currency. Research pages are read on the US site.
   */
  market?: string;
  [key: string]: unknown;
}

export interface CargurusExpertReviewsOptions {
  /**
   * us, ca, uk (default us). us = cargurus.com (USD, miles), us-es = its Spanish pages, ca =
   * cargurus.ca (CAD, km), ca-fr = its French pages, uk = cargurus.co.uk (GBP, miles). Data comes
   * in the market's language and currency.
   */
  market?: string;
  /** Page (default 1); 24 reviews a page. */
  page?: number;
  [key: string]: unknown;
}

export interface CargurusMakesOptions {
  /**
   * us, us-es, ca, ca-fr, uk (default us). us = cargurus.com (USD, miles), us-es = its Spanish
   * pages, ca = cargurus.ca (CAD, km), ca-fr = its French pages, uk = cargurus.co.uk (GBP, miles).
   * Data comes in the market's language and currency.
   */
  market?: string;
  [key: string]: unknown;
}

export interface CargurusModelsOptions {
  /**
   * us, us-es, ca, ca-fr, uk (default us). us = cargurus.com (USD, miles), us-es = its Spanish
   * pages, ca = cargurus.ca (CAD, km), ca-fr = its French pages, uk = cargurus.co.uk (GBP, miles).
   * Data comes in the market's language and currency.
   */
  market?: string;
  /** Required. A make (name or make_id). */
  make: string;
  /** Optional: count listings around this place instead of nationwide. */
  zip?: string | number;
  /**
   * Radius around zip, as the site offers it: us / uk 10, 25, 50 (default), 75, 100, 150, 200, 500
   * miles; ca 25, 50, 75, 100, 250, 500 km; or "nationwide".
   */
  distance?: number | string;
  [key: string]: unknown;
}

export class CargurusNamespace {
  constructor(private client: Scavio) {}

  private post(path: string, options: object, timeout = CARGURUS_TIMEOUT): Promise<Record<string, unknown>> {
    return this.client._post(`/api/v1/cargurus/${path}`, options, undefined, timeout);
  }

  /**
   * Search the car listings of CarGurus (cargurus.com, the car marketplace run by CarGurus, Inc.,
   * in the US, Canada and the UK). Scavio fetches the public CarGurus page on request; CarGurus has
   * no public API for reading listings. Around a ZIP / postal code / postcode with a radius, by
   * make, model and trim (names or ids), sorted by any of CarGurus' 11 sorts, filtered by year,
   * price, mileage, drivetrain, colour, body type, condition, seller type, CarGurus deal rating,
   * fuel, transmission, single owner, no accidents and recent price drops. Costs 1 credit.
   */
  async search(options: CargurusSearchOptions): Promise<Record<string, unknown>> {
    return this.post("search", options);
  }

  /**
   * One dealer on CarGurus (cargurus.com, the car marketplace run by CarGurus, Inc., in the US,
   * Canada and the UK). Scavio fetches the public CarGurus page on request; CarGurus has no public
   * API for reading listings. By dealer id or link. Costs 1 credit.
   */
  async dealer(options: CargurusDealerOptions): Promise<Record<string, unknown>> {
    return this.post("dealer", options);
  }

  /**
   * The dealers with listings around a US ZIP code on CarGurus (cargurus.com, the car marketplace
   * run by CarGurus, Inc., in the US, Canada and the UK). Scavio fetches the public CarGurus page
   * on request; CarGurus has no public API for reading listings. (optionally for one make / model).
   * Costs 1 credit.
   */
  async dealers(options: CargurusDealersOptions): Promise<Record<string, unknown>> {
    return this.post("dealers", options);
  }

  /**
   * CarGurus' used-car price trends on CarGurus (cargurus.com, the car marketplace run by CarGurus,
   * Inc., in the US, Canada and the UK). Scavio fetches the public CarGurus page on request;
   * CarGurus has no public API for reading listings. For the market (the CarGurus Index, makes,
   * body styles, market movers), a make or a model. Costs 1 credit.
   */
  async priceTrends(options: CargurusPriceTrendsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("price-trends", options);
  }

  /**
   * A model-year research page on CarGurus (cargurus.com, the car marketplace run by CarGurus,
   * Inc., in the US, Canada and the UK). Scavio fetches the public CarGurus page on request;
   * CarGurus has no public API for reading listings. (US site). By research_id / link, or by year
   * with make and model. Costs 1 credit.
   */
  async research(options: CargurusResearchOptions): Promise<Record<string, unknown>> {
    return this.post("research", options);
  }

  /**
   * CarGurus' expert (editorial) car reviews on CarGurus (cargurus.com, the car marketplace run by
   * CarGurus, Inc., in the US, Canada and the UK). Scavio fetches the public CarGurus page on
   * request; CarGurus has no public API for reading listings. 24 a page. Costs 1 credit.
   */
  async expertReviews(options: CargurusExpertReviewsOptions = {}): Promise<Record<string, unknown>> {
    return this.post("expert-reviews", options);
  }

  /**
   * Every make the market's site of CarGurus (cargurus.com, the car marketplace run by CarGurus,
   * Inc., in the US, Canada and the UK). Scavio fetches the public CarGurus page on request;
   * CarGurus has no public API for reading listings. lists in its search. Costs 1 credit.
   */
  async makes(options: CargurusMakesOptions = {}): Promise<Record<string, unknown>> {
    return this.post("makes", options);
  }

  /**
   * The models of one make on CarGurus (cargurus.com, the car marketplace run by CarGurus, Inc., in
   * the US, Canada and the UK). Scavio fetches the public CarGurus page on request; CarGurus has no
   * public API for reading listings. with CarGurus' listing counts nationwide (or around a zip).
   * Costs 1 credit.
   */
  async models(options: CargurusModelsOptions): Promise<Record<string, unknown>> {
    return this.post("models", options);
  }
}
