export type MetricStatus='ok'|'unavailable'|'not_applicable'|'stale';
export interface StockRow{symbol:string;name:string;group:string;price:number|null;changePct:number|null;priceAt:string|null;ttmPe:number|null;forwardPe:number|null;estimateUpdatedAt:string|null;percentile:number|null;label:string;status:MetricStatus;reason?:string}
export interface IndexRow{name:string;symbol:string;ttmPe:number|null;forwardPe:number|null;asOf:string|null;status:MetricStatus;reason?:string}
