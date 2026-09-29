# Data source decision log (2026-09-29)

## Core equities
- Intrinio Startup: public pricing states commercial use + display rights; starts $333/mo for first 6 months, $666/mo next 6 months, $999/mo thereafter. Core bundle lists US fundamentals and US EOD/historical stock data. Zacks Forward PE and EPS Estimates exist as Intrinio endpoints, but exact inclusion/licensing in Startup must be confirmed before enabling them.
- Massive: Business explicitly required for customer-facing display/redistribution; public price $2,499/mo. Technically strong but too expensive for V1.
- FMP: individual plans are not enough for public display; Enterprise/display agreement is quote-based.
- EODHD: public self-serve pricing is not sufficient proof of external display rights; commercial/B2B requires separate onboarding/agreement.
- Finnhub: Enterprise explicitly says commercial use + redistribution rights and includes company news + EPS estimates, but price is contact-sales.

## Index valuation
S&P 500 and Nasdaq-100 index-level TTM/forward PE must come from a licensed index/fundamental dataset. Do not derive by simple average. Until licensed: unavailable.

## Sentiment
Build a proprietary, transparent composite only from licensed/displayable inputs. VIX is a useful component but Cboe public pages prohibit automated extraction in some quote surfaces and public display licensing may apply. Do not scrape Cboe pages. Until a licensed feed is selected, sentiment remains unavailable.

## News
Prefer a provider whose contract covers headline/source/link display. Finnhub Enterprise includes company news with redistribution rights. NewsAPI Business is $449/mo for production commercial projects but contractual article-display details still need review for the intended UI. Marketaux is cheaper but pricing alone does not establish redistribution rights; confirm terms before production.
