import {NextRequest,NextResponse} from 'next/server';
import {refreshDailySnapshot} from '../../../../lib/snapshot-service';
export const dynamic='force-dynamic';export const maxDuration=60;
export async function GET(req:NextRequest){
 const secret=process.env.CRON_SECRET;if(secret&&req.headers.get('authorization')!==('Bearer '+secret))return NextResponse.json({ok:false,error:'unauthorized'},{status:401});
 const wd=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short'}).format(new Date());if(wd==='Sat'||wd==='Sun')return NextResponse.json({ok:true,skipped:'US market weekend'});
 try{const r=await refreshDailySnapshot();return NextResponse.json({ok:true,version:'3.1-unified',updatedAt:new Date().toISOString(),quotes:r.quoteResults.filter(x=>x.ok).length,totalQuotes:r.quoteResults.length,forward:r.forwardResults.filter(x=>x.ok).length,totalForward:r.forwardResults.length,news:r.data.events.length})}catch(e){console.error(e);return NextResponse.json({ok:false,error:'dashboard refresh failed'},{status:500})}
}
