# 美股科技估值仪表盘 V2.1

## 本次修正
- 删除根目录旧 `index.html`，避免打开 V2 却看到 V1 的 S&P 100 / OEF 页面。
- 首页唯一入口为 Next.js `app/page.tsx`。
- 顶部固定为 `NASDAQ-100 / QQQ` 与 `S&P 500 / SPY`。
- 两张指数卡显示：收盘价、TTM PE、Forward PE（可靠时）、5Y PE 分位、10Y PE 分位、估值温度条、估值数据日期。
- 增加真实 `/api/cron/update` 路由，与 `vercel.json` 对应；未配置授权行情源时拒绝覆盖快照。

## 当前指数参考快照
- NASDAQ-100：TTM PE 28.80；5Y PE 分位 22.15%；10Y 41.15%；估值快照 2026-09-18。QQQ EOD 价格截至 2026-09-28。
- S&P 500：TTM PE 25.10；5Y PE 分位 40.40%；10Y 56.25%；Forward PE(FY1) 21.31；估值指标日期分别在页面注明。SPY EOD 价格截至 2026-09-28。

注意：指数估值和 ETF 收盘价的更新时间可能不同，页面故意分别标注，不能把旧估值伪装成当日实时值。

## 数据管线
1. SEC EDGAR XBRL -> 个股 fundamentals / TTM EPS
2. Authorized EOD provider -> close / daily change
3. Valuation engine -> TTM PE / historical percentile / label
4. Daily snapshot -> dashboard
5. Index-level valuation source -> NASDAQ-100 / S&P 500

## 部署
将 ZIP 内 `us-valuation-dashboard` 文件夹中的全部内容覆盖到现有 GitHub 仓库根目录并 Commit。Vercel 会从 `main` 自动重新部署。

## 后续环境变量
- `CRON_SECRET`
- `MARKET_DATA_PROVIDER`
- `MARKET_DATA_API_KEY`
