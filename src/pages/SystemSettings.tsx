import { useState, useEffect } from 'react'
import { Save, Bell, Shield, Database, Palette, Globe, User, Key, Monitor, Eye, EyeOff, CheckCircle, AlertCircle, Bot, Zap } from 'lucide-react'

const settingsSections = [
  { id: 'general', label: '通用设置', icon: Monitor },
  { id: 'account', label: '账户安全', icon: User },
  { id: 'notification', label: '通知设置', icon: Bell },
  { id: 'data', label: '数据设置', icon: Database },
  { id: 'ai', label: 'AI配置', icon: Bot },
  { id: 'api', label: 'API配置', icon: Key },
  { id: 'appearance', label: '外观设置', icon: Palette },
]

// 默认设置
const defaultSettings = {
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  theme: 'light',
  autoRefresh: true,
  refreshInterval: 30,
  emailNotification: true,
  pushNotification: true,
  riskAlert: true,
  dataRetention: 365,
  apiKey: 'sk-xxxx-xxxx-xxxx',
  // AI相关设置
  deepseekApiKey: '',
  deepseekModel: 'deepseek-chat',
  deepseekBaseUrl: 'https://api.deepseek.com',
  aiTemperature: 0.7,
  aiMaxTokens: 2048,
  aiSystemPrompt: '你是一个专业的量化投资研究助理，擅长金融数据分析、投资策略研究、市场趋势解读。请用专业但易懂的方式回答用户的问题。',
}

