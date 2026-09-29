export const WATCHLIST = [
  {group:'美股七姐妹', symbols:['AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA']},
  {group:'AI / 半导体', symbols:['AMD','AVGO','TSM','ASML','ARM','MU','QCOM','AMAT','LRCX','KLAC']}
];
export const VALUATION_RULES={lookbackYears:10,lowPercentile:30,highPercentile:70,minObservations:252};
export const SENTIMENT_RULES={description:'市场情绪与估值完全独立。V1 预留 VIX、市场宽度、趋势和信用/波动指标；仅在取得合法可展示数据后计算。'};
