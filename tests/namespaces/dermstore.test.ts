import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, DERMSTORE_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/dermstore/";
const ENDPOINTS: Row[] = [
  ["search", { q: "uv clear spf 46" }, B + "search"],
  ["search", { q: "sunscreen", country: "ca", page: 2, page_size: 200, sort: "discount", brand: ["EltaMD", "SkinCeuticals"], skin_type: "Dry Skin", concern: "Aging", spf: "SPF 30+", key_ingredient: "Retinol", preference: "Clean", gender: "Female", min_price: 10, max_price: 99.5, min_rating: 4, min_discount: 20, max_discount: 50, include_facets: true }, B + "search"],
  ["list", { path: "/brands/eltamd" }, B + "list"],
  ["list", { url: "https://www.dermstore.com/c/sale/", sort: "price_low", country: "ca" }, B + "list"],
  ["product", { sku: "11289609" }, B + "product"],
  ["product", { sku: 13806521, country: "ca" }, B + "product"],
  ["product", { url: "https://www.dermstore.com/p/medik8-crystal-retinal-20-30ml/13806521/" }, B + "product"],
  ["suggestions", { q: "eltamd" }, B + "suggestions"],
  ["offers", { country: "ca" }, B + "offers"],
  ["brands", { letter: "E", country: "ca" }, B + "brands"],
  ["categories", { country: "us" }, B + "categories"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("dermstore namespace", () => {
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

  it.each(ENDPOINTS)("dermstore.%s posts its body to %s", async (method, args, path) => {
    await (client.dermstore as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["offers", "brands", "categories"])("%s() works with no options", async (method) => {
    await (client.dermstore as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}${method}`);
    expect(body()).toEqual({});
  });

  it("has all 7 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.dermstore)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brands", "categories", "list", "offers", "product", "search", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(DERMSTORE_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "dermstore.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.dermstore as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(DERMSTORE_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(DERMSTORE_TIMEOUT);
    },
  );
});
