import type { Scavio } from "../client.js";

export interface YouTubeSearchOptions {
  query: string;
  upload_date?: string;
  type?: string;
  duration?: string;
  sort_by?: string;
  hd?: boolean;
  subtitles?: boolean;
  creative_commons?: boolean;
  live?: boolean;
}

export interface YouTubeMetadataOptions {
  video_id: string;
}

export class YouTubeNamespace {
  constructor(private client: Scavio) {}

  async search(
    options: YouTubeSearchOptions,
  ): Promise<Record<string, unknown>> {
    const { query, ...rest } = options;
    return this.client._post("/api/v1/youtube/search", {
      search: query,
      ...rest,
    });
  }

  async metadata(
    options: YouTubeMetadataOptions,
  ): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/youtube/metadata", options);
  }
}
