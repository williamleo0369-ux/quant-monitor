import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts'
import {
  TrendingUp, TrendingDown, AlertCircle, Smile, Frown, Meh,
  RefreshCw, ChevronDown, Info, History, Bell, X, Settings,
  Zap, Activity, BarChart2
} from 'lucide-react'

// 情绪指标历史数据
const generateSentimentHistory = (days: number, baseSentiment: number) => {
  const data = []
  let sentiment = baseSentiment - 20 + Math.random() * 10

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    // 添加随机波动和趋势
    sentiment += (Math.random() - 0.45) * 5
    sentiment = Math.max(5, Math.min(95, sentiment))

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      fullDate: date.toISOString().split('T')[0],
      sentiment: Math.round(sentiment * 10) / 10,
      volume: Math.round(8000 + Math.random() * 8000),
      northFlow: Math.round((Math.random() - 0.3) * 200),
      margin: Math.round(18000 + Math.random() * 2000),
    })
  }
  return data
}

// 市场指标数据库
const marketIndicatorsDatabase = {
  '融资余额': {
    value: 18567,
    unit: '亿',
    change: 5.8,
    description: '两市融资余额总额，反映杠杆资金规模',
    history: [18200, 18350, 18420, 18480, 18520, 18567],
    benchmark: 18000,
    signal: '融资余额持续上升，显示场内杠杆资金活跃，市场做多意愿强烈'
  },
  '北向资金': {
    value: 156,
    unit: '亿',
    change: 12.5,
    description: '当日北向资金净流入，反映外资态度',
    history: [80, 95, 120, 135, 148, 156],
    benchmark: 100,
    signal: '北向资金大幅净流入，外资持续看好A股市场'
  },
  '成交量': {
    value: 12345,
    unit: '亿',
    change: 28.6,
    description: '两市成交金额，反映市场活跃度',
    history: [9500, 10200, 10800, 11500, 12000, 12345],
    benchmark: 10000,
    signal: '成交量显著放大，市场交投活跃，资金参与热情高'
  },
  '涨停数': {
    value: 89,
    unit: '只',
    change: 45,
    description: '当日涨停股票数量',
    history: [45, 52, 60, 72, 85, 89],
    benchmark: 50,
    signal: '涨停家数大增，热点板块轮动活跃，赚钱效应显著'
  },
  '跌停数': {
    value: 8,
    unit: '只',
    change: -25,
    description: '当日跌停股票数量',
    history: [15, 12, 10, 9, 8, 8],
    benchmark: 20,
    signal: '跌停家数减少，市场风险偏好提升，亏钱效应减弱'
  },
  '换手率': {
    value: 3.56,
    unit: '%',
    change: 1.2,
    description: '市场平均换手率',
    history: [2.8, 3.0, 3.2, 3.35, 3.48, 3.56],
    benchmark: 2.5,
    signal: '换手率升高，市场活跃度提升，短线资金博弈加剧'
  },
}

// 情绪分布数据
const sentimentDistributionData = [
  { name: '极度恐慌', range: '0-20', count: 125, color: '#22c55e' },
  { name: '恐慌', range: '20-40', count: 280, color: '#84cc16' },
  { name: '中性', range: '40-60', count: 450, color: '#eab308' },
  { name: '乐观', range: '60-80', count: 520, color: '#f97316' },
  { name: '极度贪婪', range: '80-100', count: 180, color: '#ef4444' },
]

// 市场事件数据
const marketEventsData = [
  { time: '14:55', event: 'DeepSeek概念持续发酵，板块涨幅超5%', impact: 'positive' },
  { time: '14:30', event: '北向资金加速流入，半小时净买入50亿', impact: 'positive' },
  { time: '13:45', event: '人形机器人板块异动拉升', impact: 'positive' },
  { time: '11:20', event: '央行开展1000亿逆回购操作', impact: 'neutral' },
  { time: '10:30', event: '科创板成交额突破千亿', impact: 'positive' },
  { time: '09:35', event: '开盘两市高开，沪指涨0.8%', impact: 'positive' },
]

