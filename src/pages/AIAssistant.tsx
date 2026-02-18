import { useState } from 'react'
import { Send, Bot, User, Sparkles, Copy, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react'

const suggestedQuestions = [
  '分析贵州茅台的基本面情况',
  '比较宁德时代和比亚迪的估值',
  '推荐当前市场热门概念板块',
  '解释什么是夏普比率',
  '生成一个简单的双均线策略',
]

const chatHistory = [
  {
    role: 'user',
    content: '请帮我分析一下新能源板块近期的走势',
  },
  {
    role: 'assistant',
    content: `## 新能源板块近期走势分析

### 整体表现
近一个月，新能源板块呈现震荡上行态势，板块指数上涨约8.5%，跑赢大盘约3个百分点。

### 主要驱动因素
1. **政策利好**：国家出台新能源汽车购置税减免政策延续至2025年
2. **产业数据**：12月新能源汽车销量达到120万辆，同比增长35%
3. **技术突破**：固态电池研发取得新进展

### 龙头股表现
| 股票 | 涨跌幅 | 成交量变化 |
|------|--------|------------|
| 宁德时代 | +12.3% | +45% |
| 比亚迪 | +9.8% | +38% |
| 隆基绿能 | +6.5% | +22% |

### 建议
- 短期可关注回调买入机会
- 重点关注电池技术创新领先企业
- 警惕板块过热风险，注意仓位控制`,
  },
]

export default function AIAssistant() {
  const [messages, setMessages] = useState(chatHistory)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = () => {
    if (!inputValue.trim()) return

    setMessages([...messages, { role: 'user', content: inputValue }])
    setInputValue('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '感谢您的问题！我正在分析相关数据，请稍候...\n\n这是一个模拟的AI回复。在实际应用中，这里会连接到AI后端服务，提供专业的投研分析。',
        },
      ])
      setIsLoading(false)
    }, 1500)
  }

  const handleSuggestionClick = (question: string) => {
    setInputValue(question)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">AI 投研助理</h1>
            <p className="text-sm text-gray-500">智能投研分析 · 策略建议 · 知识问答</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">您好，我是AI投研助理</h2>
            <p className="text-gray-400 mb-6">我可以帮助您进行市场分析、策略研究和投资问答</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {suggestedQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(q)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-blue-500'
                    : 'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`flex-1 max-w-3xl ${
                  message.role === 'user' ? 'text-right' : ''
                }`}
              >
                <div
                  className={`inline-block p-4 rounded-xl ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-100 text-gray-800'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br/>').replace(/## /g, '<h3>').replace(/### /g, '<h4>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
                {message.role === 'assistant' && (
                  <div className="flex gap-2 mt-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-green-500">
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-500">
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-blue-500">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {messages.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100">
          <div className="flex gap-2 overflow-x-auto">
            {suggestedQuestions.slice(0, 3).map((q, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(q)}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm whitespace-nowrap hover:bg-gray-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex gap-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入您的问题..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
