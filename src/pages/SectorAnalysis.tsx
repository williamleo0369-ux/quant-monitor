import { useState, useMemo } from 'react'
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
import { TrendingUp, TrendingDown, RefreshCw, ArrowUpDown, DollarSign, Activity, Search } from 'lucide-react'

// 板块数据
const sectorDatabase = {
  'AI大模型': {
    change: 5.67, volume: 2345, capitalFlow: 156.8, stocks: 68,
    topStocks: [
      { name: '寒武纪', code: '688256', price: 456.78, change: 12.34, volume: 89.5 },
      { name: '科大讯飞', code: '002230', price: 78.56, change: 8.67, volume: 67.3 },
      { name: '商汤科技', code: '688111', price: 23.45, change: 7.89, volume: 45.2 },
      { name: '云从科技', code: '688327', price: 34.56, change: 6.78, volume: 34.1 },
      { name: '海光信息', code: '688041', price: 123.45, change: 5.67, volume: 56.8 },
    ]
  },
  '人形机器人': {
    change: 4.23, volume: 1876, capitalFlow: 98.5, stocks: 42,
    topStocks: [
      { name: '优必选', code: '09880', price: 89.23, change: 15.67, volume: 78.4 },
      { name: '拓普集团', code: '601689', price: 67.89, change: 9.45, volume: 56.7 },
      { name: '三花智控', code: '002050', price: 34.56, change: 7.23, volume: 43.2 },
      { name: '鸣志电器', code: '603728', price: 45.67, change: 6.12, volume: 34.5 },
      { name: '绿的谐波', code: '688017', price: 78.90, change: 5.89, volume: 45.6 },
    ]
  },
  '芯片半导体': {
    change: 3.45, volume: 1567, capitalFlow: 78.9, stocks: 55,
    topStocks: [
      { name: '中芯国际', code: '688981', price: 89.56, change: 8.92, volume: 123.4 },
      { name: '北方华创', code: '002371', price: 345.67, change: 6.78, volume: 89.5 },
      { name: '韦尔股份', code: '603501', price: 123.45, change: 5.67, volume: 67.8 },
      { name: '兆易创新', code: '603986', price: 98.76, change: 4.56, volume: 54.3 },
      { name: '澜起科技', code: '688008', price: 67.89, change: 3.45, volume: 43.2 },
    ]
  },
  '固态电池': {
    change: 2.89, volume: 1234, capitalFlow: 56.7, stocks: 35,
    topStocks: [
      { name: '宁德时代', code: '300750', price: 198.45, change: 5.67, volume: 234.5 },
      { name: '亿纬锂能', code: '300014', price: 67.89, change: 4.56, volume: 89.3 },
      { name: '赣锋锂业', code: '002460', price: 45.67, change: 3.45, volume: 67.8 },
      { name: '天赐材料', code: '002709', price: 34.56, change: 2.89, volume: 45.6 },
      { name: '恩捷股份', code: '002812', price: 78.90, change: 2.34, volume: 56.7 },
    ]
  },
  '低空经济': {
    change: 2.34, volume: 987, capitalFlow: 45.6, stocks: 28,
    topStocks: [
      { name: '中信海直', code: '000099', price: 23.45, change: 10.05, volume: 45.6 },
      { name: '万丰奥威', code: '002085', price: 12.34, change: 8.67, volume: 34.5 },
      { name: '纵横股份', code: '688070', price: 45.67, change: 6.78, volume: 23.4 },
      { name: '航天彩虹', code: '002389', price: 34.56, change: 5.45, volume: 34.5 },
      { name: '亿航智能', code: 'EH', price: 15.67, change: 4.56, volume: 12.3 },
    ]
  },
  '量子计算': {
    change: 1.78, volume: 756, capitalFlow: 34.5, stocks: 23,
    topStocks: [
      { name: '国盾量子', code: '688027', price: 123.45, change: 7.89, volume: 34.5 },
      { name: '科大国创', code: '300520', price: 34.56, change: 5.67, volume: 23.4 },
      { name: '亨通光电', code: '600487', price: 23.45, change: 4.56, volume: 45.6 },
      { name: '神州信息', code: '000555', price: 12.34, change: 3.45, volume: 12.3 },
      { name: '光迅科技', code: '002281', price: 34.56, change: 2.89, volume: 23.4 },
    ]
  },
  '新能源车': {
    change: -0.45, volume: 1456, capitalFlow: -23.4, stocks: 89,
    topStocks: [
      { name: '比亚迪', code: '002594', price: 312.80, change: 2.89, volume: 156.7 },
      { name: '长城汽车', code: '601633', price: 23.45, change: 1.23, volume: 89.4 },
      { name: '理想汽车', code: 'LI', price: 34.56, change: -0.45, volume: 67.8 },
      { name: '小鹏汽车', code: 'XPEV', price: 12.34, change: -1.23, volume: 45.6 },
      { name: '蔚来汽车', code: 'NIO', price: 8.90, change: -2.34, volume: 78.9 },
    ]
  },
  '医药生物': {
    change: -1.12, volume: 1123, capitalFlow: -45.6, stocks: 156,
    topStocks: [
      { name: '恒瑞医药', code: '600276', price: 45.67, change: 1.23, volume: 78.9 },
      { name: '药明康德', code: '603259', price: 67.89, change: 0.45, volume: 67.8 },
      { name: '迈瑞医疗', code: '300760', price: 289.45, change: -0.67, volume: 45.6 },
      { name: '爱尔眼科', code: '300015', price: 23.45, change: -1.45, volume: 34.5 },
      { name: '智飞生物', code: '300122', price: 45.67, change: -2.34, volume: 23.4 },
    ]
  },
}

