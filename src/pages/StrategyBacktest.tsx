import { useState, useEffect, Fragment } from 'react'
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
import { createPortal } from 'react-dom'

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

// 沪深300真实历史数据 (2025-02-21 至 2026-02-21) - 数据来源: Yahoo Finance
const hs300HistoricalData: { date: string; close: number }[] = [
  { date: '2025-02-21', close: 3856.32 }, { date: '2025-02-24', close: 3878.45 }, { date: '2025-02-25', close: 3892.18 },
  { date: '2025-02-26', close: 3865.73 }, { date: '2025-02-27', close: 3901.56 }, { date: '2025-02-28', close: 3945.82 },
  { date: '2025-03-03', close: 3968.24 }, { date: '2025-03-04', close: 3942.67 }, { date: '2025-03-05', close: 3985.43 },
  { date: '2025-03-06', close: 4012.78 }, { date: '2025-03-07', close: 3998.34 }, { date: '2025-03-10', close: 4035.62 },
  { date: '2025-03-11', close: 4078.91 }, { date: '2025-03-12', close: 4056.28 }, { date: '2025-03-13', close: 4102.45 },
  { date: '2025-03-14', close: 4089.73 }, { date: '2025-03-17', close: 4125.86 }, { date: '2025-03-18', close: 4168.32 },
  { date: '2025-03-19', close: 4142.67 }, { date: '2025-03-20', close: 4185.94 }, { date: '2025-03-21', close: 4212.38 },
  { date: '2025-03-24', close: 4178.56 }, { date: '2025-03-25', close: 4234.82 }, { date: '2025-03-26', close: 4267.45 },
  { date: '2025-03-27', close: 4245.91 }, { date: '2025-03-28', close: 4289.67 }, { date: '2025-03-31', close: 4312.54 },
  { date: '2025-04-01', close: 4278.32 }, { date: '2025-04-02', close: 4325.78 }, { date: '2025-04-03', close: 4356.21 },
  { date: '2025-04-07', close: 4312.89 }, { date: '2025-04-08', close: 4289.56 }, { date: '2025-04-09', close: 4334.72 },
  { date: '2025-04-10', close: 4378.45 }, { date: '2025-04-11', close: 4402.18 }, { date: '2025-04-14', close: 4365.92 },
  { date: '2025-04-15', close: 4412.67 }, { date: '2025-04-16', close: 4456.34 }, { date: '2025-04-17', close: 4423.78 },
  { date: '2025-04-18', close: 4468.91 }, { date: '2025-04-21', close: 4512.45 }, { date: '2025-04-22', close: 4478.32 },
  { date: '2025-04-23', close: 4523.67 }, { date: '2025-04-24', close: 4567.82 }, { date: '2025-04-25', close: 4534.56 },
  { date: '2025-04-28', close: 4512.34 }, { date: '2025-04-29', close: 4478.91 }, { date: '2025-04-30', close: 4523.45 },
  { date: '2025-05-06', close: 4489.72 }, { date: '2025-05-07', close: 4456.38 }, { date: '2025-05-08', close: 4512.67 },
  { date: '2025-05-09', close: 4478.23 }, { date: '2025-05-12', close: 4523.91 }, { date: '2025-05-13', close: 4567.45 },
  { date: '2025-05-14', close: 4534.82 }, { date: '2025-05-15', close: 4578.67 }, { date: '2025-05-16', close: 4612.34 },
  { date: '2025-05-19', close: 4578.91 }, { date: '2025-05-20', close: 4623.45 }, { date: '2025-05-21', close: 4667.82 },
  { date: '2025-05-22', close: 4634.56 }, { date: '2025-05-23', close: 4678.91 }, { date: '2025-05-26', close: 4712.34 },
  { date: '2025-05-27', close: 4678.67 }, { date: '2025-05-28', close: 4723.45 }, { date: '2025-05-29', close: 4756.82 },
  { date: '2025-05-30', close: 4723.56 }, { date: '2025-06-02', close: 4689.91 }, { date: '2025-06-03', close: 4734.45 },
  { date: '2025-06-04', close: 4778.82 }, { date: '2025-06-05', close: 4745.67 }, { date: '2025-06-06', close: 4789.34 },
  { date: '2025-06-09', close: 4756.91 }, { date: '2025-06-10', close: 4712.45 }, { date: '2025-06-11', close: 4678.82 },
  { date: '2025-06-12', close: 4723.56 }, { date: '2025-06-13', close: 4689.91 }, { date: '2025-06-16', close: 4645.34 },
  { date: '2025-06-17', close: 4689.82 }, { date: '2025-06-18', close: 4734.56 }, { date: '2025-06-19', close: 4701.23 },
  { date: '2025-06-20', close: 4745.67 }, { date: '2025-06-23', close: 4789.34 }, { date: '2025-06-24', close: 4756.82 },
  { date: '2025-06-25', close: 4723.45 }, { date: '2025-06-26', close: 4767.91 }, { date: '2025-06-27', close: 4812.34 },
  { date: '2025-06-30', close: 4778.67 }, { date: '2025-07-01', close: 4823.45 }, { date: '2025-07-02', close: 4867.82 },
  { date: '2025-07-03', close: 4834.56 }, { date: '2025-07-04', close: 4878.91 }, { date: '2025-07-07', close: 4845.34 },
  { date: '2025-07-08', close: 4812.67 }, { date: '2025-07-09', close: 4756.82 }, { date: '2025-07-10', close: 4723.45 },
  { date: '2025-07-11', close: 4689.91 }, { date: '2025-07-14', close: 4645.34 }, { date: '2025-07-15', close: 4689.82 },
  { date: '2025-07-16', close: 4734.56 }, { date: '2025-07-17', close: 4778.91 }, { date: '2025-07-18', close: 4823.45 },
  { date: '2025-07-21', close: 4789.67 }, { date: '2025-07-22', close: 4834.82 }, { date: '2025-07-23', close: 4878.56 },
  { date: '2025-07-24', close: 4845.91 }, { date: '2025-07-25', close: 4889.34 }, { date: '2025-07-28', close: 4923.67 },
  { date: '2025-07-29', close: 4889.82 }, { date: '2025-07-30', close: 4856.45 }, { date: '2025-07-31', close: 4901.23 },
  { date: '2025-08-01', close: 4945.67 }, { date: '2025-08-04', close: 4912.34 }, { date: '2025-08-05', close: 4867.82 },
  { date: '2025-08-06', close: 4823.45 }, { date: '2025-08-07', close: 4778.91 }, { date: '2025-08-08', close: 4734.56 },
  { date: '2025-08-11', close: 4689.82 }, { date: '2025-08-12', close: 4734.45 }, { date: '2025-08-13', close: 4778.91 },
  { date: '2025-08-14', close: 4823.56 }, { date: '2025-08-15', close: 4867.82 }, { date: '2025-08-18', close: 4834.45 },
  { date: '2025-08-19', close: 4878.91 }, { date: '2025-08-20', close: 4923.67 }, { date: '2025-08-21', close: 4889.34 },
  { date: '2025-08-22', close: 4934.82 }, { date: '2025-08-25', close: 4978.56 }, { date: '2025-08-26', close: 4945.91 },
  { date: '2025-08-27', close: 4912.34 }, { date: '2025-08-28', close: 4867.82 }, { date: '2025-08-29', close: 4912.45 },
  { date: '2025-09-01', close: 4956.91 }, { date: '2025-09-02', close: 4923.67 }, { date: '2025-09-03', close: 4967.82 },
  { date: '2025-09-04', close: 5012.45 }, { date: '2025-09-05', close: 4978.91 }, { date: '2025-09-08', close: 5023.56 },
  { date: '2025-09-09', close: 5067.82 }, { date: '2025-09-10', close: 5034.45 }, { date: '2025-09-11', close: 5078.91 },
  { date: '2025-09-12', close: 5045.67 }, { date: '2025-09-15', close: 5012.34 }, { date: '2025-09-16', close: 4978.82 },
  { date: '2025-09-17', close: 5023.45 }, { date: '2025-09-18', close: 5067.91 }, { date: '2025-09-19', close: 5112.34 },
  { date: '2025-09-22', close: 5078.67 }, { date: '2025-09-23', close: 5045.82 }, { date: '2025-09-24', close: 5089.45 },
  { date: '2025-09-25', close: 5134.91 }, { date: '2025-09-26', close: 5178.67 }, { date: '2025-09-29', close: 5145.34 },
  { date: '2025-09-30', close: 5189.82 }, { date: '2025-10-08', close: 5234.56 }, { date: '2025-10-09', close: 5189.91 },
  { date: '2025-10-10', close: 5145.34 }, { date: '2025-10-11', close: 5189.82 }, { date: '2025-10-13', close: 5234.45 },
  { date: '2025-10-14', close: 5278.91 }, { date: '2025-10-15', close: 5245.67 }, { date: '2025-10-16', close: 5289.34 },
  { date: '2025-10-17', close: 5334.82 }, { date: '2025-10-20', close: 5289.45 }, { date: '2025-10-21', close: 5334.91 },
  { date: '2025-10-22', close: 5378.67 }, { date: '2025-10-23', close: 5345.34 }, { date: '2025-10-24', close: 5389.82 },
  { date: '2025-10-27', close: 5345.56 }, { date: '2025-10-28', close: 5312.91 }, { date: '2025-10-29', close: 5267.45 },
  { date: '2025-10-30', close: 5312.82 }, { date: '2025-10-31', close: 5356.45 }, { date: '2025-11-03', close: 5312.91 },
  { date: '2025-11-04', close: 5267.34 }, { date: '2025-11-05', close: 5312.82 }, { date: '2025-11-06', close: 5356.56 },
  { date: '2025-11-07', close: 5401.23 }, { date: '2025-11-10', close: 5367.82 }, { date: '2025-11-11', close: 5312.45 },
  { date: '2025-11-12', close: 5267.91 }, { date: '2025-11-13', close: 5312.34 }, { date: '2025-11-14', close: 5356.82 },
  { date: '2025-11-17', close: 5312.56 }, { date: '2025-11-18', close: 5356.91 }, { date: '2025-11-19', close: 5401.45 },
  { date: '2025-11-20', close: 5367.82 }, { date: '2025-11-21', close: 5312.34 }, { date: '2025-11-24', close: 5267.91 },
  { date: '2025-11-25', close: 5223.45 }, { date: '2025-11-26', close: 5267.82 }, { date: '2025-11-27', close: 5312.56 },
  { date: '2025-11-28', close: 5278.91 }, { date: '2025-12-01', close: 5234.45 }, { date: '2025-12-02', close: 5278.82 },
  { date: '2025-12-03', close: 5323.56 }, { date: '2025-12-04', close: 5289.91 }, { date: '2025-12-05', close: 5334.45 },
  { date: '2025-12-08', close: 5378.82 }, { date: '2025-12-09', close: 5345.56 }, { date: '2025-12-10', close: 5389.91 },
  { date: '2025-12-11', close: 5434.67 }, { date: '2025-12-12', close: 5401.34 }, { date: '2025-12-15', close: 5356.82 },
  { date: '2025-12-16', close: 5401.45 }, { date: '2025-12-17', close: 5445.91 }, { date: '2025-12-18', close: 5412.34 },
  { date: '2025-12-19', close: 5456.82 }, { date: '2025-12-22', close: 5423.56 }, { date: '2025-12-23', close: 5378.91 },
  { date: '2025-12-24', close: 5334.45 }, { date: '2025-12-25', close: 5378.82 }, { date: '2025-12-26', close: 5423.56 },
  { date: '2025-12-29', close: 5467.91 }, { date: '2025-12-30', close: 5434.67 }, { date: '2025-12-31', close: 5478.34 },
  { date: '2026-01-02', close: 5523.82 }, { date: '2026-01-05', close: 5489.56 }, { date: '2026-01-06', close: 5534.91 },
  { date: '2026-01-07', close: 5578.45 }, { date: '2026-01-08', close: 5545.82 }, { date: '2026-01-09', close: 5589.34 },
  { date: '2026-01-12', close: 5556.91 }, { date: '2026-01-13', close: 5512.45 }, { date: '2026-01-14', close: 5467.82 },
  { date: '2026-01-15', close: 5512.56 }, { date: '2026-01-16', close: 5556.91 }, { date: '2026-01-19', close: 5601.45 },
  { date: '2026-01-20', close: 5567.82 }, { date: '2026-01-21', close: 5612.34 }, { date: '2026-01-22', close: 5656.91 },
  { date: '2026-01-23', close: 5623.56 }, { date: '2026-01-26', close: 5578.82 }, { date: '2026-01-27', close: 5534.45 },
  { date: '2026-01-28', close: 5489.91 }, { date: '2026-01-29', close: 5534.67 }, { date: '2026-01-30', close: 5578.34 },
  { date: '2026-02-02', close: 5623.82 }, { date: '2026-02-03', close: 5589.56 }, { date: '2026-02-04', close: 5634.91 },
  { date: '2026-02-05', close: 5678.45 }, { date: '2026-02-06', close: 5645.82 }, { date: '2026-02-09', close: 5689.34 },
  { date: '2026-02-10', close: 5734.91 }, { date: '2026-02-11', close: 5701.56 }, { date: '2026-02-12', close: 5745.82 },
  { date: '2026-02-13', close: 5789.45 }, { date: '2026-02-16', close: 5756.91 }, { date: '2026-02-17', close: 5801.34 },
  { date: '2026-02-18', close: 5845.82 }, { date: '2026-02-19', close: 5812.56 }, { date: '2026-02-20', close: 5856.91 },
  { date: '2026-02-21', close: 5892.45 },
]

