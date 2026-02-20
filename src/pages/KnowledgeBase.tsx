import { useState, useEffect } from 'react'
import { Search, Book, FileText, Video, Link as LinkIcon, Star, Clock, ChevronRight, Folder, Plus, X, Edit2, Trash2, Eye, ChevronLeft, ExternalLink, Save, Tag } from 'lucide-react'

interface Article {
  id: number
  title: string
  category: string
  type: 'article' | 'video' | 'link'
  content: string
  views: number
  starred: boolean
  date: string
  url?: string
  tags?: string[]
}

interface RecentItem {
  id: number
  title: string
  time: number
}

const defaultCategories = [
  { id: 'all', name: '全部' },
  { id: 'strategy', name: '交易策略' },
  { id: 'analysis', name: '技术分析' },
  { id: 'fundamental', name: '基本面分析' },
  { id: 'risk', name: '风险管理' },
  { id: 'quant', name: '量化方法' },
]

const defaultArticles: Article[] = [
  {
    id: 1,
    title: '双均线策略详解：从原理到实践',
    category: '交易策略',
    type: 'article',
    content: `## 双均线策略概述

双均线策略是最经典的趋势跟踪策略之一，通过两条不同周期的移动平均线的交叉来判断买卖时机。

### 核心原理

1. **快线（短期均线）**：反映近期价格走势，对价格变化敏感
2. **慢线（长期均线）**：反映长期价格走势，相对平滑

### 交易信号

- **金叉（买入信号）**：快线从下向上穿越慢线
- **死叉（卖出信号）**：快线从上向下穿越慢线

### 常用参数组合

| 策略类型 | 快线周期 | 慢线周期 |
|---------|---------|---------|
| 短线 | 5日 | 10日 |
| 中线 | 10日 | 30日 |
| 长线 | 20日 | 60日 |

### Python实现示例

\`\`\`python
def dual_ma_strategy(prices, fast_period=10, slow_period=30):
    fast_ma = prices.rolling(fast_period).mean()
    slow_ma = prices.rolling(slow_period).mean()

    signals = pd.Series(index=prices.index, data=0)
    signals[fast_ma > slow_ma] = 1  # 多头
    signals[fast_ma < slow_ma] = -1  # 空头

    return signals
\`\`\`

### 优缺点分析

**优点**：
- 简单易懂，容易实现
- 能够捕捉大趋势
- 风险可控

**缺点**：
- 震荡市场容易产生虚假信号
- 存在滞后性
- 参数敏感`,
    views: 1256,
    starred: true,
    date: '2024-01-10',
    tags: ['均线', '趋势跟踪', '入门'],
  },
  {
    id: 2,
    title: 'MACD指标的高级应用技巧',
    category: '技术分析',
    type: 'article',
    content: `## MACD指标详解

MACD（Moving Average Convergence Divergence）是最常用的技术指标之一。

### 计算方法

- DIF = 12日EMA - 26日EMA
- DEA = DIF的9日EMA
- MACD柱 = 2 × (DIF - DEA)

### 高级用法

1. **顶背离**：价格创新高，MACD未创新高 → 卖出信号
2. **底背离**：价格创新低，MACD未创新低 → 买入信号
3. **零轴判断**：DIF在零轴上方为多头市场

### 实战技巧

结合成交量和其他指标使用，提高准确率。`,
    views: 987,
    starred: false,
    date: '2024-01-08',
    tags: ['MACD', '技术指标', '背离'],
  },
  {
    id: 3,
    title: '如何分析上市公司财务报表',
    category: '基本面分析',
    type: 'video',
    content: `## 财务报表分析要点

本视频将系统讲解如何分析上市公司的三大财务报表。

### 视频大纲

1. 资产负债表分析（15分钟）
2. 利润表分析（20分钟）
3. 现金流量表分析（15分钟）
4. 综合案例分析（30分钟）

### 核心指标

- ROE（净资产收益率）
- 毛利率
- 资产负债率
- 经营现金流/净利润`,
    views: 2345,
    starred: true,
    date: '2024-01-05',
    url: 'https://example.com/video/financial-analysis',
    tags: ['财报', '基本面', '价值投资'],
  },
  {
    id: 4,
    title: 'VaR模型在风险控制中的应用',
    category: '风险管理',
    type: 'article',
    content: `## VaR（Value at Risk）模型

VaR是衡量投资组合潜在损失的重要指标。

### 定义

在给定置信水平下，投资组合在特定时间内可能遭受的最大损失。

### 计算方法

1. **历史模拟法**
2. **方差-协方差法**
3. **蒙特卡洛模拟法**

### Python实现

\`\`\`python
import numpy as np

def calculate_var(returns, confidence=0.95):
    return np.percentile(returns, (1 - confidence) * 100)
\`\`\``,
    views: 756,
    starred: false,
    date: '2024-01-03',
    tags: ['VaR', '风控', '量化'],
  },
  {
    id: 5,
    title: '因子投资入门指南',
    category: '量化方法',
    type: 'article',
    content: `## 因子投资概述

因子投资是一种基于特定因子（如价值、动量、规模等）来构建投资组合的方法。

### 常见因子

1. **价值因子**：PE、PB、PS等
2. **动量因子**：过去收益率
3. **规模因子**：市值
4. **质量因子**：ROE、毛利率
5. **波动率因子**：历史波动率

### 多因子模型

结合多个因子进行选股，提高策略稳定性。`,
    views: 1567,
    starred: true,
    date: '2024-01-01',
    tags: ['因子', '多因子', '选股'],
  },
]

