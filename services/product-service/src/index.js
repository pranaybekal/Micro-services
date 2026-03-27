'use strict';

require('./tracing');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const { initDatabase } = require('./config/database');

const client = require('prom-client'); // ✅ ADD

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// =========================
// PROMETHEUS SETUP
// =========================
client.collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
  name: 'product_service_requests_total',
  help: 'Total requests to product service',
  labelNames: ['method', 'route', 'status'],
});

// =========================
// Middleware
// =========================
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// =========================
// Metrics Middleware
// =========================
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
    });
  });
  next();
});

// =========================
// Routes
// =========================
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// =========================
// Health Check
// =========================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'product-service' });
});

// =========================
// METRICS ENDPOINT ✅
// =========================
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// =========================
// Start Server
// =========================
initDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Product Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });