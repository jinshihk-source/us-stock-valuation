import {NextResponse} from 'next/server';
import {getFastDashboard} from '../../../lib/snapshot-service';
export const dynamic='force-dynamic';
export const maxDuration=10;
export async function GET(){const d=await getFastDashboard();const fwd=d.stocks.filter(x=>x.forwardPe!=null).length;return NextResponse.json({generatedAt:new Date().toISOString(),version:'3.0-realtime',mode:'snapshot',marketData:'realtime-ready',forwardReady:fwd,total:d.stocks.length,...d});}
