import { useState, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Play, RotateCcw, Download, Calendar, AlertCircle, CheckCircle } from 'lucide-react'

// 股票数据库 - 模拟历史价格数据
const stockPriceDatabase: Record<string, { name: string; basePrice: number; volatility: number }> = {
  '600519': { name: '贵州茅台', basePrice: 1680, volatility: 0.02 },
  '300750': { name: '宁德时代', basePrice: 180, volatility: 0.035 },
  '002594': { name: '比亚迪', basePrice: 280, volatility: 0.03 },
  '688256': { name: '寒武纪', basePrice: 380, volatility: 0.05 },
  '002230': { name: '科大讯飞', basePrice: 48, volatility: 0.04 },
  '688981': { name: '中芯国际', basePrice: 75, volatility: 0.04 },
  '601318': { name: '中国平安', basePrice: 42, volatility: 0.02 },
  '600036': { name: '招商银行', basePrice: 32, volatility: 0.02 },
  '000858': { name: '五粮液', basePrice: 145, volatility: 0.025 },
  '300059': { name: '东方财富', basePrice: 16, volatility: 0.04 },
  '518880': { name: '黄金ETF', basePrice: 5.8, volatility: 0.015 },
  '510300': { name: '沪深300ETF', basePrice: 4.0, volatility: 0.02 },
  '512480': { name: '半导体ETF', basePrice: 1.4, volatility: 0.045 },
}

interface TradeRecord {
  date: string
  action: '买入' | '卖出'
  price: number
  quantity: number
  amount: number
  profit: number | null
  reason: string
}

interface BacktestResult {
  curveData: Array<{ date: string; strategy: number; benchmark: number; drawdown: number }>
  metrics: {
    totalReturn: number
    annualReturn: number
    sharpeRatio: number
    maxDrawdown: number
    winRate: number
    profitLossRatio: number
    tradeCount: number
    volatility: number
  }
  trades: TradeRecord[]
  stockName: string
}

// 生成模拟股价数据
const generatePriceData = (
  basePrice: number,
  volatility: number,
  startDate: Date,
  endDate: Date
): Array<{ date: string; close: number; ma5: number; ma10: number; ma20: number }> => {
  const data: Array<{ date: string; close: number; ma5: number; ma10: number; ma20: number }> = []
  let currentPrice = basePrice
  const prices: number[] = []

  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    // 跳过周末
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // 随机波动 + 轻微上涨趋势
      const trend = 0.0002 // 轻微上涨趋势
      const random = (Math.random() - 0.5) * 2 * volatility
      currentPrice *= (1 + random + trend)
      currentPrice = Math.max(currentPrice, basePrice * 0.5)

      prices.push(currentPrice)

      // 计算均线
      const ma5 = prices.slice(-5).reduce((a, b) => a + b, 0) / Math.min(prices.length, 5)
      const ma10 = prices.slice(-10).reduce((a, b) => a + b, 0) / Math.min(prices.length, 10)
      const ma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / Math.min(prices.length, 20)

      data.push({
        date: currentDate.toISOString().split('T')[0],
        close: Math.round(currentPrice * 100) / 100,
        ma5: Math.round(ma5 * 100) / 100,
        ma10: Math.round(ma10 * 100) / 100,
        ma20: Math.round(ma20 * 100) / 100,
      })
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return data
}

