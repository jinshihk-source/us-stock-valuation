import type {GlobalIndex} from './types';
const ITEMS=[['上证指数','000001.SS','中国','Asia/Shanghai','约30分钟'],['日经225','^N225','日本','Asia/Tokyo','延迟行情'],['韩国KOSPI','^KS11','韩国','Asia/Seoul','延迟行情'],['越南VN30','VNI30','越南','Asia/Ho_Chi_Minh','网页实时行情']] as const;
function parts(epoch:number,tz:string){const p=new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date(epoch*1000)),g=(k:string)=>p.find(x=>x.type===k)?.value||'';return {date:g('year')+'-'+g('month')+'-'+g('day'),mins:Number(g('hour'))*60+Number(g('minute'))}}
function state(tz:string){const p=new Intl.DateTimeFormat('en-US',{timeZone:tz,weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()),g=(k:string)=>p.find(x=>x.type===k)?.value||'',wd=g('weekday'),m=Number(g('hour'))*60+Number(g('minute'));if(wd==='Sat'||wd==='Sun')return '休市' as const;if(tz==='Asia/Ho_Chi_Minh'){if(m<540)return '未开盘' as const;if((m>=540&&m<690)||(m>=780&&m<885))return '盘中' as const;if(m>=690&&m<780)return '午间休市' as const;return '已收盘' as const}const open=tz==='Asia/Shanghai'?(m>=570&&m<690)||(m>=780&&m<900):tz==='Asia/Tokyo'?(m>=540&&m<690)||(m>=750&&m<930):tz==='Asia/Seoul'?(m>=540&&m<930):false;return open?'盘中' as const:'已收盘' as const}
async function scrapeShanghai():Promise<GlobalIndex>{
 try{
  const r=await fetch('https://hq.sinajs.cn/list=s_sh000001',{cache:'no-store',headers:{
   'User-Agent':'Mozilla/5.0','Referer':'https://finance.sina.com.cn/','Accept':'text/plain,*/*'
  }});
  if(!r.ok)throw new Error('Sina HTTP '+r.status);
  const raw=await r.text();
  const q1=raw.indexOf('"'),q2=raw.lastIndexOf('"');
  if(q1<0||q2<=q1)throw new Error('Sina quote format');
  const a=raw.slice(q1+1,q2).split(',');
  const price=Number(a[1]),change=Number(a[2]);
  if(!Number.isFinite(price)||price<=0||!Number.isFinite(change))throw new Error('Sina quote values');
  const previousClose=price-change;
  if(!Number.isFinite(previousClose)||previousClose<=0)throw new Error('Sina previous close');
  const changePct=change/previousClose*100;
  const asOf=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());
  return {name:'上证指数',symbol:'000001.SH',market:'中国',timeZone:'Asia/Shanghai',price,changePct,asOf,status:state('Asia/Shanghai'),source:'新浪公开行情文本 · 同行快照',delay:'网页行情'};
 }catch(e){
  console.error('Shanghai quote failed',e);
  return {name:'上证指数',symbol:'000001.SH',market:'中国',timeZone:'Asia/Shanghai',price:null,changePct:null,asOf:null,status:'数据等待',source:'新浪公开行情文本',delay:'等待行情'};
 }
}
const WEB_QUOTES=[
 {name:'日经225',symbol:'^N225',market:'日本',timeZone:'Asia/Tokyo',url:'https://jp.investing.com/indices/japan-ni225',delay:'Investing · 日经225现成行情'},
 {name:'韩国KOSPI',symbol:'^KS11',market:'韩国',timeZone:'Asia/Seoul',url:'https://indices.krx.co.kr/main/main.jsp',delay:'KRX官方网页'},
 {name:'越南VN30',symbol:'VNI30',market:'越南',timeZone:'Asia/Ho_Chi_Minh',url:'https://vn.investing.com/indices/vn-30-historical-data',delay:'Investing · VN30现成行情'}
] as const;