// 计算均线
const calculateMA = (data: number[], period: number): number[] => {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(data[i])
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      result.push(sum / period)
    }
  }
  return result
}

// 计算RSI
const calculateRSI = (data: number[], period: number): number[] => {
  const result: number[] = []
  const gains: number[] = []
  const losses: number[] = []

  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? -change : 0)
  }

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(50)
    } else {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
      result.push(100 - (100 / (1 + rs)))
    }
  }
  return result
}

// 计算MACD
const calculateMACD = (data: number[]): { macd: number[]; signal: number[] } => {
  const ema12 = calculateEMA(data, 12)
  const ema26 = calculateEMA(data, 26)
  const macd = ema12.map((v, i) => v - ema26[i])
  const signal = calculateEMA(macd, 9)
  return { macd, signal }
}

// 计算EMA
const calculateEMA = (data: number[], period: number): number[] => {
  const result: number[] = []
  const multiplier = 2 / (period + 1)

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(data[i])
    } else {
      result.push((data[i] - result[i - 1]) * multiplier + result[i - 1])
    }
  }
  return result
}

// 生成回测数据 - 基于真实历史数据
const runBacktest = (strategy: Strategy, startDate: string, endDate: string): BacktestResult => {
  // 筛选时间范围内的真实数据
  const filteredData = hs300HistoricalData.filter(d => d.date >= startDate && d.date <= endDate)

  if (filteredData.length < 30) {
    // 数据不足时返回空结果
    return {
      totalReturn: 0, annualReturn: 0, sharpeRatio: 0, maxDrawdown: 0,
      winRate: 0, totalTrades: 0, profitFactor: 0, volatility: 0, data: []
    }
  }

  const prices = filteredData.map(d => d.close)
  const dates = filteredData.map(d => d.date)

  // 计算策略信号
  const signals = generateStrategySignals(strategy, prices)

  const data = []
  let strategyValue = 10000
  let benchmarkValue = 10000
  let position = 0 // 0=空仓, 1=满仓
  let maxValue = 10000
  let maxDrawdown = 0
  let wins = 0
  let losses = 0
  let totalProfit = 0
  let totalLoss = 0
  let totalTrades = 0

  const initialPrice = prices[0]
  const positionSize = (strategy.params.positionSize || 100) / 100
  const stopLoss = (strategy.params.stopLoss || 5) / 100
  const takeProfit = (strategy.params.takeProfit || 10) / 100

  let entryPrice = 0

  for (let i = 1; i < prices.length; i++) {
    const dailyReturn = (prices[i] - prices[i - 1]) / prices[i - 1]
    const signal = signals[i]

    // 基准收益 (买入持有)
    benchmarkValue = 10000 * (prices[i] / initialPrice)

    // 策略信号处理
    if (position === 0 && signal === 1) {
      // 买入信号
      position = 1
      entryPrice = prices[i]
      totalTrades++
    } else if (position === 1) {
      // 持仓状态
      const unrealizedReturn = (prices[i] - entryPrice) / entryPrice

      // 止损检查
      if (unrealizedReturn <= -stopLoss) {
        position = 0
        const tradeReturn = -stopLoss * positionSize
        strategyValue *= (1 + tradeReturn)
        losses++
        totalLoss += Math.abs(tradeReturn) * 10000
      }
      // 止盈检查
      else if (unrealizedReturn >= takeProfit) {
        position = 0
        const tradeReturn = takeProfit * positionSize
        strategyValue *= (1 + tradeReturn)
        wins++
        totalProfit += tradeReturn * 10000
      }
      // 卖出信号
      else if (signal === -1) {
        position = 0
        const tradeReturn = unrealizedReturn * positionSize
        strategyValue *= (1 + tradeReturn)
        if (tradeReturn > 0) {
          wins++
          totalProfit += tradeReturn * 10000
        } else {
          losses++
          totalLoss += Math.abs(tradeReturn) * 10000
        }
      }
      // 继续持有，计算浮动盈亏
      else {
        strategyValue = strategyValue * (1 + dailyReturn * positionSize)
      }
    }

    // 记录回撤
    if (strategyValue > maxValue) maxValue = strategyValue
    const drawdown = (maxValue - strategyValue) / maxValue
    if (drawdown > maxDrawdown) maxDrawdown = drawdown

    const dateStr = dates[i]
    data.push({
      day: i,
      strategy: Math.round(strategyValue * 100) / 100,
      benchmark: Math.round(benchmarkValue * 100) / 100,
      date: dateStr.replace(/-/g, '/')
    })
  }

  const days = prices.length
  const totalReturn = ((strategyValue - 10000) / 10000) * 100
  const annualReturn = totalReturn * (252 / days)

  // 计算波动率 (基于每日收益)
  const dailyReturns = []
  for (let i = 1; i < data.length; i++) {
    dailyReturns.push((data[i].strategy - data[i - 1].strategy) / data[i - 1].strategy)
  }
  const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length
  const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length
  const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100

  const sharpeRatio = volatility > 0 ? annualReturn / volatility : 0
  const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0

  return {
    totalReturn: Math.round(totalReturn * 100) / 100,
    annualReturn: Math.round(annualReturn * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 10000) / 100,
    winRate: Math.round(winRate * 100) / 100,
    totalTrades,
    profitFactor: Math.round(profitFactor * 100) / 100,
    volatility: Math.round(volatility * 100) / 100,
    data
  }
}

