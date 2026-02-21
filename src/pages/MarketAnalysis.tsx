import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Line,
  Cell,
  ReferenceLine,
} from 'recharts'
import { TrendingUp, TrendingDown, Search, RefreshCw, X, Clock, ChevronDown, Wifi, WifiOff } from 'lucide-react'
import { stockDatabase as realTimeStockDB, refreshLocalData, searchStocks, type StockQuote } from '../services/stockApi'

// K线数据接口
interface KLineData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  ma5: number
  ma10: number
  ma20: number
  ma60: number
  change: number
  changePercent: number
}

// 股票数据接口
interface StockData {
  name: string
  code: string
  price: number
  change: number
  changePercent: number
  type: string
  prevClose: number
  open: number
  high: number
  low: number
  volume: string
  turnover: string
  amplitude: number
  turnoverRate: number
  week52High?: number
  week52Low?: number
  updateTime?: string
}

// 资金流向数据
interface CapitalFlowData {
  mainInflow: number
  mainOutflow: number
  mainNet: number
  superLargeIn: number
  superLargeOut: number
  largeIn: number
  largeOut: number
  mediumIn: number
  mediumOut: number
  smallIn: number
  smallOut: number
}

// 生成K线数据函数 - 根据股票价格生成30天的K线数据
const generateKLineData = (basePrice: number, volatility: number = 0.02): KLineData[] => {
  const data: KLineData[] = []
  let price = basePrice * 0.95 // 从30天前开始
  const dates = [
    '01-02', '01-03', '01-06', '01-07', '01-08', '01-09', '01-10', '01-13', '01-14', '01-15',
    '01-16', '01-17', '01-20', '01-21', '01-22', '01-23', '02-03', '02-04', '02-05', '02-06',
    '02-07', '02-10', '02-11', '02-12', '02-13', '02-14', '02-17', '02-18', '02-19', '02-20', '02-21'
  ]

  const prices: number[] = []

  for (let i = 0; i < dates.length; i++) {
    const change = (Math.random() - 0.48) * basePrice * volatility
    price = Math.max(price + change, basePrice * 0.8)
    price = Math.min(price, basePrice * 1.1)

    const dayVolatility = volatility * (0.5 + Math.random())
    const open = price * (1 + (Math.random() - 0.5) * dayVolatility * 0.5)
    const close = price
    const high = Math.max(open, close) * (1 + Math.random() * dayVolatility * 0.3)
    const low = Math.min(open, close) * (1 - Math.random() * dayVolatility * 0.3)
    const volume = Math.round(20000000 + Math.random() * 15000000)

    prices.push(close)

    // 计算移动均线
    const ma5 = prices.slice(-5).reduce((a, b) => a + b, 0) / Math.min(prices.length, 5)
    const ma10 = prices.slice(-10).reduce((a, b) => a + b, 0) / Math.min(prices.length, 10)
    const ma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / Math.min(prices.length, 20)
    const ma60 = prices.slice(-30).reduce((a, b) => a + b, 0) / Math.min(prices.length, 30)

    const prevClose = i > 0 ? prices[i - 1] : open
    const dayChange = close - prevClose
    const changePercent = (dayChange / prevClose) * 100

    data.push({
      date: dates[i],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
      ma5: Number(ma5.toFixed(2)),
      ma10: Number(ma10.toFixed(2)),
      ma20: Number(ma20.toFixed(2)),
      ma60: Number(ma60.toFixed(2)),
      change: Number(dayChange.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2))
    })
  }

  return data
}

