import { useState, useMemo, useEffect } from 'react'
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
  Legend,
} from 'recharts'
import {
  Plus, Settings, TrendingUp, TrendingDown, Wallet, Search,
  ArrowUpDown, Edit2, X, Check, RefreshCw, ChevronDown,
  PieChartIcon, BarChart3, Target, AlertCircle, Save, Trash2
} from 'lucide-react'

// 股票搜索数据库（含ETF基金）
const stockSearchDatabase: Record<string, { name: string; price: number; sector: string }> = {
  // 个股
  '600519': { name: '贵州茅台', price: 1720, sector: '消费' },
  '300750': { name: '宁德时代', price: 198.45, sector: '新能源' },
  '002594': { name: '比亚迪', price: 312.80, sector: '新能源' },
  '688256': { name: '寒武纪', price: 456.78, sector: 'AI芯片' },
  '002230': { name: '科大讯飞', price: 78.56, sector: 'AI应用' },
  '688041': { name: '海光信息', price: 123.45, sector: 'AI芯片' },
  '601318': { name: '中国平安', price: 45.8, sector: '金融' },
  '600036': { name: '招商银行', price: 35.5, sector: '金融' },
  '000858': { name: '五粮液', price: 158, sector: '消费' },
  '300059': { name: '东方财富', price: 16.8, sector: '金融' },
  '601689': { name: '拓普集团', price: 89.45, sector: '人形机器人' },
  '688111': { name: '金山办公', price: 345, sector: 'AI应用' },
  '300418': { name: '昆仑万维', price: 58.5, sector: 'AI应用' },
  '000333': { name: '美的集团', price: 65.2, sector: '消费' },
  '601012': { name: '隆基绿能', price: 18.5, sector: '新能源' },
  '300124': { name: '汇川技术', price: 68.9, sector: '人形机器人' },
  '688981': { name: '中芯国际', price: 75.8, sector: 'AI芯片' },
  '002475': { name: '立讯精密', price: 32.5, sector: '消费电子' },
  '300760': { name: '迈瑞医疗', price: 285, sector: '医疗' },
  '603259': { name: '药明康德', price: 48.6, sector: '医疗' },
  '000001': { name: '平安银行', price: 11.2, sector: '金融' },
  '600900': { name: '长江电力', price: 28.9, sector: '公用事业' },
  '002415': { name: '海康威视', price: 32.15, sector: '消费电子' },
  '000651': { name: '格力电器', price: 38.9, sector: '消费' },
  '600276': { name: '恒瑞医药', price: 45.2, sector: '医疗' },
  '601899': { name: '紫金矿业', price: 15.88, sector: '资源' },
  // ETF基金
  '518880': { name: '黄金ETF', price: 5.68, sector: 'ETF' },
  '513130': { name: '恒生科技ETF', price: 0.785, sector: 'ETF' },
  '512100': { name: '中证1000ETF', price: 1.856, sector: 'ETF' },
  '588000': { name: '科创50ETF', price: 0.925, sector: 'ETF' },
  '510300': { name: '沪深300ETF', price: 3.92, sector: 'ETF' },
  '510500': { name: '中证500ETF', price: 5.85, sector: 'ETF' },
  '510050': { name: '上证50ETF', price: 2.68, sector: 'ETF' },
  '159915': { name: '创业板ETF', price: 2.12, sector: 'ETF' },
  '159919': { name: '沪深300ETF', price: 4.05, sector: 'ETF' },
  '512880': { name: '证券ETF', price: 0.958, sector: 'ETF' },
  '512690': { name: '酒ETF', price: 1.125, sector: 'ETF' },
  '512660': { name: '军工ETF', price: 1.068, sector: 'ETF' },
  '159995': { name: '芯片ETF', price: 0.925, sector: 'ETF' },
  '515050': { name: '5GETF', price: 0.785, sector: 'ETF' },
  '513050': { name: '中概互联ETF', price: 0.658, sector: 'ETF' },
  '513100': { name: '纳指ETF', price: 1.625, sector: 'ETF' },
  '513500': { name: '标普500ETF', price: 1.485, sector: 'ETF' },
  '159941': { name: '纳指ETF', price: 1.58, sector: 'ETF' },
  '518800': { name: '黄金基金ETF', price: 5.52, sector: 'ETF' },
  '159934': { name: '黄金ETF', price: 5.45, sector: 'ETF' },
  '512010': { name: '医药ETF', price: 0.485, sector: 'ETF' },
  '512170': { name: '医疗ETF', price: 0.525, sector: 'ETF' },
  '159892': { name: '光伏ETF', price: 0.685, sector: 'ETF' },
  '516160': { name: '新能源ETF', price: 0.758, sector: 'ETF' },
  '512480': { name: '半导体ETF', price: 1.42, sector: 'ETF' },
  '159869': { name: '游戏ETF', price: 0.92, sector: 'ETF' },
  '512800': { name: '银行ETF', price: 1.12, sector: 'ETF' },
  '512200': { name: '房地产ETF', price: 0.58, sector: 'ETF' },
  '515790': { name: '光伏ETF', price: 0.72, sector: 'ETF' },
  '159801': { name: '芯片ETF', price: 0.88, sector: 'ETF' },
  '562500': { name: '机器人ETF', price: 1.15, sector: 'ETF' },
  '159807': { name: '科创板ETF', price: 0.95, sector: 'ETF' },
}

