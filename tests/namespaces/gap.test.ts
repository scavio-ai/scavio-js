import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, GAP_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/gap/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "jeans"}, B + "search"],
  ["search", {"query": "jeans", "brand": "old_navy", "department": "Women", "color": "Black", "facets": {"fit": "Baggy"}}, B + "search"],
  ["category", {"cid": "3033077"}, B + "category"],
  ["category", {"cid": "3033077", "brand": "old_navy", "facets": {"fit": "Baggy"}}, B + "category"],
  ["categories", {}, B + "categories"],
  ["categories", {"brand": "old_navy"}, B + "categories"],
  ["product", {"pid": "403540002"}, B + "product"],
  ["product", {"pid": "403540002", "brand": "old_navy"}, B + "product"],
  ["prices", {"items": [{"brand": "old_navy", "pid": "903453022"}, "athleta:1177198082"]}, B + "prices"],
  ["prices", {"items": [{"brand": "old_navy", "pid": "903453022"}, "athleta:1177198082"], "brand": "old_navy"}, B + "prices"],
  ["stores", {"zip": "10001"}, B + "stores"],
  ["stores", {"zip": "10001", "brand": "old_navy"}, B + "stores"],
  ["store", {"store_id": "4132"}, B + "store"],
  ["store", {"store_id": "4132", "brand": "old_navy"}, B + "store"],
  ["storeStock", {"store_ids": ["220", "1519", "1456"], "sku_ids": ["4035400023503"]}, B + "store-stock"],
  ["storeStock", {"store_ids": ["220", "1519", "1456"], "sku_ids": ["4035400023503"], "brand": "old_navy"}, B + "store-stock"],
  ["suggestions", {"query": "jea"}, B + "suggestions"],
  ["suggestions", {"query": "jea", "brand": "old_navy"}, B + "suggestions"],
  ["trending", {}, B + "trending"],
  ["trending", {"brand": "old_navy"}, B + "trending"],
  ["deals", {}, B + "deals"],
  ["deals", {"brand": "old_navy"}, B + "deals"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("gap namespace", () => {
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

  it.each(ENDPOINTS)("gap.%s posts its body to %s", async (method, args, path) => {
    await (client.gap as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "trending", "deals"])("%s() works with no options", async (method) => {
    await (client.gap as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.gap)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "deals", "prices", "product", "search", "store", "storeStock", "stores", "suggestions", "trending"]);
  });

  it("timeout: 240 s", () => {
    expect(GAP_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "gap.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = GAP_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.gap as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
