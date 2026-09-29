import {NextRequest,NextResponse} from 'next/server';
import {dashboardData} from '../../../../lib/data';
import {refreshForwardCache} from '../../../../lib/persistent-forward';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(req:NextRequest){
  const secret=process.env.CRON_SECRET;
  if(secret&&req.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
  try{
    const results=await refreshForwardCache(dashboardData.stocks);
    const ok=results.filter(x=>x.ok).length;
    return NextResponse.json({ok:ok>0,updatedAt:new Date().toISOString(),forwardReady:ok,total:results.length,results});
  }catch(e:any){return NextResponse.json({ok:false,error:String(e?.message||e)},{status:500});}
}
