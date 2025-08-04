import { useState, useEffect } from 'react';
import { StockData, TechnicalIndicators as TechnicalIndicatorsType, SupportResistance, TradingRecommendation } from './types/stock';
import { parseStooqData } from './utils/stockDataParser';
import { 
  calculateSMA, 
  calculateEMA, 
  calculateRSI, 
  calculateMACD, 
  calculateBollingerBands,
  findSupportResistance,
  generateTradingRecommendation
} from './utils/technicalAnalysis';
import StockInfo from './components/StockInfo';
import CandlestickChart from './components/CandlestickChart';
import TechnicalIndicators from './components/TechnicalIndicators';
import PriceChart from './components/PriceChart';
import TradingRecommendationComponent from './components/TradingRecommendation';
import { Loader2, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';

const AVAILABLE_STOCKS = [
  { symbol: 'ale', name: 'Allegro.eu S.A.', exchange: 'Warsaw Stock Exchange' },
  { symbol: 'cdr', name: 'CD Projekt S.A.', exchange: 'Warsaw Stock Exchange' },
  { symbol: 'ndq', name: 'NASDAQ Composite', exchange: 'NASDAQ' }
];

function App() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicatorsType[]>([]);
  const [supportResistance, setSupportResistance] = useState<SupportResistance>({ support: [], resistance: [] });
  const [recommendation, setRecommendation] = useState<TradingRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedStock, setSelectedStock] = useState(AVAILABLE_STOCKS[0]);

  const fetchStockData = async (stockSymbol = selectedStock.symbol) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching data for symbol:', stockSymbol);
      const apiSymbol = stockSymbol === 'ndq' ? '^ndq' : stockSymbol;
      console.log('API symbol:', apiSymbol);
      const url = `/api/q/d/l/?s=${apiSymbol}&i=d`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const csvData = await response.text();
      console.log('CSV data length:', csvData.length);
      console.log('CSV data preview:', csvData.substring(0, 200));
      
      const parsedData = parseStooqData(csvData);
      console.log('Parsed data length:', parsedData.length);
      
      if (parsedData.length === 0) {
        throw new Error('No data received from API');
      }
      
      setStockData(parsedData);
      
      // Calculate technical indicators more efficiently - only for recent data and final values
      const calculatedIndicators: TechnicalIndicatorsType[] = [];
      
      // For performance, only calculate indicators for the last 100 data points in detail
      // and just the final values for the full dataset
      const detailStartIndex = Math.max(0, parsedData.length - 100);
      
      for (let i = 0; i < parsedData.length; i++) {
        if (i < detailStartIndex && i < parsedData.length - 1) {
          // For older data points (except the very last), use simplified calculations
          calculatedIndicators.push({
            sma20: 0,
            sma50: 0,
            ema12: 0,
            ema26: 0,
            rsi: 50,
            macd: 0,
            macdSignal: 0,
            macdHistogram: 0,
            bollinger: { upper: 0, middle: 0, lower: 0 }
          });
        } else {
          // For recent data points and the final point, calculate full indicators
          const dataSlice = parsedData.slice(0, i + 1);
          const sliceCloses = dataSlice.map(d => d.close);
          
          const sma20 = calculateSMA(sliceCloses, 20);
          const sma50 = calculateSMA(sliceCloses, 50);
          const ema12 = calculateEMA(sliceCloses, 12);
          const ema26 = calculateEMA(sliceCloses, 26);
          const rsi = calculateRSI(sliceCloses);
          const macdData = calculateMACD(sliceCloses);
          const bollinger = calculateBollingerBands(sliceCloses);
          
          calculatedIndicators.push({
            sma20,
            sma50,
            ema12,
            ema26,
            rsi,
            macd: macdData.macd,
            macdSignal: macdData.signal,
            macdHistogram: macdData.histogram,
            bollinger
          });
        }
      }
      
      setIndicators(calculatedIndicators);
      
      // Calculate support and resistance levels
      const supportRes = findSupportResistance(parsedData);
      setSupportResistance(supportRes);
      
      // Generate trading recommendation
      const currentIndicators = calculatedIndicators[calculatedIndicators.length - 1];
      const tradingRec = generateTradingRecommendation(parsedData, currentIndicators, supportRes);
      setRecommendation(tradingRec);
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (stock: typeof AVAILABLE_STOCKS[0]) => {
    setSelectedStock(stock);
    fetchStockData(stock.symbol);
  };

  useEffect(() => {
    fetchStockData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading stock data and analyzing...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchStockData()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentIndicators = indicators[indicators.length - 1];
  const currentPrice = stockData[stockData.length - 1]?.close || 0;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">Stock Analysis Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Stock Selector */}
              <div className="flex items-center gap-2">
                <label className="text-gray-300 text-sm">Stock:</label>
                <select
                  value={selectedStock.symbol}
                  onChange={(e) => {
                    const stock = AVAILABLE_STOCKS.find(s => s.symbol === e.target.value);
                    if (stock) handleStockChange(stock);
                  }}
                  className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  {AVAILABLE_STOCKS.map((stock) => (
                    <option key={stock.symbol} value={stock.symbol}>
                      {stock.symbol.toUpperCase()} - {stock.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {lastUpdated && (
                <span className="text-gray-400 text-sm">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => fetchStockData()}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Stock Info */}
          <StockInfo data={stockData} symbol={selectedStock.symbol} company={selectedStock} />
          
          {/* Price Chart */}
          <PriceChart data={stockData} />
          
          {/* Chart */}
          <CandlestickChart 
            data={stockData.slice(-60)} // Last 60 days for better visibility
            indicators={indicators.slice(-60)}
            supportResistance={supportResistance}
          />
          
          {/* Technical Indicators */}
          {currentIndicators && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Technical Indicators</h2>
              <TechnicalIndicators indicators={currentIndicators} currentPrice={currentPrice} />
            </div>
          )}
          
          {/* Trading Recommendation */}
          {recommendation && (
            <TradingRecommendationComponent recommendation={recommendation} currentPrice={currentPrice} />
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p className="mb-2">
              <strong>Disclaimer:</strong> This analysis is for educational purposes only and should not be considered as financial advice.
            </p>
            <p>
              Always consult with a qualified financial advisor before making investment decisions. 
              Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;