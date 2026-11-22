import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, AUTOZONE_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/autozone/";
const ENDPOINTS: Row[] = [
  ["search", { query: "brake pads" }, B + "search"],
  ["search", { query: "5w-30", sort: "price_asc", min_price: 20, max_price: 40, filters: { position_name_s: "Front" } }, B + "search"],
  ["search", { query: "spark plugs", brand: "NGK" }, B + "search"],
  ["search", { query: "pastilha de freio", country: "br" }, B + "search"],
  ["product", { id: "1399158" }, B + "product"],
  ["product", { id: 100123563, country: "br" }, B + "product"],
  ["product", { url: "https://www.autozone.com/p/duralast-floor-jack-d3thj/1399158" }, B + "product"],
  ["category", { category: "/brakes-and-traction-control/brake-pads", vehicle: { year: 2018, make: "Ford", model: "F-150" } }, B + "category"],
  ["category", { category: "/batteries-starting-and-charging/battery", sort: "price_desc" }, B + "category"],
  ["brand", { brand: "duralast" }, B + "brand"],
  ["brand", { brand: "duralast-gold", category: "/brakes-and-traction-control/brake-rotor" }, B + "brand"],
  ["vehicles", { level: "models", year: 2018, make_id: 54 }, B + "vehicles"],
  ["vehicles", { level: "makes", year: 2020, country: "mx" }, B + "vehicles"],
  ["reviews", { id: "1399158" }, B + "reviews"],
  ["reviews", { id: "906340", page: 2, sort: "most_helpful", stars: [1, 2] }, B + "reviews"],
  ["stores", { state: "tx", city: "houston" }, B + "stores"],
  ["stores", { country: "br", state: "sao-paulo" }, B + "stores"],
  ["store", { slug: "vt/barre/18-overlook-dr.html" }, B + "store"],
  ["store", { url: "https://www.autozone.com.mx/ubicaciones/nl/monterrey/x.html" }, B + "store"],
  ["categories", { country: "br" }, B + "categories"],
  ["clearance", {}, B + "clearance"],
  ["rebates", {}, B + "rebates"],
  ["storeStock", { id: "100123563", store_number: "7602" }, B + "store-stock"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("autozone namespace", () => {
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

  it.each(ENDPOINTS)("autozone.%s posts its body to %s", async (method, args, path) => {
    await (client.autozone as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each([
    ["vehicles", "vehicles"],
    ["stores", "stores"],
    ["categories", "categories"],
    ["clearance", "clearance"],
    ["rebates", "rebates"],
  ])("%s() works with no options", async (method, path) => {
    await (client.autozone as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}${path}`);
    expect(body()).toEqual({});
  });

  it("has all 12 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.autozone)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brand", "categories", "category", "clearance", "product", "rebates", "reviews", "search", "store",
      "storeStock", "stores", "vehicles",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(AUTOZONE_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "autozone.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.autozone as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(AUTOZONE_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(AUTOZONE_TIMEOUT);
    },
  );
});
