import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, LIQUIDATION_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/liquidation/";
const ENDPOINTS: Row[] = [
  ["search", {"q": "laptop"}, B + "search"],
  ["search", {"condition": "returns", "lot_size": ["pallet", "truckload"], "sort": "current_bid", "order": "desc", "page": 2}, B + "search"],
  ["lot", {"id": "21648824"}, B + "lot"],
  ["manifest", {"id": "21648824"}, B + "manifest"],
  ["closed", {"seller": "Titan Electronics", "category": "1004"}, B + "closed"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("liquidation namespace", () => {
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

  it.each(ENDPOINTS)("liquidation.%s posts its body to %s", async (method, args, path) => {
    await (client.liquidation as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 4 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.liquidation)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["closed", "lot", "manifest", "search"]);
  });

  it("timeout: 180 s", () => {
    expect(LIQUIDATION_TIMEOUT).toBe(180_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "liquidation.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = LIQUIDATION_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.liquidation as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
