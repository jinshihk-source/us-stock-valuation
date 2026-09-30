const REQUEST_GAP_MS=1350;
let lastRequestAt=0;
const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
function throttleMessage(v:any){const s=String(v||'').toLowerCase();return s.includes('sparingly')||s.includes('rate limit')||s.includes('frequency')||s.includes('requests per');}
export async function alphaVantage(fn:string,symbol?:string,extra:Record<string,string>={}){
  const key=process.env.ALPHA_VANTAGE_API_KEY;
  if(!key) throw new Error('ALPHA_VANTAGE_API_KEY missing');
  const u=new URL('https://www.alphavantage.co/query');
  u.searchParams.set('function',fn);if(symbol)u.searchParams.set('symbol',symbol);for(const [k,v] of Object.entries(extra))u.searchParams.set(k,v);u.searchParams.set('apikey',key);
  let last='Alpha Vantage request failed';
  for(let attempt=0;attempt<4;attempt++){
    const gap=Date.now()-lastRequestAt;if(gap<REQUEST_GAP_MS)await sleep(REQUEST_GAP_MS-gap);lastRequestAt=Date.now();
    const r=await fetch(u.toString(),{cache:'no-store'});
    if(!r.ok)last='Alpha Vantage HTTP '+r.status;
    else {const j=await r.json();const e=j.Note||j.Information||j['Error Message'];if(!e)return j;last=throttleMessage(e)?'Alpha Vantage rate limit reached':'Alpha Vantage upstream error';if(!throttleMessage(e))throw new Error(last);}
    if(attempt<3)await sleep(1500*Math.pow(2,attempt));
  }
  throw new Error(last);
}
export function finite(v:any):number|null{const x=Number(v);return Number.isFinite(x)?x:null}
