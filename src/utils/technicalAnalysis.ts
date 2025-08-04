import { StockData, TechnicalIndicators, SupportResistance, TradingRecommendation } from '../types/stock';

export const calculateSMA = (data: number[], period: number): number => {
  if (data.length < period) return 0;
  const sum = data.slice(-period).reduce((acc, val) => acc + val, 0);
  return sum / period;
};

export const calculateEMA = (data: number[], period: number): number => {
  if (data.length < period) return 0;
  const multiplier = 2 / (period + 1);
  let ema = data.slice(0, period).reduce((acc, val) => acc + val, 0) / period;
  
  for (let i = period; i < data.length; i++) {
    ema = (data[i] * multiplier) + (ema * (1 - multiplier));
  }
  return ema;
};

export const calculateRSI = (closes: number[], period: number = 14): number => {
  if (closes.length < period + 1) return 50;
  
  const changes = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }
  
  let avgGain = 0;
  let avgLoss = 0;
  
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    else avgLoss += Math.abs(changes[i]);
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] > 0 ? changes[i] : 0;
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

export const calculateMACD = (closes: number[]): { macd: number; signal: number; histogram: number } => {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macd = ema12 - ema26;
  
  // Calculate signal line (9-day EMA of MACD)
  const macdValues = [];
  for (let i = 26; i <= closes.length; i++) {
    const slice = closes.slice(0, i);
    const ema12Val = calculateEMA(slice, 12);
    const ema26Val = calculateEMA(slice, 26);
    macdValues.push(ema12Val - ema26Val);
  }
  
  const signal = calculateEMA(macdValues, 9);
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
};

