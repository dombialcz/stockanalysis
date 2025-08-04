import React from 'react';
import { StockData } from '../types/stock';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

interface Company {
  symbol: string;
  name: string;
  exchange: string;
}

interface StockInfoProps {
  data: StockData[];
  symbol: string;
  company: Company;
}

const StockInfo: React.FC<StockInfoProps> = ({ data, symbol, company }) => {
  if (data.length === 0) return null;

  const currentData = data[data.length - 1];
  const previousData = data[data.length - 2];
  
  const change = currentData.close - previousData.close;
  const changePercent = (change / previousData.close) * 100;
  const isPositive = change > 0;

  const volume = currentData.volume;
  const avgVolume = data.slice(-20).reduce((sum, d) => sum + d.volume, 0) / 20;
  const volumeRatio = volume / avgVolume;

  const high52Week = Math.max(...data.slice(-252).map(d => d.high));
  const low52Week = Math.min(...data.slice(-252).map(d => d.low));

  const getCurrency = (symbol: string) => {
    if (symbol === 'ndq') return 'USD';
    return 'PLN';
  };

  const currency = getCurrency(symbol);

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{company.symbol.toUpperCase()}</h2>
          <p className="text-gray-400">{company.name} ({company.exchange})</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{currentData.close.toFixed(2)} {currency}</div>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-semibold">
              {isPositive ? '+' : ''}{change.toFixed(2)} {currency} ({changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300 text-sm">Open</span>
          </div>
          <div className="text-white font-bold">{currentData.open.toFixed(2)} {currency}</div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-gray-300 text-sm">High</span>
          </div>
          <div className="text-white font-bold">{currentData.high.toFixed(2)} {currency}</div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-gray-300 text-sm">Low</span>
          </div>
          <div className="text-white font-bold">{currentData.low.toFixed(2)} {currency}</div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300 text-sm">Volume</span>
          </div>
          <div className="text-white font-bold">{(volume / 1000000).toFixed(1)}M</div>
          <div className={`text-xs ${volumeRatio > 1.5 ? 'text-green-400' : volumeRatio < 0.5 ? 'text-red-400' : 'text-gray-400'}`}>
            {volumeRatio.toFixed(1)}x avg
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-300 text-sm mb-1">52W High</div>
          <div className="text-white font-bold">{high52Week.toFixed(2)} {currency}</div>
          <div className="text-xs text-gray-400">
            {(((currentData.close - high52Week) / high52Week) * 100).toFixed(1)}% from high
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-300 text-sm mb-1">52W Low</div>
          <div className="text-white font-bold">{low52Week.toFixed(2)} {currency}</div>
          <div className="text-xs text-gray-400">
            {(((currentData.close - low52Week) / low52Week) * 100).toFixed(1)}% from low
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockInfo;