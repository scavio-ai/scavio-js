import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, REI_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/rei/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "rain jacket"}, B + "search"],
  ["search", {"query": "rain jacket", "facets": {"brand": "patagonia", "best-use": "Hiking"}, "store": "18"}, B + "search"],
  ["category", {"slug": "tents"}, B + "category"],
  ["category", {"slug": "tents", "facets": {"brand": "patagonia", "best-use": "Hiking"}, "store": "18"}, B + "category"],
  ["deals", {}, B + "deals"],
  ["deals", {"type": "deals", "category": "tents", "facets": {"brand": "patagonia", "best-use": "Hiking"}, "store": "18"}, B + "deals"],
  ["product", {"product_id": "243702"}, B + "product"],
  ["reviews", {"product_id": "228617"}, B + "reviews"],
  ["reviews", {"product_id": "228617", "rating": [1, 2]}, B + "reviews"],
  ["storeStock", {"sku": "2437020001", "zip": "98101"}, B + "store-stock"],
  ["storeStock", {"sku": "2437020001", "zip": "98101", "state": "OR"}, B + "store-stock"],
  ["stores", {"zip": "80202"}, B + "stores"],
  ["store", {"store_number": "18"}, B + "store"],
  ["suggestions", {"query": "tent"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("rei namespace", () => {
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

  it.each(ENDPOINTS)("rei.%s posts its body to %s", async (method, args, path) => {
    await (client.rei as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals"])("%s() works with no options", async (method) => {
    await (client.rei as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.rei)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["category", "deals", "product", "reviews", "search", "store", "storeStock", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(REI_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "rei.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = REI_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.rei as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
