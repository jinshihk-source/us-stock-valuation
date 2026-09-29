import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ok:false,error:'unauthorized'}, {status:401});
  }
  if (!process.env.MARKET_DATA_PROVIDER || !process.env.MARKET_DATA_API_KEY) {
    return NextResponse.json({
      ok:false,
      updated:false,
      reason:'market data provider is not configured; refusing to overwrite verified snapshots with fabricated data'
    }, {status:503});
  }
  return NextResponse.json({
    ok:false,
    updated:false,
    reason:'provider adapter intentionally disabled until public-display rights are confirmed'
  }, {status:503});
}
