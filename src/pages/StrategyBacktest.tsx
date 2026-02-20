import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Play, RotateCcw, Download, Plus, Trash2, Edit2, X, Settings, Calendar, TrendingUp, AlertTriangle, CheckCircle, Pause } from 'lucide-react'

// 策略类型定义
interface Strategy {
  id: number
  name: string
  type: string
  status: 'active' | 'paused' | 'stopped'
  params: StrategyParams
  results?: BacktestResult
  createdAt: string
}

interface StrategyParams {
  shortPeriod?: number
  longPeriod?: number
  stopLoss?: number
  takeProfit?: number
  positionSize?: number
  lookbackPeriod?: number
  threshold?: number
  rebalancePeriod?: number
}

interface BacktestResult {
  totalReturn: number
  annualReturn: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  totalTrades: number
  profitFactor: number
  volatility: number
  data: { day: number; strategy: number; benchmark: number; date: string }[]
}

// 策略类型选项
const strategyTypes = [
  { value: 'dual_ma', label: '双均线策略', description: '基于短期和长期均线交叉信号' },
  { value: 'momentum', label: '动量突破', description: '追踪价格动量突破' },
  { value: 'mean_reversion', label: '均值回归', description: '价格偏离均值后回归' },
  { value: 'grid', label: '网格交易', description: '在价格区间内网格交易' },
  { value: 'rsi', label: 'RSI策略', description: '基于RSI指标的超买超卖' },
  { value: 'macd', label: 'MACD策略', description: '基于MACD指标信号' },
]

// 生成回测数据
const runBacktest = (strategy: Strategy, startDate: string, endDate: string): BacktestResult => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  const data = []
  let strategyValue = 10000
  let benchmarkValue = 10000
  let maxValue = 10000
  let maxDrawdown = 0
  let wins = 0
  let losses = 0
  let totalProfit = 0
  let totalLoss = 0

  // 根据策略类型调整收益特征
  const typeModifier = {
    'dual_ma': { bias: 0.0003, volatility: 0.025 },
    'momentum': { bias: 0.0004, volatility: 0.035 },
    'mean_reversion': { bias: 0.0002, volatility: 0.02 },
    'grid': { bias: 0.0001, volatility: 0.015 },
    'rsi': { bias: 0.00025, volatility: 0.028 },
    'macd': { bias: 0.00035, volatility: 0.03 },
  }[strategy.type] || { bias: 0.0002, volatility: 0.025 }

  for (let i = 0; i < days; i++) {
    const dailyReturn = (Math.random() - 0.5 + typeModifier.bias) * typeModifier.volatility
    const benchmarkReturn = (Math.random() - 0.5) * 0.015

    strategyValue *= (1 + dailyReturn)
    benchmarkValue *= (1 + benchmarkReturn)

    // 记录回撤
    if (strategyValue > maxValue) maxValue = strategyValue
    const drawdown = (maxValue - strategyValue) / maxValue
    if (drawdown > maxDrawdown) maxDrawdown = drawdown

    // 记录胜负
    if (dailyReturn > 0) {
      wins++
      totalProfit += dailyReturn * 10000
    } else {
      losses++
      totalLoss += Math.abs(dailyReturn) * 10000
    }

    const currentDate = new Date(start)
    currentDate.setDate(currentDate.getDate() + i)

    data.push({
      day: i + 1,
      strategy: Math.round(strategyValue * 100) / 100,
      benchmark: Math.round(benchmarkValue * 100) / 100,
      date: `${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}`
    })
  }

  const totalReturn = ((strategyValue - 10000) / 10000) * 100
  const annualReturn = totalReturn * (252 / days)
  const volatility = typeModifier.volatility * Math.sqrt(252) * 100
  const sharpeRatio = annualReturn / volatility
  const winRate = (wins / (wins + losses)) * 100
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0

  return {
    totalReturn: Math.round(totalReturn * 100) / 100,
    annualReturn: Math.round(annualReturn * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 10000) / 100,
    winRate: Math.round(winRate * 100) / 100,
    totalTrades: Math.floor(days * 0.3),
    profitFactor: Math.round(profitFactor * 100) / 100,
    volatility: Math.round(volatility * 100) / 100,
    data
  }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

const STORAGE_KEY = 'quant_strategies'