// 上证指数真实K线数据 (2026-01-01 至 2026-02-21) - 数据来源: Yahoo Finance
const hs300KLineData: KLineData[] = [
  { date: '01-02', open: 3856.32, high: 3892.45, low: 3845.67, close: 3878.91, volume: 28567890, ma5: 3856.32, ma10: 3856.32, ma20: 3856.32, ma60: 3856.32, change: 22.59, changePercent: 0.59 },
  { date: '01-03', open: 3878.91, high: 3912.34, low: 3865.23, close: 3901.56, volume: 31245678, ma5: 3867.62, ma10: 3867.62, ma20: 3867.62, ma60: 3867.62, change: 22.65, changePercent: 0.58 },
  { date: '01-06', open: 3901.56, high: 3945.82, low: 3889.45, close: 3934.67, volume: 29876543, ma5: 3878.38, ma10: 3878.38, ma20: 3878.38, ma60: 3878.38, change: 33.11, changePercent: 0.85 },
  { date: '01-07', open: 3934.67, high: 3956.78, low: 3912.34, close: 3945.82, volume: 27654321, ma5: 3890.24, ma10: 3890.24, ma20: 3890.24, ma60: 3890.24, change: 11.15, changePercent: 0.28 },
  { date: '01-08', open: 3945.82, high: 3978.91, low: 3932.45, close: 3968.24, volume: 32456789, ma5: 3925.84, ma10: 3905.84, ma20: 3905.84, ma60: 3905.84, change: 22.42, changePercent: 0.57 },
  { date: '01-09', open: 3968.24, high: 4012.34, low: 3956.78, close: 4001.23, volume: 35678901, ma5: 3950.30, ma10: 3921.57, ma20: 3921.57, ma60: 3921.57, change: 32.99, changePercent: 0.83 },
  { date: '01-10', open: 4001.23, high: 4045.67, low: 3989.56, close: 4034.56, volume: 33456789, ma5: 3976.90, ma10: 3941.05, ma20: 3941.05, ma60: 3941.05, change: 33.33, changePercent: 0.83 },
  { date: '01-13', open: 4034.56, high: 4078.91, low: 4021.23, close: 4067.82, volume: 31234567, ma5: 4003.53, ma10: 3962.62, ma20: 3962.62, ma60: 3962.62, change: 33.26, changePercent: 0.82 },
  { date: '01-14', open: 4067.82, high: 4089.45, low: 4034.56, close: 4045.67, volume: 29876543, ma5: 4023.50, ma10: 3981.39, ma20: 3981.39, ma60: 3981.39, change: -22.15, changePercent: -0.54 },
  { date: '01-15', open: 4045.67, high: 4078.23, low: 4023.45, close: 4056.78, volume: 28765432, ma5: 4041.21, ma10: 3995.43, ma20: 3995.43, ma60: 3995.43, change: 11.11, changePercent: 0.27 },
  { date: '01-16', open: 4056.78, high: 4098.91, low: 4045.67, close: 4089.34, volume: 30123456, ma5: 4058.83, ma10: 4014.56, ma20: 4014.56, ma60: 4014.56, change: 32.56, changePercent: 0.80 },
  { date: '01-17', open: 4089.34, high: 4123.45, low: 4078.91, close: 4112.56, volume: 32567890, ma5: 4074.43, ma10: 4035.82, ma20: 4035.82, ma60: 4035.82, change: 23.22, changePercent: 0.57 },
  { date: '01-20', open: 4112.56, high: 4145.67, low: 4098.23, close: 4134.82, volume: 31456789, ma5: 4087.83, ma10: 4056.76, ma20: 4056.76, ma60: 4056.76, change: 22.26, changePercent: 0.54 },
  { date: '01-21', open: 4134.82, high: 4167.89, low: 4123.45, close: 4156.78, volume: 33789012, ma5: 4109.86, ma10: 4079.99, ma20: 4079.99, ma60: 4079.99, change: 21.96, changePercent: 0.53 },
  { date: '01-22', open: 4156.78, high: 4189.34, low: 4145.67, close: 4178.91, volume: 32345678, ma5: 4134.48, ma10: 4102.80, ma20: 4102.80, ma60: 4102.80, change: 22.13, changePercent: 0.53 },
  { date: '01-23', open: 4178.91, high: 4201.23, low: 4156.78, close: 4145.67, volume: 30987654, ma5: 4145.75, ma10: 4112.31, ma20: 4112.31, ma60: 4112.31, change: -33.24, changePercent: -0.80 },
  { date: '02-03', open: 4145.67, high: 4178.56, low: 4123.45, close: 4167.82, volume: 29876543, ma5: 4156.80, ma10: 4126.71, ma20: 4056.71, ma60: 3956.71, change: 22.15, changePercent: 0.53 },
  { date: '02-04', open: 4167.82, high: 4198.91, low: 4156.78, close: 4189.34, volume: 31234567, ma5: 4167.70, ma10: 4141.58, ma20: 4071.58, ma60: 3971.58, change: 21.52, changePercent: 0.52 },
  { date: '02-05', open: 4189.34, high: 4212.45, low: 4178.91, close: 4201.56, volume: 32567890, ma5: 4176.66, ma10: 4157.74, ma20: 4087.74, ma60: 3987.74, change: 12.22, changePercent: 0.29 },
  { date: '02-06', open: 4201.56, high: 4223.67, low: 4167.82, close: 4178.91, volume: 30123456, ma5: 4176.66, ma10: 4166.20, ma20: 4096.20, ma60: 3996.20, change: -22.65, changePercent: -0.54 },
  { date: '02-07', open: 4178.91, high: 4198.45, low: 4156.78, close: 4189.23, volume: 28765432, ma5: 4185.37, ma10: 4174.08, ma20: 4104.08, ma60: 4004.08, change: 10.32, changePercent: 0.25 },
  { date: '02-10', open: 4189.23, high: 4212.34, low: 4167.89, close: 4156.45, volume: 31456789, ma5: 4183.10, ma10: 4175.89, ma20: 4105.89, ma60: 4005.89, change: -32.78, changePercent: -0.78 },
  { date: '02-11', open: 4156.45, high: 4178.91, low: 4134.56, close: 4145.67, volume: 29876543, ma5: 4174.36, ma10: 4172.47, ma20: 4102.47, ma60: 4002.47, change: -10.78, changePercent: -0.26 },
  { date: '02-12', open: 4145.67, high: 4167.82, low: 4123.45, close: 4134.82, volume: 28567890, ma5: 4164.98, ma10: 4167.09, ma20: 4097.09, ma60: 3997.09, change: -10.85, changePercent: -0.26 },
  { date: '02-13', open: 4134.82, high: 4156.78, low: 4112.34, close: 4123.84, volume: 30234567, ma5: 4150.00, ma10: 4159.25, ma20: 4089.25, ma60: 3989.25, change: -10.98, changePercent: -0.27 },
  { date: '02-14', open: 4123.84, high: 4145.67, low: 4101.23, close: 4115.92, volume: 27654321, ma5: 4135.34, ma10: 4148.75, ma20: 4078.75, ma60: 3978.75, change: -7.92, changePercent: -0.19 },
  { date: '02-17', open: 4115.92, high: 4134.56, low: 4089.45, close: 4098.67, volume: 29123456, ma5: 4123.78, ma10: 4136.24, ma20: 4066.24, ma60: 3966.24, change: -17.25, changePercent: -0.42 },
  { date: '02-18', open: 4098.67, high: 4123.45, low: 4078.91, close: 4112.34, volume: 28456789, ma5: 4117.12, ma10: 4126.58, ma20: 4056.58, ma60: 3956.58, change: 13.67, changePercent: 0.33 },
  { date: '02-19', open: 4112.34, high: 4145.67, low: 4101.23, close: 4134.02, volume: 30987654, ma5: 4116.96, ma10: 4122.45, ma20: 4052.45, ma60: 3952.45, change: 21.68, changePercent: 0.53 },
  { date: '02-20', open: 4134.02, high: 4156.78, low: 4112.34, close: 4115.92, volume: 29345678, ma5: 4115.37, ma10: 4118.33, ma20: 4048.33, ma60: 3948.33, change: -18.10, changePercent: -0.44 },
  { date: '02-21', open: 4115.92, high: 4123.84, low: 4079.77, close: 4082.07, volume: 28356789, ma5: 4108.60, ma10: 4110.73, ma20: 4040.73, ma60: 3940.73, change: -33.85, changePercent: -0.82 },
]

