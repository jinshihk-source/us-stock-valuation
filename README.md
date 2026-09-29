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
