import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, MCMASTER_TIMEOUT, MCMASTER_SEARCH_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/mcmaster/";
const ENDPOINTS: Row[] = [
  ["product", {"part_number": "91251A540"}, B + "product"],
  ["product", {"url": "https://www.mcmaster.com/91251A540/"}, B + "product"],
  ["search", {"query": "hose clamps", "per_page": 10}, B + "search"],
  ["search", {"category": "hose-clamps/worm-drive-clamps~~", "offset": 10}, B + "search"],
  ["categories", {}, B + "categories"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("mcmaster namespace", () => {
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

  it.each(ENDPOINTS)("mcmaster.%s posts its body to %s", async (method, args, path) => {
    await (client.mcmaster as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 3 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.mcmaster)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "product", "search"]);
  });

  it("timeout: 180 s, search 300 s", () => {
    expect(MCMASTER_TIMEOUT).toBe(180_000);
    expect(MCMASTER_SEARCH_TIMEOUT).toBe(300_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "mcmaster.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = method === "search" ? MCMASTER_SEARCH_TIMEOUT : MCMASTER_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.mcmaster as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
