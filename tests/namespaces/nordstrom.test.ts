import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, NORDSTROM_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "dress" }, "/api/v1/nordstrom/search"],
  ["search", { query: "dress", page: 2, sort: "percent_off" }, "/api/v1/nordstrom/search"],
  ["product", { style_id: "8098974" }, "/api/v1/nordstrom/product"],
  [
    "product",
    { url: "https://www.nordstrom.com/s/betsy-and-adam-strapless-mixed-media-gown/8098974" },
    "/api/v1/nordstrom/product",
  ],
];

describe("nordstrom namespace", () => {
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

  it.each(ENDPOINTS)("nordstrom.%s posts its body to %s", async (method, args, path) => {
    const target = client.nordstrom as unknown as Record<string, (opts: Record<string, unknown>) => Promise<unknown>>;
    await target[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("NORDSTROM_TIMEOUT is 120 s", () => {
    expect(NORDSTROM_TIMEOUT).toBe(120_000);
  });

  it.each([
    ["search", { query: "dress" }],
    ["product", { style_id: "8098974" }],
  ] as const)("nordstrom.%s raises the request timeout, never lowers it", async (method, args) => {
    const spy = vi.spyOn(globalThis, "setTimeout");
    const delays = () => spy.mock.calls.map((c) => c[1]);
    const call = (c: Scavio) =>
      (c.nordstrom as unknown as Record<string, (opts: Record<string, unknown>) => Promise<unknown>>)[method]!(args);

    await call(client);
    expect(delays()).toContain(NORDSTROM_TIMEOUT);

    spy.mockClear();
    await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 300_000 }));
    expect(delays()).toContain(300_000);
    expect(delays()).not.toContain(NORDSTROM_TIMEOUT);
  });
});
