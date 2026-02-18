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
} from 'recharts'
import { AlertTriangle, Shield, TrendingDown, Activity, AlertCircle } from 'lucide-react'

const riskMetrics = [
  { label: 'VaR (95%)', value: '-2.34%', status: 'normal', description: '在95%置信度下，日最大损失' },
  { label: 'CVaR', value: '-3.56%', status: 'warning', description: '超过VaR的平均损失' },
  { label: '最大回撤', value: '-12.45%', status: 'normal', description: '历史最大回撤幅度' },
  { label: '波动率', value: '18.23%', status: 'normal', description: '年化波动率' },
  { label: 'Beta', value: '1.15', status: 'warning', description: '相对市场的系统性风险' },
  { label: '夏普比率', value: '1.85', status: 'good', description: '风险调整后收益' },
]

const radarData = [
  { subject: '市场风险', A: 65, fullMark: 100 },
  { subject: '流动性风险', A: 45, fullMark: 100 },
  { subject: '集中度风险', A: 78, fullMark: 100 },
  { subject: '信用风险', A: 35, fullMark: 100 },
  { subject: '操作风险', A: 25, fullMark: 100 },
  { subject: '合规风险', A: 20, fullMark: 100 },
]

const drawdownData = Array.from({ length: 60 }, (_, i) => ({
  day: i + 1,
  drawdown: -Math.abs(Math.sin(i / 10) * 8 + Math.random() * 4),
}))

const exposureData = [
  { sector: '新能源', exposure: 35, limit: 40 },
  { sector: '金融', exposure: 22, limit: 30 },
  { sector: '消费', exposure: 18, limit: 25 },
  { sector: '科技', exposure: 15, limit: 25 },
  { sector: '医药', exposure: 10, limit: 20 },
]

const alerts = [
  { level: 'warning', message: '组合Beta值超过1.1，系统性风险偏高', time: '10分钟前' },
  { level: 'info', message: '新能源板块敞口接近上限(35%/40%)', time: '30分钟前' },
  { level: 'success', message: 'CVaR指标已恢复至正常范围', time: '2小时前' },
]

export default function RiskManagement() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'danger': return 'text-red-600 bg-red-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'danger': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'success': return <Shield className="w-4 h-4 text-green-500" />
      default: return <Activity className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">风险管理</h1>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
          <Shield className="w-5 h-5" />
          <span className="font-medium">整体风险: 可控</span>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-6 gap-4">
        {riskMetrics.map((metric) => (
          <div key={metric.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">{metric.label}</div>
            <div className={`text-2xl font-bold ${
              metric.status === 'good' ? 'text-green-600' :
              metric.status === 'warning' ? 'text-yellow-600' : 'text-gray-800'
            }`}>
              {metric.value}
            </div>
            <div className="text-xs text-gray-400 mt-1">{metric.description}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">风险雷达图</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="风险水平"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drawdown Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">回撤分析</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={drawdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={['auto', 0]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="drawdown"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="#fef2f2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exposure Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">敞口监控</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exposureData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis type="category" dataKey="sector" tick={{ fontSize: 12 }} stroke="#9ca3af" width={60} />
                <Tooltip />
                <Bar dataKey="exposure" fill="#3b82f6" radius={[0, 4, 4, 0]} name="当前敞口" />
                <Bar dataKey="limit" fill="#e5e7eb" radius={[0, 4, 4, 0]} name="上限" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">风险预警</h2>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-4 rounded-lg ${
                alert.level === 'warning' ? 'bg-yellow-50' :
                alert.level === 'danger' ? 'bg-red-50' :
                alert.level === 'success' ? 'bg-green-50' : 'bg-blue-50'
              }`}
            >
              {getAlertIcon(alert.level)}
              <div className="flex-1">
                <div className="font-medium text-gray-800">{alert.message}</div>
              </div>
              <div className="text-sm text-gray-400">{alert.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Limits Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">风险限额</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">指标名称</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">当前值</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">预警线</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">止损线</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">状态</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: '单日最大亏损', current: '-1.2%', warning: '-2%', stop: '-3%', status: 'normal' },
                { name: '累计最大回撤', current: '-8.5%', warning: '-10%', stop: '-15%', status: 'normal' },
                { name: '单股持仓上限', current: '15%', warning: '18%', stop: '20%', status: 'normal' },
                { name: '行业集中度', current: '35%', warning: '40%', stop: '50%', status: 'warning' },
              ].map((row) => (
                <tr key={row.name} className="border-b border-gray-100">
                  <td className="py-3 px-4">{row.name}</td>
                  <td className="py-3 px-4 font-medium">{row.current}</td>
                  <td className="py-3 px-4 text-yellow-600">{row.warning}</td>
                  <td className="py-3 px-4 text-red-600">{row.stop}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
