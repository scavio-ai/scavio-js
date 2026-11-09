import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, VINTED_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  [
    "search",
    { query: "barbour jacket", country: "uk", status_ids: [6, 1], price_to: 80, sort: "newest_first" },
    "/api/v1/vinted/search",
  ],
  ["search", { country: "pl", category_id: 1907, brand_ids: "46805,53", page: 2 }, "/api/v1/vinted/search"],
  ["product", { item_id: 10671938315 }, "/api/v1/vinted/product"],
  ["product", { url: "https://www.vinted.co.uk/items/10671938315-nike-air-max-size-uk-75" }, "/api/v1/vinted/product"],
  ["seller", { user_id: 65958245, country: "uk" }, "/api/v1/vinted/seller"],
  [
    "sellerProducts",
    { user_id: "65958245", country: "uk", sort: "price_low_to_high", limit: 96 },
    "/api/v1/vinted/seller-products",
  ],
  ["sellerFeedback", { user_id: 65958245, page: 2, limit: 50 }, "/api/v1/vinted/seller-feedback"],
  ["brands", { query: "barbour", country: "de" }, "/api/v1/vinted/brands"],
  ["suggestions", { query: "barb" }, "/api/v1/vinted/suggestions"],
  ["filters", { filter: "size", country: "fr", query: "dress", category_id: 1904 }, "/api/v1/vinted/filters"],
  ["categories", { country: "uk", parent_id: 1904 }, "/api/v1/vinted/categories"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("vinted namespace", () => {
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

  it.each(ENDPOINTS)("vinted.%s posts its body to %s", async (method, args, path) => {
    await (client.vinted as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("vinted.categories options are optional", async () => {
    await client.vinted.categories();
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe("https://api.scavio.dev/api/v1/vinted/categories");
    expect(body()).toEqual({});
  });

  it("has all 9 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.vinted)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(
      [
        "search",
        "product",
        "seller",
        "sellerProducts",
        "sellerFeedback",
        "brands",
        "suggestions",
        "filters",
        "categories",
      ].sort(),
    );
  });

  it("VINTED_TIMEOUT is 120 s", () => {
    expect(VINTED_TIMEOUT).toBe(120_000);
  });

  it.each([
    ["search", { query: "barbour jacket" }],
    ["product", { item_id: 10671938315 }],
    ["seller", { user_id: 65958245 }],
    ["sellerProducts", { user_id: 65958245 }],
    ["sellerFeedback", { user_id: 65958245 }],
    ["brands", { query: "barbour" }],
    ["suggestions", { query: "barb" }],
    ["filters", { filter: "status" }],
    ["categories", undefined],
  ] as const)("vinted.%s raises the request timeout, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => (c.vinted as unknown as Ns)[method]!(args as Record<string, unknown> | undefined);

    await call(client);
    expect(delays()).toContain(VINTED_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(VINTED_TIMEOUT);
  });
});
