import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, BARNESANDNOBLE_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/barnesandnoble/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "project hail mary"}, B + "search"],
  ["search", {"query": "project hail mary", "filters": {"format": "Paperback"}, "country": "us"}, B + "search"],
  ["product", {"ean": "9780593135204"}, B + "product"],
  ["product", {"ean": "9780593135204", "country": "us"}, B + "product"],
  ["storeAvailability", {"near": "60611", "ean": "9780593135204"}, B + "store-availability"],
  ["storeAvailability", {"near": "60611", "ean": "9780593135204", "country": "us"}, B + "store-availability"],
  ["stores", {"near": "10001"}, B + "stores"],
  ["stores", {"near": "10001", "country": "us"}, B + "stores"],
  ["store", {"store_id": "2234"}, B + "store"],
  ["store", {"store_id": "2234", "country": "us"}, B + "store"],
  ["suggestions", {"query": "hunger"}, B + "suggestions"],
  ["suggestions", {"query": "hunger", "country": "us"}, B + "suggestions"],
  ["bestsellers", {}, B + "bestsellers"],
  ["bestsellers", {"country": "us"}, B + "bestsellers"],
  ["category", {"path": "books/mystery-thrillers"}, B + "category"],
  ["category", {"path": "books/mystery-thrillers", "filters": {"format": "Paperback"}, "country": "us"}, B + "category"],
  ["categories", {}, B + "categories"],
  ["categories", {"country": "us"}, B + "categories"],
  ["deals", {}, B + "deals"],
  ["deals", {"country": "us"}, B + "deals"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("barnesandnoble namespace", () => {
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

  it.each(ENDPOINTS)("barnesandnoble.%s posts its body to %s", async (method, args, path) => {
    await (client.barnesandnoble as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["bestsellers", "categories", "deals"])("%s() works with no options", async (method) => {
    await (client.barnesandnoble as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 10 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.barnesandnoble)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["bestsellers", "categories", "category", "deals", "product", "search", "store", "storeAvailability", "stores", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(BARNESANDNOBLE_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "barnesandnoble.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = BARNESANDNOBLE_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.barnesandnoble as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
