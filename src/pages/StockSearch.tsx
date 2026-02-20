import { useState, useEffect } from 'react'
import { Search, Star, TrendingUp, TrendingDown, Plus, X, RefreshCw, Globe, AlertCircle, ChevronRight, BarChart3, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Stock {
  symbol: string
  name: string
  market: 'A股' | '港股' | '美股'
  price: number
  change: number
  changePercent: number
  volume: string
  marketCap: string
  pe: number
  high52w: number
  low52w: number
  addedAt?: number
}

interface WatchlistStock extends Stock {
  notes?: string
}

// 模拟股票数据库
const stockDatabase: Stock[] = [
  // A股
  { symbol: '600519', name: '贵州茅台', market: 'A股', price: 1688.88, change: 23.45, changePercent: 1.41, volume: '2.3万', marketCap: '2.12万亿', pe: 28.5, high52w: 1850, low52w: 1420 },
  { symbol: '000858', name: '五粮液', market: 'A股', price: 145.67, change: -2.33, changePercent: -1.57, volume: '5.6万', marketCap: '5640亿', pe: 22.3, high52w: 180, low52w: 120 },
  { symbol: '300750', name: '宁德时代', market: 'A股', price: 198.50, change: 5.80, changePercent: 3.01, volume: '12.3万', marketCap: '8720亿', pe: 35.2, high52w: 280, low52w: 150 },
  { symbol: '002594', name: '比亚迪', market: 'A股', price: 245.30, change: 8.90, changePercent: 3.76, volume: '8.9万', marketCap: '7140亿', pe: 42.1, high52w: 320, low52w: 180 },
  { symbol: '601318', name: '中国平安', market: 'A股', price: 48.56, change: -0.44, changePercent: -0.90, volume: '15.2万', marketCap: '8850亿', pe: 8.5, high52w: 58, low52w: 38 },
  { symbol: '000001', name: '平安银行', market: 'A股', price: 11.25, change: 0.15, changePercent: 1.35, volume: '25.6万', marketCap: '2180亿', pe: 5.2, high52w: 14, low52w: 9 },
  { symbol: '600036', name: '招商银行', market: 'A股', price: 32.45, change: 0.65, changePercent: 2.04, volume: '18.3万', marketCap: '8190亿', pe: 6.8, high52w: 42, low52w: 28 },
  { symbol: '601899', name: '紫金矿业', market: 'A股', price: 15.88, change: 0.42, changePercent: 2.72, volume: '32.1万', marketCap: '4180亿', pe: 12.3, high52w: 18, low52w: 10 },
  { symbol: '000333', name: '美的集团', market: 'A股', price: 58.90, change: 1.20, changePercent: 2.08, volume: '6.8万', marketCap: '4120亿', pe: 14.5, high52w: 72, low52w: 48 },
  { symbol: '002415', name: '海康威视', market: 'A股', price: 32.15, change: -0.85, changePercent: -2.57, volume: '9.2万', marketCap: '3010亿', pe: 18.9, high52w: 45, low52w: 28 },
  // 港股
  { symbol: '00700', name: '腾讯控股', market: '港股', price: 378.60, change: 8.40, changePercent: 2.27, volume: '1850万', marketCap: '3.58万亿', pe: 22.4, high52w: 420, low52w: 280 },
  { symbol: '09988', name: '阿里巴巴-SW', market: '港股', price: 82.35, change: 2.15, changePercent: 2.68, volume: '2560万', marketCap: '1.68万亿', pe: 15.8, high52w: 120, low52w: 62 },
  { symbol: '03690', name: '美团-W', market: '港股', price: 128.50, change: -3.20, changePercent: -2.43, volume: '1230万', marketCap: '7980亿', pe: 45.2, high52w: 180, low52w: 88 },
  { symbol: '09618', name: '京东集团-SW', market: '港股', price: 125.80, change: 4.60, changePercent: 3.80, volume: '890万', marketCap: '3920亿', pe: 18.6, high52w: 168, low52w: 95 },
  { symbol: '01810', name: '小米集团-W', market: '港股', price: 18.92, change: 0.58, changePercent: 3.16, volume: '8560万', marketCap: '4720亿', pe: 28.3, high52w: 22, low52w: 12 },
  { symbol: '02318', name: '中国平安', market: '港股', price: 42.85, change: -0.35, changePercent: -0.81, volume: '1520万', marketCap: '7810亿', pe: 7.2, high52w: 52, low52w: 35 },
  // 美股
  { symbol: 'AAPL', name: '苹果', market: '美股', price: 178.56, change: 2.34, changePercent: 1.33, volume: '5680万', marketCap: '2.78万亿', pe: 28.5, high52w: 199, low52w: 142 },
  { symbol: 'MSFT', name: '微软', market: '美股', price: 378.91, change: 5.67, changePercent: 1.52, volume: '2340万', marketCap: '2.81万亿', pe: 35.2, high52w: 420, low52w: 285 },
  { symbol: 'GOOGL', name: '谷歌', market: '美股', price: 141.80, change: 1.90, changePercent: 1.36, volume: '1890万', marketCap: '1.78万亿', pe: 24.8, high52w: 158, low52w: 102 },
  { symbol: 'AMZN', name: '亚马逊', market: '美股', price: 178.25, change: 3.45, changePercent: 1.97, volume: '4120万', marketCap: '1.85万亿', pe: 62.3, high52w: 192, low52w: 118 },
  { symbol: 'NVDA', name: '英伟达', market: '美股', price: 875.28, change: 25.60, changePercent: 3.01, volume: '3560万', marketCap: '2.16万亿', pe: 68.5, high52w: 950, low52w: 420 },
  { symbol: 'TSLA', name: '特斯拉', market: '美股', price: 245.67, change: -8.90, changePercent: -3.50, volume: '8920万', marketCap: '7820亿', pe: 58.2, high52w: 320, low52w: 152 },
  { symbol: 'META', name: 'Meta', market: '美股', price: 505.45, change: 12.30, changePercent: 2.49, volume: '1560万', marketCap: '1.29万亿', pe: 32.1, high52w: 542, low52w: 285 },
  { symbol: 'BABA', name: '阿里巴巴', market: '美股', price: 82.50, change: 1.85, changePercent: 2.29, volume: '1230万', marketCap: '2080亿', pe: 15.6, high52w: 120, low52w: 65 },
]

// 生成模拟K线数据
const generateChartData = (basePrice: number) => {
  const data = []
  let price = basePrice * 0.95
  for (let i = 30; i >= 0; i--) {
    const change = (Math.random() - 0.48) * basePrice * 0.03
    price = Math.max(price + change, basePrice * 0.8)
    price = Math.min(price, basePrice * 1.1)
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      price: Number(price.toFixed(2))
    })
  }
  return data
}

