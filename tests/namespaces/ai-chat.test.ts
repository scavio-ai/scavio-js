import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, AI_PROMPT_TIMEOUT } from "../../src/index.js";

// Method names match the dashboard Playground's SDK snippets
// (chatgpt.prompt / gemini.prompt).

function body(call = 0): unknown {
  return JSON.parse((vi.mocked(fetch).mock.calls[call]![1] as RequestInit).body as string);
}

describe("ChatgptNamespace / GeminiNamespace", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("chatgpt.prompt posts the full body", async () => {
    const client = new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50 });
    const args = { prompt: "best crm", model: "gpt-5", country: "gb", include_html: true };
    await client.chatgpt.prompt(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe("https://api.scavio.dev/api/v1/chatgpt/prompt");
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("gemini.prompt posts the prompt", async () => {
    const client = new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50 });
    await client.gemini.prompt({ prompt: "best crm" });
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/gemini/prompt");
    expect(body()).toEqual({ prompt: "best crm" });
  });

  it("raises the request timeout for prompts, never lowers it, and leaves other calls alone", async () => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);

    await new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50 }).chatgpt.prompt({ prompt: "hi" });
    expect(delays()).toContain(AI_PROMPT_TIMEOUT);

    spy.mockClear();
    await new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }).gemini.prompt({ prompt: "hi" });
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(AI_PROMPT_TIMEOUT);

    spy.mockClear();
    await new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50 }).trustpilot.search({ query: "vpn" });
    expect(delays()).toContain(30_000);
    expect(delays()).not.toContain(AI_PROMPT_TIMEOUT);
  });
});
