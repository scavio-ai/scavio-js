import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, NATURA_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/natura/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "perfume"}, B + "search"],
  ["search", {"query": "perfume", "country": "mx", "sort": "price_asc", "filters": {"brand": "Kaiak"}, "page_size": 48}, B + "search"],
  ["category", {"category_id": "maquiagem"}, B + "category"],
  ["category", {"category_id": "maquiagem", "country": "co", "min_price": 50, "max_price": 100}, B + "category"],
  ["categories", {}, B + "categories"],
  ["categories", {"country": "ar"}, B + "categories"],
  ["product", {"product_id": "NATBRA-194225"}, B + "product"],
  ["product", {"url": "https://www.natura.com.br/p/deo-parfum-ilia-secreto-25-ml/NATBRA-194225"}, B + "product"],
  ["suggestions", {"query": "kaiak"}, B + "suggestions"],
  ["suggestions", {"query": "kaiak", "country": "cl"}, B + "suggestions"],
  ["stores", {}, B + "stores"],
  ["stores", {"state": "sp", "city": "Sao Paulo", "type": "franchise", "page_size": 50}, B + "stores"],
  ["deals", {}, B + "deals"],
  ["deals", {"country": "pe", "sort": "discount", "page": 2}, B + "deals"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("natura namespace", () => {
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

  it.each(ENDPOINTS)("natura.%s posts its body to %s", async (method, args, path) => {
    await (client.natura as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "stores", "deals"])("%s() works with no options", async (method) => {
    await (client.natura as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 7 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.natura)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "deals", "product", "search", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(NATURA_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "natura.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = NATURA_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.natura as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
