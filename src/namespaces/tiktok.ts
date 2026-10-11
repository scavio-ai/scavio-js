import type { Scavio } from "../client.js";

export interface TikTokProfileOptions {
  /** TikTok @username (without the @). */
  username?: string;
  /** TikTok sec_user_id. */
  sec_user_id?: string;
  [key: string]: unknown;
}

export interface TikTokUserPostsOptions {
  /** TikTok sec_user_id. */
  sec_user_id: string;
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Results per page (1-30). */
  count?: number;
  /** '0' = latest, '1' = popular. */
  sort_type?: "0" | "1";
  [key: string]: unknown;
}

export interface TikTokVideoOptions {
  /** TikTok video id. */
  video_id: string;
  [key: string]: unknown;
}

export interface TikTokVideoTranscriptOptions {
  /** TikTok video id. Pass this or `url`. */
  video_id?: string;
  /** A TikTok video URL or share link (alternative to video_id, max 2000 characters). */
  url?: string;
  /** Preferred transcript language as a 2-letter code; defaults to the original spoken language. */
  language?: string;
  [key: string]: unknown;
}

export interface TikTokVideoCommentsOptions {
  /** TikTok video id. */
  video_id: string;
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Results per page (1-50). */
  count?: number;
  [key: string]: unknown;
}

export interface TikTokCommentRepliesOptions {
  /** TikTok video id. */
  video_id: string;
  /** Parent comment id. */
  comment_id: string;
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Results per page (1-50). */
  count?: number;
  [key: string]: unknown;
}

export interface TikTokSearchVideosOptions {
  /** Search keyword (1-500 characters). */
  keyword: string;
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Results per page (1-30). */
  count?: number;
  /** '0' = relevance, '1' = most likes. */
  sort_type?: "0" | "1";
  /** Age filter in days: 0 = all time, 1, 7, 30, 90, 180. */
  publish_time?: "0" | "1" | "7" | "30" | "90" | "180";
  [key: string]: unknown;
}

export interface TikTokSearchUsersOptions {
  /** Search keyword (1-500 characters). */
  keyword: string;
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Results per page (1-30). */
  count?: number;
  [key: string]: unknown;
}

export interface TikTokHashtagOptions {
  /** Hashtag name (without the #). */
  hashtag_name?: string;
  /** Hashtag id. */
  hashtag_id?: string;
  [key: string]: unknown;
}

export interface TikTokHashtagVideosOptions {
  /** Hashtag id. */
  hashtag_id: string;
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Results per page (1-30). */
  count?: number;
  [key: string]: unknown;
}

export interface TikTokUserFollowersOptions {
  /** TikTok sec_user_id. */
  sec_user_id: string;
  /** Results per page (1-20). */
  count?: number;
  /** Pagination token from a prior response. */
  page_token?: string;
  /** Minimum timestamp cursor. */
  min_time?: number;
  [key: string]: unknown;
}

export interface TikTokUserFollowingsOptions {
  /** TikTok sec_user_id. */
  sec_user_id: string;
  /** Results per page (1-20). */
  count?: number;
  /** Pagination token from a prior response. */
  page_token?: string;
  /** Minimum timestamp cursor. */
  min_time?: number;
  [key: string]: unknown;
}

export interface TikTokTrendingVideosOptions {
  /** Requested videos (1-15, server default 15). About 6 come back per call whatever is set. */
  count?: number;
  [key: string]: unknown;
}

export interface TikTokSearchSuggestionsOptions {
  /** Seed keyword (1-500 characters). */
  keyword: string;
  [key: string]: unknown;
}

export interface TikTokMusicOptions {
  /** The sound's numeric id, as a string. */
  music_id: string;
  [key: string]: unknown;
}

export interface TikTokMusicVideosOptions {
  /** The sound's numeric id, as a string. */
  music_id: string;
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Videos per page (1-30). Ignored upstream; pages hold about 14. */
  count?: number;
  [key: string]: unknown;
}

export interface TikTokSearchMusicOptions {
  /** Search keyword (1-500 characters). */
  keyword: string;
  /** Pagination offset: the previous response's cursor (default '0'). */
  cursor?: string;
  /** Sounds per page (1-20). */
  count?: number;
  [key: string]: unknown;
}

export interface TikTokMusicChartOptions {
  /** 'top' = Top 50 (server default), 'viral' = Viral 50. */
  chart?: "top" | "viral";
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Sounds per page (1-50). */
  count?: number;
  [key: string]: unknown;
}

export interface TikTokUserSimilarOptions {
  /** TikTok sec_user_id. */
  sec_user_id: string;
  /** next_page_token from a prior response. */
  page_token?: string;
  [key: string]: unknown;
}

export interface TikTokUserPlaylistsOptions {
  /** TikTok sec_user_id. */
  sec_user_id: string;
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Playlists per page (1-30). */
  count?: number;
  [key: string]: unknown;
}

export interface TikTokPlaylistVideosOptions {
  /** The playlist's numeric id (mixId from userPlaylists), as a string. */
  playlist_id: string;
  /** Pagination cursor (default '0'). */
  cursor?: string;
  /** Videos per page (1-30). */
  count?: number;
  [key: string]: unknown;
}

export interface TikTokUsernameOptions {
  /** TikTok username, with or without the @. */
  username: string;
  [key: string]: unknown;
}

