import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, THRIFTBOOKS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/thriftbooks/";
const ENDPOINTS: Row[] = [
  ["search", {}, B + "search"],
  ["search", {"query": "project hail mary", "page": 1, "page_size": 25, "format": ["hardcover"], "condition": ["like_new", "very_good"], "language": ["english"], "genre": [13207], "min_price": 5, "max_price": 10}, B + "search"],
  ["isbn", {"isbn": "9780593135204"}, B + "isbn"],
  ["work", {"work_id": "26830049"}, B + "work"],
  ["edition", {"edition_id": "49364660"}, B + "edition"],
  ["copies", {"edition_id": "49364660"}, B + "copies"],
  ["editions", {"work_id": "26830049"}, B + "editions"],
  ["editions", {"work_id": "26830049", "format": ["hardcover"], "condition": ["like_new", "very_good"], "page": 1}, B + "editions"],
  ["reviews", {"work_id": "26830049"}, B + "reviews"],
  ["reviews", {"work_id": "26830049", "page": 1}, B + "reviews"],
  ["suggestions", {"query": "hunger"}, B + "suggestions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("thriftbooks namespace", () => {
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

  it.each(ENDPOINTS)("thriftbooks.%s posts its body to %s", async (method, args, path) => {
    await (client.thriftbooks as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["search"])("%s() works with no options", async (method) => {
    await (client.thriftbooks as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 8 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.thriftbooks)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["copies", "edition", "editions", "isbn", "reviews", "search", "suggestions", "work"]);
  });

  it("timeout: 240 s", () => {
    expect(THRIFTBOOKS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "thriftbooks.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = THRIFTBOOKS_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.thriftbooks as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
