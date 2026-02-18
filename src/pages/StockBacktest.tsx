import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Play, RotateCcw, Download, Calendar } from 'lucide-react'

// 模拟回测数据
const generateBacktestData = () => {
  const data = []
  let strategyValue = 10000
  let benchmarkValue = 10000
  for (let i = 0; i < 252; i++) {
    const strategyReturn = (Math.random() - 0.48) * 0.03
    const benchmarkReturn = (Math.random() - 0.5) * 0.02
    strategyValue *= (1 + strategyReturn)
    benchmarkValue *= (1 + benchmarkReturn)
    data.push({
      day: i + 1,
      date: `Day ${i + 1}`,
      strategy: Math.round(strategyValue * 100) / 100,
      benchmark: Math.round(benchmarkValue * 100) / 100,
    })
  }
  return data
}

const metricsData = [
  { label: '年化收益率', value: '35.28%', color: 'text-green-600' },
  { label: '夏普比率', value: '2.15', color: 'text-blue-600' },
  { label: '最大回撤', value: '-8.76%', color: 'text-red-600' },
  { label: '胜率', value: '62.34%', color: 'text-purple-600' },
  { label: '盈亏比', value: '1.68', color: 'text-orange-600' },
  { label: '交易次数', value: '89', color: 'text-gray-600' },
]

export default function StockBacktest() {
  const [backtestData] = useState(generateBacktestData())
  const [stockCode, setStockCode] = useState('600519')
  const [startDate, setStartDate] = useState('2025-01-01')
  const [endDate, setEndDate] = useState('2026-02-18')
  const [isRunning, setIsRunning] = useState(false)

  const handleRunBacktest = () => {
    setIsRunning(true)
    setTimeout(() => setIsRunning(false), 2000)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">单股回测</h1>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">回测配置</h2>
        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">股票代码</label>
            <input
              type="text"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入股票代码"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">开始日期</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">结束日期</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">初始资金</label>
            <input
              type="number"
              defaultValue={100000}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleRunBacktest}
              disabled={isRunning}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isRunning ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isRunning ? '运行中...' : '开始回测'}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-6 gap-4">
        {metricsData.map((metric) => (
          <div
            key={metric.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="text-sm text-gray-500 mb-1">{metric.label}</div>
            <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
          </div>
        ))}
      </div>

      {/* Backtest Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">收益曲线</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">策略收益</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-sm text-gray-600">基准收益</span>
            </div>
            <button className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              导出报告
            </button>
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={backtestData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`¥${value.toFixed(2)}`, '']}
              />
              <ReferenceLine y={10000} stroke="#e5e7eb" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="strategy"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="策略"
              />
              <Line
                type="monotone"
                dataKey="benchmark"
                stroke="#9ca3af"
                strokeWidth={2}
                dot={false}
                name="基准"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trade Records */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">交易记录</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">日期</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">操作</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">价格</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">数量</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">金额</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">收益</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '2025-01-08', action: '买入', price: 1645.00, quantity: 100, amount: 164500, profit: null },
                { date: '2025-03-12', action: '卖出', price: 1756.80, quantity: 100, amount: 175680, profit: 11180 },
                { date: '2025-05-20', action: '买入', price: 1698.50, quantity: 100, amount: 169850, profit: null },
                { date: '2025-08-15', action: '卖出', price: 1823.00, quantity: 100, amount: 182300, profit: 12450 },
                { date: '2025-11-06', action: '买入', price: 1712.00, quantity: 100, amount: 171200, profit: null },
                { date: '2026-01-18', action: '卖出', price: 1789.50, quantity: 100, amount: 178950, profit: 7750 },
              ].map((record, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{record.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        record.action === '买入'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {record.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">¥{record.price.toFixed(2)}</td>
                  <td className="py-3 px-4">{record.quantity}</td>
                  <td className="py-3 px-4">¥{record.amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    {record.profit !== null ? (
                      <span className={record.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {record.profit >= 0 ? '+' : ''}¥{record.profit.toLocaleString()}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
