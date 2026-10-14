import type { Scavio } from "../client.js";
import { AI_PROMPT_TIMEOUT } from "./chatgpt.js";

// Gemini: 1 endpoint, POST /api/v1/gemini/prompt, 5 credits per answered
// prompt (a failed prompt is not charged). Same response shape as
// chatgpt.prompt(); sources carry URLs only and search_queries is empty.

export interface GeminiPromptOptions {
  /** The prompt (1-4000 characters). */
  prompt: string;
  [key: string]: unknown;
}

export class GeminiNamespace {
  constructor(private client: Scavio) {}

  /**
   * Send a prompt to Google Gemini and get the answer it gives as Markdown,
   * with the URLs it cites and the products it recommended. Same response
   * shape as chatgpt.prompt().
   *
   * Costs 5 credits per answered prompt; failed prompts are not charged.
   */
  async prompt(options: GeminiPromptOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/gemini/prompt", options, undefined, AI_PROMPT_TIMEOUT);
  }
}
