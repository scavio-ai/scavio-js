import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, THREDUP_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "denim jacket" }, "/api/v1/thredup/search"],
  [
    "search",
    {
      query: "denim jacket",
      brand: "Levi's",
      department: "women",
      category: "outerwear",
      size: [20778, 795],
      condition: ["excellent", "new_with_tags"],
      color: "blue",
      material: ["cotton"],
      pattern: "solid",
      price_min: 10,
      price_max: 40,
      clearance: true,
      seller_type: ["thredup", "direct_listing"],
      sort: "price_low",
      page: 21,
    },
    "/api/v1/thredup/search",
  ],
  ["sold", { brand: "Coach", department: "handbags" }, "/api/v1/thredup/sold"],
  ["sold", { category: "dresses", page: 2 }, "/api/v1/thredup/sold"],
  ["product", { item_number: 241601590 }, "/api/v1/thredup/product"],
  ["product", { url: "https://www.thredup.com/product/women-zenim-denim-jacket/241601590" }, "/api/v1/thredup/product"],
  ["category", { department: "women", category: "dresses", brand: "Madewell", sort: "newest" }, "/api/v1/thredup/category"],
  ["brand", { brand: "Madewell", category: "jeans" }, "/api/v1/thredup/brand"],
  ["deals", { collection: "clearance", department: "women", sort: "price_low" }, "/api/v1/thredup/deals"],
  ["deals", { collection: "price_drops", brand: "Madewell" }, "/api/v1/thredup/deals"],
  ["rescueBoxes", {}, "/api/v1/thredup/rescue-boxes"],
  ["categories", { department: "girls" }, "/api/v1/thredup/categories"],
  ["brands", { query: "coach" }, "/api/v1/thredup/brands"],
  ["brands", { letter: "M", page: 2, limit: 500 }, "/api/v1/thredup/brands"],
  ["suggestions", { query: "made", department: "boys" }, "/api/v1/thredup/suggestions"],
  ["trending", { department: "girls" }, "/api/v1/thredup/trending"],
  ["similar", { item_number: 241601590 }, "/api/v1/thredup/similar"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("thredup namespace", () => {
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

  it.each(ENDPOINTS)("thredup.%s posts its body to %s", async (method, args, path) => {
    await (client.thredup as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each([
    ["rescueBoxes", "rescue-boxes"],
    ["categories", "categories"],
    ["brands", "brands"],
    ["trending", "trending"],
  ])("%s() works with no options", async (method, path) => {
    await (client.thredup as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev/api/v1/thredup/${path}`);
    expect(body()).toEqual({});
  });

  it("has all 12 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.thredup)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brand", "brands", "categories", "category", "deals", "product", "rescueBoxes", "search",
      "similar", "sold", "suggestions", "trending",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(THREDUP_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "thredup.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.thredup as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(THREDUP_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(THREDUP_TIMEOUT);
    },
  );
});
