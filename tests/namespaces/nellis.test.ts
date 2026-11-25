import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, NELLIS_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/nellis/";
const ENDPOINTS: Row[] = [
  ["search", { q: "robot vacuum" }, B + "search"],
  ["search", { q: "vacuum", location: "phoenix", page: 2, page_size: 48, sort: "bids_high", category: "Electronics", subcategory: ["TVs", "Soundbars"], brand: "Samsung", pickup_location: "Mesa", condition_rating: [4, 5], retail_min: 50, retail_max: 999.99, auction_event_type: "Retail Returns", auction_event_name: "Daily Auction - North Las Vegas - Nov 24th", color: "Black", size: "Large" }, B + "search"],
  ["item", { id: "141281552" }, B + "item"],
  ["item", { id: 141100004 }, B + "item"],
  ["item", { url: "https://www.nellisauction.com/p/LG-65-OLED-evo-C6-4K-Smart-TV/141281552" }, B + "item"],
  ["locations", { location: "dallas" }, B + "locations"],
  ["categories", { location: "houston", category: "Electronics" }, B + "categories"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("nellis namespace", () => {
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

  it.each(ENDPOINTS)("nellis.%s posts its body to %s", async (method, args, path) => {
    await (client.nellis as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["search", "locations", "categories"])("%s() works with no options", async (method) => {
    await (client.nellis as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev${B}${method}`);
    expect(body()).toEqual({});
  });

  it("has all 4 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.nellis)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["categories", "item", "locations", "search"]);
  });

  it("timeout: 240 s", () => {
    expect(NELLIS_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "nellis.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.nellis as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(NELLIS_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(NELLIS_TIMEOUT);
    },
  );
});
