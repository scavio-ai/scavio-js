import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, SPACENK_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/spacenk/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "vitamin c serum"}, B + "search"],
  ["search", {"query": "vitamin c serum", "brand": "Medik8", "market": "uk"}, B + "search"],
  ["category", {"category_id": "black-friday"}, B + "category"],
  ["category", {"category_id": "black-friday", "brand": "Medik8", "market": "uk"}, B + "category"],
  ["brand", {"brand_id": "medik8"}, B + "brand"],
  ["brand", {"brand_id": "medik8", "market": "uk"}, B + "brand"],
  ["brands", {}, B + "brands"],
  ["brands", {"letter": "C", "market": "uk"}, B + "brands"],
  ["product", {"product_id": "MUK200057800"}, B + "product"],
  ["product", {"product_id": "MUK200057800", "market": "uk"}, B + "product"],
  ["reviews", {"product_id": "MUK200057800"}, B + "reviews"],
  ["reviews", {"product_id": "MUK200057800", "stars": [1, 2], "search": "shade", "market": "uk"}, B + "reviews"],
  ["suggestions", {"query": "charlotte"}, B + "suggestions"],
  ["suggestions", {"query": "charlotte", "market": "uk"}, B + "suggestions"],
  ["stores", {"product_id": "MUK200057800", "postcode": "W1D 1BS"}, B + "stores"],
  ["stores", {"product_id": "MUK200057800", "postcode": "W1D 1BS", "longitude": -2.5879}, B + "stores"],
  ["offers", {}, B + "offers"],
  ["offers", {"market": "uk"}, B + "offers"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("spacenk namespace", () => {
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

  it.each(ENDPOINTS)("spacenk.%s posts its body to %s", async (method, args, path) => {
    await (client.spacenk as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["brands", "offers"])("%s() works with no options", async (method) => {
    await (client.spacenk as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.spacenk)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brand", "brands", "category", "offers", "product", "reviews", "search", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(SPACENK_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "spacenk.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = SPACENK_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.spacenk as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
