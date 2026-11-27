import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Scavio, RECLAMEAQUI_TIMEOUT } from "../../src/index.js";

type Row = [method: string, args: Record<string, unknown>, path: string];

const B = "/api/v1/reclameaqui/";
const ENDPOINTS: Row[] = [
  ["companySearch", {"query": "nubank"}, B + "company-search"],
  ["company", {"shortname": "nubank"}, B + "company"],
  ["complaints", {"company_id": "88850"}, B + "complaints"],
  ["complaints", {"company_id": "88850", "status": "resolved", "query": "cartão bloqueado", "page": 1, "page_size": 10}, B + "complaints"],
  ["complaint", {"url": "https://www.reclameaqui.com.br/nubank/quero-aumentar-meu-limite-no-cartao-pois-o-atual-e-insuficiente_NhIy-6O6osFhQdJ-/"}, B + "complaint"],
  ["complaintSearch", {"query": "iphone quebrado"}, B + "complaint-search"],
  ["complaintSearch", {"query": "iphone quebrado", "page": 1, "page_size": 10}, B + "complaint-search"],
  ["rankings", {}, B + "rankings"],
  ["rankings", {"list": "most_complained_30_days"}, B + "rankings"],
  ["segments", {}, B + "segments"],
  ["segmentRanking", {"main_segment": "bancos-e-financeiras", "segment": "bancos-digitais"}, B + "segment-ranking"],
  ["segmentRanking", {"main_segment": "bancos-e-financeiras", "segment": "bancos-digitais", "page": 1}, B + "segment-ranking"],
];

type Ns = Record<string, (opts?: Record<string, unknown>) => Promise<unknown>>;

describe("reclameaqui namespace", () => {
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

  it.each(ENDPOINTS)("reclameaqui.%s posts its body to %s", async (method, args, path) => {
    await (client.reclameaqui as unknown as Ns)[method]!(args);
    const call = vi.mocked(fetch).mock.calls[0]!;
    expect(call[0]).toBe(`https://api.scavio.dev${path}`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body()).toEqual(args);
  });

  it.each(["rankings", "segments"])("%s() works with no options", async (method) => {
    await (client.reclameaqui as unknown as Ns)[method]!();
    const call = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(call.startsWith(`https://api.scavio.dev${B}`)).toBe(true);
    expect(body()).toEqual({});
  });

  it("has all 8 endpoints", () => {
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.reclameaqui)).filter(
      (m) => m !== "constructor" && m !== "post",
    );
    expect(methods.sort()).toEqual(["company", "companySearch", "complaint", "complaintSearch", "complaints", "rankings", "segmentRanking", "segments"]);
  });

  it("timeout: 240 s", () => {
    expect(RECLAMEAQUI_TIMEOUT).toBe(240_000);
  });

  it.each(ENDPOINTS.filter((_, i, all) => all.findIndex((r) => r[0] === _[0]) === i))(
    "reclameaqui.%s raises the request timeout, never lowers it",
    async (method, args) => {
      const want = RECLAMEAQUI_TIMEOUT;
      const spy = vi.spyOn(globalThis, "setTimeout");
      const delays = () => spy.mock.calls.map((c) => c[1]);
      const call = (c: Scavio) => (c.reclameaqui as unknown as Ns)[method]!(args);

      await call(client);
      expect(delays()).toContain(want);

      spy.mockClear();
      await call(new Scavio({ apiKey: "sk_test", maxRequestsPerSecond: 50, timeout: 400_000 }));
      expect(delays()).toContain(400_000);
      expect(delays()).not.toContain(want);
    },
  );
});
