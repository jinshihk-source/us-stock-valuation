import { unstable_cache } from 'next/cache';
import { dashboardData } from './data';
import type { DashboardData, StockSnapshot } from './types';
import { valuationLabel } from './valuation';

type MonthlyPoint={date:string;price:number};
type EpsPoint={fiscalDateEnding:string;reportedDate?:string;reportedEPS:number};
type Enrichment={ttmEps:number|null;ttmPe:number|null;percentile5y:number|null;historyMonths:number;source:string;status:'ok'|'unavailable'|'not_applicable';dataNote:string};

function n(v:any):number|null{const x=Number(v);return Number.isFinite(x)?x:null}
function compactError(v:any){const s=String(v?.message||v||'unknown error').replace(/\s+/g,' ').trim();return s.slice(0,180)}
async function av(fn:string,symbol:string){
  const key=process.env.ALPHA_VANTAGE_API_KEY;
  if(!key) throw new Error('ALPHA_VANTAGE_API_KEY missing');
  const u=new URL('https://www.alphavantage.co/query');
  u.searchParams.set('function',fn);u.searchParams.set('symbol',symbol);u.searchParams.set('apikey',key);
  const r=await fetch(u.toString(),{next:{revalidate:604800}});
  if(!r.ok) throw new Error(`Alpha Vantage HTTP ${r.status}`);
  const j=await r.json();
  const apiError=j.Note||j.Information||j['Error Message'];
  if(apiError) throw new Error(apiError);
  return j;
}
function parseMonthly(j:any):MonthlyPoint[]{
  const s=j['Monthly Adjusted Time Series']||j['Monthly Time Series']||{};
  return Object.entries(s).map(([date,v]:any)=>({date,price:n(v['5. adjusted close'])??n(v['4. close'])??NaN})).filter(x=>Number.isFinite(x.price)).sort((a,b)=>a.date.localeCompare(b.date));
}
function parseEarnings(j:any):EpsPoint[]{
  return (j.quarterlyEarnings||[]).map((x:any)=>({fiscalDateEnding:x.fiscalDateEnding,reportedDate:x.reportedDate,reportedEPS:n(x.reportedEPS)??NaN})).filter((x:EpsPoint)=>Number.isFinite(x.reportedEPS)).sort((a:EpsPoint,b:EpsPoint)=>a.fiscalDateEnding.localeCompare(b.fiscalDateEnding));
}
function ttmAt(eps:EpsPoint[],date:string){const a=eps.filter(x=>x.fiscalDateEnding<=date).slice(-4);return a.length===4?a.reduce((s,x)=>s+x.reportedEPS,0):null}
function percentile(current:number,history:number[]){const v=history.filter(x=>Number.isFinite(x)&&x>0&&x<500);if(v.length<36)return {p:null,n:v.length};return {p:v.filter(x=>x<=current).length/v.length*100,n:v.length}}
async function buildSymbol(symbol:string,tradeDate:string|null,price:number|null):Promise<Enrichment>{
  try{
    // 免费档每只股票仅两次请求；结果按股票缓存 7 天，避免页面刷新反复消耗 25 次/日额度。
    const mj=await av('TIME_SERIES_MONTHLY_ADJUSTED',symbol);
    const ej=await av('EARNINGS',symbol);
    const monthly=parseMonthly(mj), earnings=parseEarnings(ej);
    if(!monthly.length) throw new Error('未返回月度价格序列');
    if(earnings.length<4) throw new Error('历史季度 EPS 少于4期');
    const asOf=tradeDate||new Date().toISOString().slice(0,10);
    const currentEps=ttmAt(earnings,asOf);
    if(currentEps==null) throw new Error('无法构造当前 TTM EPS');
    if(currentEps<=0)return {ttmEps:currentEps,ttmPe:null,percentile5y:null,historyMonths:0,source:'Alpha Vantage',status:'not_applicable',dataNote:'TTM EPS ≤ 0，PE 不适用'};
    const currentPe=price!=null?price/currentEps:null;
    if(currentPe==null) throw new Error('当前价格为空');
    const cutoff=new Date(asOf+'T00:00:00Z');cutoff.setUTCFullYear(cutoff.getUTCFullYear()-5);const cut=cutoff.toISOString().slice(0,10);
    const hist=monthly.filter(x=>x.date>=cut&&x.date<=asOf).map(x=>{const e=ttmAt(earnings,x.date);return e!=null&&e>0?x.price/e:NaN});
    const {p, n:months}=percentile(currentPe,hist);
    return {ttmEps:currentEps,ttmPe:currentPe,percentile5y:p,historyMonths:months,source:'Alpha Vantage（月度复权价格 + 历史季度EPS）',status:p==null?'unavailable':'ok',dataNote:p==null?`仅 ${months} 个月有效PE，需要至少36个月`:`${months} 个月有效PE；历史分位计算成功`};
  }catch(e){return {ttmEps:null,ttmPe:null,percentile5y:null,historyMonths:0,source:'Alpha Vantage',status:'unavailable',dataNote:compactError(e)}}
}
function cachedSymbol(symbol:string,tradeDate:string|null,price:number|null){
  return unstable_cache(()=>buildSymbol(symbol,tradeDate,price),['valuation-v24',symbol,tradeDate||'na',String(price??'na')],{revalidate:604800})();
}
async function enrichOne(s:StockSnapshot):Promise<StockSnapshot>{
  if(!process.env.ALPHA_VANTAGE_API_KEY)return {...s,dataNote:'未配置 ALPHA_VANTAGE_API_KEY'};
  const x=await cachedSymbol(s.symbol,s.tradeDate,s.price);
  if(x.status==='unavailable')return {...s,status:'unavailable',source:x.source,dataNote:x.dataNote,historyMonths:x.historyMonths,priceMode:'snapshot'};
  const label=x.status==='not_applicable'?'不适用':valuationLabel(x.ttmPe,x.percentile5y,x.ttmEps);
  return {...s,ttmEps:x.ttmEps,ttmPe:x.ttmPe,percentile5y:x.percentile5y,label,status:x.status,source:x.source,dataNote:x.dataNote,historyMonths:x.historyMonths,priceMode:'snapshot'};
}
export async function getDashboardData():Promise<DashboardData>{
  if(!process.env.ALPHA_VANTAGE_API_KEY)return {...dashboardData,stocks:dashboardData.stocks.map(s=>({...s,dataNote:'未配置 ALPHA_VANTAGE_API_KEY'}))};
  // 串行执行，避免免费 API 在同一瞬间收到 22 个并发请求而限流。成功结果会按股票缓存7天。
  const stocks:StockSnapshot[]=[];
  for(const s of dashboardData.stocks) stocks.push(await enrichOne(s));
  const ok=stocks.filter(s=>s.status==='ok').length;
  return {...dashboardData,stocks,updatedAt:new Date().toISOString(),events:[{symbol:'SYSTEM',title:`历史估值：${ok}/${stocks.length} 只已完成`,source:'Dashboard V2.4',time:new Date().toISOString().slice(0,10),note:'每只股票显示数据诊断；免费 API 成功结果按股票缓存7天。'},...dashboardData.events]};
}