async function scrapeWebIndex(x:typeof WEB_QUOTES[number]):Promise<GlobalIndex|null>{
 try{
  const r=await fetch(x.url,{cache:'no-store',headers:{'User-Agent':'Mozilla/5.0','Accept':'text/html,application/xhtml+xml','Accept-Language':'en-US,en;q=0.9,ko;q=0.8,vi;q=0.8'}});
  if(!r.ok)throw new Error('HTTP '+r.status);
  const raw=await r.text();
  const h=raw.replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;|&minus;/g,' ').replace(/\s+/g,' ');
  let price:number|null=null,pct:number|null=null;
  if(x.symbol==='^N225'){
   const m=h.match(/(?:日経平均株価|Nikkei 225|N225)[\s\S]{0,600}?([0-9]{2,3},[0-9]{3}(?:\.[0-9]+)?)[\s\S]{0,120}?([+-]?\d+(?:\.\d+)?)%/i)
    ||h.match(/([0-9]{2,3},[0-9]{3}(?:\.[0-9]+)?)\s+[+-]?[0-9,.]+\s*\(([+-]?\d+(?:\.\d+)?)%\)/i);
   if(m){price=Number(m[1].replace(/,/g,''));pct=Number(m[2])}
  }else if(x.symbol==='^KS11'){
   const m=h.match(/KOSPI\s+([0-9]{1,2},[0-9]{3}(?:\.[0-9]+)?)\s+[▲▼]?\s*[0-9,.]+\s*\(?([0-9.]+)\)?/i);
   if(m){price=Number(m[1].replace(/,/g,''));const seg=m[0];pct=Number(m[2])*(seg.includes('▼')?-1:1)}
  }else{
   const m=h.match(/VN\s*30\s*\(VNI30\)[\s\S]{0,500}?([0-9]{1,2},[0-9]{3}(?:\.[0-9]+)?)[\s\S]{0,100}?([+-]?\d+(?:\.\d+)?)%/i)
    ||h.match(/([0-9]{1,2},[0-9]{3}(?:\.[0-9]+)?)\s+[+-]?[0-9,.]+\s*\(([+-]?\d+(?:\.\d+)?)%\)/i);
   if(m){price=Number(m[1].replace(/,/g,''));pct=Number(m[2])}
  }
  if(price==null||pct==null||!Number.isFinite(price)||!Number.isFinite(pct)||price<=0||Math.abs(pct)>15)return null;
  const asOf=new Intl.DateTimeFormat('zh-CN',{timeZone:x.timeZone,month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());
  return {name:x.name,symbol:x.symbol,market:x.market,timeZone:x.timeZone,price,changePct:pct,asOf,status:state(x.timeZone),source:x.delay+' · 原页点位/涨跌幅',delay:x.delay};
 }catch(e){console.error('authoritative index scrape failed',x.symbol,e);return null}
}