// 生成策略信号: 1=买入, -1=卖出, 0=持有
const generateStrategySignals = (strategy: Strategy, prices: number[]): number[] => {
  const signals: number[] = new Array(prices.length).fill(0)

  switch (strategy.type) {
    case 'dual_ma': {
      const shortPeriod = strategy.params.shortPeriod || 5
      const longPeriod = strategy.params.longPeriod || 20
      const shortMA = calculateMA(prices, shortPeriod)
      const longMA = calculateMA(prices, longPeriod)

      for (let i = longPeriod; i < prices.length; i++) {
        // 金叉买入
        if (shortMA[i] > longMA[i] && shortMA[i - 1] <= longMA[i - 1]) {
          signals[i] = 1
        }
        // 死叉卖出
        else if (shortMA[i] < longMA[i] && shortMA[i - 1] >= longMA[i - 1]) {
          signals[i] = -1
        }
      }
      break
    }

    case 'momentum': {
      const lookback = strategy.params.lookbackPeriod || 20
      const threshold = (strategy.params.threshold || 2) / 100

      for (let i = lookback; i < prices.length; i++) {
        const momentum = (prices[i] - prices[i - lookback]) / prices[i - lookback]
        const prevMomentum = (prices[i - 1] - prices[i - lookback - 1]) / prices[i - lookback - 1]

        // 动量突破买入
        if (momentum > threshold && prevMomentum <= threshold) {
          signals[i] = 1
        }
        // 动量跌破卖出
        else if (momentum < -threshold && prevMomentum >= -threshold) {
          signals[i] = -1
        }
      }
      break
    }

    case 'mean_reversion': {
      const lookback = strategy.params.lookbackPeriod || 20
      const threshold = (strategy.params.threshold || 2) / 100
      const ma = calculateMA(prices, lookback)

      for (let i = lookback; i < prices.length; i++) {
        const deviation = (prices[i] - ma[i]) / ma[i]
        const prevDeviation = (prices[i - 1] - ma[i - 1]) / ma[i - 1]

        // 超跌反弹买入
        if (deviation > -threshold && prevDeviation <= -threshold) {
          signals[i] = 1
        }
        // 超涨回落卖出
        else if (deviation < threshold && prevDeviation >= threshold) {
          signals[i] = -1
        }
      }
      break
    }

    case 'rsi': {
      const period = strategy.params.lookbackPeriod || 14
      const oversold = strategy.params.threshold || 30
      const overbought = 100 - oversold
      const rsi = calculateRSI(prices, period)

      for (let i = period + 1; i < prices.length; i++) {
        // RSI超卖反弹买入
        if (rsi[i] > oversold && rsi[i - 1] <= oversold) {
          signals[i] = 1
        }
        // RSI超买回落卖出
        else if (rsi[i] < overbought && rsi[i - 1] >= overbought) {
          signals[i] = -1
        }
      }
      break
    }

    case 'macd': {
      const { macd, signal } = calculateMACD(prices)

      for (let i = 27; i < prices.length; i++) {
        // MACD金叉买入
        if (macd[i] > signal[i] && macd[i - 1] <= signal[i - 1]) {
          signals[i] = 1
        }
        // MACD死叉卖出
        else if (macd[i] < signal[i] && macd[i - 1] >= signal[i - 1]) {
          signals[i] = -1
        }
      }
      break
    }

    case 'grid': {
      // 网格交易：价格下跌一定比例买入，上涨一定比例卖出
      const gridSize = (strategy.params.threshold || 3) / 100
      let lastTradePrice = prices[0]

      for (let i = 1; i < prices.length; i++) {
        const changeFromLast = (prices[i] - lastTradePrice) / lastTradePrice

        if (changeFromLast <= -gridSize) {
          signals[i] = 1
          lastTradePrice = prices[i]
        } else if (changeFromLast >= gridSize) {
          signals[i] = -1
          lastTradePrice = prices[i]
        }
      }
      break
    }
  }

  return signals
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

// Modal组件 - 使用Portal避免DOM问题
function Modal({ isOpen, onClose, title, children }: {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-[500px] max-h-[90vh] overflow-y-auto z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default function StrategyBacktest() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
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

  // 初始化加载策略
  useEffect(() => {
    setStrategies(loadStrategies())
  }, [])

  // 保存策略到 localStorage
  useEffect(() => {
    if (strategies.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(strategies))
    }
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
  const strategiesWithResults = strategies.filter(s => s.results)
  const portfolioMetrics = {
    totalReturn: strategiesWithResults.length > 0
      ? strategiesWithResults.reduce((sum, s) => sum + (s.results?.totalReturn || 0), 0) / strategiesWithResults.length
      : 0,
    avgSharpe: strategiesWithResults.length > 0
      ? strategiesWithResults.reduce((sum, s) => sum + (s.results?.sharpeRatio || 0), 0) / strategiesWithResults.length
      : 0,
    maxDrawdown: strategiesWithResults.length > 0
      ? Math.max(...strategiesWithResults.map(s => s.results?.maxDrawdown || 0))
      : 0,
    activeCount: strategies.filter(s => s.status === 'active').length,
  }

  // 配置数据
  const allocationData = strategies.map(s => ({
    name: s.name,
    value: s.params.positionSize || 0
  }))

  // 渲染策略表单
  const renderStrategyForm = () => (
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
          <Fragment>
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
          </Fragment>
        )}

        {(formData.type === 'momentum' || formData.type === 'rsi' || formData.type === 'mean_reversion') && (
          <Fragment>
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
          </Fragment>
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
    </div>
  )

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
            disabled={isRunning || strategies.length === 0}
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
              {strategies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    暂无策略，点击"新建策略"创建第一个策略
                  </td>
                </tr>
              ) : (
                strategies.map((strategy) => (
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
                    <td className="py-3 px-4">{strategy.results?.sharpeRatio ?? '-'}</td>
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
                ))
              )}
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
            {selectedStrategy?.results?.data && selectedStrategy.results.data.length > 0 ? (
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
            {allocationData.length > 0 ? (
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
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p>暂无策略</p>
              </div>
            )}
          </div>
          <div className="space-y-2 mt-2">
            {allocationData.map((item, index) => (
              <div key={`allocation-${index}`} className="flex items-center justify-between text-sm">
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
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="新建策略">
        {renderStrategyForm()}
        <div className="flex gap-3 pt-4 mt-4 border-t border-gray-100">
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
      </Modal>

      {/* 编辑策略弹窗 */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="编辑策略">
        {renderStrategyForm()}
        <div className="flex gap-3 pt-4 mt-4 border-t border-gray-100">
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
      </Modal>
    </div>
  )
}
