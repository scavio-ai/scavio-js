import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, NINTENDO_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "mario" }, "/api/v1/nintendo/search"],
  [
    "search",
    {
      query: "zelda",
      country: "de",
      language: "de",
      page: 2,
      page_size: 50,
      sort: "price_asc",
      platform: "switch_2",
      on_sale: true,
      price_max: 30,
      genre: "RPG",
      players: 2,
      has_demo: true,
      type: "all",
    },
    "/api/v1/nintendo/search",
  ],
  ["product", { nsuid: "70010000095431" }, "/api/v1/nintendo/product"],
  ["product", { slug: "mario-kart-world-switch-2", country: "ca", language: "fr" }, "/api/v1/nintendo/product"],
  ["prices", { ids: "70010000095431,70010000063714,70010000094234" }, "/api/v1/nintendo/prices"],
  ["prices", { ids: ["70010000063716", 70010000084605], country: "kr" }, "/api/v1/nintendo/prices"],
  ["deals", { country: "us", sort: "ending_soon", sale: "square-enix" }, "/api/v1/nintendo/deals"],
  ["releases", { country: "jp", type: "upcoming", platform: "switch_2", page: 2, page_size: 10 }, "/api/v1/nintendo/releases"],
  ["dlc", { slug: "super-smash-bros-ultimate-switch" }, "/api/v1/nintendo/dlc"],
  ["dlc", { nsuid: 70010000012332, country: "mx" }, "/api/v1/nintendo/dlc"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("nintendo namespace", () => {
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

  it.each(ENDPOINTS)("nintendo.%s posts its body to %s", async (method, args, path) => {
    await (client.nintendo as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals", "releases"])("%s() works with no options", async (method) => {
    await (client.nintendo as unknown as Ns)[method]!();
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(`https://api.scavio.dev/api/v1/nintendo/${method}`);
    expect(body()).toEqual({});
  });

  it("has all 6 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.nintendo)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["deals", "dlc", "prices", "product", "releases", "search"]);
  });

  it("timeout: 120 s", () => {
    expect(NINTENDO_TIMEOUT).toBe(120_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "nintendo.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.nintendo as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(NINTENDO_TIMEOUT);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(NINTENDO_TIMEOUT);
    },
  );
});
