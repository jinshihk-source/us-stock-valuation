# US Stock Valuation Dashboard V2.4.1

V2.4.1 focuses on a reliable free historical-valuation pipeline.

- Alpha Vantage monthly adjusted prices + quarterly earnings
- Rebuilds monthly TTM PE and 5-year percentile
- Requires >=36 valid monthly PE observations
- Per-stock diagnostics (`dataNote`, `historyMonths`) instead of opaque “数据不足”
- Sequential API initialization to reduce free-tier throttling
- Successful per-stock results cached for 7 days
- Live-price provider interface is reserved but intentionally disabled until a source with public-display rights is configured

Environment variable:

`ALPHA_VANTAGE_API_KEY`

The current stock prices in `lib/data.ts` remain display snapshots. They are not represented as live prices.

## V2.5 — EOD + Forward Estimate Provider

- EOD is the single price convention for the public dashboard.
- Existing Alpha Vantage historical TTM-PE / 5Y-percentile pipeline is retained.
- Added `lib/forward-estimates.ts` provider boundary and fields: `forwardEps`, `forwardPe`, `forwardEpsGrowth`, `estimateAsOf`, `estimateSource`.
- Public production deliberately does not scrape Yahoo Finance. Yahoo Terms restrict automated collection without prior permission; configure a licensed/permissioned consensus-estimate provider before enabling Forward PE.
- Until then, Forward PE and EPS estimate growth render as `—`, rather than guessed values.

## V2.6
- Alpha Vantage `EARNINGS_ESTIMATES` 接入：未来四个 fiscal quarter 的 EPS 一致预期求和为 NTM EPS。
- Forward PE = EOD 收盘价 / NTM EPS。
- EPS预期30D = 当前 NTM EPS 相对30天前 NTM EPS 的变化率。
- Forward estimate 成功结果缓存7天，页面访问复用缓存。
- Vercel Cron：工作日 23:00 UTC 预热缓存；页面底部显示数据口径、计划更新时间和实际缓存时间。
- 注意：V2.6 的定时任务负责缓存预热；股票 EOD 价格仍沿用当前项目已有价格源/快照，真正的自动 EOD 行情 Provider 需要单独完成接入后才算全自动日更。


## V2.6.1 hotfix
- Removes EARNINGS_ESTIMATES fan-out from interactive dashboard reads.
- Fixes Vercel 60s runtime timeout / 504 blank page.
- Keeps Forward provider code for later background + persistent-store integration.
- Corrects TTM EPS methodology copy to Alpha Vantage EARNINGS, matching implementation.

## V2.7 persistent Forward cache
Forward analyst estimates are no longer fetched during page/API reads. `/api/cron/update` fetches the 11 symbols serially and UPSERTs successful values into `forward_estimate_cache` in Postgres/Neon. `/api/dashboard` reads those persisted rows and calculates Forward PE using the page's EOD price. Failed refreshes do not delete previous rows.

Required production environment variables: `DATABASE_URL`, `ALPHA_VANTAGE_API_KEY`; `CRON_SECRET` is recommended. On Vercel, the simplest persistent store is a Neon Postgres Marketplace integration.

## V2.8 — persistent dashboard snapshot
- Interactive `/` and `/api/dashboard` never call Alpha Vantage. They read one persisted `dashboard_snapshot` row from Neon, with a fast built-in fallback before the first background refresh.
- Weekday cron refreshes EOD prices with `GLOBAL_QUOTE`, then writes the complete dashboard JSON snapshot to Neon.
- Forward consensus remains persisted in `forward_estimate_cache` and is refreshed weekly (Monday UTC) to reduce free-tier API usage.
- Failed symbol refreshes preserve the previous successful value; a partial failure does not blank the site.
- Historical TTM EPS / 5Y basis is intentionally not re-downloaded on every page view or every day. It should be refreshed on a lower-frequency maintenance path because it requires two additional Alpha Vantage calls per stock.

### One-time bootstrap after upgrading from V2.7
Before the first cron has a complete historical basis, call `/api/admin/bootstrap` once with the same Bearer `CRON_SECRET`. It reuses the proven V2.7 historical pipeline, writes the complete result to `dashboard_snapshot`, and is not part of normal visitor traffic. After that, `/` and `/api/dashboard` are database-only reads.

## V2.9 Final snapshot architecture
- Public `/api/dashboard` and the homepage only read the latest Neon snapshot; they never call Alpha Vantage.
- Weekday cron refreshes EOD quotes, then advances up to two stale symbols for historical valuation and Forward estimates.
- `/api/admin/bootstrap` advances one symbol per call for first-time initialization. Repeated calls are idempotent and resume from the oldest/missing symbol.
- Historical reconstruction uses `reportedDate` rather than fiscal period end to avoid look-ahead bias.
- Successful per-symbol data is persisted; failed refreshes retain prior values.