// 生成趋势分析
const generateTrendAnalysis = (stock: Stock): string => {
  const trend = stock.changePercent > 0 ? '上涨' : '下跌'
  const strength = Math.abs(stock.changePercent) > 2 ? '强势' : '温和'
  const pe_analysis = stock.pe < 15 ? '估值较低' : stock.pe > 40 ? '估值偏高' : '估值适中'
  const position = stock.price > (stock.high52w + stock.low52w) / 2 ? '处于52周区间上半部' : '处于52周区间下半部'

  return `【趋势分析】${stock.name}近期呈${strength}${trend}态势，当前股价${position}。${pe_analysis}，市盈率${stock.pe}倍。成交量${stock.volume}股，市场关注度${stock.volume.includes('万') ? '较高' : '一般'}。建议关注${stock.changePercent > 0 ? '上方压力位' : '下方支撑位'}变化。`
}

// 加载自选股数据
const loadWatchlist = (): WatchlistStock[] => {
  try {
    const saved = localStorage.getItem('stockWatchlist')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load watchlist:', e)
  }
  return []
}

// 保存自选股数据
const saveWatchlist = (watchlist: WatchlistStock[]) => {
  try {
    localStorage.setItem('stockWatchlist', JSON.stringify(watchlist))
  } catch (e) {
    console.error('Failed to save watchlist:', e)
  }
}

