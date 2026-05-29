import type { Scavio } from "../client.js";

export interface GoogleSearchOptions {
  query: string;
  country_code?: string;
  language?: string;
  page?: number;
  search_type?: string;
  device?: string;
  nfpr?: boolean;
  light_request?: boolean;
}

export class GoogleNamespace {
  constructor(private client: Scavio) {}

  async search(options: GoogleSearchOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/google", options);
  }
}
