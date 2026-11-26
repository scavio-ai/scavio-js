import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ACADEMY_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/academy/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "yeti tumbler"}, B + "search"],
  ["search", {"query": "yeti tumbler", "facets": {"facet_Brand": "Yeti"}, "min_price": 20, "max_price": 50}, B + "search"],
  ["product", {"url": "https://www.academy.com/p/yeti-duracoat-rambler-20-oz-tumbler"}, B + "product"],
  ["storeAvailability", {"part_number": "111805768", "store_id": "19", "state": "TX"}, B + "store-availability"],
  ["stores", {"zip": "77098"}, B + "stores"],
  ["store", {"store_ids": ["19", "327", "256"]}, B + "store"],
  ["category", {"path": "/c/outdoors/coolers"}, B + "category"],
  ["category", {"path": "/c/outdoors/coolers", "facets": {"facet_Brand": "Yeti"}, "min_price": 20, "max_price": 50}, B + "category"],
  ["categories", {}, B + "categories"],
  ["deals", {}, B + "deals"],
  ["deals", {"type": "hot_deals", "sub_shop": "gun-deals", "facets": {"facet_Brand": "Yeti"}, "min_price": 20, "max_price": 50}, B + "deals"],
  ["suggestions", {"query": "yeti"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("academy namespace", () => {
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

  it.each(ENDPOINTS)("academy.%s posts its body to %s", async (method, args, path) => {
    await (client.academy as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "deals"])("%s() works with no options", async (method) => {
    await (client.academy as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.academy)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "deals", "product", "search", "store", "storeAvailability", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(ACADEMY_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "academy.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = ACADEMY_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.academy as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
