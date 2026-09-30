import {NextResponse} from 'next/server';
import {getFastDashboard} from '../../../lib/snapshot-service';
export const dynamic='force-dynamic';
export const maxDuration=30;
export async function GET(){const d=await getFastDashboard();const fwd=d.stocks.filter(x=>x.forwardPe!=null).length;return NextResponse.json({generatedAt:new Date().toISOString(),version:'4.0-live-quotes',mode:'live-quotes-cached-fundamentals',marketData:'Nasdaq-primary',forwardReady:fwd,total:d.stocks.length,...d});}
