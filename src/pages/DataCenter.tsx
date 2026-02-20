import { useState, useMemo } from 'react';
import {
  Database,
  RefreshCw,
  Search,
  Download,
  Upload,
  Play,
  Clock,
  Table,
  FileText,
  TrendingUp,
  BarChart3,
  Eye,
  X,
  Copy,
  Save,
  HardDrive,
  Zap,
  CheckCircle,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

// 数据源配置
const dataSourcesConfig: Record<string, { label: string; icon: typeof Database; color: string; description: string }> = {
  stock: { label: '股票数据', icon: TrendingUp, color: 'blue', description: 'A股全市场股票行情、财务、估值数据' },
  index: { label: '指数数据', icon: BarChart3, color: 'green', description: '主要指数成分股及权重数据' },
  fund: { label: '基金数据', icon: Database, color: 'purple', description: '公募私募基金净值、持仓数据' },
  futures: { label: '期货数据', icon: Zap, color: 'orange', description: '商品期货、金融期货行情数据' },
  macro: { label: '宏观数据', icon: FileText, color: 'cyan', description: '宏观经济指标、货币政策数据' },
  alternative: { label: '另类数据', icon: HardDrive, color: 'pink', description: '舆情、卫星、供应链等另类数据' },
};

// 数据源详情
const dataSourcesDatabase = [
  {
    id: 'stock',
    name: '股票数据',
    count: 5200,
    tables: 45,
    updated: '2026-02-20 11:30',
    size: '128.5 GB',
    status: 'online',
    updateFreq: '实时',
    fields: ['股票代码', '日期', '开盘价', '最高价', '最低价', '收盘价', '成交量', '成交额', '涨跌幅'],
    sampleData: [
      { code: '600519.SH', date: '2026-02-20', open: 1856.00, high: 1878.50, low: 1852.30, close: 1875.20, volume: 2345678, amount: 43567890000 },
      { code: '000858.SZ', date: '2026-02-20', open: 168.50, high: 172.30, low: 167.80, close: 171.50, volume: 8765432, amount: 1498760000 },
    ],
  },
  {
    id: 'index',
    name: '指数数据',
    count: 920,
    tables: 12,
    updated: '2026-02-20 11:30',
    size: '8.2 GB',
    status: 'online',
    updateFreq: '实时',
    fields: ['指数代码', '日期', '开盘点位', '最高点位', '最低点位', '收盘点位', '成交额', '涨跌幅'],
    sampleData: [
      { code: '000001.SH', date: '2026-02-20', open: 3456.78, high: 3489.23, low: 3445.67, close: 3478.90, amount: 567890000000 },
    ],
  },
  {
    id: 'fund',
    name: '基金数据',
    count: 12800,
    tables: 28,
    updated: '2026-02-20 09:00',
    size: '45.6 GB',
    status: 'online',
    updateFreq: '日更',
    fields: ['基金代码', '日期', '单位净值', '累计净值', '日涨跌幅', '规模(亿)'],
    sampleData: [
      { code: '000001.OF', date: '2026-02-19', nav: 1.2345, accNav: 2.3456, change: 0.85, scale: 156.78 },
    ],
  },
  {
    id: 'futures',
    name: '期货数据',
    count: 580,
    tables: 18,
    updated: '2026-02-20 11:30',
    size: '22.3 GB',
    status: 'online',
    updateFreq: '实时',
    fields: ['合约代码', '日期', '开盘价', '最高价', '最低价', '收盘价', '结算价', '持仓量'],
    sampleData: [
      { code: 'IF2603', date: '2026-02-20', open: 4125.6, high: 4156.8, low: 4118.2, close: 4148.4, settle: 4145.0, oi: 125678 },
    ],
  },
  {
    id: 'macro',
    name: '宏观数据',
    count: 3200,
    tables: 65,
    updated: '2026-02-19 18:00',
    size: '5.8 GB',
    status: 'online',
    updateFreq: '按发布',
    fields: ['指标名称', '日期', '数值', '同比', '环比', '单位'],
    sampleData: [
      { name: 'GDP', date: '2025-Q4', value: 32.5, yoy: 5.2, qoq: 1.3, unit: '万亿元' },
    ],
  },
  {
    id: 'alternative',
    name: '另类数据',
    count: 8500,
    tables: 35,
    updated: '2026-02-20 10:00',
    size: '256.7 GB',
    status: 'online',
    updateFreq: '小时更',
    fields: ['数据类型', '日期', '标的', '数值', '情感得分'],
    sampleData: [
      { type: '舆情指数', date: '2026-02-20', target: '600519.SH', value: 78.5, sentiment: 0.65 },
    ],
  },
];

// 每日使用趋势
const dailyUsageData = [
  { date: '02-14', queries: 4500, api: 3200 },
  { date: '02-15', queries: 5200, api: 3800 },
  { date: '02-16', queries: 4800, api: 3500 },
  { date: '02-17', queries: 6100, api: 4200 },
  { date: '02-18', queries: 5800, api: 4000 },
  { date: '02-19', queries: 7200, api: 5100 },
  { date: '02-20', queries: 6800, api: 4800 },
];

// 最近查询记录
const recentQueriesDatabase = [
  { id: 1, sql: 'SELECT * FROM stock_daily WHERE date = "2026-02-20" AND close > open', time: '11:28:35', duration: '0.23s', rows: 2456, status: 'success', source: 'stock' },
  { id: 2, sql: 'SELECT code, name, pe_ttm, pb FROM stock_valuation WHERE pe_ttm < 15 ORDER BY market_cap DESC LIMIT 100', time: '11:25:12', duration: '0.45s', rows: 100, status: 'success', source: 'stock' },
  { id: 3, sql: 'SELECT * FROM index_weight WHERE index_code = "000300.SH"', time: '11:20:08', duration: '0.12s', rows: 300, status: 'success', source: 'index' },
  { id: 4, sql: 'SELECT AVG(nav_change) FROM fund_daily WHERE date >= "2026-01-01" GROUP BY fund_type', time: '11:15:33', duration: '1.25s', rows: 8, status: 'success', source: 'fund' },
  { id: 5, sql: 'SELECT * FROM macro_indicator WHERE indicator_name LIKE "%GDP%"', time: '11:10:45', duration: '0.08s', rows: 45, status: 'success', source: 'macro' },
];

// 数据表目录
const dataTablesDatabase = [
  { id: 1, name: 'stock_daily', source: 'stock', rows: 45000000, columns: 12, updated: '2026-02-20 11:30', description: '股票日线行情数据' },
  { id: 2, name: 'stock_minute', source: 'stock', rows: 890000000, columns: 10, updated: '2026-02-20 11:30', description: '股票分钟行情数据' },
  { id: 3, name: 'stock_valuation', source: 'stock', rows: 5200, columns: 25, updated: '2026-02-20 09:00', description: '股票估值指标数据' },
  { id: 4, name: 'stock_financial', source: 'stock', rows: 125000, columns: 80, updated: '2026-02-19', description: '股票财务报表数据' },
  { id: 5, name: 'index_daily', source: 'index', rows: 2500000, columns: 10, updated: '2026-02-20 11:30', description: '指数日线行情数据' },
  { id: 6, name: 'index_weight', source: 'index', rows: 15000, columns: 5, updated: '2026-02-20 09:00', description: '指数成分股权重' },
  { id: 7, name: 'fund_nav', source: 'fund', rows: 8500000, columns: 8, updated: '2026-02-20 09:00', description: '基金净值数据' },
  { id: 8, name: 'fund_holding', source: 'fund', rows: 2500000, columns: 12, updated: '2025-12-31', description: '基金持仓数据' },
  { id: 9, name: 'futures_daily', source: 'futures', rows: 3500000, columns: 15, updated: '2026-02-20 11:30', description: '期货日线行情数据' },
  { id: 10, name: 'macro_indicator', source: 'macro', rows: 125000, columns: 8, updated: '2026-02-19', description: '宏观经济指标' },
];

// 存储使用分布
const storageDistribution = [
  { name: '股票数据', value: 128.5, color: '#3B82F6' },
  { name: '另类数据', value: 256.7, color: '#EC4899' },
  { name: '基金数据', value: 45.6, color: '#8B5CF6' },
  { name: '期货数据', value: 22.3, color: '#F97316' },
  { name: '指数数据', value: 8.2, color: '#22C55E' },
  { name: '宏观数据', value: 5.8, color: '#06B6D4' },
];

export default function DataCenter() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showQueryEditor, setShowQueryEditor] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTablePreview, setShowTablePreview] = useState(false);
  const [selectedTable, setSelectedTable] = useState<typeof dataTablesDatabase[0] | null>(null);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM stock_daily WHERE date = "2026-02-20" LIMIT 100');
  const [queryResult, setQueryResult] = useState<{ status: string; rows: number; data: Record<string, unknown>[] } | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [refreshingSource, setRefreshingSource] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState(recentQueriesDatabase);
  const [savedQueries, setSavedQueries] = useState<{ id: number; name: string; sql: string }[]>([
    { id: 1, name: '今日涨停股票', sql: 'SELECT * FROM stock_daily WHERE date = "2026-02-20" AND pct_change >= 9.9' },
    { id: 2, name: '低估值蓝筹', sql: 'SELECT * FROM stock_valuation WHERE pe_ttm < 10 AND pb < 1 AND market_cap > 100000000000' },
    { id: 3, name: '北向资金流入', sql: 'SELECT * FROM north_flow WHERE date >= "2026-02-01" ORDER BY net_buy DESC' },
  ]);

  // 过滤数据表
  const filteredTables = useMemo(() => {
    return dataTablesDatabase.filter(table => {
      const matchSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.description.includes(searchTerm);
      const matchSource = sourceFilter === 'all' || table.source === sourceFilter;
      return matchSearch && matchSource;
    });
  }, [searchTerm, sourceFilter]);

  // 获取选中的数据源详情
  const selectedSourceData = selectedSource
    ? dataSourcesDatabase.find(s => s.id === selectedSource)
    : null;

  // 刷新数据源
  const handleRefreshSource = (sourceId: string) => {
    setRefreshingSource(sourceId);
    setTimeout(() => {
      setRefreshingSource(null);
    }, 2000);
  };

  // 执行查询
  const handleExecuteQuery = () => {
    setIsQuerying(true);
    setTimeout(() => {
      const mockResult = {
        status: 'success',
        rows: Math.floor(Math.random() * 1000) + 100,
        data: [
          { code: '600519.SH', date: '2026-02-20', open: 1856.00, high: 1878.50, low: 1852.30, close: 1875.20, volume: 2345678 },
          { code: '000858.SZ', date: '2026-02-20', open: 168.50, high: 172.30, low: 167.80, close: 171.50, volume: 8765432 },
          { code: '601318.SH', date: '2026-02-20', open: 52.30, high: 53.80, low: 52.10, close: 53.50, volume: 12345678 },
          { code: '000001.SZ', date: '2026-02-20', open: 12.85, high: 13.20, low: 12.78, close: 13.15, volume: 45678901 },
          { code: '600036.SH', date: '2026-02-20', open: 38.50, high: 39.20, low: 38.30, close: 39.00, volume: 23456789 },
        ],
      };
      setQueryResult(mockResult);
      setIsQuerying(false);

      // 添加到历史记录
      const newQuery = {
        id: queryHistory.length + 1,
        sql: sqlQuery,
        time: new Date().toLocaleTimeString(),
        duration: `${(Math.random() * 2).toFixed(2)}s`,
        rows: mockResult.rows,
        status: 'success',
        source: 'stock',
      };
      setQueryHistory([newQuery, ...queryHistory.slice(0, 9)]);
    }, 1500);
  };

  // 保存查询
  const handleSaveQuery = () => {
    const name = prompt('请输入查询名称:');
    if (name) {
      setSavedQueries([...savedQueries, { id: savedQueries.length + 1, name, sql: sqlQuery }]);
    }
  };

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 100000000) return `${(num / 100000000).toFixed(1)}亿`;
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    return num.toLocaleString();
  };

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-200',
  };
  const iconBgClasses: Record<string, string> = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
    cyan: 'bg-cyan-100',
    pink: 'bg-pink-100',
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据中心</h1>
          <p className="text-gray-500 text-sm mt-1">管理和查询量化投资所需的各类数据</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>导入数据</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>导出数据</span>
          </button>
          <button
            onClick={() => setShowQueryEditor(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>SQL查询</span>
          </button>
        </div>
      </div>

      {/* 数据源卡片 */}
      <div className="grid grid-cols-6 gap-4">
        {dataSourcesDatabase.map((source) => {
          const config = dataSourcesConfig[source.id];
          const Icon = config.icon;

          return (
            <div
              key={source.id}
              onClick={() => {
                setSelectedSource(source.id);
                setShowSourceModal(true);
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${colorClasses[config.color]}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgClasses[config.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRefreshSource(source.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshingSource === source.id ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <h3 className="font-semibold text-gray-800">{source.name}</h3>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">数据量</span>
                  <span className="font-medium">{formatNumber(source.count)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">更新</span>
                  <span className="font-medium text-xs">{source.updated.split(' ')[1]}</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-green-600">在线</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 统计图表区域 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 每日查询趋势 */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">数据使用趋势</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">SQL查询</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">API调用</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dailyUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" fontSize={12} stroke="#9CA3AF" />
              <YAxis fontSize={12} stroke="#9CA3AF" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [formatNumber(value), '']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Area type="monotone" dataKey="queries" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} name="SQL查询" isAnimationActive={false} />
              <Area type="monotone" dataKey="api" stroke="#22C55E" fill="#22C55E" fillOpacity={0.2} name="API调用" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 存储分布 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">存储使用分布</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={storageDistribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={false}
              >
                {storageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)} GB`, '']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {storageDistribution.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-gray-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">总存储</span>
              <span className="font-semibold text-gray-800">467.1 GB</span>
            </div>
          </div>
        </div>
      </div>

      {/* 最近查询和数据表 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 最近查询 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">最近查询</h2>
            <button
              onClick={() => setShowQueryEditor(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              新建查询
            </button>
          </div>
          <div className="space-y-3">
            {queryHistory.slice(0, 5).map((query) => (
              <div
                key={query.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                onClick={() => {
                  setSqlQuery(query.sql);
                  setShowQueryEditor(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <code className="text-xs text-gray-700 font-mono line-clamp-1 flex-1 mr-2">
                    {query.sql}
                  </code>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    query.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {query.status === 'success' ? '成功' : '失败'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {query.time}
                  </span>
                  <span>耗时: {query.duration}</span>
                  <span>结果: {formatNumber(query.rows)}行</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 数据表目录 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">数据表目录</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索表名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
                />
              </div>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部来源</option>
                {Object.entries(dataSourcesConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-200">
                  <th className="text-left py-2 font-medium">表名</th>
                  <th className="text-right py-2 font-medium">行数</th>
                  <th className="text-right py-2 font-medium">更新时间</th>
                  <th className="text-center py-2 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTables.slice(0, 6).map((table) => (
                  <tr key={table.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <Table className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">{table.name}</span>
                      </div>
                    </td>
                    <td className="text-right text-sm text-gray-600">{formatNumber(table.rows)}</td>
                    <td className="text-right text-xs text-gray-500">{table.updated.split(' ')[0]}</td>
                    <td className="text-center">
                      <button
                        onClick={() => {
                          setSelectedTable(table);
                          setShowTablePreview(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 数据源详情弹窗 */}
      {showSourceModal && selectedSourceData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[700px] max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedSourceData.name}</h2>
                    <p className="text-sm text-gray-500">{dataSourcesConfig[selectedSourceData.id]?.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSourceModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* 数据源统计 */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-sm text-blue-600 mb-1">数据量</div>
                  <div className="text-2xl font-bold text-blue-700">{formatNumber(selectedSourceData.count)}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="text-sm text-green-600 mb-1">数据表</div>
                  <div className="text-2xl font-bold text-green-700">{selectedSourceData.tables}</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="text-sm text-purple-600 mb-1">存储大小</div>
                  <div className="text-2xl font-bold text-purple-700">{selectedSourceData.size}</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl">
                  <div className="text-sm text-orange-600 mb-1">更新频率</div>
                  <div className="text-2xl font-bold text-orange-700">{selectedSourceData.updateFreq}</div>
                </div>
              </div>

              {/* 字段说明 */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">主要字段</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSourceData.fields.map((field, index) => (
                    <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              {/* 示例数据 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">示例数据</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(selectedSourceData.sampleData[0] || {}).map((key) => (
                          <th key={key} className="px-3 py-2 text-left text-gray-600 font-medium">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSourceData.sampleData.map((row, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          {Object.values(row).map((value, vIndex) => (
                            <td key={vIndex} className="px-3 py-2 text-gray-800">
                              {typeof value === 'number' ? value.toLocaleString() : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
              <div className="text-sm text-gray-500">
                最后更新: {selectedSourceData.updated}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSqlQuery(`SELECT * FROM ${selectedSourceData.id}_daily LIMIT 100`);
                    setShowSourceModal(false);
                    setShowQueryEditor(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  查询此数据源
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SQL查询编辑器弹窗 */}
      {showQueryEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[900px] max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">SQL查询编辑器</h2>
                <button
                  onClick={() => {
                    setShowQueryEditor(false);
                    setQueryResult(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* 保存的查询 */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">常用查询</div>
                <div className="flex flex-wrap gap-2">
                  {savedQueries.map((sq) => (
                    <button
                      key={sq.id}
                      onClick={() => setSqlQuery(sq.sql)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                    >
                      {sq.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* SQL输入框 */}
              <div className="mb-4">
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="输入SQL查询语句..."
                  className="w-full h-32 p-4 font-mono text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50"
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExecuteQuery}
                    disabled={isQuerying || !sqlQuery.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isQuerying ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span>{isQuerying ? '执行中...' : '执行查询'}</span>
                  </button>
                  <button
                    onClick={handleSaveQuery}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>保存查询</span>
                  </button>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(sqlQuery)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">复制</span>
                </button>
              </div>

              {/* 查询结果 */}
              {queryResult && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">
                        查询成功，返回 {queryResult.rows} 行
                      </span>
                    </div>
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      导出结果
                    </button>
                  </div>
                  <div className="overflow-x-auto max-h-64">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          {Object.keys(queryResult.data[0] || {}).map((key) => (
                            <th key={key} className="px-4 py-2 text-left text-gray-600 font-medium border-b">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.data.map((row, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            {Object.values(row).map((value, vIndex) => (
                              <td key={vIndex} className="px-4 py-2 text-gray-800">
                                {typeof value === 'number' ? value.toLocaleString() : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 导入数据弹窗 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[500px] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">导入数据</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">拖拽文件到此处或点击上传</p>
                <p className="text-sm text-gray-400">支持 CSV, Excel, JSON 格式</p>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">目标数据表</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>选择或新建数据表...</option>
                    {dataTablesDatabase.map((table) => (
                      <option key={table.id} value={table.name}>{table.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">导入模式</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="importMode" defaultChecked className="text-blue-600" />
                      <span className="text-sm text-gray-700">追加数据</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="importMode" className="text-blue-600" />
                      <span className="text-sm text-gray-700">覆盖数据</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                开始导入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 导出数据弹窗 */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[500px] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">导出数据</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">数据来源</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="query">当前查询结果</option>
                  {dataTablesDatabase.map((table) => (
                    <option key={table.id} value={table.name}>{table.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">导出格式</label>
                <div className="grid grid-cols-3 gap-3">
                  {['CSV', 'Excel', 'JSON'].map((format) => (
                    <label key={format} className="flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                      <input type="radio" name="format" value={format} defaultChecked={format === 'CSV'} className="sr-only" />
                      <FileText className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium">{format}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">数据范围</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="range" defaultChecked className="text-blue-600" />
                    <span className="text-sm text-gray-700">全部数据</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="range" className="text-blue-600" />
                    <span className="text-sm text-gray-700">前1000行</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                导出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 数据表预览弹窗 */}
      {showTablePreview && selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[800px] max-h-[85vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Table className="w-5 h-5 text-blue-600" />
                    {selectedTable.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedTable.description}</p>
                </div>
                <button
                  onClick={() => setShowTablePreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">总行数</div>
                  <div className="text-lg font-semibold text-gray-800">{formatNumber(selectedTable.rows)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">列数</div>
                  <div className="text-lg font-semibold text-gray-800">{selectedTable.columns}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">数据源</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {dataSourcesConfig[selectedTable.source]?.label}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">更新时间</div>
                  <div className="text-sm font-semibold text-gray-800">{selectedTable.updated}</div>
                </div>
              </div>

              {/* 模拟数据预览 */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <span className="text-sm text-gray-600">数据预览 (前5行)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-600 font-medium">code</th>
                        <th className="px-4 py-2 text-left text-gray-600 font-medium">date</th>
                        <th className="px-4 py-2 text-right text-gray-600 font-medium">open</th>
                        <th className="px-4 py-2 text-right text-gray-600 font-medium">high</th>
                        <th className="px-4 py-2 text-right text-gray-600 font-medium">low</th>
                        <th className="px-4 py-2 text-right text-gray-600 font-medium">close</th>
                        <th className="px-4 py-2 text-right text-gray-600 font-medium">volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { code: '600519.SH', date: '2026-02-20', open: 1856.00, high: 1878.50, low: 1852.30, close: 1875.20, volume: 2345678 },
                        { code: '000858.SZ', date: '2026-02-20', open: 168.50, high: 172.30, low: 167.80, close: 171.50, volume: 8765432 },
                        { code: '601318.SH', date: '2026-02-20', open: 52.30, high: 53.80, low: 52.10, close: 53.50, volume: 12345678 },
                        { code: '000001.SZ', date: '2026-02-20', open: 12.85, high: 13.20, low: 12.78, close: 13.15, volume: 45678901 },
                        { code: '600036.SH', date: '2026-02-20', open: 38.50, high: 39.20, low: 38.30, close: 39.00, volume: 23456789 },
                      ].map((row, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-800 font-mono">{row.code}</td>
                          <td className="px-4 py-2 text-gray-800">{row.date}</td>
                          <td className="px-4 py-2 text-right text-gray-800">{row.open.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right text-gray-800">{row.high.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right text-gray-800">{row.low.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right text-gray-800">{row.close.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right text-gray-800">{row.volume.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSqlQuery(`SELECT * FROM ${selectedTable.name} LIMIT 100`);
                  setShowTablePreview(false);
                  setShowQueryEditor(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                查询此表
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
