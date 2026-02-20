import { useState, useMemo } from 'react'
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
import { TrendingUp, TrendingDown, Search, RefreshCw, X } from 'lucide-react'

// 股票数据库 - 包含常见A股、ETF等
const stockDatabase: Record<string, { name: string; code: string; price: number; change: number; changePercent: number; type: string }> = {
  // 指数
  '000001': { name: '上证指数', code: '000001.SH', price: 3567.89, change: 28.45, changePercent: 0.80, type: 'index' },
  '399001': { name: '深证成指', code: '399001.SZ', price: 11856.72, change: 156.34, changePercent: 1.34, type: 'index' },
  '399006': { name: '创业板指', code: '399006.SZ', price: 2489.56, change: 45.67, changePercent: 1.87, type: 'index' },
  '000688': { name: '科创50', code: '000688.SH', price: 1123.45, change: -8.92, changePercent: -0.79, type: 'index' },
  '000300': { name: '沪深300', code: '000300.SH', price: 4156.78, change: 35.67, changePercent: 0.87, type: 'index' },
  '000016': { name: '上证50', code: '000016.SH', price: 2789.34, change: 18.23, changePercent: 0.66, type: 'index' },

  // ETF基金
  '518880': { name: '黄金ETF', code: '518880.SH', price: 6.125, change: 0.089, changePercent: 1.47, type: 'etf' },
  '510300': { name: '沪深300ETF', code: '510300.SH', price: 4.156, change: 0.035, changePercent: 0.85, type: 'etf' },
  '510500': { name: '中证500ETF', code: '510500.SH', price: 6.789, change: 0.078, changePercent: 1.16, type: 'etf' },
  '510050': { name: '上证50ETF', code: '510050.SH', price: 2.876, change: 0.019, changePercent: 0.67, type: 'etf' },
  '159915': { name: '创业板ETF', code: '159915.SZ', price: 2.456, change: 0.045, changePercent: 1.87, type: 'etf' },
  '512660': { name: '军工ETF', code: '512660.SH', price: 1.234, change: 0.056, changePercent: 4.76, type: 'etf' },
  '512480': { name: '半导体ETF', code: '512480.SH', price: 1.567, change: 0.089, changePercent: 6.02, type: 'etf' },
  '515790': { name: '光伏ETF', code: '515790.SH', price: 0.876, change: -0.023, changePercent: -2.56, type: 'etf' },
  '159869': { name: '游戏ETF', code: '159869.SZ', price: 0.756, change: 0.034, changePercent: 4.71, type: 'etf' },
  '516160': { name: '新能源车ETF', code: '516160.SH', price: 1.345, change: 0.067, changePercent: 5.24, type: 'etf' },
  '513050': { name: '中概互联ETF', code: '513050.SH', price: 0.678, change: 0.023, changePercent: 3.51, type: 'etf' },
  '513100': { name: '纳指ETF', code: '513100.SH', price: 1.876, change: 0.045, changePercent: 2.46, type: 'etf' },
  '159941': { name: '纳指100ETF', code: '159941.SZ', price: 1.923, change: 0.052, changePercent: 2.78, type: 'etf' },
  '513500': { name: '标普500ETF', code: '513500.SH', price: 1.567, change: 0.028, changePercent: 1.82, type: 'etf' },

  // 热门股票
  '600519': { name: '贵州茅台', code: '600519.SH', price: 1723.50, change: 31.45, changePercent: 1.85, type: 'stock' },
  '300750': { name: '宁德时代', code: '300750.SZ', price: 198.45, change: 8.67, changePercent: 4.56, type: 'stock' },
  '002594': { name: '比亚迪', code: '002594.SZ', price: 312.80, change: 8.79, changePercent: 2.89, type: 'stock' },
  '688981': { name: '中芯国际', code: '688981.SH', price: 89.56, change: 4.82, changePercent: 5.67, type: 'stock' },
  '002049': { name: '紫光国微', code: '002049.SZ', price: 145.23, change: 11.23, changePercent: 8.37, type: 'stock' },
  '688256': { name: '寒武纪', code: '688256.SH', price: 456.78, change: 64.23, changePercent: 16.36, type: 'stock' },
  '002415': { name: '海康威视', code: '002415.SZ', price: 32.56, change: 0.89, changePercent: 2.81, type: 'stock' },
  '601318': { name: '中国平安', code: '601318.SH', price: 45.67, change: 0.56, changePercent: 1.24, type: 'stock' },
  '600036': { name: '招商银行', code: '600036.SH', price: 34.89, change: 0.45, changePercent: 1.31, type: 'stock' },
  '000858': { name: '五粮液', code: '000858.SZ', price: 156.78, change: 2.34, changePercent: 1.52, type: 'stock' },
  '601012': { name: '隆基绿能', code: '601012.SH', price: 23.45, change: -0.67, changePercent: -2.78, type: 'stock' },
  '300059': { name: '东方财富', code: '300059.SZ', price: 18.67, change: 0.78, changePercent: 4.36, type: 'stock' },
  '002475': { name: '立讯精密', code: '002475.SZ', price: 34.56, change: 1.23, changePercent: 3.69, type: 'stock' },
  '688111': { name: '金山办公', code: '688111.SH', price: 298.45, change: 12.34, changePercent: 4.31, type: 'stock' },
  '002230': { name: '科大讯飞', code: '002230.SZ', price: 56.78, change: 3.45, changePercent: 6.47, type: 'stock' },
  '688036': { name: '传音控股', code: '688036.SH', price: 89.23, change: 2.56, changePercent: 2.95, type: 'stock' },
  '603986': { name: '兆易创新', code: '603986.SH', price: 123.45, change: 8.67, changePercent: 7.55, type: 'stock' },
  '688012': { name: '中微公司', code: '688012.SH', price: 178.90, change: 9.23, changePercent: 5.44, type: 'stock' },
  '300782': { name: '卓胜微', code: '300782.SZ', price: 98.67, change: 5.34, changePercent: 5.73, type: 'stock' },
  '688008': { name: '澜起科技', code: '688008.SH', price: 67.89, change: 3.21, changePercent: 4.96, type: 'stock' },
}

