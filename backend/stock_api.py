#!/usr/bin/env python3
"""
实时行情API后端服务
数据来源：东方财富 via AKShare
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import akshare as ak
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # 允许跨域请求

def get_etf_realtime(symbol: str) -> dict:
    """获取ETF实时行情"""
    try:
        # 获取ETF实时行情
        df = ak.fund_etf_spot_em()
        # 查找对应的ETF
        etf = df[df['代码'] == symbol]
        if etf.empty:
            return None
        row = etf.iloc[0]
        return {
            'code': symbol,
            'name': row['名称'],
            'price': float(row['最新价']) if row['最新价'] else 0,
            'change': float(row['涨跌额']) if row['涨跌额'] else 0,
            'changePercent': float(row['涨跌幅']) if row['涨跌幅'] else 0,
            'open': float(row['今开']) if row['今开'] else 0,
            'high': float(row['最高']) if row['最高'] else 0,
            'low': float(row['最低']) if row['最低'] else 0,
            'prevClose': float(row['昨收']) if row['昨收'] else 0,
            'volume': str(row['成交量']) if row['成交量'] else '0',
            'turnover': str(row['成交额']) if row['成交额'] else '0',
            'updateTime': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'type': 'etf'
        }
    except Exception as e:
        print(f"获取ETF {symbol} 行情失败: {e}")
        return None

def get_index_realtime(symbol: str) -> dict:
    """获取指数实时行情"""
    try:
        # 获取A股指数实时行情
        df = ak.stock_zh_index_spot_em()
        # 查找对应的指数
        idx = df[df['代码'] == symbol]
        if idx.empty:
            return None
        row = idx.iloc[0]
        return {
            'code': symbol,
            'name': row['名称'],
            'price': float(row['最新价']) if row['最新价'] else 0,
            'change': float(row['涨跌额']) if row['涨跌额'] else 0,
            'changePercent': float(row['涨跌幅']) if row['涨跌幅'] else 0,
            'open': float(row['今开']) if row['今开'] else 0,
            'high': float(row['最高']) if row['最高'] else 0,
            'low': float(row['最低']) if row['最低'] else 0,
            'prevClose': float(row['昨收']) if row['昨收'] else 0,
            'volume': str(row.get('成交量', '0')),
            'turnover': str(row.get('成交额', '0')),
            'updateTime': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'type': 'index'
        }
    except Exception as e:
        print(f"获取指数 {symbol} 行情失败: {e}")
        return None

def get_stock_realtime(symbol: str) -> dict:
    """获取A股实时行情"""
    try:
        # 获取A股实时行情
        df = ak.stock_zh_a_spot_em()
        # 查找对应的股票
        stock = df[df['代码'] == symbol]
        if stock.empty:
            return None
        row = stock.iloc[0]
        return {
            'code': symbol,
            'name': row['名称'],
            'price': float(row['最新价']) if row['最新价'] else 0,
            'change': float(row['涨跌额']) if row['涨跌额'] else 0,
            'changePercent': float(row['涨跌幅']) if row['涨跌幅'] else 0,
            'open': float(row['今开']) if row['今开'] else 0,
            'high': float(row['最高']) if row['最高'] else 0,
            'low': float(row['最低']) if row['最低'] else 0,
            'prevClose': float(row['昨收']) if row['昨收'] else 0,
            'volume': str(row.get('成交量', '0')),
            'turnover': str(row.get('成交额', '0')),
            'amplitude': float(row.get('振幅', 0)),
            'turnoverRate': float(row.get('换手率', 0)),
            'updateTime': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'type': 'stock'
        }
    except Exception as e:
        print(f"获取股票 {symbol} 行情失败: {e}")
        return None

@app.route('/api/quote/<symbol>')
def get_quote(symbol):
    """获取单个股票/ETF/指数实时行情"""
    # 判断类型并获取数据
    data = None

    # 指数代码
    index_codes = ['000001', '399001', '399006', '000300', '000016', '000905']
    # ETF代码通常以51/15/58/56开头
    etf_prefixes = ['51', '15', '58', '56']

    if symbol in index_codes:
        data = get_index_realtime(symbol)
    elif symbol[:2] in etf_prefixes:
        data = get_etf_realtime(symbol)
    else:
        data = get_stock_realtime(symbol)

    if data:
        return jsonify({'success': True, 'data': data})
    else:
        return jsonify({'success': False, 'error': f'未找到 {symbol}'}), 404

@app.route('/api/quotes', methods=['POST'])
def get_quotes():
    """批量获取行情数据"""
    symbols = request.json.get('symbols', [])
    results = {}

    for symbol in symbols:
        # 判断类型并获取数据
        index_codes = ['000001', '399001', '399006', '000300', '000016', '000905']
        etf_prefixes = ['51', '15', '58', '56']

        if symbol in index_codes:
            data = get_index_realtime(symbol)
        elif symbol[:2] in etf_prefixes:
            data = get_etf_realtime(symbol)
        else:
            data = get_stock_realtime(symbol)

        if data:
            results[symbol] = data

    return jsonify({'success': True, 'data': results})

@app.route('/api/etf/all')
def get_all_etf():
    """获取所有ETF实时行情"""
    try:
        df = ak.fund_etf_spot_em()
        # 只返回前100条数据
        df = df.head(100)
        data = []
        for _, row in df.iterrows():
            data.append({
                'code': row['代码'],
                'name': row['名称'],
                'price': float(row['最新价']) if row['最新价'] else 0,
                'change': float(row['涨跌额']) if row['涨跌额'] else 0,
                'changePercent': float(row['涨跌幅']) if row['涨跌幅'] else 0,
            })
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/index/all')
def get_all_index():
    """获取所有A股指数实时行情"""
    try:
        df = ak.stock_zh_index_spot_em()
        data = []
        for _, row in df.iterrows():
            data.append({
                'code': row['代码'],
                'name': row['名称'],
                'price': float(row['最新价']) if row['最新价'] else 0,
                'change': float(row['涨跌额']) if row['涨跌额'] else 0,
                'changePercent': float(row['涨跌幅']) if row['涨跌幅'] else 0,
            })
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health')
def health_check():
    """健康检查"""
    return jsonify({'status': 'ok', 'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')})

if __name__ == '__main__':
    print("启动实时行情API服务...")
    print("API文档:")
    print("  GET  /api/quote/<symbol>  - 获取单个行情")
    print("  POST /api/quotes          - 批量获取行情")
    print("  GET  /api/etf/all         - 获取所有ETF行情")
    print("  GET  /api/index/all       - 获取所有指数行情")
    app.run(host='0.0.0.0', port=5000, debug=True)
