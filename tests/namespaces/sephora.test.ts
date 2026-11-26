import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, SEPHORA_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  // US: no country is sent unless passed.
  ["search", { query: "lipstick", sort: "best_selling", zip: "10001" }, "/api/v1/sephora/search"],
  ["category", { category: "lipstick", page: 2 }, "/api/v1/sephora/category"],
  ["product", { product_id: "P510799" }, "/api/v1/sephora/product"],
  // Sephora Canada: country "ca" and its fields pass through verbatim.
  [
    "search",
    { query: "lip oil", country: "ca", sort: "price_low", filters: { brand: "The Ordinary", on_sale: true, rating: 4 }, include_facets: true, language: "fr" },
    "/api/v1/sephora/search",
  ],
  ["category", { category: "lipstick", country: "ca", sort: "newest", filters: [{ value: "x" }] }, "/api/v1/sephora/category"],
  ["product", { product_id: "P428500", country: "ca", language: "en" }, "/api/v1/sephora/product"],
  ["brand", { brand: "the-ordinary", page: 2, sort: "rating", filters: { new: true } }, "/api/v1/sephora/brand"],
  ["brands", { language: "fr" }, "/api/v1/sephora/brands"],
  ["suggestions", { query: "lip" }, "/api/v1/sephora/suggestions"],
  ["offers", { language: "en" }, "/api/v1/sephora/offers"],
  ["stores", { province: "QC" }, "/api/v1/sephora/stores"],
  ["store", { store: "toronto-eaton-centre" }, "/api/v1/sephora/store"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("sephora namespace", () => {
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

  it.each(ENDPOINTS)("sephora.%s posts its body to %s", async (method, args, path) => {
    await (client.sephora as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["brands", "offers", "stores"] as const)("sephora.%s takes no options and posts an empty body", async (method) => {
    await client.sephora[method]();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev/api/v1/sephora/${method}`);
    expect(body()).toEqual({});
  });

  it("SEPHORA_TIMEOUT is 120 s", () => {
    expect(SEPHORA_TIMEOUT).toBe(120_000);
  });

  it.each([
    ["search", { query: "lipstick" }],
    ["category", { category: "lipstick" }],
    ["product", { product_id: "P428500", country: "ca" }],
    ["brand", { brand: "dior" }],
    ["brands", undefined],
    ["suggestions", { query: "lip" }],
    ["offers", undefined],
    ["stores", undefined],
    ["store", { store: "toronto-eaton-centre" }],
  ] as const)("sephora.%s raises the request timeout, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => (c.sephora as unknown as Ns)[method]!(args as Record<string, unknown> | undefined);

    await call(client);
    expect(delays()).toContain(SEPHORA_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(SEPHORA_TIMEOUT);
  });
});
