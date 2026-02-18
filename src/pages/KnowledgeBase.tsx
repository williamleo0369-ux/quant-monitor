import { useState } from 'react'
import { Search, Book, FileText, Video, Link, Star, Clock, ChevronRight, Folder } from 'lucide-react'

const categories = [
  { id: 'all', name: '全部', count: 156 },
  { id: 'strategy', name: '交易策略', count: 45 },
  { id: 'analysis', name: '技术分析', count: 32 },
  { id: 'fundamental', name: '基本面分析', count: 28 },
  { id: 'risk', name: '风险管理', count: 23 },
  { id: 'quant', name: '量化方法', count: 28 },
]

const articles = [
  {
    id: 1,
    title: '双均线策略详解：从原理到实践',
    category: '交易策略',
    type: 'article',
    views: 1256,
    starred: true,
    date: '2024-01-10',
  },
  {
    id: 2,
    title: 'MACD指标的高级应用技巧',
    category: '技术分析',
    type: 'article',
    views: 987,
    starred: false,
    date: '2024-01-08',
  },
  {
    id: 3,
    title: '如何分析上市公司财务报表',
    category: '基本面分析',
    type: 'video',
    views: 2345,
    starred: true,
    date: '2024-01-05',
  },
  {
    id: 4,
    title: 'VaR模型在风险控制中的应用',
    category: '风险管理',
    type: 'article',
    views: 756,
    starred: false,
    date: '2024-01-03',
  },
  {
    id: 5,
    title: '因子投资入门指南',
    category: '量化方法',
    type: 'article',
    views: 1567,
    starred: true,
    date: '2024-01-01',
  },
]

const recentViewed = [
  { title: '动量因子研究报告', time: '10分钟前' },
  { title: '沪深300指数历史分析', time: '1小时前' },
  { title: '期权定价模型详解', time: '3小时前' },
]

const popularTopics = [
  '量化交易', 'Alpha因子', '机器学习', '风险平价',
  '高频交易', '套利策略', '事件驱动', '趋势跟踪',
]

export default function KnowledgeBase() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="w-4 h-4 text-blue-500" />
      case 'video': return <Video className="w-4 h-4 text-red-500" />
      case 'link': return <Link className="w-4 h-4 text-green-500" />
      default: return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">知识库</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索知识库..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Articles List */}
        <div className="col-span-2 space-y-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getTypeIcon(article.type)}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1 hover:text-blue-600">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded">{article.category}</span>
                      <span>{article.views} 阅读</span>
                      <span>{article.date}</span>
                    </div>
                  </div>
                </div>
                <button className="text-gray-300 hover:text-yellow-500">
                  <Star className={`w-5 h-5 ${article.starred ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Viewed */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-800">最近浏览</h3>
            </div>
            <div className="space-y-3">
              {recentViewed.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm hover:text-blue-600 cursor-pointer"
                >
                  <span className="text-gray-600">{item.title}</span>
                  <span className="text-gray-400 text-xs">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Topics */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Book className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-800">热门主题</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTopics.map((topic, index) => (
                <button
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-blue-100 hover:text-blue-600 transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Folder className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-800">快速导航</h3>
            </div>
            <div className="space-y-2">
              {['入门教程', '策略模板', 'API文档', '常见问题'].map((link, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <span className="text-gray-600">{link}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