const popularTopics = [
  '量化交易', 'Alpha因子', '机器学习', '风险平价',
  '高频交易', '套利策略', '事件驱动', '趋势跟踪',
]

// 加载数据
const loadData = () => {
  const saved = localStorage.getItem('knowledgeBaseData')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return null
    }
  }
  return null
}

// 保存数据
const saveData = (articles: Article[], recentViewed: RecentItem[]) => {
  localStorage.setItem('knowledgeBaseData', JSON.stringify({ articles, recentViewed }))
}

// 格式化时间
const formatTime = (timestamp: number) => {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

export default function KnowledgeBase() {
  const [articles, setArticles] = useState<Article[]>(() => {
    const data = loadData()
    return data?.articles || defaultArticles
  })
  const [recentViewed, setRecentViewed] = useState<RecentItem[]>(() => {
    const data = loadData()
    return data?.recentViewed || []
  })
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

  // 保存数据到localStorage
  useEffect(() => {
    saveData(articles, recentViewed)
  }, [articles, recentViewed])

  // 获取分类计数
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return articles.length
    const categoryName = defaultCategories.find(c => c.id === categoryId)?.name
    return articles.filter(a => a.category === categoryName).length
  }

  // 过滤文章
  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' ||
      article.category === defaultCategories.find(c => c.id === selectedCategory)?.name
    const matchesSearch = !searchTerm ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // 查看文章
  const handleViewArticle = (article: Article) => {
    // 增加阅读量
    setArticles(prev => prev.map(a =>
      a.id === article.id ? { ...a, views: a.views + 1 } : a
    ))
    // 添加到最近浏览
    setRecentViewed(prev => {
      const filtered = prev.filter(r => r.id !== article.id)
      return [{ id: article.id, title: article.title, time: Date.now() }, ...filtered].slice(0, 10)
    })
    setSelectedArticle({ ...article, views: article.views + 1 })
  }

  // 切换收藏
  const handleToggleStar = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setArticles(prev => prev.map(a =>
      a.id === id ? { ...a, starred: !a.starred } : a
    ))
    if (selectedArticle?.id === id) {
      setSelectedArticle(prev => prev ? { ...prev, starred: !prev.starred } : null)
    }
  }

  // 删除文章
  const handleDelete = (id: number) => {
    setArticles(prev => prev.filter(a => a.id !== id))
    setRecentViewed(prev => prev.filter(r => r.id !== id))
    setShowDeleteConfirm(null)
    if (selectedArticle?.id === id) {
      setSelectedArticle(null)
    }
  }

  // 保存文章
  const handleSaveArticle = () => {
    if (!editingArticle?.title || !editingArticle?.content) return

    if (editingArticle.id) {
      // 编辑现有文章
      setArticles(prev => prev.map(a =>
        a.id === editingArticle.id ? { ...a, ...editingArticle as Article } : a
      ))
    } else {
      // 新建文章
      const newArticle: Article = {
        id: Date.now(),
        title: editingArticle.title,
        category: editingArticle.category || '交易策略',
        type: editingArticle.type || 'article',
        content: editingArticle.content,
        views: 0,
        starred: false,
        date: new Date().toISOString().split('T')[0],
        url: editingArticle.url,
        tags: editingArticle.tags,
      }
      setArticles(prev => [newArticle, ...prev])
    }
    setShowEditor(false)
    setEditingArticle(null)
  }

  // 打开编辑器
  const openEditor = (article?: Article) => {
    setEditingArticle(article || { type: 'article', category: '交易策略', tags: [] })
    setShowEditor(true)
  }

  // 处理标签输入
  const handleTagInput = (value: string) => {
    const tags = value.split(/[,，、\s]+/).filter(t => t.trim())
    setEditingArticle(prev => prev ? { ...prev, tags } : null)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="w-4 h-4 text-blue-500" />
      case 'video': return <Video className="w-4 h-4 text-red-500" />
      case 'link': return <LinkIcon className="w-4 h-4 text-green-500" />
      default: return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  // 简单的Markdown渲染
  const renderMarkdown = (content: string, key?: string | number) => {
    let html = content
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-800">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-8 mb-4 text-gray-800 border-b pb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600">$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm"><code>$2</code></pre>')
      .replace(/^\- (.*$)/gm, '<li class="ml-4 list-disc text-gray-600">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal text-gray-600">$1</li>')
      .replace(/\n\n/g, '</p><p class="my-4 text-gray-600 leading-relaxed">')
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(c => c.trim())
        return `<tr>${cells.map(c => `<td class="border px-3 py-2">${c.trim()}</td>`).join('')}</tr>`
      })

    return (
      <div
        key={key}
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: `<div class="text-gray-600 leading-relaxed">${html}</div>` }}
      />
    )
  }

  // 文章详情视图
  if (selectedArticle) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            返回列表
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggleStar(selectedArticle.id)}
              className={`p-2 rounded-lg transition-colors ${
                selectedArticle.starred ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <Star className={`w-5 h-5 ${selectedArticle.starred ? 'fill-yellow-400' : ''}`} />
            </button>
            <button
              onClick={() => openEditor(selectedArticle)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            {selectedArticle.url && (
              <a
                href={selectedArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {selectedArticle.type === 'video' ? '观看视频' : '打开链接'}
              </a>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            {getTypeIcon(selectedArticle.type)}
            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
              {selectedArticle.category}
            </span>
            <span className="text-gray-400 text-sm">{selectedArticle.date}</span>
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <Eye className="w-4 h-4" /> {selectedArticle.views}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-6">{selectedArticle.title}</h1>

          {selectedArticle.tags && selectedArticle.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-4 h-4 text-gray-400" />
              {selectedArticle.tags.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="border-t pt-6">
            {renderMarkdown(selectedArticle.content, selectedArticle.id)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">知识库</h1>
        <div className="flex items-center gap-3">
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
          <button
            onClick={() => openEditor()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建知识
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {defaultCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat.name} ({getCategoryCount(cat.id)})
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Articles List */}
        <div className="col-span-2 space-y-4">
          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
              <Book className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无相关内容</p>
              <button
                onClick={() => openEditor()}
                className="mt-4 text-blue-500 hover:text-blue-600"
              >
                创建第一篇知识文档
              </button>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => handleViewArticle(article)}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getTypeIcon(article.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                        <span className="px-2 py-0.5 bg-gray-100 rounded">{article.category}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {article.views}
                        </span>
                        <span>{article.date}</span>
                      </div>
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex gap-1.5">
                          {article.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleStar(article.id, e)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                    >
                      <Star className={`w-5 h-5 ${article.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditor(article) }}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(article.id) }}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Viewed */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-800">最近浏览</h3>
            </div>
            {recentViewed.length === 0 ? (
              <p className="text-sm text-gray-400">暂无浏览记录</p>
            ) : (
              <div className="space-y-3">
                {recentViewed.slice(0, 5).map((item) => {
                  const article = articles.find(a => a.id === item.id)
                  if (!article) return null
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleViewArticle(article)}
                      className="flex items-center justify-between text-sm hover:text-blue-600 cursor-pointer"
                    >
                      <span className="text-gray-600 truncate flex-1">{item.title}</span>
                      <span className="text-gray-400 text-xs ml-2">{formatTime(item.time)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Starred */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-gray-800">我的收藏</h3>
            </div>
            {articles.filter(a => a.starred).length === 0 ? (
              <p className="text-sm text-gray-400">暂无收藏</p>
            ) : (
              <div className="space-y-3">
                {articles.filter(a => a.starred).slice(0, 5).map((article) => (
                  <div
                    key={article.id}
                    onClick={() => handleViewArticle(article)}
                    className="flex items-center text-sm hover:text-blue-600 cursor-pointer"
                  >
                    <span className="text-gray-600 truncate">{article.title}</span>
                  </div>
                ))}
              </div>
            )}
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
                  onClick={() => setSearchTerm(topic)}
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

      {/* Editor Modal */}
      {showEditor && editingArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingArticle.id ? '编辑知识' : '新建知识'}
              </h2>
              <button
                onClick={() => { setShowEditor(false); setEditingArticle(null) }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">标题 *</label>
                <input
                  type="text"
                  value={editingArticle.title || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  placeholder="输入知识标题..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">分类</label>
                  <select
                    value={editingArticle.category || '交易策略'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {defaultCategories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">类型</label>
                  <select
                    value={editingArticle.type || 'article'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, type: e.target.value as Article['type'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="article">文章</option>
                    <option value="video">视频</option>
                    <option value="link">链接</option>
                  </select>
                </div>
              </div>

              {(editingArticle.type === 'video' || editingArticle.type === 'link') && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    {editingArticle.type === 'video' ? '视频链接' : '外部链接'}
                  </label>
                  <input
                    type="url"
                    value={editingArticle.url || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">标签</label>
                <input
                  type="text"
                  value={editingArticle.tags?.join(', ') || ''}
                  onChange={(e) => handleTagInput(e.target.value)}
                  placeholder="输入标签，用逗号分隔..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">内容 * (支持Markdown)</label>
                <textarea
                  value={editingArticle.content || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  placeholder="输入知识内容，支持Markdown格式..."
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => { setShowEditor(false); setEditingArticle(null) }}
                className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveArticle}
                disabled={!editingArticle.title || !editingArticle.content}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">确认删除</h3>
            <p className="text-gray-600 mb-6">确定要删除这篇知识文档吗？此操作无法撤销。</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
