import {
  TrendingUp,
  BookOpen,
  LayoutGrid,
  Heart,
  Settings2,
  Briefcase,
  Smile,
  Clock,
  Shield,
  Database,
  FileBox,
  Bot,
  Library,
  Settings,
  Search
} from 'lucide-react'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

const menuItems = [
  { id: 'market-analysis', label: '行情分析', icon: TrendingUp },
  { id: 'stock-search', label: '自选股查询', icon: Search },
  { id: 'stock-backtest', label: '单股回测', icon: BookOpen },
  { id: 'sector-analysis', label: '板块分析', icon: LayoutGrid },
  { id: 'hotspot-tracking', label: '热点追踪', icon: Heart },
  { id: 'strategy-backtest', label: '策略回测', icon: Settings2 },
  { id: 'portfolio-management', label: '组合管理', icon: Briefcase },
  { id: 'market-sentiment', label: '市场情绪', icon: Smile },
  { id: 'event-driven', label: '事件驱动', icon: Clock },
  { id: 'risk-management', label: '风险管理', icon: Shield },
  { id: 'data-center', label: '数据中心', icon: Database },
  { id: 'factor-library', label: '因子库', icon: FileBox },
  { id: 'ai-assistant', label: 'AI助理', icon: Bot },
  { id: 'knowledge-base', label: '知识库', icon: Library },
  { id: 'system-settings', label: '系统设置', icon: Settings },
]

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">智</span>
        </div>
        <span className="text-lg font-semibold text-gray-800">智能投研平台</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="text-xs text-gray-400 text-center">
          © 2024 智能投研平台
        </div>
      </div>
    </aside>
  )
}
