import { NextResponse } from 'next/server';
import { getDashboardData } from '../../../lib/enriched-data';
export const dynamic='force-dynamic';
export async function GET(){const d=await getDashboardData();return NextResponse.json({generatedAt:new Date().toISOString(),dataStatus:process.env.ALPHA_VANTAGE_API_KEY?'historical_valuation_enabled':'api_key_required',...d});}
