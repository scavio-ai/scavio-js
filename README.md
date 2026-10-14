# Scavio

TypeScript SDK for the [Scavio API](https://scavio.dev?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme) — real-time structured web
data across 38 platforms on one API key, plus `extract()` to read
any URL as clean Markdown, and `extract.map()` / `extract.crawl()` /
`extract.batch()` to map, crawl and batch-extract whole websites.

Structured JSON in, structured JSON out. No per-site parsers to maintain.

- **Search and SERP** — Google (organic, news, maps, shopping, flights, hotels, trends, AI Mode)
- **AI assistants** — ChatGPT and Gemini answers with the sources they cite and the products they recommend
- **E-commerce** — Amazon, Walmart, Costco, Mercado Libre, eBay, Target, Home Depot, TikTok Shop
- **Real estate and travel** — Zillow, Redfin, Realtor.com, Rightmove, Booking, Airbnb, Tripadvisor
- **Reviews and local** — Trustpilot, Yelp, G2, Capterra, Glassdoor, App Store, Google Play
- **Jobs and companies** — Indeed, Glassdoor, SEC EDGAR, Companies House
- **Ads transparency** — Google Ads Transparency Center, Meta Ad Library
- **Social and video** — YouTube, TikTok, Instagram, Threads, X, LinkedIn, Reddit, Kuaishou
- **Any other page** — `extract()` turns a URL into Markdown, plain text or raw HTML
- **Whole websites** — `extract.map()` lists a site's URLs, `extract.crawl()` crawls a site, `extract.batch()` extracts a list of URLs in one job

## Install

```bash
npm install scavio
```

## Quick Start

```typescript
import { Scavio } from "scavio";

const client = new Scavio({ apiKey: "sk_..." });

// Google search
const results = await client.search({ query: "web scraping api" });

// Amazon product lookup
const product = await client.amazon.product({ asin: "B09V3KXJPB" });

// Read any page as Markdown
const page = await client.extract({ url: "https://example.com/pricing" });

// Check usage
const usage = await client.getUsage();
```

## Configuration

```typescript
const client = new Scavio({
  apiKey: "sk_...",               // or set SCAVIO_API_KEY env var
  baseUrl: "https://api.scavio.dev", // default
  timeout: 30_000,                   // ms, default
  maxRequestsPerSecond: 1,           // 1-50, default 1
  maxRetries: 2,                     // default 2, set 0 to disable
});
```

`maxRetries` is the number of extra attempts after the first request, applied
only to transient failures — HTTP 429, 500, 502, 503, 504 and network or timeout
errors. Backoff is exponential with full jitter, capped at 8s, and a
`Retry-After` header is honored when the API sends one. Non-transient errors
(400, 401, 402, 404, 422) are never retried.

`maxRequestsPerSecond` throttles the client so it never sends more than N
requests in any one-second window. Your plan also has a server-side concurrency
limit on simultaneous in-flight requests: 1 on free and pay-as-you-go, 5 on
Project, 10 on Bootstrap, 15 on Startup, 50 on Growth, and unlimited on
Enterprise.

Every request carries `X-Client-Source: scavio-js`. From Node.js (and other
server runtimes) it also sends `User-Agent: scavio-js/<version>` (since 0.18.1);
browsers do not allow a script to set `User-Agent`, so it is omitted there.

## API Reference

### Extract (any URL)

`extract()` is a core endpoint, not a platform, so it lives on the client itself.
It reads any page and hands it back as readability Markdown, plain text or raw
HTML — the read-a-page primitive an agent or a RAG ingest needs.

```typescript
const page = await client.extract({
  url: "https://example.com/pricing",
  format: "markdown",   // "html" | "markdown" | "text", default "markdown"
  mode: "normal",       // "normal" | "advanced" | "ultra", default "normal"
});

page.content;        // the page body
page.content_length; // characters returned
```

Credits depend on `mode`, not on a flat per-call price: `normal` costs 1,
`advanced` costs 1, `ultra` costs 2. Billing happens only on a successful
extraction — a dead link, bot wall or timeout costs nothing.

- `normal` is the default. Start here.
- `advanced` renders the page's JavaScript. Use it when the content is built
  client-side.
- `ultra` is the hardest-page tier. Use it only when a page blocks the other
  two.

`html` is the raw page. `markdown` is a readability extraction with the
boilerplate stripped. `text` is that markdown flattened to plain text. URLs are
http(s) only, a bare host is upgraded to https, and loopback, private,
link-local and cloud-metadata hosts are rejected with a 400.

### Website map, crawl and batch extract (new in 0.23.0)

`extract` is also a namespace: calling it reads one page, exactly as before
(`client.extract({ url })` sends the same request it did in 0.22), and its
methods work on whole sites and URL lists, with each page returned exactly
like [Extract](https://scavio.dev/docs/extract?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme).

```typescript
// Map: every URL on a site, from its sitemaps and start page. 1 credit.
const map = await client.extract.map({
  url: "https://example.com",
  limit: 500,                    // 1-5,000, default 1,000 (plan caps apply)
  sitemap: "include",            // "include" | "only" | "skip"
  include_paths: ["/blog/**"],   // optional path globs
});
map.data.links;       // [{ url, source: "sitemap" | "page", lastmod? }]
map.data.truncated;   // true when more URLs exist than `limit`

// Crawl: start a job, then poll it (polling and cancelling are free).
const job = await client.extract.crawl(
  { url: "https://example.com/docs", max_pages: 50, max_depth: 3, format: "markdown" },
  { idempotencyKey: "docs-crawl-2026-10-12" }, // optional; one is generated when omitted
);
job.data.id;          // "crawl_..."
job.data.status_url;

const page = await client.extract.crawlStatus(job.data.id, { limit: 25 });
page.data.status;      // "queued" | "running" | "completed" | "failed" | "cancelled"
page.data.pages;       // { discovered, queued, succeeded, failed, skipped }
page.data.results;     // [{ url, depth, status, status_code, content, ... }]
page.data.next_cursor; // pass as { cursor } for the next page, null at the end

await client.extract.cancelCrawl(job.data.id); // 409 once the crawl has finished

// Or wait for it: polls until done and returns every result in one response.
const done = await client.extract.crawl(
  { url: "https://example.com/docs", max_pages: 20 },
  { wait: true, pollInterval: 2000, waitTimeout: 600_000 },
);
done.data.results.length;

// Batch: extract a list of URLs in one job (results in input order).
const batch = await client.extract.batch({
  urls: ["https://example.com/a", "https://example.com/b"],
  mode: "normal",
});
batch.data.invalid_urls; // rejected up front, never billed
await client.extract.batchStatus(batch.data.id);
await client.extract.cancelBatch(batch.data.id);
```

**Pricing.** Map costs 1 credit. Crawl and batch bill per **successful** page
at Extract's price for the tier: `normal` 1, `advanced` 1, `ultra` 2. Failed
and skipped pages are free, starting, polling and cancelling a job are free,
and credits are taken page by page: if your balance runs out the job stops
cleanly with `stopped_reason: "insufficient_credits"`.

**Plan limits.**

| Plan | Max pages per crawl | Active jobs | URLs per batch |
|------|--------------------:|------------:|---------------:|
| Free | 10 | 1 | 10 |
| PAYG | 100 | 1 | 50 |
| Project | 500 | 2 | 100 |
| Bootstrap | 2,000 | 3 | 500 |
| Startup | 5,000 | 5 | 1,000 |
| Growth | 10,000 | 10 | 1,000 |

Starting a job above your plan's active-job limit is a 429 (`RateLimitError`)
with `Retry-After`.

**Behavior.** Crawl and map always obey the site's robots.txt. A crawl stays on
the start URL's site (`allow_subdomains` opts into subdomains) and visits URLs
under the start path first. Batch treats each URL like a single `extract()`
call. Results are kept for 3 days after the job finishes (`expires_at`), up to
2 MB per page and 250 MB per job, and a job runs for at most 6 hours.

**`wait: true`.** `crawl()` and `batch()` poll the status endpoint every
`pollInterval` ms (default 2,000) until the job is completed, failed or
cancelled, then page through every cursor and return
`{ data: { ...summary, results: [all], next_cursor: null }, created: {...} }`,
where `created` is the 202 job handle (including `webhook_secret`, which is
only returned on creation), as in the Python SDK (since 0.23.1). If the job is
still running after `waitTimeout` ms (default 10 minutes) they throw
`ScavioJobTimeoutError`; the job keeps running and the error carries
`jobId`, `jobType` and `statusUrl` so you can keep polling or cancel it. For
big crawls, prefer a webhook or your own polling loop.

**Retries and idempotency.** The SDK retries 429/5xx and network errors.
`crawl()` and `batch()` always send an `Idempotency-Key`: yours when you pass
`idempotencyKey`, otherwise a random UUID generated for that call and reused on
every retry of it (since 0.23.1). Repeating a POST with the same key within 24
hours returns the original job, so a retried start never begins a second,
billed one. Pass your own key to dedupe across calls or processes. Plain
`extract()` and `map()` are not jobs and send no key.

#### Completion webhooks

Pass `webhook_url` (https) to `crawl()` or `batch()` and Scavio POSTs the job
summary there when it completes, fails or is cancelled (retried at 0 s, 30 s
and 5 min). The signing secret comes back once, as `job.data.webhook_secret`.
Each delivery is signed with
`Scavio-Signature: t=<unix>,v1=<hex HMAC-SHA256 of "<t>.<raw body>">`; verify
it against the **raw** body with `verifyWebhook` (async, Web Crypto, so it runs
on Node 18+, Deno, Bun and edge runtimes):

```typescript
import { verifyWebhook } from "scavio";

// e.g. a Next.js / Hono / Workers route handler
export async function POST(req: Request) {
  const raw = await req.text();
  const ok = await verifyWebhook(
    process.env.SCAVIO_WEBHOOK_SECRET!,      // the job's webhook_secret
    req.headers.get("Scavio-Signature"),
    raw,
    300,                                     // max signature age in seconds (default)
  );
  if (!ok) return new Response("bad signature", { status: 401 });
  const event = JSON.parse(raw);
  // event.id, event.status, ...
  return new Response("ok");
}
```

`verifyWebhook` returns `false` (never throws) for a missing, malformed,
tampered or stale signature.

### Google

Each method hits its own `/api/v2/google*` endpoint and returns Google's full
response (raw passthrough); each costs 1 credit. Results come back as
`organic_results[]` with `link` and `snippet`. Geo and paging use `gl`, `hl`,
`start`, `google_domain` and `device` — the old v1 vocabulary (`light_request`,
`country_code`, `language`, `search_type`, `page`) does not exist on v2 and is
dropped server-side.

```typescript
// SERP search (includes the AI Overview when Google shows one)
await client.google.search({
  query: "web scraping",
  gl: "us",                // optional — geo (country)
  hl: "en",                // optional — UI language
  device: "desktop",       // optional
});

// Other Google surfaces
await client.google.aiMode({ query: "how does rag work" });
await client.google.mapsSearch({ query: "coffee near me" });
await client.google.shopping({ query: "laptop" });
await client.google.flights({ departure_id: "JFK", arrival_id: "LAX", outbound_date: "2026-12-15" });
await client.google.hotels({ query: "Bali", check_in_date: "2026-08-01", check_out_date: "2026-08-03" });
await client.google.news({ query: "openai" });
await client.google.trends({ query: "bitcoin" });
```

#### Migrating from the Google Custom Search JSON API (new in 0.25.0)

`google.customSearch` takes the Custom Search JSON API (`cse.list`) parameters and
returns the same `customsearch#search` response: `items[]` with `title`, `link`,
`snippet` and `displayLink`, `searchInformation.totalResults` and
`queries.nextPage`, so code that parsed Custom Search results keeps working.
Options are snake_case like the rest of this SDK and are sent as the CSE wire
names (`site_search` -> `siteSearch`, `date_restrict` -> `dateRestrict`). 1 credit.

```typescript
const res = await client.google.customSearch({
  q: "abortcontroller fetch timeout",
  num: 5,
  site_search: "stackoverflow.com", // enforced on the returned results
  date_restrict: "y1",
});
for (const item of res.items ?? []) console.log(item.displayLink, item.title, item.link);
const next = res.queries.nextPage?.[0]?.startIndex;
```

Not using this SDK? Keep your existing Custom Search code and change the host:
`https://api.scavio.dev/customsearch/v1?key=YOUR_SCAVIO_KEY&q=...`. `cx` is
accepted and ignored. Parameters that cannot be honoured (image search, `sort`,
`rights`) throw `BadRequestError` instead of being silently dropped. For the full
SERP (knowledge graph, AI overview, People Also Ask) use `google.search`.
[Docs](https://scavio.dev/docs/google-custom-search-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

### ChatGPT and Gemini (new in 0.26.0)

Send the prompt a buyer would ask and get the answer the assistant gives: the
full Markdown answer, the pages it cites, the web searches it ran (ChatGPT) and
the products it recommended. Both return the same shape under `data`, so one
parser tracks which brands each assistant recommends. 5 credits per answered
prompt; a failed prompt is not charged. Answers take 10-40 seconds, so both
methods raise the request timeout to 120s when the client's is shorter.

```typescript
const prompt = "What are the best CRM tools for small agencies?";

const chatgpt = await client.chatgpt.prompt({ prompt, country: "us" });
const gemini = await client.gemini.prompt({ prompt });

for (const { data } of [chatgpt, gemini] as any[]) {
  console.log(data.platform, "mentions HubSpot:", data.answer.markdown.includes("HubSpot"));
  console.log("  cited:", data.sources.slice(0, 5).map((s: any) => s.url));
  console.log("  products:", data.shopping.map((p: any) => p.title));
}

// ChatGPT also returns each source's title and publisher and the searches it ran.
console.log((chatgpt as any).data.search_queries);
```

Options: `chatgpt.prompt({ prompt, model?, country?, include_html? })` (prompt up
to 1024 characters) and `gemini.prompt({ prompt })` (up to 4000).
[ChatGPT docs](https://scavio.dev/docs/chatgpt-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme) |
[Gemini docs](https://scavio.dev/docs/gemini-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

### Amazon

Responses are normalized to a stable shape (see the breaking-change note
below); each call costs 1 credit. `country` is an ISO 3166-1 alpha-2
marketplace code (`us`, `gb`, `de`, ...) and defaults to `us`.

```typescript
// Search products
await client.amazon.search({
  query: "laptop",
  country: "de",           // optional, marketplace
  page: 2,                 // optional, 1-based
});

// Get product by ASIN
await client.amazon.product({
  asin: "B09V3KXJPB",
  country: "us",           // optional
});

// Every seller offering that ASIN, with the buy box winner flagged
const res = await client.amazon.offers({ asin: "B09V3KXJPB" });
// res.data   -> { asin, title, count, total_offers, has_more_pages, page, offers[] }
// res.data.offers[i] -> { price, currency, condition, seller_name,
//                         is_buy_box_winner, is_fulfilled_by_amazon,
//                         shipping_price, list_price, delivery, prime_delivery }

// Supported marketplaces (no API key required)
await client.amazon.options();
```

There is no sort parameter: the marketplace was verified to ignore every sort
value and return the same unordered set, so exposing one would be a filter that
silently does nothing.

#### Amazon changed in 0.12.0 (breaking)

The Amazon API now returns a normalized shape instead of the previous raw
payload.

- `search` returns `{query, page, total_results, total_results_text, count, products[], filters[], related_searches[]}`.
  Each product is `{asin, title, url, image, price, currency, rating, reviews_count, is_sponsored, position, badge, sales_volume, delivery{is_free, date, fastest_date}}`.
- `product` returns flat fields: `price`, `list_price`, `currency`, `rating`, `reviews_count`, `features`, `images`, `videos`, `variants`, `specifications`, `best_sellers_rank`, `shipping`, and more. The old `buybox[]` array no longer exists — use `offers` for per-seller pricing.
- `offers` is new: every seller for one ASIN. 1 credit, page 1 only.
- `country` (ISO 3166-1 alpha-2) is the marketplace selector and replaces `domain`; `page` replaces `start_page`. Both old names still work as deprecated aliases.
- Nine options were removed: `language`, `currency`, `device`, `sort_by`, `pages`, `category_id`, `merchant_id`, `zip_code`, `autoselect_variant`. Sending one anyway still returns 200, with a top-level `warnings` array naming what was ignored.
- `options()` still returns `domains` and `countries`; `languages` and `currencies` are now always empty, because neither is a request parameter any more.

### Walmart

Eight endpoints. `stores` and store targeting on `search` / `product` are new in
0.17.0.

```typescript
await client.walmart.search({
  query: "tv",
  domain: "com",           // "com" | "ca" | "com.mx"
  page: 2,                 // 1-indexed
  sort_by: "rating_high",
  min_price: 100,
  max_price: 500,
});

await client.walmart.product({ product_id: "13544111159" });
await client.walmart.reviews({ product_id: "13544111159", page: 2 });
await client.walmart.category({ category_id: "3944_133251_1095191" });
await client.walmart.offers({ product_id: "13544111159" });
await client.walmart.seller({ seller_id: "101138578" });
await client.walmart.sellerProducts({ seller_id: "101138578" });

// Store targeting: find stores for a ZIP, then pass one with the ZIP.
const { data } = await client.walmart.stores({ zipcode: "50036" });
await client.walmart.search({
  query: "whole milk",
  delivery_zip: "50036",
  store_id: data.stores[0].store_id!, // "1389", Boone Supercenter
});

// walmart.ca works the same way with a postal code and domain "ca".
await client.walmart.stores({ zipcode: "M5V 2T6", domain: "ca" });
await client.walmart.product({
  product_id: "10220526",
  domain: "ca",
  delivery_zip: "M5V 2T6",
  store_id: "3106",
});
```

Credits are a function of the body: `search` and `category` cost 1 credit on
`domain` "com" or "ca" and 2 on "com.mx"; a store-targeted `search` or `product`
costs 2. `stores` and the other endpoints cost 1.

#### Walmart store targeting (0.17.0)

- `delivery_zip` and `store_id` must be sent **together**, on `search` or
  `product`. They work on walmart.com and walmart.ca (`domain: "ca"` with a
  Canadian postal code); walmart.com.mx does not support store targeting.
- Get `store_id` from `stores()` on the same domain. `store_id` decides the
  store; `data.location` in the response confirms which store was used.
- Store-targeted calls take 10-60 seconds — set a generous timeout. A
  `store_id` that does not exist returns 400, and a product the store does not
  carry returns 404.
- `product` accepts `domain: "ca"` only together with a store target.

#### Walmart changed in 0.15.0 (breaking)

- `device` is retired. Sending it still returns 200, with a top-level `warnings`
  array naming what was ignored. (`delivery_zip` and `store_id` were retired in
  0.15.0 and came back in 0.17.0 as store targeting.)
- `domain` is **not** retired — it is the price-bearing param, and it is accepted
  on `search` and `category`. Product-keyed endpoints are walmart.com only,
  except `product` with a store target (0.17.0).
- `page` (1-indexed) is the paging param; `start_page` remains a deprecated alias.
- `sort_by` gained `rating_high` and `new`.
- `fulfillment_speed` is `today` or `tomorrow` only. There is deliberately no
  `2_days` (it leaks 3-4 day items) and no `anytime` — omit the param instead.
- `offers` returns the **buy-box seller only**, not the full offer list.
- `seller_id` must be the numeric catalog id (`seller_catalog_id`, returned by
  `product` and `offers`). The GUID form of the id returns 404.
- `sellerProducts` has **no pagination** — roughly the first 40 server-rendered
  items. `total_count` reports the seller's real catalog size.

### Costco

Thirteen endpoints, new in 0.18.0. `country` is `"us"` (costco.com, default) or
`"ca"` (costco.ca); `search`, `product` and `warehouses` also take `"uk"`,
`"au"`, `"mx"`, `"jp"`, `"kr"` and `"tw"` (keyword, sort and paging only).

```typescript
// Warehouse numbers come from warehouses().
await client.costco.warehouses({ zip: "10025", limit: 3 });

// warehouse_id adds that warehouse's in-store price, stock and price code to
// every result on search, category and deals.
await client.costco.search({ query: "olive oil", warehouse_id: "1062", page_size: 5 });
await client.costco.category({ category: "televisions", sort_by: "price_low" });
await client.costco.categories();                         // departments
await client.costco.categories({ category_id: "30001" }); // one department's tree
await client.costco.product({ item_ids: ["100334960", "1492456"] }); // up to 20
await client.costco.reviews({ product_id: "100334960", sort_by: "most_helpful" });
await client.costco.autocomplete({ query: "kirk" });

// Online vs in-warehouse price at up to 10 warehouses, with discount, final
// price, promotion dates and price code.
await client.costco.prices({ item_id: "1492456", warehouse_ids: ["1062", "1107"] });

// In-warehouse stock status (never a quantity), pickup and same-day delivery.
await client.costco.availability({ item_number: "1492456", warehouse_ids: ["1062"] });

// Regular, premium and diesel prices near a location, or at given warehouses.
await client.costco.gas({ zip: "90001" });
await client.costco.gas({ warehouse_ids: ["1062", "1107"] });

// The current member coupon book (US only, no parameters).
await client.costco.coupons();

// Deal feeds: new, while_supplies_last, treasure_hunt, member_favorites,
// online_only, on_sale.
await client.costco.deals({ type: "treasure_hunt", warehouse_id: "1062" });

// Markdown finder at one warehouse: .97 clearance and .00/.88 manager
// markdowns by default; add special_buy for .49/.79/.89 endings.
await client.costco.clearance({
  warehouse_id: "1062",
  query: "snacks",
  price_codes: ["clearance", "manager_markdown", "special_buy"],
});
```

1 credit per call except where the body scales the work: `prices` costs 2 at 10
warehouses, `availability` 1 per 5 warehouses, `warehouses` 2 with
`country: "ca"`, and `gas` 2 by location on ca (by `warehouse_ids`, 1 per 5
warehouses on us and 2 per warehouse on ca). The clearance price codes are the
member-community decode of Costco shelf prices; Costco does not publish them,
and only items Costco lists online are covered.

### [Mercado Libre](https://scavio.dev/docs/mercadolibre-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Five endpoints, new in 0.21.0: `reviews` costs 1 credit, the other four 2. The
`best-sellers` endpoint is `bestSellers()`. Mexico (`mx`), Brazil (`br`,
Mercado Livre), Argentina (`ar`) and Colombia (`co`); prices come back in MXN,
BRL, ARS or COP. Chile is not supported. Docs: [search](https://scavio.dev/docs/mercadolibre-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [product](https://scavio.dev/docs/mercadolibre-product?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [reviews](https://scavio.dev/docs/mercadolibre-reviews?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [questions](https://scavio.dev/docs/mercadolibre-questions?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [best sellers](https://scavio.dev/docs/mercadolibre-best-sellers?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme); overview at the [Mercado Libre API](https://scavio.dev/mercadolibre-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme) page.

```typescript
// Keyword search: about 48 rows per page, up to 42 pages.
const found = await client.mercadolibre.search({
  country: "mx",
  query: "iphone 15",
  condition: "new",
  free_shipping: true,
  sort: "price_asc",       // relevance (default), price_asc or price_desc
});

// A seller's catalogue: by numeric seller_id (filters and paging work), or by
// nickname (first page, unfiltered, plus the seller_id).
await client.mercadolibre.search({ country: "mx", seller_id: "527927603", min_discount: 20 });
await client.mercadolibre.search({ country: "mx", seller_nickname: "MERCADOLIBRE ELECTRONICA_MX" });

// One product or listing: buy-box seller with reputation, variations, star
// distribution, specs. Exactly one of url, product_id or item_id.
await client.mercadolibre.product({ product_id: "MLM1027172667" });

// Reviews, 15 per page, optionally by star rating (1 credit).
await client.mercadolibre.reviews({ product_id: "MLM1027172667", rating: 1 });

// Buyer questions with the seller's answers; page with next_offset.
await client.mercadolibre.questions({ item_id: "MLM3571336480" });

// Top 20 best sellers in a category (mx, ar or co; not Brazil).
await client.mercadolibre.bestSellers({ country: "mx", category_id: "MLM1055" });
```

A query reaches about 2,000 results (42 pages of 48), so slice by price range,
condition or seller to go further. Units sold are lower bounds
(`sold_quantity_min`, e.g. "+1000 vendidos"), not exact counts, and sort is
relevance or price only. Mercado Libre may narrow a query to a category, brand
or line on its own, and Brazil and Argentina may auto-apply a "new" condition;
`auto_applied_filters` lists what it applied. `product` returns only the
buy-box seller. Reviews translated into the site's language keep
`original_text`. Questions carry answer dates but no question dates. A
zero-result search is an empty, billed page; an unknown product, item or seller
nickname, or a listing with no public questions, is a billed 404.

### YouTube

Credit cost varies by endpoint: `transcript` costs 5; `streams` costs 3;
`search` and `shorts` cost 2; every other YouTube endpoint costs 1.

```typescript
// Search videos
await client.youtube.search({
  query: "typescript tutorial",
  upload_date: "this_week",       // optional
  sort_by: "relevance",           // optional
  features: ["hd", "4k"],         // optional
  cursor: "...",                  // optional (pagination)
});

// Search Shorts
await client.youtube.shorts({ query: "cooking" });

// Search-as-you-type suggestions
await client.youtube.suggestions({ query: "how to" });

// Get video details (accepts an id or a full watch URL)
await client.youtube.video({ video_id: "dQw4w9WgXcQ" });
// youtube.metadata() is a deprecated alias of youtube.video()

// Video comments and threaded replies
await client.youtube.comments({ video_id: "dQw4w9WgXcQ" });
await client.youtube.commentReplies({
  video_id: "dQw4w9WgXcQ",
  reply_cursor: "...",            // from a comment's reply_cursor
});

// Transcript / subtitles (format: 'text' or 'srt')
await client.youtube.transcript({ video_id: "dQw4w9WgXcQ", format: "srt" });

// Related videos
await client.youtube.related({ video_id: "dQw4w9WgXcQ" });

// Playable / downloadable stream URLs
await client.youtube.streams({ video_id: "dQw4w9WgXcQ" });

// Channels
await client.youtube.channelSearch({ query: "mkbhd" });
await client.youtube.channel({ channel_id: "@mkbhd" }); // id, @handle, or URL
await client.youtube.channelVideos({ channel_id: "UC..." });
await client.youtube.channelShorts({ channel_id: "UC..." });
await client.youtube.channelCommunity({ channel_id: "UC..." });
await client.youtube.channelResolve({ channel: "@mkbhd" }); // handle/URL -> id

// One community post (text, author, likes, images, comments_cursor) and its comments
await client.youtube.communityPost({ post_id: "Ugkx_PqHZYEoCCP7e8WIOrh-1HCvtKoFMzVp" });
await client.youtube.communityPostComments({ post_id: "Ugkx_PqHZYEoCCP7e8WIOrh-1HCvtKoFMzVp" });
```

### Reddit

Every Reddit endpoint costs 1 credit.

`search()` takes only `query` and `cursor` — there is no result-type or sort
filter, so anything else is dropped server-side. `searchComments()` does sort
(`RELEVANCE`, `HOT`, `TOP` or `NEW`). It returns
`data.results` with `next_cursor` and `has_more`. `post()` returns a flat post
object under `data` and carries no comments; use `postComments()` for those.
The subreddit and user feeds return `data.posts`.

```typescript
// Search posts
await client.reddit.search({ query: "typescript", cursor: "..." });

// Search-as-you-type suggestions
await client.reddit.searchSuggestions({ query: "python" });

// Post detail (by post_id or url)
await client.reddit.post({ post_id: "t3_1v6ngaf" });
await client.reddit.post({ url: "https://reddit.com/r/typescript/comments/abc123" });

// Post comments and threaded replies
await client.reddit.postComments({ post_id: "t3_1v6ngaf", sort: "TOP" });
await client.reddit.commentReplies({
  post_id: "t3_1v6ngaf",
  cursor: "...",            // reply_cursor from a comment
});

// Subreddit info and feed
await client.reddit.subreddit({ subreddit: "AskReddit" });
await client.reddit.subredditPosts({ subreddit: "AskReddit", sort: "HOT" });

// Redditor profile, posts, and comments
await client.reddit.user({ username: "spez" });
await client.reddit.userPosts({ username: "spez", sort: "NEW" });
await client.reddit.userComments({ username: "spez" });

// Site-wide popular feed and trending searches
await client.reddit.popular();
await client.reddit.trending();

// Comment search (each result carries its post and subreddit) and subreddit search
await client.reddit.searchComments({ query: "web scraping api", sort: "NEW" });
await client.reddit.searchSubreddits({ query: "web scraping" });
```

### X

```typescript
// Search tweets and people
await client.x.search({ search: "artificial intelligence", search_type: "Latest" });

// Tweet detail, comments, and retweeters
await client.x.tweet({ tweet_id: "1808168603721650364" });
await client.x.tweetComments({ tweet_id: "1808168603721650364", rank: "top" });
await client.x.tweetRetweeters({ tweet_id: "1808168603721650364" });

// User profile and feeds
await client.x.user({ screen_name: "elonmusk" });
await client.x.userTweets({ screen_name: "elonmusk" });
await client.x.userReplies({ screen_name: "elonmusk" });
await client.x.userMedia({ screen_name: "elonmusk" });
await client.x.userFollowers({ screen_name: "elonmusk" });
await client.x.userFollowings({ screen_name: "elonmusk" });

// Trending topics
await client.x.trending({ country: "UnitedStates" });

// Communities: search, details (rules, member count), and posts
await client.x.searchCommunities({ keyword: "crypto" });
await client.x.community({ community_id: "1508567430188126209" });
await client.x.communityTweets({ community_id: "1508567430188126209", ranking: "Recency" });
```

Every X endpoint costs 1 credit.

### LinkedIn

```typescript
// Person profile, about, and posts. A handle or a full LinkedIn URL works
// anywhere a reference is taken.
await client.linkedin.person({ username: "williamhgates" });
await client.linkedin.personAbout({ url: "https://www.linkedin.com/in/williamhgates/" });
await client.linkedin.personPosts({ username: "williamhgates" });

// Company profile and posts
await client.linkedin.company({ company: "microsoft" });
await client.linkedin.companyPosts({ company: "microsoft" });

// Jobs: search, then pull detail for one listing
await client.linkedin.searchJobs({ search: "software engineer", location: "United States" });
await client.linkedin.job({ job_id: "4415427228" });

// A post and its comments (10 per page)
await client.linkedin.post({ post_id: "7488618410256523265" });
await client.linkedin.postComments({ post_id: "7488618410256523265", page: 1 });
```

Credit cost varies by endpoint: `job` costs 30; `personPosts`, `companyPosts`,
`searchJobs` and `postComments` cost 10 per page; `person`, `personAbout`,
`company` and `post` cost 1.

> **Retired endpoints.** The LinkedIn data behind `personContact`,
> `companyPeople`, `companyJobs`, `searchPeople` and `searchPosts` is no longer
> available. They remain callable but always return HTTP 410 and are never
> billed. `company()` returns `featured_employees` (a small sample of staff), and
> `searchJobs()` with a company name substitutes for `companyJobs()`.

`personPosts`, `companyPosts` and `searchJobs` paginate: pass the previous
response's `next_cursor` as `cursor` to fetch the next page. `personPosts` also
takes `type` (`"posts"`, `"comments"` or `"reactions"`) to pick the feed.
`postComments` pages with a 1-based `page` instead.

### TikTok

```typescript
// User profile
await client.tiktok.profile({ username: "testuser" });

// User posts
await client.tiktok.userPosts({ sec_user_id: "abc123", count: 30 });

// Video details
await client.tiktok.video({ video_id: "vid123" });

// Video transcript: timestamped segments and full text (video_id or url;
// optional 2-letter language). Caption-less videos return available: false.
await client.tiktok.videoTranscript({ video_id: "7609177768793787679" });

// Video comments
await client.tiktok.videoComments({ video_id: "vid123", count: 20 });

// Comment replies
await client.tiktok.commentReplies({ video_id: "vid123", comment_id: "c456" });

// Search videos (sort_type: '0' = relevance, '1' = most likes)
await client.tiktok.searchVideos({ keyword: "dance", sort_type: "1" });

// Search users
await client.tiktok.searchUsers({ keyword: "cooking" });

// Hashtag info
await client.tiktok.hashtag({ hashtag_name: "fyp" });

// Hashtag videos
await client.tiktok.hashtagVideos({ hashtag_id: "h789", count: 30 });

// User followers
await client.tiktok.userFollowers({ sec_user_id: "abc123" });

// User followings
await client.tiktok.userFollowings({ sec_user_id: "abc123" });

// Trending searches and a sample of trending videos (about 6 per call)
await client.tiktok.trendingSearches();
await client.tiktok.trendingVideos();

// Search autocomplete
await client.tiktok.searchSuggestions({ keyword: "cooking" });

// Sounds: detail, videos using a sound, search, Top 50 / Viral 50 chart
await client.tiktok.music({ music_id: "7364498342501435408" });
await client.tiktok.musicVideos({ music_id: "7364498342501435408" });
await client.tiktok.searchMusic({ keyword: "espresso" });
await client.tiktok.musicChart({ chart: "viral" });

// Similar creators, playlists and the videos in one
await client.tiktok.userSimilar({ sec_user_id: "abc123" });
await client.tiktok.userPlaylists({ sec_user_id: "abc123" });
await client.tiktok.playlistVideos({ playlist_id: "7596415294902389534" });

// Live status and account region (region also returns sec_user_id)
await client.tiktok.userLive({ username: "mrbeast" });
await client.tiktok.userRegion({ username: "mrbeast" });
```

Every TikTok endpoint costs 1 credit. The trending, sound, similar, playlist,
live and region endpoints return TikTok's raw payload: large numeric ids can
lose precision when parsed as JSON numbers, so use the string forms (`id_str`,
`sec_uid`, `sec_user_id`). `trendingVideos()` returns about 6 videos per call
whatever `count` is set to, and `musicVideos()` ignores `count` (about 14 per
page). Search suggestions can be empty for long-tail keywords and still bill.
An unknown username is a billed 404 on `userLive()` and an unbilled 404 on
`userRegion()`.

### TikTok Shop

Every TikTok Shop endpoint costs 1 credit. Two limits to design around:

- `product()` resolves only about 44% of the product ids returned by `search()`.
  TikTok Shop has no detail data for the rest, so an HTTP 404 is a normal outcome, not an
  error — skip the item instead of retrying. Search to product is not a reliable
  pipeline. `product()` **throws** `NotFoundError` on that 404 (there is no `data`
  field in the body to test), so a loop over search ids must catch it:

  ```typescript
  import { NotFoundError } from "scavio";

  for (const productId of productIds) {
    try {
      const detail = await client.tiktokShop.product({ product_id: productId });
    } catch (e) {
      if (e instanceof NotFoundError) continue; // no detail data; skip
      throw e;
    }
  }
  ```

  `productReviews()` often works for ids `product()` cannot resolve: of 8 such ids
  tested, 8 returned HTTP 200 and 7 carried at least one review, so it is a useful
  fallback source of product detail.
- `product()` does not return a price; TikTok masks it on the product page. Exact
  prices come from `search()`, `shopProducts()`, and `categoryProducts()`.

```typescript
// Search products (US catalog, exact prices, cursor pagination)
await client.tiktokShop.search({ search: "phone case" });

// Keyword suggestions (8 regions)
await client.tiktokShop.searchSuggestions({ search: "wireless", region: "US" });

// Product detail (no price; a 404 is normal, see above)
await client.tiktokShop.product({ product_id: "1732293553906094315" });

// Product reviews (up to 200 per call)
await client.tiktokShop.productReviews({
  product_id: "1732293553906094315",
  page_size: 200,
  sort: "relevant",
});

// Category tree (28 top-level, 240 nodes)
await client.tiktokShop.categories();

// Products in a category (US and GB only)
await client.tiktokShop.categoryProducts({ category_id: "601450" });

// A shop's catalog, 30 per page
await client.tiktokShop.shopProducts({ shop_id: "7495514739648989419" });

// Resolve any TikTok Shop URL or share link to a product_id / shop_id
await client.tiktokShop.resolve({ url: "https://vt.tiktok.com/ZT2AHoGsE/" });
```

### Instagram

20 endpoints. Typical credit cost per call:

| Credits | Methods |
|---|---|
| 1 | `profile`, `musicPosts` (per page), `userReels`, `userTagged` (2 the first time a username is looked up) |
| 2 | `userPosts`, `userStories`, `post`, `postComments`, `commentReplies`, `searchUsers`, `searchHashtags`, `userFollowers`, `userFollowings`, `userHighlights`, `highlightStories`, `searchReels`, `searchMusic`, `searchLocations`, `userSimilar`, `postLikers` |
| 8 | `searchUsers` / `searchHashtags` when a `cursor` is sent |

A request can cost up to 10 when it needs extra work; `credits_used` in the
response is the exact charge.

```typescript
// User profile
await client.instagram.profile({ username: "instagram" });

// User posts / reels / tagged
await client.instagram.userPosts({ username: "instagram", count: 12 });
await client.instagram.userReels({ username: "instagram" });
await client.instagram.userTagged({ username: "instagram" });

// User stories, highlights and the stories saved in one highlight
await client.instagram.userStories({ username: "instagram" });
await client.instagram.userHighlights({ username: "natgeo" });
await client.instagram.highlightStories({ highlight_id: "highlight:18149897764550869" });

// Post detail (by url, media_id, or shortcode) and who liked it
await client.instagram.post({ shortcode: "DUajw4YkorV" });
await client.instagram.postLikers({ shortcode: "DUajw4YkorV" });

// Post comments and replies
await client.instagram.postComments({ shortcode: "DUajw4YkorV", sort_order: "newest" });
await client.instagram.commentReplies({ media_id: "123", comment_id: "456" });

// Search users, hashtags, Reels and places
await client.instagram.searchUsers({ keyword: "justin" });
await client.instagram.searchHashtags({ keyword: "fashion" });
await client.instagram.searchReels({ keyword: "latte art" });
await client.instagram.searchLocations({ keyword: "central park" });

// Audio: find a track, then the Reels that use it
await client.instagram.searchMusic({ keyword: "espresso" });
await client.instagram.musicPosts({ music_id: "1747512212697470" });

// Followers / followings / similar accounts
await client.instagram.userFollowers({ username: "instagram", count: 50 });
await client.instagram.userFollowings({ username: "instagram" });
await client.instagram.userSimilar({ username: "mrbeast" });
```

### Threads

Six endpoints, and the credit cost is a function of the body: **2 credits when
you address a user by `user_id`, 4 when you address them by `username`.** A
handle needs an extra lookup, so it costs a second call. Only `profile`,
`userPosts` and `userReplies` are username-keyed; `post`, `postComments` and
`searchUsers` always cost 2.

```typescript
// Resolve the handle once, then stay on the cheap path
const found = await client.threads.searchUsers({ query: "zuck" });

await client.threads.profile({ user_id: "63625256886" });
await client.threads.userPosts({ user_id: "63625256886", cursor });
await client.threads.userReplies({ user_id: "63625256886" });
await client.threads.post({ url: "https://www.threads.net/@zuck/post/..." });
await client.threads.postComments({ post_id: "3141..." });
```

There is no Threads content search — `searchUsers` is people search and it is
the only search Threads exposes. Missing or conflicting identifiers return 422,
not 400; no match returns 404.

### Kuaishou

Fourteen endpoints, priced **per endpoint** rather than flat: `videosBatch`
costs 40, `profile` and the four `search*` methods cost 10, `video` costs 2, and
everything else costs 1.

```typescript
await client.kuaishou.userResolve({ share_link: "https://v.kuaishou.com/..." }); // 1
await client.kuaishou.userPosts({ user_id: "3xabc..." });                // 1
await client.kuaishou.tagFeed({ tag: "美食" });                           // 1
await client.kuaishou.video({ photo_id: "3xdef..." });                   // 2
await client.kuaishou.searchVideos({ keyword: "coffee" });               // 10
await client.kuaishou.videosBatch({ photo_ids: ["3xdef...", "3xghi..."] }); // 40
```

`videosBatch` costs 40 whether you send 1 id or 20, so fill the batch. If all
you have is a share link, `userResolve()` turns it into a user id for 1 credit
rather than paying 10 for `profile()`. Missing identifiers return 422.

### eBay

```typescript
await client.ebay.search({ query: "airpods pro", sold: true, per_page: 120 });
await client.ebay.search({ seller: "musicmagpie" });  // no keyword needed
await client.ebay.product({ item_id: "126543210987" });
await client.ebay.seller({ seller: "musicmagpie" });
```

1 credit per call. `sold: true` searches completed listings that actually sold —
the price-research view; eBay publishes no headline count there, so
`total_results` comes back null. `per_page` accepts only 60, 120 or 240. `seller`
is a profile endpoint and cannot enumerate a catalogue — page a seller's
inventory through `search({ seller })` instead.

### Target

```typescript
await client.target.search({ keyword: "office chair", store_id: "1234" });
await client.target.category({ category_id: "5xtg6" });
await client.target.product({ tcin: "82291396" });
await client.target.reviews({ tcin: "82291396" });
```

1 credit per call, but these are the slowest endpoints in the SDK: product about
4s, search about 9s, category about 37s, reviews about 40s. Raise `timeout`
accordingly. `reviews` returns at most 8 review bodies whatever `review_count`
says, and `limit` only trims — there is no paging. `seller_*` is null on
first-party stock, which means "sold by Target"; only Target Plus marketplace
listings name a vendor.

### Home Depot

```typescript
await client.homeDepot.search({ query: "cordless drill", page: 2 });
await client.homeDepot.product({ item_id: "313159056" });
await client.homeDepot.reviews({ item_id: "313159056", page: 2 });
```

2 credits per call. Search page size is fixed at 12, so paging is the only way
to read further; reviews are 30 per page and a page past `total_pages` is a 404.
`product` carries only a 10-review preview — `reviews` is the paginated surface.

### Zillow

```typescript
await client.zillow.search({
  location: "Austin, TX",
  listing_status: "for_rent",
  min_price: 1500,        // MONTHLY RENT on for_rent
  max_price: 3000,
});
await client.zillow.property({ zpid: "29433327" });
await client.zillow.agentReviews({ screen_name: "jane-doe" });
```

1 credit per call. A bare ZIP works on its own but cannot be combined with a
filter or a sort — Zillow then geolocates the request and answers about another
city, so pass the city name whenever you filter. On `listing_status: "for_rent"`,
`min_price`/`max_price` mean monthly rent. `agentReviews` addresses an agent
profile, not a property, and returns the five reviews Zillow server-renders
(`total_review_count` is the real total). An unresolvable region is a 404.

### Redfin

```typescript
await client.redfin.search({ location: "https://www.redfin.com/city/30749/TX/Austin" });
await client.redfin.search({ region_id: 30749, region_type: 6 });  // 6 = city
await client.redfin.property({ property_id: "185301234" });
await client.redfin.market({ region_id: 30749, region_type: 6 });
```

1 credit per call. **City names are not accepted** on `location` — pass a
redfin.com region URL (`/city/`, `/neighborhood/`, `/county/`, `/zipcode/`) or
`region_id` plus `region_type`, which must be sent together. `region_id` is not
a ZIP code. `sold_within_days` is only valid with `listing_status: "sold"`.
`days_on_market` is always null in the response — do not build on it.

### [Realtor.com](https://scavio.dev/docs/realtor-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Six endpoints, new in 0.20.0, 1 credit each. Docs: [search](https://scavio.dev/docs/realtor-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [property](https://scavio.dev/docs/realtor-property?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [locations](https://scavio.dev/docs/realtor-locations?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [market](https://scavio.dev/docs/realtor-market?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [agents](https://scavio.dev/docs/realtor-agents?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [agent](https://scavio.dev/docs/realtor-agent?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme); overview at the [Realtor.com API](https://scavio.dev/realtor-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme) page.

```typescript
// Sold land comps: up to 200 listings per call.
const comps = await client.realtor.search({
  location: "Maricopa County, AZ",
  listing_status: "sold",
  property_types: ["land"],
  sold_within_days: 365,
  lot_sqft_min: 43560,    // 1 acre
  page_size: 200,
});

// Listing-text keyword watch (a listing must contain ALL the keywords, so each
// extra keyword narrows the results), a radius search, or one agent's listings.
await client.realtor.search({ location: "Austin, TX", keywords: ["workshop"] });
await client.realtor.search({ latitude: 30.27, longitude: -97.74, radius_miles: 5 });
await client.realtor.search({ agent_id: "1918615" });

await client.realtor.property({ property_id: "9564057635" });
await client.realtor.locations({ query: "Austin" });     // slug_id for market()
await client.realtor.market({ location: "Austin_TX" });
await client.realtor.agents({ postal_code: "78744" });
await client.realtor.agent({ agent_id: "1918615" });
```

`listing_status` is `for_sale` (default; includes pending and contingent, as
on the site), `pending`, `for_rent` or `sold`. Each row carries price, sold
price and date, lot size, address with coordinates, MLS id and listing agent.
Realtor.com serves the first 10,000 results of a search (`page` x `page_size`
may not exceed 10,000), so slice big areas by price band, property type or
radius. Sold prices are null in US sold-price non-disclosure states (Texas,
Utah, Wyoming and others); sold dates still come back. `property` returns price
and tax history, three valuations with history and forecast, schools,
flood/wildfire/noise risk and the listing agent; valuations, schools and risk
can be null for land or new construction. An unknown property, market or agent
is a billed 404.

### [Rightmove](https://scavio.dev/docs/rightmove-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Seven endpoints, new in 0.20.0, 1 credit each. The `sold-property` endpoint is
`soldProperty()`. Docs: [search](https://scavio.dev/docs/rightmove-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [property](https://scavio.dev/docs/rightmove-property?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [sold](https://scavio.dev/docs/rightmove-sold?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [sold property](https://scavio.dev/docs/rightmove-sold-property?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [locations](https://scavio.dev/docs/rightmove-locations?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [agents](https://scavio.dev/docs/rightmove-agents?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [agent](https://scavio.dev/docs/rightmove-agent?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme); overview at the [Rightmove API](https://scavio.dev/rightmove-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme) page.

```typescript
// Resolve a place, then search for sale (24-25 per page, up to 42 pages).
const places = await client.rightmove.locations({ query: "Bristol" });
await client.rightmove.search({
  location_id: "REGION^219",
  property_types: ["terraced", "semi_detached"],
  max_price: 350000,      // GBP; monthly rent on for_rent
  must_have: ["garden"],
});
await client.rightmove.search({ location: "Bristol", listing_status: "for_rent", furnishing: ["furnished"] });
await client.rightmove.property({ property_id: "93577917" });

// Sold prices since 1995 for an outcode (England and Wales only), then one
// address's full history.
await client.rightmove.sold({ location: "BS3", sold_within_years: 5, sort: "price_high" });
await client.rightmove.soldProperty({ sold_id: "921d33f4-d206-4991-be4d-75cbe71981ce" });

// Agent branches in an area, then one branch.
await client.rightmove.agents({ location: "Bristol" });
await client.rightmove.agent({ branch_id: "201404" });
```

`search` takes exactly one of `location_id`, `location` (a place name) or
`branch_id`. There is **no keyword filter** — a request with `keywords` is a
400 and is not billed; match on `summary` and `key_features` in the results.
Rightmove serves 42 search pages, 40 sold pages (25 addresses each, England and
Wales only, not Scotland or Northern Ireland) and 50 agent pages per query. Live listings carry no price history; use
`soldProperty` for an address's past sales. An unknown or removed listing, sold
id or branch is a billed 404.

### Booking

```typescript
await client.booking.search({
  destination: "Lisbon",
  checkin: "2026-09-10",
  checkout: "2026-09-13",   // send both or neither
  adults: 2,
  currency: "USD",
});
await client.booking.hotel({ hotel: "the-independente" });
await client.booking.reviews({ hotel: "the-independente" });
```

1 credit per call. `checkin` and `checkout` must be sent together — Booking
ignores a lone check-in and prices its own date range. `hotel` and `reviews`
take dates for the same reason: Booking prices a stay, and the response echoes
whichever dates were used. `currency` defaults to USD; without it Booking picks
a currency itself and two identical requests can disagree. A search with neither
`destination` nor `dest_id` returns Booking's homepage and still costs a credit.

### Airbnb

```typescript
await client.airbnb.search({
  location: "Barcelona",
  check_in: "2026-09-10",
  check_out: "2026-09-15",  // send both or neither
  currency: "USD",
});
await client.airbnb.listing({ listing_id: "1234567890" });
await client.airbnb.reviews({ listing_id: "1234567890", limit: 50, offset: 50 });
```

1 credit per call. **Prices are search-only** — the listing page carries no
nightly rate under any parameters. A dateless search defaults to +30d for 5
nights and Airbnb A/Bs both the window and the prices, so the response flags it
as `dates_are_defaulted`; send real dates for anything you intend to compare.
The rating breakdown and review tags live on `listing`, while `reviews` returns
the review bodies with `limit`/`offset` paging.

### Tripadvisor

**Start with `locations()`.** Every other endpoint is keyed by ids that exist
only inside TripAdvisor's own URLs.

```typescript
const places = await client.tripadvisor.locations({ query: "Le Bernardin" });
await client.tripadvisor.search({ geo_id: "60763", category: "restaurants" });
await client.tripadvisor.location({ location_id: "426986", geo_id: "60763" });
await client.tripadvisor.reviews({ location_id: "426986", geo_id: "60763", page: 2 });
```

2 credits per call. A geo row from `locations()` gives the `geo_id` that
`search()` takes; a business row gives the `geo_id` + `location_id` pair that
`location()` and `reviews()` take. Page 1 of the reviews already ships inside
`location()`, so use `reviews()` to page past it. Review page size differs by
family (15 restaurants, 10 hotels and attractions), consecutive pages can repeat
one review at the boundary (de-duplicate on `review_id`), and a page past the
last is a 404.

### Yelp

```typescript
await client.yelp.search({ term: "ramen", location: "Seattle, WA" });
await client.yelp.business({ business_id: "..." });
await client.yelp.reviews({ business_id: "...", page: 2 });  // page 2, not 1
```

2 credits per call. `location` is effectively required — without it Yelp
picks a location itself and the same request can answer about a different
metro run to run. **Reviews page 1 is redundant**: it re-fetches the document
`business()` already returned and costs another 2 credits, so start at page 2.
Page size is fixed at 10 and a page past the last is a 404.

### Indeed

```typescript
await client.indeed.search({
  query: "data engineer",
  location: "Remote",
  radius: 25,          // 0, 5, 10, 15, 25, 35, 50 or 100 only
  max_age_days: 7,     // 1, 3, 7 or 14 only
});
await client.indeed.job({ job_id: "a1b2c3d4e5f6" });
await client.indeed.company({ company: "Stripe" });
await client.indeed.companyReviews({ company: "Stripe", page: 2 });
```

2 credits per call. `radius` and `max_age_days` are closed sets — Indeed ignores
anything else and silently returns the unfiltered set, so an unsupported radius
bills you for a search covering fifty miles. `min_salary` filters on Indeed's own
estimate for the role, not on a posted figure, so postings that publish no salary
still match. A location-only search (no `query`) is valid. Search is 10 postings
per page, company reviews 20.

### Glassdoor

**Start with `companies()`.** The other three are keyed by an `employer_id` that
only exists inside Glassdoor's `/Overview/` URLs.

```typescript
const hits = await client.glassdoor.companies({ query: "Stripe" });
const company = await client.glassdoor.company({ employer_id: "671932" });

// Pass the URLs the company response returns - saves a lookup
await client.glassdoor.reviews({ url: company.reviews_url as string });
await client.glassdoor.salaries({ url: company.salaries_url as string });
```

1 credit per call. Glassdoor's login wall caps `reviews` at **three reviews per
response** — there is deliberately no `page` param; move the window with
`category` and `employment_status` and read `filtered_review_count` to see how
many match. Addressing `reviews` or `salaries` by `employer_id` needs an
extra lookup because the slugs are case-sensitive and must be read off the
profile, so prefer the `reviews_url` / `salaries_url` the company response hands
back. These endpoints are slow and flaky by nature (company about 3-47s, reviews
about 75s, salaries about 41s) — raise `timeout` and keep retries on.

### App Store

```typescript
await client.appStore.search({ term: "meditation", limit: 100, country: "us" });
await client.appStore.app({ app_id: "com.apple.Pages" });  // or the numeric id
await client.appStore.reviews({ app_id: "361309726", page: 2, sort: "most_helpful" });
```

1 credit per call. **Search has no pagination** — `limit` (1-200) is the only
lever; every offset spelling is silently ignored. `app` accepts both a numeric
App Store id and a bundle id; `reviews` is numeric-only. Reviews hard-stop at
page 10 (50 per page), which is Apple's anonymous ceiling — reach further by
asking a different `country`. Reviews cannot 404: an unknown id and an app with
zero reviews return the same empty feed.

### Google Play

```typescript
await client.googlePlay.search({ query: "meditation", hl: "en", gl: "us" });
await client.googlePlay.app({ app_id: "com.spotify.music" });
await client.googlePlay.reviews({ app_id: "com.spotify.music", sort: "newest", count: 200 });
```

2 credits per call. **Search does not paginate** — one shelf of about 30 apps.
`hl` changes the storefront, not just the strings: title, description, install
formatting and content rating all move with it. The reviews `cursor` is opaque,
single-use, and encodes the sort as well as the position, so send it back with
the same `sort` it came from; a cursor past the last review is a 404. `app`
already returns the 20 reviews Play server-renders, plus the real install count
Play publishes but never displays.

### G2

```typescript
await client.g2.search({ query: "crm", rating: 4 });
await client.g2.product({ product_id: "notion" });
await client.g2.reviews({ product_id: "notion", page: 2, company_size: "enterprise" });
```

**5 credits per call — the most expensive platform in the SDK.** Retries are
deliberately conservative for that reason, and a blocked page arrives as a
billed 200 rather than an error. G2
loads review text in a separate frame, so `product` carries no reviews — call
`reviews`, which is also the only place with exact per-star counts, pros/cons by
theme, and company-size / role / industry / region facets.

### Capterra

```typescript
const hits = await client.capterra.search({ query: "project management" });
await client.capterra.product({ product_id: "186596", slug: "Notion" });
await client.capterra.reviews({ product_id: "186596", slug: "Notion", page: 2 });
```

2 credits per call. **Search does not paginate** — Capterra fixes the result set
at 20, so there is no `page` param. `slug` is cosmetic on `product` but
load-bearing and case-sensitive on `reviews`: a wrong one silently serves page 1
under a billed 200, so pass back the `slug` or `reviews_url` that `search` or
`product` returned. Reviews are 25 per page, capped at page 100, and page 1
already ships inside `product`. `vendor` is null on the product profile —
Capterra does not publish it there.

### Trustpilot

Six endpoints, new in 0.19.0, 2 credits each.

```typescript
// Businesses matching a keyword, up to 100 per page.
const found = await client.trustpilot.search({ query: "vpn", country: "US", page_size: 10 });

// Full profile: TrustScore, rating distribution, reply rate and days to reply on
// negative reviews, AI summary and topics, similar businesses, 20 newest reviews.
const profile = await client.trustpilot.business({ domain: "nordvpn.com" });

// Filtered reviews, 20 per page.
const bad = await client.trustpilot.reviews({
  domain: "nordvpn.com",
  stars: [1, 2],
  language: "en",
  date_range: "last30days",
});

// The category tree, then ranked businesses in one category.
const tree = await client.trustpilot.categories();
const ranked = await client.trustpilot.category({
  category_id: "vpn_service",
  sort: "reviews_count",
  min_trust_score: 4,
  claimed_only: true,
});

// One review by id, with the business it is about.
const one = await client.trustpilot.review({ review_id: "6aca2504b52cc4b518bf4b75" });
```

`business` and `reviews` take exactly one of `domain` or `url` (any
trustpilot.com/review/ page). Reviews are capped at 10 pages of 20 (200) per
filter combination; `max_page` says how far one goes, and slicing by `stars`,
`language`, `date_range`, `topics` or `search` reaches more. `total_filtered`
counts every match, so a date range doubles as review velocity. Topic ids for
the `topics` filter come from `business`'s `topics`. Search and category rows
carry `email` and `phone` only when the business published them; the AI summary
and topics appear only when Trustpilot has them for the requested `language`.
`min_trust_score` is a minimum star rating (3, 4 or 4.5): Trustpilot rounds
TrustScore to stars, so 4 includes TrustScore 3.8 and up. An unknown business,
review or category returns a 404 (`NotFoundError`) and is billed. No TrustScore
history is returned.

### SEC EDGAR

**Start with `lookup()`.** Callers hold a ticker; EDGAR is keyed by CIK.

```typescript
const match = await client.sec.lookup({ query: "AAPL" });
await client.sec.company({ ticker: "AAPL" });
await client.sec.filings({ ticker: "AAPL", form: "10-K", include_history: true });
await client.sec.facts({ ticker: "AAPL", query: "revenue" });
await client.sec.concept({ ticker: "AAPL", concept: "NetIncomeLoss" });
await client.sec.search({ query: "climate risk", form: "10-K" });
```

1 credit per call, including `include_history: true`, which is the one call that
can take up to 10 lookups. Both `cik` and `ticker` accept either
spelling. XBRL concept tags are **case-sensitive** — `netincomeloss` is a 404,
so use `facts()` to see what a filer actually reports. EDGAR's
"recent" block is not a fixed window: a decade for a quiet filer, about a year
for a prolific one.

### Companies House

```typescript
const hits = await client.companiesHouse.search({ query: "Monzo" });
await client.companiesHouse.company({ company_number: "09446231" });
await client.companiesHouse.officers({ company_number: "09446231", page: 2 });
await client.companiesHouse.filingHistory({ company_number: "SC090312" });
```

1 credit per call. `company_number` is deliberately loose — the register 404s on
numbers that lost their leading zeros or arrived lower-cased, so the transport
pads and upper-cases before asking. SC, NI, OC, SO, NC, FC, BR and CE prefixes
are all supported. Search is 20 per page and capped at page 50: the register
serves a 1000-result window per term whatever hit count it advertises, and page
51 is an HTTP 416. Officers and filing history have no upper page bound — past
the last page you get an ordinary empty list.

### Google Ads Transparency

```typescript
const advertisers = await client.googleAds.advertisers({ query: "nike" });
const page1 = await client.googleAds.search({ advertiser_id: "AR123...", region: "DE" });
const page2 = await client.googleAds.search({
  advertiser_id: "AR123...",
  region: "DE",
  cursor: page1.next_cursor as string,   // re-send the SAME filters
});
await client.googleAds.creative({ advertiser_id: "AR123...", creative_id: "CR456..." });
```

1 credit per call. `search` paginates by `cursor` / `next_cursor` at 100 per
page — re-send the same filters alongside the cursor. `limit` is capped at 100 by
Google itself, which answers a larger request with zero rows rather than an
error. `advertisers` and `creative` do not paginate. **Impressions and reach are
EEA-only**: US creatives return null for `impressions_min`, `impressions_max` and
`first_shown` because Google only publishes reach where the DSA compels it. The
text, image and video format sets are disjoint — an advertiser's creatives never
overlap between them.

### Meta Ad Library

```typescript
const page1 = await client.metaAds.search({ query: "protein powder", country: "US" });
const page2 = await client.metaAds.search({
  query: "protein powder",
  cursor: page1.next_cursor as string,
});
await client.metaAds.advertiser({ page_id: "10150125871..." });
await client.metaAds.ad({ ad_archive_id: "1234567890123456" });
```

1 credit per call. `search` and `advertiser` paginate all the way through: page 1
returns 30 ads, then 10 per page via `next_cursor` — walk `has_next_page` to pull
a whole query or advertiser. The cursor is a self-contained opaque blob, so
paging is stateless and **the other filters are ignored when a cursor is
present**, so re-sending `query` alongside it is harmless and satisfies the
schema — the cursor already carries the filters. `total_results` caps at 50000 with
`total_is_capped: true`, because Meta only reports "more than 50,000". Spend,
reach, impressions and the paid-for-by disclosure exist on political and issue
ads only — set `ad_type: "political_and_issue_ads"` to expose them; commercial
ads leave those fields null.

### Usage

```typescript
const usage = await client.getUsage();
```

## Error Handling

```typescript
import { Scavio, InvalidAPIKeyError, RateLimitError } from "scavio";

try {
  const results = await client.search({ query: "test" });
} catch (error) {
  if (error instanceof InvalidAPIKeyError) {
    // 401 — bad API key
  } else if (error instanceof RateLimitError) {
    // 429 — too many requests
  }
}
```

All error classes:

| Class | HTTP Status | Description |
|-------|------------|-------------|
| `MissingAPIKeyError` | — | No API key provided |
| `ScavioConnectionError` | — | Request never reached the API (DNS, reset, TLS) |
| `ScavioTimeoutError` | — | Request exceeded the configured `timeout` |
| `BadRequestError` | 400, 422 | Invalid request parameters |
| `InvalidAPIKeyError` | 401 | Invalid API key |
| `InsufficientCreditsError` | 402 | No credits remaining |
| `NotFoundError` | 404 | No data for that id (see TikTok Shop above) |
| `RateLimitError` | 429 | Rate limit exceeded |
| `ScavioAPIError` | other | Catch-all (has `.statusCode`; a 409 from cancelling a finished job lands here) |
| `ScavioJobTimeoutError` | — | `crawl()`/`batch()` with `wait: true` outlived `waitTimeout`; carries `jobId` |

Threads and Kuaishou answer a missing or conflicting identifier with **422**, not
400 — those routes have no 400 at all. Both map to `BadRequestError`, so one
`catch (e) { if (e instanceof BadRequestError) }` covers validation failures on
every platform. `e.statusCode` still reports whichever status the API sent.

Every class extends `ScavioError`, so `catch (e) { if (e instanceof ScavioError) }`
matches all of them. All except `MissingAPIKeyError`, `ScavioConnectionError` and
`ScavioTimeoutError` carry `.statusCode` and `.responseBody`.

## Runtime Support

- Node.js 18+
- Deno
- Bun

Zero dependencies — uses native `fetch`.

## License

MIT


## About Scavio

[Scavio](https://scavio.dev?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme) is a unified web data and
[search API for AI agents](https://scavio.dev/search-api-for-ai-agents?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme) — one API
key, structured JSON. It is a real-time
[Tavily alternative](https://scavio.dev/alternatives/tavily?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme) and
[SerpAPI alternative](https://scavio.dev/alternatives/serpapi?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), and with
`extract()` it also covers the read-any-URL job people reach for Firecrawl to do.

What teams build on it:

- **SERP and answer engines** — [Google Search API](https://scavio.dev/google-search-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme) for organic results, news, images, maps and the knowledge graph
- **Price and catalog monitoring** — [Amazon Product API](https://scavio.dev/amazon-product-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [Walmart Product API](https://scavio.dev/walmart-product-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), eBay, Target and Home Depot product, review and seller data, Mercado Libre listings, reviews and best sellers in Mexico, Brazil, Argentina and Colombia
- **Real estate and travel pipelines** — Zillow, Redfin and Realtor.com listings and market stats, Rightmove UK listings and England and Wales sold prices since 1995, Booking, Airbnb and Tripadvisor rates and reviews
- **Review mining and competitive research** — Trustpilot, Yelp, G2, Capterra, Glassdoor, App Store and Google Play reviews on one shape
- **Recruiting and company intelligence** — Indeed jobs, Glassdoor salaries, SEC EDGAR filings and XBRL facts, UK Companies House officers and filing history
- **Ad and creative intelligence** — Google Ads Transparency Center and Meta Ad Library creatives
- **Social listening** — [YouTube API](https://scavio.dev/youtube-transcript-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [TikTok API](https://scavio.dev/tiktok-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [Instagram API](https://scavio.dev/instagram-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [Reddit API](https://scavio.dev/reddit-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [X API](https://scavio.dev/docs/x-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), [LinkedIn API](https://scavio.dev/docs/linkedin-person?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme), Threads and Kuaishou
- **RAG ingestion** — `extract()` reads any URL and hands back readability Markdown ready to chunk and embed

Teams choosing between providers can [compare Scavio vs alternatives](https://scavio.dev/compare?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme) side by side.

Get a free [API key](https://dashboard.scavio.dev/sign-up?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme) and explore the [documentation](https://scavio.dev/docs/introduction?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme).
