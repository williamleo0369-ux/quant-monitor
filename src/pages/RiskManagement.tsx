import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import {
  AlertTriangle, Shield, TrendingDown, Activity, AlertCircle, RefreshCw,
  Settings, X, Info, Edit2, Save, ChevronRight, Bell, Download, Play,
  Zap, Target, Eye, TrendingUp, BarChart2, PieChart as PieChartIcon
} from 'lucide-react'

// 风险指标数据库
const riskMetricsDatabase = {
  'VaR (95%)': {
    value: -2.34,
    unit: '%',
    status: 'normal',
    description: '在95%置信度下，日最大损失',
    history: [-2.1, -2.3, -2.5, -2.2, -2.4, -2.34],
    benchmark: -3.0,
    trend: 'stable',
    detail: '基于历史模拟法计算，使用过去252个交易日数据'
  },
  'CVaR': {
    value: -3.56,
    unit: '%',
    status: 'warning',
    description: '超过VaR的平均损失（尾部风险）',
    history: [-3.2, -3.4, -3.8, -3.5, -3.6, -3.56],
    benchmark: -4.0,
    trend: 'up',
    detail: '条件风险价值，衡量极端情况下的平均损失'
  },
  '最大回撤': {
    value: -12.45,
    unit: '%',
    status: 'normal',
    description: '历史最大回撤幅度',
    history: [-10.2, -11.5, -12.0, -12.3, -12.45, -12.45],
    benchmark: -15.0,
    trend: 'down',
    detail: '自组合成立以来的最大峰谷跌幅'
  },
  '波动率': {
    value: 18.23,
    unit: '%',
    status: 'normal',
    description: '年化波动率',
    history: [16.5, 17.2, 18.0, 17.8, 18.1, 18.23],
    benchmark: 20.0,
    trend: 'up',
    detail: '基于日收益率计算的年化标准差'
  },
  'Beta': {
    value: 1.15,
    unit: '',
    status: 'warning',
    description: '相对市场的系统性风险',
    history: [1.08, 1.10, 1.12, 1.14, 1.15, 1.15],
    benchmark: 1.0,
    trend: 'up',
    detail: '组合收益率与沪深300指数的协方差/方差比值'
  },
  '夏普比率': {
    value: 1.85,
    unit: '',
    status: 'good',
    description: '风险调整后收益',
    history: [1.65, 1.72, 1.78, 1.80, 1.83, 1.85],
    benchmark: 1.5,
    trend: 'up',
    detail: '(组合收益率-无风险利率)/组合波动率'
  },
}

// 风险雷达数据
const radarDataBase = [
  { subject: '市场风险', A: 65, fullMark: 100, description: '价格波动带来的风险敞口' },
  { subject: '流动性风险', A: 45, fullMark: 100, description: '资产变现能力评估' },
  { subject: '集中度风险', A: 78, fullMark: 100, description: '持仓集中程度风险' },
  { subject: '信用风险', A: 35, fullMark: 100, description: '债券及融券违约风险' },
  { subject: '操作风险', A: 25, fullMark: 100, description: '交易执行及系统风险' },
  { subject: '合规风险', A: 20, fullMark: 100, description: '监管合规性评估' },
]

// 敞口数据
const exposureDataBase = [
  { sector: '新能源', exposure: 35, limit: 40, change: 2.5 },
  { sector: '金融', exposure: 22, limit: 30, change: -1.2 },
  { sector: '消费', exposure: 18, limit: 25, change: 0.8 },
  { sector: 'AI科技', exposure: 15, limit: 25, change: 3.5 },
  { sector: '医药', exposure: 10, limit: 20, change: -0.5 },
]

