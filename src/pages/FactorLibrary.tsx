import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  BarChart,
  Bar,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Plus,
  Search,
  Star,
  TrendingUp,
  Zap,
  X,
  Download,
  RefreshCw,
  Copy,
  Play,
  Settings,
  Trash2,
  Edit3,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Eye,
  GitCompare,
} from 'lucide-react';

// 因子类别配置
const factorCategoriesConfig: Record<string, { label: string; color: string; description: string }> = {
  value: { label: '价值因子', color: 'blue', description: '基于估值指标的因子' },
  momentum: { label: '动量因子', color: 'green', description: '基于价格动量的因子' },
  quality: { label: '质量因子', color: 'purple', description: '基于盈利质量的因子' },
  growth: { label: '成长因子', color: 'orange', description: '基于成长性的因子' },
  volatility: { label: '波动因子', color: 'red', description: '基于波动率的因子' },
  technical: { label: '技术因子', color: 'cyan', description: '基于技术指标的因子' },
};

// 因子数据库
const factorsDatabase = [
  {
    id: 1,
    name: 'PE_TTM',
    fullName: '滚动市盈率',
    category: 'value',
    ic: 0.048,
    ir: 1.35,
    turnover: 0.12,
    icWinRate: 0.65,
    starred: true,
    description: '过去12个月净利润计算的市盈率倒数',
    formula: '1 / (Price / EPS_TTM)',
    updateTime: '2026-02-20 09:30',
    coverage: 0.98,
    history: [
      { month: '2025-09', ic: 0.042, ir: 1.28 },
      { month: '2025-10', ic: 0.051, ir: 1.42 },
      { month: '2025-11', ic: 0.045, ir: 1.31 },
      { month: '2025-12', ic: 0.053, ir: 1.48 },
      { month: '2026-01', ic: 0.046, ir: 1.33 },
      { month: '2026-02', ic: 0.048, ir: 1.35 },
    ],
  },
  {
    id: 2,
    name: 'PB_LF',
    fullName: '市净率',
    category: 'value',
    ic: 0.041,
    ir: 1.18,
    turnover: 0.10,
    icWinRate: 0.62,
    starred: true,
    description: '最新财报净资产计算的市净率倒数',
    formula: '1 / (Price / BookValue)',
    updateTime: '2026-02-20 09:30',
    coverage: 0.97,
    history: [
      { month: '2025-09', ic: 0.038, ir: 1.12 },
      { month: '2025-10', ic: 0.044, ir: 1.25 },
      { month: '2025-11', ic: 0.039, ir: 1.15 },
      { month: '2025-12', ic: 0.043, ir: 1.22 },
      { month: '2026-01', ic: 0.040, ir: 1.16 },
      { month: '2026-02', ic: 0.041, ir: 1.18 },
    ],
  },
  {
    id: 3,
    name: 'ROE_TTM',
    fullName: '净资产收益率',
    category: 'quality',
    ic: 0.056,
    ir: 1.62,
    turnover: 0.15,
    icWinRate: 0.68,
    starred: true,
    description: '过去12个月净资产收益率',
    formula: 'NetProfit_TTM / AvgEquity',
    updateTime: '2026-02-20 09:30',
    coverage: 0.96,
    history: [
      { month: '2025-09', ic: 0.052, ir: 1.55 },
      { month: '2025-10', ic: 0.058, ir: 1.68 },
      { month: '2025-11', ic: 0.054, ir: 1.58 },
      { month: '2025-12', ic: 0.060, ir: 1.72 },
      { month: '2026-01', ic: 0.055, ir: 1.60 },
      { month: '2026-02', ic: 0.056, ir: 1.62 },
    ],
  },
  {
    id: 4,
    name: 'MOM_20D',
    fullName: '20日动量',
    category: 'momentum',
    ic: 0.038,
    ir: 1.05,
    turnover: 0.42,
    icWinRate: 0.58,
    starred: false,
    description: '过去20个交易日收益率',
    formula: 'Close_T / Close_T-20 - 1',
    updateTime: '2026-02-20 11:30',
    coverage: 0.99,
    history: [
      { month: '2025-09', ic: 0.035, ir: 0.98 },
      { month: '2025-10', ic: 0.042, ir: 1.15 },
      { month: '2025-11', ic: 0.036, ir: 1.02 },
      { month: '2025-12', ic: 0.040, ir: 1.10 },
      { month: '2026-01', ic: 0.037, ir: 1.03 },
      { month: '2026-02', ic: 0.038, ir: 1.05 },
    ],
  },
  {
    id: 5,
    name: 'VOL_20D',
    fullName: '20日波动率',
    category: 'volatility',
    ic: -0.032,
    ir: -0.92,
    turnover: 0.18,
    icWinRate: 0.45,
    starred: false,
    description: '过去20个交易日收益率标准差',
    formula: 'Std(Return_20D)',
    updateTime: '2026-02-20 11:30',
    coverage: 0.99,
    history: [
      { month: '2025-09', ic: -0.028, ir: -0.82 },
      { month: '2025-10', ic: -0.035, ir: -1.02 },
      { month: '2025-11', ic: -0.030, ir: -0.88 },
      { month: '2025-12', ic: -0.034, ir: -0.98 },
      { month: '2026-01', ic: -0.031, ir: -0.90 },
      { month: '2026-02', ic: -0.032, ir: -0.92 },
    ],
  },
  {
    id: 6,
    name: 'REV_5D',
    fullName: '5日反转',
    category: 'technical',
    ic: 0.045,
    ir: 1.28,
    turnover: 0.35,
    icWinRate: 0.63,
    starred: true,
    description: '过去5个交易日收益率的负值',
    formula: '-1 * (Close_T / Close_T-5 - 1)',
    updateTime: '2026-02-20 11:30',
    coverage: 0.99,
    history: [
      { month: '2025-09', ic: 0.042, ir: 1.22 },
      { month: '2025-10', ic: 0.048, ir: 1.35 },
      { month: '2025-11', ic: 0.044, ir: 1.26 },
      { month: '2025-12', ic: 0.047, ir: 1.32 },
      { month: '2026-01', ic: 0.043, ir: 1.24 },
      { month: '2026-02', ic: 0.045, ir: 1.28 },
    ],
  },
  {
    id: 7,
    name: 'GP_MARGIN',
    fullName: '毛利率',
    category: 'quality',
    ic: 0.039,
    ir: 1.12,
    turnover: 0.08,
    icWinRate: 0.60,
    starred: false,
    description: '最新财报毛利率',
    formula: 'GrossProfit / Revenue',
    updateTime: '2026-02-20 09:30',
    coverage: 0.95,
    history: [
      { month: '2025-09', ic: 0.036, ir: 1.05 },
      { month: '2025-10', ic: 0.041, ir: 1.18 },
      { month: '2025-11', ic: 0.038, ir: 1.10 },
      { month: '2025-12', ic: 0.042, ir: 1.20 },
      { month: '2026-01', ic: 0.037, ir: 1.08 },
      { month: '2026-02', ic: 0.039, ir: 1.12 },
    ],
  },
  {
    id: 8,
    name: 'REV_GROWTH',
    fullName: '营收增速',
    category: 'growth',
    ic: 0.035,
    ir: 0.98,
    turnover: 0.20,
    icWinRate: 0.57,
    starred: false,
    description: '营业收入同比增长率',
    formula: 'Revenue_TTM / Revenue_TTM_LY - 1',
    updateTime: '2026-02-20 09:30',
    coverage: 0.94,
    history: [
      { month: '2025-09', ic: 0.032, ir: 0.92 },
      { month: '2025-10', ic: 0.038, ir: 1.05 },
      { month: '2025-11', ic: 0.034, ir: 0.96 },
      { month: '2025-12', ic: 0.037, ir: 1.02 },
      { month: '2026-01', ic: 0.033, ir: 0.94 },
      { month: '2026-02', ic: 0.035, ir: 0.98 },
    ],
  },
];

