import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, BOOTS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/boots/";
const ENDPOINTS: Row[] = [
  ["product", {"url": "https://www.boots.com/no7-protect-and-perfect-intense-advanced-serum-30ml-10288490"}, B + "product"],
  ["product", {"url": "https://www.boots.com/no7-protect-and-perfect-intense-advanced-serum-30ml-10288490", "market": "uk"}, B + "product"],
  ["storeStock", {"item_code": "10213975001", "catentry_id": "1838584", "postcode": "NG2 3AA"}, B + "store-stock"],
  ["storeStock", {"item_code": "10213975001", "catentry_id": "1838584", "postcode": "NG2 3AA", "market": "uk", "longitude": -6.26056}, B + "store-stock"],
  ["stores", {"postcode": "M1 1AE"}, B + "stores"],
  ["stores", {"postcode": "M1 1AE", "market": "uk"}, B + "stores"],
  ["store", {"store": "868-london-battersea-sw11-1qn"}, B + "store"],
  ["store", {"store": "868-london-battersea-sw11-1qn", "market": "uk"}, B + "store"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("boots namespace", () => {
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

  it.each(ENDPOINTS)("boots.%s posts its body to %s", async (method, args, path) => {
    await (client.boots as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 4 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.boots)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["product", "store", "storeStock", "stores"]);
  });

  it("timeout: 240 s", () => {
    expect(BOOTS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "boots.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = BOOTS_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.boots as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
