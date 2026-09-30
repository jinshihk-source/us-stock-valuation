import type {DashboardData,StockSnapshot,MarketIndex} from './types';
import {dashboardData} from './data';
import {readDashboardSnapshot,writeDashboardSnapshot} from './dashboard-snapshot';
import {readForwardCache,refreshForwardCache} from './persistent-forward';
import {mergeMetrics} from './persistent-metrics';
import {refreshQuote,refreshIndexQuote} from './market-quotes';
import {fetchMajorNews} from './news-service';
import {fetchVix} from './vix-service';

function withForward(stocks:StockSnapshot[],cache:Awaited<ReturnType<typeof readForwardCache>>){return stocks.map(s=>{const c=cache.get(s.symbol);if(!c)return s;const pe=s.price!=null&&c.forwardEps!=null&&c.forwardEps>0?s.price/c.forwardEps:null;return {...s,forwardEps:c.forwardEps,forwardPe:pe,epsRevision30d:c.epsRevision30d,analystCount:c.analystCount,estimateAsOf:c.estimateAsOf,estimateSource:c.estimateSource}})}
export async function getFastDashboard():Promise<DashboardData>{const snap=await readDashboardSnapshot();if(snap)return snap;const f=await readForwardCache();return {...dashboardData,stocks:withForward(dashboardData.stocks,f),events:[]}}

export async function refreshDailySnapshot(){
 const previous=(await readDashboardSnapshot())||dashboardData;
 const baseStocks=previous.stocks.length?previous.stocks:dashboardData.stocks;
 const forwardResults=await refreshForwardCache(baseStocks);
 const forward=await readForwardCache();const prepared=withForward(baseStocks,forward);
 const quoteResults:{symbol:string;ok:boolean;note:string}[]=[];const stocks:StockSnapshot[]=[];
 for(const stock of prepared){try{stocks.push(await refreshQuote(stock));quoteResults.push({symbol:stock.symbol,ok:true,note:'quote updated'})}catch(e:any){stocks.push(stock);quoteResults.push({symbol:stock.symbol,ok:false,note:String(e?.message||'quote failed').slice(0,100)})}}
 let merged=await mergeMetrics(stocks);merged=withForward(merged,forward);
 const indices:MarketIndex[]=[];for(const index of previous.indices){try{indices.push(await refreshIndexQuote(index))}catch{indices.push(index)}}
 let fear=previous.fear;try{fear=await fetchVix()}catch(e){console.error('VIX refresh failed',e)}
 let events=previous.events.filter(e=>e.symbol!=='SYSTEM');try{const latest=await fetchMajorNews();if(latest.length)events=latest}catch(e){console.error('news refresh failed',e)}
 const dates=merged.map(s=>s.tradeDate).filter((x):x is string=>!!x).sort();const data:DashboardData={...previous,indices,fear,stocks:merged,tradeDate:dates.at(-1)||previous.tradeDate,updatedAt:new Date().toISOString(),events};
 await writeDashboardSnapshot(data);return {data,quoteResults,forwardResults}
}
export async function refreshForwardAndSnapshot(){const base=(await readDashboardSnapshot())||dashboardData;const results=await refreshForwardCache(base.stocks);const f=await readForwardCache();const data={...base,stocks:withForward(base.stocks,f),updatedAt:new Date().toISOString()};await writeDashboardSnapshot(data);return {data,results}}
