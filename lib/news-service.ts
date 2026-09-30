import {alphaVantage} from './alpha-vantage';
import type {DashboardData} from './types';
const SYMBOLS=['NVDA','AAPL','MSFT','GOOGL','AMZN','META','TSLA','AMD','AVGO','TSM','QCOM'];
export async function fetchMajorNews():Promise<DashboardData['events']>{
 const j=await alphaVantage('NEWS_SENTIMENT',undefined,{sort:'LATEST',limit:'200'});
 const feed=Array.isArray(j.feed)?j.feed:[];
 return feed.map((x:any)=>{
  const tickers=(x.ticker_sentiment||[]).map((t:any)=>String(t.ticker)).filter((s:string)=>SYMBOLS.includes(s));
  return {symbol:tickers.slice(0,2).join('/')||'',title:String(x.title||'').slice(0,180),source:String(x.source||'News'),time:String(x.time_published||''),note:String(x.summary||'').slice(0,260),url:typeof x.url==='string'?x.url:null}
 }).filter((x:any)=>x.symbol&&x.title).slice(0,16)
}