// 风险限额数据
const riskLimitsBase = [
  { id: 1, name: '单日最大亏损', current: -1.2, warning: -2, stop: -3, status: 'normal' },
  { id: 2, name: '累计最大回撤', current: -8.5, warning: -10, stop: -15, status: 'normal' },
  { id: 3, name: '单股持仓上限', current: 15, warning: 18, stop: 20, status: 'normal' },
  { id: 4, name: '行业集中度', current: 35, warning: 40, stop: 50, status: 'warning' },
  { id: 5, name: '杠杆倍数', current: 1.2, warning: 1.5, stop: 2.0, status: 'normal' },
]

// 预警数据
const alertsBase = [
  { id: 1, level: 'warning', message: '组合Beta值超过1.1，系统性风险偏高', time: '10分钟前', read: false },
  { id: 2, level: 'info', message: '新能源板块敞口接近上限(35%/40%)', time: '30分钟前', read: false },
  { id: 3, level: 'warning', message: 'CVaR指标超过预警线', time: '1小时前', read: true },
  { id: 4, level: 'success', message: '日内VaR指标已恢复至正常范围', time: '2小时前', read: true },
  { id: 5, level: 'info', message: 'AI科技板块敞口增加3.5%', time: '3小时前', read: true },
]

// 压力测试场景
const stressScenarios = [
  { id: 1, name: '市场大跌10%', impact: -8.5, probability: '低' },
  { id: 2, name: '利率上升100bp', impact: -3.2, probability: '中' },
  { id: 3, name: '行业轮动', impact: -2.8, probability: '高' },
  { id: 4, name: '流动性危机', impact: -12.5, probability: '极低' },
  { id: 5, name: '黑天鹅事件', impact: -18.0, probability: '极低' },
]

// 生成回撤数据
const generateDrawdownData = (days: number) => {
  const data = []
  let maxValue = 100
  let currentValue = 100

  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.48) * 3
    currentValue = currentValue * (1 + change / 100)
    maxValue = Math.max(maxValue, currentValue)
    const drawdown = ((currentValue - maxValue) / maxValue) * 100

    const date = new Date()
    date.setDate(date.getDate() - (days - i))

    data.push({
      day: i + 1,
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      drawdown: Math.round(drawdown * 100) / 100,
      value: Math.round(currentValue * 100) / 100,
    })
  }
  return data
}