export class TikTokNamespace {
  constructor(private client: Scavio) {}

  async profile(
    options: TikTokProfileOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/profile", options);
  }

  async userPosts(
    options: TikTokUserPostsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/user/posts", options);
  }

  async video(
    options: TikTokVideoOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/video", options);
  }

  /**
   * Spoken-word transcript of a TikTok video, as timestamped segments and
   * full text. Pass `video_id` or `url`. Videos with no spoken captions
   * (music, dance, muted clips) return `available: false`. 1 credit.
   */
  async videoTranscript(
    options: TikTokVideoTranscriptOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/video/transcript", options);
  }

  async videoComments(
    options: TikTokVideoCommentsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/video/comments", options);
  }

  async commentReplies(
    options: TikTokCommentRepliesOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/video/comments/replies", options);
  }

  async searchVideos(
    options: TikTokSearchVideosOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/search/videos", options);
  }

  async searchUsers(
    options: TikTokSearchUsersOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/search/users", options);
  }

  async hashtag(
    options: TikTokHashtagOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/hashtag", options);
  }

  async hashtagVideos(
    options: TikTokHashtagVideosOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/hashtag/videos", options);
  }

  async userFollowers(
    options: TikTokUserFollowersOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/user/followers", options);
  }

  async userFollowings(
    options: TikTokUserFollowingsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/user/followings", options);
  }

  /**
   * Search terms trending on TikTok now (about 90 per call, US-weighted, no
   * region filter). Costs 1 credit.
   */
  async trendingSearches(): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/trending/searches", {});
  }

  /**
   * A sample of videos trending on TikTok now, with author, stats, sound and
   * hashtags. Each call returns about 6 videos whatever `count` is set to;
   * call again for a fresh sample. No region filter. Costs 1 credit.
   * Returns TikTok's raw payload: large numeric ids can lose precision as JSON
   * numbers, so use the string forms (`id_str`, `sec_uid`).
   */
  async trendingVideos(
    options: TikTokTrendingVideosOptions = {},
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/trending/videos", options);
  }

  /**
   * TikTok search autocomplete suggestions for a keyword. Long-tail keywords
   * can return none, which is still a billed answer. Costs 1 credit.
   */
  async searchSuggestions(
    options: TikTokSearchSuggestionsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/search/suggestions", options);
  }

  /**
   * A TikTok sound by id: title, artist, album, duration, how many videos use
   * it, original vs commercial, play URL, cover, and chart rank when charting.
   * Costs 1 credit.
   * Returns TikTok's raw payload: large numeric ids can lose precision as JSON
   * numbers, so use the string forms (`id_str`, `sec_uid`).
   */
  async music(options: TikTokMusicOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/music", options);
  }

  /**
   * Videos that use a TikTok sound, about 14 per page (`count` is ignored
   * upstream). Costs 1 credit.
   * Returns TikTok's raw payload: large numeric ids can lose precision as JSON
   * numbers, so use the string forms (`id_str`, `sec_uid`).
   */
  async musicVideos(
    options: TikTokMusicVideosOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/music/videos", options);
  }

  /**
   * Search TikTok sounds by keyword: id, title, artist, duration, usage count
   * and play URL. Costs 1 credit.
   * Returns TikTok's raw payload: large numeric ids can lose precision as JSON
   * numbers, so use the string forms (`id_str`, `sec_uid`).
   */
  async searchMusic(
    options: TikTokSearchMusicOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/search/music", options);
  }

  /**
   * TikTok's Top 50 or Viral 50 sound chart, with each sound's details and
   * trend. One global chart, no region filter. Costs 1 credit.
   * Returns TikTok's raw payload: large numeric ids can lose precision as JSON
   * numbers, so use the string forms (`id_str`, `sec_uid`).
   */
  async musicChart(
    options: TikTokMusicChartOptions = {},
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/music/chart", options);
  }

  /**
   * Creators similar to a TikTok user (about 30 per page), with follower,
   * following, video and like counts, bio and verification. Costs 1 credit.
   * Returns TikTok's raw payload: large numeric ids can lose precision as JSON
   * numbers, so use the string forms (`id_str`, `sec_uid`).
   */
  async userSimilar(
    options: TikTokUserSimilarOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/user/similar", options);
  }

  /**
   * A TikTok user's playlists (series): id, name, video count and cover.
   * Accounts without playlists return an empty list. Costs 1 credit.
   */
  async userPlaylists(
    options: TikTokUserPlaylistsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/user/playlists", options);
  }

  /**
   * Videos in a TikTok playlist, with pagination. Costs 1 credit.
   * Returns TikTok's raw payload: large numeric ids can lose precision as JSON
   * numbers, so use the string forms (`id_str`, `sec_uid`).
   */
  async playlistVideos(
    options: TikTokPlaylistVideosOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/playlist/videos", options);
  }

  /**
   * Whether a TikTok user is live now: the user, live room status (2 = live,
   * 4 = not live), title, start time and viewer counts. An unknown username is
   * a billed 404. Costs 1 credit.
   */
  async userLive(
    options: TikTokUsernameOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/user/live", options);
  }

  /**
   * The region a TikTok account is registered in (ISO country code, not the
   * creator's nationality), plus its user id and sec_user_id. An unknown
   * username is a 404 and is not billed. Costs 1 credit.
   */
  async userRegion(
    options: TikTokUsernameOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/tiktok/user/region", options);
  }
}
