export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { s, i = 'd' } = req.query;
    
    if (!s) {
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }

    // Fetch data from Stooq API
    const stooqUrl = `https://stooq.com/q/d/l/?s=${s}&i=${i}`;
    
    const response = await fetch(stooqUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/csv,application/csv',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvData = await response.text();
    
    // Set CSV content type
    res.setHeader('Content-Type', 'text/csv');
    res.status(200).send(csvData);
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stock data',
      details: error.message 
    });
  }
}
