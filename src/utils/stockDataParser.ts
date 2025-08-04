import { StockData } from '../types/stock';

export const parseStooqData = (csvData: string): StockData[] => {
  const lines = csvData.trim().split('\n');
  const data: StockData[] = [];
  
  // Log the header to understand the structure
  console.log('CSV Header:', lines[0]);
  console.log('First data row:', lines[1]);
  console.log('Last data row:', lines[lines.length - 1]);
  
  // Check if headers are in Polish or English
  const header = lines[0].toLowerCase();
  const isPolishHeaders = header.includes('otwarcie') || header.includes('zamkniecie');
  
  console.log('Using Polish headers:', isPolishHeaders);
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(',');
    if (columns.length >= 6) {
      // Handle both Polish and English headers
      // Polish: Data,Otwarcie,Najwyzszy,Najnizszy,Zamkniecie,Wolumen
      // English: Date,Open,High,Low,Close,Volume
      const stockData: StockData = {
        date: columns[0],
        open: parseFloat(columns[1]) || 0,
        high: parseFloat(columns[2]) || 0,
        low: parseFloat(columns[3]) || 0,
        close: parseFloat(columns[4]) || 0,
        volume: parseFloat(columns[5]) || 0  // Changed from parseInt to parseFloat for decimal volumes
      };
      
      // Validate that we have reasonable data
      if (stockData.date && stockData.close > 0) {
        data.push(stockData);
      }
    }
  }
  
  console.log('Parsed data (first 3):', data.slice(0, 3));
  console.log('Parsed data (last 3):', data.slice(-3));
  console.log('Total valid data points:', data.length);
  
  // Data is already in chronological order (oldest to newest), no need to reverse
  return data;
};