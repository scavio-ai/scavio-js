import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, DOLLARTREE_TIMEOUT, DOLLARTREE_SLOW_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/dollartree/";
const ENDPOINTS: Row[] = [
  ["search", { q: "paper plates" }, B + "search"],
  ["search", { q: "paper plates", category: "4070223595", brand: "Dixie", page: 2, page_size: 96, sort: "price_low", filters: ["3543933063"], price_point: 1.25, rating: 4, in_store_only: true, min_price: 1, max_price: 5 }, B + "search"],
  ["product", { item_id: "221159" }, B + "product"],
  ["product", { url: "https://www.dollartree.com/x/221159" }, B + "product"],
  ["category", { category: "3804024826", q: "ornaments", sort: "newest" }, B + "category"],
  ["categories", { category: 2264625405 }, B + "categories"],
  ["brand", { brand: "Dixie", category: "4070223595" }, B + "brand"],
  ["deals", { type: "more_choices", q: "mugs" }, B + "deals"],
  ["storeStock", { item_id: "221159", store: "5126" }, B + "store-stock"],
  ["storeStock", { item_id: "221159", store: 5126, zip: "10035", state: "NY" }, B + "store-stock"],
  ["stores", { zip: "60540" }, B + "stores"],
  ["stores", { city: "Naperville, IL" }, B + "stores"],
  ["store", { url: "https://locations.dollartree.com/ny/new-york/2182-3rd-avenue" }, B + "store"],
  ["store", { slug: "on/toronto/2340-eglinton-ave-west", country: "ca" }, B + "store"],
  ["reviews", { item_id: "206652" }, B + "reviews"],
];

const SLOW = new Set(["storeStock", "stores", "reviews"]);

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("dollartree namespace", () => {
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

  it.each(ENDPOINTS)("dollartree.%s posts its body to %s", async (method, args, path) => {
    await (client.dollartree as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "deals"])("%s() works with no options", async (method) => {
    await (client.dollartree as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}${method}`);
    expect(body()).toEqual({});
  });

  it("has all 10 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.dollartree)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brand", "categories", "category", "deals", "product", "reviews", "search", "store",
      "storeStock", "stores",
    ]);
  });

  it("timeouts: 240 s, slow pages 300 s", () => {
    expect(DOLLARTREE_TIMEOUT).toBe(240_000);
    expect(DOLLARTREE_SLOW_TIMEOUT).toBe(300_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "dollartree.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const floor = SLOW.has(method) ? DOLLARTREE_SLOW_TIMEOUT : DOLLARTREE_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.dollartree as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(floor);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(floor);
    },
  );
});
