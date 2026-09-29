# 美股估值仪表盘 — Phase 1

Production-oriented scaffold for a Chinese US-equity valuation site. It deliberately shows unavailable states until licensed public-display data is configured.

## Implemented
- Responsive desktop/mobile dashboard.
- Separate index valuation, stock valuation, sentiment and news surfaces.
- TTM PE vs Forward PE fields; negative/missing semantics reserved.
- Historical percentile algorithm (10y, P30/P70, >=252 valid observations).
- PostgreSQL snapshot schema and update-run audit table.
- Backend-only secret design; no API key in browser code.
- Scheduled post-close workflow skeleton, failure-by-default before licensed provider configuration.
- API health/dashboard endpoints and explicit stale/unavailable states.

## Production rules
1. Never compute S&P 500 / Nasdaq-100 PE by simple constituent average.
2. Never substitute sample/demo values for current market data.
3. Store source timestamps separately: trade date, price timestamp, estimate update timestamp, news publication timestamp.
4. Scheduler must resolve America/New_York and verify an exchange calendar before committing a new snapshot; weekends/holidays produce no new trade-date snapshot.
5. News: ticker mapping -> canonical URL/title normalization -> dedupe -> published_at descending. Wording: “可能影响”.
6. Deploy only after provider display/redistribution rights are documented and an end-to-end update is validated.

## Next provider adapter
Recommended first commercial evaluation: Intrinio Startup for public display of core US EOD/fundamentals. Confirm in writing that the exact Startup entitlement includes the required Zacks Forward PE/EPS estimate feed and intended public website display; those feeds may be separate/Enterprise datasets. Index-level TTM/forward PE also requires a specifically licensed source.

## Local
`npm install && npm run dev`

Deployment trigger
