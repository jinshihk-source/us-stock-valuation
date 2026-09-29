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
