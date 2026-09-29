import { neon } from '@neondatabase/serverless';
import type { StockSnapshot } from './types';
import { getForwardEstimate } from './forward-estimates';

export type StoredForward = {
  symbol:string; forwardEps:number|null; forwardPe:number|null; epsRevision30d:number|null;
  analystCount:number|null; estimateAsOf:string|null; estimateSource:string|null;
  priceAtCalculation:number|null; updatedAt:string;
};

function db(){
  const url=process.env.DATABASE_URL;
  if(!url) return null;
  return neon(url);
}

async function ensureTable(sql:ReturnType<typeof neon>){
  await sql`CREATE TABLE IF NOT EXISTS forward_estimate_cache (
    symbol TEXT PRIMARY KEY,
    forward_eps DOUBLE PRECISION,
    eps_revision_30d DOUBLE PRECISION,
    analyst_count INTEGER,
    estimate_as_of TEXT,
    estimate_source TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

export async function readForwardCache():Promise<Map<string,StoredForward>>{
  const sql=db(); const out=new Map<string,StoredForward>();
  if(!sql) return out;
  try{
    await ensureTable(sql);
    const rows=await sql`SELECT symbol, forward_eps, eps_revision_30d, analyst_count, estimate_as_of, estimate_source, updated_at FROM forward_estimate_cache`;
    for(const r of rows as any[]){
      out.set(String(r.symbol),{symbol:String(r.symbol),forwardEps:r.forward_eps==null?null:Number(r.forward_eps),forwardPe:null,epsRevision30d:r.eps_revision_30d==null?null:Number(r.eps_revision_30d),analystCount:r.analyst_count==null?null:Number(r.analyst_count),estimateAsOf:r.estimate_as_of??null,estimateSource:r.estimate_source??'Alpha Vantage · EARNINGS_ESTIMATES',priceAtCalculation:null,updatedAt:new Date(r.updated_at).toISOString()});
    }
  }catch(e){console.error('readForwardCache',e)}
  return out;
}

export async function mergeForwardCache(stocks:StockSnapshot[]):Promise<StockSnapshot[]>{
  const cache=await readForwardCache();
  return stocks.map(s=>{
    const c=cache.get(s.symbol); if(!c) return s;
    const pe=s.price!=null&&c.forwardEps!=null&&c.forwardEps>0?s.price/c.forwardEps:null;
    return {...s,forwardEps:c.forwardEps,forwardPe:pe,epsRevision30d:c.epsRevision30d,analystCount:c.analystCount,estimateAsOf:c.estimateAsOf,estimateSource:c.estimateSource,dataNote:[s.dataNote,`Forward 一致预期已持久化；最近后台更新 ${c.updatedAt}`].filter(Boolean).join('；')};
  });
}

export async function refreshForwardCache(stocks:StockSnapshot[]){
  const sql=db(); if(!sql) throw new Error('DATABASE_URL missing: please connect a Postgres/Neon database in Vercel.');
  await ensureTable(sql);
  const results:{symbol:string;ok:boolean;note:string}[]=[];
  for(const stock of stocks){
    try{
      const e=await getForwardEstimate(stock);
      if(e.forwardEps==null){results.push({symbol:stock.symbol,ok:false,note:e.note});continue;}
      await sql`INSERT INTO forward_estimate_cache(symbol,forward_eps,eps_revision_30d,analyst_count,estimate_as_of,estimate_source,updated_at)
        VALUES(${stock.symbol},${e.forwardEps},${e.epsRevision30d},${e.analystCount},${e.estimateAsOf},${e.estimateSource},NOW())
        ON CONFLICT(symbol) DO UPDATE SET forward_eps=EXCLUDED.forward_eps,eps_revision_30d=EXCLUDED.eps_revision_30d,analyst_count=EXCLUDED.analyst_count,estimate_as_of=EXCLUDED.estimate_as_of,estimate_source=EXCLUDED.estimate_source,updated_at=NOW()`;
      results.push({symbol:stock.symbol,ok:true,note:e.note});
    }catch(err:any){results.push({symbol:stock.symbol,ok:false,note:String(err?.message||err).slice(0,160)});}
  }
  return results;
}

export async function forwardAges(){
  const sql=db(); if(!sql) return new Map<string,number>(); await ensureTable(sql);
  const rows=await sql`SELECT symbol,updated_at FROM forward_estimate_cache`;
  return new Map((rows as any[]).map(r=>[String(r.symbol),new Date(r.updated_at).getTime()]));
}
export async function refreshForwardOne(stock:StockSnapshot){
  const sql=db(); if(!sql) throw new Error('DATABASE_URL missing'); await ensureTable(sql);
  const e=await getForwardEstimate(stock); if(e.forwardEps==null)return {symbol:stock.symbol,ok:false,note:e.note};
  await sql`INSERT INTO forward_estimate_cache(symbol,forward_eps,eps_revision_30d,analyst_count,estimate_as_of,estimate_source,updated_at) VALUES(${stock.symbol},${e.forwardEps},${e.epsRevision30d},${e.analystCount},${e.estimateAsOf},${e.estimateSource},NOW()) ON CONFLICT(symbol) DO UPDATE SET forward_eps=EXCLUDED.forward_eps,eps_revision_30d=EXCLUDED.eps_revision_30d,analyst_count=EXCLUDED.analyst_count,estimate_as_of=EXCLUDED.estimate_as_of,estimate_source=EXCLUDED.estimate_source,updated_at=NOW()`;
  return {symbol:stock.symbol,ok:true,note:e.note};
}
