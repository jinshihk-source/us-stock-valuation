import {NextResponse} from 'next/server';import {unavailableStocks,unavailableIndices} from '../../../lib/data';
export async function GET(){return NextResponse.json({generatedAt:new Date().toISOString(),dataStatus:'license_required',indices:unavailableIndices(),stocks:unavailableStocks(),sentiment:{status:'unavailable',reason:'等待合法公开展示的数据源'}})}
