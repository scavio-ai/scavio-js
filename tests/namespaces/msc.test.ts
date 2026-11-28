import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, MSC_TIMEOUT, MSC_SLOW_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/msc/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "drill bit"}, B + "search"],
  ["search", {"query": "drill bit", "sort": "price_desc", "page": 3}, B + "search"],
  ["category", {"navid": "2106186", "sort": "rating", "page": 2}, B + "category"],
  ["category", {"url": "https://www.mscdirect.com/browse/tn?navid=2106186"}, B + "category"],
  ["product", {"msc_number": "00647354"}, B + "product"],
  ["product", {"url": "https://www.mscdirect.com/product/details/00647354"}, B + "product"],
  ["clearance", {"list": "web_specials"}, B + "clearance"],
  ["locations", {"type": "Customer Fulfillment Center", "state": "PA", "location_country": "United States"}, B + "locations"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("msc namespace", () => {
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

  it.each(ENDPOINTS)("msc.%s posts its body to %s", async (method, args, path) => {
    await (client.msc as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["clearance", "locations"])("%s() works with no options", async (method) => {
    await (client.msc as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 5 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.msc)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["category", "clearance", "locations", "product", "search"]);
  });

  it("timeout: 180 s, search / category / product 300 s", () => {
    expect(MSC_TIMEOUT).toBe(180_000);
    expect(MSC_SLOW_TIMEOUT).toBe(300_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "msc.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = method === "search" || method === "category" || method === "product" ? MSC_SLOW_TIMEOUT : MSC_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.msc as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
