import { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Plus, Settings, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

const portfolioData = [
  { name: '贵州茅台', code: '600519', shares: 100, cost: 1750, current: 1856, weight: 25 },
  { name: '宁德时代', code: '300750', shares: 200, cost: 220, current: 234.56, weight: 18 },
  { name: '比亚迪', code: '002594', shares: 150, cost: 250, current: 267.89, weight: 15 },
  { name: '中国平安', code: '601318', shares: 500, cost: 48, current: 45.67, weight: 12 },
  { name: '招商银行', code: '600036', shares: 400, cost: 32, current: 34.12, weight: 10 },
  { name: '隆基绿能', code: '601012', shares: 800, cost: 35, current: 32.45, weight: 10 },
  { name: '现金', code: '-', shares: 0, cost: 0, current: 50000, weight: 10 },
]

const allocationData = [
  { name: '白酒', value: 25, color: '#3b82f6' },
  { name: '新能源', value: 33, color: '#10b981' },
  { name: '金融', value: 22, color: '#f59e0b' },
  { name: '光伏', value: 10, color: '#8b5cf6' },
  { name: '现金', value: 10, color: '#9ca3af' },
]

const performanceData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  value: 100 + Math.random() * 15 - 5 + i * 0.2,
  benchmark: 100 + Math.random() * 10 - 5 + i * 0.1,
}))

const summaryData = [
  { label: '总资产', value: '¥1,234,567', change: 8.45 },
  { label: '今日盈亏', value: '¥12,345', change: 1.23 },
  { label: '持仓盈亏', value: '¥89,234', change: 7.82 },
  { label: '可用现金', value: '¥50,000', change: 0 },
]

export default function PortfolioManagement() {
  const [selectedView, setSelectedView] = useState<'list' | 'chart'>('list')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">组合管理</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-4 h-4" />
            调仓
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <Plus className="w-4 h-4" />
            新建组合
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {summaryData.map((item) => (
          <div key={item.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Wallet className="w-4 h-4" />
              {item.label}
            </div>
            <div className="text-2xl font-bold text-gray-800">{item.value}</div>
            {item.change !== 0 && (
              <div className={`flex items-center gap-1 text-sm mt-1 ${item.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {item.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {item.change >= 0 ? '+' : ''}{item.change}%
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Holdings List */}
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">持仓明细</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedView('list')}
                className={`px-3 py-1 text-sm rounded ${selectedView === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
              >
                列表
              </button>
              <button
                onClick={() => setSelectedView('chart')}
                className={`px-3 py-1 text-sm rounded ${selectedView === 'chart' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
              >
                图表
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">股票名称</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">代码</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">持股</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">成本价</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">现价</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">盈亏</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">占比</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.map((stock) => {
                  const profit = stock.code !== '-' ? (stock.current - stock.cost) * stock.shares : 0
                  const profitPercent = stock.code !== '-' ? ((stock.current - stock.cost) / stock.cost * 100) : 0
                  return (
                    <tr key={stock.code} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{stock.name}</td>
                      <td className="py-3 px-4 text-gray-500">{stock.code}</td>
                      <td className="py-3 px-4 text-right">{stock.shares || '-'}</td>
                      <td className="py-3 px-4 text-right">{stock.cost ? `¥${stock.cost.toFixed(2)}` : '-'}</td>
                      <td className="py-3 px-4 text-right">{stock.code !== '-' ? `¥${stock.current.toFixed(2)}` : `¥${stock.current.toLocaleString()}`}</td>
                      <td className="py-3 px-4 text-right">
                        {stock.code !== '-' ? (
                          <div className={profit >= 0 ? 'text-red-500' : 'text-green-500'}>
                            <div>{profit >= 0 ? '+' : ''}{profit.toFixed(0)}</div>
                            <div className="text-xs">{profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%</div>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">{stock.weight}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Allocation Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">资产配置</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {allocationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">组合净值走势</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} name="组合" />
              <Line type="monotone" dataKey="benchmark" stroke="#9ca3af" strokeWidth={2} dot={false} name="基准" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
