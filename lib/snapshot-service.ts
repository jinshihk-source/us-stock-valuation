import type {DashboardData,StockSnapshot} from './types';
import {dashboardData} from './data';
import {readDashboardSnapshot,writeDashboardSnapshot} from './dashboard-snapshot';
import {readForwardCache,refreshForwardCache} from './persistent-forward';
import {mergeMetrics} from './persistent-metrics';
import {refreshQuote} from './market-quotes';
import {fetchMajorNews} from './news-service';

function withForward(stocks:StockSnapshot[],cache:Awaited<ReturnType<typeof readForwardCache>>){return stocks.map(s=>{const c=cache.get(s.symbol);if(!c)return s;const pe=s.price!=null&&c.forwardEps!=null&&c.forwardEps>0?s.price/c.forwardEps:null;return {...s,forwardEps:c.forwardEps,forwardPe:pe,epsRevision30d:c.epsRevision30d,analystCount:c.analystCount,estimateAsOf:c.estimateAsOf,estimateSource:c.estimateSource}})}
export async function getFastDashboard():Promise<DashboardData>{const snap=await readDashboardSnapshot();if(snap)return snap;const f=await readForwardCache();return {...dashboardData,stocks:withForward(dashboardData.stocks,f),events:[]}}
export async function refreshDailySnapshot(){
 const previous=(await readDashboardSnapshot())||dashboardData;const baseBySymbol=new Map(previous.stocks.map(s=>[s.symbol,s]));const results:{symbol:string;ok:boolean;note:string}[]=[];const stocks:StockSnapshot[]=[];
 for(const seed of dashboardData.stocks){const old=baseBySymbol.get(seed.symbol)||seed;try{stocks.push(await refreshQuote(old));results.push({symbol:seed.symbol,ok:true,note:'quote updated'})}catch(e:any){stocks.push(old);results.push({symbol:seed.symbol,ok:false,note:String(e?.message||'quote failed').slice(0,100)})}}
 let merged=await mergeMetrics(stocks);merged=withForward(merged,await readForwardCache());let events=previous.events.filter(e=>e.symbol!=='SYSTEM');
 try{const latest=await fetchMajorNews();if(latest.length)events=latest}catch(e){console.error('news refresh failed')}
 const dates=merged.map(s=>s.tradeDate).filter((x):x is string=>!!x).sort();const now=new Date().toISOString();const data:DashboardData={...previous,stocks:merged,tradeDate:dates.at(-1)||previous.tradeDate,updatedAt:now,events};await writeDashboardSnapshot(data);return {data,eodResults:results}
}
export async function refreshForwardAndSnapshot(){const base=(await readDashboardSnapshot())||dashboardData;const results=await refreshForwardCache(base.stocks);const f=await readForwardCache();const data={...base,stocks:withForward(base.stocks,f),updatedAt:new Date().toISOString()};await writeDashboardSnapshot(data);return {data,results}}
