import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, TCGPLAYER_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "charizard", game: "pokemon", sort: "price_desc", limit: 10 }, "/api/v1/tcgplayer/search"],
  ["search", { game: "pokemon", set: "base-set", product_type: "cards", page: 2 }, "/api/v1/tcgplayer/search"],
  ["product", { product_id: 219058 }, "/api/v1/tcgplayer/product"],
  ["product", { url: "https://www.tcgplayer.com/product/219058/pokemon-battle-academy" }, "/api/v1/tcgplayer/product"],
  [
    "listings",
    { product_id: 1479, condition: ["Near Mint"], printing: "Foil", verified_sellers: true, sort: "price", limit: 50 },
    "/api/v1/tcgplayer/listings",
  ],
  ["priceHistory", { product_id: "219058", range: "month" }, "/api/v1/tcgplayer/price-history"],
  ["sales", { product_id: 219058, condition: "NM,LP" }, "/api/v1/tcgplayer/sales"],
  ["sets", { game: "pokemon" }, "/api/v1/tcgplayer/sets"],
  ["sets", { game: 3 }, "/api/v1/tcgplayer/sets"],
  ["priceGuide", { set_id: 604, product_type: "sealed", limit: 500 }, "/api/v1/tcgplayer/price-guide"],
  ["suggestions", { query: "charizard" }, "/api/v1/tcgplayer/suggestions"],
  ["trending", { game: "yugioh" }, "/api/v1/tcgplayer/trending"],
  ["seller", { seller_key: "58f7acae" }, "/api/v1/tcgplayer/seller"],
  [
    "sellerFeedback",
    { seller_key: "bf43b501", rating: 1, with_comment: true, page: 2 },
    "/api/v1/tcgplayer/seller-feedback",
  ],
  ["sellerProducts", { seller_key: "58f7acae", game: "pokemon", sort: "price_asc" }, "/api/v1/tcgplayer/seller-products"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("tcgplayer namespace", () => {
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

  const body = () =>
    JSON.parse((vi.mocked(fetch).mock.calls[0]![1] as RequestInit).body as string);

  it.each(ENDPOINTS)("tcgplayer.%s posts its body to %s", async (method, args, path) => {
    await (client.tcgplayer as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("tcgplayer.games takes no options and posts an empty body", async () => {
    await client.tcgplayer.games();
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe("https://api.scavio.dev/api/v1/tcgplayer/games");
    expect(body()).toEqual({});
  });

  it("tcgplayer.trending options are optional", async () => {
    await client.tcgplayer.trending();
    expect(body()).toEqual({});
  });

  it("has all 13 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.tcgplayer)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(
      [
        "search",
        "product",
        "listings",
        "priceHistory",
        "sales",
        "games",
        "sets",
        "priceGuide",
        "suggestions",
        "trending",
        "seller",
        "sellerFeedback",
        "sellerProducts",
      ].sort(),
    );
  });

  it("TCGPLAYER_TIMEOUT is 120 s", () => {
    expect(TCGPLAYER_TIMEOUT).toBe(120_000);
  });

  it.each([
    ["search", { query: "charizard" }],
    ["product", { product_id: 219058 }],
    ["listings", { product_id: 219058 }],
    ["priceHistory", { product_id: 219058 }],
    ["sales", { product_id: 219058 }],
    ["games", undefined],
    ["sets", { game: "pokemon" }],
    ["priceGuide", { set_id: 604 }],
    ["suggestions", { query: "charizard" }],
    ["trending", undefined],
    ["seller", { seller_key: "58f7acae" }],
    ["sellerFeedback", { seller_key: "58f7acae" }],
    ["sellerProducts", { seller_key: "58f7acae" }],
  ] as const)("tcgplayer.%s raises the request timeout, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => (c.tcgplayer as unknown as Ns)[method]!(args as Record<string, unknown> | undefined);

    await call(client);
    expect(delays()).toContain(TCGPLAYER_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(TCGPLAYER_TIMEOUT);
  });
});
