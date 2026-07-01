import type { Scavio } from "../client.js";

export interface YouTubeSearchOptions {
  /** Search query (1-500 characters). Sent to the API as 'search'. */
  query: string;
  /** Filter by upload date. */
  upload_date?: "last_hour" | "today" | "this_week" | "this_month" | "this_year";
  /** Filter by result type. */
  type?: "video" | "channel" | "playlist";
  /** short (<4 min), medium (4-20 min), long (>20 min). */
  duration?: "short" | "medium" | "long";
  /** Sort order. */
  sort_by?: "relevance" | "date" | "view_count" | "rating";
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

export interface YouTubeMetadataOptions {
  /** YouTube video id (e.g. 'dQw4w9WgXcQ'). */
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

  async metadata(
    options: YouTubeMetadataOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/youtube/metadata", options);
  }
}
