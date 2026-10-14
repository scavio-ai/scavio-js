import type { Scavio } from "../client.js";

// ChatGPT: 1 endpoint, POST /api/v1/chatgpt/prompt, 1 credit per answered
// prompt (a failed prompt is not charged). Answers take 10-40s, so the call
// raises the request timeout to AI_PROMPT_TIMEOUT when the client's is shorter.

/** Minimum request timeout (ms) for chatgpt.prompt() and gemini.prompt(). */
export const AI_PROMPT_TIMEOUT = 120_000;

export interface ChatgptPromptOptions {
  /** The prompt (1-1024 characters). */
  prompt: string;
  /** Model to answer with (default "auto"). */
  model?: string;
  /** 2-letter country code the answer is localized for (default "us"). */
  country?: string;
  /** Also return the answer as HTML in data.answer.html. */
  include_html?: boolean;
  [key: string]: unknown;
}

export class ChatgptNamespace {
  constructor(private client: Scavio) {}

  /**
   * Send a prompt to ChatGPT and get the answer it gives: the full Markdown
   * answer, every page it cites (title, publisher, date), the web searches it
   * ran and the products it recommended. Built for AI visibility monitoring.
   *
   * Costs 1 credit per answered prompt; failed prompts are not charged.
   */
  async prompt(options: ChatgptPromptOptions): Promise<Record<string, unknown>> {
    return this.client._post("/api/v1/chatgpt/prompt", options, undefined, AI_PROMPT_TIMEOUT);
  }
}
