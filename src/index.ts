export {
  Scavio,
  DEFAULT_MAX_REQUESTS_PER_SECOND,
  MAX_REQUESTS_PER_SECOND,
} from "./client.js";
export type { ScavioConfig, ExtractOptions } from "./client.js";

export {
  ScavioError,
  MissingAPIKeyError,
  InvalidAPIKeyError,
  InsufficientCreditsError,
  BadRequestError,
  NotFoundError,
  RateLimitError,
  ScavioAPIError,
  ScavioConnectionError,
  ScavioTimeoutError,
} from "./errors.js";

export { GoogleNamespace } from "./namespaces/google.js";
export { AmazonNamespace } from "./namespaces/amazon.js";
export { WalmartNamespace } from "./namespaces/walmart.js";
export { YouTubeNamespace } from "./namespaces/youtube.js";
export { RedditNamespace } from "./namespaces/reddit.js";
export { TikTokNamespace } from "./namespaces/tiktok.js";
export { TikTokShopNamespace } from "./namespaces/tiktok-shop.js";
export { InstagramNamespace } from "./namespaces/instagram.js";
export { XNamespace } from "./namespaces/x.js";
export { LinkedInNamespace } from "./namespaces/linkedin.js";
export { ThreadsNamespace } from "./namespaces/threads.js";
export { KuaishouNamespace } from "./namespaces/kuaishou.js";
export { EbayNamespace } from "./namespaces/ebay.js";
export { TargetNamespace } from "./namespaces/target.js";
export { HomeDepotNamespace } from "./namespaces/home-depot.js";
export { ZillowNamespace } from "./namespaces/zillow.js";
export { RedfinNamespace } from "./namespaces/redfin.js";
export { BookingNamespace } from "./namespaces/booking.js";
export { AirbnbNamespace } from "./namespaces/airbnb.js";
export { TripadvisorNamespace } from "./namespaces/tripadvisor.js";
export { YelpNamespace } from "./namespaces/yelp.js";
export { IndeedNamespace } from "./namespaces/indeed.js";
export { GlassdoorNamespace } from "./namespaces/glassdoor.js";
export { AppStoreNamespace } from "./namespaces/app-store.js";
export { GooglePlayNamespace } from "./namespaces/google-play.js";
export { G2Namespace } from "./namespaces/g2.js";
export { CapterraNamespace } from "./namespaces/capterra.js";
export { SECNamespace } from "./namespaces/sec.js";
export { CompaniesHouseNamespace } from "./namespaces/companies-house.js";
export { GoogleAdsNamespace } from "./namespaces/google-ads.js";
export { MetaAdsNamespace } from "./namespaces/meta-ads.js";

