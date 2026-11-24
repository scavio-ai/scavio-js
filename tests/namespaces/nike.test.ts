import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, NIKE_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/nike/";
const ENDPOINTS: Row[] = [
  ["search", { q: "dunk low" }, B + "search"],
  ["search", { q: "dunk low", country: "gb", sort: "price_low", filter: "black-90poy" }, B + "search"],
  ["product", { style_color: "DD1503-103", country: "fr" }, B + "product"],
  ["product", { url: "https://www.nike.com/t/dunk-low-womens-shoes-ppQwKZ/IM6572-104" }, B + "product"],
  ["category", { path: "mens-shoes-nik1zy7ok", sort: "newest", filter: ["black-90poy", "mens-nik1"] }, B + "category"],
  ["category", { url: "https://www.nike.com/w/mens-shoes-nik1zy7ok" }, B + "category"],
  ["brand", { brand: "jordan", country: "ch", language: "fr" }, B + "brand"],
  ["deals", { gender: "women", category: "shoes-y7ok", country: "jp", language: "en" }, B + "deals"],
  ["releases", { view: "feed", country: "gb" }, B + "releases"],
  ["release", { style_color: "IX8180-001" }, B + "release"],
  ["release", { slug: "air-jordan-4-bred", country: "gb" }, B + "release"],
  ["reviews", { style_color: "CW2288-111" }, B + "reviews"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("nike namespace", () => {
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

  it.each(ENDPOINTS)("nike.%s posts its body to %s", async (method, args, path) => {
    await (client.nike as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("deals() and releases() work with no options", async () => {
    await client.nike.deals();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}deals`);
    expect(body()).toEqual({});
    vi.mocked(fetch).mockClear();
    await client.nike.releases();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}releases`);
    expect(body()).toEqual({});
  });

  it("has all 8 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.nike)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brand", "category", "deals", "product", "release", "releases", "reviews", "search",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(NIKE_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "nike.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.nike as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(NIKE_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(NIKE_TIMEOUT);
    },
  );
});
