import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ALLEGRO_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const PRODUCT_ID = "90d08230-e02a-4210-913d-d417453321b8";

const ENDPOINTS: Row[] = [
  ["search", { query: "laptop" }, "/api/v1/allegro/search"],
  [
    "search",
    {
      query: "laptop",
      sort: "price_low_to_high",
      condition: "new",
      buying_format: "buy_now",
      deals: true,
      smart: true,
      min_price: 500,
      category_id: 491,
      page: 2,
    },
    "/api/v1/allegro/search",
  ],
  ["search", { query: "notebook", country: "hu" }, "/api/v1/allegro/search"],
  ["offer", { offer_id: "18801787032" }, "/api/v1/allegro/offer"],
  ["offer", { url: "https://allegro.cz/nabidka/18740738924" }, "/api/v1/allegro/offer"],
  ["product", { product_id: PRODUCT_ID, country: "sk" }, "/api/v1/allegro/product"],
  [
    "productOffers",
    { product_id: PRODUCT_ID, sort: "price_with_delivery_low_to_high", condition: "used", max_price: 100.5 },
    "/api/v1/allegro/product-offers",
  ],
  ["seller", { login: "Yupilo_pl", query: "lenovo", category: "komputery", sort: "newest" }, "/api/v1/allegro/seller"],
  ["sellerFeedback", { login: "Yupilo_pl", page: 3 }, "/api/v1/allegro/seller-feedback"],
  ["category", { category_id: "laptopy-491", query: "dell", sort: "popularity" }, "/api/v1/allegro/category"],
  ["category", { url: "https://allegro.pl/kategoria/laptopy-491" }, "/api/v1/allegro/category"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("allegro namespace", () => {
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

  it.each(ENDPOINTS)("allegro.%s posts its body to %s", async (method, args, path) => {
    await (client.allegro as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has all 7 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.allegro)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(
      ["search", "offer", "product", "productOffers", "seller", "sellerFeedback", "category"].sort(),
    );
  });

  it("ALLEGRO_TIMEOUT is 120 s", () => {
    expect(ALLEGRO_TIMEOUT).toBe(120_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "allegro.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.allegro as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(ALLEGRO_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(ALLEGRO_TIMEOUT);
    },
  );
});
