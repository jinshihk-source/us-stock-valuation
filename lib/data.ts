import type {DashboardData,StockSnapshot} from './types';
const seed:StockSnapshot[]=[
{name:'NVIDIA',symbol:'NVDA',group:'七姐妹 · AI芯片',price:228.86,changePct:1.68,ttmEps:null,ttmPe:28.46,forwardPe:null,percentile5y:null,label:'数据不足',tradeDate:'2026-09-28',status:'stale',source:'展示快照'},
{name:'Apple',symbol:'AAPL',group:'七姐妹',price:338.40,changePct:-0.78,ttmEps:null,ttmPe:38.82,forwardPe:null,percentile5y:null,label:'数据不足',tradeDate:'2026-09-28',status:'stale',source:'展示快照'},
{name:'Microsoft',symbol:'MSFT',group:'七姐妹 · AI',price:509.22,changePct:-1.35,ttmEps:null,ttmPe:28.37,forwardPe:null,percentile5y:null,label:'数据不足',tradeDate:'2026-09-28',status:'stale',source:'展示快照'},
{name:'Alphabet',symbol:'GOOGL',group:'七姐妹 · AI',price:342.75,changePct:-0.34,ttmEps:null,ttmPe:17.20,forwardPe:null,percentile5y:null,label:'数据不足',tradeDate:'2026-09-28',status:'stale',source:'展示快照'},
{name:'Amazon',symbol:'AMZN',group:'七姐妹 · AI',price:246.15,changePct:-1.41,ttmEps:null,ttmPe:19.80,forwardPe:null,percentile5y:null,label:'数据不足',tradeDate:'2026-09-28',status:'stale',source:'展示快照'},
{name:'Meta',symbol:'META',group:'七姐妹 · AI',price:715.62,changePct:-4.79,ttmEps:null,ttmPe:26.94,forwardPe:null,percentile5y:null,label:'数据不足',tradeDate:'2026-09-28',status:'stale',source:'展示快照'},
{name:'Tesla',symbol:'TSLA',group:'七姐妹',price:357.45,changePct:-3.94,ttmEps:null,ttmPe:330.97,forwardPe:null,percentile5y:null,label:'数据不足',tradeDate:'2026-09-28',status:'stale',source:'展示快照'},
{name:'AMD',symbol:'AMD',group:'半导体 · AI',price:607.87,changePct:-3.61,ttmEps:null,ttmPe:null,forwardPe:null,percentile5y:null,label:'数据不足',tradeDate:'2026-09-28',status:'stale',source:'展示快照'},
{name:'Broadcom',symbol:'AVGO',group:'半导体 · AI',price:349.70,changePct:-0.88,ttmEps:null,ttmPe:44.64,forwardPe:null,percentile5y:null,label:'数据不足',tradeDate:'2026-09-28',status:'stale',source:'展示快照'},
{name:'TSMC ADR',symbol:'TSM',group:'半导体',price:452.83,changePct:0.49,ttmEps:null,ttmPe:28.47,forwardPe:null,percentile5y:null,label:'数据不足',tradeDate:'2026-09-28',status:'stale',source:'展示快照'},
{name:'Qualcomm',symbol:'QCOM',group:'半导体',price:187.54,changePct:-7.15,ttmEps:null,ttmPe:null,forwardPe:null,percentile5y:null,label:'数据不足',tradeDate:'2026-09-28',status:'stale',source:'展示快照'},
];
export const dashboardData:DashboardData={tradeDate:'2026-09-28',updatedAt:'2026-09-29',indices:[
{name:'NASDAQ-100 / QQQ',tracker:'QQQ',description:'NASDAQ-100 指数估值 + QQQ 收盘价',price:736.53,changePct:-1.07,ttmPe:28.80,forwardPe:null,percentile5y:22.15,percentile10y:41.15,asOf:'2026-09-18',status:'stale',note:'指数估值：NASDAQ-100，2026-09-18 周度参考；5Y PE 分位 22.15%，10Y 41.15%。QQQ 价格截至 2026-09-28。'},
{name:'S&P 500 / SPY',tracker:'SPY',description:'S&P 500 指数估值 + SPY 收盘价',price:765.61,changePct:-0.74,ttmPe:25.10,forwardPe:21.31,percentile5y:40.40,percentile10y:56.25,asOf:'2026-09-23',status:'stale',note:'指数 TTM PE/历史分位为周度参考；Forward PE 采用 S&P 500 Index FY1 口径（State Street，2026-09-23）。SPY 价格截至 2026-09-28。'}],stocks:seed,sentiment:{label:'暂不评分',score:null,note:'情绪与估值独立。待合法数据源接入后由波动率、市场宽度和趋势等指标计算。'},events:[{symbol:'SYSTEM',title:'V2.1 指数估值卡已启用',source:'Dashboard',time:'2026-09-29',note:'NASDAQ-100 与 S&P 500 已显示 TTM PE、5Y/10Y 历史分位和估值温度；不同指标的 as-of 日期单独标注。'}]};
