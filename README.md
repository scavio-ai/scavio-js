# Scavio

TypeScript SDK for the [Scavio API](https://scavio.dev?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme) — real-time structured web
data across 111 platforms on one API key, plus `extract()` to read
any URL as clean Markdown, and `extract.map()` / `extract.crawl()` /
`extract.batch()` to map, crawl and batch-extract whole websites.

Structured JSON in, structured JSON out. No per-site parsers to maintain.

- **Search and SERP** — Google (organic, news, maps, shopping, flights, hotels, trends, AI Mode)
- **AI assistants** — ChatGPT and Gemini answers with the sources they cite and the products they recommend
- **E-commerce** — Amazon, Walmart, Costco, Lowe's, Sam's Club, Canadian Tire, SportChek and Mark's (Canada, prices with the was price and sale end date, units at the assigned store; Mark's also in French via L'Equipeur), Dollar General, Dollar Tree (US case prices next to unit prices, units at a store and its nearby stores), Discount Tire (US tire prices by store, tires that fit a vehicle, exact units at the stores near a ZIP), Vevor (tools and equipment prices on 13 storefronts in their own currencies, was price only during a deal, shipping by state), Sephora, Ulta Beauty, Dermstore (US and Canada skincare prices, RRP and offer text per brand, offers with end times), ALDI, Micro Center, Walgreens, CVS, Whole Foods, Kroger (with QFC and Fred Meyer), Publix, IKEA (55 markets), Wayfair (US, Canada, UK, Ireland), Ashley Furniture (US, plus Canada, Mexico, the Philippines, Saudi Arabia and Turkey), Maisons du Monde (France, Belgium, Luxembourg, the Netherlands, Germany, Spain, Italy, Portugal, Switzerland), Harbor Freight, AutoZone, O'Reilly Auto Parts (part-number cross-reference, store stock near a ZIP), Ace Hardware (prices by store, units on hand, weekly ad), Tractor Supply (prices by store and price zone, store stock), Michaels (US and Canada, units at the stores near a ZIP), Nike (62 storefronts in 42 countries, sizes with GTIN, release calendar), Staples (US office supplies, price per unit and cost per page, units at the stores near a ZIP; Canada search and product), Instacart (US and Canada, prices by store at a ZIP), PetSmart, Petco, iHerb, Chewy, Menards, Nordstrom, Nordstrom Rack, Best Buy, Macy's, Saks Fifth Avenue, Kohl's, JCPenney, Dick's Sporting Goods, Foot Locker, Fanatics, Argos (UK, store stock by postcode), Media Expert (Poland, Omnibus 30-day low and store stock), Action (19 storefronts in 16 countries, weekly deals), HEMA (the Netherlands, Belgium, France, Germany; store stock per store), Carrefour, Allegro, bol.com (the Netherlands and Belgium), Trendyol (Turkey plus 34 international storefronts), H&M (47 countries), Zara (102 storefronts), Uniqlo (41 markets), ASOS (235 countries), Fashion Nova (104 countries), Mercado Libre, eBay, Target, Home Depot (US and Home Depot Canada: prices and exact units per store), TikTok Shop
- **Trading cards** — TCGplayer (Pokemon, Magic: The Gathering, Yu-Gi-Oh!, One Piece, Lorcana and 60+ more games)
- **Video games** — Nintendo eShop (one game's price, sale price and sale end date in 46 countries, deals, releases and DLC)
- **Second-hand marketplaces and classifieds** — Vinted (27 country sites, local currency and language), Mercari (US and Japan, sold prices), Depop (9 storefronts, shop sold prices), Poshmark (US and Canada, sold prices, closets), OfferUp (US local listings around a ZIP, asking prices by city, cars and trucks), thredUP (US store, estimated retail, sold listings), OLX (7 OLX Europe sites)
- **Liquidation auctions** — Nellis Auction (open lots in 6 US shopping locations with the current bid and Nellis's own Estimated Retail Price, a sold lot's final price by id, bid history without bidder names)
- **Real estate and travel** — Zillow, Redfin, Realtor.com, Rightmove, Booking, Airbnb, Tripadvisor
- **Reviews and local** — Trustpilot, Yelp, G2, Capterra, Glassdoor, App Store, Google Play
- **Jobs and companies** — Indeed, Glassdoor, SEC EDGAR, Companies House, Company Enrich (contacts and owner from a website or a Google Maps place)
- **Ads transparency** — Google Ads Transparency Center, Meta Ad Library
- **Social and video** — YouTube, TikTok, Instagram, Threads, X, LinkedIn, Reddit, Kuaishou
- **Any other page** — `extract()` turns a URL into Markdown, plain text or raw HTML
- **Whole websites** — `extract.map()` lists a site's URLs, `extract.crawl()` crawls a site, `extract.batch()` extracts a list of URLs in one job

## Install

```bash
npm install scavio
```

## Sign in without copying a key

```bash
npx -y scavio@latest login
```

Prints a link and a code and opens your browser. Sign in at dashboard.scavio.dev
(or create a free account, 50 credits, no card), check that the page shows the
same code, and click Approve. The CLI saves an API key named after your machine
(`CLI - <hostname>`) and never prints it:

- `~/.config/scavio/credentials.json` (owner-only), and
- `SCAVIO_API_KEY` in your shell startup file (`~/.zshrc` or `$ZDOTDIR/.zshrc`, `~/.bashrc` and on
  macOS `~/.bash_profile`, fish `conf.d/scavio.fish`, or the Windows user
  environment). Skip this with `--no-profile`.

Logging in again on the same machine reuses that machine's key. A program
cannot set variables in the shell that started it, so run `source ~/.zshrc`
(or your shell's file) or open a new terminal to use the key right away, and
restart any AI agent that was already running. `new Scavio()` reads
`SCAVIO_API_KEY`.

AI coding agents (Claude Code, Codex, Pi, Cursor and others) can run it for you.
When its output is not a terminal, `login` prints the link and exits at once so
the agent can show it to you; the agent then runs `login --wait`, which waits up
to 60 seconds per run.

| Command | What it does |
|---|---|
| `scavio login` | Start a login (in a terminal it also waits for approval) |
| `scavio login --wait` | Finish a login an agent started. Exit 0 logged in, 2 still pending (run again), 3 denied, 1 expired or error |
| `scavio status` | Check the saved or exported key works, without printing it |
| `scavio logout` | Remove the saved key and the shell line (revoke it at dashboard.scavio.dev/api-keys) |

Options: `--force` (log in even if `SCAVIO_API_KEY` already works),
`--no-profile`, `--no-browser`, `--timeout <seconds>` for `--wait`.

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

// Local rank tracking: web_only returns Google's Web results (organic only,
// ranked for location). The standard page localizes only the local pack; call
// again without web_only when you also need local_results.
await client.google.search({
  query: "emergency plumber",
  location: "Austin,Texas,United States",
  web_only: true,
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
parser tracks which brands each assistant recommends. ChatGPT costs 2 credits and
Gemini 5 credits per answered prompt; a failed prompt is not charged. Answers take 10-40 seconds, so both
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

### Lowe's, Sam's Club, Canadian Tire and Dollar General

Four store-level retailers, new in 0.31.0. Each call answers for ONE store you
choose: get its number from the locator (`lowes.stores`, `samsClub.clubs`,
`canadianTire.stores`, `dollarGeneral.stores`) and pass it on every call.

```typescript
// Lowe's: store_id AND that store's own ZIP are required on search/product.
const lowesStores = await client.lowes.stores({ zip: "28117", limit: 1 });
const store = (lowesStores.data as any).stores[0];
const sid = store.store_id;                  // "0595"
const zip = store.address.postal_code;       // "28117"
await client.lowes.search({ query: "cordless drill", store_id: sid, zip });
await client.lowes.search({ query: "cordless drill", store_id: sid, zip, on_sale: true }); // that store's deals
await client.lowes.product({ item_id: "5016412045", store_id: sid, zip }); // stock, aisle_locations, nearby stores
await client.lowes.reviews({ item_id: "5016412045", sort: "most_helpful" });

// Sam's Club: search, savings and category answer for a club picked by
// location (echoed in data.club). product({ club_id }) targets one club.
await client.samsClub.clubs({ zip: "75201", limit: 5 });
await client.samsClub.search({ query: "paper towels", sort: "price_low" });
await client.samsClub.product({ item_id: "15325822107", club_id: "6372" }); // club_price, in_stock_at_club
await client.samsClub.savings({ sort: "top_selling" });   // Instant Savings
await client.samsClub.category({ category_id: "1150109" }); // clearance
await client.samsClub.reviews({ item_id: "15325822107", sort: "lowest" });

// Canadian Tire: prices in CAD, per store and province.
await client.canadianTire.stores({ postal_code: "M5V 2T6", sku: "0438858" }); // + quantity and aisle per store
await client.canadianTire.search({ query: "dewalt drill", store_id: "600" });
await client.canadianTire.product({ product_code: "0547273P", store_id: "600" });
await client.canadianTire.availability({ store_id: "600", skus: ["0438858", "0547273"] }); // up to 50
await client.canadianTire.clearance({ store_id: "600" }); // in-stock only by default
await client.canadianTire.deals({ store_id: "600", type: "sale" }); // or instant_rebate, special_buy, loyalty

// Dollar General: one stores() call with a upc gives that product's unit
// count at up to 25 nearby stores.
await client.dollarGeneral.stores({ zip: "75203", upc: "030772156629" });
await client.dollarGeneral.search({ query: "paper towels", store_id: "12629", in_stock_only: true });
await client.dollarGeneral.product({ upc: "030772156629", store_id: "12629" });
await client.dollarGeneral.deals({ store_id: "12629", type: "clearance" }); // or on_sale
await client.dollarGeneral.coupons();
```

Lowe's `search`, `product` and `stores` cost 2 credits and `reviews` 1; Sam's
Club `clubs` costs 1 and every other Sam's Club call 2; every Canadian Tire and
Dollar General call costs 1. Sam's Club caps
`available_quantity` at 8 (8 means 8 or more). Dollar General clearance items
carry the current price only, with no was-price. Canadian Tire and Dollar
General return a rating and review count but no review text.

### Sephora, Ulta Beauty, ALDI, Micro Center, Walgreens and CVS

Six US retailers, new in 0.32.0. Where prices or stock are per store, pass the
store number on the call (`aldi.stores`, `microCenter.stores`,
`walgreens.stores`; CVS has no locator).

```typescript
// Sephora: 60 products per page. product() takes a result's url (faster)
// or its product_id, and returns a review summary with pro and con
// sentiment counts - no review text.
await client.sephora.search({ query: "lipstick", sort: "best_selling", zip: "10001" }); // + same_day_eligible
await client.sephora.category({ category: "lipstick" });
await client.sephora.product({ product_id: "P510799" });

// Ulta Beauty: stores() is in stock / out of stock for one shade or size at
// the 10 stores nearest a ZIP (no unit counts).
await client.ulta.search({ query: "lipstick" });
await client.ulta.category({ category: "/shop/makeup/lips/lipstick" });
await client.ulta.product({ url: "https://www.ulta.com/p/serum-lipstick-pimprod2057119", sku: "2648428" });
await client.ulta.stores({ product_id: "pimprod2057119", sku_id: "2648428", zip: "10001" });

// ALDI: prices are per store AND per service_type - instore (default, the
// shelf price), pickup or delivery (online prices, often higher).
await client.aldi.stores({ zip: "33131" });
await client.aldi.search({ query: "milk", store_id: "151248", service_type: "pickup" });
await client.aldi.product({ product_id: "16902710", store_id: "151248" });

// Micro Center: stock is per 3-digit store_id (web store 029 when omitted);
// counts are capped at 25+ (quantity_capped).
await client.microCenter.stores({ state: "TX" });
await client.microCenter.search({ query: "rtx 5070", store_id: "131" });
await client.microCenter.product({ product_id: "691231", store_id: "131" }); // open-box units, stores_in_stock

// Walgreens: prices are national; stock() checks up to 20 stores per call.
const wg = await client.walgreens.stores({ zip: "60614" });
const storeNumber = (wg.data as any).stores[0].store_number; // "15350"
await client.walgreens.search({ query: "shampoo", store_id: storeNumber });
await client.walgreens.product({ product_id: "300452904" });
await client.walgreens.stock({ product_id: "300452904", store_ids: [storeNumber] });

// CVS: no store locator - the store number is on every cvs.com store page
// ("Store ID: #7019"). search() defaults to store 7019 (New York).
await client.cvs.search({ query: "toothpaste", store_id: "7019" });
await client.cvs.product({ product_id: "832677" });
await client.cvs.stock({ sku_ids: ["832677"], store_id: "7019" });
```

Sephora `search` and `category`, Ulta Beauty, ALDI and CVS calls cost 1 credit
each; Sephora `product` costs 2. Micro Center
`search` and `product` cost 2 and `stores` 1. Walgreens `search`, `product` and
`stores` cost 2 and `stock` 4. CVS `product` can take 10-30+ seconds, so it
raises the request timeout to `CVS_PRODUCT_TIMEOUT` (120s) when the client's is
shorter; it never lowers it.

### Whole Foods, Harbor Freight, PetSmart, Petco, iHerb, Chewy and Menards

Seven US retailers, new in 0.33.0. Store-level prices or stock take a store
number from that retailer's locator (`wholeFoods.stores`,
`harborFreight.stores`, `petsmart.stores`, `petco.stores`, `menards.stores`);
iHerb and Chewy are online only.

```typescript
// Whole Foods: prices are per store (5-digit store_id, default 10145 Austin):
// regular_price, sale_price and prime_price. No ratings, reviews, UPCs or
// per-store unit stock. search() sorts by relevance, price_asc or price_desc.
const wf = await client.wholeFoods.stores({ zip: "10019" });
const wfStore = (wf.data as any).stores[0].store_id; // "10160"
await client.wholeFoods.search({ query: "milk", store_id: wfStore, on_sale: true });
await client.wholeFoods.category({ category: "cheese", store_id: wfStore, sort: "popular" });
await client.wholeFoods.deals({ store_id: wfStore });
await client.wholeFoods.product({ asin: "B078WVT2BC", store_id: wfStore }); // in_store and online prices, separately
await client.wholeFoods.store({ store_id: wfStore });
await client.wholeFoods.salesFlyer({ store_id: wfStore });

// Harbor Freight: national prices with sale and end date, public coupon,
// Inside Track member price and compare_at. availability() is a stock status
// per store (in_stock, limited, out_of_stock, not_carried) plus aisle, from
// a daily snapshot - no unit counts.
await client.harborFreight.search({ query: "cordless drill", sort: "member_price_low" });
await client.harborFreight.clearance({ query: "drill" });
await client.harborFreight.product({ sku: "73216" });
await client.harborFreight.prices({ skus: ["73216", "59716", "64508"] }); // up to 50
await client.harborFreight.stores({ query: "60601" });
await client.harborFreight.availability({ skus: ["73216"], zip: "90012" });
await client.harborFreight.reviews({ sku: "73216", limit: 10 });

// PetSmart: national price plus Autoship first-order and recurring price;
// stock is a unit count per store.
await client.petsmart.search({ query: "dog food", store_id: "1658" }); // in stock at that store only
await client.petsmart.product({ web_style_id: "36648" });
await client.petsmart.stores({ zip: "60601", sku: "5252900" }); // + quantity per store
await client.petsmart.storeStock({ store_id: "1658", skus: ["5252900"] });
await client.petsmart.availability({ pairs: [{ store_id: "1658", sku: "5252900" }] });
await client.petsmart.deals({ pet: "dog" }); // on_sale marks real price cuts

// Petco: national price plus Repeat Delivery (autoship) price. storeInventory()
// takes cat_entry_id (from search or product), not the part number.
await client.petco.search({ query: "dog food", sort: "price" });
await client.petco.category({ path: "dog/dog-food/dry-dog-food" });
await client.petco.product({ part_number: "3748364" });
const pc = await client.petco.stores({ zip: "10001" });
const pcStore = (pc.data as any).stores[0].store_id;
await client.petco.storeInventory({ cat_entry_ids: ["6131012"], store_id: pcStore });

// iHerb: online only, US store, USD. reviews() is the rating summary,
// histogram and top positive and critical review - not a full list.
await client.iherb.search({ query: "vitamin d", sort: "best_selling" });
await client.iherb.product({ product_id: "70316" });
await client.iherb.prices({ product_ids: ["62118", "70316", "77548"] }); // up to 50
await client.iherb.reviews({ product_id: "70316" });

// Chewy: one-time, Autoship and first-Autoship prices, MAP fields, ratings.
// A broad query can land on a category; data.redirect then names it.
await client.chewy.search({ query: "kong classic dog toy" });
await client.chewy.product({ product_id: "38485" });

// Menards: search one store (store_id required), then product() by item id or
// URL. Mail-in rebates and the final price after rebates; store_id adds stock.
await client.menards.stores({ zip: "55401" });
await client.menards.search({ query: "sledge hammer", store_id: "3181", sort: "price_asc" });
await client.menards.product({ item_id: "60893666613", store_id: "3181" });
```

Whole Foods, Harbor Freight, PetSmart and Petco calls cost 1 credit each.
iHerb calls cost 2 and Chewy calls 10. Menards `search` costs 2, `stores` 1 and
`product` 1, or 2 with a `store_id`. Petco calls can take 10-30 seconds, so every Petco
call raises the request timeout to `PETCO_SLOW_TIMEOUT` (120s); iHerb `search`
and `product` can take 10-25 seconds, so they raise it to `IHERB_SLOW_TIMEOUT`
(120s); Menards `product` with a store can take 10-40 seconds, so it raises it
to `MENARDS_PRODUCT_TIMEOUT` (120s). None ever lowers a longer client timeout.

### [Nordstrom](https://scavio.dev/docs/nordstrom-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Eight endpoints, nordstrom.com (US site only). `search` and `product` are new in
0.35.0; `category`, `brand`, `stores`, `availability` and `suggestions` are new
in 0.36.0; `reviews` is new in 0.37.0. `availability` costs 10 credits (the
product page plus the store lookup) and `reviews` 10; every other call costs 5.

- `search`, `category` and `brand` return 24 products a page with current and
  original price ranges, percent off, on-sale flag, rating, review count,
  badges and colors; `sort` is `relevance` (default), `rating`, `price_high`,
  `price_low`, `newest` or `percent_off`. `category` takes a `/browse` path or
  URL (departments, `sale/women`, `/browse/new`); `brand` takes a
  `/brands/<slug>--<id>` path or URL (a product's `brand_url` works). Both also
  return the category or brand (name, title, path, URL, breadcrumbs,
  subcategories) and the filter sidebar with option counts (top 100 options per
  group); filters inside a category URL are ignored.
- `product` takes a result's `url` or `style_id` and lists every color and size
  as a sku with UPC, price, price type, `in_stock` and the `quantity` available
  to ship. `in_stock` is true when the sku can be shipped or picked up in a
  store, so a sku can be in stock with `quantity` 0 (store-only).
- `reviews` takes `url` or `style_id` and returns the product's full review
  history, up to `max_reviews` per call (1-200, default 60). `sort` is
  `most_helpful` (default), `most_recent`, `highest_rated` or `lowest_rated`;
  filter with `stars` (e.g. `[1, 2]`), `verified_only`, `with_photos` or a text
  `search` (`search` cannot be combined with `sort`). The response carries the
  `summary` (average rating, total reviews, histogram, size and width rating,
  praised and criticized features with a quote, rating-only count), the
  `ai_summary`, `total_results`, `returned` and `has_more`. Rating-only reviews
  are included with `title` and `text` null.
- `availability` takes `url` or `style_id` (optionally `sku_id`) and returns per
  sku `ship_quantity`, `pickup_available`, `pick_quantity` and the stores that
  can do in-store pickup. Quantities are chain-wide; per store Nordstrom only
  says whether pickup is available, not how many.
- `stores` takes exactly one of `zip`, `latitude` + `longitude`, or
  `store_numbers` (array or comma-separated string), with `distance_miles`
  1-100 (default 100). Each store has address, phone, hours, daily hours,
  coordinates, pickup and curbside flags and amenities. A ZIP with no store in
  range is an empty list (still billed).
- `suggestions` returns the site's autocomplete strings for a partial `query`
  (`limit` 1-20, default 8).

```ts
const found = await client.nordstrom.search({ query: "dress", sort: "percent_off" });
const top = (found as any).data.products[0];
console.log(top.style_id, top.brand, top.name, top.price, top.percent_off);

const item = await client.nordstrom.product({ style_id: top.style_id });
for (const color of (item as any).data.colors) {
  for (const sku of color.skus) console.log(color.name, sku.size, sku.upc, sku.price, sku.price_type, sku.quantity);
}

const dresses = await client.nordstrom.category({ category: "/browse/women/clothing/dresses", sort: "price_low" });
const label = await client.nordstrom.brand({ brand: "/brands/astr-the-label--53360" });
const near = await client.nordstrom.stores({ zip: "10001" });

const stock = await client.nordstrom.availability({ style_id: "7737947" });
for (const sku of (stock as any).data.skus) {
  console.log(sku.sku_id, sku.size, sku.color, sku.ship_quantity, sku.pick_quantity, sku.pickup_store_count);
}

const ideas = await client.nordstrom.suggestions({ query: "nike air" });
console.log((ideas as any).data.suggestions);

const rev = (await client.nordstrom.reviews({ style_id: "7737947", sort: "most_recent", max_reviews: 100 })) as any;
const { summary } = rev.data;
console.log(summary.average_rating, summary.total_reviews, summary.ratings_histogram, summary.size_rating);
console.log(rev.data.total_results, rev.data.returned, rev.data.has_more, rev.data.ai_summary);
for (const r of rev.data.reviews.slice(0, 5)) {
  console.log(r.date, r.rating, r.title, r.text, r.size_purchased, r.helpful_votes, r.badges, r.photos.length);
}
const critical = await client.nordstrom.reviews({ style_id: "7737947", stars: [1, 2], verified_only: true });
```

`product` returns the reviews shown on the product page (up to about 13) plus
the total review count and star histogram; `reviews` returns the rest. An
unknown style id, sku id, category or brand is a 404. Every call raises the
request timeout to `NORDSTROM_TIMEOUT` (120s), except `reviews`, which takes
20-60s (up to about 100s at 200 reviews) and raises it to
`NORDSTROM_REVIEWS_TIMEOUT` (150s). Neither ever lowers a longer client timeout.
If the upstream page still fails after the API's own retries, the call is an
unbilled 502. For nordstromrack.com use `client.nordstromRack` (next section).

### [Nordstrom Rack](https://scavio.dev/docs/nordstromrack-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Eight endpoints, new in 0.38.0, nordstromrack.com (US site only), on
`client.nordstromRack`: a separate platform from `client.nordstrom` with the
same methods, options and credit costs (`availability` and `reviews` 10, the
rest 5).

- `category` takes Rack's `/shop` and `/clearance` paths: departments, deals,
  new arrivals, Clear the Rack (`/clearance`, `/clearance/women/clothing`) and
  flash events (`/shop/flash` lists the live events as subcategories,
  `/shop/flash/event-7` opens one). There is no `/browse` on Rack.
- `brand` takes `/brands/<slug>` (`/brands/adidas`); Rack brand pages carry no
  id, so the nordstrom.com `--<id>` form is a 404.
- Every product row carries `clearance_price_range`, and during Clear the Rack
  a clearance item can carry an extra percent off on top:
  `promotion_price_range` is the price after it and `promotion_percent_off`
  the extra percent. All three are null when not set; no response carries
  event start or end dates.
- `stores` and `availability` cover Rack stores only; pickup quantities are
  chain-wide.
- `reviews` returns Rack's own review pool, separate from nordstrom.com's, so
  the same style can show a different rating and review count on each.

```ts
const clr = (await client.nordstromRack.category({ category: "/clearance/women", sort: "percent_off" })) as any;
for (const p of clr.data.products.slice(0, 5)) {
  console.log(p.style_id, p.name, p.price, p.clearance_price_range, p.promotion_price_range, p.promotion_percent_off);
}

const events = (await client.nordstromRack.category({ category: "/shop/flash" })) as any;
console.log(events.data.category.subcategories.map((e: any) => e.path));

const item = await client.nordstromRack.product({ style_id: "8816500" });
const brand = await client.nordstromRack.brand({ brand: "/brands/adidas" });
const stock = await client.nordstromRack.availability({ style_id: "7737947" });
const near = await client.nordstromRack.stores({ zip: "10001" });
const rev = await client.nordstromRack.reviews({ style_id: "7737947", max_reviews: 50 });
```

Every call raises the request timeout to `NORDSTROM_RACK_TIMEOUT` (120s),
except `reviews`, which takes 15-60s (up to about 100s at 200 reviews) and
raises it to `NORDSTROM_RACK_REVIEWS_TIMEOUT` (150s). Neither ever lowers a
longer client timeout.

### [Best Buy](https://scavio.dev/docs/bestbuy-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Nine endpoints, new in 0.40.0, bestbuy.com (US site only), on
`client.bestBuy`: `search`, `product`, `reviews`, `category`, `deals`,
`stores`, `availability`, `suggestions`, `prices`. Credits: `search`,
`product`, `reviews` and `prices` 2 each (`prices` is per call, up to 15
SKUs); `category` 2 for an `abcat` id and 3 for a `pcmcat` page; `deals` 3;
`stores` and `suggestions` 1; `availability` 2 flat for up to 8 stores.

- `search` and `category` return 18 organic products per page; sponsored
  tiles only with `include_sponsored: true`. `filters` takes `brand`,
  `on_sale`, `clearance`, `open_box`, and `min_price` with `max_price` (both
  bounds).
- `product` returns every open-box offer by condition (fair, good,
  excellent) with `savings_vs_new` and `savings_vs_regular`, plus UPC, model,
  the full spec table and the AI review summary.
- `availability` is store pickup status at up to 8 stores (nearest a `zip`,
  or the `store_ids` you pass; exactly one of the two): `in_stock`,
  `limited`, `ship_to_store`, `out_of_stock`, `not_available_for_pickup` or
  `unknown`. `quantity` is set only for `limited` (Best Buy's "only N left")
  and is null for `in_stock`.
- `prices` takes up to 15 SKUs; an unknown one comes back `found: false`.

```ts
const found = (await client.bestBuy.search({ query: "tv", filters: { brand: "Samsung", on_sale: true } })) as any;
for (const p of found.data.products.slice(0, 5)) {
  console.log(p.sku, p.model, p.price, p.regular_price, p.savings_percent, p.badge);
}

const item = (await client.bestBuy.product({ sku: "6607832" })) as any;
for (const ob of item.data.open_box) console.log(ob.condition, ob.price, ob.savings_vs_new, ob.savings_vs_regular);

const stock = (await client.bestBuy.availability({ sku: "6607832", zip: "94103", max_stores: 5 })) as any;
for (const s of stock.data.stores) console.log(s.store_id, s.name, s.status, s.quantity, s.pickup_date);

const prices = await client.bestBuy.prices({ skus: ["6607832", "6673112", "6679316"] });
const deals = await client.bestBuy.deals();
const rev = await client.bestBuy.reviews({ sku: "6607832", sort: "newest" });
const tvs = await client.bestBuy.category({ category_id: "abcat0101001", sort: "price_low" });
const near = await client.bestBuy.stores({ zip: "94103" });
const terms = await client.bestBuy.suggestions({ query: "ps5 con" });
```

Every call raises the request timeout to `BEST_BUY_TIMEOUT` (120s) and never
lowers a longer client timeout; `availability` typically takes 5-20s. An
unknown SKU or category is a 404.

### [TCGplayer](https://scavio.dev/docs/tcgplayer-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Thirteen endpoints, new in 0.41.0, tcgplayer.com (US marketplace, USD), 1
credit each, on `client.tcgplayer`: `search`, `product`, `listings`,
`priceHistory`, `sales`, `games`, `sets`, `priceGuide`, `suggestions`,
`trending`, `seller`, `sellerFeedback`, `sellerProducts`. Every game
TCGplayer lists (Pokemon, Magic: The Gathering, Yu-Gi-Oh!, One Piece, Lorcana
and 60+ more).

- `product`, `listings`, `priceHistory` and `sales` take `product_id` or a
  tcgplayer.com `/product/<id>/` `url`. `search` needs a `query` unless
  `game` or `set` is given.
- `product` returns the market price per SKU (condition x printing x
  language, e.g. Near Mint / Normal / English) with `lowest_sale_price`,
  `highest_sale_price` and `sale_count`: recent SALE statistics, not live
  listings. Use `listings` for live offers (up to 50 per page).
- `priceHistory` covers up to a year per SKU (`month`, `quarter` default,
  `semi_annual`, `annual`); `low_sale_price` and `high_sale_price` are null in
  a bucket with no sales. `sales` returns only the 5 most recent sales.
- `priceGuide` is a whole set's price table, cards or sealed, up to 500 rows
  per page; take the `set_id` from `sets`.
- Seller methods take the 8-character `seller.key` from a listing.

```ts
const found = (await client.tcgplayer.search({ query: "charizard", game: "pokemon", sort: "price_desc" })) as any;
for (const p of found.data.products.slice(0, 5)) console.log(p.product_id, p.name, p.set_name, p.market_price);

const card = (await client.tcgplayer.product({ product_id: 219058 })) as any;
for (const s of card.data.skus) {
  console.log(s.condition, s.printing, s.language, s.market_price, s.lowest_sale_price, s.highest_sale_price, s.sale_count);
}

const offers = (await client.tcgplayer.listings({ product_id: 219058, condition: ["Near Mint"] })) as any;
for (const l of offers.data.listings) console.log(l.price, l.shipping_price, l.seller.name, l.seller.rating_percent);

const hist = (await client.tcgplayer.priceHistory({ product_id: 219058, range: "month" })) as any;
console.log(hist.data.totals.quantity_sold, hist.data.skus[0].buckets[0]);

const sales = await client.tcgplayer.sales({ product_id: 219058 });
const games = await client.tcgplayer.games();
const sets = await client.tcgplayer.sets({ game: "pokemon" });
const guide = await client.tcgplayer.priceGuide({ set_id: 604, limit: 500 });
const terms = await client.tcgplayer.suggestions({ query: "charizard" });
const hot = await client.tcgplayer.trending({ game: "pokemon" });
const seller = await client.tcgplayer.seller({ seller_key: "58f7acae" });
const feedback = await client.tcgplayer.sellerFeedback({ seller_key: "58f7acae", rating: 1 });
const stock = await client.tcgplayer.sellerProducts({ seller_key: "58f7acae", game: "pokemon" });
```

Every call raises the request timeout to `TCGPLAYER_TIMEOUT` (120s) and never
lowers a longer client timeout. An unknown product id, game, set or seller key
is a 404. No store locator, product reviews or buylist prices.

### [Nintendo](https://scavio.dev/docs/nintendo-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

The Nintendo eShop and My Nintendo Store in 46 countries. Six endpoints on
`client.nintendo` (new in 0.62.0), 1 credit each: `search`, `product`,
`prices`, `deals`, `releases` and `dlc`.

- Markets (`country`, default `us`) and languages (`language`, default the
  market's first): Americas us (USD), ca (CAD; en or fr), mx (MXN; es), br
  (BRL; pt), ar (ARS), cl (CLP), co (COP) and pe (PEN) (es); Europe in the
  market's language: gb (GBP) and ie (EUR) (en), de and at (EUR; de), ch
  (CHF; de, fr or it), fr, be (fr or nl), nl, lu (fr), it, es and pt (EUR), au
  (AUD), nz (NZD) and za (ZAR) (en); pl (PLN), cz (CZK), se (SEK), no (NOK),
  dk (DKK), fi, sk, hu, ro, bg, gr, hr, si, ee, lv, lt, mt and cy (EUR) read
  the English European catalog with that country's own prices; jp (JPY; ja).
  `prices` also serves kr (KRW), hk (HKD), tw (TWD) and il (EUR, European
  item ids). ph (no Philippines item ids published yet), ru (no eShop), uk
  (use gb) and countries with no eShop data answer 400.
- Item ids (`nsuid`) are per eShop region: Americas, Europe (EU / EFTA, GB,
  AU, NZ, ZA, IL), Japan, Korea, and Hong Kong + Taiwan (Taiwan uses Hong
  Kong ids). An id from one region is `not_found` in another and there is no
  cross-region title mapping: look the game up with `search` or `product` in
  that region, then call `prices` for any country of the region (up to 50
  ids). Americas search tiles carry a `slug` and no `nsuid`: read the product
  with the slug.
- Prices are always the requested country's eShop price in its currency;
  `sale_start` and `sale_end` are the eShop's own sale window. Nintendo shows
  no price history or historical low: poll `prices` to build one.
- Americas `deals` are Nintendo's featured sale pages, not every discounted
  game (check any id with `prices`); Europe and Japan `deals` are every game
  on sale.
- Americas `search` sorts by relevance or newest only and takes no filters;
  the Americas `releases` lists are one page. An unsupported sort or filter
  answers 400, never silently dropped.
- No user reviews (Nintendo's stores have none; age ratings only), no
  best-seller charts and no autocomplete.

```typescript
// One game's price, sale price and sale end in each Americas eShop country.
for (const country of ["us", "ca", "mx", "br"] as const) {
  const r = (await client.nintendo.prices({ ids: ["70010000095431"], country })) as any;
  const p = r.data.prices[0];
  console.log(country, p.currency, p.price, p.regular_price, p.sale_price, p.sale_end);
}

// A product by nsuid; Americas search tiles carry a slug instead.
const prod = (await client.nintendo.product({ nsuid: "70010000095431" })) as any;
console.log(prod.data.product.title, prod.data.product.platform, prod.data.product.price);

// Europe search with an nsuid per item, Americas deals with their sale pages, and a game's DLC.
const gb = (await client.nintendo.search({ query: "mario", country: "gb", sort: "price_asc" })) as any;
const deals = (await client.nintendo.deals({ sort: "ending_soon" })) as any;
const dlc = (await client.nintendo.dlc({ slug: "super-smash-bros-ultimate-switch" })) as any;
console.log(gb.data.total, deals.data.sales, dlc.data.game.title, dlc.data.count);
```

Every call raises the request timeout to `NINTENDO_TIMEOUT` (120s; Americas
searches take about 8 to 13s) and never lowers a longer client timeout;
failed calls are not charged, a not-found is charged.

### [H&M](https://scavio.dev/docs/hm-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

H&M in 47 countries. Nine endpoints on `client.hm` (new in 0.63.0):
`search`, `product` (2 credits), `stock`, `stores`, `category`, `deals`,
`newArrivals`, `suggestions` and `production` (1 credit each).

- Markets (`country`, default `us`) and languages (`language`, default the
  market's first): us (USD), ca (CAD; en or fr), mx (MXN; es), gb (GBP), ie
  (EUR), de and at (EUR; de), ch (CHF; de, fr or it), fr, be (nl or fr), nl,
  it, es, pt (EUR), se (SEK), fi (EUR; fi or sv), dk (DKK), no (NOK), pl
  (PLN), cz (CZK), sk (EUR), hu (HUF), ro (RON), bg (EUR), gr (EUR), rs
  (RSD), tr (TRY), ua (UAH), il (ILS; he), hk and mo (HKD; zh or en), tw
  (TWD; zh or en), jp (JPY), kr (KRW), in (INR), my (MYR), ph (PHP), sg
  (SGD), vn (VND), au (AUD), each in its own language; and hr, cy, ee, lv,
  lt, lu and si on H&M's shared English EUR store (answers say store `eu`).
- Every endpoint serves all 47 except `product` (not mo, tw or the shared EU
  store countries: use `search` or `stock` there) and `stores` (not mo: H&M
  lists no stores there). Countries where H&M runs a separate site (ae, eg,
  id, th, br, cn) or has no online store, ru, and uk (use gb) answer 400
  before anything is charged.
- Article codes are global: the same 10-digit code in every market, so one
  code compares a price across markets with one call per `country`.
- `price` is what a non-member pays now; `member_price` is H&M's member price
  as shown to signed-in members; `prior_price` is the earlier price H&M shows
  next to an EU markdown; `product` adds `price_disclosure` where H&M shows
  one.
- `stock` is online stock per size: H&M publishes no per-size store stock
  (`search` with `store` lists a store's assortment). `product` carries the
  rating and the latest reviews H&M shows (up to 10, with fit feedback): there
  is no full review list.
- Category ids are the same in every market (`ladies_dresses`, `men_jeans`,
  ...). H&M runs sales in seasons, so `deals` may return an empty grid
  between sales.
- No price history (poll to track changes), no checkout or member-only cart
  prices; H&M's sibling brands (COS, Weekday, & Other Stories, Monki, ARKET)
  are not covered.

```typescript
// One article's price in several markets: article codes are the same everywhere.
for (const country of ["gb", "ca", "ch", "pl", "se"] as const) {
  const p = ((await client.hm.product({ article_code: "1347936009", country })) as any).data;
  console.log(country, p.currency, p.price, p.regular_price, p.sale_price, p.member_price);
}

// Online stock by size (not store stock) for every colour of a product.
const st = ((await client.hm.stock({ article_code: "1310382004" })) as any).data;
console.log(st.sizes_in_stock, st.sizes_total, st.colors[0].sizes);

// Search, a category grid, the sale grid (may be empty between sales) and stores.
const res = (await client.hm.search({ query: "jeans", country: "de", language: "de", sort: "price_asc" })) as any;
const dresses = (await client.hm.category({ category: "ladies_dresses", country: "gb" })) as any;
const sale = (await client.hm.deals({ country: "gb", department: "men" })) as any;
const stores = (await client.hm.stores({ city: "New York" })) as any;
console.log(res.data.total, dresses.data.total, sale.data.total, stores.data.stores[0].store_code);

// Where an article is made, as H&M publishes it.
const made = (await client.hm.production({ article_code: "1310382004" })) as any;
console.log(made.data.production_countries, made.data.countries[0].suppliers[0].name);
```

Every call raises the request timeout to `HM_TIMEOUT` (120s; `product` can
take up to about a minute) and never lowers a longer client timeout; failed
calls are not charged, a not-found is charged.

### [Zara](https://scavio.dev/docs/zara-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Zara in 102 storefronts. Twelve endpoints on `client.zara` (new in 0.64.0):
`search`, `product`, `materials`, `stock`, `stores`, `storeStock`,
`categories`, `category`, `deals`, `newArrivals`, `prices` and
`suggestions`.

- Credits are what each request spent (`credits_used` in the response): 2
  per call for `search`, `materials`, `stock`, `stores`, `categories` and
  `category`; `product` 2 (4 by `reference` or when the slug is another
  market's or language's, 6 for both); `storeStock` 2 with `store_ids`, 4
  with `lat` + `lng`; `deals` 4 (2 when the market has no special-prices
  category); `newArrivals` 4; `prices` 2 per market that answered;
  `suggestions` 2 (4 when the English fallback runs). China (`cn`, Zara's
  separate site) costs 1 credit per call instead of 2.
- Markets (`country`, default `us`; `gb` for the United Kingdom): the 102
  Zara storefronts with an online store of their own, each in its own
  currency and Zara's own languages (`language`, default the first Zara
  lists; 205 market-languages), e.g. us (USD; en, es), ca (CAD; en, fr), mx,
  br, gb, the euro countries, ch (CHF; en, fr, de, it), pl, tr, il, ae, sa,
  eg, ma, in, jp (JPY), kr (KRW), cn (CNY), hk, mo and tw (zh-Hant, en), sg,
  th, vn, au, nz, za and the rest of Latin America and Europe Zara sells
  online in. The `ZaraCountry` type lists all 102.
- Every endpoint serves all 102 except `stores` and `storeStock` (not ao or
  iq: Zara lists no stores there), `newArrivals` (not dz) and `suggestions`
  (not ad, al, am, az, ba, dz, mk, mo, uz or xk). Belarus, uk (use gb) and the
  countries Zara serves only from its worldwide store answer 400 before
  anything is charged.
- References are global on Zara's international site, so `prices` compares
  one reference across up to 10 markets in one call. A colour's product id
  is usually the same across markets but can differ, and `cn` runs its own
  ids, so match across markets with the reference.
  Prices are numbers in the market's own currency, never converted;
  `old_price` is set only on a markdown.
- `stock` is online stock per size; `storeStock` is units per size in
  physical stores (sales floor and stockroom). `materials` gives composition,
  care and the country of production as Zara states it.
- Zara runs seasonal sales and lists special prices between them: `deals`
  finds each market's special-prices list live and answers an empty list (not
  an error) where a market has none for the section. Category ids are shared
  across the northern-hemisphere catalogue; au, za and br run their own.
- No reviews (Zara shows none), no price history (poll `prices`); Inditex's
  other brands (Pull&Bear, Massimo Dutti, Bershka, Stradivarius, Oysho, Zara
  Home, Lefties) are not covered.

```typescript
// Zara prices by country: one reference in up to 10 markets, each in its own currency.
const p = (await client.zara.prices({ reference: "4591/381", countries: ["us", "gb", "es", "jp", "mx"] })) as any;
for (const m of p.data.markets) console.log(m.country, m.currency, m.price, m.old_price, m.title);

// Search, then the product page (product_id + seo_slug) and online stock by size.
const res = (await client.zara.search({ query: "blazer" })) as any;
const item = res.data.items[0];
const prod = (await client.zara.product({ product_id: item.product_id, slug: item.seo_slug })) as any;
const st = (await client.zara.stock({ product_id: "588478514" })) as any;
console.log(prod.data.colors[0].sizes, st.data.sizes_in_stock, st.data.sizes_total);

// Stores near a point, then units per size in those stores.
const stores = (await client.zara.stores({ lat: 40.7128, lng: -74.006 })) as any;
const ids = stores.data.stores.slice(0, 8).map((s: any) => s.store_id);
const units = (await client.zara.storeStock({ product_id: "553306790", store_ids: ids })) as any;
console.log(units.data.stores_with_stock, units.data.stores_without_stock);

// The SPECIAL PRICES list (empty where a market has none) and new arrivals.
const deals = (await client.zara.deals({ section: "woman" })) as any;
const fresh = (await client.zara.newArrivals({ country: "gb", section: "woman" })) as any;
console.log(deals.data.total, fresh.data.total);
```

Every call raises the request timeout to `ZARA_TIMEOUT` (120s) and never
lowers a longer client timeout; failed calls are not charged, a not-found is
charged.

### [Uniqlo](https://scavio.dev/docs/uniqlo-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Uniqlo in 41 markets. Twelve endpoints on `client.uniqlo` (new in 0.68.0):
`search`, `product`, `stock`, `storeStock`, `stores`, `reviews`,
`suggestions`, `category`, `deals`, `newArrivals`, `categories` and
`prices`.

- 1 credit per call; `storeStock` 2 when resolved from `product_id` +
  `color` + `size` (1 with `l2_id`); `prices` 1 per market that answered (a
  market that does not sell the product answers too; failed markets are
  free).
- Markets (`country`, default `us`; `language`, default the local language):
  every endpoint on us (USD), jp (JPY), kr (KRW); `search` + `product` on
  Uniqlo's Greater China sites tw (TWD), hk (HKD), cn (CNY), in Chinese, with
  their own product codes; `product` + `prices` on au, be (nl, fr, en), ca
  (en, fr), de, dk, es, fr, gb (GBP; `uk` accepted), id, in, it, my, nl, ph,
  se, sg, th, vn and Uniqlo's EU store (EUR, English) for at, bg, cz, ee, fi,
  gr, hr, hu, ie, lt, lu, lv, pl, pt, ro, si and sk. The `UniqloProductCountry`
  type lists all 41.
- Countries with no Uniqlo online store (ch, no, nz, mx, tr, ae, il, ru), a
  market an endpoint does not serve and a language a market does not serve
  answer 400 before anything is charged.
- Product ids (`E479000-000`) are global on uniqlo.com, so `prices` compares
  one id across up to 10 markets in one call. Prices are numbers in the
  market's own currency, never converted. On us, jp, kr and ca (and on some
  items sg, my and in) Uniqlo marks a drop with flags only, so `promo_price`
  equals `price`; in Europe, Australia and most of Southeast Asia
  `promo_price` is below `price`. `on_sale`, `limited_offer` and
  `price_flags` carry the flags. Only a limited-time offer has a window:
  quote Uniqlo's own label in `price_flags.name` (e.g. "until 11/18"), not a
  date read from `end`; a sale flag carries a start but no end, and Select
  Colors/Sizes Only carries no dates.
- `price_group`: `product` and `prices` default to `"00"`, Uniqlo's regular
  price list. Search can list the same `product_id` a second time in price
  group `"01"`, mostly Uniqlo's Select Colors/Sizes Only sale price for some
  colours / sizes; pass `price_group: "01"` to `product` to read that price
  and the colours / sizes it covers. `prices` compares group `"00"` unless
  `price_group` is sent.
- `stock` is online stock per variant (Uniqlo caps the quantity it shows at
  11); `storeStock` is the status per store near a point (no unit counts).
  Send it the price group the variant came from (`price_group`, default
  `"00"`): a variant of price group 01 asked as 00 reads out of stock in
  every store.
- `reviews` carry rating, title, text, date, fit (1 tight to 5 loose, null
  when not given), purchased size and colour, and height, weight and age
  ranges; no reviewer names or locations. Review totals are pooled per region
  (the European markets share one pool).
- No price history (poll `prices` and store your own) and no store-level
  prices. GU is a separate brand and not a separate platform here; Uniqlo's
  own listings can include GU collaboration items (kr limited offers did).

```typescript
// Uniqlo prices by country: one product id in up to 10 markets, each in its own currency.
const p = (await client.uniqlo.prices({ product_id: "E479000-000" })) as any;
for (const m of p.data.markets) console.log(m.country, m.currency, m.price, m.promo_price, m.on_sale);
console.log("not sold in:", p.data.not_sold);

// On us, jp, kr and ca a sale or limited-time offer is a flag: promo_price equals price there.
const prod = (await client.uniqlo.product({ product_id: "E479000-000" })) as any;
console.log(prod.data.price, prod.data.promo_price, prod.data.limited_offer, prod.data.price_flags);

// Online stock per colour x size, then one variant in the stores near a point.
const st = (await client.uniqlo.stock({ product_id: "E479000-000" })) as any;
console.log(st.data.variants_in_stock, st.data.variants_total);
// Send the price group the variant came from (default "00").
const near = (await client.uniqlo.storeStock({ lat: 40.758, lng: -73.9855, l2_id: "08665900", price_group: "00" })) as any;
console.log(near.data.stores_with_stock, near.data.total_stores);

// Reviews with fit and the purchased size.
const rev = (await client.uniqlo.reviews({ product_id: "E479000-000", sort: "most_helpful" })) as any;
for (const r of rev.data.reviews) console.log(r.rating, r.fit, r.fit_label, r.purchased_size);

// Search, limited-time offers, and Greater China search with its own codes.
const res = (await client.uniqlo.search({ query: "heattech", sort: "price_asc" })) as any;
const offers = (await client.uniqlo.deals({ type: "limited_offer" })) as any;
const tw = (await client.uniqlo.search({ query: "牛仔褲", country: "tw" })) as any;
console.log(res.data.total, offers.data.total, tw.data.items[0].product_id);
```

Every call raises the request timeout to `UNIQLO_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls are not charged, a not-found is
charged.

### [ASOS](https://scavio.dev/docs/asos-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

ASOS in 235 countries. Eleven endpoints on `client.asos` (new in 0.65.0), 1
credit each: `search`, `product`, `stock`, `reviews`, `suggestions`,
`category`, `categories`, `brands`, `deals`, `newArrivals` and `markets`.

- Markets (`country`, default `gb`; `currency`, default ASOS's own default
  for the country): the 235 countries in ASOS's own country selector, served
  by 13 ASOS stores. Eleven have a site of their own in their own language:
  gb (GBP), us and pr (USD), fr and mc (EUR, French; the French overseas
  territories in USD), de and at (EUR, German), es and ad (EUR, Spanish), it,
  sm and va (EUR, Italian), au (AUD), dk (DKK), nl (EUR), pl (PLN) and se
  (SEK). ASOS's European store (33 countries, English) and its international
  store (170 countries, English) serve the rest. `currency` takes any
  currency ASOS offers the country (245 combinations, e.g. ae AED or GBP, il
  ILS, GBP or USD, jp USD or GBP); `markets` lists them, and the
  `AsosCountry` type lists all 235.
- Every endpoint serves every combination except `suggestions` on pl (ASOS's
  Polish store answers no suggestions). Russia and Belarus (ASOS is not
  selling there), uk (use gb) and countries ASOS does not list answer 400
  before anything is charged.
- Product and category ids are the same on every store (titles in the
  store's language). Countries served by the same ASOS store in the same
  currency share one price list, except Ireland, which has its own euro
  prices on ASOS's European store (measured 2026-11-16 on all 245
  country-currency combinations); which products are offered still differs by
  country. `price` is the lowest size price when ASOS prices sizes differently
  (variants carry each size's price). Prices come back as numbers in the requested currency, never
  converted: `price`, `previous_price` (ASOS's "was"), `rrp`,
  `lowest_price_30d` where ASOS shows it, `is_marked_down`, `is_outlet`,
  `discount_percent` and `discount_basis`.
- `stock` is online stock per variant for up to 100 product ids per call
  (ASOS has no physical stores) and carries variant ids, not size names:
  `product` carries the sizes.
- Which reviews come back depends on the store: gb, us, au and ASOS's
  European and international stores share one English review pool; es, it,
  nl, se, dk and pl add reviews written in their own language to that pool; fr
  and de show only reviews written in French or German (each review carries
  its language). Up to 50 per page, with fit and quality averages and ASOS's
  labelled AI summary; no reviewer names.
- Keyword search serves at most 2,088 results whatever `total` says
  (`max_reachable`); `category`, `deals` and `newArrivals` page through
  everything. The `search` brand filter takes brand facet ids from a search
  answer; `brands` returns category ids to pass to `category`.
- No outlet (ASOS's outlet categories are empty), no promo codes (shown only
  to signed-in shoppers), no price history (poll `stock`).

```typescript
// One product's price and online stock by size in several stores and currencies.
// import type { AsosCountry, AsosCurrency } from "scavio";
const stores: Array<{ country: AsosCountry; currency?: AsosCurrency }> = [
  { country: "gb" }, { country: "us" }, { country: "fr" }, { country: "ae", currency: "AED" },
];
for (const m of stores) {
  const p = (await client.asos.product({ product_id: "210309625", ...m })) as any;
  console.log(p.data.store, p.data.currency, p.data.price, p.data.previous_price, p.data.rrp);
  console.log(p.data.variants.map((v: any) => [v.size, v.in_stock, v.low_stock]));
}

// Price and online stock of up to 100 ids in one call (variant ids; product() has the sizes).
const st = (await client.asos.stock({ product_ids: ["205338218", "206956133", "209793673"], country: "de" })) as any;
console.log(st.data.products.map((x: any) => [x.product_id, x.price, x.in_stock]), st.data.not_found);

// Search, reviews and the SALE list.
const res = (await client.asos.search({ query: "jeans", sort: "price_asc", gender: "women" })) as any;
console.log(res.data.total, res.data.max_reachable, res.data.items[0]?.title);
const rv = (await client.asos.reviews({ product_id: "210309625", sort: "newest", page_size: 50 })) as any;
console.log(rv.data.summary.average, rv.data.ai_summary);
const sale = (await client.asos.deals({ country: "us", gender: "men" })) as any;
console.log(sale.data.total);
```

Every call raises the request timeout to `ASOS_TIMEOUT` (120s) and never
lowers a longer client timeout; failed calls are not charged, a not-found is
charged.

### [Fashion Nova](https://scavio.dev/docs/fashionnova-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Fashion Nova sale prices in 104 countries. Seven endpoints on
`client.fashionnova` (new in 0.72.0), 1 credit each: `search`, `product`,
`collection`, `categories`, `suggestions`, `reviews` and `similar`.

- Markets (`country`, default `us`): the 104 countries in Fashion Nova's own
  country selector, each in its own currency (37 currencies: us USD, ca CAD,
  gb GBP, au AUD, mx MXN, jp JPY, ae AED, the euro countries EUR ...; `zz` is
  the site's International storefront in USD). `language` is `en` (default)
  or `es` (Spanish titles, descriptions and attributes, in 67 countries; not
  the US store). A country or language Fashion Nova does not run answers 400
  before anything is charged. `categories` and `suggestions` are the same in
  every storefront, `reviews` is one pool per style (not per colour) shared by
  every market and mostly English (no `country`; `language` per review says
  which), and `similar` answers from the US store in USD.
- Prices are numbers in the storefront's currency, never converted: `price`
  (the lowest size price), `compare_at` (the site's struck-through price),
  `percent_off` (computed by Scavio: `round((1 - price / compare_at) * 100)`),
  `on_sale`, `price_with_code` (the price with Fashion Nova's current code as
  the page computes it, 40% off the compare-at price), `code_lowers_price`
  (`false` when that code price is not below `price`: the code does not lower
  it) and `final_sale`. In the 27 EEA countries (at, be, cy,
  cz, de, dk, ee, es, fi, fr, gr, hu, ie, is, it, lt, lu, lv, mt, nl, no, pl,
  pt, ro, se, si, sk) Fashion Nova shows VAT-inclusive prices and no
  compare-at price, so `compare_at` and `percent_off` are null there. The
  same jeans read on 2026-11-19: us 18 USD (compare-at 34.99, 49% off), ca 27
  CAD (51), gb 17 GBP (32), au 31 AUD (60), mx 338 MXN (656), fr 20.95 EUR
  (no compare-at).
- `sizes[].quantity` is the stock Fashion Nova's page shows per size, not a
  guaranteed inventory count.
- `search` is semantic and matched loosely: its `total` moves between calls,
  a later page can repeat a few items, and it shows its first 18 pages of 60
  (6 under a sort other than `featured`); narrow with filters. `collection`
  lists up to about 10,000 products (pages 1 to 166; dedupe by `product_id` +
  `color` across pages). A facet the list does not offer
  matches nothing and is listed in `unrecognized_filters` (present only
  then).
- `reviews`: 10 per page, pages 1 to 8, sorted `highest_rated` (default),
  `most_recent`, `most_helpful` or `lowest_rated`, `star` 1-5, totals as
  returned; reviewer names are never returned. `product` carries
  `site_ai_review_summary`, Fashion Nova's own AI summary of its reviews.
- Not available: stores (Fashion Nova lists none), a brand directory or brand
  filter (`brand` is the store's vendor field; collab and licensed brand names
  appear in titles), price history (poll and store the answers),
  gift cards, new-arrival dates.

```typescript
// Sale prices: price, compare-at price, percent off, final sale and sizes in stock.
const res = (await client.fashionnova.search({ query: "bodycon dress", sort: "best_selling" })) as any;
console.log(res.data.currency, res.data.total, res.data.total_pages);
console.log(res.data.items.slice(0, 3).map((i: any) => [i.title, i.price, i.compare_at, i.percent_off, i.final_sale, i.sizes_in_stock]));

// One style in one colour on the UK store: every size with its SKU, price and quantity.
const p = (await client.fashionnova.product({ handle: "san-diego-sculpting-stretch-flare-jeans", color: "black-wash", country: "gb" })) as any;
console.log(p.data.currency, p.data.price, p.data.compare_at, p.data.percent_off);
console.log(p.data.sizes.map((s: any) => [s.size, s.sku, s.quantity, s.low_stock]));

// The sale collection, page through to the end; reviews, newest first.
const sale = (await client.fashionnova.collection({ handle: "sale", country: "ca" })) as any;
console.log(sale.data.total, sale.data.total_pages, sale.data.has_more);
const rv = (await client.fashionnova.reviews({ handle: "san-diego-sculpting-stretch-flare-jeans", sort: "most_recent" })) as any;
console.log(rv.data.total, rv.data.reviews.map((r: any) => [r.rating, r.fit, r.size_purchased]));
```

Every call raises the request timeout to `FASHIONNOVA_TIMEOUT` (240s; review
calls take 20 to 60 seconds) and never lowers a longer client timeout; failed
calls are not charged, a not-found is charged.

### [Vinted](https://scavio.dev/docs/vinted-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Nine endpoints, new in 0.42.0, 1 credit each, on `client.vinted`: `search`,
`product`, `seller`, `sellerProducts`, `sellerFeedback`, `brands`,
`suggestions`, `filters`, `categories`. Every method takes an optional
`country`: `fr` (default), `be`, `lu`, `es`, `nl`, `lt`, `de`, `at`, `it`,
`uk`, `pt`, `us`, `cz`, `sk`, `pl`, `se`, `ro`, `hu`, `dk`, `fi`, `hr`, `gr`,
`ie`, `ee`, `lv`, `si`, `au`.

- Every site, `uk` (GBP), `us` (USD) and `au` (AUD) included, can show
  listings from sellers in other countries, with the price converted to the
  site's currency (EUR, or CZK, PLN, SEK, RON, HUF, DKK on the other sites);
  the EU sites share one cross-border pool. `product` returns the seller's own
  price and currency. Category, condition and filter names come
  back in the site's language.
- `search` returns 96 items per page, pages 1-10 (`total_is_capped` is true
  past 960 matches). `service_fee` is the Vinted fee the buyer pays on top of
  `price`; `total_price` includes it. Price sorts surface loosely matching
  cheap listings, so pair them with a category or price range.
- `product` takes `item_id` or a Vinted item `url` (the URL's own site wins)
  and is priced in the SELLER's currency.
- The id filters (`brand_ids`, `status_ids`, `size_ids`, `color_ids`,
  `material_ids`) take an array or a comma-separated string; resolve them with
  `brands`, `filters` and `categories`.
- Live listings only: no sold-item search, shipping prices, pickup points or
  similar items. Seller data is limited to public, buyer-relevant fields and
  feedback carries no reviewer identity.

```ts
const found = (await client.vinted.search({ query: "barbour jacket", country: "uk" })) as any;
console.log(found.data.listed_results, found.data.total_pages, found.data.total_is_capped);
for (const i of found.data.items.slice(0, 5)) {
  console.log(i.id, i.title, i.price, i.currency, i.service_fee, i.total_price, i.condition, i.seller.id);
}

const brands = (await client.vinted.brands({ query: "barbour", country: "uk" })) as any;
console.log(brands.data.brands[0].id, brands.data.brands[0].item_count);
const conditions = (await client.vinted.filters({ filter: "status", country: "uk" })) as any;
for (const o of conditions.data.options) console.log(o.id, o.title, o.item_count);
const women = await client.vinted.categories({ country: "uk", parent_id: 1904 });
const typed = await client.vinted.suggestions({ query: "barb", country: "uk" });

const item = (await client.vinted.product({
  url: "https://www.vinted.co.uk/items/10671938315-nike-air-max-size-uk-75",
})) as any;
console.log(item.data.title, item.data.price, item.data.currency, item.data.is_sold, item.data.seller.login);

const seller = (await client.vinted.seller({ user_id: 65958245, country: "uk" })) as any;
console.log(seller.data.login, seller.data.feedback_count, seller.data.feedback_reputation);
const wardrobe = await client.vinted.sellerProducts({ user_id: 65958245, country: "uk", limit: 10 });
const reviews = (await client.vinted.sellerFeedback({ user_id: 65958245, country: "uk" })) as any;
for (const f of reviews.data.feedback.slice(0, 3)) console.log(f.rating, f.created_at, f.text);
```

Every call raises the request timeout to `VINTED_TIMEOUT` (120s) and never
lowers a longer client timeout. An unknown item or member id on `product` or
`seller` is a 404.

### [Mercari](https://scavio.dev/docs/mercari-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Mercari US (mercari.com, USD, English) and Mercari Japan (jp.mercari.com, JPY,
Japanese). Eleven endpoints on `client.mercari` (new in 0.66.0), 1 credit
each: `search`, `item`, `category`, `categories`, `brands`, `brand`, `deals`,
`trending`, `seller`, `sellerReviews` and `shop`.

- Markets (`country`): `us` (default) and `jp`. `search`, `item`,
  `category`, `categories`, `brands` and `brand` serve both; `deals` and
  `trending` are us only; `seller`, `sellerReviews` and `shop` are jp only.
  A market an endpoint does not serve, Mercari UK (closed: gb / uk) and any
  other value answer 400 before anything is charged. Item, category, brand
  and seller ids are per market: an id from us is not valid on jp.
- Sold prices: `status: "sold"` returns sold listings (sold and in transit)
  with their prices, so asking prices (`on_sale`, the default) and sold
  prices for the same query come from `search`. On us, Mercari orders sold
  results most recently sold first whatever relevance asks (price sorts
  apply) and matches the keyword more loosely than on-sale results, so check
  titles before comparing prices. Grids carry no likes and no sold time;
  `item` has both (`sold_at`, when Mercari shows it), and a sold item keeps
  its full data. On us, grid `free_shipping` is set only when you filter by
  `shipping`.
- Prices are numbers, US dollars on us and whole yen on jp;
  `original_price` is the seller's earlier price when above `price`, with
  `discount_percent` against it (never set on jp results).
- Search depth: us 50 per page up to page 20 (later pages can repeat earlier
  items: dedupe by `item_id`), jp 120 per page up to page 91; `total` stops
  at 10,000 on us and 15,000 on jp (that many or more). Sorts: relevance, newest, price_asc, price_desc, plus
  `likes` on jp and `recently_sold` on us; jp `newest` follows Mercari
  Japan's own order, where relisted items move up.
- Mercari Japan data is in Japanese as sellers wrote it (not translated), and
  jp calls are slower (typically 10-20 s, up to about a minute). jp `item` adds the full
  public comment list (no commenter names) and Mercari Shops products.
- `seller` (jp) is the public profile with good / normal / bad ratings and
  the first 30 listings; `sellerReviews` (jp) the most recent 100 reviews
  with no reviewer names; `shop` (jp) the Mercari Shops shop profile (for
  its products use `search` with `shops_only` or `item`).
- Not available: US seller profiles and reviews, US search suggestions,
  Japanese trending and price-drop history.

```typescript
// Asking prices vs sold prices for the same query.
const onSale = (await client.mercari.search({ query: "nintendo switch" })) as any;
const sold = (await client.mercari.search({ query: "nintendo switch", status: "sold", sort: "recently_sold" })) as any;
console.log(onSale.data.total, onSale.data.items.map((i: any) => i.price).slice(0, 5));
console.log(sold.data.total, sold.data.items.map((i: any) => [i.price, i.status]).slice(0, 5));

// One listing: the seller's earlier price, sold_at, shipping, likes and the seller summary.
const it = (await client.mercari.item({ item_id: "m38943035688" })) as any;
console.log(it.data.price, it.data.original_price, it.data.sold_at, it.data.likes, it.data.seller);

// Mercari Japan (Japanese, yen): search, an item with its comments, a seller and their reviews.
const jp = (await client.mercari.search({ query: "ポケモンカード", country: "jp" })) as any;
const jpItem = (await client.mercari.item({ item_id: "m65962821601", country: "jp" })) as any;
const seller = (await client.mercari.seller({ seller_id: "477123966" })) as any;
const reviews = (await client.mercari.sellerReviews({ seller_id: "477123966" })) as any;
console.log(jp.data.page_size, jpItem.data.comments.length, seller.data.seller.ratings, reviews.data.summary);

// US only: trending keywords and brands, and the deals filter.
const trending = (await client.mercari.trending()) as any;
console.log(trending.data.keywords.slice(0, 5).map((k: any) => [k.keyword, k.rank_change]));
const deals = (await client.mercari.deals()) as any;
```

Every call raises the request timeout to `MERCARI_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls are not charged, a not-found is
charged.

### [Depop](https://scavio.dev/docs/depop-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Depop resale prices across its 9 storefronts. Fourteen endpoints on
`client.depop` (new in 0.69.0): `search`, `product`, `category`, `brand`,
`explore`, `suggestions`, `shop`, `shopProducts`, `shopSold`,
`shopReviews`, `shopsSearch`, `categories`, `brands` and `similar`.

- Credits: `search`, `category`, `brand` and `explore` 1 (5 on nz);
  `product` 1 on us, 2 on gb, au, ie, ca, de, fr, it and 6 on nz; everything
  else 1. `credits_used` in the response is the exact charge.
- Markets (`country`, the buyer's country, default `us`): us (USD), gb (GBP;
  `uk` accepted), au (AUD), ie (EUR), ca (CAD), nz (NZD), de (EUR), fr (EUR),
  it (EUR). `search`, `product`, `category`, `brand`, `explore` and
  `suggestions` serve all nine; `similar` is us only; the shop endpoints,
  `categories` and `brands` are global (no `country`). Any other country
  answers 400 before anything is charged.
- `search`, `category`, `brand` and `explore` return the first 24 results per
  query: Depop serves no next page, so narrow with filters, sort or a price
  range. Sorts are relevance, `price_asc` and `price_desc`.
- Prices are numbers as Depop shows them to a buyer in the market: `price`,
  `original_price` (the seller's own original price), `buyer_fee`, `tax`
  (`tax_type`), `shipping` (what the buyer pays; `shipping_boundary`),
  `total` (Scavio's sum of price, buyer fee, tax and shipping) and
  `headline_price` (the price Depop itself headlines: us leaves out
  shipping, gb includes the fee and shipping). `price.currency` is the
  listing's currency, usually the market's (some sellers list in another
  one): list items carry `buyer_market_price`, false for those, which Depop
  shows unconverted (product too). List items carry no seller country;
  `product` has `seller.country`. Listing ids are global: the same listing
  priced from another market shows that buyer's fee, tax and shipping. On us, Depop returns a buyer fee on
  some calls and not on others for the same listing.
- Sold prices come per shop from `shopSold`: `status` is `sold` (sold on
  Depop) or `marked_as_sold` (the seller marked it sold, which may be outside
  Depop). Depop has no keyword search of sold listings and shows no sale date (`updated_at` is the listing's last
  update). `shopReviews` returns no reviewer names.
- Depop's interface is English in every storefront; titles and descriptions
  are what sellers wrote (often German, French or Italian on de, fr, it);
  `categories` answers names in en, en-US, de, fr or it.
- Not available: results past the first 24, keyword sold search, trending
  searches, views, join date, Top Seller badge, offers / bundles, price
  history, `similar` outside us.

```typescript
// What listings ask in one buyer market (the first 24 results).
const res = (await client.depop.search({ query: "levis 501", country: "gb", sort: "price_asc" })) as any;
console.log(res.data.count, res.data.total_count, res.data.items.slice(0, 3).map((i: any) => i.price));

// One listing priced for a buyer in the market, plus the seller's own price and summary.
const item = (await client.depop.product({ slug: "f0omem-levis-550-38x36-blue-jeans-662f" })) as any;
console.log(item.data.price, item.data.listing_price, item.data.seller.items_sold);

// What a shop's items sold for (cursor-paged), the shop profile and its reviews.
const sold = (await client.depop.shopSold({ username: "flomem" })) as any;
console.log(sold.data.items.map((i: any) => [i.title, i.status, i.price.price, i.price.currency, i.updated_at]).slice(0, 3));
const next = sold.data.has_more ? await client.depop.shopSold({ username: "flomem", cursor: sold.data.next_cursor }) : null;
const shop = (await client.depop.shop({ username: "flomem" })) as any;
const reviews = (await client.depop.shopReviews({ username: "flomem" })) as any;
console.log(shop.data.reviews_rating, shop.data.items_sold, reviews.data.reviews.length);

// Category paths feed category(), brand slugs feed brand().
const tree = (await client.depop.categories()) as any;
const jeans = (await client.depop.category({ category: "mens/bottoms/jeans", country: "de" })) as any;
const carhartt = (await client.depop.brand({ slug: "carhartt" })) as any;
```

Every call raises the request timeout to `DEPOP_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls are not charged, a not-found is
charged.

### [Poshmark](https://scavio.dev/docs/poshmark-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Poshmark sold prices, listings, closets and Love Notes on poshmark.com (us,
USD) and poshmark.ca (ca, CAD). Fifteen endpoints on `client.poshmark` (new
in 0.70.0), 1 credit each: `search`, `sold`, `product`, `category`, `brand`,
`closet`, `closetListings`, `loveNotes`, `closetsSearch`, `categories`,
`brands`, `suggestions`, `parties`, `partyListings` and `similar`.

- Markets (`country`, default `us`): us (USD) and ca (CAD); both storefronts
  are English. `search`, `sold`, `category`, `brand`, `brands`,
  `suggestions`, `parties`, `partyListings` and `similar` return that
  market's own listings in its currency. Listing ids and closets are global:
  a listing opens from either market in its own currency (no conversion), and
  closet listings are read in the seller's home market. Any other country
  answers 400 before anything is charged.
- Sold search: up to 480 sold listings per query and filter combination (10
  pages of 48, Poshmark's own limit); narrow with filters or split by
  `price_min` / `price_max` to reach more. On a sold listing, `price` is the
  price shown on the sold listing (Poshmark says a sold listing reflects the
  final order price; offers are private and not returned) and `sold_at` is
  the date Poshmark marked it sold.
- `original_price` is the original price the seller entered; `first_price`
  is the price it was first listed at, which can be below `price` when the
  seller raised the price. Active search reaches about 5,000 listings per
  query (105 pages of 48); `total` is Poshmark's approximate count.
- Conditions: `new_with_tags`, `new_with_tags_or_boutique`, `boutique`,
  `like_new`, `good`, `fair`. Sorts: relevance, `just_shared`, `just_in`,
  `price_asc`, `price_desc`, `price_drop`, `most_liked`.
- `loveNotes` returns the latest 100 Love Notes with the closet's total
  count; no authors. Seller usernames only: no real names, cities, likers or
  comment authors.
- Not available: sold results beyond 480 per query and filter combination,
  Love Notes beyond the latest 100, Posh Shows, trending searches, the full
  brand directory (top 50; brand inputs take any name), offers, bundles,
  price history.

```typescript
// Sold prices by keyword: the price shown on the sold listing and the date Poshmark marked it sold.
const sold = (await client.poshmark.sold({ query: "coach bag", department: "Women", category: "Bags" })) as any;
console.log(sold.data.count, sold.data.total, sold.data.items.slice(0, 3).map((i: any) => [i.title, i.price.amount, i.price.currency, i.sold_at]));

// Active listings in Canada with price drops, and one listing in full.
const res = (await client.poshmark.search({ query: "lululemon align", country: "ca", sort: "price_drop" })) as any;
console.log(res.data.items.slice(0, 3).map((i: any) => [i.price, i.original_price, i.first_price]));
const listing = (await client.poshmark.product({ listing_id: "6ad80f0dce5b0ace7ee9abd7" })) as any;
console.log(listing.data.price, listing.data.shipping, listing.data.seller.items_sold);

// A closet's stats, sold listings and latest Love Notes.
const closet = (await client.poshmark.closet({ username: "thriftedbyher" })) as any;
const closetSold = (await client.poshmark.closetListings({ username: "thriftedbyher", availability: "sold" })) as any;
const notes = (await client.poshmark.loveNotes({ username: "thriftedbyher" })) as any;
console.log(closet.data.items_sold, closet.data.love_notes, closetSold.data.total, notes.data.count, notes.data.total);

// Category slugs feed category(), search and sold.
const tree = (await client.poshmark.categories()) as any;
const bags = (await client.poshmark.category({ department: "Women", category: "Bags", availability: "sold" })) as any;
```

Every call raises the request timeout to `POSHMARK_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls are not charged, a not-found is
charged.

### [OfferUp](https://scavio.dev/docs/offerup-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

OfferUp (offerup.com, the US local marketplace for buying and selling used
items, cars and trucks): asking prices around any US ZIP code, so the same
item's asking prices in different US metros, with the area OfferUp resolved
the ZIP to; cars and trucks filtered by dealer or private seller, make, model
year and mileage; one listing in full with condition, posted date and vehicle
details (no VIN); the category tree; and a seller's public profile numbers.
Five endpoints on `client.offerup` (new in 0.90.0): `search`, `listing`,
`category`, `categories` and `seller`. 1 credit per call; `listing` is 1, or
2 when the listing needs a second, costlier fetch; `credits_used` in the
response is what was charged. OfferUp has no public API for reading listings;
OfferUp for Business (OfferUp Motors, Storefronts) is seller-side tooling
that syncs a dealer's own inventory into OfferUp. Pair a listing with
`client.amazon` and `client.walmart` for the same item's new price and with
`client.mercari` sold search for sold prices (match on model and title). See
the [OfferUp API page](https://scavio.dev/offerup-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme).

- US only (no `country`), prices in USD. `zip` is required on `search` and
  `category`; `location.resolved` is the area OfferUp named for the ZIP and
  `location.radius_miles` the radius it applied (captured 2026-11-25: 98101
  resolved to Seattle, 60601 to Chicago, both 30 miles).
- Sorts: best match (search default), newest (category default), distance,
  price low or high; vehicles also newest model year and lowest mileage.
  Category feeds have no best match order.
- `filters_not_applied` lists any filter OfferUp did not apply to the feed.
  `seller_type` applies in Cars & Trucks only: on `search` it limits the
  results to category 5.1. Captured 2026-11-25: "toyota tacoma" around 75201
  (Dallas, 80 miles), dealers, from 2018, at most 100,000 miles, lowest
  mileage first, listed a 2025 Toyota Tacoma 2WD at 35495 USD with 10017 miles.
- About 48 listings a page up to page 50, no total count (`has_more`).
  Promoted OfferUp listings are marked `sponsored`. Search tiles carry no
  posted date or condition (`listing` does).
- Prices are asking prices, not sold prices. Private sellers: no seller
  names (a dealer or business account's name only), usernames, avatars,
  phone numbers, emails, street addresses, coordinates or VINs; phone
  numbers, emails and VIN-like codes in titles and descriptions read
  `[removed]`.
- Not available: sold listings or sold prices (OfferUp does not show them
  publicly), shipping (OfferUp ended nationwide shipping in 2025; listings
  are local pickup), search suggestions, a total result count, a seller's
  listings past the first 20, messaging or offers.

```typescript
// The same keyword in two US metros: asking prices around each ZIP.
for (const zip of ["98101", "60601"]) {
  const feed = (await client.offerup.search({ q: "iphone 15", zip })) as any;
  console.log(feed.data.location.resolved, feed.data.count, feed.data.has_more);
  for (const it of feed.data.items.slice(0, 5)) console.log(it.title, it.price, it.city, it.state, it.sponsored);
}

// Cars and trucks: dealer listings, model year, mileage.
const trucks = (await client.offerup.search({ q: "toyota tacoma", zip: "75201", seller_type: "dealer", year_min: 2018, max_mileage: 100_000, sort: "lowest_mileage" })) as any;

// One listing: condition, posted date, vehicle details (no VIN), seller numbers.
const li = (await client.offerup.listing({ listing_id: "7a392126-fb9d-34c2-a6d8-1b94698428df" })) as any;
console.log(li.data.price, li.data.condition, li.data.posted_at, li.data.vehicle, li.data.seller.seller_type);

// A category around a ZIP, the category tree and a seller's public profile.
const furniture = (await client.offerup.category({ category: "furniture", zip: "90012" })) as any;
const tree = (await client.offerup.categories()) as any;
const dealer = (await client.offerup.seller({ seller_id: "8668343" })) as any;
```

Every call raises the request timeout to `OFFERUP_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls and refused inputs are not
charged, a not-found (an unknown listing, category or seller) is charged.

### [thredUP](https://scavio.dev/docs/thredup-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

thredUP prices on thredUP's US store (thredup.com, English, USD; thredUP
ships to the US and Canada from it), so there is no `country` option. Twelve
endpoints on `client.thredup` (new in 0.71.0), 1 credit each: `search`,
`sold`, `product`, `category`, `brand`, `deals`, `rescueBoxes`,
`categories`, `brands`, `suggestions`, `trending` and `similar`.

- `estimated_retail` is the estimated original retail: thredUP's own
  estimate on items thredUP prices, entered by the seller on Direct Listing
  items. `percent_off` is computed from the price and the estimated retail
  (`round((1 - price / estimated_retail) * 100)`), null when the estimated
  retail is missing or not above the price.
- `seller_type` says who priced the item: `thredup`, `direct_listing` (peer
  sellers) or `dropship` (partner listings). `status`: `available`,
  `reserved`, `sold`. Conditions: `new_with_tags`, `excellent`, `very_good`,
  `good`, `flawed`.
- List endpoints answer 119 items per page, pages 1 to 21 (about 2,500 items
  per query and filter combination); `total` caps at 10,000 (`total_capped`
  true means 10,000+). Free text is matched loosely (semantic): use `brand`
  for one brand. `size` takes sizing ids from `categories`, not labels. The
  price filter is approximate (thredUP matches a base price). Every answer
  reports the `sort` applied.
- Sold listings take filters only (brand and / or category, no query), with
  the price the item last listed at; thredUP shows no sold date.
- Departments: `women` (default), `girls`, `boys`, `handbags`, `shoes`,
  `designer`, `plus`, `juniors`, `maternity`, `accessories`; thredUP has no
  men's department.
- Not available: product reviews (thredUP shows none), seller shops, sold
  dates, men's clothing, price history. No seller or consignor names or ids
  are returned.

```typescript
// Prices: the price, the estimated original retail, % off, condition and who priced it.
const res = (await client.thredup.search({ query: "denim jacket", seller_type: "thredup" })) as any;
console.log(res.data.sort, res.data.total, res.data.total_capped);
console.log(res.data.items.slice(0, 3).map((i: any) => [i.title, i.price, i.estimated_retail, i.percent_off, i.seller_type, i.condition]));

// One item in full: the flaws thredUP noted, measurements and materials.
const item = (await client.thredup.product({ item_number: 241601590 })) as any;
console.log(item.data.price, item.data.estimated_retail, item.data.condition_notes, item.data.measurements, item.data.materials);

// Sold listings by brand: the price the item last listed at, no sold date.
const sold = (await client.thredup.sold({ brand: "Coach", department: "handbags" })) as any;
console.log(sold.data.items.slice(0, 3).map((i: any) => [i.title, i.price, i.estimated_retail, i.status]));

// Deals and Rescue boxes.
const clearance = (await client.thredup.deals({ collection: "clearance" })) as any;
const boxes = (await client.thredup.rescueBoxes()) as any;
console.log(clearance.data.count, boxes.data.available_count);
```

Every call raises the request timeout to `THREDUP_TIMEOUT` (240s; list calls
take 15 to 45 seconds) and never lowers a longer client timeout; failed calls
are not charged, a not-found is charged.

### [Macy's](https://scavio.dev/docs/macys-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Nine endpoints, new in 0.43.0, 1 credit each, on `client.macys`: `search`,
`product`, `reviews`, `category`, `brand`, `deals`, `stores`,
`storeAvailability`, `suggestions`. macys.com (US), prices in USD; no
`country`.

- `search`, `category`, `brand` and `deals` share one grid: 60 organic items
  per page with `total` and `total_pages`; totals can differ between sorts, as
  on the site. Filter by `brand`, `color`, `special_offer`, `min_price` /
  `max_price`, `pickup_store_id`, or any facet value via `filters`.
- Ad-only sponsored tiles are dropped (`sponsored_dropped` counts them) unless
  `include_sponsored`; organic items that also hold a paid slot stay, flagged
  `is_sponsored`. A keyword Macy's maps to a category returns
  `redirected_to_category`.
- `deals` `type`: `sale` (default), `clearance`, `today_only`, `last_act`,
  `limited_time_special`, `black_friday`.
- `product` takes `product_id`, `url`, or up to 10 `product_ids` (Macy's
  summary view: no rating histogram, and a collection without its members'
  variants). A collection member's id answers with the collection product
  (`requested_id` echoes the id asked for).
- `review_count` includes ratings without text; `reviews` returns written
  reviews only (`text_review_count`), up to 100 per page.
- `storeAvailability` takes a `store_id` (per-variant `pickup_available` and
  `in_store_available`) or a location (`zip`, `lat` + `lng`, or `city` +
  `state`), not both. Macy's publishes no unit quantities, so there are no
  stock counts. No coupon codes, Q&A text or price history: to track prices,
  poll and store your own.

```ts
const found = (await client.macys.search({
  query: "jeans",
  brand: "Levi's",
  special_offer: "clearance",
  sort: "price_low_to_high",
})) as any;
console.log(found.data.total, found.data.total_pages, found.data.sponsored_dropped);
for (const i of found.data.items.slice(0, 5)) {
  console.log(i.id, i.title, i.price, i.regular_price, i.percent_off, i.sale_ends, i.deal_label, i.is_sponsored);
}

const clearance = (await client.macys.deals({ type: "clearance", filters: { GENDER: "Women" } })) as any;
console.log(clearance.data.label, clearance.data.total);

const p = (await client.macys.product({ product_id: 25822310 })) as any;
console.log(p.data.title, p.data.price, p.data.regular_price, p.data.sale_ends);
console.log(p.data.review_count, p.data.text_review_count, p.data.rating_distribution);
for (const v of p.data.variants.slice(0, 3)) console.log(v.upc, v.color, v.size, v.available);

const reviews = (await client.macys.reviews({ product_id: 25822310, sort: "lowest_rated" })) as any;
for (const r of reviews.data.reviews.slice(0, 3)) console.log(r.rating, r.date, r.nickname, r.title);

const stores = (await client.macys.stores({ zip: "10001" })) as any;
const storeId = stores.data.stores[0].store_id;
const atStore = (await client.macys.storeAvailability({ product_id: 25822310, store_id: storeId })) as any;
console.log(atStore.data.pickup_available_count, atStore.data.in_store_available_count);
const typed = await client.macys.suggestions({ query: "jea" });
```

Every call raises the request timeout to `MACYS_TIMEOUT` (120s) and never
lowers a longer client timeout. An unknown product, category or store id is a
404.

### [Saks Fifth Avenue](https://scavio.dev/docs/saks-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Nine endpoints, new in 0.44.0, 2 credits each, on `client.saks`: `search`,
`product`, `category`, `brand`, `deals`, `stores`, `storeAvailability`,
`suggestions`, `designers`. saksfifthavenue.com (US), prices in USD; no
`country`.

- `search`, `category`, `brand` and `deals` share one grid: 24 positions per
  page with `total`, `total_pages`, `start` and `next_start`. An editorial
  tile can take a grid position, so a page may carry 22-23 items: pass the
  previous `next_start` as `start` to miss nothing (`page` also works).
- Filter by `brand`, `color`, `size`, `min_price` / `max_price`, `on_sale`,
  `new_arrivals`, or any facet value via `filters`. `size` takes the facet
  label ("Medium", not "M"). A keyword the site maps to a designer or
  category page returns `redirected_to`.
- `deals` `type`: `sale` (default), `womens_sale`, `mens_sale`,
  `womens_new_arrivals`, `mens_new_arrivals`. Saks has no clearance or
  final-sale list (items carry `is_clearance` / `is_final_sale` flags).
- `product` takes `product_id` (master or variant) or `url`, plus optional
  `color` + `size` to resolve one variant; `variants[]` carry each SKU's
  online `warehouse_units`. Rating and review count only: review text is not
  available.
- `storeAvailability` needs a variant `sku` (a product's `variants[].sku`)
  and a `zip` or `lat` + `lng`; `units_at_store` is present only when the
  site shows a count, otherwise null.
- `designers` is the A-Z index (about 1,200 names); its slugs feed `brand`.
  No coupon codes, international prices or price history: to track designer
  sale prices, poll and store your own.

```ts
const sale = (await client.saks.deals({
  type: "womens_sale",
  brand: "Prada",
  sort: "price_low_to_high",
})) as any;
console.log(sale.data.label, sale.data.total, sale.data.total_pages, sale.data.next_start);
for (const i of sale.data.items.slice(0, 5)) {
  console.log(i.id, i.brand, i.title, i.price, i.regular_price, i.percent_off, i.badge);
}

const more = (await client.saks.deals({ type: "womens_sale", brand: "Prada", start: sale.data.next_start })) as any;
console.log(more.data.start, more.data.count);

const p = (await client.saks.product({ product_id: "0400019127312" })) as any;
console.log(p.data.title, p.data.price, p.data.is_final_sale, p.data.rating, p.data.review_count);
for (const v of p.data.variants.slice(0, 3)) console.log(v.sku, v.warehouse_units);

const near = (await client.saks.storeAvailability({ sku: p.data.variants[0].sku, zip: "10022" })) as any;
for (const st of near.data.stores) console.log(st.name, st.availability_message, st.in_stock, st.units_at_store);

const designers = (await client.saks.designers({ letter: "G" })) as any;
for (const d of designers.data.designers.slice(0, 5)) console.log(d.name, d.slug);
const gucci = await client.saks.brand({ brand: "gucci", new_arrivals: true });
```

Every call raises the request timeout to `SAKS_TIMEOUT` (120s) and never
lowers a longer client timeout. An unknown product id, category path or
designer slug is a 404.

### [Kohl's](https://scavio.dev/docs/kohls-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Nine endpoints, new in 0.45.0, on `client.kohls`: `search`, `product`,
`category`, `brand`, `deals`, `stores`, `storeAvailability`, `suggestions`,
`coupons`. 2 credits each, except `stores` (1 credit). kohls.com (US), prices
in USD; no `country`.

- `search`, `category`, `brand` and `deals` share one grid: 120 products per
  page with `total` and `total_pages`. Up to about 8 sponsored items stay in
  the list, flagged `is_sponsored` and counted in `sponsored_count`.
- Filter by `brand`, `color`, `size`, `on_sale`, `clearance`, or any facet
  value id via `filters` (one id or an array, combined with AND). Price is a
  facet bucket ("Price:$25 to $50"), not a free min / max. Sorts include
  `percent_off` and `highest_rated`. Search returns `corrected_query` when
  the site autocorrects a keyword.
- `category` takes a kohls.com catalog `path` or `url` that carries its
  `CN=` filter (a product's `breadcrumbs[].url` works).
- `deals` `type`: `clearance` (default), `sale`, `kohls_cash` (items that
  earn Kohl's Cash now), `sephora` (Sephora at Kohl's).
- Prices carry `price_label` (sale, clearance, clearance+regular),
  `percent_off`, `with_code_price` (the price after a public offer code,
  with the code) and `price_suppressed` + `price_note` for cart-only prices.
- `product` takes `product_id` or `url`, plus an optional `store_id` (from
  `stores`) for that store's availability and price per variant. It returns
  `kohls_cash` earn and redeem windows and the public offer codes when the
  product has them, and `dept`. Rating and review count only: review text is
  not available.
- `storeAvailability` takes a variant `sku` (a product's `variants[].sku`),
  a `zip` and optionally `dept`; it returns real `pickup_units` and a
  `stock_level` at every store within about 50 miles.
- `coupons` lists today's public Kohl's coupon codes. No price history,
  international sites, account offers or checkout: to track clearance
  prices, poll and store your own.

```ts
const clr = (await client.kohls.deals({ type: "clearance", sort: "percent_off" })) as any;
console.log(clr.data.label, clr.data.total, clr.data.total_pages, clr.data.sponsored_count);
for (const i of clr.data.items.slice(0, 5)) {
  console.log(i.id, i.title, i.price, i.regular_price, i.price_label, i.percent_off, i.with_code_price, i.is_sponsored);
}

const jeans = (await client.kohls.search({
  query: "jeans",
  brand: "Levi's",
  filters: ["Gender:Womens", "Price:$25 to $50"],
})) as any;
console.log(jeans.data.total, jeans.data.corrected_query);

const p = (await client.kohls.product({ product_id: "6251213" })) as any;
console.log(p.data.title, p.data.price, p.data.rating, p.data.review_count, p.data.dept, p.data.kohls_cash);
const v = p.data.variants[0];
console.log(v.sku, v.upc, v.color, v.online_units);

const near = (await client.kohls.storeAvailability({ sku: v.sku, zip: "10001", dept: p.data.dept })) as any;
console.log(near.data.in_stock_count, near.data.total_pickup_units);
for (const st of near.data.stores.slice(0, 5)) console.log(st.name, st.pickup_units, st.stock_level, st.distance_miles);

const coupons = (await client.kohls.coupons()) as any;
for (const c of coupons.data.offers) console.log(c.code, c.description, c.ends, c.requires_kohls_card);
```

Every call raises the request timeout to `KOHLS_TIMEOUT` (120s) and never
lowers a longer client timeout. An unknown product id or brand is a 404.

### [JCPenney](https://scavio.dev/docs/jcpenney-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Eleven endpoints on `client.jcpenney` (new in 0.46.0; `reviews` and
`questions` in 0.47.0): `search`, `product`, `category`, `brand`, `deals`,
`stores`, `storeAvailability`, `suggestions`, `coupons`, `reviews`,
`questions`. 1 credit each. jcpenney.com (US, Puerto Rico stores included),
prices in USD; no `country`.

- `search`, `category`, `brand` and `deals` share one grid: 48 products per
  page, at most 25 pages (1,200 items deep), with `total` and `total_pages`.
- Filter by `brand`, `color`, `size`, `price_range` and `deal` (a Deals &
  Promotions label), each one value or an array, or by any facet via
  `filters` as `{ facets[].id: value }` (facets combined with AND). Search
  returns `corrected_query` when the site autocorrects a keyword and
  `redirected_to` when it sends a keyword (doorbusters) to a deal or
  category listing; `exact: true` skips the automatic category narrowing.
- `category` takes a jcpenney.com `/g/` `path` or `url` that carries its
  `id=cat...`. A department page (dept...) lists no products without a deal
  or another filter.
- `deals` `type`: `clearance` (default), `sale`, `black_friday`, `big_buy`,
  `limited_time_special`, `best_value`, `gotta_have_it`, `closeout`, `bogo`;
  or any `label` verbatim, optionally in one `department`.
- Prices are product-level ranges (regular, sale and clearance min / max,
  `percent_off`, `price_type`) plus the after-coupon price and its code:
  JCPenney does not expose a price per size or color.
- `product` takes `product_id`, `url` or up to 20 `product_ids`. Variants
  carry sku, UPC, color, size and an online stock level (high / low / out),
  not a count. Review text and Q&A come from `reviews` and `questions`.
- `storeAvailability` takes a variant `sku` (a product's `variants[].sku`)
  and a `zip` (or `lat` + `lng`); it returns real unit counts at the 5
  nearest stores.
- `reviews` takes `product_id` or `url` and returns up to 98 review texts
  (default 38), `sort` `most_recent` (default), `most_helpful`,
  `highest_rating`, `lowest_rating` or `relevance`, optionally one star
  `rating`. `total_reviews` counts every language, `displayed_reviews` the
  English reviews JCPenney lists, `matching_reviews` those under the sort and
  filter. Reviews carry `verified_purchaser`, `incentivized`, `syndicated`
  with `syndication_source`, photos, videos, secondary ratings (Quality,
  Value...) and the brand's response. Reviewer age, gender and IP addresses
  are never returned.
- `questions` takes `product_id` or `url` and returns up to 50 questions
  (default 10, no sort option) with every answer's `author_type` (`brand`,
  `retailer` for JCPenney staff, `ai`, `customer`) and `ai_label`
  (AI-Generated / AI-Assisted).
- `coupons` lists today's public JCPenney coupon codes. No price history,
  international sites, account offers or JCPenney Rewards balances, or
  checkout: to track clearance prices, poll and store your own.

```ts
const clr = (await client.jcpenney.deals({ type: "clearance" })) as any;
console.log(clr.data.type, clr.data.total, clr.data.total_pages);
for (const i of clr.data.items.slice(0, 5)) {
  console.log(i.id, i.title, i.price, i.price_max, i.regular_price, i.price_type, i.percent_off, i.coupon_price, i.coupon_code);
}

const jeans = (await client.jcpenney.search({
  query: "jeans",
  brand: "levi's",
  filters: { gender: "women" },
})) as any;
console.log(jeans.data.total, jeans.data.corrected_query, jeans.data.redirected_to);

const p = (await client.jcpenney.product({ product_id: "ppr5008604049" })) as any;
const price = p.data.price;
console.log(p.data.title, price.current_min, price.current_max, price.regular_min, price.coupon, p.data.rating, p.data.review_count);
const v = p.data.variants[0];
console.log(v.sku, v.upc, v.color, v.size, v.online_stock);

const near = (await client.jcpenney.storeAvailability({ sku: v.sku, zip: "90012" })) as any;
console.log(near.data.stores_with_stock, near.data.total_quantity);
for (const st of near.data.stores) console.log(st.name, st.quantity, st.status, st.distance_miles);

const coupons = (await client.jcpenney.coupons()) as any;
for (const c of coupons.data.coupons) console.log(c.code, c.channel, c.headline, c.ends_at);

// Slow: usually 15-90s, up to about 3 minutes.
const rv = (await client.jcpenney.reviews({ product_id: "ppr5008604049", sort: "most_helpful" })) as any;
console.log(rv.data.total_reviews, rv.data.displayed_reviews, rv.data.matching_reviews, rv.data.average_rating);
for (const r of rv.data.reviews.slice(0, 3)) {
  console.log(r.rating, r.title, r.author, r.submitted_at, r.helpful_votes, r.verified_purchaser, r.incentivized);
}

const qa = (await client.jcpenney.questions({ product_id: "ppr5008212471" })) as any;
console.log(qa.data.total_questions, qa.data.total_answers);
for (const q of qa.data.questions.slice(0, 3)) {
  console.log(q.question, q.answer_count);
  for (const a of q.answers) console.log("  ", a.author_type, a.ai_label, a.text);
}
```

Every call raises the request timeout to `JCPENNEY_TIMEOUT` (120s) and never
lowers a longer client timeout; `reviews` and `questions` raise it to
`JCPENNEY_REVIEWS_TIMEOUT` (240s), and failed calls are not charged. An
unknown product id or brand is a 404.

### [Dick's Sporting Goods](https://scavio.dev/docs/dicks-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Nine endpoints on `client.dicks` (new in 0.48.0): `search`, `product`,
`products`, `reviews`, `category`, `brand`, `deals`, `storeAvailability`,
`suggestions`. 1 credit each, except `product` and `reviews` (2 credits).
dickssportinggoods.com (US), prices in USD; no `country`.

- `search`, `category`, `brand` and `deals` share one grid: 48 items per
  page by default, up to 144 (`page_size`), with `total` and `total_pages`,
  sorted `relevance`, `top_sellers`, `savings`, `price_low_to_high`,
  `price_high_to_low`, `featured`, `new_arrivals` or `brand_az`.
- Filter by `brand` (one value or an array), an approximate `min_price` /
  `max_price`, or any facet via `filters` as `{ facets[].id: value }`
  (facets combined with AND). Search returns `did_you_mean` for a misspelled
  query and follows keywords Dick's sends to a landing page (`clearance`,
  `golf balls`), reported as `redirected_to`.
- Merchandised items are flagged `is_pinned` and can make page 1 a few items
  longer than `page_size`. `scheduled_prices` are the retailer's own planned
  offer-price windows and can change: not a forecast or price history.
- `category` takes a `/f/` or `/c/` `path`, a `url` or a `category_id`.
  `deals` `type`: `clearance` (default), `sale` or `weekly_deals`.
- `product` takes `product_id` or `url` and lists every SKU with its own
  price, list price, `percent_off`, `is_clearance`, `online_units`, UPC,
  `buyable` flag and `map_price_applies` (the price only shows in the cart).
  Prices differ per size and color, so read the variant you need.
  `products` is the cheap style-level summary for up to 5 `product_ids`.
- `reviews` takes `product_id` or `url` and returns the 15 newest reviews
  with full text plus the rating stats and distribution: no paging, sort or
  star filter, and questions and answers are counts only.
- `storeAvailability` takes `skus` (from `product` `variants[].sku`) and a
  `zip` (or `lat` + `lng`); it returns unit counts at up to 100 DICK'S,
  Golf Galaxy (`chain: "golf_galaxy"`) or Public Lands
  (`chain: "public_lands"`) stores with address, phone, hours and distance.
  There is no standalone store locator, and an unknown SKU reads 0
  everywhere.
- No price history, ScoreCard prices or points, international sites,
  account data or checkout: to track clearance prices, poll and store your
  own.

```ts
const clr = (await client.dicks.deals({ type: "clearance", sort: "savings" })) as any;
console.log(clr.data.label, clr.data.total, clr.data.total_pages);
for (const i of clr.data.items.slice(0, 5)) {
  console.log(i.id, i.title, i.price, i.price_max, i.list_price, i.percent_off, i.is_pinned, i.scheduled_prices);
}

const shoes = (await client.dicks.search({
  query: "running shoes",
  brand: "HOKA",
  filters: { "5495": "Men's" },
})) as any;
console.log(shoes.data.total, shoes.data.did_you_mean, shoes.data.redirected_to);

// Slow: usually 20-75s, up to about 2.5 minutes.
const p = (await client.dicks.product({ product_id: "23FHQMCLFTN9GTXBLMNS" })) as any;
console.log(p.data.title, p.data.price.min, p.data.price.max, p.data.is_clearance);
for (const v of p.data.variants.slice(0, 5)) {
  console.log(v.sku, v.color, v.size, v.price, v.list_price, v.is_clearance, v.online_units);
}

const skus = p.data.variants.slice(0, 2).map((v: any) => v.sku);
const near = (await client.dicks.storeAvailability({ skus, zip: "60601" })) as any;
console.log(near.data.stores_with_stock, near.data.sku_totals);
for (const st of near.data.stores.slice(0, 3)) {
  console.log(st.name, st.distance_miles, st.skus.map((s: any) => [s.sku, s.units]));
}

const rv = (await client.dicks.reviews({ product_id: "26UNDMFITN1HRI9WUAETC" })) as any;
console.log(rv.data.stats.total, rv.data.stats.average, rv.data.stats.distribution);
for (const r of rv.data.reviews.slice(0, 3)) console.log(r.rating, r.title, r.submitted_at);
```

Every call raises the request timeout to `DICKS_TIMEOUT` (120s) and never
lowers a longer client timeout; `product` and `reviews` raise it to
`DICKS_PRODUCT_TIMEOUT` (240s), and failed calls are not charged. An
unknown product id, category or brand is a 404.

### [Foot Locker](https://scavio.dev/docs/footlocker-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Ten endpoints on `client.footlocker` (new in 0.49.0), 1 credit each:
`search`, `product`, `category`, `brand`, `deals`, `releases`, `stores`,
`storeAvailability`, `reviews`, `questions`. `country` picks the
storefront: `us` (footlocker.com, USD, default), `ca` (CAD, `language` en
or fr), `gb` (GBP), `de`, `fr`, `it`, `es`, `nl`, `be` (`language` nl or
fr), `at`, `ie` (EUR), `au` (AUD) or `nz` (NZD); titles come in the
storefront's language.

- Search, product, category, brand and deals (`sale`, `discount_eligible`)
  work on all 13 storefronts; `exclusives` on us and ca; `releases` on us,
  ca and gb (gb has no prices or reservation windows); `stores`,
  `storeAvailability`, `reviews` and `questions` are US only.
- `search`, `category`, `brand` and `deals` share one grid: 48 items per
  page with `total` and `total_pages`, sorted `relevance`,
  `price_low_to_high`, `price_high_to_low`, `new_arrivals`, `top_rated`,
  `name_az` or `brand_az`. Filter by `brand` (any case), `gender`, `color`,
  `price_range`, `on_sale` or any facet via `filters` as
  `{ facets[].id: value }`.
- Listings can be a few hours old: `data_as_of` says when each one was
  built. A bare brand keyword (`nike`, `hoka`) returns that brand's listing
  and `redirected_to` says which; a keyword the site sends to a landing page
  without a product listing is an unbilled 400 pointing to `brand`,
  `category` or `deals`.
- `product` lists every colorway with its price and every size with
  `available`, `ship`, `pickup` and `stores_available` (a store count, not
  units): availability is yes / no, Foot Locker publishes no unit counts.
  European storefronts add `lowest_price_30d`.
- `releases` is the release calendar as monitoring data: launch date and
  time, retail price, colorway, style code, heat level, size run and
  reservation windows where the storefront runs them. Nothing here enters,
  reserves or buys a release.
- `storeAvailability` answers which nearby Foot Locker stores show a
  product (or one `size`) as available, yes / no; Foot Locker banner stores
  only (no Kids Foot Locker or Champs).
- No search suggestions, member (FLX) prices or account data, price history
  or checkout: to track prices, poll and store your own.

```ts
const res = (await client.footlocker.search({ query: "nike dunk", country: "de" })) as any;
console.log(res.data.currency, res.data.total, res.data.data_as_of, res.data.redirected_to);
for (const i of res.data.items.slice(0, 5)) {
  console.log(i.id, i.title, i.price, i.list_price, i.percent_off, i.lowest_price_30d);
}

const p = (await client.footlocker.product({ product_id: "Q5495005" })) as any;
console.log(p.data.title, p.data.price, p.data.launch);
for (const s of p.data.sizes.slice(0, 5)) {
  console.log(s.size, s.available, s.ship, s.pickup, s.stores_available);
}

const near = (await client.footlocker.storeAvailability({ product_id: "W2288111", size: "10.0", zip: "10001" })) as any;
console.log(near.data.stores_with_availability);
for (const st of near.data.stores.slice(0, 3)) {
  console.log(st.name_secondary, st.distance_miles, st.available, st.sizes_available);
}

const cal = (await client.footlocker.releases({ status: "upcoming", brand: "Jordan" })) as any;
for (const r of cal.data.releases.slice(0, 5)) {
  console.log(r.launch_at, r.title, r.style, r.retail_price, r.heat_level, r.reservation.status);
}

// Slow: usually 25-90s, up to about 3-4 minutes.
const rv = (await client.footlocker.reviews({ product_id: "Q5495005", sort: "most_helpful", limit: 30 })) as any;
console.log(rv.data.stats.average_rating, rv.data.stats.rating_distribution);
for (const r of rv.data.reviews.slice(0, 3)) console.log(r.rating, r.title, r.submitted_at);
```

Every call raises the request timeout to `FOOTLOCKER_TIMEOUT` (120s) and
never lowers a longer client timeout; `reviews` and `questions` raise it to
`FOOTLOCKER_REVIEWS_TIMEOUT` (240s), and failed calls are not charged.
Unknown SKUs, categories and brands are a charged 404.

### [SportChek](https://scavio.dev/docs/sportchek-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme) and [Mark's](https://scavio.dev/docs/marks-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

SportChek (sportchek.ca, Canada's sporting goods retailer, a Canadian Tire
Corporation banner) and Mark's (marks.com, the Canadian workwear, casual
clothing and footwear retailer, a Canadian Tire Corporation banner;
L'Equipeur in French). Eight endpoints each (new in 0.91.0):
`client.sportchek` has `search`, `list`, `product`, `reviews`,
`suggestions`, `store`, `brands` and `categories`; `client.marks` has the
same with `questions` in place of `reviews`. 1 credit per call on every
endpoint; `credits_used` in the response is what was charged. Canada only,
prices in CAD. Neither banner has a public API. Pair a product with
`client.amazon` and `client.walmart` for the same model at Amazon.ca and
Walmart.ca (match on brand, model, colour and size). See the
[SportChek API page](https://scavio.dev/sportchek-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme) and the
[Mark's API page](https://scavio.dev/marks-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme).

- Answers take about 10-90 seconds: allow up to 2 minutes per call.
- `was_price` is the site's was price as given, only where the site shows
  one; `footnote` is the site's own sentence on it ("Was price reflects the
  last national regular price this product was sold for.", English pages). A
  percent off is not returned: compute it from `price` and `was_price` and
  label it computed. `sale_ends` is the sale end date the site shows, as
  given; `price_message` is the site's promotion text.
- `units_at_store` are the units at the store the site assigns to the
  request's region (`assigned_store`); a caller cannot choose a store. In our
  checks prices were the same at every store sampled.
- Search and list pages are 24 products (12 on Mark's category pages),
  `page_size` says. Filters come from `facets` (`include_facets: true`); list
  paths come from `categories`; `deals` on a deals page is a 400 (the page
  already is one).
- Mark's takes `language: "fr"` on `search`, `list`, `product`, `brands` and
  `categories` to read L'Equipeur (lequipeur.com): the same product codes and
  CAD prices, French titles. SportChek is English only.
- SportChek reviews: page 1 is the first 8, pages 2-4 the next 30 each (up to
  98 per sort and star filter), no reviewer names. Mark's questions: the
  newest 10 with answers, no asker names.
- Captured 2026-11-25: SportChek's Columbia Women's Amaze Puff Down Jacket
  (84166659F) at 206.24 CAD with the promotion "25% Off* - Discount Applied.
  See details." and `sale_ends` December 1, 2026; Mark's Dakota WorkPro
  Series 6114 work boots (75983776F) at 124.99 CAD with a was price of 199.99,
  the same price and code on L'Equipeur with a French title.
- Not available: choosing a store for price or stock, stores near a postal
  code, Mark's reviews, SportChek questions, the flyer, Triangle Rewards or
  CT Money prices, price history (poll and store the answers), UPC or
  barcodes (the site shows none), cart or checkout.

```typescript
// Search: price, was price, sale label and end date, and the site's own footnote.
const res = (await client.sportchek.search({ q: "winter jacket", include_facets: true })) as any;
console.log(res.data.total, res.data.footnote);
for (const it of res.data.items.slice(0, 5)) console.log(it.code, it.name, it.price, it.was_price, it.sale_ends);

// Filters come from facets; deals pages and categories are list() paths.
const women = (await client.sportchek.search({ q: "winter jacket", filters: [{ facet: "sku_gender_attr", value: "Female" }], deals: "sale" })) as any;
const clearance = (await client.sportchek.list({ path: "/en/sale-clearance/clearance.html", sort: "price_low" })) as any;

// One product: each variant's price, was price, sale_ends and units.
const p = (await client.sportchek.product({ code: "84166659F" })) as any;
console.log(p.data.assigned_store, p.data.variants[0].units_at_store, p.data.variants[0].units_online);
const reviews = (await client.sportchek.reviews({ code: "84166659F", sort: "newest" })) as any;

// Mark's in English and in French (L'Equipeur), its questions and one store.
const en = (await client.marks.product({ code: "75983776F" })) as any;
const fr = (await client.marks.product({ code: "75983776F", language: "fr" })) as any;
console.log(en.data.name, en.data.price, en.data.was_price, fr.data.name, fr.data.price);
const qa = (await client.marks.questions({ code: "75984589F" })) as any;
const store = (await client.marks.store({ store_id: "589" })) as any;
```

Every call raises the request timeout to `SPORTCHEK_TIMEOUT` /
`MARKS_TIMEOUT` (240s) and never lowers a longer client timeout; failed calls
and refused inputs are not charged, a not-found is charged.

### [Fanatics](https://scavio.dev/docs/fanatics-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Fanatics merchandise and product data (jerseys, hats, fan gear,
collectibles; not sportsbook odds). Five endpoints on `client.fanatics`
(new in 0.50.0), 1 credit each: `search`, `product`, `browse`, `deals`,
`reviews`. `country` picks the storefront: `us` (fanatics.com, USD,
default), `gb` (GBP), `de`, `fr`, `es`, `it` (EUR), `jp` (JPY) or `ca`
(CAD, `language` en or fr); titles come in the storefront's language.
`site` reads a US league store (with country us): `fanatics` (default),
`nflshop`, `mlbshop`, `nhlshop` or `mlsstore`; the same product ids work on
every store, but department and filter ids are per store (Jerseys is 8011 on
fanatics.com, 14012 on NFL Shop): take them from the facets of the store you
query.

- `search`, `product`, `browse` and `deals` take `country`, `language` and
  `site`; `reviews` is US only (fanatics.com).
- `search`, `browse` and `deals` share one grid: 24, 48 or 72 items per page
  (default 72) with `total`, `total_capped` (the US site counts at most
  9000) and `total_pages`, sorted `top_sellers`, `price_low_to_high`,
  `price_high_to_low` or `newest` (price sorts use the current `price`,
  before any promo code, not `with_code_price`). Facet values feed `filters` as
  `{ filter: value }`, one value per filter; facet ids feed `browse`
  (`team_id`, `player_id`, `department_id`, `brand_id`, `collection_id`;
  player ids come from the players facet when the page lists one, e.g.
  Lakers, or from a product's `player`). `price_band` and `on_sale` are on `browse` (no price bands on jp). A
  league alone is a landing page: combine it with another id or a filter.
- Each item carries `price`, `regular_price`, `sale_price`,
  `clearance_price`, `with_code_price` (the price with the site-wide promo
  code shown on the page) and `price_label` (`coupon` means coupon-eligible;
  a null `with_code_price` means the code does not lower that item). `data_as_of` says when Fanatics
  built each listing; misspellings come back as `corrected_query`.
- `product` lists every size with `stock_level` (low / out: a level, never
  a unit count), ship-by and delivery estimates, the current promo code,
  personalization fields with the team roster (prices already include
  personalization), and jersey assurance / authentic flags.
- `reviews` returns real text with 4 sorts and a star filter (1-50, default
  10), fit / quality / value and the site's own AI-written summary
  (`ai_summary`). Fanatics pools reviews across a style, so check each
  review's `product_id`.
- No search suggestions, store locator or store stock, Q&A, FanCash, member
  pricing, unit counts, price history or checkout: to track jersey sale
  prices, poll and store your own.

```ts
const res = (await client.fanatics.search({ query: "chiefs jersey", sort: "price_low_to_high" })) as any;
console.log(res.data.total, res.data.total_capped, res.data.corrected_query, res.data.data_as_of);
for (const i of res.data.items.slice(0, 5)) {
  console.log(i.id, i.title, i.price, i.regular_price, i.with_code_price, i.price_label, i.ship_by);
}

const hats = (await client.fanatics.browse({ team_id: 3372, department_id: 8008, price_band: "25_50" })) as any;
console.log(hats.data.browse.team, hats.data.browse.department, hats.data.total);

const p = (await client.fanatics.product({ product_id: "3892922" })) as any;
console.log(p.data.title, p.data.price, p.data.sale_price, p.data.with_code_price, p.data.coupon, p.data.flags);
for (const s of p.data.sizes) console.log(s.size, s.available, s.stock_level, s.ship_by, s.est_delivery_to);

const de = (await client.fanatics.deals({ country: "de" })) as any;
console.log(de.data.currency, de.data.total, de.data.data_as_of);

// Slow: usually 20-90s, up to about 4 minutes.
const rv = (await client.fanatics.reviews({ product_id: "3892922", sort: "most_recent", limit: 30 })) as any;
console.log(rv.data.stats.average, rv.data.stats.fit, rv.data.ai_summary);
for (const r of rv.data.reviews.slice(0, 3)) console.log(r.product_id, r.rating, r.fit, r.text);
```

Every call raises the request timeout to `FANATICS_TIMEOUT` (120s) and
never lowers a longer client timeout; `reviews` raises it to
`FANATICS_REVIEWS_TIMEOUT` (300s), and failed calls are not charged.
Unknown products are a charged 404.

### [Argos](https://scavio.dev/docs/argos-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Argos store stock, prices and reviews (argos.co.uk, UK, GBP). Ten endpoints
on `client.argos` (new in 0.73.0), 2 credits each: `search`, `product`,
`storeStock`, `stores`, `reviews`, `questions`, `categories`, `category`,
`deals` and `suggestions`. One store, so there is no `country` (Argos Ireland
closed in 2023).

- Store stock is availability, not unit counts: `storeStock` answers, for 1
  to 10 products at the Argos stores near a UK postcode (up to 10 stores
  within 50 miles), a collection state per store and product
  (`collect_now`, `collect_today`, `collect_tomorrow`, `collect_later`,
  `out_of_stock`, `not_available`) with `available_from` and the site's
  message, plus delivery to a postcode (`same_day` with Fast Track,
  `next_day`, `later` = Argos's "Delivery within N days" with `days`,
  `out_of_stock`, `not_available`; quote delivery from `state` and `message`). `postcode` is where
  stores are searched; `delivery_postcode` (default `postcode`) is where
  delivery is checked. Store types: `argos_store` (a standalone Argos
  store), `inside_sainsburys` (an Argos counter inside a Sainsbury's store),
  `collection_point` (a collect-only point, no shop). Trusted Seller items are never stocked in stores (400).
- Prices are numbers in GBP as Argos shows them: `price`, `was_price` (the
  site's was price), `save` (computed by Scavio as `was_price - price`),
  `offer_text` (the site's own words, e.g. Half Price) and `badges` as given
  (e.g. `Black_Friday`, `price_guarantee`). `seller` is `argos` or
  `trusted_seller` (Argos's marketplace; `seller_name` is null there, the
  page names no seller).
- `search`, `category` and `deals` return 24 per page, pages 1 to 200
  (`total_pages` says how deep the list goes; `top_100` is 2 pages of 60;
  Argos stops counting at 10,000, flagged by `total_capped`).
  Tu Clothing items are left out and counted in `tu_clothing_excluded`.
- `reviews`: up to 100 per page with every review reachable, sorted `newest`
  (default), `oldest`, `most_helpful`, `highest_rating` or `lowest_rating`,
  `rating` star filter; syndicated reviews are flagged with their source and
  `summary` is Argos's own AI-generated summary, labelled as such. Reviewer
  names, locations, ages and genders are never returned.
- Not available: unit counts, price history (poll and store the answers), a
  brand directory (brand is a filter), Argos Ireland, card or checkout
  prices, Argos Pay terms.

```typescript
// Store stock: which Argos stores near a UK postcode can hand over each product, and when.
const st = (await client.argos.storeStock({ product_ids: ["8377058", "7163184"], postcode: "SW1A 1AA" })) as any;
for (const s of st.data.stores.slice(0, 3)) {
  console.log(s.name, s.type, s.distance_miles, s.products.map((p: any) => [p.product_id, p.state, p.available_from]));
}
console.log(st.data.delivery.products.map((p: any) => [p.product_id, p.state, p.fast_track]));

// Prices: price, was price, save (computed), the site's offer text and badges.
const res = (await client.argos.search({ query: "air fryer", seller: "argos", sort: "price_low" })) as any;
console.log(res.data.total, res.data.total_pages, res.data.page_size);
console.log(res.data.items.slice(0, 3).map((i: any) => [i.name, i.price, i.was_price, i.save, i.offer_text, i.badges]));

// Reviews, 100 per page, low stars first; Argos's own AI summary.
const rv = (await client.argos.reviews({ product_id: "7163184", rating: [1, 2], limit: 100 })) as any;
console.log(rv.data.total, rv.data.summary_source, rv.data.reviews.map((r: any) => [r.rating, r.syndicated, r.syndication_source]));

// Black Friday deals, 24 per page.
const bf = (await client.argos.deals({ collection: "black_friday" })) as any;
console.log(bf.data.total, bf.data.items.length);
```

Every call raises the request timeout to `ARGOS_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls are not charged, a not-found is
charged.

### [Media Expert](https://scavio.dev/docs/mediaexpert-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Media Expert Black Week prices, the Omnibus 30-day low and store stock
(mediaexpert.pl, Poland, PLN). Thirteen endpoints on `client.mediaexpert`
(new in 0.74.0): `search`, `product`, `storeStock`, `stores`, `reviews`,
`category`, `categories`, `brands`, `brand`, `promotions`, `outlet`, `seller`
and `suggestions`. One store, so there is no `country`; names,
specifications, labels and reviews come back in Polish, as Media Expert
writes them.

- Billed on actual cost, 1 to 3 credits per call (`credits_used` reports
  each one): `product`, `stores`, `brands`, `reviews` and `suggestions` 1;
  `storeStock` and `categories` 2; `search` 3 for a search page (Media Expert
  loads search lists lazily, so the rest of the page takes one more lookup)
  or 1 when Media Expert answers the term with a full category page;
  `category`, `brand`, `outlet`, `seller` and a promotion list's products 1
  unsorted and 3 with a sort or a lazily loaded list (the promotion lists
  themselves and the outlet's groups cost 1).
- Prices are numbers in PLN: `price`, `old_price` (Media Expert's
  struck-through price), `omnibus_lowest_30d` (the lowest price of the last
  30 days that Media Expert shows next to a promotion, under the EU Omnibus
  Directive), `code_price` `{price, code, valid_from, valid_to}` (the price
  with a discount code), `discount_shown` (Media Expert's own figure) and
  `discount_percent` (computed by Scavio).
- Store stock is Media Expert's stock indicator, a bucket (seen: 0, 2, 9,
  20), not a unit count, at the up to 40 stores nearest a Polish city, town
  or postcode, with `collect_in_1h` (Odbierz za godzinę) and
  `order_to_store_day` when the item is not on the shelf. Send `product_id`,
  not `offer_id`; marketplace items (sold and shipped by a marketplace
  seller) are never stocked in stores (a charged 400).
- Lists return 30 per page by default (`limit` 5, 10, 15, 20, 30 or 50), up
  to 100 pages, and stop counting at 5,000 (`total_capped`). Price sorts are
  Media Expert's own order, which follows promotional and code prices, so
  re-sort a page for a strict order. There is no price filter; `filters`
  takes `facets[].values[].filter`.
- `reviews`: Media Expert's own reviews by `sku`, `product_id` or `url`, up
  to 100 per page with every review reachable, 6 sorts, `rating_min` /
  `rating_max` and `verified`; `verified_purchase` and `incentivized` (a
  review from a Media Expert promotional campaign) flags; no reviewer
  identity.
- Not available: Q&A (Media Expert has none), leaflets, price history (poll
  and store the answers), unit counts, checkout prices, other countries or
  languages.

```typescript
// Prices: price, old price, the Omnibus 30-day low Media Expert shows, the code price.
const p = (await client.mediaexpert.product({ product_id: "8128227" })) as any;
console.log(p.data.name, p.data.price, p.data.old_price, p.data.omnibus_lowest_30d, p.data.code_price);

// Store stock: Media Expert's stock indicator at the 40 stores nearest a city or postcode.
const st = (await client.mediaexpert.storeStock({ product_id: "8128227", location: "Warszawa" })) as any;
console.log(st.data.in_stock_count, st.data.collect_in_1h_count);
for (const s of st.data.stores.slice(0, 3)) {
  console.log(s.name, s.distance_km, s.stock_level, s.collect_in_1h, s.order_to_store_day);
}

// Search: 30 per page; many single words redirect to a category page.
const res = (await client.mediaexpert.search({ query: "telewizor" })) as any;
console.log(res.data.redirected_to, res.data.total, res.data.total_capped);

// Black Weeks promotion lists, then one list's products.
const lists = (await client.mediaexpert.promotions({ black_weeks: true })) as any;
const bw = (await client.mediaexpert.promotions({ list: lists.data.lists[0].list })) as any;
console.log(bw.data.total, bw.data.items.length);

// Reviews by sku, 100 per page, verified purchases only.
const rv = (await client.mediaexpert.reviews({ sku: "709727", verified: true, limit: 100 })) as any;
console.log(rv.data.total, rv.data.reviews.map((r: any) => [r.rating, r.verified_purchase, r.incentivized]));
```

Every call raises the request timeout to `MEDIAEXPERT_TIMEOUT` (240s) and
never lowers a longer client timeout; failed calls are not charged, a
not-found is charged.

### [Action](https://scavio.dev/docs/action-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Action (action.com), the European non-food discount store: this week's
Action deals with their validity dates and week id, the same article's price
on each of the 19 Action storefronts, and the stores near a city or postcode
with opening hours. Sixteen endpoints on `client.action` (new in 0.75.0):
`search`, `product`, `products`, `category`, `categories`, `brand`, `brands`,
`newArrivals`, `weeklyDeals`, `collection`, `suggestions`, `stores`, `store`,
`reviews`, `webshopSearch` and `webshopProduct`. 1 credit per call.

- Markets: `country` nl (default), be, fr, lu, de, at, ch, it, es, pt, pl,
  cz, sk, ro, hr, si, plus `language` for be (nl or fr) and ch (de, fr or
  it). Prices are numbers in the market's currency (EUR; CHF, PLN, CZK, RON),
  never converted; titles and labels come back in the storefront's language,
  as Action writes them (Dutch on the default nl storefront).
- Article numbers (`product_code`) are the same in every market and prices
  are set per market: `products` prices up to 60 codes on one market per
  call, so one call per country compares an article across markets.
- `weeklyDeals`: `week_id` (e.g. Promo2026Week47), Action's `label` and ISO
  `valid_from` / `valid_to` dates; a deal week runs Wednesday to Tuesday and
  the assortment changes weekly; Belgium adds Action Plus `loyalty_deals`.
- `stores`: the 20 stores nearest a city, postcode or `lat` / `lng` (they may
  cross a border: `country_code` per store), with 7 dated days of opening
  hours. Action does not publish store stock.
- `reviews`: nl, de, fr and pl only (other countries answer 400, not
  charged), scope `local` (default, that storefront's language),
  `international` or `all`; no reviewer identity.
- `webshopSearch` / `webshopProduct`: shop.action.com (nl-nl, nl-be, fr-be),
  with EAN, online `stock_level` (not store stock), `order_limit` and
  `shipping_cost`. EANs come only from the webshop.
- Not available: store stock, price history (poll and store the answers),
  leaflets, checkout, other countries.

```typescript
// This week's deals: Action's week id and validity dates (Wednesday to Tuesday).
const wk = (await client.action.weeklyDeals()) as any;
console.log(wk.data.week_id, wk.data.valid_from, wk.data.valid_to, wk.data.total);

// One article number everywhere, priced per market: one call per country.
for (const country of ["nl", "de", "pl"] as const) {
  const r = (await client.action.products({ product_codes: ["3225277", "3011615"], country })) as any;
  console.log(country, r.data.currency, r.data.items.map((i: any) => [i.product_code, i.price]));
}

// The 20 stores nearest a city or postcode, with opening hours.
const st = (await client.action.stores({ query: "Amsterdam" })) as any;
for (const s of st.data.stores.slice(0, 3)) console.log(s.name, s.country_code, s.hours[0]);

// Search on the French-language Belgian storefront, then the webshop by EAN.
const res = (await client.action.search({ query: "noel", country: "be", language: "fr" })) as any;
console.log(res.data.total, res.data.items[0]?.price);
const web = (await client.action.webshopProduct({ ean: "8718969571098" })) as any;
console.log(web.data.stock_level, web.data.order_limit, web.data.shipping_cost);
```

Every call raises the request timeout to `ACTION_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls and refused inputs are not
charged, a not-found is charged.

### [HEMA](https://scavio.dev/docs/hema-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

HEMA (hema.com), the Dutch variety store: HEMA store stock (the sellable
units HEMA's store service reports per store, with the stock level, for up to
12 articles near a city or postcode), each article's dated price schedule with
upcoming promotions, and the same article number priced per market. Thirteen
endpoints on `client.hema` (new in 0.76.0): `search`, `product`, `category`,
`categories`, `newArrivals`, `sale`, `offers`, `campaign`, `suggestions`,
`storeStock`, `stores`, `store` and `reviews`. 1 credit per call.

- Markets: `country` nl (default, www.hema.nl), be (plus `language` nl or fr),
  fr, de; lu and at only on `storeStock`, `stores` and `store` (elsewhere a
  400, not charged). Prices are numbers in EUR; names, labels and promotion
  texts come back in the market's language, as HEMA writes them (Dutch on the
  default nl market). HEMA notes that online prices can differ from store
  prices.
- Article numbers (`sku`) are the same in every market and prices are set
  per market: one `product` call per country compares an article.
- `storeStock`: per store `sellable_units` and `stock_level` (full, regular or
  limited), shelf locations, hours, address and distance; stock as HEMA's
  store service reports it, not a promise that the shelf has it.
- `product`: EAN, colour / size variants, `price_schedule` (dated prices,
  upcoming promotions such as 2+1 gratis included), online stock,
  `sellable_in_store`, `order_limit`.
- `offers` (nl, be): HEMA's validity label as shown, the ISO `valid_to`, the
  week and the promotion cards (no products on that page). `campaign`:
  `christmas` (all markets) or `sinterklaas` (nl, be). `sale`: nl, be, de.
- `reviews`: HEMA's own reviews, pages 1 to 5 (8, then 30 more a page); nl, fr
  and de read the Dutch pool, be its own; no reviewer identity.
- No brands endpoint (HEMA sells its own brand). Not available: price history
  (poll and store the answers), checkout or ordering, the photo service and
  cake ordering, other countries (no UK or Spain).

```typescript
// HEMA store stock: sellable units per store near a city or postcode.
const st = (await client.hema.storeStock({ skus: ["15300147", "10860090"], query: "Utrecht" })) as any;
for (const s of st.data.stores.slice(0, 3))
  console.log(s.name, s.distance_km, s.stock.map((x: any) => [x.sku, x.sellable_units, x.stock_level]));

// One article: the dated price schedule with upcoming promotions.
const p = (await client.hema.product({ sku: "15300147" })) as any;
for (const row of p.data.price_schedule) console.log(row.valid_from, row.valid_to, row.price, row.promotion);

// The same article number priced per market.
for (const country of ["nl", "be", "fr", "de"] as const) {
  const r = (await client.hema.product({ sku: "15300147", country })) as any;
  console.log(country, r.data.price);
}

// Weekly offers, then a search on the French-language Belgian webshop.
const offers = (await client.hema.offers()) as any;
console.log(offers.data.label, offers.data.valid_to, offers.data.week);
const res = (await client.hema.search({ query: "bougie", country: "be", language: "fr" })) as any;
console.log(res.data.total, res.data.items[0]?.price);
```

Every call raises the request timeout to `HEMA_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls and refused inputs are not
charged, a not-found is charged.

### [AutoZone](https://scavio.dev/docs/autozone-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

AutoZone (autozone.com), the US auto parts retailer: AutoZone parts prices by
vehicle, the parts that fit a year / make / model in a part type, with price,
was price, deal price, core charge, warranty and pickup availability for the
store AutoZone prices the request for, plus part-number cross-reference,
reviews, the store directory, clearance and mail-in rebates. Twelve endpoints
on `client.autozone` (new in 0.77.0): `search`, `product`, `category`,
`brand`, `vehicles`, `reviews`, `stores`, `store`, `categories`, `clearance`,
`rebates` and `storeStock`. 1 credit per call; 2 on br `search`, br `product`
and `storeStock`.

- Markets: `country` us (default, autozone.com, USD) on every endpoint; br
  (autozone.com.br, Portuguese text, BRL) on `search`, `product`,
  `storeStock`, `vehicles`, `stores`, `store` and `categories`; mx
  (autozone.com.mx) on `vehicles`, `stores`, `store` and `categories` only.
  `category`, `brand`, `reviews`, `clearance` and `rebates` are us only.
- Prices: every price is AutoZone's price for the store AutoZone assigns to
  the request, named in `priced_for` (store number, address, city, state,
  ZIP). AutoZone prices differ by store, core charges too, so two calls can be
  priced for different stores; there is no store or ZIP input on us.
  `core_charge` is the refundable deposit AutoZone adds on parts like
  batteries until the old part is returned (0 when none).
- Lists (`search`, `category`, `brand`, `clearance`): the first 24 results with
  AutoZone's `total`, no paging; narrow with one facet filter, `min_price` /
  `max_price` or `sort` (relevance, price_asc, price_desc). List items carry
  no rating (`product` does).
- `search`: keywords, AutoZone part numbers and other brands' part numbers
  (cross-reference). AutoZone runs ranking tests (`ranking_variant`), so
  totals and order can differ between two identical calls.
- `category` with `vehicle` {year, make, model} (names as `vehicles` lists
  them): the parts that fit at year / make / model level; items AutoZone ties
  to an engine read `fitment.vehicle_fit` NEEDS_BASE_VEHICLE.
- `reviews` (us): 10 a page, full depth, sorts, a star filter, AutoZone's
  review summary on page 1, the reviewer's vehicle as written; no reviewer
  identity. `stores` walks states, cities and a city's stores; `store` reads
  one by slug; there is no stores-near-a-ZIP search.
- `storeStock`: Brazil only, one product at a Brazilian store you choose with
  its in-store quantity. Brazil `search` and `product` are priced for store
  7602 Sao Paulo (Interlagos).
- Not available: results past the first 24, stores near a ZIP, stock at a
  chosen US or Mexican store, search suggestions, VIN lookup, engine-level
  fitment, repair guides, AutoZonePro / commercial pricing, Mexico prices,
  price history (poll and store the answers), checkout.

```typescript
// Parts that fit one vehicle: brake pads for a 2018 Ford F-150, with core charge and warranty.
const fit = (await client.autozone.category({
  category: "/brakes-and-traction-control/brake-pads",
  vehicle: { year: 2018, make: "Ford", model: "F-150" },
})) as any;
console.log(fit.data.total, fit.data.priced_for);
for (const it of fit.data.items.slice(0, 3))
  console.log(it.part_number, it.price, it.core_charge, it.warranty, it.fitment.vehicle_fit);

// Another brand's part number finds the parts AutoZone matches to it.
const xref = (await client.autozone.search({ query: "PH3614" })) as any;
console.log(xref.data.total, xref.data.oem_part_number, xref.data.oem_brand);

// One product: price, deal, core charge, warranty, pickup and rating.
const p = (await client.autozone.product({ id: "1399158" })) as any;
console.log(p.data.price, p.data.deal_price, p.data.core_charge, p.data.warranty, p.data.availability.store_pickup);

// Brazil: one product at a Brazilian store you choose.
const st = (await client.autozone.storeStock({ id: "100112748", store_number: "9403" })) as any;
console.log(st.data.priced_for, st.data.price, st.data.in_store);
```

Every call raises the request timeout to `AUTOZONE_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls and refused inputs are not
charged, a not-found is charged.

### [Instacart](https://scavio.dev/docs/instacart-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Instacart (instacart.com), the US and Canada grocery delivery and pickup
marketplace: Instacart prices by store at a ZIP. Every store delivering to a
ZIP with its pricing label, one product priced at every one of those stores,
one query across up to 10 stores, and delivery, pickup or in-store prices
side by side. Eleven endpoints on `client.instacart` (new in 0.78.0):
`retailers`, `search`, `crossSearch`, `product`, `priceCompare`,
`categories`, `category`, `deals`, `stores`, `suggestions` and `reviews`. 1
credit per call; `search` 3 (2 when the page fits in Instacart's first
answer); `crossSearch` 3 for up to 5 stores, 4 for 6 to 10.

- Markets: `country` us (default, instacart.com, USD) on every endpoint; ca
  (instacart.ca, CAD, `zip` a Canadian postal code) on every endpoint except
  `crossSearch` and `reviews` (a 400, not charged). `language` fr (Canada)
  returns French names, aisles and price text as Instacart shows them in
  Quebec; `suggestions` are English only. Every endpoint but `reviews` takes a
  `zip`; a ZIP with no Instacart service area answers an empty list and a
  note.
- Prices: every price is Instacart's price for that store, ZIP and service
  type, named in `priced_for` with the retailer's `pricing_label` as Instacart
  shows it (e.g. Costco "Prices are higher than your local warehouse.").
  Retailers set their Instacart prices, which can be above their in-store
  prices, so an Instacart delivery price is not the store's shelf price;
  `service_type` instore returns Instacart's in-store prices where it shows
  them. `retailers` marks `no_markups` (Instacart's "No markups" label) and
  EBT per store.
- `product_id` is the same at every store, so a search result feeds
  `product`, `priceCompare` and `reviews` directly. `priceCompare` returns
  Instacart delivery prices sorted low to high, with no unit price or stock
  (`product` gives them per store).
- `product`: ingredients, warnings / allergens as given, the key nutrients
  Instacart lists (not a full nutrition panel), images, the store's price
  block and the rating summary. `deals`: the store's Sales collection (sale
  and regular price, multi-buy offers; no coupons). `stores`: pickup
  locations nearest first, 7 days of hours for the 5 nearest. `reviews` (us):
  15 a page, syndication `source`, `incentivized` flag; no reviewer identity.
- Not available: delivery and service fees or order minimums as numbers
  (Instacart shows them at checkout), coupons, Instacart+ member prices,
  account, order or cart data, price history (poll and store the answers).
  For direct shelf prices see the Kroger, Costco, ALDI, Publix and Whole
  Foods namespaces.

```typescript
// Every store serving a ZIP: the slug is the retailer input of the other endpoints.
const r = (await client.instacart.retailers({ zip: "10001" })) as any;
console.log(r.data.count, r.data.no_markups_count);
for (const s of r.data.retailers.slice(0, 5)) console.log(s.slug, s.name, s.delivery_eta, s.no_markups);

// One product priced at every store delivering to the ZIP, low to high.
const cmp = (await client.instacart.priceCompare({ product_id: "16408559", zip: "10001" })) as any;
for (const p of cmp.data.prices.slice(0, 5)) console.log(p.retailer_name, p.price, p.was_price, p.no_markups);

// One store's search, then the same product's delivery and in-store price.
const res = (await client.instacart.search({ query: "yogurt", retailer: "jewel-osco", zip: "60540", limit: 10 })) as any;
console.log(res.data.priced_for.pricing_label, res.data.total);
const del = (await client.instacart.product({ product_id: "16408559", retailer: "wegmans", zip: "10001" })) as any;
const ins = (await client.instacart.product({ product_id: "16408559", retailer: "wegmans", zip: "10001", service_type: "instore" })) as any;
console.log(del.data.item?.price, ins.data.item?.price, del.data.item?.unit_price);

// Canada in French: CAD prices and French names at a Montreal store.
const fr = (await client.instacart.search({ query: "lait", retailer: "metro", zip: "H2X1Y4", country: "ca", language: "fr" })) as any;
console.log(fr.data.currency, fr.data.items[0]?.price_text);
```

Every call raises the request timeout to `INSTACART_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls and refused inputs are not
charged, a not-found is charged.

### [O'Reilly Auto Parts](https://scavio.dev/docs/oreilly-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

O'Reilly Auto Parts (oreillyauto.com), the US auto parts retailer: O'Reilly
part-number cross-reference with prices. Another brand's, AutoZone's or an OE
part number in, O'Reilly's matching parts out with price, core charge,
rebates and pickup near a ZIP; plus the parts that fit a vehicle, VIN decode,
store stock near a ZIP and the store directory (US and Mexico). Fourteen
endpoints on `client.oreilly` (new in 0.79.0): `search`, `crossReference`,
`product`, `vehicles`, `compatibility`, `category`, `categories`, `brand`,
`storeStock`, `stores`, `store`, `suggestions`, `rebates` and `deals`. 2
credits per call; `product` by `line_code` + `part_number` 4 (by link 2);
`crossReference` 2 with `part_type_id` + `manufacturer`, 4 with one of them or
when several manufacturers use the number, 6 with neither when one
manufacturer matches; `brand` index (no brand) 4; `storeStock` and `stores` by
`zip` 4 (by `latitude` + `longitude`, or the directory, 2); `deals` 4. Pair it
with `client.autozone` for a two-store parts price check on the same part.

- Markets: `country` us (default, oreillyauto.com, USD) on every endpoint; mx
  on `stores` and `store` only (O'Reilly's Mexican store directory, in
  Spanish; Mexico shows no prices, so mx elsewhere is a 400, not charged).
- Prices: every price is O'Reilly's price for the store O'Reilly assigns to
  the request, named in `priced_for` (store id, address, city, state, ZIP).
  O'Reilly prices differ by store, so two calls can be priced for different
  stores; there is no store or ZIP input for prices. `core_charge` is the
  refundable deposit O'Reilly adds on parts like batteries until the old part
  is returned (0 when none).
- Lists (`search`, `category`, `brand`, `crossReference`): 24 a page, `page`
  1-20 (O'Reilly serves 20 pages; above 20 is a 400, not charged); sorts
  `relevance`, `price_desc`, `price_asc`, `best_selling`, `brand`; filters
  `brand`, `availability` (`store_pickup`, `home_delivery`) and up to 4
  attribute facets. List items carry no rating (`product` does).
- Fitment: `vehicle` takes `{ base_vehicle_id }` from
  `vehicles({ level: "resolve" })`; O'Reilly pins year, make and model with it
  and submodel and engine show in `fit_notes`. `vehicles({ level: "vin" })`
  decodes a 17-character VIN. On `product`, `vehicle_fit.fits` is true or null,
  never false: check fit with a vehicle `search` / `category` or
  `compatibility`.
- `crossReference`: another brand's or an OE part number to O'Reilly's parts
  (it can return 0 matches); when several manufacturers use the number and
  none is sent, the answer is the lists to choose from with no items.
- `product`: UPC, specifications, documents, deals, rebates, rating and the 10
  most recent reviews (no paging, sort or star filter; no reviewer identity).
  `storeStock`: stores within 50 miles that can hand over the part, as
  availability states (in store now, store pickup, pickup time), not unit
  counts. `stores`: the 25 nearest within 50 miles with hours and services, or
  the directory by state (+ city).
- Not available: unit counts in store stock, a chosen store for prices,
  reviews past the 10 most recent, Q&A, Mexico prices or catalog, Canada,
  license-plate lookup, the weekly ad, repair guides or trouble codes,
  O'Reilly Pro / First Call Online commercial pricing, price history (poll and
  store the answers), checkout.

```typescript
// Another brand's part number in, O'Reilly's matching parts out, priced.
const xref = (await client.oreilly.crossReference({ part_number: "PH3614", part_type_id: "02269", manufacturer: "FRAM" })) as any;
console.log(xref.data.total, xref.data.replacing_brands, xref.data.priced_for);
for (const it of xref.data.items.slice(0, 3)) console.log(it.line_code, it.part_number, it.name, it.price, it.core_charge);

// Parts that fit one vehicle: resolve the base_vehicle_id, then search with it.
const v = (await client.oreilly.vehicles({ level: "resolve", year: 2015, make_id: 23076, model_id: 31549 })) as any;
const fit = (await client.oreilly.search({ query: "brake pads", vehicle: { base_vehicle_id: v.data.vehicle.base_vehicle_id } })) as any;
console.log(fit.data.total, fit.data.vehicle);

// One product: price, core charge, deals, rebates, rating and the 10 most recent reviews.
const p = (await client.oreilly.product({ line_code: "BB", part_number: "SC1001" })) as any;
console.log(p.data.priced_for, p.data.price, p.data.core_charge, p.data.rating, p.data.reviews.length);

// Which stores near a ZIP can hand over the part (states, not unit counts).
const stock = (await client.oreilly.storeStock({ line_code: "SSB", part_number: "48PLT", zip: "60540" })) as any;
for (const s of stock.data.stores.slice(0, 3)) console.log(s.store_id, s.distance_miles, s.availability);
```

Every call raises the request timeout to `OREILLY_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls and refused inputs are not
charged, a not-found is charged.

### [Ace Hardware](https://scavio.dev/docs/acehardware-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Ace Hardware (acehardware.com), the US hardware cooperative: Ace Hardware
prices by store. An item's price at the Ace store you pick (named in
`priced_for`), exact units on hand at that store and its 25 nearest, and that
store's weekly ad; plus search, categories, brands, deals with promo codes,
store details and Ace's paint colours. Eleven endpoints on
`client.acehardware` (new in 0.80.0): `search`, `product`, `storeStock`,
`store`, `stores`, `category`, `categories`, `brand`, `deals`, `weeklyAd` and
`paintColors`. 1 credit per call; `search` 2 (3 when Ace redirects the search
to a category and the list options are applied to it); `product` 2 (with or
without `store`); `storeStock` 1 per 5 stores (1 store 1, 25 stores 5,
`nearby` 6); `stores` with `details` 1 lookup per store (25 stores 6). An
occasional call costs 2 instead of 1; `credits_used` in the response is what
was charged. Pair it with `client.homeDepot` and `client.lowes` for a local
hardware price check on the same item (brand + model).

- Market: US only (acehardware.com, USD); no method takes `country`.
- Prices: Ace stores are independently owned and operated, and the same item
  can be priced differently at different stores (Ace's terms: pricing varies
  by location). `product` with `store` (a 5-digit Ace store number, as a
  string to keep leading zeros, e.g. `"03085"`) returns the price as Ace shows
  it for that store, with `priced_for` {store_id, price_list}; without a store,
  `priced_for` names the price list Ace used (`CORP` is Ace's online price).
  `msrp` is reported as Ace gives it and can be below a store's price.
  Captured 2026-11-23: item 72779 (Ace ice melt, 40 lb) at $35.99 for store
  10665 (New York), $21.99 for 18250 (Chicago), $18.99 for 03085 (Kalona,
  Iowa).
- Lists (`search`, `category`, `brand`, `deals`): the price Ace shows in its
  listing (`price_list` per item), not a store's price; 15, 30 (default), 50,
  100 or 200 a page; sorts `relevance`, `price_asc`, `price_desc`, `name_asc`,
  `name_desc`, `newest`, `oldest`; filters `brand`, `offer` (`sale`,
  `ace_rewards`, `buy_and_get`, `buy_more_save`), `on_sale` and facet
  `filters`. `deals` adds Ace's site-wide promotions with codes and dates.
- Stores: no store search by ZIP or city. Store numbers are in every Ace store
  page link (acehardware.com/store-details/<number>); `stores` lists the 25
  stores Ace names as nearest to one store. `storeStock` returns exact units on
  hand (`units_in_stock`, `soft_units`, shelf `location_code`, regional
  distribution centre units); Ace answers 0 for a store number or product it
  does not know, exactly as for one out of stock. `weeklyAd` returns one
  store's circular with `valid_from` / `valid_to` and the ad's own price text.
- Not available: review or Q&A text (rating and count only), search
  suggestions, ZIP or city store search, pickup or delivery dates, price
  history (poll and store the answers), Ace Rewards member prices, Ace
  Handyman, rentals, Ace-licensed stores outside the US, checkout.

```typescript
// The same item priced for three Ace stores.
for (const store of ["10665", "18250", "03085"]) {
  const p = (await client.acehardware.product({ product_code: "72779", store })) as any;
  console.log(store, p.data.priced_for, p.data.price, p.data.msrp);
}

// Exact units on hand at chosen stores, or at one store and its 25 nearest (6 credits).
const stock = (await client.acehardware.storeStock({ product_code: "72779", stores: ["18250", "17309"] })) as any;
for (const s of stock.data.stores) console.log(s.store_id, s.units_in_stock, s.location_code);
const nearby = (await client.acehardware.storeStock({ product_code: "72779", store: "18250", nearby: true })) as any;
console.log(nearby.data.count, nearby.data.in_stock_count, nearby.data.total_units);

// One store's weekly ad, and the stores nearest a store.
const ad = (await client.acehardware.weeklyAd({ store: "18250" })) as any;
console.log(ad.data.title, ad.data.valid_from, ad.data.valid_to, ad.data.total_pages);
const near = (await client.acehardware.stores({ store: "03085", details: true, limit: 4 })) as any;

// Lists carry Ace's listing price, not a store's price.
const hits = (await client.acehardware.search({ query: "brass hose nozzle" })) as any;
const deals = (await client.acehardware.deals({ offer: "sale" })) as any;
console.log(hits.data.total, deals.data.promotions.map((p: any) => p.code));
```

Every call raises the request timeout to `ACEHARDWARE_TIMEOUT` (240s) and
never lowers a longer client timeout; failed calls and refused inputs are not
charged, a not-found is charged.

### [Tractor Supply](https://scavio.dev/docs/tractorsupply-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Tractor Supply (tractorsupply.com), the US rural lifestyle retailer: an
item's price at the store you pick (named in `priced_for` with the store's
price zone), one item's price at up to 25 stores in one call, exact units per
store with in-transit stock and its pickup date, and pickup and delivery
options for a ZIP; plus search, categories, brands, deals, promotions with
dates and store details. Twelve endpoints on `client.tractorsupply` (new in
0.81.0): `search`, `product`, `storePrices`, `storeStock`, `fulfillment`,
`stores`, `store`, `category`, `categories`, `brand`, `deals` and
`promotions`. 1 credit per call; `product` 2 on the first call for a store not
yet looked up; `storePrices` 1 per 5 lookups (each store's price, a store's
details when not yet known, the item: 25 new stores cost 11). `credits_used`
in the response is what was charged. Pair it with `client.acehardware`,
`client.walmart` and `client.chewy` for a price check on the same item.

- Market: US only (tractorsupply.com, USD); no method takes `country`.
- Prices: Tractor Supply prices by store, so `search`, `product`, `category`,
  `brand` and `deals` need `store` (a Tractor Supply store number, e.g.
  `"1933"`) or `zip` (the nearest store Tractor Supply lists for it is used);
  there is no default store. Every price answer carries `priced_for`
  {store_id, zone, city, state, from, zip}. Tractor Supply's terms note that
  prices may vary in different geographic markets, and the same item can be
  priced differently at different stores. Captured 2026-11-24: Producer's
  Pride 16% Layer Pellets, 50 lb (item 2340147) at $14.49 for store 1933
  (Glendive, MT, zone 81) and $20.19 for store 1923 (Port Orchard, WA, zone
  92). Some items carry a manufacturer's minimum advertised price (`mapp`) and
  show one price everywhere.
- Lists (`search`, `category`, `brand`, `deals`): 24 (default), 48, 96 or 200
  a page, pages 1-100; sorts `popular`, `rating`, `name_asc`, `name_desc`,
  `price_asc`, `price_desc`, `recent`, `new_arrivals`; filters `brand`,
  `on_sale`, `new`, `pickup`, `rating` and facet `filters`. `deals` lists
  products on sale (`type: "sale"`, default) or new arrivals (`type: "new"`).
- Items and stores: item numbers are 7 digits (`items[].item_number`), the
  input of `product`, `storePrices`, `storeStock`, `fulfillment` and
  `promotions`. `storeStock` returns units as Tractor Supply reports them (not
  a promise), status and in-transit units with the pickup date. `stores` lists
  the stores nearest a ZIP with address, hours, price zone, services (propane,
  trailer rental, PetVet, pet wash, ...) and dated store events.
- Not available: review or Q&A text (rating and count only), search
  suggestions, the weekly ad, a clearance list, price history (poll and store
  the answers), Neighbor's Club member prices, live chick availability,
  Petsense, checkout.

```typescript
// The same bag of feed priced for two stores (store or zip is required).
for (const store of ["1933", "1923"]) {
  const p = (await client.tractorsupply.product({ item_number: "2340147", store })) as any;
  console.log(store, p.data.priced_for.zone, p.data.price, p.data.mapp);
}

// One item at up to 25 stores in one call.
const sp = (await client.tractorsupply.storePrices({ item_number: "2340147", stores: ["1933", "1923"] })) as any;
console.log(sp.data.price_range);
for (const s of sp.data.stores) console.log(s.store_id, s.city, s.state, s.zone, s.price);

// Exact units at the stores nearest a ZIP, with stock in transit.
const stock = (await client.tractorsupply.storeStock({ item_number: "2340147", zip: "59301" })) as any;
console.log(stock.data.count, stock.data.in_stock_count, stock.data.total_units, stock.data.in_transit_units);

// Pickup and delivery options for one item at one store and a ZIP.
const f = (await client.tractorsupply.fulfillment({ item_number: "2340147", store: "1933", zip: "59330" })) as any;
console.log(f.data.pickup, f.data.delivery_options.map((o: any) => [o.type, o.delivery_date]));

// Lists priced for one store, and an item's promotions with dates.
const hits = (await client.tractorsupply.search({ query: "layer pellets", store: "1933" })) as any;
const sale = (await client.tractorsupply.deals({ store: "1933" })) as any;
const promos = (await client.tractorsupply.promotions({ item_number: "3609112" })) as any;
console.log(hits.data.total, sale.data.total, promos.data.promotions.map((p: any) => [p.name, p.starts, p.ends]));
```

Every call raises the request timeout to `TRACTORSUPPLY_TIMEOUT` (240s) and
never lowers a longer client timeout; failed calls and refused inputs are not
charged, a not-found is charged.

### [Michaels](https://scavio.dev/docs/michaels-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Michaels (michaels.com), the US and Canada arts and crafts retailer: units of
one SKU at the Michaels stores near a ZIP or postal code exactly as Michaels
reports them, units of up to 30 SKUs at one store, a product with every colour
and size, its price next to Michaels' own "Reg." label and its promotions with
Michaels' own start and end dates; plus search, categories, brands, deals,
stores and search suggestions. Eleven endpoints on `client.michaels` (new in
0.82.0): `search`, `product`, `storeStock`, `storeInventory`, `stores`,
`store`, `category`, `categories`, `brand`, `deals` and `suggestions`. 2
credits per call; `category` and `deals` 4 when the category is a `/shop/`
link or path (a code path costs 2). `credits_used` in the response is what was
charged. Pair it with `client.walmart` and `client.amazon` (and the
[Etsy API](https://scavio.dev/etsy-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme))
for a price check on the same item.

- Markets: `country` `"us"` (default, www.michaels.com, USD) or `"ca"`
  (canada.michaels.com, CAD); `language` `"en"` (default) or `"fr"` (with
  `"ca"` only). `stores`, `categories` and `suggestions` are US only. With
  `"ca"` a category is a code path (search facets list them).
- Prices: national per country; the store does not change them, it matters
  for stock. `was_price_text` keeps Michaels' own label; `discount_percent` is
  arithmetic on the two prices. Captured 2026-11-24: Cricut Explore 5 in Teal
  & Essential Bundle (SKU 10816737) at $199.00 next to "Reg.$249.00" on
  www.michaels.com and CAD 269.99 next to "Reg.$349.99" on
  canada.michaels.com.
- Stock: `storeStock` returns units as Michaels reports them for pickup (not a
  promise); virtual or pop-up stores appear with 0 units and `virtual: true`.
  Captured: Soft Classic Solid Yarn by Loops & Threads (SKU 10228177) at 85
  units in store 1191 (New York). `online_stock` on a product is Michaels'
  online stock, not a store's.
- Lists (`search`, `category`, `brand`, `deals`): up to 100 a page (default
  40); sorts `best_match`, `best_sellers`, `new_arrivals`, `price_asc`,
  `price_desc`, `rating`; filters `brand`, price, rating, store pickup,
  same-day, ship to me, sale, new, clearance, great buy, `seller` and facet
  `filters` ({key: [values]}). Michaels items and Marketplace items come
  together (`seller_type`); Marketplace items carry a seller id, no seller
  name. Keywords go in `q`. A UPC search answers with the product group's lead
  SKU.
- Not available: review or Q&A text (rating and count only), the weekly ad,
  coupons, classes and events, aisle locations, Marketplace seller names,
  custom framing, price history (poll and store the answers), checkout.

```typescript
// One skein's units at the Michaels stores near a ZIP.
const stock = (await client.michaels.storeStock({ sku: "10228177", zip: "10001" })) as any;
for (const s of stock.data.stores) console.log(s.store_id, s.name, s.units, s.pickup_text, s.virtual);

// Up to 30 SKUs at one store.
const inv = (await client.michaels.storeInventory({ store: "1191", skus: ["10228177", "10816737"] })) as any;
console.log(inv.data.items, inv.data.not_reported);

// Price next to Michaels' own Reg. label, promotions with dates, every variant.
const p = (await client.michaels.product({ sku: "10228177" })) as any;
console.log(p.data.price, p.data.was_price_text, p.data.online_stock, p.data.pro_pack);
console.log(p.data.promotions.map((x: any) => [x.text, x.starts, x.ends]));
console.log(p.data.variants.map((v: any) => [v.sku, v.options, v.price, v.upc]));

// The same item in Canada (CAD), and lists.
const ca = (await client.michaels.product({ sku: "10816737", country: "ca" })) as any;
const hits = (await client.michaels.search({ q: "yarn", sort: "price_asc", on_sale: true })) as any;
const xmas = (await client.michaels.deals({ q: "christmas" })) as any;
console.log(ca.data.price, ca.data.was_price_text, hits.data.total, xmas.data.total);
```

Every call raises the request timeout to `MICHAELS_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls and refused inputs are not
charged, a not-found is charged.

### [Nike](https://scavio.dev/docs/nike-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Nike (nike.com, including Jordan Brand): Nike's sale price next to its own
full price and discount percent as Nike gives them, every size with its GTIN,
and Nike's launch calendar with price, release start, method and a per-size
level for each launch item; the same style code priced on 62 storefronts in 42
countries, each in its own currency. Eight endpoints on `client.nike` (new in
0.83.0): `search`, `product`, `category`, `brand`, `deals`, `releases`,
`release` and `reviews`. 1 credit per call; `credits_used` in the response is
what was charged. Nike has no public API for catalog, prices or launches. Pair
it with `client.footlocker`, `client.dicks`, `client.amazon` and `client.ebay`
for a price check on the same style code.

- Markets: `country` is a two-letter storefront code (default `"us"`,
  www.nike.com; `"cn"` is www.nike.com.cn) and `language` picks the storefront
  language where a country has several (`ch`: de, en, fr, it; `be`: nl, de,
  en, fr; `ca`: en, fr; `us`: en, es; `jp`: ja, en). `releases` and `release`
  are not offered on `vn`, `cn` or `jp` in English; `reviews` is not offered
  on `cn`.
- Prices: per storefront, and they differ between markets, also inside the
  euro zone. `price`, `full_price` and `discount_percent` are as Nike gives
  them; `promotions` carry Nike's offer text with its dates. Captured
  2026-11-24: the Nike Dunk Low (style color DD1503-103) at $78.97 next to a
  $120 full price (34%) on www.nike.com, £54.99 next to £109.99 (50%) on
  nike.com/gb, €59.99 next to €119.99 (50%) on nike.com/fr and ¥17,050 on
  nike.com/jp.
- Lists (`search`, `category`, `brand`, `deals`): Nike's first page only (the
  24 product groups Nike's page shows first; `total` and `total_pages` as Nike
  gives them); sorts `featured`, `newest`, `price_high`, `price_low`; `filter`
  takes facet tokens from an earlier answer (one on `search`, up to 6 on the
  others). Keywords go in `q`.
- Sizes and launches: `product` lists every size with its GTIN and Nike's
  status (sizes, not stock levels). Launch items carry `method` (LINE or DRAW,
  as Nike labels it) and a per-size `level` (HIGH, MEDIUM, LOW or OOS as Nike
  gives it); before a launch Nike can show LOW on every size. Read-only data:
  no entry or purchase.
- Not available: store locator, in-store or pickup stock, stock levels for
  regular products, review paging or Q&A (`reviews` is the summary and the 3
  newest reviews), search suggestions, pages past the first, member prices,
  gift cards, Nike Factory store prices, Converse, checkout.

```typescript
// Price next to Nike's full price, every size with its GTIN, colorways.
const p = (await client.nike.product({ style_color: "DD1503-103" })) as any;
console.log(p.data.price, p.data.full_price, p.data.discount_percent, p.data.currency);
console.log(p.data.sizes.map((s: any) => [s.label, s.gtin, s.status]));

// The same style color on other storefronts, each in its own currency.
for (const country of ["gb", "fr", "jp"] as const) {
  const r = (await client.nike.search({ q: "DD1503-103", country })) as any;
  console.log(country, r.data.items[0]?.price, r.data.market.currency);
}

// The launch calendar: price, release start, method and per-size level.
const cal = (await client.nike.releases()) as any;
for (const l of cal.data.launches) console.log(l.style_color, l.name, l.release_start, l.method, l.sizes.map((s: any) => s.level));

// Lists and a review summary.
const jordan = (await client.nike.brand({ brand: "jordan", sort: "newest" })) as any;
const sale = (await client.nike.deals({ gender: "women" })) as any;
const r = (await client.nike.reviews({ style_color: "CW2288-111" })) as any;
console.log(jordan.data.total, sale.data.total, r.data.total_reviews, r.data.average_rating, r.data.review_summary);
```

Every call raises the request timeout to `NIKE_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls and refused inputs are not
charged, a not-found is charged.

### [Staples](https://scavio.dev/docs/staples-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Staples (staples.com, the US office supply retailer; Staples Canada at
staples.ca): an ink cartridge's price next to Staples' own cost per page and
the stated page yield, copy paper per ream, and the units of one item at the
Staples stores near a ZIP exactly as Staples reports them. Twelve endpoints on
`client.staples` (new in 0.84.0): `search`, `product`, `category`,
`categories`, `deals`, `coupons`, `storeStock`, `stores`, `store`, `reviews`,
`questions` and `trending`. 1 credit per call; `credits_used` in the response
is what was charged. Staples has no public API for its catalog, prices or
store stock (Staples Business Advantage connects contract buyers' purchasing
systems). Pair it with `client.amazon`, `client.walmart`, `client.target` and
`client.bestbuy` for a price check on the same item.

- Markets: `country` is `"us"` (default, www.staples.com, USD) or `"ca"`
  (www.staples.ca, Staples Canada, CAD) and `language` is `"en"` (default) or
  `"fr"` (with `"ca"` only), on `search` and `product`; every other method is
  US only. With `"ca"`, `search` returns Staples Canada's top matches (about
  5; no paging, sort or filters) and `product` takes `item_id`, `handle` or a
  staples.ca link.
- Prices: national. The ZIP changes delivery availability and dates, the store
  changes pickup units, neither changes the price. `price` and `was_price` are
  as Staples shows them (`was_price` is Staples' Regular price, given only when
  above the price); `discount_percent` is computed by Scavio from the two.
  `price_per_unit_text` is Staples' own. Captured 2026-11-24: Hammermill Copy
  Plus (item 122374, 10 reams) at $49.99 next to Staples' Regular $83.19, at
  "$5.00/Ream", with "Offer Expires on 11/28/2026"; the HP 64XL Black High
  Yield cartridge (item 2724258, "Prints Up to 600 Pages") at Staples' own
  "$0.10 Cost Per Page".
- Lists (`search`, `category`, `deals`): 40 a page to page 250; sorts
  `best_match`, `price_low`, `price_high`, `rating`, `newest`; `brand` (up to
  5), `filters` (facet values from an earlier answer, up to 10), `min_price`,
  `max_price`, and the On Promotion / Clearance deal filters. An item number in
  `q` answers with that product. Keywords go in `q`.
- Store stock: `storeStock` lists only the stores near a US ZIP that have the
  item for pickup, nearest first, with units as Staples reports them and the
  pickup text ("Ready in 30 mins"). The same HP 64XL showed 7 stores near ZIP
  60540 with 63 units in all (12 at store 1633, Naperville). An empty list
  means no nearby store has it or it is not offered for store pickup. Staples
  returns a `threshold` value beside the units; it is passed through as given.
- Product extras: `page_yield`, `sheets_per_ream`, `promotions` and
  `offer_expires` (Staples' own texts and expiry), `coupon_codes`, ream /
  carton variants, delivery dates for a `zip` and pickup units at a `store`.
  staples.com publishes no UPC (`model` is the manufacturer part number);
  Staples Canada products carry a `barcode`.
- Reviews and Q&A: `reviews` pages up to 100 a page with 6 sorts, star and
  photo filters, verified and incentivized flags and Staples' own review
  summary; `questions` returns 10 a page with their answers. No reviewer
  names.
- Not available: the weekly ad, search suggestions, print and tech service
  prices, ink recycling rewards, Rewards member prices, price match requests,
  Staples Business Advantage contract prices, price history (poll and store
  the answers), checkout.

```typescript
// Search: 40 a page with Staples' own price per unit.
const hits = (await client.staples.search({ q: "copy paper", sort: "price_low" })) as any;
for (const it of hits.data.items.slice(0, 5)) console.log(it.item_id, it.name, it.price, it.was_price, it.price_per_unit_text);

// One product: price per unit, page yield, promotions with expiry, delivery for a ZIP, pickup units at a store.
const p = (await client.staples.product({ item_id: "122374", zip: "60540", store: "1633" })) as any;
console.log(p.data.price, p.data.was_price, p.data.price_per_unit, p.data.price_per_unit_unit, p.data.offer_expires);
console.log(p.data.availability.pickup, p.data.availability.options.map((o: any) => [o.mode, o.date_text]));

// Units of one item at the stores near a ZIP that have it.
const ss = (await client.staples.storeStock({ item_id: "2724258", zip: "60540" })) as any;
console.log(ss.data.count, ss.data.total_units);
for (const s of ss.data.stores) console.log(s.store_number, s.address.city, s.distance_miles, s.units, s.pickup_text);

// Canada in English or French (CAD), with a barcode on the product.
const ca = (await client.staples.search({ q: "hp 67", country: "ca" })) as any;
const cp = (await client.staples.product({ handle: ca.data.items[0].handle, country: "ca" })) as any;
console.log(cp.data.name, cp.data.price, cp.data.currency, cp.data.barcode);

// Reviews (up to 100 a page), questions, coupons.
const rv = (await client.staples.reviews({ item_id: "24430099", limit: 100, sort: "newest" })) as any;
const qa = (await client.staples.questions({ item_id: "990119" })) as any;
const coupons = (await client.staples.coupons()) as any;
console.log(rv.data.total, rv.data.rating, qa.data.total, coupons.data.coupons.map((c: any) => [c.code, c.headline, c.ends]));
```

Every call raises the request timeout to `STAPLES_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls and refused inputs are not
charged, a not-found is charged.

### [Dollar Tree](https://scavio.dev/docs/dollartree-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Dollar Tree (dollartree.com, the US and Canada discount variety store chain):
an item's online case price next to its unit price, case pack, minimum order
and split-case multiple as Dollar Tree gives them, and the units of one
item at a Dollar Tree store plus its nearby stores. Ten endpoints on
`client.dollartree` (new in 0.85.0): `search`, `product`, `category`,
`categories`, `brand`, `deals`, `storeStock`, `stores`, `store` and `reviews`.
1 credit per call, `stores` 5; `credits_used` in the response is what was
charged. Dollar Tree has no public API for its catalog, prices or store stock
(suppliers work through its vendor portal and EDI). Pair it with
`client.dollarGeneral`, `client.walmart`, `client.target` and
`client.instacart` for a price check on the same item.

- Markets: every method is US only (www.dollartree.com, USD) except `store`,
  which also takes `country: "ca"` (Dollar Tree Canada store pages, English,
  no prices). Dollar Tree Canada has no shopping site.
- Prices: Dollar Tree's online unit prices from one national online price list
  (the same at every store and ZIP measured); Dollar Tree notes that prices and
  availability may vary between stores and online, and in-store shelf prices
  are not published online. Online orders are by the case: captured 2026-11-24,
  item 221159 (9-in. White Paper Plates, 40-ct. Packs) at $1.50 a unit,
  `case_pack` 30, `case_price` $45.00, `minimum_quantity` 5. A case pack or
  case price Dollar Tree gives as 0 is null, never computed; stores sell single
  units. `split_case` is `{available, multiple}`: `available` is computed by
  Scavio as `minimum_quantity < case_pack` (item 221159: true, multiple 5).
  `product` adds `split_case_fee`, Dollar Tree's raw field as given (its
  meaning is not published, so it is not a fee), and `banner_code` (DT or FD),
  not a store-brand flag.
- Lists (`search`, `category`, `brand`, `deals`): 48 a page by default (up to
  250) to page 200; sorts `relevance`, `price_low`, `price_high`, `newest`,
  `rating`; `filters` (facet ids from an earlier answer, up to 10),
  `price_point`, `rating`, `in_store_only`, `min_price`, `max_price`. An item
  number in `q` answers with that item; UPCs are not matched. `deals` types:
  `sale`, `clearance`, `new` (New Arrivals), `more_choices` (More Choices,
  Dollar Tree's multi-price assortment). No validity dates, no weekly ad.
- Store stock: `storeStock` needs a store number (from `stores`; a ZIP alone
  does not pick a store) and returns the units at that store (`store.status`
  can be null), up to about 63 nearby stores by store number (none at some
  rural stores), `ship_to_home {available, dc_number, cases, case_size,
  max_order_units, eta, express_eta, back_order}` and `ship_to_store` with its
  `dc_number`. `max_order_units` is the most units orderable for delivery, the
  same at every store, not `cases x case_size`. Item 221159 showed 116 units at
  store 5126 (New York) and 63 nearby stores, 59 of them with stock;
  `ship_to_home` came from distribution centre 99006 with 2,374 cases of 30 and
  `max_order_units` 75,570.
- Changed in 0.85.1: `split_case.fee` and `store_brand` removed,
  `split_case_fee` and `banner_code` added on `product`, `ship_to_home.units`
  replaced by `max_order_units`, `dc_number` added to `ship_to_home` and
  `ship_to_store`.
- Reviews: the newest English reviews, up to about 98 per call, with the
  rating breakdown; many are syndicated from brand sites and flagged. No other
  sort, no star filter, no Q&A, no reviewer names.
- Slow: `storeStock`, `stores` and `reviews` usually take 10-35 s, up to about
  2.5 minutes.
- Not available: search suggestions, the weekly ad, deal validity dates, Quick
  Order / bulk ordering, gift cards, Canada products and prices, price history
  (poll and store the answers), checkout.

```typescript
// Search: unit price next to Dollar Tree's own case price and case pack.
const hits = (await client.dollartree.search({ q: "paper plates", sort: "price_low" })) as any;
for (const it of hits.data.items.slice(0, 5)) console.log(it.item_id, it.name, it.price, it.case_price, it.case_pack, it.minimum_quantity);

// One item: case price, case pack, minimum quantity, split case, online stock.
const p = (await client.dollartree.product({ item_id: "221159" })) as any;
console.log(p.data.price, p.data.case_price, p.data.case_pack, p.data.minimum_quantity, p.data.split_case, p.data.online_stock);

// Stores near a ZIP (5 credits), then units at one store and its nearby stores.
const near = (await client.dollartree.stores({ zip: "60540" })) as any;
const ss = (await client.dollartree.storeStock({ item_id: "221159", store: near.data.stores[0].store_number })) as any;
console.log(ss.data.store.units, ss.data.nearby_in_stock, ss.data.nearby_stores.length, ss.data.ship_to_home.max_order_units, ss.data.ship_to_home.eta);

// A Canada store page, and the newest reviews with syndication flags.
const ca = (await client.dollartree.store({ slug: "on/toronto/2340-eglinton-ave-west", country: "ca" })) as any;
const rv = (await client.dollartree.reviews({ item_id: "206652" })) as any;
console.log(ca.data.hours, rv.data.rating, rv.data.reviews.map((r: any) => [r.rating, r.syndicated, r.syndication_source]));
```

Every call raises the request timeout to `DOLLARTREE_TIMEOUT` (240s), and
`storeStock`, `stores` and `reviews` to `DOLLARTREE_SLOW_TIMEOUT` (300s); a
longer client timeout is never lowered. Failed calls and refused inputs are
not charged, a not-found is charged.

### [Discount Tire](https://scavio.dev/docs/discounttire-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Discount Tire (discounttire.com, the US tire and wheel retailer, America's
Tire in parts of CA, PA, NJ and NY): the price of a tire at a named store, the
same tire at other Discount Tire and America's Tire stores, the tires that fit
a vehicle with the original-equipment tire flagged and staggered front / rear
sets, and the exact units at the stores near a ZIP. Fifteen endpoints on
`client.discounttire` (new in 0.86.0): `search`, `vehicle`, `vehicleTires`,
`product`, `model`, `storeStock`, `stores`, `store`, `reviews`,
`storeReviews`, `wheels`, `browse`, `categories`, `suggestions` and
`appointments`. 1 credit per call; `credits_used` in the response is what was
charged. Discount Tire has no public product API (it runs an affiliate
programme through CJ, and fleet customers use an account portal). Pair it with
`client.walmart`, `client.samsClub` and `client.amazon` for the same tire
(match on manufacturer part number or GTIN), and with `client.autozone` and
`client.oreilly` for parts. See the
[Discount Tire API page](https://scavio.dev/discounttire-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme).

- Market: US only (www.discounttire.com, USD); Discount Tire and America's
  Tire are one catalog. No method takes a country.
- Prices are per store: `search`, `vehicleTires`, `product`, `model`, `wheels`
  and `browse` take `store` (a store code from `stores`) or `zip` (the nearest
  store is used), and every answer names the store used in `store`. Price can
  differ between stores and is not different at every store: measured
  2026-11-25, Michelin Defender 2 225/65R17 (item 108547) was $206 a tire at 9
  stores in 8 states and $205 at an America's Tire store in New Jersey; across
  45 tires, the stores measured in Texas, Florida and Washington showed no
  differences, a California store 1, a Michigan store 3 and the New Jersey
  store 13 of 32.
- `price` is per tire or wheel: Discount Tire publishes no set-of-four price
  (4 x price is arithmetic, not a Discount Tire price). Promotions are
  Discount Tire's own title and text with its end date (`ends`, ISO 8601 UTC,
  and `ends_text` as given); no start date.
- Vehicle fitment: `vehicle` is one step per call (years, makes, models with
  `vehicle_id`, trims with `trim_id`, size options with `assembly_id`, then the
  fitment with front / rear size, staggered, wheel diameters and optional
  sizes). The 2022 Ford F-150 XLT Crew Cab 2WD is `vehicle_id` 17361,
  `trim_id` 52455, `assembly_id` 0000E28B (245/70R17). `vehicleTires` and
  `wheels` take the same three ids; staggered vehicles (the 2022 Corvette
  Stingray: 245/35R19 front, 305/30R20 rear) come back as front / rear sets,
  each tire with its own per-tire price (a set is 2 front + 2 rear).
  `ranking: "treadwell"` adds Discount Tire's Treadwell ranking fields,
  Discount Tire's own estimates, as given.
- Store stock: `storeStock` gives the exact units of 1-4 items at the stores
  near a ZIP (5 stores per page, 10-150 miles); a store with 0 units can still
  say "Available as soon as <date>".
- Reviews: Discount Tire's own tire and store reviews, sorts, star filter and
  full paging; no reviewer names.
- Appointments: read only (Scavio never books); slot `start` and `end` are the
  store's local time (YYYY-MM-DDTHH:MM, no time zone).
- Not available: the deals page text, road hazard and certificate prices,
  financing, installation and fee amounts, the Treadwell chat, fleet accounts,
  Tire Rack, price history (poll and store the answers), checkout and booking.

```typescript
// Tires in one size at one store: price per tire, promotions, units there.
const hits = (await client.discounttire.search({ size: "225/65R17", store: "1009", sort: "price_low" })) as any;
for (const it of hits.data.items.slice(0, 5)) console.log(it.item_number, it.name, it.price, it.stock?.units, it.promotions);
console.log("4 tires (arithmetic):", 4 * hits.data.items[0].price);

// The same tire at the store nearest a ZIP (echoed in store).
const p = (await client.discounttire.product({ item_number: "108547", zip: "85251" })) as any;
console.log(p.data.store.store_code, p.data.store.brand, p.data.price, p.data.gtin, p.data.manufacturer_part_number);

// Vehicle fitment, one step per call, then the tires that fit at one store.
const fit = (await client.discounttire.vehicle({ vehicle_id: "17361", trim_id: "52455", assembly_id: "0000E28B" })) as any;
console.log(fit.data.fitment.front_size, fit.data.fitment.staggered);
const vt = (await client.discounttire.vehicleTires({ vehicle_id: "17361", trim_id: "52455", assembly_id: "0000E28B", store: "1009" })) as any;
console.log(vt.data.total, vt.data.items.filter((i: any) => i.original_equipment).map((i: any) => i.name));

// Exact units at the stores near a ZIP, and one store's appointment calendar (read only).
const ss = (await client.discounttire.storeStock({ item_number: "108547", zip: "85251" })) as any;
for (const s of ss.data.stores) console.log(s.store_code, s.distance_miles, s.stock[0].units, s.stock[0].message);
const cal = (await client.discounttire.appointments({ store_code: "1009" })) as any;
console.log(cal.data.days.map((d: any) => [d.date, d.bookable, d.slot_count]));
```

Every call raises the request timeout to `DISCOUNTTIRE_TIMEOUT` (240s) and
never lowers a longer client timeout; failed calls and refused inputs are not
charged, a not-found is charged.

### [Vevor](https://scavio.dev/docs/vevor-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

VEVOR (vevor.com, the tools and equipment seller with storefronts in 13
countries): VEVOR's price on each storefront in its own currency, the was
price only while a VEVOR deal is active (with VEVOR's deal start and end),
every variant with its own price and stock, the shipping fee and delivery date
by US state or Canadian province, and the same SKU on all 13 storefronts in one
call. Eleven endpoints on `client.vevor` (new in 0.87.0): `search`, `product`,
`shipping`, `reviews`, `questions`, `suggestions`, `categories`, `category`,
`collections`, `deals` and `prices`. 1 credit per call, `prices` 3;
`credits_used` in the response is what was charged. VEVOR has no public
product API (it runs an affiliate programme through Awin and other networks;
the Pro Member, Dealer & Distributor and dropshipping programmes are sign-up
forms, not APIs). VEVOR also sells on other marketplaces: pair it with
`client.amazon`, `client.walmart`, `client.homeDepot`, `client.tractorsupply`,
`client.tiktokShop` and `client.ebay` for the same item (match on model or SKU
evidence), and with `client.harborFreight` as an alternative store, not the
same item. See the
[Vevor API page](https://scavio.dev/vevor-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme).

- Storefronts (`country`, default `us`, and `language`, default the first
  listed): `us` (www.vevor.com, USD; en, es), `ca` (www.vevor.ca, CAD; en,
  fr), `gb` (www.vevor.co.uk, GBP), `au` (www.vevor.com.au, AUD), `de`, `fr`,
  `es`, `it`, `nl` (EUR, each in its own language), `pl` (PLN), `mx` (MXN,
  es), `no` (www.vevor.co.no, EUR) and `eu` (eur.vevor.com, VEVOR's storefront
  for the other European countries, EUR; en, sv, da, fi, no, pt, cs, el, sk,
  hu, ro). Each storefront language has its own search index: send the search
  term in that language. `prices` takes `sku` only and asks every storefront.
- Price per storefront: measured 2026-11-25, one SKU (GYQXJBMQJQYPKEO1LV0) was
  195.01 USD on www.vevor.com, 233.90 CAD on www.vevor.ca, 175.90 GBP on
  www.vevor.co.uk, 170.90 EUR on www.vevor.de, 261.99 EUR on www.vevor.co.no
  and 721.90 PLN on www.vevor.pl.
- Price and stock do not change by ZIP; the shipping fee and delivery date
  change by US state (`state`, required for `us`) or Canadian province
  (`province`, required for `ca`): a welder to Alaska (AK 99501) had a $130
  fee, contiguous states were measured free.
- `was_price` is given only while a VEVOR deal is active (`deal.starts` /
  `deal.ends` as VEVOR gives them) or when VEVOR's page shows its own
  strikethrough price, otherwise null: never compute a discount from it.
- Lists: 60 items a page; totals are exact up to 100, then "100+"
  (`total_is_lower_bound`).
- Reviews: one pool shared across storefronts and a product's variants, so
  they come in many languages; up to 100 a page, sorts, star and photo
  filters; no reviewer names.
- Not available: coupon codes (VEVOR shows them only after a claim), the
  pickup store, Pro or bulk prices, financing, the ships-from warehouse,
  VEVOR's listings on other marketplaces, price history (poll and store the
  answers), checkout.

```typescript
// Search in the storefront language: price, was price during a deal, deal end, stock units.
const hits = (await client.vevor.search({ q: "welder" })) as any;
for (const it of hits.data.items.slice(0, 5)) console.log(it.sku, it.name, it.price, it.was_price, it.currency, it.deal_ends, it.stock_units);
const de = (await client.vevor.search({ q: "schweissgeraet", country: "de", sort: "price_low", in_stock: true })) as any;

// One product: deal window, variants with their own price and stock.
const p = (await client.vevor.product({ sku: "DHJMIGMMAMIGLL6WNV5" })) as any;
console.log(p.data.price, p.data.was_price, p.data.deal, p.data.variants.map((v: any) => [v.sku, v.price, v.stock_units]));

// Shipping: the state drives the fee and delivery date in the US.
const ship = (await client.vevor.shipping({ sku: "DHJMIGMMAMIGLL6WNV5", state: "AK", zip: "99501" })) as any;
console.log(ship.data.fee, ship.data.currency, ship.data.delivery);

// The same SKU on all 13 storefronts, each in its own currency (3 credits).
const pr = (await client.vevor.prices({ sku: "GYQXJBMQJQYPKEO1LV0" })) as any;
for (const s of pr.data.storefronts) console.log(s.country, s.status, s.price, s.currency, s.stock_units);

// Reviews in many languages, a category, Daily Deals.
const rv = (await client.vevor.reviews({ sku: "CKKMJ3300LBSAPPKZV1", page_size: 100, sort: "newest" })) as any;
const ice = (await client.vevor.category({ category: "40035" })) as any;
const daily = (await client.vevor.deals({ type: "daily_deals" })) as any;
```

Every call raises the request timeout to `VEVOR_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls and refused inputs are not
charged, a not-found is charged.

### [Nellis Auction](https://scavio.dev/docs/nellis-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Nellis Auction (nellisauction.com, the liquidation auction marketplace with
pickup warehouses in Las Vegas, Phoenix, Houston, Philadelphia, Denver and
Dallas): a lot's current bid and bid count next to Nellis's own Estimated
Retail Price, the buyer's premium percent, open and close times, Nellis's
condition grade, the pickup warehouse, the bid history without bidder names
and a sold lot's final price by id. Four endpoints on `client.nellis` (new in
0.88.0): `search`, `item`, `locations` and `categories`. 1 credit per call;
`credits_used` in the response is what was charged. Nellis Auction has no
public API. Pair a lot with `client.amazon` and `client.walmart` for the same
item's new price and with `client.ebay` for sold prices (match on title and
brand: Nellis shows no UPC). See the
[Nellis Auction API page](https://scavio.dev/nellis-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme).

- Shopping locations (`location`, default `las-vegas`): `las-vegas`,
  `phoenix`, `houston`, `philadelphia` (pickup in Delran, NJ), `denver` and
  `dallas` (run by Lots Of Auctions), with 13 pickup warehouses in all.
- Search lists open auctions only, as Nellis's own search does: 48, 120 or
  240 a page, 9 sorts, filters by category, brand, pickup warehouse,
  condition stars, estimated retail range, auction event, color and size,
  with Nellis's counts (`facets`).
- A closed or sold lot is read by id with `item`; a sold lot's `final_price`
  is the winning bid before Nellis's buyer's premium and tax. Captured
  2026-11-25: a sold lot (id 141100004, Estimated Retail Price 9.99) closed at
  a final price of 6 after 5 bids.
- `retail_price` is Nellis's own "Estimated Retail Price", as Nellis labels
  it, not an MSRP. The buyer's premium is, in Nellis's words, "typically 15%
  but may vary based on the auction event" (`buyer_premium_percent` per lot).
- Bids move live: `current_bid`, `bid_count` and `closes` are as of the fetch.
  `bid_history` gives time, amount and Winning or Outbid, with no bidder names.
- Not available: closed or sold lots in search, search suggestions, shipping
  (pickup only), UPC or model numbers, buy-now, reserve prices, live bid
  updates, bidding, watchlists, checkout.

```typescript
// Open auctions in one shopping location: current bid, bids, Estimated Retail Price, close time.
const hits = (await client.nellis.search({ q: "robot vacuum" })) as any;
for (const it of hits.data.items.slice(0, 5)) console.log(it.id, it.title, it.current_bid, it.bid_count, it.retail_price, it.closes);
const phx = (await client.nellis.search({ q: "vacuum", location: "phoenix", sort: "bids_high", page_size: 48 })) as any;

// One lot, open or sold: final price of a sold lot (before the premium), bid history.
const lot = (await client.nellis.item({ id: "141100004" })) as any;
console.log(lot.data.market_status, lot.data.final_price, lot.data.retail_price, lot.data.buyer_premium_percent);
for (const b of lot.data.bid_history) console.log(b.time, b.amount, b.status);

// Pickup warehouses with hours, and live category counts.
const wh = (await client.nellis.locations({ location: "las-vegas" })) as any;
const cats = (await client.nellis.categories({ location: "houston", category: "Electronics" })) as any;
```

Every call raises the request timeout to `NELLIS_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls and refused inputs are not
charged, a not-found (an unknown id, or a category with no open lots) is
charged.

### [Dermstore](https://scavio.dev/docs/dermstore-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Dermstore (dermstore.com, the US skincare and beauty retailer, shipping to the
US and Canada): price, RRP as Dermstore gives it and Dermstore's offer text
per product and per brand, every shade, size or strength with its own price
and stock, UPC, auto-replenish plans, the 10 latest reviews, the current
offers with their end times, and US vs Canada prices for the same SKU. Seven
endpoints on `client.dermstore` (new in 0.89.0): `search`, `list`, `product`,
`suggestions`, `offers`, `brands` and `categories`. 1 credit per call;
`credits_used` in the response is what was charged. Dermstore has no public
API; its affiliate programme runs on Awin and offers product feeds to
approved publishers. Pair a product with `client.sephora`, `client.ulta` and
`client.amazon` for the same product and size elsewhere (match on UPC, or
brand + name + size). See the
[Dermstore API page](https://scavio.dev/dermstore-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme).

- Markets (`country`, default `us`): `us` (USD, shipping to the US) and `ca`
  (Dermstore's own Canadian dollar prices, not converted).
- Search by keywords or SKU, up to 200 a page, 7 sorts, filters by brand,
  skin type, concern, SPF band, key ingredient, preference, gender, price,
  rating and discount, facets on request. A mapped keyword (sunscreen,
  retinol, eltamd) returns the page Dermstore sends it to, reported in
  `resolved_from`.
- `list` reads any Dermstore list page by path or link: a category, brand,
  `/sale`, an offer page (`/shop/black-friday/30-off`), `/gift-sets` or an
  ingredient page.
- `rrp` is Dermstore's RRP as given; `discount_percent` is computed by Scavio
  from price and RRP, only when the RRP is above the price. `offer` is
  Dermstore's own promotion text, as given; code rates differ by brand.
  Captured 2026-11-25: EltaMD UV Clear SPF 46 (1.7 fl. oz., SKU 11370303) at
  46 USD and 65.78 CAD; Medik8 offered "30% Off With Code JOY + Gift", while
  SkinCeuticals offered "Earn 10% Back + $25 Gift" (double points, as
  Dermstore states it).
- `offers` gives the end time Dermstore states (`ends`); Dermstore gives no
  start date.
- Not available: a full review feed or review paging (only the 10 latest via
  `product`), Q&A, member (VIP) prices, cart or checkout prices, price
  history, offer start dates.

```typescript
// Search: price, RRP, Dermstore's offer text per product; the same search in Canada.
const hits = (await client.dermstore.search({ q: "uv clear spf 46" })) as any;
for (const it of hits.data.items.slice(0, 5)) console.log(it.sku, it.name, it.price, it.rrp, it.discount_percent, it.offer);
const ca = (await client.dermstore.search({ q: "uv clear spf 46", country: "ca" })) as any;

// Any list page: a brand, /sale or an offer page.
const brand = (await client.dermstore.list({ path: "/brands/eltamd", include_facets: true })) as any;

// One product: variants with their own price and stock, UPC, offer banner, 10 latest reviews.
const p = (await client.dermstore.product({ sku: "13806521" })) as any;
for (const v of p.data.variants) console.log(v.sku, v.option, v.price, v.in_stock);

// Current offers with their end times.
const offers = (await client.dermstore.offers()) as any;
for (const o of offers.data.offers) console.log(o.title, o.code, o.threshold, o.ends, o.list_path);
```

Every call raises the request timeout to `DERMSTORE_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls and refused inputs are not
charged, a not-found (an unknown SKU or list path) is charged.

### [Carrefour](https://scavio.dev/docs/carrefour-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Carrefour grocery prices by store, promotions, Nutri-Score and stores. Nine
endpoints on `client.carrefour` (new in 0.51.0), 1 credit each: `search`,
`product`, `reviews`, `category`, `promotions`, `suggestions`, `stores`,
`storeAvailability`, `store`. carrefour.fr (France) serves every endpoint;
`search` and `product` also take `country` `ar` (Argentina, ARS), `ro`
(Romania, RON) or `be` (Belgium, EUR, `language` fr or nl; 2 credits). Data
comes back in the market's language: French titles, labels and ingredients
on fr.

- Without `store` a price is carrefour.fr's national online price; pass a
  store ref from `stores` (`store_ref` or `pickup_refs[].ref`) or
  `storeAvailability` (`stores[].store.ref`) for that store's shelf price
  and assortment (Nutella 400 g: 3.99 national, 3.69 at two stores, 4.61 at
  another). The response says which (`store`, `price_scope`).
- `search`, `category` and `promotions` share one grid (30 items per page on
  fr; ar and ro 24, be 36) with `total`, `total_pages` and every facet;
  filter by `brand`, `promotion`, `nutriscore`, `organic`,
  `carrefour_brands` or `min_price` / `max_price`, sort by `relevance`,
  price, unit price or `top_rated` (ar and ro: relevance and the price
  sorts; be: relevance).
- Each item carries `price`, `unit_price` with `unit_price_label` (per kg /
  L), `nutriscore`, `ecoscore` and `promotion` (`type`, `label`,
  `loyalty_only` for loyalty-card prices, `discounted_price`,
  `initial_price`, `quantity`, `starts_at`, `ends_at`). On multi-buy deals
  ("Le 2ème à -50%") the prices cover `quantity` items and
  `discounted_price` is null when the site does not price the deal.
- `product` adds ingredients, allergens, nutrition per 100 g and per
  portion, the marketplace seller and offers, and the rating distribution.
- `promotions` lists `catalogue`, `immediate`, `loyalty` (member prices) or
  `festive` (the site's seasonal selection) items, optionally for one aisle.
- `reviews` returns 1-50 verified-purchase reviews (default 10) with 4
  sorts, a star filter and `offset` paging.
- `storeAvailability` is yes / no per store near a postal code, no price.
  `store` returns services, hours, the next pickup slots as shown and, at
  stores with a fuel station, fuel prices per litre with update times.
- No Q&A, printed leaflet, delivery-slot booking, cart, loyalty account data
  or price history: to track prices, poll and store your own. Spain, Italy,
  Poland, Brazil and the Middle East sites are not covered.

```ts
const res = (await client.carrefour.search({ query: "nutella" })) as any;
console.log(res.data.total, res.data.store, res.data.price_scope, res.data.currency);
for (const i of res.data.items.slice(0, 5)) {
  console.log(i.ean, i.title, i.price, i.unit_price_label, i.nutriscore, i.promotion);
}

const st = (await client.carrefour.stores({ postal_code: "69003" })) as any;
for (const s of st.data.stores.slice(0, 3)) console.log(s.store_ref, s.name, s.banner, s.distance_km, s.slug);
const local = (await client.carrefour.search({ query: "nutella", store: "840093" })) as any;
console.log(local.data.store, local.data.price_scope, local.data.total);

const p = (await client.carrefour.product({ ean: "3017620422003" })) as any;
console.log(p.data.title, p.data.price, p.data.unit_price, p.data.ingredients, p.data.allergens);
for (const n of p.data.nutrition.per_100.values) console.log(n.nutrient, n.quantity);

const promo = (await client.carrefour.promotions({ type: "loyalty", category: "Boissons" })) as any;
for (const i of promo.data.items.slice(0, 3)) {
  console.log(i.title, i.promotion.label, i.promotion.loyalty_only, i.promotion.discounted_price, i.promotion.ends_at);
}

const av = (await client.carrefour.storeAvailability({ ean: "3017620422003", postal_code: "69003" })) as any;
console.log(av.data.available_count, av.data.stores.slice(0, 3).map((s: any) => [s.store.ref, s.available]));

const store = (await client.carrefour.store({ slug: "venissieux" })) as any;
console.log(store.data.store.name, store.data.store.next_slots);
for (const f of store.data.fuel?.prices ?? []) console.log(f.fuel, f.price_per_litre, f.updated_at);

const be = (await client.carrefour.search({ query: "chocolat", country: "be", language: "nl" })) as any;
console.log(be.data.country, be.data.language, be.data.currency, be.data.total);
```

Every call raises the request timeout to `CARREFOUR_TIMEOUT` (120s) and
never lowers a longer client timeout; failed calls are not charged. A
not-found is a charged 404.

### [Allegro](https://scavio.dev/docs/allegro-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Allegro offers, every seller's price for one product, sellers and seller
feedback. Seven endpoints on `client.allegro` (new in 0.52.0), 2 credits
each: `search`, `offer`, `product`, `productOffers`, `seller`,
`sellerFeedback`, `category`. Every endpoint takes `country`: `pl`
(allegro.pl, PLN, default), `cz` (allegro.cz, CZK), `sk` (allegro.sk, EUR)
or `hu` (allegro.hu, HUF). Titles, parameters and labels come back in the
site's language (Polish on pl).

- An offer is one seller's listing (`offer_id`); a catalogue product
  (`product_id`) groups many sellers' offers. `productOffers` lists every
  seller's price for one product (price, price with delivery, condition,
  seller, Smart!, `is_featured` for the buy box): the price-monitoring call.
- `search`, `category` and `seller` share one grid: 60 organic offers per
  page (sponsored slots on top), up to 100 pages, exact `total` and every
  facet. Sort by relevance, price, price with delivery, `popularity`,
  `ending_soonest` or `newest`; filter by `min_price` / `max_price`,
  `condition`, `smart`, and on pl only `buying_format` (`buy_now` /
  `auction`) and `deals` (Allegro's deals zone, Black Weeks included while
  it runs); the pl-only filters are a 400 elsewhere.
- Each item carries `price`, `price_with_delivery`, `condition`,
  `is_auction`, `discount_percent`, `lowest_price_30d`, the seller
  (`super_seller`, `positive_feedback_percent`, `is_business`),
  `sold_count`, `smart`, `placement` (regular, promoted, sponsored or
  featured) and `source` (`allegro_lokalnie` for Allegro Lokalnie offers
  inside pl results).
- `lowest_price_30d` is the EU disclosure Allegro shows next to a discount
  (the lowest price in the 30 days before it): null without a discount, and
  not a price history. `sold_count` is null on auctions and on cz, sk and hu
  offer pages.
- `offer` adds the auction state (current price, minimum next bid, ends at,
  has bids; no bid history), every parameter with GTIN and brand, delivery
  methods, returns, warranty and `company_name` for business sellers.
  `product` returns `lowest_price`, `offer_count`, the featured offer, the
  star distribution, review aspects and the first 20 reviews as shown.
- `seller` returns id, login, `is_business` and the seller's categories
  (`slug` feeds `category`); super seller status, positive percent and
  member since come from `sellerFeedback` (20 ratings per page, no buyer
  identity).
- No search suggestions, bidding, buying or checkout, Allegro Lokalnie as
  its own source, Smart! account data, seller revenue, seller addresses or
  tax ids, price history or reviews past the first 20: to track prices, poll
  and store your own.

```ts
const res = (await client.allegro.search({ query: "laptop", sort: "price_low_to_high", condition: "new" })) as any;
console.log(res.data.total, res.data.total_pages, res.data.currency, res.data.language);
for (const i of res.data.items.slice(0, 5)) {
  console.log(i.offer_id, i.title, i.price, i.price_with_delivery, i.sold_count, i.seller.login, i.placement);
}

const o = (await client.allegro.offer({ offer_id: "18801787032" })) as any;
console.log(o.data.price, o.data.original_price, o.data.lowest_price_30d, o.data.discount_percent);
console.log(o.data.stock, o.data.sold_count, o.data.seller.login, o.data.seller.company_name);

const p = (await client.allegro.product({ product_id: "90d08230-e02a-4210-913d-d417453321b8" })) as any;
console.log(p.data.title, p.data.lowest_price, p.data.offer_count, p.data.rating.average);
const offers = (await client.allegro.productOffers({
  product_id: p.data.product_id,
  sort: "price_with_delivery_low_to_high",
})) as any;
for (const of of offers.data.offers.slice(0, 5)) {
  console.log(of.seller.login, of.price, of.price_with_delivery, of.smart, of.is_featured);
}

const s = (await client.allegro.seller({ login: "Yupilo_pl", query: "lenovo", category: "komputery" })) as any;
console.log(s.data.seller.is_business, s.data.categories.map((c: any) => [c.name, c.slug]));
const fb = (await client.allegro.sellerFeedback({ login: "Yupilo_pl" })) as any;
console.log(fb.data.summary.positive_percent, fb.data.summary.super_seller, fb.data.summary.member_since);

const hu = (await client.allegro.search({ query: "laptop", country: "hu" })) as any;
console.log(hu.data.currency, hu.data.items[0].title, hu.data.items[0].price);
```

Every call raises the request timeout to `ALLEGRO_TIMEOUT` (120s; sk and hu
calls can take up to about a minute) and never lowers a longer client
timeout; failed calls are not charged. A not-found is a charged 404.

### [bol.com](https://scavio.dev/docs/bolcom-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

bol.com competitor prices for the Netherlands and Belgium (EUR): the buy box
and the lowest-priced competing offers on a product, product lookup by id, link or EAN,
sellers, listings and deals. Nine endpoints on `client.bolcom` (new in
0.67.0), 2 credits each (`product` by `ean` 4): `search`, `product`,
`offers`, `seller`, `sellerProducts`, `category`, `brand`, `deals` and
`campaign`.

- Storefronts on every endpoint: nl-nl (`country: "nl"`, default, Dutch),
  be-nl (`country: "be"`, Dutch) and be-fr (`country: "be"`,
  `language: "fr"`, French). Product, EAN, category, seller and offer ids are
  the same on every storefront; prices, offers and stock can differ between
  the Netherlands and Belgium. On be-fr bol's own texts are French, some
  partner titles and the review topics stay Dutch, and review texts are
  bol's translation.
- `product_id` is a 16-digit string: never send it as a number.
- `product` returns the buy box (price, `reference_price` with
  `reference_price_type` `rrp` or `most_shown_price`, seller rating out of
  10, shipping cost, delivery promise), `offer_count`, cheapest new, fastest
  new, cheapest second-hand and refurbished grades, the rating distribution,
  bol's AI review topics and the first 10 reviews (pooled across the product
  family, no reviewer names). `offers` lists the 10 lowest-priced offers,
  lowest price first, with counts by condition for all its offers and
  `has_more` when bol has more (no paging); the buy box is not marked there
  (`buy_box.offer_id` names it).
- `seller` returns the rating out of 10 with up to four sub-ratings, positive
  percent, review totals, product count and the public EU trader data
  (company, city, country, registration and VAT number; no street address).
- `search` stops at page 10 and sorts by relevance (default), popularity,
  price, rating or wishlist (no newest); other sorts can narrow the result
  set, and price sorts follow bol's own ordering. `sellerProducts`,
  `category`, `brand` and `campaign` default to popularity, page 1 to 500;
  a campaign item's offer is its buy box, which does not always carry the
  campaign's label. `deals` links the day deal on the asked storefront.
  `brand_facet_id`
  (search / category filter) and `brand_id` (`brand`) are different id
  spaces.
- No search suggestions, review paging, seller review texts, price history or
  30-day lowest price, pickup points or Select member prices: to track
  prices, poll and store your own.

```ts
const p = (await client.bolcom.product({ product_id: "9300000239314960" })) as any;
console.log(p.data.buy_box.price, p.data.buy_box.reference_price, p.data.offer_count, p.data.fastest_new);

const offers = (await client.bolcom.offers({ product_id: "9300000240171936", country: "be" })) as any;
for (const o of offers.data.offers) console.log(o.seller.name, o.price, o.condition, o.shipping_cost);

const byEan = (await client.bolcom.product({ ean: "4242005483976", country: "be", language: "fr" })) as any; // 4 credits
const seller = (await client.bolcom.seller({ seller_id: "1770745" })) as any;
const stock = (await client.bolcom.sellerProducts({ seller_id: "1767374", sort: "price_asc" })) as any;
const deals = (await client.bolcom.deals()) as any;
const promo = (await client.bolcom.campaign({ campaign_id: deals.data.day_deal.campaign_id })) as any;
```

Every call raises the request timeout to `BOLCOM_TIMEOUT` (240s) and never
lowers a longer client timeout; failed calls are not charged, a not-found is
charged.

### [OLX](https://scavio.dev/docs/olx-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

OLX Europe classifieds: used goods, cars, real estate and jobs. Nine
endpoints on `client.olx` (new in 0.54.0), 1 credit each: `search`,
`offer`, `seller`, `sellerAds`, `filters`, `categories`, `locations`,
`suggestions`, `similar`. OLX Europe only: `country` is `pl` (olx.pl, PLN,
default), `ro` (olx.ro, RON), `pt` (olx.pt, EUR), `bg` (olx.bg, EUR), `ua`
(olx.ua, UAH), `kz` (olx.kz, KZT) or `uz` (olx.uz, UZS); `filters` and
`similar` are pl, ro, pt, bg and ua only. OLX Brasil, olx.in and other
OLX-branded sites are not covered. Titles, params and labels come back in
the site's language (Polish on pl; Russian by default on kz and uz, with
`language: "kk"` / `"uz"` for Kazakh or Uzbek on `search`, `sellerAds` and
`offer`).

- `search` and `sellerAds` share one grid: up to 50 ads per page (default
  40; promoted ads come on top, each flagged `is_promoted` with
  `promoted_position`; `include_promoted: false` drops them). OLX lets anyone
  page through the first 1,000 results only (`total_capped`); kz and uz hide
  large totals (`total` null). A query with no exact match returns the
  closest ads.
- Sort by `relevance`, `newest` (last refresh, not first posting: sellers
  can refresh an ad), `price_low_to_high` or `price_high_to_low`; filter by
  `min_price` / `max_price`, `condition`, `seller_type` (`private` /
  `business`), `olx_delivery` (not on kz or uz), `with_photos`,
  `region_id` / `city_id` / `district_id` with `distance_km`, and the
  category's own `filter_*` keys discovered with `filters`.
- When the site converts a price (olx.uz y.e. to UZS, EUR to RON on ro,
  USD / EUR to UAH on ua), `price.value` is the converted figure and
  `original_value` / `original_currency` keep what the seller entered. Jobs
  carry `salary`.
- Private sellers' names, phone numbers, emails, exact map positions,
  last-seen times and car VINs are never returned, and phone numbers and
  emails in ad text are replaced; `business_name` is set for business
  sellers only. OLX shows no seller ratings or reviews.
- An ended ad answers the same 404 as a missing one ("not found or no
  longer active"). No view counts, phone numbers, messaging, delivery
  prices, checkout, average prices, notifications or price history: to
  watch for new listings or track prices, poll `sort: "newest"` and store
  your own.

```ts
const res = (await client.olx.search({ query: "iphone", sort: "newest", seller_type: "private" })) as any;
console.log(res.data.total, res.data.total_capped, res.data.promoted_count, res.data.currency);
for (const i of res.data.items.slice(0, 5)) {
  console.log(i.id, i.title, i.price.value, i.condition, i.location.city, i.refreshed_at, i.is_promoted);
}

// Discover a category's filters, then search with them.
const f = (await client.olx.filters({ category_id: 84 })) as any;
for (const flt of f.data.filters.slice(0, 5)) console.log(flt.key, flt.label, flt.kind, flt.send_as);
const cars = (await client.olx.search({
  category_id: 84,
  filters: { "filter_float_year:from": 2018, "filter_float_milage:to": 100000 },
})) as any;

// Places for the location filters.
const loc = ((await client.olx.locations({ query: "Warszawa" })) as any).data.locations[0];
const near = (await client.olx.search({ query: "rower", city_id: loc.city_id, distance_km: 30 })) as any;

// One ad, its seller, the seller's ads and similar ads.
const ad = (await client.olx.offer({ offer_id: "1107557408" })) as any;
console.log(ad.data.title, ad.data.price, ad.data.category.breadcrumb, ad.data.seller);
const s = (await client.olx.seller({ user_id: 2547532895 })) as any;
console.log(s.data.is_business, s.data.business_name, s.data.member_since, s.data.active_ads);
const ads = (await client.olx.sellerAds({ user_id: 2547532895, sort: "price_low_to_high" })) as any;
const sim = (await client.olx.similar({ offer_id: "1107557408" })) as any;

// olx.uz: Russian titles by default; y.e. prices come converted to UZS.
const uz = (await client.olx.search({ query: "iphone", country: "uz" })) as any;
for (const i of uz.data.items) {
  if (i.price.original_currency) console.log(i.price.value, i.price.currency, i.price.original_value, i.price.original_currency);
}
```

Every call raises the request timeout to `OLX_TIMEOUT` (120s) and never
lowers a longer client timeout; failed calls are not charged. A not-found is
a charged 404.

### [Kroger](https://scavio.dev/docs/kroger-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Kroger, QFC and Fred Meyer grocery data. Eight endpoints on `client.kroger`
(six new in 0.55.0): `search` and `product` cost 2 credits, `prices` 3, and
`stores`, `category`, `deals`, `coupons` and `suggestions` 1 each. Every
endpoint takes `banner`: `kroger` (kroger.com, default), `qfc` (QFC, qfc.com:
Washington and Oregon) or `fred_meyer` (Fred Meyer, fredmeyer.com: the
Pacific Northwest and Alaska, grocery plus general merchandise, apparel and
home). Other Kroger banners (Ralphs, King Soopers, Fry's, Harris Teeter,
Smith's...) are not supported yet.

- Prices are integer cents (`price` 399 = $3.99) and differ by banner and by
  store.
- `search`, `product`, `category` and `deals` return the prices, promotions,
  stock and aisle of a store the site chooses for the request (`store`; it can
  change between calls). For one store, take a `location_id` from `stores()`
  and pass it as `store_id` to `prices()` (up to 25 UPCs). QFC store ids start
  with 705, Fred Meyer ids with 701.
- `search`, `category` and `deals` serve the first page only (up to 24
  products), with no sort: `page` above 1 is a 400 and is not charged.
- Ratings are average, count and star distribution; review text is not
  available. `stores()` returns fuel center locations, not fuel prices.
- `coupons()` lists the digital coupons at one store, 24 per page
  (`has_more`); nothing is clipped and no account is used. `deals()` is the
  weekly digital deals list; the printed weekly ad circular is not available.

```typescript
// Search: prices are those of the store the site chose (data.store).
const res = (await client.kroger.search({ query: "coffee", banner: "qfc" })) as any;
console.log(res.data.total, res.data.store.location_id, res.data.store.name);
for (const p of res.data.products.slice(0, 5)) console.log(p.upc, p.name, p.price, p.promo_price);

// One specific store: find it, then price up to 25 UPCs there.
const st = (await client.kroger.stores({ zip: "97201", banner: "fred_meyer" })) as any;
const storeId = st.data.stores[0].location_id;
const pr = (await client.kroger.prices({ store_id: storeId, upcs: ["0001111050438"] })) as any;
for (const i of pr.data.items) console.log(i.upc, i.price, i.promo_price, i.in_stock, i.quantity, i.aisle);

// Product, a category, this week's digital deals, coupons and suggestions.
const milk = (await client.kroger.product({ upc: "0001111050438", banner: "fred_meyer" })) as any;
const beer = (await client.kroger.category({ taxonomy_id: "08190", slug: "Import-Beer", banner: "qfc" })) as any;
const deals = (await client.kroger.deals({ banner: "qfc" })) as any;
const coupons = (await client.kroger.coupons({ store_id: "70100011", category: "Dairy" })) as any;
const sugg = (await client.kroger.suggestions({ query: "almond mi", banner: "qfc" })) as any;
console.log(milk.data.store_location, beer.data.total, deals.data.deals_week, coupons.data.total_at_store, sugg.data.suggestions);
```

Every call raises the request timeout to `KROGER_TIMEOUT` (120s; search and
prices can take up to about a minute) and never lowers a longer client
timeout; failed calls are not charged. An unknown UPC or store id is a
charged 404.

### [Publix](https://scavio.dev/docs/publix-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Publix grocery data by store: the weekly ad with BOGO deals, Extra Savings,
digital coupons, the deli and bakery order-ahead menu (Pub Subs) with store
prices, product search, category listings, nutrition facts and store
locations. Eleven endpoints on `client.publix` (new in 0.56.0), 1 credit
each: `search`, `product`, `category`, `categories`, `weeklyAd`,
`extraSavings`, `coupons`, `savingsSearch`, `orderAhead`, `stores` and
`suggestions`.

- Every price endpoint is store-scoped: pass `store_id`, a Publix store
  number from `stores()` (string or number). Prices and promotions differ by
  store: a Publix Chicken Tender Sub measured $12.09 in Miami (store 1614)
  and $11.99 in Atlanta (store 1825).
- Publix does not show regular shelf prices online. `price` is a number only
  for items on promotion (weekly ad, BOGO, multi-buy, Extra Savings) and for
  order-ahead items, and `null` otherwise; it is never estimated. Multi-buys
  ("2 for $5.00") carry `bundle` {quantity, price}.
- Weekly ads run Thursday to Wednesday in Florida and Wednesday to Tuesday in
  Georgia and North Carolina (`weekly_ad_break_day` per store); English ad
  only. About 700 items per store, about 230 of them BOGO.
- `search` and `category` serve 48 items per page, `orderAhead` 60.
  Products are keyed by Publix item code: Publix does not publish UPCs,
  ingredients, allergens or reviews online.
- `coupons()` lists the store's digital coupons; nothing is clipped and no
  account is used. No cart or ordering.

```typescript
// Find a store: store_id feeds every other call.
const st = (await client.publix.stores({ zip: "33101", limit: 5 })) as any;
const storeId = st.data.stores[0].store_id;
console.log(storeId, st.data.stores[0].name, st.data.stores[0].weekly_ad_break_day);

// This week's ad at that store: BOGO, sale prices, multi-buys.
const ad = (await client.publix.weeklyAd({ store_id: storeId, bogo_only: true })) as any;
console.log(ad.data.ad.start_date, ad.data.ad.end_date, ad.data.count);
for (const i of ad.data.items.slice(0, 5)) console.log(i.title, i.savings_text, i.deal_type, i.price);

// Search: price is a number only when Publix shows one.
const res = (await client.publix.search({ query: "chicken", store_id: storeId, on_sale: true })) as any;
for (const p of res.data.items.slice(0, 5)) console.log(p.item_code, p.title, p.aisle, p.price, p.price_text, p.promo);

// Pub Subs with this store's prices, a product with nutrition, savings across feeds.
const subs = (await client.publix.orderAhead({ store_id: storeId })) as any;
const sub = (await client.publix.product({ item_code: "90355", store_id: storeId })) as any;
const hits = (await client.publix.savingsSearch({ query: "coffee", store_id: storeId })) as any;
console.log(subs.data.items[0].price, sub.data.nutrition, hits.data.items.map((h: any) => h.saving_type));
```

Every call raises the request timeout to `PUBLIX_TIMEOUT` (120s) and never
lowers a longer client timeout; failed calls are not charged. An unknown item
code or store id is a charged 404.

### [IKEA](https://scavio.dev/docs/ikea-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

IKEA product data across 55 markets: IKEA prices by country for one article
number, search, product detail, reviews, categories, deal lists, stores,
stock by store, bulk item lookup and As-is (second-hand) offers. Twelve
endpoints on `client.ikea` (new in 0.57.0), 1 credit each: `search`,
`product`, `reviews`, `category`, `categories`, `deals`, `suggestions`,
`stores`, `stock`, `items`, `compare` and `asIs`. `compare` costs 1 credit
per market that answered.

- `country` is the market code (default `us`). `search` and `product` cover
  55 markets: the 50 ikea.com markets (us ca gb ie de at ch fr be nl dk se no
  fi ee lv lt pl cz sk hu hr si rs ro pt es it il ae sa kw qa bh om jo eg ma
  in my sg ph th jp kr au nz mx cl co) plus cn (ikea.cn), pr (Puerto Rico), do
  (Dominican Republic), es_islands (Canary and Balearic islands, with
  `island`) and is (Iceland). `category`, `deals`, `suggestions` and `items`
  serve the 50 ikea.com markets plus cn; `reviews`, `categories`, `stores`,
  `stock` and `compare` the 50 ikea.com markets; `asIs` us, gb, de, fr, se,
  jp, nl, es, it, pl, au, ch and at. Ukraine, Greece, Cyprus, Bulgaria, Hong
  Kong, Taiwan, Indonesia and Turkey are not available.
- `language` is one of the market's languages (ca en/fr, be nl/fr/en, ch
  de/fr/it/en, us en/es ...). Data comes in that language and prices in the
  market's own currency, never converted: on 2026-11-13 KALLAX 80275887 was
  EUR 49.99 in de and nl, EUR 59.99 in fr and SEK 599 in se.
- Some markets (us, ca, jp, au, kr, in, my, sg, ph ...) sell the same product
  under a different article number, so `found` is false there in `compare`.
- `reviews` returns the 20 most recent reviews the product page shows (no
  paging, sort or star filter). Ratings are what each market's site shows:
  many markets share one pool (KALLAX: 8,241 in Germany, Spain, Sweden),
  others have their own (France 2,760, Italy 1,887) and some show none
  (Estonia, Latvia, Lithuania, Israel, Iceland). `stock`
  is a level per store (in_stock_high, in_stock_low, out_of_stock), not a
  quantity.
- Puerto Rico, Dominican Republic and the islands return the first 40 search
  results only; franchise products (pr, do, es_islands, is) return basic
  detail. Pass article numbers as strings to keep leading zeros.

```typescript
// IKEA prices by country: one article number on up to 10 markets, each in its own currency.
const cmp = (await client.ikea.compare({ item_no: "80275887", countries: ["de", "fr", "se", "nl", "es", "it"] })) as any;
for (const m of cmp.data.markets) console.log(m.country, m.found, m.currency, m.price, m.previous_price, m.price_tag);

// Search one market, sorted; a full product with packaging and variants.
const res = (await client.ikea.search({ query: "kallax", country: "de", sort: "price_asc" })) as any;
for (const p of res.data.items.slice(0, 5)) console.log(p.item_no, p.name, p.type_name, p.price, p.price_tag);
const prod = (await client.ikea.product({ item_no: "20522046" })) as any;
console.log(prod.data.name, prod.data.price, prod.data.currency, prod.data.packaging.number_of_packages);

// Stock level (not a quantity) at one store, the 20 newest reviews, As-is offers.
const stock = (await client.ikea.stock({ item_nos: ["20522046", "20631663"], store_id: "399" })) as any;
console.log(stock.data.items.map((i: any) => [i.item_no, i.store_availability.status]));
const reviews = (await client.ikea.reviews({ item_no: "80275887", country: "de" })) as any;
const asIs = (await client.ikea.asIs({ store_id: "257" })) as any;
console.log(reviews.data.rating_count, asIs.data.total, asIs.data.offers[0].min_price);
```

Every call raises the request timeout to `IKEA_TIMEOUT` (120s), `product` and
`reviews` to `IKEA_PRODUCT_TIMEOUT` (180s: a product page can take up to about
100 seconds), and never lowers a longer client timeout; failed calls are not
charged. An unknown article number, category or store id is a charged 404.

### [Wayfair](https://scavio.dev/docs/wayfair-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Wayfair product data for wayfair.com, wayfair.ca (English or French),
wayfair.co.uk and wayfair.ie, plus Wayfair's US sites AllModern, Birch Lane,
Joss & Main and Perigold. Four endpoints on `client.wayfair` (new in 0.58.0),
1 credit each: `search`, `product`, `category` and `deals`.

- `country` is the market (default `us`, `ca`, `gb`, `ie`); `language` is
  `en` or `fr` on `ca`; `site` picks a US banner site (allmodern, birchlane,
  jossandmain, perigold) on `search`, `product` and `category`. Wayfair no
  longer sells in Germany or Austria.
- Prices are numbers in the market's currency, never converted. `was_price`
  is Wayfair's strikethrough price: Wayfair's terms state it is the
  manufacturer's suggested price or the highest price Wayfair offered or sold
  the item at in the past, and its Sale label means a discount against a
  price in the previous 90 days. Wayfair shows no price history, so poll
  `price`, `sale_price`, `was_price` and `badge` to build one.
- Option choices carry no price: call `product` with `option_id` for each
  option's price and stock. `product` returns the 5 reviews the page shows
  plus the rating histogram and review summary (no review paging), and a
  delivery estimate for `zip` (us and ca only).
- Keyword pages return 30 results (category pages 48) and `total` is
  approximate. `brand` takes brand ids (`items[].brand.id`), not names.
  `deals` lists the current sale events; use `on_sale`, `closeout` or
  `open_box` on `search` or `category` for products.

```typescript
// Search, sorted and filtered; a keyword that matches a category says so in redirected_to.
const res = (await client.wayfair.search({ query: "office chair", sort: "price_asc", on_sale: true })) as any;
for (const p of res.data.items.slice(0, 5)) console.log(p.sku, p.name, p.price, p.was_price, p.price_label, p.badge);

// One product: price, was price, badge, 5 reviews and the delivery estimate for a ZIP.
const prod = (await client.wayfair.product({ sku: "W005006988", zip: "10001" })) as any;
console.log(prod.data.price, prod.data.was_price, prod.data.percent_off, prod.data.rating_histogram);
console.log(prod.data.delivery.map((d: any) => [d.name, d.date_min, d.text]));

// One option's price and stock, a category grid, another market, and the sale events.
const opt = (await client.wayfair.product({ sku: "W005006988", option_id: "1820607042" })) as any;
const cat = (await client.wayfair.category({ category_id: "413892", sort: "rating" })) as any;
const uk = (await client.wayfair.search({ query: "sofa", country: "gb" })) as any;
const events = (await client.wayfair.deals()) as any;
console.log(opt.data.price, cat.data.category.name, uk.data.currency, events.data.count);
```

Every call raises the request timeout to `WAYFAIR_TIMEOUT` (120s) and never
lowers a longer client timeout; failed calls are not charged. An unknown SKU
or category is a charged 404.

### [Ashley Furniture](https://scavio.dev/docs/ashley-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Ashley Furniture product data for ashleyfurniture.com, plus search and product
on Ashley's licensed storefronts in Canada, Mexico, the Philippines, Saudi
Arabia and Turkey. Six endpoints on `client.ashley` (new in 0.59.0):
`search`, `product`, `category`, `deals`, `stores` and `store`.

- `search` and `product` cost 2 credits on `us` (the default) and `mx` and 1
  credit on `ca`, `ph`, `sa` and `tr`; `category`, `deals`, `stores` and
  `store` are us only at 2 credits.
- Prices are numbers in the market's currency, never converted.
  `regular_price` is Ashley's own Regular Price, which Ashley's terms define
  as its highest advertised price in store and online, offered to customers
  using special long-term financing.
- Ashley prices vary by region and there is no ZIP input: every us answer
  returns `priced_for` (`zipcode`, `price_zone`), the ZIP and price zone
  Ashley priced that answer for, so two calls can come back priced for
  different zones and consecutive pages can overlap slightly.
- `product` returns the first 10 reviews the page shows plus the rating
  histogram, customer photos and Q&A (no review paging). Search facets are
  informational: filter with `category`.
- On the licensed storefronts `search` returns up to 10 matches (`tr` its
  first results page) with no paging or sort, and `product` takes `handle`
  (with `country`) or `url`, not `sku`.
- `deals` events are `black_friday` (default), `clearance` and `hot_buys`.
  `stores` takes `lat` and `lng` only (no ZIP or city lookup) and lists stores
  alphabetically; call `store` for the address, phone and hours.

```typescript
// Search (us): 48 per page, exact total, and the ZIP / price zone the answer was priced for.
const res = (await client.ashley.search({ query: "sofa", sort: "price_asc" })) as any;
console.log(res.data.total, res.data.priced_for);
for (const p of res.data.items.slice(0, 5)) console.log(p.sku, p.name, p.price, p.regular_price);

// One product: price vs Regular Price, stock, the first 10 reviews and the histogram.
const prod = (await client.ashley.product({ sku: "5950418" })) as any;
console.log(prod.data.price, prod.data.regular_price, prod.data.stock.status, prod.data.rating_histogram);

// A category grid with a facet filter, and the Black Friday deals.
const cat = (await client.ashley.category({ path: "furniture/living-room/sofas", filters: { facetUpholsteryDesign: "Chaise" } })) as any;
const deals = (await client.ashley.deals({ event: "black_friday" })) as any;
console.log(cat.data.total, deals.data.event_name, deals.data.total);

// Stores near a point, then one store's hours; a licensed storefront by handle.
const near = (await client.ashley.stores({ lat: 40.7506, lng: -73.9972, radius: 25 })) as any;
const store = (await client.ashley.store({ store_id: near.data.stores[0].store_id })) as any;
const mx = (await client.ashley.product({ handle: "cashton-sofa", country: "mx" })) as any;
console.log(store.data.phone, store.data.hours[0], mx.data.currency, mx.data.price);
```

Every call raises the request timeout to `ASHLEY_TIMEOUT` (120s) and never
lowers a longer client timeout; failed calls are not charged. An unknown item
number, category or store is a charged 404.

### [Maisons du Monde](https://scavio.dev/docs/maisonsdumonde-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Maisons du Monde (furniture and home decor) product data for nine storefronts.
Nine endpoints on `client.maisonsdumonde` (new in 0.60.0), 1 credit each:
`search`, `product`, `category`, `deals`, `reviews`, `stores`, `store`,
`availability` and `seller`.

- Markets (`country`, default `fr`) and languages (`language`, default the
  market's first): fr (French), be (French or Dutch), lu (French), nl (Dutch),
  de (German), es (Spanish), it (Italian), pt (Portuguese), all in EUR, and ch
  (French, German or Italian) in CHF. `search`, `product`, `category`, `deals`
  and `reviews` serve all nine; `stores`, `store` and `availability` serve fr,
  be, de, es, it, pt and ch (not nl or lu); `seller` and the `seller` /
  `sold_by` filters serve the marketplace markets fr, de, es and it.
- Prices are numbers in the market's currency, never converted, and can differ
  by market: measured on 2026-11-14 on about 170 discounted sofas, Luxembourg,
  the Netherlands, Germany, Spain, Italy and Portugal matched France on every
  item, Belgium differed on 19, and Switzerland is priced separately in CHF
  (round mirror 204172: 74.99, now 37.45 EUR on every euro market; 91.90, now
  45.95 CHF). Read each market you report. `was_price` is the
  crossed-out price shown next to a discount. Maisons du Monde shows no 30-day
  lowest price and no price history, so poll to track changes.
- Grids (search, category, deals, seller) are 40 per page with the exact
  total, sorted by relevance, price or rating; items carry `sold_by` (mdm or
  marketplace) but not the seller name (`product` has it). The German site does
  not sort keyword results, so a sorted search on `de` comes back in relevance
  order with a note.
- `reviews` are pooled across every market and shown translated into the
  request language, with cursor paging and no star filter; a product with no
  reviews is a charged 404.
- Store stock: `stores` (by postcode) for the store id, then `availability`
  (Maisons du Monde items only). Home delivery is a from-price per product and
  market (no postcode-exact cost). `deals` events are `black_friday` and
  `second_chance` (fr). No search suggestions.

```typescript
// Search: price next to the crossed-out price, and who sells each item.
const res = (await client.maisonsdumonde.search({ query: "table" })) as any;
for (const p of res.data.items.slice(0, 5)) console.log(p.id, p.name, p.price, p.was_price, p.sold_by);

// The same product in France and in Switzerland (CHF, German).
const fr = (await client.maisonsdumonde.product({ id: "204172" })) as any;
const ch = (await client.maisonsdumonde.product({ id: "204172", country: "ch", language: "de" })) as any;
console.log(fr.data.price, fr.data.was_price, ch.data.price, ch.data.currency);

// Black Friday, and reviews pooled across markets with cursor paging.
const bf = (await client.maisonsdumonde.deals({ country: "es" })) as any;
const rev = (await client.maisonsdumonde.reviews({ id: "186339", sort: "rating_asc" })) as any;
console.log(bf.data.total, rev.data.rating_histogram, rev.data.next_cursor);

// Stores near a postcode, then one item's stock at a store and the delivery from-price.
const near = (await client.maisonsdumonde.stores({ postcode: "75011" })) as any;
const stock = (await client.maisonsdumonde.availability({ id: "204172", store_id: near.data.stores[0].id })) as any;
console.log(stock.data.in_stock, stock.data.quantity, stock.data.delivery);
```

Every call raises the request timeout to `MAISONSDUMONDE_TIMEOUT` (120s) and
never lowers a longer client timeout; failed calls are not charged, a
not-found is charged.

### [Trendyol](https://scavio.dev/docs/trendyol-search?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Trendyol (Turkey's largest online marketplace) and its international
storefronts: 35 markets. Twelve endpoints on `client.trendyol` (new in
0.61.0), 1 credit each: `search`, `product`, `category`, `brand`, `reviews`,
`questions`, `seller`, `deals`, `coupons`, `rankings`, `suggestions` and
`delivery`.

- Markets (`country`, default `tr`) and languages (`language`, default the
  market's first): tr (TRY; tr, en or ar), de and at (EUR; de), fr, be, hr,
  dk, ee, fi, it, lv, lt, nl, pt, si, es, se and lu (EUR; en), bg (EUR; bg or
  en), gr (EUR; el or en), sk (EUR; sk or en), cz (CZK; cs or en), hu (HUF; hu
  or en), pl (PLN; pl or en), ro (RON; ro or en), rs (RSD; sr or en), ua (UAH;
  uk or en), md (MDL; ro or en), ae (AED; en or ar), sa (SAR; ar or en), qa,
  kw, om and bh (QAR, KWD, OMR, BHD; ar or en) and az (AZN; tr). `deals` and
  `coupons` are tr only; `rankings` is not on the 15 English-language EU
  storefronts, which have no ranking lists; `delivery`'s `city_id` /
  `district_id` are tr only (Istanbul 133, Sisli 54; there is no city list).
- `product` returns the `buy_box` seller and `other_sellers`: every other
  seller's price, seller score (out of 10), badges and lowest-price badge.
  Trendyol's developer FAQ says the buy box is chosen by algorithm metrics,
  not price alone, so compare the two rather than assuming the buy box is the
  lowest price.
- The international storefronts have their own price lists, not a currency
  conversion of the Turkish price (measured on 2 products on 2026-11-15), and
  their items are sold by Trendyol itself or by other sellers (check `buy_box`
  and `other_sellers`).
- `lowest_price_badge` is the site's "lowest price of the last N days" tag (7,
  10, 14, 30 or 90 days): a day count, not a numeric 30-day lowest price.
  There is no price history, so poll to track changes.
- Grids (search, category, brand, deals, seller products) are 36 per page, at
  most 138 pages; `total` stops at 100,000 (`total_capped`). Sponsored cards
  are flagged `sponsored`, kept, and repeat across pages. Search cards give
  favourites and orders as the site's rounded text.
- Coupons belong to each seller's listing: the buy box often has none while
  another seller has some, so pass `seller_id` from `other_sellers`.
- Reviews carry the site's masked author only; no seller e-mail, tax number or
  address is returned.

```typescript
// One product: the buy-box seller and every other seller's price and score.
const p = (await client.trendyol.product({ content_id: 975557855 })) as any;
console.log(p.data.buy_box.seller.name, p.data.buy_box.seller.score, p.data.buy_box.price, p.data.currency);
for (const o of p.data.other_sellers) console.log(o.seller.name, o.seller.score, o.price, o.lowest_price_badge);

// Search: 36 per page, sponsored cards flagged.
const res = (await client.trendyol.search({ query: "telefon", sort: "price_asc" })) as any;
console.log(res.data.total, res.data.total_capped, res.data.count, res.data.sponsored_count);

// Reviews, coupons on one listing, a top-100 list and a delivery estimate.
const rev = (await client.trendyol.reviews({ content_id: 975557855, sort: "newest" })) as any;
const cp = (await client.trendyol.coupons({ content_id: 1164743007 })) as any;
const top = (await client.trendyol.rankings({ category_id: 56 })) as any;
const dl = (await client.trendyol.delivery({ content_id: 975557855, city_id: 133, district_id: 54 })) as any;
console.log(rev.data.rating_histogram, cp.data.coupons, top.data.items[0], dl.data.listings[0].delivery);
```

Every call raises the request timeout to `TRENDYOL_TIMEOUT` (120s) and never
lowers a longer client timeout; failed calls are not charged, a not-found is
charged.

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
relevance or price only. Search rows carry `brand`, `rating` and `review_count`
for organic listings; most sponsored rows return `review_count: null`.
Mercado Libre may narrow a query to a category, brand
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
// In-store stock at every Target near a ZIP (new in 0.27.0)
await client.target.availability({ tcin: "85978609", zip: "79407" });
```

`store_id` on search, category, product and reviews sets the store for prices.
`availability` is the in-store stock call: per store it returns units,
in-store, pickup, curbside and ship-to-store status, distance, address and hours
(up to 20 stores; pass `store_id` to keep one). About 3s.

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

US (homedepot.com, the default): 2 credits per call. Search page size is fixed
at 12, so paging is the only way to read further; reviews are 30 per page and a
page past `total_pages` is a 404. `product` carries only a 10-review preview —
`reviews` is the paginated surface.

#### Home Depot Canada

Home Depot Canada (homedepot.ca, The Home Depot's Canadian store: 182 stores in
10 provinces): pass `country: "ca"` to `search`, `product` and `reviews`;
`category`, `categories`, `stock`, `store` and `suggestions` are Home Depot
Canada only and need no country. 1 credit per call on every Canada call. Prices
in CAD as Home Depot Canada gives them; `language: "fr"` returns French names
and links with the same ids and prices. Home Depot Canada has no public API.
See the [Home Depot API page](https://scavio.dev/homedepot-api?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme).

```typescript
// Priced at one store: every product carries store_units and aisle / bay.
await client.homeDepot.search({ query: "cordless drill", country: "ca", store_id: "7080" });
// price = that store's price (price_source "store"), online_price beside it.
await client.homeDepot.product({ item_id: "1000112108", country: "ca", store_id: "7128" });
// Exact units at every store near a postal code or city, no prices.
await client.homeDepot.stock({ item_id: "1001769719", location: "H3B 1A1" });
await client.homeDepot.categories({ depth: 2 });
await client.homeDepot.category({ category_id: "661103", store_id: "7128", sort_by: "price_low" });
await client.homeDepot.store({ store_id: "7076" });
await client.homeDepot.suggestions({ query: "christ" });
```

Captured 2026-11-25: the 2-inch x 4-inch x 8-ft SPF Premium Stud (1000112108)
at store 7128 (ST-HENRI, QC) at 4.14 CAD with 2858 units in aisle 19, bay 001,
next to an `online_price` of 6.58. Prices can differ by store (lumber does; the
tools, Christmas tree and fridge sampled had one price everywhere), and the
online price can differ from a store's price. Search takes `store_id` (default
store 7274; `data.store` says which), `page_size` 1-40, the sorts
`best_match`, `price_low`, `price_high` and `top_rated` (`top_sellers` is a 400
for Canada), facet `filters` from `include_facets`, and `deals`
(`special_buy`, `new_lower_price`, `savings`); with `category_id` or `deals`
the query is optional. `reviews` returns the first 8 reviews per language and
the first page of questions (page 2 is a 400; no reviewer names). When Home
Depot Canada has no store record for an item that exists, `product` returns the
online price with `store_price_returned: false` and `stock` answers an unbilled
502. Not available for Canada: UPC or barcodes (Home Depot Canada shows none),
structured sale end dates (the price badge and Home Depot's promotion text
only), delivery quotes, the flyer, cart or checkout, price history (poll and
store the answers). For the same item at other Canadian retailers use
`client.canadianTire`, `client.walmart` (`domain: "ca"`) and `client.amazon`
(`country: "ca"`); match on brand and model.

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

2 credits per call. Glassdoor's login wall caps `reviews` at **three reviews per
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

### [Company Enrich](https://scavio.dev/docs/company-enrich?utm_source=npm-scavio-js&utm_medium=package&utm_campaign=readme)

Find a company's contact details and its owner from its website or a Google
Maps `place_id`: published emails, phone numbers (E.164), social
profiles and contact page, plus the owner's name and title with the page that
names them. One endpoint, `client.company.enrich()` (new in 0.53.0). Pass
`url` (a bare domain works; social profile URLs are a 400) or `place_id`;
when both are sent, `url` is the site that gets read.

- 10 credits from a url, 20 from a place_id (1 when the Maps listing has no
  readable website). A site that cannot be reached is a free 502; 400s are free.
- `data.owner` is null when no page names one. `owner.email` is set only when
  an address on the site matches the owner's name (`email_status:
  "published"`); otherwise it is null with `"not_found"`.
- Each call reads the home page, up to 3 contact, about or team pages, and the
  privacy and terms pages.

```ts
const maps = (await client.google.mapsSearch({ query: "plumber austin tx" })) as any;
const placeId = maps.local_results[0].place_id;

const res = await client.company.enrich({ place_id: placeId });
const { company, owner } = res.data;
console.log(company.name, company.website, company.emails, company.phones, company.address);
console.log(company.socials.facebook, company.contact_page);
if (owner) console.log(owner.name, owner.title, owner.source_url, owner.email_status);
console.log(res.credits_used);
```

Calls usually take 10-45s, but a slow site can take about 2 minutes, so every call
raises the request timeout to `COMPANY_ENRICH_TIMEOUT` (180s) and never lowers
a longer client timeout.

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
