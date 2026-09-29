import { NextResponse } from 'next/server';
import { getDashboardData } from '../../../lib/enriched-data';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(){
  const d=await getDashboardData();
  const ok=d.stocks.filter(x=>x.status==='ok').length;
  return NextResponse.json({generatedAt:new Date().toISOString(),version:'2.6',dataStatus:process.env.ALPHA_VANTAGE_API_KEY?(ok?`historical_ready_${ok}_of_${d.stocks.length}`:'historical_requested_but_no_stock_ready'):'api_key_required',livePrice:{enabled:false,reason:'public-display live market-data provider not configured'},...d});
}