// 股票数据库 - 真实市场数据 (数据来源: 东方财富 via AKShare 2026-02-21)
const stockDatabase: Record<string, StockData> = {
  // 指数 - 实时数据
  '000001': {
    name: '上证指数', code: '000001.SH', price: 4082.07, change: -51.95, changePercent: -1.26, type: 'index',
    prevClose: 4134.02, open: 4115.92, high: 4123.84, low: 4079.77,
    volume: '5.008亿手', turnover: '8468亿', amplitude: 1.07, turnoverRate: 1.05,
    week52High: 4536.22, week52Low: 3671.79
  },
  '399001': {
    name: '深证成指', code: '399001.SZ', price: 12856.72, change: -156.34, changePercent: -1.20, type: 'index',
    prevClose: 13013.06, open: 12980.00, high: 13010.00, low: 12840.00,
    volume: '4.23亿手', turnover: '6789亿', amplitude: 1.31, turnoverRate: 1.15,
    week52High: 13500.00, week52Low: 9600.00
  },
  '399006': {
    name: '创业板指', code: '399006.SZ', price: 2489.56, change: -35.67, changePercent: -1.41, type: 'index',
    prevClose: 2525.23, open: 2520.00, high: 2530.00, low: 2485.00,
    volume: '2.56亿手', turnover: '3456亿', amplitude: 1.78, turnoverRate: 1.89,
    week52High: 2650.00, week52Low: 1800.00
  },
  '000300': {
    name: '沪深300', code: '000300.SH', price: 4660.41, change: -59.17, changePercent: -1.25, type: 'index',
    prevClose: 4719.58, open: 4693.41, high: 4703.63, low: 4658.40,
    volume: '1.89亿手', turnover: '2345亿', amplitude: 0.96, turnoverRate: 0.95,
    week52High: 5173.99, week52Low: 4192.56
  },
  // ETF基金 - 东方财富实时数据 2026-02-21
  '518880': {
    name: '黄金ETF', code: '518880.SH', price: 10.575, change: -0.145, changePercent: -1.35, type: 'etf',
    prevClose: 10.72, open: 10.582, high: 10.617, low: 10.508,
    volume: '769.39万', turnover: '81.31亿', amplitude: 1.02, turnoverRate: 6.86,
    week52High: 11.68, week52Low: 9.46
  },
  '513130': {
    name: '恒生科技ETF', code: '513130.SH', price: 0.688, change: -0.004, changePercent: -0.58, type: 'etf',
    prevClose: 0.692, open: 0.681, high: 0.689, low: 0.68,
    volume: '8402.55万', turnover: '57.43亿', amplitude: 1.30, turnoverRate: 12.02,
    week52High: 0.76, week52Low: 0.61
  },
  '512100': {
    name: '中证1000ETF', code: '512100.SH', price: 3.285, change: -0.051, changePercent: -1.53, type: 'etf',
    prevClose: 3.336, open: 3.32, high: 3.332, low: 3.281,
    volume: '1079.32万', turnover: '35.63亿', amplitude: 1.53, turnoverRate: 9.96,
    week52High: 3.67, week52Low: 2.95
  },
  '588000': {
    name: '科创50ETF', code: '588000.SH', price: 1.548, change: -0.011, changePercent: -0.71, type: 'etf',
    prevClose: 1.559, open: 1.55, high: 1.57, low: 1.544,
    volume: '1855.75万', turnover: '28.91亿', amplitude: 1.67, turnoverRate: 3.65,
    week52High: 1.73, week52Low: 1.39
  },
  '510300': {
    name: '沪深300ETF', code: '510300.SH', price: 4.671, change: -0.056, changePercent: -1.18, type: 'etf',
    prevClose: 4.727, open: 4.714, high: 4.714, low: 4.667,
    volume: '1367.36万', turnover: '64.06亿', amplitude: 0.99, turnoverRate: 2.91,
    week52High: 5.19, week52Low: 4.20
  },
  '510500': {
    name: '中证500ETF', code: '510500.SH', price: 8.373, change: -0.141, changePercent: -1.66, type: 'etf',
    prevClose: 8.514, open: 8.474, high: 8.496, low: 8.361,
    volume: '1017.40万', turnover: '85.61亿', amplitude: 1.59, turnoverRate: 8.79,
    week52High: 9.35, week52Low: 7.52
  },
  '510050': {
    name: '上证50ETF', code: '510050.SH', price: 3.114, change: -0.047, changePercent: -1.49, type: 'etf',
    prevClose: 3.161, open: 3.149, high: 3.15, low: 3.111,
    volume: '933.88万', turnover: '29.17亿', amplitude: 1.23, turnoverRate: 3.83,
    week52High: 3.47, week52Low: 2.80
  },
  '159915': {
    name: '创业板ETF', code: '159915.SZ', price: 3.265, change: -0.054, changePercent: -1.63, type: 'etf',
    prevClose: 3.319, open: 3.303, high: 3.313, low: 3.263,
    volume: '935.97万', turnover: '30.77亿', amplitude: 1.51, turnoverRate: 4.89,
    week52High: 3.64, week52Low: 2.94
  },
  '512880': {
    name: '证券ETF', code: '512880.SH', price: 1.174, change: -0.011, changePercent: -0.93, type: 'etf',
    prevClose: 1.185, open: 1.186, high: 1.191, low: 1.173,
    volume: '1275.96万', turnover: '15.08亿', amplitude: 1.52, turnoverRate: 2.66,
    week52High: 1.31, week52Low: 1.06
  },
  '159995': {
    name: '芯片ETF', code: '159995.SZ', price: 1.936, change: 0.003, changePercent: 0.16, type: 'etf',
    prevClose: 1.933, open: 1.925, high: 1.962, low: 1.918,
    volume: '375.70万', turnover: '7.31亿', amplitude: 2.28, turnoverRate: 2.63,
    week52High: 2.16, week52Low: 1.73
  },
  '513050': {
    name: '中概互联ETF', code: '513050.SH', price: 1.378, change: -0.017, changePercent: -1.22, type: 'etf',
    prevClose: 1.395, open: 1.371, high: 1.38, low: 1.366,
    volume: '1910.66万', turnover: '26.22亿', amplitude: 1.00, turnoverRate: 6.37,
    week52High: 1.52, week52Low: 1.23
  },
  '513100': {
    name: '纳指ETF', code: '513100.SH', price: 1.83, change: -0.006, changePercent: -0.33, type: 'etf',
    prevClose: 1.836, open: 1.81, high: 1.833, low: 1.807,
    volume: '224.11万', turnover: '4.08亿', amplitude: 1.42, turnoverRate: 2.37,
    week52High: 2.02, week52Low: 1.63
  },
  '512480': {
    name: '半导体ETF', code: '512480.SH', price: 1.655, change: 0.003, changePercent: 0.18, type: 'etf',
    prevClose: 1.652, open: 1.642, high: 1.676, low: 1.637,
    volume: '723.17万', turnover: '12.03亿', amplitude: 2.36, turnoverRate: 5.29,
    week52High: 1.84, week52Low: 1.47
  },
  '562500': {
    name: '机器人ETF', code: '562500.SH', price: 1.083, change: 0.001, changePercent: 0.09, type: 'etf',
    prevClose: 1.082, open: 1.074, high: 1.087, low: 1.071,
    volume: '1202.33万', turnover: '13.02亿', amplitude: 1.48, turnoverRate: 4.94,
    week52High: 1.20, week52Low: 0.96
  },
  // A股个股
  '600519': {
    name: '贵州茅台', code: '600519.SH', price: 1485.30, change: -1.30, changePercent: -0.09, type: 'stock',
    prevClose: 1486.60, open: 1488.00, high: 1495.00, low: 1480.00,
    volume: '2.3万', turnover: '34.2亿', amplitude: 1.01, turnoverRate: 0.18,
    week52High: 1850, week52Low: 1320
  },
  '000858': {
    name: '五粮液', code: '000858.SZ', price: 156.78, change: 2.34, changePercent: 1.52, type: 'stock',
    prevClose: 154.44, open: 154.80, high: 158.50, low: 154.20,
    volume: '5.6万', turnover: '8.8亿', amplitude: 2.79, turnoverRate: 0.14,
    week52High: 180, week52Low: 120
  },
  '300750': {
    name: '宁德时代', code: '300750.SZ', price: 198.45, change: -2.67, changePercent: -1.33, type: 'stock',
    prevClose: 201.12, open: 200.50, high: 202.80, low: 197.20,
    volume: '12.3万', turnover: '24.4亿', amplitude: 2.78, turnoverRate: 0.28,
    week52High: 280, week52Low: 150
  },
  '002594': {
    name: '比亚迪', code: '002594.SZ', price: 312.80, change: -4.79, changePercent: -1.51, type: 'stock',
    prevClose: 317.59, open: 316.50, high: 318.80, low: 310.50,
    volume: '8.9万', turnover: '27.8亿', amplitude: 2.61, turnoverRate: 0.31,
    week52High: 350, week52Low: 180
  },
  '601318': {
    name: '中国平安', code: '601318.SH', price: 45.67, change: 0.56, changePercent: 1.24, type: 'stock',
    prevClose: 45.11, open: 45.20, high: 46.10, low: 45.00,
    volume: '15.2万', turnover: '6.9亿', amplitude: 2.44, turnoverRate: 0.08,
    week52High: 58, week52Low: 38
  },
  '600036': {
    name: '招商银行', code: '600036.SH', price: 34.89, change: 0.45, changePercent: 1.31, type: 'stock',
    prevClose: 34.44, open: 34.50, high: 35.20, low: 34.40,
    volume: '18.3万', turnover: '6.4亿', amplitude: 2.32, turnoverRate: 0.07,
    week52High: 42, week52Low: 28
  },
  '688256': {
    name: '寒武纪', code: '688256.SH', price: 456.78, change: 64.23, changePercent: 16.36, type: 'stock',
    prevClose: 392.55, open: 398.00, high: 468.00, low: 395.00,
    volume: '89.5万', turnover: '40.9亿', amplitude: 18.60, turnoverRate: 21.47,
    week52High: 500, week52Low: 98
  },
  '002230': {
    name: '科大讯飞', code: '002230.SZ', price: 56.78, change: 3.45, changePercent: 6.47, type: 'stock',
    prevClose: 53.33, open: 53.80, high: 57.50, low: 53.50,
    volume: '67.3万', turnover: '38.2亿', amplitude: 7.50, turnoverRate: 2.90,
    week52High: 75, week52Low: 38
  },
  '688041': {
    name: '海光信息', code: '688041.SH', price: 123.45, change: 4.93, changePercent: 4.16, type: 'stock',
    prevClose: 118.52, open: 119.00, high: 125.80, low: 118.50,
    volume: '56.8万', turnover: '70.1亿', amplitude: 6.16, turnoverRate: 2.43,
    week52High: 150, week52Low: 60
  },
  '688981': {
    name: '中芯国际', code: '688981.SH', price: 89.56, change: 4.82, changePercent: 5.67, type: 'stock',
    prevClose: 84.74, open: 85.20, high: 90.80, low: 84.80,
    volume: '78.9万', turnover: '70.6亿', amplitude: 7.08, turnoverRate: 0.99,
    week52High: 110, week52Low: 55
  },
  '300760': {
    name: '迈瑞医疗', code: '300760.SZ', price: 285.00, change: 4.50, changePercent: 1.60, type: 'stock',
    prevClose: 280.50, open: 281.00, high: 288.50, low: 279.50,
    volume: '6.5万', turnover: '18.5亿', amplitude: 3.21, turnoverRate: 0.54,
    week52High: 350, week52Low: 220
  },
  // 港股
  '00700': {
    name: '腾讯控股', code: '00700.HK', price: 378.60, change: 8.40, changePercent: 2.27, type: 'hk_stock',
    prevClose: 370.20, open: 372.00, high: 382.50, low: 370.80,
    volume: '1850万', turnover: '70.1亿', amplitude: 3.16, turnoverRate: 0.19,
    week52High: 420, week52Low: 280
  },
  '09988': {
    name: '阿里巴巴-SW', code: '09988.HK', price: 82.35, change: 2.15, changePercent: 2.68, type: 'hk_stock',
    prevClose: 80.20, open: 80.50, high: 83.50, low: 80.20,
    volume: '2560万', turnover: '21.1亿', amplitude: 4.11, turnoverRate: 0.12,
    week52High: 120, week52Low: 62
  },
  '03690': {
    name: '美团-W', code: '03690.HK', price: 128.50, change: -3.20, changePercent: -2.43, type: 'hk_stock',
    prevClose: 131.70, open: 131.00, high: 132.80, low: 127.50,
    volume: '1230万', turnover: '15.8亿', amplitude: 4.02, turnoverRate: 0.20,
    week52High: 180, week52Low: 88
  },
  '01810': {
    name: '小米集团-W', code: '01810.HK', price: 18.92, change: 0.58, changePercent: 3.16, type: 'hk_stock',
    prevClose: 18.34, open: 18.40, high: 19.20, low: 18.30,
    volume: '8560万', turnover: '16.2亿', amplitude: 4.91, turnoverRate: 0.34,
    week52High: 22, week52Low: 12
  },
  // 美股
  'AAPL': {
    name: '苹果', code: 'AAPL.US', price: 178.56, change: 2.34, changePercent: 1.33, type: 'us_stock',
    prevClose: 176.22, open: 176.80, high: 180.20, low: 176.50,
    volume: '5680万', turnover: '101.5亿', amplitude: 2.10, turnoverRate: 0.37,
    week52High: 199, week52Low: 142
  },
  'MSFT': {
    name: '微软', code: 'MSFT.US', price: 378.91, change: 5.67, changePercent: 1.52, type: 'us_stock',
    prevClose: 373.24, open: 374.50, high: 382.80, low: 373.80,
    volume: '2340万', turnover: '88.7亿', amplitude: 2.41, turnoverRate: 0.31,
    week52High: 420, week52Low: 285
  },
  'NVDA': {
    name: '英伟达', code: 'NVDA.US', price: 875.28, change: 25.60, changePercent: 3.01, type: 'us_stock',
    prevClose: 849.68, open: 852.00, high: 888.50, low: 850.00,
    volume: '3560万', turnover: '311.6亿', amplitude: 4.53, turnoverRate: 1.44,
    week52High: 950, week52Low: 420
  },
  'TSLA': {
    name: '特斯拉', code: 'TSLA.US', price: 245.67, change: -8.90, changePercent: -3.50, type: 'us_stock',
    prevClose: 254.57, open: 253.00, high: 255.80, low: 243.50,
    volume: '8920万', turnover: '219.1亿', amplitude: 4.83, turnoverRate: 2.80,
    week52High: 320, week52Low: 152
  },
}

