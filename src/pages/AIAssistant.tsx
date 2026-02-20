import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles, Copy, ThumbsUp, ThumbsDown, RefreshCw, Settings, AlertCircle, CheckCircle } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: number
}

interface AISettings {
  deepseekApiKey: string
  deepseekModel: string
  deepseekBaseUrl: string
  aiTemperature: number
  aiMaxTokens: number
  aiSystemPrompt: string
}

const defaultSettings: AISettings = {
  deepseekApiKey: '',
  deepseekModel: 'deepseek-chat',
  deepseekBaseUrl: 'https://api.deepseek.com',
  aiTemperature: 0.7,
  aiMaxTokens: 2048,
  aiSystemPrompt: '你是一个专业的量化投资研究助理，擅长金融数据分析、投资策略研究、市场趋势解读。请用专业但易懂的方式回答用户的问题。',
}

const suggestedQuestions = [
  '分析贵州茅台的基本面情况',
  '比较宁德时代和比亚迪的估值',
  '推荐当前市场热门概念板块',
  '解释什么是夏普比率',
  '生成一个简单的双均线策略',
  '什么是量化投资的Alpha和Beta',
  '如何构建一个多因子选股模型',
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<AISettings>(defaultSettings)
  const [apiStatus, setApiStatus] = useState<'unconfigured' | 'configured' | 'error'>('unconfigured')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load settings from localStorage
  const loadSettingsFromStorage = () => {
    try {
      const savedSettings = localStorage.getItem('quantPlatformSettings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({
          deepseekApiKey: parsed.deepseekApiKey || '',
          deepseekModel: parsed.deepseekModel || 'deepseek-chat',
          deepseekBaseUrl: parsed.deepseekBaseUrl || 'https://api.deepseek.com',
          aiTemperature: parsed.aiTemperature ?? 0.7,
          aiMaxTokens: parsed.aiMaxTokens ?? 2048,
          aiSystemPrompt: parsed.aiSystemPrompt || defaultSettings.aiSystemPrompt,
        })
        setApiStatus(parsed.deepseekApiKey ? 'configured' : 'unconfigured')
      }
    } catch (e) {
      console.error('Failed to parse settings:', e)
    }
  }

  // 初始加载设置
  useEffect(() => {
    loadSettingsFromStorage()
  }, [])

  // 监听storage变化，当系统设置保存时自动更新
  useEffect(() => {
    const handleStorageChange = () => {
      loadSettingsFromStorage()
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    if (!settings.deepseekApiKey) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ **API未配置**\n\n请先在「系统设置」中配置DeepSeek API密钥才能使用AI助理功能。\n\n前往：侧边栏 → 系统设置 → AI配置',
        timestamp: Date.now(),
      }])
      return
    }

    const userMessage: Message = { role: 'user', content: inputValue, timestamp: Date.now() }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setStreamingContent('')

    // Create abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(`${settings.deepseekBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: settings.deepseekModel,
          messages: [
            { role: 'system', content: settings.aiSystemPrompt },
            ...messages.filter(m => m.role !== 'system').map(m => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: inputValue },
          ],
          temperature: settings.aiTemperature,
          max_tokens: settings.aiMaxTokens,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API请求失败: ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content || ''
                fullContent += content
                setStreamingContent(fullContent)
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }

      // Add the complete assistant message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fullContent || '抱歉，未能获取有效回复。',
        timestamp: Date.now(),
      }])
      setStreamingContent('')
      setApiStatus('configured')

    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was cancelled
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '请求已取消。',
          timestamp: Date.now(),
        }])
      } else {
        console.error('API Error:', error)
        setApiStatus('error')
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ **请求失败**\n\n${error.message || '网络错误，请检查API配置和网络连接。'}\n\n**排查建议：**\n1. 检查API密钥是否正确\n2. 检查网络连接\n3. 确认API余额是否充足`,
          timestamp: Date.now(),
        }])
      }
      setStreamingContent('')
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleSuggestionClick = (question: string) => {
    setInputValue(question)
  }

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (e) {
      console.error('Copy failed:', e)
    }
  }

  const handleRegenerate = async (index: number) => {
    // Find the user message before this assistant message
    const userMessageIndex = messages.slice(0, index).reverse().findIndex(m => m.role === 'user')
    if (userMessageIndex === -1) return

    const actualIndex = index - 1 - userMessageIndex
    const userMessage = messages[actualIndex]
    if (!userMessage) return

    // Remove messages from this point onwards and resend
    setMessages(messages.slice(0, index))
    setInputValue(userMessage.content)
    setTimeout(() => handleSend(), 100)
  }

  const handleClearChat = () => {
    setMessages([])
  }

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering
    let html = content
      .replace(/\n/g, '<br/>')
      .replace(/## (.*?)(<br\/>|$)/g, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/### (.*?)(<br\/>|$)/g, '<h4 class="text-base font-semibold mt-3 mb-1">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank">$1</a>')

    return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AI 投研助理</h1>
              <p className="text-sm text-gray-500">
                智能投研分析 · 策略建议 · 知识问答
                {settings.deepseekModel && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {settings.deepseekModel}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* API Status Indicator */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
              apiStatus === 'configured' ? 'bg-green-100 text-green-600' :
              apiStatus === 'error' ? 'bg-red-100 text-red-600' :
              'bg-yellow-100 text-yellow-600'
            }`}>
              {apiStatus === 'configured' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>
                {apiStatus === 'configured' ? 'API已连接' :
                 apiStatus === 'error' ? '连接异常' : '未配置API'}
              </span>
            </div>
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                清空对话
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && !streamingContent ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">您好，我是AI投研助理</h2>
            <p className="text-gray-400 mb-8 max-w-md">
              我可以帮助您进行市场分析、策略研究、投资知识问答。
              {!settings.deepseekApiKey && (
                <span className="block mt-2 text-yellow-600">
                  请先在「系统设置」中配置DeepSeek API密钥
                </span>
              )}
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-2xl">
              {suggestedQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(q)}
                  className="px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 hover:border-gray-300 transition-all text-left"
                >
                  <span className="text-blue-500 mr-2">→</span>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-blue-500'
                      : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div
                  className={`flex-1 max-w-3xl ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}
                >
                  <div
                    className={`inline-block p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-100 text-gray-800 shadow-sm'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      renderMarkdown(message.content)
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  {message.role === 'assistant' && (
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => handleCopy(message.content, index)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          copiedIndex === index
                            ? 'text-green-500 bg-green-50'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                        title="复制"
                      >
                        {copiedIndex === index ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="有帮助">
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="没帮助">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRegenerate(index)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="重新生成"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Streaming Response */}
            {streamingContent && (
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 max-w-3xl">
                  <div className="inline-block p-4 rounded-2xl bg-white border border-gray-100 text-gray-800 shadow-sm">
                    {renderMarkdown(streamingContent)}
                    <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1"></span>
                  </div>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && !streamingContent && (
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Suggested Questions */}
      {messages.length > 0 && !isLoading && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {suggestedQuestions.slice(0, 4).map((q, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(q)}
                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-sm whitespace-nowrap hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={settings.deepseekApiKey ? "输入您的问题..." : "请先在系统设置中配置API密钥"}
              disabled={!settings.deepseekApiKey}
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
          {isLoading ? (
            <button
              onClick={handleStop}
              className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
              停止
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || !settings.deepseekApiKey}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              发送
            </button>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-400 text-center">
          按 Enter 发送消息 · AI回复仅供参考，投资需谨慎
        </div>
      </div>
    </div>
  )
}
