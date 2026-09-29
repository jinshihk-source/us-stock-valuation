const stocks=[
{name:'NVIDIA',symbol:'NVDA',group:'七姐妹 · AI芯片',price:228.86,chg:1.68,pe:28.46,avg5:57.02,label:'估值偏低'},
{name:'Apple',symbol:'AAPL',group:'七姐妹',price:338.40,chg:-0.78,pe:38.82,avg5:32.58,label:'估值偏高'},
{name:'Microsoft',symbol:'MSFT',group:'七姐妹 · AI',price:509.22,chg:-1.35,pe:28.37,avg5:31.28,label:'中性'},
{name:'Alphabet',symbol:'GOOGL',group:'七姐妹 · AI',price:342.75,chg:-0.34,pe:17.20,avg5:24.43,label:'估值偏低'},
{name:'Amazon',symbol:'AMZN',group:'七姐妹 · AI',price:246.15,chg:-1.41,pe:19.80,avg5:40.06,label:'估值偏低'},
{name:'Meta',symbol:'META',group:'七姐妹 · AI',price:715.62,chg:-4.79,pe:26.94,avg5:25.99,label:'中性'},
{name:'Tesla',symbol:'TSLA',group:'七姐妹',price:357.45,chg:-3.94,pe:330.97,avg5:215.76,label:'估值偏高'},
{name:'AMD',symbol:'AMD',group:'半导体 · AI',price:607.87,chg:-3.61,pe:null,avg5:null,label:'数据不足'},
{name:'Broadcom',symbol:'AVGO',group:'半导体 · AI',price:349.70,chg:-0.88,pe:44.64,avg5:65.48,label:'估值偏低'},
{name:'TSMC ADR',symbol:'TSM',group:'半导体',price:452.83,chg:0.49,pe:28.47,avg5:23.41,label:'中性'},
{name:'Qualcomm',symbol:'QCOM',group:'半导体',price:187.54,chg:-7.15,pe:null,avg5:null,label:'数据不足'},
];
const events=[
{symbol:'NVDA',title:'NVIDIA 宣布将股票回购授权增加 1500 亿美元，总授权规模升至 2350 亿美元',source:'Reuters / IBD',time:'2026-09-28',note:'资本回报政策变化，可能影响市场对公司现金流与估值的判断。'},
{symbol:'MARKET',title:'美股主要指数周一回落，标普500收于 7,683.69，纳指收于 26,820.38',source:'Associated Press',time:'2026-09-28',note:'利率与能源价格上行背景下，风险资产整体承压。'},
];
function money(n:number){return '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
export default function Home(){return <main>
<header><div><span className="eyebrow">US VALUATION · EOD</span><h1>美股科技估值仪表盘</h1><p>只看收盘价 · 估值与市场情绪分开 · 数据不足不猜测</p></div><div className="pill"><i/>最近交易日 <b>2026-09-28</b></div></header>
<section className="hero">
<div className="heroCard"><span className="kicker">NASDAQ-100 TRACKER</span><div className="heroPrice">QQQ <strong>$736.53</strong><em className="down">−1.07%</em></div><p>Invesco QQQ Trust · 9月28日 16:00 ET 正常交易时段收盘</p></div>
<div className="heroCard"><span className="kicker">S&P 100 TRACKER</span><div className="heroPrice">OEF <strong>$383.18</strong><em className="down">−0.77%</em></div><p>iShares S&P 100 ETF · 9月28日收盘 · 指数官方 PE 暂不展示</p></div>
</section>
<section className="summary"><div><small>观察股票</small><b>{stocks.length}</b></div><div><small>估值偏低</small><b>{stocks.filter(x=>x.label==='估值偏低').length}</b></div><div><small>中性</small><b>{stocks.filter(x=>x.label==='中性').length}</b></div><div><small>估值偏高</small><b>{stocks.filter(x=>x.label==='估值偏高').length}</b></div><div><small>市场情绪</small><b className="muted">暂不评分</b></div></section>
<div className="sectionTitle"><div><h2>核心观察池</h2><p>TTM PE 为过去12个月市盈率；5Y参考为过去5年 PE 水平的辅助比较，不等同于严格历史分位。</p></div><span>按市值/主题观察</span></div>
<div className="table"><div className="thead"><span>公司</span><span>收盘价</span><span>当日</span><span>TTM PE</span><span>5Y PE参考</span><span>估值观察</span></div>{stocks.map(x=><div className="stock" key={x.symbol}><div className="identity"><b>{x.symbol}</b><small>{x.name} · {x.group}</small></div><strong>{money(x.price)}</strong><span className={x.chg>=0?'up':'down'}>{x.chg>=0?'+':''}{x.chg.toFixed(2)}%</span><span>{x.pe?.toFixed(2)??'暂无数据'}</span><span>{x.avg5?.toFixed(2)??'暂无数据'}</span><em className={'tag '+(x.label==='估值偏低'?'low':x.label==='估值偏高'?'high':'')}>{x.label}</em></div>)}</div>
<div className="columns"><section className="panel"><div className="sectionTitle compact"><div><h2>当天重点事件</h2><p>只陈述事件与“可能影响”，不把新闻直接断言为涨跌原因。</p></div></div>{events.map(e=><article className="event" key={e.title}><span>{e.symbol}</span><div><b>{e.title}</b><p>{e.note}</p><small>{e.source} · {e.time}</small></div></article>)}</section>
<section className="panel methodology"><h2>数据与口径</h2><p><b>价格：</b>页面当前快照使用 2026-09-28 美股正常交易时段最终收盘数据；不使用盘前、盘后价格。</p><p><b>TTM PE：</b>显示已交叉核验的过去12个月 PE。盈利为负应显示“不适用”；无法可靠取得则显示“暂无数据”。</p><p><b>估值标签：</b>当前展示版使用当前 TTM PE 与5年历史 PE 水平作观察性比较；正式历史分位需要完整逐日 PE 序列后启用。</p><p><b>Forward PE：</b>本版不展示。原因是分析师一致预期属于商业预测数据，未取得稳定公开展示授权。</p><p><b>指数 PE：</b>本版不展示。不会用成分股 PE 简单平均冒充 Nasdaq-100 / S&P 100 官方整体 PE。</p></section></div>
<section className="source"><b>更新状态</b><span className="ok">● 已验证收盘快照</span><span>价格日期：2026-09-28</span><span>页面生成：2026-09-29</span><span>下一步：接入服务器端 EOD 自动更新</span></section>
<footer><b>数据来源说明：</b> SEC EDGAR 用于公司财务原始数据；本展示快照的价格/估值由公开历史行情页面交叉核验。公开发布前，自动数据提供器仍需采用允许公开展示的来源。本站仅用于信息与估值观察，不构成投资建议。</footer>
</main>}