// 组合数据库
interface Stock {
  name: string
  code: string
  shares: number
  cost: number
  current: number
  sector: string
}

interface Portfolio {
  id: string
  name: string
  createDate: string
  totalAsset: number
  todayPnl: number
  todayPnlPercent: number
  totalPnl: number
  totalPnlPercent: number
  cash: number
  stocks: Stock[]
}

const portfoliosDatabase: Portfolio[] = [
  {
    id: '1',
    name: '成长组合',
    createDate: '2025-06-15',
    totalAsset: 2567890,
    todayPnl: 45678,
    todayPnlPercent: 1.81,
    totalPnl: 356789,
    totalPnlPercent: 16.13,
    cash: 80000,
    stocks: [
      { name: '寒武纪', code: '688256', shares: 200, cost: 380, current: 456.78, sector: 'AI芯片' },
      { name: '宁德时代', code: '300750', shares: 300, cost: 175, current: 198.45, sector: '新能源' },
      { name: '比亚迪', code: '002594', shares: 100, cost: 285, current: 312.80, sector: '新能源' },
      { name: '科大讯飞', code: '002230', shares: 400, cost: 65, current: 78.56, sector: 'AI应用' },
      { name: '拓普集团', code: '601689', shares: 350, cost: 75, current: 89.45, sector: '人形机器人' },
      { name: '海光信息', code: '688041', shares: 150, cost: 98, current: 123.45, sector: 'AI芯片' },
    ]
  },
  {
    id: '2',
    name: '价值组合',
    createDate: '2025-03-20',
    totalAsset: 1856000,
    todayPnl: -12350,
    todayPnlPercent: -0.66,
    totalPnl: 156000,
    totalPnlPercent: 9.18,
    cash: 200000,
    stocks: [
      { name: '贵州茅台', code: '600519', shares: 5, cost: 1650, current: 1720, sector: '消费' },
      { name: '招商银行', code: '600036', shares: 2000, cost: 32, current: 35.5, sector: '金融' },
      { name: '中国平安', code: '601318', shares: 1500, cost: 42, current: 45.8, sector: '金融' },
      { name: '五粮液', code: '000858', shares: 300, cost: 145, current: 158, sector: '消费' },
      { name: '美的集团', code: '000333', shares: 500, cost: 58, current: 65.2, sector: '消费' },
    ]
  },
  {
    id: '3',
    name: 'AI主题',
    createDate: '2026-01-10',
    totalAsset: 890000,
    todayPnl: 28900,
    todayPnlPercent: 3.35,
    totalPnl: 190000,
    totalPnlPercent: 27.14,
    cash: 50000,
    stocks: [
      { name: '寒武纪', code: '688256', shares: 100, cost: 350, current: 456.78, sector: 'AI芯片' },
      { name: '科大讯飞', code: '002230', shares: 800, cost: 55, current: 78.56, sector: 'AI应用' },
      { name: '金山办公', code: '688111', shares: 200, cost: 280, current: 345, sector: 'AI应用' },
      { name: '昆仑万维', code: '300418', shares: 600, cost: 42, current: 58.5, sector: 'AI应用' },
    ]
  }
]

