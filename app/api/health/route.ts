import {NextResponse} from 'next/server';export async function GET(){return NextResponse.json({ok:true,service:'us-valuation-dashboard',time:new Date().toISOString()})}
