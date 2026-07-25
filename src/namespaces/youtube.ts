import type { Scavio } from "../client.js";

export interface YouTubeSearchOptions {
  /** Search query (1-500 characters). Sent to the API as 'search'. */
  query: string;
  /** Filter by upload date. */
  upload_date?: "last_hour" | "today" | "this_week" | "this_month" | "this_year";
  /** Filter by result type. */
  type?: "video" | "channel" | "playlist" | "movie";
  /** short (<4 min), medium (4-20 min), long (>20 min). */
  duration?: "short" | "medium" | "long";
  /** Sort order. */
  sort_by?: "relevance" | "date" | "view_count" | "rating";
  /**
   * Feature filters, e.g. ["hd", "4k", "subtitles", "creative_commons",
   * "live", "360", "3d", "hdr", "vr180"].
   */
  features?: string[];
  /** Pagination cursor from a prior response. */
  cursor?: string;
  /** HD videos only. */
  hd?: boolean;
  /** Videos with subtitles/CC only. */
  subtitles?: boolean;
  /** Creative Commons licensed only. */
  creative_commons?: boolean;
  /** Live videos only. */
  live?: boolean;
  /** HDR videos only. */
  hdr?: boolean;
  /** Videos with location metadata only. */
  location?: boolean;
  /** VR180 videos only. */
  vr180?: boolean;
  /** 4K videos only. Sent to the API as '4k'. */
  fourK?: boolean;
  /** 360-degree videos only. Sent to the API as '360'. */
  video_360?: boolean;
  /** 3D videos only. Sent to the API as '3d'. */
  video_3d?: boolean;
  [key: string]: unknown;
}

export interface YouTubeShortsOptions {
  /** Search query (1-500 characters). Sent to the API as 'search'. */
  query: string;
  /** Sort order. */
  sort_by?: "relevance" | "date" | "view_count" | "rating";
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface YouTubeSuggestionsOptions {
  /** Search query (1-500 characters). Sent to the API as 'search'. */
  query: string;
  /** Language code for suggestions (default 'en'). */
  language?: string;
  /** Region code for suggestions (default 'US'). */
  region?: string;
  [key: string]: unknown;
}

export interface YouTubeVideoOptions {
  /** YouTube video id (e.g. 'dQw4w9WgXcQ') or a full watch URL. */
  video_id: string;
  [key: string]: unknown;
}

/** @deprecated Use YouTubeVideoOptions with youtube.video(). */
export interface YouTubeMetadataOptions {
  /** YouTube video id (e.g. 'dQw4w9WgXcQ') or a full watch URL. */
  video_id: string;
  [key: string]: unknown;
}

export interface YouTubeCommentsOptions {
  /** YouTube video id or a full watch URL. */
  video_id: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface YouTubeCommentRepliesOptions {
  /** YouTube video id or a full watch URL. */
  video_id: string;
  /** Reply cursor from a parent comment's 'reply_cursor'. */
  reply_cursor: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface YouTubeTranscriptOptions {
  /** YouTube video id or a full watch URL. */
  video_id: string;
  /** Caption language code (default 'en'). */
  language?: string;
  /** 'text' for plain transcript, 'srt' for timed subtitles (default 'text'). */
  format?: "text" | "srt";
  [key: string]: unknown;
}

export interface YouTubeRelatedOptions {
  /** YouTube video id or a full watch URL. */
  video_id: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface YouTubeChannelSearchOptions {
  /** Search query (1-500 characters). Sent to the API as 'search'. */
  query: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface YouTubeChannelOptions {
  /** YouTube channel id, @handle, or channel URL. */
  channel_id: string;
  [key: string]: unknown;
}

export interface YouTubeChannelVideosOptions {
  /** YouTube channel id. */
  channel_id: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface YouTubeChannelShortsOptions {
  /** YouTube channel id. */
  channel_id: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface YouTubeChannelCommunityOptions {
  /** YouTube channel id. */
  channel_id: string;
  /** Pagination cursor from a prior response. */
  cursor?: string;
  [key: string]: unknown;
}

export interface YouTubeChannelResolveOptions {
  /** A channel @handle or channel URL to resolve to a channel id. */
  channel: string;
  [key: string]: unknown;
}

export interface YouTubeStreamsOptions {
  /** YouTube video id or a full watch URL. */
  video_id: string;
  [key: string]: unknown;
}

export class YouTubeNamespace {
  constructor(private client: Scavio) {}

  async search(
    options: YouTubeSearchOptions,
  ): Promise<Record<string, unknown>> {
    const { query, fourK, video_360, video_3d, ...rest } = options;
    const body: Record<string, unknown> = {
      search: query,
      ...rest,
    };
    if (fourK !== undefined) body["4k"] = fourK;
    if (video_360 !== undefined) body["360"] = video_360;
    if (video_3d !== undefined) body["3d"] = video_3d;
    return this.client._post("/api/v1/youtube/search", body);
  }

  async shorts(
    options: YouTubeShortsOptions,
  ): Promise<Record<string, unknown>> {
    const { query, ...rest } = options;
    return this.client._post("/api/v1/youtube/shorts", {
      search: query,
      ...rest,
    });
  }

  async suggestions(
    options: YouTubeSuggestionsOptions,
  ): Promise<Record<string, unknown>> {
    const { query, ...rest } = options;
    return this.client._post("/api/v1/youtube/suggestions", {
      search: query,
      ...rest,
    });
  }

  async video(
    options: YouTubeVideoOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/youtube/video", options);
  }

  /** @deprecated Use youtube.video(). Alias kept for backward compatibility. */
  async metadata(
    options: YouTubeMetadataOptions,
  ): Promise<Record<string, unknown>> {
    return this.video(options);
  }

  async comments(
    options: YouTubeCommentsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/youtube/comments", options);
  }

  async commentReplies(
    options: YouTubeCommentRepliesOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/youtube/comments/replies", options);
  }

  async transcript(
    options: YouTubeTranscriptOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/youtube/transcript", options);
  }

  async related(
    options: YouTubeRelatedOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/youtube/related", options);
  }

  async channelSearch(
    options: YouTubeChannelSearchOptions,
  ): Promise<Record<string, unknown>> {
    const { query, ...rest } = options;
    return this.client._post("/api/v1/youtube/channel/search", {
      search: query,
      ...rest,
    });
  }

  async channel(
    options: YouTubeChannelOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/youtube/channel", options);
  }

  async channelVideos(
    options: YouTubeChannelVideosOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/youtube/channel/videos", options);
  }

  async channelShorts(
    options: YouTubeChannelShortsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/youtube/channel/shorts", options);
  }

  async channelCommunity(
    options: YouTubeChannelCommunityOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/youtube/channel/community", options);
  }

  async channelResolve(
    options: YouTubeChannelResolveOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/youtube/channel/resolve", options);
  }

  async streams(
    options: YouTubeStreamsOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/youtube/streams", options);
  }
}
