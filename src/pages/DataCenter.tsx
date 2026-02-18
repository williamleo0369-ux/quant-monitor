import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Database, Download, Upload, Search, Filter, RefreshCw, FileText, Table } from 'lucide-react'

const dataSources = [
  { id: 'stock', name: '股票数据', count: 4500, updated: '2024-01-15 15:00' },
  { id: 'index', name: '指数数据', count: 856, updated: '2024-01-15 15:00' },
  { id: 'fund', name: '基金数据', count: 12000, updated: '2024-01-15 15:00' },
  { id: 'bond', name: '债券数据', count: 8900, updated: '2024-01-15 15:00' },
  { id: 'futures', name: '期货数据', count: 456, updated: '2024-01-15 15:00' },
  { id: 'macro', name: '宏观数据', count: 2340, updated: '2024-01-15 10:00' },
]

const recentQueries = [
  { query: 'SELECT * FROM stock_daily WHERE code="600519"', time: '5分钟前', rows: 1256 },
  { query: 'SELECT * FROM index_data WHERE date >= "2024-01-01"', time: '10分钟前', rows: 890 },
  { query: 'SELECT AVG(close) FROM stock_daily GROUP BY sector', time: '30分钟前', rows: 45 },
]

const dataUsageChart = [
  { name: '股票数据', value: 45 },
  { name: '指数数据', value: 20 },
  { name: '基金数据', value: 15 },
  { name: '债券数据', value: 10 },
  { name: '其他', value: 10 },
]

export default function DataCenter() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSource, setSelectedSource] = useState<string | null>(null)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">数据中心</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="w-4 h-4" />
            导入数据
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <Download className="w-4 h-4" />
            导出数据
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索数据表或字段..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          筛选
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" />
          刷新
        </button>
      </div>

      {/* Data Sources */}
      <div className="grid grid-cols-6 gap-4">
        {dataSources.map((source) => (
          <div
            key={source.id}
            onClick={() => setSelectedSource(source.id)}
            className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all ${
              selectedSource === source.id
                ? 'border-blue-500 ring-2 ring-blue-100'
                : 'border-gray-100 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-800">{source.name}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {source.count.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">更新: {source.updated}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Data Usage Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">数据使用分布</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataUsageChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Queries */}
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">最近查询</h2>
          <div className="space-y-3">
            {recentQueries.map((query, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="font-mono text-sm text-gray-800 mb-2 truncate">
                  {query.query}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{query.time}</span>
                  <span>返回 {query.rows} 行</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">数据表列表</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">表名</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">描述</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">记录数</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">字段数</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">更新时间</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'stock_daily', desc: '股票日线数据', rows: 12500000, fields: 12, updated: '2024-01-15' },
                { name: 'stock_minute', desc: '股票分钟数据', rows: 89000000, fields: 8, updated: '2024-01-15' },
                { name: 'index_daily', desc: '指数日线数据', rows: 856000, fields: 10, updated: '2024-01-15' },
                { name: 'fund_nav', desc: '基金净值数据', rows: 3400000, fields: 6, updated: '2024-01-15' },
                { name: 'financial_report', desc: '财务报表数据', rows: 450000, fields: 45, updated: '2024-01-10' },
              ].map((table) => (
                <tr key={table.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-blue-500" />
                      <span className="font-mono">{table.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{table.desc}</td>
                  <td className="py-3 px-4">{(table.rows / 1000000).toFixed(1)}M</td>
                  <td className="py-3 px-4">{table.fields}</td>
                  <td className="py-3 px-4 text-gray-500">{table.updated}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="text-blue-500 hover:text-blue-700">
                        <FileText className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
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
