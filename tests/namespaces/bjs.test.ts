import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, BJS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/bjs/";
const ENDPOINTS: Row[] = [
  ["product", {"product_id": "3000000000005430255"}, B + "product"],
  ["search", {"query": "coffee"}, B + "search"],
  ["category", {"category": "tvs-and-electronics>tvs"}, B + "category"],
  ["categories", {}, B + "categories"],
  ["categories", {"category": "tvs-and-electronics>tvs"}, B + "categories"],
  ["reviews", {"product_id": "3000000000005430255"}, B + "reviews"],
  ["coupons", {}, B + "coupons"],
  ["clubs", {}, B + "clubs"],
  ["clubs", {"state": "NY"}, B + "clubs"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("bjs namespace", () => {
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

  it.each(ENDPOINTS)("bjs.%s posts its body to %s", async (method, args, path) => {
    await (client.bjs as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "coupons", "clubs"])("%s() works with no options", async (method) => {
    await (client.bjs as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 7 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.bjs)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "clubs", "coupons", "product", "reviews", "search"]);
  });

  it("timeout: 240 s", () => {
    expect(BJS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "bjs.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = BJS_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.bjs as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
