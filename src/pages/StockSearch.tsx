import { useState, useEffect } from 'react'
import { Search, Star, TrendingUp, TrendingDown, Plus, X, RefreshCw, Globe, AlertCircle, ChevronRight, BarChart3, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

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

// 模拟股票数据库（含ETF基金）
const stockDatabase: Stock[] = [
  // A股 - 主要个股
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
  { symbol: '600900', name: '长江电力', market: 'A股', price: 28.65, change: 0.35, changePercent: 1.24, volume: '8.5万', marketCap: '6980亿', pe: 22.1, high52w: 32, low52w: 22 },
  { symbol: '601012', name: '隆基绿能', market: 'A股', price: 22.45, change: -0.68, changePercent: -2.94, volume: '18.6万', marketCap: '1700亿', pe: 15.8, high52w: 45, low52w: 18 },
  { symbol: '000651', name: '格力电器', market: 'A股', price: 38.90, change: 0.75, changePercent: 1.97, volume: '7.2万', marketCap: '2180亿', pe: 8.6, high52w: 48, low52w: 32 },
  { symbol: '600276', name: '恒瑞医药', market: 'A股', price: 45.20, change: 1.30, changePercent: 2.96, volume: '6.8万', marketCap: '2880亿', pe: 42.5, high52w: 58, low52w: 35 },
  { symbol: '002475', name: '立讯精密', market: 'A股', price: 32.80, change: 0.92, changePercent: 2.89, volume: '12.5万', marketCap: '2350亿', pe: 25.6, high52w: 42, low52w: 25 },
  // A股 - ETF基金
  { symbol: '518880', name: '黄金ETF', market: 'A股', price: 5.68, change: 0.08, changePercent: 1.43, volume: '856万', marketCap: '185亿', pe: 0, high52w: 6.2, low52w: 4.8 },
  { symbol: '513130', name: '恒生科技ETF', market: 'A股', price: 0.785, change: 0.018, changePercent: 2.35, volume: '2.3亿', marketCap: '268亿', pe: 0, high52w: 0.95, low52w: 0.62 },
  { symbol: '512100', name: '中证1000ETF', market: 'A股', price: 1.856, change: -0.025, changePercent: -1.33, volume: '1.5亿', marketCap: '156亿', pe: 0, high52w: 2.3, low52w: 1.6 },
  { symbol: '588000', name: '科创50ETF', market: 'A股', price: 0.925, change: 0.015, changePercent: 1.65, volume: '1.8亿', marketCap: '458亿', pe: 0, high52w: 1.2, low52w: 0.78 },
  { symbol: '510300', name: '沪深300ETF', market: 'A股', price: 3.92, change: 0.045, changePercent: 1.16, volume: '1.2亿', marketCap: '1250亿', pe: 0, high52w: 4.5, low52w: 3.5 },
  { symbol: '510500', name: '中证500ETF', market: 'A股', price: 5.85, change: -0.08, changePercent: -1.35, volume: '8500万', marketCap: '680亿', pe: 0, high52w: 7.2, low52w: 5.2 },
  { symbol: '510050', name: '上证50ETF', market: 'A股', price: 2.68, change: 0.035, changePercent: 1.32, volume: '6800万', marketCap: '820亿', pe: 0, high52w: 3.1, low52w: 2.4 },
  { symbol: '159915', name: '创业板ETF', market: 'A股', price: 2.12, change: 0.048, changePercent: 2.32, volume: '1.5亿', marketCap: '380亿', pe: 0, high52w: 2.8, low52w: 1.8 },
  { symbol: '159919', name: '沪深300ETF', market: 'A股', price: 4.05, change: 0.052, changePercent: 1.30, volume: '9200万', marketCap: '520亿', pe: 0, high52w: 4.6, low52w: 3.6 },
  { symbol: '512880', name: '证券ETF', market: 'A股', price: 0.958, change: 0.028, changePercent: 3.01, volume: '2.8亿', marketCap: '285亿', pe: 0, high52w: 1.2, low52w: 0.8 },
  { symbol: '512690', name: '酒ETF', market: 'A股', price: 1.125, change: -0.018, changePercent: -1.58, volume: '5600万', marketCap: '98亿', pe: 0, high52w: 1.5, low52w: 0.95 },
  { symbol: '512660', name: '军工ETF', market: 'A股', price: 1.068, change: 0.022, changePercent: 2.10, volume: '1.2亿', marketCap: '165亿', pe: 0, high52w: 1.35, low52w: 0.88 },
  { symbol: '159995', name: '芯片ETF', market: 'A股', price: 0.925, change: 0.035, changePercent: 3.93, volume: '2.5亿', marketCap: '320亿', pe: 0, high52w: 1.3, low52w: 0.72 },
  { symbol: '515050', name: '5GETF', market: 'A股', price: 0.785, change: 0.012, changePercent: 1.55, volume: '8500万', marketCap: '125亿', pe: 0, high52w: 1.0, low52w: 0.68 },
  { symbol: '513050', name: '中概互联ETF', market: 'A股', price: 0.658, change: 0.018, changePercent: 2.81, volume: '1.8亿', marketCap: '225亿', pe: 0, high52w: 0.95, low52w: 0.52 },
  { symbol: '513100', name: '纳指ETF', market: 'A股', price: 1.625, change: 0.028, changePercent: 1.75, volume: '4500万', marketCap: '168亿', pe: 0, high52w: 1.85, low52w: 1.35 },
  { symbol: '513500', name: '标普500ETF', market: 'A股', price: 1.485, change: 0.015, changePercent: 1.02, volume: '3200万', marketCap: '145亿', pe: 0, high52w: 1.65, low52w: 1.28 },
  { symbol: '159941', name: '纳指ETF', market: 'A股', price: 1.58, change: 0.025, changePercent: 1.61, volume: '3800万', marketCap: '98亿', pe: 0, high52w: 1.78, low52w: 1.32 },
  { symbol: '518800', name: '黄金基金ETF', market: 'A股', price: 5.52, change: 0.075, changePercent: 1.38, volume: '650万', marketCap: '85亿', pe: 0, high52w: 6.0, low52w: 4.6 },
  { symbol: '159934', name: '黄金ETF', market: 'A股', price: 5.45, change: 0.068, changePercent: 1.26, volume: '480万', marketCap: '62亿', pe: 0, high52w: 5.9, low52w: 4.5 },
  { symbol: '512010', name: '医药ETF', market: 'A股', price: 0.485, change: 0.012, changePercent: 2.54, volume: '1.2亿', marketCap: '168亿', pe: 0, high52w: 0.68, low52w: 0.42 },
  { symbol: '512170', name: '医疗ETF', market: 'A股', price: 0.525, change: 0.015, changePercent: 2.94, volume: '9500万', marketCap: '145亿', pe: 0, high52w: 0.75, low52w: 0.45 },
  { symbol: '159892', name: '光伏ETF', market: 'A股', price: 0.685, change: -0.025, changePercent: -3.52, volume: '1.5亿', marketCap: '125亿', pe: 0, high52w: 1.2, low52w: 0.58 },
  { symbol: '516160', name: '新能源ETF', market: 'A股', price: 0.758, change: -0.018, changePercent: -2.32, volume: '8500万', marketCap: '98亿', pe: 0, high52w: 1.15, low52w: 0.65 },
  // 港股
  { symbol: '00700', name: '腾讯控股', market: '港股', price: 378.60, change: 8.40, changePercent: 2.27, volume: '1850万', marketCap: '3.58万亿', pe: 22.4, high52w: 420, low52w: 280 },
  { symbol: '09988', name: '阿里巴巴-SW', market: '港股', price: 82.35, change: 2.15, changePercent: 2.68, volume: '2560万', marketCap: '1.68万亿', pe: 15.8, high52w: 120, low52w: 62 },
  { symbol: '03690', name: '美团-W', market: '港股', price: 128.50, change: -3.20, changePercent: -2.43, volume: '1230万', marketCap: '7980亿', pe: 45.2, high52w: 180, low52w: 88 },
  { symbol: '09618', name: '京东集团-SW', market: '港股', price: 125.80, change: 4.60, changePercent: 3.80, volume: '890万', marketCap: '3920亿', pe: 18.6, high52w: 168, low52w: 95 },
  { symbol: '01810', name: '小米集团-W', market: '港股', price: 18.92, change: 0.58, changePercent: 3.16, volume: '8560万', marketCap: '4720亿', pe: 28.3, high52w: 22, low52w: 12 },
  { symbol: '02318', name: '中国平安', market: '港股', price: 42.85, change: -0.35, changePercent: -0.81, volume: '1520万', marketCap: '7810亿', pe: 7.2, high52w: 52, low52w: 35 },
  { symbol: '09999', name: '网易-S', market: '港股', price: 158.50, change: 3.80, changePercent: 2.46, volume: '680万', marketCap: '5120亿', pe: 18.5, high52w: 185, low52w: 125 },
  { symbol: '01024', name: '快手-W', market: '港股', price: 52.80, change: 1.65, changePercent: 3.23, volume: '2350万', marketCap: '2280亿', pe: 0, high52w: 75, low52w: 38 },
  { symbol: '02020', name: '安踏体育', market: '港股', price: 85.60, change: 2.15, changePercent: 2.58, volume: '520万', marketCap: '2380亿', pe: 22.8, high52w: 105, low52w: 68 },
  { symbol: '00941', name: '中国移动', market: '港股', price: 72.50, change: 0.85, changePercent: 1.19, volume: '1850万', marketCap: '1.55万亿', pe: 10.2, high52w: 85, low52w: 58 },
  // 美股
  { symbol: 'AAPL', name: '苹果', market: '美股', price: 178.56, change: 2.34, changePercent: 1.33, volume: '5680万', marketCap: '2.78万亿', pe: 28.5, high52w: 199, low52w: 142 },
  { symbol: 'MSFT', name: '微软', market: '美股', price: 378.91, change: 5.67, changePercent: 1.52, volume: '2340万', marketCap: '2.81万亿', pe: 35.2, high52w: 420, low52w: 285 },
  { symbol: 'GOOGL', name: '谷歌', market: '美股', price: 141.80, change: 1.90, changePercent: 1.36, volume: '1890万', marketCap: '1.78万亿', pe: 24.8, high52w: 158, low52w: 102 },
  { symbol: 'AMZN', name: '亚马逊', market: '美股', price: 178.25, change: 3.45, changePercent: 1.97, volume: '4120万', marketCap: '1.85万亿', pe: 62.3, high52w: 192, low52w: 118 },
  { symbol: 'NVDA', name: '英伟达', market: '美股', price: 875.28, change: 25.60, changePercent: 3.01, volume: '3560万', marketCap: '2.16万亿', pe: 68.5, high52w: 950, low52w: 420 },
  { symbol: 'TSLA', name: '特斯拉', market: '美股', price: 245.67, change: -8.90, changePercent: -3.50, volume: '8920万', marketCap: '7820亿', pe: 58.2, high52w: 320, low52w: 152 },
  { symbol: 'META', name: 'Meta', market: '美股', price: 505.45, change: 12.30, changePercent: 2.49, volume: '1560万', marketCap: '1.29万亿', pe: 32.1, high52w: 542, low52w: 285 },
  { symbol: 'BABA', name: '阿里巴巴', market: '美股', price: 82.50, change: 1.85, changePercent: 2.29, volume: '1230万', marketCap: '2080亿', pe: 15.6, high52w: 120, low52w: 65 },
  { symbol: 'JD', name: '京东', market: '美股', price: 28.65, change: 0.75, changePercent: 2.69, volume: '1560万', marketCap: '450亿', pe: 12.8, high52w: 42, low52w: 22 },
  { symbol: 'PDD', name: '拼多多', market: '美股', price: 128.90, change: 4.25, changePercent: 3.41, volume: '2850万', marketCap: '1720亿', pe: 28.5, high52w: 158, low52w: 85 },
  { symbol: 'NIO', name: '蔚来', market: '美股', price: 5.82, change: 0.18, changePercent: 3.19, volume: '4580万', marketCap: '115亿', pe: 0, high52w: 12, low52w: 4.5 },
  { symbol: 'XPEV', name: '小鹏汽车', market: '美股', price: 8.95, change: 0.28, changePercent: 3.23, volume: '2150万', marketCap: '85亿', pe: 0, high52w: 18, low52w: 6.5 },
  { symbol: 'LI', name: '理想汽车', market: '美股', price: 35.80, change: 1.25, changePercent: 3.62, volume: '1680万', marketCap: '380亿', pe: 42.5, high52w: 48, low52w: 25 },
  { symbol: 'AMD', name: 'AMD', market: '美股', price: 165.20, change: 5.85, changePercent: 3.67, volume: '4520万', marketCap: '2680亿', pe: 45.8, high52w: 185, low52w: 95 },
  { symbol: 'INTC', name: '英特尔', market: '美股', price: 42.50, change: -0.85, changePercent: -1.96, volume: '3850万', marketCap: '1780亿', pe: 0, high52w: 52, low52w: 28 },
]

// 时间周期类型
type TimePeriod = '1D' | '5D' | '1M' | '3M' | '1Y'

// 生成模拟K线数据（支持不同时间周期）
const generateChartData = (basePrice: number, period: TimePeriod = '1M') => {
  const data = []
  let price = basePrice
  const now = new Date()

  // 根据周期决定数据点数量和时间间隔
  let dataPoints: number
  let intervalMinutes: number

  switch (period) {
    case '1D':
      dataPoints = 48
      intervalMinutes = 30
      price = basePrice * 0.995
      break
    case '5D':
      dataPoints = 60
      intervalMinutes = 120
      price = basePrice * 0.98
      break
    case '1M':
      dataPoints = 30
      intervalMinutes = 24 * 60
      price = basePrice * 0.95
      break
    case '3M':
      dataPoints = 90
      intervalMinutes = 24 * 60
      price = basePrice * 0.90
      break
    case '1Y':
      dataPoints = 250
      intervalMinutes = 24 * 60
      price = basePrice * 0.75
      break
    default:
      dataPoints = 30
      intervalMinutes = 24 * 60
      price = basePrice * 0.95
  }

  const volatility = period === '1D' ? 0.005 : period === '5D' ? 0.01 : period === '1M' ? 0.02 : period === '3M' ? 0.025 : 0.03
  let lastYear: number | null = null

  for (let i = dataPoints; i >= 0; i--) {
    const change = (Math.random() - 0.48) * basePrice * volatility
    price = Math.max(price + change, basePrice * 0.6)
    price = Math.min(price, basePrice * 1.2)

    const date = new Date(now)
    date.setMinutes(date.getMinutes() - i * intervalMinutes)

    // 根据周期格式化日期标签 - 在年份变化或首个数据点显示年份
    let dateLabel: string
    const currentYear = date.getFullYear()
    const isFirstPoint = i === dataPoints
    const yearChanged = lastYear !== null && lastYear !== currentYear

    if (period === '1D') {
      dateLabel = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    } else if (period === '5D') {
      if (isFirstPoint) {
        dateLabel = `${currentYear}/${date.getMonth() + 1}/${date.getDate()}`
      } else {
        dateLabel = `${date.getMonth() + 1}/${date.getDate()}`
      }
    } else {
      // 1M, 3M, 1Y - 在首个数据点和年份变化时显示年份
      if (isFirstPoint || yearChanged) {
        dateLabel = `${currentYear}/${date.getMonth() + 1}/${date.getDate()}`
      } else {
        dateLabel = `${date.getMonth() + 1}/${date.getDate()}`
      }
    }

    lastYear = currentYear

    data.push({
      date: dateLabel,
      fullDate: date.toISOString(),
      price: Number(price.toFixed(3)),
      year: currentYear,
      month: date.getMonth() + 1,
      day: date.getDate()
    })
  }
  return data
}

// 获取图表时间范围描述
const getChartDateRange = (chartData: any[], period: TimePeriod): string => {
  if (chartData.length === 0) return ''
  const first = chartData[0]
  const last = chartData[chartData.length - 1]

  if (period === '1D') {
    return `${first.year}年${first.month}月${first.day}日`
  }

  if (first.year === last.year) {
    return `${first.year}年${first.month}/${first.day} - ${last.month}/${last.day}`
  }
  return `${first.year}/${first.month}/${first.day} - ${last.year}/${last.month}/${last.day}`
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
  const [chartPeriod, setChartPeriod] = useState<TimePeriod>('1M')

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
      setChartData(generateChartData(selectedStock.price, chartPeriod))
    }
  }, [selectedStock, chartPeriod])

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
                            <span className="inline-flex">
                              {stock.changePercent >= 0 && <TrendingUp className="w-4 h-4" />}
                              {stock.changePercent < 0 && <TrendingDown className="w-4 h-4" />}
                            </span>
                            <span>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (isInWatchlist(stock.symbol, stock.market)) {
                              removeFromWatchlist(stock.symbol, stock.market)
                            } else {
                              addToWatchlist(stock)
                            }
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isInWatchlist(stock.symbol, stock.market)
                              ? 'text-yellow-500 bg-yellow-50'
                              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                          }`}
                        >
                          <Star className="w-5 h-5" fill={isInWatchlist(stock.symbol, stock.market) ? '#facc15' : 'none'} />
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
                            <span className="inline-flex">
                              {stock.changePercent >= 0 && <TrendingUp className="w-4 h-4" />}
                              {stock.changePercent < 0 && <TrendingDown className="w-4 h-4" />}
                            </span>
                            <span>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
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
                    onClick={() => {
                      if (isInWatchlist(selectedStock.symbol, selectedStock.market)) {
                        removeFromWatchlist(selectedStock.symbol, selectedStock.market)
                      } else {
                        addToWatchlist(selectedStock)
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isInWatchlist(selectedStock.symbol, selectedStock.market)
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    <span className="inline-flex">
                      {isInWatchlist(selectedStock.symbol, selectedStock.market) && <Star className="w-4 h-4" fill="#facc15" />}
                      {!isInWatchlist(selectedStock.symbol, selectedStock.market) && <Plus className="w-4 h-4" />}
                    </span>
                    <span>{isInWatchlist(selectedStock.symbol, selectedStock.market) ? '已关注' : '加自选'}</span>
                  </button>
                </div>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-800">{selectedStock.price.toFixed(2)}</div>
                  <div className={`flex items-center gap-2 mt-1 ${
                    selectedStock.changePercent >= 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    <span className="inline-flex">
                      {selectedStock.changePercent >= 0 && <TrendingUp className="w-5 h-5" />}
                      {selectedStock.changePercent < 0 && <TrendingDown className="w-5 h-5" />}
                    </span>
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
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    {selectedStock.name} 走势
                  </h3>
                  {/* 时间周期切换 */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    {(['1D', '5D', '1M', '3M', '1Y'] as TimePeriod[]).map((period) => (
                      <button
                        key={period}
                        onClick={() => setChartPeriod(period)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          chartPeriod === period
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        {period === '1D' ? '1日' : period === '5D' ? '5日' : period === '1M' ? '1月' : period === '3M' ? '3月' : '1年'}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 显示时间范围 */}
                <div className="text-sm text-gray-500 mb-3">
                  {getChartDateRange(chartData, chartPeriod)}
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={selectedStock.changePercent >= 0 ? '#3b82f6' : '#22c55e'} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={selectedStock.changePercent >= 0 ? '#3b82f6' : '#22c55e'} stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                        interval={chartPeriod === '1Y' ? 30 : chartPeriod === '3M' ? 10 : chartPeriod === '1D' ? 6 : 'preserveStartEnd'}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toFixed(2)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: number) => [value.toFixed(3), '价格']}
                        labelFormatter={(label) => `日期: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#priceGradient)"
                        isAnimationActive={true}
                        animationDuration={500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {/* 数据统计 */}
                <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-gray-500">最高</div>
                    <div className="font-medium text-red-500">
                      {chartData.length > 0 ? Math.max(...chartData.map(d => d.price)).toFixed(3) : '-'}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-gray-500">最低</div>
                    <div className="font-medium text-green-500">
                      {chartData.length > 0 ? Math.min(...chartData.map(d => d.price)).toFixed(3) : '-'}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-gray-500">开盘</div>
                    <div className="font-medium text-gray-700">
                      {chartData.length > 0 ? chartData[0]?.price.toFixed(3) : '-'}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-gray-500">现价</div>
                    <div className="font-medium text-gray-700">
                      {chartData.length > 0 ? chartData[chartData.length - 1]?.price.toFixed(3) : '-'}
                    </div>
                  </div>
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