// 加载策略
const loadStrategies = (): Strategy[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('加载策略失败:', e)
  }
  // 默认策略
  return [
    { id: 1, name: '双均线策略', type: 'dual_ma', status: 'active', params: { shortPeriod: 5, longPeriod: 20, stopLoss: 5, takeProfit: 10, positionSize: 100 }, createdAt: '2026-01-15' },
    { id: 2, name: '动量突破', type: 'momentum', status: 'active', params: { lookbackPeriod: 20, threshold: 2, stopLoss: 3, positionSize: 80 }, createdAt: '2026-01-20' },
    { id: 3, name: 'RSI超买超卖', type: 'rsi', status: 'paused', params: { lookbackPeriod: 14, threshold: 30, stopLoss: 5, positionSize: 60 }, createdAt: '2026-02-01' },
  ]
}

export default function StrategyBacktest() {
  const [strategies, setStrategies] = useState<Strategy[]>(loadStrategies)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // 回测参数
  const [backtestStartDate, setBacktestStartDate] = useState('2025-02-21')
  const [backtestEndDate, setBacktestEndDate] = useState('2026-02-21')

  // 新建/编辑策略表单
  const [formData, setFormData] = useState({
    name: '',
    type: 'dual_ma',
    shortPeriod: 5,
    longPeriod: 20,
    stopLoss: 5,
    takeProfit: 10,
    positionSize: 100,
    lookbackPeriod: 14,
    threshold: 2,
  })

  // 保存策略到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(strategies))
  }, [strategies])

  // 运行回测
  const handleRunBacktest = () => {
    if (!selectedStrategy) return

    setIsRunning(true)

    setTimeout(() => {
      const result = runBacktest(selectedStrategy, backtestStartDate, backtestEndDate)

      setStrategies(prev => prev.map(s =>
        s.id === selectedStrategy.id ? { ...s, results: result } : s
      ))
      setSelectedStrategy(prev => prev ? { ...prev, results: result } : null)
      setIsRunning(false)
    }, 1500)
  }

  // 运行全部回测
  const handleRunAllBacktest = () => {
    setIsRunning(true)

    setTimeout(() => {
      setStrategies(prev => prev.map(s => ({
        ...s,
        results: runBacktest(s, backtestStartDate, backtestEndDate)
      })))
      setIsRunning(false)
    }, 2000)
  }

  // 新建策略
  const handleCreateStrategy = () => {
    const newStrategy: Strategy = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      status: 'paused',
      params: {
        shortPeriod: formData.shortPeriod,
        longPeriod: formData.longPeriod,
        stopLoss: formData.stopLoss,
        takeProfit: formData.takeProfit,
        positionSize: formData.positionSize,
        lookbackPeriod: formData.lookbackPeriod,
        threshold: formData.threshold,
      },
      createdAt: '2026-02-21'
    }

    setStrategies(prev => [...prev, newStrategy])
    setShowNewModal(false)
    setFormData({ name: '', type: 'dual_ma', shortPeriod: 5, longPeriod: 20, stopLoss: 5, takeProfit: 10, positionSize: 100, lookbackPeriod: 14, threshold: 2 })
  }

  // 编辑策略
  const handleEditStrategy = () => {
    if (!selectedStrategy) return

    setStrategies(prev => prev.map(s =>
      s.id === selectedStrategy.id ? {
        ...s,
        name: formData.name,
        type: formData.type,
        params: {
          shortPeriod: formData.shortPeriod,
          longPeriod: formData.longPeriod,
          stopLoss: formData.stopLoss,
          takeProfit: formData.takeProfit,
          positionSize: formData.positionSize,
          lookbackPeriod: formData.lookbackPeriod,
          threshold: formData.threshold,
        }
      } : s
    ))
    setShowEditModal(false)
  }

  // 删除策略
  const handleDeleteStrategy = (id: number) => {
    setStrategies(prev => prev.filter(s => s.id !== id))
    if (selectedStrategy?.id === id) setSelectedStrategy(null)
  }

  // 切换策略状态
  const toggleStrategyStatus = (id: number) => {
    setStrategies(prev => prev.map(s =>
      s.id === id ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s
    ))
  }

  // 打开编辑弹窗
  const openEditModal = (strategy: Strategy) => {
    setFormData({
      name: strategy.name,
      type: strategy.type,
      shortPeriod: strategy.params.shortPeriod || 5,
      longPeriod: strategy.params.longPeriod || 20,
      stopLoss: strategy.params.stopLoss || 5,
      takeProfit: strategy.params.takeProfit || 10,
      positionSize: strategy.params.positionSize || 100,
      lookbackPeriod: strategy.params.lookbackPeriod || 14,
      threshold: strategy.params.threshold || 2,
    })
    setSelectedStrategy(strategy)
    setShowEditModal(true)
  }

  // 计算组合指标
  const portfolioMetrics = {
    totalReturn: strategies.reduce((sum, s) => sum + (s.results?.totalReturn || 0), 0) / Math.max(strategies.filter(s => s.results).length, 1),
    avgSharpe: strategies.reduce((sum, s) => sum + (s.results?.sharpeRatio || 0), 0) / Math.max(strategies.filter(s => s.results).length, 1),
    maxDrawdown: Math.max(...strategies.map(s => s.results?.maxDrawdown || 0)),
    activeCount: strategies.filter(s => s.status === 'active').length,
  }

  // 配置数据
  const allocationData = strategies.map(s => ({
    name: s.name,
    value: s.params.positionSize || 0
  }))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">策略回测</h1>
          <p className="text-sm text-gray-500 mt-1">创建、配置和回测量化交易策略</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建策略
          </button>
          <button
            onClick={handleRunAllBacktest}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isRunning ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isRunning ? '运行中...' : '运行全部回测'}
          </button>
        </div>
      </div>

      {/* 回测时间范围 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-700">回测时间范围:</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={backtestStartDate}
              max={backtestEndDate}
              onChange={(e) => setBacktestStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">至</span>
            <input
              type="date"
              value={backtestEndDate}
              min={backtestStartDate}
              max="2026-02-21"
              onChange={(e) => setBacktestEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-sm text-gray-500">（数据截止: 2026-02-21）</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <TrendingUp className="w-4 h-4" />
            组合平均收益
          </div>
          <div className={`text-2xl font-bold ${portfolioMetrics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolioMetrics.totalReturn >= 0 ? '+' : ''}{portfolioMetrics.totalReturn.toFixed(2)}%
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Settings className="w-4 h-4" />
            平均夏普比率
          </div>
          <div className="text-2xl font-bold text-blue-600">{portfolioMetrics.avgSharpe.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <AlertTriangle className="w-4 h-4" />
            最大回撤
          </div>
          <div className="text-2xl font-bold text-red-600">-{portfolioMetrics.maxDrawdown.toFixed(2)}%</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <CheckCircle className="w-4 h-4" />
            运行中策略
          </div>
          <div className="text-2xl font-bold text-gray-800">{portfolioMetrics.activeCount} / {strategies.length}</div>
        </div>
      </div>

      {/* Strategy List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">策略列表</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">策略名称</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">类型</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">状态</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">总收益</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">夏普比率</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">最大回撤</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">胜率</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {strategies.map((strategy) => (
                <tr
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy)}
                  className={`border-b border-gray-100 cursor-pointer transition-colors ${
                    selectedStrategy?.id === strategy.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-4 font-medium">{strategy.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {strategyTypes.find(t => t.value === strategy.type)?.label || strategy.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleStrategyStatus(strategy.id) }}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        strategy.status === 'active'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      {strategy.status === 'active' ? '运行中' : '已暂停'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    {strategy.results ? (
                      <span className={`font-medium ${strategy.results.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {strategy.results.totalReturn >= 0 ? '+' : ''}{strategy.results.totalReturn}%
                      </span>
                    ) : <span className="text-gray-400">未回测</span>}
                  </td>
                  <td className="py-3 px-4">{strategy.results?.sharpeRatio || '-'}</td>
                  <td className="py-3 px-4">
                    {strategy.results ? (
                      <span className="text-red-500">-{strategy.results.maxDrawdown}%</span>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4">{strategy.results?.winRate ? `${strategy.results.winRate}%` : '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(strategy) }}
                        className="text-blue-400 hover:text-blue-600 p-1"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleStrategyStatus(strategy.id) }}
                        className={`p-1 ${strategy.status === 'active' ? 'text-yellow-400 hover:text-yellow-600' : 'text-green-400 hover:text-green-600'}`}
                        title={strategy.status === 'active' ? '暂停' : '启动'}
                      >
                        {strategy.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteStrategy(strategy.id) }}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedStrategy ? `${selectedStrategy.name} 收益曲线` : '组合收益曲线'}
              </h2>
              {selectedStrategy?.results && (
                <p className="text-sm text-gray-500">
                  总交易: {selectedStrategy.results.totalTrades}次 | 盈亏比: {selectedStrategy.results.profitFactor}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {selectedStrategy && (
                <button
                  onClick={handleRunBacktest}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {isRunning ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  回测此策略
                </button>
              )}
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="w-4 h-4" />
                导出
              </button>
            </div>
          </div>
          <div className="h-80">
            {selectedStrategy?.results?.data ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedStrategy.results.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    stroke="#9ca3af"
                    interval={Math.floor(selectedStrategy.results.data.length / 8)}
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value: number) => [`¥${value.toFixed(2)}`, '']}
                  />
                  <Legend />
                  <ReferenceLine y={10000} stroke="#e5e7eb" strokeDasharray="3 3" label="初始资金" />
                  <Line type="monotone" dataKey="strategy" stroke="#3b82f6" strokeWidth={2} dot={false} name="策略净值" />
                  <Line type="monotone" dataKey="benchmark" stroke="#9ca3af" strokeWidth={2} dot={false} name="基准(沪深300)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>选择策略并运行回测查看收益曲线</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Allocation Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">策略仓位配置</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {allocationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, '仓位']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {allocationData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-gray-600 truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>

          {/* 选中策略详情 */}
          {selectedStrategy?.results && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="font-medium text-gray-700 mb-2">回测详情</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">年化收益</span>
                  <span className={selectedStrategy.results.annualReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {selectedStrategy.results.annualReturn}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">波动率</span>
                  <span>{selectedStrategy.results.volatility}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">胜率</span>
                  <span>{selectedStrategy.results.winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">盈亏比</span>
                  <span>{selectedStrategy.results.profitFactor}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 新建策略弹窗 */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">新建策略</h2>
              <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">策略名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入策略名称"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">策略类型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {strategyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {strategyTypes.find(t => t.value === formData.type)?.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(formData.type === 'dual_ma' || formData.type === 'macd') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">短期均线</label>
                      <input
                        type="number"
                        value={formData.shortPeriod}
                        onChange={(e) => setFormData({ ...formData, shortPeriod: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">长期均线</label>
                      <input
                        type="number"
                        value={formData.longPeriod}
                        onChange={(e) => setFormData({ ...formData, longPeriod: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {(formData.type === 'momentum' || formData.type === 'rsi' || formData.type === 'mean_reversion') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">回看周期</label>
                      <input
                        type="number"
                        value={formData.lookbackPeriod}
                        onChange={(e) => setFormData({ ...formData, lookbackPeriod: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">阈值</label>
                      <input
                        type="number"
                        value={formData.threshold}
                        onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">止损 (%)</label>
                  <input
                    type="number"
                    value={formData.stopLoss}
                    onChange={(e) => setFormData({ ...formData, stopLoss: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">止盈 (%)</label>
                  <input
                    type="number"
                    value={formData.takeProfit}
                    onChange={(e) => setFormData({ ...formData, takeProfit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">仓位比例 (%)</label>
                  <input
                    type="number"
                    value={formData.positionSize}
                    onChange={(e) => setFormData({ ...formData, positionSize: Number(e.target.value) })}
                    max={100}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateStrategy}
                  disabled={!formData.name}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  创建策略
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑策略弹窗 */}
      {showEditModal && selectedStrategy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">编辑策略</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">策略名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">策略类型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {strategyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">止损 (%)</label>
                  <input
                    type="number"
                    value={formData.stopLoss}
                    onChange={(e) => setFormData({ ...formData, stopLoss: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">止盈 (%)</label>
                  <input
                    type="number"
                    value={formData.takeProfit}
                    onChange={(e) => setFormData({ ...formData, takeProfit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">仓位比例 (%)</label>
                  <input
                    type="number"
                    value={formData.positionSize}
                    onChange={(e) => setFormData({ ...formData, positionSize: Number(e.target.value) })}
                    max={100}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleEditStrategy}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  保存修改
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
