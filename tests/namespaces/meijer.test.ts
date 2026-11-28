import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, MEIJER_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/meijer/";
const ENDPOINTS: Row[] = [
  ["search", { query: "large eggs", store_id: 295 }, B + "search"],
  ["search", { query: "milk", page: 2 }, B + "search"],
  ["product", { meijer_id: "4125010200", store_id: "167" }, B + "product"],
  ["product", { upc: "715141514643", store_id: 224 }, B + "product"],
  ["category", { category: "fresh/produce/fruit", store_id: 220 }, B + "category"],
  ["categories", {}, B + "categories"],
  ["categories", { category: "grocery/pantry" }, B + "categories"],
  ["deals", {}, B + "deals"],
  ["deals", { collection: "black-friday", store_id: 295 }, B + "deals"],
  ["stores", { zip: "47274" }, B + "stores"],
  ["store", { store_id: 295 }, B + "store"],
  ["weeklyAd", { store_id: 224 }, B + "weekly-ad"],
  ["coupons", { store_id: 295, department: "Baby", full_list: true }, B + "coupons"],
  ["reviews", { meijer_id: "4125010200" }, B + "reviews"],
  ["reviews", { upc: "041250102007" }, B + "reviews"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("meijer namespace", () => {
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

  it.each(ENDPOINTS)("meijer.%s posts its body to %s", async (method, args, path) => {
    await (client.meijer as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 10 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.meijer)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(
      ["categories", "category", "coupons", "deals", "product", "reviews", "search", "store", "stores", "weeklyAd"],
    );
  });

  it("timeout: 240 s", () => {
    expect(MEIJER_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "meijer.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.meijer as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(MEIJER_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(MEIJER_TIMEOUT);
    },
  );
});