// IC趋势数据
const generateICTrendData = () => {
  return Array.from({ length: 60 }, (_, i) => ({
    day: i + 1,
    ic: (Math.random() - 0.5) * 0.08 + 0.04,
    cumIc: 0.04 * (i + 1) + Math.random() * 0.3,
  }));
};

// 因子相关性数据
const factorCorrelationData = factorsDatabase.map(f => ({
  x: f.ic,
  y: f.ir,
  z: f.turnover * 100,
  name: f.name,
  category: f.category,
}));

// 类别统计
const categoryStats = Object.entries(factorCategoriesConfig).map(([key, config]) => {
  const factors = factorsDatabase.filter(f => f.category === key);
  const avgIC = factors.length > 0 ? factors.reduce((sum, f) => sum + f.ic, 0) / factors.length : 0;
  return {
    category: key,
    label: config.label,
    count: factors.length,
    avgIC: avgIC,
    color: config.color,
  };
});

export default function FactorLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFactor, setSelectedFactor] = useState(factorsDatabase[0]);
  const [showFactorModal, setShowFactorModal] = useState(false);
  const [showNewFactorModal, setShowNewFactorModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showBacktestModal, setShowBacktestModal] = useState(false);
  const [compareFactors, setCompareFactors] = useState<number[]>([]);
  const [factors, setFactors] = useState(factorsDatabase);
  const [icTrendData] = useState(generateICTrendData());
  const [sortBy, setSortBy] = useState<'ic' | 'ir' | 'name'>('ic');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 过滤和排序因子
  const filteredFactors = useMemo(() => {
    let result = factors.filter(factor => {
      const matchSearch = factor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         factor.fullName.includes(searchTerm);
      const matchCategory = selectedCategory === 'all' || factor.category === selectedCategory;
      return matchSearch && matchCategory;
    });

    result.sort((a, b) => {
      const aVal = sortBy === 'name' ? a.name : a[sortBy];
      const bVal = sortBy === 'name' ? b.name : b[sortBy];
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [factors, searchTerm, selectedCategory, sortBy, sortOrder]);

  // 切换收藏
  const toggleStar = (factorId: number) => {
    setFactors(factors.map(f =>
      f.id === factorId ? { ...f, starred: !f.starred } : f
    ));
  };

  // 切换比较选择
  const toggleCompare = (factorId: number) => {
    if (compareFactors.includes(factorId)) {
      setCompareFactors(compareFactors.filter(id => id !== factorId));
    } else if (compareFactors.length < 4) {
      setCompareFactors([...compareFactors, factorId]);
    }
  };

  // 获取颜色类
  const getColorClass = (color: string, type: 'bg' | 'text' | 'border') => {
    const classes: Record<string, Record<string, string>> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
      red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
      cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-200' },
    };
    return classes[color]?.[type] || '';
  };

  // 雷达图数据
  const radarData = selectedFactor ? [
    { metric: 'IC均值', value: Math.abs(selectedFactor.ic) * 20, fullMark: 1 },
    { metric: 'IR', value: Math.abs(selectedFactor.ir) / 2, fullMark: 1 },
    { metric: 'IC胜率', value: selectedFactor.icWinRate, fullMark: 1 },
    { metric: '覆盖率', value: selectedFactor.coverage, fullMark: 1 },
    { metric: '稳定性', value: 1 - selectedFactor.turnover, fullMark: 1 },
  ] : [];

  return (
    <div className="space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">因子库</h1>
          <p className="text-gray-500 text-sm mt-1">管理和分析量化因子，支持因子研究和回测</p>
        </div>
        <div className="flex items-center gap-3">
          {compareFactors.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <GitCompare className="w-4 h-4" />
              <span>对比 ({compareFactors.length})</span>
            </button>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索因子..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowNewFactorModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建因子
          </button>
        </div>
      </div>

      {/* 类别筛选 */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          全部 ({factors.length})
        </button>
        {Object.entries(factorCategoriesConfig).map(([key, config]) => {
          const count = factors.filter(f => f.category === key).length;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* 主内容区域 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 因子列表 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">因子列表</h2>
            <div className="flex items-center gap-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by as 'ic' | 'ir' | 'name');
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ic-desc">IC降序</option>
                <option value="ic-asc">IC升序</option>
                <option value="ir-desc">IR降序</option>
                <option value="ir-asc">IR升序</option>
                <option value="name-asc">名称A-Z</option>
              </select>
            </div>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredFactors.map((factor) => {
              const catConfig = factorCategoriesConfig[factor.category];
              const isComparing = compareFactors.includes(factor.id);
              return (
                <div
                  key={factor.id}
                  onClick={() => setSelectedFactor(factor)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedFactor?.id === factor.id
                      ? 'bg-blue-50 border-2 border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{factor.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(factor.id);
                        }}
                        className="p-0.5"
                      >
                        <Star className={`w-4 h-4 ${factor.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getColorClass(catConfig.color, 'bg')} ${getColorClass(catConfig.color, 'text')}`}>
                        {catConfig.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompare(factor.id);
                        }}
                        className={`p-1 rounded ${isComparing ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{factor.fullName}</div>
                  <div className="flex gap-4 text-xs">
                    <span className={`font-medium ${factor.ic >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      IC: {factor.ic.toFixed(3)}
                    </span>
                    <span className={`font-medium ${factor.ir >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      IR: {factor.ir.toFixed(2)}
                    </span>
                    <span className="text-gray-500">
                      胜率: {(factor.icWinRate * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 因子详情 */}
        <div className="col-span-2 space-y-6">
          {/* 因子信息卡片 */}
          {selectedFactor && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClass(factorCategoriesConfig[selectedFactor.category].color, 'bg')}`}>
                    <Zap className={`w-6 h-6 ${getColorClass(factorCategoriesConfig[selectedFactor.category].color, 'text')}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">{selectedFactor.name}</h2>
                      <button onClick={() => toggleStar(selectedFactor.id)}>
                        <Star className={`w-5 h-5 ${selectedFactor.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">{selectedFactor.fullName} · {factorCategoriesConfig[selectedFactor.category].label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBacktestModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Play className="w-4 h-4" />
                    回测
                  </button>
                  <button
                    onClick={() => setShowFactorModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    详情
                  </button>
                </div>
              </div>

              {/* 核心指标 */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">IC均值</div>
                  <div className={`text-xl font-bold ${selectedFactor.ic >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedFactor.ic.toFixed(3)}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">IR</div>
                  <div className={`text-xl font-bold ${selectedFactor.ir >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedFactor.ir.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">IC胜率</div>
                  <div className="text-xl font-bold text-purple-600">{(selectedFactor.icWinRate * 100).toFixed(0)}%</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">换手率</div>
                  <div className="text-xl font-bold text-orange-600">{(selectedFactor.turnover * 100).toFixed(0)}%</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">覆盖率</div>
                  <div className="text-xl font-bold text-blue-600">{(selectedFactor.coverage * 100).toFixed(0)}%</div>
                </div>
              </div>

              {/* 描述和公式 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">因子描述</div>
                  <div className="text-sm text-gray-800">{selectedFactor.description}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">计算公式</div>
                  <code className="text-sm text-gray-800 font-mono">{selectedFactor.formula}</code>
                </div>
              </div>
            </div>
          )}

          {/* IC趋势和雷达图 */}
          <div className="grid grid-cols-2 gap-6">
            {/* IC序列图 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">IC序列</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={icTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" fontSize={10} stroke="#9CA3AF" />
                  <YAxis fontSize={10} stroke="#9CA3AF" domain={[-0.1, 0.1]} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                  <Line type="monotone" dataKey="ic" stroke="#3B82F6" strokeWidth={1.5} dot={false} name="IC" isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 因子能力雷达图 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">因子能力</h2>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="metric" fontSize={10} stroke="#6B7280" />
                  <PolarRadiusAxis fontSize={10} stroke="#9CA3AF" domain={[0, 1]} />
                  <Radar name="能力" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} isAnimationActive={false} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* IC-IR散点图 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">因子 IC-IR 分布</h2>
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" dataKey="x" name="IC" fontSize={10} stroke="#9CA3AF" domain={[-0.05, 0.07]} />
                <YAxis type="number" dataKey="y" name="IR" fontSize={10} stroke="#9CA3AF" domain={[-1.5, 2]} />
                <ZAxis type="number" dataKey="z" range={[60, 200]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm text-xs">
                          <div className="font-semibold">{data.name}</div>
                          <div>IC: {data.x.toFixed(3)}</div>
                          <div>IR: {data.y.toFixed(2)}</div>
                          <div>换手: {data.z.toFixed(0)}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={factorCorrelationData} isAnimationActive={false}>
                  {factorCorrelationData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === selectedFactor?.name ? '#EF4444' : '#3B82F6'}
                      stroke={entry.name === selectedFactor?.name ? '#DC2626' : '#2563EB'}
                      strokeWidth={entry.name === selectedFactor?.name ? 2 : 1}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 因子详情弹窗 */}
      {showFactorModal && selectedFactor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[800px] max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClass(factorCategoriesConfig[selectedFactor.category].color, 'bg')}`}>
                    <Zap className={`w-6 h-6 ${getColorClass(factorCategoriesConfig[selectedFactor.category].color, 'text')}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedFactor.name}</h2>
                    <p className="text-sm text-gray-500">{selectedFactor.fullName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFactorModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* 历史表现 */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">历史IC/IR趋势</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={selectedFactor.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" fontSize={10} stroke="#9CA3AF" />
                    <YAxis fontSize={10} stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                    <Bar dataKey="ic" fill="#3B82F6" name="IC" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 详细信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">因子描述</div>
                    <div className="text-sm text-gray-800">{selectedFactor.description}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">计算公式</div>
                    <code className="text-sm text-gray-800 font-mono">{selectedFactor.formula}</code>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">因子类别</div>
                    <div className="text-sm text-gray-800">{factorCategoriesConfig[selectedFactor.category].label}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">更新时间</div>
                    <div className="text-sm text-gray-800">{selectedFactor.updateTime}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowFactorModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                关闭
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                导出数据
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新建因子弹窗 */}
      {showNewFactorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[600px] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">新建因子</h2>
                <button
                  onClick={() => setShowNewFactorModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">因子名称</label>
                <input
                  type="text"
                  placeholder="例如: PE_TTM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">因子全称</label>
                <input
                  type="text"
                  placeholder="例如: 滚动市盈率"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">因子类别</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.entries(factorCategoriesConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">计算公式</label>
                <textarea
                  placeholder="输入因子计算公式..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">因子描述</label>
                <textarea
                  placeholder="描述因子的含义和用途..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowNewFactorModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                创建因子
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 因子对比弹窗 */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[900px] max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">因子对比分析</h2>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[65vh]">
              {/* 对比表格 */}
              <table className="w-full mb-6">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">指标</th>
                    {compareFactors.map(id => {
                      const f = factors.find(f => f.id === id);
                      return f ? (
                        <th key={id} className="text-center py-3 px-4 font-medium text-gray-800">
                          {f.name}
                        </th>
                      ) : null;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {['IC均值', 'IR', 'IC胜率', '换手率', '覆盖率', '类别'].map(metric => (
                    <tr key={metric} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-600">{metric}</td>
                      {compareFactors.map(id => {
                        const f = factors.find(f => f.id === id);
                        if (!f) return null;
                        let value = '';
                        let colorClass = 'text-gray-800';
                        switch (metric) {
                          case 'IC均值':
                            value = f.ic.toFixed(3);
                            colorClass = f.ic >= 0 ? 'text-green-600' : 'text-red-600';
                            break;
                          case 'IR':
                            value = f.ir.toFixed(2);
                            colorClass = f.ir >= 0 ? 'text-green-600' : 'text-red-600';
                            break;
                          case 'IC胜率':
                            value = `${(f.icWinRate * 100).toFixed(0)}%`;
                            break;
                          case '换手率':
                            value = `${(f.turnover * 100).toFixed(0)}%`;
                            break;
                          case '覆盖率':
                            value = `${(f.coverage * 100).toFixed(0)}%`;
                            break;
                          case '类别':
                            value = factorCategoriesConfig[f.category].label;
                            break;
                        }
                        return (
                          <td key={id} className={`text-center py-3 px-4 font-medium ${colorClass}`}>
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 对比图表 */}
              <h3 className="text-sm font-semibold text-gray-700 mb-3">IC对比</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={compareFactors.map(id => {
                    const f = factors.find(f => f.id === id);
                    return f ? { name: f.name, ic: f.ic, ir: f.ir } : null;
                  }).filter(Boolean)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" fontSize={10} stroke="#9CA3AF" />
                  <YAxis fontSize={10} stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                  <Bar dataKey="ic" fill="#3B82F6" name="IC" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="ir" fill="#22C55E" name="IR" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
              <button
                onClick={() => setCompareFactors([])}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                清空选择
              </button>
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 回测弹窗 */}
      {showBacktestModal && selectedFactor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[600px] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">因子回测 - {selectedFactor.name}</h2>
                <button
                  onClick={() => setShowBacktestModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">回测开始日期</label>
                  <input
                    type="date"
                    defaultValue="2025-01-01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">回测结束日期</label>
                  <input
                    type="date"
                    defaultValue="2026-02-20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">股票池</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="hs300">沪深300</option>
                  <option value="zz500">中证500</option>
                  <option value="zz1000">中证1000</option>
                  <option value="all">全市场</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">调仓频率</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="daily">每日</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分组数量</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="5">5组</option>
                    <option value="10">10组</option>
                    <option value="20">20组</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">基准指数</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="000300.SH">沪深300</option>
                  <option value="000905.SH">中证500</option>
                  <option value="000852.SH">中证1000</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowBacktestModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Play className="w-4 h-4" />
                开始回测
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
