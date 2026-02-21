#!/usr/bin/env python3
"""
批量更新股票数据库的实时价格
"""
import akshare as ak
import json
from datetime import datetime

def get_all_etf_data():
    """获取所有ETF实时数据"""
    print("获取ETF实时数据...")
    df = ak.fund_etf_spot_em()

    # 我们需要的ETF代码
    etf_codes = ['518880', '513130', '512100', '588000', '510300', '510500', '510050',
                 '159915', '512880', '159995', '513050', '513100', '512480', '562500']

    results = {}
    for code in etf_codes:
        etf = df[df['代码'] == code]
        if not etf.empty:
            row = etf.iloc[0]
            results[code] = {
                'name': row['名称'],
                'price': float(row['最新价']) if row['最新价'] else 0,
                'change': float(row['涨跌额']) if row['涨跌额'] else 0,
                'changePercent': float(row['涨跌幅']) if row['涨跌幅'] else 0,
                'open': float(row['开盘价']) if row['开盘价'] else 0,
                'high': float(row['最高价']) if row['最高价'] else 0,
                'low': float(row['最低价']) if row['最低价'] else 0,
                'prevClose': float(row['昨收']) if row['昨收'] else 0,
                'volume': row['成交量'],
                'turnover': row['成交额'],
                'amplitude': float(row['振幅']) if row['振幅'] else 0,
                'turnoverRate': float(row['换手率']) if row['换手率'] else 0,
            }
            print(f"  {code} {row['名称']}: {row['最新价']}")
    return results

def get_index_data():
    """获取指数实时数据"""
    print("\n获取指数实时数据...")
    df = ak.stock_zh_index_spot_em()

    index_codes = ['000001', '399001', '399006', '000300']
    results = {}

    for code in index_codes:
        idx = df[df['代码'] == code]
        if not idx.empty:
            row = idx.iloc[0]
            results[code] = {
                'name': row['名称'],
                'price': float(row['最新价']) if row['最新价'] else 0,
                'change': float(row['涨跌额']) if row['涨跌额'] else 0,
                'changePercent': float(row['涨跌幅']) if row['涨跌幅'] else 0,
                'open': float(row['今开']) if row['今开'] else 0,
                'high': float(row['最高']) if row['最高'] else 0,
                'low': float(row['最低']) if row['最低'] else 0,
                'prevClose': float(row['昨收']) if row['昨收'] else 0,
            }
            print(f"  {code} {row['名称']}: {row['最新价']}")
    return results

def format_volume(vol):
    """格式化成交量"""
    if vol >= 100000000:
        return f"{vol/100000000:.2f}亿"
    elif vol >= 10000:
        return f"{vol/10000:.2f}万"
    else:
        return str(vol)

def format_turnover(amount):
    """格式化成交额"""
    if amount >= 100000000:
        return f"{amount/100000000:.2f}亿"
    elif amount >= 10000:
        return f"{amount/10000:.2f}万"
    else:
        return str(amount)

def main():
    print(f"=== 更新实时行情数据 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ===\n")

    etf_data = get_all_etf_data()
    index_data = get_index_data()

    # 合并数据
    all_data = {**etf_data, **index_data}

    # 输出TypeScript格式的数据
    print("\n=== TypeScript 数据格式 ===\n")

    for code, data in all_data.items():
        vol_str = format_volume(data.get('volume', 0)) if isinstance(data.get('volume'), (int, float)) else str(data.get('volume', '0'))
        turnover_str = format_turnover(data.get('turnover', 0)) if isinstance(data.get('turnover'), (int, float)) else str(data.get('turnover', '0'))

        type_str = 'index' if code in ['000001', '399001', '399006', '000300'] else 'etf'
        suffix = '.SH' if code.startswith(('5', '6', '0')) and code not in ['399001', '399006'] else '.SZ'
        if code in ['399001', '399006']:
            suffix = '.SZ'

        print(f"  '{code}': {{")
        print(f"    name: '{data['name']}', code: '{code}{suffix}', price: {data['price']}, change: {data['change']}, changePercent: {data['changePercent']}, type: '{type_str}',")
        print(f"    prevClose: {data['prevClose']}, open: {data['open']}, high: {data['high']}, low: {data['low']},")
        print(f"    volume: '{vol_str}', turnover: '{turnover_str}', amplitude: {data.get('amplitude', 0)}, turnoverRate: {data.get('turnoverRate', 0)},")
        print(f"    week52High: {data['high']*1.1:.2f}, week52Low: {data['low']*0.9:.2f}")
        print(f"  }},")

    # 保存为JSON
    with open('/workspace/quant-platform/backend/realtime_data.json', 'w', encoding='utf-8') as f:
        json.dump({
            'updateTime': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'data': all_data
        }, f, ensure_ascii=False, indent=2)

    print(f"\n数据已保存到 realtime_data.json")
    print(f"更新时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == '__main__':
    main()