// 生成K线数据
const generateKLineData = (basePrice: number) => {
  const data = []
  let currentPrice = basePrice * 0.95
  for (let i = 0; i < 60; i++) {
    const change = (Math.random() - 0.48) * (basePrice * 0.02)
    currentPrice += change
    currentPrice = Math.max(currentPrice, basePrice * 0.85)
    currentPrice = Math.min(currentPrice, basePrice * 1.15)
    data.push({
      date: `${Math.floor(i / 20) + 1}/${(i % 20) + 1}`,
      price: Math.round(currentPrice * 1000) / 1000,
      volume: Math.round(Math.random() * 1000000 + 500000),
      ma5: Math.round((currentPrice + (Math.random() - 0.5) * basePrice * 0.02) * 1000) / 1000,
      ma10: Math.round((currentPrice + (Math.random() - 0.5) * basePrice * 0.03) * 1000) / 1000,
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
  { name: '寒武纪', code: '688256', price: 456.78, change: 16.36 },
  { name: '宁德时代', code: '300750', price: 198.45, change: 4.56 },
  { name: '比亚迪', code: '002594', price: 312.80, change: 2.89 },
  { name: '中芯国际', code: '688981', price: 89.56, change: 5.67 },
  { name: '科大讯飞', code: '002230', price: 56.78, change: 6.47 },
]

export default function MarketAnalysis() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStock, setSelectedStock] = useState<typeof stockDatabase[string] | null>(null)
  const [searchError, setSearchError] = useState('')

  const chartData = useMemo(() => {
    if (selectedStock) {
      return generateKLineData(selectedStock.price)
    }
    return generateKLineData(3200)
  }, [selectedStock])

  const handleSearch = () => {
    const code = searchTerm.trim().toUpperCase()
    setSearchError('')

    if (!code) {
      setSearchError('请输入股票代码')
      return
    }

    // 搜索股票
    const stock = stockDatabase[code]
    if (stock) {
      setSelectedStock(stock)
    } else {
      // 尝试模糊搜索名称
      const foundEntry = Object.entries(stockDatabase).find(
        ([_, s]) => s.name.includes(code) || s.code.includes(code)
      )
      if (foundEntry) {
        setSelectedStock(foundEntry[1])
      } else {
        setSearchError(`未找到股票: ${code}。支持的代码示例: 518880(黄金ETF), 600519(茅台), 688256(寒武纪)`)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSelection = () => {
    setSelectedStock(null)
    setSearchTerm('')
    setSearchError('')
  }

  const handleHotStockClick = (code: string) => {
    setSearchTerm(code)
    const stock = stockDatabase[code]
    if (stock) {
      setSelectedStock(stock)
      setSearchError('')
    }
  }

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
              placeholder="输入股票代码，如 518880..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Search className="w-4 h-4" />
            查询
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
        </div>
      </div>

      {/* Error Message */}
      {searchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {searchError}
        </div>
      )}

      {/* Selected Stock Display */}
      {selectedStock && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-800">{selectedStock.name}</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                    {selectedStock.type === 'etf' ? 'ETF' : selectedStock.type === 'index' ? '指数' : '股票'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{selectedStock.code}</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">{selectedStock.price.toFixed(3)}</div>
                <div className={`flex items-center justify-end gap-1 ${selectedStock.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {selectedStock.changePercent >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="text-lg font-semibold">
                    {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.change.toFixed(3)}
                    ({selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="p-2 hover:bg-blue-100 rounded-full transition-colors"
              title="关闭"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* Index Cards */}
      <div className="grid grid-cols-4 gap-4">
        {indexData.map((item) => (
          <div
            key={item.code}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleHotStockClick(item.code.split('.')[0])}
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
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedStock ? `${selectedStock.name} 走势` : '上证指数走势'}
            </h2>
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
                onClick={() => handleHotStockClick(stock.code)}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer"
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

          {/* 常用ETF快捷入口 */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-600 mb-3">常用ETF</h3>
            <div className="flex flex-wrap gap-2">
              {['518880', '510300', '512480', '516160', '513100'].map((code) => {
                const etf = stockDatabase[code]
                return (
                  <button
                    key={code}
                    onClick={() => handleHotStockClick(code)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  >
                    {etf?.name || code}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {selectedStock ? `${selectedStock.name} 成交量` : '成交量分析'}
        </h2>
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
