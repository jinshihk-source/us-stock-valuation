import {NextRequest,NextResponse} from 'next/server';
import {getDashboardData} from '../../../../lib/enriched-data';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(req:NextRequest){
  const secret=process.env.CRON_SECRET;
  if(secret&&req.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
  try{const d=await getDashboardData();return NextResponse.json({ok:true,updated:true,tradeDate:d.tradeDate,updatedAt:d.updatedAt,stocks:d.stocks.length,forwardReady:d.stocks.filter(x=>x.forwardPe!=null).length,note:'缓存预热完成；访问页面复用缓存，不按访客重复抓取。'});}catch(e:any){return NextResponse.json({ok:false,updated:false,error:String(e?.message||e)},{status:500});}
}