async function scrapeVN30():Promise<GlobalIndex|null>{
 const tz='Asia/Ho_Chi_Minh';
 try{
  const r=await fetch('https://iboard.ssi.com.vn/?language=vi',{cache:'no-store',headers:{
   'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
   'Accept':'text/html,application/xhtml+xml',
   'Accept-Language':'vi-VN,vi;q=0.9,en;q=0.8'
  }});
  if(!r.ok)throw new Error('SSI iBoard HTTP '+r.status);
  const raw=await r.text();
  const h=raw.replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ');
  const m=h.match(/VN30\s+([0-9]{1,2},[0-9]{3}(?:\.[0-9]+)?)\s*\(\s*([+-]?\d+(?:\.\d+)?)\s+([+-]?\d+(?:\.\d+)?)%\s*\)/i);
  if(!m)throw new Error('VN30 published quote not present in SSI HTML');
  const price=Number(m[1].replace(/,/g,'')),pct=Number(m[3]);
  if(!Number.isFinite(price)||price<1000||price>4000||!Number.isFinite(pct)||Math.abs(pct)>10)throw new Error('VN30 validation failed');
  const timeMatch=h.match(/(?:^|\s)(\d{2}:\d{2}:\d{2})(?:\s|$)/);
  const md=new Intl.DateTimeFormat('zh-CN',{timeZone:tz,month:'2-digit',day:'2-digit',hour12:false}).format(new Date());
  const asOf=timeMatch?md+' '+timeMatch[1]:new Intl.DateTimeFormat('zh-CN',{timeZone:tz,month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());
  return {name:'越南VN30',symbol:'VNI30',market:'越南',timeZone:tz,price,changePct:pct,asOf,status:state(tz),source:'SSI iBoard · VN30原始行情',delay:'公开行情板'};
 }catch(e){console.error('SSI VN30 scrape failed',e);return null}
}

async function one(x:typeof ITEMS[number]):Promise<GlobalIndex>{const [name,symbol,market,timeZone,delay]=x;try{const u='https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(symbol)+'?range=5d&interval=5m';const r=await fetch(u,{cache:'no-store',headers:{'User-Agent':'Mozilla/5.0 (compatible; PersonalStockDashboard/1.0)','Accept':'application/json'}});if(!r.ok)throw new Error('HTTP '+r.status);const z=(await r.json())?.chart?.result?.[0],ts:number[]=z?.timestamp||[],cl:(number|null)[]=z?.indicators?.quote?.[0]?.close||[];
const points:{epoch:number;date:string;price:number}[]=[];for(let i=0;i<ts.length;i++){const price=Number(cl[i]);if(Number.isFinite(price)&&price>0){const p=parts(ts[i],timeZone);points.push({epoch:ts[i],date:p.date,price})}}if(!points.length)throw new Error('no valid intraday points');
const latest=points[points.length-1],dates=[...new Set(points.map(p=>p.date))].sort(),prevDate=[...dates].reverse().find(d=>d<latest.date);if(!prevDate)throw new Error('previous trading day missing');const prevPoints=points.filter(p=>p.date===prevDate),prev=prevPoints[prevPoints.length-1];const changePct=(latest.price/prev.price-1)*100,asOf=new Intl.DateTimeFormat('zh-CN',{timeZone,month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(latest.epoch*1000));return {name,symbol,market,timeZone,price:latest.price,changePct,asOf,status:state(timeZone),source:'Yahoo Finance 5m · same-series calculation',delay}}catch(e){console.error('global index failed',symbol,e);return {name,symbol,market,timeZone,price:null,changePct:null,asOf:null,status:'数据等待',source:'Yahoo Finance 5m',delay}}}
export async function fetchGlobalIndices(){
 const shanghai=scrapeShanghai();
 const rest=WEB_QUOTES.map(async x=>{
  const web=await scrapeWebIndex(x);
  if(web)return web;
  // Nikkei must come only from the published Nikkei page; never substitute Yahoo.
  if(x.symbol==='^N225'){
   return {name:x.name,symbol:x.symbol,market:x.market,timeZone:x.timeZone,price:null,changePct:null,asOf:null,status:'数据等待' as const,source:'Investing · 日经225现成行情',delay:'网页暂不可用'};
  }
  const fallback=ITEMS.find(i=>i[1]===x.symbol);
  const q=fallback?await one(fallback):null;
  if(!q)return {name:x.name,symbol:x.symbol,market:x.market,timeZone:x.timeZone,price:null,changePct:null,asOf:null,status:'数据等待' as const,source:'网页行情',delay:x.delay};
  if(x.symbol==='VNI30'&&state(x.timeZone)==='盘中'){
   const today=new Intl.DateTimeFormat('en-CA',{timeZone:x.timeZone,month:'2-digit',day:'2-digit'}).format(new Date());
   const quoteDay=(q.asOf||'').slice(0,5);
   if(quoteDay&&quoteDay!==today){
    return {...q,status:'数据等待' as const,source:q.source+' · 上一交易日',delay:'盘中源暂未更新'};
   }
  }
  return q;
 });
 return Promise.all([shanghai,...rest])
}
