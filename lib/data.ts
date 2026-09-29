import {WATCHLIST} from './config'; import type {StockRow,IndexRow} from './types';
const blocked='尚未配置具有公开展示/再分发权的数据授权；禁止用演示值冒充实时数据。';
export function unavailableStocks():StockRow[]{return WATCHLIST.flatMap(g=>g.symbols.map(symbol=>({symbol,name:symbol,group:g.group,price:null,changePct:null,priceAt:null,ttmPe:null,forwardPe:null,estimateUpdatedAt:null,percentile:null,label:'数据不足',status:'unavailable',reason:blocked})))}
export function unavailableIndices():IndexRow[]{return [{name:'标普 500',symbol:'SPX',ttmPe:null,forwardPe:null,asOf:null,status:'unavailable',reason:'指数整体 PE 必须使用获授权的指数级估值数据，不能由成分股 PE 简单平均。'},{name:'纳斯达克 100',symbol:'NDX',ttmPe:null,forwardPe:null,asOf:null,status:'unavailable',reason:'指数整体 PE 必须使用获授权的指数级估值数据，不能由成分股 PE 简单平均。'}]}
