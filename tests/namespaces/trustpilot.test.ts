import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown> | undefined, path: string];

// Method names match the dashboard Playground's SDK snippets (trustpilot.<endpoint>).
const ENDPOINTS: Row[] = [
  ["search", { query: "vpn" }, "/api/v1/trustpilot/search"],
  ["business", { domain: "nordvpn.com" }, "/api/v1/trustpilot/business"],
  ["reviews", { domain: "nordvpn.com" }, "/api/v1/trustpilot/reviews"],
  ["categories", {}, "/api/v1/trustpilot/categories"],
  ["category", { category_id: "vpn_service" }, "/api/v1/trustpilot/category"],
  ["review", { review_id: "6aca2504b52cc4b518bf4b75" }, "/api/v1/trustpilot/review"],
];

function body(call = 0): unknown {
  return JSON.parse((vi.mocked(fetch).mock.calls[call]![1] as RequestInit).body as string);
}

describe("TrustpilotNamespace", () => {
  let client: Scavio;

  beforeEach(() => {
    client = new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50 });
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exposes all 6 endpoints", () => {
    expect(ENDPOINTS).toHaveLength(6);
  });

  it.each(ENDPOINTS)("%s posts its body to %s", async (method, args, path) => {
    const ns = client.trustpilot as unknown as Record<
      string,
      (opts?: Record<string, unknown>) => Promise<unknown>
    >;
    await ns[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("search carries country and page_size", async () => {
    await client.trustpilot.search({ query: "vpn", country: "GB", page_size: 50, page: 2 });
    expect(body()).toEqual({ query: "vpn", country: "GB", page_size: 50, page: 2 });
  });

  it("business accepts a Trustpilot URL instead of a domain", async () => {
    await client.trustpilot.business({
      url: "https://www.trustpilot.com/review/nordvpn.com",
      language: "de",
    });
    expect(body()).toEqual({ url: "https://www.trustpilot.com/review/nordvpn.com", language: "de" });
  });

  it("reviews sends every filter in snake_case with arrays intact", async () => {
    await client.trustpilot.reviews({
      domain: "nordvpn.com",
      page: 3,
      stars: [1, 2],
      language: "en",
      date_range: "last30days",
      sort: "relevance",
      verified_only: true,
      with_replies: true,
      topics: ["customer_service"],
      search: "refund",
    });
    expect(body()).toEqual({
      domain: "nordvpn.com",
      page: 3,
      stars: [1, 2],
      language: "en",
      date_range: "last30days",
      sort: "relevance",
      verified_only: true,
      with_replies: true,
      topics: ["customer_service"],
      search: "refund",
    });
  });

  it("categories can be called with no arguments or a name", async () => {
    await client.trustpilot.categories();
    await client.trustpilot.categories({ query: "insurance", country: "GB" });
    expect(body(0)).toEqual({});
    expect(body(1)).toEqual({ query: "insurance", country: "GB" });
  });

  it("category carries sort, min_trust_score and claimed_only", async () => {
    await client.trustpilot.category({
      category_id: "vpn_service",
      sort: "reviews_count",
      min_trust_score: 4.5,
      claimed_only: true,
      page: 2,
    });
    expect(body()).toEqual({
      category_id: "vpn_service",
      sort: "reviews_count",
      min_trust_score: 4.5,
      claimed_only: true,
      page: 2,
    });
  });
});
