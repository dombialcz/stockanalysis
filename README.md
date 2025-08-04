# 📈 Enhanced Stock Analysis Dashboard

A sophisticated stock trading analysis dashboard built with React, TypeScript, and advanced technical analysis algorithms. This application provides actionable trading recommendations with precise entry/exit points, risk management, and position sizing guidance.

![Stock Analysis Dashboard](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.2-purple)

## 🚀 Features

### 📊 Advanced Technical Analysis
- **RSI (Relative Strength Index)** with oversold/overbought detection
- **MACD (Moving Average Convergence Divergence)** with signal crossovers
- **Bollinger Bands** with volatility squeeze detection
- **Moving Averages** (SMA 20/50) with trend alignment
- **Support & Resistance** level identification
- **Multi-timeframe momentum** analysis (5, 10, 20 periods)

### 🎯 Smart Trading Recommendations
- **Actionable signals**: Clear BUY/SELL/HOLD recommendations
- **Confidence scoring**: 0-95% confidence levels based on signal strength
- **Dynamic stop losses**: Calculated using volatility and support/resistance
- **Intelligent take profits**: Based on resistance levels and volatility bands
- **Risk/Reward ratios**: Automatic calculation with quality ratings
- **Position sizing**: Recommended portfolio allocation (0.25% to 3%)

### 📈 Interactive Charts
- **Candlestick charts** with technical indicators overlay
- **Price charts** with moving averages
- **Volume analysis**
- **Support/resistance level visualization**
- **Real-time data** from Stooq API

### 🎨 Modern UI/UX
- **Dark theme** optimized for trading environments
- **Responsive design** for desktop and mobile
- **Real-time updates** with hot reload
- **Professional dashboard layout**
- **Emoji-enhanced analysis** for quick visual scanning

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Source**: Stooq API (Polish stocks)

## 📦 Supported Stocks

- **ALE** - Allegro.eu S.A. (Warsaw Stock Exchange)
- **CDR** - CD Projekt S.A. (Warsaw Stock Exchange)  
- **NDQ** - NASDAQ Composite (NASDAQ)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dombialcz/stockanalysis.git
   cd stockanalysis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🎯 Trading Features

### Signal Strength Levels
- **Strong Signals** (4+ strength): High-confidence trades with 3+ confluences
- **Moderate Signals** (2+ strength): Medium-confidence trades with 1+ confluences
- **Weak Signals** (<2 strength): Hold recommendation, wait for clarity

### Risk Management
- **Volatility-based position sizing**: Larger positions in low volatility environments
- **Dynamic stop losses**: Adjusted based on market volatility and key levels
- **Risk/Reward optimization**: Minimum 1.5:1 ratio recommended
- **Multi-timeframe confirmation**: Reduces false signals

### Example Trading Recommendation

```
🎯 STRONG BUY - 87% Confidence
Entry: 243.50 PLN (Market)
Stop Loss: 235.20 PLN (-3.4%)
Take Profit: 258.80 PLN (+6.3%)
Risk/Reward: 1:1.85
Position Size: 1-2% of portfolio
```

## 🔧 Configuration

### Adding New Stocks
Edit `src/App.tsx` and add to `AVAILABLE_STOCKS`:

```typescript
const AVAILABLE_STOCKS = [
  { symbol: 'your_symbol', name: 'Company Name', exchange: 'Exchange' },
  // ... existing stocks
];
```

### Customizing Indicators
Modify parameters in `src/utils/technicalAnalysis.ts`:

```typescript
// RSI periods
const rsi = calculateRSI(closes, 14); // Default 14 periods

// Moving averages
const sma20 = calculateSMA(closes, 20); // 20-period SMA
const sma50 = calculateSMA(closes, 50); // 50-period SMA

// Bollinger Bands
const bollinger = calculateBollingerBands(closes, 20, 2); // 20 periods, 2 std dev
```

## 📊 Performance Optimizations

- **Efficient data processing**: O(n) complexity for large datasets
- **Selective indicator calculation**: Full analysis only for recent 100 data points
- **Optimized re-renders**: React.memo and careful state management
- **Lazy loading**: Components loaded on demand

## ⚠️ Disclaimer

**This application is for educational and informational purposes only.** 

- Not financial advice
- Past performance doesn't guarantee future results
- Always do your own research
- Consider risk tolerance and financial situation
- Consult qualified financial advisors

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Dominik Bialczyk** - dombialcz@gmail.com

**Project Link**: [https://github.com/dombialcz/stockanalysis](https://github.com/dombialcz/stockanalysis)

---

⭐ **Star this repository if you found it helpful!**
