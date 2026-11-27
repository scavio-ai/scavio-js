import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, KABUM_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/kabum/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "cadeira gamer"}, B + "search"],
  ["search", {"query": "cadeira gamer", "filters": {"manufacturer": "Husky", "has_offer": true}, "price_min": 1000, "price_max": 2000}, B + "search"],
  ["category", {"category": "hardware/placa-de-video-vga"}, B + "category"],
  ["category", {"category": "hardware/placa-de-video-vga", "filters": {"manufacturer": "Husky", "has_offer": true}, "price_min": 1000, "price_max": 2000}, B + "category"],
  ["categories", {}, B + "categories"],
  ["categories", {"department": "hardware"}, B + "categories"],
  ["product", {"product_id": "311424"}, B + "product"],
  ["shipping", {"cep": "01310-100", "product_id": "311424"}, B + "shipping"],
  ["reviews", {"product_id": "311424"}, B + "reviews"],
  ["offers", {}, B + "offers"],
  ["offers", {"campaign": "blackfriday"}, B + "offers"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("kabum namespace", () => {
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

  it.each(ENDPOINTS)("kabum.%s posts its body to %s", async (method, args, path) => {
    await (client.kabum as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "offers"])("%s() works with no options", async (method) => {
    await (client.kabum as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 7 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.kabum)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "category", "offers", "product", "reviews", "search", "shipping"]);
  });

  it("timeout: 240 s", () => {
    expect(KABUM_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "kabum.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = KABUM_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.kabum as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
