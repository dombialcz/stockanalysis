// Alternative API fetching with multiple fallback options
export const fetchStockDataWithFallback = async (symbol: string) => {
  const apiSymbol = symbol === 'ndq' ? '^ndq' : symbol;
  
  // Option 1: Vercel API route
  try {
    const response = await fetch(`/api/stock?s=${apiSymbol}&i=d`);
    if (response.ok) {
      return await response.text();
    }
  } catch {
    console.warn('Vercel API failed, trying fallback...');
  }
  
  // Option 2: AllOrigins proxy
  try {
    const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://stooq.com/q/d/l/?s=${apiSymbol}&i=d`)}`;
    const response = await fetch(allOriginsUrl);
    if (response.ok) {
      const data = await response.json();
      return data.contents;
    }
  } catch {
    console.warn('AllOrigins failed, trying direct...');
  }
  
  // Option 3: Direct call (might fail due to CORS)
  try {
    const response = await fetch(`https://stooq.com/q/d/l/?s=${apiSymbol}&i=d`, {
      mode: 'cors',
      headers: {
        'Accept': 'text/csv',
      },
    });
    if (response.ok) {
      return await response.text();
    }
  } catch (error) {
    console.error('All methods failed:', error);
    throw new Error('Unable to fetch stock data from any source');
  }
};
