import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, SWEETWATER_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/sweetwater/";
const ENDPOINTS: Row[] = [
  ["search", {"query": "boss delay pedal"}, B + "search"],
  ["search", {"query": "boss delay pedal", "page": 1}, B + "search"],
  ["category", {"category": "c590--Solid_Body_Guitars"}, B + "category"],
  ["category", {"category": "c590--Solid_Body_Guitars", "page": 1, "facets": {"Availability": ["In Stock"], "Brand": ["Fender"]}}, B + "category"],
  ["product", {"item_id": "DD8"}, B + "product"],
  ["serialUnits", {"item_id": "DD8"}, B + "serial-units"],
  ["reviews", {"item_id": "DD8"}, B + "reviews"],
  ["reviews", {"item_id": "DD8", "page": 1, "limit": 25}, B + "reviews"],
  ["deals", {}, B + "deals"],
  ["deals", {"deal": "guitar-deals", "page": 1}, B + "deals"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("sweetwater namespace", () => {
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

  it.each(ENDPOINTS)("sweetwater.%s posts its body to %s", async (method, args, path) => {
    await (client.sweetwater as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["deals"])("%s() works with no options", async (method) => {
    await (client.sweetwater as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 6 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.sweetwater)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["category", "deals", "product", "reviews", "search", "serialUnits"]);
  });

  it("timeout: 240 s", () => {
    expect(SWEETWATER_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "sweetwater.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = SWEETWATER_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.sweetwater as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
