import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, RSCOMPONENTS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/rscomponents/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "BC547", "page": 2}, B + "search"],
  ["product", {"stock_number": "221-5535", "country": "de"}, B + "product"],
  ["product", {"url": "https://uk.rs-online.com/web/p/timer-circuits/2215535"}, B + "product"],
  ["category", {"path": "semiconductors/power-management-ics/voltage-regulators"}, B + "category"],
  ["brand", {"brand": "texas-instruments", "country": "au"}, B + "brand"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("rscomponents namespace", () => {
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

  it.each(ENDPOINTS)("rscomponents.%s posts its body to %s", async (method, args, path) => {
    await (client.rscomponents as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 4 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.rscomponents)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brand", "category", "product", "search"]);
  });

  it("timeout: 240 s", () => {
    expect(RSCOMPONENTS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "rscomponents.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.rscomponents as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(RSCOMPONENTS_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(RSCOMPONENTS_TIMEOUT);
    },
  );
});
