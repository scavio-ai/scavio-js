import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const ENDPOINTS: Row[] = [
  ["search", { query: "organic milk" }, "/api/v1/heb/search"],
  ["product", { product_url: "/product-detail/central-market-organics-whole-milk-1-gal/931316" }, "/api/v1/heb/product"],
  ["stores", { zip: "78701" }, "/api/v1/heb/stores"],
];

describe("HebNamespace", () => {
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

  it.each(ENDPOINTS)("%s posts its body to %s", async (method, args, path) => {
    const ns = client.heb as unknown as Record<string, (opts: Record<string, unknown>) => Promise<unknown>>;
    await ns[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it("search sends store_id and page_size", async () => {
    await client.heb.search({ query: "milk", store_id: "441", page_size: 5 });
    expect(body()).toEqual({ query: "milk", store_id: "441", page_size: 5 });
  });

  it("product takes product_id alone with a numeric store_id", async () => {
    await client.heb.product({ product_id: "931316", store_id: 441 });
    expect(body()).toEqual({ product_id: "931316", store_id: 441 });
  });
});