export default function RiskManagement() {
  // 状态管理
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [selectedRadarItem, setSelectedRadarItem] = useState<typeof radarDataBase[0] | null>(null)
  const [showLimitEditor, setShowLimitEditor] = useState(false)
  const [editingLimit, setEditingLimit] = useState<typeof riskLimitsBase[0] | null>(null)
  const [showStressTest, setShowStressTest] = useState(false)
  const [showAlertSettings, setShowAlertSettings] = useState(false)
  const [timePeriod, setTimePeriod] = useState<'30d' | '60d' | '90d'>('60d')
  const [alerts, setAlerts] = useState(alertsBase)
  const [riskLimits, setRiskLimits] = useState(riskLimitsBase)
  const [overallRisk, setOverallRisk] = useState<'low' | 'medium' | 'high'>('medium')

  // 回撤数据
  const drawdownData = useMemo(() => {
    const days = timePeriod === '30d' ? 30 : timePeriod === '60d' ? 60 : 90
    return generateDrawdownData(days)
  }, [timePeriod])

  // 风险分布数据
  const riskDistribution = useMemo(() => [
    { name: '低风险', value: 35, color: '#22c55e' },
    { name: '中风险', value: 45, color: '#eab308' },
    { name: '高风险', value: 20, color: '#ef4444' },
  ], [])

  // 刷新数据
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      // 模拟数据更新
      const risks = ['low', 'medium', 'high'] as const
      setOverallRisk(risks[Math.floor(Math.random() * 2)]) // 主要是low或medium
      setIsRefreshing(false)
    }, 1500)
  }

  // 标记预警为已读
  const markAlertRead = (alertId: number) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a))
  }

  // 保存限额编辑
  const saveLimitEdit = () => {
    if (editingLimit) {
      setRiskLimits(prev => prev.map(l => l.id === editingLimit.id ? editingLimit : l))
      setEditingLimit(null)
      setShowLimitEditor(false)
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' }
      case 'warning': return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' }
      case 'danger': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' }
      default: return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' }
    }
  }

  // 获取预警图标
  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'danger': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'success': return <Shield className="w-4 h-4 text-green-500" />
      default: return <Activity className="w-4 h-4 text-blue-500" />
    }
  }

  // 获取整体风险样式
  const getOverallRiskStyle = () => {
    switch (overallRisk) {
      case 'low': return { bg: 'bg-green-50', text: 'text-green-700', label: '低风险' }
      case 'medium': return { bg: 'bg-yellow-50', text: 'text-yellow-700', label: '中等风险' }
      case 'high': return { bg: 'bg-red-50', text: 'text-red-700', label: '高风险' }
    }
  }

  const riskStyle = getOverallRiskStyle()
  const unreadAlerts = alerts.filter(a => !a.read).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">风险管理</h1>
          <div className={`flex items-center gap-2 px-4 py-2 ${riskStyle.bg} ${riskStyle.text} rounded-lg`}>
            <Shield className="w-5 h-5" />
            <span className="font-medium">整体风险: {riskStyle.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStressTest(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Zap className="w-4 h-4" />
            压力测试
          </button>
          <button
            onClick={() => setShowAlertSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            预警设置
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadAlerts}
              </span>
            )}
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? '刷新中...' : '刷新数据'}
          </button>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-6 gap-4">
        {Object.entries(riskMetricsDatabase).map(([name, metric]) => {
          const statusColor = getStatusColor(metric.status)
          return (
            <div
              key={name}
              onClick={() => setSelectedMetric(name)}
              className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm text-gray-500">{name}</div>
                <Info className="w-3 h-3 text-gray-300" />
              </div>
              <div className={`text-2xl font-bold ${
                metric.status === 'good' ? 'text-green-600' :
                metric.status === 'warning' ? 'text-yellow-600' : 'text-gray-800'
              }`}>
                {metric.value}{metric.unit}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 text-red-500" />
                ) : metric.trend === 'down' ? (
                  <TrendingDown className="w-3 h-3 text-green-500" />
                ) : (
                  <Activity className="w-3 h-3 text-gray-400" />
                )}
                <span className="text-xs text-gray-400">{metric.description.slice(0, 10)}...</span>
              </div>
              {/* 迷你趋势图 */}
              <div className="h-8 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metric.history.map((v, i) => ({ x: i, v }))}>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={metric.status === 'warning' ? '#eab308' : metric.status === 'good' ? '#22c55e' : '#3b82f6'}
                      fill={metric.status === 'warning' ? '#fef9c3' : metric.status === 'good' ? '#dcfce7' : '#dbeafe'}
                      strokeWidth={1.5}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">风险雷达图</h2>
            <button className="text-sm text-blue-500 hover:text-blue-600">查看详情</button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarDataBase}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, cursor: 'pointer' }}
                  onClick={(data: any) => {
                    const item = radarDataBase.find(r => r.subject === data.value)
                    if (item) setSelectedRadarItem(item)
                  }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="风险水平"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  isAnimationActive={false}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-xs text-gray-400 text-center">
            点击各维度查看详情
          </div>
        </div>

        {/* Drawdown Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">回撤分析</h2>
            <div className="flex gap-2">
              {(['30d', '60d', '90d'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    timePeriod === period
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period === '30d' ? '30天' : period === '60d' ? '60天' : '90天'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={drawdownData}>
                <defs>
                  <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={['auto', 0]} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, '回撤']}
                  contentStyle={{ fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#drawdownGradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-red-50 rounded">
              <div className="text-xs text-red-600">当前回撤</div>
              <div className="font-bold text-red-700">{drawdownData[drawdownData.length - 1]?.drawdown}%</div>
            </div>
            <div className="p-2 bg-orange-50 rounded">
              <div className="text-xs text-orange-600">最大回撤</div>
              <div className="font-bold text-orange-700">{Math.min(...drawdownData.map(d => d.drawdown)).toFixed(2)}%</div>
            </div>
            <div className="p-2 bg-blue-50 rounded">
              <div className="text-xs text-blue-600">平均回撤</div>
              <div className="font-bold text-blue-700">
                {(drawdownData.reduce((a, b) => a + b.drawdown, 0) / drawdownData.length).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Exposure Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">敞口监控</h2>
            <button className="text-sm text-blue-500 hover:text-blue-600">调整上限</button>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exposureDataBase} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis type="category" dataKey="sector" tick={{ fontSize: 11 }} stroke="#9ca3af" width={60} />
                <Tooltip formatter={(value: number) => [`${value}%`]} />
                <Bar dataKey="exposure" radius={[0, 4, 4, 0]} name="当前敞口" isAnimationActive={false}>
                  {exposureDataBase.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.exposure / entry.limit > 0.85 ? '#ef4444' : entry.exposure / entry.limit > 0.7 ? '#eab308' : '#3b82f6'}
                    />
                  ))}
                </Bar>
                <Bar dataKey="limit" fill="#e5e7eb" radius={[0, 4, 4, 0]} name="上限" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1">
            {exposureDataBase.map(item => (
              <div key={item.sector} className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{item.sector}</span>
                <span className={`font-medium ${item.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {item.change >= 0 ? '+' : ''}{item.change}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Distribution & Alerts */}
      <div className="grid grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">风险分布</h2>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {riskDistribution.map(item => (
              <div key={item.name} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-600">{item.name} {item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">风险预警</h2>
            <span className="text-sm text-gray-400">{unreadAlerts} 条未读</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => markAlertRead(alert.id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  alert.level === 'warning' ? 'bg-yellow-50 hover:bg-yellow-100' :
                  alert.level === 'danger' ? 'bg-red-50 hover:bg-red-100' :
                  alert.level === 'success' ? 'bg-green-50 hover:bg-green-100' : 'bg-blue-50 hover:bg-blue-100'
                } ${!alert.read ? 'border-l-4 border-blue-500' : ''}`}
              >
                {getAlertIcon(alert.level)}
                <div className="flex-1">
                  <div className={`text-sm ${!alert.read ? 'font-medium' : ''} text-gray-800`}>{alert.message}</div>
                </div>
                <div className="text-xs text-gray-400">{alert.time}</div>
                {!alert.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Limits Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">风险限额</h2>
          <button
            onClick={() => setShowLimitEditor(true)}
            className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600"
          >
            <Settings className="w-4 h-4" />
            编辑限额
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">指标名称</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">当前值</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">预警线</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">止损线</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">使用率</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">状态</th>
              </tr>
            </thead>
            <tbody>
              {riskLimits.map((row) => {
                const usage = Math.abs(row.current / row.stop) * 100
                return (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{row.name}</td>
                    <td className="py-3 px-4">{row.current}%</td>
                    <td className="py-3 px-4 text-yellow-600">{row.warning}%</td>
                    <td className="py-3 px-4 text-red-600">{row.stop}%</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              usage > 80 ? 'bg-red-500' : usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(usage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{usage.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        row.status === 'normal' ? 'bg-green-100 text-green-600' :
                        row.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {row.status === 'normal' ? '正常' : row.status === 'warning' ? '预警' : '超限'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metric Detail Modal */}
      {selectedMetric && riskMetricsDatabase[selectedMetric as keyof typeof riskMetricsDatabase] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[550px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedMetric}</h3>
              <button onClick={() => setSelectedMetric(null)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            {(() => {
              const metric = riskMetricsDatabase[selectedMetric as keyof typeof riskMetricsDatabase]
              const statusColor = getStatusColor(metric.status)
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${statusColor.bg}`}>
                      <div className={`text-sm ${statusColor.text}`}>当前值</div>
                      <div className={`text-3xl font-bold ${statusColor.text}`}>
                        {metric.value}{metric.unit}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50">
                      <div className="text-sm text-gray-600">基准值</div>
                      <div className="text-3xl font-bold text-gray-800">
                        {metric.benchmark}{metric.unit}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600 mb-1">指标说明</div>
                    <div className="text-gray-800">{metric.description}</div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">计算方法</div>
                    <div className="text-gray-800">{metric.detail}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">历史趋势</div>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metric.history.map((v, i) => ({ day: `D${i + 1}`, value: v }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                          <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={metric.status === 'warning' ? '#eab308' : '#3b82f6'}
                            strokeWidth={2}
                            dot
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedMetric(null)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    关闭
                  </button>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Radar Item Detail Modal */}
      {selectedRadarItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedRadarItem.subject}</h3>
              <button onClick={() => setSelectedRadarItem(null)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-sm text-blue-600">风险评分</div>
                <div className="text-4xl font-bold text-blue-800">{selectedRadarItem.A}</div>
                <div className="text-xs text-blue-500">满分 {selectedRadarItem.fullMark}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">风险描述</div>
                <div className="text-gray-800">{selectedRadarItem.description}</div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={`h-full rounded-full transition-all ${
                    selectedRadarItem.A > 70 ? 'bg-red-500' :
                    selectedRadarItem.A > 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${selectedRadarItem.A}%` }}
                />
              </div>
              <button
                onClick={() => setSelectedRadarItem(null)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Limit Editor Modal */}
      {showLimitEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[600px] shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">编辑风险限额</h3>
              <button onClick={() => { setShowLimitEditor(false); setEditingLimit(null) }}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-3">
              {riskLimits.map((limit) => (
                <div
                  key={limit.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    editingLimit?.id === limit.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{limit.name}</span>
                    <button
                      onClick={() => setEditingLimit(editingLimit?.id === limit.id ? null : { ...limit })}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  {editingLimit?.id === limit.id ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">预警线 (%)</label>
                        <input
                          type="number"
                          value={editingLimit.warning}
                          onChange={(e) => setEditingLimit({ ...editingLimit, warning: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">止损线 (%)</label>
                        <input
                          type="number"
                          value={editingLimit.stop}
                          onChange={(e) => setEditingLimit({ ...editingLimit, stop: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 text-sm">
                      <span className="text-yellow-600">预警: {limit.warning}%</span>
                      <span className="text-red-600">止损: {limit.stop}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowLimitEditor(false); setEditingLimit(null) }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={saveLimitEdit}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stress Test Modal */}
      {showStressTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[600px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">压力测试</h3>
              <button onClick={() => setShowStressTest(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              模拟不同市场情景下组合的预期损失
            </p>
            <div className="space-y-3">
              {stressScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{scenario.name}</div>
                    <div className="text-xs text-gray-400">发生概率: {scenario.probability}</div>
                  </div>
                  <div className={`text-xl font-bold ${scenario.impact < -10 ? 'text-red-600' : scenario.impact < -5 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {scenario.impact}%
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  压力测试结果仅供参考，实际损失可能与预期有差异
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowStressTest(false)}
              className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Alert Settings Modal */}
      {showAlertSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">预警设置</h3>
              <button onClick={() => setShowAlertSettings(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">VaR预警</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="text-sm text-gray-500">当VaR超过预警线时发送通知</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">回撤预警</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="text-sm text-gray-500">当回撤超过设定阈值时发送通知</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">敞口预警</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="text-sm text-gray-500">当板块敞口接近上限时发送通知</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Beta预警</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="text-sm text-gray-500">当组合Beta超过1.1时发送通知</div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAlertSettings(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  alert('预警设置已保存')
                  setShowAlertSettings(false)
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