// 生成净值走势数据
const generatePerformanceData = (days: number, baseReturn: number, volatility: number) => {
  const data = []
  let portfolioValue = 100
  let benchmarkValue = 100

  for (let i = 0; i <= days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i))

    portfolioValue *= (1 + (Math.random() - 0.5) * volatility * 2 + baseReturn / days)
    benchmarkValue *= (1 + (Math.random() - 0.5) * volatility * 1.5 + baseReturn / days * 0.7)

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      portfolio: Math.round(portfolioValue * 100) / 100,
      benchmark: Math.round(benchmarkValue * 100) / 100,
    })
  }
  return data
}

// 颜色映射
const sectorColors: Record<string, string> = {
  'AI芯片': '#3b82f6',
  '新能源': '#10b981',
  '人形机器人': '#f59e0b',
  'AI应用': '#8b5cf6',
  '消费': '#ec4899',
  '金融': '#06b6d4',
  '现金': '#9ca3af',
  'ETF': '#84cc16',
  '消费电子': '#f97316',
  '医疗': '#14b8a6',
  '公用事业': '#a855f7',
}

export default function PortfolioManagement() {
  // localStorage 存储键
  const STORAGE_KEY = 'quant_portfolios'
  const SELECTED_ID_KEY = 'quant_selected_portfolio'

  // 从 localStorage 加载组合数据
  const loadPortfolios = (): Portfolio[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.error('加载组合数据失败:', e)
    }
    return portfoliosDatabase
  }

  // 从 localStorage 加载选中的组合ID
  const loadSelectedId = (): string => {
    try {
      const saved = localStorage.getItem(SELECTED_ID_KEY)
      if (saved) return saved
    } catch (e) {
      console.error('加载选中组合ID失败:', e)
    }
    return '1'
  }

  // 状态管理
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(loadSelectedId)
  const [selectedView, setSelectedView] = useState<'list' | 'chart'>('list')
  const [sortField, setSortField] = useState<'profit' | 'weight' | 'name'>('weight')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [showNewPortfolioModal, setShowNewPortfolioModal] = useState(false)
  const [showRebalanceModal, setShowRebalanceModal] = useState(false)
  const [showStockDetail, setShowStockDetail] = useState<Stock | null>(null)
  const [showAddStockModal, setShowAddStockModal] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState('')
  const [newPortfolioCash, setNewPortfolioCash] = useState(100000)
  const [portfolios, setPortfolios] = useState<Portfolio[]>(loadPortfolios)
  const [showPortfolioDropdown, setShowPortfolioDropdown] = useState(false)

  // 保存组合数据到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios))
    } catch (e) {
      console.error('保存组合数据失败:', e)
    }
  }, [portfolios])

  // 保存选中的组合ID到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_ID_KEY, selectedPortfolioId)
    } catch (e) {
      console.error('保存选中组合ID失败:', e)
    }
  }, [selectedPortfolioId])

  // 资金编辑状态
  const [isEditingCash, setIsEditingCash] = useState(false)
  const [editCashValue, setEditCashValue] = useState(0)

  // 添加股票状态
  const [stockSearchQuery, setStockSearchQuery] = useState('')
  const [addStockShares, setAddStockShares] = useState(100)
  const [selectedStockToAdd, setSelectedStockToAdd] = useState<{ code: string; name: string; price: number; sector: string } | null>(null)

  // 编辑持股数量状态
  const [isEditingShares, setIsEditingShares] = useState(false)
  const [editSharesValue, setEditSharesValue] = useState(0)

  // 当前选中的组合
  const currentPortfolio = useMemo(() => {
    return portfolios.find(p => p.id === selectedPortfolioId) || portfolios[0]
  }, [portfolios, selectedPortfolioId])

  // 股票搜索结果
  const stockSearchResults = useMemo(() => {
    if (!stockSearchQuery.trim()) return []

    return Object.entries(stockSearchDatabase)
      .filter(([code, info]) =>
        code.includes(stockSearchQuery) ||
        info.name.includes(stockSearchQuery)
      )
      .map(([code, info]) => ({ code, ...info }))
      .slice(0, 8)
  }, [stockSearchQuery])

  // 计算持仓数据
  const holdingsData = useMemo(() => {
    if (!currentPortfolio) return { stocks: [], cashWeight: 0 }

    const totalValue = currentPortfolio.stocks.reduce((sum, s) => sum + s.current * s.shares, 0) + currentPortfolio.cash

    let data = currentPortfolio.stocks.map(stock => {
      const marketValue = stock.current * stock.shares
      const costValue = stock.cost * stock.shares
      const profit = marketValue - costValue
      const profitPercent = (profit / costValue) * 100
      const weight = (marketValue / totalValue) * 100

      return {
        ...stock,
        marketValue,
        costValue,
        profit,
        profitPercent,
        weight,
      }
    })

    const cashWeight = (currentPortfolio.cash / totalValue) * 100

    if (searchQuery) {
      data = data.filter(s =>
        s.name.includes(searchQuery) ||
        s.code.includes(searchQuery) ||
        s.sector.includes(searchQuery)
      )
    }

    data.sort((a, b) => {
      let compare = 0
      switch (sortField) {
        case 'profit':
          compare = a.profitPercent - b.profitPercent
          break
        case 'weight':
          compare = a.weight - b.weight
          break
        case 'name':
          compare = a.name.localeCompare(b.name)
          break
      }
      return sortOrder === 'desc' ? -compare : compare
    })

    return { stocks: data, cashWeight }
  }, [currentPortfolio, searchQuery, sortField, sortOrder])

  // 资产配置数据
  const allocationData = useMemo(() => {
    if (!currentPortfolio) return []

    const sectorMap: Record<string, number> = {}
    const totalValue = currentPortfolio.stocks.reduce((sum, s) => sum + s.current * s.shares, 0) + currentPortfolio.cash

    currentPortfolio.stocks.forEach(stock => {
      const value = stock.current * stock.shares
      sectorMap[stock.sector] = (sectorMap[stock.sector] || 0) + value
    })

    const data = Object.entries(sectorMap).map(([name, value]) => ({
      name,
      value: Math.round((value / totalValue) * 100),
      color: sectorColors[name] || '#6b7280',
      amount: value,
    }))

    data.push({
      name: '现金',
      value: Math.round((currentPortfolio.cash / totalValue) * 100),
      color: sectorColors['现金'],
      amount: currentPortfolio.cash,
    })

    return data.sort((a, b) => b.value - a.value)
  }, [currentPortfolio])

  // 净值走势数据
  const performanceData = useMemo(() => {
    const days = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : timePeriod === '90d' ? 90 : 365
    const baseReturn = currentPortfolio?.totalPnlPercent || 10
    return generatePerformanceData(days, baseReturn / 100, 0.02)
  }, [timePeriod, currentPortfolio])

  // 处理排序
  const handleSort = (field: 'profit' | 'weight' | 'name') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // 创建新组合
  const handleCreatePortfolio = () => {
    if (!newPortfolioName.trim()) return

    const newPortfolio: Portfolio = {
      id: String(Date.now()),
      name: newPortfolioName,
      createDate: new Date().toISOString().split('T')[0],
      totalAsset: newPortfolioCash,
      todayPnl: 0,
      todayPnlPercent: 0,
      totalPnl: 0,
      totalPnlPercent: 0,
      cash: newPortfolioCash,
      stocks: []
    }

    setPortfolios(prev => [...prev, newPortfolio])
    setSelectedPortfolioId(newPortfolio.id)
    setNewPortfolioName('')
    setNewPortfolioCash(100000)
    setShowNewPortfolioModal(false)
  }

  // 编辑资金
  const handleStartEditCash = () => {
    setEditCashValue(currentPortfolio?.cash || 0)
    setIsEditingCash(true)
  }

  const handleSaveCash = () => {
    if (editCashValue < 0) return

    setPortfolios(prev => prev.map(p => {
      if (p.id === selectedPortfolioId) {
        const stocksValue = p.stocks.reduce((sum, s) => sum + s.current * s.shares, 0)
        return {
          ...p,
          cash: editCashValue,
          totalAsset: stocksValue + editCashValue
        }
      }
      return p
    }))
    setIsEditingCash(false)
  }

  // 添加股票到组合
  const handleAddStock = () => {
    if (!selectedStockToAdd || addStockShares <= 0) return

    const stockCost = selectedStockToAdd.price * addStockShares

    setPortfolios(prev => prev.map(p => {
      if (p.id === selectedPortfolioId) {
        // 检查现金是否足够
        if (p.cash < stockCost) {
          alert(`现金不足！需要 元${stockCost.toLocaleString()}，可用 元${p.cash.toLocaleString()}`)
          return p
        }

        // 检查是否已持有该股票
        const existingStock = p.stocks.find(s => s.code === selectedStockToAdd.code)
        let newStocks: Stock[]

        if (existingStock) {
          // 加仓 - 计算新的平均成本
          newStocks = p.stocks.map(s => {
            if (s.code === selectedStockToAdd.code) {
              const totalShares = s.shares + addStockShares
              const newCost = (s.cost * s.shares + selectedStockToAdd.price * addStockShares) / totalShares
              return {
                ...s,
                shares: totalShares,
                cost: Math.round(newCost * 100) / 100
              }
            }
            return s
          })
        } else {
          // 新建仓
          newStocks = [...p.stocks, {
            name: selectedStockToAdd.name,
            code: selectedStockToAdd.code,
            shares: addStockShares,
            cost: selectedStockToAdd.price,
            current: selectedStockToAdd.price,
            sector: selectedStockToAdd.sector
          }]
        }

        const newCash = p.cash - stockCost
        const stocksValue = newStocks.reduce((sum, s) => sum + s.current * s.shares, 0)

        return {
          ...p,
          stocks: newStocks,
          cash: newCash,
          totalAsset: stocksValue + newCash
        }
      }
      return p
    }))

    setShowAddStockModal(false)
    setSelectedStockToAdd(null)
    setStockSearchQuery('')
    setAddStockShares(100)
  }

  // 删除股票
  const handleDeleteStock = (stockCode: string) => {
    if (!confirm('确定要删除该持仓吗？股票将被卖出并转为现金。')) return

    setPortfolios(prev => prev.map(p => {
      if (p.id === selectedPortfolioId) {
        const stockToDelete = p.stocks.find(s => s.code === stockCode)
        if (!stockToDelete) return p

        // 卖出股票，资金回到现金
        const saleValue = stockToDelete.current * stockToDelete.shares
        const newStocks = p.stocks.filter(s => s.code !== stockCode)
        const newCash = p.cash + saleValue
        const stocksValue = newStocks.reduce((sum, s) => sum + s.current * s.shares, 0)

        return {
          ...p,
          stocks: newStocks,
          cash: newCash,
          totalAsset: stocksValue + newCash
        }
      }
      return p
    }))

    setShowStockDetail(null)
  }

  // 编辑持股数量
  const handleStartEditShares = () => {
    if (showStockDetail) {
      setEditSharesValue(showStockDetail.shares)
      setIsEditingShares(true)
    }
  }

  const handleSaveShares = () => {
    if (!showStockDetail || editSharesValue <= 0) return

    const currentStock = currentPortfolio?.stocks.find(s => s.code === showStockDetail.code)
    if (!currentStock) return

    const sharesDiff = editSharesValue - currentStock.shares
    const costDiff = sharesDiff * currentStock.current

    // 检查现金是否足够（买入需要现金）
    if (sharesDiff > 0 && (currentPortfolio?.cash || 0) < costDiff) {
      alert(`现金不足！需要 ${costDiff.toLocaleString()} 元，可用 ${currentPortfolio?.cash.toLocaleString()} 元`)
      return
    }

    setPortfolios(prev => prev.map(p => {
      if (p.id === selectedPortfolioId) {
        const newStocks = p.stocks.map(s => {
          if (s.code === showStockDetail.code) {
            return { ...s, shares: editSharesValue }
          }
          return s
        })
        const newCash = p.cash - costDiff
        const stocksValue = newStocks.reduce((sum, s) => sum + s.current * s.shares, 0)

        return {
          ...p,
          stocks: newStocks,
          cash: newCash,
          totalAsset: stocksValue + newCash
        }
      }
      return p
    }))

    // 更新弹窗显示的数据
    setShowStockDetail(prev => prev ? { ...prev, shares: editSharesValue } : null)
    setIsEditingShares(false)
  }

  // 刷新数据
  const handleRefresh = () => {
    setPortfolios(prev => prev.map(portfolio => {
      const updatedStocks = portfolio.stocks.map(stock => ({
        ...stock,
        current: Math.round(stock.current * (1 + (Math.random() - 0.5) * 0.02) * 100) / 100
      }))
      const stocksValue = updatedStocks.reduce((sum, s) => sum + s.current * s.shares, 0)
      const totalAsset = stocksValue + portfolio.cash
      const costValue = updatedStocks.reduce((sum, s) => sum + s.cost * s.shares, 0)
      const totalPnl = stocksValue - costValue
      const totalPnlPercent = costValue > 0 ? (totalPnl / costValue) * 100 : 0

      return {
        ...portfolio,
        stocks: updatedStocks,
        totalAsset,
        totalPnl: Math.round(totalPnl),
        totalPnlPercent: Math.round(totalPnlPercent * 100) / 100,
        todayPnl: Math.round((Math.random() - 0.3) * 50000),
        todayPnlPercent: Math.round((Math.random() - 0.3) * 5 * 100) / 100,
      }
    }))
  }

  const summaryData = currentPortfolio ? [
    { label: '总资产', value: `元${currentPortfolio.totalAsset.toLocaleString()}`, change: currentPortfolio.totalPnlPercent, icon: Wallet },
    { label: '今日盈亏', value: `元${currentPortfolio.todayPnl.toLocaleString()}`, change: currentPortfolio.todayPnlPercent, icon: TrendingUp },
    { label: '持仓盈亏', value: `元${currentPortfolio.totalPnl.toLocaleString()}`, change: currentPortfolio.totalPnlPercent, icon: BarChart3 },
    { label: '可用现金', value: `元${currentPortfolio.cash.toLocaleString()}`, change: 0, icon: Target, editable: true },
  ] : []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">组合管理</h1>
          {/* 组合选择下拉 */}
          <div className="relative">
            <button
              onClick={() => setShowPortfolioDropdown(!showPortfolioDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <PieChartIcon className="w-4 h-4" />
              {currentPortfolio?.name}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showPortfolioDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {portfolios.map(portfolio => (
                  <div
                    key={portfolio.id}
                    className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                      portfolio.id === selectedPortfolioId ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      setSelectedPortfolioId(portfolio.id)
                      setShowPortfolioDropdown(false)
                    }}
                  >
                    <div>
                      <div className="font-medium text-gray-800">{portfolio.name}</div>
                      <div className="text-xs text-gray-500">
                        元{portfolio.totalAsset.toLocaleString()} ·
                        <span className={portfolio.totalPnlPercent >= 0 ? 'text-red-500' : 'text-green-500'}>
                          {portfolio.totalPnlPercent >= 0 ? '+' : ''}{portfolio.totalPnlPercent}%
                        </span>
                      </div>
                    </div>
                    {portfolio.id === selectedPortfolioId && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                ))}
                <div className="border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowNewPortfolioModal(true)
                      setShowPortfolioDropdown(false)
                    }}
                    className="flex items-center gap-2 w-full px-4 py-3 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4" />
                    新建组合
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
          <button
            onClick={() => setShowAddStockModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加股票
          </button>
          <button
            onClick={() => setShowRebalanceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            调仓
          </button>
          <button
            onClick={() => setShowNewPortfolioModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建组合
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {summaryData.map((item) => (
          <div key={item.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
              {item.editable && (
                <button
                  onClick={handleStartEditCash}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  title="编辑资金"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
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
            <div className="flex items-center gap-3">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索股票..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                />
              </div>
              {/* 排序按钮 */}
              <div className="flex gap-1">
                <button
                  onClick={() => handleSort('profit')}
                  className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                    sortField === 'profit' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  盈亏 <ArrowUpDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleSort('weight')}
                  className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                    sortField === 'weight' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  占比 <ArrowUpDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleSort('name')}
                  className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                    sortField === 'name' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  名称 <ArrowUpDown className="w-3 h-3" />
                </button>
              </div>
              {/* 视图切换 */}
              <div className="flex gap-1 border-l border-gray-200 pl-3">
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
          </div>

          {selectedView === 'list' ? (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">股票名称</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">代码</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">板块</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">持股</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">现价</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">市值</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">盈亏</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">占比</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingsData.stocks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        暂无持仓，点击"添加股票"开始建仓
                      </td>
                    </tr>
                  ) : (
                    holdingsData.stocks.map((stock) => (
                      <tr
                        key={stock.code}
                        className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => setShowStockDetail(stock)}
                      >
                        <td className="py-3 px-4 font-medium">{stock.name}</td>
                        <td className="py-3 px-4 text-gray-500">{stock.code}</td>
                        <td className="py-3 px-4">
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: `${sectorColors[stock.sector] || '#6b7280'}20`,
                              color: sectorColors[stock.sector] || '#6b7280'
                            }}
                          >
                            {stock.sector}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{stock.shares}</td>
                        <td className="py-3 px-4 text-right">元{stock.current.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">元{stock.marketValue.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          <div className={stock.profit >= 0 ? 'text-red-500' : 'text-green-500'}>
                            <div>{stock.profit >= 0 ? '+' : ''}元{stock.profit.toFixed(0)}</div>
                            <div className="text-xs">{stock.profitPercent >= 0 ? '+' : ''}{stock.profitPercent.toFixed(2)}%</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${Math.min(stock.weight, 100)}%` }}
                              />
                            </div>
                            <span className="w-12 text-right">{stock.weight.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowStockDetail(stock)
                              }}
                              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                              title="查看详情"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteStock(stock.code)
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              title="删除持仓"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  {/* 现金行 */}
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-500">现金</td>
                    <td className="py-3 px-4 text-gray-400">-</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-600">现金</span>
                    </td>
                    <td className="py-3 px-4 text-right">-</td>
                    <td className="py-3 px-4 text-right">-</td>
                    <td className="py-3 px-4 text-right">元{currentPortfolio?.cash.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-400">-</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-400 rounded-full"
                            style={{ width: `${holdingsData.cashWeight}%` }}
                          />
                        </div>
                        <span className="w-12 text-right">{holdingsData.cashWeight?.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={handleStartEditCash}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="编辑资金"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={holdingsData.stocks.map(s => ({ name: s.name, value: s.marketValue }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    isAnimationActive={false}
                  >
                    {holdingsData.stocks.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={sectorColors[entry.sector] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`元${value.toLocaleString()}`, '市值']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Allocation Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">资产配置</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: { payload?: { amount?: number } }) => [
                    `${value}% (元${(props.payload?.amount || 0).toLocaleString()})`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {allocationData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs">元{item.amount.toLocaleString()}</span>
                  <span className="font-medium w-10 text-right">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">组合净值走势</h2>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map(period => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  timePeriod === period
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period === '7d' ? '7天' : period === '30d' ? '30天' : period === '90d' ? '90天' : '1年'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [value.toFixed(2), '']}
              />
              <Legend />
              <Line type="monotone" dataKey="portfolio" stroke="#3b82f6" strokeWidth={2} dot={false} name="组合净值" isAnimationActive={false} />
              <Line type="monotone" dataKey="benchmark" stroke="#9ca3af" strokeWidth={2} dot={false} name="沪深300" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 新建组合弹窗 */}
      {showNewPortfolioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">新建组合</h3>
              <button onClick={() => setShowNewPortfolioModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">组合名称</label>
                <input
                  type="text"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                  placeholder="如：科技成长组合"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">初始资金 (元)</label>
                <input
                  type="number"
                  value={newPortfolioCash}
                  onChange={(e) => setNewPortfolioCash(Number(e.target.value))}
                  placeholder="100000"
                  min={0}
                  step={10000}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewPortfolioModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleCreatePortfolio}
                  disabled={!newPortfolioName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑资金弹窗 */}
      {isEditingCash && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">编辑可用资金</h3>
              <button onClick={() => setIsEditingCash(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">当前资金</label>
                <div className="text-2xl font-bold text-gray-400 mb-3">
                  元{currentPortfolio?.cash.toLocaleString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">新资金金额 (元)</label>
                <input
                  type="number"
                  value={editCashValue}
                  onChange={(e) => setEditCashValue(Number(e.target.value))}
                  min={0}
                  step={10000}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditingCash(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveCash}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 添加股票弹窗 */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">添加股票 - {currentPortfolio?.name}</h3>
              <button onClick={() => {
                setShowAddStockModal(false)
                setSelectedStockToAdd(null)
                setStockSearchQuery('')
              }}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-blue-700">可用资金</div>
                <div className="text-xl font-bold text-blue-800">元{currentPortfolio?.cash.toLocaleString()}</div>
              </div>

              {/* 股票搜索 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">搜索股票 (代码或名称)</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    placeholder="输入股票代码或名称，如 600519 或 茅台"
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 搜索结果 */}
                {stockSearchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {stockSearchResults.map(stock => (
                      <div
                        key={stock.code}
                        onClick={() => {
                          setSelectedStockToAdd(stock)
                          setStockSearchQuery('')
                        }}
                        className={`flex items-center justify-between px-3 py-2 hover:bg-blue-50 cursor-pointer ${
                          selectedStockToAdd?.code === stock.code ? 'bg-blue-100' : ''
                        }`}
                      >
                        <div>
                          <span className="font-medium">{stock.name}</span>
                          <span className="text-gray-400 ml-2">{stock.code}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: `${sectorColors[stock.sector] || '#6b7280'}20`,
                              color: sectorColors[stock.sector] || '#6b7280'
                            }}
                          >
                            {stock.sector}
                          </span>
                          <span className="text-gray-600">元{stock.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 已选股票 */}
              {selectedStockToAdd && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-semibold text-lg">{selectedStockToAdd.name}</span>
                      <span className="text-gray-400 ml-2">{selectedStockToAdd.code}</span>
                    </div>
                    <span className="text-xl font-bold">元{selectedStockToAdd.price}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">买入数量 (股)</label>
                    <input
                      type="number"
                      value={addStockShares}
                      onChange={(e) => setAddStockShares(Number(e.target.value))}
                      min={100}
                      step={100}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-gray-500">预计金额</span>
                      <span className="font-medium text-blue-600">
                        元{(selectedStockToAdd.price * addStockShares).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddStockModal(false)
                    setSelectedStockToAdd(null)
                    setStockSearchQuery('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleAddStock}
                  disabled={!selectedStockToAdd || addStockShares <= 0}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  确认买入
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 调仓弹窗 */}
      {showRebalanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[600px] shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">调仓 - {currentPortfolio?.name}</h3>
              <button onClick={() => setShowRebalanceModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-700 mb-2">当前可用资金</div>
                <div className="text-2xl font-bold text-blue-800">元{currentPortfolio?.cash.toLocaleString()}</div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3">股票</th>
                      <th className="text-right py-2 px-3">现价</th>
                      <th className="text-right py-2 px-3">持仓</th>
                      <th className="text-center py-2 px-3">调整</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPortfolio?.stocks.map(stock => (
                      <tr key={stock.code} className="border-t">
                        <td className="py-2 px-3">
                          <div className="font-medium">{stock.name}</div>
                          <div className="text-xs text-gray-400">{stock.code}</div>
                        </td>
                        <td className="py-2 px-3 text-right">元{stock.current}</td>
                        <td className="py-2 px-3 text-right">{stock.shares}股</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <button className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">
                              买入
                            </button>
                            <button className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">
                              卖出
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRebalanceModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    alert('调仓功能已提交（演示）')
                    setShowRebalanceModal(false)
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  确认调仓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 股票详情弹窗 */}
      {showStockDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{showStockDetail.name}</h3>
                <div className="text-sm text-gray-500">{showStockDetail.code} · {showStockDetail.sector}</div>
              </div>
              <button onClick={() => { setShowStockDetail(null); setIsEditingShares(false) }}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">现价</div>
                  <div className="text-xl font-bold">{showStockDetail.current}元</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">成本价</div>
                  <div className="text-xl font-bold">{showStockDetail.cost}元</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border-2 border-blue-200 relative">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">持股数量</div>
                    {!isEditingShares && (
                      <button
                        onClick={handleStartEditShares}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="编辑数量"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {isEditingShares ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        value={editSharesValue}
                        onChange={(e) => setEditSharesValue(Number(e.target.value))}
                        min={1}
                        step={100}
                        className="w-full px-2 py-1 text-lg font-bold border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveShares}
                        className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                        title="保存"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsEditingShares(false)}
                        className="p-1.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                        title="取消"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-xl font-bold">{showStockDetail.shares}股</div>
                  )}
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">持仓市值</div>
                  <div className="text-xl font-bold">{(showStockDetail.current * showStockDetail.shares).toLocaleString()}元</div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${
                (showStockDetail.current - showStockDetail.cost) >= 0 ? 'bg-red-50' : 'bg-green-50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">持仓盈亏</span>
                  <span className={`text-xl font-bold ${
                    (showStockDetail.current - showStockDetail.cost) >= 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {(showStockDetail.current - showStockDetail.cost) >= 0 ? '+' : ''}
                    {((showStockDetail.current - showStockDetail.cost) * showStockDetail.shares).toFixed(0)}元
                    ({(((showStockDetail.current - showStockDetail.cost) / showStockDetail.cost) * 100).toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowStockDetail(null); setIsEditingShares(false) }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  买入
                </button>
                <button
                  onClick={() => { setShowStockDetail(null); setIsEditingShares(false) }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  卖出
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
