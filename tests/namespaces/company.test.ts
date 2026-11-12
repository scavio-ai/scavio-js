import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, COMPANY_ENRICH_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["enrich", { url: "https://reliantplumbing.com" }, "/api/v1/company/enrich"],
  ["enrich", { place_id: "ChIJazYWSUjP4AERC36KZ_YMFYQ" }, "/api/v1/company/enrich"],
  [
    "enrich",
    { url: "reliantplumbing.com", place_id: "ChIJazYWSUjP4AERC36KZ_YMFYQ" },
    "/api/v1/company/enrich",
  ],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("company namespace", () => {
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

  it.each(ENDPOINTS)("company.%s posts its body to %s", async (method, args, path) => {
    await (client.company as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("has 1 endpoint", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.company)).filter(
      (m) => m !== "constructor",
    );
    expect(methods).toEqual(["enrich"]);
  });

  it("COMPANY_ENRICH_TIMEOUT is 180 s", () => {
    expect(COMPANY_ENRICH_TIMEOUT).toBe(180_000);
  });

  it("company.enrich raises the request timeout, never lowers it", async () => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) => c.company.enrich({ url: "https://reliantplumbing.com" });

    await call(client);
    expect(delays()).toContain(COMPANY_ENRICH_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
    expect(delays()).toContain(400_000);
    expect(delays()).not.toContain(COMPANY_ENRICH_TIMEOUT);
  });
});
