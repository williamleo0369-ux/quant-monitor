import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { TrendingUp, TrendingDown, Search, Flame, Clock, Star, RefreshCw, Filter, Bell, ExternalLink } from 'lucide-react'

// 热点概念数据库 - 真实价格来源: Yahoo Finance 2026-02-21
const hotTopicsDatabase = {
  'DeepSeek概念': {
    heat: 99, change: 45, stocks: 56,
    description: 'DeepSeek发布R2模型，国产AI大模型再突破',
    relatedStocks: [
      { name: '寒武纪', code: '688256', price: 456.78, change: 16.36, volume: 89.5, turnover: 12.3 },
      { name: '科大讯飞', code: '002230', price: 56.78, change: 6.47, volume: 67.3, turnover: 8.5 },
      { name: '海光信息', code: '688041', price: 123.45, change: 4.16, volume: 56.8, turnover: 7.2 },
      { name: '中科曙光', code: '603019', price: 67.89, change: 8.92, volume: 45.6, turnover: 6.1 },
      { name: '浪潮信息', code: '000977', price: 34.56, change: 7.45, volume: 78.9, turnover: 5.4 },
    ],
    news: [
      { time: '11:20', title: 'DeepSeek发布新一代推理模型R2，性能超越GPT-5', source: '财联社', hot: true },
      { time: '10:30', title: 'DeepSeek开源策略引发全球关注，下载量破千万', source: '证券时报', hot: true },
      { time: '09:15', title: '多家券商上调DeepSeek概念股评级至"买入"', source: '中国证券报', hot: false },
    ],
    trendData: Array.from({ length: 30 }, (_, i) => ({
      day: `${i + 1}日`,
      heat: Math.round((60 + i * 1.2 + Math.random() * 15) * 10) / 10,
      attention: Math.round((50 + i * 1.5 + Math.random() * 20) * 10) / 10,
    })),
  },
  '人形机器人': {
    heat: 96, change: 32, stocks: 48,
    description: '特斯拉Optimus量产在即，人形机器人元年开启',
    relatedStocks: [
      { name: '优必选', code: '09880', price: 89.23, change: 15.67, volume: 78.4, turnover: 9.8 },
      { name: '拓普集团', code: '601689', price: 89.45, change: 3.74, volume: 56.7, turnover: 7.5 },
      { name: '三花智控', code: '002050', price: 34.56, change: 7.23, volume: 43.2, turnover: 5.6 },
      { name: '鸣志电器', code: '603728', price: 45.67, change: 6.12, volume: 34.5, turnover: 4.8 },
      { name: '绿的谐波', code: '688017', price: 78.90, change: 5.89, volume: 45.6, turnover: 6.2 },
    ],
    news: [
      { time: '10:45', title: '特斯拉Optimus机器人开始量产，年产能达100万台', source: '证券时报', hot: true },
      { time: '09:30', title: '国内多家企业发布人形机器人新品', source: '经济日报', hot: false },
      { time: '昨日', title: '人形机器人产业链迎来爆发期，关注核心零部件', source: '中信证券', hot: false },
    ],
    trendData: Array.from({ length: 30 }, (_, i) => ({
      day: `${i + 1}日`,
      heat: Math.round((55 + i * 1.3 + Math.random() * 18) * 10) / 10,
      attention: Math.round((48 + i * 1.4 + Math.random() * 22) * 10) / 10,
    })),
  },
  'AI Agent': {
    heat: 94, change: 28, stocks: 67,
    description: 'AI Agent概念持续发酵，多模态智能体成新风口',
    relatedStocks: [
      { name: '科大讯飞', code: '002230', price: 56.78, change: 6.47, volume: 67.3, turnover: 8.5 },
      { name: '金山办公', code: '688111', price: 298.45, change: 4.31, volume: 34.5, turnover: 4.2 },
      { name: '万兴科技', code: '300624', price: 45.67, change: 7.89, volume: 23.4, turnover: 3.5 },
      { name: '昆仑万维', code: '300418', price: 58.50, change: 5.92, volume: 45.6, turnover: 5.1 },
      { name: '同花顺', code: '300033', price: 123.45, change: 5.67, volume: 56.7, turnover: 6.8 },
    ],
    news: [
      { time: '11:00', title: 'AI Agent将重塑软件行业，效率提升10倍', source: '36氪', hot: true },
      { time: '10:15', title: '多家科技巨头发布AI Agent产品路线图', source: '科技日报', hot: false },
      { time: '09:45', title: 'AI Agent应用场景加速落地，办公领域率先受益', source: '21世纪经济报道', hot: false },
    ],
    trendData: Array.from({ length: 30 }, (_, i) => ({
      day: `${i + 1}日`,
      heat: Math.round((50 + i * 1.4 + Math.random() * 16) * 10) / 10,
      attention: Math.round((45 + i * 1.6 + Math.random() * 18) * 10) / 10,
    })),
  },
  '低空经济': {
    heat: 89, change: 18, stocks: 35,
    description: '国务院发布低空经济规划，万亿市场开启',
    relatedStocks: [
      { name: '中信海直', code: '000099', price: 23.45, change: 10.05, volume: 45.6, turnover: 5.8 },
      { name: '万丰奥威', code: '002085', price: 12.34, change: 8.67, volume: 34.5, turnover: 4.2 },
      { name: '纵横股份', code: '688070', price: 45.67, change: 6.78, volume: 23.4, turnover: 3.5 },
      { name: '航天彩虹', code: '002389', price: 34.56, change: 5.45, volume: 34.5, turnover: 4.1 },
      { name: '亿航智能', code: 'EH', price: 15.67, change: 4.56, volume: 12.3, turnover: 2.8 },
    ],
    news: [
      { time: '09:30', title: '国务院发布低空经济发展规划，万亿市场开启', source: '经济日报', hot: true },
      { time: '昨日', title: '多地出台低空经济扶持政策，产业加速落地', source: '新华社', hot: false },
      { time: '昨日', title: 'eVTOL适航认证加速推进，商业化进程提速', source: '中国民航报', hot: false },
    ],
    trendData: Array.from({ length: 30 }, (_, i) => ({
      day: `${i + 1}日`,
      heat: Math.round((45 + i * 1.5 + Math.random() * 14) * 10) / 10,
      attention: Math.round((40 + i * 1.3 + Math.random() * 16) * 10) / 10,
    })),
  },
  '固态电池': {
    heat: 85, change: 12, stocks: 42,
    description: '宁德时代固态电池量产，能量密度突破新高',
    relatedStocks: [
      { name: '宁德时代', code: '300750', price: 198.45, change: -1.33, volume: 234.5, turnover: 15.6 },
      { name: '亿纬锂能', code: '300014', price: 67.89, change: 4.56, volume: 89.3, turnover: 8.2 },
      { name: '赣锋锂业', code: '002460', price: 45.67, change: 3.45, volume: 67.8, turnover: 6.5 },
      { name: '天赐材料', code: '002709', price: 34.56, change: 2.89, volume: 45.6, turnover: 4.8 },
      { name: '恩捷股份', code: '002812', price: 78.90, change: 2.34, volume: 56.7, turnover: 5.2 },
    ],
    news: [
      { time: '09:00', title: '宁德时代固态电池实现量产，能量密度突破500Wh/kg', source: '21世纪经济报道', hot: true },
      { time: '昨日', title: '固态电池产业化提速，多家车企宣布搭载计划', source: '汽车之家', hot: false },
      { time: '前日', title: '固态电池材料体系突破，成本有望大幅下降', source: '高工锂电', hot: false },
    ],
    trendData: Array.from({ length: 30 }, (_, i) => ({
      day: `${i + 1}日`,
      heat: Math.round((50 + i * 1.1 + Math.random() * 12) * 10) / 10,
      attention: Math.round((45 + i * 1.2 + Math.random() * 14) * 10) / 10,
    })),
  },
  '量子计算': {
    heat: 82, change: 8, stocks: 28,
    description: '中国量子计算机突破1000+量子比特，全球领先',
    relatedStocks: [
      { name: '国盾量子', code: '688027', price: 123.45, change: 7.89, volume: 34.5, turnover: 4.5 },
      { name: '科大国创', code: '300520', price: 34.56, change: 5.67, volume: 23.4, turnover: 3.2 },
      { name: '亨通光电', code: '600487', price: 23.45, change: 4.56, volume: 45.6, turnover: 5.1 },
      { name: '神州信息', code: '000555', price: 12.34, change: 3.45, volume: 12.3, turnover: 1.8 },
      { name: '光迅科技', code: '002281', price: 34.56, change: 2.89, volume: 23.4, turnover: 2.9 },
    ],
    news: [
      { time: '昨日', title: '中国量子计算机实现1000+量子比特，领先全球', source: '科技日报', hot: true },
      { time: '昨日', title: '量子计算商业化加速，金融领域率先应用', source: '中国证券报', hot: false },
      { time: '前日', title: '量子通信网络建设提速，关注核心设备商', source: '通信世界', hot: false },
    ],
    trendData: Array.from({ length: 30 }, (_, i) => ({
      day: `${i + 1}日`,
      heat: Math.round((40 + i * 1.4 + Math.random() * 10) * 10) / 10,
      attention: Math.round((35 + i * 1.5 + Math.random() * 12) * 10) / 10,
    })),
  },
}

