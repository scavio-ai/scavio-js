import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, POSHMARK_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "lululemon align" }, "/api/v1/poshmark/search"],
  [
    "search",
    {
      query: "lululemon align",
      country: "ca",
      page: 2,
      availability: "all",
      brand: ["lululemon athletica"],
      department: "Women",
      category: "Pants_&_Jumpsuits",
      subcategory: "Leggings",
      sort: "price_drop",
      size: ["10"],
      condition: "like_new",
      color: ["Black"],
      price_min: 20,
      price_max: 60,
    },
    "/api/v1/poshmark/search",
  ],
  ["sold", { query: "coach bag", page: 10, department: "Women", category: "Bags" }, "/api/v1/poshmark/sold"],
  ["product", { listing_id: "6ad80f0dce5b0ace7ee9abd7" }, "/api/v1/poshmark/product"],
  ["product", { url: "https://poshmark.ca/listing/x-6af9e2547049a1ea8b9d2617", country: "ca" }, "/api/v1/poshmark/product"],
  ["category", { department: "Women", category: "Bags", subcategory: "Totes", availability: "sold" }, "/api/v1/poshmark/category"],
  ["brand", { brand: "Coach", department: "Women", sort: "just_in" }, "/api/v1/poshmark/brand"],
  ["closet", { username: "thriftedbyher" }, "/api/v1/poshmark/closet"],
  ["closetListings", { username: "thriftedbyher", availability: "sold", page: 2 }, "/api/v1/poshmark/closet-listings"],
  ["loveNotes", { username: "thriftedbyher" }, "/api/v1/poshmark/love-notes"],
  ["closetsSearch", { query: "vintage", page: 2 }, "/api/v1/poshmark/closets-search"],
  ["categories", { country: "ca" }, "/api/v1/poshmark/categories"],
  ["brands", { country: "ca" }, "/api/v1/poshmark/brands"],
  ["suggestions", { query: "lulu" }, "/api/v1/poshmark/suggestions"],
  ["parties", { status: "scheduled" }, "/api/v1/poshmark/parties"],
  ["partyListings", { party_id: "6af437b4ccaeb9c6a30f84a3", cursor: "abc" }, "/api/v1/poshmark/party-listings"],
  ["similar", { listing_id: "6ad80f0dce5b0ace7ee9abd7" }, "/api/v1/poshmark/similar"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("poshmark namespace", () => {
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

  it.each(ENDPOINTS)("poshmark.%s posts its body to %s", async (method, args, path) => {
    await (client.poshmark as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["categories", "brands", "parties"])("%s() works with no options", async (method) => {
    await (client.poshmark as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev/api/v1/poshmark/${method}`);
    expect(body()).toEqual({});
  });

  it("has all 15 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.poshmark)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual([
      "brand", "brands", "categories", "category", "closet", "closetListings", "closetsSearch",
      "loveNotes", "parties", "partyListings", "product", "search", "similar", "sold", "suggestions",
    ]);
  });

  it("timeout: 240 s", () => {
    expect(POSHMARK_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "poshmark.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.poshmark as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(POSHMARK_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(POSHMARK_TIMEOUT);
    },
  );
});
