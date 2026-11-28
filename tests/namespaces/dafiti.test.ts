import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, DAFITI_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/dafiti/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "vestido"}, B + "search"],
  ["search", {"query": "vestido", "sort": "discount", "page": 2}, B + "search"],
  ["category", {"category": "calcados-femininos/tenis"}, B + "category"],
  ["brand", {"brand": "asics"}, B + "brand"],
  ["deals", {"sort": "price_asc"}, B + "deals"],
  ["product", {"product_id": "15221282"}, B + "product"],
  ["product", {"sku": "AS296SCU17ARY"}, B + "product"],
  ["sizes", {"sku": "AS296SCU17ARY"}, B + "sizes"],
  ["reviews", {"sku": "SA232SHF08PKSX"}, B + "reviews"],
  ["reviews", {"product_id": "15221282", "rating": 1}, B + "reviews"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("dafiti namespace", () => {
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

  it.each(ENDPOINTS)("dafiti.%s posts its body to %s", async (method, args, path) => {
    await (client.dafiti as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals"])("%s() works with no options", async (method) => {
    await (client.dafiti as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 7 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.dafiti)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brand", "category", "deals", "product", "reviews", "search", "sizes"]);
  });

  it("timeout: 240 s", () => {
    expect(DAFITI_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "dafiti.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = DAFITI_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.dafiti as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
