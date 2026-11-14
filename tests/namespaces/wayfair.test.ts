import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, WAYFAIR_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  [
    "search",
    { query: "office chair", sort: "price_asc", on_sale: true, brand: [44308], min_rating: 4 },
    "/api/v1/wayfair/search",
  ],
  [
    "search",
    { query: "sofa", country: "ca", language: "fr", page: 2, filters: { "2471": ["274623"] } },
    "/api/v1/wayfair/search",
  ],
  ["search", { query: "sofa", site: "perigold", price_min: 100, price_max: 400.5 }, "/api/v1/wayfair/search"],
  ["product", { sku: "W005006988", zip: "10001" }, "/api/v1/wayfair/product"],
  ["product", { sku: "W005006988", option_id: "1820607042" }, "/api/v1/wayfair/product"],
  ["product", { url: "https://www.wayfair.ca/fr/mobilier/pdp/x-c115423787.html" }, "/api/v1/wayfair/product"],
  ["category", { category_id: 413892, sort: "rating", in_stock: true }, "/api/v1/wayfair/category"],
  [
    "category",
    { category_url: "https://www.wayfair.co.uk/furniture/sb0/sofas-c1772837.html" },
    "/api/v1/wayfair/category",
  ],
  ["deals", { country: "gb" }, "/api/v1/wayfair/deals"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("wayfair namespace", () => {
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

  it.each(ENDPOINTS)("wayfair.%s posts its body to %s", async (method, args, path) => {
    await (client.wayfair as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("deals() works with no options", async () => {
    await client.wayfair.deals();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe("https://api.scavio.dev/api/v1/wayfair/deals");
    expect(body()).toEqual({});
  });

  it("has all 4 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.wayfair)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["category", "deals", "product", "search"]);
  });

  it("timeout: 120 s", () => {
    expect(WAYFAIR_TIMEOUT).toBe(120_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "wayfair.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.wayfair as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(WAYFAIR_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(WAYFAIR_TIMEOUT);
    },
  );
});
