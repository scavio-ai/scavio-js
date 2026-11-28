import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, DIGIKEY_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/digikey/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "LM7805"}, B + "search"],
  ["search", {"query": "LM317", "category_id": "699", "filters": {"-1": ["296"], "-2": ["5"]}, "country": "de"}, B + "search"],
  ["product", {"url": "https://www.digikey.com/en/products/detail/texas-instruments/SN74HCT02N/376866"}, B + "product"],
  ["product", {"digikey_part_number": "497-1575-5-ND", "country": "ca"}, B + "product"],
  ["categories", {}, B + "categories"],
  ["categories", {"category_id": 32}, B + "categories"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("digikey namespace", () => {
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

  it.each(ENDPOINTS)("digikey.%s posts its body to %s", async (method, args, path) => {
    await (client.digikey as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 3 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.digikey)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "product", "search"]);
  });

  it("timeout: 300 s", () => {
    expect(DIGIKEY_TIMEOUT).toBe(300_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "digikey.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.digikey as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(DIGIKEY_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(DIGIKEY_TIMEOUT);
    },
  );
});