export default function StockSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Stock[]>([])
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([])
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [activeTab, setActiveTab] = useState<'search' | 'watchlist'>('search')
  const [marketFilter, setMarketFilter] = useState<'all' | 'A股' | '港股' | '美股'>('all')
  const [isSearching, setIsSearching] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])

  // 加载自选股
  useEffect(() => {
    setWatchlist(loadWatchlist())
  }, [])

  // 保存自选股
  useEffect(() => {
    if (watchlist.length > 0 || localStorage.getItem('stockWatchlist')) {
      saveWatchlist(watchlist)
    }
  }, [watchlist])

  // 更新图表数据
  useEffect(() => {
    if (selectedStock) {
      setChartData(generateChartData(selectedStock.price))
    }
  }, [selectedStock])

  // 搜索股票
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setTimeout(() => {
      const term = searchTerm.toLowerCase()
      let results = stockDatabase.filter(stock =>
        stock.symbol.toLowerCase().includes(term) ||
        stock.name.toLowerCase().includes(term)
      )

      if (marketFilter !== 'all') {
        results = results.filter(stock => stock.market === marketFilter)
      }

      setSearchResults(results)
      setIsSearching(false)
    }, 300)
  }

  // 添加到自选
  const addToWatchlist = (stock: Stock) => {
    if (watchlist.some(s => s.symbol === stock.symbol && s.market === stock.market)) {
      return // 已存在
    }
    setWatchlist(prev => [...prev, { ...stock, addedAt: Date.now() }])
  }

  // 从自选移除
  const removeFromWatchlist = (symbol: string, market: string) => {
    setWatchlist(prev => prev.filter(s => !(s.symbol === symbol && s.market === market)))
    if (selectedStock?.symbol === symbol && selectedStock?.market === market) {
      setSelectedStock(null)
    }
  }

  // 检查是否在自选中
  const isInWatchlist = (symbol: string, market: string) => {
    return watchlist.some(s => s.symbol === symbol && s.market === market)
  }

  // 刷新行情
  const refreshQuotes = () => {
    setWatchlist(prev => prev.map(stock => ({
      ...stock,
      price: stock.price * (1 + (Math.random() - 0.5) * 0.02),
      change: stock.price * (Math.random() - 0.5) * 0.02,
      changePercent: (Math.random() - 0.5) * 4
    })))
  }

  const getMarketColor = (market: string) => {
    switch (market) {
      case 'A股': return 'bg-red-100 text-red-600'
      case '港股': return 'bg-blue-100 text-blue-600'
      case '美股': return 'bg-green-100 text-green-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">自选股查询</h1>
          <p className="text-sm text-gray-500 mt-1">支持A股、港股、美股查询，添加自选实时追踪</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshQuotes}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新行情
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('search')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            股票搜索
          </div>
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'watchlist'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            我的自选 ({watchlist.length})
          </div>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Panel - Search/List */}
        <div className="col-span-2 space-y-4">
          {activeTab === 'search' && (
            <>
              {/* Search Bar */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="输入股票代码或名称搜索..."
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={marketFilter}
                  onChange={(e) => setMarketFilter(e.target.value as any)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全部市场</option>
                  <option value="A股">A股</option>
                  <option value="港股">港股</option>
                  <option value="美股">美股</option>
                </select>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isSearching ? '搜索中...' : '搜索'}
                </button>
              </div>

              {/* Search Results */}
              <div className="space-y-3">
                {searchResults.length === 0 && searchTerm && !isSearching && (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    未找到匹配的股票
                  </div>
                )}
                {searchResults.map((stock) => (
                  <div
                    key={`${stock.market}-${stock.symbol}`}
                    onClick={() => setSelectedStock(stock)}
                    className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
                      selectedStock?.symbol === stock.symbol && selectedStock?.market === stock.market
                        ? 'border-blue-500 shadow-md'
                        : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">{stock.name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${getMarketColor(stock.market)}`}>
                              {stock.market}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">{stock.symbol}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-semibold text-lg">{stock.price.toFixed(2)}</div>
                          <div className={`flex items-center gap-1 text-sm ${
                            stock.changePercent >= 0 ? 'text-red-500' : 'text-green-500'
                          }`}>
                            {stock.changePercent >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            isInWatchlist(stock.symbol, stock.market)
                              ? removeFromWatchlist(stock.symbol, stock.market)
                              : addToWatchlist(stock)
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isInWatchlist(stock.symbol, stock.market)
                              ? 'text-yellow-500 bg-yellow-50'
                              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                          }`}
                        >
                          <Star className={`w-5 h-5 ${isInWatchlist(stock.symbol, stock.market) ? 'fill-yellow-400' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hot Stocks */}
              {searchResults.length === 0 && !searchTerm && (
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    热门股票
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {stockDatabase.slice(0, 8).map((stock) => (
                      <div
                        key={`${stock.market}-${stock.symbol}`}
                        onClick={() => { setSelectedStock(stock); setSearchResults([stock]) }}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <div>
                          <span className="font-medium text-gray-800">{stock.name}</span>
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${getMarketColor(stock.market)}`}>
                            {stock.market}
                          </span>
                        </div>
                        <span className={stock.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'watchlist' && (
            <div className="space-y-3">
              {watchlist.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                  <Star className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                  <p className="text-gray-500 mb-2">暂无自选股</p>
                  <p className="text-sm text-gray-400">搜索并添加股票到自选列表</p>
                </div>
              ) : (
                watchlist.map((stock) => (
                  <div
                    key={`${stock.market}-${stock.symbol}`}
                    onClick={() => setSelectedStock(stock)}
                    className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
                      selectedStock?.symbol === stock.symbol && selectedStock?.market === stock.market
                        ? 'border-blue-500 shadow-md'
                        : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">{stock.name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${getMarketColor(stock.market)}`}>
                              {stock.market}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">{stock.symbol}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-semibold text-lg">{stock.price.toFixed(2)}</div>
                          <div className={`flex items-center gap-1 text-sm ${
                            stock.changePercent >= 0 ? 'text-red-500' : 'text-green-500'
                          }`}>
                            {stock.changePercent >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromWatchlist(stock.symbol, stock.market)
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Stock Detail */}
        <div className="space-y-4">
          {selectedStock ? (
            <>
              {/* Stock Info Card */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedStock.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500">{selectedStock.symbol}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getMarketColor(selectedStock.market)}`}>
                        {selectedStock.market}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => isInWatchlist(selectedStock.symbol, selectedStock.market)
                      ? removeFromWatchlist(selectedStock.symbol, selectedStock.market)
                      : addToWatchlist(selectedStock)
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isInWatchlist(selectedStock.symbol, selectedStock.market)
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    {isInWatchlist(selectedStock.symbol, selectedStock.market) ? (
                      <>
                        <Star className="w-4 h-4 fill-yellow-400" />
                        已关注
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        加自选
                      </>
                    )}
                  </button>
                </div>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-800">{selectedStock.price.toFixed(2)}</div>
                  <div className={`flex items-center gap-2 mt-1 ${
                    selectedStock.changePercent >= 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {selectedStock.changePercent >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <span className="text-lg font-medium">
                      {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)}
                      ({selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-500">成交量</div>
                    <div className="font-medium text-gray-800">{selectedStock.volume}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-500">市值</div>
                    <div className="font-medium text-gray-800">{selectedStock.marketCap}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-500">市盈率</div>
                    <div className="font-medium text-gray-800">{selectedStock.pe}x</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-500">52周区间</div>
                    <div className="font-medium text-gray-800">{selectedStock.low52w}-{selectedStock.high52w}</div>
                  </div>
                </div>
              </div>

              {/* Price Chart */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  30日走势
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={selectedStock.changePercent >= 0 ? '#ef4444' : '#22c55e'}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Trend Analysis */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  趋势分析
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {generateTrendAnalysis(selectedStock)}
                </p>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
              <Globe className="w-16 h-16 mx-auto mb-4 text-gray-200" />
              <p className="text-gray-500">选择一只股票查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
