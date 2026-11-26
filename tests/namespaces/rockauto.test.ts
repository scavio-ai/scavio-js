import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, ROCKAUTO_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/rockauto/";
const ENDPOINTS: Row[] = [
  ["vehicles", {}, B + "vehicles"],
  ["vehicles", {"make": "HONDA", "year": 2010, "model": "ACCORD", "language": "en"}, B + "vehicles"],
  ["categories", {"make": "HONDA", "year": 2010, "model": "ACCORD", "engine": "2.4L L4", "carcode": "1444945"}, B + "categories"],
  ["categories", {"make": "HONDA", "year": 2010, "model": "ACCORD", "engine": "2.4L L4", "carcode": "1444945", "category": "Brake & Wheel Hub", "language": "en"}, B + "categories"],
  ["parts", {"make": "HONDA", "year": 2010, "model": "ACCORD", "engine": "2.4L L4", "carcode": "1444945", "category": "Brake & Wheel Hub", "part_type_id": "1684"}, B + "parts"],
  ["parts", {"make": "HONDA", "year": 2010, "model": "ACCORD", "engine": "2.4L L4", "carcode": "1444945", "category": "Brake & Wheel Hub", "part_type_id": "1684", "language": "en", "currency": "USD"}, B + "parts"],
  ["search", {"part_number": "BP1084"}, B + "search"],
  ["search", {"part_number": "BP1084", "brand": "BOSCH", "language": "en", "currency": "USD"}, B + "search"],
  ["brand", {"brand": "BOSCH", "part_type_id": "1684"}, B + "brand"],
  ["brand", {"brand": "BOSCH", "part_type_id": "1684", "language": "en", "currency": "USD"}, B + "brand"],
  ["brands", {}, B + "brands"],
  ["brands", {"language": "en"}, B + "brands"],
  ["part", {"part_key": "6129207", "part_type_id": "1684"}, B + "part"],
  ["part", {"part_key": "6129207", "part_type_id": "1684", "carcode": "0", "currency": "USD"}, B + "part"],
  ["suggestions", {"query": "2015 ford f-150"}, B + "suggestions"],
  ["resolve", {"query": "2010 honda accord brake pads"}, B + "resolve"],
  ["tools", {}, B + "tools"],
  ["tools", {"category": "Brake & Wheel Hub", "subcategory": "Tool", "part_type_id": "1000891", "language": "en", "currency": "USD"}, B + "tools"],
  ["promotions", {}, B + "promotions"],
  ["promotions", {"language": "en"}, B + "promotions"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("rockauto namespace", () => {
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

  it.each(ENDPOINTS)("rockauto.%s posts its body to %s", async (method, args, path) => {
    await (client.rockauto as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["vehicles", "brands", "tools", "promotions"])("%s() works with no options", async (method) => {
    await (client.rockauto as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 11 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.rockauto)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["brand", "brands", "categories", "part", "parts", "promotions", "resolve", "search", "suggestions", "tools", "vehicles"]);
  });

  it("timeout: 240 s", () => {
    expect(ROCKAUTO_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "rockauto.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = ROCKAUTO_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.rockauto as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
