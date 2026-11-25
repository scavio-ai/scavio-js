import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, SPORTCHEK_TIMEOUT, CTC_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/sportchek/";
const ENDPOINTS: Row[] = [
  ["search", { q: "winter jacket" }, B + "search"],
  ["search", { q: "winter jacket", page: 2, sort: "price_low", brand: ["COLUMBIA", "NIKE"], deals: "sale", filters: [{ facet: "sku_gender_attr", value: "Female" }], include_facets: true }, B + "search"],
  ["list", { path: "/en/sale-clearance/clearance.html", sort: "price_low" }, B + "list"],
  ["list", { url: "https://www.sportchek.ca/en/cat/accessories-DC2000012.html", deals: "both" }, B + "list"],
  ["product", { code: "84166659F" }, B + "product"],
  ["product", { url: "https://www.sportchek.ca/en/pdp/x-84166659f.html" }, B + "product"],
  ["reviews", { code: "84166659F", page: 2, sort: "rating_low", rating: 1 }, B + "reviews"],
  ["suggestions", { q: "bauer" }, B + "suggestions"],
  ["store", { store_id: "272" }, B + "store"],
  ["store", { store_id: 272 }, B + "store"],
  ["brands", { letter: "B" }, B + "brands"],
  ["categories", {}, B + "categories"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("sportchek namespace", () => {
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

  it.each(ENDPOINTS)("sportchek.%s posts its body to %s", async (method, args, path) => {
    await (client.sportchek as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("brands() and categories() work with no options", async () => {
    await client.sportchek.brands();
    await client.sportchek.categories();
    const calls = vi.mocked(fetch).mock.calls;
    expect(calls[0]![0]).toBe(`https://api.scavio.dev${B}brands`);
    expect(calls[1]![0]).toBe(`https://api.scavio.dev${B}categories`);
    expect(JSON.parse((calls[0]![1] as RequestInit).body as string)).toEqual({});
  });

  it("has all 8 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.sportchek)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brands", "categories", "list", "product", "reviews", "search", "store", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(SPORTCHEK_TIMEOUT).toBe(240_000);
    expect(CTC_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "sportchek.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.sportchek as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(SPORTCHEK_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(SPORTCHEK_TIMEOUT);
    },
  );
});
