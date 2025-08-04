export interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface SupportResistance {
  support: number[];
  resistance: number[];
}

export interface TradingRecommendation {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  reasoning: string[];
}