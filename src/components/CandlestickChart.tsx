import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { StockData, TechnicalIndicators, SupportResistance } from '../types/stock';
import { format, parseISO } from 'date-fns';

interface CandlestickChartProps {
  data: StockData[];
  indicators: TechnicalIndicators[];
  supportResistance: SupportResistance;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, indicators, supportResistance }) => {
  const chartData = data.map((item, index) => ({
    ...item,
    date: format(parseISO(item.date), 'MM/dd'),
    sma20: indicators[index]?.sma20 || null,
    sma50: indicators[index]?.sma50 || null,
    bollinger_upper: indicators[index]?.bollinger.upper || null,
    bollinger_lower: indicators[index]?.bollinger.lower || null,
  }));

  const CandlestickBar = ({ payload, x, y, width, height }: any) => {
    if (!payload) return null;
    
    const { open, close, high, low } = payload;
    const isPositive = close > open;
    const color = isPositive ? '#10B981' : '#EF4444';
    const bodyHeight = Math.abs(close - open) * height / (high - low);
    const bodyY = y + (Math.max(high - Math.max(open, close), 0) * height / (high - low));
    
    return (
      <g>
        {/* Wick */}
        <line
          x1={x + width / 2}
          y1={y}
          x2={x + width / 2}
          y2={y + height}
          stroke={color}
          strokeWidth="1"
        />
        {/* Body */}
        <rect
          x={x + 1}
          y={bodyY}
          width={Math.max(width - 2, 1)}
          height={Math.max(bodyHeight, 1)}
          fill={color}
          stroke={color}
        />
      </g>
    );
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">Price Chart with Technical Analysis</h3>
      <div style={{ width: '100%', height: '500px' }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            
            {/* Support Lines */}
            {supportResistance.support.map((level, index) => (
              <ReferenceLine 
                key={`support-${index}`} 
                y={level} 
                stroke="#10B981" 
                strokeDasharray="5 5"
                label={{ value: `Support: ${level.toFixed(2)}`, position: 'left' }}
              />
            ))}
            
            {/* Resistance Lines */}
            {supportResistance.resistance.map((level, index) => (
              <ReferenceLine 
                key={`resistance-${index}`} 
                y={level} 
                stroke="#EF4444" 
                strokeDasharray="5 5"
                label={{ value: `Resistance: ${level.toFixed(2)}`, position: 'right' }}
              />
            ))}
            
            {/* Moving Averages */}
            <Line 
              type="monotone" 
              dataKey="sma20" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={false}
              name="SMA 20"
            />
            <Line 
              type="monotone" 
              dataKey="sma50" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={false}
              name="SMA 50"
            />
            
            {/* Bollinger Bands */}
            <Line 
              type="monotone" 
              dataKey="bollinger_upper" 
              stroke="#F59E0B" 
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              name="BB Upper"
            />
            <Line 
              type="monotone" 
              dataKey="bollinger_lower" 
              stroke="#F59E0B" 
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              name="BB Lower"
            />
            
            {/* Close Price Line */}
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke="#FFFFFF" 
              strokeWidth={2}
              dot={false}
              name="Close Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-500"></div>
          <span className="text-gray-300">SMA 20</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-purple-500"></div>
          <span className="text-gray-300">SMA 50</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-yellow-500" style={{ borderTop: '1px dashed' }}></div>
          <span className="text-gray-300">Bollinger Bands</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-green-500" style={{ borderTop: '1px dashed' }}></div>
          <span className="text-gray-300">Support</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-red-500" style={{ borderTop: '1px dashed' }}></div>
          <span className="text-gray-300">Resistance</span>
        </div>
      </div>
    </div>
  );
};

export default CandlestickChart;