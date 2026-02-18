import { useState } from 'react'
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
} from 'recharts'
import { Play, RotateCcw, Download, Plus, Trash2 } from 'lucide-react'

// 模拟回测数据
const generateStrategyData = () => {
  const data = []
  let strategyValue = 10000
  let benchmarkValue = 10000
  for (let i = 0; i < 252; i++) {
    const strategyReturn = (Math.random() - 0.45) * 0.04
    const benchmarkReturn = (Math.random() - 0.5) * 0.02
    strategyValue *= (1 + strategyReturn)
    benchmarkValue *= (1 + benchmarkReturn)
    data.push({
      day: i + 1,
      strategy: Math.round(strategyValue * 100) / 100,
      benchmark: Math.round(benchmarkValue * 100) / 100,
    })
  }
  return data
}

const strategies = [
  { id: 1, name: '双均线策略', type: '趋势跟踪', status: 'active', return: 23.45, sharpe: 1.85 },
  { id: 2, name: '动量突破', type: '动量策略', status: 'active', return: 18.32, sharpe: 1.56 },
  { id: 3, name: '价值投资', type: '基本面', status: 'paused', return: 12.67, sharpe: 1.23 },
  { id: 4, name: '网格交易', type: '震荡策略', status: 'active', return: 8.45, sharpe: 0.98 },
]

const allocationData = [
  { name: '双均线策略', value: 35 },
  { name: '动量突破', value: 25 },
  { name: '价值投资', value: 20 },
  { name: '网格交易', value: 20 },
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

const metricsData = [
  { label: '组合收益', value: '+28.56%', color: 'text-green-600' },
  { label: '组合夏普', value: '1.92', color: 'text-blue-600' },
  { label: '最大回撤', value: '-8.45%', color: 'text-red-600' },
  { label: '运行天数', value: '252', color: 'text-gray-600' },
]

export default function StrategyBacktest() {
  const [strategyData] = useState(generateStrategyData())
  const [isRunning, setIsRunning] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null)

  const handleRunBacktest = () => {
    setIsRunning(true)
    setTimeout(() => setIsRunning(false), 2000)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">策略回测</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" />
            新建策略
          </button>
          <button
            onClick={handleRunBacktest}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isRunning ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isRunning ? '运行中...' : '运行回测'}
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {metricsData.map((metric) => (
          <div key={metric.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">{metric.label}</div>
            <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
          </div>
        ))}
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
                <th className="text-left py-3 px-4 font-medium text-gray-600">收益率</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">夏普比率</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {strategies.map((strategy) => (
                <tr
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  className={`border-b border-gray-100 cursor-pointer transition-colors ${
                    selectedStrategy === strategy.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-4 font-medium">{strategy.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{strategy.type}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      strategy.status === 'active'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {strategy.status === 'active' ? '运行中' : '已暂停'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-green-600 font-medium">+{strategy.return}%</span>
                  </td>
                  <td className="py-3 px-4">{strategy.sharpe}</td>
                  <td className="py-3 px-4">
                    <button className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
            <h2 className="text-lg font-semibold text-gray-800">组合收益曲线</h2>
            <button className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              导出
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strategyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <ReferenceLine y={10000} stroke="#e5e7eb" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="strategy" stroke="#3b82f6" strokeWidth={2} dot={false} name="策略" />
                <Line type="monotone" dataKey="benchmark" stroke="#9ca3af" strokeWidth={2} dot={false} name="基准" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">策略配置</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {allocationData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
