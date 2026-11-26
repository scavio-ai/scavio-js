import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, CARSCOM_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/carscom/";
const ENDPOINTS: Row[] = [
  ["search", {"zip": "10001"}, B + "search"],
  ["search", {"zip": "10001", "make": "Toyota", "model": "RAV4", "trims": ["XLE"], "drivetrain": "awd", "exterior_color": "white", "deal_rating": "great", "body_style": "suv", "keyword": "tow package"}, B + "search"],
  ["listing", {"listing_id": "90e3df05-5f5e-4f4d-a474-79eb2077c99a"}, B + "listing"],
  ["dealer", {"dealer_id": "97701"}, B + "dealer"],
  ["dealerInventory", {"dealer_id": "97701"}, B + "dealer-inventory"],
  ["dealerReviews", {"dealer_id": "97701"}, B + "dealer-reviews"],
  ["modelReviews", {"make": "Toyota", "model": "RAV4", "year": 2019}, B + "model-reviews"],
  ["dealers", {"zip": "10001"}, B + "dealers"],
  ["dealers", {"zip": "10001", "make": "Toyota", "dealer_name": "toyota"}, B + "dealers"],
  ["research", {"make": "Toyota"}, B + "research"],
  ["research", {"make": "Toyota", "model": "RAV4", "year": 2022}, B + "research"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("carscom namespace", () => {
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

  it.each(ENDPOINTS)("carscom.%s posts its body to %s", async (method, args, path) => {
    await (client.carscom as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 8 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.carscom)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["dealer", "dealerInventory", "dealerReviews", "dealers", "listing", "modelReviews", "research", "search"]);
  });

  it("timeout: 240 s", () => {
    expect(CARSCOM_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "carscom.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = CARSCOM_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.carscom as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
