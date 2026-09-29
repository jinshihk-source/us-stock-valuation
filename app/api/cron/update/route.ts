import {NextRequest,NextResponse} from 'next/server';
import {refreshDailySnapshot,refreshForwardAndSnapshot} from '../../../../lib/snapshot-service';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(req:NextRequest){
  const secret=process.env.CRON_SECRET;
  if(secret&&req.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
  try{
    const daily=await refreshDailySnapshot();
    // Forward consensus is refreshed once a week (Monday UTC) to stay inside the free API budget.
    const monday=new Date().getUTCDay()===1;
    const forward=monday?await refreshForwardAndSnapshot():null;
    return NextResponse.json({ok:true,updatedAt:new Date().toISOString(),eodReady:daily.eodResults.filter(x=>x.ok).length,total:daily.eodResults.length,forwardRefresh:monday?forward?.results:null});
  }catch(e:any){return NextResponse.json({ok:false,error:String(e?.message||e)},{status:500});}
}
