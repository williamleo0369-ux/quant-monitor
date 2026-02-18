import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts'
import { Plus, Search, Star, TrendingUp, BarChart2, Zap } from 'lucide-react'

const factorCategories = [
  { id: 'value', name: '价值因子', count: 12 },
  { id: 'momentum', name: '动量因子', count: 8 },
  { id: 'quality', name: '质量因子', count: 15 },
  { id: 'growth', name: '成长因子', count: 10 },
  { id: 'volatility', name: '波动因子', count: 6 },
  { id: 'technical', name: '技术因子', count: 20 },
]

const factors = [
  { id: 1, name: 'PE_TTM', category: '价值因子', ic: 0.045, ir: 1.23, turnover: 0.15, starred: true },
  { id: 2, name: 'PB_LF', category: '价值因子', ic: 0.038, ir: 1.05, turnover: 0.12, starred: true },
  { id: 3, name: 'ROE_TTM', category: '质量因子', ic: 0.052, ir: 1.45, turnover: 0.18, starred: false },
  { id: 4, name: 'MOM_20D', category: '动量因子', ic: 0.035, ir: 0.98, turnover: 0.45, starred: false },
  { id: 5, name: 'VOL_20D', category: '波动因子', ic: -0.028, ir: -0.85, turnover: 0.22, starred: false },
  { id: 6, name: 'REV_5D', category: '技术因子', ic: 0.042, ir: 1.15, turnover: 0.38, starred: true },
]

const icTrendData = Array.from({ length: 60 }, (_, i) => ({
  day: i + 1,
  ic: (Math.random() - 0.5) * 0.1 + 0.03,
  cumIc: 0.03 * (i + 1) + Math.random() * 0.5,
}))

const factorCorrelationData = [
  { x: 0.045, y: 1.23, z: 15, name: 'PE_TTM' },
  { x: 0.038, y: 1.05, z: 12, name: 'PB_LF' },
  { x: 0.052, y: 1.45, z: 18, name: 'ROE_TTM' },
  { x: 0.035, y: 0.98, z: 45, name: 'MOM_20D' },
  { x: -0.028, y: -0.85, z: 22, name: 'VOL_20D' },
  { x: 0.042, y: 1.15, z: 38, name: 'REV_5D' },
]

export default function FactorLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFactor, setSelectedFactor] = useState(factors[0])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">因子库</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索因子..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <Plus className="w-4 h-4" />
            新建因子
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          全部 (71)
        </button>
        {factorCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Factor List */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">因子列表</h2>
          <div className="space-y-2">
            {factors.map((factor) => (
              <div
                key={factor.id}
                onClick={() => setSelectedFactor(factor)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedFactor.id === factor.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{factor.name}</span>
                    {factor.starred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                  </div>
                  <span className="text-xs text-gray-400">{factor.category}</span>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>IC: {factor.ic.toFixed(3)}</span>
                  <span>IR: {factor.ir.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Factor Details */}
        <div className="col-span-2 space-y-6">
          {/* Factor Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-blue-500" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{selectedFactor.name}</h2>
                  <span className="text-sm text-gray-500">{selectedFactor.category}</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-yellow-500">
                <Star className={`w-5 h-5 ${selectedFactor.starred ? 'text-yellow-400 fill-yellow-400' : ''}`} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">IC均值</div>
                <div className="text-xl font-bold text-blue-600">{selectedFactor.ic.toFixed(3)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">IR</div>
                <div className="text-xl font-bold text-green-600">{selectedFactor.ir.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">换手率</div>
                <div className="text-xl font-bold text-orange-600">{(selectedFactor.turnover * 100).toFixed(0)}%</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">IC胜率</div>
                <div className="text-xl font-bold text-purple-600">62%</div>
              </div>
            </div>
          </div>

          {/* IC Trend Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">IC序列</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={icTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Line type="monotone" dataKey="ic" stroke="#3b82f6" strokeWidth={1} dot={false} name="IC" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Factor Scatter */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">因子 IC-IR 分布</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" dataKey="x" name="IC" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis type="number" dataKey="y" name="IR" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <ZAxis type="number" dataKey="z" range={[50, 200]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={factorCorrelationData} fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
