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
} from 'recharts'
import { TrendingUp, TrendingDown, AlertCircle, Smile, Frown, Meh } from 'lucide-react'

const sentimentData = [
  { name: '恐慌', value: 15, color: '#22c55e' },
  { name: '悲观', value: 20, color: '#84cc16' },
  { name: '中性', value: 25, color: '#eab308' },
  { name: '乐观', value: 25, color: '#f97316' },
  { name: '贪婪', value: 15, color: '#ef4444' },
]

const fearGreedIndex = [{ value: 65, fill: '#3b82f6' }]

const sentimentTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  sentiment: Math.round((40 + Math.random() * 40) * 10) / 10,
  volume: Math.round(Math.random() * 1000),
}))

const indicators = [
  { name: '融资余额', value: 15678, change: 2.3, status: 'bullish' },
  { name: '北向资金', value: 89, change: -1.5, status: 'bearish' },
  { name: '成交量', value: 9876, change: 15.2, status: 'bullish' },
  { name: '涨停数', value: 45, change: 12, status: 'bullish' },
  { name: '跌停数', value: 12, change: -8, status: 'bearish' },
  { name: '换手率', value: 2.34, change: 0.5, status: 'neutral' },
]

const marketBreadth = [
  { name: '上涨', value: 2456, color: '#ef4444' },
  { name: '下跌', value: 1876, color: '#22c55e' },
  { name: '平盘', value: 456, color: '#9ca3af' },
]

export default function MarketSentiment() {
  const getSentimentLabel = (value: number) => {
    if (value < 25) return { text: '极度恐慌', icon: Frown, color: 'text-green-500' }
    if (value < 45) return { text: '恐慌', icon: Frown, color: 'text-green-400' }
    if (value < 55) return { text: '中性', icon: Meh, color: 'text-yellow-500' }
    if (value < 75) return { text: '贪婪', icon: Smile, color: 'text-orange-500' }
    return { text: '极度贪婪', icon: Smile, color: 'text-red-500' }
  }

  const currentSentiment = getSentimentLabel(65)
  const SentimentIcon = currentSentiment.icon

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">市场情绪</h1>
        <div className="text-sm text-gray-500">数据更新时间: 2024-01-15 15:00</div>
      </div>

      {/* Fear & Greed Index */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">恐慌贪婪指数</h2>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                startAngle={180}
                endAngle={0}
                data={fearGreedIndex}
              >
                <RadialBar dataKey="value" cornerRadius={10} fill="#3b82f6" background />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-gray-800">65</div>
              <div className={`flex items-center gap-1 ${currentSentiment.color}`}>
                <SentimentIcon className="w-5 h-5" />
                <span className="font-medium">{currentSentiment.text}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>极度恐慌 0</span>
            <span>100 极度贪婪</span>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">情绪分布</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Breadth */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">市场宽度</h2>
          <div className="space-y-4">
            {marketBreadth.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(item.value / 4788) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">涨跌比</div>
            <div className="text-2xl font-bold text-gray-800">
              {(2456 / 1876).toFixed(2)} : 1
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="grid grid-cols-6 gap-4">
        {indicators.map((indicator) => (
          <div key={indicator.name} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">{indicator.name}</div>
            <div className="text-xl font-bold text-gray-800">
              {indicator.value.toLocaleString()}
              {indicator.name === '换手率' && '%'}
              {indicator.name === '北向资金' && '亿'}
              {indicator.name === '融资余额' && '亿'}
              {indicator.name === '成交量' && '亿'}
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              indicator.change >= 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              {indicator.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {indicator.change >= 0 ? '+' : ''}{indicator.change}%
            </div>
          </div>
        ))}
      </div>

      {/* Sentiment Trend */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">情绪趋势</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sentimentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="sentiment" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-medium text-yellow-800">市场情绪提示</div>
          <div className="text-sm text-yellow-700 mt-1">
            当前市场情绪指数为65，处于"贪婪"区间。历史数据显示，当指数超过75时市场可能出现回调风险，建议保持谨慎。
          </div>
        </div>
      </div>
    </div>
  )
}