export default function MarketSentiment() {
  // 状态管理
  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null)
  const [fearGreedValue, setFearGreedValue] = useState(78)
  const [showAlertSettings, setShowAlertSettings] = useState(false)
  const [alertThreshold, setAlertThreshold] = useState({ low: 25, high: 75 })
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 市场宽度数据
  const [marketBreadth, setMarketBreadth] = useState({
    up: 3245,
    down: 1234,
    flat: 321
  })

  // 生成情绪趋势数据
  const sentimentTrendData = useMemo(() => {
    const days = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : 90
    return generateSentimentHistory(days, fearGreedValue)
  }, [timePeriod, fearGreedValue])

  // 情绪分布饼图数据
  const sentimentPieData = useMemo(() => {
    return sentimentDistributionData.map(item => ({
      name: item.name,
      value: item.count,
      color: item.color
    }))
  }, [])

  // 获取情绪标签
  const getSentimentLabel = (value: number) => {
    if (value < 20) return { text: '极度恐慌', icon: Frown, color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
    if (value < 40) return { text: '恐慌', icon: Frown, color: 'text-green-400', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
    if (value < 60) return { text: '中性', icon: Meh, color: 'text-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' }
    if (value < 80) return { text: '贪婪', icon: Smile, color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' }
    return { text: '极度贪婪', icon: Smile, color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
  }

  const currentSentiment = getSentimentLabel(fearGreedValue)
  const SentimentIcon = currentSentiment.icon

  // 刷新数据
  const handleRefresh = () => {
    setIsRefreshing(true)

    setTimeout(() => {
      // 模拟数据更新
      const newFearGreed = Math.max(10, Math.min(90, fearGreedValue + (Math.random() - 0.5) * 10))
      setFearGreedValue(Math.round(newFearGreed))

      setMarketBreadth({
        up: Math.round(3000 + Math.random() * 1000),
        down: Math.round(1000 + Math.random() * 500),
        flat: Math.round(200 + Math.random() * 200)
      })

      setIsRefreshing(false)
    }, 1500)
  }

  // 指标列表
  const indicators = Object.entries(marketIndicatorsDatabase).map(([name, data]) => ({
    name,
    ...data
  }))

  const totalStocks = marketBreadth.up + marketBreadth.down + marketBreadth.flat
  const upDownRatio = (marketBreadth.up / marketBreadth.down).toFixed(2)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">市场情绪</h1>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${currentSentiment.bgColor} ${currentSentiment.borderColor} border`}>
            <SentimentIcon className={`w-4 h-4 ${currentSentiment.color}`} />
            <span className={`text-sm font-medium ${currentSentiment.color}`}>{currentSentiment.text}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            更新时间: {new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </div>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <History className="w-4 h-4" />
            历史对比
          </button>
          <button
            onClick={() => setShowAlertSettings(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-4 h-4" />
            预警设置
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? '刷新中...' : '刷新数据'}
          </button>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-3 gap-6">
        {/* Fear & Greed Index */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">恐慌贪婪指数</h2>
            <button
              onClick={() => setSelectedIndicator('fearGreed')}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                startAngle={180}
                endAngle={0}
                data={[{ value: fearGreedValue, fill: currentSentiment.color.replace('text-', '#').replace('-500', '') }]}
              >
                <RadialBar dataKey="value" cornerRadius={10} background isAnimationActive={false} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-gray-800">{fearGreedValue}</div>
              <div className={`flex items-center gap-1 mt-1 ${currentSentiment.color}`}>
                <SentimentIcon className="w-5 h-5" />
                <span className="font-medium">{currentSentiment.text}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-4">
            <span>极度恐慌 0</span>
            <span>50 中性</span>
            <span>100 极度贪婪</span>
          </div>
          {/* 指数刻度条 */}
          <div className="mt-4 h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-800 rounded-full shadow"
              style={{ left: `${fearGreedValue}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">市场情绪分布</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value}人 (${((value / 1555) * 100).toFixed(1)}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-5 gap-1 mt-2">
            {sentimentDistributionData.map(item => (
              <div key={item.name} className="text-center">
                <div className="w-3 h-3 rounded-full mx-auto" style={{ backgroundColor: item.color }} />
                <div className="text-xs text-gray-500 mt-1">{item.name.slice(0, 2)}</div>
                <div className="text-xs font-medium">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Breadth */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">市场宽度</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-red-500 font-medium">上涨</span>
                <span className="font-bold text-red-500">{marketBreadth.up}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${(marketBreadth.up / totalStocks) * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-green-500 font-medium">下跌</span>
                <span className="font-bold text-green-500">{marketBreadth.down}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(marketBreadth.down / totalStocks) * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">平盘</span>
                <span className="font-bold text-gray-500">{marketBreadth.flat}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gray-400 rounded-full transition-all duration-500"
                  style={{ width: `${(marketBreadth.flat / totalStocks) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-red-50 rounded-lg text-center">
              <div className="text-sm text-red-600">涨跌比</div>
              <div className="text-2xl font-bold text-red-700">{upDownRatio} : 1</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-sm text-blue-600">总家数</div>
              <div className="text-2xl font-bold text-blue-700">{totalStocks}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Indicators */}
      <div className="grid grid-cols-6 gap-4">
        {indicators.map((indicator) => (
          <div
            key={indicator.name}
            onClick={() => setSelectedIndicator(indicator.name)}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500">{indicator.name}</span>
              <Activity className="w-3 h-3 text-gray-300" />
            </div>
            <div className="text-xl font-bold text-gray-800">
              {indicator.value.toLocaleString()}{indicator.unit}
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              indicator.change >= 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              {indicator.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {indicator.change >= 0 ? '+' : ''}{indicator.change}%
            </div>
            {/* 迷你趋势图 */}
            <div className="h-8 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={indicator.history.map((v, i) => ({ x: i, v }))}>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={indicator.change >= 0 ? '#ef4444' : '#22c55e'}
                    fill={indicator.change >= 0 ? '#fef2f2' : '#f0fdf4'}
                    strokeWidth={1.5}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Sentiment Trend Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">情绪指数趋势</h2>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map(period => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  timePeriod === period
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period === '7d' ? '7天' : period === '30d' ? '30天' : '90天'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sentimentTrendData}>
              <defs>
                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'sentiment') return [`${value}`, '情绪指数']
                  return [value, name]
                }}
              />
              {/* 情绪区间参考线 */}
              <Area
                type="monotone"
                dataKey="sentiment"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#sentimentGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* 情绪区间图例 */}
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-green-500 rounded" />
            <span className="text-gray-500">恐慌区 (0-40)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-yellow-500 rounded" />
            <span className="text-gray-500">中性区 (40-60)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-red-500 rounded" />
            <span className="text-gray-500">贪婪区 (60-100)</span>
          </div>
        </div>
      </div>

      {/* Market Events */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">今日市场事件</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {marketEventsData.map((event, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  event.impact === 'positive' ? 'bg-red-50' :
                  event.impact === 'negative' ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  event.impact === 'positive' ? 'bg-red-500' :
                  event.impact === 'negative' ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <div className="flex-1">
                  <div className="text-sm text-gray-800">{event.event}</div>
                  <div className="text-xs text-gray-400 mt-1">{event.time}</div>
                </div>
                <Zap className={`w-4 h-4 ${
                  event.impact === 'positive' ? 'text-red-400' :
                  event.impact === 'negative' ? 'text-green-400' : 'text-gray-300'
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Volume Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">成交量分布</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentTrendData.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <Tooltip
                  formatter={(value: number) => [`${value}亿`, '成交量']}
                />
                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className={`${currentSentiment.bgColor} border ${currentSentiment.borderColor} rounded-xl p-4 flex items-start gap-3`}>
        <AlertCircle className={`w-5 h-5 ${currentSentiment.color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className={`font-medium ${currentSentiment.color.replace('text-', 'text-').replace('-500', '-800')}`}>
            市场情绪提示
          </div>
          <div className={`text-sm mt-1 ${currentSentiment.color.replace('text-', 'text-').replace('-500', '-700')}`}>
            当前市场情绪指数为{fearGreedValue}，处于"{currentSentiment.text}"区间。
            {fearGreedValue >= 75 && '受DeepSeek概念和人形机器人板块带动，市场热情高涨。历史数据显示，当指数超过80时市场可能出现回调风险，建议逢高减仓。'}
            {fearGreedValue >= 60 && fearGreedValue < 75 && '市场情绪偏乐观，热点板块活跃，可适度参与但需控制仓位。'}
            {fearGreedValue >= 40 && fearGreedValue < 60 && '市场情绪中性，多空博弈激烈，建议观望为主。'}
            {fearGreedValue < 40 && '市场情绪偏悲观，可能存在超跌反弹机会，建议关注优质标的逢低布局。'}
          </div>
        </div>
        <button
          onClick={() => setShowAlertSettings(true)}
          className={`p-2 rounded-lg ${currentSentiment.bgColor} hover:opacity-80 transition-opacity`}
        >
          <Settings className={`w-4 h-4 ${currentSentiment.color}`} />
        </button>
      </div>

      {/* Indicator Detail Modal */}
      {selectedIndicator && selectedIndicator !== 'fearGreed' && marketIndicatorsDatabase[selectedIndicator as keyof typeof marketIndicatorsDatabase] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedIndicator}</h3>
              <button onClick={() => setSelectedIndicator(null)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            {(() => {
              const indicator = marketIndicatorsDatabase[selectedIndicator as keyof typeof marketIndicatorsDatabase]
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600">当前值</div>
                      <div className="text-3xl font-bold text-blue-800">
                        {indicator.value.toLocaleString()}{indicator.unit}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${indicator.change >= 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                      <div className={`text-sm ${indicator.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>涨跌幅</div>
                      <div className={`text-3xl font-bold ${indicator.change >= 0 ? 'text-red-800' : 'text-green-800'}`}>
                        {indicator.change >= 0 ? '+' : ''}{indicator.change}%
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">指标说明</div>
                    <div className="text-gray-800">{indicator.description}</div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-600 mb-2">信号解读</div>
                    <div className="text-yellow-800">{indicator.signal}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">近期趋势</div>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={indicator.history.map((v, i) => ({ day: `D${i + 1}`, value: v }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                          <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={indicator.change >= 0 ? '#ef4444' : '#22c55e'}
                            strokeWidth={2}
                            dot
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedIndicator(null)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    关闭
                  </button>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Fear Greed Info Modal */}
      {selectedIndicator === 'fearGreed' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">恐慌贪婪指数说明</h3>
              <button onClick={() => setSelectedIndicator(null)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                恐慌贪婪指数是衡量市场情绪的综合指标，通过多个维度数据计算得出。
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className="text-sm">0-25: 极度恐慌 - 市场过度悲观，可能是买入机会</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                  <div className="w-4 h-4 bg-green-400 rounded" />
                  <span className="text-sm">25-45: 恐慌 - 投资者情绪偏悲观</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded">
                  <div className="w-4 h-4 bg-yellow-500 rounded" />
                  <span className="text-sm">45-55: 中性 - 市场情绪平稳</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-orange-50 rounded">
                  <div className="w-4 h-4 bg-orange-500 rounded" />
                  <span className="text-sm">55-75: 贪婪 - 投资者情绪偏乐观</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-red-50 rounded">
                  <div className="w-4 h-4 bg-red-500 rounded" />
                  <span className="text-sm">75-100: 极度贪婪 - 市场过热，注意风险</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedIndicator(null)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Settings Modal */}
      {showAlertSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">预警设置</h3>
              <button onClick={() => setShowAlertSettings(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  恐慌预警阈值 (低于此值时提醒)
                </label>
                <input
                  type="number"
                  value={alertThreshold.low}
                  onChange={(e) => setAlertThreshold(prev => ({ ...prev, low: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  min={0}
                  max={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  贪婪预警阈值 (高于此值时提醒)
                </label>
                <input
                  type="number"
                  value={alertThreshold.high}
                  onChange={(e) => setAlertThreshold(prev => ({ ...prev, high: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  min={50}
                  max={100}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAlertSettings(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    alert('预警设置已保存')
                    setShowAlertSettings(false)
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[700px] shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">历史情绪对比</h3>
              <button onClick={() => setShowHistoryModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { period: '一周前', value: 65, change: fearGreedValue - 65 },
                  { period: '一月前', value: 52, change: fearGreedValue - 52 },
                  { period: '三月前', value: 38, change: fearGreedValue - 38 },
                  { period: '一年前', value: 45, change: fearGreedValue - 45 },
                ].map(item => (
                  <div key={item.period} className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-sm text-gray-500">{item.period}</div>
                    <div className="text-2xl font-bold text-gray-800">{item.value}</div>
                    <div className={`text-sm ${item.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change}
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generateSentimentHistory(90, fearGreedValue)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="sentiment" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
