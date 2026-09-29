import { neon } from '@neondatabase/serverless';
import type { DashboardData } from './types';

function db(){
  const url=process.env.DATABASE_URL;
  return url?neon(url):null;
}

async function ensureTable(sql:ReturnType<typeof neon>){
  await sql`CREATE TABLE IF NOT EXISTS dashboard_snapshot (
    id TEXT PRIMARY KEY,
    payload JSONB NOT NULL,
    trade_date TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

export async function readDashboardSnapshot():Promise<DashboardData|null>{
  const sql=db(); if(!sql) return null;
  try{
    await ensureTable(sql);
    const rows=await sql`SELECT payload FROM dashboard_snapshot WHERE id='latest' LIMIT 1`;
    if(!rows.length) return null;
    return rows[0].payload as DashboardData;
  }catch(e){console.error('readDashboardSnapshot',e);return null;}
}

export async function writeDashboardSnapshot(data:DashboardData){
  const sql=db(); if(!sql) throw new Error('DATABASE_URL missing');
  await ensureTable(sql);
  const payload=JSON.stringify(data);
  await sql`INSERT INTO dashboard_snapshot(id,payload,trade_date,updated_at)
    VALUES('latest',${payload}::jsonb,${data.tradeDate},NOW())
    ON CONFLICT(id) DO UPDATE SET payload=EXCLUDED.payload,trade_date=EXCLUDED.trade_date,updated_at=NOW()`;
}
