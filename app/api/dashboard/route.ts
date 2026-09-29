import {NextResponse} from 'next/server';
import {getFastDashboard} from '../../../lib/snapshot-service';
export const dynamic='force-dynamic';
export const maxDuration=10;
export async function GET(){
  const d=await getFastDashboard();
  const ok=d.stocks.filter(x=>x.status==='ok').length;
  const fwd=d.stocks.filter(x=>x.forwardPe!=null).length;
  return NextResponse.json({generatedAt:new Date().toISOString(),version:'2.9',dataStatus:`snapshot_ready_${ok}_historical_${fwd}_forward_of_${d.stocks.length}`,livePrice:{enabled:false,reason:'EOD-only dashboard'},...d});
}
