import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

describe("GoogleNamespace (v2)", () => {
  let client: Scavio;

  beforeEach(() => {
    client = new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 10 });
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ organic_results: [] }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function lastUrl(): string {
    const calls = vi.mocked(fetch).mock.calls;
    return calls[calls.length - 1]![0] as string;
  }

  it("search posts to /api/v2/google with a passthrough body", async () => {
    await client.google.search({ query: "cold brew", gl: "us" });
    expect(fetch).toHaveBeenLastCalledWith(
      "https://api.scavio.dev/api/v2/google",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ query: "cold brew", gl: "us" }),
      }),
    );
  });

  it("top-level client.search is an alias hitting v2", async () => {
    await client.search({ query: "cold brew" });
    expect(lastUrl()).toBe("https://api.scavio.dev/api/v2/google");
  });

  it("maps each endpoint to its correct nested path", async () => {
    const cases: [() => Promise<unknown>, string][] = [
      [() => client.google.aiMode({ query: "q" }), "/api/v2/google/ai-mode"],
      [() => client.google.mapsSearch({ query: "q" }), "/api/v2/google/maps/search"],
      [() => client.google.mapsPlace({ place_id: "ChIJ" }), "/api/v2/google/maps/place"],
      [() => client.google.mapsReviews({ data_id: "0x1:0x2" }), "/api/v2/google/maps/reviews"],
      [() => client.google.shopping({ query: "laptop" }), "/api/v2/google/shopping"],
      [
        () => client.google.shoppingProduct({ catalog_id: "700", query: "laptop" }),
        "/api/v2/google/shopping/product",
      ],
      [
        () => client.google.shoppingStores({ catalog_id: "700", next_page_token: "tok" }),
        "/api/v2/google/shopping/product/stores",
      ],
      [
        () => client.google.flights({ departure_id: "JFK", arrival_id: "LAX", outbound_date: "2026-12-15" }),
        "/api/v2/google/flights",
      ],
      [
        () => client.google.hotels({ query: "Bali", check_in_date: "2026-08-01", check_out_date: "2026-08-03" }),
        "/api/v2/google/hotels",
      ],
      [
        () => client.google.hotelsDetail({ detail_token: "t", check_in_date: "2026-08-01", check_out_date: "2026-08-03" }),
        "/api/v2/google/hotels/detail",
      ],
      [() => client.google.news({ query: "openai" }), "/api/v2/google/news"],
      [() => client.google.trends({ query: "bitcoin" }), "/api/v2/google/trends"],
      [() => client.google.trending({ geo: "US" }), "/api/v2/google/trending"],
    ];
    for (const [call, path] of cases) {
      await call();
      expect(lastUrl(), path).toBe(`https://api.scavio.dev${path}`);
    }
  });
});
