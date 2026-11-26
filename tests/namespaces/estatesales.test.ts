import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ESTATESALES_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/estatesales/";
const ENDPOINTS: Row[] = [
  ["sales", {"zip": "75201"}, B + "sales"],
  ["sales", {"zip": "75201", "state": "TX"}, B + "sales"],
  ["sale", {"sale_id": "5114622"}, B + "sale"],
  ["companies", {"state": "TX", "metro": "Dallas-Fort-Worth-Arlington"}, B + "companies"],
  ["company", {"org_id": "14402"}, B + "company"],
  ["search", {"query": "rolex"}, B + "search"],
  ["item", {"item_id": "2038603"}, B + "item"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("estatesales namespace", () => {
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

  it.each(ENDPOINTS)("estatesales.%s posts its body to %s", async (method, args, path) => {
    await (client.estatesales as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 6 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.estatesales)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["companies", "company", "item", "sale", "sales", "search"]);
  });

  it("timeout: 240 s", () => {
    expect(ESTATESALES_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "estatesales.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = ESTATESALES_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.estatesales as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
