import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, LOOKFANTASTIC_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/lookfantastic/";
const ENDPOINTS: Row[] = [
  ["search", {"q": "glow tonic"}, B + "search"],
  ["search", {"q": "glow tonic", "brand": "CeraVe", "skin_type": "Dry", "concern": "Anti-Ageing", "spf": "SPF 50+", "key_ingredient": "Retinol", "formulation": "Vegan", "filters": [{"facet": "en_beauty_skinSubcategory_content", "value": "Serums"}], "market": "gb", "currency": "GBP"}, B + "search"],
  ["list", {"path": "/black-friday"}, B + "list"],
  ["list", {"path": "/black-friday", "brand": "CeraVe", "skin_type": "Dry", "concern": "Anti-Ageing", "spf": "SPF 50+", "key_ingredient": "Retinol", "formulation": "Vegan", "filters": [{"facet": "en_beauty_skinSubcategory_content", "value": "Serums"}], "market": "gb", "currency": "GBP"}, B + "list"],
  ["product", {"sku": "11200055"}, B + "product"],
  ["product", {"sku": "11200055", "market": "gb", "currency": "GBP"}, B + "product"],
  ["suggestions", {"q": "cerave"}, B + "suggestions"],
  ["suggestions", {"q": "cerave", "market": "gb", "currency": "GBP"}, B + "suggestions"],
  ["offers", {}, B + "offers"],
  ["offers", {"market": "gb", "currency": "GBP"}, B + "offers"],
  ["brands", {}, B + "brands"],
  ["brands", {"letter": "C", "market": "gb", "currency": "GBP"}, B + "brands"],
  ["categories", {}, B + "categories"],
  ["categories", {"market": "gb", "currency": "GBP"}, B + "categories"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("lookfantastic namespace", () => {
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

  it.each(ENDPOINTS)("lookfantastic.%s posts its body to %s", async (method, args, path) => {
    await (client.lookfantastic as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["offers", "brands", "categories"])("%s() works with no options", async (method) => {
    await (client.lookfantastic as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 7 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.lookfantastic)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brands", "categories", "list", "offers", "product", "search", "suggestions"]);
  });

  it("timeout: 240 s", () => {
    expect(LOOKFANTASTIC_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "lookfantastic.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = LOOKFANTASTIC_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.lookfantastic as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
