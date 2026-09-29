import { unstable_cache } from 'next/cache';
import { dashboardData } from './data';
import type { DashboardData, StockSnapshot } from './types';
import { valuationLabel } from './valuation';

type MonthlyPoint={date:string;price:number};
type EpsPoint={fiscalDateEnding:string;reportedDate?:string;reportedEPS:number};

function n(v:any):number|null{const x=Number(v);return Number.isFinite(x)?x:null}
async function av(fn:string,symbol:string){
  const key=process.env.ALPHA_VANTAGE_API_KEY;
  if(!key) throw new Error('ALPHA_VANTAGE_API_KEY missing');
  const u=new URL('https://www.alphavantage.co/query');
  u.searchParams.set('function',fn);u.searchParams.set('symbol',symbol);u.searchParams.set('apikey',key);
  const r=await fetch(u.toString(),{cache:'no-store'}); if(!r.ok) throw new Error(`Alpha Vantage ${r.status}`);
  const j=await r.json(); if(j.Note||j.Information||j['Error Message']) throw new Error(j.Note||j.Information||j['Error Message']); return j;
}
function parseMonthly(j:any):MonthlyPoint[]{
  const s=j['Monthly Adjusted Time Series']||{};
  return Object.entries(s).map(([date,v]:any)=>({date,price:n(v['5. adjusted close'])??n(v['4. close'])??NaN})).filter(x=>Number.isFinite(x.price)).sort((a,b)=>a.date.localeCompare(b.date));
}
function parseEarnings(j:any):EpsPoint[]{
  return (j.quarterlyEarnings||[]).map((x:any)=>({fiscalDateEnding:x.fiscalDateEnding,reportedDate:x.reportedDate,reportedEPS:n(x.reportedEPS)??NaN})).filter((x:EpsPoint)=>Number.isFinite(x.reportedEPS)).sort((a:EpsPoint,b:EpsPoint)=>a.fiscalDateEnding.localeCompare(b.fiscalDateEnding));
}
function ttmAt(eps:EpsPoint[],date:string){const a=eps.filter(x=>x.fiscalDateEnding<=date).slice(-4);return a.length===4?a.reduce((s,x)=>s+x.reportedEPS,0):null}
function percentile(current:number,history:number[]){const v=history.filter(x=>Number.isFinite(x)&&x>0&&x<500);if(v.length<36)return null;return v.filter(x=>x<=current).length/v.length*100}
async function enrichOne(s:StockSnapshot):Promise<StockSnapshot>{
  try{
    const [mj,ej]=await Promise.all([av('TIME_SERIES_MONTHLY_ADJUSTED',s.symbol),av('EARNINGS',s.symbol)]);
    const monthly=parseMonthly(mj), earnings=parseEarnings(ej);
    const currentEps=ttmAt(earnings,s.tradeDate||new Date().toISOString().slice(0,10));
    const currentPe=s.price!=null&&currentEps!=null&&currentEps>0?s.price/currentEps:null;
    const cutoff=new Date();cutoff.setUTCFullYear(cutoff.getUTCFullYear()-5);const cut=cutoff.toISOString().slice(0,10);
    const hist=monthly.filter(x=>x.date>=cut).map(x=>{const e=ttmAt(earnings,x.date);return e!=null&&e>0?x.price/e:NaN});
    const p=currentPe==null?null:percentile(currentPe,hist);
    return {...s,ttmEps:currentEps,ttmPe:currentPe,percentile5y:p,label:valuationLabel(currentPe,p,currentEps),source:'Alpha Vantage（月度复权价格 + 历史EPS）',status:p==null?'unavailable':'ok'};
  }catch(e){console.error('valuation enrichment failed',s.symbol,e);return s}
}
async function build():Promise<DashboardData>{
  if(!process.env.ALPHA_VANTAGE_API_KEY)return dashboardData;
  const stocks=await Promise.all(dashboardData.stocks.map(enrichOne));
  return {...dashboardData,stocks,updatedAt:new Date().toISOString(),events:[{symbol:'SYSTEM',title:'5Y 个股估值分位已启用',source:'Dashboard',time:new Date().toISOString().slice(0,10),note:'使用月度复权价格与历史季度 EPS 重建过去5年 TTM PE 序列；至少36个月有效观察值才给出分位。'},...dashboardData.events]};
}
export const getDashboardData=unstable_cache(build,['dashboard-v23-valuations'],{revalidate:86400});
