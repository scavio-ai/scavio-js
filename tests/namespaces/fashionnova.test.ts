import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, FASHIONNOVA_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const JEANS = "san-diego-sculpting-stretch-flare-jeans";

const ENDPOINTS: Row[] = [
  ["search", { query: "bodycon dress" }, "/api/v1/fashionnova/search"],
  [
    "search",
    {
      query: "bodycon dress",
      country: "mx",
      language: "es",
      sort: "price_low",
      size: ["M", "L"],
      color: "black",
      price_min: 10,
      price_max: 40,
      division: ["women", "curve"],
      category: "Dresses",
      filters: { occasion: "Club" },
      page: 6,
    },
    "/api/v1/fashionnova/search",
  ],
  ["product", { handle: JEANS, color: "black-wash", country: "fr" }, "/api/v1/fashionnova/product"],
  ["product", { url: `https://www.fashionnova.com/products/${JEANS}?color=black-wash` }, "/api/v1/fashionnova/product"],
  ["collection", { handle: "sale" }, "/api/v1/fashionnova/collection"],
  ["collection", { handle: "sale", country: "gb", sort: "best_selling", page: 166 }, "/api/v1/fashionnova/collection"],
  ["categories", { division: "men" }, "/api/v1/fashionnova/categories"],
  ["suggestions", { query: "dress", division: "curve" }, "/api/v1/fashionnova/suggestions"],
  ["reviews", { handle: JEANS, color: "black-wash", sort: "most_recent", star: 5, page: 8 }, "/api/v1/fashionnova/reviews"],
  ["similar", { handle: JEANS, limit: 24 }, "/api/v1/fashionnova/similar"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("fashionnova namespace", () => {
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

  it.each(ENDPOINTS)("fashionnova.%s posts its body to %s", async (method, args, path) => {
    await (client.fashionnova as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("categories() works with no options", async () => {
    await client.fashionnova.categories();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/fashionnova/categories");
    expect(body()).toEqual({});
  });

  it("has all 7 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.fashionnova)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "categories", "collection", "product", "reviews", "search", "similar", "suggestions",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(FASHIONNOVA_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "fashionnova.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.fashionnova as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(FASHIONNOVA_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(FASHIONNOVA_TIMEOUT);
    },
  );
});
