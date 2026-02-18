import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Search, Flame, Clock, Star } from 'lucide-react'

const hotTopics = [
  { id: 1, name: 'AI人工智能', heat: 98, change: 15, stocks: 45, trend: 'up' },
  { id: 2, name: '机器人', heat: 92, change: 23, stocks: 32, trend: 'up' },
  { id: 3, name: '华为概念', heat: 87, change: -5, stocks: 89, trend: 'down' },
  { id: 4, name: '新能源汽车', heat: 85, change: 8, stocks: 67, trend: 'up' },
  { id: 5, name: '光伏', heat: 78, change: -12, stocks: 54, trend: 'down' },
  { id: 6, name: '半导体', heat: 76, change: 18, stocks: 43, trend: 'up' },
]

const relatedStocks = [
  { name: '科大讯飞', code: '002230', price: 56.78, change: 8.45, concept: 'AI人工智能' },
  { name: '寒武纪', code: '688256', price: 123.45, change: 7.23, concept: 'AI人工智能' },
  { name: '海康威视', code: '002415', price: 34.56, change: 5.67, concept: 'AI人工智能' },
  { name: '埃斯顿', code: '002747', price: 18.90, change: 6.78, concept: '机器人' },
  { name: '机器人', code: '300024', price: 12.34, change: 9.12, concept: '机器人' },
]

const trendData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  AI人工智能: Math.round((50 + Math.random() * 50) * 10) / 10,
  机器人: Math.round((40 + Math.random() * 45) * 10) / 10,
  华为概念: Math.round((60 + Math.random() * 35) * 10) / 10,
}))

const newsItems = [
  { time: '10:30', title: 'OpenAI发布最新GPT模型，引发市场关注', source: '财联社' },
  { time: '09:45', title: '工信部：加快推进人工智能产业发展', source: '证券时报' },
  { time: '09:15', title: '特斯拉人形机器人量产进度超预期', source: '界面新闻' },
  { time: '08:30', title: '华为发布新一代麒麟芯片，算力大幅提升', source: '21世纪经济报道' },
  { time: '昨日', title: '国家出台AI产业支持政策，龙头企业受益', source: '经济日报' },
]

export default function HotspotTracking() {
  const [selectedTopic, setSelectedTopic] = useState(hotTopics[0])
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">热点追踪</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索热点概念..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Hot Topics */}
      <div className="grid grid-cols-6 gap-4">
        {hotTopics.map((topic, index) => (
          <div
            key={topic.id}
            onClick={() => setSelectedTopic(topic)}
            className={`relative bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all ${
              selectedTopic.id === topic.id
                ? 'border-blue-500 ring-2 ring-blue-100'
                : 'border-gray-100 hover:shadow-md'
            }`}
          >
            {index < 3 && (
              <div className="absolute -top-2 -right-2">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index < 3 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </span>
              <span className="font-semibold text-gray-800 text-sm">{topic.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-1.5 rounded-full"
                    style={{ width: `${topic.heat}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 ml-1">{topic.heat}</span>
              </div>
            </div>
            <div className={`text-xs mt-2 ${topic.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
              热度 {topic.change >= 0 ? '↑' : '↓'} {Math.abs(topic.change)}%
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">热度趋势</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="AI人工智能" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="机器人" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="华为概念" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">AI人工智能</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">机器人</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-sm text-gray-600">华为概念</span>
            </div>
          </div>
        </div>

        {/* News Feed */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            相关资讯
          </h2>
          <div className="space-y-4">
            {newsItems.map((news, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="text-sm font-medium text-gray-800 hover:text-blue-600 cursor-pointer mb-1">
                  {news.title}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{news.time}</span>
                  <span>•</span>
                  <span>{news.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Stocks */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {selectedTopic.name} - 相关个股
          </h2>
          <div className="text-sm text-gray-500">共 {selectedTopic.stocks} 只个股</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">股票名称</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">代码</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">现价</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">涨跌幅</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">所属概念</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {relatedStocks.map((stock) => (
                <tr key={stock.code} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{stock.name}</td>
                  <td className="py-3 px-4 text-gray-500">{stock.code}</td>
                  <td className="py-3 px-4">¥{stock.price.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${stock.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                      {stock.concept}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="flex items-center gap-1 text-gray-400 hover:text-yellow-500">
                      <Star className="w-4 h-4" />
                    </button>
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
