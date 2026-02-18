import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { Calendar, Filter, Bell, Clock, TrendingUp, FileText } from 'lucide-react'

const eventTypes = [
  { id: 'all', label: '全部', count: 156 },
  { id: 'earnings', label: '财报发布', count: 45 },
  { id: 'dividend', label: '分红派息', count: 32 },
  { id: 'meeting', label: '股东大会', count: 28 },
  { id: 'policy', label: '政策事件', count: 23 },
  { id: 'industry', label: '行业动态', count: 28 },
]

const upcomingEvents = [
  { date: '2024-01-16', type: 'earnings', company: '贵州茅台', event: '2023年度业绩快报', impact: 'high' },
  { date: '2024-01-17', type: 'dividend', company: '招商银行', event: '2023年第三次分红', impact: 'medium' },
  { date: '2024-01-18', type: 'meeting', company: '宁德时代', event: '临时股东大会', impact: 'high' },
  { date: '2024-01-19', type: 'policy', company: '-', event: '央行利率决议', impact: 'high' },
  { date: '2024-01-20', type: 'industry', company: '-', event: '新能源汽车销量数据发布', impact: 'medium' },
  { date: '2024-01-22', type: 'earnings', company: '比亚迪', event: '2023年度业绩预告', impact: 'high' },
]

const historicalEvents = [
  { date: '2024-01-10', company: '中国平安', event: '2023年保费收入公告', priceChange: 2.34, volumeChange: 45 },
  { date: '2024-01-08', company: '隆基绿能', event: '硅片价格调整', priceChange: -3.56, volumeChange: 78 },
  { date: '2024-01-05', company: '贵州茅台', event: '产品提价公告', priceChange: 4.12, volumeChange: 123 },
  { date: '2024-01-03', company: '宁德时代', event: '新产线投产', priceChange: 5.67, volumeChange: 156 },
]

const eventImpactData = Array.from({ length: 20 }, (_, i) => ({
  day: i - 10,
  price: 100 + (i < 10 ? Math.random() * 5 - 2 : Math.random() * 10 + 3),
  volume: Math.round(100 + (i >= 10 ? Math.random() * 50 + 20 : Math.random() * 30)),
}))

export default function EventDriven() {
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-600'
      case 'medium': return 'bg-yellow-100 text-yellow-600'
      case 'low': return 'bg-green-100 text-green-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'earnings': return '财报'
      case 'dividend': return '分红'
      case 'meeting': return '股东会'
      case 'policy': return '政策'
      case 'industry': return '行业'
      default: return type
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">事件驱动</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <Bell className="w-4 h-4" />
            订阅提醒
          </button>
        </div>
      </div>

      {/* Event Type Filter */}
      <div className="flex gap-2">
        {eventTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedType === type.id
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {type.label}
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              selectedType === type.id ? 'bg-blue-400' : 'bg-gray-100'
            }`}>
              {type.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">即将发生的事件</h2>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-400">{event.date.slice(5, 7)}月</div>
                    <div className="text-lg font-bold text-gray-800">{event.date.slice(8)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{event.event}</div>
                    <div className="text-sm text-gray-500">{event.company !== '-' ? event.company : '宏观事件'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-600">
                    {getTypeLabel(event.type)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${getImpactColor(event.impact)}`}>
                    {event.impact === 'high' ? '高影响' : event.impact === 'medium' ? '中影响' : '低影响'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Events */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-800">历史事件回顾</h2>
          </div>
          <div className="space-y-3">
            {historicalEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-800">{event.event}</div>
                  <div className="text-sm text-gray-500">{event.company} · {event.date}</div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${event.priceChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {event.priceChange >= 0 ? '+' : ''}{event.priceChange}%
                  </div>
                  <div className="text-xs text-gray-400">成交量 +{event.volumeChange}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Impact Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">事件影响分析</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">价格影响</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={eventImpactData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" label={{ value: '事件发生日前后天数', position: 'insideBottom', offset: -5, fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">成交量变化</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventImpactData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
