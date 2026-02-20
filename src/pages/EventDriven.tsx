import { useState, useMemo } from 'react'
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
  AreaChart,
  Area,
} from 'recharts'
import {
  Calendar, Filter, Bell, Clock, TrendingUp, FileText, RefreshCw,
  Search, X, ChevronLeft, ChevronRight, Star, StarOff, AlertTriangle,
  Zap, Building, Newspaper, Users, Landmark, Factory, Eye, Settings,
  Plus, Check, Info
} from 'lucide-react'

// 事件类型配置
const eventTypesConfig = {
  earnings: { label: '财报发布', icon: FileText, color: 'blue' },
  dividend: { label: '分红派息', icon: TrendingUp, color: 'green' },
  meeting: { label: '股东大会', icon: Users, color: 'purple' },
  policy: { label: '政策事件', icon: Landmark, color: 'red' },
  industry: { label: '行业动态', icon: Factory, color: 'orange' },
  ipo: { label: 'IPO/增发', icon: Building, color: 'cyan' },
  merger: { label: '并购重组', icon: Zap, color: 'pink' },
  news: { label: '重大新闻', icon: Newspaper, color: 'yellow' },
}

// 2026年事件数据库
const eventsDatabase = [
  // 2月事件
  { id: 1, date: '2026-02-20', type: 'policy', company: '-', event: '央行2月LPR利率公布', impact: 'high', description: '贷款市场报价利率公布，影响市场资金成本预期', sector: '宏观', starred: true },
  { id: 2, date: '2026-02-21', type: 'earnings', company: '贵州茅台', event: '2025年度业绩快报', impact: 'high', description: '白酒龙头年度业绩预告，预计营收超1800亿', sector: '消费', starred: true },
  { id: 3, date: '2026-02-22', type: 'industry', company: '-', event: 'DeepSeek发布新一代大模型', impact: 'high', description: 'DeepSeek-V4发布，性能超越GPT-5', sector: 'AI', starred: true },
  { id: 4, date: '2026-02-23', type: 'dividend', company: '招商银行', event: '2025年度分红派息', impact: 'medium', description: '每10股派发现金红利18.5元', sector: '金融', starred: false },
  { id: 5, date: '2026-02-24', type: 'meeting', company: '宁德时代', event: '2026年第一次临时股东大会', impact: 'high', description: '审议新产能扩张计划及海外建厂事项', sector: '新能源', starred: true },
  { id: 6, date: '2026-02-25', type: 'ipo', company: '智谱科技', event: '科创板IPO', impact: 'high', description: '国产大模型龙头企业科创板上市', sector: 'AI', starred: true },
  { id: 7, date: '2026-02-26', type: 'policy', company: '-', event: '新能源汽车补贴政策发布', impact: 'high', description: '2026年新能源汽车购置补贴新政', sector: '新能源', starred: false },
  { id: 8, date: '2026-02-27', type: 'earnings', company: '比亚迪', event: '2025年度业绩预告', impact: 'high', description: '新能源汽车销量突破400万台，业绩超预期', sector: '新能源', starred: true },
  { id: 9, date: '2026-02-28', type: 'industry', company: '-', event: '人形机器人产业大会', impact: 'medium', description: '2026世界人形机器人大会在上海举办', sector: '机器人', starred: false },
  // 3月事件
  { id: 10, date: '2026-03-01', type: 'policy', company: '-', event: '两会开幕', impact: 'high', description: '全国两会开幕，关注政策方向', sector: '宏观', starred: true },
  { id: 11, date: '2026-03-03', type: 'merger', company: '中芯国际', event: '战略重组公告', impact: 'high', description: '芯片产业链整合，涉及多家上下游企业', sector: '半导体', starred: true },
  { id: 12, date: '2026-03-05', type: 'earnings', company: '腾讯控股', event: '2025年Q4财报', impact: 'high', description: '游戏及广告业务复苏，AI业务增长迅猛', sector: '互联网', starred: true },
  { id: 13, date: '2026-03-08', type: 'news', company: '特斯拉', event: '上海超级工厂扩产', impact: 'medium', description: '特斯拉上海工厂年产能提升至150万辆', sector: '新能源', starred: false },
  { id: 14, date: '2026-03-10', type: 'dividend', company: '中国神华', event: '特别分红公告', impact: 'medium', description: '煤炭龙头宣布特别分红方案', sector: '能源', starred: false },
  { id: 15, date: '2026-03-12', type: 'industry', company: '-', event: '半导体设备国产化突破', impact: 'high', description: '国产光刻机量产消息确认', sector: '半导体', starred: true },
]

