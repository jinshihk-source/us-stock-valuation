# V2.7 data path

Visitor: page -> dashboard -> historical cache + Postgres/Neon forward_estimate_cache -> response.

Background: Vercel Cron (23:00 UTC weekdays) -> Alpha Vantage EARNINGS_ESTIMATES -> validate -> UPSERT successful symbols -> keep old row on failure.

The visitor path never calls EARNINGS_ESTIMATES. Forward PE is recalculated from the persisted NTM EPS and the current EOD price in the dashboard, so a price refresh does not require a new analyst-estimate request.

Next step: move EOD prices and the historical valuation snapshot into the same persistent database so even a cold Next.js instance does not need to rebuild history.
