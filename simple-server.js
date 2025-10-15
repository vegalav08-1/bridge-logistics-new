const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'YP ERP Backend Server',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }));
    return;
  }

  // API routes
  if (path === '/api/realtime/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Real-time service placeholder' }));
    return;
  }

  if (path === '/api/state/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'State service placeholder' }));
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Real-time API: http://localhost:${PORT}/api/realtime`);
  console.log(`⚙️  State API: http://localhost:${PORT}/api/state`);
});