// 历史事件数据
const historicalEventsDatabase = [
  { id: 101, date: '2026-02-18', company: '寒武纪', event: 'AI芯片新品发布', priceChange: 8.56, volumeChange: 245, type: 'industry' },
  { id: 102, date: '2026-02-15', company: '贵州茅台', event: '产品提价公告', priceChange: 4.12, volumeChange: 156, type: 'news' },
  { id: 103, date: '2026-02-12', company: '宁德时代', event: '固态电池量产', priceChange: 6.78, volumeChange: 198, type: 'industry' },
  { id: 104, date: '2026-02-10', company: '中芯国际', event: '先进制程突破', priceChange: 9.23, volumeChange: 312, type: 'news' },
  { id: 105, date: '2026-02-08', company: '比亚迪', event: '出海订单超预期', priceChange: 5.45, volumeChange: 178, type: 'earnings' },
  { id: 106, date: '2026-02-05', company: '隆基绿能', event: '产能调整公告', priceChange: -3.21, volumeChange: 89, type: 'news' },
  { id: 107, date: '2026-02-03', company: '招商银行', event: '息差收窄预警', priceChange: -2.15, volumeChange: 67, type: 'earnings' },
  { id: 108, date: '2026-01-28', company: '科大讯飞', event: 'AI应用场景拓展', priceChange: 7.89, volumeChange: 234, type: 'industry' },
]

// 生成事件影响数据
const generateEventImpactData = (eventType: string) => {
  const baseValue = 100
  const data = []

  for (let i = -10; i <= 10; i++) {
    let price = baseValue
    let volume = 100

    if (i < 0) {
      // 事件前
      price = baseValue + (Math.random() - 0.5) * 3
      volume = 100 + Math.random() * 20
    } else if (i === 0) {
      // 事件日
      price = baseValue + (eventType === 'policy' ? 2 : 1)
      volume = 180 + Math.random() * 40
    } else {
      // 事件后
      const drift = eventType === 'earnings' ? 0.3 : eventType === 'policy' ? 0.5 : 0.2
      price = baseValue + i * drift + (Math.random() - 0.3) * 2
      volume = 120 + Math.random() * 30 + (10 - i) * 5
    }

    data.push({
      day: i,
      price: Math.round(price * 100) / 100,
      volume: Math.round(volume),
      label: i === 0 ? '事件日' : i < 0 ? `T${i}` : `T+${i}`
    })
  }

  return data
}

