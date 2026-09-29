import {NextRequest,NextResponse} from 'next/server';
import {getDashboardData} from '../../../../lib/enriched-data';
import {writeDashboardSnapshot} from '../../../../lib/dashboard-snapshot';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(req:NextRequest){
  const secret=process.env.CRON_SECRET;
  if(secret&&req.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
  try{
    const data=await getDashboardData();
    await writeDashboardSnapshot({...data,updatedAt:new Date().toISOString()});
    return NextResponse.json({ok:true,version:'2.8',historicalReady:data.stocks.filter(x=>x.ttmEps!=null).length,forwardReady:data.stocks.filter(x=>x.forwardPe!=null).length,total:data.stocks.length,tradeDate:data.tradeDate});
  }catch(e:any){return NextResponse.json({ok:false,error:String(e?.message||e)},{status:500});}
}
