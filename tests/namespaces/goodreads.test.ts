import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, GOODREADS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/goodreads/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "dune"}, B + "search"],
  ["book", {"book_id": "44767458"}, B + "book"],
  ["reviews", {"book_id": "44767458"}, B + "reviews"],
  ["reviews", {"book_id": "44767458", "language": "es"}, B + "reviews"],
  ["suggestions", {"query": "sanderson"}, B + "suggestions"],
  ["author", {"author_id": "38550"}, B + "author"],
  ["authorBooks", {"author_id": "38550"}, B + "author-books"],
  ["series", {"series_id": "49075"}, B + "series"],
  ["editions", {"work_id": "3634639"}, B + "editions"],
  ["list", {"list_id": "1"}, B + "list"],
  ["bookLists", {"book_id": "44767458"}, B + "book-lists"],
  ["listSearch", {"query": "fantasy"}, B + "list-search"],
  ["quotes", {"query": "hope"}, B + "quotes"],
  ["genre", {"genre": "fantasy"}, B + "genre"],
  ["newReleases", {"genre": "fantasy"}, B + "new-releases"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("goodreads namespace", () => {
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

  it.each(ENDPOINTS)("goodreads.%s posts its body to %s", async (method, args, path) => {
    await (client.goodreads as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 14 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.goodreads)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["author", "authorBooks", "book", "bookLists", "editions", "genre", "list", "listSearch", "newReleases", "quotes", "reviews", "search", "series", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(GOODREADS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "goodreads.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = GOODREADS_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.goodreads as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