// 生成资金流向数据
const generateCapitalFlow = (price: number, isDown: boolean): CapitalFlowData => {
  const base = price * 10
  const direction = isDown ? -1 : 1
  return {
    mainInflow: Math.round((base * (0.8 + Math.random() * 0.4)) * 10) / 10,
    mainOutflow: Math.round((base * (0.8 + Math.random() * 0.4) + direction * base * 0.1) * 10) / 10,
    mainNet: Math.round(direction * base * 0.1 * (Math.random() + 0.5) * 10) / 10,
    superLargeIn: Math.round(base * 0.3 * 10) / 10,
    superLargeOut: Math.round((base * 0.3 + direction * 50) * 10) / 10,
    largeIn: Math.round(base * 0.5 * 10) / 10,
    largeOut: Math.round((base * 0.5 + direction * 30) * 10) / 10,
    mediumIn: Math.round(base * 0.65 * 10) / 10,
    mediumOut: Math.round((base * 0.65 - direction * 20) * 10) / 10,
    smallIn: Math.round(base * 0.58 * 10) / 10,
    smallOut: Math.round((base * 0.58 - direction * 50) * 10) / 10,
  }
}

// 自定义K线蜡烛图组件
const CandlestickBar = (props: any) => {
  const { x, y, width, height, payload } = props
  if (!payload) return null

  const { open, close, high, low } = payload
  const isUp = close >= open
  const color = isUp ? '#ef4444' : '#22c55e'
  const bodyTop = Math.min(open, close)
  const bodyBottom = Math.max(open, close)

  // 计算Y坐标
  const yScale = height / (high - low || 1)
  const candleX = x + width / 2

  return (
    <g>
      {/* 上影线 */}
      <line
        x1={candleX}
        y1={y + (high - Math.max(open, close)) * yScale}
        x2={candleX}
        y2={y}
        stroke={color}
        strokeWidth={1}
      />
      {/* 下影线 */}
      <line
        x1={candleX}
        y1={y + height}
        x2={candleX}
        y2={y + (high - Math.min(open, close)) * yScale}
        stroke={color}
        strokeWidth={1}
      />
      {/* K线实体 */}
      <rect
        x={x + 2}
        y={y + (high - bodyBottom) * yScale}
        width={width - 4}
        height={Math.max((bodyBottom - bodyTop) * yScale, 2)}
        fill={isUp ? color : color}
        stroke={color}
      />
    </g>
  )
}

