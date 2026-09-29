import { alphaVantage, finite } from './alpha-vantage';
export type EodQuote={symbol:string;price:number|null;changePct:number|null;tradeDate:string|null};
export async function getEodQuote(symbol:string):Promise<EodQuote>{
  const j=await alphaVantage('GLOBAL_QUOTE',symbol);
  const q=j['Global Quote']||{};
  const price=finite(q['05. price']);
  const tradeDate=String(q['07. latest trading day']||'')||null;
  const raw=String(q['10. change percent']||'').replace('%','');
  const changePct=finite(raw);
  if(price==null) throw new Error(`GLOBAL_QUOTE returned no price for ${symbol}`);
  return {symbol,price,changePct,tradeDate};
}
