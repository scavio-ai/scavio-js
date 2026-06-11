export { Scavio } from "./client.js";
export type { ScavioConfig } from "./client.js";

export {
  ScavioError,
  MissingAPIKeyError,
  InvalidAPIKeyError,
  InsufficientCreditsError,
  BadRequestError,
  RateLimitError,
  ScavioAPIError,
} from "./errors.js";

export type { GoogleSearchOptions } from "./namespaces/google.js";
export type {
  AmazonSearchOptions,
  AmazonProductOptions,
} from "./namespaces/amazon.js";
export type {
  WalmartSearchOptions,
  WalmartProductOptions,
} from "./namespaces/walmart.js";
export type {
  YouTubeSearchOptions,
  YouTubeMetadataOptions,
} from "./namespaces/youtube.js";
export type {
  RedditSearchOptions,
  RedditPostOptions,
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
  InstagramProfileOptions,
  InstagramUserFeedOptions,
  InstagramStoriesOptions,
  InstagramPostOptions,
  InstagramPostCommentsOptions,
  InstagramCommentRepliesOptions,
  InstagramSearchOptions,
  InstagramFollowOptions,
} from "./namespaces/instagram.js";
