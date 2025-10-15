const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'YP ERP Backend Server',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes - пока простые заглушки
app.get('/api/realtime/health', (req, res) => {
  res.json({ status: 'ok', message: 'Real-time service placeholder' });
});

app.get('/api/state/health', (req, res) => {
  res.json({ status: 'ok', message: 'State service placeholder' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Real-time API: http://localhost:${PORT}/api/realtime`);
  console.log(`⚙️  State API: http://localhost:${PORT}/api/state`);
});
