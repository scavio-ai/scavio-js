import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

/**
 * Every endpoint added in the 22-platform fanout, checked against the path in
 * gtm/fanout-spec.json. Paths are copied verbatim from the spec and never
 * derived from the namespace name - Meta Ad Library is served at
 * /api/v1/meta-ads/* while its route key is metaads, and walmart/seller-products,
 * companieshouse/filing-history and kuaishou/video/sub-comments diverge from
 * their method names too.
 */
type Row = [ns: string, method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["walmart", "search", { query: "x1" }, "/api/v1/walmart/search"],
  ["walmart", "product", { product_id: "x1" }, "/api/v1/walmart/product"],
  ["walmart", "reviews", { product_id: "x1" }, "/api/v1/walmart/reviews"],
  ["walmart", "category", { category_id: "x1" }, "/api/v1/walmart/category"],
  ["walmart", "offers", { product_id: "x1" }, "/api/v1/walmart/offers"],
  ["walmart", "seller", { seller_id: "x1" }, "/api/v1/walmart/seller"],
  ["walmart", "sellerProducts", { seller_id: "x1" }, "/api/v1/walmart/seller-products"],
  ["threads", "profile", { username: "x1" }, "/api/v1/threads/profile"],
  ["threads", "userPosts", { username: "x1" }, "/api/v1/threads/user/posts"],
  ["threads", "userReplies", { username: "x1" }, "/api/v1/threads/user/replies"],
  ["threads", "post", { post_id: "x1" }, "/api/v1/threads/post"],
  ["threads", "postComments", { post_id: "x1" }, "/api/v1/threads/post/comments"],
  ["threads", "searchUsers", { query: "x1" }, "/api/v1/threads/search/users"],
  ["kuaishou", "profile", { user_id: "x1" }, "/api/v1/kuaishou/profile"],
  ["kuaishou", "userPosts", { user_id: "x1" }, "/api/v1/kuaishou/user/posts"],
  ["kuaishou", "userLive", { user_id: "x1" }, "/api/v1/kuaishou/user/live"],
  ["kuaishou", "userResolve", { share_link: "x1" }, "/api/v1/kuaishou/user/resolve"],
  ["kuaishou", "video", { photo_id: "x1" }, "/api/v1/kuaishou/video"],
  ["kuaishou", "videoComments", { photo_id: "x1" }, "/api/v1/kuaishou/video/comments"],
  ["kuaishou", "commentReplies", { photo_id: "x1", root_comment_id: "x1" }, "/api/v1/kuaishou/video/sub-comments"],
  ["kuaishou", "videosBatch", { photo_ids: ["x1"] }, "/api/v1/kuaishou/videos/batch"],
  ["kuaishou", "search", { keyword: "x1" }, "/api/v1/kuaishou/search"],
  ["kuaishou", "searchVideos", { keyword: "x1" }, "/api/v1/kuaishou/search/videos"],
  ["kuaishou", "searchUsers", { keyword: "x1" }, "/api/v1/kuaishou/search/users"],
  ["kuaishou", "searchLive", { keyword: "x1" }, "/api/v1/kuaishou/search/live"],
  ["kuaishou", "tagFeed", { tag: "x1" }, "/api/v1/kuaishou/tag/feed"],
  ["kuaishou", "trending", { board: "hot" }, "/api/v1/kuaishou/trending"],
  ["ebay", "search", { query: "x1" }, "/api/v1/ebay/search"],
  ["ebay", "product", { item_id: "x1" }, "/api/v1/ebay/product"],
  ["ebay", "seller", { seller: "x1" }, "/api/v1/ebay/seller"],
  ["target", "search", { keyword: "x1" }, "/api/v1/target/search"],
  ["target", "category", { category_id: "x1" }, "/api/v1/target/category"],
  ["target", "product", { tcin: "x1" }, "/api/v1/target/product"],
  ["target", "reviews", { tcin: "x1" }, "/api/v1/target/reviews"],
  ["homeDepot", "search", { query: "x1" }, "/api/v1/homedepot/search"],
  ["homeDepot", "product", { item_id: "x1" }, "/api/v1/homedepot/product"],
  ["homeDepot", "reviews", { item_id: "x1" }, "/api/v1/homedepot/reviews"],
  ["zillow", "search", { location: "x1" }, "/api/v1/zillow/search"],
  ["zillow", "property", { zpid: "x1" }, "/api/v1/zillow/property"],
  ["zillow", "agentReviews", { screen_name: "x1" }, "/api/v1/zillow/reviews"],
  ["booking", "search", { destination: "x1" }, "/api/v1/booking/search"],
  ["booking", "hotel", { hotel: "x1" }, "/api/v1/booking/hotel"],
  ["booking", "reviews", { hotel: "x1" }, "/api/v1/booking/reviews"],
  ["tripadvisor", "locations", { query: "x1" }, "/api/v1/tripadvisor/locations"],
  ["tripadvisor", "search", { geo_id: "x1" }, "/api/v1/tripadvisor/search"],
  ["tripadvisor", "location", { location_id: "x1" }, "/api/v1/tripadvisor/location"],
  ["tripadvisor", "reviews", { location_id: "x1" }, "/api/v1/tripadvisor/reviews"],
  ["indeed", "search", { query: "x1" }, "/api/v1/indeed/search"],
  ["indeed", "job", { job_id: "x1" }, "/api/v1/indeed/job"],
  ["indeed", "company", { company: "x1" }, "/api/v1/indeed/company"],
  ["indeed", "companyReviews", { company: "x1" }, "/api/v1/indeed/company/reviews"],
  ["airbnb", "search", { location: "x1" }, "/api/v1/airbnb/search"],
  ["airbnb", "listing", { listing_id: "x1" }, "/api/v1/airbnb/listing"],
  ["airbnb", "reviews", { listing_id: "x1" }, "/api/v1/airbnb/reviews"],
  ["glassdoor", "companies", { query: "x1" }, "/api/v1/glassdoor/companies"],
  ["glassdoor", "company", { employer_id: "x1" }, "/api/v1/glassdoor/company"],
  ["glassdoor", "reviews", { employer_id: "x1" }, "/api/v1/glassdoor/reviews"],
  ["glassdoor", "salaries", { employer_id: "x1" }, "/api/v1/glassdoor/salaries"],
  ["yelp", "search", { term: "x1" }, "/api/v1/yelp/search"],
  ["yelp", "business", { business_id: "x1" }, "/api/v1/yelp/business"],
  ["yelp", "reviews", { business_id: "x1" }, "/api/v1/yelp/reviews"],
  ["appStore", "search", { term: "x1" }, "/api/v1/appstore/search"],
  ["appStore", "app", { app_id: "x1" }, "/api/v1/appstore/app"],
  ["appStore", "reviews", { app_id: "x1" }, "/api/v1/appstore/reviews"],
  ["googlePlay", "search", { query: "x1" }, "/api/v1/googleplay/search"],
  ["googlePlay", "app", { app_id: "x1" }, "/api/v1/googleplay/app"],
  ["googlePlay", "reviews", { app_id: "x1" }, "/api/v1/googleplay/reviews"],
  ["sec", "lookup", { query: "x1" }, "/api/v1/sec/lookup"],
  ["sec", "company", { cik: "x1" }, "/api/v1/sec/company"],
  ["sec", "filings", { cik: "x1" }, "/api/v1/sec/filings"],
  ["sec", "concept", { concept: "x1" }, "/api/v1/sec/concept"],
  ["sec", "facts", { cik: "x1" }, "/api/v1/sec/facts"],
  ["sec", "search", { query: "x1" }, "/api/v1/sec/search"],
  ["redfin", "search", { location: "x1" }, "/api/v1/redfin/search"],
  ["redfin", "property", { property_id: "x1" }, "/api/v1/redfin/property"],
  ["redfin", "market", { location: "x1" }, "/api/v1/redfin/market"],
  ["companiesHouse", "search", { query: "x1" }, "/api/v1/companieshouse/search"],
  ["companiesHouse", "company", { company_number: "x1" }, "/api/v1/companieshouse/company"],
  ["companiesHouse", "officers", { company_number: "x1" }, "/api/v1/companieshouse/officers"],
  ["companiesHouse", "filingHistory", { company_number: "x1" }, "/api/v1/companieshouse/filing-history"],
  ["g2", "search", { query: "x1" }, "/api/v1/g2/search"],
  ["g2", "product", { product_id: "x1" }, "/api/v1/g2/product"],
  ["g2", "reviews", { product_id: "x1" }, "/api/v1/g2/reviews"],
  ["capterra", "search", { query: "x1" }, "/api/v1/capterra/search"],
  ["capterra", "product", { product_id: "x1" }, "/api/v1/capterra/product"],
  ["capterra", "reviews", { product_id: "x1" }, "/api/v1/capterra/reviews"],
  ["googleAds", "search", { domain: "x1" }, "/api/v1/googleads/search"],
  ["googleAds", "advertisers", { query: "x1" }, "/api/v1/googleads/advertisers"],
  ["googleAds", "creative", { advertiser_id: "x1", creative_id: "x1" }, "/api/v1/googleads/creative"],
  ["metaAds", "search", { query: "x1" }, "/api/v1/meta-ads/search"],
  ["metaAds", "advertiser", { page_id: "x1" }, "/api/v1/meta-ads/advertiser"],
  ["metaAds", "ad", { ad_archive_id: "x1" }, "/api/v1/meta-ads/ad"],
];

describe("fanout namespaces", () => {
  let client: Scavio;

  beforeEach(() => {
    client = new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 10 });
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("covers every fanout endpoint", () => {
    expect(ENDPOINTS).toHaveLength(92);
  });

  for (const [ns, method, args, path] of ENDPOINTS) {
    it(`${ns}.${method} posts to ${path}`, async () => {
      const namespace = (client as unknown as Record<string, Record<string, (a: unknown) => Promise<unknown>>>)[ns];
      expect(namespace, `client.${ns} is not wired up`).toBeDefined();
      expect(typeof namespace[method], `client.${ns}.${method} is missing`).toBe("function");

      await namespace[method]!(args);

      expect(fetch).toHaveBeenLastCalledWith(
        `https://api.scavio.dev${path}`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(args),
        }),
      );
    });
  }
});
