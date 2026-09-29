export type Label='估值偏低'|'中性'|'估值偏高'|'数据不足'|'不适用';
export function percentileRank(current:number|null, history:number[]):number|null{
 if(current==null||!Number.isFinite(current)) return null;
 const valid=history.filter(x=>Number.isFinite(x)&&x>0); if(valid.length<252) return null;
 return valid.filter(x=>x<=current).length/valid.length*100;
}
export function valuationLabel(pe:number|null,pct:number|null):Label{
 if(pe!=null&&pe<=0) return '不适用'; if(pe==null||pct==null) return '数据不足';
 if(pct<30)return '估值偏低'; if(pct>70)return '估值偏高'; return '中性';
}