export default function EventDriven() {
  // 状态管理
  const [selectedType, setSelectedType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1)) // 2026年2月
  const [selectedEvent, setSelectedEvent] = useState<typeof eventsDatabase[0] | null>(null)
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [showEventDetail, setShowEventDetail] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [starredEvents, setStarredEvents] = useState<number[]>([1, 2, 3, 5, 6, 8, 10, 11, 12, 15])
  const [subscriptions, setSubscriptions] = useState<string[]>(['earnings', 'policy'])
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [impactEventType, setImpactEventType] = useState('earnings')
  const [showImpactDetail, setShowImpactDetail] = useState(false)

  // 事件类型统计
  const eventTypeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: eventsDatabase.length }
    eventsDatabase.forEach(event => {
      counts[event.type] = (counts[event.type] || 0) + 1
    })
    return counts
  }, [])

  // 过滤事件
  const filteredEvents = useMemo(() => {
    return eventsDatabase.filter(event => {
      const matchType = selectedType === 'all' || event.type === selectedType
      const matchSearch = !searchQuery ||
        event.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.sector.toLowerCase().includes(searchQuery.toLowerCase())
      return matchType && matchSearch
    })
  }, [selectedType, searchQuery])

  // 即将发生的事件（按日期排序）
  const upcomingEvents = useMemo(() => {
    const today = new Date('2026-02-20')
    return filteredEvents
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 8)
  }, [filteredEvents])

  // 事件影响数据
  const eventImpactData = useMemo(() => {
    return generateEventImpactData(impactEventType)
  }, [impactEventType])

  // 日历数据
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    // 填充月初空白
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // 填充日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const dayEvents = eventsDatabase.filter(e => e.date === dateStr)
      days.push({ day: i, date: dateStr, events: dayEvents })
    }

    return days
  }, [currentMonth])

  // 刷新数据
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1500)
  }

  // 切换收藏
  const toggleStar = (eventId: number) => {
    setStarredEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  // 切换订阅
  const toggleSubscription = (type: string) => {
    setSubscriptions(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  // 获取影响颜色
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-600 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-600 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-600 border-green-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  // 获取类型样式
  const getTypeStyle = (type: string) => {
    const config = eventTypesConfig[type as keyof typeof eventTypesConfig]
    if (!config) return { bg: 'bg-gray-100', text: 'text-gray-600' }

    const colorMap: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
      red: { bg: 'bg-red-100', text: 'text-red-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
      cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    }

    return colorMap[config.color] || { bg: 'bg-gray-100', text: 'text-gray-600' }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">事件驱动</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              列表视图
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                viewMode === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              日历视图
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索事件、公司、板块..."
              className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowSubscribeModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-4 h-4" />
            订阅设置
            {subscriptions.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                {subscriptions.length}
              </span>
            )}
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? '刷新中...' : '刷新'}
          </button>
        </div>
      </div>

      {/* Event Type Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedType('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            selectedType === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          全部
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            selectedType === 'all' ? 'bg-blue-400' : 'bg-gray-100'
          }`}>
            {eventTypeCounts.all || 0}
          </span>
        </button>
        {Object.entries(eventTypesConfig).map(([type, config]) => {
          const Icon = config.icon
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {config.label}
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                selectedType === type ? 'bg-blue-400' : 'bg-gray-100'
              }`}>
                {eventTypeCounts[type] || 0}
              </span>
            </button>
          )
        })}
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-800">即将发生的事件</h2>
              </div>
              <span className="text-sm text-gray-400">共 {upcomingEvents.length} 条</span>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {upcomingEvents.map((event) => {
                const typeStyle = getTypeStyle(event.type)
                const typeConfig = eventTypesConfig[event.type as keyof typeof eventTypesConfig]
                return (
                  <div
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event)
                      setShowEventDetail(true)
                    }}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-center min-w-[45px]">
                        <div className="text-xs text-gray-400">{event.date.slice(5, 7)}月</div>
                        <div className="text-lg font-bold text-gray-800">{event.date.slice(8)}</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                          {event.event}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {event.company !== '-' ? event.company : '宏观事件'}
                          </span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-400">{event.sector}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleStar(event.id)
                        }}
                        className="p-1 hover:bg-white rounded transition-colors"
                      >
                        {starredEvents.includes(event.id) ? (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="w-4 h-4 text-gray-300 hover:text-yellow-500" />
                        )}
                      </button>
                      <span className={`px-2 py-1 text-xs rounded ${typeStyle.bg} ${typeStyle.text}`}>
                        {typeConfig?.label}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded border ${getImpactColor(event.impact)}`}>
                        {event.impact === 'high' ? '高影响' : event.impact === 'medium' ? '中影响' : '低影响'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Historical Events */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-800">历史事件回顾</h2>
              </div>
              <span className="text-sm text-gray-400">近期影响</span>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {historicalEventsDatabase.map((event) => {
                const typeStyle = getTypeStyle(event.type)
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{event.event}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">{event.company}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">{event.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 text-xs rounded ${typeStyle.bg} ${typeStyle.text}`}>
                        {eventTypesConfig[event.type as keyof typeof eventTypesConfig]?.label}
                      </span>
                      <div className="text-right">
                        <div className={`font-medium ${event.priceChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {event.priceChange >= 0 ? '+' : ''}{event.priceChange}%
                        </div>
                        <div className="text-xs text-gray-400">量 +{event.volumeChange}%</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
              </h2>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setCurrentMonth(new Date(2026, 1))}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              返回今天
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 日历格子 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayData, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-2 rounded-lg border ${
                  dayData ? 'bg-white border-gray-100 hover:border-blue-200' : 'bg-gray-50 border-transparent'
                }`}
              >
                {dayData && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      dayData.date === '2026-02-20' ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {dayData.day}
                      {dayData.date === '2026-02-20' && (
                        <span className="ml-1 text-xs text-blue-500">今天</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayData.events.slice(0, 2).map(event => {
                        const typeStyle = getTypeStyle(event.type)
                        return (
                          <div
                            key={event.id}
                            onClick={() => {
                              setSelectedEvent(event)
                              setShowEventDetail(true)
                            }}
                            className={`text-xs p-1 rounded truncate cursor-pointer ${typeStyle.bg} ${typeStyle.text} hover:opacity-80`}
                          >
                            {event.event.slice(0, 8)}...
                          </div>
                        )
                      })}
                      {dayData.events.length > 2 && (
                        <div className="text-xs text-gray-400 text-center">
                          +{dayData.events.length - 2} 更多
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Impact Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">事件影响分析</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">选择事件类型:</span>
            <select
              value={impactEventType}
              onChange={(e) => setImpactEventType(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(eventTypesConfig).map(([type, config]) => (
                <option key={type} value={type}>{config.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowImpactDetail(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Info className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">价格走势 (事件日=T)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={eventImpactData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={['auto', 'auto']} />
                  <Tooltip
                    formatter={(value: number) => [`${value}`, '价格指数']}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">成交量变化</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventImpactData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, '成交量']}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar
                    dataKey="volume"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 影响统计 */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <div className="text-sm text-blue-600">平均涨幅</div>
            <div className="text-xl font-bold text-blue-800">+3.45%</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <div className="text-sm text-green-600">胜率</div>
            <div className="text-xl font-bold text-green-800">72.5%</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg text-center">
            <div className="text-sm text-orange-600">平均持续</div>
            <div className="text-xl font-bold text-orange-800">5.2天</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <div className="text-sm text-purple-600">样本数</div>
            <div className="text-xl font-bold text-purple-800">128</div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventDetail && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[600px] shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">{selectedEvent.event}</h3>
                <button onClick={() => toggleStar(selectedEvent.id)}>
                  {starredEvents.includes(selectedEvent.id) ? (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <StarOff className="w-5 h-5 text-gray-300 hover:text-yellow-500" />
                  )}
                </button>
              </div>
              <button onClick={() => setShowEventDetail(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">事件日期</div>
                  <div className="text-lg font-semibold">{selectedEvent.date}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">相关公司</div>
                  <div className="text-lg font-semibold">
                    {selectedEvent.company !== '-' ? selectedEvent.company : '宏观事件'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className={`p-3 rounded-lg text-center ${getTypeStyle(selectedEvent.type).bg}`}>
                  <div className={`text-sm ${getTypeStyle(selectedEvent.type).text}`}>
                    {eventTypesConfig[selectedEvent.type as keyof typeof eventTypesConfig]?.label}
                  </div>
                </div>
                <div className={`p-3 rounded-lg text-center border ${getImpactColor(selectedEvent.impact)}`}>
                  <div className="text-sm">
                    {selectedEvent.impact === 'high' ? '高影响' : selectedEvent.impact === 'medium' ? '中影响' : '低影响'}
                  </div>
                </div>
                <div className="p-3 rounded-lg text-center bg-blue-50">
                  <div className="text-sm text-blue-600">{selectedEvent.sector}</div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-yellow-600 mb-1">事件描述</div>
                <div className="text-gray-800">{selectedEvent.description}</div>
              </div>

              {/* 历史相似事件影响 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-3">历史相似事件影响</div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">+4.2%</div>
                    <div className="text-xs text-gray-400">平均涨幅</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">68%</div>
                    <div className="text-xs text-gray-400">上涨概率</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">3天</div>
                    <div className="text-xs text-gray-400">影响持续</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    alert('已添加到日历提醒')
                    setShowEventDetail(false)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Bell className="w-4 h-4" />
                  设置提醒
                </button>
                <button
                  onClick={() => setShowEventDetail(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">事件订阅设置</h3>
              <button onClick={() => setShowSubscribeModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">选择您想要订阅的事件类型，我们将在事件发生前发送提醒通知。</p>

              <div className="space-y-2">
                {Object.entries(eventTypesConfig).map(([type, config]) => {
                  const Icon = config.icon
                  const isSubscribed = subscriptions.includes(type)
                  return (
                    <div
                      key={type}
                      onClick={() => toggleSubscription(type)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        isSubscribed ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isSubscribed ? 'text-blue-500' : 'text-gray-400'}`} />
                        <span className={isSubscribed ? 'text-blue-700 font-medium' : 'text-gray-700'}>
                          {config.label}
                        </span>
                      </div>
                      {isSubscribed ? (
                        <Check className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    提醒将在事件发生前1天通过站内消息推送
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubscribeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    alert(`已订阅 ${subscriptions.length} 种事件类型`)
                    setShowSubscribeModal(false)
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  保存设置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Impact Detail Modal */}
      {showImpactDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">事件影响分析说明</h3>
              <button onClick={() => setShowImpactDetail(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                事件影响分析基于历史数据统计，展示不同类型事件对股价和成交量的平均影响。
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-800">T-10 到 T-1</div>
                  <div className="text-sm text-blue-600">事件发生前10个交易日，市场预期形成阶段</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="font-medium text-red-800">T (事件日)</div>
                  <div className="text-sm text-red-600">事件正式发生，通常伴随最大波动</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-800">T+1 到 T+10</div>
                  <div className="text-sm text-green-600">事件后消化阶段，趋势逐渐形成</div>
                </div>
              </div>

              <button
                onClick={() => setShowImpactDetail(false)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
