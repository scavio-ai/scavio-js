import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio } from "../../src/index.js";

describe("WalmartNamespace", () => {
  let client: Scavio;

  beforeEach(() => {
    client = new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 10 });
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("search sends POST to /api/v1/walmart/search", async () => {
    await client.walmart.search({ query: "tv" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/walmart/search",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ query: "tv" }),
      }),
    );
  });

  it("product sends product_id to /api/v1/walmart/product", async () => {
    await client.walmart.product({ product_id: "123456" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toEqual({ product_id: "123456" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.scavio.dev/api/v1/walmart/product",
      expect.anything(),
    );
  });
  it("search sends the store pair to /api/v1/walmart/search", async () => {
    await client.walmart.search({ query: "whole milk", delivery_zip: "50036", store_id: "1389" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe("https://api.scavio.dev/api/v1/walmart/search");
    expect(JSON.parse((call[1] as RequestInit).body as string)).toEqual({
      query: "whole milk",
      delivery_zip: "50036",
      store_id: "1389",
    });
  });

  it("product sends domain ca with the store pair", async () => {
    await client.walmart.product({
      product_id: "10220526",
      domain: "ca",
      delivery_zip: "M5V 2T6",
      store_id: 3106,
    });

    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe("https://api.scavio.dev/api/v1/walmart/product");
    expect(JSON.parse((call[1] as RequestInit).body as string)).toEqual({
      product_id: "10220526",
      domain: "ca",
      delivery_zip: "M5V 2T6",
      store_id: 3106,
    });
  });

  it("stores sends zipcode to /api/v1/walmart/stores and returns the typed body", async () => {
    const payload = {
      data: {
        zipcode: "50036",
        domain: "com",
        count: 1,
        stores: [{ store_id: "1389", name: "Boone Supercenter", distance_miles: 1.14 }],
      },
      response_time: 900,
      credits_used: 1,
      credits_remaining: 49,
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    } as Response);

    const res = await client.walmart.stores({ zipcode: "50036" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe("https://api.scavio.dev/api/v1/walmart/stores");
    expect(JSON.parse((call[1] as RequestInit).body as string)).toEqual({ zipcode: "50036" });
    expect(res.data.stores[0]!.store_id).toBe("1389");
  });

  it("stores sends domain ca with a Canadian postal code", async () => {
    await client.walmart.stores({ zipcode: "M5V 2T6", domain: "ca" });

    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(JSON.parse((call[1] as RequestInit).body as string)).toEqual({
      zipcode: "M5V 2T6",
      domain: "ca",
    });
  });
});