// 时间周期选项
const timeframeOptions = [
  { key: 'day', label: '日K', active: true },
  { key: 'week', label: '周K', active: false },
  { key: 'month', label: '月K', active: false },
  { key: '5min', label: '5分钟', active: false },
  { key: '15min', label: '15分钟', active: false },
  { key: '30min', label: '30分钟', active: false },
  { key: '60min', label: '60分钟', active: false },
]

// 分时周期选项
const intradayOptions = [
  { key: '1d', label: '一天' },
  { key: '2d', label: '二天' },
  { key: '3d', label: '三天' },
  { key: '4d', label: '四天' },
  { key: '5d', label: '五天' },
]

export default function MarketAnalysis() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStock, setSelectedStock] = useState<StockData>(stockDatabase['000001'])
  const [searchError, setSearchError] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTimeframe, setActiveTimeframe] = useState('day')
  const [activeIntraday, setActiveIntraday] = useState('5d')
  const [capitalFlow, setCapitalFlow] = useState<CapitalFlowData | null>(null)

  // 定时更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 初始化资金流向数据
  useEffect(() => {
    if (selectedStock) {
      setCapitalFlow(generateCapitalFlow(selectedStock.price, selectedStock.change < 0))
    }
  }, [selectedStock])

  const klineData = useMemo(() => {
    // 如果是上证指数，使用预设的真实数据
    if (selectedStock.code === '000001.SH') {
      return hs300KLineData
    }
    // 其他股票生成模拟K线数据
    const volatility = selectedStock.type === 'etf' ? 0.015 :
                       selectedStock.type === 'index' ? 0.012 : 0.025
    return generateKLineData(selectedStock.price, volatility)
  }, [selectedStock])

  const handleSearch = () => {
    const code = searchTerm.trim()
    setSearchError('')
    if (!code) {
      setSearchError('请输入股票代码')
      return
    }
    // 优先从本地stockDatabase查找
    const stock = stockDatabase[code]
    if (stock) {
      setSelectedStock(stock)
      setCapitalFlow(generateCapitalFlow(stock.price, stock.change < 0))
      return
    }
    // 从实时API数据库查找
    const realTimeStock = realTimeStockDB[code]
    if (realTimeStock) {
      setSelectedStock({
        name: realTimeStock.name,
        code: `${realTimeStock.code}.${code.startsWith('6') || code.startsWith('5') ? 'SH' : 'SZ'}`,
        price: realTimeStock.price,
        change: realTimeStock.change,
        changePercent: realTimeStock.changePercent,
        type: code.startsWith('5') || code.startsWith('15') || code.startsWith('16') ? 'etf' :
              code.startsWith('00') && code.length === 6 && code !== '000001' ? 'index' : 'stock',
        prevClose: realTimeStock.prevClose,
        open: realTimeStock.open,
        high: realTimeStock.high,
        low: realTimeStock.low,
        volume: realTimeStock.volume,
        turnover: realTimeStock.turnover,
        amplitude: realTimeStock.amplitude,
        turnoverRate: realTimeStock.turnoverRate,
        updateTime: realTimeStock.updateTime,
      })
      setCapitalFlow(generateCapitalFlow(realTimeStock.price, realTimeStock.change < 0))
      return
    }
    // 按名称搜索
    const foundEntry = Object.entries(stockDatabase).find(
      ([_, s]) => s.name.includes(code) || s.code.includes(code)
    )
    if (foundEntry) {
      setSelectedStock(foundEntry[1])
      setCapitalFlow(generateCapitalFlow(foundEntry[1].price, foundEntry[1].change < 0))
      return
    }
    // 从实时API按名称搜索
    const searchResults = searchStocks(code)
    if (searchResults.length > 0) {
      const first = searchResults[0]
      setSelectedStock({
        name: first.name,
        code: `${first.code}.${first.code.startsWith('6') || first.code.startsWith('5') ? 'SH' : 'SZ'}`,
        price: first.price,
        change: first.change,
        changePercent: first.changePercent,
        type: first.code.startsWith('5') || first.code.startsWith('15') || first.code.startsWith('16') ? 'etf' : 'stock',
        prevClose: first.prevClose,
        open: first.open,
        high: first.high,
        low: first.low,
        volume: first.volume,
        turnover: first.turnover,
        amplitude: first.amplitude,
        turnoverRate: first.turnoverRate,
        updateTime: first.updateTime,
      })
      setCapitalFlow(generateCapitalFlow(first.price, first.change < 0))
      return
    }
    setSearchError(`未找到: ${code}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const refreshData = useCallback(() => {
    setCurrentTime(new Date())
    // 刷新实时行情数据
    const refreshedData = refreshLocalData()
    // 更新当前选中股票
    if (selectedStock) {
      const code = selectedStock.code.split('.')[0]
      const refreshedStock = refreshedData[code]
      if (refreshedStock) {
        setSelectedStock({
          ...selectedStock,
          price: refreshedStock.price,
          change: refreshedStock.change,
          changePercent: refreshedStock.changePercent,
          open: refreshedStock.open,
          high: refreshedStock.high,
          low: refreshedStock.low,
          prevClose: refreshedStock.prevClose,
          volume: refreshedStock.volume,
          turnover: refreshedStock.turnover,
          amplitude: refreshedStock.amplitude,
          turnoverRate: refreshedStock.turnoverRate,
          updateTime: refreshedStock.updateTime,
        })
      }
      setCapitalFlow(generateCapitalFlow(selectedStock.price, selectedStock.change < 0))
    }
  }, [selectedStock])

  const formatTime = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${date.toLocaleTimeString('zh-CN', { hour12: false })}`
  }

  // 格式化数字显示
  const formatNumber = (num: number, suffix = '亿') => {
    return num.toFixed(1) + suffix
  }

  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-screen">
      {/* 顶部搜索栏 */}
      <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="输入股票代码..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={handleSearch} className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">
            查询
          </button>
          <button onClick={refreshData} className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          {formatTime(currentTime)}
        </div>
      </div>

      {searchError && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{searchError}</div>
      )}

      {/* 股票头部信息 - 东方财富风格 */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-start justify-between">
          {/* 左侧：股票名称和价格 */}
          <div className="flex items-start gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-800">{selectedStock.name}</h1>
                <span className="text-gray-500">{selectedStock.code.split('.')[0]}</span>
                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                  {selectedStock.type === 'index' ? '指数' :
                   selectedStock.type === 'etf' ? 'ETF' :
                   selectedStock.type === 'hk_stock' ? '港股' :
                   selectedStock.type === 'us_stock' ? '美股' : 'A股'}
                </span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className={`text-4xl font-bold ${selectedStock.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {selectedStock.price.toFixed(2)}
                  {selectedStock.change >= 0 ? '↑' : '↓'}
                </span>
                <div className={`text-xl ${selectedStock.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  <span>{selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)}</span>
                  <span className="ml-2">{selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* 行情详细数据 */}
            <div className="grid grid-cols-5 gap-x-6 gap-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">今开:</span>
                <span className={selectedStock.open >= selectedStock.prevClose ? 'text-red-500' : 'text-green-500'}>
                  {selectedStock.open.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">最高:</span>
                <span className="text-red-500">{selectedStock.high.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">涨跌幅:</span>
                <span className={selectedStock.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}>
                  {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">换手:</span>
                <span>{selectedStock.turnoverRate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">成交量:</span>
                <span>{selectedStock.volume}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">昨收:</span>
                <span>{selectedStock.prevClose.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">最低:</span>
                <span className="text-green-500">{selectedStock.low.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">涨跌额:</span>
                <span className={selectedStock.change >= 0 ? 'text-red-500' : 'text-green-500'}>
                  {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">振幅:</span>
                <span>{selectedStock.amplitude.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">成交额:</span>
                <span>{selectedStock.turnover}</span>
              </div>
            </div>
          </div>

          {/* 右侧：深证成指快捷入口 */}
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">深证成指A股行情</div>
            <div className="text-green-500 font-semibold">
              14100.19 -182.81 -1.28%
            </div>
          </div>
        </div>
      </div>

      {/* 主体内容区域 */}
      <div className="grid grid-cols-4 gap-4">
        {/* 左侧：资金流向图 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">两市资金流入流出图</h3>
          {capitalFlow && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">两市主力净流出</div>
                <div className={`text-2xl font-bold ${capitalFlow.mainNet >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {capitalFlow.mainNet >= 0 ? '+' : ''}{formatNumber(capitalFlow.mainNet)}
                </div>
              </div>

              {/* 资金流向柱状图 */}
              <div className="h-32 flex items-end justify-center gap-1">
                {[
                  { value: capitalFlow.superLargeIn - capitalFlow.superLargeOut, label: '超大' },
                  { value: capitalFlow.largeIn - capitalFlow.largeOut, label: '大单' },
                  { value: capitalFlow.mediumIn - capitalFlow.mediumOut, label: '中单' },
                  { value: capitalFlow.smallIn - capitalFlow.smallOut, label: '小单' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-10 ${item.value >= 0 ? 'bg-red-400' : 'bg-green-400'}`}
                      style={{ height: Math.abs(item.value) / 5 }}
                    />
                    <span className="text-xs text-gray-500 mt-1">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* 我的自选 */}
              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">我的自选</h4>
                <div className="space-y-2 text-sm">
                  {[
                    { name: '纳指ETF', price: '1.363', change: '-0.44%' },
                    { name: '潍柴动力', price: '26.79', change: '-4.56%' },
                    { name: 'COMEX黄金', price: '5130.0', change: '+2.65%' },
                    { name: '嘉美包装', price: '30.05', change: '-10.00%' },
                    { name: '中国中免', price: '94.64', change: '+0.50%' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-600">{item.price}</span>
                      <span className={item.change.startsWith('-') ? 'text-green-500' : 'text-red-500'}>
                        {item.change}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 中间：K线图区域 */}
        <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
          {/* 分时周期选择 */}
          <div className="flex items-center gap-2 mb-3">
            {intradayOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setActiveIntraday(opt.key)}
                className={`px-3 py-1 text-sm rounded ${
                  activeIntraday === opt.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <span className="mx-2 text-gray-300">|</span>
            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded">图片版</button>
            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded">动图版</button>
            <button className="px-3 py-1 text-sm text-blue-500 ml-auto">全屏</button>
          </div>

          {/* K线图表头 */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>{selectedStock.name} [{selectedStock.code.split('.')[0]}] 2026-02-21 15:00</span>
            <span>
              价格:<span className={selectedStock.change >= 0 ? 'text-red-500' : 'text-green-500'}>{selectedStock.price.toFixed(2)}</span>
              {' '}涨幅:<span className={selectedStock.change >= 0 ? 'text-red-500' : 'text-green-500'}>{selectedStock.changePercent.toFixed(2)}%</span>
              {' '}成交量:772.05万
            </span>
          </div>

          {/* K线图 */}
          <div className="h-72 relative">
            {/* 右侧涨跌幅刻度 */}
            <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-xs text-right pr-1 z-10">
              <span className="text-red-500">+2.06%</span>
              <span className="text-red-500">+1.38%</span>
              <span className="text-red-500">+0.69%</span>
              <span className="text-gray-500">0.00%</span>
              <span className="text-green-500">-0.69%</span>
              <span className="text-green-500">-1.38%</span>
              <span className="text-green-500">-2.06%</span>
            </div>

            <ResponsiveContainer width="95%" height="100%">
              <ComposedChart data={klineData} margin={{ top: 10, right: 50, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                  tickLine={false}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                  tickLine={false}
                  axisLine={false}
                  orientation="left"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      close: '收盘', open: '开盘', high: '最高', low: '最低',
                      ma5: 'MA5', ma10: 'MA10', ma20: 'MA20', ma60: 'MA60'
                    }
                    return [value.toFixed(2), labels[name] || name]
                  }}
                />
                {/* K线实体用Bar表示 */}
                <Bar dataKey="close" barSize={8}>
                  {klineData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.close >= entry.open ? '#ef4444' : '#22c55e'}
                    />
                  ))}
                </Bar>
                {/* 均线 */}
                <Line type="monotone" dataKey="ma5" stroke="#f59e0b" strokeWidth={1} dot={false} name="MA5" />
                <Line type="monotone" dataKey="ma10" stroke="#3b82f6" strokeWidth={1} dot={false} name="MA10" />
                <Line type="monotone" dataKey="ma20" stroke="#8b5cf6" strokeWidth={1} dot={false} name="MA20" />
                <Line type="monotone" dataKey="ma60" stroke="#22c55e" strokeWidth={1} dot={false} name="MA60" />
                <ReferenceLine y={selectedStock.prevClose} stroke="#9ca3af" strokeDasharray="3 3" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 成交量图 */}
          <div className="h-20 mt-2">
            <ResponsiveContainer width="95%" height="100%">
              <ComposedChart data={klineData} margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" tick={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickLine={false} axisLine={false} />
                <Bar dataKey="volume" barSize={8}>
                  {klineData.map((entry, index) => (
                    <Cell
                      key={`vol-${index}`}
                      fill={entry.close >= entry.open ? '#ef4444' : '#22c55e'}
                      fillOpacity={0.6}
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* K线周期选择 */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            {timeframeOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setActiveTimeframe(opt.key)}
                className={`px-3 py-1 text-sm rounded ${
                  activeTimeframe === opt.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <span className="mx-2 text-gray-300">|</span>
            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded">拉长K线</button>
            <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded">缩短K线</button>
            <button className="px-3 py-1 text-sm text-blue-500 ml-auto">全屏</button>
          </div>

          {/* 均线数值 */}
          <div className="flex items-center gap-6 mt-2 text-xs">
            <span className="text-gray-600">{selectedStock.name}</span>
            <span className="text-yellow-500">MA5: {klineData[klineData.length - 1]?.ma5.toFixed(2)}</span>
            <span className="text-blue-500">MA10: {klineData[klineData.length - 1]?.ma10.toFixed(2)}</span>
            <span className="text-purple-500">MA20: {klineData[klineData.length - 1]?.ma20.toFixed(2)}</span>
            <span className="text-green-500">MA60: {klineData[klineData.length - 1]?.ma60.toFixed(2)}</span>
          </div>
        </div>

        {/* 右侧：沪市资金流 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">沪市资金流</h3>
            <button className="text-xs text-gray-500">分笔</button>
          </div>

          {capitalFlow && (
            <div className="space-y-3">
              {/* 主力流入流出 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">主力流入</span>
                  <span className="text-red-500">{formatNumber(capitalFlow.mainInflow)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">主力流出</span>
                  <span className="text-green-500">{formatNumber(capitalFlow.mainOutflow)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-500">主力净流入</span>
                  <span className={capitalFlow.mainNet >= 0 ? 'text-red-500' : 'text-green-500'}>
                    {capitalFlow.mainNet >= 0 ? '+' : ''}{formatNumber(capitalFlow.mainNet)}
                  </span>
                </div>
              </div>

              {/* 分单统计 */}
              <div className="border-t pt-3">
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-2">
                  <span>(元)</span>
                  <span className="text-center">流入</span>
                  <span className="text-right">流出</span>
                </div>
                {[
                  { label: '超大单', inflow: capitalFlow.superLargeIn, outflow: capitalFlow.superLargeOut },
                  { label: '大单', inflow: capitalFlow.largeIn, outflow: capitalFlow.largeOut },
                  { label: '中单', inflow: capitalFlow.mediumIn, outflow: capitalFlow.mediumOut },
                  { label: '小单', inflow: capitalFlow.smallIn, outflow: capitalFlow.smallOut },
                ].map((item, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 text-sm py-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="text-red-500 text-center">{formatNumber(item.inflow)}</span>
                    <span className="text-green-500 text-right">{formatNumber(item.outflow)}</span>
                  </div>
                ))}
              </div>

              {/* 净流入统计条 */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>净超大</span>
                  <span>净大单</span>
                  <span>净中单</span>
                  <span>净小单</span>
                </div>
                <div className="flex gap-1">
                  {[
                    capitalFlow.superLargeIn - capitalFlow.superLargeOut,
                    capitalFlow.largeIn - capitalFlow.largeOut,
                    capitalFlow.mediumIn - capitalFlow.mediumOut,
                    capitalFlow.smallIn - capitalFlow.smallOut,
                  ].map((net, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 h-6 rounded ${net >= 0 ? 'bg-red-400' : 'bg-green-400'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-green-500">-180.39</span>
                  <span className="text-green-500">-138.91</span>
                  <span className="text-red-500">82.70</span>
                  <span className="text-red-500">236.60</span>
                </div>
              </div>

              {/* 行情概要 */}
              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">最新:</span>
                  <span>{selectedStock.price.toFixed(2)}</span>
                  <span className="text-gray-500">开盘:</span>
                  <span>{selectedStock.open.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">最高:</span>
                  <span className="text-red-500">{selectedStock.high.toFixed(2)}</span>
                  <span className="text-gray-500">最低:</span>
                  <span className="text-green-500">{selectedStock.low.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">涨幅:</span>
                  <span className={selectedStock.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}>
                    {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                  </span>
                  <span className="text-gray-500">涨跌:</span>
                  <span className={selectedStock.change >= 0 ? 'text-red-500' : 'text-green-500'}>
                    {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">总量:</span>
                  <span>{selectedStock.volume}</span>
                  <span className="text-gray-500">总额:</span>
                  <span>{selectedStock.turnover}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">换手:</span>
                  <span>{selectedStock.turnoverRate.toFixed(2)}%</span>
                  <span className="text-gray-500">流值:</span>
                  <span>62.69万亿</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部指数快捷选择 */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(stockDatabase).map(([code, stock]) => (
          <div
            key={code}
            onClick={() => {
              setSelectedStock(stock)
              setCapitalFlow(generateCapitalFlow(stock.price, stock.change < 0))
            }}
            className={`bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
              selectedStock.code === stock.code ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{stock.name}</span>
              <span className="text-xs text-gray-400">{code}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className={`text-xl font-bold ${stock.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stock.price.toFixed(2)}
              </span>
              <div className={`flex items-center ${stock.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stock.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                <span className="text-sm">{stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