export type {
  GoogleSearchOptions,
  GoogleAiModeOptions,
  GoogleMapsSearchOptions,
  GoogleMapsPlaceOptions,
  GoogleMapsReviewsOptions,
  GoogleShoppingOptions,
  GoogleShoppingProductOptions,
  GoogleShoppingStoresOptions,
  GoogleFlightsOptions,
  GoogleHotelsOptions,
  GoogleHotelsDetailOptions,
  GoogleNewsOptions,
  GoogleTrendsOptions,
  GoogleTrendingOptions,
} from "./namespaces/google.js";
export type {
  AmazonSearchOptions,
  AmazonProductOptions,
  AmazonOffersOptions,
} from "./namespaces/amazon.js";
export type {
  WalmartSearchOptions,
  WalmartProductOptions,
  WalmartReviewsOptions,
  WalmartCategoryOptions,
  WalmartOffersOptions,
  WalmartSellerOptions,
  WalmartSellerProductsOptions,
} from "./namespaces/walmart.js";
export type {
  YouTubeSearchOptions,
  YouTubeShortsOptions,
  YouTubeSuggestionsOptions,
  YouTubeVideoOptions,
  YouTubeMetadataOptions,
  YouTubeCommentsOptions,
  YouTubeCommentRepliesOptions,
  YouTubeTranscriptOptions,
  YouTubeRelatedOptions,
  YouTubeChannelSearchOptions,
  YouTubeChannelOptions,
  YouTubeChannelVideosOptions,
  YouTubeChannelShortsOptions,
  YouTubeChannelCommunityOptions,
  YouTubeChannelResolveOptions,
  YouTubeStreamsOptions,
} from "./namespaces/youtube.js";
export type {
  RedditSort,
  RedditFeedSort,
  RedditSearchOptions,
  RedditSearchSuggestionsOptions,
  RedditPostOptions,
  RedditPostCommentsOptions,
  RedditCommentRepliesOptions,
  RedditSubredditOptions,
  RedditSubredditPostsOptions,
  RedditUserOptions,
  RedditUserFeedOptions,
  RedditPopularOptions,
} from "./namespaces/reddit.js";
export type {
  TikTokProfileOptions,
  TikTokUserPostsOptions,
  TikTokVideoOptions,
  TikTokVideoCommentsOptions,
  TikTokCommentRepliesOptions,
  TikTokSearchVideosOptions,
  TikTokSearchUsersOptions,
  TikTokHashtagOptions,
  TikTokHashtagVideosOptions,
  TikTokUserFollowersOptions,
  TikTokUserFollowingsOptions,
} from "./namespaces/tiktok.js";
export type {
  TikTokShopRegion,
  TikTokShopListingRegion,
  TikTokShopReviewSort,
  TikTokShopSearchOptions,
  TikTokShopSuggestionsOptions,
  TikTokShopProductOptions,
  TikTokShopProductReviewsOptions,
  TikTokShopCategoryProductsOptions,
  TikTokShopShopProductsOptions,
  TikTokShopResolveOptions,
} from "./namespaces/tiktok-shop.js";
export type {
  InstagramProfileOptions,
  InstagramUserFeedOptions,
  InstagramStoriesOptions,
  InstagramPostOptions,
  InstagramPostCommentsOptions,
  InstagramCommentRepliesOptions,
  InstagramSearchOptions,
  InstagramFollowOptions,
} from "./namespaces/instagram.js";
export type {
  XSearchOptions,
  XTweetOptions,
  XTweetCommentsOptions,
  XTweetRetweetersOptions,
  XUserOptions,
  XUserFeedOptions,
  XTrendingOptions,
} from "./namespaces/x.js";
export type {
  LinkedInPersonOptions,
  LinkedInPersonRefOptions,
  LinkedInPersonPostsRequest,
  LinkedInPersonPostsOptions,
  LinkedInPersonContactOptions,
  LinkedInCompanyOptions,
  LinkedInCompanyPostsRequest,
  LinkedInCompanyPostsOptions,
  LinkedInCompanyRefOptions,
  LinkedInSearchPeopleOptions,
  LinkedInSearchJobsOptions,
  LinkedInSearchPostsOptions,
  LinkedInJobOptions,
  LinkedInPostOptions,
  LinkedInPostCommentsOptions,
} from "./namespaces/linkedin.js";
export type {
  ThreadsProfileOptions,
  ThreadsUserPostsOptions,
  ThreadsUserRepliesOptions,
  ThreadsPostOptions,
  ThreadsPostCommentsOptions,
  ThreadsSearchUsersOptions,
} from "./namespaces/threads.js";
export type {
  KuaishouProfileOptions,
  KuaishouUserPostsOptions,
  KuaishouUserLiveOptions,
  KuaishouUserResolveOptions,
  KuaishouVideoOptions,
  KuaishouVideoCommentsOptions,
  KuaishouCommentRepliesOptions,
  KuaishouVideosBatchOptions,
  KuaishouSearchOptions,
  KuaishouSearchVideosOptions,
  KuaishouSearchUsersOptions,
  KuaishouSearchLiveOptions,
  KuaishouTagFeedOptions,
  KuaishouTrendingOptions,
} from "./namespaces/kuaishou.js";
export type {
  EbaySearchOptions,
  EbayProductOptions,
  EbaySellerOptions,
} from "./namespaces/ebay.js";
export type {
  TargetSearchOptions,
  TargetCategoryOptions,
  TargetProductOptions,
  TargetReviewsOptions,
} from "./namespaces/target.js";
export type {
  HomeDepotSearchOptions,
  HomeDepotProductOptions,
  HomeDepotReviewsOptions,
} from "./namespaces/home-depot.js";
export type {
  ZillowSearchOptions,
  ZillowPropertyOptions,
  ZillowAgentReviewsOptions,
} from "./namespaces/zillow.js";
export type {
  RedfinSearchOptions,
  RedfinPropertyOptions,
  RedfinMarketOptions,
} from "./namespaces/redfin.js";
export type {
  BookingSearchOptions,
  BookingHotelOptions,
  BookingReviewsOptions,
} from "./namespaces/booking.js";
export type {
  AirbnbSearchOptions,
  AirbnbListingOptions,
  AirbnbReviewsOptions,
} from "./namespaces/airbnb.js";
export type {
  TripadvisorLocationsOptions,
  TripadvisorSearchOptions,
  TripadvisorLocationOptions,
  TripadvisorReviewsOptions,
} from "./namespaces/tripadvisor.js";
export type {
  YelpSearchOptions,
  YelpBusinessOptions,
  YelpReviewsOptions,
} from "./namespaces/yelp.js";
export type {
  IndeedSearchOptions,
  IndeedJobOptions,
  IndeedCompanyOptions,
  IndeedCompanyReviewsOptions,
} from "./namespaces/indeed.js";
export type {
  GlassdoorCompaniesOptions,
  GlassdoorCompanyOptions,
  GlassdoorReviewsOptions,
  GlassdoorSalariesOptions,
} from "./namespaces/glassdoor.js";
export type {
  AppStoreSearchOptions,
  AppStoreAppOptions,
  AppStoreReviewsOptions,
} from "./namespaces/app-store.js";
export type {
  GooglePlaySearchOptions,
  GooglePlayAppOptions,
  GooglePlayReviewsOptions,
} from "./namespaces/google-play.js";
export type {
  G2SearchOptions,
  G2ProductOptions,
  G2ReviewsOptions,
} from "./namespaces/g2.js";
export type {
  CapterraSearchOptions,
  CapterraProductOptions,
  CapterraReviewsOptions,
} from "./namespaces/capterra.js";
export type {
  SECLookupOptions,
  SECCompanyOptions,
  SECFilingsOptions,
  SECConceptOptions,
  SECFactsOptions,
  SECSearchOptions,
} from "./namespaces/sec.js";
export type {
  CompaniesHouseSearchOptions,
  CompaniesHouseCompanyOptions,
  CompaniesHouseOfficersOptions,
  CompaniesHouseFilingHistoryOptions,
} from "./namespaces/companies-house.js";
export type {
  GoogleAdsAdvertisersOptions,
  GoogleAdsSearchOptions,
  GoogleAdsCreativeOptions,
} from "./namespaces/google-ads.js";
export type {
  MetaAdsSearchOptions,
  MetaAdsAdvertiserOptions,
  MetaAdsAdOptions,
} from "./namespaces/meta-ads.js";
