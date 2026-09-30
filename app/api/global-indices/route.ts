import {NextResponse} from 'next/server';
import {fetchGlobalIndices} from '../../../lib/global-indices';
import type {GlobalIndex} from '../../../lib/types';

export const dynamic='force-dynamic';
export const maxDuration=15;

const TTL=8000;
let cached:{generatedAt:string;indices:GlobalIndex[]}|null=null;
let cachedAt=0;
let inflight:Promise<GlobalIndex[]>|null=null;
const lastGood=new Map<string,GlobalIndex>();

async function load(){
 const now=Date.now();
 if(cached&&now-cachedAt<TTL)return cached;
 if(!inflight)inflight=fetchGlobalIndices();
 try{
  const fresh=await inflight;
  const indices=fresh.map(x=>{
   if(x.price!=null&&x.changePct!=null){
    lastGood.set(x.symbol,x);
    return x;
   }
   const old=lastGood.get(x.symbol);
   return old?{...old,status:x.status==='数据等待'?old.status:x.status,source:old.source+' · 最近有效值',delay:'上游暂时失败 · 保留最近有效值'}:x;
  });
  cached={generatedAt:new Date().toISOString(),indices};
  cachedAt=Date.now();
  return cached;
 }catch(e){
  if(cached)return cached;
  throw e;
 }finally{inflight=null}
}

export async function GET(){
 try{
  const data=await load();
  return NextResponse.json({...data,upstreamRefreshMs:TTL},{headers:{'Cache-Control':'no-store'}});
 }catch(e){
  console.error('global indices route failed',e);
  return NextResponse.json({generatedAt:new Date().toISOString(),indices:[...lastGood.values()],upstreamRefreshMs:TTL,error:'upstream temporarily unavailable'},{status:200,headers:{'Cache-Control':'no-store'}});
 }
}
