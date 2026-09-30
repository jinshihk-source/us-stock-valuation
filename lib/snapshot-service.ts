import type {DashboardData,StockSnapshot,MarketIndex} from './types';
import {dashboardData} from './data';
import {readDashboardSnapshot,writeDashboardSnapshot} from './dashboard-snapshot';
import {mergeMetrics} from './persistent-metrics';
import {refreshQuote,refreshIndexQuote} from './market-quotes';
import {fetchMajorNews} from './news-service';
import {fetchVix} from './vix-service';
import {enrichYahooFundamentals} from './yahoo-fundamentals';

export async function getFastDashboard():Promise<DashboardData>{return (await readDashboardSnapshot())||{...dashboardData,events:[]}}
export async function refreshDailySnapshot(){
 const previous=(await readDashboardSnapshot())||dashboardData,base=previous.stocks.length?previous.stocks:dashboardData.stocks;
 const quoteResults:{symbol:string;ok:boolean;note:string}[]=[];const quoted:StockSnapshot[]=[];
 for(const stock of base){try{quoted.push(await refreshQuote(stock));quoteResults.push({symbol:stock.symbol,ok:true,note:'quote updated'})}catch(e:any){quoted.push(stock);quoteResults.push({symbol:stock.symbol,ok:false,note:String(e?.message||'quote failed').slice(0,100)})}}
 let stocks=await mergeMetrics(quoted);const fundamentalResults:{symbol:string;ok:boolean;note:string}[]=[];
 for(let i=0;i<stocks.length;i++){try{stocks[i]=await enrichYahooFundamentals(stocks[i]);fundamentalResults.push({symbol:stocks[i].symbol,ok:true,note:'Yahoo fundamentals updated'})}catch(e:any){fundamentalResults.push({symbol:stocks[i].symbol,ok:false,note:String(e?.message||'fundamentals failed').slice(0,100)})}}
 const indices:MarketIndex[]=[];for(const index of previous.indices){try{indices.push(await refreshIndexQuote(index))}catch{indices.push(index)}}
 let fear=previous.fear;try{fear=await fetchVix()}catch(e){console.error('VIX refresh failed',e)}
 let events=previous.events.filter(e=>e.symbol!=='SYSTEM');try{const latest=await fetchMajorNews();if(latest.length)events=latest}catch(e){console.error('news refresh failed',e)}
 const dates=stocks.map(s=>s.tradeDate).filter((x):x is string=>!!x).sort();const data:DashboardData={...previous,indices,fear,stocks,tradeDate:dates.at(-1)||previous.tradeDate,updatedAt:new Date().toISOString(),events};await writeDashboardSnapshot(data);
 return {data,quoteResults,forwardResults:fundamentalResults}
}
export async function refreshForwardAndSnapshot(){const base=(await readDashboardSnapshot())||dashboardData;const stocks=[] as StockSnapshot[];for(const s of base.stocks){try{stocks.push(await enrichYahooFundamentals(s))}catch{stocks.push(s)}}const data={...base,stocks,updatedAt:new Date().toISOString()};await writeDashboardSnapshot(data);return {data,results:stocks.map(s=>({symbol:s.symbol,ok:s.forwardPe!=null,note:s.estimateSource||''}))}}
