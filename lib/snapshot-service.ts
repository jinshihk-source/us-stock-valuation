import type {DashboardData,StockSnapshot} from './types';
import {dashboardData} from './data';
import {readDashboardSnapshot,writeDashboardSnapshot} from './dashboard-snapshot';
import {readForwardCache,refreshForwardCache} from './persistent-forward';
import {getEodQuote} from './eod';

function withForward(stocks:StockSnapshot[], cache:Awaited<ReturnType<typeof readForwardCache>>){
  return stocks.map(s=>{const c=cache.get(s.symbol);if(!c)return s;const pe=s.price!=null&&c.forwardEps!=null&&c.forwardEps>0?s.price/c.forwardEps:null;return {...s,forwardEps:c.forwardEps,forwardPe:pe,epsRevision30d:c.epsRevision30d,analystCount:c.analystCount,estimateAsOf:c.estimateAsOf,estimateSource:c.estimateSource};});
}
export async function getFastDashboard():Promise<DashboardData>{
  const snap=await readDashboardSnapshot();
  if(snap)return snap;
  // Fast fallback only: never call Alpha Vantage from an interactive page/API read.
  const f=await readForwardCache();
  return {...dashboardData,stocks:withForward(dashboardData.stocks,f),events:[{symbol:'SYSTEM',title:'V2.8 数据库快照尚未初始化',source:'Dashboard',time:new Date().toISOString().slice(0,10),note:'网页当前使用内置 EOD 快照；请运行后台更新任务生成 Neon dashboard_snapshot。'}]};
}
export async function refreshDailySnapshot(){
  const previous=(await readDashboardSnapshot())||dashboardData;
  const baseBySymbol=new Map(previous.stocks.map(s=>[s.symbol,s]));
  const eodResults:{symbol:string;ok:boolean;note:string}[]=[];
  const stocks:StockSnapshot[]=[];
  for(const seed of dashboardData.stocks){
    const old=baseBySymbol.get(seed.symbol)||seed;
    try{
      const q=await getEodQuote(seed.symbol);
      const ttmPe=q.price!=null&&old.ttmEps!=null&&old.ttmEps>0?q.price/old.ttmEps:old.ttmPe;
      stocks.push({...old,price:q.price,changePct:q.changePct,tradeDate:q.tradeDate,ttmPe,priceMode:'eod'});
      eodResults.push({symbol:seed.symbol,ok:true,note:q.tradeDate||''});
    }catch(e:any){stocks.push(old);eodResults.push({symbol:seed.symbol,ok:false,note:String(e?.message||e).slice(0,120)});}
  }
  const f=await readForwardCache();
  const merged=withForward(stocks,f);
  const dates=merged.map(s=>s.tradeDate).filter((x):x is string=>!!x).sort();
  const now=new Date().toISOString();
  const data:DashboardData={...previous,stocks:merged,tradeDate:dates.at(-1)||previous.tradeDate,updatedAt:now,events:[{symbol:'SYSTEM',title:'V2.8 每日 EOD 快照已更新',source:'Dashboard Snapshot',time:now.slice(0,10),note:`EOD 成功 ${eodResults.filter(x=>x.ok).length}/${eodResults.length}；访客请求仅从 Neon 读取，不调用 Alpha Vantage。`},...previous.events.filter(e=>e.symbol!=='SYSTEM').slice(0,5)]};
  await writeDashboardSnapshot(data);
  return {data,eodResults};
}
export async function refreshForwardAndSnapshot(){
  const base=(await readDashboardSnapshot())||dashboardData;
  const results=await refreshForwardCache(base.stocks);
  const f=await readForwardCache();
  const data={...base,stocks:withForward(base.stocks,f),updatedAt:new Date().toISOString()};
  await writeDashboardSnapshot(data);
  return {data,results};
}