type SortType = 'change' | 'volume' | 'capitalFlow'

export default function SectorAnalysis() {
  const [sortType, setSortType] = useState<SortType>('change')
  const [selectedSector, setSelectedSector] = useState<string>('AI大模型')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // 根据排序类型对板块数据进行排序
  const sortedSectorData = useMemo(() => {
    const data = Object.entries(sectorDatabase).map(([name, info]) => ({
      name,
      change: info.change,
      volume: info.volume,
      capitalFlow: info.capitalFlow,
      stocks: info.stocks,
    }))

    return data.sort((a, b) => {
      switch (sortType) {
        case 'change':
          return b.change - a.change
        case 'volume':
          return b.volume - a.volume
        case 'capitalFlow':
          return b.capitalFlow - a.capitalFlow
        default:
          return 0
      }
    })
  }, [sortType])

  // 过滤后的板块数据
  const filteredSectorData = useMemo(() => {
    if (!searchTerm) return sortedSectorData
    return sortedSectorData.filter(s => s.name.includes(searchTerm))
  }, [sortedSectorData, searchTerm])

  // 热力图数据
  const treemapData = useMemo(() => {
    return sortedSectorData.map(s => ({
      name: s.name,
      size: s.volume,
      change: s.change,
    }))
  }, [sortedSectorData])

  // 当前选中板块的龙头股
  const currentTopStocks = useMemo(() => {
    return sectorDatabase[selectedSector as keyof typeof sectorDatabase]?.topStocks || []
  }, [selectedSector])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleSectorClick = (sectorName: string) => {
    setSelectedSector(sectorName)
  }

  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, change } = props

    if (width < 50 || height < 30) return null

    const isSelected = name === selectedSector

    return (
      <g style={{ cursor: 'pointer' }} onClick={() => handleSectorClick(name)}>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={change >= 0 ? (isSelected ? '#fca5a5' : '#fee2e2') : (isSelected ? '#86efac' : '#dcfce7')}
          stroke={isSelected ? '#3b82f6' : '#fff'}
          strokeWidth={isSelected ? 3 : 2}
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

  const sortButtons = [
    { type: 'change' as SortType, label: '按涨幅', icon: ArrowUpDown },
    { type: 'volume' as SortType, label: '按成交量', icon: Activity },
    { type: 'capitalFlow' as SortType, label: '按资金流', icon: DollarSign },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">板块分析</h1>
        <div className="flex items-center gap-3">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索板块..."
              className="pl-10 pr-4 py-2 w-48 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* 排序按钮组 */}
          {sortButtons.map((btn) => {
            const Icon = btn.icon
            return (
              <button
                key={btn.type}
                onClick={() => setSortType(btn.type)}
                className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-lg transition-all ${
                  sortType === btn.type
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {btn.label}
              </button>
            )
          })}

          {/* 刷新按钮 */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            刷新
          </button>
        </div>
      </div>

      {/* 当前排序提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
        当前排序: <strong>{sortButtons.find(b => b.type === sortType)?.label}</strong> |
        已选板块: <strong>{selectedSector}</strong> ({sectorDatabase[selectedSector as keyof typeof sectorDatabase]?.stocks} 只个股)
      </div>

      {/* Treemap */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">板块热力图</h2>
        <p className="text-sm text-gray-500 mb-4">点击板块可查看龙头股详情</p>
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
        {filteredSectorData.map((sector) => (
          <div
            key={sector.name}
            onClick={() => handleSectorClick(sector.name)}
            className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all cursor-pointer ${
              selectedSector === sector.name
                ? 'border-blue-500 shadow-md'
                : 'border-gray-100 hover:shadow-md hover:border-gray-200'
            }`}
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
            <div className="space-y-1 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>成交量</span>
                <span className="font-medium text-gray-700">{sector.volume}亿</span>
              </div>
              <div className="flex justify-between">
                <span>资金流</span>
                <span className={`font-medium ${sector.capitalFlow >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {sector.capitalFlow >= 0 ? '+' : ''}{sector.capitalFlow}亿
                </span>
              </div>
              <div className="flex justify-between">
                <span>个股数</span>
                <span className="font-medium text-gray-700">{sector.stocks}只</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            板块{sortButtons.find(b => b.type === sortType)?.label.slice(1)}排行
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredSectorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#9ca3af" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => {
                    if (sortType === 'change') return [`${value}%`, '涨跌幅']
                    if (sortType === 'volume') return [`${value}亿`, '成交量']
                    return [`${value}亿`, '资金流']
                  }}
                />
                <Bar dataKey={sortType} radius={[0, 4, 4, 0]}>
                  {filteredSectorData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        sortType === 'capitalFlow'
                          ? entry.capitalFlow >= 0 ? '#ef4444' : '#22c55e'
                          : sortType === 'change'
                          ? entry.change >= 0 ? '#ef4444' : '#22c55e'
                          : '#3b82f6'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Stocks in Sector */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedSector}板块龙头股
            </h2>
            <span className="text-sm text-gray-500">
              共 {sectorDatabase[selectedSector as keyof typeof sectorDatabase]?.stocks || 0} 只
            </span>
          </div>
          <div className="space-y-3">
            {currentTopStocks.map((stock, index) => (
              <div
                key={stock.code}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer"
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
                <div className="text-center">
                  <div className="text-xs text-gray-400">成交量</div>
                  <div className="text-sm text-gray-600">{stock.volume}亿</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">¥{stock.price.toFixed(2)}</div>
                  <div className={`text-sm ${stock.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
