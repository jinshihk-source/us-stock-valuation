import {NextResponse} from 'next/server';
import {fetchGlobalIndices} from '../../../lib/global-indices';

export const dynamic='force-dynamic';
export const maxDuration=15;

const TTL=8000;
let cached:{generatedAt:string;indices:Awaited<ReturnType<typeof fetchGlobalIndices>>}|null=null;
let cachedAt=0;
let inflight:Promise<Awaited<ReturnType<typeof fetchGlobalIndices>>>|null=null;

async function load(){
 const now=Date.now();
 if(cached&&now-cachedAt<TTL)return cached;
 if(!inflight)inflight=fetchGlobalIndices();
 try{
  const indices=await inflight;
  cached={generatedAt:new Date().toISOString(),indices};
  cachedAt=Date.now();
  return cached;
 }finally{inflight=null}
}

export async function GET(){
 const data=await load();
 return NextResponse.json({...data,upstreamRefreshMs:TTL},{headers:{'Cache-Control':'no-store'}});
}