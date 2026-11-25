import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, MARKS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/marks/";
const ENDPOINTS: Row[] = [
  ["search", { q: "work boots" }, B + "search"],
  ["search", { q: "bottes de travail", language: "fr", sort: "rating", deals: ["sale", "clearance"] }, B + "search"],
  ["list", { path: "/en/cat/work-boots-shoes-DC3000008.html", brand: "Dakota Workpro Series" }, B + "list"],
  ["list", { url: "https://www.marks.com/en/cat/work-boots-shoes-DC3000008.html", page: 3, language: "fr" }, B + "list"],
  ["product", { code: "75983776F" }, B + "product"],
  ["product", { code: "75983776F", language: "fr" }, B + "product"],
  ["questions", { code: "75984589F" }, B + "questions"],
  ["suggestions", { q: "dakota" }, B + "suggestions"],
  ["store", { store_id: "589" }, B + "store"],
  ["brands", { language: "fr" }, B + "brands"],
  ["categories", { language: "en" }, B + "categories"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("marks namespace", () => {
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

  it.each(ENDPOINTS)("marks.%s posts its body to %s", async (method, args, path) => {
    await (client.marks as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("brands() and categories() work with no options", async () => {
    await client.marks.brands();
    await client.marks.categories();
    const calls = vi.mocked(fetch).mock.calls;
    expect(calls[0]![0]).toBe(`https://api.scavio.dev${B}brands`);
    expect(calls[1]![0]).toBe(`https://api.scavio.dev${B}categories`);
    expect(JSON.parse((calls[1]![1] as RequestInit).body as string)).toEqual({});
  });

  it("has all 8 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.marks)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brands", "categories", "list", "product", "questions", "search", "store", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(MARKS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "marks.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.marks as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(MARKS_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(MARKS_TIMEOUT);
    },
  );
});
