import React from 'react';
import { TradingRecommendation as TradingRec } from '../types/stock';
import { TrendingUp, TrendingDown, Pause, Shield, Target, AlertTriangle } from 'lucide-react';

interface TradingRecommendationProps {
  recommendation: TradingRec;
  currentPrice: number;
  currency?: string;
}

const TradingRecommendation: React.FC<TradingRecommendationProps> = ({ recommendation, currentPrice, currency = 'PLN' }) => {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'bg-green-600';
      case 'SELL': return 'bg-red-600';
      default: return 'bg-yellow-600';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY': return <TrendingUp className="w-6 h-6" />;
      case 'SELL': return <TrendingDown className="w-6 h-6" />;
      default: return <Pause className="w-6 h-6" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-400';
    if (confidence >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const riskAmount = Math.abs(currentPrice - recommendation.stopLoss);
  const rewardAmount = Math.abs(recommendation.takeProfit - currentPrice);
  const riskPercent = (riskAmount / currentPrice) * 100;
  const rewardPercent = (rewardAmount / currentPrice) * 100;
  
  const getPositionSizeRecommendation = () => {
    const riskReward = recommendation.riskReward;
    const confidence = recommendation.confidence;
    
    if (riskReward >= 3 && confidence >= 80) return { size: '2-3%', color: 'text-green-400', label: 'Large Position' };
    if (riskReward >= 2 && confidence >= 70) return { size: '1-2%', color: 'text-green-400', label: 'Medium Position' };
    if (riskReward >= 1.5 && confidence >= 60) return { size: '0.5-1%', color: 'text-yellow-400', label: 'Small Position' };
    return { size: '0.25-0.5%', color: 'text-red-400', label: 'Micro Position' };
  };
  
  const positionSize = getPositionSizeRecommendation();

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">Trading Recommendation</h3>
      
      {/* Main Recommendation */}
      <div className={`${getActionColor(recommendation.action)} rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getActionIcon(recommendation.action)}
            <div>
              <h4 className="text-xl font-bold text-white">{recommendation.action}</h4>
              <p className="text-gray-200">Recommended Action</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${getConfidenceColor(recommendation.confidence)}`}>
              {recommendation.confidence}%
            </div>
            <div className="text-gray-200 text-sm">Confidence</div>
          </div>
        </div>
      </div>

      {/* Trade Setup */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-red-400" />
            <span className="text-gray-300 text-sm">Stop Loss</span>
          </div>
          <div className="text-white font-bold">{recommendation.stopLoss.toFixed(2)} {currency}</div>
          <div className="text-red-400 text-sm">-{riskPercent.toFixed(1)}%</div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-gray-300 text-sm">Take Profit</span>
          </div>
          <div className="text-white font-bold">{recommendation.takeProfit.toFixed(2)} {currency}</div>
          <div className="text-green-400 text-sm">+{rewardPercent.toFixed(1)}%</div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300 text-sm">Risk/Reward</span>
          </div>
          <div className="text-white font-bold">1:{recommendation.riskReward.toFixed(2)}</div>
          <div className={`text-sm ${recommendation.riskReward >= 2 ? 'text-green-400' : recommendation.riskReward >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
            {recommendation.riskReward >= 2 ? 'Excellent' : recommendation.riskReward >= 1 ? 'Good' : 'Poor'}
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300 text-sm">Position Size</span>
          </div>
          <div className="text-white font-bold">{positionSize.size}</div>
          <div className={`text-sm ${positionSize.color}`}>
            {positionSize.label}
          </div>
        </div>
      </div>

      {/* Analysis Reasoning */}
      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <h5 className="text-white font-semibold mb-3">Analysis Summary</h5>
        <ul className="space-y-2">
          {recommendation.reasoning.map((reason, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Execution Guide */}
      {recommendation.action !== 'HOLD' && (
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <h5 className="text-white font-semibold mb-3">🎯 Quick Execution Guide</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
              <span className="text-gray-300">1. Entry Price:</span>
              <span className="text-white font-semibold">{currentPrice.toFixed(2)} {currency} (Market)</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
              <span className="text-gray-300">2. Stop Loss:</span>
              <span className="text-red-400 font-semibold">{recommendation.stopLoss.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
              <span className="text-gray-300">3. Take Profit:</span>
              <span className="text-green-400 font-semibold">{recommendation.takeProfit.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
              <span className="text-gray-300">4. Position Size:</span>
              <span className={`font-semibold ${positionSize.color}`}>{positionSize.size} of portfolio</span>
            </div>
            <div className="mt-3 p-2 bg-blue-900 bg-opacity-50 rounded border-l-4 border-blue-400">
              <p className="text-blue-200 text-xs">
                💡 <strong>Pro Tip:</strong> Consider scaling in with 50% at market and 50% on any pullback to improve your average entry price.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Risk Warning */}
      <div className="mt-4 p-3 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-yellow-200 text-sm">
            <strong>Risk Warning:</strong> This recommendation is based on technical analysis only. 
            Always consider fundamental factors, market conditions, and your risk tolerance before making any trades.
            Never risk more than you can afford to lose.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingRecommendation;