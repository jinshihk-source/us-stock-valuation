import type {ValuationLabel} from './types';
export function ttmPe(price:number|null,ttmEps:number|null):number|null {if(price==null||ttmEps==null||ttmEps<=0)return null;return price/ttmEps}
export function percentileRank(current:number|null,history:number[],minObservations=252):number|null {if(current==null||!Number.isFinite(current)||current<=0)return null;const valid=history.filter(x=>Number.isFinite(x)&&x>0);if(valid.length<minObservations)return null;return valid.filter(x=>x<=current).length/valid.length*100}
export function valuationLabel(pe:number|null,_pct:number|null,eps:number|null):ValuationLabel {if(eps!=null&&eps<=0)return '不适用';if(pe==null)return '数据不足';if(pe<20)return '偏低';if(pe>40)return '偏高';return '合理'}
