import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ESTANTEVIRTUAL_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/estantevirtual/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "dom casmurro"}, B + "search"],
  ["search", {"query": "dom casmurro", "condition": "used", "sort": "price_asc", "price_max": 30}, B + "search"],
  ["isbn", {"isbn": "9788535914849"}, B + "isbn"],
  ["book", {"book_id": "017-4778-000-BK"}, B + "book"],
  ["copies", {"book_id": "017-4778-000-BK", "condition": "new", "page_size": 10, "sellers": true}, B + "copies"],
  ["copy", {"copy_id": "GME-2437-000"}, B + "copy"],
  ["shipping", {"copy_id": "GME-2437-000", "cep": "01310-100"}, B + "shipping"],
  ["seller", {"seller_id": "1002276"}, B + "seller"],
  ["sellerBooks", {"seller_id": 1002276, "query": "orwell"}, B + "seller-books"],
  ["sellerReviews", {"seller_id": "1002276", "rating": "negative"}, B + "seller-reviews"],
  ["sellers", {"state": "SP", "city": "São Paulo"}, B + "sellers"],
  ["category", {"category_slug": "literatura-brasileira"}, B + "category"],
  ["list", {"slug": "black-friday"}, B + "list"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("estantevirtual namespace", () => {
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

  it.each(ENDPOINTS)("estantevirtual.%s posts its body to %s", async (method, args, path) => {
    await (client.estantevirtual as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["sellers", "list"])("%s() works with no options", async (method) => {
    await (client.estantevirtual as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 12 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.estantevirtual)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["book", "category", "copies", "copy", "isbn", "list", "search", "seller", "sellerBooks", "sellerReviews", "sellers", "shipping"]);
  });

  it("timeout: 240 s", () => {
    expect(ESTANTEVIRTUAL_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "estantevirtual.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = ESTANTEVIRTUAL_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.estantevirtual as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
