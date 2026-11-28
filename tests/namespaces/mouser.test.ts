import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, MOUSER_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/mouser/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "LM7805", "page": 2, "country": "uk"}, B + "search"],
  ["search", {"category": "semiconductors/integrated-circuits-ics"}, B + "search"],
  ["product", {"mouser_part_number": "595-NE555P"}, B + "product"],
  ["categories", {}, B + "categories"],
  ["manufacturer", {"manufacturer": "texas-instruments"}, B + "manufacturer"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("mouser namespace", () => {
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

  it.each(ENDPOINTS)("mouser.%s posts its body to %s", async (method, args, path) => {
    await (client.mouser as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 4 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.mouser)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "manufacturer", "product", "search"]);
  });

  it("timeout: 300 s", () => {
    expect(MOUSER_TIMEOUT).toBe(300_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "mouser.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.mouser as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(MOUSER_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(MOUSER_TIMEOUT);
    },
  );
});