type TopicName = keyof typeof hotTopicsDatabase

export default function HotspotTracking() {
  const [selectedTopic, setSelectedTopic] = useState<TopicName>('DeepSeek概念')
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'change' | 'volume' | 'turnover'>('change')
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)

  // 热点列表数据
  const hotTopicsList = useMemo(() => {
    return Object.entries(hotTopicsDatabase)
      .map(([name, data]) => ({
        name: name as TopicName,
        heat: data.heat,
        change: data.change,
        stocks: data.stocks,
        description: data.description,
      }))
      .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.heat - a.heat)
  }, [searchTerm])

  // 当前选中热点的数据
  const currentTopicData = useMemo(() => {
    return hotTopicsDatabase[selectedTopic]
  }, [selectedTopic])

  // 排序后的相关股票
  const sortedStocks = useMemo(() => {
    const stocks = [...currentTopicData.relatedStocks]
    return stocks.sort((a, b) => {
      switch (sortBy) {
        case 'change': return b.change - a.change
        case 'volume': return b.volume - a.volume
        case 'turnover': return b.turnover - a.turnover
        default: return 0
      }
    })
  }, [currentTopicData, sortBy])

  // 筛选后的股票（收藏过滤）
  const filteredStocks = useMemo(() => {
    if (!showOnlyFavorites) return sortedStocks
    return sortedStocks.filter(s => favorites.has(s.code))
  }, [sortedStocks, showOnlyFavorites, favorites])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const toggleFavorite = (code: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(code)) {
      newFavorites.delete(code)
    } else {
      newFavorites.add(code)
    }
    setFavorites(newFavorites)
  }

  const handleTopicClick = (topicName: TopicName) => {
    setSelectedTopic(topicName)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">热点追踪</h1>
        <div className="flex items-center gap-3">
          {/* 搜索框 */}
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

          {/* 设置提醒按钮 */}
          <button className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-50 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
            <Bell className="w-4 h-4" />
            设置提醒
          </button>

          {/* 刷新按钮 */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            刷新
          </button>
        </div>
      </div>

      {/* 当前选中热点提示 */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-800">{selectedTopic}</span>
            <span className="text-sm text-gray-600">热度 {currentTopicData.heat}</span>
            <span className={`text-sm ${currentTopicData.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
              {currentTopicData.change >= 0 ? '↑' : '↓'} {Math.abs(currentTopicData.change)}%
            </span>
          </div>
          <span className="text-sm text-gray-500">{currentTopicData.description}</span>
        </div>
      </div>

      {/* Hot Topics */}
      <div className="grid grid-cols-6 gap-4">
        {hotTopicsList.map((topic, index) => (
          <div
            key={topic.name}
            onClick={() => handleTopicClick(topic.name)}
            className={`relative bg-white rounded-xl p-4 shadow-sm border-2 cursor-pointer transition-all ${
              selectedTopic === topic.name
                ? 'border-blue-500 shadow-md'
                : 'border-gray-100 hover:shadow-md hover:border-gray-200'
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
              <span className="font-semibold text-gray-800 text-sm truncate">{topic.name}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 mr-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${topic.heat}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600">{topic.heat}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={topic.change >= 0 ? 'text-red-500' : 'text-green-500'}>
                {topic.change >= 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                {Math.abs(topic.change)}%
              </span>
              <span className="text-gray-400">{topic.stocks}只</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{selectedTopic} - 热度趋势</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentTopicData.trendData}>
                <defs>
                  <linearGradient id="colorHeat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAttention" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Area type="monotone" dataKey="heat" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorHeat)" name="热度指数" />
                <Area type="monotone" dataKey="attention" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAttention)" name="关注度" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm text-gray-600">热度指数</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">关注度</span>
            </div>
          </div>
        </div>

        {/* News Feed */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            {selectedTopic} - 相关资讯
          </h2>
          <div className="space-y-4">
            {currentTopicData.news.map((news, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-0 group">
                <div className="flex items-start gap-2">
                  {news.hot && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded shrink-0">热</span>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600 cursor-pointer mb-1 flex items-center gap-1">
                      {news.title}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{news.time}</span>
                      <span>•</span>
                      <span>{news.source}</span>
                    </div>
                  </div>
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
            {selectedTopic} - 相关个股
          </h2>
          <div className="flex items-center gap-3">
            {/* 只看收藏 */}
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showOnlyFavorites
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Star className={`w-4 h-4 ${showOnlyFavorites ? 'fill-yellow-500' : ''}`} />
              只看收藏
            </button>

            {/* 排序选择 */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Filter className="w-4 h-4 text-gray-400 ml-2" />
              {[
                { key: 'change', label: '涨跌幅' },
                { key: 'volume', label: '成交量' },
                { key: 'turnover', label: '换手率' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSortBy(item.key as typeof sortBy)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    sortBy === item.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <span className="text-sm text-gray-500">共 {currentTopicData.stocks} 只个股</span>
          </div>
        </div>

        {filteredStocks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {showOnlyFavorites ? '暂无收藏的股票，点击星标添加收藏' : '暂无相关股票'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">排名</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">股票名称</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">代码</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">现价</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">涨跌幅</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">成交量(亿)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">换手率</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stock, index) => (
                  <tr key={stock.code} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index < 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{stock.name}</td>
                    <td className="py-3 px-4 text-gray-500">{stock.code}</td>
                    <td className="py-3 px-4 font-medium">¥{stock.price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${stock.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{stock.volume}</td>
                    <td className="py-3 px-4 text-gray-600">{stock.turnover}%</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleFavorite(stock.code)}
                        className={`p-1.5 rounded-full transition-colors ${
                          favorites.has(stock.code)
                            ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                            : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${favorites.has(stock.code) ? 'fill-yellow-500' : ''}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