export default function SystemSettings() {
  const [activeSection, setActiveSection] = useState('general')
  const [settings, setSettings] = useState(defaultSettings)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showDeepseekKey, setShowDeepseekKey] = useState(false)
  const [testingApi, setTestingApi] = useState(false)
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // 组件挂载后从localStorage加载设置
  useEffect(() => {
    try {
      const saved = localStorage.getItem('quantPlatformSettings')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings({ ...defaultSettings, ...parsed })
      }
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
    setIsLoaded(true)
  }, [])

  // 保存设置到localStorage
  const handleSave = () => {
    try {
      localStorage.setItem('quantPlatformSettings', JSON.stringify(settings))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
      // 触发storage事件，通知其他组件设置已更新
      window.dispatchEvent(new Event('storage'))
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }

  // 测试DeepSeek API连接
  const testDeepseekApi = async () => {
    if (!settings.deepseekApiKey) {
      setApiTestResult({ success: false, message: '请先输入API密钥' })
      return
    }

    setTestingApi(true)
    setApiTestResult(null)

    try {
      const response = await fetch(`${settings.deepseekBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: settings.deepseekModel,
          messages: [{ role: 'user', content: '你好，请用一句话确认连接成功' }],
          max_tokens: 50,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.choices && data.choices[0]) {
          setApiTestResult({ success: true, message: `连接成功！模型响应: ${data.choices[0].message.content.slice(0, 50)}...` })
        } else {
          setApiTestResult({ success: true, message: '连接成功！' })
        }
      } else {
        const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
        setApiTestResult({ success: false, message: `连接失败: ${error.error?.message || response.statusText}` })
      }
    } catch (error) {
      setApiTestResult({ success: false, message: `连接失败: ${error instanceof Error ? error.message : '网络错误'}` })
    } finally {
      setTestingApi(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">系统设置</h1>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {saveSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? '已保存' : '保存设置'}</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {settingsSections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="col-span-3 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          {activeSection === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">通用设置</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">语言</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">时区</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Asia/Shanghai">亚洲/上海 (UTC+8)</option>
                    <option value="America/New_York">美国/纽约 (UTC-5)</option>
                    <option value="Europe/London">欧洲/伦敦 (UTC+0)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800">自动刷新数据</div>
                    <div className="text-sm text-gray-500">自动更新行情和持仓数据</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoRefresh}
                      onChange={(e) => setSettings({ ...settings, autoRefresh: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                {settings.autoRefresh && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      刷新间隔 (秒)
                    </label>
                    <input
                      type="number"
                      value={settings.refreshInterval}
                      onChange={(e) => setSettings({ ...settings, refreshInterval: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'account' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">账户安全</h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-800">用户信息</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">用户名:</span>
                      <span className="ml-2 text-gray-800">admin</span>
                    </div>
                    <div>
                      <span className="text-gray-500">邮箱:</span>
                      <span className="ml-2 text-gray-800">admin@example.com</span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  修改密码
                </button>

                <button className="w-full py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  启用两步验证
                </button>
              </div>
            </div>
          )}

          {activeSection === 'notification' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">通知设置</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">邮件通知</div>
                    <div className="text-sm text-gray-500">接收重要事件的邮件通知</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotification}
                      onChange={(e) => setSettings({ ...settings, emailNotification: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">推送通知</div>
                    <div className="text-sm text-gray-500">浏览器推送通知</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushNotification}
                      onChange={(e) => setSettings({ ...settings, pushNotification: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">风险预警</div>
                    <div className="text-sm text-gray-500">当触发风险阈值时立即通知</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.riskAlert}
                      onChange={(e) => setSettings({ ...settings, riskAlert: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">数据设置</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    数据保留期限 (天)
                  </label>
                  <input
                    type="number"
                    value={settings.dataRetention}
                    onChange={(e) => setSettings({ ...settings, dataRetention: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="font-medium text-yellow-800 mb-1">数据存储空间</div>
                  <div className="text-sm text-yellow-700">
                    已使用 12.5 GB / 50 GB (25%)
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>

                <button className="w-full py-3 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                  清除缓存数据
                </button>
              </div>
            </div>
          )}

          {/* AI配置 - 新增 */}
          {activeSection === 'ai' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">AI 助理配置</h2>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-purple-600 font-medium">DeepSeek AI</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Bot className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800">配置说明</div>
                    <div className="text-sm text-blue-700 mt-1">
                      配置 DeepSeek API 密钥后，AI 投研助理将使用真实的 AI 模型进行对话。
                      您可以在 <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="underline">DeepSeek 开放平台</a> 获取 API 密钥。
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* DeepSeek API 密钥 */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    DeepSeek API 密钥 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showDeepseekKey ? 'text' : 'password'}
                        value={settings.deepseekApiKey}
                        onChange={(e) => setSettings({ ...settings, deepseekApiKey: e.target.value })}
                        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDeepseekKey(!showDeepseekKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showDeepseekKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={testDeepseekApi}
                      disabled={testingApi}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {testingApi ? '测试中...' : '测试连接'}
                    </button>
                  </div>
                  {apiTestResult && (
                    <div className={`mt-2 p-3 rounded-lg flex items-center gap-2 ${
                      apiTestResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {apiTestResult.success ? (
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="text-sm">{apiTestResult.message}</span>
                    </div>
                  )}
                </div>

                {/* API 基础URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">API 基础 URL</label>
                  <input
                    type="text"
                    value={settings.deepseekBaseUrl}
                    onChange={(e) => setSettings({ ...settings, deepseekBaseUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">默认为 DeepSeek 官方 API 地址，如需使用代理可修改</p>
                </div>

                {/* 模型选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">模型选择</label>
                  <select
                    value={settings.deepseekModel}
                    onChange={(e) => setSettings({ ...settings, deepseekModel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="deepseek-chat">DeepSeek Chat (推荐)</option>
                    <option value="deepseek-coder">DeepSeek Coder</option>
                    <option value="deepseek-reasoner">DeepSeek Reasoner</option>
                  </select>
                </div>

                {/* 高级参数 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      温度 (Temperature)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={settings.aiTemperature}
                      onChange={(e) => setSettings({ ...settings, aiTemperature: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">0-2，值越高回答越随机</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      最大令牌数 (Max Tokens)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="8192"
                      value={settings.aiMaxTokens}
                      onChange={(e) => setSettings({ ...settings, aiMaxTokens: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">单次回复最大长度</p>
                  </div>
                </div>

                {/* 系统提示词 */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">系统提示词 (System Prompt)</label>
                  <textarea
                    value={settings.aiSystemPrompt}
                    onChange={(e) => setSettings({ ...settings, aiSystemPrompt: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="定义 AI 助理的角色和行为..."
                  />
                  <p className="text-xs text-gray-500 mt-1">定义 AI 助理的角色、专业领域和回答风格</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">API配置</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">平台 API 密钥</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={settings.apiKey}
                        readOnly
                        className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      重新生成
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-800 mb-2">API使用统计</div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">今日调用</div>
                      <div className="text-lg font-bold text-gray-800">1,234</div>
                    </div>
                    <div>
                      <div className="text-gray-500">本月调用</div>
                      <div className="text-lg font-bold text-gray-800">45,678</div>
                    </div>
                    <div>
                      <div className="text-gray-500">剩余配额</div>
                      <div className="text-lg font-bold text-green-600">954,322</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">外观设置</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">主题</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['light', 'dark', 'system'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setSettings({ ...settings, theme })}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          settings.theme === theme
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-800 capitalize">
                          {theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '跟随系统'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
