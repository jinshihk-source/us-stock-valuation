import {dashboardData} from './data';
import {readDashboardSnapshot,writeDashboardSnapshot} from './dashboard-snapshot';
import {refreshMetric,mergeMetrics,metricAges} from './persistent-metrics';
import {refreshForwardOne,readForwardCache,forwardAges} from './persistent-forward';

function fwd(stocks:any[],cache:Map<string,any>){return stocks.map(s=>{const c=cache.get(s.symbol);if(!c)return s;const pe=s.price!=null&&c.forwardEps!=null&&c.forwardEps>0?s.price/c.forwardEps:null;return {...s,forwardEps:c.forwardEps,forwardPe:pe,epsRevision30d:c.epsRevision30d,analystCount:c.analystCount,estimateAsOf:c.estimateAsOf,estimateSource:c.estimateSource}})}

export async function advanceBatch(count=1){
  const base=(await readDashboardSnapshot())||dashboardData;
  const ma=await metricAges(), fa=await forwardAges();
  const now=Date.now(), week=7*864e5;
  const limit=Math.max(1,Math.min(count,2));

  // Critical rule: bootstrap must advance historical coverage first.
  // A failed/missing Forward estimate must never pin the worker to the same symbol.
  const missingHistorical=base.stocks.filter(s=>!ma.has(s.symbol));
  const staleHistorical=base.stocks.filter(s=>ma.has(s.symbol)&&now-(ma.get(s.symbol) as number)>week)
    .sort((a,b)=>(ma.get(a.symbol) as number)-(ma.get(b.symbol) as number));
  const missingForward=base.stocks.filter(s=>!fa.has(s.symbol));
  const staleForward=base.stocks.filter(s=>fa.has(s.symbol)&&now-(fa.get(s.symbol) as number)>week)
    .sort((a,b)=>(fa.get(a.symbol) as number)-(fa.get(b.symbol) as number));

  const chosen=(missingHistorical.length?missingHistorical:staleHistorical.length?staleHistorical:missingForward.length?missingForward:staleForward).slice(0,limit);
  const results:any[]=[];
  for(const s of chosen){
    const r:any={symbol:s.symbol};
    try{
      if(!ma.has(s.symbol)||now-(ma.get(s.symbol) as number)>week){await refreshMetric(s);r.historical='ok'}else r.historical='fresh';
    }catch(e:any){r.historical=String(e?.message||e).slice(0,140)}
    try{
      if(!fa.has(s.symbol)||now-(fa.get(s.symbol) as number)>week){const fr=await refreshForwardOne(s);r.forward=fr.ok?'ok':'unavailable';r.forwardNote=fr.note}else r.forward='fresh';
    }catch(e:any){r.forward=String(e?.message||e).slice(0,140)}
    results.push(r);
  }

  let stocks=await mergeMetrics(base.stocks);stocks=fwd(stocks,await readForwardCache());
  const h=stocks.filter(x=>x.ttmEps!=null).length,fw=stocks.filter(x=>x.forwardPe!=null).length;
  const nowIso=new Date().toISOString();
  await writeDashboardSnapshot({...base,version:'2.9.1',dataStatus:`snapshot_ready_${h}_historical_${fw}_forward_of_${stocks.length}`,stocks,updatedAt:nowIso,events:[{symbol:'SYSTEM',title:`后台数据进度：历史 ${h}/${stocks.length} · Forward ${fw}/${stocks.length}`,source:'V2.9.1 Batch Worker',time:nowIso.slice(0,10),note:'历史覆盖优先推进；Forward 缺失不会阻塞下一只股票。'},...base.events.filter(e=>e.symbol!=='SYSTEM').slice(0,5)]});
  return {results,historicalReady:h,forwardReady:fw,total:stocks.length};
}
