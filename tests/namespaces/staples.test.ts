import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, STAPLES_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/staples/";
const ENDPOINTS: Row[] = [
  ["search", { q: "copy paper" }, B + "search"],
  ["search", { q: "copy paper", page: 2, sort: "price_low", brand: ["Hammermill"], filters: ["Number of Reams_3A_2210-Ream_22"], min_price: 10, deal: "on_promotion" }, B + "search"],
  ["search", { q: "papier", country: "ca", language: "fr" }, B + "search"],
  ["product", { item_id: "122374" }, B + "product"],
  ["product", { item_id: 2724258, zip: "60540", store: "1633" }, B + "product"],
  ["product", { handle: "24430098-en-hp-67-black-original-ink-cartridge", country: "ca" }, B + "product"],
  ["category", { category: "CL140691", sort: "rating", deal: "clearance" }, B + "category"],
  ["categories", { category: "SC1676" }, B + "categories"],
  ["deals", { q: "laptop" }, B + "deals"],
  ["deals", { type: "clearance", category: "CL140691", page: 3 }, B + "deals"],
  ["coupons", { category: "Printers" }, B + "coupons"],
  ["storeStock", { item_id: "2724258", zip: "60540", radius: 50 }, B + "store-stock"],
  ["stores", { zip: "10001" }, B + "stores"],
  ["stores", { city: "Chicago, IL", radius: 10 }, B + "stores"],
  ["store", { store: "1574" }, B + "store"],
  ["reviews", { item_id: "24430099", limit: 100, sort: "newest", rating: 5, photos_only: true }, B + "reviews"],
  ["questions", { item_id: "990119", page: 2, sort: "most_answered" }, B + "questions"],
  ["trending", {}, B + "trending"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("staples namespace", () => {
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

  it.each(ENDPOINTS)("staples.%s posts its body to %s", async (method, args, path) => {
    await (client.staples as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "coupons", "trending"])("%s() works with no options", async (method) => {
    await (client.staples as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}${method}`);
    expect(body()).toEqual({});
  });

  it("has all 12 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.staples)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "categories", "category", "coupons", "deals", "product", "questions", "reviews", "search",
      "store", "storeStock", "stores", "trending",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(STAPLES_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "staples.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.staples as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(STAPLES_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(STAPLES_TIMEOUT);
    },
  );
});
