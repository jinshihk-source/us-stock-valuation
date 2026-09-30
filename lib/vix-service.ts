import type {FearGauge} from './types';
function level(v:number):FearGauge['level']{if(v<15)return '低波动';if(v<20)return '正常';if(v<30)return '紧张';if(v<40)return '恐慌';return '极端恐慌'}
export async function fetchVix():Promise<FearGauge>{
 const r=await fetch('https://fred.stlouisfed.org/graph/fredgraph.csv?id=VIXCLS',{cache:'no-store',headers:{'User-Agent':'us-stock-valuation personal dashboard'}});
 if(!r.ok)throw new Error('FRED VIX HTTP '+r.status);
 const lines=(await r.text()).trim().split(/\r?\n/).slice(1);
 const values=lines.map(x=>{const [date,raw]=x.split(',');const value=Number(raw);return {date,value}}).filter(x=>x.date&&Number.isFinite(x.value));
 if(!values.length)throw new Error('FRED VIX unavailable');
 const last=values.at(-1)!,prev=values.at(-2);return {value:last.value,change:prev?last.value-prev.value:null,asOf:last.date,level:level(last.value),source:'FRED · CBOE VIXCLS（日收盘）'}
}
