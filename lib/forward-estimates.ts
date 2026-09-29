import type {StockSnapshot} from './types';

export type ForwardEstimate={forwardEps:number|null;forwardPe:number|null;forwardEpsGrowth:number|null;estimateAsOf:string|null;estimateSource:string|null;note:string};

/**
 * V2.5 provider boundary. Public production intentionally does not scrape Yahoo Finance:
 * Yahoo's Terms restrict automated collection without prior permission.
 * A licensed/permissioned consensus-estimate provider can be plugged in here later.
 */
export async function getForwardEstimate(stock:StockSnapshot):Promise<ForwardEstimate>{
  const provider=process.env.FORWARD_ESTIMATES_PROVIDER?.trim().toLowerCase();
  if(!provider){
    return {forwardEps:null,forwardPe:null,forwardEpsGrowth:null,estimateAsOf:null,estimateSource:null,note:'Forward EPS 一致预期数据源尚未配置；公开站不使用未经许可的网页爬虫。'};
  }
  return {forwardEps:null,forwardPe:null,forwardEpsGrowth:null,estimateAsOf:null,estimateSource:provider,note:`已配置 ${provider}，但当前版本尚未启用该 Provider 适配器。`};
}

export async function attachForwardEstimate(stock:StockSnapshot):Promise<StockSnapshot>{
  const e=await getForwardEstimate(stock);
  return {...stock,forwardEps:e.forwardEps,forwardPe:e.forwardPe,forwardEpsGrowth:e.forwardEpsGrowth,estimateAsOf:e.estimateAsOf,estimateSource:e.estimateSource,dataNote:[stock.dataNote,e.note].filter(Boolean).join('；')};
}
