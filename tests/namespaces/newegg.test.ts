import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, NEWEGG_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/newegg/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "rtx 5070"}, B + "search"],
  ["search", {"query": "rtx 5070", "filters": ["in_stock", "sold_by_newegg"]}, B + "search"],
  ["category", {"category_id": "100007709"}, B + "category"],
  ["category", {"category_id": "100007709", "query": "rtx 5070", "filters": ["in_stock", "sold_by_newegg"]}, B + "category"],
  ["categories", {}, B + "categories"],
  ["product", {"item_number": "N82E16819113877"}, B + "product"],
  ["offers", {"item_number": "N82E16819113877"}, B + "offers"],
  ["reviews", {"item_number": "N82E16819113877", "group_id": 196668433, "subcategory_id": 343}, B + "reviews"],
  ["deals", {}, B + "deals"],
  ["seller", {"seller": "TECH-EDGE"}, B + "seller"],
  ["sellerProducts", {"seller_id": "1066805289"}, B + "seller-products"],
  ["sellerProducts", {"seller_id": "1066805289", "query": "rtx 5070", "filters": ["in_stock", "sold_by_newegg"]}, B + "seller-products"],
  ["suggestions", {"query": "rtx 5"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("newegg namespace", () => {
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

  it.each(ENDPOINTS)("newegg.%s posts its body to %s", async (method, args, path) => {
    await (client.newegg as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "deals"])("%s() works with no options", async (method) => {
    await (client.newegg as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 10 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.newegg)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "deals", "offers", "product", "reviews", "search", "seller", "sellerProducts", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(NEWEGG_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "newegg.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = NEWEGG_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.newegg as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
