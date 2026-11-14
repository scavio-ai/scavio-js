import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, MAISONSDUMONDE_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "table" }, "/api/v1/maisonsdumonde/search"],
  [
    "search",
    {
      query: "couchtisch",
      country: "de",
      sort: "price_asc",
      page: 2,
      min_discount: 30,
      color: ["n9660c0e9e5310638a19012509703a483cebdb2b"],
      filters: { nbs: ["CAPACITY_2_places"] },
    },
    "/api/v1/maisonsdumonde/search",
  ],
  ["search", { query: "chaise", sold_by: "mdm", on_sale: true, seller: "BESTMOBILIER" }, "/api/v1/maisonsdumonde/search"],
  ["product", { id: "204172", country: "ch", language: "de" }, "/api/v1/maisonsdumonde/product"],
  ["product", { url: "https://www.maisonsdumonde.com/BE/nl/p/x-186339.htm" }, "/api/v1/maisonsdumonde/product"],
  [
    "category",
    { category: "canapes-n4dc562d7bb509362a3a2102db4cbf90b6454f1f", min_rating: 4 },
    "/api/v1/maisonsdumonde/category",
  ],
  ["deals", { event: "second_chance", sort: "price_desc" }, "/api/v1/maisonsdumonde/deals"],
  ["reviews", { id: "186339", sort: "rating_asc", cursor: "eyJzb3J0IjpbMV19", limit: 30 }, "/api/v1/maisonsdumonde/reviews"],
  ["stores", { postcode: "75011", limit: 3 }, "/api/v1/maisonsdumonde/stores"],
  ["store", { store_id: "41" }, "/api/v1/maisonsdumonde/store"],
  ["availability", { id: "204172", store_id: "125", country: "fr" }, "/api/v1/maisonsdumonde/availability"],
  ["seller", { seller_id: "2066", page: 2 }, "/api/v1/maisonsdumonde/seller"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("maisonsdumonde namespace", () => {
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

  it.each(ENDPOINTS)("maisonsdumonde.%s posts its body to %s", async (method, args, path) => {
    await (client.maisonsdumonde as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("deals() works with no options", async () => {
    await client.maisonsdumonde.deals();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/maisonsdumonde/deals");
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.maisonsdumonde)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "availability", "category", "deals", "product", "reviews", "search", "seller", "store", "stores",
    ]);
  });

  it("timeout: 120 s", () => {
    expect(MAISONSDUMONDE_TIMEOUT).toBe(120_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "maisonsdumonde.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.maisonsdumonde as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(MAISONSDUMONDE_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(MAISONSDUMONDE_TIMEOUT);
    },
  );
});
