import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, QVC_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/qvc/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "blender"}, B + "search"],
  ["search", {"query": "blender", "site": "qvc", "market": "us", "filters": ["8c::1z139k3"], "department": "j"}, B + "search"],
  ["product", {"item_number": "K341654"}, B + "product"],
  ["product", {"item_number": "K341654", "site": "qvc", "market": "us"}, B + "product"],
  ["products", {"item_numbers": ["K341654", "K82223", "A700206"]}, B + "products"],
  ["products", {"item_numbers": ["K341654", "K82223", "A700206"], "market": "us"}, B + "products"],
  ["todaysSpecial", {}, B + "todays-special"],
  ["todaysSpecial", {"site": "qvc", "market": "us"}, B + "todays-special"],
  ["onAir", {}, B + "on-air"],
  ["onAir", {"market": "us"}, B + "on-air"],
  ["programGuide", {}, B + "program-guide"],
  ["programGuide", {"site": "qvc", "market": "us", "date": "2026-11-27", "channel": "QVC"}, B + "program-guide"],
  ["recentlyAired", {"site": "hsn"}, B + "recently-aired"],
  ["recentlyAired", {"site": "hsn", "market": "us", "date": "2026-11-26", "hour": 20}, B + "recently-aired"],
  ["category", {"url": "https://www.qvc.com/c/beauty/hair-care/hair-styling-tools/-/1ajqy/c.html"}, B + "category"],
  ["category", {"url": "https://www.qvc.com/c/beauty/hair-care/hair-styling-tools/-/1ajqy/c.html", "site": "qvc", "market": "us"}, B + "category"],
  ["suggestions", {"query": "blen"}, B + "suggestions"],
  ["suggestions", {"query": "blen", "market": "us"}, B + "suggestions"],
  ["reviews", {"item_number": "K341654"}, B + "reviews"],
  ["reviews", {"item_number": "K341654", "site": "qvc", "market": "us"}, B + "reviews"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("qvc namespace", () => {
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

  it.each(ENDPOINTS)("qvc.%s posts its body to %s", async (method, args, path) => {
    await (client.qvc as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["todaysSpecial", "onAir", "programGuide"])("%s() works with no options", async (method) => {
    await (client.qvc as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 10 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.qvc)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["category", "onAir", "product", "products", "programGuide", "recentlyAired", "reviews", "search", "suggestions", "todaysSpecial"]);
  });

  it("timeout: 240 s", () => {
    expect(QVC_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "qvc.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = QVC_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.qvc as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
