import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts'
import { TrendingUp, TrendingDown, Search, RefreshCw } from 'lucide-react'

// 模拟K线数据
const generateKLineData = () => {
  const data = []
  let basePrice = 3200
  for (let i = 0; i < 60; i++) {
    const change = (Math.random() - 0.5) * 50
    basePrice += change
    data.push({
      date: `${Math.floor(i / 20) + 1}/${(i % 20) + 1}`,
      price: Math.round(basePrice * 100) / 100,
      volume: Math.round(Math.random() * 1000000),
      ma5: Math.round((basePrice + Math.random() * 20 - 10) * 100) / 100,
      ma10: Math.round((basePrice + Math.random() * 30 - 15) * 100) / 100,
    })
  }
  return data
}

const indexData = [
  { name: '上证指数', code: '000001.SH', price: 3567.89, change: 28.45, changePercent: 0.80 },
  { name: '深证成指', code: '399001.SZ', price: 11856.72, change: 156.34, changePercent: 1.34 },
  { name: '创业板指', code: '399006.SZ', price: 2489.56, change: 45.67, changePercent: 1.87 },
  { name: '科创50', code: '000688.SH', price: 1123.45, change: -8.92, changePercent: -0.79 },
]

const hotStocks = [
  { name: '贵州茅台', code: '600519', price: 1723.50, change: 1.85 },
  { name: '宁德时代', code: '300750', price: 198.45, change: 4.56 },
  { name: '比亚迪', code: '002594', price: 312.80, change: 2.89 },
  { name: '中芯国际', code: '688981', price: 89.56, change: 5.67 },
  { name: '华为海思概念', code: '002049', price: 45.23, change: 8.45 },
]

export default function MarketAnalysis() {
  const [chartData] = useState(generateKLineData())
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">行情分析</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索股票代码或名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <RefreshCw className="w-4 h-4" />
            刷新数据
          </button>
        </div>
      </div>

      {/* Index Cards */}
      <div className="grid grid-cols-4 gap-4">
        {indexData.map((item) => (
          <div
            key={item.code}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{item.name}</span>
              <span className="text-xs text-gray-400">{item.code}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-800">{item.price.toFixed(2)}</span>
              <div className={`flex items-center ${item.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {item.change >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">上证指数走势</h2>
            <div className="flex gap-2">
              {['1日', '5日', '1月', '3月', '1年'].map((period) => (
                <button
                  key={period}
                  className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
                <Line type="monotone" dataKey="ma5" stroke="#f59e0b" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="ma10" stroke="#10b981" strokeWidth={1} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hot Stocks */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">热门股票</h2>
          <div className="space-y-3">
            {hotStocks.map((stock) => (
              <div
                key={stock.code}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-medium text-gray-800">{stock.name}</div>
                  <div className="text-xs text-gray-400">{stock.code}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">{stock.price.toFixed(2)}</div>
                  <div className={`text-sm ${stock.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">成交量分析</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.slice(-30)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
