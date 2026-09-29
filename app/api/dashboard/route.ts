import { NextResponse } from 'next/server';
import { dashboardData } from '../../../lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    dataStatus: 'reference_snapshot',
    ...dashboardData,
  });
}
