import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, LLBEAN_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/llbean/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "fleece jacket"}, B + "search"],
  ["search", {"query": "fleece jacket", "market": "us", "country": "gb", "filters": {"color": "Blue", "sale": true}}, B + "search"],
  ["category", {"category_id": "474"}, B + "category"],
  ["category", {"category_id": "474", "market": "us", "country": "gb", "filters": {"color": "Blue", "sale": true}}, B + "category"],
  ["categories", {}, B + "categories"],
  ["categories", {"category_id": "474"}, B + "categories"],
  ["product", {"product_id": "37037"}, B + "product"],
  ["product", {"product_id": "37037", "market": "us", "country": "gb"}, B + "product"],
  ["storeStock", {"item_id": "112644", "store_ids": ["0040", "1350", "2140"]}, B + "store-stock"],
  ["storeStock", {"item_id": "112644", "store_ids": ["0040", "1350", "2140"], "product_id": "37037"}, B + "store-stock"],
  ["stores", {"zip": "04032"}, B + "stores"],
  ["stores", {"zip": "04032", "state": "CO"}, B + "stores"],
  ["reviews", {"product_id": "120785"}, B + "reviews"],
  ["reviewSummary", {"product_id": "37037"}, B + "review-summary"],
  ["deliveryEstimate", {"item_id": "112644", "zip": "10001"}, B + "delivery-estimate"],
  ["suggestions", {"query": "fle"}, B + "suggestions"],
  ["deals", {}, B + "deals"],
  ["deals", {"market": "us", "country": "gb", "filters": {"color": "Blue", "sale": true}, "min_discount": 40}, B + "deals"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("llbean namespace", () => {
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

  it.each(ENDPOINTS)("llbean.%s posts its body to %s", async (method, args, path) => {
    await (client.llbean as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "deals"])("%s() works with no options", async (method) => {
    await (client.llbean as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.llbean)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "deals", "deliveryEstimate", "product", "reviewSummary", "reviews", "search", "storeStock", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(LLBEAN_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "llbean.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = LLBEAN_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.llbean as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
