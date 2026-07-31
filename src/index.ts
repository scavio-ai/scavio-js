export { Scavio } from "./client.js";
export type { ScavioConfig } from "./client.js";

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
  LinkedInPersonPostsOptions,
  LinkedInPersonContactOptions,
  LinkedInCompanyOptions,
  LinkedInCompanyPostsOptions,
  LinkedInCompanyRefOptions,
  LinkedInSearchPeopleOptions,
  LinkedInSearchJobsOptions,
  LinkedInSearchPostsOptions,
  LinkedInJobOptions,
  LinkedInPostOptions,
  LinkedInPostCommentsOptions,
} from "./namespaces/linkedin.js";
