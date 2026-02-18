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
  { name: 'AI大模型', change: 5.67, volume: 2345, stocks: 68, color: '#ef4444' },
  { name: '人形机器人', change: 4.23, volume: 1876, stocks: 42, color: '#f97316' },
  { name: '芯片半导体', change: 3.45, volume: 1567, stocks: 55, color: '#eab308' },
  { name: '固态电池', change: 2.89, volume: 1234, stocks: 35, color: '#22c55e' },
  { name: '低空经济', change: 2.34, volume: 987, stocks: 28, color: '#14b8a6' },
  { name: '量子计算', change: 1.78, volume: 756, stocks: 23, color: '#3b82f6' },
  { name: '新能源车', change: -0.45, volume: 1456, stocks: 89, color: '#8b5cf6' },
  { name: '医药生物', change: -1.12, volume: 1123, stocks: 156, color: '#ec4899' },
]

const treemapData = [
  { name: 'AI大模型', size: 2345, change: 5.67 },
  { name: '人形机器人', size: 1876, change: 4.23 },
  { name: '芯片半导体', size: 1567, change: 3.45 },
  { name: '固态电池', size: 1234, change: 2.89 },
  { name: '低空经济', size: 987, change: 2.34 },
  { name: '量子计算', size: 756, change: 1.78 },
  { name: '新能源车', size: 1456, change: -0.45 },
  { name: '医药生物', size: 1123, change: -1.12 },
  { name: '光伏储能', size: 845, change: 0.89 },
  { name: '消费电子', size: 678, change: -0.34 },
]

const topStocksInSector = [
  { name: '寒武纪', code: '688256', price: 456.78, change: 12.34 },
  { name: '科大讯飞', code: '002230', price: 78.56, change: 8.67 },
  { name: '商汤科技', code: '688111', price: 23.45, change: 7.89 },
  { name: '云从科技', code: '688327', price: 34.56, change: 6.78 },
  { name: '海光信息', code: '688041', price: 123.45, change: 5.67 },
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">AI大模型板块龙头股</h2>
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
