import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ENJOEI_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/enjoei/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "vestido farm"}, B + "search"],
  ["search", {"query": "vestido farm", "brand": ["farm"], "condition": "used", "sort": "price_asc", "cursor": "2~MTczMjk4ODQ3MDIzNDEyNDEzOjE"}, B + "search"],
  ["category", {"department": "feminino", "category": "feminino-roupas", "subcategory": "feminino-roupas-vestidos"}, B + "category"],
  ["categories", {}, B + "categories"],
  ["product", {"product_id": "153252795"}, B + "product"],
  ["shop", {"handle": "utstore"}, B + "shop"],
  ["shopListings", {"handle": "utstore"}, B + "shop-listings"],
  ["shopSold", {"handle": "utstore", "page": 2}, B + "shop-sold"],
  ["shopReviews", {"handle": "utstore", "filter": "negative"}, B + "shop-reviews"],
  ["suggestions", {"query": "vestido"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("enjoei namespace", () => {
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

  it.each(ENDPOINTS)("enjoei.%s posts its body to %s", async (method, args, path) => {
    await (client.enjoei as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories"])("%s() works with no options", async (method) => {
    await (client.enjoei as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.enjoei)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "product", "search", "shop", "shopListings", "shopReviews", "shopSold", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(ENJOEI_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "enjoei.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = ENJOEI_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.enjoei as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
