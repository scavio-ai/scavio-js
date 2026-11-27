import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, BEDBATHBEYOND_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/bedbathbeyond/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "bath towels"}, B + "search"],
  ["category", {"slug": "bedding/bedding-sets", "category_id": "276"}, B + "category"],
  ["category", {"slug": "bedding/bedding-sets", "category_id": "276", "attributes": {"2415": ["2913"]}}, B + "category"],
  ["categories", {}, B + "categories"],
  ["product", {"product_id": "5296998"}, B + "product"],
  ["deliveryEstimate", {"option_id": "94445783", "zip": "10001"}, B + "delivery-estimate"],
  ["reviews", {"product_id": "5296998"}, B + "reviews"],
  ["questions", {"product_id": "5296998"}, B + "questions"],
  ["stores", {}, B + "stores"],
  ["stores", {"zip": "75201"}, B + "stores"],
  ["deals", {}, B + "deals"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("bedbathbeyond namespace", () => {
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

  it.each(ENDPOINTS)("bedbathbeyond.%s posts its body to %s", async (method, args, path) => {
    await (client.bedbathbeyond as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "stores", "deals"])("%s() works with no options", async (method) => {
    await (client.bedbathbeyond as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.bedbathbeyond)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "deals", "deliveryEstimate", "product", "questions", "reviews", "search", "stores"]);
  });

  it("timeout: 240 s", () => {
    expect(BEDBATHBEYOND_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "bedbathbeyond.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = BEDBATHBEYOND_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.bedbathbeyond as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
