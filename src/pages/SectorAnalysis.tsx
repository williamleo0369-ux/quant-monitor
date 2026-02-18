import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Treemap,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

const sectorData = [
  { name: '新能源', change: 3.25, volume: 1256, stocks: 45, color: '#ef4444' },
  { name: '半导体', change: 2.18, volume: 987, stocks: 38, color: '#f97316' },
  { name: '医药生物', change: 1.56, volume: 1123, stocks: 125, color: '#eab308' },
  { name: '银行', change: -0.45, volume: 567, stocks: 42, color: '#22c55e' },
  { name: '房地产', change: -1.23, volume: 345, stocks: 89, color: '#14b8a6' },
  { name: '消费电子', change: 1.89, volume: 756, stocks: 56, color: '#3b82f6' },
  { name: '白酒', change: 0.78, volume: 423, stocks: 18, color: '#8b5cf6' },
  { name: '汽车', change: 2.45, volume: 892, stocks: 67, color: '#ec4899' },
]

const treemapData = [
  { name: '新能源', size: 1256, change: 3.25 },
  { name: '半导体', size: 987, change: 2.18 },
  { name: '医药生物', size: 1123, change: 1.56 },
  { name: '银行', size: 567, change: -0.45 },
  { name: '房地产', size: 345, change: -1.23 },
  { name: '消费电子', size: 756, change: 1.89 },
  { name: '白酒', size: 423, change: 0.78 },
  { name: '汽车', size: 892, change: 2.45 },
  { name: '电力', size: 634, change: 0.34 },
  { name: '钢铁', size: 289, change: -0.67 },
]

const topStocksInSector = [
  { name: '宁德时代', code: '300750', price: 234.56, change: 4.56 },
  { name: '比亚迪', code: '002594', price: 267.89, change: 3.89 },
  { name: '隆基绿能', code: '601012', price: 32.45, change: 2.78 },
  { name: '阳光电源', code: '300274', price: 89.12, change: 2.34 },
  { name: '通威股份', code: '600438', price: 45.67, change: 1.89 },
]

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899']

const CustomizedContent = (props: any) => {
  const { x, y, width, height, name, change } = props

  if (width < 50 || height < 30) return null

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={change >= 0 ? '#fee2e2' : '#dcfce7'}
        stroke="#fff"
        strokeWidth={2}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 8}
        textAnchor="middle"
        fill="#374151"
        fontSize={12}
        fontWeight="bold"
      >
        {name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 10}
        textAnchor="middle"
        fill={change >= 0 ? '#dc2626' : '#16a34a'}
        fontSize={11}
      >
        {change >= 0 ? '+' : ''}{change}%
      </text>
    </g>
  )
}

export default function SectorAnalysis() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">板块分析</h1>
        <div className="flex gap-2">
          {['按涨幅', '按成交量', '按资金流'].map((filter) => (
            <button
              key={filter}
              className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Treemap */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">板块热力图</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              content={<CustomizedContent />}
            />
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector Cards */}
      <div className="grid grid-cols-4 gap-4">
        {sectorData.map((sector) => (
          <div
            key={sector.name}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-800">{sector.name}</span>
              <div className={`flex items-center ${sector.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {sector.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              </div>
            </div>
            <div className={`text-2xl font-bold mb-2 ${sector.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
              {sector.change >= 0 ? '+' : ''}{sector.change}%
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>成交量: {sector.volume}亿</span>
              <span>{sector.stocks}只</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">板块涨跌幅排行</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#9ca3af" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="change" radius={[0, 4, 4, 0]}>
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.change >= 0 ? '#ef4444' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Stocks in Sector */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">新能源板块龙头股</h2>
          <div className="space-y-3">
            {topStocksInSector.map((stock, index) => (
              <div
                key={stock.code}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index < 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-medium text-gray-800">{stock.name}</div>
                    <div className="text-xs text-gray-400">{stock.code}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">¥{stock.price.toFixed(2)}</div>
                  <div className="text-sm text-red-500">+{stock.change}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
