import React from 'react';
import { TechnicalIndicators as TechIndicators } from '../types/stock';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TechnicalIndicatorsProps {
  indicators: TechIndicators;
  currentPrice: number;
  currency?: string;
}

const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ indicators, currentPrice, currency = 'PLN' }) => {
  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return 'text-red-400';
    if (rsi < 30) return 'text-green-400';
    return 'text-yellow-400';
  };

  const getRSIStatus = (rsi: number) => {
    if (rsi > 70) return 'Overbought';
    if (rsi < 30) return 'Oversold';
    return 'Neutral';
  };

  const getTrendIcon = (current: number, reference: number) => {
    if (current > reference) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (current < reference) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* RSI */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">RSI (14)</h3>
        <div className="flex items-center justify-between">
          <span className={`text-2xl font-bold ${getRSIColor(indicators.rsi)}`}>
            {indicators.rsi.toFixed(1)}
          </span>
          <span className={`text-sm px-2 py-1 rounded ${getRSIColor(indicators.rsi)} bg-opacity-20`}>
            {getRSIStatus(indicators.rsi)}
          </span>
        </div>
        <div className="mt-3 bg-gray-800 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${indicators.rsi > 70 ? 'bg-red-400' : indicators.rsi < 30 ? 'bg-green-400' : 'bg-yellow-400'}`}
            style={{ width: `${indicators.rsi}%` }}
          ></div>
        </div>
      </div>

      {/* Moving Averages */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Moving Averages</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">SMA 20</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">{indicators.sma20.toFixed(2)} {currency}</span>
              {getTrendIcon(currentPrice, indicators.sma20)}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">SMA 50</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">{indicators.sma50.toFixed(2)} {currency}</span>
              {getTrendIcon(currentPrice, indicators.sma50)}
            </div>
          </div>
        </div>
      </div>

      {/* MACD */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">MACD</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">MACD</span>
            <span className={`font-semibold ${indicators.macd > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {indicators.macd.toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Signal</span>
            <span className="text-white">{indicators.macdSignal.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Histogram</span>
            <span className={`font-semibold ${indicators.macdHistogram > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {indicators.macdHistogram.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      {/* Bollinger Bands */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Bollinger Bands</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">Upper</span>
            <span className="text-white">{indicators.bollinger.upper.toFixed(2)} {currency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Middle</span>
            <span className="text-white">{indicators.bollinger.middle.toFixed(2)} {currency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Lower</span>
            <span className="text-white">{indicators.bollinger.lower.toFixed(2)} {currency}</span>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xs text-gray-400">
            Position: {currentPrice > indicators.bollinger.upper ? 'Above Upper' : 
                      currentPrice < indicators.bollinger.lower ? 'Below Lower' : 'Within Bands'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalIndicators;