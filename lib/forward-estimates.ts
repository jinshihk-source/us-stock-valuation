import {unstable_cache} from 'next/cache';
import type {StockSnapshot} from './types';
import {alphaVantage,finite} from './alpha-vantage';

export type ForwardEstimate={forwardEps:number|null;forwardPe:number|null;epsRevision30d:number|null;analystCount:number|null;estimateAsOf:string|null;estimateSource:string|null;note:string};
type Quarter={date:string;eps:number;eps30:number|null;analysts:number|null};

async function fetchEstimate(symbol:string){return alphaVantage('EARNINGS_ESTIMATES',symbol)}
function cachedEstimate(symbol:string){return unstable_cache(()=>fetchEstimate(symbol),['forward-estimates-v26',symbol],{revalidate:604800})();}

export async function getForwardEstimate(stock:StockSnapshot):Promise<ForwardEstimate>{
  if(!process.env.ALPHA_VANTAGE_API_KEY)return {forwardEps:null,forwardPe:null,epsRevision30d:null,analystCount:null,estimateAsOf:null,estimateSource:null,note:'未配置 Alpha Vantage API Key'};
  try{
    const j=await cachedEstimate(stock.symbol);
    const asOf=stock.tradeDate||new Date().toISOString().slice(0,10);
    const q:Quarter[]=(j.estimates||[]).filter((x:any)=>String(x.horizon).toLowerCase()==='fiscal quarter'&&String(x.date)>asOf).map((x:any)=>({date:String(x.date),eps:finite(x.eps_estimate_average),eps30:finite(x.eps_estimate_average_30_days_ago),analysts:finite(x.eps_estimate_analyst_count)})).filter((x:any)=>x.eps!=null).sort((a:any,b:any)=>a.date.localeCompare(b.date)).slice(0,4);
    if(q.length<4)return {forwardEps:null,forwardPe:null,epsRevision30d:null,analystCount:null,estimateAsOf:null,estimateSource:'Alpha Vantage · EARNINGS_ESTIMATES',note:`仅找到 ${q.length}/4 个未来季度 EPS 一致预期，暂不计算 NTM Forward PE`};
    const ntm=q.reduce((s,x)=>s+x.eps,0);
    const old=q.every(x=>x.eps30!=null)?q.reduce((s,x)=>s+(x.eps30 as number),0):null;
    const revision=old!=null&&old!==0?(ntm-old)/Math.abs(old)*100:null;
    const counts=q.map(x=>x.analysts).filter((x):x is number=>x!=null);
    const analystCount=counts.length?Math.round(counts.reduce((a,b)=>a+b,0)/counts.length):null;
    const pe=stock.price!=null&&ntm>0?stock.price/ntm:null;
    return {forwardEps:ntm,forwardPe:pe,epsRevision30d:revision,analystCount,estimateAsOf:q[0].date+' → '+q[3].date,estimateSource:'Alpha Vantage · EARNINGS_ESTIMATES',note:`NTM EPS = 未来4个 fiscal quarter 一致预期之和；约 ${analystCount??'—'} 位分析师/季度；预期缓存7天`};
  }catch(e:any){return {forwardEps:null,forwardPe:null,epsRevision30d:null,analystCount:null,estimateAsOf:null,estimateSource:'Alpha Vantage',note:`Forward estimate 暂不可用：${String(e?.message||e).slice(0,140)}`};}
}
export async function attachForwardEstimate(stock:StockSnapshot):Promise<StockSnapshot>{const e=await getForwardEstimate(stock);return {...stock,forwardEps:e.forwardEps,forwardPe:e.forwardPe,epsRevision30d:e.epsRevision30d,analystCount:e.analystCount,estimateAsOf:e.estimateAsOf,estimateSource:e.estimateSource,dataNote:[stock.dataNote,e.note].filter(Boolean).join('；')}}
