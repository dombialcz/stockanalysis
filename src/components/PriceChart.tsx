import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { StockData } from '../types/stock';
import { format, parseISO } from 'date-fns';

interface PriceChartProps {
  data: StockData[];
  currency?: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, currency = 'PLN' }) => {
  const chartData = data.slice(-30).map((item, index) => {
    const dataIndex = data.length - 30 + index;
    const previousItem = dataIndex > 0 ? data[dataIndex - 1] : null;
    
    return {
    ...item,
    date: format(parseISO(item.date), 'MM/dd'),
    fullDate: item.date,
    change: previousItem ? item.close - previousItem.close : 0,
    changePercent: previousItem ? 
      ((item.close - previousItem.close) / previousItem.close) * 100 : 0
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.change >= 0;
      
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
          <p className="text-white font-semibold">{`Date: ${data.fullDate}`}</p>
          <p className="text-white">{`Price: ${data.close.toFixed(2)} ${currency}`}</p>
          <p className={`${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {`Change: ${isPositive ? '+' : ''}${data.change.toFixed(2)} ${currency} (${data.changePercent.toFixed(2)}%)`}
          </p>
          <p className="text-gray-300">{`Volume: ${(data.volume / 1000000).toFixed(1)}M`}</p>
        </div>
      );
    }
    return null;
  };

  const minPrice = Math.min(...chartData.map(d => d.low));
  const maxPrice = Math.max(...chartData.map(d => d.high));
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">Price Movement (Last 30 Days)</h3>
      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              domain={[minPrice - padding, maxPrice + padding]}
              tickFormatter={(value) => `${value.toFixed(1)} ${currency}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Price Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-gray-300 text-sm">30D High</div>
          <div className="text-white font-bold">{maxPrice.toFixed(2)} {currency}</div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-gray-300 text-sm">30D Low</div>
          <div className="text-white font-bold">{minPrice.toFixed(2)} {currency}</div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-gray-300 text-sm">30D Range</div>
          <div className="text-white font-bold">{(maxPrice - minPrice).toFixed(2)} {currency}</div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-gray-300 text-sm">Volatility</div>
          <div className="text-white font-bold">{(((maxPrice - minPrice) / minPrice) * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;