// 双均线策略回测
const runBacktest = (
  priceData: Array<{ date: string; close: number; ma5: number; ma10: number; ma20: number }>,
  initialCapital: number,
  stockName: string
): BacktestResult => {
  let cash = initialCapital
  let shares = 0
  let position = false
  let buyPrice = 0
  let buyDate = ''

  const trades: TradeRecord[] = []
  const curveData: Array<{ date: string; strategy: number; benchmark: number; drawdown: number }> = []

  let maxValue = initialCapital
  let wins = 0
  let losses = 0
  let totalProfit = 0
  let totalLoss = 0
  const dailyReturns: number[] = []
  let prevValue = initialCapital

  const benchmarkStartPrice = priceData[0]?.close || 1

  for (let i = 20; i < priceData.length; i++) {
    const today = priceData[i]
    const yesterday = priceData[i - 1]

    // 计算当前资产总值
    const portfolioValue = cash + shares * today.close

    // 记录收益率
    const dailyReturn = (portfolioValue - prevValue) / prevValue
    dailyReturns.push(dailyReturn)
    prevValue = portfolioValue

    // 计算最大回撤
    maxValue = Math.max(maxValue, portfolioValue)
    const drawdown = (portfolioValue - maxValue) / maxValue * 100

    // 基准收益（买入持有）
    const benchmarkValue = initialCapital * (today.close / benchmarkStartPrice)

    curveData.push({
      date: today.date,
      strategy: Math.round(portfolioValue * 100) / 100,
      benchmark: Math.round(benchmarkValue * 100) / 100,
      drawdown: Math.round(drawdown * 100) / 100,
    })

    // 交易信号
    const prevMa5AboveMa20 = yesterday.ma5 > yesterday.ma20
    const currMa5AboveMa20 = today.ma5 > today.ma20

    // 金叉买入
    if (!prevMa5AboveMa20 && currMa5AboveMa20 && !position && cash > 0) {
      const maxShares = Math.floor(cash / today.close / 100) * 100 // 按手买入
      if (maxShares >= 100) {
        shares = maxShares
        const amount = shares * today.close
        cash -= amount
        position = true
        buyPrice = today.close
        buyDate = today.date

        trades.push({
          date: today.date,
          action: '买入',
          price: today.close,
          quantity: shares,
          amount: Math.round(amount * 100) / 100,
          profit: null,
          reason: 'MA5上穿MA20金叉',
        })
      }
    }

    // 死叉卖出
    if (prevMa5AboveMa20 && !currMa5AboveMa20 && position && shares > 0) {
      const amount = shares * today.close
      cash += amount
      const profit = (today.close - buyPrice) * shares

      if (profit > 0) {
        wins++
        totalProfit += profit
      } else {
        losses++
        totalLoss += Math.abs(profit)
      }

      trades.push({
        date: today.date,
        action: '卖出',
        price: today.close,
        quantity: shares,
        amount: Math.round(amount * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        reason: 'MA5下穿MA20死叉',
      })

      shares = 0
      position = false
    }
  }

  // 计算指标
  const finalValue = cash + shares * (priceData[priceData.length - 1]?.close || 0)
  const totalReturn = (finalValue - initialCapital) / initialCapital * 100
  const tradingDays = curveData.length
  const annualReturn = ((finalValue / initialCapital) ** (252 / tradingDays) - 1) * 100

  // 波动率
  const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length
  const variance = dailyReturns.reduce((a, b) => a + (b - avgReturn) ** 2, 0) / dailyReturns.length
  const dailyVolatility = Math.sqrt(variance)
  const annualVolatility = dailyVolatility * Math.sqrt(252) * 100

  // 夏普比率 (假设无风险利率2%)
  const riskFreeRate = 0.02
  const sharpeRatio = (annualReturn / 100 - riskFreeRate) / (annualVolatility / 100)

  // 最大回撤
  const maxDrawdown = Math.min(...curveData.map(d => d.drawdown))

  // 胜率和盈亏比
  const winRate = trades.filter(t => t.action === '卖出').length > 0
    ? wins / (wins + losses) * 100
    : 0
  const profitLossRatio = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0

  return {
    curveData,
    metrics: {
      totalReturn: Math.round(totalReturn * 100) / 100,
      annualReturn: Math.round(annualReturn * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      winRate: Math.round(winRate * 100) / 100,
      profitLossRatio: Math.round(profitLossRatio * 100) / 100,
      tradeCount: trades.length,
      volatility: Math.round(annualVolatility * 100) / 100,
    },
    trades,
    stockName,
  }
}

export default function StockBacktest() {
  const [stockCode, setStockCode] = useState('600519')
  const [startDate, setStartDate] = useState('2025-01-01')
  const [endDate, setEndDate] = useState('2026-02-18')
  const [initialCapital, setInitialCapital] = useState(100000)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [error, setError] = useState('')

  const handleRunBacktest = useCallback(() => {
    setError('')
    setIsRunning(true)

    // 验证输入
    const stock = stockPriceDatabase[stockCode]
    if (!stock) {
      setError(`未找到股票: ${stockCode}。支持的代码: ${Object.keys(stockPriceDatabase).join(', ')}`)
      setIsRunning(false)
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      setError('开始日期必须早于结束日期')
      setIsRunning(false)
      return
    }

    if (initialCapital < 10000) {
      setError('初始资金不能少于10000元')
      setIsRunning(false)
      return
    }

    // 模拟异步计算
    setTimeout(() => {
      try {
        // 生成价格数据
        const priceData = generatePriceData(stock.basePrice, stock.volatility, start, end)

        if (priceData.length < 30) {
          setError('回测周期太短，至少需要30个交易日')
          setIsRunning(false)
          return
        }

        // 运行回测
        const backtestResult = runBacktest(priceData, initialCapital, stock.name)
        setResult(backtestResult)
        setIsRunning(false)
      } catch (err) {
        setError('回测计算出错，请重试')
        setIsRunning(false)
      }
    }, 1500)
  }, [stockCode, startDate, endDate, initialCapital])

  const handleReset = () => {
    setResult(null)
    setError('')
    setStockCode('600519')
    setStartDate('2025-01-01')
    setEndDate('2026-02-18')
    setInitialCapital(100000)
  }

  const metricsDisplay = result ? [
    { label: '总收益率', value: `${result.metrics.totalReturn}%`, color: result.metrics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600' },
    { label: '年化收益率', value: `${result.metrics.annualReturn}%`, color: result.metrics.annualReturn >= 0 ? 'text-green-600' : 'text-red-600' },
    { label: '夏普比率', value: result.metrics.sharpeRatio.toFixed(2), color: 'text-blue-600' },
    { label: '最大回撤', value: `${result.metrics.maxDrawdown}%`, color: 'text-red-600' },
    { label: '胜率', value: `${result.metrics.winRate}%`, color: 'text-purple-600' },
    { label: '盈亏比', value: result.metrics.profitLossRatio === Infinity ? '∞' : result.metrics.profitLossRatio.toFixed(2), color: 'text-orange-600' },
  ] : []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">单股回测</h1>
        <div className="text-sm text-gray-500">
          策略: 双均线交叉 (MA5/MA20)
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">回测配置</h2>
        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">股票代码</label>
            <input
              type="text"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="如 600519"
            />
            <p className="text-xs text-gray-400 mt-1">
              {stockPriceDatabase[stockCode]?.name || '输入代码查询'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">开始日期</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">结束日期</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">初始资金 (元)</label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={10000}
              step={10000}
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleRunBacktest}
              disabled={isRunning}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isRunning ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isRunning ? '计算中...' : '开始回测'}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              title="重置"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 支持的股票列表 */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">支持的股票/ETF:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stockPriceDatabase).map(([code, info]) => (
              <button
                key={code}
                onClick={() => setStockCode(code)}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  stockCode === code
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {code} {info.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Success Message */}
      {result && !error && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          回测完成！股票: {result.stockName}，共 {result.curveData.length} 个交易日，{result.metrics.tradeCount} 笔交易
        </div>
      )}

      {/* Results Section */}
      {result && (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-6 gap-4">
            {metricsDisplay.map((metric) => (
              <div
                key={metric.label}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="text-sm text-gray-500 mb-1">{metric.label}</div>
                <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
              </div>
            ))}
          </div>

          {/* Backtest Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">收益曲线 - {result.stockName}</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">策略收益</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-sm text-gray-600">基准收益(买入持有)</span>
                </div>
                <button className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Download className="w-4 h-4" />
                  导出报告
                </button>
              </div>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.curveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    stroke="#9ca3af"
                    tickFormatter={(value) => value.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [
                      `¥${value.toLocaleString()}`,
                      name === 'strategy' ? '策略' : name === 'benchmark' ? '基准' : '回撤'
                    ]}
                    labelFormatter={(label) => `日期: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="strategy"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="strategy"
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmark"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    dot={false}
                    name="benchmark"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trade Records */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              交易记录 ({result.trades.length} 笔)
            </h2>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">日期</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">操作</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">价格</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">数量</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">金额</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">收益</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">信号原因</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        该周期内无交易信号
                      </td>
                    </tr>
                  ) : (
                    result.trades.map((record, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{record.date}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              record.action === '买入'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-green-100 text-green-600'
                            }`}
                          >
                            {record.action}
                          </span>
                        </td>
                        <td className="py-3 px-4">¥{record.price.toFixed(2)}</td>
                        <td className="py-3 px-4">{record.quantity}</td>
                        <td className="py-3 px-4">¥{record.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          {record.profit !== null ? (
                            <span className={record.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {record.profit >= 0 ? '+' : ''}¥{record.profit.toLocaleString()}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{record.reason}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategy Description */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">策略说明</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>买入信号</strong>: 5日均线上穿20日均线 (金叉)</li>
              <li>• <strong>卖出信号</strong>: 5日均线下穿20日均线 (死叉)</li>
              <li>• <strong>仓位管理</strong>: 每次满仓买入，按手数取整 (100股/手)</li>
              <li>• <strong>注意</strong>: 本回测使用模拟历史数据，仅供学习参考，不构成投资建议</li>
            </ul>
          </div>
        </>
      )}

      {/* Empty State */}
      {!result && !error && !isRunning && (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Play className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">开始你的第一次回测</h3>
          <p className="text-gray-500">选择股票代码、设置回测周期和初始资金，点击"开始回测"查看结果</p>
        </div>
      )}
    </div>
  )
}
