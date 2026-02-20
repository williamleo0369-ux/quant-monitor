const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 路由 - 量化平台接口

// 获取股票实时数据 (模拟)
app.get('/api/stocks/:symbol', (req, res) => {
  const { symbol } = req.params;
  // 模拟股票数据
  const mockData = {
    symbol,
    price: (Math.random() * 100 + 50).toFixed(2),
    change: ((Math.random() - 0.5) * 10).toFixed(2),
    changePercent: ((Math.random() - 0.5) * 5).toFixed(2),
    volume: Math.floor(Math.random() * 1000000),
    timestamp: new Date().toISOString()
  };
  res.json(mockData);
});

// 获取K线数据 (模拟)
app.get('/api/kline/:symbol', (req, res) => {
  const { symbol } = req.params;
  const { period = '1d', limit = 100 } = req.query;

  const klineData = [];
  let basePrice = 100;
  const now = Date.now();

  for (let i = parseInt(limit); i > 0; i--) {
    const open = basePrice * (1 + (Math.random() - 0.5) * 0.02);
    const close = open * (1 + (Math.random() - 0.5) * 0.03);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);

    klineData.push({
      timestamp: now - i * 86400000,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000)
    });

    basePrice = close;
  }

  res.json({ symbol, period, data: klineData });
});

// 策略回测接口 (模拟)
app.post('/api/backtest', (req, res) => {
  const { strategy, startDate, endDate, initialCapital = 100000 } = req.body;

  // 模拟回测结果
  const result = {
    strategy,
    startDate,
    endDate,
    initialCapital,
    finalCapital: parseFloat((initialCapital * (1 + Math.random() * 0.3)).toFixed(2)),
    totalReturn: parseFloat(((Math.random() * 30)).toFixed(2)),
    sharpeRatio: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
    maxDrawdown: parseFloat((Math.random() * -15).toFixed(2)),
    winRate: parseFloat((Math.random() * 30 + 40).toFixed(2)),
    totalTrades: Math.floor(Math.random() * 100 + 50),
    timestamp: new Date().toISOString()
  };

  res.json(result);
});

// 组合管理接口
app.get('/api/portfolios', (req, res) => {
  // 返回示例组合数据
  res.json([
    { id: '1', name: '成长组合', totalAsset: 2567890, todayPnl: 45678, totalPnl: 356789 },
    { id: '2', name: '价值组合', totalAsset: 1856000, todayPnl: -12350, totalPnl: 156000 },
    { id: '3', name: 'AI主题', totalAsset: 890000, todayPnl: 28900, totalPnl: 190000 }
  ]);
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 静态文件服务 - 托管React前端
app.use(express.static(path.join(__dirname, 'dist')));

// SPA 路由支持 - 所有其他请求返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 量化投资平台服务器运行在端口 ${PORT}`);
  console.log(`📊 API 接口: http://localhost:${PORT}/api`);
  console.log(`🌐 前端界面: http://localhost:${PORT}`);
});

module.exports = app;
