import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ZAPPOS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/zappos/";
const ENDPOINTS: Row[] = [
  ["search", {}, B + "search"],
  ["search", {"site": "zappos", "query": "running shoes", "facets": {"brand": "Brooks", "gender": "Women"}, "page": 1, "limit": 50}, B + "search"],
  ["product", {"product_id": "10002909"}, B + "product"],
  ["product", {"product_id": "10002909", "site": "zappos"}, B + "product"],
  ["reviews", {"product_id": "10002909"}, B + "reviews"],
  ["reviews", {"product_id": "10002909", "site": "zappos", "page": 1}, B + "reviews"],
  ["questions", {"product_id": "10002909"}, B + "questions"],
  ["questions", {"product_id": "10002909", "site": "zappos"}, B + "questions"],
  ["lowestPrices", {"product_id": "10002909"}, B + "lowest-prices"],
  ["lowestPrices", {"product_id": "10002909", "site": "zappos"}, B + "lowest-prices"],
  ["categories", {}, B + "categories"],
  ["categories", {"site": "zappos", "department": "Shoes", "category": "Sneakers & Athletic Shoes"}, B + "categories"],
  ["suggestions", {"query": "hoka bon"}, B + "suggestions"],
  ["suggestions", {"query": "hoka bon", "site": "zappos"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("zappos namespace", () => {
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

  it.each(ENDPOINTS)("zappos.%s posts its body to %s", async (method, args, path) => {
    await (client.zappos as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["search", "categories"])("%s() works with no options", async (method) => {
    await (client.zappos as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 7 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.zappos)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "lowestPrices", "product", "questions", "reviews", "search", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(ZAPPOS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "zappos.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = ZAPPOS_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.zappos as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
