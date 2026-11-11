import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, FANATICS_TIMEOUT, FANATICS_REVIEWS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "chiefs jersey" }, "/api/v1/fanatics/search"],
  [
    "search",
    {
      query: "chiefs jersey",
      site: "nflshop",
      gender: "women",
      league_id: 25,
      department_id: "8011",
      filters: { ks: "126" },
      page: 2,
      page_size: 24,
      sort: "price_low_to_high",
    },
    "/api/v1/fanatics/search",
  ],
  ["search", { query: "trikot", country: "de" }, "/api/v1/fanatics/search"],
  ["product", { product_id: "3892922" }, "/api/v1/fanatics/product"],
  ["product", { url: "https://www.fanatics.ca/fr/x/p-3892922", country: "ca", language: "fr" }, "/api/v1/fanatics/product"],
  [
    "browse",
    { team_id: 3372, department_id: "8008-8084", price_band: "25_50", on_sale: true, gender: "kids" },
    "/api/v1/fanatics/browse",
  ],
  ["browse", { url: "https://www.fanatics.com/nba/los-angeles-lakers/o-23+t-3372" }, "/api/v1/fanatics/browse"],
  ["deals", { type: "clearance", league_id: 25, country: "jp" }, "/api/v1/fanatics/deals"],
  ["reviews", { product_id: "3892922", sort: "most_recent", rating: 5, limit: 50 }, "/api/v1/fanatics/reviews"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("fanatics namespace", () => {
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

  it.each(ENDPOINTS)("fanatics.%s posts its body to %s", async (method, args, path) => {
    await (client.fanatics as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("fanatics.deals options are optional", async () => {
    await client.fanatics.deals();
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe("https://api.scavio.dev/api/v1/fanatics/deals");
    expect(body()).toEqual({});
  });

  it("has all 5 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.fanatics)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["search", "product", "browse", "deals", "reviews"].sort());
  });

  it("FANATICS_TIMEOUT is 120 s, FANATICS_REVIEWS_TIMEOUT 300 s", () => {
    expect(FANATICS_TIMEOUT).toBe(120_000);
    expect(FANATICS_REVIEWS_TIMEOUT).toBe(300_000);
  });

  it.each([
    ["search", { query: "chiefs jersey" }],
    ["product", { product_id: "3892922" }],
    ["browse", { team_id: 3372 }],
    ["deals", undefined],
  ] as const)("fanatics.%s raises the request timeout, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => (c.fanatics as unknown as Ns)[method]!(args as Record<string, unknown> | undefined);

    await call(client);
    expect(delays()).toContain(FANATICS_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
    expect(delays()).toContain(400_000);
    expect(delays()).not.toContain(FANATICS_TIMEOUT);
  });

  it("fanatics.reviews raises the request timeout to 300 s, never lowers it", async () => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => c.fanatics.reviews({ product_id: "3892922" });

    await call(client);
    expect(delays()).toContain(FANATICS_REVIEWS_TIMEOUT);
    expect(delays()).not.toContain(FANATICS_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
    expect(delays()).toContain(400_000);
    expect(delays()).not.toContain(FANATICS_REVIEWS_TIMEOUT);
  });
});
