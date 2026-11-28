import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, SUPPLYHOUSE_TIMEOUT, SUPPLYHOUSE_CATEGORIES_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/supplyhouse/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "hot surface igniter", "page": 2}, B + "search"],
  ["category", {"category": "PEX-Fittings-525000"}, B + "category"],
  ["brand", {"brand": "PVI"}, B + "brand"],
  ["product", {"product_id": "PXLE038"}, B + "product"],
  ["product", {"url": "https://www.supplyhouse.com/Bluefin-PXLE038-3-8-Poly-PEX-Crimp-Elbow"}, B + "product"],
  ["reviews", {"product_id": "PXLE038", "page": 2}, B + "reviews"],
  ["questions", {"product_id": "007-F5"}, B + "questions"],
  ["categories", {}, B + "categories"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("supplyhouse namespace", () => {
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

  it.each(ENDPOINTS)("supplyhouse.%s posts its body to %s", async (method, args, path) => {
    await (client.supplyhouse as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 7 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.supplyhouse)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brand", "categories", "category", "product", "questions", "reviews", "search"]);
  });

  it("timeout: 250 s, categories 180 s", () => {
    expect(SUPPLYHOUSE_TIMEOUT).toBe(250_000);
    expect(SUPPLYHOUSE_CATEGORIES_TIMEOUT).toBe(180_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "supplyhouse.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = method === "categories" ? SUPPLYHOUSE_CATEGORIES_TIMEOUT : SUPPLYHOUSE_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.supplyhouse as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
