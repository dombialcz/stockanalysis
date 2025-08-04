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

    console.log(`Fetching data for symbol: ${s}`);

    // Multiple fallback URLs for better reliability
    const fallbackUrls = [
      `https://stooq.com/q/d/l/?s=${s}&i=${i}`,
      `https://stooq.pl/q/d/l/?s=${s}&i=${i}`,
    ];

    let lastError = null;

    // Try each URL with timeout
    for (const url of fallbackUrls) {
      try {
        console.log(`Trying URL: ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/csv,text/plain,*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const csvData = await response.text();
          console.log(`Full response from ${url}:`, csvData);
          console.log(`Response length: ${csvData.length} chars`);
          console.log(`First 200 chars:`, csvData.substring(0, 200));
          
          // More lenient validation - accept any non-empty response that's not HTML
          if (csvData && csvData.trim().length > 0 && !csvData.toLowerCase().includes('<html') && !csvData.includes('error') && !csvData.includes('404')) {
            console.log(`Success with URL: ${url}, data length: ${csvData.length}`);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
            return res.status(200).send(csvData);
          } else {
            console.log(`Invalid data from ${url}: empty, HTML, or error response`);
            lastError = new Error(`Invalid data received from ${url}`);
          }
        } else {
          console.log(`HTTP error from ${url}: ${response.status}`);
          lastError = new Error(`HTTP ${response.status} from ${url}`);
        }
      } catch (error) {
        console.log(`Error with ${url}:`, error.message);
        lastError = error;
        continue;
      }
    }

    // If all URLs failed, return error
    console.error('All URLs failed, last error:', lastError);
    res.status(503).json({ 
      error: 'Failed to fetch stock data from all sources',
      details: lastError?.message || 'Unknown error',
      symbol: s
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