export const calculateBollingerBands = (closes: number[], period: number = 20, multiplier: number = 2) => {
  const sma = calculateSMA(closes, period);
  const recentCloses = closes.slice(-period);
  const variance = recentCloses.reduce((acc, val) => acc + Math.pow(val - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  
  return {
    upper: sma + (stdDev * multiplier),
    middle: sma,
    lower: sma - (stdDev * multiplier)
  };
};

export const findSupportResistance = (data: StockData[], lookback: number = 30): SupportResistance => {
  const recentData = data.slice(-lookback);
  
  // Find local maxima and minima
  const resistance: number[] = [];
  const support: number[] = [];
  
  for (let i = 2; i < recentData.length - 2; i++) {
    const current = recentData[i];
    const prev2 = recentData[i - 2];
    const prev1 = recentData[i - 1];
    const next1 = recentData[i + 1];
    const next2 = recentData[i + 2];
    
    // Resistance levels (local highs)
    if (current.high > prev2.high && current.high > prev1.high && 
        current.high > next1.high && current.high > next2.high) {
      resistance.push(current.high);
    }
    
    // Support levels (local lows)
    if (current.low < prev2.low && current.low < prev1.low && 
        current.low < next1.low && current.low < next2.low) {
      support.push(current.low);
    }
  }
  
  // Remove duplicates and sort
  const uniqueResistance = [...new Set(resistance)].sort((a, b) => b - a).slice(0, 3);
  const uniqueSupport = [...new Set(support)].sort((a, b) => a - b).slice(0, 3);
  
  return { resistance: uniqueResistance, support: uniqueSupport };
};

// Enhanced momentum analysis
const calculateMomentumScore = (data: StockData[], periods: number[]): number => {
  let momentumScore = 0;
  const currentPrice = data[data.length - 1].close;
  
  for (const period of periods) {
    if (data.length >= period) {
      const pastPrice = data[data.length - period].close;
      const priceChange = (currentPrice - pastPrice) / pastPrice;
      momentumScore += priceChange;
    }
  }
  
  return momentumScore / periods.length;
};

// Calculate volatility for position sizing
const calculateVolatility = (data: StockData[], period: number = 20): number => {
  if (data.length < period) return 0.02; // Default 2%
  
  const returns = [];
  for (let i = data.length - period; i < data.length - 1; i++) {
    const dailyReturn = (data[i + 1].close - data[i].close) / data[i].close;
    returns.push(dailyReturn);
  }
  
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  
  return Math.sqrt(variance * 252); // Annualized volatility
};

export const generateTradingRecommendation = (
  data: StockData[], 
  indicators: TechnicalIndicators, 
  supportResistance: SupportResistance
): TradingRecommendation => {
  const currentPrice = data[data.length - 1].close;
  const reasoning: string[] = [];
  let bullishSignals = 0;
  let bearishSignals = 0;
  let signalStrength = 0;
  
  // Calculate momentum across multiple timeframes
  const momentum = calculateMomentumScore(data, [5, 10, 20]);
  const volatility = calculateVolatility(data);
  
  // Enhanced RSI Analysis with divergence
  if (indicators.rsi < 25) {
    bullishSignals += 2;
    signalStrength += 2;
    reasoning.push('🔥 RSI severely oversold (<25) - Strong buy signal');
  } else if (indicators.rsi < 35) {
    bullishSignals += 1;
    signalStrength += 1;
    reasoning.push('📈 RSI oversold conditions - Buy opportunity');
  } else if (indicators.rsi > 75) {
    bearishSignals += 2;
    signalStrength += 2;
    reasoning.push('🔥 RSI severely overbought (>75) - Strong sell signal');
  } else if (indicators.rsi > 65) {
    bearishSignals += 1;
    signalStrength += 1;
    reasoning.push('📉 RSI overbought conditions - Sell opportunity');
  }
  
  // Enhanced Moving Average Analysis
  const smaAlignment = indicators.sma20 > indicators.sma50;
  const priceAboveSMA20 = currentPrice > indicators.sma20;
  const priceAboveSMA50 = currentPrice > indicators.sma50;
  
  if (priceAboveSMA20 && priceAboveSMA50 && smaAlignment) {
    bullishSignals += 2;
    signalStrength += 2;
    reasoning.push('🚀 Strong bullish trend - Price above all MAs');
  } else if (priceAboveSMA20 && smaAlignment) {
    bullishSignals += 1;
    signalStrength += 1;
    reasoning.push('📈 Bullish momentum - Price above SMA20');
  } else if (!priceAboveSMA20 && !priceAboveSMA50 && !smaAlignment) {
    bearishSignals += 2;
    signalStrength += 2;
    reasoning.push('💀 Strong bearish trend - Price below all MAs');
  } else if (!priceAboveSMA20 && !smaAlignment) {
    bearishSignals += 1;
    signalStrength += 1;
    reasoning.push('📉 Bearish momentum - Price below SMA20');
  }
  
  // Enhanced MACD Analysis
  const macdBullish = indicators.macd > indicators.macdSignal;
  const macdHistogramGrowing = indicators.macdHistogram > 0;
  
  if (macdBullish && macdHistogramGrowing && indicators.macdHistogram > 0.5) {
    bullishSignals += 2;
    signalStrength += 2;
    reasoning.push('🚀 MACD strong bullish divergence');
  } else if (macdBullish && macdHistogramGrowing) {
    bullishSignals += 1;
    signalStrength += 1;
    reasoning.push('📈 MACD bullish crossover');
  } else if (!macdBullish && !macdHistogramGrowing && indicators.macdHistogram < -0.5) {
    bearishSignals += 2;
    signalStrength += 2;
    reasoning.push('💀 MACD strong bearish divergence');
  } else if (!macdBullish && !macdHistogramGrowing) {
    bearishSignals += 1;
    signalStrength += 1;
    reasoning.push('📉 MACD bearish crossover');
  }
  
  // Bollinger Bands with volatility squeeze detection
  const bbWidth = (indicators.bollinger.upper - indicators.bollinger.lower) / indicators.bollinger.middle;
  const isVolatilitySqueeze = bbWidth < volatility * 0.5;
  
  if (currentPrice < indicators.bollinger.lower) {
    bullishSignals += 1;
    signalStrength += 1;
    reasoning.push('🎯 Price below lower Bollinger Band - Oversold bounce expected');
  } else if (currentPrice > indicators.bollinger.upper) {
    bearishSignals += 1;
    signalStrength += 1;
    reasoning.push('⚠️ Price above upper Bollinger Band - Overbought pullback likely');
  }
  
  if (isVolatilitySqueeze) {
    reasoning.push('💥 Volatility squeeze detected - Breakout imminent');
    signalStrength += 1;
  }
  
  // Support/Resistance with precise levels
  const nearestSupport = supportResistance.support.find(s => Math.abs(currentPrice - s) / currentPrice < 0.03);
  const nearestResistance = supportResistance.resistance.find(r => Math.abs(currentPrice - r) / currentPrice < 0.03);
  
  if (nearestSupport && momentum > 0) {
    bullishSignals += 1;
    reasoning.push(`🛡️ Strong support at ${nearestSupport.toFixed(2)} with positive momentum`);
  }
  if (nearestResistance && momentum < 0) {
    bearishSignals += 1;
    reasoning.push(`🚧 Strong resistance at ${nearestResistance.toFixed(2)} with negative momentum`);
  }
  
  // Momentum analysis
  if (momentum > 0.05) {
    bullishSignals += 1;
    reasoning.push('🔥 Strong positive momentum across timeframes');
  } else if (momentum < -0.05) {
    bearishSignals += 1;
    reasoning.push('❄️ Strong negative momentum across timeframes');
  }
  
  // Determine recommendation with enhanced logic
  let action: 'BUY' | 'SELL' | 'HOLD';
  let confidence: number;
  let stopLoss: number;
  let takeProfit: number;
  
  const netSignals = bullishSignals - bearishSignals;
  const baseConfidence = Math.min(95, 50 + (signalStrength * 8));
  
  if (netSignals >= 3 && signalStrength >= 4) {
    action = 'BUY';
    confidence = baseConfidence;
    
    // Dynamic stop loss based on volatility and support
    const volatilityStop = currentPrice * (1 - Math.max(0.03, volatility * 0.3));
    const supportStop = nearestSupport ? nearestSupport * 0.98 : currentPrice * 0.95;
    stopLoss = Math.max(volatilityStop, supportStop);
    
    // Dynamic take profit with resistance and volatility
    const resistanceTarget = nearestResistance ? nearestResistance * 0.98 : currentPrice * 1.15;
    const volatilityTarget = currentPrice * (1 + Math.max(0.08, volatility * 0.5));
    takeProfit = Math.min(resistanceTarget, volatilityTarget);
    
    reasoning.unshift('🎯 STRONG BUY - Multiple bullish confluences detected');
    
  } else if (netSignals <= -3 && signalStrength >= 4) {
    action = 'SELL';
    confidence = baseConfidence;
    
    // Dynamic stop loss for short position
    const volatilityStop = currentPrice * (1 + Math.max(0.03, volatility * 0.3));
    const resistanceStop = nearestResistance ? nearestResistance * 1.02 : currentPrice * 1.05;
    stopLoss = Math.min(volatilityStop, resistanceStop);
    
    // Dynamic take profit for short
    const supportTarget = nearestSupport ? nearestSupport * 1.02 : currentPrice * 0.85;
    const volatilityTarget = currentPrice * (1 - Math.max(0.08, volatility * 0.5));
    takeProfit = Math.max(supportTarget, volatilityTarget);
    
    reasoning.unshift('🎯 STRONG SELL - Multiple bearish confluences detected');
    
  } else if (netSignals >= 1 && signalStrength >= 2) {
    action = 'BUY';
    confidence = Math.min(75, baseConfidence);
    stopLoss = currentPrice * (1 - Math.max(0.05, volatility * 0.4));
    takeProfit = currentPrice * (1 + Math.max(0.06, volatility * 0.3));
    reasoning.unshift('📈 BUY - Moderate bullish signals present');
    
  } else if (netSignals <= -1 && signalStrength >= 2) {
    action = 'SELL';
    confidence = Math.min(75, baseConfidence);
    stopLoss = currentPrice * (1 + Math.max(0.05, volatility * 0.4));
    takeProfit = currentPrice * (1 - Math.max(0.06, volatility * 0.3));
    reasoning.unshift('📉 SELL - Moderate bearish signals present');
    
  } else {
    action = 'HOLD';
    confidence = 30 + signalStrength * 5;
    stopLoss = currentPrice * 0.95;
    takeProfit = currentPrice * 1.05;
    reasoning.unshift('⏸️ HOLD - Insufficient signal strength or conflicting indicators');
    reasoning.push('💡 Wait for clearer market direction or stronger confluences');
  }
  
  const riskReward = Math.abs(takeProfit - currentPrice) / Math.abs(currentPrice - stopLoss);
  
  // Add risk management note
  if (riskReward < 1.5) {
    reasoning.push('⚠️ Risk/Reward ratio below 1.5 - Consider smaller position size');
  } else if (riskReward > 3) {
    reasoning.push('🎯 Excellent Risk/Reward ratio - Good trade setup');
  }
  
  // Add volatility context
  if (volatility > 0.4) {
    reasoning.push('⚡ High volatility - Use smaller position sizes');
  } else if (volatility < 0.15) {
    reasoning.push('😴 Low volatility - Larger positions acceptable');
  }
  
  return {
    action,
    confidence,
    stopLoss,
    takeProfit,
    riskReward,
    reasoning
  };
};